
import React, { useEffect, useRef, useState } from 'react';
import { StreamType } from '../types';
import { useAuth } from '../App';
import { dbOps } from '../firebase';
import { XP_GAIN_INTERVAL, XP_PER_INTERVAL, getRankByXp } from '../constants';

interface VideoPlayerProps {
  url: string;
  type: StreamType;
  matchId: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ url, type, matchId }) => {
  const { user, refreshUser } = useAuth();
  const [isPlaying, setIsPlaying] = useState(false);
  const [lastXpGain, setLastXpGain] = useState(Date.now());

  useEffect(() => {
    // XP Gain Interval Logic
    if (!user || !isPlaying) return;

    const interval = setInterval(async () => {
      const now = Date.now();
      if (now - lastXpGain >= XP_GAIN_INTERVAL) {
        try {
          // Increment XP in real database
          const currentUser = await dbOps.getUser(user.uid);
          if (currentUser) {
            const newXp = currentUser.xp + XP_PER_INTERVAL;
            const newRank = getRankByXp(newXp);
            await dbOps.upsertUser({ 
              ...currentUser, 
              xp: newXp, 
              rank: newRank,
              lastActive: now 
            });
            refreshUser();
            setLastXpGain(now);
            console.log(`Earned ${XP_PER_INTERVAL} XP!`);
          }
        } catch (err) {
          console.error("XP Gain Error:", err);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [user, isPlaying, lastXpGain, refreshUser]);

  if (type === 'embed') {
    return (
      <div className="relative pt-[56.25%] bg-black rounded-xl overflow-hidden shadow-2xl">
        <iframe
          src={url}
          className="absolute inset-0 w-full h-full"
          allowFullScreen
          onLoad={() => setIsPlaying(true)}
          title="Stream"
        />
        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900/50">
             <div className="animate-pulse text-blue-400 font-bold">Connecting...</div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative pt-[56.25%] bg-black rounded-xl overflow-hidden shadow-2xl">
      <video
        controls
        autoPlay
        playsInline
        className="absolute inset-0 w-full h-full object-contain"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      >
        <source src={url} type="application/x-mpegURL" />
        Your browser does not support HLS playback natively. Use an embed or a supported browser.
      </video>
      <div className="absolute top-4 left-4 flex gap-2">
        <div className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 animate-pulse">
          <span className="w-1.5 h-1.5 bg-white rounded-full"></span> LIVE
        </div>
        {user && isPlaying && (
          <div className="bg-blue-600/80 backdrop-blur text-white text-[10px] font-bold px-2 py-0.5 rounded">
            +XP ACTIVE
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoPlayer;
