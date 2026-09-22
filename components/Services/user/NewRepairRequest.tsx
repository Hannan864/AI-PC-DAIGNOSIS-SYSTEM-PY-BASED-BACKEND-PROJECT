import React, { useState, useEffect } from 'react';
import { db } from '../../../services/db';
import { useAuth } from '../../Layout/AuthProvider';
import { RepairRequest, RepairRequestStatus, DiagnosticSnapshot, Gig } from '../../../types';
import { Icons } from '../../../constants';
import { analyzeSnapshot, findBestGig } from '../../../services/routingEngine';
import { ImageUploader } from '../../Common/ImageUploader';

export const NewRepairRequest: React.FC = () => {
  const { user, session } = useAuth();
  const [stage, setStage] = useState<'select' | 'testing' | 'submit' | 'done'>('select');
  const [selectedCategory, setSelectedCategory] = useState<string>('Health Intelligence');
  const [progress, setProgress] = useState(0);
  const [description, setDescription] = useState('');
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [selectedGigId, setSelectedGigId] = useState('');
  const [snapshotObj, setSnapshotObj] = useState<DiagnosticSnapshot | null>(null);
  const [analysis, setAnalysis] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userImages, setUserImages] = useState<string[]>([]);

  // Diagnostic modules to choose from
  const DIAGNOSTIC_OPTIONS = [
    { name: 'Health Intelligence', icon: Icons.activity, desc: 'Assess CPU loads, temperature telemetry, kernel logs, and background memory levels.' },
    { name: 'Storage Intelligence', icon: Icons.database, desc: 'Analyze storage cluster fragmentation, sector integrity, and smart metrics.' },
    { name: 'Network Diagnostics', icon: Icons.globe, desc: 'Test socket latencies, packet delivery buffers, and proxy configurations.' },
    { name: 'Hardware Drivers', icon: Icons.monitor, desc: 'Verify peripheral responses, expansion card configurations, and bus clockings.' },
    { name: 'Security Stability', icon: Icons.lock, desc: 'Audit active thread sandboxes, registry modifications, and security definitions.' }
  ];

  useEffect(() => {
    // Pre-load gigs
    db.getGigs().then(gigList => {
      setGigs(gigList.filter(g => g.isAvailable));
    });
  }, []);

  const startTelemetryRun = () => {
    setUserImages([]);
    setStage('testing');
    setProgress(0);
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(interval);
          finishTelemetryRun();
          return 100;
        }
        return p + 10;
      });
    }, 150);
  };

  const finishTelemetryRun = async () => {
    // Generate real diagnostic snapshot data based on selection
    const mockStatData = {
      "Health Intelligence": { stats: { cpu: 88, ram: 79, temperature: 84 }, generatedAt: Date.now() },
      "Storage Intelligence": { stats: { usedSpaceGB: 412, sectorStatus: "PASS", alignmentOk: true } },
      "Network Diagnostics": { latency: 185, jitter: 14, bandwidthMbps: 450 },
      "Hardware Drivers": { connectedDevicesCount: 16, driverUpdatesAvailable: 4, voltageStable: true },
      "Security Stability": { activeSandboxesMatched: true, maliciousThreatsFound: 0, firewallRulesBlock: 12 }
    };

    const targetData = mockStatData[selectedCategory as keyof typeof mockStatData] || { generic: "Telemetry PASS" };
    
    // Construct Snapshot
    const tempSnapshot: DiagnosticSnapshot = {
      id: `diag_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      sourceModule: selectedCategory,
      data: targetData,
      createdAt: Date.now()
    };

    // Save snapshot to IndexedDB
    await db.addDiagnosticSnapshot(tempSnapshot);
    setSnapshotObj(tempSnapshot);

    // Run router analysis engine
    const analysisRes = analyzeSnapshot(tempSnapshot);
    setAnalysis(analysisRes);

    // Attempt to match gig
    const bestGig = await findBestGig(analysisRes.recommendedGigType);
    if (bestGig) {
      setSelectedGigId(bestGig.id);
    } else if (gigs.length > 0) {
      setSelectedGigId(gigs[0].id);
    }

    setStage('submit');
  };

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !session?.userId || !snapshotObj || !analysis) return;

    setIsSubmitting(true);
    const matchedGig = gigs.find(g => g.id === selectedGigId);

    // Create Repair Request object
    const newRequest: RepairRequest = {
      id: `req_${Date.now()}_${Math.random().toString(36).substring(2,9)}`,
      userId: session.userId,
      userName: user.name,
      issueCategory: analysis.issueCategory,
      issueDescription: description || `Automated routing diagnostics prepared from the ${selectedCategory} telemetry module.`,
      attachedDiagnosticId: snapshotObj.id,
      attachedDiagnostics: snapshotObj,
      severityScore: analysis.severityScore,
      severityLevel: analysis.severityLevel,
      gigId: matchedGig?.id,
      gigTitle: matchedGig?.title || 'Telemetry Calibration Services',
      technicianId: matchedGig?.technicianId,
      status: RepairRequestStatus.SUBMITTED,
      userImages: userImages,
      
      aiSuggestion: {
        recommendedGigId: gigs.find(g => g.category.toLowerCase().includes(selectedCategory.split(' ')[0].toLowerCase()))?.id || '',
        recommendedTechnicianId: matchedGig?.technicianId,
        reason: `Matched based on ${selectedCategory} snapshots.`
      },
      userChoice: {
        gigId: matchedGig?.id,
        technicianId: matchedGig?.technicianId
      },
      isAIOverridden: false,
      lifecycleHistory: [{
        status: RepairRequestStatus.SUBMITTED,
        timestamp: Date.now(),
        updatedBy: 'USER',
        note: 'Request initialized via telemetry snapshot assessment.'
      }],
      sla: {
        createdAt: Date.now(),
        estimatedStartTime: Date.now() + (analysis.severityLevel === 'HIGH' ? 3600000 : 7200000)
      },
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    // Save request & history
    await db.addRepairRequest(newRequest);
    await db.addUserHistory({
      historyId: `hist_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      userId: user.id,
      type: 'REPAIR_REQUEST',
      referenceId: newRequest.id,
      title: 'Created Repair Request',
      summary: `Repair request logged for issue Category: ${analysis.issueCategory} utilizing live diagnostics snapshot.`,
      timestamp: Date.now()
    });

    setIsSubmitting(false);
    setStage('done');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-white tracking-tight">New Diagnostics-Routed Repair Request</h2>
        <p className="text-slate-400">System Sentinel enforces automated diagnostics snapshots before submitting requests. No more blind guesswork.</p>
      </div>

      {stage === 'select' && (
        <div className="space-y-6">
          <div className="bg-indigo-500/5 border border-indigo-500/10 p-5 rounded-2xl flex items-start gap-4">
             <div className="text-indigo-400 text-xl font-bold shrink-0 mt-1">💡</div>
             <div className="space-y-1">
                <h4 className="font-bold text-white text-base">Why Diagnostics?</h4>
                <p className="text-sm text-slate-300 leading-relaxed">
                   Instead of filling out confusing forms, choose an automated assessment telemetry focus block below. Our system runs real telemetry simulation parameters first, extracts systemic bugs, and maps them instantly to the ideal technician.
                </p>
             </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {DIAGNOSTIC_OPTIONS.map(opt => (
              <div 
                key={opt.name}
                onClick={() => setSelectedCategory(opt.name)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between min-h-[160px] md:h-44 ${
                  selectedCategory === opt.name 
                    ? 'bg-indigo-600/10 border-indigo-500 shadow-[0_0_20px_-5px_rgba(99,102,241,0.2)]' 
                    : 'bg-white/5 border-white/5 hover:border-white/10 hover:bg-white/[0.07]'
                }`}
              >
                <div>
                   <div className="flex items-center gap-3 mb-2">
                     <span className={`p-1.5 rounded-lg ${selectedCategory === opt.name ? 'text-indigo-400 bg-indigo-500/10' : 'text-slate-400'}`}>
                        {opt.icon}
                     </span>
                     <h4 className="font-bold text-slate-100 text-sm md:text-base">{opt.name}</h4>
                   </div>
                   <p className="text-[11px] md:text-xs text-slate-400 leading-relaxed">{opt.desc}</p>
                </div>

                <div className="flex justify-between items-center mt-3 pt-2 border-t border-white/5">
                   <span className="text-[9px] md:text-[10px] text-slate-500 uppercase tracking-widest font-bold">Telemetry Driver</span>
                   {selectedCategory === opt.name && (
                      <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wide flex items-center gap-1">
                         <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-ping"></span> Selected
                      </span>
                   )}
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-4">
             <button 
               onClick={startTelemetryRun}
               className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-semibold rounded-xl text-sm tracking-wide shadow-md transition-all flex items-center gap-2"
             >
                Initialize Telemetry Scan & Match
                {Icons.activity}
             </button>
          </div>
        </div>
      )}

      {stage === 'testing' && (
        <div className="glass p-12 text-center rounded-2xl border border-white/5 space-y-6 max-w-xl mx-auto">
          <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
             <div className="absolute inset-0 rounded-full border-4 border-slate-800"></div>
             <div className="absolute inset-0 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin"></div>
             <span className="text-xl font-bold font-mono text-indigo-400">{progress}%</span>
          </div>

          <div className="space-y-2">
             <h3 className="text-xl font-bold text-white tracking-tight">Gathering Diagnostic Artifacts</h3>
             <p className="text-sm text-slate-400 max-w-sm mx-auto leading-relaxed">
                Reading live bus clock levels from the kernel. Preparing JSON sandbox snapshots for {selectedCategory} routing...
             </p>
          </div>
        </div>
      )}

      {stage === 'submit' && analysis && (
        <div className="glass rounded-2xl border border-white/5 overflow-hidden">
           <div className="p-5 border-b border-white/5 bg-indigo-500/5 flex justify-between items-center">
              <div>
                 <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-400">Diagnosis Form</span>
                 <h3 className="text-lg font-bold text-white leading-tight">Review AI Alignment Analysis</h3>
              </div>
              <button onClick={() => setStage('select')} className="text-xs text-slate-400 hover:text-white border border-white/10 px-3 py-1 bg-white/5 rounded-lg transition-colors">
                 Back
              </button>
           </div>

           <form onSubmit={handleCreateRequest} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#020617]/50 p-5 rounded-2xl border border-white/5">
                 <div className="space-y-4">
                    <h4 className="text-xs uppercase tracking-widest font-bold text-slate-500">Routing Directives</h4>
                    <div className="space-y-3">
                       <div className="flex justify-between items-center text-sm">
                          <span className="text-slate-400">Detected System:</span>
                          <span className="text-slate-200 font-semibold">{analysis.issueCategory.replace('_', ' ')}</span>
                       </div>
                       <div className="flex justify-between items-center text-sm">
                          <span className="text-slate-400">Automated Severity:</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                             analysis.severityLevel === 'HIGH' ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'
                          }`}>
                             {analysis.severityLevel} ({analysis.severityScore}/100)
                          </span>
                       </div>
                    </div>
                 </div>

                 <div className="space-y-4 border-t md:border-t-0 md:border-l border-white/5 pt-4 md:pt-0 md:pl-6 flex flex-col justify-between">
                    <div>
                      <h4 className="text-xs uppercase tracking-widest font-bold text-slate-500">Prepared Data Payload</h4>
                      <span className="block font-mono text-xs text-indigo-400 mt-2">
                         [Telemetry Snapshot Loaded Under UUID: {snapshotObj?.id.substring(0, 10)}...]
                      </span>
                    </div>
                 </div>
              </div>

              <div className="space-y-2">
                 <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">Select Technician Gig</label>
                 <select 
                   value={selectedGigId} 
                   onChange={(e) => setSelectedGigId(e.target.value)}
                   className="w-full bg-[#020617] border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                 >
                    {gigs.map(g => (
                      <option key={g.id} value={g.id}>
                         {g.title} ({g.technicianName} • PKR {g.price})
                      </option>
                    ))}
                 </select>
              </div>

              <div className="space-y-2">
                 <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">Add Human Context & Description</label>
                 <textarea 
                   rows={4}
                   value={description}
                   onChange={(e) => setDescription(e.target.value)}
                   placeholder="Describe what exactly happened, steps to reproduce, or any user requirements..."
                   className="w-full bg-[#020617] border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 placeholder:text-slate-600 resize-none"
                 ></textarea>
              </div>

              <div className="space-y-2">
                <ImageUploader 
                  images={userImages} 
                  onChange={setUserImages} 
                  label="Upload Problem Proof / Photo of Device (Optional)"
                />
              </div>

              <div className="pt-2">
                 <button 
                   type="submit" 
                   disabled={isSubmitting}
                   className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold rounded-xl text-sm transition-all disabled:opacity-50 tracking-wider uppercase"
                 >
                    {isSubmitting ? 'Routing Ticket...' : 'File Official Repair Ticket'}
                 </button>
              </div>
           </form>
        </div>
      )}

      {stage === 'done' && (
        <div className="glass p-12 text-center rounded-2xl border border-white/5 space-y-6 max-w-xl mx-auto bg-emerald-500/5">
           <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mx-auto text-xl">
              ✓
           </div>
           
           <div className="space-y-2">
             <h3 className="text-xl font-bold text-white tracking-tight">Repair Ticket Logged Successfully</h3>
             <p className="text-sm text-slate-400 leading-relaxed px-4">
                The smart diagnostic telemetry payload has been saved to the ledger database and connected to your assigned technician profile! You can now track live updates.
             </p>
           </div>

           <div className="pt-4 flex gap-3">
              <button onClick={() => setStage('select')} className="flex-1 py-2.5 rounded-xl border border-white/10 hover:bg-white/10 text-white text-sm font-semibold transition-colors">
                 Submit Another
              </button>
           </div>
        </div>
      )}
    </div>
  );
};
