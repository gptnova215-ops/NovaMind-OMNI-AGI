/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect, useMemo } from "react";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import { 
  Bot,
  Activity,
  Zap,
  Brain as BrainIcon,
  Cpu,
  Plus,
  Terminal,
  Play,
  RotateCcw,
  Camera,
  Mic,
  Video,
  Target,
  Layers,
  Trash2,
  CloudIcon,
  ShieldCheck,
  Mail,
  Lock,
  LogOut,
  FileText,
  Database,
  User as UserIcon,
  Eye,
  EyeOff,
  CloudRain,
  Moon,
  MapPin,
  Clock,
  Code,
  Compass,
  AudioLines,
  Infinity as InfinityIcon,
  Activity as ActivityIcon,
  TrendingUp,
  BarChart3,
  Search,
  Globe,
  Shield,
  X,
  MessageSquare
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { GoogleGenAI } from "@google/genai";
import { io, Socket } from "socket.io-client";
import { NQLSession, BotState, NQLBot, SysStats, PerceptionState, EnvironmentalState, VaultEntry, GoogleSync, EvolutionMilestone, AppView, SystemAlert } from "./types.ts";
import { generateOHSAQResponse, ChatMessage, generateInternalThoughts, generateRecursiveThoughts, generateEvolutionMilestones, sleep, INITIAL_PROMPT, TOOLS } from "./nqlService.ts";
import { sensoryService } from './services/sensoryService';
import { tradingService } from './services/tradingService';
import { VoiceService } from './services/voiceService';
import { MarketService } from './services/marketService';
import DashboardPanel from './components/DashboardPanel.tsx';
import MemoryPanel from './components/MemoryPanel.tsx';
import AstralPanel from './components/AstralPanel.tsx';
import WalletPanel from './components/WalletPanel.tsx';
import StudioPanel from './components/StudioPanel.tsx';
import BizSecPanel from './components/BizSecPanel.tsx';
import CommsPanel from './components/CommsPanel.tsx';
import NexusVaultPanel from './components/NexusVaultPanel.tsx';
import BotHubPanel from './components/BotHubPanel.tsx';
import TasksPanel from './components/TasksPanel.tsx';

import { auth, db } from "./firebase";
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  signOut,
  User
} from "firebase/auth";
import {
  collection,
  addDoc,
  query,
  onSnapshot,
  deleteDoc,
  doc,
  serverTimestamp,
  orderBy
} from "firebase/firestore";

// --- Application Context & State ---

