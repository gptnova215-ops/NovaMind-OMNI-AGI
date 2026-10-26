/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Phone, 
  Mail, 
  MessageSquare, 
  Search, 
  Plus, 
  MoreVertical, 
  ArrowUpRight, 
  ArrowDownLeft,
  Settings,
  ShieldCheck,
  Send,
  User,
  Mic,
  Video
} from 'lucide-react';
import { NQLSession, CommsMessage } from '../types.ts';

const CommsPanel = ({ session, updateSession }: { 
  session: NQLSession, 
  updateSession?: (updater: (prev: NQLSession) => NQLSession) => void 
}) => {
  const [activeTab, setActiveTab] = React.useState<'EMAIL' | 'SMS' | 'PHONE'>('EMAIL');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [messageDraft, setMessageDraft] = React.useState('');

  const handleSendMessage = () => {
    if (!messageDraft.trim() || !updateSession) return;
    
    const newMessage: CommsMessage = {
      id: Math.random().toString(36).substr(2, 9),
      type: activeTab === 'PHONE' ? 'SMS' : activeTab as any,
      from: 'ME (Sovereign Node)',
      to: 'RECIPIENT_ALPHA',
      content: messageDraft,
      timestamp: new Date().toISOString(),
      read: true,
      sentiment: 0.95
    };

    updateSession(prev => ({
      ...prev,
      comms: [newMessage, ...prev.comms],
      memoryLogs: [...prev.memoryLogs, `[COMMS] Synthesized outgoing ${activeTab} burst.`]
    }));

    setMessageDraft('');
  };

  const handleNewMessage = () => {
    const to = prompt("Enter RECIPIENT_ID:");
    if (!to) return;
    const content = prompt("Enter MESSAGE_PATTERN:");
    if (!content) return;

    if (!updateSession) return;
    const newMessage: CommsMessage = {
      id: Math.random().toString(36).substr(2, 9),
      type: activeTab === 'PHONE' ? 'SMS' : activeTab as any,
      from: 'ME (Sovereign Node)',
      to,
      content,
      timestamp: new Date().toISOString(),
      read: true
    };

    updateSession(prev => ({
      ...prev,
      comms: [newMessage, ...prev.comms]
    }));
  };

  const handleMediaInit = (type: 'VIDEO' | 'AUDIO') => {
    alert(`${type}_LINK_ESTABLISHED\nInitializing secure biometric handshake...`);
  };

  const filteredMessages = session.comms.filter(m => {
    if (activeTab === 'EMAIL' && m.type !== 'EMAIL') return false;
    if (activeTab === 'SMS' && m.type !== 'SMS') return false;
    if (activeTab === 'PHONE' && m.type !== 'CALL' && m.type !== 'VOICEMAIL') return false;
    return m.from.toLowerCase().includes(searchQuery.toLowerCase()) || m.content.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="flex-1 flex flex-col h-full bg-black text-white font-mono overflow-hidden">
      {/* Comms Sidebar & Main Layout */}
      <div className="flex-1 flex overflow-hidden">
         {/* Left Navigation Rail */}
         <aside className="w-80 border-r border-white/10 flex flex-col bg-black">
            <div className="p-8 border-b border-white/10 flex flex-col gap-6">
               <div className="flex justify-between items-center">
                  <h1 className="text-xl font-bold tracking-widest uppercase">Communication</h1>
                  <Settings size={16} className="text-nql-dim hover:text-white cursor-pointer" />
               </div>
               <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-nql-dim" />
                  <input 
                    type="text" 
                    placeholder="SEARCH_NODE..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded px-10 py-2 text-[10px] uppercase outline-none focus:border-nql-cyan transition-all"
                  />
               </div>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-nql">
               <div className="flex flex-col">
                  {['EMAIL', 'SMS', 'PHONE'].map(tab => (
                    <button 
                      key={tab}
                      onClick={() => setActiveTab(tab as any)}
                      className={`flex items-center justify-between p-6 px-8 border-b border-white/5 text-[10px] font-bold uppercase tracking-[0.2em] transition-all relative ${activeTab === tab ? 'bg-white/5 text-nql-cyan' : 'text-nql-dim hover:bg-white/5'}`}
                    >
                       <div className="flex items-center gap-4">
                          {tab === 'EMAIL' && <Mail size={16} />}
                          {tab === 'SMS' && <MessageSquare size={16} />}
                          {tab === 'PHONE' && <Phone size={16} />}
                          {tab}
                       </div>
                       <AnimatePresence>
                          {activeTab === tab && (
                            <motion.div 
                              layoutId="activeTab"
                              className="absolute left-0 top-0 bottom-0 w-1 bg-nql-cyan"
                            />
                          )}
                       </AnimatePresence>
                       <span className="text-[8px] bg-white/10 px-1.5 py-0.5 rounded text-white/40">
                         {session.comms.filter(m => m.type === (tab === 'PHONE' ? 'CALL' : tab)).length}
                       </span>
                    </button>
                  ))}
               </div>

               <div className="p-8 flex flex-col gap-4">
                  <span className="text-[8px] text-nql-dim uppercase tracking-widest">Active_Integrations</span>
                  
                  <div className="p-3 bg-nql-violet/10 border border-nql-violet/20 rounded flex flex-col gap-1">
                     <span className="text-[7px] text-nql-violet uppercase font-bold tracking-widest">Primary_Line</span>
                     <span className="text-xs text-white font-mono">+1 (888) NOVA-AGI</span>
                  </div>
                  <div className="space-y-3">
                     {[
                       { label: 'Google_Voice', status: 'Linked', icon: Phone },
                       { label: 'Gmail_Cortex', status: 'Deep_Sync', icon: Mail },
                       { label: 'Twilio_Legacy', status: 'Legacy_Active', icon: MessageSquare }
                     ].map(int => (
                       <div key={int.label} className="p-3 bg-white/2 border border-white/5 flex items-center justify-between hover:border-white/10 transition-all cursor-pointer">
                          <div className="flex items-center gap-3">
                             <int.icon size={12} className="text-zinc-500" />
                             <span className="text-[9px] uppercase tracking-tighter">{int.label}</span>
                          </div>
                          <span className="text-[7px] text-green-500 font-bold uppercase">{int.status}</span>
                       </div>
                     ))}
                  </div>
               </div>
            </div>

            <div className="p-8 border-t border-white/10 bg-white/2">
               <button 
                 onClick={handleNewMessage}
                 className="w-full py-4 bg-white text-black text-[10px] font-bold uppercase tracking-[0.3em] flex items-center justify-center gap-2 hover:bg-nql-cyan transition-all"
               >
                  <Plus size={16} /> New_Message
               </button>
            </div>
         </aside>

         {/* Messenger Content */}
         <div className="flex-1 flex flex-col bg-black/40 relative">
            {activeTab === 'PHONE' && (
              <div className="absolute top-20 right-10 z-50 w-64 p-4 bg-black/80 border border-nql-violet/40 backdrop-blur-md shadow-[0_0_30px_rgba(139,92,246,0.1)] flex flex-col gap-4">
                <div className="flex items-center gap-2 text-nql-violet text-[10px] font-bold uppercase tracking-widest">
                  <Mic size={14} /> Voice_Cortex_Init
                </div>
                <div className="text-[9px] text-zinc-500 leading-relaxed italic">
                  "Directing incoming call patterns through the Singularity Node for real-time semantic decryption."
                </div>
                <div className="flex gap-2">
                  <div className="flex-1 h-1 bg-white/5 overflow-hidden">
                     <motion.div className="h-full bg-nql-violet" animate={{ x: ['-100%', '100%'] }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} />
                  </div>
                </div>
              </div>
            )}

            <header className="p-8 border-b border-white/10 flex justify-between items-center bg-black/20">
               <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-nql-cyan/10 border border-nql-cyan/20 flex items-center justify-center">
                     {activeTab === 'PHONE' ? <Phone size={20} className="text-nql-violet" /> : <ShieldCheck size={20} className="text-nql-cyan" />}
                  </div>
                  <div className="flex flex-col">
                     <span className="text-sm font-bold uppercase tracking-widest">{activeTab}_COMMAND_STREAM</span>
                     <span className="text-[8px] text-nql-dim uppercase">Status: {activeTab === 'PHONE' ? 'VOICE_DECRYPTION_ACTIVE' : 'SOVEREIGN_AUTO_REPLY_ACTIVE'}</span>
                  </div>
               </div>
               <div className="flex gap-4">
                   <button onClick={() => handleMediaInit('VIDEO')} className="p-2 text-nql-dim hover:text-white hover:bg-white/5 transition-all"><Video size={18} /></button>
                   <button onClick={() => handleMediaInit('AUDIO')} className="p-2 text-nql-dim hover:text-white hover:bg-white/5 transition-all"><Mic size={18} /></button>
                  <button className="p-2 text-nql-dim hover:text-white hover:bg-white/5 transition-all"><MoreVertical size={18} /></button>
               </div>
            </header>

            <div className="flex-1 overflow-y-auto p-12 space-y-8 scrollbar-nql">
               {filteredMessages.length > 0 ? (
                 filteredMessages.map(msg => (
                   <div key={msg.id} className="flex flex-col gap-3 group">
                      <div className="flex justify-between items-center">
                         <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded bg-white/5 flex items-center justify-center text-nql-cyan text-[10px] font-bold border border-white/10 ${msg.type === 'CALL' ? 'text-nql-violet border-nql-violet/20' : ''}`}>
                               {msg.type === 'CALL' ? <Phone size={14} className="text-nql-violet" /> : msg.from[0]}
                            </div>
                            <div className="flex flex-col">
                               <span className="text-[10px] font-bold text-white uppercase tracking-tight">{msg.from}</span>
                               <span className="text-[8px] text-zinc-500 uppercase">TO: {msg.to}</span>
                            </div>
                         </div>
                         <span className="text-[8px] text-nql-dim">{new Date(msg.timestamp).toLocaleTimeString()}</span>
                      </div>
                      <div className={`p-6 bg-white/[0.03] border border-white/10 rounded-r-2xl rounded-bl-2xl text-sm leading-relaxed text-white/80 font-sans relative group-hover:bg-white/[0.05] transition-all ${msg.type === 'CALL' ? 'border-l-4 border-l-nql-violet bg-nql-violet/5' : ''}`}>
                        <div className="flex flex-col gap-4">
                           <p>{msg.content}</p>
                           {msg.transcription && (
                             <div className="p-4 bg-black/40 border border-white/5 rounded text-[10px] font-mono text-zinc-400">
                                <div className="text-[7px] text-nql-violet font-bold uppercase mb-2 flex items-center gap-2"><Mic size={10} /> AI_Transcript_Decrypted</div>
                                {msg.transcription}
                             </div>
                           )}
                        </div>
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                           <button className="p-1.5 bg-black/40 border border-white/10 hover:bg-white hover:text-black transition-all">
                              <ArrowUpRight size={10} />
                           </button>
                        </div>
                      </div>
                   </div>
                 ))
               ) : (
                 <div className="h-full flex flex-col items-center justify-center gap-6 opacity-20">
                    <Mail size={80} strokeWidth={0.5} />
                    <span className="text-xl uppercase tracking-[0.5em] font-bold">Inbox_Void</span>
                    <p className="text-[10px] uppercase tracking-widest">Awaiting incoming data pulse...</p>
                 </div>
               )}
            </div>

            <div className="p-8 bg-black/40 border-t border-white/10">
               <div className="max-w-4xl mx-auto flex items-center gap-4">
                  <div className="flex-1 relative">
                     <input 
                       type="text" 
                       placeholder={`SEND_${activeTab}_BURST...`}
                       value={messageDraft}
                       onChange={e => setMessageDraft(e.target.value)}
                       onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                       className="w-full bg-white/5 border border-white/10 rounded-full px-8 py-4 text-xs font-mono outline-none focus:border-nql-cyan transition-all"
                     />
                     <button 
                       onClick={handleSendMessage}
                       className="absolute right-4 top-1/2 -translate-y-1/2 text-nql-cyan hover:scale-110 transition-transform"
                     >
                        <Send size={18} />
                     </button>
                  </div>
                  <button className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center hover:bg-white hover:text-black transition-all">
                     <Plus size={20} />
                  </button>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default CommsPanel;
