
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Match, PlatformSettings } from '../types';
import { dbOps } from '../firebase';

const Home: React.FC = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [settings, setSettings] = useState<PlatformSettings>({
    logoUrl: 'https://cdn-icons-png.flaticon.com/512/732/732232.png',
    telegramLink: '#'
  });
  const [filter, setFilter] = useState<'All' | 'Cricket' | 'Football' | 'Other'>('All');

  useEffect(() => {
    const unsubscribe = dbOps.subscribeMatches((data) => {
      setMatches(data);
    });
    dbOps.getSettings().then(setSettings);
    return () => unsubscribe();
  }, []);

  const filteredMatches = filter === 'All' 
    ? matches 
    : matches.filter(m => m.sport === filter || (filter === 'Other' && !['Cricket', 'Football'].includes(m.sport)));

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <a 
            href={settings.telegramLink} 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-[#0088cc] hover:bg-[#0077b5] text-white px-5 py-2.5 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-blue-900/20 transition-all transform hover:scale-105 active:scale-95"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.11.02-1.93 1.23-5.46 3.62-.51.35-.98.53-1.39.52-.46-.01-1.33-.26-1.98-.48-.8-.27-1.43-.42-1.37-.89.03-.25.38-.51 1.03-.78 4.04-1.76 6.74-2.92 8.09-3.48 3.85-1.6 4.64-1.88 5.17-1.89.11 0 .37.03.54.17.14.12.18.28.2.45-.02.07-.02.13-.03.18z" />
            </svg>
            Join Telegram
          </a>
        </div>
        
        <div className="flex gap-2 p-1.5 bg-slate-900/50 rounded-2xl border border-slate-800 overflow-x-auto scrollbar-hide">
          {['All', 'Cricket', 'Football', 'Other'].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat as any)}
              className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredMatches.map((match) => (
          <Link 
            to={`/stream/${match.id}`} 
            key={match.id}
            className="group relative bg-slate-900 border border-slate-800 rounded-[28px] overflow-hidden hover:border-blue-500/50 transition-all hover:shadow-[0_0_40px_rgba(59,130,246,0.15)] transform hover:-translate-y-1.5 duration-500"
          >
            <div className="relative aspect-video bg-slate-800 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent z-10 opacity-80" />
              <img 
                src={match.thumbnailUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${match.title}`} 
                alt={match.title}
                className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ${match.thumbnailUrl ? 'opacity-100' : 'opacity-40'}`}
              />
              
              <div className="absolute top-3 left-3 z-20 flex flex-col gap-2">
                <span className="bg-red-600 text-white text-[8px] font-black uppercase px-2 py-0.5 rounded-md flex items-center gap-1 shadow-xl shadow-red-900/20 w-fit">
                   <span className="w-1 h-1 bg-white rounded-full animate-pulse"></span> Live
                </span>
                <div className="flex items-center gap-2 bg-green-600/90 backdrop-blur-md px-2 py-0.5 rounded-md border border-white/10 shadow-2xl w-fit">
                   <span className="text-[8px] font-black text-white tracking-widest uppercase">{match.watching.toLocaleString()} watching</span>
                </div>
              </div>

              <div className="absolute bottom-3 left-3 z-20">
                <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg border border-white/10 shadow-2xl">
                   <span className="text-[8px] font-black text-white tracking-widest uppercase">{match.viewers.toLocaleString()} views</span>
                </div>
              </div>
            </div>
            
            <div className="p-5">
              <span className="text-[8px] font-black uppercase text-blue-500 tracking-widest mb-1 block">{match.sport}</span>
              <h3 className="font-bold text-slate-100 group-hover:text-blue-400 transition-colors text-base leading-tight line-clamp-2 min-h-[3rem]">
                {match.title}
              </h3>
              <div className="mt-4 flex items-center justify-between border-t border-slate-800/50 pt-3">
                <div className="flex -space-x-1.5">
                  {[1,2].map(i => <div key={i} className="w-5 h-5 rounded-full border border-slate-900 bg-slate-800" />)}
                </div>
                <div className="bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full text-[8px] font-black border border-blue-500/20 uppercase">
                  Level UP
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
