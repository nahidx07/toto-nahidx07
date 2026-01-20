
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../App';
import { db } from '../firebase';
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
    setMessages(db.getChat(matchId));
    const interval = setInterval(() => setMessages(db.getChat(matchId)), 1500);
    return () => clearInterval(interval);
  }, [matchId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !input.trim()) return;

    const newMsg: ChatMessage = {
      id: Math.random().toString(36).substr(2, 9),
      userId: user.uid,
      username: user.username,
      message: input,
      timestamp: Date.now(),
      rank: user.rank,
      photoUrl: user.photoUrl
    };

    db.addChatMessage(matchId, newMsg);
    setMessages([...messages, newMsg]);
    setInput('');
  };

  return (
    <div className="bg-slate-900 flex flex-col h-full rounded-2xl border border-slate-800 overflow-hidden">
      <div className="p-4 border-b border-slate-800 bg-slate-800/20 backdrop-blur-md flex justify-between items-center">
        <h3 className="font-bold text-slate-100 flex items-center gap-2">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          Live Chat
        </h3>
        <span className="text-[9px] text-slate-500 font-mono tracking-tighter">PROTO-TOTO-V2</span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
        {messages.map((msg) => (
          <div key={msg.id} className="flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <img src={msg.photoUrl} className="w-8 h-8 rounded-full border border-slate-700 object-cover flex-shrink-0" alt="" />
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase ${getRankStyles(msg.rank).bg} ${getRankStyles(msg.rank).color}`}>
                  {msg.rank}
                </span>
                <span className="text-sm font-bold text-slate-300 truncate">{msg.username}</span>
              </div>
              <p className="text-slate-100 text-sm bg-slate-800/40 p-2.5 rounded-2xl rounded-tl-none border border-slate-800/50 break-words">
                {msg.message}
              </p>
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      <div className="p-4 border-t border-slate-800 bg-slate-900">
        {user ? (
          <form onSubmit={handleSend} className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Join the conversation..."
              className="flex-1 bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-slate-500"
            />
            <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white p-2.5 rounded-xl transition-all shadow-lg shadow-blue-900/20">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
            </button>
          </form>
        ) : (
          <div className="text-center py-2"><p className="text-xs text-slate-500">Please login to chat</p></div>
        )}
      </div>
    </div>
  );
};

export default Chat;
