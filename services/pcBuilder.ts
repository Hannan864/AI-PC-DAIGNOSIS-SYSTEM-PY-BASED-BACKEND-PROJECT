import { CPUs, GPUs, Motherboards, RAMs, Storages, PowerSupplies, Cases } from './pcComponents';

export interface Suggestion {
  partType: string;
  currentName: string;
  suggestedName: string;
  reason: string;
}

export interface CompatibilityAnalysis {
  status: 'PASS' | 'WARNING' | 'FAIL';
  issues: string[];
  bottlenecks: string[];
  detailedBottlenecks?: {
    type: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH';
    description: string;
    fix: string;
  }[];
  score: number;
  estimatedUSD: number;
  estimatedPKR: number;
  estimatedUSDMin: number;
  estimatedUSDMax: number;
  totalPowerWatts: number;
  psuMaxWatts: number;
  powerConsumptionSafetyMargin: number;
  gamingSuitability: number;
  editingSuitability: number;
  officeSuitability: number;
  suggestions: Suggestion[];
  optimizedBuildRecommendation?: string;
  scoreBreakdown: {
    socketCompatibility: number;
    memoryMatch: number;
    powerHeadroom: number;
    bottleneckImbalance: number;
    storageSpeed: number;
    caseFormFactor: number;
  };
}

/**
 * FETCH REMOTE SCORE FROM BACKEND
 * Connects to the FastAPI PC Builder Scoring Engine.
 */
async function fetchRemoteScore(cpu: string, gpu: string, ram: string): Promise<any> {
  try {
    const version = (typeof window !== 'undefined' ? localStorage.getItem('settings.apiVersion') : 'v1') || 'v1';
    const resp = await fetch(`http://localhost:5000/api/${version}/pc-builder/score`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cpu, gpu, ram })
    });
    if (!resp.ok) return null;
    return await resp.json();
  } catch (e) {
    return null;
  }
}

