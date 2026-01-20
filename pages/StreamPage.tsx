
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Match } from '../types';
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

  useEffect(() => {
    if (id) {
      const fetchMatch = async () => {
        const found = await dbOps.getMatch(id);
        if (found) {
          setMatch(found);
        } else {
          navigate('/');
        }
        setLoading(false);
      };
      fetchMatch();
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

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in slide-in-from-bottom-6 duration-700">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <VideoPlayer url={match.streamUrl} type={match.streamType} matchId={match.id} />
          
          <div className="bg-slate-900/50 backdrop-blur-xl rounded-[40px] p-8 border border-slate-800 shadow-2xl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <span className="bg-red-600 text-white text-[9px] font-black uppercase px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-xl shadow-red-900/20">
                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span> Live Now
                  </span>
                  <span className="bg-slate-800 text-slate-400 text-[9px] font-black uppercase px-2.5 py-1 rounded-lg border border-slate-700">
                    {match.sport}
                  </span>
                </div>
                <h1 className="text-3xl font-black text-white italic tracking-tight">{match.title}</h1>
              </div>

              <div className="flex gap-4">
                <div className="bg-green-600/10 rounded-[24px] px-6 py-4 border border-green-500/20 flex flex-col items-center">
                  <span className="text-[9px] text-green-500 font-black uppercase tracking-widest mb-1 flex items-center gap-1">
                    Watching
                  </span>
                  <span className="text-2xl font-black text-white font-mono">{match.watching.toLocaleString()}</span>
                </div>
              </div>
            </div>
            {/* The information grid section has been removed from here for a cleaner look */}
          </div>
        </div>

        <div className="h-[750px] sticky top-24">
          <Chat matchId={match.id} matchTitle={match.title} />
        </div>
      </div>
    </div>
  );
};

export default StreamPage;
