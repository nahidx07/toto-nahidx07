
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../App';
import { dbOps } from '../firebase';
import { ChatMessage } from '../types';
import { getRankStyles } from '../constants';

interface ChatProps {
  matchId: string;
}

const Chat: React.FC<ChatProps> = ({ matchId }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const chatTopRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribe = dbOps.subscribeChat(matchId, (msgs) => {
      // Sort messages descending by timestamp to show newest at top
      const sorted = [...msgs].sort((a, b) => b.timestamp - a.timestamp);
      setMessages(sorted);
    });
    return () => unsubscribe();
  }, [matchId]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !input.trim()) return;

    const messageContent = input.trim();
    setInput('');

    try {
      await dbOps.sendChatMessage(matchId, {
        userId: user.uid,
        username: user.username,
        message: messageContent,
        rank: user.rank,
        photoUrl: user.photoUrl
      });
      // Scroll to top when sending a new message
      chatTopRef.current?.scrollIntoView({ behavior: 'smooth' });
    } catch (err) {
      setInput(messageContent);
      console.error("Chat Error:", err);
    }
  };

  return (
    <div className="bg-slate-900/60 backdrop-blur-xl flex flex-col h-full rounded-[24px] border border-slate-800/60 overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="p-3 border-b border-slate-800/40 bg-slate-800/10 flex justify-between items-center">
        <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-400 flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></span>
          Live Chat
        </h3>
      </div>

      {/* Input Box - Now at the Top under Title */}
      <div className="p-3 bg-slate-950/40 border-b border-slate-800/40">
        {user ? (
          <form onSubmit={handleSend} className="flex gap-2 bg-slate-900 rounded-xl p-1 border border-slate-800 focus-within:border-blue-500/50 transition-all shadow-inner">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="What's on your mind?"
              className="flex-1 bg-transparent text-white rounded-lg px-3 py-2 text-xs focus:outline-none placeholder:text-slate-600"
            />
            <button 
              type="submit" 
              className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-blue-500 transition-all active:scale-90 flex items-center justify-center"
            >
              <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
              </svg>
            </button>
          </form>
        ) : (
          <div className="text-center py-2 bg-slate-900/30 rounded-xl border border-dashed border-slate-800">
            <p className="text-[8px] font-black uppercase text-slate-600 tracking-widest">Sign in to participate in chat</p>
          </div>
        )}
      </div>

      {/* Messages List - Newest on Top */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
        <div ref={chatTopRef} />
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center opacity-10 select-none">
            <p className="text-[10px] font-black uppercase tracking-widest">No messages yet</p>
          </div>
        )}
        {messages.map((msg) => (
          <div key={msg.id} className="flex gap-2.5 animate-in fade-in slide-in-from-top-1 duration-300">
            <img src={msg.photoUrl} className="w-6 h-6 rounded-full border border-slate-700 object-cover flex-shrink-0" alt="" />
            <div className="space-y-0.5 min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className={`text-[6px] font-black px-1 py-0.5 rounded uppercase ${getRankStyles(msg.rank).bg} ${getRankStyles(msg.rank).color}`}>
                  {msg.rank}
                </span>
                <span className="text-[10px] font-bold truncate text-slate-400">{msg.username}</span>
              </div>
              <p className="text-sm leading-snug text-slate-200">
                {msg.message}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Chat;
