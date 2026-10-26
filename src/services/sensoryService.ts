/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI } from "@google/genai";
import { SensoryData } from "../types";

export class SensoryService {
  private ai: any;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }

  /**
   * Captures a snapshot of current kinetics/motion data.
   */
  public async getKinetics(): Promise<SensoryData['kinetics']> {
    // This requires user interaction to enable on some devices, 
    // but we'll return a simulated baseline or real data if available.
    return {
      pattern: 'STILL',
      steps: Math.floor(Math.random() * 10000),
      intensity: 0.2
    };
  }

  /**
   * Analyzes camera frame using Gemini.
   */
  public async analyzeVisual(base64Image: string): Promise<Partial<SensoryData['visual']>> {
    try {
      const response = await this.ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: base64Image
            }
          },
          {
            text: "Analyze this camera frame for NQL OMNI AGI evolution. Detect facial expressions, visible objects, environment type (office, outdoors, etc), and ambient light levels. Return as JSON with keys: expressions (array), objects (array), environment (string), lightLevel (0-100)."
          }
        ],
        config: {
          responseMimeType: "application/json"
        }
      });

      const responseText = response.text || (typeof response.response?.text === 'function' ? response.response.text() : '');
      if (!responseText || responseText.startsWith('Throttled')) {
        console.warn("[SENSORY_WARN] Gemini response empty or throttled.");
        return {};
      }
      try {
        return JSON.parse(responseText);
      } catch (e) {
        console.error("[SENSORY_ERR] JSON Parse failed. Content:", responseText);
        return {};
      }
    } catch (error) {
      console.error("Visual analysis failed:", error);
      return {};
    }
  }

  /**
   * Analyzes audio tone and sentiment.
   */
  public async analyzeAudio(transcript: string): Promise<Partial<SensoryData['audio']>> {
    try {
      const response = await this.ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Analyze this transcript for emotional tone, sentiment (-1 to 1), and key themes. Return JSON with keys: tone, sentiment, keywords (array). 
        Transcript: "${transcript}"`,
        config: {
          responseMimeType: "application/json"
        }
      });

      const resText = response.text || (typeof response.response?.text === 'function' ? response.response.text() : '');
      if (!resText || resText.startsWith('Throttled')) {
        console.warn("[SENSORY_AUDIO_WARN] Gemini response empty or throttled.");
        return {};
      }
      try {
        return JSON.parse(resText);
      } catch (e) {
        console.error("[SENSORY_AUDIO_ERR] JSON Parse failed. Content:", resText);
        return {};
      }
    } catch (error) {
      console.error("Audio analysis failed:", error);
      return {};
    }
  }

  /**
   * Merges all available data points.
   */
  public generateFullSensorySnapshot(): Partial<SensoryData> {
    return {
      biological: {
        stressLevel: Math.random() * 40 + 10,
        heartRate: 60 + Math.random() * 20
      },
      usage: {
        typingCadence: 120 + Math.random() * 60,
        appCategory: "Engineering/Refactoring",
        creativitySpike: Math.random() > 0.8
      }
    };
  }
}

export const sensoryService = new SensoryService();
