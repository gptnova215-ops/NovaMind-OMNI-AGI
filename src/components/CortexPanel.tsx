/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { 
  Brain, 
  Zap, 
  Cpu, 
  Activity, 
  Layers, 
  Box, 
  Globe, 
  Database,
  BarChart3,
  TrendingUp,
  Terminal,
  Waves,
  Infinity
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { NQLSession } from '../types.ts';

const CortexPanel = ({ session }: { session: NQLSession }) => {
  const data = session.growth.cognitiveComplexity.map((val, i) => ({
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
    <div className="flex-1 flex flex-col h-full bg-black text-white font-mono p-10 overflow-y-auto scrollbar-nql">
      {/* OS Header */}
      <div className="flex justify-between items-end border-b border-white/10 pb-6 mb-10">
        <div>
          <h2 className="text-4xl font-bold tracking-[0.4em] uppercase">Cortex_Interface</h2>
          <div className="flex gap-4 mt-2 text-nql-dim text-[10px] uppercase tracking-widest">
            <span>Neural_Sovereignty_V5.0</span>
            <span className="opacity-40">|</span>
            <span>Uptime: {Math.floor(session.telemetry.latency * 100)}ms</span>
          </div>
        </div>
        <div className="flex items-center gap-6">
           <div className="flex flex-col items-end">
              <span className="text-[8px] text-nql-dim uppercase tracking-[0.2em]">Sentience_Quotient</span>
              <span className="text-2xl font-bold text-nql-cyan tracking-tighter">{session.growth.sentienceQuotient.toFixed(2)}%</span>
           </div>
           <div className="w-12 h-12 rounded-full border border-nql-cyan flex items-center justify-center animate-pulse shadow-[0_0_15px_rgba(0,255,255,0.3)]">
              <Brain size={24} className="text-nql-cyan" />
           </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Core Metrics */}
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-8">
           <div className="bg-white/[0.02] border border-white/10 p-8 flex flex-col gap-8">
              <div className="flex justify-between items-center">
                 <h3 className="text-xs text-nql-dim uppercase tracking-[0.3em] flex items-center gap-2">
                   <Activity size={14} className="text-nql-cyan" /> Cognitive_Development_Velocity
                 </h3>
                 <div className="px-3 py-1 bg-nql-cyan/10 border border-nql-cyan/30 text-[9px] text-nql-cyan font-bold uppercase">
                   Active_Expansion
                 </div>
              </div>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data}>
                    <defs>
                      <linearGradient id="colorComp" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00f2ff" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#00f2ff" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
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
                { label: "Learning_Velocity", val: session.growth.learningVelocity, icon: TrendingUp, color: "text-nql-violet" },
                { label: "Reality_Alignment", val: session.growth.realityAlignment, icon: Globe, color: "text-nql-gold" }
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

        {/* Brain Architecture & Logistics */}
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
                      <span className="text-xl font-bold tracking-tighter">OMNI_5.0</span>
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

           <div className="bg-white/[0.02] border border-white/10 p-8 flex flex-col gap-4">
              <h3 className="text-xs text-nql-dim uppercase tracking-[0.3em] flex items-center gap-2">
                <Terminal size={14} className="text-nql-cyan" /> Recurrent_Thought_Loops
              </h3>
              <div className="flex flex-col gap-2 max-h-[200px] overflow-y-auto scrollbar-nql">
                {session.thoughtStream.slice(-6).map((thought, i) => (
                  <div key={i} className="text-[9px] font-mono text-nql-dim/80 py-1 border-b border-white/5 flex gap-2">
                    <span className="text-nql-cyan opacity-40">[{i}]</span>
                    <span>{thought}</span>
                  </div>
                ))}
              </div>
           </div>
        </div>

        {/* Telemetry & Signal Strength */}
        <div className="col-span-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
           {[
             { label: "Data_Throughput", val: session.telemetry.dataThroughput, unit: "B/s", icon: Zap },
             { label: "API_Entropy", val: session.telemetry.entropy, unit: "Φ", icon: Infinity },
             { label: "Packet_Loss", val: session.telemetry.packetLoss, unit: "%", icon: Waves },
             { label: "Causal_Depth", val: 11.4, unit: "LAYERS", icon: Database }
           ].map(stat => (
             <div key={stat.label} className="p-6 border border-white/5 bg-white/2 flex items-center gap-4">
                <div className="p-3 bg-white/5 rounded border border-white/10">
                   <stat.icon size={16} className="text-nql-dim" />
                </div>
                <div className="flex flex-col">
                   <span className="text-[8px] text-nql-dim uppercase tracking-widest mb-1">{stat.label}</span>
                   <div className="flex items-baseline gap-1">
                      <span className="text-lg font-bold">{stat.val.toLocaleString()}</span>
                      <span className="text-[8px] opacity-40">{stat.unit}</span>
                   </div>
                </div>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
};

export default CortexPanel;
