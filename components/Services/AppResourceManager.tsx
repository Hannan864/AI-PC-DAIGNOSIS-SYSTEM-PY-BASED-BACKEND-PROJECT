
import React from 'react';

const AppResourceManager: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">App Manager</h1>
        <p className="text-slate-400 mt-1">Manage resource allocation and prioritization for active software.</p>
      </header>

      <div className="glass rounded-3xl border border-white/5 overflow-hidden">
        <div className="p-6 border-b border-white/5 bg-slate-900/30 flex justify-between items-center">
          <h3 className="font-bold">Application Priority Control</h3>
          <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Efficiency Mode: ACTIVE</span>
        </div>
        <div className="p-4 space-y-2">
          {[
            { name: 'Adobe Photoshop', cpu: 'High', ram: '4.2 GB', priority: 'High' },
            { name: 'Visual Studio Code', cpu: 'Low', ram: '1.1 GB', priority: 'Normal' },
            { name: 'Google Chrome', cpu: 'Medium', ram: '2.8 GB', priority: 'Normal' },
            { name: 'Slack', cpu: 'Low', ram: '0.4 GB', priority: 'Background' },
          ].map((app, i) => (
            <div key={i} className="flex items-center justify-between p-4 rounded-2xl hover:bg-white/5 transition-all">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center font-bold text-slate-500 border border-white/5 uppercase">
                  {app.name[0]}
                </div>
                <div>
                  <h4 className="font-bold text-slate-100">{app.name}</h4>
                  <p className="text-xs text-slate-500">Resource Profile: {app.cpu} CPU / {app.ram} RAM</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <select className="bg-slate-900 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500">
                  <option selected={app.priority === 'High'}>High Priority</option>
                  <option selected={app.priority === 'Normal'}>Normal</option>
                  <option selected={app.priority === 'Background'}>Efficiency Mode</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AppResourceManager;
