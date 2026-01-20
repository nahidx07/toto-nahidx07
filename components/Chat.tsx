
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
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribe = dbOps.subscribeChat(matchId, (msgs) => {
      setMessages(msgs);
    });
    return () => unsubscribe();
  }, [matchId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
    } catch (err) {
      setInput(messageContent);
      console.error("Chat Error:", err);
    }
  };

  return (
    <div className="bg-slate-900/50 backdrop-blur-md flex flex-col h-full rounded-[32px] border border-slate-800 overflow-hidden shadow-2xl">
      <div className="p-4 border-b border-slate-800/50 bg-slate-800/20 flex justify-between items-center">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></span>
          Live Interaction
        </h3>
        <span className="text-[8px] text-slate-600 font-black tracking-widest uppercase">Community Arena</span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center opacity-20 select-none">
            <svg className="w-12 h-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p className="text-[10px] font-black uppercase tracking-widest">No messages yet</p>
          </div>
        )}
        {messages.map((msg) => (
          <div key={msg.id} className="flex gap-3 animate-in fade-in slide-in-from-bottom-1 duration-300">
            <img src={msg.photoUrl} className="w-7 h-7 rounded-full border border-slate-700 object-cover flex-shrink-0" alt="" />
            <div className="space-y-0.5 min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className={`text-[7px] font-black px-1 py-0.5 rounded-md uppercase ${getRankStyles(msg.rank).bg} ${getRankStyles(msg.rank).color}`}>
                  {msg.rank}
                </span>
                <span className="text-[11px] font-bold truncate text-slate-400">{msg.username}</span>
              </div>
              <p className="text-sm leading-snug text-slate-100">
                {msg.message}
              </p>
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      <div className="p-4 border-t border-slate-800/50 bg-slate-950/30">
        {user ? (
          <form onSubmit={handleSend} className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 bg-slate-900 border border-slate-800 text-white rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-blue-500 transition-all placeholder:text-slate-600"
            />
            <button 
              type="submit" 
              className="bg-blue-600 text-white p-2.5 rounded-xl shadow-lg shadow-blue-900/20 hover:bg-blue-500 transition-all active:scale-90"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
              </svg>
            </button>
          </form>
        ) : (
          <div className="text-center py-2">
            <p className="text-[9px] font-black uppercase text-slate-600 tracking-widest">Log in to chat</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
