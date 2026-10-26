/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Terminal, 
  Activity, 
  Globe, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ExternalLink,
  Bot,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  Key,
  Shield
} from 'lucide-react';
import { NQLSession, BusinessEntity, VaultEntry } from '../types.ts';

const BizSecPanel = ({ session, updateSession }: { 
  session: NQLSession, 
  updateSession: (updater: (prev: NQLSession) => NQLSession) => void 
}) => {
  const [activeTab, setActiveTab] = useState<'BIZ' | 'SEC'>('BIZ');
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const [isAddingIdentity, setIsAddingIdentity] = useState(false);
  const [newIdentity, setNewIdentity] = useState<Partial<VaultEntry>>({ platform: '', siteUrl: '', email: '', password: '' });

  const togglePassword = (id: string) => {
    setShowPasswords(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleRegisterBusiness = () => {
    const name = prompt("Enter Business/Store Name:");
    if (!name) return;
    const url = prompt("Enter URL (optional):") || "";
    const platform = prompt("Enter Platform (SHOPIFY, AMAZON, etc):", "SHOPIFY") as any;

    const newBiz: BusinessEntity = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      url,
      platform: platform.toUpperCase(),
      email: session.userProfile.email,
      password: "ENCRYPTED_DYNAMIC_KEY",
      status: 'ACTIVE',
      logs: [{ id: '1', timestamp: new Date().toISOString(), message: 'Entity initialized.', type: 'INFO' }]
    };

    updateSession(prev => ({
      ...prev,
      business: [...prev.business, newBiz],
      memoryLogs: [...prev.memoryLogs, `[BUSINESS] Registered new asset: ${name}`]
    }));
  };

  const handleSaveIdentity = () => {
     if (!newIdentity.platform) return;
     const id = Math.random().toString(36).substring(7);
     // Note: In real app this would go to Firebase, here we sync to local session state
     updateSession(prev => ({
       ...prev,
       vault: [...prev.vault, { ...newIdentity, id, createdAt: new Date().toISOString() } as VaultEntry],
       memoryLogs: [...prev.memoryLogs, `[SECURITY] Identity node ${newIdentity.platform} committed.`].slice(-100)
     }));
     setIsAddingIdentity(false);
     setNewIdentity({ platform: '', siteUrl: '', email: '', password: '' });
  };

  const handleDeleteIdentity = (id: string) => {
    updateSession(prev => ({
      ...prev,
      vault: prev.vault.filter(v => v.id !== id)
    }));
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-black text-white font-mono overflow-hidden">
      {/* Top Banner */}
      <div className="p-10 border-b border-white/10 flex justify-between items-center bg-black/20 shrink-0">
         <div className="flex flex-col gap-2">
            <h1 className="text-4xl font-bold tracking-[0.3em] uppercase">Sovereign_Admin</h1>
            <div className="flex items-center gap-4">
               <button 
                 onClick={() => setActiveTab('BIZ')}
                 className={`text-[10px] uppercase font-bold tracking-widest px-4 py-1 border-b-2 transition-all ${activeTab === 'BIZ' ? 'text-white border-nql-cyan' : 'text-nql-dim border-transparent hover:text-white'}`}
               >
                 Business_Ops
               </button>
               <button 
                 onClick={() => setActiveTab('SEC')}
                 className={`text-[10px] uppercase font-bold tracking-widest px-4 py-1 border-b-2 transition-all ${activeTab === 'SEC' ? 'text-white border-nql-gold' : 'text-nql-dim border-transparent hover:text-white'}`}
               >
                 Security_Vault
               </button>
            </div>
         </div>
         <div className="flex items-center gap-4">
            <div className="flex flex-col items-end">
               <span className="text-[8px] text-nql-dim uppercase">Security_Protocol</span>
               <span className="text-xs text-nql-gold font-bold">OMEGA_SHIELD_ACTIVE</span>
            </div>
            <Shield size={32} className="text-nql-gold opacity-40" />
         </div>
      </div>

      <div className="flex-1 overflow-y-auto p-10 scrollbar-nql">
        <div className="max-w-6xl mx-auto w-full">
          {activeTab === 'BIZ' && (
            <div className="flex flex-col gap-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
               <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold tracking-tight uppercase flex items-center gap-2"><Globe size={18} className="text-nql-cyan" /> Merchant_Infrastructure</h2>
                  <button onClick={handleRegisterBusiness} className="px-6 py-2 bg-white text-black text-[10px] font-bold uppercase hover:bg-nql-cyan transition-all">Register_Asset</button>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {session.business.map(biz => (
                    <div key={biz.id} className="bg-white/2 border border-white/5 flex flex-col relative group">
                       <div className="p-8 flex flex-col gap-6">
                          <div className="flex flex-col gap-1">
                             <span className="text-[9px] text-nql-cyan font-bold uppercase">{biz.platform}</span>
                             <h3 className="text-xl font-bold text-white uppercase">{biz.name}</h3>
                          </div>
                          <div className="space-y-3 bg-black/40 p-4 border border-white/5 font-mono text-[10px]">
                             <div className="flex justify-between"><span className="text-zinc-500">Revenue (24h)</span><span className="text-green-500">${biz.revenue24h?.toLocaleString() || 0}</span></div>
                             <div className="flex justify-between"><span className="text-zinc-500">Orders Pending</span><span className="text-white">{biz.ordersPending || 0}</span></div>
                             <div className="flex justify-between"><span className="text-zinc-500">Node_Status</span><span className="text-nql-cyan">NOMINAL</span></div>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                             {['Sync', 'Audit', 'Marketing', 'Shipment'].map(a => (
                               <button key={a} className="p-2 border border-white/10 text-[8px] uppercase hover:bg-white/5 transition-all">{a}</button>
                             ))}
                          </div>
                       </div>
                       <div className="absolute bottom-0 left-0 w-full h-0.5 bg-nql-cyan scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
                    </div>
                  ))}
               </div>
            </div>
          )}

          {activeTab === 'SEC' && (
            <div className="flex flex-col gap-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
               <div className="flex justify-between items-center border-b border-white/10 pb-6">
                  <div className="flex flex-col gap-1">
                    <h2 className="text-xl font-bold tracking-tight uppercase flex items-center gap-2"><Key size={18} className="text-nql-gold" /> Identity_Node_Vault</h2>
                    <p className="text-[9px] text-nql-dim uppercase">Encrypted storage for core platform credentials</p>
                  </div>
                  <button 
                    onClick={() => setIsAddingIdentity(!isAddingIdentity)}
                    className={`px-6 py-2 text-[10px] font-bold uppercase transition-all ${isAddingIdentity ? 'bg-red-500/20 text-red-500 border border-red-500' : 'bg-nql-gold text-black hover:bg-white'}`}
                  >
                    {isAddingIdentity ? "Cancel" : "Add_Node"}
                  </button>
               </div>

               {isAddingIdentity && (
                 <motion.div 
                   initial={{ opacity: 0, y: -10 }}
                   animate={{ opacity: 1, y: 0 }}
                   className="p-6 bg-white/[0.02] border border-nql-gold/30 flex flex-col gap-6"
                 >
                    <div className="grid grid-cols-2 gap-4">
                       <div className="flex flex-col gap-2">
                          <label className="text-[8px] uppercase text-zinc-500 tracking-widest pl-2">Platform_Name</label>
                          <input className="nql-input" value={newIdentity.platform} onChange={e => setNewIdentity({...newIdentity, platform: e.target.value})} />
                       </div>
                       <div className="flex flex-col gap-2">
                          <label className="text-[8px] uppercase text-zinc-500 tracking-widest pl-2">Access_URL</label>
                          <input className="nql-input" value={newIdentity.siteUrl} onChange={e => setNewIdentity({...newIdentity, siteUrl: e.target.value})} />
                       </div>
                       <div className="flex flex-col gap-2">
                          <label className="text-[8px] uppercase text-zinc-500 tracking-widest pl-2">Admin_Ident</label>
                          <input className="nql-input" value={newIdentity.email} onChange={e => setNewIdentity({...newIdentity, email: e.target.value})} />
                       </div>
                       <div className="flex flex-col gap-2">
                          <label className="text-[8px] uppercase text-zinc-500 tracking-widest pl-2">Secret_Key</label>
                          <input type="password" className="nql-input" value={newIdentity.password} onChange={e => setNewIdentity({...newIdentity, password: e.target.value})} />
                       </div>
                    </div>
                    <button onClick={handleSaveIdentity} className="w-full py-4 bg-nql-gold text-black text-[10px] font-bold uppercase hover:bg-white shadow-[0_0_30px_rgba(255,185,0,0.1)]">Verify & Commit to Ledger</button>
                 </motion.div>
               )}

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {session.vault.map(entry => (
                    <div key={entry.id} className="p-6 border border-white/10 bg-black/40 hover:border-nql-gold/40 transition-all group relative">
                       <div className="flex justify-between items-start mb-6">
                          <div className="flex flex-col gap-1">
                             <span className="text-[10px] text-nql-gold font-bold uppercase tracking-widest">{entry.platform}</span>
                             <span className="text-xs text-nql-dim italic">{entry.siteUrl}</span>
                          </div>
                          <button onClick={() => handleDeleteIdentity(entry.id)} className="text-zinc-600 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                       </div>
                       <div className="space-y-3 bg-black/60 p-4 border border-white/5 rounded font-mono text-[10px]">
                          <div className="flex justify-between items-center">
                             <span className="text-zinc-500 uppercase">Identity</span>
                             <span className="text-white">{entry.email}</span>
                          </div>
                          <div className="flex justify-between items-center">
                             <span className="text-zinc-500 uppercase">Secure_Key</span>
                             <div className="flex items-center gap-2">
                                <span className={showPasswords[entry.id] ? 'text-nql-gold' : 'text-zinc-700'}>
                                  {showPasswords[entry.id] ? entry.password : '••••••••••••'}
                                </span>
                                <button onClick={() => togglePassword(entry.id)} className="text-zinc-400 hover:text-white">
                                   {showPasswords[entry.id] ? <EyeOff size={12} /> : <Eye size={12} />}
                                </button>
                             </div>
                          </div>
                       </div>
                    </div>
                  ))}
                  {session.vault.length === 0 && !isAddingIdentity && (
                    <div className="col-span-full py-20 border-2 border-dashed border-white/5 flex flex-col items-center justify-center gap-4 opacity-20">
                       <ShieldCheck size={48} />
                       <span className="text-xs uppercase tracking-widest">No Identity Nodes Registered</span>
                    </div>
                  )}
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BizSecPanel;
