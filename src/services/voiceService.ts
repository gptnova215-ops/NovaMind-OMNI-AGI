/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY!;

export interface VoiceEventHandlers {
  onTranscription: (text: string, isUser: boolean) => void;
  onAudioStart: () => void;
  onAudioStop: () => void;
  onThinkingToggle: (isThinking: boolean) => void;
  onToolCall: (name: string, args: any) => Promise<any>;
  onError: (error: any) => void;
}

export class VoiceService {
  private ai: GoogleGenAI;
  private session: any = null;
  private audioContext: AudioContext | null = null;
  private workletNode: AudioWorkletNode | null = null;
  private mediaStream: MediaStream | null = null;
  private isConnected = false;
  private handlers: VoiceEventHandlers;
  private audioStack: Int16Array[] = [];
  private isPlaying = false;
  private nextPlayTime = 0;

  constructor(handlers: VoiceEventHandlers) {
    this.ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
    this.handlers = handlers;
  }

  async connect(systemInstruction: string, tools?: any[]) {
    if (this.isConnected) return;

    try {
      this.session = await this.ai.live.connect({
        model: "gemini-3.1-flash-live-preview",
        callbacks: {
          onopen: () => {
            this.isConnected = true;
            this.startMic();
            console.log("[VOICE_SYNC]: Live connection established.");
          },
          onmessage: async (message: LiveServerMessage) => {
            // Handle Audio Out
            const audioData = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (audioData) {
              const pcmData = this.base64ToPcm(audioData);
              this.queueAudio(pcmData);
            }

            // Handle Transcripts
            const modelTranscript = message.serverContent?.modelTurn?.parts?.find(p => p.text)?.text;
            if (modelTranscript) {
               this.handlers.onTranscription(modelTranscript, false);
            }

            const userTranscript = message.serverContent?.inputTranscription?.text;
            if (userTranscript) {
               this.handlers.onTranscription(userTranscript, true);
            }
            
            // Handle Tool Calls
            const toolCall = message.toolCall;
            if (toolCall) {
              const functionResponses: any[] = [];
              for (const call of toolCall.functionCalls) {
                const result = await this.handlers.onToolCall(call.name, call.args);
                functionResponses.push({
                  name: call.name,
                  response: result,
                  id: call.id
                });
              }
              this.session.sendToolResponse({ functionResponses });
            }

            // Handle Interruption
            if (message.serverContent?.interrupted) {
              this.stopPlayback();
            }

            // Thinking State
            if (message.serverContent?.modelTurn) {
               this.handlers.onThinkingToggle(false);
            }
          },
          onerror: (err) => {
            console.error("[VOICE_SYNC_ERR]:", err);
            this.handlers.onError(err);
          },
          onclose: () => {
            this.isConnected = false;
            this.stopMic();
            console.log("[VOICE_SYNC]: Connection closed.");
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: "Zephyr" } }
          },
          systemInstruction,
          tools: tools || [],
          inputAudioTranscription: {}
        }
      });
    } catch (err) {
      this.handlers.onError(err);
    }
  }

  private async startMic() {
    this.audioContext = new AudioContext({ sampleRate: 16000 });
    this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    
    // We'll use a simple ScriptProcessor for compatibility or a Worklet if preferred.
    // Given the environment constraints, a ScriptProcessor is often easier to bundle without external file URLs.
    const source = this.audioContext.createMediaStreamSource(this.mediaStream);
    const processor = this.audioContext.createScriptProcessor(4096, 1, 1);
    
    processor.onaudioprocess = (e) => {
      if (!this.isConnected || !this.session) return;
      
      const inputData = e.inputBuffer.getChannelData(0);
      const pcm16 = this.float32ToInt16(inputData);
      const base64 = this.pcmToBase64(pcm16);
      
      this.session.sendRealtimeInput({
        audio: { data: base64, mimeType: 'audio/pcm;rate=16000' }
      });
    };

    source.connect(processor);
    processor.connect(this.audioContext.destination);
  }

  private stopMic() {
    this.mediaStream?.getTracks().forEach(track => track.stop());
    this.audioContext?.close();
  }

  private queueAudio(pcmData: Int16Array) {
    this.audioStack.push(pcmData);
    if (!this.isPlaying) {
      this.playNextChunk();
    }
  }

  private playNextChunk() {
    if (this.audioStack.length === 0) {
      this.isPlaying = false;
      this.handlers.onAudioStop();
      return;
    }

    this.isPlaying = true;
    this.handlers.onAudioStart();
    const pcm = this.audioStack.shift()!;
    const float32 = this.int16ToFloat32(pcm);
    
    const buffer = this.audioContext!.createBuffer(1, float32.length, 16000);
    buffer.getChannelData(0).set(float32);
    
    const source = this.audioContext!.createBufferSource();
    source.buffer = buffer;
    source.connect(this.audioContext!.destination);
    
    const now = this.audioContext!.currentTime;
    const playTime = Math.max(now, this.nextPlayTime);
    
    source.start(playTime);
    this.nextPlayTime = playTime + buffer.duration;
    
    source.onended = () => this.playNextChunk();
  }

  private stopPlayback() {
    this.audioStack = [];
    this.isPlaying = false;
    this.nextPlayTime = 0;
  }

  disconnect() {
    if (this.session) {
      this.session.close();
      this.session = null;
    }
    this.isConnected = false;
    this.stopMic();
    this.stopPlayback();
  }

  // --- Utilities ---
  private float32ToInt16(buffer: Float32Array): Int16Array {
    const l = buffer.length;
    const buf = new Int16Array(l);
    for (let i = 0; i < l; i++) {
      const s = Math.max(-1, Math.min(1, buffer[i]));
      buf[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }
    return buf;
  }

  private int16ToFloat32(buffer: Int16Array): Float32Array {
    const l = buffer.length;
    const buf = new Float32Array(l);
    for (let i = 0; i < l; i++) {
      buf[i] = buffer[i] / 0x8000;
    }
    return buf;
  }

  private pcmToBase64(pcm: Int16Array): string {
    const binary = String.fromCharCode(...new Uint8Array(pcm.buffer));
    return btoa(binary);
  }

  private base64ToPcm(base64: string): Int16Array {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return new Int16Array(bytes.buffer);
  }
}
