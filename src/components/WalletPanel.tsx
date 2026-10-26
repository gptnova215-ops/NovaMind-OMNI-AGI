/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Wallet, 
  ArrowUpRight, 
  ArrowDownLeft, 
  RefreshCw, 
  ShieldCheck, 
  Zap, 
  ExternalLink,
  History,
  CreditCard,
  Target
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer,
  Tooltip
} from 'recharts';
import { NQLSession } from '../types.ts';

const WalletPanel = ({ session, currentPrices, updateSession }: { 
  session: NQLSession, 
  currentPrices: Record<string, number>,
  updateSession?: (updater: (prev: NQLSession) => NQLSession) => void
}) => {
  const [isCnxLoading, setIsCnxLoading] = React.useState(false);
  const [isCoinbaseConnected, setIsCoinbaseConnected] = React.useState(false);

  const handleConnectCoinbase = async () => {
    setIsCnxLoading(true);
    // Simulate OAuth delay
    await new Promise(r => setTimeout(r, 2000));
    setIsCoinbaseConnected(true);
    setIsCnxLoading(false);
    
    if (updateSession) {
      updateSession(prev => ({
        ...prev,
        wallet: [...prev.wallet, {
          id: 'wal-cb',
          asset: 'CBETH',
          amount: 1.25,
          valueUsd: 4500,
          address: 'cb_0x...handshake',
          network: 'Coinbase_Vault',
          lastUpdated: new Date().toISOString()
        }],
        memoryLogs: [...prev.memoryLogs, "[FINANCE] Coinbase OAuth node linked. Assets synchronized."]
      }));
    }
  };

  const handleReceive = () => {
    const mainAsset = session.wallet[0];
    if (mainAsset) {
      alert(`RECEIVE_STATION_READY\nAsset: ${mainAsset.asset}\nNetwork: ${mainAsset.network}\nAddress: ${mainAsset.address}\n(Copied to clipboard)`);
      navigator.clipboard.writeText(mainAsset.address);
    }
  };

  const handleSend = () => {
    alert("TRANSACTION_INITIATED\nPlease provide target address and amount in the OMNI Terminal.");
  };

  const handleViewAll = () => {
    alert("TRANSACTION_HISTORY_DEEP_LINK\nOpening full ledger on BaseScan...");
  };

  const totalValueUsd = useMemo(() => {
    return session.wallet.reduce((acc, curr) => acc + (curr.amount * (currentPrices[curr.asset] || 0)), 0);
  }, [session.wallet, currentPrices]);

  const allocationData = useMemo(() => {
    return session.wallet.map(asset => ({
      name: asset.asset,
      value: asset.amount * (currentPrices[asset.asset] || 0),
      color: asset.asset === 'BTC' ? '#F7931A' : asset.asset === 'ETH' ? '#627EEA' : asset.asset === 'SOL' ? '#14F195' : '#00f2ff'
    })).sort((a, b) => b.value - a.value);
  }, [session.wallet, currentPrices]);

  return (
    <div className="flex-1 flex flex-col h-full bg-black text-white font-mono p-10 overflow-y-auto scrollbar-nql relative">
      <div className="absolute inset-0 pointer-events-none opacity-5">
         <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_100%_0%,_#F7931A_0%,_transparent_50%)] opacity-20" />
      </div>

      <div className="max-w-6xl mx-auto w-full flex flex-col gap-12 z-10">
        {/* Header - Total Balance */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10 border-b border-white/10 pb-12">
          <div className="flex flex-col gap-4">
             <div className="flex items-center gap-2 text-[10px] text-nql-gold uppercase tracking-[0.4em] font-bold">
                <ShieldCheck size={14} /> Coinbase_Wallet_Sovereign
             </div>
             <div className="flex flex-col gap-1">
                <span className="text-zinc-500 text-[10px] uppercase tracking-widest">Total_Account_Value</span>
                <div className="flex items-baseline gap-4">
                   <h1 className="text-6xl font-bold tracking-tighter tabular-nums">
                     ${totalValueUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                   </h1>
                   <span className="text-green-500 text-sm font-bold flex items-center gap-1">
                     <ArrowUpRight size={16} /> 2.14%
                   </span>
                </div>
             </div>
          </div>
          <div className="flex gap-4">
             <button 
               onClick={handleConnectCoinbase}
               disabled={isCnxLoading || isCoinbaseConnected}
               className={`flex items-center gap-2 px-6 py-3 border text-[10px] font-bold uppercase tracking-[0.2em] transition-all ${
                 isCoinbaseConnected 
                   ? 'border-green-500 text-green-500 cursor-default' 
                   : 'border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white'
               }`}
             >
                 {isCnxLoading ? (
                   <RefreshCw size={14} className="animate-spin" />
                 ) : isCoinbaseConnected ? (
                   <ShieldCheck size={14} />
                 ) : (
                   <ExternalLink size={14} />
                 )}
                 {isCnxLoading ? 'Authorizing...' : isCoinbaseConnected ? 'Coinbase_Synced' : 'Connect_Coinbase'}
             </button>
             <button 
               onClick={handleReceive}
               className="flex items-center gap-2 px-8 py-3 bg-white text-black text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-nql-gold transition-all shadow-[0_10px_30px_rgba(255,255,255,0.1)]"
             >
                <ArrowDownLeft size={14} /> Receive
             </button>
             <button 
               onClick={handleSend}
               className="flex items-center gap-2 px-8 py-3 bg-black border border-white/20 text-white text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-all"
             >
                <ArrowUpRight size={14} /> Send
             </button>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-12">
          {/* Main Inventory */}
          <div className="col-span-12 lg:col-span-8 flex flex-col gap-8">
             <div className="flex justify-between items-center px-2">
                <h3 className="text-xs text-white uppercase tracking-[0.3em] font-bold flex items-center gap-2">
                  <Wallet size={14} className="text-nql-gold" /> Blockchain_Holdings
                </h3>
                <span className="text-[9px] text-nql-dim flex items-center gap-2">
                  <RefreshCw size={10} className="animate-spin-slow" /> SYNCED: 0.04s AGO
                </span>
             </div>
             
             <div className="flex flex-col gap-2">
                {session.wallet.map(asset => (
                  <motion.div 
                    key={asset.id} 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="group bg-white/[0.02] border border-white/5 hover:border-nql-gold/40 hover:bg-white/[0.04] p-6 transition-all flex justify-between items-center cursor-pointer"
                  >
                    <div className="flex items-center gap-6">
                       <div className="w-12 h-12 rounded-full border border-white/10 p-1 relative overflow-hidden flex items-center justify-center bg-black">
                          <span className="text-xl font-bold">{asset.asset[0]}</span>
                          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
                       </div>
                       <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                             <span className="text-lg font-bold tracking-tight">{asset.asset}</span>
                             <span className="text-[8px] px-1.5 py-0.5 bg-white/5 border border-white/10 text-white/40 font-bold rounded">{asset.network}</span>
                          </div>
                          <span className="text-[9px] text-zinc-500 font-mono tracking-tighter truncate max-w-[200px]">{asset.address}</span>
                       </div>
                    </div>
                    <div className="flex items-center gap-12">
                       <div className="text-right flex flex-col">
                          <span className="text-zinc-500 text-[8px] uppercase tracking-widest">Market_Price</span>
                          <span className="text-sm font-mono">${(currentPrices[asset.asset] || 0).toLocaleString()}</span>
                       </div>
                       <div className="text-right flex flex-col gap-1">
                          <span className="text-lg font-bold tabular-nums">
                            {asset.amount.toLocaleString()} <span className="text-[10px] text-zinc-500">{asset.asset}</span>
                          </span>
                          <span className="text-[11px] text-nql-gold font-bold">
                            ${(asset.amount * (currentPrices[asset.asset] || 0)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                       </div>
                       <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <ExternalLink size={14} className="text-zinc-500" />
                       </div>
                    </div>
                  </motion.div>
                ))}
             </div>
          </div>

          {/* Allocation & Actions Sidebar */}
          <div className="col-span-12 lg:col-span-4 flex flex-col gap-8">
             <div className="bg-white/5 border border-white/10 p-8 flex flex-col gap-8">
                <h3 className="text-xs text-white uppercase tracking-[0.3em] font-bold flex items-center gap-2">
                  <CreditCard size={14} className="text-nql-cyan" /> Allocation_Matrix
                </h3>
                <div className="h-48 w-full relative">
                   <ResponsiveContainer width="100%" height="100%">
                     <PieChart>
                       <Pie
                         data={allocationData}
                         innerRadius={60}
                         outerRadius={80}
                         paddingAngle={5}
                         dataKey="value"
                       >
                         {allocationData.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={entry.color} />
                         ))}
                       </Pie>
                       <Tooltip 
                         contentStyle={{ backgroundColor: '#000', border: '1px solid rgba(255,255,255,0.1)', fontSize: '10px' }}
                         itemStyle={{ color: '#fff' }}
                       />
                     </PieChart>
                   </ResponsiveContainer>
                   <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-[8px] text-zinc-500 uppercase">Diversification</span>
                      <span className="text-xl font-bold">{(100 / allocationData.length).toFixed(1)}%</span>
                   </div>
                </div>
                <div className="space-y-4">
                   {allocationData.map(item => (
                     <div key={item.name} className="flex justify-between items-center text-[10px] uppercase">
                        <div className="flex items-center gap-2">
                           <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                           <span className="text-zinc-500 tracking-widest">{item.name}</span>
                        </div>
                        <span className="font-bold">{((item.value / totalValueUsd) * 100).toFixed(1)}%</span>
                     </div>
                   ))}
                </div>
             </div>

             <div className="bg-white/5 border border-white/10 p-8 flex flex-col gap-6">
                <h3 className="text-xs text-white uppercase tracking-[0.3em] font-bold flex items-center gap-2">
                  <History size={14} className="text-nql-violet" /> Recent_Events
                </h3>
                <div className="flex flex-col gap-4">
                   {[
                     { label: 'Staking_Reward', val: '+0.004 ETH', time: '2H AGO', color: 'text-nql-cyan' },
                     { label: 'Smart_Sell', val: '-1.42 SOL', time: '5H AGO', color: 'text-red-500' },
                     { label: 'Limit_Buy', val: '+0.012 BTC', time: '1D AGO', color: 'text-green-500' }
                   ].map((tx, i) => (
                     <div key={i} className="flex justify-between items-center py-2 border-b border-white/5 last:border-0 text-[10px] uppercase">
                        <div className="flex flex-col">
                           <span className="text-white font-bold">{tx.label}</span>
                           <span className="text-zinc-600 text-[8px]">{tx.time}</span>
                        </div>
                        <span className={`font-mono font-bold ${tx.color}`}>{tx.val}</span>
                     </div>
                   ))}
                </div>
                 <button 
                   onClick={handleViewAll}
                   className="w-full py-3 border border-white/10 text-[8px] uppercase tracking-widest hover:bg-white hover:text-black transition-all"
                 >
                    View_All_Transactions
                 </button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletPanel;
