
import React, { useState, useEffect } from 'react';
import { db } from '../../services/db';
import { AuditLog } from '../../types';

const ReportsHistory: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const results = await db.getLogs();
      setLogs(results);
      setLoading(false);
    };
    fetch();
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports & History</h1>
          <p className="text-slate-400 mt-1">Consolidated operational logs from local persistent storage.</p>
        </div>
      </header>

      <div className="glass rounded-3xl border border-white/5 overflow-hidden">
        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/2">
           <h3 className="font-bold">Operational Audit Timeline</h3>
           <span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Persistence: Enabled (IndexedDB)</span>
        </div>
        <div className="p-6">
          {loading ? (
            <div className="space-y-4 animate-pulse">
               <div className="h-12 bg-white/5 rounded-xl w-full"></div>
               <div className="h-12 bg-white/5 rounded-xl w-full"></div>
            </div>
          ) : logs.length === 0 ? (
            <p className="text-center py-12 text-slate-600 italic">No historical audit data recorded yet.</p>
          ) : (
            <div className="space-y-6">
              {logs.map((log) => (
                <div key={log.id} className="relative pl-8 border-l border-white/10 pb-6 last:pb-0">
                  <div className={`absolute left-[-5px] top-0 w-2.5 h-2.5 rounded-full ring-4 ring-[#020617] ${
                    log.type === 'success' ? 'bg-emerald-500' : log.type === 'warn' ? 'bg-amber-500' : 'bg-indigo-500'
                  }`}></div>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase text-slate-500">{log.service}</span>
                        <span className="text-[10px] text-slate-700 font-bold">•</span>
                        <h4 className="font-bold text-slate-200">{log.message}</h4>
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-600 font-medium mono">
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportsHistory;