export const evaluatePCBuild = (build: {
  cpuId: string;
  gpuId: string;
  motherboardId: string;
  ramId: string;
  storageId: string;
  powerSupplyId: string;
  caseId?: string;
}, remoteData?: any): CompatibilityAnalysis => {
  let status: 'PASS' | 'WARNING' | 'FAIL' = 'PASS';
  let issues: string[] = [];
  let bottlenecks: string[] = [];
  let detailedBottlenecks: { type: string; severity: 'LOW' | 'MEDIUM' | 'HIGH'; description: string; fix: string; }[] = [];
  let suggestions: Suggestion[] = [];
  
  // Specific Score Deductions
  let socketScore = 20;
  let memoryScore = 20;
  let powerScore = 20;
  let redundancyScore = 20;
  let storageScore = 10;
  let caseScore = 10;

  const cpu = CPUs.find(c => c.id === build.cpuId);
  const gpu = GPUs.find(g => g.id === build.gpuId);
  const mobo = Motherboards.find(m => m.id === build.motherboardId);
  const ram = RAMs.find(r => r.id === build.ramId);
  const storage = Storages.find(s => s.id === build.storageId);
  const psu = PowerSupplies.find(p => p.id === build.powerSupplyId);
  const pcCase = Cases.find(c => c.id === build.caseId);

  // Use Remote Backend Data for Scoring if provided, else fallback to local math
  const gamingSuitabilityRaw = remoteData?.gaming_score ?? null;
  const prodSuitabilityRaw = remoteData?.productivity_score ?? null;
  const remoteRisk = remoteData?.bottleneck_risk ?? null;

  // 1. Calculate Core Pricing
  let estimatedUSD = 0;
  if (cpu) estimatedUSD += cpu.price;
  if (gpu) estimatedUSD += gpu.price;
  if (mobo) estimatedUSD += mobo.price;
  if (ram) estimatedUSD += ram.price;
  if (storage) estimatedUSD += storage.price;
  if (psu) estimatedUSD += psu.price;
  if (pcCase) estimatedUSD += pcCase.price;

  const estimatedUSDMin = Math.round(estimatedUSD * 0.95);
  const estimatedUSDMax = Math.round(estimatedUSD * 1.05);
  const EX_RATE = 280;
  const estimatedPKR = estimatedUSD * EX_RATE;

  // 2. Power Consumption Math
  let cpuPower = 65; 
  if (cpu) {
    if (cpu.id === 'cpu-14900k') cpuPower = 253;
    else if (cpu.id === 'cpu-14700k') cpuPower = 253;
    else if (cpu.id === 'cpu-13600k') cpuPower = 181;
    else if (cpu.id === 'cpu-7800x3d') cpuPower = 120;
    else if (cpu.id === 'cpu-5800x3d') cpuPower = 105;
    else cpuPower = 95;
  }

  let gpuPower = 150; 
  if (gpu) {
    if (gpu.id === 'gpu-4090') gpuPower = 450;
    else if (gpu.id === 'gpu-4080s') gpuPower = 320;
    else if (gpu.id === 'gpu-7900xtx') gpuPower = 355;
    else if (gpu.id === 'gpu-4070s') gpuPower = 220;
    else if (gpu.id === 'gpu-7800xt') gpuPower = 263;
    else if (gpu.id === 'gpu-4060') gpuPower = 115;
    else if (gpu.id === 'gpu-7600xt') gpuPower = 190;
  }

  const systemOverhead = 60;
  const totalPowerWatts = (cpu ? cpuPower : 0) + (gpu ? gpuPower : 0) + systemOverhead;
  const psuMaxWatts = psu ? psu.wattage : 500;

  // 3. COMPONENT COMPATIBILITY CRITIQUE

  // A. CPU ↔ Motherboard socket match
  if (cpu && mobo) {
    if (cpu.socket !== mobo.socket) {
      status = 'FAIL';
      socketScore = 0;
      issues.push(`Incompatible Socket: CPU [${cpu.name}] has socket [${cpu.socket}], but motherboard [${mobo.name}] operates on [${mobo.socket}].`);
    }
  }

  // B. RAM ↔ Motherboard DDR memory generation match
  if (mobo && ram) {
    if (mobo.memoryType !== ram.memoryType) {
      status = 'FAIL';
      memoryScore = 0;
      issues.push(`RAM Standard Mismatch: Motherboard [${mobo.name}] fits [${mobo.memoryType}], but selected RAM [${ram.name}] is [${ram.memoryType}].`);
    }
  }

  // C. Case Sizing Match
  if (mobo && pcCase) {
    if (mobo.formFactor === 'ATX' && pcCase.formFactor === 'mATX') {
      status = 'FAIL';
      caseScore = 0;
      issues.push(`Chassis Sizing Collision: Motherboard [${mobo.name}] is size [ATX], which will not fit inside mATX case [${pcCase.name}].`);
    }
  }

  // D. Case GPU length clearance check
  if (gpu && pcCase) {
    if (gpu.length > pcCase.maxGpuLength) {
      status = 'FAIL';
      caseScore = Math.max(0, caseScore - 5);
      issues.push(`GPU Clearance Collision: Selected GPU [${gpu.name}] is too long (${gpu.length}mm) for Case [${pcCase.name}] (${pcCase.maxGpuLength}mm limit).`);
    }
  }

  // E. GPU ↔ Power Supply watt requirement
  if (gpu && psu) {
    if (psu.wattage < gpu.minPower) {
      status = 'FAIL';
      powerScore = 0;
      issues.push(`Underpowered PSU for GPU: Selected GPU [${gpu.name}] demands a minimum power supply of [${gpu.minPower}W]. Your selected PSU is only [${psu.wattage}W].`);
    } else if (psu.wattage < totalPowerWatts) {
      status = 'FAIL';
      powerScore = 0;
      issues.push(`Total Watts Power Draw Overload: Estimated peaks [${totalPowerWatts}W] exceed PSU ceiling limit [${psu.wattage}W].`);
    } else if (psu.wattage < totalPowerWatts + 100) {
      if (status !== 'FAIL') status = 'WARNING';
      powerScore = 10;
      issues.push(`Critical PSU Margin Warning: Margin is tighter than 100W under maximum diagnostic loads.`);
    }
  }

  // 4. ADVANCED BOTTLENECK ANALYSIS ENGINE

  if (remoteRisk) {
    if (remoteRisk !== 'Low') {
      bottlenecks.push(`Performance Bottleneck (${remoteRisk}): Remote scoring engine detected tier imbalance.`);
      redundancyScore = remoteRisk === 'High' ? 5 : 12;
    }
  } else if (gpu && cpu) {
    // Local Fallback Bottleneck Math
    if (gpu.tier === 'HIGH' && cpu.tier === 'MID') {
      bottlenecks.push(`GPU Bottleneck (MEDIUM): Graphics speed holds back CPU frame timing.`);
      redundancyScore = 14;
    } else if (gpu.tier === 'HIGH' && cpu.tier === 'LOW') {
      bottlenecks.push(`GPU Bottleneck (HIGH): Massive processing bottleneck predicted.`);
      redundancyScore = 8;
    }
  }

  // 5. WORKLOAD SUITABILITY PRESETS
  let gamingSuitability = gamingSuitabilityRaw ?? 10;
  let editingSuitability = prodSuitabilityRaw ?? 10;
  let officeSuitability = 50;

  if (gamingSuitabilityRaw === null && cpu && gpu) {
    // Local Fallback Suitability Math
    const gpuContrib = gpu.tier === 'HIGH' ? 60 : gpu.tier === 'MID' ? 40 : 20;
    const cpuContrib = cpu.tier === 'HIGH' ? 30 : cpu.tier === 'MID' ? 20 : 10;
    gamingSuitability = gpuContrib + cpuContrib;
    editingSuitability = cpuContrib * 2 + gpuContrib / 2;
  }
  officeSuitability = status === 'PASS' ? 95 : 60;

  // 6. TALLY FINAL GRADED SCORE
  const score = Math.max(0, Math.min(100, socketScore + memoryScore + powerScore + redundancyScore + storageScore + caseScore));
  const powerConsumptionSafetyMargin = Math.round(((psuMaxWatts - totalPowerWatts) / psuMaxWatts) * 100);

  return {
    status,
    issues,
    bottlenecks,
    detailedBottlenecks,
    score,
    estimatedUSD,
    estimatedPKR,
    estimatedUSDMin,
    estimatedUSDMax,
    totalPowerWatts,
    psuMaxWatts,
    powerConsumptionSafetyMargin,
    gamingSuitability,
    editingSuitability,
    officeSuitability,
    suggestions,
    scoreBreakdown: {
      socketCompatibility: socketScore,
      memoryMatch: memoryScore,
      powerHeadroom: powerScore,
      bottleneckImbalance: Math.max(0, redundancyScore),
      storageSpeed: storageScore,
      caseFormFactor: caseScore,
    }
  };
};

/**
 * ASYNC WRAPPER FOR BUILDER EVALUATION
 * Orchestrates backend fetch + local analysis.
 */
export async function evaluatePCBuildAsync(build: any): Promise<CompatibilityAnalysis> {
  const cpu = CPUs.find(c => c.id === build.cpuId)?.name || 'Unknown';
  const gpu = GPUs.find(g => g.id === build.gpuId)?.name || 'Unknown';
  const ram = RAMs.find(r => r.id === build.ramId)?.name || 'Unknown';

  const remoteData = await fetchRemoteScore(cpu, gpu, ram);
  return evaluatePCBuild(build, remoteData);
}
