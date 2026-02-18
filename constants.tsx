
import React from 'react';
import { Smile, Frown, Zap, Moon, Flame, Coffee } from 'lucide-react';
import { Mood } from './types';

export const MOOD_CONFIG = {
  [Mood.HAPPY]: {
    icon: <Smile className="w-8 h-8" />,
    color: 'from-yellow-400 to-orange-500',
    description: 'Upbeat, joyful, and positive vibes',
    genre: 'Pop, Disco, Funk'
  },
  [Mood.SAD]: {
    icon: <Frown className="w-8 h-8" />,
    color: 'from-blue-500 to-indigo-600',
    description: 'Melancholic, soul-searching melodies',
    genre: 'Indie, Acoustic, Blues'
  },
  [Mood.MOTIVATIONAL]: {
    icon: <Zap className="w-8 h-8" />,
    color: 'from-purple-500 to-pink-600',
    description: 'Powerful, high-energy anthems',
    genre: 'Rock, Cinematic, Electronic'
  },
  [Mood.SLEEP]: {
    icon: <Moon className="w-8 h-8" />,
    color: 'from-slate-700 to-slate-900',
    description: 'Calm, ambient, and soothing sounds',
    genre: 'Ambient, Lo-fi, Classical'
  },
  [Mood.ANGER]: {
    icon: <Flame className="w-8 h-8" />,
    color: 'from-red-600 to-orange-700',
    description: 'Intense, aggressive, and raw energy',
    genre: 'Metal, Hardcore, Punk'
  },
  [Mood.CHILL]: {
    icon: <Coffee className="w-8 h-8" />,
    color: 'from-emerald-400 to-teal-600',
    description: 'Relaxed, laid-back atmospheric tunes',
    genre: 'Jazz, Lo-fi Hip Hop, Neo-soul'
  }
};
