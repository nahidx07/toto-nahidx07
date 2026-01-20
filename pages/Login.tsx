
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { auth, googleProvider } from '../firebase';
import { signInWithPopup } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

const Login: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate('/');
  }, [user, navigate]);

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      navigate('/');
    } catch (error) {
      console.error("Login Error:", error);
      alert("Google Login Failed. Please try again.");
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-[40px] p-10 shadow-2xl relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-600/20 blur-[80px] rounded-full"></div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-indigo-600/20 blur-[80px] rounded-full"></div>

        <div className="relative z-10">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center p-5 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-3xl mb-6 shadow-2xl shadow-blue-900/40">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
            </div>
            <h1 className="text-4xl font-black text-white mb-2 tracking-tight">Arena Awaits</h1>
            <p className="text-slate-400 font-medium">Join the elite streaming community today.</p>
          </div>

          <div className="space-y-4">
             <button 
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center gap-4 bg-white text-slate-900 px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all hover:bg-slate-100 active:scale-95 shadow-xl"
             >
                <svg className="w-6 h-6" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24s.92 7.54 2.56 10.78l7.97-6.19z"/>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                </svg>
                Sign in with Google
             </button>

             <div className="flex items-center gap-4 py-4">
                <div className="h-px bg-slate-800 flex-1"></div>
                <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Global Access</span>
                <div className="h-px bg-slate-800 flex-1"></div>
             </div>

             <p className="text-center text-slate-500 text-sm font-medium px-4 leading-relaxed">
               Secure authentication is provided by Google. Your data remains encrypted and safe in the arena.
             </p>
          </div>

          <p className="mt-10 text-center text-slate-600 text-[9px] uppercase font-black tracking-widest">
            By entering, you agree to the Arena Terms of Service.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
