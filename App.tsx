
import React, { useState, useEffect, createContext, useContext } from 'react';
import { HashRouter, Routes, Route, Link } from 'react-router-dom';
import { User, Rank } from './types';
import { auth, dbOps, isFirebaseConfigured } from './firebase';
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

const ConfigWarning: React.FC = () => (
  <div className="fixed inset-0 z-[200] bg-slate-950 flex items-center justify-center p-6 text-center">
    <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-[40px] p-10 shadow-2xl space-y-6">
      <div className="bg-amber-500/10 text-amber-500 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto border border-amber-500/20">
        <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <h2 className="text-2xl font-black text-white italic">Firebase Setup Needed</h2>
      <p className="text-slate-400 text-sm leading-relaxed">
        To activate <span className="text-blue-400 font-bold">Toto Stream</span>, you must add your Firebase credentials to <code className="bg-slate-800 px-1.5 py-0.5 rounded text-blue-300">firebase.ts</code>.
      </p>
      <div className="bg-slate-950 p-4 rounded-2xl text-left border border-slate-800">
        <p className="text-[10px] font-black uppercase text-slate-500 mb-2">Instructions:</p>
        <ol className="text-xs text-slate-300 space-y-2 list-decimal ml-4">
          <li>Create project at <a href="https://console.firebase.google.com" target="_blank" className="text-blue-500 underline">Firebase Console</a></li>
          <li>Enable <b>Firestore</b> and <b>Authentication</b> (Google)</li>
          <li>Copy Config to <b>firebase.ts</b></li>
          <li>Set Security Rules to <b>allow read, write: if true;</b></li>
        </ol>
      </div>
      <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Refresh the page after updating the code</p>
    </div>
  </div>
);

const SplashScreen: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [logo, setLogo] = useState('https://cdn-icons-png.flaticon.com/512/732/732232.png');

  useEffect(() => {
    dbOps.getSettings().then(s => setLogo(s.logoUrl));
    
    // Simulate initial loading/setup time
    const timer = setTimeout(() => {
      onComplete();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col items-center justify-center p-8 overflow-hidden">
      {/* Dynamic Background Glow - Pulse Effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-blue-600/20 blur-[100px] rounded-full animate-pulse opacity-50"></div>
      
      {/* Centered Logo with Breathing Animation */}
      <div className="relative animate-in zoom-in fade-in duration-1000">
        <div className="relative z-10 animate-pulse transition-transform duration-1000 ease-in-out scale-110 hover:scale-125">
          <img 
            src={logo} 
            alt="Brand Logo" 
            className="w-64 h-auto object-contain drop-shadow-[0_0_60px_rgba(255,255,255,0.2)]" 
          />
        </div>
      </div>
      
      {/* Subtle indicator that something is happening without taking away from the logo */}
      <div className="absolute bottom-12 flex gap-1">
        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"></div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    let authUnsubscribe: (() => void) | undefined;
    let userUnsubscribe: (() => void) | undefined;

    const setupUserSync = (uid: string) => {
      if (userUnsubscribe) userUnsubscribe();
      userUnsubscribe = dbOps.subscribeUser(uid, async (dbUser) => {
        if (dbUser) {
          setUser(dbUser);
          setLoading(false);
        } else {
          const firebaseUser = auth?.currentUser;
          if (firebaseUser) {
            const newUser: User = {
              uid: firebaseUser.uid,
              username: firebaseUser.displayName || 'Fan_' + Math.floor(Math.random() * 1000),
              photoUrl: firebaseUser.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${firebaseUser.uid}`,
              xp: 0,
              rank: Rank.BRONZE,
              isAdmin: false,
              lastActive: Date.now()
            };
            await dbOps.upsertUser(newUser);
          }
        }
      });
    };

    const initialize = async () => {
      const tg = (window as any).Telegram?.WebApp;
      if (tg?.initDataUnsafe?.user) {
        const tgUser = tg.initDataUnsafe.user;
        const uid = `tg_${tgUser.id}`;
        
        let dbUser = await dbOps.getUser(uid);
        if (!dbUser) {
          dbUser = {
            uid: uid,
            username: tgUser.username || `${tgUser.first_name}${tgUser.last_name ? ' ' + tgUser.last_name : ''}`,
            photoUrl: tgUser.photo_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${tgUser.id}`,
            xp: 0,
            rank: Rank.BRONZE,
            isAdmin: false,
            telegramId: tgUser.id,
            lastActive: Date.now()
          };
          await dbOps.upsertUser(dbUser);
        }
        
        setupUserSync(uid);
        tg.expand();
        return;
      }

      if (isFirebaseConfigured && auth) {
        authUnsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
          if (firebaseUser) {
            setupUserSync(firebaseUser.uid);
          } else {
            setUser(null);
            setLoading(false);
          }
        });
      } else {
        setLoading(false);
      }
    };

    initialize();

    return () => {
      if (authUnsubscribe) authUnsubscribe();
      if (userUnsubscribe) userUnsubscribe();
    };
  }, []);

  const handleLogout = () => {
    const tg = (window as any).Telegram?.WebApp;
    if (tg?.initDataUnsafe?.user) {
      setUser(null);
    } else if (auth) {
      signOut(auth);
    }
  };

  const refreshUser = async () => {
    if (user) {
      const updated = await dbOps.getUser(user.uid);
      if (updated) setUser(updated);
    }
  };

  if (!isFirebaseConfigured) return <ConfigWarning />;
  if (showSplash) return <SplashScreen onComplete={() => setShowSplash(false)} />;
  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-blue-500"></div>
    </div>
  );

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
          
          <div className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900/90 backdrop-blur-lg border-t border-slate-800 flex justify-around py-3 z-50">
            <Link to="/" className="flex flex-col items-center text-[10px] text-slate-400 font-bold uppercase tracking-widest">
              <svg className="h-5 w-5 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
              Live
            </Link>
            <Link to="/leaderboard" className="flex flex-col items-center text-[10px] text-slate-400 font-bold uppercase tracking-widest">
              <svg className="h-5 w-5 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
              Ranks
            </Link>
            {user?.isAdmin && (
              <Link to="/admin" className="flex flex-col items-center text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                <svg className="h-5 w-5 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m10 4a2 2 0 100-4m0 4a2 2 0 110-4" /></svg>
                Admin
              </Link>
            )}
            <Link to={user ? "/profile" : "/login"} className="flex flex-col items-center text-[10px] text-slate-400 font-bold uppercase tracking-widest">
              <svg className="h-5 w-5 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              Profile
            </Link>
          </div>
        </div>
      </HashRouter>
    </AuthContext.Provider>
  );
};

export default App;
