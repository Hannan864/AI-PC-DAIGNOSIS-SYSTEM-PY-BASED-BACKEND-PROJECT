
import React, { useState } from 'react';

const MaintenanceScheduler: React.FC = () => {
  const [tasks, setTasks] = useState([
    { id: 1, name: 'Deep Disk Cleanup', frequency: 'Weekly', nextRun: 'Sat, 03:00 AM', active: true },
    { id: 2, name: 'Registry Optimization', frequency: 'Monthly', nextRun: '1st of Month', active: false },
    { id: 3, name: 'System Restore Point', frequency: 'Daily', nextRun: 'Every 24h', active: true },
  ]);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Maintenance Scheduler</h1>
        <p className="text-slate-400 mt-1">Orchestrate automated system health routines and background optimizations.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="glass rounded-3xl border border-white/5 overflow-hidden">
            <div className="p-6 border-b border-white/5 bg-slate-900/30 flex justify-between items-center">
              <h3 className="font-bold">Scheduled Routines</h3>
              <button className="text-xs font-bold text-indigo-400 uppercase tracking-widest hover:text-indigo-300">+ Add Task</button>
            </div>
            <div className="p-2">
              {tasks.map(task => (
                <div key={task.id} className="flex items-center justify-between p-4 rounded-2xl hover:bg-white/5 transition-all">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${task.active ? 'bg-indigo-500/10 text-indigo-400' : 'bg-slate-800 text-slate-500'}`}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"></path></svg>
                    </div>
                    <div>
                      <h4 className="font-bold">{task.name}</h4>
                      <p className="text-xs text-slate-500">Frequency: {task.frequency} • Next: {task.nextRun}</p>
                    </div>
                  </div>
                  <button className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${task.active ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-slate-500'}`}>
                    {task.active ? 'Active' : 'Paused'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="glass p-6 rounded-3xl border border-white/5 h-fit">
          <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-4">Idle Maintenance</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-300">Run while charging only</span>
              <div className="w-10 h-5 bg-indigo-600 rounded-full flex items-center px-1">
                <div className="w-3 h-3 bg-white rounded-full translate-x-5"></div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-300">Prevent sleep during tasks</span>
              <div className="w-10 h-5 bg-slate-700 rounded-full flex items-center px-1">
                <div className="w-3 h-3 bg-white rounded-full"></div>
              </div>
            </div>
          </div>
          <div className="mt-8 p-4 bg-indigo-500/10 rounded-2xl border border-indigo-500/20">
            <p className="text-xs text-indigo-300 leading-relaxed font-medium">
              Pro Tip: Scheduling maintenance during "Active Hours" is not recommended to ensure peak performance for your current tasks.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaintenanceScheduler;
