import React, { useState } from 'react';
import {
  Sparkles,
  Download,
  X,
  Wand2,
  Loader2,
  Maximize2,
  Copy,
  Check,
  RefreshCw,
  Sliders,
  Camera,
  Sun,
  ShieldAlert,
  Layers,
  Send,
  Eye,
  ExternalLink,
} from 'lucide-react';
import {
  GeneratedImageRecord,
  ImageAspectRatio,
  ImageCameraPreset,
  ImageLightingPreset,
  ImageStylePreset,
} from '../types';

interface AdvancedImageStudioProps {
  isOpen: boolean;
  onClose: () => void;
  onSendToChat?: (imageRecord: GeneratedImageRecord) => void;
  initialPrompt?: string;
}

export const AdvancedImageStudio: React.FC<AdvancedImageStudioProps> = ({
  isOpen,
  onClose,
  onSendToChat,
  initialPrompt = '',
}) => {
  const [prompt, setPrompt] = useState(initialPrompt || '');
  const [style, setStyle] = useState<ImageStylePreset>('midjourney-v6');
  const [aspectRatio, setAspectRatio] = useState<ImageAspectRatio>('1:1');
  const [lighting, setLighting] = useState<ImageLightingPreset>('volumetric-godrays');
  const [camera, setCamera] = useState<ImageCameraPreset>('85mm-f1.2');
  const [negativePrompt, setNegativePrompt] = useState(
    'blurry, distorted, bad anatomy, deformed hands, extra limbs, low resolution, watermark'
  );
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEnhancingPrompt, setIsEnhancingPrompt] = useState(false);
  const [currentImage, setCurrentImage] = useState<GeneratedImageRecord | null>(null);
  const [history, setHistory] = useState<GeneratedImageRecord[]>([]);
  const [fullscreenImg, setFullscreenImg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  if (!isOpen) return null;

  const styleOptions: { id: ImageStylePreset; label: string; desc: string; badge: string }[] = [
    {
      id: 'midjourney-v6',
      label: 'Midjourney v6',
      desc: 'Masterwork digital art, ray tracing, octane 8k',
      badge: 'Midjourney',
    },
    {
      id: 'dall-e-3-hyperreal',
      label: 'DALL-E 3 Photographic',
      desc: 'Authentic photorealism, optical depth, 8k',
      badge: 'DALL-E 3',
    },
    {
      id: 'cosmic-celestial',
      label: 'Celestial Astral',
      desc: 'Deep cosmic blues, stardust & glowing nebulae',
      badge: 'Senux Core',
    },
    {
      id: 'cyberpunk',
      label: 'Cyberpunk Neon',
      desc: 'Futuristic megacity, cyan & violet lighting',
      badge: 'Sci-Fi',
    },
    {
      id: 'anime-makoto',
      label: 'Anime Cinematic',
      desc: 'Makoto Shinkai starlit skies & vibrant artwork',
      badge: 'Anime',
    },
    {
      id: '3d-octane',
      label: '3D Octane Studio',
      desc: 'Blender 3D tactile materials & subsurface scattering',
      badge: '3D Render',
    },
    {
      id: 'fantasy-digital-art',
      label: 'Epic High Fantasy',
      desc: 'Mystical concept art, painterly grandeur',
      badge: 'Fantasy',
    },
    {
      id: 'cinematic-photograph',
      label: '35mm Film Still',
      desc: 'ARRI Alexa LF camera look, dramatic shadows',
      badge: 'Cinema',
    },
  ];

  const promptBuilderTokens = [
    '8K resolution',
    'Volumetric lighting',
    'Unreal Engine 5',
    'Subsurface scattering',
    'Cinematic color grading',
    'Intricate micro-details',
    'Ray-traced reflections',
    'Photorealistic textures',
    'Ethereal glowing starlight',
    'Chiaroscuro contrast',
  ];

  const handleAppendToken = (token: string) => {
    setPrompt((prev) => {
      const trimmed = prev.trim();
      if (!trimmed) return token;
      if (trimmed.toLowerCase().includes(token.toLowerCase())) return trimmed;
      return `${trimmed}, ${token}`;
    });
  };

  const handleMagicEnhancePrompt = async () => {
    if (!prompt.trim() || isEnhancingPrompt) return;
    setIsEnhancingPrompt(true);
    setError(null);

    try {
      const res = await fetch('/api/enhance-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: prompt.trim(), style }),
      });
      const data = await res.json();
      if (data.enhancedPrompt) {
        setPrompt(data.enhancedPrompt);
      }
      if (data.negativePrompt) {
        setNegativePrompt(data.negativePrompt);
      }
    } catch (err) {
      console.warn('Enhance prompt failed:', err);
    } finally {
      setIsEnhancingPrompt(false);
    }
  };

  const handleGenerate = async (customSeed?: number) => {
    if (!prompt.trim() || isGenerating) return;

    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.trim(),
          aspectRatio,
          style,
          lighting,
          camera,
          negativePrompt: showAdvanced ? negativePrompt : undefined,
          seed: customSeed,
        }),
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error || 'Failed to generate artwork');
      }

      const newRecord: GeneratedImageRecord = {
        id: `img-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        url: data.imageUrl,
        prompt: prompt.trim(),
        enhancedPrompt: data.enhancedPrompt,
        style,
        aspectRatio,
        lighting,
        camera,
        negativePrompt,
        timestamp: Date.now(),
      };

      setCurrentImage(newRecord);
      setHistory((prev) => [newRecord, ...prev]);
    } catch (err: any) {
      setError(err?.message || 'Failed to generate image. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyPrompt = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  return (
    <div
      id="senux-advanced-image-studio"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-950/85 backdrop-blur-xl animate-fade-in"
    >
      <div className="relative w-full max-w-6xl h-[92vh] bg-slate-900/95 border border-cyan-500/40 shadow-[0_0_60px_rgba(6,182,212,0.3)] rounded-2xl overflow-hidden flex flex-col">
        {/* Studio Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-cyan-900/40 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-400 via-blue-600 to-indigo-600 shadow-[0_0_18px_#06b6d4] text-white">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-100 to-indigo-300">
                  Senux AI Image Studio
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-700/60 text-cyan-300 font-bold uppercase tracking-wider">
                  DALL-E & Midjourney Grade
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                High-fidelity textual prompt rendering, optical controls, styles & prompt enhancement
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors border border-slate-700/60"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Studio Content Grid */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12">
          {/* Left Column: Prompt Crafting & Controls (7 Cols) */}
          <div className="lg:col-span-7 p-4 sm:p-6 overflow-y-auto space-y-5 border-r border-cyan-900/30">
            {/* Prompt Input & Magic AI Enhance */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> Text Description / Prompt
                </label>
                <button
                  type="button"
                  onClick={handleMagicEnhancePrompt}
                  disabled={!prompt.trim() || isEnhancingPrompt}
                  className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg bg-gradient-to-r from-indigo-500/20 to-purple-500/20 hover:from-indigo-500/30 hover:to-purple-500/30 border border-indigo-400/40 text-indigo-300 font-medium transition-all disabled:opacity-40"
                  title="Use Gemini AI to elevate prompt to Midjourney v6 photorealistic grade"
                >
                  {isEnhancingPrompt ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Wand2 className="w-3.5 h-3.5 text-indigo-400" />
                  )}
                  <span>Magic Enhance Prompt</span>
                </button>
              </div>

              <div className="relative">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe whatever you envision in high fidelity (e.g. 'A celestial astronaut drifting through a nebula of glowing stardust and cyan crystals, cinematic lighting')..."
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-950 border border-cyan-500/40 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-sm resize-none shadow-inner"
                />
              </div>

              {/* Prompt Token Suggestions */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[11px] font-semibold text-slate-400 mr-1">Add Detail:</span>
                {promptBuilderTokens.map((tok, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleAppendToken(tok)}
                    className="text-[11px] px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 text-slate-300 hover:text-cyan-300 hover:border-cyan-500/40 transition-colors"
                  >
                    +{tok}
                  </button>
                ))}
              </div>
            </div>

            {/* Visual Style Selection */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-cyan-400" /> Aesthetic & Rendering Style
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {styleOptions.map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setStyle(st.id)}
                    className={`p-2.5 rounded-xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                      style === st.id
                        ? 'bg-gradient-to-br from-cyan-950/80 to-blue-950/80 border-cyan-400 text-white shadow-[0_0_15px_rgba(6,182,212,0.3)] ring-1 ring-cyan-400'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-cyan-300 font-bold uppercase">
                        {st.badge}
                      </span>
                      <h4 className="text-xs font-bold mt-1.5 text-slate-200">{st.label}</h4>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1 line-clamp-1">{st.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Aspect Ratio Options */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Aspect Ratio
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {(
                  [
                    { id: '1:1', label: '1:1 Square', icon: '■' },
                    { id: '16:9', label: '16:9 Cinema', icon: '▬' },
                    { id: '9:16', label: '9:16 Mobile', icon: '▮' },
                    { id: '4:3', label: '4:3 Classic', icon: '▭' },
                    { id: '3:2', label: '3:2 Photo', icon: '▭' },
                    { id: '2:3', label: '2:3 Portrait', icon: '▯' },
                  ] as const
                ).map((ratio) => (
                  <button
                    key={ratio.id}
                    type="button"
                    onClick={() => setAspectRatio(ratio.id)}
                    className={`px-2.5 py-2 rounded-xl text-xs font-medium border text-center transition-all ${
                      aspectRatio === ratio.id
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.35)]'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="text-sm opacity-60 mb-0.5">{ratio.icon}</div>
                    <div className="text-[11px] font-bold">{ratio.id}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Advanced Optical Controls Accordion */}
            <div className="border border-cyan-900/30 rounded-xl overflow-hidden bg-slate-950/50">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-bold text-slate-300 hover:text-cyan-300 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Cinematography & Optical Parameters (Lighting, Camera, Negative Filter)</span>
                </div>
                <span className="text-cyan-400 font-mono text-sm">{showAdvanced ? '−' : '+'}</span>
              </button>

              {showAdvanced && (
                <div className="p-4 border-t border-cyan-900/30 space-y-4 bg-slate-950/80">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Lighting Preset */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                        <Sun className="w-3 h-3 text-amber-400" /> Volumetric Lighting
                      </label>
                      <select
                        value={lighting}
                        onChange={(e) => setLighting(e.target.value as ImageLightingPreset)}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
                      >
                        <option value="volumetric-godrays">Volumetric God Rays & Atmospheric Beams</option>
                        <option value="cinematic-neon">Cinematic Neon Rim Light & Cyber Haze</option>
                        <option value="golden-hour">Warm Golden Hour Sunlight & Soft Amber</option>
                        <option value="bioluminescent">Bioluminescent Spores & Azure Glow</option>
                        <option value="studio-softbox">Studio Softbox & Balanced Fill</option>
                        <option value="dark-astral">Deep Astral Starlight & Specular Shimmer</option>
                      </select>
                    </div>

                    {/* Camera Optics */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                        <Camera className="w-3 h-3 text-cyan-400" /> Camera Lens & Focal Length
                      </label>
                      <select
                        value={camera}
                        onChange={(e) => setCamera(e.target.value as ImageCameraPreset)}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
                      >
                        <option value="85mm-f1.2">85mm f/1.2 Portrait Lens (Creamy Bokeh)</option>
                        <option value="wide-angle-cinematic">24mm Anamorphic Wide (Epic Scale)</option>
                        <option value="macro-lens">100mm Extreme Macro (Intricate Detail)</option>
                        <option value="drone-aerial">Drone Aerial Bird's Eye (Grand Vista)</option>
                        <option value="tilt-shift">Tilt-Shift (Miniature Selective Focus)</option>
                      </select>
                    </div>
                  </div>

                  {/* Negative Prompt */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                      <ShieldAlert className="w-3 h-3 text-rose-400" /> Negative Prompt (Exclude Attributes)
                    </label>
                    <input
                      type="text"
                      value={negativePrompt}
                      onChange={(e) => setNegativePrompt(e.target.value)}
                      placeholder="e.g. blurry, low resolution, bad anatomy, deformed hands, extra limbs"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Action Bar: Generate Button & Status */}
            <div className="pt-2">
              {error && (
                <div className="p-3 mb-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs">
                  {error}
                </div>
              )}

              <button
                type="button"
                onClick={() => handleGenerate()}
                disabled={!prompt.trim() || isGenerating}
                className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-sm shadow-[0_0_25px_rgba(6,182,212,0.5)] transition-all flex items-center justify-center gap-2.5 disabled:opacity-40 disabled:cursor-not-allowed group"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Manifesting High-Fidelity Artwork...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 text-cyan-200 group-hover:scale-110 transition-transform" />
                    <span>Generate Artwork</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right Column: Output Showcase & Gallery (5 Cols) */}
          <div className="lg:col-span-5 p-4 sm:p-6 bg-slate-950/60 flex flex-col justify-between overflow-y-auto space-y-4">
            {/* Primary Display Card */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Artwork Canvas
                </span>
                {currentImage && (
                  <div className="flex items-center gap-1 text-xs">
                    <button
                      onClick={() => setFullscreenImg(currentImage.url)}
                      title="Fullscreen Zoom"
                      className="p-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                    </button>
                    <a
                      href={currentImage.url}
                      download={`senux-${currentImage.id}.png`}
                      target="_blank"
                      rel="noreferrer"
                      title="Download Image"
                      className="p-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-cyan-300 border border-slate-800"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}
              </div>

              <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-slate-950 border border-cyan-500/30 flex items-center justify-center shadow-2xl">
                {isGenerating ? (
                  <div className="flex flex-col items-center justify-center p-6 text-center space-y-3">
                    <div className="relative">
                      <div className="w-16 h-16 rounded-full border-4 border-cyan-500/30 border-t-cyan-400 animate-spin" />
                      <Sparkles className="w-6 h-6 text-cyan-300 absolute inset-0 m-auto animate-pulse" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-cyan-200">Rendering Neural Artwork</h4>
                      <p className="text-xs text-slate-400 mt-1 max-w-xs">
                        Synthesizing rays, textures, and depth in {style}...
                      </p>
                    </div>
                  </div>
                ) : currentImage ? (
                  <div className="relative group w-full h-full">
                    <img
                      src={currentImage.url}
                      alt={currentImage.prompt}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />

                    {/* Overlay Action Bar */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-between">
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => setFullscreenImg(currentImage.url)}
                          className="p-2 rounded-xl bg-slate-900/90 text-white hover:bg-cyan-500 hover:text-slate-950 transition-colors shadow-lg"
                        >
                          <Maximize2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="space-y-2">
                        <p className="text-xs text-slate-200 line-clamp-2 bg-slate-900/80 p-2 rounded-lg backdrop-blur-md border border-slate-800">
                          {currentImage.prompt}
                        </p>
                        <div className="flex items-center gap-2">
                          {onSendToChat && (
                            <button
                              onClick={() => {
                                onSendToChat(currentImage);
                                onClose();
                              }}
                              className="flex-1 py-1.5 px-3 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg transition-colors"
                            >
                              <Send className="w-3.5 h-3.5" /> Send to Chat
                            </button>
                          )}
                          <button
                            onClick={() => handleGenerate(Math.floor(Math.random() * 9999999))}
                            title="Generate Variation"
                            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-cyan-300 border border-slate-800"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleCopyPrompt(currentImage.prompt)}
                            title="Copy Prompt"
                            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-cyan-300 border border-slate-800"
                          >
                            {copiedPrompt ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-6 text-center text-slate-500 space-y-2">
                    <Wand2 className="w-10 h-10 stroke-1 text-slate-600" />
                    <p className="text-xs">Your generated celestial artwork will render here</p>
                  </div>
                )}
              </div>
            </div>

            {/* Gallery Strip of Current Session */}
            {history.length > 0 && (
              <div className="pt-2 border-t border-cyan-900/30">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                  Session History ({history.length})
                </span>
                <div className="grid grid-cols-4 gap-2">
                  {history.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setCurrentImage(item)}
                      className={`relative aspect-square rounded-xl overflow-hidden border transition-all ${
                        currentImage?.id === item.id
                          ? 'border-cyan-400 ring-2 ring-cyan-400/50 scale-105'
                          : 'border-slate-800 hover:border-slate-600 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={item.url}
                        alt="Thumbnail"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      {fullscreenImg && (
        <div
          className="fixed inset-0 z-60 bg-black/95 backdrop-blur-2xl flex items-center justify-center p-4"
          onClick={() => setFullscreenImg(null)}
        >
          <div className="relative max-w-5xl max-h-[90vh] flex flex-col items-center">
            <button
              onClick={() => setFullscreenImg(null)}
              className="absolute -top-10 right-0 p-2 text-slate-400 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={fullscreenImg}
              alt="Fullscreen Artwork"
              referrerPolicy="no-referrer"
              className="max-h-[85vh] w-auto object-contain rounded-2xl shadow-2xl border border-cyan-500/30"
            />
          </div>
        </div>
      )}
    </div>
  );
};
