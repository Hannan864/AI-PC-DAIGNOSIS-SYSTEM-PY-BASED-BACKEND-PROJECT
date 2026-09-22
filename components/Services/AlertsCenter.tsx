
import React, { useState, useEffect } from 'react';
import { db } from '../../services/db';
import { Alert } from '../../types';

const AlertsCenter: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    const fetch = async () => {
      const data = await db.getAlerts();
      if (data.length === 0) {
        // Initial Pro Alerts if none exist
        const initial: Alert[] = [
          { id: 'a1', title: 'High Memory Pressure', message: 'System memory utilization exceeded 90%. Suggestions: Purge background caches.', severity: 'critical', timestamp: Date.now(), service: 1 as any, actionable: true },
          { id: 'a2', title: 'Disk Capacity Warning', message: 'Volume C: has less than 10GB remaining. Suggesting immediate temp purge.', severity: 'warning', timestamp: Date.now() - 3600000, service: 2 as any, actionable: true },
        ];
        initial.forEach(a => db.addAlert(a));
        setAlerts(initial);
      } else {
        setAlerts(data);
      }
    };
    fetch();
  }, []);

  const getSeverityStyles = (sev: string) => {
    switch (sev) {
      case 'critical': return 'border-rose-500/30 bg-rose-500/5 text-rose-400';
      case 'warning': return 'border-amber-500/30 bg-amber-500/5 text-amber-400';
      default: return 'border-indigo-500/30 bg-indigo-500/5 text-indigo-400';
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Alerts Center</h1>
          <p className="text-slate-400 mt-1">Operational notifications and prioritized system exceptions.</p>
        </div>
      </header>

      <div className="space-y-4">
        {alerts.length === 0 ? (
          <div className="glass p-12 rounded-3xl text-center border-dashed border-2 border-white/5">
            <p className="text-slate-500 italic">No active alerts detected. System stable.</p>
          </div>
        ) : (
          alerts.map(alert => (
            <div key={alert.id} className={`glass p-6 rounded-3xl border ${getSeverityStyles(alert.severity)} transition-all hover:scale-[1.01]`}>
              <div className="flex justify-between items-start">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-white/5">
                    {alert.severity === 'critical' ? '🚨' : alert.severity === 'warning' ? '⚠️' : 'ℹ️'}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">{alert.title}</h3>
                    <p className="text-slate-300 mt-1 max-w-2xl">{alert.message}</p>
                    <p className="text-[10px] uppercase tracking-widest font-bold text-slate-500 mt-3">
                      {new Date(alert.timestamp).toLocaleString()} • SEVERITY: {alert.severity.toUpperCase()}
                    </p>
                  </div>
                </div>
                {alert.actionable && (
                  <div className="flex gap-3">
                    <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-indigo-600/20">
                      Fix Now
                    </button>
                    <button className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold border border-white/10 transition-all">
                      Schedule
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AlertsCenter;
