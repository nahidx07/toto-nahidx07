
import React, { useState, useEffect } from 'react';
import { dbOps } from '../firebase';
import { Match, StreamType, PlatformSettings, User, Rank } from '../types';
import { useAuth } from '../App';
import { useNavigate, Link } from 'react-router-dom';
import { getRankByXp, getRankStyles } from '../constants';

const AdminPanel: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [matches, setMatches] = useState<Match[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [settings, setSettings] = useState<PlatformSettings>({
    logoUrl: '',
    telegramLink: ''
  });
  const [activeTab, setActiveTab] = useState<'matches' | 'users' | 'settings'>('matches');
  const [showModal, setShowModal] = useState(false);
  const [editingMatch, setEditingMatch] = useState<Match | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    sport: 'Cricket' as any,
    streamUrl: '',
    streamType: 'm3u8' as StreamType,
    streamUrl2: '',
    streamType2: 'm3u8' as StreamType,
    thumbnailUrl: '',
    status: 'live' as any,
    viewers: 0,
    watching: 0,
    chatEnabled: true
  });

  const [userFormData, setUserFormData] = useState({
    username: '',
    xp: 0,
    isAdmin: false,
    isBanned: false
  });

  useEffect(() => {
    if (user && user.isAdmin) {
      const unsubMatches = dbOps.subscribeMatches(setMatches);
      dbOps.getSettings().then(setSettings);
      if (activeTab === 'users') {
        dbOps.getAllUsers().then(setUsers);
      }
      return () => unsubMatches();
    }
  }, [user, activeTab]);

  if (!user || !user.isAdmin) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-slate-900 border border-slate-800 p-10 rounded-[40px] shadow-2xl max-w-sm w-full">
          <h2 className="text-xl font-black text-white mb-2 uppercase">Access Restricted</h2>
          <p className="text-slate-400 text-sm mb-8">Admin permissions required.</p>
          <Link to="/" className="block w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest">Home</Link>
        </div>
      </div>
    );
  }

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await dbOps.updateSettings(settings);
      alert('Settings updated successfully!');
    } catch (err) {
      alert('Failed to update settings');
    }
  };

  const handleSaveMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingMatch) {
        await dbOps.updateMatch(editingMatch.id, formData);
      } else {
        await dbOps.addMatch(formData as any);
      }
      setShowModal(false);
      setEditingMatch(null);
    } catch (err) {
      alert('Error saving match');
    }
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    try {
      const updated = {
        ...editingUser,
        username: userFormData.username,
        xp: userFormData.xp,
        rank: getRankByXp(userFormData.xp),
        isAdmin: userFormData.isAdmin,
        isBanned: userFormData.isBanned
      };
      await dbOps.upsertUser(updated);
      const all = await dbOps.getAllUsers();
      setUsers(all);
      setEditingUser(null);
    } catch (err) {
      alert('Error updating user');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-6xl mx-auto pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900 p-6 rounded-[32px] border border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tighter uppercase italic">Control Panel</h1>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Platform Administration</p>
        </div>
        <div className="flex gap-1.5 p-1 bg-slate-800/50 rounded-2xl overflow-x-auto w-full md:w-auto">
           {['matches', 'users', 'settings'].map((tab) => (
             <button 
              key={tab}
              onClick={() => setActiveTab(tab as any)} 
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all whitespace-nowrap ${activeTab === tab ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' : 'text-slate-400 hover:text-slate-200'}`}
             >
               {tab}
             </button>
           ))}
        </div>
      </div>

      {activeTab === 'matches' && (
        <div className="space-y-6">
          <div className="flex justify-end">
            <button onClick={() => { setEditingMatch(null); setFormData({title:'', sport:'Cricket', streamUrl:'', streamType:'m3u8', streamUrl2: '', streamType2: 'm3u8', thumbnailUrl:'', status:'live', viewers:0, watching:0, chatEnabled:true}); setShowModal(true); }} className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase shadow-lg shadow-blue-900/30">
               New Stream
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {matches.map(m => (
              <div key={m.id} className="bg-slate-900 border border-slate-800 rounded-3xl p-5 group flex flex-col">
                <div className="flex gap-4 mb-4">
                  <img src={m.thumbnailUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${m.title}`} className="w-16 h-12 object-cover rounded-xl border border-slate-800" alt="" />
                  <div className="min-w-0 flex-1">
                    <span className="text-[9px] font-black uppercase text-blue-500 block mb-0.5">{m.sport}</span>
                    <h3 className="text-white font-bold truncate text-sm">{m.title}</h3>
                  </div>
                </div>
                <div className="mt-auto flex gap-2">
                  <button onClick={() => { setEditingMatch(m); setFormData({title:m.title, sport:m.sport, streamUrl:m.streamUrl, streamType:m.streamType, streamUrl2: m.streamUrl2 || '', streamType2: m.streamType2 || 'm3u8', thumbnailUrl:m.thumbnailUrl||'', status:m.status, viewers:m.viewers, watching:m.watching, chatEnabled:m.chatEnabled}); setShowModal(true); }} className="flex-1 bg-slate-800 text-slate-300 py-2 rounded-xl text-[10px] font-black uppercase hover:bg-slate-700 transition-colors">Edit</button>
                  <button onClick={() => window.confirm('Delete?') && dbOps.deleteMatch(m.id)} className="flex-1 bg-red-900/20 text-red-500 py-2 rounded-xl text-[10px] font-black uppercase hover:bg-red-900/30 transition-colors">Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="bg-slate-900 border border-slate-800 rounded-[32px] overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-800/50 text-[10px] font-black uppercase tracking-widest text-slate-500">
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Rank/XP</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {users.map(u => (
                  <tr key={u.uid} className={`hover:bg-slate-800/20 transition-colors ${u.isBanned ? 'opacity-50' : ''}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img src={u.photoUrl} className="w-8 h-8 rounded-full border border-slate-700 object-cover" alt="" />
                        <div>
                          <p className="text-sm font-bold text-slate-200">{u.username}</p>
                          <p className="text-[8px] font-mono text-slate-500 truncate max-w-[100px]">{u.uid}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {u.isAdmin && <span className="bg-blue-600/20 text-blue-400 text-[8px] font-black uppercase px-2 py-0.5 rounded border border-blue-600/20">Admin</span>}
                        {u.isBanned && <span className="bg-red-600/20 text-red-400 text-[8px] font-black uppercase px-2 py-0.5 rounded border border-red-600/20">Banned</span>}
                        {!u.isAdmin && !u.isBanned && <span className="text-slate-600 text-[8px] font-black uppercase">Standard</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className={`text-[8px] font-black uppercase w-fit px-1.5 rounded ${getRankStyles(u.rank).bg} ${getRankStyles(u.rank).color}`}>{u.rank}</span>
                        <span className="text-[10px] font-bold text-slate-400 mt-0.5">{u.xp} XP</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => { setEditingUser(u); setUserFormData({username:u.username, xp:u.xp, isAdmin:u.isAdmin, isBanned:!!u.isBanned}); }} 
                        className="text-blue-400 hover:text-blue-300 text-[10px] font-black uppercase tracking-widest"
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="bg-slate-900 border border-slate-800 rounded-[32px] p-8 max-w-2xl">
           <h2 className="text-lg font-black text-white mb-6 uppercase italic">Global Settings</h2>
           <form onSubmit={handleSaveSettings} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase block mb-2">Logo URL</label>
                  <input type="text" value={settings.logoUrl} onChange={e => setSettings({...settings, logoUrl: e.target.value})} className="w-full bg-slate-800/50 border border-slate-700 text-white px-5 py-3 rounded-2xl outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase block mb-2">Telegram Link</label>
                  <input type="text" value={settings.telegramLink} onChange={e => setSettings({...settings, telegramLink: e.target.value})} className="w-full bg-slate-800/50 border border-slate-700 text-white px-5 py-3 rounded-2xl outline-none focus:border-blue-500" />
                </div>
              </div>
              <button type="submit" className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase shadow-xl shadow-blue-900/20">Apply Settings</button>
           </form>
        </div>
      )}

      {/* User Edit Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-[32px] overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center">
              <h2 className="font-black text-white uppercase text-sm">Manage User</h2>
              <button onClick={() => setEditingUser(null)} className="text-slate-500 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleSaveUser} className="p-6 space-y-4">
              <div>
                <label className="text-[9px] font-black text-slate-500 uppercase block mb-1">Username</label>
                <input type="text" value={userFormData.username} onChange={e => setUserFormData({...userFormData, username: e.target.value})} className="w-full bg-slate-800 border border-slate-700 text-white px-4 py-2.5 rounded-xl outline-none" />
              </div>
              <div>
                <label className="text-[9px] font-black text-slate-500 uppercase block mb-1">XP Points</label>
                <input type="number" value={userFormData.xp} onChange={e => setUserFormData({...userFormData, xp: parseInt(e.target.value)})} className="w-full bg-slate-800 border border-slate-700 text-white px-4 py-2.5 rounded-xl outline-none" />
              </div>
              <div className="flex gap-4 p-3 bg-slate-800/40 rounded-xl">
                 <label className="flex items-center gap-2 cursor-pointer flex-1">
                   <input type="checkbox" checked={userFormData.isAdmin} onChange={e => setUserFormData({...userFormData, isAdmin: e.target.checked})} className="accent-blue-500" />
                   <span className="text-[10px] font-black uppercase text-slate-300">Admin</span>
                 </label>
                 <label className="flex items-center gap-2 cursor-pointer flex-1">
                   <input type="checkbox" checked={userFormData.isBanned} onChange={e => setUserFormData({...userFormData, isBanned: e.target.checked})} className="accent-red-500" />
                   <span className="text-[10px] font-black uppercase text-red-500">Banned</span>
                 </label>
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white py-3.5 rounded-2xl font-black text-xs uppercase shadow-xl transition-all active:scale-95">Update Profile</button>
            </form>
          </div>
        </div>
      )}

      {/* Match Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-[32px] overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center">
              <h2 className="font-black text-white uppercase text-sm">{editingMatch ? 'Update Match' : 'Add Match'}</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-500 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleSaveMatch} className="p-6 space-y-4 max-h-[85vh] overflow-y-auto">
              <input type="text" placeholder="Title" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-slate-800 border border-slate-700 text-white px-4 py-2.5 rounded-xl outline-none" />
              <div className="grid grid-cols-2 gap-3">
                <select value={formData.sport} onChange={e => setFormData({...formData, sport: e.target.value as any})} className="w-full bg-slate-800 border border-slate-700 text-white px-4 py-2.5 rounded-xl outline-none">
                  <option>Cricket</option><option>Football</option><option>Other</option>
                </select>
                <input type="number" placeholder="Watching" value={formData.watching} onChange={e => setFormData({...formData, watching: parseInt(e.target.value)})} className="w-full bg-slate-800 border border-slate-700 text-white px-4 py-2.5 rounded-xl outline-none" />
              </div>
              
              {/* Server 1 Section */}
              <div className="bg-slate-950/40 p-4 rounded-2xl border border-slate-800/50 space-y-3">
                <p className="text-[10px] font-black uppercase text-blue-500">Streaming Server 01</p>
                <input type="text" placeholder="Server 1 URL or Embed Code" required value={formData.streamUrl} onChange={e => setFormData({...formData, streamUrl: e.target.value})} className="w-full bg-slate-800 border border-slate-700 text-white px-4 py-2.5 rounded-xl outline-none" />
                <div className="flex gap-4 px-1">
                   <label className="flex items-center gap-2 cursor-pointer"><input type="radio" checked={formData.streamType === 'm3u8'} onChange={() => setFormData({...formData, streamType: 'm3u8'})} /><span className="text-[10px] font-black uppercase text-slate-400">m3u8</span></label>
                   <label className="flex items-center gap-2 cursor-pointer"><input type="radio" checked={formData.streamType === 'embed'} onChange={() => setFormData({...formData, streamType: 'embed'})} /><span className="text-[10px] font-black uppercase text-slate-400">Embed</span></label>
                </div>
              </div>

              {/* Server 2 Section */}
              <div className="bg-slate-950/40 p-4 rounded-2xl border border-slate-800/50 space-y-3">
                <p className="text-[10px] font-black uppercase text-purple-500">Streaming Server 02 (Optional)</p>
                <input type="text" placeholder="Server 2 URL or Embed Code" value={formData.streamUrl2} onChange={e => setFormData({...formData, streamUrl2: e.target.value})} className="w-full bg-slate-800 border border-slate-700 text-white px-4 py-2.5 rounded-xl outline-none" />
                <div className="flex gap-4 px-1">
                   <label className="flex items-center gap-2 cursor-pointer"><input type="radio" checked={formData.streamType2 === 'm3u8'} onChange={() => setFormData({...formData, streamType2: 'm3u8'})} /><span className="text-[10px] font-black uppercase text-slate-400">m3u8</span></label>
                   <label className="flex items-center gap-2 cursor-pointer"><input type="radio" checked={formData.streamType2 === 'embed'} onChange={() => setFormData({...formData, streamType2: 'embed'})} /><span className="text-[10px] font-black uppercase text-slate-400">Embed</span></label>
                </div>
              </div>

              <input type="text" placeholder="Thumbnail URL" value={formData.thumbnailUrl} onChange={e => setFormData({...formData, thumbnailUrl: e.target.value})} className="w-full bg-slate-800 border border-slate-700 text-white px-4 py-2.5 rounded-xl outline-none" />
              
              <button type="submit" className="w-full bg-blue-600 text-white py-3.5 rounded-2xl font-black text-xs uppercase shadow-xl hover:bg-blue-500 transition-all">Save Broadcast</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
