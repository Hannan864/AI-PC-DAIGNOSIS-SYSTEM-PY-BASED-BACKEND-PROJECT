import React, { useState, useEffect } from 'react';
import { db } from '../../../services/db';
import { Gig, GigCategory, RepairRequestStatus, RepairRequest } from '../../../types';
import { useAuth } from '../../Layout/AuthProvider';
import { Icons } from '../../../constants';

export const BrowseGigs = () => {
  const { session, user } = useAuth();
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [activeCategory, setActiveCategory] = useState<GigCategory | 'ALL'>('ALL');
  
  // Request Modal State
  const [selectedGig, setSelectedGig] = useState<Gig | null>(null);
  const [issueDescription, setIssueDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadGigs();
  }, []);

  const loadGigs = async () => {
    const allGigs = await db.getGigs();
    setGigs(allGigs.filter(g => g.isAvailable).sort((a, b) => b.createdAt - a.createdAt));
  };

  const handleRequestService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.userId || !user || !selectedGig) return;
    
    setIsSubmitting(true);

    const req: RepairRequest = {
      id: `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      userId: session.userId,
      userName: user.name,
      technicianId: selectedGig.technicianId,
      gigId: selectedGig.id,
      gigTitle: selectedGig.title,
      issueDescription,
      status: RepairRequestStatus.SUBMITTED,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    await db.addRepairRequest(req);
    
    setIsSubmitting(false);
    setSelectedGig(null);
    setIssueDescription('');
    alert('Repair request submitted successfully!');
  };

  const filteredGigs = activeCategory === 'ALL' 
    ? gigs 
    : gigs.filter(g => g.category === activeCategory);

  return (
    <div className="space-y-6 relative h-full">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-white tracking-tight">Gig Marketplace</h2>
          <p className="text-slate-400">Find and request expert repairs from certified technicians.</p>
        </div>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-2">
        <button 
          onClick={() => setActiveCategory('ALL')}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase transition-colors whitespace-nowrap ${activeCategory === 'ALL' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'bg-white/5 hover:bg-white/10 text-slate-400 border border-white/5'}`}
        >
          All Categories
        </button>
        {Object.values(GigCategory).map(cat => (
          <button 
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase transition-colors whitespace-nowrap ${activeCategory === cat ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'bg-white/5 hover:bg-white/10 text-slate-400 border border-white/5'}`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-20">
        {filteredGigs.length === 0 ? (
           <div className="col-span-full p-12 text-center glass rounded-xl border border-white/5">
             <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4 text-slate-400">
                {Icons.search}
             </div>
             <h3 className="text-lg font-semibold text-white mb-1">No Gigs Found</h3>
             <p className="text-slate-500">No technicians have posted services in this category yet.</p>
           </div>
        ) : (
          filteredGigs.map(gig => (
            <div key={gig.id} className="glass rounded-xl p-5 border border-white/5 flex flex-col group hover:border-indigo-500/30 transition-colors">
               <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold">
                       {gig.technicianName.charAt(0).toUpperCase()}
                     </div>
                     <div>
                       <div className="font-semibold text-white text-sm">{gig.technicianName}</div>
                       <div className="text-xs text-amber-400 flex items-center gap-1">
                          {Icons.star} 4.9 (Pro Tech)
                       </div>
                     </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    {gig.category}
                  </span>
               </div>
               
               <h3 className="text-lg font-semibold text-white mb-1 tracking-tight">{gig.title}</h3>
               <p className="text-sm text-slate-400 line-clamp-2 mb-6 flex-1">{gig.description}</p>
               
               <div className="bg-[#020617]/50 rounded-lg p-3 border border-white/5 mb-4 grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Price</div>
                    <div className="font-semibold text-emerald-400">PKR {gig.price.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Est. Time</div>
                    <div className="font-semibold text-slate-300">{gig.estimatedTime}</div>
                  </div>
               </div>
               
               <button 
                 onClick={() => setSelectedGig(gig)}
                 className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-lg transition-colors shadow-lg shadow-indigo-500/20"
               >
                 Request Service
               </button>
            </div>
          ))
        )}
      </div>

      {/* Request Modal */}
      {selectedGig && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-0 md:p-4">
          <div className="w-full h-full md:h-auto md:max-w-lg glass md:rounded-2xl border-0 md:border md:border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-screen md:max-h-[90vh]">
            <div className="p-5 border-b border-white/10 flex items-center justify-between bg-indigo-500/5 shrink-0">
              <h3 className="text-lg font-semibold text-white">Service Request</h3>
              <button onClick={() => setSelectedGig(null)} className="text-slate-400 hover:text-white transition-colors p-2">
                {Icons.close}
              </button>
            </div>
            
            <form onSubmit={handleRequestService} className="p-6 overflow-y-auto space-y-6 flex-1">
              <div className="p-4 bg-black/30 rounded-lg border border-white/5 space-y-2">
                 <div className="font-semibold text-white">{selectedGig.title}</div>
                 <div className="text-sm text-slate-400">Served by {selectedGig.technicianName}</div>
                 <div className="flex items-center justify-between text-sm pt-2 mt-2 border-t border-white/5">
                    <span className="text-slate-500">Total Price</span>
                    <span className="font-semibold text-emerald-400">PKR {selectedGig.price.toLocaleString()}</span>
                 </div>
              </div>

              <div>
                 <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">Describe Your Issue</label>
                 <textarea 
                   required 
                   value={issueDescription} 
                   onChange={(e) => setIssueDescription(e.target.value)} 
                   rows={4} 
                   placeholder="Please provide details about your system's problem, recent changes, or error messages..." 
                   className="w-full bg-[#020617] border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 resize-vertical"
                 ></textarea>
              </div>
              
              <div className="flex gap-3">
                 <button type="button" onClick={() => setSelectedGig(null)} className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-slate-300 font-medium rounded-lg transition-colors">
                   Cancel
                 </button>
                 <button type="submit" disabled={isSubmitting} className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg transition-colors shadow-lg shadow-indigo-500/20 disabled:opacity-50">
                   {isSubmitting ? 'Submitting...' : 'Confirm Request'}
                 </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
