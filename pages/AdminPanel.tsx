
import React, { useState, useEffect } from 'react';
import { dbOps } from '../firebase';
import { Match, StreamType, PlatformSettings } from '../types';
import { useAuth } from '../App';
import { useNavigate, Link } from 'react-router-dom';

const AdminPanel: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [matches, setMatches] = useState<Match[]>([]);
  const [settings, setSettings] = useState<PlatformSettings>({
    logoUrl: '',
    telegramLink: ''
  });
  const [activeTab, setActiveTab] = useState<'matches' | 'settings'>('matches');
  const [showModal, setShowModal] = useState(false);
  const [editingMatch, setEditingMatch] = useState<Match | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    sport: 'Cricket' as any,
    streamUrl: '',
    streamType: 'm3u8' as StreamType,
    thumbnailUrl: '',
    status: 'live' as any,
    viewers: 0,
    watching: 0,
    chatEnabled: true
  });

  useEffect(() => {
    if (user && user.isAdmin) {
      const unsubMatches = dbOps.subscribeMatches(setMatches);
      dbOps.getSettings().then(setSettings);
      return () => unsubMatches();
    }
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-slate-900 border border-slate-800 p-10 rounded-[40px] shadow-2xl max-w-sm w-full">
          <div className="w-20 h-20 bg-blue-600/10 rounded-3xl flex items-center justify-center mx-auto mb-6 text-blue-500">
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg>
          </div>
          <h2 className="text-xl font-black text-white mb-2 uppercase">Login Required</h2>
          <p className="text-slate-400 text-sm mb-8 font-medium">Please sign in to access the control panel.</p>
          <Link to="/login" className="block w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-900/40">Go to Login</Link>
        </div>
      </div>
    );
  }

  if (!user.isAdmin) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in duration-500">
        <div className="bg-slate-900 border border-red-500/20 p-10 rounded-[40px] shadow-2xl max-w-md w-full relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-red-500"></div>
          <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6 text-red-500">
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 00-2 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
          </div>
          <h2 className="text-2xl font-black text-white mb-2 uppercase">Access Restricted</h2>
          <p className="text-slate-400 text-sm mb-8 leading-relaxed">
            Your account does not have administrative permissions. Please update your document in Firebase.
          </p>
          
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-left space-y-3 mb-8">
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Your UID (Find this in Firestore):</p>
              <code className="text-blue-400 font-mono text-xs break-all bg-blue-400/5 p-2 rounded block border border-blue-400/10">{user.uid}</code>
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Required Action:</p>
              <p className="text-[11px] text-slate-300">Add field <span className="text-green-500 font-bold">isAdmin: true</span> (Boolean) to this UID document in 'users' collection.</p>
            </div>
          </div>
          
          <button onClick={() => navigate('/')} className="text-slate-500 hover:text-white transition-all text-[10px] font-black uppercase tracking-[0.2em]">Return to Arena</button>
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

  const resetForm = () => {
    setFormData({ title: '', sport: 'Cricket', streamUrl: '', streamType: 'm3u8', thumbnailUrl: '', status: 'live', viewers: 0, watching: 0, chatEnabled: true });
    setEditingMatch(null);
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
      resetForm();
    } catch (err) {
      alert('Error saving match');
    }
  };

  const handleDeleteMatch = async (id: string) => {
    if (window.confirm('Are you sure?')) {
      await dbOps.deleteMatch(id);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 p-6 rounded-3xl border border-slate-800">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tighter">Command Center</h1>
          <p className="text-slate-400 text-sm">Manage streams and system configuration.</p>
        </div>
        <div className="flex gap-2 p-1 bg-slate-800 rounded-2xl">
           <button onClick={() => setActiveTab('matches')} className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${activeTab === 'matches' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' : 'text-slate-400'}`}>Streams</button>
           <button onClick={() => setActiveTab('settings')} className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${activeTab === 'settings' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' : 'text-slate-400'}`}>Settings</button>
        </div>
      </div>

      {activeTab === 'matches' && (
        <div className="space-y-6">
          <div className="flex justify-end">
            <button onClick={() => { resetForm(); setShowModal(true); }} className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase shadow-lg shadow-blue-900/30">
               Add New Broadcast
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {matches.map(m => (
              <div key={m.id} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 group">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex gap-4">
                    {m.thumbnailUrl && (
                      <img src={m.thumbnailUrl} className="w-16 h-12 object-cover rounded-lg border border-slate-700" alt="" />
                    )}
                    <div>
                      <span className="text-[10px] font-black uppercase text-slate-500">{m.sport}</span>
                      <h3 className="text-white font-bold group-hover:text-blue-400 transition-colors">{m.title}</h3>
                    </div>
                  </div>
                  <div className="bg-green-900/20 px-2 py-1 rounded text-center min-w-[50px]">
                    <span className="text-xs font-black text-white">{m.watching}</span>
                    <span className="text-[8px] text-green-500 block font-black uppercase">Live</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  {/* Fix: Explicitly map properties from Match to formData and handle optional thumbnailUrl to resolve TS error */}
                  <button 
                    onClick={() => { 
                      setEditingMatch(m); 
                      setFormData({ 
                        title: m.title,
                        sport: m.sport,
                        streamUrl: m.streamUrl,
                        streamType: m.streamType,
                        thumbnailUrl: m.thumbnailUrl || '',
                        status: m.status,
                        viewers: m.viewers,
                        watching: m.watching,
                        chatEnabled: m.chatEnabled
                      }); 
                      setShowModal(true); 
                    }} 
                    className="flex-1 bg-slate-800 text-slate-300 py-2.5 rounded-xl text-[10px] font-black uppercase"
                  >
                    Edit
                  </button>
                  <button onClick={() => handleDeleteMatch(m.id)} className="flex-1 bg-red-900/20 text-red-500 py-2.5 rounded-xl text-[10px] font-black uppercase">Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8">
           <h2 className="text-xl font-black text-white mb-6 uppercase">System Settings</h2>
           <form onSubmit={handleSaveSettings} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase block mb-2">Logo URL</label>
                  <input type="text" value={settings.logoUrl} onChange={e => setSettings({...settings, logoUrl: e.target.value})} className="w-full bg-slate-800 border-2 border-slate-700 text-white px-5 py-4 rounded-2xl focus:border-blue-500 outline-none" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase block mb-2">Telegram Link</label>
                  <input type="text" value={settings.telegramLink} onChange={e => setSettings({...settings, telegramLink: e.target.value})} className="w-full bg-slate-800 border-2 border-slate-700 text-white px-5 py-4 rounded-2xl focus:border-blue-500 outline-none" />
                </div>
              </div>
              <button type="submit" className="bg-green-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase shadow-xl shadow-green-900/20">Save Settings</button>
           </form>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-xl rounded-[40px] overflow-hidden shadow-2xl">
            <div className="p-8 border-b border-slate-800 flex justify-between items-center">
              <h2 className="text-2xl font-black text-white">{editingMatch ? 'Update Match' : 'Add Match'}</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleSaveMatch} className="p-8 space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Title</label>
                <input type="text" placeholder="Match Title" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-slate-800 border border-slate-700 text-white px-5 py-3 rounded-2xl outline-none focus:border-blue-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Sport</label>
                  <select value={formData.sport} onChange={e => setFormData({...formData, sport: e.target.value as any})} className="w-full bg-slate-800 border border-slate-700 text-white px-5 py-3 rounded-2xl outline-none">
                    <option>Cricket</option><option>Football</option><option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Watching Count</label>
                  <input type="number" placeholder="Watching" value={formData.watching} onChange={e => setFormData({...formData, watching: parseInt(e.target.value)})} className="w-full bg-slate-800 border border-slate-700 text-white px-5 py-3 rounded-2xl outline-none" />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Stream URL</label>
                <input type="text" placeholder="Stream URL" required value={formData.streamUrl} onChange={e => setFormData({...formData, streamUrl: e.target.value})} className="w-full bg-slate-800 border border-slate-700 text-white px-5 py-3 rounded-2xl outline-none" />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Thumbnail URL</label>
                <input type="text" placeholder="https://example.com/image.jpg" value={formData.thumbnailUrl} onChange={e => setFormData({...formData, thumbnailUrl: e.target.value})} className="w-full bg-slate-800 border border-slate-700 text-white px-5 py-3 rounded-2xl outline-none focus:border-blue-500" />
              </div>
              <div className="flex gap-4 p-4 bg-slate-800/50 rounded-2xl">
                 <label className="flex items-center gap-2 cursor-pointer">
                   <input type="radio" checked={formData.streamType === 'm3u8'} onChange={() => setFormData({...formData, streamType: 'm3u8'})} />
                   <span className="text-xs font-black uppercase text-slate-400">m3u8</span>
                 </label>
                 <label className="flex items-center gap-2 cursor-pointer">
                   <input type="radio" checked={formData.streamType === 'embed'} onChange={() => setFormData({...formData, streamType: 'embed'})} />
                   <span className="text-xs font-black uppercase text-slate-400">Embed</span>
                 </label>
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-xs uppercase shadow-2xl shadow-blue-900/40 transition-all active:scale-95">Save Broadcast</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
