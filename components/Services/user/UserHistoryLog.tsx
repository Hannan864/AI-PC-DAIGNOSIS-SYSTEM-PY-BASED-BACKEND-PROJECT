import React, { useState, useEffect } from 'react';
import { db } from '../../../services/db';
import { useAuth } from '../../Layout/AuthProvider';
import { UserHistory } from '../../../types';
import { Icons } from '../../../constants';

export const UserHistoryLog: React.FC = () => {
  const { user } = useAuth();
  const [history, setHistory] = useState<UserHistory[]>([]);

  useEffect(() => {
    if (user?.id) {
      db.getUserHistory(user.id).then(h => setHistory(h));
    }
  }, [user]);

  const getIconForType = (type: string) => {
    switch (type) {
      case 'PC_BUILD': return <div className="p-2 rounded bg-lime-500/20 text-lime-400">{Icons.monitor}</div>;
      case 'REPAIR_REQUEST': return <div className="p-2 rounded bg-indigo-500/20 text-indigo-400">{Icons.briefcase}</div>;
      case 'DIAGNOSTIC': return <div className="p-2 rounded bg-amber-500/20 text-amber-400">{Icons.activity}</div>;
      default: return <div className="p-2 rounded bg-slate-500/20 text-slate-400">{Icons.clock}</div>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-white tracking-tight">System History</h2>
        <p className="text-slate-400">A unified timeline of all your builds, diagnostics, and requested service actions.</p>
      </div>

      <div className="glass p-6 rounded-xl border border-white/5 relative">
         <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-white/10 before:to-transparent">
            {history.length === 0 && (
              <div className="text-center p-4 text-slate-500 font-medium">No history recorded yet.</div>
            )}
            {history.map((item, i) => (
              <div key={item.historyId} className="relative flex items-start gap-4">
                 <div className="z-10 bg-[#020617] p-1 rounded-full border border-white/10 shadow-lg">
                    {getIconForType(item.type)}
                 </div>
                 
                 <div className="flex-1 mt-1">
                    <div className="flex items-center gap-3 mb-1">
                       <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{item.type.replace('_', ' ')}</span>
                       <span className="text-xs font-medium text-slate-500">{new Date(item.timestamp).toLocaleString()}</span>
                    </div>
                    <div className="bg-white/5 p-4 rounded-lg border border-white/5">
                      <h4 className="text-base font-bold text-white mb-1">{item.title}</h4>
                      <p className="text-sm text-slate-300">{item.summary}</p>
                    </div>
                 </div>
              </div>
            ))}
         </div>
      </div>
    </div>
  );
};
