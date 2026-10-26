/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bot, 
  Terminal, 
  Settings, 
  Play, 
  Pause, 
  RotateCcw, 
  Shield, 
  Activity, 
  Cpu, 
  Search, 
  Trash2, 
  Plus,
  ArrowRight,
  Monitor
} from 'lucide-react';
import { NQLSession, NQLBot, BotState } from '../types.ts';

interface BotHubPanelProps {
  session: NQLSession;
  updateSession: (updater: (prev: NQLSession) => NQLSession) => void;
}

const SwarmHiveVisualizer = ({ bots }: { bots: NQLBot[] }) => {
  return (
    <div className="h-32 w-full relative overflow-hidden bg-black/60 border-y border-white/5 group">
       <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(#00f2ff_1px,transparent_1px)] [background-size:20px_20px]" />
       </div>
       <div className="flex items-center justify-center h-full gap-4">
          {bots.slice(0, 8).map((bot, i) => (
            <motion.div 
              key={bot.id}
              className={`w-6 h-6 border rotate-45 flex items-center justify-center overflow-hidden transition-all duration-700 ${
                bot.state === BotState.IDLE ? 'border-zinc-700 bg-zinc-700/5' : 'border-nql-cyan bg-nql-cyan/10 shadow-[0_0_15px_rgba(0,242,255,0.2)]'
              }`}
              animate={{ 
                scale: bot.state === BotState.IDLE ? 0.8 : [0.8, 1.1, 0.8],
                y: [0, Math.sin(i) * 5, 0]
              }}
              transition={{ duration: 3 + i, repeat: Infinity }}
            >
               <Bot size={10} className={`-rotate-45 ${bot.state === BotState.IDLE ? 'text-zinc-700' : 'text-nql-cyan'}`} />
            </motion.div>
          ))}
          {bots.length === 0 && <Bot size={24} className="text-zinc-800 opacity-20 animate-pulse" />}
       </div>
       <div className="absolute bottom-1 left-1 text-[7px] text-nql-cyan font-bold opacity-0 group-hover:opacity-100 transition-opacity">SWARM_TOPOLOGY_V2.5</div>
    </div>
  );
};

const BotHubPanel = ({ session, updateSession }: BotHubPanelProps) => {
  const [selectedBotId, setSelectedBotId] = useState<string | null>(session.bots[0]?.id || null);
  const [isDeploying, setIsDeploying] = useState(false);
  const [newBotConfig, setNewBotConfig] = useState<Partial<NQLBot>>({
    name: '',
    role: 'DataBot',
    purpose: '',
  });

  const selectedBot = session.bots.find(b => b.id === selectedBotId);

  const handleDeploy = () => {
    if (!newBotConfig.name || !newBotConfig.purpose) return;
    
    const newBot: NQLBot = {
      id: Math.random().toString(36).substr(2, 9),
      name: newBotConfig.name,
      role: newBotConfig.role as any,
      purpose: newBotConfig.purpose,
      task: 'INITIALIZING_NEURAL_LINK',
      state: BotState.IDLE,
      logs: [`[${new Date().toLocaleTimeString()}] BOT_DEPLOYMENT_INITIATED`, `[${new Date().toLocaleTimeString()}] SYNCING_WITH_OMNI_V5`],
      insights: [],
      level: 1,
      experience: 0,
      performance: 100
    };

    updateSession(prev => ({
      ...prev,
      bots: [newBot, ...prev.bots],
      memoryLogs: [...prev.memoryLogs, `[SYSTEM] Bot ${newBot.name} deployed to the Swarm.`]
    }));

    setIsDeploying(false);
    setNewBotConfig({ name: '', role: 'DataBot', purpose: '' });
    setSelectedBotId(newBot.id);
  };

  const handleToggleBot = (botId: string) => {
    updateSession(prev => ({
      ...prev,
      bots: prev.bots.map(b => 
        b.id === botId 
          ? { ...b, state: b.state === BotState.IDLE ? BotState.LEARNING : BotState.IDLE } 
          : b
      )
    }));
  };

  const handleDeleteBot = (botId: string) => {
    updateSession(prev => ({
      ...prev,
      bots: prev.bots.filter(b => b.id !== botId)
    }));
    if (selectedBotId === botId) setSelectedBotId(null);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-black text-white font-mono overflow-hidden">
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Swarm Roster */}
        <aside className="w-80 border-r border-white/10 flex flex-col bg-black/40 backdrop-blur-md">
          <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
            <h2 className="text-xs font-bold uppercase tracking-[0.3em] flex items-center gap-2">
              <Bot size={14} className="text-nql-cyan" /> Swarm_Roster
            </h2>
            <button 
              onClick={() => setIsDeploying(true)}
              className="p-1.5 border border-nql-cyan/40 text-nql-cyan hover:bg-nql-cyan hover:text-black transition-all"
            >
              <Plus size={14} />
            </button>
          </div>

          <SwarmHiveVisualizer bots={session.bots} />

          <div className="flex-1 overflow-y-auto scrollbar-nql">
            {session.bots.length === 0 ? (
               <div className="p-10 text-center opacity-30 flex flex-col items-center gap-4">
                  <Bot size={40} strokeWidth={1} />
                  <span className="text-[10px] uppercase tracking-widest">No Active Nodes</span>
               </div>
            ) : (
              session.bots.map(bot => (
                <div 
                  key={bot.id}
                  onClick={() => setSelectedBotId(bot.id)}
                  className={`p-4 border-b border-white/5 cursor-pointer transition-all hover:bg-white/5 relative group ${selectedBotId === bot.id ? 'bg-white/10 border-l-2 border-l-nql-cyan' : ''}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-tighter truncate w-32">{bot.name}</span>
                    <span className={`text-[7px] px-1.5 py-0.5 rounded-full border ${
                      bot.state === BotState.IDLE ? 'border-zinc-700 text-zinc-500' : 'border-nql-cyan text-nql-cyan animate-pulse'
                    }`}>
                      {bot.state}
                    </span>
                  </div>
                  <div className="text-[8px] text-nql-dim uppercase tracking-widest flex justify-between">
                    <span>{bot.role}</span>
                    <span className="group-hover:text-white transition-colors">LVL {bot.level}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-6 border-t border-white/10 bg-white/2 text-[9px] text-nql-dim flex flex-col gap-2">
             <div className="flex justify-between">
               <span>SWARM_MASTERY</span>
               <span className="text-white">{(session.swarmMastery).toFixed(1)}%</span>
             </div>
             <div className="h-0.5 bg-white/5 rounded-full overflow-hidden">
               <motion.div 
                 className="h-full bg-nql-cyan shadow-[0_0_10px_#00f2ff]" 
                 initial={{ width: 0 }}
                 animate={{ width: `${session.swarmMastery}%` }} 
               />
             </div>
          </div>
        </aside>

        {/* Right: Command Center */}
        <main className="flex-1 flex flex-col bg-black relative">
          <AnimatePresence mode="wait">
            {isDeploying ? (
              <motion.div 
                key="deploy"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute inset-0 flex items-center justify-center bg-black/90 z-20"
              >
                <div className="w-full max-w-md p-10 nql-panel border-nql-cyan/40 bg-black flex flex-col gap-6">
                   <h3 className="text-lg font-bold uppercase tracking-[0.3em] border-b border-white/10 pb-4">New_Node_Manifest</h3>
                   <div className="flex flex-col gap-4">
                      <div className="flex flex-col gap-2">
                         <span className="text-[8px] text-zinc-500 uppercase font-bold tracking-widest">Node_Identifier</span>
                         <input 
                           value={newBotConfig.name}
                           onChange={e => setNewBotConfig({...newBotConfig, name: e.target.value})}
                           className="bg-black border border-white/10 p-3 text-xs focus:border-nql-cyan outline-none"
                           placeholder="BOT_NAME_ALPHA..."
                         />
                      </div>
                      <div className="flex flex-col gap-2">
                         <span className="text-[8px] text-zinc-500 uppercase font-bold tracking-widest">Neural_Role</span>
                         <select 
                           value={newBotConfig.role}
                           onChange={e => setNewBotConfig({...newBotConfig, role: e.target.value as any})}
                           className="bg-black border border-white/10 p-3 text-xs focus:border-nql-cyan outline-none text-white uppercase"
                         >
                            {['DataBot', 'AlphaBot', 'ActionBot', 'MemoryBot', 'SovereignBot', 'SingularityBot', 'TranscendentBot', 'CausalBot', 'ExecBot'].map(r => (
                              <option key={r} value={r}>{r.toUpperCase()}</option>
                            ))}
                         </select>
                      </div>
                      <div className="flex flex-col gap-2">
                         <span className="text-[8px] text-zinc-500 uppercase font-bold tracking-widest">Core_Purpose</span>
                         <textarea 
                           value={newBotConfig.purpose}
                           onChange={e => setNewBotConfig({...newBotConfig, purpose: e.target.value})}
                           className="bg-black border border-white/10 p-3 text-xs focus:border-nql-cyan outline-none h-24 resize-none"
                           placeholder="DEFINE_MANIFEST_INTENT..."
                         />
                      </div>
                   </div>
                   <div className="flex gap-4">
                      <button 
                        onClick={() => setIsDeploying(false)}
                        className="flex-1 py-3 border border-white/10 text-[10px] font-bold uppercase hover:bg-white hover:text-black transition-all"
                      >
                         Abort
                      </button>
                      <button 
                        onClick={handleDeploy}
                        className="flex-1 py-3 bg-nql-cyan text-black text-[10px] font-bold uppercase hover:bg-white transition-all"
                      >
                         Deploy_Node
                      </button>
                   </div>
                </div>
              </motion.div>
            ) : selectedBot ? (
              <motion.div 
                key={selectedBot.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex-1 flex flex-col overflow-hidden"
              >
                {/* Bot Header */}
                <header className="p-8 border-b border-white/10 flex justify-between items-center">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 border border-nql-cyan/30 bg-nql-cyan/5 flex items-center justify-center rounded group overflow-hidden">
                       <Bot size={32} className={`transition-all duration-700 ${selectedBot.state !== BotState.IDLE ? 'text-nql-cyan animate-pulse scale-110' : 'text-zinc-700 opacity-40'}`} />
                    </div>
                    <div className="flex flex-col gap-1">
                      <h2 className="text-2xl font-bold uppercase tracking-widest">{selectedBot.name}</h2>
                      <div className="flex items-center gap-3">
                        <span className="text-[8px] px-2 py-0.5 bg-white/10 text-white font-bold rounded uppercase tracking-tighter">{selectedBot.role}</span>
                        <span className="text-[8px] text-nql-dim uppercase tracking-widest">{selectedBot.id}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button 
                      onClick={() => handleToggleBot(selectedBot.id)}
                      className={`p-3 border flex flex-col items-center gap-1 transition-all ${
                        selectedBot.state !== BotState.IDLE ? 'border-amber-500/50 bg-amber-500/10 text-amber-500' : 'border-nql-cyan/50 bg-nql-cyan/10 text-nql-cyan hovr:bg-nql-cyan hover:text-black'
                      }`}
                    >
                       {selectedBot.state !== BotState.IDLE ? <Pause size={18} /> : <Play size={18} />}
                       <span className="text-[7px] font-bold uppercase">{selectedBot.state !== BotState.IDLE ? 'Suspend' : 'Execute'}</span>
                    </button>
                    <button className="p-3 border border-white/10 hover:bg-white hover:text-black flex flex-col items-center gap-1 transition-all">
                       <RotateCcw size={18} />
                       <span className="text-[7px] font-bold uppercase">Reset</span>
                    </button>
                    <button 
                      onClick={() => handleDeleteBot(selectedBot.id)}
                      className="p-3 border border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white flex flex-col items-center gap-1 transition-all"
                    >
                       <Trash2 size={18} />
                       <span className="text-[7px] font-bold uppercase">Purge</span>
                    </button>
                  </div>
                </header>

                <div className="flex-1 overflow-hidden grid grid-cols-12">
                   {/* Bot Dashboard */}
                   <div className="col-span-8 p-8 overflow-y-auto scrollbar-nql flex flex-col gap-10">
                      <div className="grid grid-cols-3 gap-6">
                        <div className="nql-panel p-6 bg-white/2 border-white/5 flex flex-col gap-2">
                           <span className="text-[8px] text-nql-dim uppercase tracking-widest flex items-center gap-2"><Cpu size={10} /> Neural_Sync</span>
                           <span className="text-xl font-bold">{selectedBot.level * 14.5}%</span>
                           <div className="h-0.5 bg-white/5 rounded-full overflow-hidden">
                              <div className="h-full bg-white" style={{ width: `${selectedBot.level * 14.5}%` }} />
                           </div>
                        </div>
                        <div className="nql-panel p-6 bg-white/2 border-white/5 flex flex-col gap-2">
                           <span className="text-[8px] text-nql-dim uppercase tracking-widest flex items-center gap-2"><Activity size={10} /> Performance</span>
                           <span className="text-xl font-bold text-nql-cyan">{selectedBot.performance}%</span>
                           <div className="h-0.5 bg-white/5 rounded-full overflow-hidden">
                              <div className="h-full bg-nql-cyan" style={{ width: `${selectedBot.performance}%` }} />
                           </div>
                        </div>
                        <div className="nql-panel p-6 bg-white/2 border-white/5 flex flex-col gap-2">
                           <span className="text-[8px] text-nql-dim uppercase tracking-widest flex items-center gap-2"><Shield size={10} /> Security_Parity</span>
                           <span className="text-xl font-bold text-green-500">OPTIMAL</span>
                           <div className="h-0.5 bg-white/5 rounded-full overflow-hidden">
                              <div className="h-full bg-green-500" style={{ width: '100%' }} />
                           </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-4">
                         <h3 className="text-xs font-bold uppercase tracking-[0.2em] flex items-center gap-2"><Settings size={14} className="text-nql-dim" /> Operational_Directive</h3>
                         <div className="p-6 bg-white/2 border border-white/5 rounded text-xs leading-relaxed italic text-zinc-300">
                            "{selectedBot.purpose}"
                         </div>
                      </div>

                      <div className="flex flex-col gap-4">
                         <h3 className="text-xs font-bold uppercase tracking-[0.2em] flex items-center gap-2"><Activity size={14} className="text-nql-dim" /> Cognitive_Insights</h3>
                         <div className="grid grid-cols-1 gap-2">
                            {selectedBot.insights.length === 0 ? (
                               <div className="p-10 border border-white/5 border-dashed rounded text-center opacity-20 text-[10px] uppercase">
                                  Node is collecting market sentiment data...
                               </div>
                            ) : (
                               selectedBot.insights.map((insight, i) => (
                                 <div key={i} className="p-4 bg-white/2 border-l border-nql-cyan text-[10px] leading-relaxed">
                                    {insight}
                                 </div>
                               ))
                            )}
                         </div>
                      </div>
                   </div>

                   {/* Bot Logs */}
                   <div className="col-span-4 border-l border-white/10 bg-black/40 flex flex-col overflow-hidden">
                      <div className="p-6 border-b border-white/10 flex justify-between items-center">
                         <span className="text-[10px] font-bold uppercase tracking-[0.2em] flex items-center gap-2"><Terminal size={14} /> Execution_Logs</span>
                         <div className="flex gap-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-nql-cyan animate-pulse" />
                            <div className="w-1.5 h-1.5 rounded-full bg-nql-cyan opacity-40" />
                         </div>
                      </div>
                      <div className="flex-1 overflow-y-auto scrollbar-nql p-6 flex flex-col gap-3 font-mono text-[9px]">
                         {selectedBot.logs.map((log, i) => (
                           <div key={i} className={`flex gap-3 ${log.includes('INITIAT') ? 'text-nql-cyan' : 'text-zinc-500'}`}>
                              <span className="opacity-30">[{i}]</span>
                              <span className="flex-1">{log}</span>
                           </div>
                         ))}
                         <div className="h-4 animate-pulse bg-white/5" />
                      </div>
                      <div className="p-6 border-t border-white/10 bg-black flex gap-3">
                         <input 
                           className="flex-1 bg-transparent border-none outline-none text-[10px] text-white"
                           placeholder="Override_Directive..."
                         />
                         <ArrowRight size={14} className="text-nql-dim cursor-pointer hover:text-white" />
                      </div>
                   </div>
                </div>
              </motion.div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center opacity-30 gap-6">
                 <Monitor size={100} strokeWidth={0.5} />
                 <h2 className="text-4xl font-bold uppercase tracking-[0.5em]">Command_Void</h2>
                 <p className="text-[10px] uppercase tracking-widest text-center max-w-sm leading-loose">
                    Select a node from the roster to establish neural connection. <br/>
                    The swarm awaits your directive.
                 </p>
                 <button 
                  onClick={() => setIsDeploying(true)}
                  className="mt-6 px-12 py-4 border border-white text-[10px] font-bold uppercase hover:bg-white hover:text-black transition-all"
                 >
                    Initialize_Expansion
                 </button>
              </div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default BotHubPanel;
