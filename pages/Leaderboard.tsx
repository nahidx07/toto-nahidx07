
import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { User } from '../types';
import { getRankStyles, RANK_THRESHOLDS } from '../constants';

const Leaderboard: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    // Fetch users, sort by XP descending, and take the top 30
    const sortedUsers = (db.getUsers() as User[])
      .sort((a: any, b: any) => b.xp - a.xp)
      .slice(0, 30);
    setUsers(sortedUsers);
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-10 py-6 animate-in fade-in duration-700">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-extrabold text-white tracking-tight">Global Leaderboard</h1>
        <p className="text-slate-400 max-w-lg mx-auto">Top 30 champions of the arena. Rise through the ranks by watching live streams. Each minute counts towards your legacy.</p>
      </div>

      {/* Top 3 Podium */}
      <div className="grid grid-cols-3 gap-4 items-end pt-10 px-4">
        {users.length >= 2 && (
          <div className="flex flex-col items-center gap-3">
             <div className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 border-slate-400 p-1`}>
              <img src={users[1].photoUrl || `https://picsum.photos/seed/${users[1].uid}/100`} className="rounded-full w-full h-full object-cover" />
              <div className="absolute -top-2 -right-2 bg-slate-400 text-slate-900 w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs">2</div>
            </div>
            <div className="text-center">
              <p className="font-bold text-sm text-slate-200 truncate max-w-[80px]">{users[1].username}</p>
              <p className="text-[10px] text-blue-400 font-bold">{users[1].xp} XP</p>
            </div>
            <div className="h-20 w-full bg-slate-800/50 rounded-t-xl border-x border-t border-slate-700/50" />
          </div>
        )}

        {users.length >= 1 && (
          <div className="flex flex-col items-center gap-3 scale-110">
            <div className="text-yellow-400 animate-bounce mb-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1.323l3.945 2.035a1 1 0 01.442 1.34L14.2 10l1.187 2.302a1 1 0 01-.442 1.34L11 15.677V17a1 1 0 11-2 0v-1.323l-3.945-2.035a1 1 0 01-.442-1.34L7.8 10 6.613 7.698a1 1 0 01.442-1.34L10 4.323V3a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className={`relative w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-yellow-500 p-1`}>
              <img src={users[0].photoUrl || `https://picsum.photos/seed/${users[0].uid}/100`} className="rounded-full w-full h-full object-cover" />
              <div className="absolute -top-2 -right-2 bg-yellow-500 text-slate-900 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">1</div>
            </div>
            <div className="text-center">
              <p className="font-bold text-base text-white truncate max-w-[100px]">{users[0].username}</p>
              <p className="text-[10px] text-blue-400 font-bold">{users[0].xp} XP</p>
            </div>
            <div className="h-32 w-full bg-yellow-500/10 rounded-t-xl border-x border-t border-yellow-500/30" />
          </div>
        )}

        {users.length >= 3 && (
          <div className="flex flex-col items-center gap-3">
             <div className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 border-orange-800 p-1`}>
              <img src={users[2].photoUrl || `https://picsum.photos/seed/${users[2].uid}/100`} className="rounded-full w-full h-full object-cover" />
              <div className="absolute -top-2 -right-2 bg-orange-800 text-white w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs">3</div>
            </div>
            <div className="text-center">
              <p className="font-bold text-sm text-slate-200 truncate max-w-[80px]">{users[2].username}</p>
              <p className="text-[10px] text-blue-400 font-bold">{users[2].xp} XP</p>
            </div>
            <div className="h-16 w-full bg-slate-800/50 rounded-t-xl border-x border-t border-slate-700/50" />
          </div>
        )}
      </div>

      {/* Main List (Top 30) */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-800/50 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
              <th className="px-6 py-4">Rank</th>
              <th className="px-6 py-4">User</th>
              <th className="px-6 py-4 text-center">Level</th>
              <th className="px-6 py-4 text-right">Experience</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {users.map((user, idx) => (
              <tr key={user.uid} className="hover:bg-slate-800/30 transition-colors group">
                <td className="px-6 py-4 font-mono text-slate-500">{idx + 1}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <img 
                      src={user.photoUrl || `https://picsum.photos/seed/${user.uid}/40`} 
                      className="w-8 h-8 rounded-full border border-slate-700"
                    />
                    <span className="font-semibold text-slate-200">{user.username}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-tighter ${getRankStyles(user.rank).bg} ${getRankStyles(user.rank).color}`}>
                    {user.rank}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="font-bold text-blue-400">{user.xp} XP</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Threshold Guide */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-10">
        <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
          <h3 className="font-bold text-white mb-6">Ranking System Guide</h3>
          <div className="space-y-4">
            {RANK_THRESHOLDS.map(t => (
              <div key={t.rank} className="flex items-center justify-between p-3 rounded-xl bg-slate-800/30 border border-slate-700/30">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${t.bg} border ${t.color.replace('text', 'border')}`} />
                  <span className={`text-sm font-bold ${t.color}`}>{t.rank}</span>
                </div>
                <span className="text-xs font-mono text-slate-400">{t.minXp}+ XP</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="bg-blue-600/10 p-6 rounded-2xl border border-blue-500/20">
            <h4 className="font-bold text-blue-400 mb-2">How to level up?</h4>
            <p className="text-sm text-slate-400 leading-relaxed">
              Earn XP automatically by watching any live match. For every 30 seconds of active viewing, you receive <span className="text-blue-400 font-bold">5 XP</span>.
              <br/><br/>
              Only the **Top 30** users are featured on our global leaderboard. Keep watching to climb!
            </p>
          </div>
          <div className="bg-purple-600/10 p-6 rounded-2xl border border-purple-500/20">
            <h4 className="font-bold text-purple-400 mb-2">Grandmaster Status</h4>
            <p className="text-sm text-slate-400">
              Only the most dedicated fans reach Grandmaster status. These users receive special badges in chat and priority support.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
