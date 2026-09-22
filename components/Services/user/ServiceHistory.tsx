import React, { useState, useEffect } from 'react';
import { db } from '../../../services/db';
import { useAuth } from '../../Layout/AuthProvider';
import { UserHistory, RepairRequest, RepairRequestStatus } from '../../../types';
import { Icons } from '../../../constants';
import { ServiceSummaryView } from '../common/ServiceSummaryView';

export const ServiceHistory: React.FC = () => {
  const { user } = useAuth();
  const [history, setHistory] = useState<UserHistory[]>([]);
  const [completedRequests, setCompletedRequests] = useState<RepairRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<RepairRequest | null>(null);

  useEffect(() => {
    if (user?.id) {
      loadHistory();
    }
  }, [user]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      // Fetch all system history for this user
      const userHist = await db.getUserHistory(user!.id);
      // Filter specifically for service center or repair records
      const filteredHist = userHist.filter(h => h.type === 'REPAIR_REQUEST' || h.type === 'PC_BUILD');
      setHistory(filteredHist);

      // Also get all actual historic repair request records that are COMPLETED or CANCELLED
      const allRequests = await db.getRepairRequestsByUser(user!.id);
      const finished = allRequests.filter(req => 
        req.status === RepairRequestStatus.COMPLETED || 
        req.status === RepairRequestStatus.CANCELLED
      );
      setCompletedRequests(finished.sort((a, b) => b.updatedAt - a.updatedAt));
    } catch (err) {
      console.error('Error loading service history:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusStyle = (status: RepairRequestStatus) => {
    if (status === RepairRequestStatus.COMPLETED) {
      return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
    }
    return 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
  };

  if (selectedRequest) {
    return (
      <ServiceSummaryView 
        req={selectedRequest} 
        onBack={() => setSelectedRequest(null)} 
      />
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-white tracking-tight">Service & Request History</h2>
        <p className="text-slate-400">View and audit all historical repair requests, resolved SLAs, and active ledger updates.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Completed Repair Operations */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-lg font-medium text-white flex items-center gap-2">
            <span className="p-1 rounded bg-emerald-500/10 text-emerald-400">{Icons.briefcase}</span>
            Resolved Service Requests
          </h3>

          {loading ? (
            <div className="p-8 text-center text-slate-500">Loading historical files...</div>
          ) : completedRequests.length === 0 ? (
            <div className="p-12 text-center glass rounded-2xl border border-white/5 space-y-3">
              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto text-slate-500">
                {Icons.briefcase}
              </div>
              <p className="text-sm text-slate-500 font-medium">No historically resolved sessions in database.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {completedRequests.map(req => (
                <div key={req.id} className="glass rounded-xl p-5 border border-white/5 space-y-4 hover:border-white/10 transition-colors">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-lg font-bold text-slate-100">{req.gigTitle || 'Diagnostic Resolution'}</h4>
                      <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                        <span>ID: {req.id.split('_')[1] || req.id}</span>
                        <span>•</span>
                        <span>SLA Resolved: {new Date(req.updatedAt).toLocaleString()}</span>
                      </div>
                    </div>
                    <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${getStatusStyle(req.status)}`}>
                      {req.status}
                    </span>
                  </div>

                  <div className="text-sm text-slate-400 bg-black/20 p-3 rounded-lg border border-white/5">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Issue Overview & Diagnostics</span>
                    <p>{req.issueDescription}</p>
                  </div>

                  {req.technicianNote && (
                    <div className="p-3.5 bg-indigo-500/5 rounded-lg border-l-2 border-indigo-400 text-sm text-slate-300 italic">
                      <span className="block font-sans text-[10px] font-bold uppercase tracking-wider text-indigo-400 not-italic mb-1">Technician Resolution Entry:</span>
                      "{req.technicianNote}"
                    </div>
                  )}

                  {req.status === RepairRequestStatus.COMPLETED && (
                    <div className="flex justify-end pt-1">
                      <button
                        onClick={() => setSelectedRequest(req)}
                        className="px-4 py-1.5 bg-indigo-600/30 hover:bg-indigo-600 text-indigo-200 hover:text-white text-xs font-bold rounded-lg border border-indigo-500/30 transition-all flex items-center gap-1.5 shadow-md active:scale-95 cursor-pointer"
                      >
                        📊 View Repair Cost & Handover Report
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right column - Audit Timeline Log */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-white flex items-center gap-2">
            <span className="p-1 rounded bg-indigo-500/10 text-indigo-400">{Icons.activity}</span>
            System SLA Ledger
          </h3>

          <div className="glass p-5 rounded-2xl border border-white/5 relative">
            <div className="space-y-5 relative before:absolute before:inset-0 before:ml-4 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-white/10 before:to-transparent">
              {loading ? (
                <div className="p-4 text-center text-slate-500 text-sm">Loading audit logs...</div>
              ) : history.length === 0 ? (
                <div className="text-center p-4 text-slate-500 font-medium text-sm">No historical service trails registered.</div>
              ) : (
                history.map((item) => (
                  <div key={item.historyId} className="relative flex items-start gap-3">
                    <div className="z-10 bg-[#020617] p-1.5 rounded-full border border-white/10 shadow-sm text-slate-400 text-xs shrink-0 max-w-[28px]">
                      {item.type === 'PC_BUILD' ? Icons.monitor : Icons.briefcase}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] font-semibold text-slate-500">{new Date(item.timestamp).toLocaleDateString()}</span>
                      <h5 className="text-sm font-bold text-white truncate leading-snug">{item.title}</h5>
                      <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{item.summary}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
