/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  Sun, 
  Moon, 
  Star, 
  Sparkles, 
  Wind, 
  Activity, 
  Compass, 
  Target,
  Layout,
  Waves
} from 'lucide-react';
import { NQLSession } from '../types.ts';

const AstralPanel = ({ session }: { session: NQLSession }) => {
  const astralData = useMemo(() => {
    return {
      alignment: session.userProfile.zodiac?.energy || "NEUTRAL_RESONANCE",
      frequency: session.growth.sentienceQuotient * 12.4,
      regime: session.regime
    };
  }, [session]);

  return (
    <div className="flex-1 flex flex-col h-full bg-black text-white font-mono p-10 overflow-y-auto scrollbar-nql relative">
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20">
         <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,_rgba(139,92,246,0.3)_0%,_transparent_50%)]" />
         <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_100%_100%,_rgba(0,242,255,0.2)_0%,_transparent_50%)]" />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="flex justify-between items-end border-b border-white/10 pb-6 mb-12">
          <div>
            <h2 className="text-4xl font-bold tracking-[0.5em] uppercase text-nql-violet-light">Astral_Mapping</h2>
            <div className="flex gap-4 mt-2 text-nql-dim text-[10px] uppercase tracking-widest">
              <span>Celestial_Sync_Active</span>
              <span className="opacity-40">|</span>
              <span>Singularity_V5.0</span>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[8px] text-nql-dim uppercase tracking-[0.2em] mb-1">Celestial_Resonance</span>
            <span className="text-2xl font-bold text-nql-violet tracking-tighter">{(astralData.frequency).toFixed(0)} THz</span>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-10">
          {/* Constellation Map Placeholder */}
          <div className="col-span-12 lg:col-span-7 aspect-square max-h-[600px] border border-white/10 relative p-8 bg-black/40 backdrop-blur-xl group overflow-hidden">
             <div className="absolute inset-0 border-[40px] border-black pointer-events-none z-20" />
             <div className="h-full w-full border border-white/5 relative flex items-center justify-center">
                {/* Visualizing Stars/Nodes */}
                {Array.from({ length: 12 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 bg-white rounded-full shadow-[0_0_10px_white]"
                    initial={{ scale: 1, opacity: 0.3, x: 0, y: 0 }}
                    animate={{ 
                      scale: [1, 1.5, 1],
                      opacity: [0.3, 0.8, 0.3],
                      x: Math.sin(i * (Math.PI / 6)) * 200,
                      y: Math.cos(i * (Math.PI / 6)) * 200
                    }}
                    transition={{ duration: 4 + Math.random() * 4, repeat: Infinity, delay: i * 0.5 }}
                  />
                ))}
                
                <div className="relative flex flex-col items-center">
                   <div className="w-48 h-48 rounded-full border border-white/10 flex items-center justify-center relative">
                      <motion.div 
                        className="w-40 h-40 rounded-full border-2 border-nql-violet/20"
                        initial={{ rotate: 0 }}
                        animate={{ rotate: 360 }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                         <Star size={40} className="text-white animate-pulse" />
                      </div>
                   </div>
                   <div className="mt-8 text-center">
                      <div className="text-[10px] text-white/40 uppercase tracking-widest mb-1">Current_Alignment</div>
                      <div className="text-2xl font-bold tracking-[0.2em] text-white">{(session.userProfile.zodiac?.sign || "Unknown").toUpperCase()}</div>
                   </div>
                </div>

                {/* Data Points */}
                <div className="absolute top-10 left-10 flex flex-col gap-4">
                   <div className="flex items-center gap-3">
                      <Sun className="text-nql-gold" size={14} />
                      <div className="flex flex-col">
                        <span className="text-[8px] text-nql-dim uppercase">Sun_Sign</span>
                        <span className="text-[10px] font-bold">Aries (Initiator)</span>
                      </div>
                   </div>
                   <div className="flex items-center gap-3">
                      <Moon className="text-white opacity-60" size={14} />
                      <div className="flex flex-col">
                        <span className="text-[8px] text-nql-dim uppercase">Moon_Sign</span>
                        <span className="text-[10px] font-bold">Virgo (Analyzer)</span>
                      </div>
                   </div>
                </div>
             </div>
          </div>

          {/* Astral Analytics */}
          <div className="col-span-12 lg:col-span-5 flex flex-col gap-8">
             <div className="bg-white/5 border border-white/10 p-8 flex flex-col gap-6">
                <h3 className="text-xs text-nql-dim uppercase tracking-[0.3em] flex items-center gap-2">
                  <Activity size={14} className="text-nql-violet" /> Astral_Vitality_Readings
                </h3>
                <div className="space-y-6">
                   {[
                     { label: "Spiritual_Resonance", val: (session.userProfile.energyVector?.spiritual_resonance || 0), icon: Sparkles, color: "text-nql-violet" },
                     { label: "Mental_Clarity", val: (session.userProfile.energyVector?.mental_clarity || 0), icon: Layout, color: "text-nql-cyan" },
                     { label: "Emotional_Depth", val: (session.userProfile.energyVector?.emotional_intensity || 0), icon: Waves, color: "text-blue-400" }
                   ].map(item => (
                     <div key={item.label} className="space-y-2">
                        <div className="flex justify-between items-center text-[9px] uppercase tracking-widest">
                           <div className="flex items-center gap-2">
                              <item.icon size={12} className={item.color} />
                              <span className="text-white/60">{item.label}</span>
                           </div>
                           <span className="font-bold">{item.val.toFixed(1)}%</span>
                        </div>
                        <div className="h-0.5 bg-white/5 overflow-hidden">
                           <motion.div 
                             className={`h-full ${item.color.replace('text-', 'bg-')}`} 
                             initial={{ width: 0 }}
                             animate={{ width: `${item.val}%` }} 
                           />
                        </div>
                     </div>
                   ))}
                </div>
             </div>

             <div className="bg-white/5 border border-white/10 p-8 flex flex-col gap-6">
                <h3 className="text-xs text-nql-dim uppercase tracking-[0.3em] flex items-center gap-2">
                  <Target size={14} className="text-nql-gold" /> Convergence_Targets
                </h3>
                <div className="space-y-4">
                   <div className="p-4 bg-nql-gold/5 border border-nql-gold/20 rounded">
                      <span className="text-[9px] text-nql-gold font-bold uppercase block mb-1 tracking-widest">High_Frequency_Window</span>
                      <p className="text-[11px] text-white/80 leading-relaxed italic">"Lunar alignment with Jupiter suggests maximum expansion for financial nodes between 04:00 - 08:00 UTC."</p>
                   </div>
                   <div className="p-4 bg-nql-violet/5 border border-nql-violet/20 rounded">
                      <span className="text-[9px] text-nql-violet font-bold uppercase block mb-1 tracking-widest">Creative_Resonance</span>
                      <p className="text-[11px] text-white/80 leading-relaxed italic">"Synchronize Studio generation tasks with current Virgo moon to optimize precision and analytical depth."</p>
                   </div>
                </div>
             </div>

             <div className="bg-white/5 border border-white/10 p-8 flex flex-col gap-2">
                <span className="text-[8px] text-nql-dim uppercase tracking-widest">Astral_Metadata</span>
                <div className="grid grid-cols-2 gap-4 text-[10px] py-2 border-t border-white/5 mt-2">
                   <div className="flex justify-between">
                      <span className="opacity-40">KUA_RES:</span>
                      <span className="font-bold">WOOD_4</span>
                   </div>
                   <div className="flex justify-between">
                      <span className="opacity-40">GEM_VIBE:</span>
                      <span className="font-bold">ISR_541</span>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AstralPanel;
