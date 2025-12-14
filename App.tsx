import React, { useState, useCallback } from 'react';
import { StepIdea } from './components/StepIdea';
import { StepScript } from './components/StepScript';
import { ComicCanvas } from './components/ComicCanvas';
import { AppState, PanelData, ComicScript } from './types';
import { generateComicScript, generatePanelImage } from './services/geminiService';

export default function App() {
  const [appState, setAppState] = useState<AppState>(AppState.IDEA_INPUT);
  const [isLoading, setIsLoading] = useState(false);
  const [script, setScript] = useState<ComicScript>({ title: '', panels: [] });
  const [styleContext, setStyleContext] = useState('');

  // Step 1: Generate Script
  const handleGenerateScript = async (prompt: string, style: string, count: number) => {
    setIsLoading(true);
    setStyleContext(style);
    try {
      const generatedScript = await generateComicScript(prompt, count);
      setScript(generatedScript);
      setAppState(AppState.SCRIPT_REVIEW);
    } catch (error) {
      alert("Failed to generate script. Please check your API key.");
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Update Script Manually
  const handleUpdatePanels = (panels: PanelData[]) => {
    setScript(prev => ({ ...prev, panels }));
  };

  // Step 3: Trigger Image Generation for all panels
  const handleConfirmScript = async () => {
    setAppState(AppState.VISUALIZATION);
    
    // Set all to generating first
    setScript(prev => ({
        ...prev,
        panels: prev.panels.map(p => ({ ...p, isGenerating: true }))
    }));

    // Process sequentially to avoid 429 Rate Limits
    const panelsToGenerate = script.panels;
    
    for (const panel of panelsToGenerate) {
        await generateImageForPanel(panel.id, panel.description);
        // Add a delay between requests (e.g., 5 seconds) to respect rate limits
        // This is crucial for avoiding RESOURCE_EXHAUSTED errors
        if (panel.id !== panelsToGenerate[panelsToGenerate.length - 1].id) {
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
    }
  };

  const generateImageForPanel = async (id: number, description: string) => {
    try {
        const imageUrl = await generatePanelImage(description, styleContext);
        setScript(prev => ({
            ...prev,
            panels: prev.panels.map(p => 
                p.id === id ? { ...p, imageUrl, isGenerating: false } : p
            )
        }));
    } catch (e) {
        console.error(`Failed to generate panel ${id}`, e);
        setScript(prev => ({
            ...prev,
            panels: prev.panels.map(p => 
                p.id === id ? { ...p, isGenerating: false } : p // Stop spinner on error
            )
        }));
    }
  };

  const handleRegeneratePanel = (id: number) => {
    const panel = script.panels.find(p => p.id === id);
    if (panel) {
        setScript(prev => ({
            ...prev,
            panels: prev.panels.map(p => p.id === id ? { ...p, isGenerating: true } : p)
        }));
        generateImageForPanel(id, panel.description);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-800 to-slate-950 flex flex-col items-center justify-center p-4 md:p-8">
      
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none">
         <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-purple-600/20 rounded-full blur-[100px]"></div>
         <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-600/20 rounded-full blur-[100px]"></div>
      </div>

      <div className="relative w-full z-10">
        {appState === AppState.IDEA_INPUT && (
            <StepIdea onGenerate={handleGenerateScript} isLoading={isLoading} />
        )}

        {appState === AppState.SCRIPT_REVIEW && (
            <StepScript 
                title={script.title}
                panels={script.panels} 
                onUpdatePanels={handleUpdatePanels}
                onConfirm={handleConfirmScript}
                onBack={() => setAppState(AppState.IDEA_INPUT)}
            />
        )}

        {appState === AppState.VISUALIZATION && (
            <ComicCanvas 
                panels={script.panels}
                title={script.title}
                onRegeneratePanel={handleRegeneratePanel}
                onEditScript={() => setAppState(AppState.SCRIPT_REVIEW)}
            />
        )}
      </div>
    </div>
  );
}