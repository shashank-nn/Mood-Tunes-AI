
import React, { useState, useEffect, useRef } from 'react';
import { User } from '../types';
import { Music, Mail, Lock, User as UserIcon, ArrowRight, Check, AlertCircle, ChevronLeft, ChevronRight, Sparkles, RefreshCcw, Palette } from 'lucide-react';

interface AuthProps {
  onLogin: (user: User) => void;
}

const AVATAR_STYLES = [
  { id: 'avataaars', name: 'Humans' },
  { id: 'bottts', name: 'Robots' },
  { id: 'pixel-art', name: 'Pixel' },
  { id: 'lorelei', name: 'Artistic' },
  { id: 'adventurer', name: 'Adventures' }
];

const AVATAR_SEEDS = [
  'Felix', 'Aneka', 'Casper', 'Sasha', 'Leo', 'Mia', 'Zoe', 'Max', 'Luna', 'Oliver', 
  'Milo', 'Ruby', 'Bella', 'Jack', 'Sophie', 'Willow', 'Finn', 'Nova', 'Jasper', 'Maya'
];

export const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [selectedStyle, setSelectedStyle] = useState(AVATAR_STYLES[0].id);
  const [selectedSeed, setSelectedSeed] = useState(AVATAR_SEEDS[0]);
  const [error, setError] = useState('');
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setError('');
  }, [isLogin]);

  const getUsersFromStorage = (): any[] => {
    const data = localStorage.getItem('moodtunes_accounts');
    return data ? JSON.parse(data) : [];
  };

  const scrollCarousel = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollAmount = 240;
      carouselRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const handleRandomize = () => {
    const randomSeed = AVATAR_SEEDS[Math.floor(Math.random() * AVATAR_SEEDS.length)];
    const randomStyle = AVATAR_STYLES[Math.floor(Math.random() * AVATAR_STYLES.length)].id;
    setSelectedSeed(randomSeed);
    setSelectedStyle(randomStyle);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const users = getUsersFromStorage();

    if (isLogin) {
      const existingUser = users.find((u: any) => u.email === email && u.password === password);
      if (existingUser) {
        // Updated to include required User properties
        const userToLogin: User = {
          id: existingUser.id,
          username: existingUser.username,
          email: existingUser.email,
          avatar: existingUser.avatar,
          subscription: existingUser.subscription || 'free',
          joinedAt: existingUser.joinedAt || Date.now()
        };
        localStorage.setItem('moodtunes_current_session', JSON.stringify(userToLogin));
        onLogin(userToLogin);
      } else {
        setError('Invalid email or password. Please try again or sign up.');
      }
    } else {
      const userExists = users.some((u: any) => u.email === email);
      if (userExists) {
        setError('An account with this email already exists.');
        return;
      }

      const avatarUrl = `https://api.dicebear.com/7.x/${selectedStyle}/svg?seed=${selectedSeed}`;
      // Added subscription and joinedAt to newUser record
      const newUser = {
        id: Math.random().toString(36).substr(2, 9),
        username: username || email.split('@')[0],
        email: email,
        password: password, 
        avatar: avatarUrl,
        subscription: 'free' as const,
        joinedAt: Date.now()
      };

      const updatedUsers = [...users, newUser];
      localStorage.setItem('moodtunes_accounts', JSON.stringify(updatedUsers));
      
      // Updated to include required User properties
      const userToLogin: User = {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        avatar: newUser.avatar,
        subscription: newUser.subscription,
        joinedAt: newUser.joinedAt
      };
      localStorage.setItem('moodtunes_current_session', JSON.stringify(userToLogin));
      onLogin(userToLogin);
    }
  };

  const currentAvatarUrl = (style: string, seed: string) => 
    `https://api.dicebear.com/7.x/${style}/svg?seed=${seed}`;

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/40 via-slate-950 to-slate-950">
      <div className="w-full max-w-lg">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-gradient-to-tr from-indigo-500 to-purple-500 p-4 rounded-3xl shadow-2xl shadow-indigo-500/20 mb-6 scale-110">
            <Music className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-white mb-2 italic uppercase">MOODTUNES AI</h1>
          <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px]">Your Frequency. Your Sound.</p>
        </div>

        <div className="bg-slate-900/40 backdrop-blur-3xl border border-slate-800 p-8 rounded-[3rem] shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-[60px] rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/10 blur-[60px] rounded-full translate-y-1/2 -translate-x-1/2" />

          <div className="relative z-10">
            <div className="flex gap-4 mb-8 p-1.5 bg-slate-950/80 rounded-[2rem] border border-slate-800/50">
              <button 
                onClick={() => setIsLogin(true)}
                className={`flex-1 py-3 text-sm font-black rounded-[1.5rem] transition-all tracking-widest uppercase ${isLogin ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-500 hover:text-white'}`}
              >
                Login
              </button>
              <button 
                onClick={() => setIsLogin(false)}
                className={`flex-1 py-3 text-sm font-black rounded-[1.5rem] transition-all tracking-widest uppercase ${!isLogin ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-500 hover:text-white'}`}
              >
                Join
              </button>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-3 text-red-400 animate-in fade-in zoom-in duration-300">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <p className="text-sm font-medium leading-relaxed">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {!isLogin && (
                <>
                  <div className="relative group">
                    <UserIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                    <input 
                      type="text"
                      placeholder="Display Name"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full bg-slate-950/50 border border-slate-800/80 rounded-2xl py-4 pl-14 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-bold placeholder:text-slate-600"
                    />
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                      <p className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] flex items-center gap-2">
                        <Palette className="w-3 h-3 text-indigo-400" />
                        Avatar System
                      </p>
                      <button 
                        type="button"
                        onClick={handleRandomize}
                        className="text-[9px] font-black uppercase text-indigo-400 flex items-center gap-1.5 hover:text-indigo-300 transition-colors"
                      >
                        <RefreshCcw className="w-3 h-3" />
                        Randomize
                      </button>
                    </div>
                    
                    <div className="flex flex-col items-center gap-6 p-6 bg-slate-950/60 rounded-[2.5rem] border border-slate-800/50 shadow-inner">
                      <div className="flex w-full items-center gap-6">
                        {/* Large Hero Preview */}
                        <div className="shrink-0 relative group">
                          <div className="absolute -inset-4 bg-indigo-500/20 blur-3xl rounded-full opacity-60 group-hover:opacity-100 transition-opacity duration-1000" />
                          <div className="relative w-28 h-28 md:w-36 md:h-36 rounded-[2rem] overflow-hidden bg-slate-900 border-4 border-slate-800 p-1 shadow-2xl transition-transform duration-500 group-hover:scale-105">
                            <img 
                              key={`${selectedStyle}-${selectedSeed}`}
                              src={currentAvatarUrl(selectedStyle, selectedSeed)} 
                              alt="Live Preview" 
                              className="w-full h-full object-cover animate-in fade-in zoom-in duration-500"
                            />
                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent h-1/3" />
                          </div>
                        </div>

                        {/* Style Selector */}
                        <div className="flex-1 space-y-3">
                          <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Select Style</p>
                          <div className="grid grid-cols-2 gap-2">
                            {AVATAR_STYLES.map((style) => (
                              <button
                                key={style.id}
                                type="button"
                                onClick={() => setSelectedStyle(style.id)}
                                className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-tighter transition-all border ${
                                  selectedStyle === style.id 
                                    ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg' 
                                    : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300 hover:border-slate-700'
                                }`}
                              >
                                {style.name}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Seed Selection Carousel */}
                      <div className="w-full min-w-0 flex flex-col gap-3">
                        <div className="flex items-center gap-2">
                           <h4 className="text-[9px] font-black uppercase tracking-widest text-slate-600">Variants</h4>
                           <div className="h-px flex-1 bg-slate-800/50" />
                        </div>
                        
                        <div className="relative group/nav">
                          <button 
                            type="button" 
                            onClick={() => scrollCarousel('left')}
                            className="absolute -left-3 top-1/2 -translate-y-1/2 z-20 p-2 bg-slate-800/90 backdrop-blur border border-slate-700 text-white rounded-full hover:bg-indigo-600 hover:border-indigo-500 transition-all shadow-2xl active:scale-75 opacity-0 group-hover/nav:opacity-100"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>
                          
                          <div 
                            ref={carouselRef}
                            className="flex items-center gap-4 overflow-x-auto py-2 no-scrollbar snap-x scroll-smooth px-2"
                          >
                            {AVATAR_SEEDS.map((seed) => (
                              <button
                                key={seed}
                                type="button"
                                onClick={() => setSelectedSeed(seed)}
                                className={`
                                  relative shrink-0 w-16 h-16 rounded-2xl overflow-hidden border-2 transition-all p-1 snap-center
                                  ${selectedSeed === seed 
                                    ? 'border-indigo-500 bg-indigo-500/20 ring-4 ring-indigo-500/10 scale-105 shadow-xl' 
                                    : 'border-slate-800 hover:border-slate-600 bg-slate-950 opacity-60 hover:opacity-100'}
                                `}
                              >
                                <img 
                                  src={currentAvatarUrl(selectedStyle, seed)} 
                                  alt={seed} 
                                  className="w-full aspect-square"
                                />
                                {selectedSeed === seed && (
                                  <div className="absolute top-1 right-1 bg-indigo-500 rounded-full p-0.5 shadow-md">
                                    <Check className="w-2 h-2 text-white stroke-[4px]" />
                                  </div>
                                )}
                              </button>
                            ))}
                          </div>

                          <button 
                            type="button" 
                            onClick={() => scrollCarousel('right')}
                            className="absolute -right-3 top-1/2 -translate-y-1/2 z-20 p-2 bg-slate-800/90 backdrop-blur border border-slate-700 text-white rounded-full hover:bg-indigo-600 hover:border-indigo-500 transition-all shadow-2xl active:scale-75 opacity-0 group-hover/nav:opacity-100"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
              
              <div className="space-y-4">
                <div className="relative group">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                  <input 
                    type="email"
                    placeholder="Email Address"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-950/50 border border-slate-800/80 rounded-2xl py-4 pl-14 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-bold placeholder:text-slate-600"
                  />
                </div>
                
                <div className="relative group">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                  <input 
                    type="password"
                    placeholder="Password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-950/50 border border-slate-800/80 rounded-2xl py-4 pl-14 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-bold placeholder:text-slate-600"
                  />
                </div>
              </div>

              <button 
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-5 rounded-[2rem] font-black transition-all shadow-2xl shadow-indigo-600/30 flex items-center justify-center gap-3 group active:scale-[0.98] mt-4"
              >
                <span className="tracking-[0.1em] uppercase">
                  {isLogin ? 'Enter Broadcast' : 'Sync Identity'}
                </span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </form>

            <p className="mt-8 text-center text-[10px] text-slate-600 uppercase tracking-[0.2em] font-black opacity-50">
              Session Encrypted &bull; Offline Ready
            </p>
          </div>
        </div>
      </div>
      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};
