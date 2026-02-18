
import React, { useMemo } from 'react';
import { HistoryItem, Mood } from '../types';
import { MOOD_CONFIG } from '../constants';
import { BarChart3, TrendingUp, BrainCircuit, Calendar } from 'lucide-react';

interface InsightsProps {
  history: HistoryItem[];
}

export const Insights: React.FC<InsightsProps> = ({ history }) => {
  const stats = useMemo(() => {
    const counts: Record<string, number> = {};
    history.forEach(item => {
      counts[item.mood] = (counts[item.mood] || 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([mood, count]) => ({
        mood: mood as Mood,
        count,
        percentage: (count / history.length) * 100
      }));
  }, [history]);

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-40 bg-slate-900/20 rounded-[3rem] border border-dashed border-slate-800">
        <BrainCircuit className="w-16 h-16 text-slate-800 mb-6" />
        <h3 className="text-2xl font-black text-slate-700 uppercase italic">Data Sync Required</h3>
        <p className="text-slate-600 mt-2 font-medium">Listen to more music to unlock your emotional intelligence dashboard.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black uppercase tracking-tighter italic">Emotional Intelligence</h2>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-1">Platform Analytics • Real-time Data</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl">
          <Calendar className="w-4 h-4 text-indigo-400" />
          <span className="text-xs font-black text-indigo-400 uppercase tracking-widest">Last 30 Days</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900/50 p-8 rounded-[2.5rem] border border-slate-800">
          <TrendingUp className="w-8 h-8 text-emerald-400 mb-4" />
          <h4 className="text-slate-400 font-black uppercase text-[10px] tracking-widest mb-1">Top Frequency</h4>
          <p className="text-3xl font-black text-white italic capitalize">{stats[0]?.mood || 'Calibrating...'}</p>
        </div>
        <div className="bg-slate-900/50 p-8 rounded-[2.5rem] border border-slate-800">
          <BarChart3 className="w-8 h-8 text-indigo-400 mb-4" />
          <h4 className="text-slate-400 font-black uppercase text-[10px] tracking-widest mb-1">Total Broadcasts</h4>
          <p className="text-3xl font-black text-white italic">{history.length}</p>
        </div>
        <div className="bg-slate-900/50 p-8 rounded-[2.5rem] border border-slate-800">
          <BrainCircuit className="w-8 h-8 text-purple-400 mb-4" />
          <h4 className="text-slate-400 font-black uppercase text-[10px] tracking-widest mb-1">AI Affinity</h4>
          <p className="text-3xl font-black text-white italic">98.4%</p>
        </div>
      </div>

      <div className="bg-slate-900/30 p-10 rounded-[3rem] border border-slate-900">
        <h3 className="text-xl font-black uppercase italic mb-10 flex items-center gap-3">
          Mood Distribution
          <div className="h-px flex-1 bg-slate-800/50" />
        </h3>
        <div className="space-y-8">
          {stats.map((stat, i) => (
            <div key={stat.mood} className="space-y-3 animate-in fade-in slide-in-from-left-4" style={{ animationDelay: `${i * 100}ms` }}>
              <div className="flex justify-between items-end">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full bg-gradient-to-tr ${MOOD_CONFIG[stat.mood]?.color || 'from-slate-500 to-slate-700'}`} />
                  <span className="font-black text-slate-200 uppercase text-xs tracking-widest">{stat.mood}</span>
                </div>
                <span className="text-xs font-black text-slate-500 uppercase">{Math.round(stat.percentage)}%</span>
              </div>
              <div className="h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-900 p-0.5">
                <div 
                  className={`h-full rounded-full bg-gradient-to-r ${MOOD_CONFIG[stat.mood]?.color || 'from-slate-500 to-slate-700'} transition-all duration-1000 ease-out`}
                  style={{ width: `${stat.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
