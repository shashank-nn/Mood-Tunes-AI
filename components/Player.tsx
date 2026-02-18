
import React, { useRef, useState } from 'react';
import ReactPlayer from 'react-player';
import { Play, Pause, SkipBack, SkipForward, Volume2, Music, ListMusic, ChevronUp, X, ExternalLink } from 'lucide-react';
import { Track } from '../types';

interface PlayerProps {
  currentTrack: Track | null;
  playlist: Track[];
  currentIndex: number;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onNext: () => void;
  onPrev: () => void;
  onEnded: () => void;
  onSkipTo: (index: number) => void;
}

export const Player: React.FC<PlayerProps> = ({
  currentTrack,
  playlist,
  currentIndex,
  isPlaying,
  onTogglePlay,
  onNext,
  onPrev,
  onEnded,
  onSkipTo
}) => {
  const [volume, setVolume] = useState(0.7);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isQueueOpen, setIsQueueOpen] = useState(false);
  const playerRef = useRef<any>(null);

  if (!currentTrack) {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 p-6 flex flex-col items-center justify-center gap-2 z-50">
        <Music className="w-8 h-8 text-slate-600 animate-pulse" />
        <p className="text-slate-400 font-medium text-sm">Select a mood to start listening</p>
      </div>
    );
  }

  const handleProgress = (state: any) => {
    setProgress(state.played * 100);
  };

  const handleDuration = (d: number) => {
    setDuration(d);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const videoUrl = `https://www.youtube.com/watch?v=${currentTrack.videoId}`;
  const upcomingTracks = playlist.slice(currentIndex + 1);

  const PlayerComponent = ReactPlayer as any;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      {/* Upcoming Tracks Queue Drawer */}
      <div 
        className={`
          absolute bottom-full left-0 right-0 bg-slate-900/98 backdrop-blur-2xl border-t border-slate-800 
          transition-all duration-500 ease-in-out overflow-hidden shadow-2xl
          ${isQueueOpen ? 'max-h-[60vh] py-8 px-6' : 'max-h-0'}
        `}
      >
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-black text-white flex items-center gap-2">
                <ListMusic className="w-5 h-5 text-indigo-400" />
                Up Next
              </h3>
              <p className="text-slate-500 text-[10px] uppercase tracking-widest font-bold mt-1">
                {upcomingTracks.length} tracks remaining in this session
              </p>
            </div>
            <button 
              onClick={() => setIsQueueOpen(false)}
              className="p-2 hover:bg-slate-800 rounded-full text-slate-400 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-1 overflow-y-auto max-h-[40vh] pr-2 custom-scrollbar pb-10">
            {upcomingTracks.length > 0 ? upcomingTracks.map((track, idx) => {
              const actualIndex = currentIndex + 1 + idx;
              return (
                <div 
                  key={track.id}
                  onClick={() => {
                    onSkipTo(actualIndex);
                    setIsQueueOpen(false);
                  }}
                  className="group flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-all cursor-pointer border border-transparent hover:border-white/10"
                >
                  <span className="text-[10px] font-black text-slate-700 w-4">{idx + 1}</span>
                  <img src={track.albumArt} alt="" className="w-10 h-10 rounded-lg shadow-md grayscale group-hover:grayscale-0 transition-all bg-slate-800" />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-slate-200 truncate group-hover:text-indigo-400 transition-colors">{track.title}</h4>
                    <p className="text-[10px] text-slate-500 uppercase font-black tracking-wider">{track.artist}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <a 
                      href={`https://www.youtube.com/watch?v=${track.videoId}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-slate-600 hover:text-red-500 transition-colors"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </a>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <Play className="w-4 h-4 text-indigo-500 fill-current" />
                    </div>
                  </div>
                </div>
              );
            }) : (
              <div className="text-center py-12">
                <Music className="w-8 h-8 text-slate-700 mx-auto mb-4 opacity-20" />
                <p className="text-slate-500 font-bold text-sm">No more upcoming tracks.</p>
                <p className="text-[10px] text-slate-700 mt-1 uppercase">Select a new mood to refresh</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Control Bar */}
      <div className="relative bg-slate-900/95 backdrop-blur-xl border-t border-slate-800 p-4 md:px-8 shadow-2xl">
        <div className="hidden">
          <PlayerComponent
            ref={playerRef}
            url={videoUrl}
            playing={isPlaying}
            volume={volume}
            onProgress={handleProgress}
            onDuration={handleDuration}
            onEnded={onEnded}
            config={{
              youtube: {
                playerVars: { autoplay: 1, controls: 0, modestbranding: 1 }
              }
            } as any}
          />
        </div>

        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-4">
          {/* Left: Track Info */}
          <div className="flex items-center gap-4 w-full md:w-1/3">
            <div 
              className="relative group/cover cursor-pointer" 
              onClick={() => setIsQueueOpen(!isQueueOpen)}
            >
              <img
                src={currentTrack.albumArt}
                alt={currentTrack.title}
                className="w-14 h-14 md:w-16 md:h-16 rounded-xl shadow-xl object-cover bg-slate-800 transition-transform group-hover/cover:scale-105"
              />
              <div className={`absolute inset-0 flex items-center justify-center bg-black/40 rounded-xl transition-opacity ${isQueueOpen ? 'opacity-100' : 'opacity-0 group-hover/cover:opacity-100'}`}>
                <ChevronUp className={`w-6 h-6 text-white transition-transform duration-500 ${isQueueOpen ? 'rotate-180' : ''}`} />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-slate-100 font-bold text-sm truncate">{currentTrack.title}</h4>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest truncate">{currentTrack.artist}</p>
            </div>
          </div>

          {/* Center: Controls */}
          <div className="flex flex-col items-center gap-2 w-full md:w-1/3">
            <div className="flex items-center gap-6">
              <button onClick={onPrev} className="p-2 text-slate-500 hover:text-white transition-colors">
                <SkipBack className="w-5 h-5 fill-current" />
              </button>
              <button
                onClick={onTogglePlay}
                className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-slate-950 hover:scale-110 active:scale-95 transition-all shadow-lg shadow-white/10"
              >
                {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-1" />}
              </button>
              <button onClick={onNext} className="p-2 text-slate-500 hover:text-white transition-colors">
                <SkipForward className="w-5 h-5 fill-current" />
              </button>
            </div>
            
            <div className="w-full max-w-md flex items-center gap-3">
              <span className="text-[9px] text-slate-500 font-black tabular-nums w-8">{formatTime((progress / 100) * duration)}</span>
              <div className="flex-1 h-1 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-indigo-500 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-[9px] text-slate-500 font-black tabular-nums w-8">{formatTime(duration)}</span>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center justify-end gap-6 w-full md:w-1/3">
            <button 
              onClick={() => setIsQueueOpen(!isQueueOpen)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${isQueueOpen ? 'text-indigo-400 bg-indigo-500/10' : 'text-slate-500 hover:text-white'}`}
            >
              <ListMusic className="w-5 h-5" />
              <span className="text-[10px] font-black uppercase tracking-widest hidden lg:inline">Queue</span>
            </button>
            <div className="flex items-center gap-2 w-28 group">
              <Volume2 className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-full accent-indigo-500 h-1 bg-slate-800 rounded-full appearance-none cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
