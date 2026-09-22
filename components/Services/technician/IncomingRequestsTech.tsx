import React, { useState, useEffect } from 'react';
import { db } from '../../../services/db';
import { RepairRequest, RepairRequestStatus } from '../../../types';
import { useAuth } from '../../Layout/AuthProvider';
import { Icons } from '../../../constants';

export const IncomingRequestsTech = () => {
  const { session } = useAuth();
  const [requests, setRequests] = useState<RepairRequest[]>([]);

  const loadRequests = async () => {
    if (session?.userId) {
      const reqs = await db.getRepairRequestsByTechnician(session.userId);
      setRequests(reqs.filter(r => r.status !== RepairRequestStatus.COMPLETED && r.status !== RepairRequestStatus.CANCELLED).sort((a, b) => b.createdAt - a.createdAt));
    }
  };

  useEffect(() => {
    loadRequests();
  }, [session]);

  const handleAction = async (req: RepairRequest, status: RepairRequestStatus, decision: string) => {
    let note = '';
    if (decision === 'PROPOSED_ALTERNATIVE' || decision === 'REQUESTED_MORE_INFO') {
      const msg = prompt('Please enter a note for the user:');
      if (msg === null) return; // cancelled
      note = msg;
    } else if (decision === 'NOTE' || ['WAITING_PARTS', 'TESTING', 'IN_PROGRESS', 'COMPLETED'].includes(status)) {
      const msg = prompt(`Add an optional note for this state update (${status}):`);
      if (msg !== null) {
        note = msg;
      }
    }

    const historyEntry = {
      status,
      timestamp: Date.now(),
      updatedBy: 'TECHNICIAN' as const,
      note: note || (decision && decision !== 'NOTE' ? `Technician marked as ${status}` : undefined)
    };

    const updatedHistory = req.lifecycleHistory ? [...req.lifecycleHistory, historyEntry] : [historyEntry];

    const sla = { ...req.sla } as any;
    if (status === RepairRequestStatus.ACCEPTED && !sla.acceptedAt) {
      sla.acceptedAt = Date.now();
    }
    if (status === RepairRequestStatus.COMPLETED && !sla.actualCompletionTime) {
      sla.actualCompletionTime = Date.now();
    }

    await db.addRepairRequest({ 
      ...req, 
      status, 
      technicianDecision: decision !== 'NOTE' ? decision : req.technicianDecision,
      technicianNote: note || req.technicianNote,
      lifecycleHistory: updatedHistory,
      sla,
      updatedAt: Date.now() 
    });

    await db.addUserHistory({
      historyId: `hist_${Date.now()}_${Math.random().toString(36).substr(2,6)}`,
      userId: req.userId,
      type: 'REPAIR_REQUEST',
      referenceId: req.id,
      title: `Repair Status Updated: ${status.replace('_', ' ')}`,
      summary: note ? `Technician Note: ${note}` : `Technician marked job as ${status.replace('_', ' ')}`,
      timestamp: Date.now()
    });

    loadRequests();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-white tracking-tight">Active Jobs & Incoming Requests</h2>
        <p className="text-slate-400">Manage your active pipeline and track job lifecycles.</p>
      </div>

      <div className="space-y-4">
        {requests.length === 0 ? (
           <div className="p-12 text-center glass rounded-xl border border-white/5">
             <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4 text-slate-400">
                {Icons.bell}
             </div>
             <h3 className="text-lg font-semibold text-white mb-1">No Incoming Jobs</h3>
             <p className="text-slate-500">Your queue from the marketplace is currently clear.</p>
           </div>
        ) : (
          requests.map(req => (
            <div key={req.id} className="glass rounded-xl p-5 border border-indigo-500/20 bg-indigo-500/5 flex flex-col md:flex-row gap-6 items-start md:items-center">
               <div className="w-12 h-12 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold shrink-0">
                 {req.userName.charAt(0).toUpperCase()}
               </div>
               
               <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                     <h3 className="text-lg font-semibold text-white tracking-tight">
                       {req.gigTitle || `Auto-Routed: ${req.issueCategory || 'General Issue'}`}
                     </h3>
                     <span className="text-sm font-medium text-slate-400">{req.userName}</span>
                  </div>
                  
                  {req.severityLevel && (
                     <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest border
                          ${req.severityLevel === 'HIGH' ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' : 
                            req.severityLevel === 'MEDIUM' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' : 
                            'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'}
                        `}>
                          {req.severityLevel} PRIORITY ({req.severityScore}/100)
                        </span>
                        {req.issueCategory && (
                           <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest bg-blue-500/10 text-blue-400 border border-blue-500/30">
                             {req.issueCategory}
                           </span>
                        )}
                     </div>
                  )}

                  <div className="bg-[#020617]/50 rounded-lg p-3 border border-white/5 my-3 text-sm text-slate-300 relative space-y-2">
                     <div className={`absolute top-0 left-0 w-1 h-full rounded-l-lg ${req.attachedDiagnostics ? 'bg-indigo-500' : 'bg-slate-500'}`}></div>
                     <p>{req.issueDescription}</p>
                     
                     {req.attachedDiagnostics && (
                       <div className="mt-3 pt-3 border-t border-white/5">
                         <div className="flex items-center text-xs font-bold uppercase tracking-widest text-indigo-400 mb-2">
                           <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mr-2"></span>
                           Attached: {req.attachedDiagnostics.sourceModule} Snapshot
                         </div>
                         <pre className="text-[10px] text-slate-400 mono overflow-x-auto p-2 bg-black/40 rounded border border-white/5 whitespace-pre-wrap max-h-32">
                           {JSON.stringify(req.attachedDiagnostics.data, null, 2)}
                         </pre>
                       </div>
                     )}
                  </div>
                  <div className="flex items-center gap-4 text-xs font-medium text-slate-500 mb-4">
                     <span className="mono">ID: {req.id.split('_')[1]}</span>
                     <span>Booked: {new Date(req.createdAt).toLocaleString()}</span>
                  </div>

                  {/* TIMELINE */}
                  {req.lifecycleHistory && (
                     <div className="mt-4 pt-4 border-t border-white/5">
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Job Timeline</div>
                        <div className="space-y-3 relative before:absolute before:inset-0 before:ml-1.5 before:-translate-x-px before:h-full before:w-0.5 before:bg-white/10 text-slate-300">
                          {req.lifecycleHistory.map((ev, i) => (
                             <div key={i} className="relative flex items-start gap-3">
                               <div className="w-3 h-3 rounded-full bg-indigo-500 border-2 border-slate-900 mt-1 z-10 shrink-0"></div>
                               <div>
                                  <div className="flex items-center gap-2">
                                     <span className="text-[10px] font-bold text-indigo-400">{ev.status.replace(/_/g, ' ')}</span>
                                     <span className="text-[10px] text-slate-500">{new Date(ev.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                                  </div>
                                  {ev.note && <div className="text-xs text-slate-400 mt-0.5">{ev.note}</div>}
                               </div>
                             </div>
                          ))}
                        </div>
                     </div>
                  )}
               </div>
               
               <div className="flex flex-col gap-2 min-w-[140px] w-full md:w-auto mt-4 md:mt-0 relative">
                  {req.status === RepairRequestStatus.SUBMITTED && (
                     <>
                        <button 
                          onClick={() => handleAction(req, RepairRequestStatus.ACCEPTED, 'ACCEPTED')}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg transition-colors flex items-center justify-center shadow-lg shadow-emerald-500/20"
                        >
                          Accept Job
                        </button>
                        <button 
                          onClick={() => handleAction(req, RepairRequestStatus.PROPOSED_ALTERNATIVE, 'PROPOSED_ALTERNATIVE')}
                          className="px-4 py-2 bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 border border-blue-500/30 rounded-lg text-sm font-medium transition-colors text-center"
                        >
                          Suggest Alternative
                        </button>
                        <button 
                          onClick={() => handleAction(req, RepairRequestStatus.INFO_REQUESTED, 'REQUESTED_MORE_INFO')}
                          className="px-4 py-2 bg-amber-600/20 hover:bg-amber-600/40 text-amber-400 border border-amber-500/30 rounded-lg text-sm font-medium transition-colors text-center"
                        >
                          Request Info
                        </button>
                        <button 
                          onClick={() => handleAction(req, RepairRequestStatus.CANCELLED, 'REJECTED')}
                          className="px-4 py-2 bg-white/5 hover:bg-rose-500/20 hover:text-rose-400 hover:border-rose-500/30 border border-white/10 rounded-lg text-sm font-medium text-slate-300 transition-colors"
                        >
                          Decline
                        </button>
                     </>
                  )}

                  {['ACCEPTED', 'WAITING_PARTS', 'TESTING'].includes(req.status) && (
                     <button 
                       onClick={() => handleAction(req, RepairRequestStatus.IN_PROGRESS, 'NOTE')}
                       className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg transition-colors flex items-center justify-center shadow-lg shadow-indigo-500/20"
                     >
                       {req.status === 'ACCEPTED' ? 'Start Job' : 'Resume Work'}
                     </button>
                  )}

                  {req.status === RepairRequestStatus.IN_PROGRESS && (
                     <>
                        <button 
                          onClick={() => handleAction(req, RepairRequestStatus.WAITING_PARTS, 'NOTE')}
                          className="px-4 py-2 bg-orange-600/20 hover:bg-orange-600/40 text-orange-400 border border-orange-500/30 rounded-lg text-sm font-medium transition-colors text-center"
                        >
                          Wait for Parts
                        </button>
                        <button 
                          onClick={() => handleAction(req, RepairRequestStatus.TESTING, 'NOTE')}
                          className="px-4 py-2 bg-fuchsia-600/20 hover:bg-fuchsia-600/40 text-fuchsia-400 border border-fuchsia-500/30 rounded-lg text-sm font-medium transition-colors text-center"
                        >
                          Begin Testing
                        </button>
                        <button 
                          onClick={() => handleAction(req, RepairRequestStatus.COMPLETED, 'ACCEPTED')}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg transition-colors flex items-center justify-center shadow-lg shadow-emerald-500/20"
                        >
                          Mark Completed
                        </button>
                     </>
                  )}
               </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
