
import React from 'react';
import { Check, Sparkles, Zap, ShieldCheck, Music2, Brain } from 'lucide-react';

interface PricingProps {
  currentSub: 'free' | 'pro';
  onUpgrade: () => void;
}

export const Pricing: React.FC<PricingProps> = ({ currentSub, onUpgrade }) => {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center mb-16">
        <h2 className="text-4xl font-black uppercase tracking-tighter italic mb-4">Elevate Your Frequency</h2>
        <p className="text-slate-500 max-w-xl mx-auto font-medium">Unlock enterprise-grade AI music curation and advanced emotional insights with MoodTunes Pro.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
        {/* Free Tier */}
        <div className="bg-slate-950/50 border border-slate-900 p-10 rounded-[3rem] relative overflow-hidden group">
          <div className="relative z-10">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Standard</h3>
            <div className="flex items-baseline gap-1 mb-8">
              <span className="text-5xl font-black text-white italic">$0</span>
              <span className="text-slate-600 font-bold">/mo</span>
            </div>
            
            <ul className="space-y-4 mb-10">
              {[
                '30 AI-Generated Tracks per mood',
                'Basic Sentiment Analysis',
                'Community Playlist Support',
                'Web & Mobile Player'
              ].map((feature, i) => (
                <li key={i} className="flex items-center gap-3 text-sm text-slate-400 font-medium">
                  <Check className="w-4 h-4 text-slate-700" />
                  {feature}
                </li>
              ))}
            </ul>

            <button disabled className="w-full py-4 rounded-2xl border border-slate-800 text-slate-600 font-black uppercase text-xs tracking-widest cursor-default">
              Current Plan
            </button>
          </div>
        </div>

        {/* Pro Tier */}
        <div className="bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border-2 border-indigo-500/30 p-10 rounded-[3rem] relative overflow-hidden group shadow-2xl shadow-indigo-500/10">
          <div className="absolute top-0 right-0 p-4">
             <div className="bg-indigo-600 text-white text-[9px] font-black uppercase px-3 py-1 rounded-full shadow-lg">Most Popular</div>
          </div>
          
          <div className="relative z-10">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-indigo-400 mb-2">Pro Access</h3>
            <div className="flex items-baseline gap-1 mb-8">
              <span className="text-5xl font-black text-white italic">$9.99</span>
              <span className="text-slate-400 font-bold">/mo</span>
            </div>
            
            <ul className="space-y-4 mb-10">
              {[
                { icon: <Sparkles className="w-4 h-4" />, text: 'Infinite AI Track Generation' },
                { icon: <Brain className="w-4 h-4" />, text: 'Deep Emotional Intelligence Data' },
                { icon: <Music2 className="w-4 h-4" />, text: 'High Fidelity Lossless Mapping' },
                { icon: <Zap className="w-4 h-4" />, text: 'Zero Latency Sync' },
                { icon: <ShieldCheck className="w-4 h-4" />, text: 'Priority Feature Access' }
              ].map((feature, i) => (
                <li key={i} className="flex items-center gap-3 text-sm text-slate-200 font-bold">
                  <div className="text-indigo-400">{feature.icon}</div>
                  {feature.text}
                </li>
              ))}
            </ul>

            <button 
              onClick={onUpgrade}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-indigo-600/30 transition-all hover:scale-105 active:scale-95"
            >
              {currentSub === 'pro' ? 'Active Pro' : 'Upgrade to Pro'}
            </button>
          </div>

          <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-indigo-500/10 blur-[100px] rounded-full group-hover:bg-indigo-500/20 transition-all duration-1000" />
        </div>
      </div>
    </div>
  );
};
