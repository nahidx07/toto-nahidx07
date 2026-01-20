
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../App';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const { login, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate('/');
  }, [user, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      login(username.trim());
      navigate('/');
    }
  };

  const handleGoogleLogin = () => {
    // Mocking Google Login - in a real app, this would use Firebase or Google Auth SDK
    const mockEmail = prompt("Enter your Gmail address to simulate login:");
    if (mockEmail && mockEmail.includes('@')) {
      const name = mockEmail.split('@')[0];
      login(name, false, undefined, `https://api.dicebear.com/7.x/initials/svg?seed=${name}`);
      navigate('/');
    } else if (mockEmail) {
      alert("Please enter a valid Gmail address.");
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-[40px] p-10 shadow-2xl relative overflow-hidden">
        {/* Decorative Blur */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-600/20 blur-[80px] rounded-full"></div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-indigo-600/20 blur-[80px] rounded-full"></div>

        <div className="relative z-10">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center p-5 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-3xl mb-6 shadow-2xl shadow-blue-900/40 transform -rotate-3 hover:rotate-0 transition-transform duration-500">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
            </div>
            <h1 className="text-4xl font-black text-white mb-2 tracking-tight">Arena Awaits</h1>
            <p className="text-slate-400 font-medium">Join the elite streaming community today.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2 ml-1">Manual Access</label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Pick a unique username"
                className="w-full bg-slate-800/50 border-2 border-slate-800 text-white rounded-2xl px-6 py-4 focus:outline-none focus:border-blue-500 transition-all placeholder:text-slate-600 font-medium"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-2xl shadow-xl shadow-blue-900/40 transition-all transform active:scale-95 uppercase text-xs tracking-widest"
            >
              Enter Platform
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-slate-800 space-y-4">
             <div className="flex items-center gap-4">
                <div className="h-px bg-slate-800 flex-1"></div>
                <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Connect With</span>
                <div className="h-px bg-slate-800 flex-1"></div>
             </div>

             <div className="grid grid-cols-1 gap-3">
               <button 
                  onClick={handleGoogleLogin}
                  className="flex items-center justify-center gap-3 bg-white text-slate-900 px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all hover:bg-slate-100 active:scale-95 shadow-lg"
               >
                  <svg className="w-5 h-5" viewBox="0 0 48 48">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24s.92 7.54 2.56 10.78l7.97-6.19z"/>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                    <path fill="none" d="M0 0h48v48H0z"/>
                  </svg>
                  Login with Gmail
               </button>

               <button className="flex items-center justify-center gap-3 bg-[#0088cc] hover:bg-[#0077b5] text-white px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 shadow-lg">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                     <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.11.02-1.93 1.23-5.46 3.62-.51.35-.98.53-1.39.52-.46-.01-1.33-.26-1.98-.48-.8-.27-1.43-.42-1.37-.89.03-.25.38-.51 1.03-.78 4.04-1.76 6.74-2.92 8.09-3.48 3.85-1.6 4.64-1.88 5.17-1.89.11 0 .37.03.54.17.14.12.18.28.2.45-.02.07-.02.13-.03.18z" />
                  </svg>
                  Connect Telegram
               </button>
             </div>
          </div>

          <p className="mt-8 text-center text-slate-600 text-[9px] uppercase font-black tracking-widest">
            By entering, you agree to the Arena Terms of Service.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
