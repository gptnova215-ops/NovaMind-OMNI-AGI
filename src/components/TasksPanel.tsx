/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  AlertCircle, 
  Plus, 
  Trash2, 
  Filter,
  Zap,
  Bot,
  Brain,
  Activity,
  Calendar,
  Layers,
  ChevronRight
} from 'lucide-react';
import { NQLSession, DailyTask } from '../types.ts';

const TasksPanel = ({ session, updateSession }: { 
  session: NQLSession, 
  updateSession: (updater: (prev: NQLSession) => NQLSession) => void 
}) => {
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'COMPLETED'>('ALL');
  const [isAdding, setIsAdding] = useState(false);
  const [newTask, setNewTask] = useState<Partial<DailyTask>>({ title: '', priority: 'MEDIUM', category: 'General' });

  const filteredTasks = useMemo(() => {
    return session.tasks.filter(t => {
      if (filter === 'PENDING') return !t.completed;
      if (filter === 'COMPLETED') return t.completed;
      return true;
    });
  }, [session.tasks, filter]);

  const progress = useMemo(() => {
    if (session.tasks.length === 0) return 0;
    return (session.tasks.filter(t => t.completed).length / session.tasks.length) * 100;
  }, [session.tasks]);

  const handleAddTask = () => {
    if (!newTask.title) return;
    const task: DailyTask = {
      id: Math.random().toString(36).substr(2, 9),
      title: newTask.title,
      completed: false,
      priority: newTask.priority || 'MEDIUM',
      category: newTask.category || 'General'
    };

    updateSession(prev => ({
      ...prev,
      tasks: [...prev.tasks, task],
      memoryLogs: [...prev.memoryLogs, `[TASK] New directive registered: ${task.title}`].slice(-100)
    }));
    setIsAdding(false);
    setNewTask({ title: '', priority: 'MEDIUM', category: 'General' });
  };

  const toggleTask = (id: string) => {
    updateSession(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t),
      memoryLogs: [...prev.memoryLogs, `[TASK] Handshake status toggled for task ${id}.`].slice(-100)
    }));
  };

  const deleteTask = (id: string) => {
    updateSession(prev => ({
      ...prev,
      tasks: prev.tasks.filter(t => t.id !== id)
    }));
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-black text-white font-mono overflow-hidden relative">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
      
      {/* Header */}
      <div className="p-10 border-b border-white/10 flex justify-between items-center bg-black/60 backdrop-blur-xl relative z-10">
         <div className="flex flex-col gap-2">
            <h1 className="text-4xl font-bold tracking-[0.5em] uppercase">Directive_Core</h1>
            <div className="flex items-center gap-4 text-nql-dim text-[10px] uppercase tracking-widest">
               <span className="flex items-center gap-1"><div className="w-1 h-1 bg-nql-cyan rounded-full animate-pulse" /> Autonomous_Scheduling</span>
               <span className="opacity-40">|</span>
               <span>Goal_Resonance: {progress.toFixed(1)}%</span>
            </div>
         </div>
         <div className="flex items-center gap-8">
            <div className="flex flex-col items-end">
               <span className="text-[8px] text-nql-dim uppercase">Completed_Directives</span>
               <span className="text-2xl font-bold text-nql-cyan tabular-nums">{session.tasks.filter(t => t.completed).length} / {session.tasks.length}</span>
            </div>
            <button 
              onClick={() => setIsAdding(true)}
              className="w-12 h-12 bg-white text-black flex items-center justify-center hover:bg-nql-cyan transition-all shadow-[0_0_30px_rgba(255,255,255,0.1)]"
            >
               <Plus size={24} />
            </button>
         </div>
      </div>

      <div className="flex-1 flex overflow-hidden relative z-10">
         {/* Sidebar: Stats & Progress */}
         <aside className="w-80 border-r border-white/10 p-10 flex flex-col gap-10 bg-black/40 overflow-y-auto scrollbar-nql">
            <div className="flex flex-col gap-4">
               <label className="text-[10px] text-nql-dim uppercase tracking-[0.2em] font-bold">Focus_Intensity</label>
               <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-nql-cyan shadow-[0_0_15px_#00f2ff]"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                  />
               </div>
            </div>

            <div className="flex flex-col gap-6">
               <label className="text-[10px] text-nql-dim uppercase tracking-[0.2em] font-bold">Priority_Distribution</label>
               <div className="space-y-4">
                  {[
                    { label: 'CRITICAL', color: 'bg-red-500', count: session.tasks.filter(t => t.priority === 'HIGH').length },
                    { label: 'STANDARD', color: 'bg-white', count: session.tasks.filter(t => t.priority === 'MEDIUM').length },
                    { label: 'AUXILIARY', color: 'bg-nql-dim', count: session.tasks.filter(t => t.priority === 'LOW').length }
                  ].map(p => (
                    <div key={p.label} className="flex flex-col gap-2">
                       <div className="flex justify-between text-[8px] uppercase tracking-widest">
                          <span className="text-white/40">{p.label}</span>
                          <span className="text-white">{p.count}</span>
                       </div>
                       <div className="h-1 bg-white/5 overflow-hidden">
                          <div className={`h-full ${p.color} opacity-40`} style={{ width: `${(p.count / (session.tasks.length || 1)) * 100}%` }} />
                       </div>
                    </div>
                  ))}
               </div>
            </div>

            <div className="mt-auto p-6 bg-nql-violet/5 border border-nql-violet/20 flex flex-col gap-4">
               <h3 className="text-[10px] text-nql-violet font-bold uppercase tracking-widest flex items-center gap-2">
                  <Bot size={14} /> AI_Task_Agent
               </h3>
               <p className="text-[10px] text-white/60 leading-relaxed italic">"NovaMind OMNI has identified a creative spike in your typing cadence. Suggested: Initialize Studio generation task."</p>
               <button className="text-[8px] text-nql-violet font-bold uppercase border border-nql-violet/30 py-2 hover:bg-nql-violet hover:text-white transition-all">Enable_Autonomy</button>
            </div>
         </aside>

         {/* Main Task Feed */}
         <main className="flex-1 flex flex-col overflow-hidden bg-black/20">
            <div className="p-8 px-10 border-b border-white/5 flex gap-4">
               {['ALL', 'PENDING', 'COMPLETED'].map(f => (
                 <button 
                   key={f}
                   onClick={() => setFilter(f as any)}
                   className={`px-4 py-1 text-[10px] font-bold tracking-widest border transition-all ${filter === f ? 'bg-white text-black border-white' : 'border-white/10 text-nql-dim hover:text-white'}`}
                 >
                    {f}
                 </button>
               ))}
            </div>

            <div className="flex-1 overflow-y-auto p-10 scrollbar-nql">
               <div className="max-w-4xl mx-auto w-full flex flex-col gap-4">
                  <AnimatePresence mode="popLayout">
                    {filteredTasks.map(task => (
                      <motion.div 
                        key={task.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className={`group flex items-center justify-between p-6 border bg-black/40 hover:bg-white/[0.02] transition-all relative overflow-hidden ${task.completed ? 'border-white/5' : 'border-white/10'}`}
                      >
                         <div className="absolute top-0 left-0 w-1 h-full bg-white opacity-0 group-hover:opacity-40 transition-opacity" />
                         
                         <div className="flex items-center gap-6">
                            <button 
                              onClick={() => toggleTask(task.id)}
                              className={`w-6 h-6 border flex items-center justify-center transition-all ${task.completed ? 'bg-nql-cyan border-nql-cyan text-black' : 'border-white/20 group-hover:border-white text-transparent'}`}
                            >
                               <CheckCircle2 size={16} />
                            </button>
                            <div className="flex flex-col gap-1">
                               <h3 className={`text-lg font-bold uppercase tracking-tight transition-all ${task.completed ? 'text-zinc-600 line-through' : 'text-white'}`}>{task.title}</h3>
                               <div className="flex items-center gap-3 text-[8px] uppercase tracking-widest text-zinc-500">
                                  <span className={`px-2 py-0.5 border ${task.priority === 'HIGH' ? 'border-red-500/40 text-red-500' : 'border-white/10'}`}>{task.priority}</span>
                                  <span>{task.category}</span>
                               </div>
                            </div>
                         </div>

                         <div className="flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="p-2 text-zinc-600 hover:text-white transition-colors"><Layers size={16} /></button>
                            <button onClick={() => deleteTask(task.id)} className="p-2 text-zinc-600 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                         </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  
                  {filteredTasks.length === 0 && (
                    <div className="py-20 flex flex-col items-center justify-center gap-4 opacity-20 border-2 border-dashed border-white/5">
                       <Calendar size={48} />
                       <span className="text-[10px] uppercase tracking-widest">No active directives found</span>
                    </div>
                  )}
               </div>
            </div>
         </main>
      </div>

      {/* Task Creation Modal */}
      <AnimatePresence>
         {isAdding && (
           <div className="fixed inset-0 z-[100] flex items-center justify-center p-10">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsAdding(false)}
                className="absolute inset-0 bg-black/90 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="w-full max-w-xl bg-black border border-white/10 p-12 flex flex-col gap-8 relative z-10"
              >
                 <div className="flex flex-col gap-2">
                    <h2 className="text-3xl font-bold uppercase tracking-[0.3em]">Commit_Directive</h2>
                    <span className="text-[9px] text-nql-dim uppercase tracking-widest">Integrating new goals into the Sovereign Architecture</span>
                 </div>

                 <div className="space-y-6">
                    <div className="flex flex-col gap-2">
                       <label className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest pl-2">Objective_Title</label>
                       <input 
                         autoFocus
                         value={newTask.title}
                         onChange={e => setNewTask({...newTask, title: e.target.value})}
                         onKeyDown={e => e.key === 'Enter' && handleAddTask()}
                         className="nql-input" 
                         placeholder="What needs to be done?"
                       />
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                       <div className="flex flex-col gap-2">
                          <label className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest pl-2">Priority_Level</label>
                          <select 
                            value={newTask.priority}
                            onChange={e => setNewTask({...newTask, priority: e.target.value as any})}
                            className="nql-input appearance-none bg-black"
                          >
                             <option value="LOW">LOW</option>
                             <option value="MEDIUM">MEDIUM</option>
                             <option value="HIGH">HIGH_ALPHA</option>
                          </select>
                       </div>
                       <div className="flex flex-col gap-2">
                          <label className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest pl-2">Directive_Category</label>
                          <input 
                            value={newTask.category}
                            onChange={e => setNewTask({...newTask, category: e.target.value})}
                            className="nql-input" 
                            placeholder="System/Finance/Social"
                          />
                       </div>
                    </div>
                 </div>

                 <button 
                   onClick={handleAddTask}
                   className="w-full py-4 bg-white text-black text-[10px] font-bold uppercase tracking-[0.4em] hover:bg-nql-cyan transition-all mt-4"
                 >
                    Inject into Ledger
                 </button>
              </motion.div>
           </div>
         )}
      </AnimatePresence>
    </div>
  );
};

export default TasksPanel;
