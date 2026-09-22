import React, { useState, useEffect } from 'react';
import { db } from '../../../services/db';
import { RepairRequest, RepairRequestStatus } from '../../../types';
import { useAuth } from '../../Layout/AuthProvider';
import { Icons } from '../../../constants';

export const ActiveRequestsUser = () => {
  const { session } = useAuth();
  const [requests, setRequests] = useState<RepairRequest[]>([]);

  useEffect(() => {
    const loadRequests = async () => {
      if (session?.userId) {
        const reqs = await db.getRepairRequestsByUser(session.userId);
        setRequests(reqs.sort((a, b) => b.createdAt - a.createdAt));
      }
    };
    loadRequests();
  }, [session]);

  const getStatusBadge = (status: RepairRequestStatus) => {
    switch (status) {
      case RepairRequestStatus.SUBMITTED: return <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest bg-slate-500/20 text-slate-300 border border-slate-500/30">Pending</span>;
      case RepairRequestStatus.AI_TRIAGED: return <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest bg-blue-500/20 text-blue-400 border border-blue-500/30">AI Triaged</span>;
      case RepairRequestStatus.GIG_SELECTED: return <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Gig Selected</span>;
      case RepairRequestStatus.TECHNICIAN_ASSIGNED: return <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">Technician Assigned</span>;
      case RepairRequestStatus.ACCEPTED: return <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">Accepted</span>;
      case RepairRequestStatus.IN_PROGRESS: return <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest bg-amber-500/20 text-amber-400 border border-amber-500/30">In Progress</span>;
      case RepairRequestStatus.WAITING_PARTS: return <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest bg-orange-500/20 text-orange-400 border border-orange-500/30">Waiting Parts</span>;
      case RepairRequestStatus.TESTING: return <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest bg-fuchsia-500/20 text-fuchsia-400 border border-fuchsia-500/30">Testing</span>;
      case RepairRequestStatus.COMPLETED: return <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Completed</span>;
      case RepairRequestStatus.CANCELLED: return <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest bg-rose-500/20 text-rose-400 border border-rose-500/30">Cancelled</span>;
      case RepairRequestStatus.INFO_REQUESTED: return <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest bg-amber-500/20 text-amber-400 border border-amber-500/30">Action Needed</span>;
      case RepairRequestStatus.PROPOSED_ALTERNATIVE: return <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest bg-purple-500/20 text-purple-400 border border-purple-500/30">Alternative Proposed</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-white tracking-tight">Active Requests</h2>
        <p className="text-slate-400">Track and manage your ongoing repair orders.</p>
      </div>

      <div className="space-y-4">
        {requests.length === 0 ? (
           <div className="p-12 text-center glass rounded-xl border border-white/5">
             <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4 text-slate-400">
                {Icons.activity}
             </div>
             <h3 className="text-lg font-semibold text-white mb-1">No Active Requests</h3>
             <p className="text-slate-500">You don't have any ongoing repair jobs.</p>
           </div>
        ) : (
          requests.map(req => (
            <div key={req.id} className="glass rounded-xl p-5 border border-white/5 flex flex-col md:flex-row gap-6 items-start md:items-center">
               <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                     <h3 className="text-lg font-semibold text-white tracking-tight">{req.gigTitle || `Auto-Routed: ${req.issueCategory || 'General Issue'}`}</h3>
                     {getStatusBadge(req.status)}
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
                     </div>
                  )}

                  <p className="text-sm text-slate-400 mb-3">{req.issueDescription}</p>
                  <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-500 mb-2">
                     <span className="mono">ID: {req.id.split('_')[1]}</span>
                     <span>Requested: {new Date(req.createdAt).toLocaleDateString()}</span>
                  </div>
                  {req.attachedDiagnostics && (
                     <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-[10px] uppercase tracking-widest font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mr-2">
                       <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                       Diagnostic Attached
                     </div>
                  )}
                  {req.isAIOverridden && (
                     <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-[10px] uppercase tracking-widest font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                       <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
                       AI Overridden
                     </div>
                  )}

                  {req.technicianDecision && req.technicianNote && (
                     <div className="mt-4 p-3 bg-[#020617]/50 rounded-lg border border-blue-500/20 relative">
                        <div className="text-[10px] uppercase tracking-widest font-bold text-blue-400 mb-1">
                           Technician Update: {req.technicianDecision.replace('_', ' ')}
                        </div>
                        <p className="text-sm text-slate-300 relative z-10">{req.technicianNote}</p>
                     </div>
                  )}

                  {/* LIVE TRACKING PANEL */}
                  <div className="mt-6 border-t border-white/5 pt-5">
                    <div className="flex items-center justify-between mb-4">
                       <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                         <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                         Live Repair Progress
                       </h4>
                       {req.sla?.estimatedCompletionTime && req.status !== RepairRequestStatus.COMPLETED && (
                         <div className="text-[10px] bg-white/5 px-2 py-1 rounded text-slate-400 font-medium">
                           Est. Completion: {new Date(req.sla.estimatedCompletionTime).toLocaleString()}
                         </div>
                       )}
                    </div>
                    
                    <div className="space-y-4 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent">
                      {req.lifecycleHistory?.slice().reverse().map((event, i) => (
                         <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                           <div className="flex items-center justify-center w-5 h-5 rounded-full border-2 border-slate-900 bg-indigo-500 text-slate-900 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                              {i === 0 && <span className="w-1.5 h-1.5 bg-white rounded-full"></span>}
                           </div>
                           <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] glass p-3 rounded-lg border border-white/5 shadow-sm">
                             <div className="flex items-center justify-between mb-1">
                               <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">{event.status.replace(/_/g, ' ')}</span>
                               <span className="text-[10px] text-slate-500 font-medium">{new Date(event.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                             </div>
                             {event.note && <p className="text-sm text-slate-300 mt-1">{event.note}</p>}
                             <p className="text-[10px] text-slate-500 mt-1">Updated by: {event.updatedBy}</p>
                           </div>
                         </div>
                      ))}
                    </div>
                  </div>
               </div>
               
               <div className="flex flex-col gap-2 md:items-end min-w-[150px]">
                  <button className="px-4 py-2 w-full bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm font-medium text-white transition-colors">
                    View Details
                  </button>
                  {req.status === RepairRequestStatus.SUBMITTED && (
                    <button className="px-4 py-2 w-full bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 rounded-lg text-sm font-medium text-rose-400 transition-colors">
                      Cancel Request
                    </button>
                  )}
               </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
