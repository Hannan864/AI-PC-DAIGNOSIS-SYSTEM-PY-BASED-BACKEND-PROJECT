import React, { useState, useEffect } from 'react';
import { db } from '../../../services/db';
import { Gig, GigCategory } from '../../../types';
import { useAuth } from '../../Layout/AuthProvider';
import { Icons } from '../../../constants';

export const GigManagement = () => {
  const { session, user } = useAuth();
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  
  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<GigCategory>(GigCategory.HARDWARE);
  const [price, setPrice] = useState(0);
  const [estimatedTime, setEstimatedTime] = useState('');

  const loadGigs = async () => {
    if (session?.userId) {
      const dbGigs = await db.getGigsByTechnician(session.userId);
      setGigs(dbGigs.sort((a, b) => b.createdAt - a.createdAt));
    }
  };

  useEffect(() => {
    loadGigs();
  }, [session]);

  const handleCreateGig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.userId || !user) return;

    const newGig: Gig = {
      id: `gig_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      technicianId: session.userId,
      technicianName: user.name,
      title,
      description,
      category,
      price,
      estimatedTime,
      isAvailable: true,
      createdAt: Date.now()
    };

    await db.addGig(newGig);
    setIsCreating(false);
    
    // Reset Form
    setTitle('');
    setDescription('');
    setCategory(GigCategory.HARDWARE);
    setPrice(0);
    setEstimatedTime('');
    
    loadGigs();
  };

  const handleDeleteGig = async (id: string) => {
    await db.deleteGig(id);
    loadGigs();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-white tracking-tight">Gig Management</h2>
          <p className="text-slate-400">Offer your technician services on the marketplace.</p>
        </div>
        <button 
          onClick={() => setIsCreating(!isCreating)}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors shadow-lg flex items-center gap-2 ${isCreating ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/20'}`}
        >
          {isCreating ? Icons.close : Icons.plus}
          {isCreating ? 'Cancel' : 'Create New Gig'}
        </button>
      </div>

      {isCreating && (
        <div className="glass rounded-xl p-6 border border-white/5 bg-indigo-500/5">
          <h3 className="text-lg font-semibold text-white mb-4">Post a New Service</h3>
          <form onSubmit={handleCreateGig} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">Gig Title</label>
                  <input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. PC Overheating Fix (Thermal Paste)" className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-2 text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50" />
               </div>
               <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">Category</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value as GigCategory)} className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500/50 appearance-none">
                    {Object.values(GigCategory).map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
               </div>
               <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">Price (PKR)</label>
                  <input required type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} placeholder="1500" className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-2 text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50" />
               </div>
               <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">Estimated Time</label>
                  <input required value={estimatedTime} onChange={(e) => setEstimatedTime(e.target.value)} placeholder="e.g. 2 hours" className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-2 text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50" />
               </div>
            </div>
            
            <div>
               <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">Description</label>
               <textarea required value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Describe the service..." className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-2 text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 resize-none"></textarea>
            </div>
            
            <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-6 py-2 rounded-lg transition-colors flex items-center gap-2">
              Publish Service Gig
            </button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {gigs.length === 0 ? (
          <div className="col-span-full p-12 text-center glass rounded-xl border border-white/5">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4 text-slate-400">
               {Icons.tag}
            </div>
            <h3 className="text-lg font-semibold text-white mb-1">No Gigs Yet</h3>
            <p className="text-slate-500">Create your first gig to start receiving requests.</p>
          </div>
        ) : (
          gigs.map(gig => (
            <div key={gig.id} className="glass rounded-xl p-5 border border-white/5 flex flex-col relative group">
              <div className="absolute top-4 right-4">
                 <button onClick={() => handleDeleteGig(gig.id)} className="p-1.5 bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white rounded transition-colors opacity-0 group-hover:opacity-100">
                   {Icons.close}
                 </button>
              </div>
              
              <div className="flex items-center gap-2 mb-3">
                 <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                   {gig.category}
                 </span>
                 {gig.isAvailable && <span className="w-2 h-2 rounded-full bg-emerald-500"></span>}
              </div>
              
              <h3 className="text-lg font-semibold text-white mb-1 tracking-tight">{gig.title}</h3>
              <p className="text-sm text-slate-400 line-clamp-2 mb-4 flex-1">{gig.description}</p>
              
              <div className="border-t border-white/5 pt-4 flex items-center justify-between">
                 <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                   PKR {gig.price.toLocaleString()}
                 </div>
                 <div className="text-xs text-slate-500 mono bg-black/20 px-2 py-1 rounded">
                   {gig.estimatedTime}
                 </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
