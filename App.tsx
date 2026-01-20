
import React, { useState, useEffect, createContext, useContext } from 'react';
import { HashRouter, Routes, Route, Link } from 'react-router-dom';
import { User, Rank } from './types';
import { auth, dbOps } from './firebase';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// Pages
import Home from './pages/Home';
import StreamPage from './pages/StreamPage';
import Leaderboard from './pages/Leaderboard';
import AdminPanel from './pages/AdminPanel';
import Login from './pages/Login';
import Profile from './pages/Profile';

// Components
import Navbar from './components/Navbar';

interface AuthContextType {
  user: User | null;
  logout: () => void;
  refreshUser: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);
export const useAuth = () => useContext(AuthContext)!;

const SplashScreen: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [logo, setLogo] = useState('https://cdn-icons-png.flaticon.com/512/732/732232.png');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    dbOps.getSettings().then(s => setLogo(s.logoUrl));
    
    const duration = 5000;
    const intervalTime = 50;
    const step = 100 / (duration / intervalTime);

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(onComplete, 300);
          return 100;
        }
        return prev + step;
      });
    }, intervalTime);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col items-center justify-center p-6 transition-opacity duration-1000">
      <div className="relative mb-12 animate-in zoom-in duration-1000">
        <div className="absolute inset-0 bg-blue-600/30 blur-[80px] rounded-full animate-pulse"></div>
        <img 
          src={logo} 
          alt="Logo" 
          className="w-48 h-48 relative z-10 object-contain drop-shadow-[0_0_30px_rgba(37,99,235,0.6)] animate-bounce" 
        />
      </div>
      <div className="max-w-xs w-full">
        <div className="w-full bg-slate-900 h-1 rounded-full overflow-hidden border border-slate-800/50">
          <div 
            className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        let dbUser = await dbOps.getUser(firebaseUser.uid);
        if (!dbUser) {
          // New User Creation
          dbUser = {
            uid: firebaseUser.uid,
            username: firebaseUser.displayName || 'Fan_' + Math.floor(Math.random() * 1000),
            photoUrl: firebaseUser.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${firebaseUser.uid}`,
            xp: 0,
            rank: Rank.BRONZE,
            isAdmin: false,
            lastActive: Date.now()
          };
          await dbOps.upsertUser(dbUser);
        }
        setUser(dbUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = () => signOut(auth);

  const refreshUser = async () => {
    if (user) {
      const updated = await dbOps.getUser(user.uid);
      if (updated) setUser(updated);
    }
  };

  if (showSplash) return <SplashScreen onComplete={() => setShowSplash(false)} />;
  if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-t-2 border-blue-500"></div></div>;

  return (
    <AuthContext.Provider value={{ user, logout: handleLogout, refreshUser }}>
      <HashRouter>
        <div className="min-h-screen flex flex-col pb-20 md:pb-0 bg-slate-950">
          <Navbar />
          <main className="flex-1 container mx-auto px-4 py-6">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/stream/:id" element={<StreamPage />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/admin" element={<AdminPanel />} />
              <Route path="/login" element={<Login />} />
              <Route path="/profile" element={<Profile />} />
            </Routes>
          </main>
          {/* Mobile Navigation */}
          <div className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900/90 backdrop-blur-lg border-t border-slate-800 flex justify-around py-3 z-50">
            <Link to="/" className="flex flex-col items-center text-[10px] text-slate-400 font-bold uppercase tracking-widest"><svg className="h-5 w-5 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>Live</Link>
            <Link to="/leaderboard" className="flex flex-col items-center text-[10px] text-slate-400 font-bold uppercase tracking-widest"><svg className="h-5 w-5 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>Ranks</Link>
            {user?.isAdmin && <Link to="/admin" className="flex flex-col items-center text-[10px] text-slate-400 font-bold uppercase tracking-widest"><svg className="h-5 w-5 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m10 4a2 2 0 100-4m0 4a2 2 0 110-4" /></svg>Admin</Link>}
            <Link to={user ? "/profile" : "/login"} className="flex flex-col items-center text-[10px] text-slate-400 font-bold uppercase tracking-widest"><svg className="h-5 w-5 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>Profile</Link>
          </div>
        </div>
      </HashRouter>
    </AuthContext.Provider>
  );
};

export default App;
