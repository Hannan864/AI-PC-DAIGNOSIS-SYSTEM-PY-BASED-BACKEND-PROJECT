import React, { useState, useEffect } from 'react';
import { Icons } from '../../../constants';
import { User, RepairRequest, RepairRequestStatus } from '../../../types';
import { db } from '../../../services/db';

export const UserDashboard = ({ user }: { user: User }) => {
  const [stats, setStats] = useState({
    activeCount: 0,
    historyCount: 0,
    assignedTech: null as string | null
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        await db.init();
        const requests = await db.getRepairRequestsByUser(user.id);
        
        const activeCount = requests.filter(r => 
          r.status !== RepairRequestStatus.COMPLETED && 
          r.status !== RepairRequestStatus.CANCELLED
        ).length;
        
        const historyCount = requests.filter(r => 
          r.status === RepairRequestStatus.COMPLETED || 
          r.status === RepairRequestStatus.CANCELLED
        ).length;

        const assignedRequest = requests.find(r => r.technicianId && r.status !== RepairRequestStatus.COMPLETED);
        
        setStats({
          activeCount,
          historyCount,
          assignedTech: assignedRequest ? (assignedRequest.technicianId || 'Hardware Specialist') : null
        });
      } catch (err) {
        console.error("Dashboard data load failure:", err);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, [user.id]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-white tracking-tight">Welcome, {user.name}</h2>
          <p className="text-slate-400">Manage your repair requests and status.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <div className="glass rounded-xl p-5 md:p-6 border border-white/5 flex flex-col">
           <div className="flex items-center gap-3 mb-4">
             <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg">{Icons.activity}</div>
             <h3 className="font-semibold text-white">Active Requests</h3>
           </div>
           <div className="text-2xl md:text-3xl font-bold text-white mb-1">{stats.activeCount}</div>
           <p className="text-xs md:text-sm text-slate-500">Currently being serviced</p>
        </div>
        <div className="glass rounded-xl p-5 md:p-6 border border-white/5 flex flex-col">
           <div className="flex items-center gap-3 mb-4">
             <div className="p-2 bg-blue-500/20 text-blue-400 rounded-lg">{Icons.clipboard}</div>
             <h3 className="font-semibold text-white">Service History</h3>
           </div>
           <div className="text-2xl md:text-3xl font-bold text-white mb-1">{stats.historyCount}</div>
           <p className="text-xs md:text-sm text-slate-500">Past repairs and diagnostics</p>
        </div>
        <div className="glass rounded-xl p-5 md:p-6 border border-white/5 flex flex-col sm:col-span-2 lg:col-span-1">
           <div className="flex items-center gap-3 mb-4">
             <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-lg">{Icons.userCheck}</div>
             <h3 className="font-semibold text-white">Assigned Technician</h3>
           </div>
           {stats.assignedTech ? (
             <div className="flex flex-col">
               <span className="text-white font-medium">{stats.assignedTech}</span>
               <span className="text-[10px] text-indigo-400 uppercase font-bold tracking-widest mt-1">Active Assignment</span>
             </div>
           ) : (
             <div className="flex-1 flex items-center justify-center text-sm text-slate-500 italic">
               No active technician
             </div>
           )}
        </div>
      </div>
      
      <div className="glass rounded-xl border border-white/5 overflow-hidden">
        <div className="p-4 border-b border-white/5 bg-white/5">
          <h3 className="font-semibold text-white">Recent Activity</h3>
        </div>
        <div className="p-8 text-center text-slate-500">
          {stats.activeCount + stats.historyCount === 0 
            ? "No recent repair activity found." 
            : "Platform telemetry synchronized. View your active requests or history tabs for details."}
        </div>
      </div>
    </div>
  );
};
