
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Mood, Track, User, HistoryItem, SavedPlaylist, ViewType } from './types';
import { MOOD_CONFIG } from './constants';
import { MoodCard } from './components/MoodCard';
import { Player } from './components/Player';
import { Auth } from './components/Auth';
import { ChatBot } from './components/ChatBot';
import { Insights } from './components/Insights';
import { Pricing } from './components/Pricing';
import { generatePlaylist, detectMood } from './services/geminiService';
// Added BrainCircuit to imports
import { 
  Music, Loader2, Sparkles, TrendingUp, History, Send, 
  LogOut, User as UserIcon, Save, Bookmark, Trash2, 
  Play, ExternalLink, ChevronRight, Check, X, Edit2,
  Radio, LayoutGrid, BarChart3, CreditCard, ChevronLeft,
  BrainCircuit
} from 'lucide-react';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [activeView, setActiveView] = useState<ViewType>('radio');
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const [playlist, setPlaylist] = useState<Track[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [moodInput, setMoodInput] = useState('');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [savedPlaylists, setSavedPlaylists] = useState<SavedPlaylist[]>([]);
  
  // Sidebar State
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // UI States
  const [isNamingPlaylist, setIsNamingPlaylist] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const session = localStorage.getItem('moodtunes_current_session');
    if (session) {
      const parsedUser = JSON.parse(session);
      setUser({
        ...parsedUser,
        subscription: parsedUser.subscription || 'free',
        joinedAt: parsedUser.joinedAt || Date.now()
      });
    }
    
    const savedHistory = localStorage.getItem('moodtunes_history');
    if (savedHistory) setHistory(JSON.parse(savedHistory));

    const playlists = localStorage.getItem('moodtunes_saved_playlists');
    if (playlists) setSavedPlaylists(JSON.parse(playlists));
  }, []);

  const addToHistory = useCallback((mood: Mood | string, track: Track) => {
    const newItem: HistoryItem = {
      timestamp: Date.now(),
      mood,
      trackId: track.id,
      trackTitle: track.title,
      trackArtist: track.artist
    };
    setHistory(prev => {
      const updated = [newItem, ...prev].slice(0, 100); // Scale to 100 for better analytics
      localStorage.setItem('moodtunes_history', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const fetchPlaylist = async (mood: Mood) => {
    setIsLoading(true);
    setIsPlaying(false);
    try {
      const suggested = await generatePlaylist(mood);
      
      const transformedTracks: Track[] = suggested.map((t, idx) => ({
        id: `${mood}-${idx}-${Date.now()}`,
        title: t.title || 'Unknown Title',
        artist: t.artist || 'Unknown Artist',
        albumArt: `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent((t.title || '') + (t.artist || ''))}&backgroundColor=b6e3f4,c0aede,d1d4f9`,
        videoId: t.videoId || 'dQw4w9WgXcQ',
        genre: t.genre || MOOD_CONFIG[mood]?.genre || 'Eclectic'
      }));

      setPlaylist(transformedTracks);
      setCurrentIndex(0);
      setIsPlaying(true);
      if (transformedTracks.length > 0) addToHistory(mood, transformedTracks[0]);
    } catch (error) {
      console.error("Playlist generation failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMoodSelect = (mood: Mood) => {
    if (mood === selectedMood && playlist.length > 0) return;
    setSelectedMood(mood);
    fetchPlaylist(mood);
    setActiveView('radio');
  };

  const handleTextMoodSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!moodInput.trim()) return;
    setIsLoading(true);
    try {
      const detected = await detectMood(moodInput);
      setSelectedMood(detected);
      await fetchPlaylist(detected);
      setMoodInput('');
      setActiveView('radio');
    } catch (error) {
      console.error("Mood detection failed", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpgrade = () => {
    if (!user) return;
    const updatedUser: User = { ...user, subscription: 'pro' };
    setUser(updatedUser);
    localStorage.setItem('moodtunes_current_session', JSON.stringify(updatedUser));
    alert('Welcome to MoodTunes Pro! Syncing frequencies...');
  };

  const handleStartSave = () => {
    if (playlist.length === 0) return;
    setNewPlaylistName(`${selectedMood || 'Custom'} Vibe ${new Date().toLocaleDateString()}`);
    setIsNamingPlaylist(true);
  };

  const handleConfirmSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;
    
    const newSavedPlaylist: SavedPlaylist = {
      id: Date.now().toString(),
      name: newPlaylistName.trim(),
      mood: selectedMood || 'Chill',
      tracks: [...playlist],
      timestamp: Date.now()
    };

    const updated = [newSavedPlaylist, ...savedPlaylists];
    setSavedPlaylists(updated);
    localStorage.setItem('moodtunes_saved_playlists', JSON.stringify(updated));
    
    setIsNamingPlaylist(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleDeleteSavedPlaylist = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this collection?')) return;
    const updated = savedPlaylists.filter(p => p.id !== id);
    setSavedPlaylists(updated);
    localStorage.setItem('moodtunes_saved_playlists', JSON.stringify(updated));
  };

  const loadSavedPlaylist = (saved: SavedPlaylist) => {
    setPlaylist(saved.tracks);
    setSelectedMood(saved.mood as Mood);
    setCurrentIndex(0);
    setIsPlaying(true);
    setActiveView('radio');
  };

  const handleNext = useCallback(() => {
    if (playlist.length === 0) return;
    const nextIdx = (currentIndex + 1) % playlist.length;
    setCurrentIndex(nextIdx);
    addToHistory(selectedMood || 'Chill', playlist[nextIdx]);
  }, [playlist, currentIndex, selectedMood, addToHistory]);

  const handlePrev = useCallback(() => {
    if (playlist.length === 0) return;
    const prevIdx = (currentIndex - 1 + playlist.length) % playlist.length;
    setCurrentIndex(prevIdx);
    addToHistory(selectedMood || 'Chill', playlist[prevIdx]);
  }, [playlist, currentIndex, selectedMood, addToHistory]);

  const handleSkipTo = useCallback((index: number) => {
    if (index >= 0 && index < playlist.length) {
      setCurrentIndex(index);
      setIsPlaying(true);
      addToHistory(selectedMood || 'Chill', playlist[index]);
    }
  }, [playlist, selectedMood, addToHistory]);

  const handleLogout = () => {
    localStorage.removeItem('moodtunes_current_session');
    setUser(null);
    window.location.reload();
  };

  const currentTrack = useMemo(() => playlist[currentIndex] || null, [playlist, currentIndex]);

  if (!user) return <Auth onLogin={setUser} />;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex overflow-hidden selection:bg-indigo-500/30">
      {/* SaaS Sidebar Navigation */}
      <aside 
        className={`
          relative z-50 bg-slate-950 border-r border-slate-900 transition-all duration-500 flex flex-col
          ${sidebarOpen ? 'w-72' : 'w-20'}
        `}
      >
        <div className="p-6 mb-6 flex items-center justify-between">
          <div className={`flex items-center gap-3 transition-opacity ${sidebarOpen ? 'opacity-100' : 'opacity-0 w-0'}`}>
            <div className="bg-gradient-to-tr from-indigo-600 to-purple-600 p-2 rounded-xl shadow-lg shadow-indigo-600/20">
              <Music className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-sm font-black uppercase italic tracking-tighter whitespace-nowrap">MoodTunes AI</h1>
          </div>
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-slate-900 rounded-xl text-slate-600 transition-colors"
          >
            {sidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <Music className="w-6 h-6 text-indigo-500" />}
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          {[
            { id: 'radio', label: 'Broadcast', icon: <Radio className="w-5 h-5" /> },
            { id: 'collection', label: 'Collection', icon: <LayoutGrid className="w-5 h-5" /> },
            { id: 'insights', label: 'Insights', icon: <BarChart3 className="w-5 h-5" /> },
            { id: 'pricing', label: 'Upgrade', icon: <CreditCard className="w-5 h-5" />, pro: true }
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id as ViewType)}
              className={`
                w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all group relative
                ${activeView === item.id ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20' : 'text-slate-500 hover:text-white hover:bg-slate-900'}
              `}
            >
              <div className={`${activeView === item.id ? 'scale-110' : 'group-hover:scale-110'} transition-transform`}>
                {item.icon}
              </div>
              <span className={`text-xs font-black uppercase tracking-widest whitespace-nowrap transition-opacity ${sidebarOpen ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden'}`}>
                {item.label}
              </span>
              {item.pro && user.subscription !== 'pro' && sidebarOpen && (
                <span className="ml-auto bg-indigo-500/10 text-indigo-400 text-[8px] font-black uppercase px-2 py-0.5 rounded-full border border-indigo-500/20">Pro</span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 mt-auto">
          <div className={`bg-slate-900/50 rounded-2xl p-4 transition-opacity ${sidebarOpen ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'}`}>
             <div className="flex items-center gap-3 mb-3">
                <img src={user.avatar} className="w-8 h-8 rounded-full ring-2 ring-indigo-500/20" alt="" />
                <div className="min-w-0">
                   <p className="text-[10px] font-black text-white truncate">{user.username}</p>
                   <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest truncate">{user.subscription} Tier</p>
                </div>
             </div>
             <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 py-2 bg-slate-950/50 text-slate-600 hover:text-red-400 rounded-xl transition-colors">
                <LogOut className="w-3.5 h-3.5" />
                <span className="text-[9px] font-black uppercase">Logout</span>
             </button>
          </div>
        </div>
      </aside>

      {/* Main Control Center */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* Top Floating Dashboard Header */}
        <header className="px-10 py-6 flex items-center justify-between z-40 bg-slate-950/50 backdrop-blur-sm border-b border-slate-900/50">
           <div className="flex items-center gap-3">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">Node: Local-Broadcast-01</span>
              <div className="w-1 h-1 bg-slate-800 rounded-full" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">Latency: 24ms</span>
           </div>
           {user.subscription === 'pro' && (
             <div className="flex items-center gap-2 px-3 py-1 bg-indigo-600 text-white text-[9px] font-black uppercase rounded-full shadow-lg shadow-indigo-600/20">
                <Sparkles className="w-3 h-3" />
                Pro Sync Active
             </div>
           )}
        </header>

        <div className="flex-1 overflow-y-auto px-10 py-8 custom-scrollbar pb-44">
          <div className="max-w-6xl mx-auto">
            {activeView === 'radio' && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className="flex items-center justify-between mb-10">
                   <div>
                      <h2 className="text-4xl font-black uppercase tracking-tighter italic">Sonic Mapping</h2>
                      <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-1">Select your current frequency to initiate broadcast</p>
                   </div>
                   {playlist.length > 0 && (
                     <div className="flex items-center gap-2">
                        <button onClick={handleStartSave} className="p-3 bg-slate-900 border border-slate-800 rounded-2xl text-indigo-400 hover:bg-indigo-600 hover:text-white transition-all shadow-xl group">
                           <Save className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        </button>
                     </div>
                   )}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
                   {Object.values(Mood).map(mood => (
                     <MoodCard key={mood} mood={mood} isSelected={selectedMood === mood} onClick={() => handleMoodSelect(mood)} />
                   ))}
                </div>

                <div className="relative group mb-16">
                  <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/20 to-purple-600/20 rounded-[3rem] blur opacity-40 group-hover:opacity-100 transition duration-1000"></div>
                  <div className="relative bg-slate-900/40 backdrop-blur-xl p-10 rounded-[3rem] border border-slate-800">
                    <h3 className="text-lg font-black uppercase italic mb-6 flex items-center gap-3">
                      <BrainCircuit className="w-5 h-5 text-indigo-400" />
                      Direct Neural Input
                    </h3>
                    <form onSubmit={handleTextMoodSubmit} className="relative">
                      <textarea 
                        value={moodInput}
                        onChange={(e) => setMoodInput(e.target.value)}
                        placeholder="e.g., 'Exhausted after a 12-hour shift, need to decompress with something atmospheric'..."
                        className="w-full bg-slate-950/50 border border-slate-800 rounded-[2rem] p-6 pr-20 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all resize-none h-32 text-lg font-bold placeholder:text-slate-700 shadow-inner"
                      />
                      <button 
                        type="submit"
                        disabled={isLoading || !moodInput.trim()}
                        className="absolute bottom-6 right-6 bg-indigo-600 p-4 rounded-2xl hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-700 transition-all shadow-2xl shadow-indigo-600/20 active:scale-90"
                      >
                        {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Send className="w-6 h-6" />}
                      </button>
                    </form>
                  </div>
                </div>

                {isLoading ? (
                  <div className="flex flex-col items-center justify-center py-20 space-y-8">
                    <Loader2 className="w-16 h-16 text-indigo-500 animate-spin" />
                    <div className="text-center">
                       <h3 className="text-2xl font-black uppercase italic mb-2">Architecting Signal</h3>
                       <p className="text-slate-600 text-xs font-bold uppercase tracking-widest">Gemini is curating 30 iconic hits for your current frequency...</p>
                    </div>
                  </div>
                ) : currentTrack ? (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                    <div className="lg:col-span-8">
                       <div className="relative group overflow-hidden rounded-[4rem] border border-slate-900 shadow-3xl bg-slate-900 aspect-video lg:aspect-[16/9]">
                          <img src={currentTrack.albumArt} className={`absolute inset-0 w-full h-full object-cover opacity-20 blur-3xl transition-all duration-[3000ms] ${isPlaying ? 'scale-150 rotate-6' : 'scale-100'}`} alt="" />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                          <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center">
                             <img src={currentTrack.albumArt} className={`w-56 h-56 md:w-72 md:h-72 rounded-[3rem] shadow-2xl mb-10 transition-all duration-700 border-8 border-slate-950/50 ${isPlaying ? 'scale-105 shadow-indigo-500/20' : 'scale-95 grayscale'}`} alt="" />
                             <h2 className="text-4xl md:text-6xl font-black mb-4 tracking-tighter leading-none text-white drop-shadow-2xl italic uppercase">{currentTrack.title}</h2>
                             <p className="text-xl md:text-2xl text-slate-400 font-bold mb-10 uppercase tracking-[0.2em] italic">{currentTrack.artist}</p>
                             <div className="flex gap-4">
                                <a href={`https://www.youtube.com/watch?v=${currentTrack.videoId}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-8 py-4 bg-red-600/90 hover:bg-red-600 text-white rounded-2xl font-black transition-all hover:scale-105 active:scale-95 shadow-xl shadow-red-600/20 uppercase text-[10px] tracking-widest"><ExternalLink className="w-4 h-4" /> YouTube Control</a>
                                <button onClick={handleStartSave} className="flex items-center gap-3 px-8 py-4 bg-slate-800/80 hover:bg-indigo-600 text-white rounded-2xl font-black transition-all hover:scale-105 active:scale-95 border border-slate-700 uppercase text-[10px] tracking-widest"><Save className="w-4 h-4" /> Archive Signal</button>
                             </div>
                          </div>
                       </div>
                    </div>
                    <div className="lg:col-span-4 flex flex-col">
                       <h3 className="text-xl font-black uppercase italic mb-6 flex items-center justify-between">
                          Signal Stream
                          <span className="text-[10px] font-black text-indigo-400">{playlist.length} Loaded</span>
                       </h3>
                       <div className="flex-1 space-y-2 overflow-y-auto max-h-[500px] pr-2 custom-scrollbar">
                          {playlist.map((track, idx) => (
                            <div key={track.id} onClick={() => handleSkipTo(idx)} className={`group flex items-center gap-4 p-4 rounded-3xl cursor-pointer transition-all ${idx === currentIndex ? 'bg-indigo-600/10 border border-indigo-500/30' : 'hover:bg-slate-900/50'}`}>
                               <img src={track.albumArt} className="w-12 h-12 rounded-xl object-cover" alt="" />
                               <div className="flex-1 min-w-0">
                                  <p className={`font-black truncate text-sm uppercase italic ${idx === currentIndex ? 'text-indigo-400' : 'text-slate-300'}`}>{track.title}</p>
                                  <p className="text-[10px] text-slate-500 font-bold uppercase truncate">{track.artist}</p>
                               </div>
                               {idx === currentIndex && isPlaying && <div className="flex gap-0.5 items-end h-3"><div className="w-1 bg-indigo-500 animate-pulse h-full" /><div className="w-1 bg-indigo-500 animate-pulse h-1/2" /><div className="w-1 bg-indigo-500 animate-pulse h-3/4" /></div>}
                            </div>
                          ))}
                       </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-40 border-4 border-dashed border-slate-900 rounded-[5rem] bg-slate-900/10">
                     <Radio className="w-20 h-20 text-slate-800 mb-8 animate-pulse" />
                     <h3 className="text-3xl font-black uppercase italic mb-2">Carrier Signal Lost</h3>
                     <p className="text-slate-600 text-sm font-bold uppercase tracking-widest">Select a mood to re-establish broadcast</p>
                  </div>
                )}
              </div>
            )}

            {activeView === 'collection' && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className="mb-10">
                  <h2 className="text-4xl font-black uppercase tracking-tighter italic">Vibe Archive</h2>
                  <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-1">Your curated emotional timelines</p>
                </div>
                {savedPlaylists.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {savedPlaylists.map(saved => (
                      <div key={saved.id} onClick={() => loadSavedPlaylist(saved)} className="group bg-slate-900/50 border border-slate-800 p-8 rounded-[3rem] hover:bg-slate-900 hover:border-indigo-500/50 transition-all cursor-pointer flex flex-col h-full relative overflow-hidden">
                        <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${MOOD_CONFIG[saved.mood as Mood]?.color || 'from-slate-700 to-slate-900'} opacity-5 blur-2xl`} />
                        <div className={`w-14 h-14 rounded-[1.5rem] flex items-center justify-center bg-gradient-to-br ${MOOD_CONFIG[saved.mood as Mood]?.color || 'from-slate-700 to-slate-900'} shadow-xl mb-6`}>
                          <Bookmark className="w-6 h-6 text-white" />
                        </div>
                        <h4 className="text-xl font-black text-white italic mb-2 uppercase tracking-tighter group-hover:text-indigo-400 transition-colors leading-tight">{saved.name}</h4>
                        <div className="flex items-center gap-3 mt-auto">
                           <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{saved.tracks.length} Tracks</span>
                           <div className="w-1 h-1 bg-slate-800 rounded-full" />
                           <span className="text-[10px] text-indigo-500 font-black uppercase tracking-widest">{saved.mood}</span>
                        </div>
                        <button onClick={(e) => handleDeleteSavedPlaylist(saved.id, e)} className="absolute top-6 right-6 p-2 text-slate-700 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-40 border-4 border-dashed border-slate-900 rounded-[5rem] bg-slate-900/10">
                    <Bookmark className="w-16 h-16 text-slate-800 mb-6" />
                    <h3 className="text-2xl font-black text-slate-700 uppercase italic">Vault Empty</h3>
                    <p className="text-slate-600 font-bold uppercase text-xs tracking-widest">Archive your first signal to see it here</p>
                  </div>
                )}
              </div>
            )}

            {activeView === 'insights' && <Insights history={history} />}
            {activeView === 'pricing' && <Pricing currentSub={user.subscription} onUpgrade={handleUpgrade} />}
          </div>
        </div>
      </main>

      {/* Persistence Controls */}
      <Player currentTrack={currentTrack} playlist={playlist} currentIndex={currentIndex} isPlaying={isPlaying} onTogglePlay={() => setIsPlaying(!isPlaying)} onNext={handleNext} onPrev={handlePrev} onEnded={handleNext} onSkipTo={handleSkipTo} />

      <ChatBot user={user} />

      {/* Playlist Archiving Dialog */}
      {isNamingPlaylist && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-xl animate-in fade-in duration-300">
           <div className="w-full max-w-md bg-slate-900 border border-slate-800 p-10 rounded-[3rem] shadow-3xl animate-in zoom-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center gap-4 mb-8">
                 <div className="bg-indigo-600 p-3.5 rounded-2xl shadow-xl shadow-indigo-600/20"><Edit2 className="w-6 h-6 text-white" /></div>
                 <h3 className="text-2xl font-black text-white uppercase italic">Sync to Vault</h3>
              </div>
              <form onSubmit={handleConfirmSave} className="space-y-8">
                 <input autoFocus value={newPlaylistName} onChange={(e) => setNewPlaylistName(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-5 px-6 text-white text-xl font-black italic focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-slate-800" placeholder="Session Tag..." />
                 <div className="flex gap-4">
                    <button type="button" onClick={() => setIsNamingPlaylist(false)} className="flex-1 py-4 bg-slate-800 text-slate-300 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-700 transition-all">Abort</button>
                    <button type="submit" className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-600/30">Confirm Archive</button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default App;
