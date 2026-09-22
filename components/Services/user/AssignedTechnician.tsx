import React, { useState, useEffect } from 'react';
import { db } from '../../../services/db';
import { useAuth } from '../../Layout/AuthProvider';
import { RepairRequest, RepairRequestStatus } from '../../../types';
import { Icons } from '../../../constants';

export const AssignedTechnician: React.FC = () => {
  const { user } = useAuth();
  const [activeRequest, setActiveRequest] = useState<RepairRequest | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      loadLatestTechnician();
    }
  }, [user]);

  const loadLatestTechnician = async () => {
    try {
      setLoading(true);
      const reqs = await db.getRepairRequestsByUser(user!.id);
      
      // Find the latest request with an assigned technician
      const withTech = reqs
        .filter(r => r.technicianId)
        .sort((a, b) => b.createdAt - a.createdAt);
        
      if (withTech.length > 0) {
        setActiveRequest(withTech[0]); // Take the absolute latest assigned technician
      }
    } catch (err) {
      console.error('Error loading assigned technician:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusLabelColor = (status: RepairRequestStatus) => {
    switch (status) {
      case RepairRequestStatus.SUBMITTED:
      case RepairRequestStatus.AI_TRIAGED:
        return 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20';
      case RepairRequestStatus.IN_PROGRESS:
      case RepairRequestStatus.TESTING:
        return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
      case RepairRequestStatus.COMPLETED:
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      default:
        return 'text-slate-400 bg-slate-400/10 border-white/5';
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Checking active staff rosters...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-white tracking-tight">Your Assigned Technician</h2>
        <p className="text-slate-400">Review credential profiles, active repair workloads, and messaging from your assigned system engineers.</p>
      </div>

      {!activeRequest ? (
        <div className="glass p-8 md:p-12 rounded-2xl border border-white/5 text-center max-w-xl mx-auto space-y-5">
          <div className="w-16 h-16 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto border border-indigo-500/20">
            {Icons.users || Icons.user}
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-white">No Active Tech Assigned</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              You do not have a technician actively assigned to your diagnostic profile. You can initiate a diagnostics-based repair snapshot or discover available technician gigs on the marketplace.
            </p>
          </div>
          <div className="pt-2">
            <span className="text-xs text-slate-500 font-medium block mb-4">Select "Browse Gigs" from the sidebar to look over available services.</span>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Technician Credential Card */}
          <div className="glass p-6 rounded-2xl border border-white/5 flex flex-col justify-between space-y-6 relative overflow-hidden bg-indigo-500/5">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl"></div>
            
            <div className="space-y-4 relative">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center font-bold text-lg text-white font-sans shrink-0 border border-white/10">
                  {activeRequest.userName?.substring(0, 2).toUpperCase() || 'TC'}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white leading-tight">{activeRequest.userName || 'Assigned Technician'}</h3>
                  <span className="text-xs text-indigo-400 font-semibold tracking-wider uppercase">Lead Repair Engineer</span>
                </div>
              </div>

              <div className="border-t border-white/5 pt-4 space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 font-medium">Gig Assigned:</span>
                  <span className="text-slate-200 font-bold truncate max-w-[150px]">{activeRequest.gigTitle || 'Expert System Triage'}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 font-medium">Liaison Area:</span>
                  <span className="text-indigo-400 font-bold">Remote Telemetry</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 font-medium">Security Status:</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-400 uppercase font-bold tracking-wider">Certified</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/5 text-xs text-slate-500 leading-relaxed">
              This engineer is bound by our real-time SLA metrics to complete your system optimization on schedule.
            </div>
          </div>

          {/* Connected Request Breakdown Card */}
          <div className="md:col-span-2 glass p-6 rounded-2xl border border-white/5 space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-start justify-between flex-wrap gap-2">
                <div>
                  <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest block mb-1">Assigned Task Ticket</span>
                  <h4 className="text-lg font-bold text-white">{activeRequest.gigTitle || 'Diagnostic Maintenance'}</h4>
                </div>
                <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider border ${getStatusLabelColor(activeRequest.status)}`}>
                  Job State: {activeRequest.status.replace(/_/g, ' ')}
                </span>
              </div>

              <div className="bg-[#020617]/60 p-4 rounded-xl border border-white/5 space-y-3 text-sm">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Issue Reported</span>
                  <p className="text-slate-200 font-medium mt-0.5">{activeRequest.issueDescription}</p>
                </div>
                <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-3">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Estimated Start</span>
                    <span className="block text-slate-300 font-semibold mt-0.5">
                      {activeRequest.sla?.estimatedStartTime ? new Date(activeRequest.sla.estimatedStartTime).toLocaleString() : 'Immediate Triage'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Priority Group</span>
                    <span className="block text-slate-300 font-semibold mt-0.5">{activeRequest.severityLevel || 'NORMAL'}</span>
                  </div>
                </div>
              </div>

              {activeRequest.technicianNote && (
                <div className="p-3 bg-indigo-500/5 rounded-lg border-l-2 border-indigo-400 text-sm text-slate-300 italic">
                  <span className="block text-[10px] uppercase font-bold tracking-widest text-indigo-400 not-italic mb-1">Notes from Tech:</span>
                  "{activeRequest.technicianNote}"
                </div>
              )}
            </div>

            <div className="text-xs text-slate-500 italic">
              Need real-time status details? Navigate to the <span className="text-indigo-400 font-bold border-b border-indigo-400/20 pb-0.5">Active Requests</span> panel for live SLA timeline updates.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
