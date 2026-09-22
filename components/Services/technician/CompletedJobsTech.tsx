import React, { useState, useEffect } from 'react';
import { db } from '../../../services/db';
import { RepairRequest, RepairRequestStatus } from '../../../types';
import { useAuth } from '../../Layout/AuthProvider';
import { Icons } from '../../../constants';

export const CompletedJobsTech: React.FC = () => {
  const { session } = useAuth();
  const [completed, setCompleted] = useState<RepairRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCompleted = async () => {
      if (session?.userId) {
        setLoading(true);
        try {
          const reqs = await db.getRepairRequestsByTechnician(session.userId);
          const filtered = reqs.filter(r => r.status === RepairRequestStatus.COMPLETED);
          setCompleted(filtered.sort((a, b) => b.updatedAt - a.updatedAt));
        } catch (err) {
          console.error('Error loading completed jobs:', err);
        } finally {
          setLoading(false);
        }
      }
    };
    loadCompleted();
  }, [session]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-white tracking-tight">Completed Portfolio Archive</h2>
        <p className="text-slate-400">View historically signed-off repairs, system resolutions, and SLA achievements.</p>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="p-8 text-center text-slate-500">Checking archived folders...</div>
        ) : completed.length === 0 ? (
          <div className="p-12 text-center glass rounded-2xl border border-white/5 space-y-3">
             <div className="w-12 h-12 rounded-full bg-slate-800/40 text-slate-500 flex items-center justify-center mx-auto">
               {Icons.briefcase}
             </div>
             <p className="text-sm text-slate-500 font-medium">Archive empty. Completing a request moves it to this list automatically.</p>
          </div>
        ) : (
          completed.map(job => (
            <div key={job.id} className="glass rounded-2xl p-6 border border-white/5 space-y-4 hover:border-white/10 transition-colors">
              <div className="flex items-start justify-between flex-wrap gap-4">
                 <div>
                    <h3 className="text-lg font-bold text-slate-100">{job.gigTitle || 'Diagnostic Maintenance'}</h3>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                       <span className="font-mono">TICKET ID: {job.id.split('_')[1]}</span>
                       <span>•</span>
                       <span>Client: {job.userName}</span>
                       <span>•</span>
                       <span>Resolved on {new Date(job.updatedAt).toLocaleDateString()}</span>
                    </div>
                 </div>
                 
                 <span className="px-2.5 py-1 rounded text-[10px] font-bold tracking-widest uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                    ✓ RESOLVED
                 </span>
              </div>

              <div className="text-sm text-slate-400 bg-[#020617]/50 rounded-xl p-4 border border-white/5">
                 <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Issue Overview Context</span>
                 <p>{job.issueDescription}</p>
              </div>

              {job.technicianNote && (
                 <div className="p-3.5 bg-emerald-500/5 rounded-lg border-l-2 border-emerald-400 text-sm text-slate-300 italic">
                   <span className="block not-italic text-[10px] font-bold uppercase tracking-wider text-emerald-400 mb-1">Final Resolution Comments:</span>
                   "{job.technicianNote}"
                 </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
