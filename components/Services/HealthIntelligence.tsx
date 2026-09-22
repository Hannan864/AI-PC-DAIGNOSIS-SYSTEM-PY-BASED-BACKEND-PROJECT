
import React, { useState, useEffect } from 'react';
import { useSystemData } from '../../hooks/useSystemData';
import { getHealthIntelligence } from '../../services/geminiService';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { RequestTechnicianHelp } from './RequestTechnicianHelp';
import { ServiceType } from '../../types';

const HealthIntelligence: React.FC = () => {
  const { stats } = useSystemData();
  const [history, setHistory] = useState<any[]>([]);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setHistory(prev => {
      const newHistory = [...prev, { ...stats, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) }];
      return newHistory.slice(-20); // Keep last 20 points
    });
  }, [stats]);

  const runAnalysis = async () => {
    if (loading) return;
    setLoading(true);
    const result = await getHealthIntelligence(stats);
    setAiAnalysis(result);
    setLoading(false);
  };

  useEffect(() => {
    runAnalysis();
    const interval = setInterval(runAnalysis, 30000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getHealthColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400';
    if (score >= 50) return 'text-amber-400';
    return 'text-rose-400';
  };

  const getSnapshot = () => {
    return {
      stats,
      aiAnalysis,
      historyLength: history.length
    };
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Health Intelligence</h1>
          <p className="text-slate-400 text-sm md:text-base mt-1">Real-time physiological audit of system state.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          <RequestTechnicianHelp moduleName="Health Intelligence" getSnapshot={getSnapshot} />
          <div className="flex items-center justify-between sm:justify-end gap-4 bg-white/5 p-3 rounded-2xl border border-white/5 shrink-0">
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-widest font-semibold text-slate-500 leading-none">Global Score</p>
              <p className={`text-xl md:text-2xl font-bold mono ${getHealthColor(aiAnalysis?.healthScore || 0)}`}>
                {aiAnalysis?.healthScore || '--'}%
              </p>
            </div>
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full border-4 border-slate-800 flex items-center justify-center overflow-hidden">
              <div className={`w-full h-full animate-pulse opacity-20 ${getHealthColor(aiAnalysis?.healthScore || 0).replace('text-', 'bg-')}`}></div>
            </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="glass p-5 md:p-6 rounded-3xl border border-white/5">
            <h3 className="text-xs font-semibold text-slate-400 mb-6 uppercase tracking-wider">CPU & RAM Load Timeline</h3>
            <div className="h-48 md:h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={history}>
                  <defs>
                    <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorRam" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="time" hide />
                  <YAxis hide domain={[0, 100]} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                    itemStyle={{ color: '#f8fafc' }}
                  />
                  <Area type="monotone" dataKey="cpu" stroke="#6366f1" fillOpacity={1} fill="url(#colorCpu)" strokeWidth={2} isAnimationActive={false} />
                  <Area type="monotone" dataKey="ram" stroke="#10b981" fillOpacity={1} fill="url(#colorRam)" strokeWidth={2} isAnimationActive={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
             <div className="glass p-5 rounded-2xl">
                <p className="text-[10px] text-slate-500 uppercase font-bold mb-1 tracking-widest">Temperature</p>
                <div className="flex items-end gap-2">
                  <span className="text-2xl md:text-3xl font-bold mono">{stats.temp.toFixed(1)}°C</span>
                  <span className={`text-[10px] md:text-xs mb-1.5 ${stats.temp > 75 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {stats.temp > 75 ? 'Elevated' : 'Optimal'}
                  </span>
                </div>
                <div className="w-full h-1 bg-slate-800 rounded-full mt-3 overflow-hidden">
                  <div className={`h-full transition-all duration-500 ${stats.temp > 75 ? 'bg-rose-500' : 'bg-emerald-500'}`} style={{width: `${Math.min(100, (stats.temp / 100) * 100)}%`}}></div>
                </div>
             </div>
             <div className="glass p-5 rounded-2xl">
                <p className="text-[10px] text-slate-500 uppercase font-bold mb-1 tracking-widest">Disk Activity</p>
                <div className="flex items-end gap-2">
                  <span className="text-2xl md:text-3xl font-bold mono">{stats.disk.toFixed(1)}%</span>
                  <span className="text-[10px] md:text-xs text-indigo-400 mb-1.5">Active IO</span>
                </div>
                <div className="w-full h-1 bg-slate-800 rounded-full mt-3 overflow-hidden">
                  <div className="h-full bg-indigo-500 transition-all duration-500" style={{width: `${Math.min(100, stats.disk)}%`}}></div>
                </div>
             </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 p-6 rounded-3xl relative overflow-hidden min-h-[200px]">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
            </div>
            
            <div className="flex items-center gap-2 mb-4">
               <div className={`w-2 h-2 rounded-full ${loading ? 'bg-amber-400 animate-ping' : 'bg-indigo-400'}`}></div>
               <h3 className="text-sm font-bold uppercase tracking-widest text-indigo-300">Sentinel Insights</h3>
            </div>

            {loading && !aiAnalysis ? (
              <div className="space-y-3">
                <div className="h-4 bg-white/5 rounded animate-pulse w-full"></div>
                <div className="h-4 bg-white/5 rounded animate-pulse w-3/4"></div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-slate-300 leading-relaxed italic">
                  "{aiAnalysis?.summary || 'Aggregating system heuristics for analysis...'}"
                </p>
                
                <div className="space-y-2 pt-4 border-t border-white/5">
                  <p className="text-xs font-bold text-slate-500 uppercase">Recommendations</p>
                  {aiAnalysis?.recommendations?.map((rec: string, i: number) => (
                    <div key={i} className="flex gap-2 text-sm text-slate-400">
                      <span className="text-indigo-400">→</span>
                      <span>{rec}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="glass p-6 rounded-3xl border border-white/5">
            <h3 className="text-sm font-semibold text-slate-400 mb-4 uppercase tracking-wider">Health Log</h3>
            <div className="space-y-3">
              {[
                { time: '12:04:02', msg: 'Core thermal spike detected', type: 'warn' },
                { time: '11:58:30', msg: 'Memory compression successful', type: 'info' },
                { time: '11:45:12', msg: 'System integrity check passed', type: 'success' },
              ].map((log, i) => (
                <div key={i} className="flex gap-3 text-xs">
                  <span className="text-slate-500 mono">{log.time}</span>
                  <span className={log.type === 'warn' ? 'text-amber-400' : log.type === 'success' ? 'text-emerald-400' : 'text-slate-300'}>
                    {log.msg}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HealthIntelligence;
