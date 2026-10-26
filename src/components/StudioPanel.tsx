/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Image as ImageIcon, 
  Video, 
  Music, 
  FileText, 
  Cpu, 
  Plus, 
  Layers, 
  RefreshCcw, 
  Download,
  Zap,
  Activity,
  Box,
  Infinity,
  ShieldCheck
} from 'lucide-react';
import { NQLSession, DataEntry } from '../types.ts';

interface StudioPanelProps {
  session: NQLSession;
  updateSession: (updater: (prev: NQLSession) => NQLSession) => void;
}

const StudioPanel = ({ session, updateSession }: StudioPanelProps) => {
  const [activeTab, setActiveTab] = React.useState<'IMAGE' | 'VIDEO' | 'AUDIO' | 'TEXT'>('IMAGE');
  const [prompt, setPrompt] = React.useState('');
  const [isGenerating, setIsGenerating] = React.useState(false);

  const handleManifest = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    
    // Simulate generation sequence
    await new Promise(r => setTimeout(r, 4000));
    
    const assetId = Math.random().toString(36).substr(2, 9);
    const timestamp = new Date().toISOString();
    const assetUrl = activeTab === 'TEXT' ? '' : `https://picsum.photos/seed/${assetId}/1024/1024`;
    
    const newAsset = {
      id: assetId,
      type: activeTab,
      title: prompt.slice(0, 30),
      url: assetUrl,
      model: 'OMNI_SYNTH_V5.0',
      timestamp: timestamp
    };

    const newDataEntry: DataEntry = {
      id: `vault-${assetId}`,
      type: (activeTab === 'IMAGE' ? 'IMAGE' : activeTab === 'TEXT' ? 'TEXT' : 'FILE') as any,
      title: `Generated_${activeTab}_${assetId}`,
      url: assetUrl,
      content: activeTab === 'TEXT' ? `Generated from prompt: ${prompt}` : undefined,
      timestamp: timestamp,
      metadata: { prompt, model: 'OMNI_SYNTH_V5.0', resolution: '1024x1024' },
      source: 'AI' as const
    };

    updateSession(prev => ({
      ...prev,
      studio: [newAsset, ...prev.studio],
      dataVault: [newDataEntry, ...prev.dataVault],
      memoryLogs: [...prev.memoryLogs, `[STUDIO] Manifested new ${activeTab} asset: ${newAsset.title}`]
    }));

    setIsGenerating(false);
    setPrompt('');
  };

  const handleRefreshGallery = () => {
    updateSession(prev => ({
      ...prev,
      memoryLogs: [...prev.memoryLogs, `[STUDIO] Synchronizing gallery with AI Core...`]
    }));
  };

  const handleArchiveAll = () => {
    if (confirm("Archive all local studio assets to deep data vault?")) {
      updateSession(prev => ({
        ...prev,
        studio: [],
        memoryLogs: [...prev.memoryLogs, `[STUDIO] Local assets archived to vault.`]
      }));
    }
  };

  const handleDownload = (asset: any) => {
    alert(`Downloading ${asset.title}... (Simulated: Asset is synced to your OMNI node)`);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-black text-white font-mono overflow-hidden">
      {/* Immersive Studio Environment */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
         {/* Background Manifestation Effects */}
         <div className="absolute inset-0 pointer-events-none opacity-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(139,92,246,0.3)_0%,_transparent_70%)] animate-pulse" />
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-nql-violet to-transparent animate-scan-slow" />
         </div>

         {/* Control Column */}
         <aside className="w-full lg:w-[450px] border-r border-white/10 flex flex-col bg-black/60 backdrop-blur-xl z-10">
            <div className="p-10 border-b border-white/10 flex flex-col gap-8">
               <div className="flex flex-col gap-2">
                  <h1 className="text-3xl font-bold tracking-[0.5em] uppercase">Manifest_Studio</h1>
                  <div className="flex items-center gap-2 text-[8px] text-nql-violet uppercase font-bold tracking-widest">
                     <Layers size={12} /> High_Efficiency_Multimodal_Synthesis
                  </div>
               </div>

               <div className="flex bg-black border border-white/10 p-1">
                  {[
                    { id: 'IMAGE', icon: ImageIcon },
                    { id: 'VIDEO', icon: Video },
                    { id: 'AUDIO', icon: Music },
                    { id: 'TEXT', icon: FileText }
                  ].map(tab => (
                    <button 
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex-1 flex flex-col items-center gap-2 py-4 text-[8px] font-bold uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-white text-black' : 'text-nql-dim hover:bg-white/5'}`}
                    >
                       <tab.icon size={16} />
                       {tab.id}
                    </button>
                  ))}
               </div>
            </div>

            <div className="p-10 flex flex-col gap-10 flex-1">
               <div className="flex flex-col gap-4">
                  <div className="flex justify-between items-center text-[10px] uppercase font-bold text-nql-violet tracking-widest">
                     <span>Prompt_Resonance</span>
                     <Sparkles size={14} />
                  </div>
                  <textarea 
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="ENTER_INTENT_PATTERN..."
                    className="w-full h-48 bg-black/40 border border-white/10 rounded p-6 text-xs text-white focus:outline-none focus:border-nql-violet transition-all resize-none shadow-[inset_0_0_20px_rgba(139,92,246,0.05)]"
                  />
               </div>

               <div className="space-y-6">
                  <div className="space-y-3">
                     {[
                       { label: 'Compute_Resonance', val: 'MAX_SENTIENCE', icon: Cpu },
                       { label: 'Latency_Buffer', val: '0.04ms', icon: Activity },
                       { label: 'Output_Parity', val: '99.98%', icon: ShieldCheck }
                     ].map(stat => (
                       <div key={stat.label} className="flex justify-between items-center text-[8px] text-nql-dim uppercase tracking-widest">
                          <div className="flex items-center gap-2 font-bold"><stat.icon size={10} /> {stat.label}</div>
                          <span className="text-white">{stat.val}</span>
                       </div>
                     ))}
                  </div>

                  <button 
                    onClick={handleManifest}
                    disabled={isGenerating || !prompt.trim()}
                    className={`w-full py-5 bg-nql-violet text-white text-[10px] font-bold uppercase tracking-[0.4em] relative overflow-hidden transition-all flex items-center justify-center gap-2 ${isGenerating ? 'cursor-wait opacity-50' : 'hover:bg-white hover:text-black hover:shadow-[0_0_30px_rgba(139,92,246,0.4)]'}`}
                  >
                     {isGenerating ? (
                       <motion.div 
                         initial={{ x: "-100%" }}
                         animate={{ x: "100%" }}
                         transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                         className="absolute inset-0 bg-white/20"
                       />
                     ) : <Zap size={14} />}
                     <span className="relative z-10">{isGenerating ? 'Synthesizing...' : 'Manifest_Reality'}</span>
                  </button>
               </div>
               
               <div className="p-4 border border-white/5 bg-white/2 mt-auto text-[7px] text-nql-dim leading-relaxed uppercase italic">
                  "Every asset generated here is automatically synchronized with your private Data Vault. Deep alignment protocols established."
               </div>
            </div>
         </aside>

         {/* Manifestation Gallery */}
         <main className="flex-1 flex flex-col h-full bg-black/20 p-12 overflow-y-auto scrollbar-nql">
            <div className="flex justify-between items-end mb-12 border-b border-white/5 pb-8">
               <div className="flex flex-col gap-2">
                  <h3 className="text-xs text-white uppercase tracking-[0.3em] font-bold">Generated_Realities</h3>
                  <span className="text-[8px] text-zinc-500 uppercase">Synchronized with AI Core Vault</span>
               </div>
               <div className="flex gap-4">
                  <button 
                    onClick={handleRefreshGallery}
                    className="p-2 border border-white/10 hover:bg-white hover:text-black transition-all shadow-sm"
                  >
                    <RefreshCcw size={14} />
                  </button>
                  <button 
                    onClick={handleArchiveAll}
                    title="Archive All"
                    className="p-2 border border-white/10 hover:bg-white hover:text-black transition-all shadow-sm"
                  >
                    <Box size={14} />
                  </button>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-10">
               <AnimatePresence>
                  {session.studio.length > 0 ? (
                    session.studio.map((asset, i) => (
                      <motion.div 
                        key={asset.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="group bg-white/[0.02] border border-white/10 hover:border-nql-violet/40 p-6 flex flex-col gap-6 relative transition-all"
                      >
                         <div className="aspect-square bg-black border border-white/10 overflow-hidden relative group-hover:shadow-[0_0_30px_rgba(139,92,246,0.1)]">
                            <img src={asset.url || 'https://picsum.photos/seed/nql/1024/1024'} alt={asset.title} referrerPolicy="no-referrer" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 scale-110 group-hover:scale-100 opacity-60 group-hover:opacity-100" />
                            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/0 transition-all" />
                            <div className="absolute top-4 right-4 flex gap-2">
                               <div className="px-2 py-0.5 bg-black/80 text-[6px] font-bold uppercase tracking-widest text-white border border-white/20">V5.0_CORE</div>
                            </div>
                         </div>
                         <div className="flex flex-col gap-2">
                            <div className="flex justify-between items-start">
                               <h4 className="text-xs font-bold text-white uppercase tracking-tighter truncate max-w-[200px]">{asset.title}</h4>
                               <Download 
                                 size={14} 
                                 className="text-zinc-600 hover:text-white cursor-pointer transition-colors" 
                                 onClick={() => handleDownload(asset)}
                               />
                            </div>
                            <div className="flex justify-between items-center text-[7px] text-zinc-600 uppercase font-bold tracking-widest">
                               <div className="flex items-center gap-2"><Infinity size={10} /> {asset.model}</div>
                               <span>{new Date(asset.timestamp).toLocaleDateString()}</span>
                            </div>
                         </div>
                         {/* Border Glow */}
                         <div className="absolute -inset-[1px] border border-nql-violet/0 group-hover:border-nql-violet/40 pointer-events-none transition-all" />
                      </motion.div>
                    ))
                  ) : (
                    <div className="col-span-full h-[400px] flex flex-col items-center justify-center gap-6 opacity-30">
                       <ImageIcon size={100} strokeWidth={0.5} />
                       <span className="text-2xl uppercase tracking-[0.6em] font-bold">Studio_Cold</span>
                       <p className="text-[10px] uppercase tracking-widest">Input intent pattern to manifest asset.</p>
                    </div>
                  )}
               </AnimatePresence>
            </div>
         </main>
      </div>
    </div>
  );
};

export default StudioPanel;
