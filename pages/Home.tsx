
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Match, PlatformSettings } from '../types';
import { db } from '../firebase';

const Home: React.FC = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [settings, setSettings] = useState<PlatformSettings>(db.getSettings());
  const [filter, setFilter] = useState<'All' | 'Cricket' | 'Football' | 'Other'>('All');

  useEffect(() => {
    setMatches(db.getMatches() as Match[]);
    setSettings(db.getSettings());
    const int = setInterval(() => {
      setMatches(db.getMatches() as Match[]);
      setSettings(db.getSettings());
    }, 5000);
    return () => clearInterval(int);
  }, []);

  const filteredMatches = filter === 'All' 
    ? matches 
    : matches.filter(m => m.sport === filter || (filter === 'Other' && !['Cricket', 'Football'].includes(m.sport)));

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="space-y-4">
          <a 
            href={settings.telegramLink} 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-[#0088cc] hover:bg-[#0077b5] text-white px-6 py-3 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-blue-900/20 transition-all transform hover:scale-105 active:scale-95"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.11.02-1.93 1.23-5.46 3.62-.51.35-.98.53-1.39.52-.46-.01-1.33-.26-1.98-.48-.8-.27-1.43-.42-1.37-.89.03-.25.38-.51 1.03-.78 4.04-1.76 6.74-2.92 8.09-3.48 3.85-1.6 4.64-1.88 5.17-1.89.11 0 .37.03.54.17.14.12.18.28.2.45-.02.07-.02.13-.03.18z" />
            </svg>
            Join Telegram Channel
          </a>
          <p className="text-slate-500 font-medium">Select a live match below to start watching.</p>
        </div>
        
        <div className="flex gap-2 p-1.5 bg-slate-900/50 rounded-2xl border border-slate-800 overflow-x-auto scrollbar-hide">
          {['All', 'Cricket', 'Football', 'Other'].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat as any)}
              className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                filter === cat 
                ? 'bg-blue-600 text-white shadow-xl shadow-blue-900/50' 
                : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {filteredMatches.map((match) => (
          <Link 
            to={`/stream/${match.id}`} 
            key={match.id}
            className="group relative bg-slate-900 border border-slate-800 rounded-[32px] overflow-hidden hover:border-blue-500/50 transition-all hover:shadow-[0_0_40px_rgba(59,130,246,0.15)] transform hover:-translate-y-2 duration-500"
          >
            <div className="relative aspect-video bg-slate-800 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent z-10 opacity-80" />
              <img 
                src={`https://api.dicebear.com/7.x/identicon/svg?seed=${match.title}`} 
                alt={match.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-40"
              />
              
              <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
                <span className="bg-red-600 text-white text-[9px] font-black uppercase px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-xl shadow-red-900/20 w-fit">
                   <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span> Live
                </span>
                <div className="flex items-center gap-2 bg-green-600/90 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10 shadow-2xl w-fit">
                   <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></span>
                   <span className="text-[9px] font-black text-white tracking-widest uppercase">{match.watching.toLocaleString()} watching</span>
                </div>
              </div>

              <div className="absolute bottom-4 left-4 z-20">
                <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 shadow-2xl">
                   <svg className="h-3 w-3 text-blue-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>
                   <span className="text-[10px] font-black text-white tracking-widest uppercase">{match.viewers.toLocaleString()} views</span>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <span className="text-[10px] font-black uppercase text-blue-500 tracking-widest mb-1 block">{match.sport}</span>
              <h3 className="font-bold text-slate-100 group-hover:text-blue-400 transition-colors text-lg leading-tight line-clamp-2 min-h-[3.5rem]">
                {match.title}
              </h3>
              <div className="mt-6 flex items-center justify-between border-t border-slate-800/50 pt-4">
                <div className="flex -space-x-2">
                  {[1,2,3].map(i => <div key={i} className="w-6 h-6 rounded-full border-2 border-slate-900 bg-slate-800" />)}
                  <div className="w-6 h-6 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center text-[8px] font-bold text-slate-400">+9k</div>
                </div>
                <div className="bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full text-[9px] font-black border border-blue-500/20 uppercase">
                  XP Boost
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {filteredMatches.length === 0 && (
        <div className="text-center py-32 bg-slate-900/40 rounded-[40px] border-2 border-dashed border-slate-800/50">
          <p className="text-slate-600 font-black uppercase tracking-widest mb-4">No Active Broadcasts</p>
          <button onClick={() => setFilter('All')} className="text-blue-500 font-black uppercase text-xs hover:tracking-[0.2em] transition-all">Clear Filters</button>
        </div>
      )}
    </div>
  );
};

export default Home;
