
import React from 'react';
import { Mood } from '../types';
import { MOOD_CONFIG } from '../constants';

interface MoodCardProps {
  mood: Mood;
  isSelected: boolean;
  onClick: () => void;
}

export const MoodCard: React.FC<MoodCardProps> = ({ mood, isSelected, onClick }) => {
  const config = MOOD_CONFIG[mood];

  return (
    <button
      onClick={onClick}
      className={`
        relative overflow-hidden group rounded-2xl p-6 transition-all duration-300
        ${isSelected ? 'scale-105 ring-4 ring-white ring-opacity-50' : 'hover:scale-102'}
        bg-gradient-to-br ${config.color}
        shadow-xl flex flex-col items-center justify-center text-center gap-3
        min-h-[160px] cursor-pointer
      `}
    >
      <div className="text-white group-hover:scale-110 transition-transform">
        {config.icon}
      </div>
      <h3 className="text-xl font-bold text-white capitalize">{mood}</h3>
      <p className="text-xs text-white/80 line-clamp-2">{config.description}</p>
      
      {isSelected && (
        <div className="absolute top-2 right-2">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
        </div>
      )}
    </button>
  );
};
