
import React, { useState, useEffect } from 'react';
import { useSystemData } from '../../hooks/useSystemData';
import { diagnosticProvider } from '../../services/diagnosticProvider';
import { db } from '../../services/db';
import { ServiceType } from '../../types';

const PerformanceOptimizer: React.FC = () => {
  const { processes, stats } = useSystemData();
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [savings, setSavings] = useState({ ram: '0 MB', tasks: 0 });

  const performOptimization = async () => {
    setIsOptimizing(true);
    
    try {
      // Direct compression and system balancing handled via future-proof provider contract
      const result = await diagnosticProvider.optimizeSystem(processes);
      
      setSavings({ 
        ram: `${result.ramRecovered} MB`, 
        tasks: savings.tasks + 1 
      });

      db.addLog({
        id: `opt-${Date.now()}`,
        timestamp: Date.now(),
        service: ServiceType.PERFORMANCE,
        message: `Deep Optimization Complete: Purged ${result.cacheStorePurged} cache stores and recovered ${result.ramRecovered}MB RAM.`,
        type: 'success'
      });
    } catch (err) {
      console.error("Optimization pipeline failed", err);
    } finally {
      setIsOptimizing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Performance Optimizer</h1>
          <p className="text-slate-400 mt-1">Intelligent resource rebalancing and active memory compression.</p>
        </div>
        <button 
          onClick={performOptimization}
          disabled={isOptimizing}
          className={`
            relative px-10 py-4 rounded-2xl font-bold transition-all overflow-hidden
            ${isOptimizing 
              ? 'bg-slate-800 text-slate-500 cursor-wait' 
              : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-xl shadow-indigo-500/20 active:scale-95'}
          `}
        >
          <span className="relative z-10">{isOptimizing ? 'Compressing Memory...' : 'One-Click Global Optimize'}</span>
          {isOptimizing && (
            <div className="absolute inset-0 bg-indigo-400/20 animate-pulse"></div>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass p-5 rounded-2xl border-l-4 border-indigo-500">
          <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Real-time Load</p>
          <p className="text-2xl font-bold mono mt-1">{stats.cpu.toFixed(1)}%</p>
          <p className="text-xs text-slate-400 mt-0.5">CPU Capacity</p>
        </div>
        <div className="glass p-5 rounded-2xl border-l-4 border-emerald-500">
          <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Mem Recovery</p>
          <p className="text-2xl font-bold mono mt-1 text-emerald-400">{savings.ram}</p>
          <p className="text-xs text-slate-400 mt-0.5">Total Savings</p>
        </div>
        <div className="glass p-5 rounded-2xl border-l-4 border-amber-500">
          <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Background Tasks</p>
          <p className="text-2xl font-bold mono mt-1">{processes.filter(p => p.status === 'Background').length}</p>
          <p className="text-xs text-slate-400 mt-0.5">Throttled Items</p>
        </div>
        <div className="glass p-5 rounded-2xl border-l-4 border-rose-500">
          <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Optimization Health</p>
          <p className="text-2xl font-bold mono mt-1">Excellent</p>
          <p className="text-xs text-slate-400 mt-0.5">Stability Index</p>
        </div>
      </div>

      <div className="glass rounded-3xl border border-white/5 overflow-hidden">
        <div className="p-4 md:p-6 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="font-bold flex items-center gap-2 text-sm md:text-base">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-400"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
            High Intensity Processes
          </h3>
          <span className="px-3 py-1 rounded-full bg-slate-800 text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-tighter w-fit">
            Hardware Acceleration: ON
          </span>
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-900/50 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
              <tr>
                <th className="px-6 py-4">Process Identity</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-center">CPU Load</th>
                <th className="px-6 py-4 text-center">Memory Private Set</th>
                <th className="px-6 py-4 text-center">Impact Score</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {processes.map(proc => (
                <tr key={proc.id} className="hover:bg-white/[0.03] transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]"></div>
                      <span className="font-medium text-slate-200">{proc.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase ${proc.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}>
                      {proc.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center mono text-indigo-400 font-bold">{proc.cpu.toFixed(1)}%</td>
                  <td className="px-6 py-4 text-center mono text-slate-300">{proc.ram} MB</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`
                      px-2 py-0.5 rounded text-[10px] font-bold uppercase
                      ${proc.impact === 'High' ? 'bg-rose-500/10 text-rose-400' : proc.impact === 'Medium' ? 'bg-amber-500/10 text-amber-400' : 'bg-emerald-500/10 text-emerald-400'}
                    `}>
                      {proc.impact}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 rounded-lg text-slate-500 hover:bg-rose-500/10 hover:text-rose-400 transition-all opacity-0 group-hover:opacity-100">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden divide-y divide-white/5">
          {processes.map(proc => (
            <div key={proc.id} className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]"></div>
                  <span className="font-bold text-slate-200 text-sm">{proc.name}</span>
                </div>
                <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase ${proc.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}>
                  {proc.status}
                </span>
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                <div className="flex flex-col">
                  <span className="text-[9px] uppercase font-bold text-slate-500">CPU</span>
                  <span className="text-xs font-bold text-indigo-400 mono">{proc.cpu.toFixed(1)}%</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] uppercase font-bold text-slate-500">RAM</span>
                  <span className="text-xs font-bold text-slate-300 mono">{proc.ram}MB</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] uppercase font-bold text-slate-500">Impact</span>
                  <span className={`
                    w-fit px-1.5 py-0.5 rounded text-[8px] font-bold uppercase
                    ${proc.impact === 'High' ? 'bg-rose-500/10 text-rose-400' : proc.impact === 'Medium' ? 'bg-amber-500/10 text-amber-400' : 'bg-emerald-500/10 text-emerald-400'}
                  `}>
                    {proc.impact}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PerformanceOptimizer;
