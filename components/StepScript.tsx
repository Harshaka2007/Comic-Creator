import React, { useState } from 'react';
import { PanelData } from '../types';
import { ArrowRight, GripVertical, Languages, Loader2, Check } from 'lucide-react';
import { translateScript } from '../services/geminiService';

interface StepScriptProps {
  title: string;
  panels: PanelData[];
  onUpdatePanels: (panels: PanelData[]) => void;
  onConfirm: () => void;
  onBack: () => void;
}

export const StepScript: React.FC<StepScriptProps> = ({ title, panels, onUpdatePanels, onConfirm, onBack }) => {
  const [isTranslating, setIsTranslating] = useState(false);
  const [showTranslateMenu, setShowTranslateMenu] = useState(false);

  const handleUpdate = (id: number, field: keyof PanelData, value: string) => {
    onUpdatePanels(panels.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const handleTranslate = async (language: string) => {
    setShowTranslateMenu(false);
    setIsTranslating(true);
    try {
      const updatedPanels = await translateScript(panels, language);
      onUpdatePanels(updatedPanels);
    } catch (error) {
      alert(`Failed to translate to ${language}. Please try again.`);
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto w-full p-4 animate-in slide-in-from-right-10 duration-500">
      <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
        <button onClick={onBack} className="text-slate-400 hover:text-white transition-colors self-start md:self-auto">
          &larr; Back to Idea
        </button>
        
        <h2 className="text-2xl font-comic text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 tracking-wide">
          Review Script: {title}
        </h2>

        {/* Translation Menu */}
        <div className="relative self-end md:self-auto">
          <button 
            onClick={() => setShowTranslateMenu(!showTranslateMenu)}
            disabled={isTranslating}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-2 rounded-lg font-semibold text-sm transition-colors border border-slate-700"
          >
            {isTranslating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Languages className="w-4 h-4" />}
            Translate
          </button>

          {showTranslateMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowTranslateMenu(false)}></div>
              <div className="absolute right-0 top-full mt-2 w-40 bg-slate-800 border border-slate-700 rounded-xl shadow-xl p-1 z-20">
                <button 
                  onClick={() => handleTranslate('English')}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                >
                  English
                </button>
                <button 
                  onClick={() => handleTranslate('Sinhala')}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                >
                  Sinhala
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="space-y-4 mb-8">
        {panels.map((panel, index) => (
          <div key={panel.id} className="bg-slate-800 border border-slate-700 rounded-xl p-4 flex gap-4 group hover:border-purple-500/50 transition-all">
            <div className="flex flex-col items-center justify-start pt-2 gap-2 text-slate-500">
               <span className="font-comic text-2xl text-slate-600">#{index + 1}</span>
               <GripVertical className="w-5 h-5 cursor-grab opacity-0 group-hover:opacity-50" />
            </div>
            
            <div className="flex-1 space-y-3">
              <div>
                <label className="text-xs uppercase font-bold text-slate-400 mb-1 block">Visual Description (Prompt)</label>
                <textarea
                  value={panel.description}
                  onChange={(e) => handleUpdate(panel.id, 'description', e.target.value)}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-3 text-sm text-white focus:ring-1 focus:ring-purple-500 outline-none resize-none h-20"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs uppercase font-bold text-slate-400 mb-1 block">Dialogue</label>
                  <input
                    type="text"
                    value={panel.dialogue}
                    onChange={(e) => handleUpdate(panel.id, 'dialogue', e.target.value)}
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-2 text-sm text-white focus:ring-1 focus:ring-purple-500 outline-none"
                    placeholder="Character speech..."
                  />
                </div>
                <div>
                  <label className="text-xs uppercase font-bold text-slate-400 mb-1 block">Caption / SFX</label>
                  <input
                    type="text"
                    value={panel.caption || ''}
                    onChange={(e) => handleUpdate(panel.id, 'caption', e.target.value)}
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-2 text-sm text-white focus:ring-1 focus:ring-purple-500 outline-none"
                    placeholder="Meanwile..."
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end pt-4 border-t border-slate-800">
        <button
          onClick={onConfirm}
          className="bg-purple-600 hover:bg-purple-500 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-purple-900/30 flex items-center gap-2 transition-all transform hover:scale-105"
        >
          GENERATE ARTWORK <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};