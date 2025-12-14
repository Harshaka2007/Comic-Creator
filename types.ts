export interface PanelData {
  id: number;
  description: string;
  dialogue: string;
  caption?: string;
  imageUrl?: string;
  isGenerating: boolean;
}

export interface ComicScript {
  title: string;
  panels: PanelData[];
}

export enum AppState {
  IDEA_INPUT = 'IDEA_INPUT',
  SCRIPT_REVIEW = 'SCRIPT_REVIEW',
  VISUALIZATION = 'VISUALIZATION'
}

export interface GenerationConfig {
  style: string;
  panelCount: number;
}
