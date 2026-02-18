
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { MessageSquare, X, Send, Bot, User as UserIcon, Loader2, Sparkles, Music } from 'lucide-react';
import { User, ChatMessage } from '../types';

interface ChatBotProps {
  user: User;
}

export const ChatBot: React.FC<ChatBotProps> = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Initialize AI for persistent chat sessions
  const chatRef = useRef<any>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const initChat = () => {
    const ai = new GoogleGenAI({ apiKey: (process.env as any).API_KEY });
    chatRef.current = ai.chats.create({
      model: 'gemini-3-pro-preview',
      config: {
        systemInstruction: `You are MoodTunes AI Assistant. You help users find the perfect music, explain how moods relate to sound, and provide technical support for the MoodTunes app. 
        You are sophisticated, friendly, and deeply knowledgeable about music theory, history, and the emotional impact of audio. 
        Keep your responses concise but insightful. Use formatting like bold text for song titles or artists.
        Current user is ${user.username}.`,
      },
    });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    if (!chatRef.current) initChat();

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const responseStream = await chatRef.current.sendMessageStream({ message: input });
      
      const botMessageId = (Date.now() + 1).toString();
      let fullText = '';
      
      // Add initial empty bot message
      setMessages(prev => [...prev, {
        id: botMessageId,
        role: 'model',
        text: '',
        timestamp: Date.now()
      }]);

      for await (const chunk of responseStream) {
        const text = (chunk as GenerateContentResponse).text;
        fullText += text;
        setMessages(prev => prev.map(msg => 
          msg.id === botMessageId ? { ...msg, text: fullText } : msg
        ));
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'model',
        text: "I encountered a minor frequency interference. Please try asking again.",
        timestamp: Date.now()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-32 right-6 z-[60]">
      {/* Chat Window */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-[350px] md:w-[400px] h-[500px] bg-slate-900/95 backdrop-blur-2xl border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-300">
          {/* Header */}
          <div className="p-5 border-b border-slate-800 bg-gradient-to-r from-indigo-600/20 to-purple-600/20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-black text-white">MoodTunes AI</h3>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Active Sync</span>
                </div>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-slate-800 rounded-xl text-slate-500 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">
            {messages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center px-4 space-y-4">
                <Sparkles className="w-10 h-10 text-indigo-500/50" />
                <div>
                  <p className="text-slate-300 font-bold">The frequency is clear.</p>
                  <p className="text-xs text-slate-500 mt-1">Ask me anything about your current playlist or how music impacts your vibe.</p>
                </div>
              </div>
            )}
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <div className="shrink-0 pt-1">
                  {msg.role === 'user' ? (
                    <img src={user.avatar} className="w-7 h-7 rounded-full ring-1 ring-slate-800" alt="You" />
                  ) : (
                    <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center">
                      <Music className="w-4 h-4 text-indigo-400" />
                    </div>
                  )}
                </div>
                <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === 'user' 
                    ? 'bg-indigo-600 text-white rounded-tr-none' 
                    : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700/50'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3">
                <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center">
                  <Music className="w-4 h-4 text-indigo-400" />
                </div>
                <div className="bg-slate-800 text-slate-400 rounded-2xl rounded-tl-none px-4 py-3 border border-slate-700/50">
                  <Loader2 className="w-4 h-4 animate-spin" />
                </div>
              </div>
            )}
          </div>

          {/* Footer Input */}
          <form onSubmit={handleSendMessage} className="p-4 bg-slate-950/50 border-t border-slate-800">
            <div className="relative group">
              <input 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about your frequency..."
                className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-3 pl-4 pr-12 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-slate-600"
              />
              <button 
                type="submit"
                disabled={!input.trim() || isLoading}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 transition-all active:scale-90"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-2xl shadow-2xl flex items-center justify-center transition-all duration-500 hover:scale-110 active:scale-95 group ${
          isOpen 
            ? 'bg-slate-800 text-white rotate-90' 
            : 'bg-gradient-to-tr from-indigo-600 to-purple-600 text-white'
        }`}
      >
        {isOpen ? <X className="w-6 h-6" /> : (
          <>
            <MessageSquare className="w-6 h-6 group-hover:scale-110 transition-transform" />
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-slate-950 rounded-full" />
          </>
        )}
      </button>
    </div>
  );
};
