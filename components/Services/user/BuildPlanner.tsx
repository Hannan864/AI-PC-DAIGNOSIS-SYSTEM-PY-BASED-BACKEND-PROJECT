import React, { useState, useEffect } from 'react';
import { db } from '../../../services/db';
import { useAuth } from '../../Layout/AuthProvider';
import { PCBuild, BuildRequestStatus, UserHistoryType } from '../../../types';
import { Icons } from '../../../constants';
import { CPUs, GPUs, Motherboards, RAMs, Storages, PowerSupplies, Cases } from '../../../services/pcComponents';
import { evaluatePCBuildAsync } from '../../../services/pcBuilder';
import { BuildSuggestionsPanel } from './BuildSuggestionsPanel';
import { BuildScorePanel } from './BuildScorePanel';
import { BuildCard } from './BuildCard';

export const BuildPlanner: React.FC = () => {
  const { user } = useAuth();
  const [builds, setBuilds] = useState<PCBuild[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  
  // Selection State
  const [buildName, setBuildName] = useState('');
  const [cpuId, setCpuId] = useState('');
  const [gpuId, setGpuId] = useState('');
  const [ramId, setRamId] = useState('');
  const [storageId, setStorageId] = useState('');
  const [powerSupplyId, setPowerSupplyId] = useState('');
  const [motherboardId, setMotherboardId] = useState('');
  const [caseId, setCaseId] = useState('');

  // Evaluation state
  const [evalResult, setEvalResult] = useState<any | null>(null);

  useEffect(() => {
    loadBuilds();
  }, [user]);

  useEffect(() => {
    const runEval = async () => {
      if (cpuId || gpuId || ramId || storageId || powerSupplyId || motherboardId || caseId) {
        setIsEvaluating(true);
        const res = await evaluatePCBuildAsync({ cpuId, gpuId, motherboardId, ramId, storageId, powerSupplyId, caseId });
        setEvalResult(res);
        setIsEvaluating(false);
      } else {
        setEvalResult(null);
      }
    };
    runEval();
  }, [cpuId, gpuId, ramId, storageId, powerSupplyId, motherboardId, caseId]);

  const loadBuilds = async () => {
    if (user?.id) {
      const b = await db.getPCBuildsByUser(user.id);
      setBuilds((b || []).sort((a, c) => (c.createdAt || 0) - (a.createdAt || 0)) as unknown as any);
    }
  };

  const handleApplyPreset = (presetType: 'GAMING' | 'OFFICE' | 'EDITING' | 'BUDGET' | 'WORKSTATION') => {
    if (presetType === 'GAMING') {
      setBuildName('Ultimate AM5 Gaming Blueprint 🎮');
      setCpuId('cpu-7800x3d');
      setMotherboardId('mb-b650');
      setGpuId('gpu-4080s');
      setRamId('ram-d5-32');
      setStorageId('str-nvme-2');
      setPowerSupplyId('psu-850');
      setCaseId('case-h9');
    } else if (presetType === 'WORKSTATION') {
      setBuildName('Threadripper-Class Core i9 Beast 🧠');
      setCpuId('cpu-14900k');
      setMotherboardId('mb-z790');
      setGpuId('gpu-4090');
      setRamId('ram-d5-64');
      setStorageId('str-nvme-4');
      setPowerSupplyId('psu-1000');
      setCaseId('case-o11d');
    } else if (presetType === 'EDITING') {
      setBuildName('Pro Streamer & Cinebench Studio 🎬');
      setCpuId('cpu-14700k');
      setMotherboardId('mb-z790');
      setGpuId('gpu-4070s');
      setRamId('ram-d5-32');
      setStorageId('str-nvme-2');
      setPowerSupplyId('psu-850');
      setCaseId('case-o11d');
    } else if (presetType === 'BUDGET') {
      setBuildName('Optimized Budget Builder mATX 💰');
      setCpuId('cpu-13600k');
      setMotherboardId('mb-b760');
      setGpuId('gpu-4060');
      setRamId('ram-d4-16');
      setStorageId('str-nvme-1');
      setPowerSupplyId('psu-500');
      setCaseId('case-ch370');
    } else {
      setBuildName('Quiet Home Productivity Suite 💼');
      setCpuId('cpu-5600x');
      setMotherboardId('mb-b550');
      setGpuId('gpu-4060');
      setRamId('ram-d4-16');
      setStorageId('str-nvme-1');
      setPowerSupplyId('psu-650');
      setCaseId('case-4000d');
    }
  };

  const handleSaveBuild = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !evalResult) return;

    const buildFull: PCBuild = {
      buildId: `build_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      userId: user.id,
      buildName: buildName || 'Untitled Build',
      cpu: CPUs.find(c => c.id === cpuId)?.name || 'Unknown CPU',
      gpu: GPUs.find(g => g.id === gpuId)?.name || 'Unknown GPU',
      motherboard: Motherboards.find(m => m.id === motherboardId)?.name || 'Unknown Motherboard',
      ram: RAMs.find(r => r.id === ramId)?.name || 'Unknown RAM',
      storage: Storages.find(s => s.id === storageId)?.name || 'Unknown Storage',
      powerSupply: PowerSupplies.find(p => p.id === powerSupplyId)?.name || 'Unknown Power Supply',
      case: Cases.find(c => c.id === caseId)?.name || 'Unknown Chassis',
      estimatedCostUSD: evalResult.estimatedUSD,
      estimatedCostPKR: evalResult.estimatedPKR,
      compatibilityStatus: evalResult.status,
      performanceScore: evalResult.score,
      issues: evalResult.issues,
      bottlenecks: evalResult.bottlenecks,
      createdAt: Date.now()
    };

    await db.addPCBuild(buildFull);
    await db.addUserHistory({
      historyId: `hist_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      userId: user.id,
      type: UserHistoryType.PC_BUILD,
      referenceId: buildFull.buildId,
      title: 'Created PC Build',
      summary: `Created build: ${buildFull.buildName} (${buildFull.compatibilityStatus})`,
      timestamp: Date.now()
    });

    setIsCreating(false);
    clearForm();
    loadBuilds();
  };

  const sendForReview = async (build: PCBuild) => {
    if (!user) return;
    
    const request = {
      id: `req_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      userId: user.id,
      buildName: build.buildName,
      components: {
        cpu: build.cpu, 
        gpu: build.gpu, 
        ram: build.ram, 
        storage: build.storage, 
        powerSupply: build.powerSupply, 
        motherboard: build.motherboard,
        case: build.case || 'Unknown Chassis'
      },
      compatibilityStatus: build.compatibilityStatus,
      performanceScore: build.performanceScore,
      issues: build.issues || [],
      bottlenecks: build.bottlenecks || [],
      estimatedCostUSD: build.estimatedCostUSD || 0,
      estimatedCostPKR: build.estimatedCostPKR || 0,
      status: BuildRequestStatus.SUBMITTED,
      userNotes: 'Please review this build configuration for parts procurement and assembly.',
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    await db.addPCBuildRequest(request);
    
    build.status = BuildRequestStatus.SUBMITTED;
    await db.addPCBuild(build);
    
    await db.addUserHistory({
      historyId: `hist_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      userId: user.id,
      type: UserHistoryType.PC_BUILD,
      referenceId: request.id,
      title: 'Requested Build Review',
      summary: `Requested technician review for PC Build: ${build.buildName}`,
      timestamp: Date.now()
    });

    alert('Build request sent for technician review successfully! Our hardware technicians will verify your parameters against stock listings.');
    loadBuilds();
  };

  const clearForm = () => {
    setBuildName(''); setCpuId(''); setGpuId(''); setRamId(''); setStorageId(''); setPowerSupplyId(''); setMotherboardId(''); setCaseId('');
  };

  const deleteBuild = async (id: string) => {
    if (confirm('Are you sure you want to delete this build template?')) {
      await db.deletePCBuild(id);
      loadBuilds();
    }
  };

  const renderSelect = (label: string, value: string, setter: any, options: any[], placeholder: string) => (
    <div className="flex flex-col gap-1">
      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">{label}</label>
      <select 
        value={value} 
        onChange={(e) => setter(e.target.value)} 
        className="w-full bg-[#020617] border border-white/10 rounded-lg px-3 py-2.5 text-slate-200 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
      >
        <option value="">-- {placeholder} --</option>
        {options.map(o => <option key={o.id} value={o.id}>{o.name} - ${o.price}</option>)}
      </select>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <span className="text-indigo-500">{Icons.cpu}</span> 
            Advanced PC Builder Intelligence Engine (APCIE)
          </h2>
          <p className="text-slate-400 text-sm">Design tailored PC systems with complete hardware component checks, diagnostic scores, and auto-computed pricing ranges.</p>
        </div>
        {!isCreating && (
          <button 
            id="btn-configure-smart-build"
            onClick={() => { clearForm(); setIsCreating(true); }}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg transition-colors shadow-lg shadow-indigo-600/20 text-sm"
          >
            {Icons.plus} Configure Smart Build
          </button>
        )}
      </div>

      {isCreating && (
        <div className="space-y-6 border border-white/5 bg-[#0b0f19] p-6 rounded-2xl shadow-xl">
          <div className="flex flex-col gap-2.5 p-4 bg-slate-950/40 rounded-xl border border-white/5">
            <span className="text-[10px] uppercase tracking-widest text-indigo-400 font-mono font-bold">Select Preset Baseline Configs</span>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {(['GAMING', 'WORKSTATION', 'EDITING', 'BUDGET', 'OFFICE'] as const).map(preset => (
                <button 
                  key={preset}
                  type="button" 
                  onClick={() => handleApplyPreset(preset)}
                  className="px-3 py-2 mt-1 rounded-lg bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-500/20 text-indigo-400 text-xs font-semibold text-center transition-colors block"
                >
                  {preset === 'GAMING' ? '🎮 Gaming' : preset === 'WORKSTATION' ? '🧠 Workstation' : preset === 'EDITING' ? '🎬 Editing' : preset === 'BUDGET' ? '💰 Budget' : '💼 Office'}
                </button>
              ))}
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="glass p-6 rounded-2xl border border-white/5 space-y-5">
                <h3 className="text-lg font-medium text-white flex items-center gap-2">
                  <span>{Icons.sparkles}</span> Core Components Checklist
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Configuration / Build Name</label>
                    <input 
                      type="text" 
                      value={buildName} 
                      onChange={(e) => setBuildName(e.target.value)} 
                      className="w-full bg-[#020617] border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm" 
                      placeholder="e.g. Creator Workstation 2026" 
                    />
                  </div>
                   
                  <div className="grid md:grid-cols-2 gap-4">
                    {renderSelect('Processor (CPU)', cpuId, setCpuId, CPUs, 'Select CPU')}
                    {renderSelect('Motherboard', motherboardId, setMotherboardId, Motherboards, 'Select Motherboard')}
                    {renderSelect('Graphics (GPU)', gpuId, setGpuId, GPUs, 'Select GPU')}
                    {renderSelect('Memory (RAM)', ramId, setRamId, RAMs, 'Select RAM')}
                    {renderSelect('Primary Storage', storageId, setStorageId, Storages, 'Select Storage')}
                    {renderSelect('Power Supply', powerSupplyId, setPowerSupplyId, PowerSupplies, 'Select PSU')}
                    {renderSelect('Computer Case / Chassis', caseId, setCaseId, Cases, 'Select Case')}
                  </div>
                </div>
              </div>

              {evalResult && evalResult.suggestions && (
                <BuildSuggestionsPanel suggestions={evalResult.suggestions} />
              )}
            </div>

            <div className="space-y-6">
              {isEvaluating ? (
                <div className="glass p-6 rounded-2xl border border-white/5 flex flex-col items-center justify-center text-center h-64 shadow-inner">
                  <div className="animate-spin text-indigo-500 mb-3">{Icons.cpu}</div>
                  <p className="text-slate-400 text-sm leading-relaxed max-w-xs font-mono">Querying System Sentinel APCIE Logic Engine...</p>
                </div>
              ) : evalResult ? (
                <BuildScorePanel
                  buildName={buildName}
                  evalResult={evalResult as any}
                  selectedCpu={CPUs.find(c => c.id === cpuId)?.name || ''}
                  selectedGpu={GPUs.find(g => g.id === gpuId)?.name || ''}
                  selectedMotherboard={Motherboards.find(m => m.id === motherboardId)?.name || ''}
                  selectedRam={RAMs.find(r => r.id === ramId)?.name || ''}
                  selectedStorage={Storages.find(s => s.id === storageId)?.name || ''}
                  selectedPowerSupply={PowerSupplies.find(p => p.id === powerSupplyId)?.name || ''}
                  selectedCase={Cases.find(c => c.id === caseId)?.name || ''}
                  onSave={handleSaveBuild}
                  onCancel={() => setIsCreating(false)}
                />
              ) : (
                <div className="glass p-6 rounded-2xl border border-white/5 flex flex-col items-center justify-center text-center h-64 shadow-inner">
                  <div className="text-slate-500 mb-3">{Icons.cpu}</div>
                  <p className="text-slate-400 text-sm leading-relaxed max-w-xs">Select processor slots, motherboard dimensions, graphics cards or select templates to trigger analysis.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {!isCreating && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-white pl-1 flex items-center gap-2">
            <span>{Icons.history}</span> Custom Specs & Hardware Repositories ({builds.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {builds.length === 0 && (
              <div id="no-builds-box" className="col-span-full border border-dashed border-white/10 rounded-2xl p-12 text-center h-48 flex flex-col items-center justify-center">
                <p className="text-slate-500 text-sm max-w-xs">Configure unique PC builds based on hardware socket standards and save logs of drafts.</p>
              </div>
            )}
            
            {builds.map(b => (
              <BuildCard
                key={b.buildId}
                build={b}
                onDelete={deleteBuild}
                onSendForReview={sendForReview}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
