import React, { useState } from 'react';
import { Loader2, Sparkles, BookOpen } from 'lucide-react';

interface StepIdeaProps {
  onGenerate: (prompt: string, style: string, count: number) => void;
  isLoading: boolean;
}

export const StepIdea: React.FC<StepIdeaProps> = ({ onGenerate, isLoading }) => {
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('American modern comic book style');
  const [count, setCount] = useState(4);

  const styles = [
    "American Modern Comic",
    "Japanese Manga (Black & White)",
    "Webtoon / Manhwa (Full Color)",
    "Franco-Belgian (Ligne Claire)",
    "Noir Detective (High Contrast)",
    "Cyberpunk / Synthwave Neon",
    "Studio Ghibli (Painterly)",
    "Pixar 3D Render Style",
    "Pixel Art (Retro Video Game)",
    "Watercolor Storybook",
    "Pop Art (Vintage 1950s)",
    "Dark Fantasy / Eldritch",
    "Claymation / Stop Motion",
    "Ukiyo-e Woodblock Print"
  ];

  return (
    <div className="max-w-2xl mx-auto w-full p-6 animate-in fade-in zoom-in duration-500">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center p-3 bg-purple-600 rounded-full mb-4 shadow-lg shadow-purple-900/50">
          <BookOpen className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-5xl font-comic text-white mb-2 tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
          InkFlow Creator
        </h1>
        <p className="text-slate-400 text-lg">Turn your wildest ideas into a visual comic strip in seconds.</p>
      </div>

      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 shadow-2xl">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2 uppercase tracking-wider">
              What's your story?
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., A robot detective discovers a flower growing in a cyberpunk junkyard..."
              className="w-full h-32 bg-slate-900/80 border border-slate-700 rounded-xl p-4 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none resize-none placeholder-slate-600 transition-all"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2 uppercase tracking-wider">
                Art Style
              </label>
              <select
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                className="w-full bg-slate-900/80 border border-slate-700 rounded-xl p-3 text-white focus:ring-2 focus:ring-purple-500 outline-none appearance-none"
              >
                {styles.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2 uppercase tracking-wider">
                Panel Count
              </label>
              <div className="flex items-center gap-4 bg-slate-900/80 border border-slate-700 rounded-xl p-3">
                <input
                  type="range"
                  min="3"
                  max="10"
                  value={count}
                  onChange={(e) => setCount(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
                <span className="text-white font-bold font-mono w-6">{count}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => prompt && onGenerate(prompt, style, count)}
            disabled={!prompt || isLoading}
            className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2
              ${!prompt || isLoading 
                ? 'bg-slate-700 text-slate-500 cursor-not-allowed' 
                : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-900/50'
              }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin" /> WRITING SCRIPT...
              </>
            ) : (
              <>
                <Sparkles /> GENERATE SCRIPT
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};