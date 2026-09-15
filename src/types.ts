export type AppMode = 'all' | 'search' | 'website' | 'coding' | 'image';

export type FontTheme = 'aurora' | 'cosmic' | 'cyber' | 'fire';

export type ImageStylePreset =
  | 'midjourney-v6'
  | 'dall-e-3-hyperreal'
  | 'cosmic-celestial'
  | 'cyberpunk'
  | 'anime-makoto'
  | '3d-octane'
  | 'fantasy-digital-art'
  | 'cinematic-photograph';

export type ImageAspectRatio = '1:1' | '16:9' | '9:16' | '4:3' | '3:2' | '2:3';

export type ImageLightingPreset =
  | 'volumetric-godrays'
  | 'cinematic-neon'
  | 'golden-hour'
  | 'bioluminescent'
  | 'studio-softbox'
  | 'dark-astral';

export type ImageCameraPreset =
  | '85mm-f1.2'
  | 'wide-angle-cinematic'
  | 'macro-lens'
  | 'drone-aerial'
  | 'tilt-shift';

export interface GeneratedImageRecord {
  id: string;
  url: string;
  prompt: string;
  enhancedPrompt?: string;
  style: ImageStylePreset;
  aspectRatio: ImageAspectRatio;
  lighting?: ImageLightingPreset;
  camera?: ImageCameraPreset;
  negativePrompt?: string;
  timestamp: number;
}

export interface GroundingSource {
  title: string;
  url: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  sources?: GroundingSource[];
  webSearchQueries?: string[];
  imageUrl?: string;
  imageRecord?: GeneratedImageRecord;
  isStreaming?: boolean;
  websiteHtml?: string;
}

export interface PromptSuggestion {
  title: string;
  subtitle: string;
  prompt: string;
  mode: AppMode;
  icon: string;
}

export interface WebsiteProject {
  id: string;
  title: string;
  html: string;
  prompt: string;
  type: 'landing-page' | 'dashboard' | 'portfolio' | 'interactive-tool' | 'game' | 'ecommerce';
  theme: string;
  timestamp: number;
  history?: { timestamp: number; instruction: string }[];
}
