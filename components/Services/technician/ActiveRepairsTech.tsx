import React, { useState, useEffect } from 'react';
import { db } from '../../../services/db';
import { RepairRequest, RepairRequestStatus, ServiceCompletionReport } from '../../../types';
import { useAuth } from '../../Layout/AuthProvider';
import { Icons } from '../../../constants';
import { ServiceCompletionModal } from './ServiceCompletionModal';

export const ActiveRepairsTech: React.FC = () => {
  const { session } = useAuth();
  const [repairs, setRepairs] = useState<RepairRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRepairForCompletion, setSelectedRepairForCompletion] = useState<RepairRequest | null>(null);

  const loadRepairs = async () => {
    if (session?.userId) {
      setLoading(true);
      try {
        const reqs = await db.getRepairRequestsByTechnician(session.userId);
        const filtered = reqs.filter(r => 
          r.status === RepairRequestStatus.IN_PROGRESS || 
          r.status === RepairRequestStatus.WAITING_PARTS ||
          r.status === RepairRequestStatus.TESTING
        );
        setRepairs(filtered.sort((a, b) => b.updatedAt - a.updatedAt));
      } catch (err) {
        console.error('Error loading active repairs:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    loadRepairs();
  }, [session]);

  const handleCompletionSubmit = async (report: ServiceCompletionReport, techImages: string[]) => {
    if (!selectedRepairForCompletion) return;
    const req = selectedRepairForCompletion;

    const status = RepairRequestStatus.COMPLETED;
    const historyEntry = {
      status,
      timestamp: Date.now(),
      updatedBy: 'TECHNICIAN' as const,
      note: report.workNotes || `Technician completed the repair job successfully.`
    };

    const updatedHistory = req.lifecycleHistory ? [...req.lifecycleHistory, historyEntry] : [historyEntry];
    const sla = { ...req.sla } as any;
    if (!sla.actualCompletionTime) {
      sla.actualCompletionTime = Date.now();
    }

    try {
      await db.addRepairRequest({
        ...req,
        status,
        techImages,
        completionReport: report,
        lifecycleHistory: updatedHistory,
        sla,
        updatedAt: Date.now()
      });

      // Save to technician_actions store
      const techAction = {
        id: `action_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        repairRequestId: req.id,
        technicianId: session?.userId || '',
        actionType: 'JOB_COMPLETE_REPORT',
        data: report,
        timestamp: Date.now()
      };
      await db.addTechnicianAction(techAction);

      // Add to user history ledger
      await db.addUserHistory({
        historyId: `hist_${Date.now()}_${Math.random().toString(36).substr(2,6)}`,
        userId: req.userId,
        type: 'REPAIR_REQUEST',
        referenceId: req.id,
        title: `Repair Services Completed`,
        summary: `Job completed! Part of the work: ${report.workNotes}. Total invoice: $${report.totalCost}`,
        timestamp: Date.now()
      });

      setSelectedRepairForCompletion(null);
      loadRepairs();
    } catch (err) {
      console.error('Error submitting service completion:', err);
    }
  };

  const handleAction = async (req: RepairRequest, status: RepairRequestStatus) => {
    const note = prompt(`Enter work log comments for status change to [${status.replace('_', ' ')}]:`);
    if (note === null) return; // User cancelled

    const historyEntry = {
      status,
      timestamp: Date.now(),
      updatedBy: 'TECHNICIAN' as const,
      note: note || `Technician moved repair state to ${status.replace('_', ' ')}`
    };

    const updatedHistory = req.lifecycleHistory ? [...req.lifecycleHistory, historyEntry] : [historyEntry];
    const sla = { ...req.sla } as any;
    if (status === RepairRequestStatus.COMPLETED && !sla.actualCompletionTime) {
      sla.actualCompletionTime = Date.now();
    }

    await db.addRepairRequest({
      ...req,
      status,
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
      title: `Active Repair Milestone: ${status.replace('_', ' ')}`,
      summary: note ? `Progress comment: ${note}` : `State transitioned to ${status.replace('_', ' ')}`,
      timestamp: Date.now()
    });

    loadRepairs();
  };

  const getStatusBadge = (status: RepairRequestStatus) => {
    switch (status) {
      case RepairRequestStatus.IN_PROGRESS:
        return 'bg-amber-500/10 text-amber-400 border border-amber-500/30';
      case RepairRequestStatus.WAITING_PARTS:
        return 'bg-orange-500/10 text-orange-400 border border-orange-500/20';
      case RepairRequestStatus.TESTING:
        return 'bg-fuchsia-500/10 text-fuchsia-400 border border-fuchsia-500/20';
      default:
        return 'bg-slate-500/10 text-slate-300';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-white tracking-tight">Active Repairs Workshop</h2>
        <p className="text-slate-400">Track and log daily milestones for hardware assemblies, kernel repairs, and performance adjustments in progress.</p>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="p-8 text-center text-slate-500">Opening active workshop bench...</div>
        ) : repairs.length === 0 ? (
          <div className="p-12 text-center glass rounded-2xl border border-white/5 space-y-3">
             <div className="w-12 h-12 rounded-full bg-slate-850/50 text-slate-500 flex items-center justify-center mx-auto">
               ✓
             </div>
             <p className="text-sm text-slate-500 font-medium">All systems normal. No active repairs require service.</p>
          </div>
        ) : (
          repairs.map(rep => (
            <div key={rep.id} className="glass rounded-2xl p-6 border border-white/5 flex flex-col lg:flex-row gap-6 justify-between items-start lg:items-center">
              <div className="flex-1 space-y-4 min-w-0">
                 <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-xs text-indigo-400 font-mono font-bold tracking-widest bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/10">ID: {rep.id.split('_')[1]}</span>
                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${getStatusBadge(rep.status)}`}>
                       {rep.status.replace(/_/g, ' ')}
                    </span>
                 </div>

                 <div>
                    <h3 className="text-lg font-bold text-slate-100">{rep.gigTitle || 'Diagnostic Service Tuning'}</h3>
                    <p className="text-sm text-slate-400 mt-1 max-w-2xl">{rep.issueDescription}</p>
                 </div>

                 {rep.attachedDiagnostics && (
                   <div className="bg-[#020617]/50 rounded-xl p-3.5 border border-white/5 text-xs text-slate-400 flex justify-between items-center">
                      <span className="font-semibold text-indigo-400">Attached telemetries: {rep.attachedDiagnostics.sourceModule}</span>
                      <span className="mono">UUID: ...{rep.attachedDiagnostics.id.substring(12, 18)}</span>
                   </div>
                 )}
              </div>

              <div className="w-full lg:w-64 flex flex-col gap-2 shrink-0 border-t lg:border-t-0 lg:border-l border-white/5 pt-4 lg:pt-0 lg:pl-6">
                 {rep.status !== RepairRequestStatus.IN_PROGRESS && (
                    <button 
                      onClick={() => handleAction(rep, RepairRequestStatus.IN_PROGRESS)}
                      className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg text-xs transition-colors"
                    >
                      Resume Assembly
                    </button>
                 )}
                 {rep.status !== RepairRequestStatus.WAITING_PARTS && (
                    <button 
                      onClick={() => handleAction(rep, RepairRequestStatus.WAITING_PARTS)}
                      className="w-full py-2 bg-orange-600/20 hover:bg-orange-600/40 text-orange-400 border border-orange-500/20 rounded-lg text-xs font-semibold transition-all"
                    >
                      Hold for Spare Parts
                    </button>
                 )}
                 {rep.status !== RepairRequestStatus.TESTING && (
                    <button 
                      onClick={() => handleAction(rep, RepairRequestStatus.TESTING)}
                      className="w-full py-2 bg-fuchsia-600/20 hover:bg-fuchsia-600/40 text-fuchsia-400 border border-fuchsia-500/20 rounded-lg text-xs font-semibold transition-all"
                    >
                      Stress Testing
                    </button>
                 )}
                 <button 
                   onClick={() => setSelectedRepairForCompletion(rep)}
                   className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs transition-colors shadow-lg active:scale-95"
                 >
                    Complete Report & Handover
                 </button>
              </div>
            </div>
          ))
        )}
      </div>

      {selectedRepairForCompletion && (
        <ServiceCompletionModal
          isOpen={!!selectedRepairForCompletion}
          onClose={() => setSelectedRepairForCompletion(null)}
          onSubmit={handleCompletionSubmit}
          req={selectedRepairForCompletion}
        />
      )}
    </div>
  );
};
