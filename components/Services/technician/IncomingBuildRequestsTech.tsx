import React, { useState, useEffect } from 'react';
import { db } from '../../../services/db';
import { useAuth } from '../../Layout/AuthProvider';
import { BuildRequestStatus } from '../../../types';
import { Icons } from '../../../constants';

export const IncomingBuildRequestsTech: React.FC = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<any[]>([]);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    const allReqs = await db.getAllPCBuildRequests();
    setRequests(allReqs.sort((a, c) => c.createdAt - a.createdAt));
  };

  const updateStatus = async (req: any, status: BuildRequestStatus) => {
    req.status = status;
    req.updatedAt = Date.now();
    await db.addPCBuildRequest(req);
    
    // Attempt to sync back to PCBuild if we had relational linkage, but given local db constraints 
    // we'll update the corresponding PCBuild in pc_builds if the user hasn't modified it
    const userBuilds = await db.getPCBuildsByUser(req.userId);
    const linkedBuild = userBuilds.find(b => b.buildName === req.buildName);
    if (linkedBuild) {
      linkedBuild.status = status;
      await db.addPCBuild(linkedBuild);
    }
    
    await db.addUserHistory({
      historyId: `hist_${Date.now()}_${Math.random().toString(36).substr(2,6)}`,
      userId: req.userId,
      type: 'PC_BUILD',
      referenceId: req.id,
      title: `Build Request: ${status.replace('_', ' ')}`,
      summary: `Your requested build '${req.buildName}' has been updated to ${status.replace('_', ' ')} by technician ${user?.name}.`,
      timestamp: Date.now()
    });

    loadRequests();
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-white tracking-tight">Incoming Build Requests</h2>
        <p className="text-slate-400">Review custom PC build lists submitted by users. Provide feedback, approve parts, or reject mismatched systems.</p>
      </div>

      <div className="grid gap-6">
        {requests.length === 0 ? (
          <div className="text-center p-12 text-slate-500 border border-dashed border-white/10 rounded-2xl">
            No incoming build requests.
          </div>
        ) : requests.map(req => (
          <div key={req.id} className="glass p-6 rounded-2xl border border-white/5 relative overflow-hidden flex flex-col md:flex-row gap-6">
             <div className="flex-1 space-y-4">
                <div className="flex items-start justify-between">
                   <div>
                      <h3 className="text-xl font-bold text-white mb-1">{req.buildName}</h3>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-slate-500">Submitted {new Date(req.createdAt).toLocaleString()}</span>
                        <div className="flex gap-1.5 items-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-widest uppercase ${
                            req.status === BuildRequestStatus.SUBMITTED ? 'bg-indigo-500/20 text-indigo-400' :
                            req.status === BuildRequestStatus.APPROVED ? 'bg-emerald-500/20 text-emerald-400' :
                            req.status === BuildRequestStatus.REJECTED ? 'bg-rose-500/20 text-rose-400' :
                            'bg-slate-500/20 text-slate-400'
                          }`}>
                            {req.status}
                          </span>
                        </div>
                      </div>
                   </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-3 gap-y-4 gap-x-6 bg-[#020617]/50 rounded-xl p-4 border border-white/5 text-sm">
                   <div><span className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Processor</span> <span className="text-slate-200">{req.components.cpu}</span></div>
                   <div><span className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Graphics</span> <span className="text-slate-200">{req.components.gpu}</span></div>
                   <div><span className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Motherboard</span> <span className="text-slate-200">{req.components.motherboard}</span></div>
                   <div><span className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Memory</span> <span className="text-slate-200">{req.components.ram}</span></div>
                   <div><span className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Storage</span> <span className="text-slate-200">{req.components.storage}</span></div>
                   <div><span className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Power Supply</span> <span className="text-slate-200">{req.components.powerSupply}</span></div>
                </div>
                
                {req.userNotes && (
                   <div className="text-sm p-4 border-l-2 border-indigo-500 bg-indigo-500/5 text-slate-300 italic">
                     "{req.userNotes}"
                   </div>
                )}
             </div>

             <div className="w-full md:w-72 shrink-0 space-y-4 flex flex-col justify-between">
                <div>
                   <div className="bg-[#020617]/80 p-4 rounded-xl border border-white/5 space-y-3">
                      <div>
                        <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500">System Compatibility</span>
                        <div className={`mt-1 text-sm font-bold ${req.compatibilityStatus === 'PASS' ? 'text-emerald-400' : req.compatibilityStatus === 'WARNING' ? 'text-amber-400' : 'text-rose-400'}`}>
                           {req.compatibilityStatus}
                        </div>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500">Performance Score</span>
                        <div className={`mt-1 text-xl font-bold ${req.performanceScore >= 80 ? 'text-emerald-400' : req.performanceScore >= 50 ? 'text-amber-400' : 'text-rose-400'}`}>
                           {req.performanceScore}/100
                        </div>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500">Cost Estimate</span>
                        <div className="mt-1 text-xl font-bold text-slate-200">
                           ${req.estimatedCostUSD}
                        </div>
                      </div>
                   </div>
                </div>

                <div className="flex flex-col gap-2">
                   {req.status === BuildRequestStatus.SUBMITTED && (
                     <>
                       <button onClick={() => updateStatus(req, BuildRequestStatus.APPROVED)} className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium text-sm transition-colors">
                         Approve Build
                       </button>
                       <button onClick={() => updateStatus(req, BuildRequestStatus.REJECTED)} className="w-full py-2.5 bg-rose-600/20 text-rose-400 hover:bg-rose-600/40 border border-rose-500/30 rounded-lg font-medium text-sm transition-colors">
                         Reject & Request Changes
                       </button>
                     </>
                   )}
                   {req.status === BuildRequestStatus.APPROVED && (
                     <button onClick={() => updateStatus(req, BuildRequestStatus.IN_PROGRESS)} className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium text-sm transition-colors">
                       Mark "In Progress"
                     </button>
                   )}
                   {req.status === BuildRequestStatus.IN_PROGRESS && (
                     <button onClick={() => updateStatus(req, BuildRequestStatus.COMPLETED)} className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium text-sm transition-colors">
                       Mark Completed
                     </button>
                   )}
                </div>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};
