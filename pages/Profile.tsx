
import React, { useState } from 'react';
import { useAuth } from '../App';
import { useNavigate, Navigate } from 'react-router-dom';
import { getRankStyles, RANK_THRESHOLDS } from '../constants';
import { db } from '../firebase';

const Profile: React.FC = () => {
  const { user, logout, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    phone: user?.phone || ''
  });

  if (!user) return <Navigate to="/login" />;

  const currentRankInfo = getRankStyles(user.rank);
  const nextRankIdx = RANK_THRESHOLDS.findIndex(r => r.rank === user.rank) - 1;
  const nextRank = nextRankIdx >= 0 ? RANK_THRESHOLDS[nextRankIdx] : null;

  const progress = nextRank 
    ? ((user.xp - currentRankInfo.minXp) / (nextRank.minXp - currentRankInfo.minXp)) * 100
    : 100;

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedUser = {
      ...user,
      username: formData.username,
      email: formData.email,
      phone: formData.phone
    };
    db.upsertUser(updatedUser);
    localStorage.setItem('toto_session', JSON.stringify(updatedUser));
    refreshUser();
    setIsEditing(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-700 pb-10">
      <div className="bg-slate-900 border border-slate-800 rounded-[40px] overflow-hidden shadow-2xl">
        {/* Header/Cover */}
        <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-600 relative">
          <div className="absolute -bottom-12 left-8 p-1 bg-slate-950 rounded-full shadow-2xl">
            <img src={user.photoUrl} className="w-24 h-24 rounded-full border-4 border-slate-900 object-cover bg-slate-800" alt="Profile" />
          </div>
          <button 
            onClick={() => setIsEditing(!isEditing)}
            className="absolute bottom-4 right-8 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest border border-white/20 transition-all"
          >
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>

        <div className="pt-16 px-8 pb-8 space-y-6">
          {!isEditing ? (
            <>
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-black text-white">{user.username}</h1>
                  <p className="text-slate-500 font-mono text-xs uppercase tracking-tighter mt-1">{user.uid}</p>
                  <div className="mt-4 space-y-1">
                    {user.email && <p className="text-sm text-slate-400 flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                      {user.email}
                    </p>}
                    {user.phone && <p className="text-sm text-slate-400 flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                      {user.phone}
                    </p>}
                  </div>
                </div>
                <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest ${currentRankInfo.bg} ${currentRankInfo.color} border border-current opacity-80`}>
                  {user.rank}
                </span>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-800/50 p-5 rounded-3xl border border-slate-700/50">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Experience</p>
                  <p className="text-2xl font-black text-blue-400">{user.xp.toLocaleString()} <span className="text-xs text-slate-500">XP</span></p>
                </div>
                <div className="bg-slate-800/50 p-5 rounded-3xl border border-slate-700/50">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Account Status</p>
                  <p className="text-2xl font-black text-green-500">{user.isAdmin ? 'Admin' : 'Member'}</p>
                </div>
              </div>

              {/* Rank Progress */}
              <div className="space-y-3 bg-slate-800/30 p-6 rounded-3xl border border-slate-800">
                <div className="flex justify-between items-end mb-2">
                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Rank Progress</span>
                  <span className="text-[10px] font-bold text-slate-500 uppercase">
                    {nextRank ? `${nextRank.minXp - user.xp} XP to ${nextRank.rank}` : 'Max Rank Achieved'}
                  </span>
                </div>
                <div className="h-4 bg-slate-950 rounded-full overflow-hidden p-1 border border-slate-800">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-600 to-indigo-400 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="flex justify-between mt-2">
                   <span className="text-[10px] font-bold text-slate-600 uppercase">{currentRankInfo.rank}</span>
                   <span className="text-[10px] font-bold text-slate-600 uppercase">{nextRank?.rank || 'Legend'}</span>
                </div>
              </div>

              <div className="pt-6 space-y-3">
                 <button 
                    onClick={logout}
                    className="w-full bg-red-600/10 hover:bg-red-600/20 text-red-500 py-4 rounded-2xl font-black text-xs uppercase tracking-widest border border-red-500/20 transition-all active:scale-95"
                 >
                   Logout from Platform
                 </button>
              </div>
            </>
          ) : (
            <form onSubmit={handleUpdateProfile} className="space-y-5 animate-in slide-in-from-top-4 duration-300">
              <h2 className="text-xl font-black text-white uppercase tracking-tight">Update Personal Info</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-2 block">Display Name</label>
                  <input 
                    type="text" 
                    value={formData.username} 
                    onChange={e => setFormData({...formData, username: e.target.value})}
                    className="w-full bg-slate-800 border-2 border-slate-700 text-white px-5 py-3.5 rounded-2xl focus:border-blue-500 outline-none transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-2 block">Email Address</label>
                  <input 
                    type="email" 
                    placeholder="Enter your email"
                    value={formData.email} 
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    className="w-full bg-slate-800 border-2 border-slate-700 text-white px-5 py-3.5 rounded-2xl focus:border-blue-500 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-2 block">Phone Number</label>
                  <input 
                    type="tel" 
                    placeholder="+880..."
                    value={formData.phone} 
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                    className="w-full bg-slate-800 border-2 border-slate-700 text-white px-5 py-3.5 rounded-2xl focus:border-blue-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-900/30 transition-all active:scale-95"
                >
                  Save Changes
                </button>
                <button 
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-8 bg-slate-800 hover:bg-slate-700 text-slate-400 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      <div className="text-center p-8 bg-slate-900/40 rounded-[40px] border border-slate-800 border-dashed">
         <p className="text-slate-500 text-sm italic font-medium">"Watching live streams every day is the fastest way to become a Toto Stream Legend."</p>
      </div>
    </div>
  );
};

export default Profile;
