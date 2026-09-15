import React, { useState } from 'react';
import { Sparkles, Download, X, Image as ImageIcon, Wand2, Loader2, Maximize2 } from 'lucide-react';

interface ImageGenModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGeneratedImage?: (prompt: string, imageUrl: string) => void;
}

export const ImageGenModal: React.FC<ImageGenModalProps> = ({
  isOpen,
  onClose,
  onGeneratedImage,
}) => {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<'1:1' | '16:9' | '9:16' | '4:3'>('1:1');
  const [style, setStyle] = useState('cosmic-celestial');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImg, setGeneratedImg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
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
        }),
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error || 'Failed to generate image');
      }

      setGeneratedImg(data.imageUrl);
      if (onGeneratedImage) {
        onGeneratedImage(prompt.trim(), data.imageUrl);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to generate image. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const samplePrompts = [
    'Deep cosmic blue stellar nebula with shimmering star clusters and crystal asteroids',
    'Futuristic quantum AI core glowing with radiant azure and violet laser rings',
    'A cybernetic dragon flying through a starry blue galaxy in 8k cinematic lighting',
    'Bioluminescent enchanted forest under a starlit midnight sky with blue glowing flora',
  ];

  return (
    <div
      id="senux-image-gen-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md"
    >
      <div className="relative w-full max-w-2xl bg-slate-900 border border-cyan-500/40 shadow-[0_0_50px_rgba(6,182,212,0.3)] rounded-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-cyan-900/40 bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 shadow-[0_0_15px_#06b6d4] text-white">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base md:text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-200 to-purple-300">
                Senux Cosmic Image Studio
              </h2>
              <p className="text-xs text-slate-400">Generate high-fidelity AI artwork & celestial visuals</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          <form onSubmit={handleGenerate} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-cyan-400 mb-2">
                Artwork Prompt
              </label>
              <div className="relative">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe the image you want SenuxGPT to generate in celestial detail..."
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-950 border border-cyan-500/30 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-sm resize-none"
                />
              </div>
            </div>

            {/* Prompt presets */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                <Wand2 className="w-3 h-3 text-cyan-400" /> Suggested Inspirations:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {samplePrompts.map((sp, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setPrompt(sp)}
                    className="text-xs px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700/60 text-slate-300 hover:text-cyan-300 hover:border-cyan-500/40 transition-colors text-left truncate max-w-full"
                  >
                    {sp}
                  </button>
                ))}
              </div>
            </div>

            {/* Controls: Aspect Ratio & Style */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Aspect Ratio</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {(['1:1', '16:9', '9:16', '4:3'] as const).map((ratio) => (
                    <button
                      key={ratio}
                      type="button"
                      onClick={() => setAspectRatio(ratio)}
                      className={`px-2 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                        aspectRatio === ratio
                          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {ratio}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Style</label>
                <select
                  value={style}
                  onChange={(e) => setStyle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
                >
                  <option value="cosmic-celestial">Deep Celestial & Starry</option>
                  <option value="cyberpunk-neon">Cyberpunk & Neon Blue</option>
                  <option value="photorealistic">Cinematic Photorealism</option>
                  <option value="anime-dreamy">Dreamy Anime Artwork</option>
                  <option value="3d-render">Octane 3D Glass & Chrome</option>
                </select>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={!prompt.trim() || isGenerating}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 text-white font-semibold text-sm shadow-[0_0_20px_rgba(6,182,212,0.5)] hover:shadow-[0_0_30px_rgba(6,182,212,0.8)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating Celestial Artwork...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-cyan-200" />
                  Generate Image
                </>
              )}
            </button>
          </form>

          {/* Generated Result Preview */}
          {generatedImg && (
            <div className="pt-4 border-t border-cyan-900/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-cyan-300 flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5" /> Generated Result
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setFullscreenImage(generatedImg)}
                    className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white text-xs flex items-center gap-1"
                  >
                    <Maximize2 className="w-3.5 h-3.5" /> Expand
                  </button>
                  <a
                    href={generatedImg}
                    download="senux-generated-artwork.png"
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs flex items-center gap-1 font-medium transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" /> Download
                  </a>
                </div>
              </div>

              <div className="relative rounded-xl overflow-hidden border border-cyan-500/30 bg-slate-950 flex items-center justify-center group">
                <img
                  src={generatedImg}
                  alt={prompt}
                  referrerPolicy="no-referrer"
                  className="max-h-[360px] w-auto object-contain rounded-lg"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Fullscreen Lightbox */}
      {fullscreenImage && (
        <div
          className="fixed inset-0 z-60 bg-black/95 flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setFullscreenImage(null)}
        >
          <img
            src={fullscreenImage}
            alt="Fullscreen artwork"
            referrerPolicy="no-referrer"
            className="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
          />
          <button
            onClick={() => setFullscreenImage(null)}
            className="absolute top-6 right-6 p-2 rounded-full bg-slate-800/80 text-white hover:bg-slate-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      )}
    </div>
  );
};
