
import React, { useState, useEffect } from 'react';
import { useSystemData } from '../../hooks/useSystemData';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { diagnosticProvider } from '../../services/diagnosticProvider';
import { db } from '../../services/db';
import { ServiceType } from '../../types';
import { RequestTechnicianHelp } from './RequestTechnicianHelp';

const NetworkDiagnostics: React.FC = () => {
  const { stats } = useSystemData();
  const [latency, setLatency] = useState<number>(0);
  const [isTesting, setIsTesting] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [forensics, setForensics] = useState<Array<{ name: string; down: string; up: string; type: string }>>([]);

  const runLatencyTest = async () => {
    setIsTesting(true);
    try {
      const final = await diagnosticProvider.runNetworkLatencyTest();
      setLatency(final);
      
      db.addLog({
        id: `net-${Date.now()}`,
        timestamp: Date.now(),
        service: ServiceType.NETWORK,
        message: `Network integrity check: Latency ${final}ms.`,
        type: final < 50 ? 'success' : 'warn'
      });
    } catch (e) {
      console.error("Network diagnostics test failed", e);
    } finally {
      setIsTesting(false);
    }
  };

  const loadForensics = async () => {
    try {
      const data = await diagnosticProvider.getNetworkForensics();
      setForensics(data);
    } catch (err) {
      console.error("Failed to load connection forensics", err);
    }
  };

  useEffect(() => {
    runLatencyTest();
    loadForensics();
    const interval = setInterval(() => {
      setHistory(prev => [...prev.slice(-19), { time: Date.now(), val: stats.networkDown }]);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const getSnapshot = () => ({
    latency,
    throughputIn: stats.networkDown,
    throughputOut: stats.networkUp,
    protocolHealth: 'Stable'
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Network Forensics</h1>
          <p className="text-slate-400 text-sm md:text-base mt-1">Real-time bandwidth auditing and packet latency diagnostics.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          <RequestTechnicianHelp moduleName="Network Diagnostics" getSnapshot={getSnapshot} />
          <button 
            onClick={runLatencyTest}
            disabled={isTesting}
            className="px-6 py-2 glass border border-white/10 rounded-xl font-bold hover:bg-white/5 transition-all text-sm active:scale-95 flex items-center justify-center gap-2"
          >
            {isTesting && <div className="w-3 h-3 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>}
            {isTesting ? 'Pinging...' : 'Recalibrate Latency'}
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass p-5 md:p-6 rounded-3xl border border-white/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none hidden md:block">
            <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
          </div>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <h3 className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-400 leading-none">Throughput Timeline (Mbps)</h3>
            <div className="flex gap-4">
               <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.5)]"></div>
                  <span className="text-[9px] md:text-[10px] font-bold text-slate-500 uppercase">IN: {stats.networkDown.toFixed(2)}</span>
               </div>
               <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                  <span className="text-[9px] md:text-[10px] font-bold text-slate-500 uppercase">OUT: {stats.networkUp.toFixed(2)}</span>
               </div>
            </div>
          </div>
          <div className="h-48 md:h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={history}>
                <XAxis dataKey="time" hide />
                <YAxis hide domain={[0, 'auto']} />
                <Tooltip 
                   contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                />
                <Line type="monotone" dataKey="val" stroke="#22d3ee" strokeWidth={4} dot={false} animationDuration={300} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-4">
          <div className="glass p-6 rounded-3xl border border-white/5">
            <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Active Latency</p>
            <div className="flex items-end gap-2 mt-2">
              <p className="text-4xl font-black mono text-slate-100">{latency}<span className="text-sm font-normal text-slate-500">ms</span></p>
              <span className={`text-[10px] font-bold uppercase mb-1.5 ${latency < 40 ? 'text-emerald-400' : 'text-amber-400'}`}>
                {latency < 40 ? 'Optimum' : 'Elevated'}
              </span>
            </div>
          </div>
          
          <div className="glass p-6 rounded-3xl border border-white/5">
            <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Protocol Health</p>
            <div className="mt-4 space-y-3">
              {[
                { label: 'DNS Resolve', val: '9ms', status: 'ok' },
                { label: 'Packet Integrity', val: '100%', status: 'ok' },
                { label: 'Signal Jitter', val: '1.2ms', status: 'ok' },
              ].map((item, i) => (
                <div key={i} className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-medium">{item.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="mono font-bold text-slate-200">{item.val}</span>
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <div className="glass rounded-3xl border border-white/5 overflow-hidden">
        <div className="p-5 border-b border-white/5 bg-slate-900/30 flex justify-between items-center">
          <h3 className="font-bold">Bandwidth Forensics</h3>
          <span className="text-[10px] text-slate-500 font-bold uppercase">Measured per active resource thread</span>
        </div>
        <div className="p-3">
          {forensics.map((app, i) => (
            <div key={i} className="flex items-center justify-between p-4 rounded-2xl hover:bg-white/5 transition-all">
               <div className="flex items-center gap-4">
                 <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                   <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                 </div>
                 <div>
                   <span className="font-bold text-slate-200 text-sm">{app.name}</span>
                   <p className="text-[9px] uppercase font-bold text-slate-500 tracking-widest">{app.type} Protocol</p>
                 </div>
               </div>
               <div className="flex gap-12">
                  <div className="text-right">
                     <p className="text-sm font-black text-cyan-400 mono">{app.down}</p>
                     <p className="text-[9px] uppercase font-bold text-slate-500">Ingress</p>
                  </div>
                  <div className="text-right">
                     <p className="text-sm font-black text-purple-400 mono">{app.up}</p>
                     <p className="text-[9px] uppercase font-bold text-slate-500">Egress</p>
                  </div>
               </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NetworkDiagnostics;
