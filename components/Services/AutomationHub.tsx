
import React, { useState } from 'react';

const AutomationHub: React.FC = () => {
  const [activeScripts, setActiveScripts] = useState([
    { name: 'Nightly Clean', trigger: '03:00 AM', status: 'Armed', lastRun: '22h ago' },
    { name: 'Low Disk Watcher', trigger: '< 5GB', status: 'Monitoring', lastRun: 'N/A' },
  ]);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Automation Hub</h1>
          <p className="text-slate-400 mt-1">Sandbox orchestration for custom system triggers and scripts.</p>
        </div>
        <button className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-600/20">
          + Create New Trigger
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="glass rounded-3xl border border-white/5 overflow-hidden">
            <div className="p-5 border-b border-white/5 bg-slate-900/30 flex justify-between items-center">
              <h3 className="font-bold text-sm uppercase tracking-widest text-slate-400">Active Automations</h3>
            </div>
            <div className="p-2">
              {activeScripts.map((script, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-2xl hover:bg-white/5 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-indigo-400">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-100">{script.name}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">Trigger: {script.trigger}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-8">
                    <div className="text-right">
                      <p className="text-[10px] uppercase font-bold text-slate-500">Status</p>
                      <p className="text-xs font-bold text-emerald-400">{script.status}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] uppercase font-bold text-slate-500">Last Run</p>
                      <p className="text-xs font-bold text-slate-400">{script.lastRun}</p>
                    </div>
                    <button className="p-2 text-slate-600 hover:text-rose-400 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="glass p-6 rounded-3xl border border-white/5 space-y-6">
          <h3 className="font-bold uppercase text-[10px] tracking-widest text-slate-500">Scripting Sandbox</h3>
          <div className="bg-[#0f172a] p-4 rounded-xl border border-white/5 mono text-[11px] text-indigo-300 min-h-[150px] leading-relaxed">
            <span className="text-slate-500">// Sentinel DSL v1.0</span><br/>
            <span className="text-purple-400">on</span>(SYSTEM_IDLE) &#123;<br/>
            &nbsp;&nbsp;<span className="text-emerald-400">purge</span>(TEMP_FILES);<br/>
            &nbsp;&nbsp;<span className="text-emerald-400">optimize</span>(RAM);<br/>
            &nbsp;&nbsp;<span className="text-emerald-400">report</span>(SUMMARY);<br/>
            &#125;
          </div>
          <p className="text-xs text-slate-500 italic leading-relaxed">
            Automation hub allows you to define complex maintenance logic that runs without UI presence.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AutomationHub;
