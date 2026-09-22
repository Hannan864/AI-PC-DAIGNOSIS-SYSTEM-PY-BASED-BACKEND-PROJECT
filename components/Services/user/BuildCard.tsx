import React from 'react';
import { PCBuild, BuildRequestStatus } from '../../../types';
import { Icons } from '../../../constants';

interface BuildCardProps {
  build: PCBuild;
  onDelete: (id: string) => void;
  onSendForReview: (build: PCBuild) => void;
}

export const BuildCard: React.FC<BuildCardProps> = ({ build: b, onDelete, onSendForReview }) => {
  return (
    <div key={b.buildId} className="glass p-5 rounded-2xl border border-white/5 flex flex-col group relative overflow-hidden">
       {b.status === BuildRequestStatus.SUBMITTED && (
         <div className="absolute top-0 right-0 bg-indigo-600 text-[10px] uppercase tracking-widest font-bold px-3 py-1 rounded-bl-lg">Under Review</div>
       )}
       {b.status === BuildRequestStatus.APPROVED && (
         <div className="absolute top-0 right-0 bg-emerald-600 text-[10px] uppercase tracking-widest font-bold px-3 py-1 rounded-bl-lg">Approved</div>
       )}
       <div className="absolute top-4 right-4 flex md:opacity-0 md:group-hover:opacity-100 transition-opacity gap-2 z-10">
          <button onClick={() => onDelete(b.buildId)} className="w-8 h-8 flex items-center justify-center bg-rose-500/20 text-rose-400 hover:bg-rose-500/40 rounded-lg backdrop-blur-md transition-colors" aria-label="Delete build">{Icons.trash}</button>
       </div>

       <div className="mb-4">
          <h4 className="text-lg font-bold text-white mb-1 truncate pr-8">{b.buildName}</h4>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="text-[10px] text-slate-500 tracking-wider uppercase">{new Date(b.createdAt).toLocaleDateString()}</span>
            <div className="flex gap-1.5 items-center">
              <span className={`w-2 h-2 rounded-full ${b.compatibilityStatus === 'PASS' ? 'bg-emerald-500' : b.compatibilityStatus === 'WARNING' ? 'bg-amber-500' : 'bg-rose-500'}`} />
              <span className="text-[10px] font-bold tracking-widest uppercase text-slate-400">{b.compatibilityStatus}</span>
            </div>
            {b.performanceScore !== undefined && (
              <span className="text-[10px] font-mono bg-indigo-500/10 text-indigo-400 font-bold px-1.5 py-0.5 rounded border border-indigo-500/20">
                Score: {b.performanceScore}/100
              </span>
            )}
          </div>
       </div>

       <div className="grid grid-cols-2 gap-3 text-xs bg-[#020617]/50 rounded-xl p-4 border border-white/5 shrink-0 flex-1">
          <div><span className="block text-[10px] text-slate-500 mb-0.5 font-bold uppercase tracking-wider">Processor</span> <span className="text-slate-200 line-clamp-1" title={b.cpu}>{b.cpu}</span></div>
          <div><span className="block text-[10px] text-slate-500 mb-0.5 font-bold uppercase tracking-wider">Graphics</span> <span className="text-slate-200 line-clamp-1" title={b.gpu}>{b.gpu}</span></div>
          <div><span className="block text-[10px] text-slate-500 mb-0.5 font-bold uppercase tracking-wider">Motherboard</span> <span className="text-slate-200 line-clamp-1" title={b.motherboard}>{b.motherboard}</span></div>
          <div><span className="block text-[10px] text-slate-500 mb-0.5 font-bold uppercase tracking-wider">Memory</span> <span className="text-slate-200 line-clamp-1" title={b.ram}>{b.ram}</span></div>
          {b.case && <div className="col-span-2 border-t border-white/5 pt-2 mt-1"><span className="block text-[10px] text-slate-500 mb-0.5 font-bold uppercase tracking-wider">Chassis / Case</span> <span className="text-slate-200 line-clamp-1" title={b.case}>{b.case}</span></div>}
       </div>

       <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-500 uppercase">Estimated</span>
            <span className="text-base font-bold text-emerald-400">${b.estimatedCostUSD}</span>
          </div>
          
          {(!b.status || b.status === BuildRequestStatus.DRAFT) ? (
            <button onClick={() => onSendForReview(b)} className="px-4 py-2 bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600/40 rounded-lg text-xs font-semibold uppercase tracking-wider backdrop-blur-md transition-colors">
              Send to Tech
            </button>
          ) : (
            <button disabled className="px-4 py-2 bg-white/5 text-slate-400 rounded-lg text-xs font-semibold uppercase tracking-wider">
              {(b.status === BuildRequestStatus.SUBMITTED || b.status === BuildRequestStatus.UNDER_REVIEW) ? 'Pending Tech' : ''}
              {b.status === BuildRequestStatus.APPROVED ? 'Tech Approved' : ''}
              {b.status === BuildRequestStatus.IN_PROGRESS ? 'Building Now' : ''}
            </button>
          )}
       </div>
    </div>
  );
};
