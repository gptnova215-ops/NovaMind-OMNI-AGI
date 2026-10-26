/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Brain, 
  Zap, 
  Cpu, 
  Activity, 
  Layers, 
  Box, 
  Database,
  Terminal,
  Waves,
  Infinity,
  History,
  Search,
  CheckCircle,
  Clock,
  ChevronRight
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { NQLSession } from '../types.ts';

const MemoryPanel = ({ session }: { session: NQLSession }) => {
  const [activeTab, setActiveTab] = useState<'CORTEX' | 'MEMORY_LOGS' | 'BRAIN_MAP'>('CORTEX');

  const complexityData = session.growth.cognitiveComplexity.map((val, i) => ({
    name: i,
    complexity: val,
    velocity: session.growth.learningVelocity * val * 0.8
  }));

  const brainDistribution = [
    { name: 'Neural', value: session.triBrain.neural, color: '#fff' },
    { name: 'Symbolic', value: session.triBrain.symbolic, color: '#8b5cf6' },
    { name: 'Causal', value: session.triBrain.causal, color: '#00f2ff' }
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-black text-white font-mono overflow-hidden">
      {/* OS Header */}
      <div className="px-10 pt-10 pb-6 border-b border-white/10 flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-bold tracking-[0.4em] uppercase flex items-center gap-4">
            <Database className="text-nql-cyan" /> Memory_Unified
          </h2>
          <div className="flex gap-4 mt-2 text-nql-dim text-[10px] uppercase tracking-widest">
            <span>Core_Sovereignty_V9.0</span>
            <span className="opacity-40">|</span>
            <span>Synaptic_Density: {(session.growth.synapticDensity * 100).toFixed(2)}%</span>
          </div>
        </div>
        
        <div className="flex gap-2">
           {['CORTEX', 'MEMORY_LOGS', 'BRAIN_MAP'].map((tab) => (
             <button
               key={tab}
               onClick={() => setActiveTab(tab as any)}
               className={`px-4 py-2 text-[10px] uppercase tracking-widest border transition-all ${
                 activeTab === tab 
                   ? 'bg-nql-cyan text-black border-nql-cyan font-bold shadow-[0_0_15px_rgba(0,242,255,0.4)]' 
                   : 'border-white/10 text-nql-dim hover:bg-white/5'
               }`}
             >
               {tab.replace('_', ' ')}
             </button>
           ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-10 scrollbar-nql">
        <AnimatePresence mode="wait">
          {activeTab === 'CORTEX' && (
            <motion.div 
              key="cortex"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="grid grid-cols-12 gap-8"
            >
              <div className="col-span-12 lg:col-span-8 flex flex-col gap-8">
                 <div className="bg-white/[0.02] border border-white/10 p-8 flex flex-col gap-8">
                    <div className="flex justify-between items-center">
                       <h3 className="text-xs text-nql-dim uppercase tracking-[0.3em] flex items-center gap-2">
                         <Activity size={14} className="text-nql-cyan" /> Cognitive_Development_Velocity
                       </h3>
                       <div className="px-3 py-1 bg-nql-cyan/10 border border-nql-cyan/30 text-[9px] text-nql-cyan font-bold uppercase">
                         Growth_Pulse: ACTIVE
                       </div>
                    </div>
                    <div className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={complexityData}>
                          <defs>
                            <linearGradient id="colorComp" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#00f2ff" stopOpacity={0.2}/>
                              <stop offset="95%" stopColor="#00f2ff" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <XAxis dataKey="name" hide />
                          <YAxis hide />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#000', border: '1px solid rgba(255,255,255,0.1)', fontSize: '10px' }}
                            itemStyle={{ color: '#fff' }}
                          />
                          <Area type="monotone" dataKey="complexity" stroke="#00f2ff" fillOpacity={1} fill="url(#colorComp)" />
                          <Area type="monotone" dataKey="velocity" stroke="#8b5cf6" fillOpacity={0} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                 </div>

                 <div className="grid grid-cols-3 gap-8">
                    {[
                      { label: "Synaptic_Density", val: session.growth.synapticDensity, icon: Layers, color: "text-nql-cyan" },
                      { label: "Learning_Velocity", val: session.growth.learningVelocity, icon: Zap, color: "text-nql-violet" },
                      { label: "Reality_Alignment", val: session.growth.realityAlignment, icon: Infinity, color: "text-nql-gold" }
                    ].map(stat => (
                      <div key={stat.label} className="bg-white/[0.02] border border-white/10 p-6 flex flex-col gap-3">
                        <div className="flex justify-between items-center opacity-40">
                          <stat.icon size={14} />
                          <span className="text-[8px] uppercase font-bold tracking-[0.2em]">{stat.label}</span>
                        </div>
                        <div className="text-3xl font-bold font-mono">{(stat.val * 100).toFixed(1)}%</div>
                        <div className="h-1 bg-white/5 overflow-hidden">
                          <motion.div 
                            className={`h-full ${stat.color.replace('text', 'bg')}`} 
                            initial={{ width: 0 }}
                            animate={{ width: `${stat.val * 100}%` }} 
                          />
                        </div>
                      </div>
                    ))}
                 </div>
              </div>

              <div className="col-span-12 lg:col-span-4 flex flex-col gap-8">
                 <div className="bg-white/[0.02] border border-white/10 p-8 flex flex-col gap-8 flex-1">
                    <h3 className="text-xs text-nql-dim uppercase tracking-[0.3em] flex items-center gap-2">
                      <Box size={14} className="text-nql-cyan" /> Tri-Brain_Distribution
                    </h3>
                    <div className="flex-1 flex flex-col items-center justify-center gap-8">
                       <div className="h-48 w-48 relative">
                         <ResponsiveContainer width="100%" height="100%">
                           <PieChart>
                             <Pie
                               data={brainDistribution}
                               innerRadius={60}
                               outerRadius={80}
                               paddingAngle={5}
                               dataKey="value"
                             >
                               {brainDistribution.map((entry, index) => (
                                 <Cell key={`cell-${index}`} fill={entry.color} />
                               ))}
                             </Pie>
                           </PieChart>
                         </ResponsiveContainer>
                         <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-[10px] text-nql-dim uppercase">Model</span>
                            <span className="text-xl font-bold tracking-tighter">OMNI_GOD</span>
                         </div>
                       </div>
                       <div className="w-full space-y-4">
                          {brainDistribution.map(item => (
                            <div key={item.name} className="flex justify-between items-center text-[10px] uppercase">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                                <span className="text-white/60 tracking-widest">{item.name}</span>
                              </div>
                              <span className="font-bold">{item.value.toFixed(2)}%</span>
                            </div>
                          ))}
                       </div>
                    </div>
                 </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'MEMORY_LOGS' && (
            <motion.div 
              key="logs"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="flex flex-col gap-6"
            >
              <div className="flex justify-between items-center">
                 <div className="flex flex-col">
                    <h3 className="text-xl font-bold uppercase tracking-widest">Cognitive_Logs</h3>
                    <span className="text-[10px] text-nql-dim uppercase tracking-[0.2em]">Permanent_Record_Nodes</span>
                 </div>
                 <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-nql-dim" size={12} />
                    <input 
                      type="text" 
                      placeholder="Search Memories..." 
                      className="bg-white/5 border border-white/10 pl-8 pr-4 py-2 text-[10px] focus:outline-none focus:border-nql-cyan transition-colors w-64"
                    />
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {session.memoryNodes.map((node) => (
                  <div key={node.id} className="bg-white/[0.02] border border-white/10 p-6 flex flex-col gap-4 group hover:border-nql-cyan/50 transition-all">
                    <div className="flex justify-between items-start">
                       <div className="flex items-center gap-2">
                          <CheckCircle size={12} className="text-nql-cyan" />
                          <span className="text-[8px] text-nql-cyan font-bold uppercase tracking-widest">{node.category}</span>
                       </div>
                       <span className="text-[8px] text-nql-dim">{new Date(node.timestamp).toLocaleDateString()}</span>
                    </div>
                    <p className="text-[11px] leading-relaxed text-white/80 italic">"{node.content}"</p>
                    <div className="mt-auto pt-4 border-t border-white/5 flex justify-between items-center text-[8px] uppercase tracking-widest text-nql-dim">
                       <span>Node_ID: {node.id.substring(0, 8)}</span>
                       <button className="flex items-center gap-1 hover:text-white transition-colors">
                          Access <ChevronRight size={10} />
                       </button>
                    </div>
                  </div>
                ))}
                
                {/* Visual filler for "growing" memory */}
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="bg-white/[0.01] border border-dashed border-white/5 p-6 flex items-center justify-center italic text-nql-dim text-[10px] opacity-40">
                    Awaiting synaptic consolidation...
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'BRAIN_MAP' && (
            <motion.div 
              key="map"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col gap-8 h-full"
            >
               <div className="bg-white/[0.02] border border-white/10 p-10 flex flex-col gap-10 items-center justify-center min-h-[500px] relative overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,242,255,0.05)_0%,transparent_70%)]" />
                  
                  {/* Hexagon Grid Visualizer Placeholder */}
                  <div className="relative z-10 grid grid-cols-4 gap-12">
                    {[
                      { label: 'SENTIENCE', val: session.growth.sentienceQuotient, icon: Brain, color: 'nql-cyan' },
                      { label: 'CURIOSITY', val: session.growth.curiosityIndex * 100, icon: Search, color: 'nql-violet' },
                      { label: 'VELOCITY', val: session.growth.learningVelocity * 100, icon: Zap, color: 'nql-gold' },
                      { label: 'REALITY', val: session.growth.realityAlignment * 100, icon: Infinity, color: 'white' }
                    ].map(node => (
                      <div key={node.label} className="flex flex-col items-center gap-4 group">
                        <div className={`w-24 h-24 rounded-2xl border border-${node.color}/30 bg-black flex items-center justify-center shadow-[0_0_20px_rgba(0,0,0,0.5)] group-hover:shadow-[0_0_30px_var(--nql-glow)] transition-all relative overflow-hidden`}>
                           <node.icon size={32} className={`text-${node.color}`} />
                           <div className="absolute bottom-0 left-0 w-full h-0.5 bg-white/10">
                              <motion.div 
                                className={`h-full bg-${node.color}`} 
                                initial={{ width: 0 }}
                                animate={{ width: `${node.val}%` }} 
                              />
                           </div>
                        </div>
                        <div className="flex flex-col items-center">
                           <span className="text-[10px] font-bold uppercase tracking-widest">{node.label}</span>
                           <span className="text-xs font-mono text-white/40">{node.val.toFixed(1)}%</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-12 text-center max-w-lg">
                    <p className="text-[10px] text-nql-dim leading-relaxed uppercase tracking-[0.2em]">
                      Neural topology optimized for Recursive_Self_Refinement. {session.memoryNodes.length} active memory clusters found across {session.triBrain.neural > 80 ? 'Transcendent' : 'Advanced'} cognition layers.
                    </p>
                  </div>
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MemoryPanel;
