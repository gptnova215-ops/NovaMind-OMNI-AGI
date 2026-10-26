/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Database, 
  ShieldCheck, 
  FileText, 
  Image as ImageIcon, 
  FileCode, 
  File, 
  Search, 
  Download, 
  Trash2, 
  Eye, 
  Activity, 
  MemoryStick as MemoryIcon,
  Plus,
  Box,
  Brain,
  History,
  Archive
} from 'lucide-react';
import { NQLSession, DataEntry, MemoryNode } from '../types.ts';

const NexusVaultPanel = ({ session }: { session: NQLSession }) => {
  const [activeLayer, setActiveLayer] = useState<'DATA' | 'MEMORY'>('DATA');
  const [search, setSearch] = useState('');

  const filteredData = (session.dataVault || []).filter(item => 
    item.title.toLowerCase().includes(search.toLowerCase()) || 
    item.content?.toLowerCase().includes(search.toLowerCase())
  );

  const filteredMemory = (session.memoryNodes || []).filter(node => 
    node.content.toLowerCase().includes(search.toLowerCase()) || 
    node.category.toLowerCase().includes(search.toLowerCase())
  );

  const getFileIcon = (type: DataEntry['type']) => {
    switch (type) {
      case 'IMAGE': return <ImageIcon size={18} />;
      case 'PDF': return <FileText size={18} />;
      case 'CODE': return <FileCode size={18} />;
      case 'TEXT': return <FileText size={18} />;
      default: return <File size={18} />;
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-black text-white font-mono overflow-hidden">
      {/* Top Banner */}
      <div className="p-10 border-b border-white/10 shrink-0 bg-black/20 flex justify-between items-start">
         <div className="flex flex-col gap-2">
            <h1 className="text-4xl font-bold tracking-[0.3em] uppercase">Nexus_Vault</h1>
            <div className="flex items-center gap-6 mt-4">
               <button 
                 onClick={() => setActiveLayer('DATA')}
                 className={`flex items-center gap-3 px-6 py-2 border-b-2 transition-all ${activeLayer === 'DATA' ? 'text-nql-cyan border-nql-cyan' : 'text-nql-dim border-transparent hover:text-white'}`}
               >
                 <Box size={14} /> <span className="text-[10px] uppercase font-bold tracking-widest">Part_01: Asset_Vault</span>
               </button>
               <button 
                 onClick={() => setActiveLayer('MEMORY')}
                 className={`flex items-center gap-3 px-6 py-2 border-b-2 transition-all ${activeLayer === 'MEMORY' ? 'text-nql-violet border-nql-violet' : 'text-nql-dim border-transparent hover:text-white'}`}
               >
                 <Brain size={14} /> <span className="text-[10px] uppercase font-bold tracking-widest">Part_02: Subconscious</span>
               </button>
            </div>
         </div>
         <div className="flex gap-4">
            <div className="p-4 bg-white/[0.02] border border-white/5 flex flex-col items-center">
               <span className="text-[8px] text-zinc-500 uppercase">Entropy</span>
               <span className="text-xs font-bold text-nql-cyan">{session.telemetry.entropy.toFixed(3)}</span>
            </div>
            <div className="p-4 bg-white/[0.02] border border-white/5 flex flex-col items-center">
               <span className="text-[8px] text-zinc-500 uppercase">Capacity</span>
               <span className="text-xs font-bold">{(session.memoryNodes.length + session.dataVault.length)} / 10K</span>
            </div>
         </div>
      </div>

      {/* Global Search */}
      <div className="px-10 py-6 border-b border-white/10 flex gap-4 shrink-0">
         <div className="flex-1 relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-nql-dim" />
            <input 
              type="text" 
              placeholder="Query deep storage layer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded px-10 py-3 text-xs uppercase outline-none focus:border-nql-cyan transition-all"
            />
         </div>
         {activeLayer === 'DATA' && (
           <button className="px-8 bg-white text-black text-[10px] font-bold uppercase tracking-widest hover:bg-nql-cyan transition-all">Upload_Blob</button>
         )}
      </div>

      <div className="flex-1 overflow-y-auto p-10 scrollbar-nql">
         <div className="max-w-7xl mx-auto w-full">
            <AnimatePresence mode="wait">
              {activeLayer === 'DATA' ? (
                <motion.div 
                  key="data-layer"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                >
                   {filteredData.map(item => (
                     <div key={item.id} className="group nql-panel p-5 border-white/10 hover:border-nql-cyan/40 bg-white/[0.02] flex flex-col gap-4 relative">
                        <div className="flex justify-between items-start">
                           <div className="p-3 bg-white/5 border border-white/10 text-nql-cyan group-hover:text-white transition-colors">
                              {getFileIcon(item.type)}
                           </div>
                           <button className="text-zinc-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={14} /></button>
                        </div>
                        <div className="flex flex-col gap-1">
                           <span className="text-xs font-bold text-white uppercase truncate">{item.title}</span>
                           <span className="text-[8px] text-zinc-500 uppercase underline decoration-nql-cyan/40">{item.source}_STREAM</span>
                        </div>
                        {item.type === 'IMAGE' ? (
                          <div className="aspect-square bg-black border border-white/5 overflow-hidden">
                             <img src={item.url} alt={item.title} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000" />
                          </div>
                        ) : (
                          <div className="p-3 bg-black/40 border border-white/5 text-[9px] text-zinc-400 line-clamp-3 italic opacity-60">
                             {item.content || 'Binary source...'}
                          </div>
                        )}
                        <div className="flex justify-between items-center mt-2 opacity-40 text-[7px] group-hover:opacity-100 transition-opacity uppercase font-bold">
                           <span>{item.type}</span>
                           <span>{new Date(item.timestamp).toLocaleDateString()}</span>
                        </div>
                     </div>
                   ))}
                   {filteredData.length === 0 && (
                     <div className="col-span-full py-40 border-2 border-dashed border-white/5 flex flex-col items-center justify-center opacity-20 gap-4">
                        <Archive size={48} />
                        <span className="text-xs tracking-widest uppercase">Asset Storage Null</span>
                     </div>
                   )}
                </motion.div>
              ) : (
                <motion.div 
                  key="memory-layer"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex flex-col gap-4"
                >
                   {filteredMemory.map(node => (
                     <div key={node.id} className="p-6 bg-white/[0.02] border border-nql-violet/20 hover:border-nql-violet/60 transition-all group flex flex-col gap-3 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-nql-violet opacity-20 group-hover:opacity-100 transition-opacity" />
                        <div className="flex justify-between items-center text-[8px] uppercase font-bold">
                           <span className="text-nql-violet flex items-center gap-2"><History size={10} /> Neural_Commit: {node.category}</span>
                           <span className="text-zinc-600">{new Date(node.timestamp).toLocaleString()}</span>
                        </div>
                        <p className="text-[13px] text-white/90 leading-relaxed italic pr-12 group-hover:text-white transition-colors capitalize">
                          "{node.content}"
                        </p>
                        <div className="flex items-center gap-4 opacity-40 group-hover:opacity-100 transition-opacity">
                           <div className="h-[1px] flex-1 bg-white/5" />
                           <span className="text-[7px] text-zinc-500 uppercase tracking-widest">Memory_Node_Ref: {node.id.substring(0, 8)}</span>
                        </div>
                     </div>
                   ))}
                   {filteredMemory.length === 0 && (
                     <div className="py-40 border-2 border-dashed border-white/5 flex flex-col items-center justify-center opacity-20 gap-4">
                        <Brain size={48} />
                        <span className="text-xs tracking-widest uppercase">No Subconscious Records Found</span>
                     </div>
                   )}
                </motion.div>
              )}
            </AnimatePresence>
         </div>
      </div>
    </div>
  );
};

export default NexusVaultPanel;
