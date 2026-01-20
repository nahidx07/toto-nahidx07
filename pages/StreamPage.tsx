
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Match, StreamType } from '../types';
import { dbOps } from '../firebase';
import { useAuth } from '../App';
import VideoPlayer from '../components/VideoPlayer';
import Chat from '../components/Chat';

const StreamPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [match, setMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeServer, setActiveServer] = useState<1 | 2>(1);

  useEffect(() => {
    if (id) {
      // Use real-time subscription for match data
      const unsubscribe = dbOps.subscribeMatch(id, (updatedMatch) => {
        if (updatedMatch) {
          setMatch(updatedMatch);
        } else {
          navigate('/');
        }
        setLoading(false);
      });
      return () => unsubscribe();
    }
  }, [id, navigate]);

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-blue-500"></div>
    </div>
  );
  
  if (!match) return null;

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
          <h2 className="text-3xl font-black text-white mb-4 italic uppercase">Arena Pass Required</h2>
          <p className="text-slate-400 max-w-md mx-auto mb-10 text-lg">
            Watching live broadcasts and ranking up requires a free <span className="text-blue-400 font-bold italic underline">Toto Account</span>.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/login" className="bg-blue-600 hover:bg-blue-500 text-white px-10 py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-blue-900/40 transition-all active:scale-95">
              Secure Entrance
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Determine current active stream details
  const currentUrl = activeServer === 1 ? match.streamUrl : (match.streamUrl2 || match.streamUrl);
  const currentType = activeServer === 1 ? match.streamType : (match.streamType2 || match.streamType);

  return (
    <div className="max-w-7xl mx-auto space-y-4 animate-in slide-in-from-bottom-6 duration-700">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <VideoPlayer url={currentUrl} type={currentType} matchId={match.id} key={`${match.id}-${activeServer}`} />
          
          <div className="bg-slate-900/40 backdrop-blur-md rounded-[20px] p-5 border border-slate-800/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h1 className="text-lg font-bold text-slate-100 flex-1">
              {match.title}
            </h1>
            
            {/* Server Switching Section */}
            <div className="flex items-center gap-2 p-1 bg-slate-950/60 border border-slate-800 rounded-xl">
               <button 
                  onClick={() => setActiveServer(1)}
                  className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${activeServer === 1 ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' : 'text-slate-500 hover:text-slate-300'}`}
               >
                 Server 01
               </button>
               {match.streamUrl2 && (
                 <button 
                    onClick={() => setActiveServer(2)}
                    className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${activeServer === 2 ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' : 'text-slate-500 hover:text-slate-300'}`}
                 >
                   Server 02
                 </button>
               )}
            </div>
          </div>
        </div>

        <div className="h-[500px] lg:h-[650px] sticky top-24">
          <Chat matchId={match.id} />
        </div>
      </div>
    </div>
  );
};

export default StreamPage;
