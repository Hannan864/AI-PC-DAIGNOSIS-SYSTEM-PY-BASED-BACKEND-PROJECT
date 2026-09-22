
import React, { useState, useEffect } from 'react';
import { diagnosticProvider } from '../../services/diagnosticProvider';

const HardwareDrivers: React.FC = () => {
  const [hardware, setHardware] = useState<Array<{ name: string; category: string; status: string; version: string }>>([]);
  const [scanning, setScanning] = useState(false);

  const loadHardware = async () => {
    try {
      setScanning(true);
      const data = await diagnosticProvider.getHardwareInventory();
      setHardware(data);
    } catch (e) {
      console.error("Failed to load hardware specs", e);
    } finally {
      setScanning(false);
    }
  };

  useEffect(() => {
    loadHardware();
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Hardware & Drivers</h1>
          <p className="text-slate-400 mt-1">Comprehensive inventory and health diagnostics for your physical components.</p>
        </div>
        <button 
          onClick={loadHardware}
          disabled={scanning}
          className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold transition-all disabled:opacity-50"
        >
          {scanning ? 'Scanning...' : 'Scan for Updates'}
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {hardware.map((item, i) => (
          <div key={i} className="glass p-5 rounded-2xl border-t-2 border-indigo-500/50">
            <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">{item.category}</p>
            <h4 className="font-bold text-slate-100 mt-1 truncate">{item.name}</h4>
            <div className="flex justify-between items-center mt-4">
              <span className="text-[10px] text-slate-500 mono">v{item.version}</span>
              <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase ${item.status.includes('Update') ? 'bg-amber-500/10 text-amber-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                {item.status}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="glass rounded-3xl border border-white/5 overflow-hidden">
        <div className="p-6 border-b border-white/5 bg-slate-900/30">
          <h3 className="font-bold">Hardware Benchmark Logs</h3>
        </div>
        <div className="p-6 text-center text-slate-600 italic">
          No benchmark data available. Run a stress test to generate analytics.
        </div>
      </div>
    </div>
  );
};

export default HardwareDrivers;
