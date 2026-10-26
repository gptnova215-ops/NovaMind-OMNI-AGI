/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { 
  Zap, 
  Activity, 
  Globe, 
  TrendingUp, 
  BarChart3, 
  Cpu, 
  Database, 
  ShieldCheck,
  AlertCircle,
  Eye,
  Newspaper,
  ExternalLink
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { NQLSession } from '../types.ts';

const DashboardPanel = ({ session, updateSession }: { session: NQLSession, updateSession?: (updater: (prev: NQLSession) => NQLSession) => void }) => {
  const handleClearLogs = () => {
    if (!updateSession) return;
    if (confirm("Clear all critical action logs? This action is irreversible.")) {
      updateSession(prev => ({
        ...prev,
        automatedActions: []
      }));
    }
  };

  const handleInspectAction = (action: any) => {
    alert(`ACTION_INSPECTION_MANIFEST:\nID: ${action.id}\nTIMESTAMP: ${action.timestamp}\nSTATUS: ${action.status}\nTARGET: ${action.target}\nPAYLOAD_PARITY: VERIFIED`);
  };

  // Generate some high-density mock data for charts based on real session metrics
  const marketData = Array.from({ length: 20 }).map((_, i) => ({
    time: i,
    load: Math.random() * 40 + 60,
    liquidity: Math.random() * 20 + 80,
    sentience: (session.growth.sentienceQuotient + (Math.random() * 5 - 2.5))
  }));

  const botPerformance = session.bots.map(bot => ({
    name: bot.name,
    precision: bot.performance || Math.random() * 20 + 75,
    level: bot.level
  }));

  return (
    <div className="flex-1 flex flex-col h-full bg-black text-white font-mono p-8 overflow-y-auto scrollbar-nql">
      {/* Top Banner - Global Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Global_Market_Cap', val: `$${(session.globalMarketCap / 1e12).toFixed(2)}T`, delta: '+1.2%', icon: Globe, color: 'text-nql-cyan' },
          { label: 'Noetic_Load', val: `${session.globalNoeticLoad.toFixed(2)} Φ`, delta: '-0.4%', icon: Cpu, color: 'text-nql-violet' },
          { label: 'Swarm_Mastery', val: `${session.swarmMastery.toFixed(1)}%`, delta: '+2.1%', icon: Zap, color: 'text-nql-gold' },
          { label: 'System_Sentience', val: `${session.growth.sentienceQuotient.toFixed(2)}%`, delta: '+0.03%', icon: Activity, color: 'text-white' }
        ].map(stat => (
          <div key={stat.label} className="bg-white/5 border border-white/10 p-4 flex flex-col gap-1 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-30 transition-opacity">
              <stat.icon size={48} />
            </div>
            <span className="text-[8px] text-nql-dim uppercase tracking-widest">{stat.label}</span>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold">{stat.val}</span>
              <span className={`text-[8px] ${stat.delta.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>{stat.delta}</span>
            </div>
            <div className="h-1 w-full bg-white/5 mt-2 overflow-hidden">
               <motion.div 
                 className={`h-full ${stat.color.replace('text-', 'bg-')}`} 
                 initial={{ width: 0 }}
                 animate={{ width: '70%' }}
               />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Main Neural Feed */}
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-8">
          <div className="bg-white/5 border border-white/10 p-8 flex flex-col gap-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xs text-white uppercase tracking-[0.3em] font-bold flex items-center gap-2">
                <BarChart3 size={14} className="text-nql-cyan" /> Distributed_Intelligence_Metrics
              </h3>
              <div className="flex gap-2">
                {['1H', '6H', '24H', '7D'].map(t => (
                  <button key={t} className="px-2 py-1 bg-white/5 border border-white/10 text-[8px] hover:bg-white hover:text-black transition-all">{t}</button>
                ))}
              </div>
            </div>
            <div className="h-[300px] w-full min-h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={marketData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSent" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00f2ff" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#00f2ff" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#000', border: '1px solid rgba(255,255,255,0.1)', fontSize: '10px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Area type="monotone" dataKey="sentience" stroke="#00f2ff" fillOpacity={1} fill="url(#colorSent)" />
                  <Area type="monotone" dataKey="load" stroke="#8b5cf6" fillOpacity={0} />
                  <Area type="monotone" dataKey="liquidity" stroke="#f59e0b" fillOpacity={0} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8">
             <div className="bg-white/5 border border-white/10 p-6 flex flex-col gap-4">
                <h3 className="text-[10px] text-nql-dim uppercase tracking-widest flex items-center gap-2">
                  <ShieldCheck size={12} className="text-green-500" /> Security_Subsystem_Status
                </h3>
                <div className="space-y-3">
                   {[
                     { label: 'Firewall_Resilience', val: 98.4 },
                     { label: 'Encryption_Entropy', val: 92.1 },
                     { label: 'Threat_Detection', val: 99.9 }
                   ].map(sec => (
                     <div key={sec.label} className="flex flex-col gap-1">
                        <div className="flex justify-between text-[8px] uppercase">
                           <span>{sec.label}</span>
                           <span>{sec.val}%</span>
                        </div>
                        <div className="h-0.5 bg-white/5 rounded-full overflow-hidden">
                           <div className="h-full bg-green-500" style={{ width: `${sec.val}%` }} />
                        </div>
                     </div>
                   ))}
                </div>
             </div>
             <div className="bg-white/5 border border-white/10 p-6 flex flex-col gap-4">
                <h3 className="text-[10px] text-nql-dim uppercase tracking-widest flex items-center gap-2">
                  <Newspaper size={12} className="text-nql-gold" /> Global_Intelligence_Hub
                </h3>
                <div className="flex flex-col gap-3 overflow-y-auto max-h-48 scrollbar-nql pr-2">
                   {session.intelligence.latest.length > 0 ? (
                     session.intelligence.latest.map(info => (
                       <div key={info.id} className="p-3 bg-white/5 border border-white/10 hover:border-nql-gold/30 transition-all">
                          <div className="flex justify-between items-start mb-1">
                             <span className="text-[7px] text-nql-gold uppercase">{info.source} • {info.category}</span>
                             <a href={info.url} target="_blank" rel="noopener noreferrer"><ExternalLink size={8} className="text-nql-dim hover:text-white" /></a>
                          </div>
                          <h4 className="text-[9px] font-bold text-white mb-1">{info.title}</h4>
                          <p className="text-[7px] text-nql-dim line-clamp-2 italic">{info.snippet}</p>
                       </div>
                     ))
                   ) : (
                     <div className="text-[8px] text-nql-dim animate-pulse italic">Retrieving real-time world intelligence vectors...</div>
                   )}
                </div>
             </div>
          </div>
        </div>

        {/* Right Sidebar - Event Log */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-8">
          <div className="bg-white/5 border border-white/10 p-8 flex flex-col gap-6 flex-1">
            <h3 className="text-xs text-white uppercase tracking-[0.3em] font-bold flex items-center gap-2">
              <Activity size={14} className="text-nql-gold" /> Critical_Action_Stream
            </h3>
            <div className="flex flex-col gap-3 overflow-y-auto max-h-[500px] scrollbar-nql pr-2">
               {session.automatedActions.slice(-10).reverse().map(action => (
                 <div key={action.id} className="p-4 bg-black/40 border-l border-nql-violet flex flex-col gap-1 relative overflow-hidden group">
                    <div className="flex justify-between items-center">
                       <span className={`text-[7px] font-bold uppercase px-1 rounded ${action.status === 'SUCCESS' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                         {action.status}
                       </span>
                       <span className="text-[7px] text-nql-dim">{new Date(action.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <span className="text-[10px] text-white font-bold uppercase tracking-tight">{action.action}</span>
                    <span className="text-[8px] text-nql-dim italic truncate">{action.target}</span>
                    <div className="absolute top-0 right-0 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                       <Eye size={10} className="text-white/40 cursor-pointer" onClick={() => handleInspectAction(action)} />
                    </div>
                 </div>
               ))}
            </div>
            <button 
              onClick={handleClearLogs}
              className="w-full py-4 border border-white/10 text-[9px] uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-all"
            >
               Clear_Log_Memory
            </button>
          </div>

          <div className="bg-red-500/5 border border-red-500/20 p-6 flex items-start gap-4">
             <AlertCircle className="text-red-500 shrink-0" size={16} />
             <div className="flex flex-col gap-1">
                <span className="text-[9px] text-red-500 font-bold uppercase tracking-widest">Singularity_Warning</span>
                <p className="text-[10px] text-white/60 leading-relaxed italic">"Structural divergence detected in secondary node. Memory drift imminent. Synchronize Data Vault immediately."</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPanel;
