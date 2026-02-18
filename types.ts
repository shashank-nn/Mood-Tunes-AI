
export enum Mood {
  HAPPY = 'Happy',
  SAD = 'Sad',
  MOTIVATIONAL = 'Motivational',
  SLEEP = 'Sleep',
  ANGER = 'Anger',
  CHILL = 'Chill'
}

export interface Track {
  id: string;
  title: string;
  artist: string;
  albumArt: string;
  videoId: string;
  genre: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  avatar: string;
  subscription: 'free' | 'pro';
  joinedAt: number;
}

export interface HistoryItem {
  timestamp: number;
  mood: Mood | string;
  trackId: string;
  trackTitle: string;
  trackArtist: string;
}

export interface SavedPlaylist {
  id: string;
  name: string;
  mood: Mood | string;
  tracks: Track[];
  timestamp: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export type ViewType = 'radio' | 'collection' | 'insights' | 'pricing';
