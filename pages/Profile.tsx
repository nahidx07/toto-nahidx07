
import React, { useState } from 'react';
import { useAuth } from '../App';
// Fix: Added missing Link to the imports from react-router-dom
import { useNavigate, Navigate, Link } from 'react-router-dom';
import { getRankStyles, RANK_THRESHOLDS } from '../constants';
import { dbOps } from '../firebase';

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

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const updatedUser = {
      ...user,
      username: formData.username,
      email: formData.email,
      phone: formData.phone
    };
    try {
      await dbOps.upsertUser(updatedUser);
      await refreshUser();
      setIsEditing(false);
    } catch (err) {
      alert("Failed to update profile");
    }
  };

  const copyUid = () => {
    navigator.clipboard.writeText(user.uid);
    alert("UID Copied!");
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-700 pb-10">
      <div className="bg-slate-900 border border-slate-800 rounded-[40px] overflow-hidden shadow-2xl">
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
                <div className="space-y-2">
                  <h1 className="text-3xl font-black text-white">{user.username}</h1>
                  <div className="flex items-center gap-2 group cursor-pointer" onClick={copyUid} title="Click to copy UID">
                    <p className="text-slate-500 font-mono text-[10px] uppercase tracking-tighter bg-slate-950 px-2 py-1 rounded border border-slate-800 group-hover:border-blue-500 transition-all">ID: {user.uid}</p>
                    <svg className="w-3 h-3 text-slate-600 group-hover:text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" /></svg>
                  </div>
                </div>
                <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest ${currentRankInfo.bg} ${currentRankInfo.color} border border-current opacity-80`}>
                  {user.rank}
                </span>
              </div>

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
              </div>

              <div className="pt-6 space-y-3">
                 {user.isAdmin && (
                   <Link to="/admin" className="block w-full bg-indigo-600 text-white text-center py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-900/30 transition-all active:scale-95">
                     Enter Admin Dashboard
                   </Link>
                 )}
                 <button 
                    onClick={logout}
                    className="w-full bg-red-600/10 hover:bg-red-600/20 text-red-500 py-4 rounded-2xl font-black text-xs uppercase tracking-widest border border-red-500/20 transition-all active:scale-95"
                 >
                   Logout from Platform
                 </button>
              </div>
            </>
          ) : (
            <form onSubmit={handleUpdateProfile} className="space-y-5">
              <h2 className="text-xl font-black text-white uppercase tracking-tight">Update Profile</h2>
              <div className="space-y-4">
                <input type="text" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} className="w-full bg-slate-800 border-2 border-slate-700 text-white px-5 py-3.5 rounded-2xl focus:border-blue-500 outline-none transition-all" required placeholder="Username" />
                <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-slate-800 border-2 border-slate-700 text-white px-5 py-3.5 rounded-2xl focus:border-blue-500 outline-none transition-all" placeholder="Email" />
              </div>
              <div className="pt-4 flex gap-3">
                <button type="submit" className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-900/30">Save Changes</button>
                <button type="button" onClick={() => setIsEditing(false)} className="px-8 bg-slate-800 text-slate-400 py-4 rounded-2xl font-black text-xs uppercase tracking-widest">Cancel</button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
