
import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { Match, StreamType, User, PlatformSettings } from '../types';
import { useAuth } from '../App';
import { useNavigate } from 'react-router-dom';

const AdminPanel: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [matches, setMatches] = useState<Match[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [settings, setSettings] = useState<PlatformSettings>(db.getSettings());
  const [activeTab, setActiveTab] = useState<'matches' | 'users' | 'settings'>('matches');
  const [showModal, setShowModal] = useState(false);
  const [editingMatch, setEditingMatch] = useState<Match | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    sport: 'Cricket' as any,
    streamUrl: '',
    streamType: 'm3u8' as StreamType,
    status: 'live' as any,
    viewers: 0,
    watching: 0,
    chatEnabled: true
  });

  useEffect(() => {
    if (!user?.isAdmin) navigate('/');
    loadData();
  }, [user, navigate]);

  const loadData = () => {
    setMatches([...db.getMatches()] as Match[]);
    setUsers([...db.getUsers()] as User[]);
    setSettings(db.getSettings());
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    db.updateSettings(settings);
    alert('Settings updated successfully!');
  };

  const resetForm = () => {
    setFormData({ title: '', sport: 'Cricket', streamUrl: '', streamType: 'm3u8', status: 'live', viewers: 0, watching: 0, chatEnabled: true });
    setEditingMatch(null);
  };

  const handleSaveMatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingMatch) {
      db.updateMatch(editingMatch.id, formData);
    } else {
      db.addMatch({
        id: Math.random().toString(36).substr(2, 9),
        ...formData,
        createdAt: Date.now()
      });
    }
    loadData();
    setShowModal(false);
    resetForm();
  };

  const handleDeleteMatch = (id: string) => {
    if (window.confirm('Are you sure you want to remove this stream?')) {
      db.deleteMatch(id);
      loadData();
    }
  };

  const handleResetXP = (uid: string) => {
    const u = db.getUser(uid);
    if (u) {
      db.upsertUser({ ...u, xp: 0, rank: 'Bronze' as any });
      loadData();
    }
  };

  const handleDeleteUser = (uid: string) => {
    if (window.confirm('Permanently delete this user account?')) {
      db.deleteUser(uid);
      loadData();
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tighter">Command Center</h1>
          <p className="text-slate-400 text-sm">Orchestrate Toto Stream Experience</p>
        </div>
        <div className="flex gap-2 p-1.5 bg-slate-800 rounded-2xl overflow-x-auto scrollbar-hide">
           <button onClick={() => setActiveTab('matches')} className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase transition-all whitespace-nowrap ${activeTab === 'matches' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' : 'text-slate-400'}`}>Streams</button>
           <button onClick={() => setActiveTab('users')} className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase transition-all whitespace-nowrap ${activeTab === 'users' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' : 'text-slate-400'}`}>Users</button>
           <button onClick={() => setActiveTab('settings')} className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase transition-all whitespace-nowrap ${activeTab === 'settings' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' : 'text-slate-400'}`}>Settings</button>
        </div>
      </div>

      {activeTab === 'matches' && (
        <div className="space-y-6">
          <div className="flex justify-end">
            <button onClick={() => { resetForm(); setShowModal(true); }} className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase flex items-center gap-2 shadow-lg shadow-blue-900/30 transition-all active:scale-95">
               Add New Broadcast
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {matches.map(m => (
              <div key={m.id} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 hover:border-blue-500/30 transition-all shadow-lg group">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">{m.sport}</span>
                    <h3 className="text-white font-bold group-hover:text-blue-400 transition-colors">{m.title}</h3>
                  </div>
                  <div className="flex gap-2">
                    <div className="bg-green-900/20 rounded-lg px-2 py-1 text-center min-w-[60px] border border-green-500/10">
                      <span className="text-[8px] text-green-500 block leading-none font-black">WATCHING</span>
                      <span className="text-xs font-black text-white">{m.watching}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { setEditingMatch(m); setFormData({ ...m }); setShowModal(true); }} className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all">Edit</button>
                  <button onClick={() => handleDeleteMatch(m.id)} className="flex-1 bg-red-900/20 hover:bg-red-900/40 text-red-500 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all">Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
          <table className="w-full text-left">
            <thead className="bg-slate-800/50">
              <tr className="text-slate-500 text-[10px] font-black uppercase tracking-widest">
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">XP/Rank</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {users.map(u => (
                <tr key={u.uid} className="hover:bg-slate-800/20 transition-colors">
                  <td className="px-6 py-4 flex items-center gap-3 font-bold text-slate-200">
                    <img src={u.photoUrl} className="w-8 h-8 rounded-full" alt="" />
                    {u.username}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-blue-400 font-bold text-xs">{u.xp} XP</span>
                    <p className="text-[9px] text-slate-500 uppercase">{u.rank}</p>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => handleResetXP(u.uid)} className="text-blue-500 hover:text-blue-400 text-[10px] font-black uppercase">Clear XP</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl animate-in slide-in-from-right-4 duration-500">
           <h2 className="text-xl font-black text-white mb-6 uppercase tracking-tighter">Global Branding & Links</h2>
           <form onSubmit={handleSaveSettings} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-2 block">Platform Logo URL (Image Link)</label>
                  <input 
                    type="text" 
                    value={settings.logoUrl} 
                    onChange={e => setSettings({...settings, logoUrl: e.target.value})} 
                    className="w-full bg-slate-800 border-2 border-slate-700 text-white px-5 py-4 rounded-2xl focus:border-blue-500 outline-none transition-all font-mono text-xs" 
                    placeholder="https://example.com/logo.png"
                  />
                  <div className="mt-2 flex items-center gap-3 p-3 bg-slate-800/30 rounded-xl border border-slate-800">
                    <p className="text-[9px] text-slate-500 uppercase font-black">Preview:</p>
                    <img src={settings.logoUrl} alt="Preview" className="h-10 w-10 object-contain rounded bg-white/5 p-1" />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-2 block">Official Telegram Channel Link</label>
                  <input 
                    type="text" 
                    value={settings.telegramLink} 
                    onChange={e => setSettings({...settings, telegramLink: e.target.value})} 
                    className="w-full bg-slate-800 border-2 border-slate-700 text-white px-5 py-4 rounded-2xl focus:border-blue-500 outline-none transition-all font-mono text-xs" 
                    placeholder="https://t.me/your_channel"
                  />
                </div>
              </div>

              <div className="pt-4">
                <button type="submit" className="bg-green-600 hover:bg-green-500 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase shadow-xl shadow-green-900/20 transition-all active:scale-95">
                  Save All Settings
                </button>
              </div>
           </form>
        </div>
      )}

      {/* Broadcast Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-xl rounded-[40px] overflow-hidden shadow-2xl animate-in zoom-in duration-500">
            <div className="p-8 border-b border-slate-800 flex justify-between items-center bg-slate-800/30">
              <h2 className="text-2xl font-black text-white">{editingMatch ? 'Update Content' : 'Broadcast New Live'}</h2>
              <button onClick={() => setShowModal(false)} className="bg-slate-800 hover:bg-slate-700 p-2 rounded-full transition-all">
                <svg className="h-6 w-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleSaveMatch} className="p-8 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-2 block">Match Headline</label>
                  <input type="text" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-slate-800 border-2 border-slate-700 text-white px-5 py-3.5 rounded-2xl focus:border-blue-500 outline-none transition-all" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-2 block">Sport Division</label>
                  <select value={formData.sport} onChange={e => setFormData({...formData, sport: e.target.value as any})} className="w-full bg-slate-800 border-2 border-slate-700 text-white px-5 py-3.5 rounded-2xl outline-none">
                    <option>Cricket</option><option>Football</option><option>Basketball</option><option>Other</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-2 block">Fake Live Watching</label>
                    <input type="number" value={formData.watching} onChange={e => setFormData({...formData, watching: parseInt(e.target.value)})} className="w-full bg-slate-800 border-2 border-slate-700 text-white px-4 py-3 rounded-2xl outline-none" />
                  </div>
                  <div>
                    <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-2 block">Total Viewers</label>
                    <input type="number" value={formData.viewers} onChange={e => setFormData({...formData, viewers: parseInt(e.target.value)})} className="w-full bg-slate-800 border-2 border-slate-700 text-white px-4 py-3 rounded-2xl outline-none" />
                  </div>
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-2 block">Source URL (m3u8 / embed)</label>
                <input type="text" required value={formData.streamUrl} onChange={e => setFormData({...formData, streamUrl: e.target.value})} className="w-full bg-slate-800 border-2 border-slate-700 text-white px-5 py-3.5 rounded-2xl font-mono text-sm" />
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-800/40 rounded-2xl border border-slate-800">
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input type="radio" checked={formData.streamType === 'm3u8'} onChange={() => setFormData({...formData, streamType: 'm3u8'})} />
                    <span className="text-xs font-black uppercase text-slate-400 group-hover:text-blue-400">HLS (M3U8)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input type="radio" checked={formData.streamType === 'embed'} onChange={() => setFormData({...formData, streamType: 'embed'})} />
                    <span className="text-xs font-black uppercase text-slate-400 group-hover:text-blue-400">IFRAME</span>
                  </label>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={formData.chatEnabled} onChange={e => setFormData({...formData, chatEnabled: e.target.checked})} />
                  <span className="text-xs font-black uppercase text-blue-400">Chat On</span>
                </label>
              </div>
              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-[20px] font-black text-sm uppercase shadow-2xl shadow-blue-900/40 transition-all transform active:scale-95">
                Commit Broadcast
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
