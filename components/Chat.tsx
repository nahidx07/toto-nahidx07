
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../App';
import { dbOps } from '../firebase';
import { ChatMessage, Rank } from '../types';
import { getRankStyles } from '../constants';
import { GoogleGenAI } from "@google/genai";

interface ChatProps {
  matchId: string;
  matchTitle?: string;
}

const Chat: React.FC<ChatProps> = ({ matchId, matchTitle }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<'live' | 'ai'>('live');
  const [aiLoading, setAiLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribe = dbOps.subscribeChat(matchId, (msgs) => {
      setMessages(msgs);
    });
    return () => unsubscribe();
  }, [matchId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, aiLoading]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !input.trim()) return;

    const messageContent = input.trim();
    setInput('');

    if (mode === 'live') {
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
      }
    } else {
      setAiLoading(true);
      const userMsg: ChatMessage = {
        id: 'local-' + Date.now(),
        userId: user.uid,
        username: user.username,
        message: messageContent,
        timestamp: Date.now(),
        rank: user.rank,
        photoUrl: user.photoUrl
      };
      setMessages(prev => [...prev, userMsg]);

      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: messageContent,
          config: {
            systemInstruction: `You are 'Toto AI Scout', a world-class sports analyst for the Toto Stream platform. The user is currently watching '${matchTitle || 'a live match'}'. Answer sports questions with expert insight, keeping it concise and exciting. If the user asks non-sports questions, politely redirect them to the match. Use emojis for flair.`
          }
        });

        const aiMsg: ChatMessage = {
          id: 'ai-' + Date.now(),
          userId: 'toto-ai',
          username: 'Toto AI Scout',
          message: response.text || "Sorry, I'm currently processing a lot of data. Try again in a moment!",
          timestamp: Date.now(),
          rank: Rank.GRANDMASTER,
          photoUrl: 'https://cdn-icons-png.flaticon.com/512/4712/4712035.png',
          isAI: true
        };
        setMessages(prev => [...prev, aiMsg]);
      } catch (err) {
        console.error("Gemini Error:", err);
        const errorMsg: ChatMessage = {
          id: 'error-' + Date.now(),
          userId: 'toto-ai',
          username: 'Toto AI Scout',
          message: "⚠️ My scouting reports are temporarily unavailable. Please make sure the API_KEY is set in your environment.",
          timestamp: Date.now(),
          rank: Rank.GRANDMASTER,
          photoUrl: 'https://cdn-icons-png.flaticon.com/512/4712/4712035.png',
          isAI: true
        };
        setMessages(prev => [...prev, errorMsg]);
      } finally {
        setAiLoading(false);
      }
    }
  };

  return (
    <div className="bg-slate-900 flex flex-col h-full rounded-[32px] border border-slate-800 overflow-hidden shadow-2xl">
      <div className="p-4 border-b border-slate-800 bg-slate-800/20 backdrop-blur-xl flex justify-between items-center">
        <div className="flex gap-1 bg-slate-950/50 p-1 rounded-2xl border border-slate-800">
           <button 
             onClick={() => setMode('live')}
             className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase transition-all ${mode === 'live' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' : 'text-slate-500 hover:text-slate-300'}`}
           >
             Live Chat
           </button>
           <button 
             onClick={() => setMode('ai')}
             className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase transition-all flex items-center gap-1.5 ${mode === 'ai' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/40' : 'text-slate-500 hover:text-slate-300'}`}
           >
             <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
             AI Scout
           </button>
        </div>
        <span className="text-[8px] text-slate-600 font-black tracking-[0.2em] uppercase">TOTO-RTX</span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-3 animate-in fade-in slide-in-from-bottom-1 duration-300 ${msg.isAI ? 'bg-indigo-600/5 p-3 rounded-2xl border border-indigo-500/10' : ''}`}>
            <img src={msg.photoUrl} className={`w-8 h-8 rounded-full border object-cover flex-shrink-0 ${msg.isAI ? 'border-indigo-500 shadow-lg shadow-indigo-900/20' : 'border-slate-700'}`} alt="" />
            <div className="space-y-1 min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase ${getRankStyles(msg.rank).bg} ${getRankStyles(msg.rank).color}`}>
                  {msg.rank}
                </span>
                <span className={`text-xs font-bold truncate ${msg.isAI ? 'text-indigo-400' : 'text-slate-300'}`}>{msg.username}</span>
              </div>
              <p className={`text-sm leading-relaxed ${msg.isAI ? 'text-slate-200 italic' : 'text-slate-100'}`}>
                {msg.message}
              </p>
            </div>
          </div>
        ))}
        {aiLoading && (
          <div className="flex gap-3 animate-pulse">
             <div className="w-8 h-8 rounded-full bg-indigo-900/50"></div>
             <div className="space-y-2 flex-1">
                <div className="h-2 w-20 bg-indigo-900/50 rounded"></div>
                <div className="h-10 w-full bg-indigo-900/20 rounded-xl"></div>
             </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <div className="p-4 border-t border-slate-800 bg-slate-900/50">
        {user ? (
          <form onSubmit={handleSend} className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={mode === 'live' ? "Join the chat..." : "Ask AI Scout about the game..."}
              className={`flex-1 bg-slate-950 border text-white rounded-2xl px-5 py-3 text-sm focus:outline-none transition-all placeholder:text-slate-600 ${mode === 'live' ? 'border-slate-800 focus:border-blue-500' : 'border-indigo-900/50 focus:border-indigo-500'}`}
            />
            <button 
              type="submit" 
              className={`text-white p-3 rounded-2xl transition-all shadow-lg active:scale-95 ${mode === 'live' ? 'bg-blue-600 shadow-blue-900/40 hover:bg-blue-500' : 'bg-indigo-600 shadow-indigo-900/40 hover:bg-indigo-500'}`}
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
            </button>
          </form>
        ) : (
          <div className="text-center py-2"><p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Login to join the arena</p></div>
        )}
      </div>
    </div>
  );
};

export default Chat;
