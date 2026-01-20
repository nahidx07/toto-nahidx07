
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Match } from '../types';
import { db } from '../firebase';
import { useAuth } from '../App';
import VideoPlayer from '../components/VideoPlayer';
import Chat from '../components/Chat';

const StreamPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [match, setMatch] = useState<Match | null>(null);

  useEffect(() => {
    if (id) {
      const found = db.getMatches().find((m: Match) => m.id === id) as Match;
      if (found) setMatch(found);
      else navigate('/');
    }
  }, [id, navigate]);

  if (!match) return null;

  // Login Gate
  if (!user) {
    return (
      <div className="max-w-4xl mx-auto py-20 px-4 text-center animate-in fade-in zoom-in duration-500">
        <div className="bg-slate-900 border border-slate-800 rounded-[40px] p-12 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
          
          <div className="inline-flex items-center justify-center p-6 bg-blue-600/10 rounded-3xl mb-8 border border-blue-500/20">
            <svg className="w-16 h-16 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 00-2 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>

          <h2 className="text-3xl font-black text-white mb-4">Account Required</h2>
          <p className="text-slate-400 max-w-md mx-auto mb-10 text-lg">
            Watching live broadcasts and earning XP requires a free account. Join the <span className="text-blue-400 font-bold">Toto Stream</span> community now!
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/login" 
              className="bg-blue-600 hover:bg-blue-500 text-white px-10 py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-blue-900/40 transition-all active:scale-95"
            >
              Login / Register
            </Link>
            <Link 
              to="/" 
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-10 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all"
            >
              Back to Matches
            </Link>
          </div>

          <div className="mt-10 pt-10 border-t border-slate-800 flex justify-center gap-8">
             <div className="text-center">
                <p className="text-blue-400 font-black text-lg">+XP</p>
                <p className="text-[10px] text-slate-500 uppercase font-black">Rank Up</p>
             </div>
             <div className="text-center">
                <p className="text-green-400 font-black text-lg">LIVE</p>
                <p className="text-[10px] text-slate-500 uppercase font-black">Chatting</p>
             </div>
             <div className="text-center">
                <p className="text-purple-400 font-black text-lg">FREE</p>
                <p className="text-[10px] text-slate-500 uppercase font-black">Unlimited</p>
             </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in slide-in-from-bottom-6 duration-700">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <VideoPlayer url={match.streamUrl} type={match.streamType} matchId={match.id} />
          
          <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:scale-110 transition-transform">
               <svg className="h-32 w-32" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
            </div>
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-red-600/10 text-red-500 text-[10px] font-black uppercase px-2 py-1 rounded-lg border border-red-500/20 flex items-center gap-1.5 shadow-sm">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span> Live
                  </span>
                  <span className="bg-blue-600/10 text-blue-400 text-[10px] font-black uppercase px-2 py-1 rounded-lg border border-blue-500/20">
                    {match.sport}
                  </span>
                </div>
                <h1 className="text-2xl font-black text-white italic">{match.title}</h1>
              </div>

              <div className="flex gap-3">
                <div className="bg-green-600/10 backdrop-blur rounded-2xl px-5 py-3 border border-green-500/20 flex flex-col items-center min-w-[120px]">
                  <span className="text-[10px] text-green-500 font-black uppercase tracking-widest mb-1 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping"></span>
                    Watching
                  </span>
                  <span className="text-xl font-black text-white font-mono tracking-tighter">
                    {match.watching.toLocaleString()}
                  </span>
                </div>
                
                <div className="bg-slate-800/50 backdrop-blur rounded-2xl px-5 py-3 border border-slate-700/50 flex flex-col items-center min-w-[120px]">
                  <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Total Views</span>
                  <span className="text-xl font-black text-blue-400 font-mono tracking-tighter">
                    {match.viewers.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-800 flex flex-wrap gap-8 text-center sm:text-left">
               <div><p className="text-slate-500 text-[9px] uppercase font-black tracking-widest mb-1">XP Earned</p><p className="text-sm font-bold text-slate-200">+5 XP Every 30s</p></div>
               <div><p className="text-slate-500 text-[9px] uppercase font-black tracking-widest mb-1">Quality</p><p className="text-sm font-bold text-slate-200">1080p Ultra HD</p></div>
               <div><p className="text-slate-500 text-[9px] uppercase font-black tracking-widest mb-1">Platform</p><p className="text-sm font-bold text-blue-400 uppercase tracking-tighter">Toto Stream Global</p></div>
            </div>
          </div>
        </div>

        <div className="h-[650px] sticky top-24">
          <Chat matchId={match.id} />
        </div>
      </div>
    </div>
  );
};

export default StreamPage;
