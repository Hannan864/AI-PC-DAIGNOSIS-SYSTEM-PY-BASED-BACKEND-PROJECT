
import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { StorageReport, ServiceType } from '../../types';
import { diagnosticProvider } from '../../services/diagnosticProvider';
import { db } from '../../services/db';
import { RequestTechnicianHelp } from './RequestTechnicianHelp';

const StorageIntelligence: React.FC = () => {
  const [scanning, setScanning] = useState(false);
  const [report, setReport] = useState<StorageReport[]>([]);
  const [totalSize, setTotalSize] = useState(0);

  const startDeepScan = async () => {
    try {
      setScanning(true);
      let files: StorageReport[] = [];
      let total = 0;
      let targetName = 'System Drive';

      try {
        // Attempt using Real File System Access API
        const dirHandle = await (window as any).showDirectoryPicker();
        targetName = dirHandle.name;

        async function scan(handle: any) {
          for await (const entry of handle.values()) {
            if (entry.kind === 'file') {
              const file = await entry.getFile();
              total += file.size;
              files.push({
                path: file.name,
                size: file.size,
                lastModified: file.lastModified,
                isLarge: file.size > 100 * 1024 * 1024 // 100MB
              });
            } else if (entry.kind === 'directory') {
              await scan(entry);
            }
          }
        }
        await scan(dirHandle);
      } catch (pickerError) {
        console.warn("Direct File Access picker bypassed or unavailable. Loading provider telemetry fallback...", pickerError);
        // Seamless fallback to the future-proof diagnostic provider interface (conforming to pySMART integrations)
        const providerScanResult = await diagnosticProvider.startVolumeScan('primary-vol-0');
        files = providerScanResult.files;
        total = providerScanResult.totalSize;
        targetName = 'Assigned Local Drive';
      }

      const sorted = files.sort((a, b) => b.size - a.size).slice(0, 10);
      setReport(sorted);
      setTotalSize(total);
      
      db.addLog({
        id: `scan-${Date.now()}`,
        timestamp: Date.now(),
        service: ServiceType.STORAGE,
        message: `Completed volume scan of [${targetName}]. Processed ${files.length} active nodes.`,
        type: 'success'
      });
    } catch (e) {
      console.error("Deep sector scan failed", e);
    } finally {
      setScanning(false);
    }
  };

  const chartData = [
    { name: 'Scanned Files', value: totalSize / (1024 * 1024), color: '#6366f1' },
    { name: 'Estimated Free', value: 500 * 1024, color: '#1e293b' },
  ];

  const getSnapshot = () => ({
    totalSizeScanned: totalSize,
    largestFiles: report,
    timestamp: Date.now()
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Storage Intelligence</h1>
          <p className="text-slate-400 text-sm md:text-base mt-1">Direct hardware volume analysis via File System Access.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          <RequestTechnicianHelp moduleName="Storage Intelligence" getSnapshot={getSnapshot} />
          <button 
            onClick={startDeepScan}
            disabled={scanning}
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold transition-all disabled:bg-slate-800 disabled:text-slate-500 text-sm"
          >
            {scanning ? 'Scanning...' : 'Start New Volume Scan'}
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass p-6 md:p-8 rounded-3xl flex flex-col items-center">
          <h3 className="text-[10px] md:text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">Space Utilization</h3>
          <div className="w-full h-64 md:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={chartData} cx="50%" cy="50%" innerRadius={window.innerWidth < 768 ? 60 : 80} outerRadius={window.innerWidth < 768 ? 90 : 120} paddingAngle={5} dataKey="value">
                  {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 text-center">
            <p className="text-3xl md:text-4xl font-black mono text-slate-100">{(totalSize / (1024 * 1024 * 1024)).toFixed(2)} GB</p>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mt-1">Volume Load</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="glass p-6 rounded-3xl h-full">
            <h3 className="font-bold mb-6">Deep Analysis Results</h3>
            {report.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-slate-600 border-2 border-dashed border-white/5 rounded-2xl">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mb-4 opacity-20"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
                <p className="text-sm">Grant access to a directory to perform real-time disk forensics.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {report.map((file, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-white/2 rounded-xl border border-white/5">
                    <div className="flex items-center gap-3 overflow-hidden">
                       <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${file.isLarge ? 'bg-rose-500/10 text-rose-400' : 'bg-indigo-500/10 text-indigo-400'}`}>
                         <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><polyline points="13 2 13 9 20 9"></polyline></svg>
                       </div>
                       <span className="text-xs font-medium truncate text-slate-300">{file.path}</span>
                    </div>
                    <span className="text-[10px] font-bold mono text-slate-500">{(file.size / (1024 * 1024)).toFixed(1)} MB</span>
                  </div>
                ))}
                <button className="w-full mt-4 py-3 bg-rose-600/10 hover:bg-rose-600/20 text-rose-400 rounded-xl text-xs font-bold uppercase transition-all">
                  Generate Clean-up Script for this Volume
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StorageIntelligence;
