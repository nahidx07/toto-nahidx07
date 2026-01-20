
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../App';
import { getRankStyles } from '../constants';
import { dbOps } from '../firebase';
import { PlatformSettings } from '../types';

const Navbar: React.FC = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<PlatformSettings>({
    logoUrl: 'https://cdn-icons-png.flaticon.com/512/732/732232.png',
    telegramLink: '#'
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const s = await dbOps.getSettings();
        setSettings(s);
      } catch (err) {
        console.error("Settings load failed:", err);
      }
    };
    fetchSettings();
    const int = setInterval(fetchSettings, 10000);
    return () => clearInterval(int);
  }, []);

  return (
    <nav className="bg-slate-900/80 backdrop-blur-md sticky top-0 z-40 border-b border-slate-800">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center group py-1">
          {/* Bigger Logo, No Text */}
          <img 
            src={settings.logoUrl} 
            alt="Logo" 
            className="h-10 w-auto object-contain transition-transform group-hover:scale-105 duration-300" 
          />
        </Link>

        <div className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors">Matches</Link>
          <Link to="/leaderboard" className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors">Leaderboard</Link>
          {user?.isAdmin && (
            <Link to="/admin" className="text-[10px] font-black uppercase tracking-widest text-blue-400 hover:text-blue-300 transition-colors">Admin Panel</Link>
          )}
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <Link to="/profile" className="flex items-center gap-3 group">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-sm font-semibold text-slate-200 group-hover:text-blue-400 transition-colors">{user.username}</span>
                <span className={`text-[10px] uppercase tracking-wider font-bold px-1.5 rounded ${getRankStyles(user.rank).bg} ${getRankStyles(user.rank).color}`}>
                  {user.rank}
                </span>
              </div>
              <img src={user.photoUrl} className="w-9 h-9 rounded-full border border-slate-700 object-cover" alt="User" />
            </Link>
          ) : (
            <Link to="/login" className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg text-sm font-semibold shadow-lg shadow-blue-900/20 transition-all">
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