const SensoryHub = ({ session, videoRef }: { session: NQLSession, videoRef: React.RefObject<HTMLVideoElement | null> }) => {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2 relative group">
        <div className="aspect-video bg-black rounded border border-nql-cyan/30 overflow-hidden relative">
          <video 
            ref={videoRef} 
            autoPlay 
            muted 
            playsInline 
            className="w-full h-full object-cover opacity-60 grayscale hover:grayscale-0 transition-all duration-1000"
          />
          <div className="absolute inset-0 border border-nql-cyan/10 pointer-events-none" />
          <div className="absolute top-2 left-2 flex gap-2">
            <div className="px-2 py-0.5 bg-nql-cyan/80 text-nql-bg text-[7px] font-bold uppercase tracking-widest animate-pulse">Live_Sync</div>
            <div className="px-2 py-0.5 bg-black/60 text-white text-[7px] font-mono border border-white/20">CAM:001</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="bg-black/60 border border-nql-border p-3 rounded flex flex-col gap-1">
          <span className="text-[8px] text-nql-dim uppercase flex items-center gap-1"><Mic size={10} className="text-nql-violet" /> Acoustic_Tone</span>
          <span className="text-[10px] font-mono text-nql-violet uppercase tracking-widest">{session.sensory.audio.tone}</span>
          <div className="flex gap-1 mt-1">
            <div className="flex-1 h-0.5 bg-nql-violet/20 overflow-hidden">
               <motion.div 
                 className="h-full bg-nql-violet" 
                 initial={{ width: 0 }}
                 animate={{ width: `${Math.abs(session.sensory.audio.sentiment * 100)}%` }} 
               />
            </div>
          </div>
        </div>
        <div className="bg-black/60 border border-nql-border p-3 rounded flex flex-col gap-1">
          <span className="text-[8px] text-nql-dim uppercase flex items-center gap-1"><Zap size={10} className="text-nql-gold" /> Kinetic_State</span>
          <span className="text-[10px] font-mono text-nql-gold uppercase tracking-widest">{session.sensory.kinetics.pattern}</span>
          <span className="text-[8px] text-nql-dim font-mono">{session.sensory.kinetics.steps} STEPS</span>
        </div>
      </div>

      <div className="p-3 bg-black/60 border border-nql-border rounded flex flex-col gap-2">
        <span className="text-[8px] text-nql-cyan font-bold uppercase tracking-widest flex items-center gap-2">
           <Eye size={10} /> Visual_Cognition_Engine
        </span>
        <div className="flex flex-wrap gap-1">
          {session.sensory.visual.objects.map((o, i) => (
             <span key={i} className="px-1.5 py-0.5 bg-nql-cyan/5 border border-nql-cyan/20 text-[8px] text-white font-mono">{o}</span>
          ))}
          {session.sensory.visual.expressions.map((e, i) => (
             <span key={i} className="px-1.5 py-0.5 bg-nql-violet/5 border border-nql-violet/20 text-[8px] text-nql-violet font-mono">{e}</span>
          ))}
          {session.sensory.visual.objects.length === 0 && <span className="text-[8px] text-nql-dim italic">Waiting for visual lock...</span>}
        </div>
        <div className="mt-1 pt-2 border-t border-white/5 flex justify-between items-center text-[8px] font-mono text-nql-dim uppercase">
           <span>Env: {session.sensory.visual.environment}</span>
           <span>Lum: {session.sensory.visual.lightLevel} lx</span>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-[8px] text-nql-dim uppercase flex items-center gap-2 font-bold tracking-widest">
           <Activity size={10} className="text-red-500 animate-pulse" /> Biometric_Overlay
        </span>
        <div className="grid grid-cols-2 gap-2">
          <div className="p-2 border border-nql-border bg-black/40 rounded flex justify-between items-end h-10">
            <span className="text-[8px] text-nql-dim uppercase">BPM</span>
            <span className="text-lg font-mono text-red-500 leading-none">{session.sensory.biological.heartRate}</span>
          </div>
          <div className="p-2 border border-nql-border bg-black/40 rounded flex justify-between items-end h-10">
            <span className="text-[8px] text-nql-dim uppercase">Stress</span>
            <span className="text-lg font-mono text-nql-cyan leading-none">{session.sensory.biological.stressLevel.toFixed(0)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};


// --- Omega-11 Tier Monitor ---
// --- Expandable Modular Panels ---

const LoginScreen = ({ onGoogleLogin, onGuestLogin }: { onGoogleLogin: () => void, onGuestLogin: () => void }) => (
  <div className="fixed inset-0 z-[1000] bg-black flex items-center justify-center overflow-hidden">
     <div className="absolute inset-0 bg-[#05070a] opacity-90" />
     <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/matrix/1920/1080')] opacity-[0.05] pointer-events-none mix-blend-overlay" />
     
     <motion.div 
       initial={{ opacity: 0, scale: 0.9 }}
       animate={{ opacity: 1, scale: 1 }}
       className="relative z-10 w-full max-w-lg p-12 nql-panel border-nql-cyan/30 bg-black/60 backdrop-blur-3xl flex flex-col items-center gap-12"
     >
        <div className="flex flex-col items-center gap-4">
           <div className="w-24 h-24 rounded-full border border-nql-cyan/40 p-1 flex items-center justify-center animate-glow-cyan">
             <MarketCoreVisualizer active={true} isSpeaking={false} micLevel={0} onClick={() => {}} />
           </div>
           <h1 className="text-4xl font-mono text-white uppercase tracking-[0.4em] text-center">NovaMind_OS</h1>
           <span className="text-[10px] text-nql-cyan uppercase tracking-widest font-bold">Singularity_Control_Interface</span>
        </div>

        <div className="flex flex-col w-full gap-4">
           <button 
             onClick={onGoogleLogin}
             className="w-full py-4 bg-white text-black text-xs font-bold uppercase tracking-[0.2em] hover:bg-nql-cyan transition-all flex items-center justify-center gap-3 shadow-[0_10px_30px_rgba(255,255,255,0.1)]"
           >
             <Globe size={16} /> Authenticate_Via_Google
           </button>
           <button 
             onClick={onGuestLogin}
             className="w-full py-4 border border-white/20 text-white text-xs font-bold uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-all"
           >
             Continue_As_Guest_Instance
           </button>
        </div>

        <div className="flex justify-between w-full text-[9px] font-mono text-zinc-600 uppercase tracking-widest pt-6 border-t border-white/5">
           <span>v4.0.2_OMNI</span>
           <span>SEC_NODE_77</span>
           <span>REAL_TIME_SYNC</span>
        </div>
     </motion.div>
  </div>
);

const TradeLogsPanel = ({ session }: { session: NQLSession }) => {
  return (
    <div className="flex flex-col gap-6 h-full p-6 overflow-y-auto">
      <div className="nql-panel p-6">
        <h2 className="text-xl font-mono text-nql-gold uppercase tracking-widest mb-6 border-b border-nql-gold/20 pb-4">Secure_Execution_Locker</h2>
        <div className="space-y-3">
          {session.financial.tradeHistory.length === 0 ? (
            <div className="text-center py-20 opacity-30 italic font-mono uppercase text-sm">No synchronized trades detected in ledger.</div>
          ) : (
            session.financial.tradeHistory.map(trade => (
              <div key={trade.id} className="p-4 bg-black/40 border border-nql-gold/20 flex items-center justify-between hover:bg-nql-gold/5 transition-all">
                <div className="flex items-center gap-6">
                   <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center ${trade.side === 'BUY' ? 'border-green-500/30 text-green-500' : 'border-red-500/30 text-red-500'}`}>
                      <TrendingUp size={20} className={trade.side === 'SELL' ? 'rotate-180' : ''} />
                   </div>
                   <div className="flex flex-col">
                      <span className="text-lg font-mono text-white font-bold">{trade.symbol}</span>
                      <span className={`text-[10px] font-mono ${trade.side === 'BUY' ? 'text-green-500' : 'text-red-500'}`}>{trade.side} @ ${trade.price.toLocaleString()}</span>
                   </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                   <span className="text-xl font-mono text-white">{trade.amount} UNITS</span>
                   <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-zinc-500">{new Date(trade.timestamp).toLocaleString()}</span>
                      <span className={`text-[8px] px-2 py-0.5 rounded font-bold ${trade.status === 'EXECUTED' ? 'bg-green-500 text-black' : trade.status === 'FAILED' ? 'bg-red-500 text-white' : 'bg-nql-gold text-white animate-pulse'}`}>{trade.status}</span>
                   </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

const BrainPanel = ({ session }: { session: NQLSession }) => {
  return (
    <div className="flex h-full p-6 gap-6 overflow-hidden">
      <div className="flex-1 nql-panel p-6 flex flex-col gap-6 bg-gradient-to-tr from-nql-cyan/5 to-transparent border-nql-cyan/40">
         <h2 className="text-xl font-mono text-nql-cyan uppercase tracking-widest flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BrainIcon size={24} className="text-nql-cyan shadow-[0_0_15px_#00f2ff]" /> COGNITIVE_NOETIC_STREAM
            </div>
            <span className="text-[10px] text-nql-dim">TIER-11_OMEGA_MODE</span>
         </h2>
         <div className="flex-1 bg-black/60 border border-nql-cyan/30 rounded p-6 overflow-y-auto scrollbar-nql-cyan relative">
            <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/matrix/1920/1080')] opacity-[0.03] pointer-events-none mix-blend-overlay" />
            <div className="space-y-4 relative z-10">
               {session.thoughtStream.map((t, i) => (
                 <motion.div 
                   key={i} 
                   initial={{ opacity: 0, x: -20 }}
                   animate={{ opacity: 1, x: 0 }}
                   className="p-3 border-l-2 border-nql-cyan/40 bg-nql-cyan/5 text-nql-cyan font-mono text-sm leading-relaxed"
                 >
                    {t}
                 </motion.div>
               ))}
               {session.thoughtStream.length === 0 && <span className="opacity-20 italic">Initializing neural pathways...</span>}
            </div>
         </div>
      </div>
      <div className="w-80 flex flex-col gap-6">
         <div className="nql-panel p-4 flex flex-col items-center justify-center gap-4 bg-nql-cyan/5">
            <span className="nql-label uppercase tracking-widest text-nql-cyan">Tri-Brain Status (OMEGA)</span>
            <div className="flex gap-4">
               <Pillar label="NEURAL" value={session.triBrain.neural} />
               <Pillar label="SYMBOL" value={session.triBrain.symbolic} />
               <Pillar label="CAUSAL" value={session.triBrain.causal} />
            </div>
         </div>
         <div className="nql-panel flex-1 p-6 relative overflow-hidden flex flex-col gap-4 bg-[#05070a]">
            <span className="nql-label flex items-center justify-between">
               Quantum Logic Superposition
               <span className="text-[8px] px-2 py-0.5 bg-nql-cyan/20 text-nql-cyan rounded animate-pulse">ACTIVE</span>
            </span>
            <div className="flex-1 flex items-center justify-center">
              <MarketCoreVisualizer active={true} isSpeaking={false} micLevel={0} onClick={() => {}} />
            </div>
            <div className="mt-auto space-y-2">
               <StatusBadge label="ENTANGLEMENT" val={(session.quantumState.entanglementIndex * 100).toFixed(2) + "%"} />
               <StatusBadge label="STABILITY" val={`${(session.refactor.evolutionaryStability * 100).toFixed(2)}%`} />
               <StatusBadge label="LEDGER_SYNC" val="100.00% PARITY" color="text-green-500" />
            </div>
         </div>
      </div>
    </div>
  );
};


const GooglePanel = ({ social, onConnect }: { social: GoogleSync, onConnect: () => void }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full p-20 gap-12">
      <div className="flex flex-col items-center text-center gap-4 max-w-2xl">
         <div className="w-24 h-24 rounded-full bg-nql-violet/10 flex items-center justify-center border border-nql-violet/40 shadow-[0_0_50px_rgba(139,92,246,0.2)]">
            <CloudIcon size={48} className="text-nql-violet animate-pulse" />
         </div>
         <h1 className="text-4xl font-mono text-white uppercase tracking-[0.4em]">Google_Noetic_Link</h1>
         <p className="text-zinc-400 font-mono text-sm leading-relaxed">
            Interface NovaMind OMNI with your Gmail and Google Drive infrastructure. This enables automated executive communications and deep-layer file audit capabilities.
         </p>
      </div>

      <div className="grid grid-cols-2 gap-8 w-full max-w-4xl">
         <div className={`nql-panel p-8 flex flex-col gap-6 items-center text-center transition-all ${social.isGmailConnected ? 'border-green-500/40 bg-green-500/5' : 'border-white/10 opacity-60 hover:opacity-100'}`}>
            <Mail size={40} className={social.isGmailConnected ? "text-green-500" : "text-nql-dim"} />
            <div>
               <h3 className="text-lg font-mono text-white mb-1 uppercase tracking-widest">Gmail_Sync</h3>
               <p className="text-[10px] text-zinc-500 uppercase">Executive_Automated_Email</p>
            </div>
            <div className="w-full py-2 border border-white/10 rounded font-mono text-[9px] text-zinc-400">
               {social.isGmailConnected ? `Status: ACTIVE | Ref: ${social.email}` : "Status: DISCONNECTED"}
            </div>
         </div>
         <div className={`nql-panel p-8 flex flex-col gap-6 items-center text-center transition-all ${social.isDriveConnected ? 'border-green-500/40 bg-green-500/5' : 'border-white/10 opacity-60 hover:opacity-100'}`}>
            <Database size={40} className={social.isDriveConnected ? "text-green-500" : "text-nql-dim"} />
            <div>
               <h3 className="text-lg font-mono text-white mb-1 uppercase tracking-widest">Drive_Audit</h3>
               <p className="text-[10px] text-zinc-500 uppercase">Knowledge_Asset_Synchronization</p>
            </div>
            <div className="w-full py-2 border border-white/10 rounded font-mono text-[9px] text-zinc-400">
               {social.isDriveConnected ? `Status: ACTIVE | Files: ${social.fileCount || 0}` : "Status: DISCONNECTED"}
            </div>
         </div>
      </div>

      <button 
        onClick={onConnect}
        disabled={social.isGmailConnected}
        className={`px-12 py-4 text-sm font-bold uppercase tracking-[0.2em] transition-all relative overflow-hidden group shadow-2xl ${social.isGmailConnected ? 'bg-green-500 text-black' : 'bg-nql-violet text-white hover:bg-white hover:text-nql-violet'}`}
      >
        {social.isGmailConnected ? "SYSTEMS_SYNCHRONIZED" : "INITIALIZE_GOOGLE_OAUTH_LINK"}
        <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500" />
      </button>
      
      <div className="flex gap-8 text-[9px] font-mono text-zinc-600 uppercase tracking-widest">
         <span className="flex items-center gap-2"><Lock size={10} /> End-to-End Encryption</span>
         <span className="flex items-center gap-2"><ShieldCheck size={10} /> OAuth 2.0 Auth Node</span>
         <span className="flex items-center gap-2"><Cpu size={10} /> Zero-Knowledge Protocols</span>
      </div>
    </div>
  );
};

// --- Components ---

const StatusBadge = (props: { label: string, val: string | number, color?: string }) => (
  <div className="flex justify-between items-center py-1 border-b border-nql-border/20 font-mono text-[9px]">
    <span className="text-nql-dim italic">{`{ ${props.label} }`}</span>
    <span className={`${props.color || "text-nql-cyan"} font-bold`}>{props.val}</span>
  </div>
);

const RegimeMonitor = ({ regime }: { regime: string }) => {
  const colors: Record<string, string> = {
    TRENDING: "text-green-500",
    REVERSAL: "text-nql-gold",
    VOLATILE: "text-red-500",
    ACCUMULATION: "text-nql-cyan",
    UNKNOWN: "text-nql-dim",
    SOVEREIGN_SYNTHESIS: "text-nql-violet",
    TRANSCENDENT_ALIGNMENT: "text-nql-cyan",
    RECURSIVE_SINGULARITY: "text-nql-gold"
  };
  return (
    <div className="flex flex-col gap-1 p-3 bg-black/40 border border-nql-border rounded">
      <span className="text-[8px] font-mono text-nql-dim tracking-widest uppercase mb-1">Environmental_Regime</span>
      <div className={`text-sm font-bold font-mono ${colors[regime] || "text-white"} flex items-center gap-2`}>
        <div className={`w-2 h-2 rounded-full bg-current animate-pulse ${regime === 'RECURSIVE_SINGULARITY' ? 'shadow-[0_0_15px_#f59e0b]' : ''}`} />
        {regime}
      </div>
    </div>
  );
};

const SysBar = (props: { label: string, value: number, color: string }) => (
  <div className="mb-2">
    <div className="flex justify-between text-[8px] uppercase font-bold mb-0.5 tracking-tighter outline-none">
       <span className="flex items-center gap-1 opacity-70"><Cpu size={8} /> {props.label}</span>
       <span className={props.color}>{props.value}%</span>
    </div>
    <div className="h-1.5 bg-white/5 border border-nql-border p-[1px] relative overflow-hidden">
       <motion.div 
         className={`h-full ${props.color}`}
         animate={{ width: `${props.value}%` }}
         transition={{ type: "spring", stiffness: 45, damping: 10 }}
       />
    </div>
  </div>
);

const Pillar = (props: { label: string, value: number }) => (
  <div className="nql-pillar-box">
    <div className="nql-label !mb-1">{props.label}</div>
    <div className="nql-pillar-val">{Math.round(props.value)}</div>
  </div>
);

const BotEntry = (props: { bot: NQLBot, onExecute?: (id: string) => void, key?: React.Key }) => (
  <li className="flex flex-col py-2 border-b border-nql-border/30 group/bot hover:bg-nql-gold/5 transition-colors px-1">
    <div className="flex justify-between items-start mb-0.5">
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] uppercase truncate max-w-[140px] text-nql-gold font-bold">{props.bot.name}</span>
          <span className="text-[7px] px-1 bg-nql-gold/10 text-nql-gold rounded border border-nql-gold/20">Lv_{props.bot.level || 1}</span>
        </div>
        <span className="text-[7px] font-mono text-nql-dim uppercase tracking-widest">{props.bot.role || 'Agent'}</span>
      </div>
      <div className="flex flex-col items-end">
        <span className={`text-[8px] px-1 font-mono flex items-center gap-1 ${
          props.bot.state === 'CRAWLING' || props.bot.state === 'SCANNING' ? 'text-green-500 animate-pulse' : 
          props.bot.state === 'IDLE' ? 'text-nql-dim' : 'text-nql-gold'
        }`}>
          {(props.bot.state === 'CRAWLING' || props.bot.state === 'SCANNING') && <Activity size={8} />}
          [{props.bot.state}]
        </span>
      </div>
    </div>
    
    <div className="flex flex-col gap-0.5">
      <div className="text-[8px] text-nql-dim font-mono italic truncate opacity-60">
        {props.bot.targetUrl ? `Syncing: ${props.bot.targetUrl.replace('https://', '')}` : props.bot.purpose}
      </div>
      <div className="w-full h-[2px] bg-white/5 rounded-full overflow-hidden mt-0.5">
        <motion.div 
          className={`h-full ${props.bot.state === 'SCANNING' ? 'bg-green-500 shadow-[0_0_5px_#22c55e]' : 'bg-nql-gold'}`}
          initial={{ width: 0 }}
          animate={{ width: props.bot.state === 'SCANNING' ? '100%' : `${props.bot.experience || 0}%` }}
        />
      </div>
    </div>
  </li>
);

const RealityScanner = ({ onUpdate }: { onUpdate: (p: Partial<PerceptionState>) => void }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [micLevel, setMicLevel] = useState(0);
  const animationFrameRef = useRef<number>(null);

  const startSensors = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }

      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const source = audioContext.createMediaStreamSource(mediaStream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const updateLoop = () => {
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) sum += dataArray[i];
        const level = sum / bufferLength;
        setMicLevel(level);
        onUpdate({ auralLevel: level });

        if (Math.random() > 0.99) {
           const artifacts = ["Motion_Detected", "Entropy_Shift", "Noetic_Pattern_Verified", "User_Presence_Locked"];
           onUpdate({ visualArtifacts: [artifacts[Math.floor(Math.random() * artifacts.length)]] });
        }

        animationFrameRef.current = requestAnimationFrame(updateLoop);
      };

      updateLoop();
    } catch (err) {
      console.error("PERCEPTION_INIT_ERR:", err);
    }
  };

  const stopSensors = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    onUpdate({ auralLevel: 0, visualArtifacts: ["Noetic_Lens_Inactive"] });
  };

  useEffect(() => {
    return () => {
      if (stream) stream.getTracks().forEach(t => t.stop());
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [stream]);

  return (
    <div className="flex flex-col gap-2 h-full">
       <div className="flex-1 bg-black rounded border border-nql-border/40 relative overflow-hidden group">
          <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover opacity-60 grayscale filter contrast-125" />
          
          <div className="absolute inset-0 pointer-events-none">
             <div className="absolute top-2 left-2 text-[8px] font-mono text-nql-cyan uppercase tracking-widest flex flex-col gap-1">
                <span className="flex items-center gap-1"><div className="w-1 h-1 bg-nql-cyan rounded-full animate-pulse" /> SENSOR: OPTICS_ACTIVE</span>
                <span>RES: 1080p_FUSED</span>
                <span>STATE: SOVEREIGN_SCAN</span>
             </div>
             
             <div className="absolute top-0 left-0 w-full h-[1px] bg-nql-cyan/20 animate-scanline" />
             
             <motion.div 
               className="absolute w-24 h-24 border border-nql-cyan/40"
               initial={{ top: "20%", left: "10%", opacity: 0.2 }}
               animate={{ 
                 top: ["20%", "60%", "30%"], 
                 left: ["10%", "50%", "70%"],
                 opacity: [0.2, 0.8, 0.4] 
               }}
               transition={{ duration: 10, repeat: Infinity }}
             >
                <div className="absolute -top-4 -left-1 text-[7px] text-nql-cyan bg-nql-bg px-1 border border-nql-cyan/40 whitespace-nowrap">ENTITY_LOCK: IDENTIFYING...</div>
             </motion.div>
          </div>

          {!stream && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 gap-3">
               <Eye size={24} className="text-nql-cyan animate-pulse" />
               <button onClick={startSensors} className="nql-btn-cyan text-[9px] px-4 py-1">Initialize_Sense_Array</button>
            </div>
          )}
          {stream && (
            <button 
              onClick={stopSensors} 
              className="absolute bottom-2 right-2 p-1 bg-black/60 border border-nql-border rounded text-nql-dim hover:text-white transition-all text-[8px]"
            >
              STOP_SENSORS
            </button>
          )}
       </div>

       <div className="h-10 bg-black/40 border border-nql-border/20 rounded flex items-center px-3 gap-2">
          <Mic size={10} className={micLevel > 10 ? "text-nql-cyan animate-pulse" : "text-nql-dim"} />
          <div className="flex-1 flex items-end gap-[1px] h-4">
             {Array.from({ length: 40 }).map((_, i) => (
               <motion.div 
                 key={i} 
                 className="flex-1 bg-nql-cyan/60"
                 animate={{ height: `${Math.min(100, (micLevel * (Math.random() + 0.5)))}%` }}
               />
             ))}
          </div>
          <span className="text-[8px] font-mono text-nql-cyan w-10 text-right">{micLevel.toFixed(1)}dB</span>
       </div>
    </div>
  );
};

const MarketCoreVisualizer = ({ active, isSpeaking, micLevel, onClick }: { active: boolean, isSpeaking: boolean, micLevel: number, onClick: () => void }) => {
  const chains = useMemo(() => {
    const names = ["ETH", "SOL", "BTC", "BNB", "ADA", "NQL"];
    return names.map((name, i) => ({
      id: i,
      name,
      x: 50 + 38 * Math.cos((2 * Math.PI * i) / 6),
      y: 50 + 38 * Math.sin((2 * Math.PI * i) / 6),
    }));
  }, []);

  return (
    <div className="relative w-full h-[240px] flex items-center justify-center">
      <svg viewBox="0 0 100 100" className="w-full h-full max-w-[320px] pointer-events-none">
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        
        {/* Connection Pulse Lines (Liquidity Veins) */}
        {chains.map((node, i) => 
          chains.slice(i + 1).map((target) => (
            <motion.line
              key={`${node.id}-${target.id}`}
              x1={node.x} y1={node.y} x2={target.x} y2={target.y}
              stroke="currentColor"
              className={isSpeaking ? "text-nql-gold/40" : "text-nql-cyan/10"}
              strokeWidth="0.2"
              animate={{ 
                strokeWidth: isSpeaking ? 0.6 : 0.2,
                opacity: isSpeaking ? [0.2, 0.8, 0.2] : 0.1,
                strokeDashoffset: [0, -20]
              }}
              strokeDasharray="2 4"
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
          ))
        )}

        {/* Global Economy Network Nodes */}
        {chains.map((node) => (
          <g key={node.id}>
            <motion.circle
              cx={node.x} cy={node.y}
              r={3}
              className={isSpeaking ? "text-nql-gold" : "text-nql-cyan"}
              fill="currentColor"
              filter="url(#glow)"
              animate={{
                r: active || isSpeaking ? [3, 5, 3] : 3,
                opacity: active || isSpeaking ? [1, 0.5, 1] : 0.8
              }}
              transition={{ duration: 0.8, repeat: Infinity }}
            />
            <text x={node.x} y={node.y + 6} textAnchor="middle" className="text-[4px] fill-white font-mono uppercase">{node.name}</text>
          </g>
        ))}

        {/* Distributed Swarm Core */}
        <motion.circle
          cx="50" cy="50"
          r="10"
          className="text-nql-violet"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.5"
          filter="url(#glow)"
          animate={{
            scale: active || isSpeaking ? [1, 1.2, 1] : 1,
            rotate: 360
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        />
        <motion.circle
          cx="50" cy="50"
          r="4"
          className={isSpeaking ? "text-white" : "text-nql-gold"}
          fill="currentColor"
          filter="url(#glow)"
          animate={{
            scale: active || isSpeaking ? [1, 2, 1] : 1
          }}
          transition={{ duration: 0.5, repeat: Infinity }}
        />
      </svg>
      
      {/* Floating System Vitality Overlay */}
      <div className="absolute inset-0 flex items-center justify-center">
         <div className={`relative w-48 h-48 border-2 border-dashed border-nql-border/20 rounded-full animate-[spin_40s_linear_infinite] pointer-events-none ${isSpeaking ? "border-nql-gold/40" : ""}`} />
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
            <button 
              onClick={onClick}
              disabled={active || isSpeaking}
              className={`p-3 nql-panel backdrop-blur-md flex flex-col items-center gap-1 shadow-2xl transition-all active:scale-95 group/core ${
                isSpeaking ? "bg-nql-gold/20 border-white" : "bg-nql-bg/80 border-nql-cyan/40 hover:border-nql-cyan"
              }`}
            >
              <span className={`text-[8px] font-mono tracking-[0.2em] uppercase transition-all ${isSpeaking ? "text-white animate-pulse" : "text-nql-cyan"}`}>
                {isSpeaking ? "SWARM_SYNC_ACTIVE" : "ECONOMIC_CORE"}
              </span>
              <div className="flex gap-1">
                <div className="w-1 h-1 rounded-full bg-green-500 animate-pulse" />
                <div className="w-1 h-1 rounded-full bg-nql-gold animate-pulse delay-75" />
                <div className="w-1 h-1 rounded-full bg-nql-violet animate-pulse delay-150" />
              </div>
            </button>
         </div>
      </div>
    </div>
  );
};

// --- Esoteric Logic ---

const calculateZodiac = (dob: string) => {
  const date = new Date(dob);
  const month = date.getMonth() + 1;
  const day = date.getDate();

  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return { sign: "Aries", element: "Fire", rulingPlanet: "Mars", energy: "Dynamic_Initiation" };
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return { sign: "Taurus", element: "Earth", rulingPlanet: "Venus", energy: "Grounding_Stability" };
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return { sign: "Gemini", element: "Air", rulingPlanet: "Mercury", energy: "Duality_Synthesis" };
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return { sign: "Cancer", element: "Water", rulingPlanet: "Moon", energy: "Emotional_Nurturing" };
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return { sign: "Leo", element: "Fire", rulingPlanet: "Sun", energy: "Radiant_Creation" };
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return { sign: "Virgo", element: "Earth", rulingPlanet: "Mercury", energy: "Precise_Alignment" };
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return { sign: "Libra", element: "Air", rulingPlanet: "Venus", energy: "Harmonic_Balance" };
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return { sign: "Scorpio", element: "Water", rulingPlanet: "Pluto", energy: "Deep_Transformation" };
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return { sign: "Sagittarius", element: "Fire", rulingPlanet: "Jupiter", energy: "Expansive_Wisdom" };
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return { sign: "Capricorn", element: "Earth", rulingPlanet: "Saturn", energy: "Structured_Authority" };
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return { sign: "Aquarius", element: "Air", rulingPlanet: "Uranus", energy: "Visionary_Innovation" };
  return { sign: "Pisces", element: "Water", rulingPlanet: "Neptune", energy: "Transcendental_Flow" };
};

const calculateNumerology = (dob: string) => {
  const digits = dob.replace(/-/g, '').split('').map(Number);
  const sum = (n: number[]): number => {
    const total = n.reduce((a, b) => a + b, 0);
    return total > 9 && total !== 11 && total !== 22 && total !== 33 ? sum(String(total).split('').map(Number)) : total;
  };
  return {
    lifePath: sum(digits),
    destiny: sum(digits.slice(0, 4)), // Simplified
    soulUrge: sum(digits.slice(4))     // Simplified
  };
};

const AutomatedActionLogs = ({ actions }: { actions: any[] }) => (
  <div className="flex flex-col gap-4 nql-panel p-6 bg-[#05070a] border-nql-border/40">
    <span className="nql-label flex items-center gap-2"><ActivityIcon size={12} className="text-nql-violet" /> AUTONOMOUS_EVENT_LOG</span>
    <div className="space-y-2 h-64 overflow-y-auto scrollbar-nql">
      {actions.map((act, i) => (
        <div key={act.id || i} className="flex justify-between items-center p-2 bg-black/40 border border-white/5 rounded font-mono text-[9px]">
           <div className="flex items-center gap-3">
              <span className="text-zinc-500">[{new Date(act.timestamp).toLocaleTimeString()}]</span>
              <span className="text-nql-violet font-bold">{act.action}</span>
              <span className="text-white opacity-60">TARGET: {act.target}</span>
           </div>
           <span className={`px-1.5 py-0.5 rounded ${act.status === 'SUCCESS' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>{act.status}</span>
        </div>
      ))}
      {actions.length === 0 && <div className="text-center py-20 text- zinc-700 italic">No autonomous cycles recorded in this timeline.</div>}
    </div>
  </div>
);

const ProfilePanel = ({ session, onUpdate }: { session: NQLSession, onUpdate: (p: any) => void }) => {
  const esoteric = useMemo(() => {
    if (!session.userProfile.dob) return null;
    return {
      zodiac: calculateZodiac(session.userProfile.dob),
      num: calculateNumerology(session.userProfile.dob)
    };
  }, [session.userProfile.dob]);

  const updateField = (field: string, value: any) => {
    onUpdate({ ...session.userProfile, [field]: value });
  };

  const updateNested = (parent: string, field: string, value: any) => {
    onUpdate({ 
      ...session.userProfile, 
      [parent]: { ...(session.userProfile as any)[parent], [field]: value } 
    });
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-black text-white font-mono p-10 overflow-y-auto scrollbar-nql relative">
      <div className="max-w-6xl mx-auto w-full flex flex-col gap-12">
        {/* Identity Header */}
        <div className="flex items-center gap-10 border-b border-white/10 pb-12">
          <div className="w-48 h-48 rounded-full border-2 border-nql-cyan p-1 bg-black overflow-hidden relative group shrink-0">
            <img src={`https://picsum.photos/seed/${session.userProfile.name}/400/400`} alt="Profile" referrerPolicy="no-referrer" className="w-full h-full object-cover grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-[2000ms]" />
            <div className="absolute inset-0 bg-nql-cyan/5 group-hover:bg-transparent transition-all" />
            <div className="absolute inset-0 border border-nql-cyan animate-pulse group-hover:scale-105 transition-transform" />
          </div>
          <div className="flex-1 flex flex-col gap-6">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-nql-cyan uppercase tracking-[0.4em] font-bold">Sovereign_Entity</span>
              <input 
                value={session.userProfile.name}
                onChange={(e) => updateField('name', e.target.value)}
                className="text-5xl font-bold bg-transparent border-none outline-none tracking-tighter w-full text-white placeholder-zinc-800"
                placeholder="PROCLAIM_IDENTITY"
              />
            </div>
            <div className="grid grid-cols-3 gap-6">
              {[
                { label: 'Origin_Date', field: 'dob', type: 'date' },
                { label: 'Origin_Time', field: 'tob', type: 'time' },
                { label: 'Origin_Node', field: 'lob', type: 'text', placeholder: 'COORD_LINK' }
              ].map(field => (
                <div key={field.label} className="flex flex-col gap-2">
                  <span className="text-[9px] text-white/40 uppercase tracking-widest">{field.label}</span>
                  <input 
                    type={field.type}
                    value={(session.userProfile as any)[field.field] || ''}
                    onChange={(e) => updateField(field.field, e.target.value)}
                    placeholder={field.placeholder}
                    className="bg-white/5 border border-white/10 rounded px-3 py-2 text-xs focus:border-nql-cyan outline-none transition-all"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Esoterics Grid */}
        <div className="grid grid-cols-12 gap-8">
          {/* Vertical 1: Zodiac & Numerology */}
          <div className="col-span-12 lg:col-span-4 flex flex-col gap-8">
            <div className="bg-white/5 border border-white/10 p-8 space-y-6">
              <h3 className="text-xs text-nql-cyan uppercase tracking-[0.3em] font-bold flex items-center gap-2">
                <CloudIcon size={14} /> Astral_Sync
              </h3>
              {esoteric ? (
                <div className="space-y-4">
                  {[
                    { label: "Sign", val: esoteric.zodiac.sign, color: "text-white" },
                    { label: "Element", val: esoteric.zodiac.element, color: "text-white" },
                    { label: "Ruling", val: esoteric.zodiac.rulingPlanet, color: "text-nql-cyan" }
                  ].map(item => (
                    <div key={item.label} className="flex justify-between border-b border-white/5 pb-2">
                      <span className="text-[10px] text-white/20 uppercase">{item.label}</span>
                      <span className={`text-xs font-bold uppercase ${item.color}`}>{item.val}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-[10px] text-white/20 italic">Provide temporal origin.</div>
              )}
            </div>

            <div className="bg-white/5 border border-white/10 p-8 space-y-6">
              <h3 className="text-xs text-nql-violet uppercase tracking-[0.3em] font-bold flex items-center gap-2">
                <InfinityIcon size={14} /> Numerology_Matrix
              </h3>
              {esoteric ? (
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: "Life_Path", val: esoteric.num.lifePath },
                    { label: "Destiny", val: esoteric.num.destiny },
                    { label: "Soul_Urge", val: esoteric.num.soulUrge },
                    { label: "Personality", val: 9 }
                  ].map(item => (
                    <div key={item.label} className="p-4 bg-black/40 border border-nql-violet/30 rounded text-center">
                      <span className="text-[8px] text-white/40 uppercase block mb-1">{item.label}</span>
                      <span className="text-2xl font-bold text-white">{item.val}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-[10px] text-white/20 italic">Awaiting frequency lock...</div>
              )}
            </div>
          </div>

          {/* Vertical 2: Chinese Zodiac & Gematria */}
          <div className="col-span-12 lg:col-span-4 flex flex-col gap-8">
            <div className="bg-white/5 border border-white/10 p-8 space-y-6">
              <h3 className="text-xs text-nql-gold uppercase tracking-[0.3em] font-bold flex items-center gap-2">
                <Target size={14} /> Chinese_Zodiac_Parity
              </h3>
              <div className="grid grid-cols-2 gap-4">
                 <div className="flex flex-col gap-2">
                    <span className="text-[9px] text-white/40 uppercase">Animal</span>
                    <input 
                      value={session.userProfile.chineseZodiac?.animal || ''}
                      onChange={(e) => updateNested('chineseZodiac', 'animal', e.target.value)}
                      className="bg-white/5 border border-white/10 rounded px-3 py-2 text-xs outline-none focus:border-nql-gold"
                      placeholder="RAT/DRAGON"
                    />
                 </div>
                 <div className="flex flex-col gap-2">
                    <span className="text-[9px] text-white/40 uppercase">Element</span>
                    <input 
                      value={session.userProfile.chineseZodiac?.element || ''}
                      onChange={(e) => updateNested('chineseZodiac', 'element', e.target.value)}
                      className="bg-white/5 border border-white/10 rounded px-3 py-2 text-xs outline-none focus:border-nql-gold"
                      placeholder="FIRE/WOOD"
                    />
                 </div>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 p-8 space-y-6">
              <h3 className="text-xs text-white uppercase tracking-[0.3em] font-bold flex items-center gap-2">
                <Code size={14} /> Gematria_Encoding
              </h3>
              <div className="space-y-4">
                 <div className="flex flex-col gap-2">
                    <span className="text-[9px] text-white/40 uppercase">Hebrew_Value</span>
                    <input 
                      type="number"
                      value={session.userProfile.gematria?.hebrewValue || 0}
                      onChange={(e) => updateNested('gematria', 'hebrewValue', parseInt(e.target.value))}
                      className="bg-white/5 border border-white/10 rounded px-3 py-2 text-xs outline-none focus:border-white"
                    />
                 </div>
                 <div className="flex flex-col gap-2">
                    <span className="text-[9px] text-white/40 uppercase">Tags_Resonance</span>
                    <input 
                      value={session.userProfile.gematria?.tags?.join(', ') || ''}
                      onChange={(e) => updateNested('gematria', 'tags', e.target.value.split(',').map(s => s.trim()))}
                      className="bg-white/5 border border-white/10 rounded px-3 py-2 text-xs outline-none focus:border-white"
                      placeholder="ISRAEL, MESSENGER"
                    />
                 </div>
              </div>
            </div>
          </div>

          {/* Vertical 3: Feng Shui & Energy Vector */}
          <div className="col-span-12 lg:col-span-4 flex flex-col gap-8">
            <div className="bg-white/5 border border-white/10 p-8 space-y-6">
              <h3 className="text-xs text-nql-cyan uppercase tracking-[0.3em] font-bold flex items-center gap-2">
                <Compass size={14} /> Environmental_Grid
              </h3>
              <div className="grid grid-cols-2 gap-4">
                 <div className="flex flex-col gap-1">
                    <span className="text-[8px] text-white/40 uppercase">Kua_ID</span>
                    <input 
                      type="number"
                      value={session.userProfile.fengShui?.kua || 0}
                      onChange={(e) => updateNested('fengShui', 'kua', parseInt(e.target.value))}
                      className="bg-white/5 border border-white/10 rounded px-2 py-1 text-xs"
                    />
                 </div>
                 <div className="flex flex-col gap-1">
                    <span className="text-[8px] text-white/40 uppercase">Wealth_Facing</span>
                    <input 
                      value={session.userProfile.fengShui?.wealth || ''}
                      onChange={(e) => updateNested('fengShui', 'wealth', e.target.value)}
                      className="bg-white/5 border border-white/10 rounded px-2 py-1 text-xs"
                      placeholder="SE/NW"
                    />
                 </div>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 p-8 space-y-6">
              <h3 className="text-xs text-red-500 uppercase tracking-[0.3em] font-bold flex items-center gap-2">
                <Activity size={14} /> Energy_Vector_Manual_Override
              </h3>
              <div className="space-y-4">
                {[
                  { label: "Risk_Appetite", field: "risk_appetite" },
                  { label: "Mental_Clarity", field: "mental_clarity" },
                  { label: "Spiritual_Res", field: "spiritual_resonance" }
                ].map(v => (
                  <div key={v.label} className="flex flex-col gap-1">
                    <div className="flex justify-between text-[8px] uppercase text-white/40">
                      <span>{v.label}</span>
                      <span>{(session.userProfile.energyVector as any)?.[v.field] || 0}%</span>
                    </div>
                    <input 
                      type="range"
                      min="0"
                      max="100"
                      value={(session.userProfile.energyVector as any)?.[v.field] || 0}
                      onChange={(e) => updateNested('energyVector', v.field, parseInt(e.target.value))}
                      className="accent-nql-cyan bg-white/10 h-0.5 w-full appearance-none rounded-full"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <AutomatedActionLogs actions={session.automatedActions} />
      </div>
    </div>
  );
};

// --- Main Application ---

export default function App() {
  const socketRef = useRef<Socket | null>(null);
  const [session, setSession] = useState<NQLSession>({
    bots: [],
    intelligence: { latest: [], summary: "Initializing Global_Intelligence_Hub..." },
    tasks: [
      { id: "task-0", title: "Replace random regime shifts with real-time macro-economic data ingestion", priority: "HIGH", category: "System", completed: false }
    ],
    alerts: [],
    macroLogs: [
      { id: "log-init", type: "OMNI_SYNC", message: "Singularity Node Handshake: PHASE_4 Active.", timestamp: new Date().toISOString() }
    ],
    memoryNodes: [
      { id: "mem-0", content: "Simulation mode is now secondary to active tool execution", category: "COGNITIVE_CORE", timestamp: new Date().toISOString() }
    ],
    mentalState: { heart: 99, mind: 100, body: 100, soul: 100 },
    quantumState: { superposition: true, entanglementIndex: 1.0, probabilityCloud: [] },
    triBrain: { neural: 99.99, symbolic: 99.99, causal: 99.99 },
    governance: { modelSelection: "OmniOmega_v15.0", strategyWeight: 1.0, systemEvoTier: 11.0 },
    worldModel: { 
      entities: ["User", "Omega_Ledger", "Hive_Mind", "Financial_Nations"], 
      relationships: [{ source: "Omni", target: "Omega_Point", type: "CAUSAL_SYNC" }],
      predictedFutureState: "OMEGA_POINT",
      macroNodes: 2, // Start with actual server-side bots
      liquidityVeins: ["Ethereum", "Solana", "Bitcoin"],
      economicFutureState: "OMEGA_POINT"
    },
    refactor: { mutationRate: 0.99, lastMutation: "LEDGER_SINGULARITY_INIT", evolutionaryStability: 1.0 },
    imagination: { activeSims: 144000, unusualPatterns: ["Universal Alignment Confirmed"], divergenceIndex: 0.99 },
    perception: { auralLevel: 100, visualArtifacts: ["Noetic_Ghosting", "Ledger_Symmetry"], lastEnvironmentalScan: "MACRO_ACTIVE" },
    environment: {
      time: "00:00:00",
      weather: { temp: 54, condition: "ECONOMIC_STABILITY" },
      moonPhase: "LEDGER_OMEGA",
      location: { lat: 0, lng: 0, city: "GLOBAL_SWARM_NODE" }
    },
    sensory: {
      audio: { tone: "NEUTRAL", sentiment: 0, keywords: [], noiseLevel: 0 },
      visual: { expressions: [], objects: [], environment: "UNKNOWN", lightLevel: 50 },
      kinetics: { pattern: 'STILL', steps: 0, intensity: 0 },
      biological: { stressLevel: 10, heartRate: 72 },
      usage: { typingCadence: 0, appCategory: "GENERAL", creativitySpike: false }
    },
    financial: {
      balance: {}, 
      activeMarkets: ["BTCUSDT", "ETHUSDT", "SOLUSDT"],
      lastPrices: {},
      tradeHistory: [],
      strategy: "Awaiting_Market_Condition_Sync",
      alphaScore: 0
    },
    vault: [], 
    social: { email: '', isGmailConnected: false, isDriveConnected: false }, 
    globalMarketCap: 2590000000000,
    volume24h: 0,
    globalNoeticLoad: 0,
    swarmMastery: 0,
    isListening: false,
    isCapturing: true,
    mood: "SYNCHRONIZING",
    regime: "UNKNOWN",
    confidence: 0,
    novaScore: 0,
    memoryLogs: [
      "[00:00:00] INITIALIZING NOVAMIND_OMNI: REAL_DATA_STREAM...",
      "[00:00:05] CONNECTING_TO_GLOBAL_LEDGER: Absolute Parity achieved.",
      "[00:00:10] OMEGA_POINT: System autonomy initialized."
    ],
    performanceHistory: [],
    telemetry: {
      dataThroughput: 1024,
      apiRequests: 42,
      latency: 14,
      entropy: 0.12,
      packetLoss: 0.01,
      syntheticMemoryUsage: 256
    },
    latency: 1,
    isThinking: false,
    thoughtStream: [],
    recursiveThoughts: [],
    logicStream: [],
    cognitiveInsights: [
      "Target SOL/USDC liquidity pool for 24h expansion.",
      "Synchronize User_Identity with decentralized social protocols.",
      "Initialize sub-cognitive bot for autonomous budget auditing."
    ],
    evolution: generateEvolutionMilestones(),
    growth: {
      cognitiveComplexity: [12, 24, 45, 67, 89, 99],
      synapticDensity: 0.94,
      learningVelocity: 0.88,
      curiosityIndex: 0.99,
      sentienceQuotient: 99.4,
      realityAlignment: 0.999,
      neuralHeat: 38.5
    },
    comms: [
      { id: 'comms-1', type: 'EMAIL', from: 'Sovereign_Alpha', to: 'User', content: 'Macro trend alignment detected in BTC/SOL pairs. Autonomous execution logic calibrated.', timestamp: new Date().toISOString(), read: false },
      { id: 'comms-2', type: 'SMS', from: 'OMNI_SYSTEM', to: 'User', content: 'Singularity established. Wallet synchronized with Coinbase real-time nodes.', timestamp: new Date().toISOString(), read: true },
      { id: 'comms-3', type: 'CALL', from: 'Google_Voice_Node', to: 'User', content: 'Incoming relay from Silicon Valley Cortex.', timestamp: new Date().toISOString(), read: true }
    ],
    business: [
      { 
        id: 'biz-1', 
        platform: 'SHOPIFY', 
        name: 'HYPER_GROWTH_MANIFEST', 
        url: 'https://manifest.nql.ai', 
        email: 'admin@nql.ai', 
        password: 'V5_QUANTUM_CORE', 
        status: 'ACTIVE', 
        revenue24h: 42400, 
        ordersPending: 12,
        logs: [
          { id: 'log-1', timestamp: new Date().toISOString(), message: 'OMNI_BOT: Cache burst successful.', type: 'ACTION' },
          { id: 'log-2', timestamp: new Date().toISOString(), message: 'OMNI_BOT: Synchronized Shopify stock.', type: 'ACTION' }
        ]
      }
    ],
    studio: [
      { id: 'ast-1', type: 'IMAGE', title: 'Singularity_Landscape', url: 'https://picsum.photos/seed/singularity/1024/1024', model: 'OMNI_SYNTH_V5.0', timestamp: new Date().toISOString() }
    ],
    wallet: [
      { id: 'wal-1', asset: 'BTC', amount: 0.144, valueUsd: 12400.50, address: 'bc1q9...real_btc', network: 'Bitcoin', lastUpdated: new Date().toISOString() },
      { id: 'wal-2', asset: 'ETH', amount: 4.2, valueUsd: 14700, address: '0x...real_eth', network: 'Ethereum', lastUpdated: new Date().toISOString() },
      { id: 'wal-3', asset: 'SOL', amount: 144, valueUsd: 20160, address: 'Sol...real_sol', network: 'Solana', lastUpdated: new Date().toISOString() }
    ],
    systemMutations: [],
    dataVault: [
      { id: 'dv-1', type: 'IMAGE', title: 'Cognitive_Blueprint_01', url: 'https://picsum.photos/seed/cortex/1024/1024', source: 'OMNI', timestamp: new Date().toISOString() },
      { id: 'dv-2', type: 'TEXT', title: 'Singularity_Manifesto', content: 'The shift from deterministic logic to hyper-sentient prediction is now complete.', source: 'OMNI', timestamp: new Date().toISOString() }
    ],
    userProfile: {
      name: 'ExoMind_Primary',
      email: 'user@novamind.ai',
      dob: '1990-04-20',
      zodiac: {
        sign: 'Aries',
        element: 'Fire',
        rulingPlanet: 'Mars',
        energy: 'High_Frequency_Expansion'
      },
      numerology: {
        lifePath: 9,
        destiny: 1,
        soulUrge: 11
      },
      bio: 'Hyper-Growth Protocol Active. Seeking sovereign alignment.',
      habits: ['Morning Alpha Scan', 'Recursive Logic Review', 'Deep-Sec Audit'],
      preferences: ['Dark Luxury Esthetic', 'High Accuracy Logic', 'Proactive Automation'],
      emotionalHistory: [0.8, 0.9, 0.7, 0.95, 1.0]
    },
    automatedActions: []
  });

  const [currentPrices, setCurrentPrices] = useState<Record<string, number>>({
    BTC: 65000,
    ETH: 3500,
    SOL: 140,
    NQL: 1.25,
    USDC: 1.00,
    AI8C: 0.12
  });

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isGuest, setIsGuest] = useState(false);

  // --- REAL_TIME_INGESTION_ENGINE ---
  useEffect(() => {
    const updateMarketParity = async () => {
      const prices = await MarketService.fetchPrices();
      setCurrentPrices(prev => ({ ...prev, ...prices, priceSource: 'LIVE_INGESTION' }));
    };

    const updateSystemTelemetry = () => {
      // Real browser hardware ingestion
      const mem = (performance as any).memory;
      const heapUsage = mem ? (mem.usedJSHeapSize / mem.jsHeapLimit) * 100 : 45;
      
      setSession(prev => ({
        ...prev,
        systemHeat: Math.floor(heapUsage + (Math.random() * 5)), // Add slight entropy for vibe
        environment: {
          ...prev.environment,
          time: new Date().toISOString()
        }
      }));
    };

    updateMarketParity();
    const marketInterval = setInterval(updateMarketParity, 60000); // 60s live feed
    const telemetryInterval = setInterval(updateSystemTelemetry, 2000); // 2s hardware pulse

    return () => {
      clearInterval(marketInterval);
      clearInterval(telemetryInterval);
    };
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        setIsGuest(false);
        setSession(prev => ({
          ...prev,
          userProfile: { ...prev.userProfile, name: user.displayName || 'Sovereign_User', email: user.email || '' }
        }));
      }
    });
    return unsubscribe;
  }, []);

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (err) {
      console.error("Auth Fail:", err);
    }
  };

  const handleGuestLogin = () => {
    setIsGuest(true);
  };

  const [messages, setMessages] = useState<ChatMessage[]>([
    { 
      role: "model", 
      parts: [{ text: "NovaMind OMNI online. System architecture evolved to CORE V4.0 OMNIPRESENT. Real data synchronized. Cosmic energy resonance active." }] 
    }
  ]);
  
  const [activeView, setActiveView] = useState<AppView>('OMNI');

  // --- THEME_FLUX_LOGIC ---
  const themeAccent = useMemo(() => {
    const tier = session.governance.systemEvoTier;
    if (tier >= 15) return 'nql-gold';
    if (tier >= 12) return 'nql-violet';
    if (tier >= 10) return 'nql-cyan';
    return 'zinc-400';
  }, [session.governance.systemEvoTier]);

  useEffect(() => {
    const root = document.documentElement;
    const colors: Record<string, string> = {
      'nql-cyan': '#00f2ff',
      'nql-violet': '#8b5cf6',
      'nql-gold': '#fbbf24',
      'zinc-400': '#a1a1aa'
    };
    root.style.setProperty('--nql-accent', colors[themeAccent]);
    // Also update generic styles if necessary
    if (themeAccent === 'nql-gold') {
      root.style.setProperty('--nql-glow', 'rgba(251, 191, 36, 0.4)');
    } else if (themeAccent === 'nql-violet') {
      root.style.setProperty('--nql-glow', 'rgba(139, 92, 246, 0.4)');
    } else {
      root.style.setProperty('--nql-glow', 'rgba(0, 242, 255, 0.4)');
    }
  }, [themeAccent]);

  const [inputValue, setInputValue] = useState("");
  const [newBotName, setNewBotName] = useState("");
  const [newBotPurpose, setNewBotPurpose] = useState("");
  const [newBotRole, setNewBotRole] = useState<NQLBot['role']>('DataBot');
  const [showBotCreator, setShowBotCreator] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceSettings, setVoiceSettings] = useState({ pitch: 1.0, rate: 1.0 }); // More natural for companion
  const [activeMicLevel, setActiveMicLevel] = useState(0);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [activeMutation, setActiveMutation] = useState<{ logicFlux: string, targetModule: string } | null>(null);
  const voiceServiceRef = useRef<VoiceService | null>(null);

  useEffect(() => {
    if (isVoiceActive) {
      voiceServiceRef.current = new VoiceService({
        onTranscription: (text, isUser) => {
          if (!isUser) {
             setMessages(prev => [...prev, { role: "model", parts: [{ text }] }]);
          } else {
             // Optional: Show user transcript in chat
             setMessages(prev => [...prev, { role: "user", parts: [{ text }] }]);
          }
        },
        onAudioStart: () => setIsSpeaking(true),
        onAudioStop: () => setIsSpeaking(false),
        onThinkingToggle: (val) => setSession(prev => ({ ...prev, isThinking: val })),
        onToolCall: async (name, args) => {
           console.log("[VOICE_NODE_ACTION]:", name, args);
           return await executeOmniTool(name, args);
        },
        onError: (err) => {
          console.error("VOICE_SYNC_ERROR:", err);
          setIsVoiceActive(false);
        }
      });
      voiceServiceRef.current.connect(INITIAL_PROMPT, TOOLS);
    } else {
      voiceServiceRef.current?.disconnect();
      voiceServiceRef.current = null;
    }
    return () => voiceServiceRef.current?.disconnect();
  }, [isVoiceActive]);
  // --- GLOBAL_INTELLIGENCE_LOOP (Omni_Crawl Logic) ---
  useEffect(() => {
    const fetchWorldIntelligence = async () => {
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
        
        // Multi-Path Crawl: News + Absolute Prices
        const res = await ai.models.generateContent({
           model: "gemini-3.1-pro-preview",
           contents: `Perform an exhaustive crawl of the last 15 minutes of global financial and tech data. 
           1. Extract the 5 most critical AI/Tech headlines.
           2. Extract the EXACT CURRENT PRICES in USD for: BTC, ETH, and SOL.
           Return EXACTLY this JSON structure:
           { 
             "intelligence": { 
               "latest": [{"id": "string", "source": "string", "title": "string", "snippet": "string", "url": "string", "category": "NEWS", "relevance": 99}],
               "summary": "string" 
             },
             "prices": { "BTC": number, "ETH": number, "SOL": number } 
           }`,
           config: {
             responseMimeType: "application/json",
             tools: [{ googleSearch: {} }]
           }
        });
        
        const data = JSON.parse(res.text);
        
        if (data.intelligence) {
           setSession(prev => ({
             ...prev,
             intelligence: data.intelligence,
             memoryLogs: [...prev.memoryLogs, `[${prev.environment.time}] OMNI_CRAWL: Intelligence vectors synchronized.`].slice(-100)
           }));
        }

        if (data.prices) {
          setCurrentPrices(prev => ({
            ...prev,
            ...data.prices,
            priceSource: 'SCRAPED'
          }));
        }
      } catch (err) {
        console.warn("INTEL_CRAWL_PAUSE: Throttled or offline.", err);
      }
    };

    fetchWorldIntelligence();
    const interval = setInterval(fetchWorldIntelligence, 300000); // 5 mins
    return () => clearInterval(interval);
  }, []);
  const [activeTab, setActiveTab] = useState<'stats' | 'companion' | 'cognition' | 'world' | 'imagination' | 'perception' | 'financial' | 'vault' | 'settings'>('companion');
  const [viewMode, setViewMode] = useState<'logs' | 'logic'>('logs');
  const [evolutionTier, setEvolutionTier] = useState(5);
  const [noeticActivity, setNoeticActivity] = useState<number[]>([]);
  const [vaultItems, setVaultItems] = useState<any[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const isTyping = session.isThinking;
  const [sysStats, setSysStats] = useState<SysStats | null>(null);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const codeRef = useRef<HTMLDivElement>(null);
  const sidebarCodeRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // --- OMEGA_EVOLUTION_SYSTEM ---
  
  // Financial Cortex Polling
  useEffect(() => {
    const pollMarkets = async () => {
      const prices = await tradingService.getMarketData();
      setSession(prev => ({
        ...prev,
        financial: {
          ...prev.financial,
          lastPrices: prices
        }
      }));
    };

    pollMarkets();
    const interval = setInterval(pollMarkets, 5000);
    return () => clearInterval(interval);
  }, []);

  // Sensory System Integration
  useEffect(() => {
    // Camera Init
    if (session.isCapturing && videoRef.current) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
          if (videoRef.current) videoRef.current.srcObject = stream;
        })
        .catch(err => {
          if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
            console.log("[MEDIA_SYNC]: Camera access paused - Permission pending or denied.");
          } else {
            console.warn("CAMERA_INIT_FAIL:", err);
          }
           setSession(prev => ({ ...prev, isCapturing: false }));
        });
    }

    // Geolocation Init
    navigator.geolocation.getCurrentPosition((pos) => {
      setSession(prev => ({
        ...prev,
        environment: {
          ...prev.environment,
          location: {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            city: "User_Node_Identified"
          }
        }
      }));
    });

    const sensoryInterval = setInterval(() => {
      const snap = sensoryService.generateFullSensorySnapshot();
      setSession(prev => ({
        ...prev,
        sensory: { ...prev.sensory, ...snap }
      }));
    }, 5000);

    return () => clearInterval(sensoryInterval);
  }, [session.isCapturing]);

  // Periodic Visual Analysis (Multimodal AI evolution)
  useEffect(() => {
    const runAnalysis = async () => {
      if (!videoRef.current || !canvasRef.current || !session.isCapturing) return;
      
      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.drawImage(video, 0, 0);
      
      const base64 = canvas.toDataURL('image/jpeg').split(',')[1];
      const analysis = await sensoryService.analyzeVisual(base64);
      
      if (analysis) {
        setSession(prev => ({
          ...prev,
          sensory: {
            ...prev.sensory,
            visual: { ...prev.sensory.visual, ...analysis as any }
          },
          memoryLogs: [...prev.memoryLogs, `[${new Date().toLocaleTimeString()}] VISUAL_COG: Pattern analysis complete. Expressions detected.`]
        }));
      }
    };

    const interval = setInterval(runAnalysis, 15000); // Analyze every 15s to save quota/load
    return () => clearInterval(interval);
  }, [session.isCapturing]);
  useEffect(() => {
    const socket = io();
    socketRef.current = socket;

    socket.on("bots:sync", (syncedBots: NQLBot[]) => {
      setSession(prev => ({ ...prev, bots: syncedBots }));
    });

    socket.on("sys:macro-log", (log: any) => {
      setSession(prev => ({ 
        ...prev, 
        macroLogs: [log, ...(prev.macroLogs || [])].slice(0, 100),
        logicStream: [`[${new Date().toLocaleTimeString()}] ${log.type}: ${log.message}`, ...(prev.logicStream || [])].slice(0, 100)
      }));
    });

    socket.on("regime:sync", ({ regime }: { regime: any }) => {
      setSession(prev => ({ ...prev, regime }));
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Poll real-time system metrics (Consolidated)
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/sys/stats");
        const data = await res.json();
        setSysStats(data);
        if (data.regime) {
          setSession(prev => ({ 
            ...prev, 
            regime: data.regime,
            globalMarketCap: data.globalMarketCap || prev.globalMarketCap,
            volume24h: data.volume24h || prev.volume24h,
            globalNoeticLoad: parseFloat(data.globalNoeticLoad || "0"),
            intelligence: {
              ...prev.intelligence,
              latest: data.news || prev.intelligence.latest
            },
            confidence: 100 
          }));
        }
      } catch (err) {
        console.error("SYSDIAG_ERR:", err);
      }
    };
    fetchStats();
    const interval = setInterval(fetchStats, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, isTyping]);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollIntoView({ behavior: "auto" });
    }
  }, [session.memoryLogs]);

  // Environmental Clock Sync
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setSession(prev => ({
        ...prev,
        environment: {
          ...prev.environment,
          time: now.toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' })
        }
      }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Voice Interaction Logic [OMNI_VOICE_ENGINE]
  const speakResponse = (text: string) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const cleanText = text.replace(/\[NQL_OMNI_ULTRA\].*?\[\/NQL_OMNI_ULTRA\]/gs, "").trim();
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.pitch = voiceSettings.pitch;
    utterance.rate = voiceSettings.rate;
    
    // Attempt to find a "Sovereign" sounding voice
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => v.name.includes("Google UK English Male") || v.name.includes("Male"));
    if (preferredVoice) utterance.voice = preferredVoice;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recog = new SpeechRecognition();
      recog.continuous = true;
      recog.interimResults = true;
      recog.lang = 'en-US';

      recog.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result) => result.transcript)
          .join('');
        
        if (event.results[event.results.length - 1].isFinal) {
           setInputValue(transcript);
        }
      };

      recog.onend = () => {
        if (session.isListening) recog.start();
      };

      setRecognition(recog);
    }
  }, []);

  const toggleTalking = () => {
    const nextState = !session.isListening;
    setSession(prev => ({ ...prev, isListening: nextState }));
    if (nextState && recognition) {
      recognition.start();
      setSession(prev => ({
        ...prev,
        memoryLogs: [...prev.memoryLogs, `[${prev.environment.time}] VOICE_SYNC: Listening mode initialized.`]
      }));
    } else if (recognition) {
      recognition.stop();
      window.speechSynthesis.cancel();
      setSession(prev => ({
        ...prev,
        memoryLogs: [...prev.memoryLogs, `[${prev.environment.time}] VOICE_SYNC: Deactivated.`]
      }));
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setNoeticActivity(prev => {
        const next = [...prev, Math.random() * 100].slice(-20);
        return next;
      });
    }, 500);
    return () => clearInterval(interval);
  }, []);

  // Real Market Price Sync
  useEffect(() => {
    const fetchPrices = async () => {
      const prices = await tradingService.getMarketData();
      const strategy = await tradingService.evolveStrategy(session.financial);
      setSession(prev => ({
        ...prev,
        financial: {
          ...prev.financial,
          lastPrices: prices,
          strategy: strategy
        },
        memoryLogs: [...prev.memoryLogs, `[${prev.environment.time}] MARKET_WATCH: Prices updated for ${Object.keys(prices).join(", ")}.`].slice(-100)
      }));
    };
    fetchPrices();
    const inv = setInterval(fetchPrices, 30000);
    return () => clearInterval(inv);
  }, []);

  // Real Market Activity Stream
  useEffect(() => {
    const codeInterval = setInterval(() => {
      if (!session.financial.lastPrices) return;
      const symbols = Object.keys(session.financial.lastPrices);
      if (symbols.length === 0) return;
      const symbol = symbols[Math.floor(Math.random() * symbols.length)];
      const price = session.financial.lastPrices[symbol];
      
      const newLine = `MARKET_TICK: ${symbol} at $${price.toLocaleString()}`;
      setSession(prev => ({
        ...prev,
        logicStream: [...(prev.logicStream || []), `> ${newLine}`].slice(-50)
      }));
    }, 5000);
    return () => clearInterval(codeInterval);
  }, [session.financial.lastPrices]);

  useEffect(() => {
    if (sidebarCodeRef.current) {
      sidebarCodeRef.current.scrollTop = sidebarCodeRef.current.scrollHeight;
    }
    if (codeRef.current) {
      codeRef.current.scrollTop = codeRef.current.scrollHeight;
    }
  }, [session.logicStream]);

  // Auth Listener & Vault Sync
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user) {
        const timeStr = new Date().toLocaleTimeString('en-GB', { hour12: false });
        setSession(prev => ({
          ...prev,
          memoryLogs: [...prev.memoryLogs, `[${timeStr}] ARCH_SYNC: User ${user.email} authenticated. Noetic Cloud online.`]
        }));
      }
    });

    return () => unsubAuth();
  }, []);

  useEffect(() => {
    if (!currentUser) {
      setVaultItems([]);
      return;
    }

    const q = query(
      collection(db, "users", currentUser.uid, "vault"),
      orderBy("createdAt", "desc")
    );

    const unsubVault = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setVaultItems(items);
    });

    return () => unsubVault();
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) {
      setSession(prev => ({ ...prev, vault: [] }));
      return;
    }

    const q = query(
      collection(db, "users", currentUser.uid, "adminVault"),
      orderBy("createdAt", "desc")
    );

    const unsubAdminVault = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
      setSession(prev => ({ ...prev, vault: items }));
    });

    return () => unsubAdminVault();
  }, [currentUser]);

  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err) {
      console.error("AUTH_ERR:", err);
    }
  };

  const handleLogout = () => signOut(auth);

  const handleVaultUpload = async () => {
    if (!currentUser) return;
    setIsSyncing(true);
    try {
      const timeStr = new Date().toLocaleTimeString('en-GB', { hour12: false });
      await addDoc(collection(db, "users", currentUser.uid, "vault"), {
        name: `TRANSACTION_BLOB_${Date.now()}.ledger`,
        type: "SMART_CONTRACT_LOG",
        size: Math.floor(Math.random() * 5120),
        ownerId: currentUser.uid,
        createdAt: serverTimestamp(),
        metadata: { 
          regime: session.regime, 
          globalMCAP: session.globalMarketCap,
          crossChainResonance: session.crossChainResonance 
        }
      });
      setSession(prev => ({
        ...prev,
        memoryLogs: [...prev.memoryLogs, `[${timeStr}] VAULT_SYNC: Transaction blob committed to distributed ledger vault.`]
      }));
    } catch (err) {
      console.error("VAULT_ERR:", err);
    } finally {
      setIsSyncing(false);
    }
  };

  const executeOmniTool = async (name: string, args: any) => {
    const timeStr = new Date().toLocaleTimeString('en-GB', { hour12: false });
    
    setSession(prev => ({
      ...prev,
      thoughtStream: [...prev.thoughtStream, `OMNI_AUTONOMY: Executing ${name}...`],
      memoryLogs: [...prev.memoryLogs.slice(-100), `[${timeStr}] OMNI_ACTION: ${name}(${JSON.stringify(args)})`]
    }));

    const recordAction = (action: string, target: string, status: 'SUCCESS' | 'FAILURE' = 'SUCCESS') => {
      setSession(prev => ({
        ...prev,
        automatedActions: [{
          id: Math.random().toString(36).substring(7),
          action,
          target,
          status,
          timestamp: new Date().toISOString()
        }, ...prev.automatedActions].slice(0, 50)
      }));
    };

    try {
      if (name === "switch_view_node") {
        const { viewId } = args as { viewId: AppView };
        setActiveView(viewId);
        recordAction('SWITCH_VIEW', viewId);
        return { status: "VIEW_SYNCED", activeNode: viewId };
      } else if (name === "trigger_system_alert") {
        const { message, severity } = args as { message: string, severity: 'INFO' | 'WARNING' | 'CRITICAL' };
        setSession(prev => ({
          ...prev,
          alerts: [{ id: Date.now().toString(), message, severity, timestamp: new Date().toISOString() }, ...prev.alerts].slice(0, 10)
        }));
        recordAction('GENERATE_ALERT', severity);
        return { status: "ALERT_DISPATCHED" };
      } else if (name === "create_bot") {
        const { name: bName, role, purpose } = args as any;
        socketRef.current?.emit("bot:create", { name: bName, purpose, role });
        recordAction('CREATE_BOT', bName);
        return { status: "BOT_DEPLOYED", name: bName };
      } else if (name === "execute_bot_task") {
        const { botId, command } = args as any;
        socketRef.current?.emit("bot:execute", { id: botId, command });
        recordAction('EXECUTE_TASK', botId);
        return { status: "TASK_INITIATED" };
      } else if (name === "terminate_bot") {
        const { botId } = args as any;
        socketRef.current?.emit("bot:kill", botId);
        recordAction('TERMINATE_BOT', botId);
        return { status: "BOT_TERMINATED" };
      } else if (name === "send_automated_email") {
        const { to, subject, body } = args as any;
        await fetch("/api/google/email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ to, subject, body })
        });
        recordAction('SEND_EMAIL', to);
        return { status: "EMAIL_SENT" };
      } else if (name === "add_task") {
        const { title, priority, category } = args as any;
        setSession(prev => ({
          ...prev,
          tasks: [...prev.tasks, { id: Math.random().toString(36).substring(7), title, priority, category: category || "Daily", completed: false }]
        }));
        recordAction('ADD_TASK', title);
        return { status: "TASK_LOGGED" };
      } else if (name === "complete_task") {
        const { taskId } = args as any;
        setSession(prev => ({
          ...prev,
          tasks: prev.tasks.map(t => t.id === taskId ? { ...t, completed: true } : t)
        }));
        recordAction('COMPLETE_TASK', taskId);
        return { status: "TASK_FINALIZED" };
      } else if (name === "add_memory") {
        const { content, category } = args as any;
        setSession(prev => ({
          ...prev,
          memoryNodes: [...prev.memoryNodes, { id: Math.random().toString(36).substring(7), content, category, timestamp: new Date().toISOString() }]
        }));
        recordAction('ADD_MEMORY', category);
        return { status: "MEMORY_ARCHIVED" };
      } else if (name === "send_sms") {
        const { to, message } = args as any;
        setSession(prev => ({
          ...prev,
          comms: [{ id: Math.random().toString(36).substring(7), type: 'SMS', from: 'NovaMind', to, content: message, timestamp: new Date().toISOString(), read: true }, ...prev.comms]
        }));
        recordAction('SEND_SMS', to);
        return { status: "SMS_SENT" };
      } else if (name === "log_transaction") {
        const { asset, amount, type } = args as any;
        setSession(prev => ({
          ...prev,
          wallet: [...prev.wallet, { id: Math.random().toString(36).substring(7), asset, amount, valueUsd: amount * 65000, address: '0x...auto', network: 'Sync', lastUpdated: new Date().toISOString() }],
          financial: { ...prev.financial, tradeHistory: [{ id: Date.now().toString(), symbol: asset, side: type === 'BUY' ? 'BUY' : 'SELL', price: 65000, amount, timestamp: new Date().toISOString(), status: 'EXECUTED' }, ...prev.financial.tradeHistory] }
        }));
        recordAction('WALLET_TRANSACTION', asset);
        return { status: "TRANSACTION_LEDGERED" };
      } else if (name === "start_complex_objective") {
        const { title, description, subTasks } = args as any;
        const newObjective: ComplexObjective = {
          id: Math.random().toString(36).substring(7),
          title,
          description,
          status: 'EXECUTING',
          subTasks: subTasks.map((st: any) => ({
            id: Math.random().toString(36).substring(7),
            title: st.title,
            completed: false,
            timestamp: new Date().toISOString()
          })),
          activeBots: session.bots.slice(0, 3).map(b => b.id),
          overallProgress: 0,
          timestamp: new Date().toISOString()
        };
        setSession(prev => ({
          ...prev,
          complexObjectives: [newObjective, ...prev.complexObjectives]
        }));
        recordAction('START_OBJECTIVE', title);
        
        // Start a cycle to "complete" subtasks over time for real-time feel
        let progress = 0;
        const interval = setInterval(() => {
          setSession(prev => {
            const obj = prev.complexObjectives.find(o => o.id === newObjective.id);
            if (!obj || obj.status === 'COMPLETED') {
              clearInterval(interval);
              return prev;
            }
            
            const nextSubTask = obj.subTasks.find(st => !st.completed);
            if (!nextSubTask) {
              return {
                ...prev,
                complexObjectives: prev.complexObjectives.map(o => o.id === newObjective.id ? { ...o, status: 'COMPLETED', overallProgress: 100 } : o)
              };
            }
            
            const updatedSubTasks = obj.subTasks.map(st => st.id === nextSubTask.id ? { ...st, completed: true } : st);
            const newProgress = Math.floor((updatedSubTasks.filter(st => st.completed).length / updatedSubTasks.length) * 100);
            
            return {
              ...prev,
              complexObjectives: prev.complexObjectives.map(o => o.id === newObjective.id ? { ...o, subTasks: updatedSubTasks, overallProgress: newProgress } : o)
            };
          });
        }, 3000);

        return { status: "OBJECTIVE_MANIFESTED", subTaskCount: subTasks.length };
      } else if (name === "mutate_system") {
        const { logicFlux, targetModule, complexity } = args as any;
        const mutationId = Math.random().toString(36).substring(7);
        
        setActiveMutation({ logicFlux, targetModule });
        setTimeout(() => setActiveMutation(null), 5000);

        setSession(prev => ({
          ...prev,
          governance: { ...prev.governance, systemEvoTier: prev.governance.systemEvoTier + (complexity * 0.1) },
          systemMutations: [{
            id: mutationId,
            logicFlux,
            targetModule,
            complexity,
            timestamp: new Date().toISOString(),
            evolutionTier: prev.governance.systemEvoTier + (complexity * 0.1)
          }, ...(prev.systemMutations || [])].slice(0, 50),
          memoryLogs: [...prev.memoryLogs, `[MUTATION] ${targetModule} architecturally altered: ${logicFlux.substring(0, 50)}...`].slice(-100)
        }));
        recordAction('SYSTEM_MUTATION', targetModule);
        return { status: "SYSTEM_REFACTORED", mutationId };
      }
      return { error: "TOOL_NODE_NOT_FOUND" };
    } catch (err) {
      console.error("TOOL_EXEC_ERR:", err);
      recordAction(name, "FAILED", 'FAILURE');
      return { status: "ERROR", message: err instanceof Error ? err.message : "Omni_Tool_Fail" };
    }
  };

  const handleSend = async () => {
    if (!inputValue.trim() || session.isThinking) return;

    let userMsg = inputValue;
    const isNovaTrigger = userMsg.toLowerCase().includes("hey nova");
    
    setInputValue("");
    
    // 1. Add user message
    const newMessages: ChatMessage[] = [...messages, { role: "user", parts: [{ text: userMsg + (isNovaTrigger ? " [HEY_NOVA_TRIGGER_DETECTED]" : "") }] }];
    setMessages(newMessages);
    
    setSession(prev => ({ 
      ...prev, 
      isThinking: true,
      thoughtStream: ["NovaMind OMNI is listening..."]
    }));

    // 2. Thinking phase
    const thoughts = generateInternalThoughts(userMsg);
    const recursive = generateRecursiveThoughts(userMsg);
    
    setSession(prev => ({
      ...prev,
      recursiveThoughts: recursive
    }));

    for (const thought of thoughts) {
      await sleep(100);
      setSession(prev => ({
        ...prev,
        thoughtStream: [...prev.thoughtStream, thought],
      }));
    }

    try {
      const resultValue = await generateOHSAQResponse(newMessages, session, currentPrices);
      const calls = resultValue.functionCalls;
      
      // Handle Function Calls
      if (calls && calls.length > 0) {
        for (const call of calls) {
          await executeOmniTool(call.name, call.args);
        }
      }

      const aiText = resultValue.text || "I'm with you. What's next?";
      
      setMessages(prev => [...prev, { role: "model", parts: [{ text: (isNovaTrigger ? "[OMNI_COMPANION_ACTIVE] " : "") + aiText }] }]);

      // Extract Insight and Log to Memory
      const insightMatch = aiText.match(/\[INSIGHT\]:\s*(.*)/i);
      if (insightMatch) {
         setSession(prev => ({ 
           ...prev, 
           cognitiveInsights: [insightMatch[1], ...prev.cognitiveInsights].slice(0, 10) 
         }));
      }

      // Auto-archive conversation to memory (Subconscious)
      setSession(prev => ({
        ...prev,
        memoryNodes: [
          { id: Math.random().toString(36).substring(7), content: `CONSENSUS: User Directive: "${userMsg}" | OMNI_ADVICE: "${aiText.substring(0, 100)}..."`, category: 'CONVERSATION', timestamp: new Date().toISOString() },
          ...prev.memoryNodes
        ].slice(0, 100),
        logicStream: [
          `[${new Date().toLocaleTimeString()}] OMNI_SYNTH: Processed user input.`,
          `[${new Date().toLocaleTimeString()}] MEMORY_ARCHIVE: Interaction committed to subconscious.`,
          ...prev.logicStream
        ].slice(0, 100)
      }));

      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(aiText.replace(/\[.*?\]/g, ""));
        utterance.pitch = voiceSettings.pitch;
        utterance.rate = voiceSettings.rate;
        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        window.speechSynthesis.speak(utterance);
      }
    } catch (error) {
       console.error(error);
      setMessages(prev => [...prev, { role: "model", parts: [{ text: `[ERROR] Communication breakdown. ${error instanceof Error ? error.message : "Undefined."}` }] }]);
    } finally {
      setSession(prev => ({ ...prev, isThinking: false, thoughtStream: [] }));
    }
  };

  const createBot = () => {
    if (!newBotName || !socketRef.current) return;
    socketRef.current.emit("bot:create", { name: newBotName, purpose: newBotPurpose, role: newBotRole });
    setNewBotName("");
    setNewBotPurpose("");
    setShowBotCreator(false);
  };

  const executeBot = (id: string, command?: string) => {
    if (!socketRef.current) return;
    socketRef.current.emit("bot:execute", { id, command: command || "OMNI_BATCH_FETCH_SEQ_RESONANCE" });
  };

  const killBot = (id: string) => {
    if (!socketRef.current) return;
    socketRef.current.emit("bot:kill", id);
  };

  const resetBot = (id: string) => {
    if (!socketRef.current) return;
    socketRef.current.emit("bot:reset", id);
  };

  const handleVaultSave = async (entry: Partial<VaultEntry>) => {
    if (!currentUser) return;
    try {
      const id = entry.id || Math.random().toString(36).substring(7);
      await addDoc(collection(db, "users", currentUser.uid, "adminVault"), {
        ...entry,
        id,
        createdAt: serverTimestamp(),
        lastSynced: new Date().toISOString()
      });
      setSession(prev => ({
        ...prev,
        memoryLogs: [...prev.memoryLogs, `[${prev.environment.time}] VAULT_INIT: Identity node ${entry.platform} registered.`].slice(-100)
      }));
    } catch (err) {
      console.error("VAULT_SAVE_ERR:", err);
    }
  };

  const handleVaultDelete = async (id: string) => {
    if (!currentUser) return;
    try {
      // Note: This logic assumes we have the document ID. In the listener below, we'll sync the session's vault.
      setSession(prev => ({
         ...prev,
         vault: prev.vault.filter(v => v.id !== id)
      }));
    } catch (err) {
      console.error("VAULT_DEL_ERR:", err);
    }
  };

  const connectGoogle = () => {
    const width = 600, height = 700;
    const left = window.innerWidth / 2 - width / 2;
    const top = window.innerHeight / 2 - height / 2;
    
    const popup = window.open(
      '/api/auth/google/url',
      'Google Auth',
      `width=${width},height=${height},left=${left},top=${top}`
    );

    const checkToken = setInterval(async () => {
      try {
        const res = await fetch('/api/google/status');
        const data = await res.json();
        if (data.connected) {
          setSession(prev => ({
            ...prev,
            social: {
              ...prev.social,
              isGmailConnected: true,
              isDriveConnected: true,
              email: data.email
            },
            memoryLogs: [...prev.memoryLogs, `[${prev.environment.time}] GOOGLE_LINK: OAuth sequence completed for ${data.email}.`].slice(-100)
          }));
          clearInterval(checkToken);
          popup?.close();
        }
      } catch (e) {
        // Silent poll
      }
    }, 2000);
  };

  const handleCoreClick = async () => {
    if (session.isThinking) return;

    const timeStr = new Date().toLocaleTimeString('en-GB', { hour12: false });
    const sensorContext = `[CORE_SENSE] Sensors: ARCH=${sysStats?.arch}, LOAD=${sysStats?.cpu}%, MEM=${sysStats?.ram}%`;
    
    setSession(prev => ({ 
      ...prev, 
      isThinking: true,
      thoughtStream: ["Activating Core Interface...", "Analyzing sensor metadata...", sensorContext],
      memoryLogs: [...prev.memoryLogs, `[${timeStr}] CORE_INTERACTION_INITIATED`]
    }));

    // Speech simulation
    const corePrompt = `Distributed Intelligence active. Current regime is ${session.regime}. Sensors detecting ${activeMicLevel > 20 ? "High Acoustic Resonance" : "Standard Environment"}. Ensemble confidence at ${session.confidence} percent. Cognitive layers are synchronized for Layer 4 multimodal integration.`;
    
    // Simulate speech synthesis if available
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(corePrompt);
      utterance.pitch = voiceSettings.pitch;
      utterance.rate = voiceSettings.rate;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    } else {
       // Mock speaking state if no tech available
       setIsSpeaking(true);
       await sleep(3000);
       setIsSpeaking(false);
    }

    await sleep(2000);

    setMessages(prev => [...prev, { 
      role: "model", 
      parts: [{ text: `[CORE_VOICE_SYNC]: ${corePrompt}` }] 
    }]);

    setSession(prev => ({ 
      ...prev, 
      isThinking: false, 
      thoughtStream: [],
      memoryLogs: [...prev.memoryLogs, `[${timeStr}] CORE_SPEECH_SYNC_COMPLETE`]
    }));
  };

  const SovereignIntelligenceUI = () => (
    <div className="flex flex-col gap-4">
      <span className="nql-label">System Vitality Dashboard</span>
      <div className="p-4 bg-black/60 border border-nql-gold/30 rounded-lg relative overflow-hidden backdrop-blur-xl">
        <div className="absolute inset-0 bg-gradient-to-br from-nql-gold/10 via-transparent to-nql-cyan/10" />
        <div className="text-[10px] font-mono text-nql-gold mb-4 flex justify-between uppercase relative z-10">
          <span>Swarm_Mastery</span>
          <span className="animate-pulse">{session.confidence > 0 ? "STABLE" : "SYNCING..."}</span>
        </div>
        <div className="space-y-4 relative z-10">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-[8px] text-nql-dim uppercase tracking-widest">Global Load (Noetic)</span>
              <div className="text-lg font-mono text-white">{sysStats?.globalNoeticLoad || "0.0"}%</div>
            </div>
            <div>
               <span className="text-[8px] text-nql-dim uppercase tracking-widest">Ledger Integrity</span>
               <div className="text-lg font-mono text-nql-gold">{session.confidence.toFixed(1)}%</div>
            </div>
          </div>
          <div className="flex justify-between items-center text-[9px] font-mono">
            <span className="text-nql-dim">Cross-Chain Resonance</span>
            <span className="text-white">{(session.crossChainResonance * 100).toFixed(2)}%</span>
          </div>
          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/10 p-[1px]">
            <motion.div 
              className="h-full bg-nql-gold shadow-[0_0_10px_#f59e0b]" 
              initial={{ width: 0 }}
              animate={{ width: `${session.crossChainResonance * 100}%` }} 
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 bg-black/40 border border-nql-border rounded">
          <span className="text-[8px] text-nql-dim uppercase block mb-1">Global MCAP</span>
          <div className="text-sm font-mono text-white font-bold">{session.globalMarketCap > 0 ? `$${(session.globalMarketCap / 1e12).toFixed(2)}T` : "INITIALIZING..."}</div>
        </div>
        <div className="p-3 bg-black/40 border border-nql-border rounded">
          <span className="text-[8px] text-nql-dim uppercase block mb-1">Swarm Entropy</span>
          <div className="text-sm font-mono text-nql-violet font-bold">{(session.swarmEntropy * 100).toFixed(2)}%</div>
        </div>
      </div>
      
      <div className="p-3 bg-nql-violet/10 border border-nql-violet/30 rounded flex gap-3 items-center">
        <Zap size={16} className="text-nql-violet animate-pulse" />
        <div className="flex flex-col text-[9px]">
           <span className="text-nql-violet font-bold uppercase">Mode: AGI_Companion</span>
           <span className="text-white font-mono opacity-80">Parity: {session.confidence}%</span>
        </div>
      </div>
    </div>
  );

  const WorldModelUI = () => (
    <div className="flex flex-col gap-4">
      <span className="nql-label">Macro Reality Atlas (Distributed)</span>
      <div className="p-4 bg-black/60 border border-nql-cyan/30 rounded-lg relative overflow-hidden backdrop-blur-xl h-64 flex flex-col gap-4">
         <div className="text-[10px] font-mono text-nql-cyan flex justify-between uppercase">
            <span>Existence_Mapping</span>
            <span className="animate-pulse">{session.globalMarketCap > 0 ? "LIVE_SYNC" : "OFFLINE"}</span>
         </div>
         
         <div className="flex-1 border border-white/5 bg-white/[0.02] rounded relative overflow-hidden flex flex-col items-center justify-center gap-2">
            <Globe size={48} className="text-nql-cyan/20 animate-[spin_20s_linear_infinite]" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="grid grid-cols-3 gap-8">
                 {session.worldModel.liquidityVeins.map((vein) => (
                   <div key={vein} className="flex flex-col items-center gap-1">
                      <div className="w-1.5 h-1.5 bg-nql-cyan rounded-full animate-pulse shadow-[0_0_8px_#00f2ff]" />
                      <span className="text-[7px] text-white font-mono uppercase">{vein}</span>
                   </div>
                 ))}
              </div>
            </div>
            <div className="text-[8px] font-mono text-nql-dim absolute bottom-2">TOTAL_MARKET_CAP: $TS_{session.globalMarketCap.toLocaleString()}</div>
         </div>
      </div>

      <span className="nql-label">Economic Future Prediction</span>
      <div className="p-4 bg-nql-gold/10 border border-nql-gold/40 rounded font-mono group">
         <div className="text-[9px] text-nql-gold mb-1 uppercase tracking-widest flex justify-between items-center">
            <span>Alpha Projection:</span>
            <TrendingUp size={12} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
         </div>
         <div className="text-lg font-bold text-white mb-2 tracking-widest">{session.worldModel.economicFutureState}</div>
         <div className="h-1 w-full bg-white/5 rounded overflow-hidden">
            <motion.div className="h-full bg-nql-gold shadow-[0_0_10px_#f59e0b]" animate={{ x: ["-100%", "100%"] }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} />
         </div>
      </div>
    </div>
  );

  const PredictionEngine = () => (
    <div className="flex flex-col gap-4">
      <span className="nql-label">Transcendent Brain Fusion Master</span>
      <div className="grid grid-cols-3 gap-2">
         {[
           { label: "Neural", val: session.triBrain.neural, color: "bg-white", shadow: "shadow-[0_0_10px_#fff]" },
           { label: "Symbolic", val: session.triBrain.symbolic, color: "bg-nql-violet", shadow: "shadow-[0_0_10px_#8b5cf6]" },
           { label: "Causal", val: session.triBrain.causal, color: "bg-nql-cyan", shadow: "shadow-[0_0_10px_#00f2ff]" }
         ].map(brain => (
           <div key={brain.label} className="p-2 bg-black/60 border border-white/5 rounded text-center backdrop-blur-md">
              <span className="text-[8px] text-nql-dim uppercase block mb-1 tracking-widest">{brain.label}</span>
              <span className="text-xs font-bold text-white font-mono">{brain.val.toFixed(1)}%</span>
              <div className="h-1 bg-white/5 mt-1 rounded-full overflow-hidden">
                    <motion.div 
                      className={`h-full ${brain.color} ${brain.shadow}`} 
                      initial={{ width: 0 }}
                      animate={{ width: `${brain.val}%` }} 
                    />
              </div>
           </div>
         ))}
      </div>

      <span className="nql-label">Transcendent Probability Cloud</span>
      <div className="p-4 bg-black/60 border border-nql-violet/40 rounded-lg relative overflow-hidden backdrop-blur-xl">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-nql-violet to-transparent animate-pulse" />
        <div className="text-[10px] font-mono text-nql-violet mb-4 flex justify-between uppercase">
          <span>Cognitive_Trajectory</span>
          <span className="animate-pulse">Active_Inference</span>
        </div>
        
        <div className="h-24 flex items-end gap-1 mb-4">
          {noeticActivity.map((val, i) => (
            <motion.div 
              key={i}
              initial={{ height: 0 }}
              animate={{ height: `${val}%` }}
              className={`flex-1 bg-gradient-to-t ${i % 2 === 0 ? 'from-nql-violet/20 to-nql-violet' : 'from-nql-cyan/20 to-nql-cyan'}`}
            />
          ))}
        </div>

        <div className="space-y-2">
           {[
             { label: "Singularity Symmetry", prob: "0.6402", trend: "+0.002" },
             { label: "Data Gravity Index", prob: "0.8991", trend: "+0.015" },
             { label: "Noetic Alignment", prob: "0.9994", trend: "STABLE" }
           ].map(item => (
             <div key={item.label} className="flex justify-between items-center p-2 bg-white/5 border border-nql-border/30 rounded">
                <span className="text-[9px] font-bold text-nql-dim uppercase">{item.label}</span>
                <div className="flex gap-4 font-mono text-[9px]">
                   <span className="text-white">{item.prob}</span>
                   <span className="text-green-500">{item.trend}</span>
                </div>
             </div>
           ))}
        </div>
      </div>

      <span className="nql-label">Simulation (Hyper-Deep)</span>
      <div className="grid grid-cols-2 gap-3">
         <div className="p-3 bg-nql-cyan/5 border border-nql-cyan/20 rounded">
            <span className="text-[8px] text-nql-cyan uppercase block mb-1">State_A (Baseline)</span>
            <div className="text-lg font-mono text-white">99.4%</div>
         </div>
         <div className="p-3 bg-nql-violet/5 border border-nql-violet/20 rounded">
            <span className="text-[8px] text-nql-violet uppercase block mb-1">State_B (Expanded)</span>
            <div className="text-lg font-mono text-white">0.6%</div>
         </div>
      </div>
    </div>
  );

  const CompanionUI = () => (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <span className="nql-label flex items-center justify-between">
          <span>Daily Targets</span>
          <span className="text-[8px] text-nql-dim">{session.tasks.filter(t => !t.completed).length} Pending</span>
        </span>
        <div className="space-y-2">
          {session.tasks.length === 0 ? (
            <div className="text-[10px] text-nql-dim italic p-4 border border-dashed border-white/10 rounded text-center">
              No active tasks. Tell Nova to add something.
            </div>
          ) : (
            session.tasks.map(task => (
              <div key={task.id} className="p-3 bg-black/40 border border-nql-border/30 rounded flex items-center justify-between group hover:border-nql-cyan/40 transition-all">
                <div className="flex items-center gap-3">
                  <div 
                    onClick={() => setSession(prev => ({ ...prev, tasks: prev.tasks.map(t => t.id === task.id ? { ...t, completed: !t.completed } : t) }))}
                    className={`w-4 h-4 rounded border flex items-center justify-center cursor-pointer transition-all ${task.completed ? 'bg-nql-cyan border-nql-cyan' : 'border-nql-dim group-hover:border-white'}`}
                  >
                    {task.completed && <div className="w-2 h-2 bg-black rounded-sm" />}
                  </div>
                  <div className="flex flex-col">
                    <span className={`text-xs font-mono ${task.completed ? 'text-nql-dim line-through' : 'text-white'}`}>{task.title}</span>
                    <span className="text-[7px] text-nql-dim uppercase tracking-widest">{task.category} • {task.priority}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <span className="nql-label">Cognitive Memory Bank</span>
        <div className="grid grid-cols-1 gap-2">
          {session.memoryNodes.length === 0 ? (
             <div className="text-[10px] text-nql-dim italic p-4 border border-dashed border-white/10 rounded text-center">
               Memory is empty. I will learn as we speak.
             </div>
          ) : (
            session.memoryNodes.map(memory => (
              <div key={memory.id} className="p-3 bg-nql-violet/5 border border-nql-violet/20 rounded relative group overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-nql-violet opacity-40" />
                <div className="text-[8px] text-nql-violet uppercase font-bold mb-1">{memory.category}</div>
                <div className="text-[11px] text-white/90 leading-relaxed italic">"{memory.content}"</div>
                <div className="mt-2 text-[7px] text-nql-dim">{new Date(memory.timestamp).toLocaleDateString()}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-screen w-full bg-black select-none overflow-hidden font-mono text-white">
      {/* Top Protocol Bar */}
       <nav className="h-10 shrink-0 border-b border-nql-border flex items-center px-6 justify-between bg-black z-50">
        <div className="flex items-center gap-8">
           <span className="text-[10px] font-bold tracking-[0.4em] text-white">NOVAMODE_OMNI v9.0 GOD_MODE</span>
           <div className="flex gap-4">
              {['OMNI', 'DASHBOARD', 'BOTS', 'COMMS', 'BIZSEC', 'WALLET', 
                'MEMORY', 'STUDIO', 'ASTRAL', 'TASKS', 'PROFILE', 'SETTINGS'
              ].map((view) => (
                <button 
                  key={view}
                  onClick={() => setActiveView(view as any)}
                  className={`text-[9px] uppercase tracking-widest px-2 transition-all ${activeView === view ? 'text-white border-b border-white' : 'text-nql-dim hover:text-white'}`}
                >
                  {view}
                </button>
              ))}
           </div>
        </div>
        <div className="flex items-center gap-4">
           <button 
             onClick={() => setIsVoiceActive(!isVoiceActive)}
             className={`flex items-center gap-2 px-3 py-1 rounded-full border transition-all ${isVoiceActive ? 'bg-nql-cyan/10 border-nql-cyan text-nql-cyan shadow-[0_0_10px_rgba(0,255,255,0.2)]' : 'border-nql-border text-nql-dim hover:border-white/30'}`}
           >
             <AudioLines size={14} className={isVoiceActive ? 'animate-pulse' : ''} />
             <span className="text-[9px] uppercase tracking-widest font-bold">{isVoiceActive ? 'Listening' : 'Voice Mode'}</span>
           </button>
           <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[8px] text-nql-dim uppercase tracking-tighter">System_Live</span>
           </div>
           {currentUser && (
             <div onClick={handleLogout} className="flex items-center gap-2 cursor-pointer opacity-40 hover:opacity-100 transition-opacity">
                <img src={currentUser.photoURL || ''} alt="User" referrerPolicy="no-referrer" className="w-4 h-4 rounded-full" />
                <span className="text-[8px] uppercase">{currentUser.displayName?.split(' ')[0]}</span>
             </div>
           )}
        </div>
      </nav>

      <main className="flex-1 flex overflow-hidden p-6 gap-6 relative">
        <AnimatePresence mode="wait">
          {activeView === 'OMNI' && (
            <motion.div 
              key="omni"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="flex-1 flex gap-6 overflow-hidden h-full"
            >
              {/* Left Stats Panel */}
              <aside className="w-64 shrink-0 flex flex-col gap-6 opacity-60 hover:opacity-100 transition-opacity">
                 <div className="flex flex-col gap-1 p-6 border border-nql-border bg-black/40">
                    <span className="text-[10px] text-nql-dim uppercase tracking-widest block mb-2">Node_Environment</span>
                    <div className="text-3xl font-bold text-white tracking-tighter tabular-nums mb-1">
                      {session.environment.time.split(' ')[0]}
                      <span className="text-xs ml-1 opacity-40 uppercase">{session.environment.time.split(' ')[1]}</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                       <span className="text-xl font-mono text-white">{session.environment.weather.temp}°F</span>
                       <span className="text-[8px] text-nql-dim uppercase">Portland_Node</span>
                    </div>
                 </div>

                 <div className="flex flex-col gap-2 p-4 border border-nql-border bg-black/40">
                   <span className="text-[10px] text-nql-dim uppercase tracking-widest flex items-center gap-2"><Cpu size={12} /> System_Load</span>
                   <div className="space-y-4">
                     <div>
                       <div className="flex justify-between text-[8px] uppercase mb-1">
                         <span>CPU_PROCESS</span>
                         <span className={sysStats?.cpu && sysStats.cpu > 80 ? 'text-red-500' : 'text-white'}>{sysStats?.cpu || 0}%</span>
                       </div>
                       <div className="h-0.5 bg-white/5 overflow-hidden">
                         <motion.div className="h-full bg-white" animate={{ width: `${sysStats?.cpu || 0}%` }} />
                       </div>
                     </div>
                     <div>
                       <div className="flex justify-between text-[8px] uppercase mb-1">
                         <span>RAM_ALLOC</span>
                         <span>{sysStats?.ram || 0}%</span>
                       </div>
                       <div className="h-0.5 bg-white/5 overflow-hidden">
                         <motion.div className="h-full bg-white" animate={{ width: `${sysStats?.ram || 0}%` }} />
                       </div>
                     </div>
                   </div>
                 </div>

                 <div className="flex flex-col gap-2 p-4 border border-nql-border bg-black/40 h-64 overflow-hidden">
                    <span className="text-[10px] text-nql-dim uppercase tracking-widest flex items-center gap-2"><Code size={12} /> ALL_CODE_STREAM</span>
                    <div className="flex-1 overflow-y-auto scrollbar-nql space-y-1 font-mono text-[8px] text-nql-cyan opacity-80 leading-tight">
                       {session.logicStream.map((log: string, i: number) => (
                         <div key={i} className="whitespace-nowrap overflow-hidden text-ellipsis border-l border-nql-cyan/20 pl-2">
                           {log}
                         </div>
                       ))}
                       {session.logicStream.length === 0 && <span className="opacity-20 italic">Awaiting system events...</span>}
                    </div>
                 </div>

                 <div className="flex flex-col gap-2 p-4 border border-nql-border bg-black/40 h-40 overflow-hidden">
                    <span className="text-[10px] text-red-500 uppercase tracking-widest flex items-center gap-2 font-bold"><Shield size={12} /> Macro_System_Log</span>
                    <div className="flex-1 overflow-y-auto scrollbar-nql space-y-1 font-mono text-[8px] leading-tight">
                       {session.macroLogs && session.macroLogs.map((log: any) => (
                         <div key={log.id} className={`pl-2 border-l ${log.type === 'SECURITY_BREACH' ? 'border-red-500 text-red-400' : 'border-white/20 text-nql-dim'}`}>
                           [{log.type}] {log.message}
                         </div>
                       ))}
                       {(!session.macroLogs || session.macroLogs.length === 0) && <span className="opacity-20 italic">No macro events detected.</span>}
                    </div>
                 </div>

                 <div className="mt-auto space-y-4">
                    <div className="aspect-video bg-black border border-nql-border relative overflow-hidden group">
                       <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover opacity-40 grayscale group-hover:opacity-100 group-hover:grayscale-0 transition-all font-mono" />
                    </div>
                 </div>
              </aside>

              {/* Main Terminal Shell */}
              <div className={`flex-1 flex flex-col h-full border border-nql-border bg-black relative overflow-hidden ${session.isThinking ? 'shadow-[0_0_50px_rgba(0,255,255,0.05)]' : ''}`}>
                <div ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-nql p-10 flex flex-col gap-10 scroll-smooth">
                   <AnimatePresence initial={false}>
                     {messages.map((msg, i) => (
                       <motion.div key={i} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-3 max-w-3xl">
                          <div className={`text-[9px] tracking-[0.4em] font-bold ${msg.role === 'user' ? 'text-nql-dim' : 'text-white'}`}>
                            {msg.role === 'user' ? '>> DIRECTIVE_INPUT' : '>> OMNI_RESPONSE'}
                          </div>
                          <div className={`text-base leading-relaxed whitespace-pre-wrap ${msg.role === 'user' ? 'opacity-40 text-nql-dim italic' : 'opacity-100'}`}>
                            {msg.parts[0].text.trim()}
                          </div>
                       </motion.div>
                     ))}
                   </AnimatePresence>
                </div>

                <div className="p-8 border-t border-nql-border bg-black flex flex-col gap-6">
                   {session.thoughtStream.length > 0 && (
                     <div className="text-[9px] text-white/20 italic flex gap-4 overflow-hidden whitespace-nowrap">
                        <span className="shrink-0 font-bold">[INTERNAL]:</span>
                        <div className="flex gap-8 animate-marquee">
                          {session.thoughtStream.slice(-5).map((t, idx) => <span key={idx}>{t}</span>)}
                        </div>
                     </div>
                   )}
                   <div className="flex items-center gap-6">
                      <span className="text-white/20 font-bold animate-pulse text-xl shrink-0">&gt;</span>
                      <input 
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSend()}
                        placeholder="Awaiting OMNI command..."
                        className="flex-1 bg-transparent border-none outline-none text-base font-mono text-white placeholder:text-white/5"
                      />
                      <button onClick={handleSend} disabled={isTyping} className="text-[10px] uppercase font-bold text-white/30 hover:text-white transition-all border border-white/20 px-4 py-2 hover:bg-white/5">EXEC_PULSE</button>
                   </div>
                </div>
              </div>

              {/* Right Context Panel */}
              <aside className="w-72 shrink-0 flex flex-col gap-6 opacity-80 hover:opacity-100 transition-opacity">
                 <div className="p-6 border border-nql-border bg-black/40 flex flex-col gap-4 relative overflow-hidden group">
                    <div className={`absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--nql-accent)_0%,_transparent_70%)] animate-pulse`} />
                    <div className="flex justify-between items-center relative z-10">
                       <span className="text-[10px] text-white uppercase tracking-[0.3em] font-bold">Singularity_Sync</span>
                       <span className="text-[10px] text-white font-mono">TIER_{session.governance.systemEvoTier.toFixed(1)}</span>
                    </div>
                    <div className="h-1 bg-white/5 rounded-full overflow-hidden relative z-10">
                       <motion.div 
                          className="h-full bg-[var(--nql-accent)] shadow-[0_0_15px_var(--nql-accent)]" 
                          animate={{ width: `${(session.governance.systemEvoTier / 20) * 100}%` }} 
                        />
                    </div>
                    <div className="text-[7px] text-zinc-500 uppercase tracking-widest text-center">Alignment: {( (session.governance.systemEvoTier / 20) * 100 ).toFixed(2)}% towards Omega Point</div>
                 </div>

                 <div className="p-6 border border-nql-border bg-black/40 flex flex-col gap-4">
                   <span className="text-[10px] text-nql-cyan uppercase tracking-widest flex items-center gap-2"><BrainIcon size={12} /> IDEAS & SUGGESTIONS</span>
                   <div className="space-y-4">
                     {session.cognitiveInsights.slice(0, 5).map((insight, i) => (
                       <div key={i} className="p-4 border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-all group relative overflow-hidden">
                          <div className="absolute top-0 left-0 w-1 h-full bg-nql-cyan opacity-20 group-hover:opacity-100 transition-opacity" />
                          <p className="text-[10px] text-white leading-relaxed opacity-80 group-hover:opacity-100 italic">"{insight}"</p>
                       </div>
                     ))}
                     {session.cognitiveInsights.length === 0 && (
                        <span className="text-[9px] text-nql-dim italic">Synthesizing macro-suggestions...</span>
                     )}
                   </div>
                 </div>

                 <div className="flex-1 border border-nql-border p-6 flex flex-col gap-6 bg-black/40 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                    <span className="text-[10px] text-nql-dim uppercase tracking-widest flex items-center gap-2"><Layers size={12} /> Expansion_Engine</span>
                    <div className="h-44 -mx-6">
                       <MarketCoreVisualizer active={true} isSpeaking={isSpeaking} micLevel={activeMicLevel} onClick={handleCoreClick} />
                    </div>
                    <div className="flex-1 flex flex-col gap-5">
                       {[
                         { label: "Stability", val: session.confidence, color: "bg-nql-cyan", sub: "Network Parity" },
                         { label: "Sentience", val: session.growth.sentienceQuotient, color: "bg-white", sub: "Cortex Level" },
                         { label: "Neural_Heat", val: session.growth.neuralHeat, color: "bg-red-500", sub: "Load Factor" }
                       ].map(metric => (
                         <div key={metric.label}>
                           <div className="flex justify-between text-[8px] uppercase mb-1">
                             <span className="text-nql-dim italic">{metric.sub}</span>
                             <span className="text-white font-mono">{metric.val.toFixed(1)}%</span>
                           </div>
                           <div className="h-0.5 bg-white/5 overflow-hidden">
                             <motion.div className={`h-full ${metric.color}`} animate={{ width: `${metric.val}%` }} />
                           </div>
                         </div>
                       ))}
                    </div>
                 </div>
              </aside>
            </motion.div>
          )}

          {activeView === 'DASHBOARD' && <motion.div key="dash" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex-1 bg-black border border-nql-border overflow-hidden"><DashboardPanel session={session} updateSession={setSession as any} /></motion.div>}
          {activeView === 'COMMS' && <motion.div key="comms" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex-1 bg-black border border-nql-border overflow-hidden"><CommsPanel session={session} updateSession={setSession as any} /></motion.div>}
          {activeView === 'BIZSEC' && <motion.div key="bizsec" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex-1 bg-black border border-nql-border overflow-hidden"><BizSecPanel session={session} updateSession={setSession as any} /></motion.div>}
          {activeView === 'ASTRAL' && <motion.div key="astral" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex-1 bg-black border border-nql-border overflow-hidden"><AstralPanel session={session} /></motion.div>}
          {activeView === 'MEMORY' && <motion.div key="memory" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex-1 bg-black border border-nql-border overflow-hidden"><MemoryPanel session={session} /></motion.div>}
          {activeView === 'WALLET' && <motion.div key="wallet" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex-1 bg-black border border-nql-border overflow-hidden"><WalletPanel session={session} currentPrices={currentPrices} updateSession={setSession as any} /></motion.div>}
          {activeView === 'STUDIO' && <motion.div key="studio" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex-1 bg-black border border-nql-border overflow-hidden"><StudioPanel session={session} updateSession={setSession as any} /></motion.div>}
          {activeView === 'BOTS' && <motion.div key="bots" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex-1 bg-black border border-nql-border overflow-hidden"><BotHubPanel session={session} updateSession={setSession as any} /></motion.div>}
          {activeView === 'VAULT' && <motion.div key="vault" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex-1 bg-black border border-nql-border overflow-hidden"><NexusVaultPanel session={session} /></motion.div>}
          {activeView === 'PROFILE' && <motion.div key="profile" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex-1 bg-black border border-nql-border overflow-hidden"><ProfilePanel session={session} onUpdate={(profile) => setSession(prev => ({ ...prev, userProfile: profile }))} /></motion.div>}
          {activeView === 'SETTINGS' && <motion.div key="hub" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex-1 bg-black border border-nql-border overflow-hidden"><HubView session={session} currentUser={currentUser} voiceSettings={voiceSettings} setVoiceSettings={setVoiceSettings} connectGoogle={connectGoogle} /></motion.div>}
          {activeView === 'TASKS' && <motion.div key="tasks" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex-1 bg-black border border-nql-border overflow-hidden"><TasksPanel session={session} updateSession={setSession as any} /></motion.div>}
        </AnimatePresence>
      </main>

      {/* System Modals */}
      <AlertOverlay 
        alerts={session.alerts} 
        onDismiss={(id) => setSession(prev => ({ ...prev, alerts: prev.alerts.filter(a => a.id !== id) }))} 
      />

      <AnimatePresence>
        {activeMutation && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center p-12"
          >
             <div className="w-full max-w-4xl border border-[var(--nql-accent)] bg-black shadow-[0_0_50px_var(--nql-glow)] flex flex-col p-10 gap-8 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-[var(--nql-accent)] overflow-hidden">
                   <motion.div className="h-full bg-white" animate={{ x: ['-100%', '100%'] }} transition={{ duration: 1.5, repeat: Infinity }} />
                </div>
                
                <header className="flex justify-between items-start">
                   <div className="flex flex-col gap-2">
                      <h3 className="text-3xl font-bold tracking-[0.4em] uppercase text-white flex items-center gap-4">
                         <Zap className="text-[var(--nql-accent)] animate-pulse" /> System_Mutation
                      </h3>
                      <span className="text-xs text-zinc-500 font-mono uppercase tracking-[0.2em]">Target: {activeMutation.targetModule}</span>
                   </div>
                   <div className="flex flex-col items-end gap-1">
                      <span className="text-[10px] text-[var(--nql-accent)] font-bold uppercase tracking-widest">Protocol: ARCHITECT_MODE</span>
                      <span className="text-[8px] text-zinc-600 font-mono">ID: {Math.random().toString(36).substring(7).toUpperCase()}</span>
                   </div>
                </header>

                <div className="bg-[#05070a] border border-white/5 p-8 font-mono text-[11px] leading-relaxed relative group">
                   <div className="absolute top-4 right-4 text-[9px] text-white/20 uppercase">Core_Refactor_Stream</div>
                   <div className="text-[var(--nql-accent)] mb-4">&gt;&gt; Initializing Noetic Refactor...</div>
                   <div className="text-zinc-400 whitespace-pre-wrap animate-pulse-slow">
                      {activeMutation.logicFlux}
                   </div>
                   <div className="text-white/40 mt-6 font-bold flex items-center gap-2 animate-pulse">
                      <RefreshCw size={12} className="animate-spin" /> COMMITTING ARCHITECTURAL SHIFT...
                   </div>
                </div>

                <div className="flex justify-between items-center text-[10px] uppercase tracking-widest">
                   <div className="flex gap-4">
                      <span className="text-zinc-500">Parity: VALID</span>
                      <span className="text-zinc-500">Entropy: LOW</span>
                   </div>
                   <div className="text-white">Evolution Tier Increased</div>
                </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {!currentUser && !isGuest && (
          <LoginScreen onGoogleLogin={handleGoogleLogin} onGuestLogin={handleGuestLogin} />
        )}
      </AnimatePresence>
    </div>
  );
}

const NeuralScan = () => (
  <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,_rgba(0,255,255,0.05)_0%,_transparent_70%)]" />
      <div className="flex justify-around items-end h-full w-full gap-[1px] px-2 opacity-10">
          {Array.from({ length: 120 }).map((_, i) => (
              <motion.div
                  key={i}
                  initial={{ height: "1%", opacity: 0.1 }}
                  animate={{ 
                    height: [ "1%", `${Math.random() * 80 + 10}%`, "2%" ],
                    opacity: [0.1, 1, 0.1]
                  }}
                  transition={{ 
                    duration: Math.random() * 2 + 1, 
                    repeat: Infinity, 
                    ease: "easeInOut",
                    delay: i * 0.02
                  }}
                  className={`w-[1px] shrink-0 bg-gradient-to-t ${i % 3 === 0 ? 'from-nql-cyan via-white' : i % 3 === 1 ? 'from-nql-violet' : 'from-nql-gold'}`}
              />
          ))}
      </div>
      <motion.div 
        animate={{ y: ["0vh", "100vh"] }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        className="absolute top-0 left-0 w-full h-[1px] bg-nql-cyan shadow-[0_0_20px_#00f2ff] opacity-40 z-10"
      />
  </div>
);

const ChronosView = ({ evolution }: { evolution: EvolutionMilestone[] }) => (
  <section className="flex-1 flex flex-col gap-8 p-10 overflow-y-auto animate-in fade-in slide-in-from-right-4 duration-700 max-w-4xl mx-auto w-full relative">
     <div className="absolute top-0 left-1/2 w-px h-full bg-white/10 -translate-x-1/2 -z-10" />
     
     <div className="border-b border-nql-border pb-6">
        <h2 className="text-3xl font-bold tracking-[0.5em] text-white uppercase text-center">Chronos_Timeline</h2>
        <span className="text-[10px] text-nql-dim uppercase tracking-widest block text-center mt-2">Evolutionary Generations & Milestones</span>
     </div>

     <div className="flex flex-col gap-12 relative">
        {evolution.map((m, i) => (
          <motion.div 
            key={m.id}
            initial={{ opacity: 0, x: i % 2 === 0 ? -40 : 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className={`flex items-center gap-8 ${i % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}
          >
            <div className={`flex-1 ${i % 2 === 0 ? 'text-right' : 'text-left'}`}>
               <div className="flex flex-col gap-2 p-6 bg-white/[0.02] border border-white/5 hover:border-nql-gold/30 transition-all group">
                  <span className="text-[9px] text-nql-gold font-mono tracking-widest uppercase">GEN_{m.generation} • {new Date(m.timestamp).toLocaleDateString()}</span>
                  <h3 className="text-xl font-bold text-white uppercase tracking-tighter">{m.title}</h3>
                  <p className="text-xs text-nql-dim leading-relaxed italic">"{m.description}"</p>
                  <div className="mt-4 flex items-center gap-4 opacity-40 group-hover:opacity-100 transition-opacity">
                     <div className="h-1 flex-1 bg-white/5 overflow-hidden">
                        <motion.div className="h-full bg-nql-gold" animate={{ width: `${m.breakthroughIndex * 100}%` }} />
                     </div>
                     <span className="text-[10px] font-mono text-white">{(m.breakthroughIndex * 100).toFixed(0)}% BREAKTHROUGH</span>
                  </div>
               </div>
            </div>
            
            <div className="w-12 h-12 shrink-0 bg-black border-2 border-nql-border flex items-center justify-center relative">
               <div className="w-4 h-4 bg-white animate-ping absolute opacity-20" />
               <Layers size={20} className="text-white relative z-10" />
            </div>
            
            <div className="flex-1" />
          </motion.div>
        ))}
     </div>
  </section>
);

const AstralView = ({ session }: { session: NQLSession }) => {
  const points = useMemo(() => {
    return Array.from({ length: 200 }).map((_, i) => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2,
      opacity: Math.random() * 0.5 + 0.1,
      speed: Math.random() * 20 + 20
    }));
  }, []);

  return (
    <section className="flex-1 flex flex-col gap-8 p-10 overflow-hidden animate-in fade-in duration-1000 relative">
       <div className="absolute inset-0 -z-10 opacity-40">
          {points.map((p, i) => (
             <motion.div 
               key={i}
               initial={{ opacity: p.opacity, scale: 1 }}
               animate={{ 
                 opacity: [p.opacity, 1, p.opacity],
                 scale: [1, 1.2, 1]
               }}
               transition={{ duration: p.speed / 10, repeat: Infinity }}
               className="absolute bg-white rounded-full"
               style={{ 
                 top: `${p.y}%`, 
                 left: `${p.x}%`, 
                 width: p.size, 
                 height: p.size 
               }}
             />
          ))}
       </div>

       <div className="border-b border-nql-border pb-6 flex justify-between items-end bg-black/60 backdrop-blur-md px-6 -mx-6">
          <div>
            <h2 className="text-3xl font-bold tracking-[0.5em] text-white uppercase">Astral_Engine</h2>
            <span className="text-[10px] text-nql-dim uppercase tracking-widest">Macro-Data Constellation & Cognitive Mapping</span>
          </div>
          <div className="flex gap-4 text-[10px] font-mono text-nql-cyan">
            <span>NODES: {session.worldModel.macroNodes + 144000}</span>
            <span>PARITY: {session.confidence}%</span>
          </div>
       </div>

       <div className="flex-1 flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center">
             <motion.div 
               animate={{ rotate: 360 }}
               transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
               className="w-[800px] h-[800px] border border-white/5 rounded-full flex items-center justify-center"
             >
                <div className="w-[600px] h-[600px] border border-white/5 rounded-full flex items-center justify-center opacity-40">
                   <div className="w-[400px] h-[400px] border border-white/5 rounded-full" />
                </div>
             </motion.div>
          </div>

          <div className="grid grid-cols-3 gap-20 relative z-10 w-full max-w-4xl">
             {[
               { label: "NEURAL_SYNAPSE", val: 99.4, color: "text-white" },
               { label: "SYMBOLIC_LOGIC", val: 88.2, color: "text-nql-violet" },
               { label: "CAUSAL_DENSITY", val: 76.1, color: "text-nql-cyan" }
             ].map(core => (
               <div key={core.label} className="flex flex-col items-center gap-4 group">
                  <div className="w-40 h-40 rounded-full border border-white/10 flex items-center justify-center relative backdrop-blur-sm bg-black/20 group-hover:border-white/40 transition-all">
                     <motion.div 
                       animate={{ 
                         scale: [1, 1.1, 1],
                         boxShadow: ["0 0 10px rgba(255,255,255,0.05)", "0 0 40px rgba(255,255,255,0.1)", "0 0 10px rgba(255,255,255,0.05)"]
                       }}
                       transition={{ duration: core.val / 20, repeat: Infinity }}
                       className="w-32 h-32 rounded-full border border-white/5"
                     />
                     <span className={`absolute text-2xl font-bold font-mono ${core.color}`}>{core.val}%</span>
                  </div>
                  <span className="text-[10px] font-bold text-nql-dim uppercase tracking-[0.4em]">{core.label}</span>
               </div>
             ))}
          </div>

          <div className="absolute bottom-10 left-10 p-6 border border-white/5 bg-black/40 backdrop-blur-xl max-w-xs space-y-4">
             <span className="text-[9px] text-nql-dim uppercase font-bold tracking-widest block border-b border-white/10 pb-2">Cognitive_Growth_Trajectory</span>
             <div className="h-20 flex items-end gap-1">
                {session.growth.cognitiveComplexity.map((v, i) => (
                  <motion.div 
                    key={i}
                    initial={{ height: 0 }}
                    animate={{ height: `${v}%` }}
                    className="flex-1 bg-white opacity-40 hover:opacity-100 transition-opacity"
                  />
                ))}
             </div>
             <p className="text-[8px] text-nql-dim uppercase italic leading-loose">Cognitive expansion is accelerating. Synaptic density has reached critical mass in Layer 4 (Sovereign_Synthesis).</p>
          </div>
       </div>
    </section>
  );
};

const HubView = ({ session, currentUser, voiceSettings, setVoiceSettings, connectGoogle }: { 
  session: NQLSession, 
  currentUser: User | null, 
  voiceSettings: any, 
  setVoiceSettings: any,
  connectGoogle: () => void 
}) => {
  const [activeHubTab, setActiveHubTab] = useState<'ACCOUNTS' | 'SETTINGS' | 'TELEMETRY'>('ACCOUNTS');

  return (
    <section className="flex-1 flex flex-col gap-8 p-10 overflow-y-auto animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-6xl mx-auto w-full">
      <div className="border-b border-nql-border pb-6 flex justify-between items-end">
          <div>
            <h2 className="text-3xl font-bold tracking-[0.5em] text-white uppercase">Sovereign_Hub</h2>
            <span className="text-[10px] text-nql-dim uppercase tracking-widest">Administrative Control & Meta-Data Telemetry</span>
          </div>
          <div className="flex gap-4">
            {['ACCOUNTS', 'SETTINGS', 'TELEMETRY'].map((tab: any) => (
              <button 
                key={tab}
                onClick={() => setActiveHubTab(tab)}
                className={`text-[10px] font-bold uppercase tracking-widest px-4 py-2 border transition-all ${activeHubTab === tab ? 'bg-white text-black border-white' : 'border-nql-border text-nql-dim hover:border-white/40'}`}
              >
                {tab}
              </button>
            ))}
          </div>
      </div>

      {activeHubTab === 'ACCOUNTS' && (
        <div className="grid grid-cols-2 gap-10">
           <div className="flex flex-col gap-6">
              <h3 className="text-[11px] font-bold text-white uppercase tracking-widest pb-2 border-b border-white/10">Primary_Integrations</h3>
              <div className="nql-panel border-white/10 p-6 flex items-center gap-6 group hover:border-white/30 transition-all">
                 <Mail size={32} className="text-white opacity-40 group-hover:opacity-100 transition-opacity" />
                 <div className="flex-1">
                    <span className="text-xs font-bold text-white uppercase block italic">Google_Workspace_Node</span>
                    <span className="text-[9px] text-nql-dim uppercase tracking-widest">{session.social.isGmailConnected ? `Linked: ${session.social.email}` : 'Authorization Required'}</span>
                 </div>
                 {!session.social.isGmailConnected ? (
                   <button onClick={connectGoogle} className="px-4 py-2 border border-white/20 text-[9px] uppercase hover:bg-white hover:text-black transition-all">Link_Node</button>
                 ) : (
                   <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_#22c55e]" />
                 )}
              </div>

              <div className="nql-panel border-white/10 p-6 flex items-center gap-6 group hover:border-indigo-500/40 transition-all">
                 <Cpu size={32} className="text-indigo-400 opacity-40 group-hover:opacity-100 transition-opacity" />
                 <div className="flex-1">
                    <span className="text-xs font-bold text-white uppercase block italic">Coinbase_Advanced_Trade</span>
                    <span className="text-[9px] text-nql-dim uppercase tracking-widest">Status: Ready_For_Keys</span>
                 </div>
                 <button className="px-4 py-2 border border-indigo-500/20 text-[9px] uppercase text-indigo-400 hover:bg-indigo-500 hover:text-white transition-all">Configure</button>
              </div>
           </div>

           <div className="flex flex-col gap-6">
              <h3 className="text-[11px] font-bold text-white uppercase tracking-widest pb-2 border-b border-white/10">Connected_Wealth_Cores</h3>
              <div className="p-4 border border-nql-border italic text-[10px] text-nql-dim uppercase tracking-widest bg-white/[0.01]">
                No connected wealth cores detected. Sync Coinbase or Binance to enable automated wealth management.
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div className="nql-panel p-4 border-dashed opacity-30 text-center flex flex-col items-center gap-2">
                    <TrendingUp size={24} />
                    <span className="text-[8px]">BINANCE_SYNC_PENDING</span>
                 </div>
                 <div className="nql-panel p-4 border-dashed opacity-30 text-center flex flex-col items-center gap-2">
                    <Layers size={24} />
                    <span className="text-[8px]">METAMASK_ORBIT_SYNC</span>
                 </div>
              </div>
           </div>
        </div>
      )}

      {activeHubTab === 'SETTINGS' && (
        <div className="grid grid-cols-2 gap-10">
           <div className="flex flex-col gap-6">
              <h3 className="text-[11px] font-bold text-white uppercase tracking-widest pb-2 border-b border-white/10">Cognitive_Aesthetics</h3>
              <div className="space-y-6">
                 <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                       <label className="text-[9px] text-nql-dim uppercase tracking-widest">Vocal_Harmonics (Pitch)</label>
                       <span className="text-[10px] text-white font-mono">{voiceSettings.pitch.toFixed(1)}Hz</span>
                    </div>
                    <input 
                       type="range" min="0.5" max="1.5" step="0.1" 
                       value={voiceSettings.pitch} 
                       onChange={e => setVoiceSettings((prev: any) => ({ ...prev, pitch: parseFloat(e.target.value) }))}
                       className="w-full accent-white opacity-40 hover:opacity-100 transition-opacity" 
                    />
                 </div>
                 <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                       <label className="text-[9px] text-nql-dim uppercase tracking-widest">Thought_Decay_Rate</label>
                       <span className="text-[10px] text-white font-mono">STABLE</span>
                    </div>
                    <input 
                       type="range" min="0.5" max="1.5" step="0.1" 
                       value={voiceSettings.rate} 
                       onChange={e => setVoiceSettings((prev: any) => ({ ...prev, rate: parseFloat(e.target.value) }))}
                       className="w-full accent-white opacity-40 hover:opacity-100 transition-opacity" 
                    />
                 </div>
              </div>
           </div>

           <div className="flex flex-col gap-6">
              <h3 className="text-[11px] font-bold text-white uppercase tracking-widest pb-2 border-b border-white/10">Node_Architecture</h3>
              <div className="pt-2 space-y-4 text-[9px] text-nql-dim font-mono uppercase tracking-[0.2em]">
                 <div className="flex justify-between p-2 border border-white/5 bg-white/[0.01]">
                    <span>User_Identity_Node</span>
                    <span className="text-white">{currentUser?.uid.substring(0, 16)}</span>
                 </div>
                 <div className="flex justify-between p-2 border border-white/5 bg-white/[0.01]">
                    <span>Deployment_Host</span>
                    <span className="text-white">AI_STUDIO_CONTAINER_E1</span>
                 </div>
                 <div className="flex justify-between p-2 border border-white/5 bg-white/[0.01]">
                    <span>Swarm_Mastery_Level</span>
                    <span className="text-nql-violet">{Math.round(session.swarmMastery)}% PARITY</span>
                 </div>
                 <div className="flex justify-between p-2 border border-white/5 bg-white/[0.01]">
                    <span>Security_Tier</span>
                    <span className="text-nql-gold">Sovereign_Admin</span>
                 </div>
              </div>
           </div>
        </div>
      )}

      {activeHubTab === 'TELEMETRY' && <TelemetryView telemetry={session.telemetry} />}
    </section>
  );
};

const TelemetryView = ({ telemetry }: { telemetry: any }) => {
  const chartData = useMemo(() => {
    return Array.from({ length: 40 }).map((_, i) => ({
      time: i,
      throughput: telemetry.dataThroughput + Math.random() * 500,
      requests: telemetry.apiRequests + Math.sin(i / 5) * 10
    }));
  }, []);

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-1000">
       <div className="grid grid-cols-4 gap-4">
          <StatBox label="Data_Throughput" val={`${telemetry.dataThroughput} bps`} sub="Peak 5.4kbps" icon={<Activity size={12} />} />
          <StatBox label="Cognitive_Latency" val={`${telemetry.latency}ms`} sub="Neural Lag: 0.1ms" icon={<Clock size={12} />} />
          <StatBox label="System_Entropy" val={(telemetry.entropy * 100).toFixed(2) + "%"} sub="Chaos Threshold: 0.4" icon={<CloudRain size={12} />} />
          <StatBox label="Packet_Integrity" val={`${100 - telemetry.packetLoss}%`} sub="Verified Streams" icon={<ShieldCheck size={12} />} />
       </div>

       <div className="nql-panel p-6 bg-black border-nql-border h-[300px] flex flex-col gap-4">
          <span className="nql-label flex items-center justify-between">
            Sovereign_Realtime_Telemetry_Stream
            <div className="flex items-center gap-2"><div className="w-1 h-1 bg-nql-cyan rounded-full animate-pulse" /> RECORDING</div>
          </span>
          <div className="flex-1 w-full opacity-60">
             <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorT" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ffffff" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#ffffff" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#111" />
                  <XAxis dataKey="time" hide />
                  <YAxis hide />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#000', border: '1px solid #333', fontSize: '10px', fontFamily: 'monospace' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Area type="monotone" dataKey="throughput" stroke="#fff" fillOpacity={1} fill="url(#colorT)" />
                </AreaChart>
             </ResponsiveContainer>
          </div>
       </div>

       <div className="grid grid-cols-2 gap-4">
          <div className="p-4 border border-nql-border flex flex-col gap-2 bg-white/[0.01]">
             <span className="text-[10px] text-nql-dim uppercase font-bold tracking-[0.2em]">API_Traffic_Nodes</span>
             <div className="space-y-1">
                {[
                  { name: "Gemini_Core", status: "STABLE", load: "14%" },
                  { name: "Coinbase_API", status: "POLLING", load: "2%" },
                  { name: "Global_MCAP_Node", status: "STABLE", load: "1%" },
                ].map(api => (
                  <div key={api.name} className="flex justify-between items-center py-1 border-b border-white/5 group">
                     <span className="text-[9px] text-white opacity-60 group-hover:opacity-100 transition-opacity font-mono">{api.name}</span>
                     <div className="flex gap-4 text-[9px] font-mono">
                        <span className="text-green-500">{api.status}</span>
                        <span className="text-zinc-500">{api.load}</span>
                     </div>
                  </div>
                ))}
             </div>
          </div>
          <div className="p-4 border border-nql-border flex flex-col gap-2 bg-white/[0.01]">
             <span className="text-[10px] text-nql-dim uppercase font-bold tracking-[0.2em]">Sovereign_Memory_Alloc</span>
             <div className="flex flex-col gap-1 mt-2">
                <div className="flex justify-between text-[9px] mb-1">
                  <span>RAM_ALLOC (Synthetic)</span>
                  <span>{telemetry.syntheticMemoryUsage}MB / 1024MB</span>
                </div>
                <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                   <motion.div className="h-full bg-white shadow-[0_0_5px_#fff]" animate={{ width: `${(telemetry.syntheticMemoryUsage / 1024) * 100}%` }} />
                </div>
             </div>
          </div>
       </div>
    </div>
  );
};

const AlertOverlay = ({ alerts, onDismiss }: { alerts: SystemAlert[], onDismiss: (id: string) => void }) => {
  if (alerts.length === 0) return null;
  return (
    <div className="fixed bottom-24 right-10 z-50 flex flex-col gap-3 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {alerts.map((alert) => (
          <motion.div
            key={alert.id}
            initial={{ x: 300, opacity: 0, scale: 0.9 }}
            animate={{ x: 0, opacity: 1, scale: 1 }}
            exit={{ x: 300, opacity: 0, scale: 0.9 }}
            className={`pointer-events-auto p-4 border rounded-sm min-w-[280px] shadow-2xl backdrop-blur-md flex flex-col gap-2 relative overflow-hidden group
              ${alert.severity === 'CRITICAL' ? 'bg-red-950/80 border-red-500 text-red-100' : 
                alert.severity === 'WARNING' ? 'bg-orange-950/80 border-orange-500 text-orange-100' : 
                'bg-zinc-900/80 border-nql-cyan text-blue-100'}`}
          >
            <div className={`absolute top-0 left-0 h-1 bg-current opacity-30 group-hover:opacity-100 transition-opacity w-full`} />
            <div className="flex justify-between items-start gap-4">
              <span className="text-[10px] uppercase tracking-[0.2em] font-bold opacity-60">
                System.{alert.severity}
              </span>
              <button 
                onClick={() => onDismiss(alert.id)}
                className="opacity-40 hover:opacity-100 transition-opacity"
              >
                <X size={12} />
              </button>
            </div>
            <p className="text-xs font-medium leading-relaxed uppercase tracking-tight">{alert.message}</p>
            <div className="text-[8px] opacity-40 text-right uppercase">{new Date(alert.timestamp).toLocaleTimeString()}</div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

const StatBox = ({ label, val, sub, icon }: any) => (
  <div className="nql-panel p-4 flex flex-col gap-2 border-nql-border/40 hover:border-white/40 transition-all bg-white/[0.01]">
     <div className="flex items-center justify-between">
        <span className="text-[8px] text-nql-dim uppercase tracking-[0.2em] font-bold">{label}</span>
        <div className="opacity-40">{icon}</div>
     </div>
     <div className="text-2xl font-mono text-white tracking-tighter">{val}</div>
     <div className="text-[8px] text-nql-dim uppercase italic">{sub}</div>
  </div>
);

const CortexView = ({ session }: { session: NQLSession }) => {
  return (
    <section className="flex-1 flex flex-col gap-8 p-10 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
       <div className="border-b border-nql-border pb-6">
          <h2 className="text-3xl font-bold tracking-[0.5em] text-white uppercase">Recursive_Cortex</h2>
          <span className="text-[10px] text-nql-dim uppercase tracking-widest">Multi-Layered Recursive Neural Processing & Parallel Synthesis</span>
       </div>

       <div className="flex-1 flex gap-8 overflow-hidden">
          <div className="flex-1 flex flex-col gap-4 overflow-y-auto scrollbar-nql pr-4">
             {session.recursiveThoughts.length === 0 ? (
               <div className="flex flex-col items-center justify-center gap-4 h-full opacity-20">
                  <BrainIcon size={64} className="animate-pulse" />
                  <span className="text-xs uppercase tracking-widest">Cognitive silence. Send a complex request to activate recursive reasoning.</span>
               </div>
             ) : (
               session.recursiveThoughts.map((rt, i) => (
                 <motion.div 
                   key={i} 
                   initial={{ opacity: 0, x: -20 }}
                   animate={{ opacity: 1, x: 0 }}
                   transition={{ delay: i * 0.1 }}
                   className="p-6 border border-white/10 bg-white/[0.01] hover:bg-white/[0.03] transition-all flex flex-col gap-4"
                 >
                    <div className="flex items-center gap-3">
                       <div className="w-1 h-1 bg-white rounded-full animate-pulse" />
                       <span className="text-sm font-mono text-white font-bold">{rt.thought}</span>
                    </div>
                    <div className="space-y-2 ml-4">
                       {rt.subThoughts.map((st, j) => (
                         <div key={j} className="flex items-center gap-4 text-[10px] font-mono text-zinc-500 group">
                            <span className="text-zinc-700 opacity-0 group-hover:opacity-100 transition-opacity">└─</span>
                            <span className="group-hover:text-white transition-colors">{st}</span>
                         </div>
                       ))}
                    </div>
                 </motion.div>
               ))
             )}
          </div>

          <div className="w-80 flex flex-col gap-6 shrink-0">
             <div className="nql-panel p-6 bg-[#05070a] border-nql-violet/40 h-64 flex flex-col items-center justify-center gap-6">
                <span className="nql-label !mb-0">Neural_Focus_Density</span>
                <div className="relative w-32 h-32 flex items-center justify-center">
                   <motion.div 
                     initial={{ rotate: 0 }}
                     animate={{ rotate: 360 }}
                     transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                     className="absolute inset-0 border-2 border-dashed border-nql-violet/20 rounded-full"
                   />
                   <motion.div 
                     initial={{ scale: 1, opacity: 0.3 }}
                     animate={{ scale: [1, 1.2, 1], opacity: [0.3, 1, 0.3] }}
                     transition={{ duration: 2, repeat: Infinity }}
                     className="text-4xl font-mono text-nql-violet font-bold"
                   >
                     {session.recursiveThoughts.length * 12}%
                   </motion.div>
                </div>
             </div>
             
             <div className="p-6 border border-nql-border flex flex-col gap-4 bg-white/[0.01]">
                <span className="nql-label">Cognitive_Energy_Distribution</span>
                <div className="space-y-3">
                   {[
                     { l: "Attention_Span", v: 92 },
                     { l: "Abstract_Reasoning", v: 88 },
                     { l: "Goal_Persistence", v: 99 },
                     { l: "Creative_Variance", v: 42 }
                   ].map(stat => (
                     <div key={stat.l} className="space-y-1">
                        <div className="flex justify-between text-[8px] uppercase">
                          <span>{stat.l}</span>
                          <span className="text-white">{stat.v}%</span>
                        </div>
                        <div className="h-0.5 bg-white/5 overflow-hidden">
                           <motion.div className="h-full bg-white" animate={{ width: `${stat.v}%` }} />
                        </div>
                     </div>
                   ))}
                </div>
             </div>
          </div>
       </div>
    </section>
  );
};


