
import React from 'react';
import { useSystemData } from '../../hooks/useSystemData';

const PowerInsights: React.FC = () => {
  const { stats } = useSystemData();

  const profiles = [
    { name: 'Ultra Performance', desc: 'No throttling, maximum clock speed.', active: true, color: 'text-amber-400' },
    { name: 'Balanced', desc: 'Default system energy distribution.', active: false, color: 'text-indigo-400' },
    { name: 'Power Saver', desc: 'Aggressive background task suppression.', active: false, color: 'text-emerald-400' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Power Insights</h1>
        <p className="text-slate-400 mt-1">Energy consumption heuristics and battery health forensics.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass p-8 rounded-3xl border border-white/5 flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="6" width="18" height="12" rx="2" ry="2"></rect><line x1="23" y1="13" x2="23" y2="11"></line></svg>
          </div>
          <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-2">Battery Charge</p>
          <div className="text-6xl font-black mono text-indigo-400">{stats.batteryLevel || 100}%</div>
          <p className="text-xs text-emerald-400 font-bold mt-4">✓ Healthy • {stats.isCharging ? 'Charging' : 'Discharging'}</p>
        </div>

        <div className="md:col-span-2 glass p-8 rounded-3xl border border-white/5">
          <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-6">Active Power Profile</h3>
          <div className="space-y-4">
            {profiles.map((p, i) => (
              <div key={i} className={`p-4 rounded-2xl border transition-all cursor-pointer ${p.active ? 'bg-white/5 border-white/10' : 'border-transparent hover:bg-white/2'}`}>
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className={`font-bold ${p.active ? p.color : 'text-slate-400'}`}>{p.name}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">{p.desc}</p>
                  </div>
                  {p.active && <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="glass p-6 rounded-3xl border border-white/5">
        <h3 className="font-bold mb-4">Consumption Analytics</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Display Load', val: '4.2W', trend: 'stable' },
            { label: 'CPU Package', val: '12.8W', trend: 'up' },
            { label: 'GPU Core', val: '2.1W', trend: 'down' },
            { label: 'Peripherals', val: '0.8W', trend: 'stable' },
          ].map((item, i) => (
            <div key={i} className="bg-white/2 p-4 rounded-xl border border-white/5">
              <p className="text-[10px] uppercase font-bold text-slate-500">{item.label}</p>
              <p className="text-lg font-black mono mt-1">{item.val}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PowerInsights;
