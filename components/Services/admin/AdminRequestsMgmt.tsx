import React, { useState, useEffect } from 'react';
import { db } from '../../../services/db';
import { Role, User, RepairRequest, RepairRequestStatus } from '../../../types';
import { Icons } from '../../../constants';
import { ServiceSummaryView } from '../common/ServiceSummaryView';
import { AdminRequestDetailsPane } from './AdminRequestDetailsPane';
import { AdminRequestRow } from './AdminRequestRow';

export const AdminRequestsMgmt: React.FC = () => {
  const [requests, setRequests] = useState<RepairRequest[]>([]);
  const [technicians, setTechnicians] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [selectedRequest, setSelectedRequest] = useState<RepairRequest | null>(null);
  const [viewingSummary, setViewingSummary] = useState<RepairRequest | null>(null);

  // Load requests & technicians
  const loadData = async () => {
    setLoading(true);
    try {
      const allRequests = await db.getAllRepairRequests();
      const allUsers = await db.getAllUsers();
      
      setRequests(allRequests.sort((a, b) => b.createdAt - a.createdAt));
      setTechnicians(allUsers.filter(u => u.role === Role.TECHNICIAN));

      if (selectedRequest) {
        const freshReq = allRequests.find(r => r.id === selectedRequest.id);
        if (freshReq) {
          setSelectedRequest(freshReq);
        }
      }
    } catch (err) {
      console.error('Error fetching admin requests metadata:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handlePriorityChange = async (req: RepairRequest, newPriority: 'LOW' | 'MEDIUM' | 'HIGH') => {
    const updated: RepairRequest = {
      ...req,
      severityLevel: newPriority,
      updatedAt: Date.now()
    };
    
    // Add lifecycle log trace
    const historyEntry = {
      status: req.status,
      timestamp: Date.now(),
      updatedBy: 'SYSTEM' as const,
      note: `Admin modified priority dispatch factor to ${newPriority}`
    };
    updated.lifecycleHistory = req.lifecycleHistory ? [...req.lifecycleHistory, historyEntry] : [historyEntry];

    try {
      await db.addRepairRequest(updated);
      
      // Also add User history ledger entry
      await db.addUserHistory({
        historyId: `hist_${Date.now()}_${Math.random().toString(36).substr(2,6)}`,
        userId: req.userId,
        type: 'REPAIR_REQUEST' as any,
        referenceId: req.id,
        title: `Dispatch Priority Overridden`,
        summary: `Admin changed severity level of ticket to ${newPriority}`,
        timestamp: Date.now()
      });

      await loadData();
    } catch (err) {
      console.error('Error updating severity priority factor:', err);
    }
  };

  const handleReassignTechnician = async (req: RepairRequest, newTechId: string) => {
    const selectedTech = technicians.find(t => t.id === newTechId);
    if (!selectedTech) return;

    const oldTechName = req.technicianId 
      ? (technicians.find(t => t.id === req.technicianId)?.name || 'Default Tech')
      : 'Unassigned';

    const updated: RepairRequest = {
      ...req,
      technicianId: newTechId,
      isAIOverridden: true,
      // If was submitted/AI triaged, move to TECHNICIAN_ASSIGNED so it enters their queue properly
      status: req.status === RepairRequestStatus.SUBMITTED || req.status === RepairRequestStatus.AI_TRIAGED
        ? RepairRequestStatus.TECHNICIAN_ASSIGNED
        : req.status,
      updatedAt: Date.now()
    };

    const historyEntry = {
      status: updated.status,
      timestamp: Date.now(),
      updatedBy: 'SYSTEM' as const,
      note: `AI Triage Routing Overridden: Reassigned from ${oldTechName} to ${selectedTech.name}`
    };
    updated.lifecycleHistory = req.lifecycleHistory ? [...req.lifecycleHistory, historyEntry] : [historyEntry];

    try {
      await db.addRepairRequest(updated);

      // Add audit history for client
      await db.addUserHistory({
        historyId: `hist_${Date.now()}_${Math.random().toString(36).substr(2,6)}`,
        userId: req.userId,
        type: 'REPAIR_REQUEST' as any,
        referenceId: req.id,
        title: `Technician Reassignment`,
        summary: `Admin overrode AI routing. Reassigned dispatch job to certified engineer: ${selectedTech.name}`,
        timestamp: Date.now()
      });

      // Add notification history for tech
      await db.addUserHistory({
        historyId: `hist_${Date.now()}_${Math.random().toString(36).substr(2,6)}`,
        userId: newTechId,
        type: 'REPAIR_REQUEST' as any,
        referenceId: req.id,
        title: `New Forced Dispatch Assignment`,
        summary: `Admin routed Repair Ticket ID ...${req.id.substring(req.id.length - 6)} to your workshops`,
        timestamp: Date.now()
      });

      await loadData();
    } catch (err) {
      console.error('Error reassigning technician:', err);
    }
  };

  const filteredRequests = requests.filter(r => {
    const matchesSearch = (r.gigTitle || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (r.issueDescription || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (r.userName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          r.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
    const matchesPriority = priorityFilter === 'ALL' || (r.severityLevel || 'MEDIUM') === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  if (viewingSummary) {
    return (
      <ServiceSummaryView 
        req={viewingSummary} 
        onBack={() => setViewingSummary(null)} 
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold text-white tracking-tight">Service Requests Dispatch Manager</h2>
        <p className="text-slate-400 font-medium font-sans">
          Override diagnostic priority indexes, reassign hardware triage technicians, and analyze deep system telemetry payloads.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left column grid */}
        <div className="xl:col-span-2 space-y-4">
          {/* Controls */}
          <div className="glass p-4 rounded-xl border border-white/5 flex flex-col sm:flex-row gap-3 justify-between items-center">
            {/* Search */}
            <div className="relative w-full sm:w-72">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                {Icons.search}
              </span>
              <input
                type="text"
                placeholder="Search ticket text, users, ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-950/50 border border-white/5 rounded-lg text-xs font-semibold text-slate-200 placeholder-slate-500 focus:outline-none focus:border-rose-500/50 transition-colors"
              />
            </div>
            
            {/* Dropdown Filters */}
            <div className="flex gap-2 w-full sm:w-auto">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="flex-1 sm:flex-none px-3 py-2 bg-slate-950/50 border border-white/5 rounded-lg text-xs font-semibold text-slate-300 focus:outline-none focus:border-rose-500/50"
              >
                <option value="ALL">All Status</option>
                <option value="SUBMITTED">Submitted</option>
                <option value="TECHNICIAN_ASSIGNED">Assigned Tech</option>
                <option value="ACCEPTED">Accepted</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed SLA</option>
                <option value="CANCELLED">Cancelled</option>
              </select>

              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="flex-1 sm:flex-none px-3 py-2 bg-slate-950/50 border border-white/5 rounded-lg text-xs font-semibold text-slate-300 focus:outline-none focus:border-rose-500/50"
              >
                <option value="ALL">All Priority</option>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>
          </div>

          {/* List display */}
          {loading ? (
            <div className="p-8 text-center text-slate-500 font-medium">Downloading SLA ledger queues...</div>
          ) : filteredRequests.length === 0 ? (
            <div className="p-12 text-center glass rounded-xl border border-white/5">
              <p className="text-sm text-slate-500 font-medium">No service tickets matching filters exist on current node.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredRequests.map(req => (
                <AdminRequestRow
                  key={req.id}
                  req={req}
                  isSelected={selectedRequest?.id === req.id}
                  assignedTech={technicians.find(t => t.id === req.technicianId)}
                  onSelect={() => setSelectedRequest(req)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right Detail Overrides Pane */}
        <div>
          {selectedRequest ? (
            <AdminRequestDetailsPane
              selectedRequest={selectedRequest}
              onClear={() => setSelectedRequest(null)}
              onPriorityChange={handlePriorityChange}
              onReassignTechnician={handleReassignTechnician}
              onViewSummary={setViewingSummary}
              technicians={technicians}
              requests={requests}
            />
          ) : (
            <div className="glass rounded-xl border border-white/5 p-8 text-center text-slate-500 space-y-2.5">
              <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center mx-auto text-slate-400">
                {Icons.settings}
              </div>
              <p className="text-xs font-medium max-w-[200px] mx-auto font-sans">
                Select a service ticket request row to overwrite automated AI dispatches, adjust ticket priority weightings, or examine deep diagnostic Snapshots.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
