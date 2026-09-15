import React, { useState, useEffect, useRef } from 'react';
import {
  Monitor,
  Tablet,
  Smartphone,
  Maximize2,
  Minimize2,
  Download,
  Copy,
  Check,
  RefreshCw,
  X,
  Code,
  Eye,
  Sparkles,
  Send,
  Loader2,
  ExternalLink,
  Wand2,
  Terminal,
  Layers,
  ChevronRight,
  Sliders,
  Play,
} from 'lucide-react';

interface WebsiteCreatorAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  initialCode?: string;
  initialPrompt?: string;
  onSendToChat?: (htmlCode: string, title: string) => void;
}

export const WebsiteCreatorAssistant: React.FC<WebsiteCreatorAssistantProps> = ({
  isOpen,
  onClose,
  initialCode,
  initialPrompt = '',
  onSendToChat,
}) => {
  // Website code & metadata state
  const [code, setCode] = useState<string>(
    initialCode ||
      `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Celestial Quantum Labs</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700&display=swap" rel="stylesheet" />
  <style>
    body { font-family: 'Space Grotesk', sans-serif; }
    .glow-cyan { box-shadow: 0 0 25px rgba(6, 182, 212, 0.4); }
  </style>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen flex flex-col justify-between selection:bg-cyan-500 selection:text-black">
  <nav class="border-b border-cyan-900/50 px-6 py-4 flex items-center justify-between backdrop-blur-md bg-slate-950/80 sticky top-0 z-50">
    <div class="flex items-center gap-2">
      <div class="w-8 h-8 rounded-lg bg-cyan-500 flex items-center justify-center text-slate-950 font-black shadow-[0_0_15px_#06b6d4]">✦</div>
      <span class="font-bold tracking-tight text-lg text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-400">Senux Web Studio</span>
    </div>
    <button onclick="toggleDemo()" class="px-4 py-2 text-xs font-bold rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-all glow-cyan">
      Interactive Demo
    </button>
  </nav>

  <main class="max-w-4xl mx-auto px-6 py-16 text-center space-y-6">
    <div class="inline-block px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-800 text-cyan-300 text-xs font-semibold tracking-wider uppercase">
      Next-Gen Web Architecture
    </div>
    <h1 class="text-4xl sm:text-6xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400">
      Build Functional Websites with Senux AI
    </h1>
    <p class="text-slate-400 max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
      Describe any web application, dashboard, or interactive game. The Website Creation Assistant will generate complete HTML, CSS, and functional JavaScript instantly.
    </p>

    <div class="pt-6 flex flex-wrap items-center justify-center gap-4">
      <button onclick="playPulse()" id="pulseBtn" class="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)]">
        Trigger Sound & Wave FX
      </button>
      <button onclick="openModal()" class="px-6 py-3 rounded-xl bg-slate-900 border border-cyan-800/60 hover:border-cyan-400 text-slate-200 text-sm font-semibold transition-all">
        Open Interactive Modal
      </button>
    </div>

    <!-- Live Counter State Demo -->
    <div class="mt-12 p-6 rounded-2xl bg-slate-900/60 border border-cyan-900/50 max-w-md mx-auto text-center space-y-4">
      <h3 class="text-xs uppercase tracking-widest text-cyan-400 font-bold">Live State Counter</h3>
      <div id="counter" class="text-4xl font-black text-cyan-300">0</div>
      <div class="flex justify-center gap-2">
        <button onclick="changeCounter(-1)" class="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 text-sm">−</button>
        <button onclick="changeCounter(1)" class="px-3 py-1.5 rounded-lg bg-cyan-500 text-slate-950 font-bold hover:bg-cyan-400 text-sm">+</button>
        <button onclick="resetCounter()" class="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white text-xs">Reset</button>
      </div>
    </div>
  </main>

  <footer class="border-t border-slate-900 py-6 text-center text-xs text-slate-600">
    Generated with SenuxGPT • Full Stack HTML, CSS & JavaScript
  </footer>

  <script>
    let count = 0;
    function changeCounter(delta) {
      count += delta;
      document.getElementById('counter').innerText = count;
    }
    function resetCounter() {
      count = 0;
      document.getElementById('counter').innerText = 0;
    }
    function toggleDemo() {
      alert('Senux Web Studio is fully interactive!');
    }
    function playPulse() {
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      } catch (e) {}
      document.getElementById('pulseBtn').classList.add('scale-105');
      setTimeout(() => document.getElementById('pulseBtn').classList.remove('scale-105'), 200);
    }
  </script>
</body>
</html>`
  );

  const [activeTab, setActiveTab] = useState<'preview' | 'code' | 'assistant'>('preview');
  const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);

  // Generation & Refinement state
  const [prompt, setPrompt] = useState(initialPrompt);
  const [websiteType, setWebsiteType] = useState<
    'landing-page' | 'dashboard' | 'portfolio' | 'interactive-tool' | 'game' | 'ecommerce'
  >('landing-page');
  const [websiteTheme, setWebsiteTheme] = useState('cosmic-blue');
  const [isGenerating, setIsGenerating] = useState(false);
  const [refinementInstruction, setRefinementInstruction] = useState('');
  const [historyInstructions, setHistoryInstructions] = useState<string[]>([]);
  const [suggestedSteps, setSuggestedSteps] = useState<string[]>([
    'Add dark/light theme switch toggle',
    'Add animated modal popup with contact form',
    'Add interactive sound effects on button clicks with Web Audio API',
    'Enhance responsive mobile drawer navigation',
  ]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialCode) {
      setCode(initialCode);
    }
  }, [initialCode]);

  if (!isOpen) return null;

  // Scaffold Presets
  const scaffoldTemplates = [
    {
      id: 'landing-page',
      title: '🚀 SaaS Landing Page',
      prompt: 'Build a sleek, high-converting SaaS landing page for an AI developer platform with hero section, feature cards, pricing tiers, testimonial sliders, and an interactive FAQ accordion with smooth animations',
    },
    {
      id: 'dashboard',
      title: '📊 Modern Analytics Dashboard',
      prompt: 'Build a dark-mode celestial crypto & analytics dashboard with metric statistics cards, filterable transactions table, interactive SVG charts, notification badge, and date range toggle',
    },
    {
      id: 'game',
      title: '🕹️ Playable Arcade Game',
      prompt: 'Build a retro-futuristic playable Canvas arcade space game with keyboard controls (Arrow keys/Space), score counters, high scores, particle explosion effects, and synthesizer audio beeps',
    },
    {
      id: 'interactive-tool',
      title: '🧮 Smart Productivity Tool',
      prompt: 'Build an interactive Pomodoro timer & task organizer with audio alerts, customizable work/break intervals, tag filters, completion statistics, and progress ring animation',
    },
    {
      id: 'portfolio',
      title: '💼 Creative Portfolio',
      prompt: 'Build an ultra-modern creative developer portfolio with interactive project cards, filter by tech stack, interactive skill radar, and a working contact form with validation',
    },
    {
      id: 'ecommerce',
      title: '🛍️ Modern E-Commerce Store',
      prompt: 'Build a futuristic gadget storefront with interactive product cards, price filters, search bar, sliding shopping cart drawer with checkout calculation, and discount coupon code applier',
    },
  ];

  // Request new website generation or refinement
  const handleGenerateWebsite = async (customPrompt?: string, isRefine: boolean = false) => {
    const textToRun = isRefine ? refinementInstruction : customPrompt || prompt;
    if (!textToRun.trim() || isGenerating) return;

    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch('/api/generate-website', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: isRefine ? undefined : textToRun.trim(),
          type: websiteType,
          theme: websiteTheme,
          existingHtml: isRefine ? code : undefined,
          refinementInstruction: isRefine ? textToRun.trim() : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error || 'Failed to generate website code');
      }

      if (data.html) {
        setCode(data.html);
        setIframeKey((prev) => prev + 1);
        if (data.suggestedNextSteps) {
          setSuggestedSteps(data.suggestedNextSteps);
        }
        if (isRefine) {
          setHistoryInstructions((prev) => [...prev, textToRun.trim()]);
          setRefinementInstruction('');
        }
        setActiveTab('preview');
      }
    } catch (err: any) {
      setError(err?.message || 'Error occurred while creating website.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([code], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'senux-website.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleOpenNewTab = () => {
    const blob = new Blob([code], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  const getViewportWidth = () => {
    switch (viewport) {
      case 'mobile':
        return 'max-w-[390px]';
      case 'tablet':
        return 'max-w-[768px]';
      case 'desktop':
      default:
        return 'w-full';
    }
  };

  return (
    <div
      id="senux-website-creator-assistant"
      className={`fixed inset-0 z-50 flex flex-col bg-slate-950/90 backdrop-blur-xl transition-all duration-300 ${
        isFullscreen ? 'p-0' : 'p-2 sm:p-4 md:p-6'
      }`}
    >
      <div className="flex flex-col flex-1 bg-slate-900/95 border border-cyan-500/40 shadow-[0_0_60px_rgba(6,182,212,0.3)] rounded-2xl overflow-hidden">
        {/* Top Control Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-6 py-3 bg-slate-950/80 border-b border-cyan-900/40">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 via-blue-600 to-cyan-500 text-white shadow-[0_0_15px_#6366f1]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-100 to-indigo-300">
                  Senux Website Creation Assistant
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-800 text-cyan-300 font-bold uppercase">
                  HTML • CSS • JavaScript
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Generate, edit & refine functional responsive web applications in real-time
              </p>
            </div>
          </div>

          {/* Center Tabs: Preview, Code Editor, AI Refiner */}
          <div className="flex items-center gap-1 bg-slate-800/90 p-1 rounded-xl border border-slate-700/60">
            <button
              onClick={() => setActiveTab('preview')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'preview'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Live Preview</span>
            </button>

            <button
              onClick={() => setActiveTab('code')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'code'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              <span>Code Editor</span>
            </button>

            <button
              onClick={() => setActiveTab('assistant')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'assistant'
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-[0_0_12px_rgba(99,102,241,0.4)]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Wand2 className="w-3.5 h-3.5 text-indigo-300" />
              <span>AI Refiner & Scaffolds</span>
            </button>
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-1.5">
            {/* Viewport Resizer for Preview */}
            {activeTab === 'preview' && (
              <div className="hidden sm:flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60 mr-1">
                <button
                  onClick={() => setViewport('desktop')}
                  title="Desktop View"
                  className={`p-1.5 rounded-lg transition-colors ${
                    viewport === 'desktop'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Monitor className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setViewport('tablet')}
                  title="Tablet View"
                  className={`p-1.5 rounded-lg transition-colors ${
                    viewport === 'tablet'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Tablet className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setViewport('mobile')}
                  title="Mobile View"
                  className={`p-1.5 rounded-lg transition-colors ${
                    viewport === 'mobile'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Reload Preview */}
            <button
              onClick={() => setIframeKey((prev) => prev + 1)}
              title="Refresh Sandboxed Runtime"
              className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-cyan-300 hover:bg-slate-700 transition-colors border border-slate-700/60"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            {/* Copy Code */}
            <button
              onClick={handleCopyCode}
              title="Copy Single-File Code"
              className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-cyan-300 hover:bg-slate-700 transition-colors border border-slate-700/60"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>

            {/* Download */}
            <button
              onClick={handleDownload}
              title="Download index.html"
              className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-cyan-300 hover:bg-slate-700 transition-colors border border-slate-700/60"
            >
              <Download className="w-4 h-4" />
            </button>

            {/* Open in New Window */}
            <button
              onClick={handleOpenNewTab}
              title="Open Standalone in New Tab"
              className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-cyan-300 hover:bg-slate-700 transition-colors border border-slate-700/60"
            >
              <ExternalLink className="w-4 h-4" />
            </button>

            {/* Fullscreen Toggle */}
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
              className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-cyan-300 hover:bg-slate-700 transition-colors border border-slate-700/60"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Close Studio */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors border border-slate-700/60 ml-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-hidden relative flex flex-col md:flex-row">
          {/* Main Visual Display (Preview or Code Editor) */}
          <div className="flex-1 h-full overflow-hidden flex flex-col relative bg-slate-950">
            {activeTab === 'preview' && (
              <div className="flex-1 h-full flex items-center justify-center p-2 sm:p-4 overflow-auto bg-slate-950">
                <div
                  className={`h-full transition-all duration-300 rounded-xl overflow-hidden border border-cyan-900/40 shadow-2xl bg-white ${getViewportWidth()}`}
                >
                  <iframe
                    key={iframeKey}
                    srcDoc={code}
                    title="Senux Web Application Sandbox"
                    className="w-full h-full border-0"
                    sandbox="allow-scripts allow-modals allow-forms allow-same-origin"
                  />
                </div>
              </div>
            )}

            {activeTab === 'code' && (
              <div className="flex-1 h-full flex flex-col p-4 bg-slate-950 overflow-hidden">
                <div className="flex items-center justify-between pb-2 text-xs text-slate-400 font-mono">
                  <span>index.html (HTML5, Tailwind CSS, Vanilla JS)</span>
                  <span>{code.length} characters</span>
                </div>
                <textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="flex-1 w-full bg-slate-900/90 text-cyan-200 font-mono text-xs p-4 rounded-xl border border-cyan-900/40 focus:outline-none focus:border-cyan-400 resize-none leading-relaxed shadow-inner"
                  spellCheck={false}
                />
              </div>
            )}

            {activeTab === 'assistant' && (
              <div className="flex-1 h-full overflow-y-auto p-4 sm:p-6 space-y-6">
                {/* Scaffold Starters */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-2 flex items-center gap-1.5">
                    <Layers className="w-4 h-4" /> Instant Website Architecture Scaffolds
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                    {scaffoldTemplates.map((scaff) => (
                      <button
                        key={scaff.id}
                        onClick={() => {
                          setPrompt(scaff.prompt);
                          setWebsiteType(scaff.id as any);
                          handleGenerateWebsite(scaff.prompt, false);
                        }}
                        className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-cyan-400/60 hover:bg-slate-800 transition-all text-left group"
                      >
                        <h4 className="text-xs font-bold text-slate-200 group-hover:text-cyan-300">
                          {scaff.title}
                        </h4>
                        <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                          {scaff.prompt}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Generation Form */}
                <div className="p-4 rounded-xl bg-slate-900/60 border border-cyan-900/40 space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Custom Website Specification
                  </h3>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Describe whatever website or interactive web app you desire in detail..."
                    rows={3}
                    className="w-full px-4 py-3 bg-slate-950 border border-cyan-500/40 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 text-xs sm:text-sm resize-none"
                  />
                  <div className="flex justify-end">
                    <button
                      onClick={() => handleGenerateWebsite(prompt, false)}
                      disabled={!prompt.trim() || isGenerating}
                      className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs flex items-center gap-2 shadow-[0_0_15px_rgba(6,182,212,0.4)] disabled:opacity-40"
                    >
                      {isGenerating ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Sparkles className="w-3.5 h-3.5" />
                      )}
                      <span>Build Website From Scratch</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Floating Refinement Sidebar */}
          <div className="w-full md:w-80 border-t md:border-t-0 md:border-l border-cyan-900/40 bg-slate-950/90 p-4 flex flex-col justify-between overflow-y-auto space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Wand2 className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  AI Refine & Extend
                </h3>
              </div>
              <p className="text-[11px] text-slate-400">
                Ask the assistant to add new features, adjust styling, or write custom JavaScript.
              </p>

              {/* Quick Suggestion Pills */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Suggested Enhancements:
                </span>
                <div className="flex flex-col gap-1">
                  {suggestedSteps.map((step, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setRefinementInstruction(step);
                      }}
                      className="text-left text-[11px] px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-cyan-500/40 text-slate-300 hover:text-cyan-300 transition-colors flex items-center justify-between group"
                    >
                      <span className="truncate">{step}</span>
                      <ChevronRight className="w-3 h-3 text-slate-600 group-hover:text-cyan-400 shrink-0 ml-1" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Refinement input */}
              <div className="space-y-2 pt-2">
                <textarea
                  value={refinementInstruction}
                  onChange={(e) => setRefinementInstruction(e.target.value)}
                  placeholder="e.g. 'Add a dark/light mode toggle with smooth CSS transitions' or 'Add an interactive sound effect on button click'..."
                  rows={3}
                  className="w-full px-3 py-2 bg-slate-900 border border-cyan-900/60 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 text-xs resize-none"
                />

                <button
                  type="button"
                  onClick={() => handleGenerateWebsite(refinementInstruction, true)}
                  disabled={!refinementInstruction.trim() || isGenerating}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-500 via-blue-600 to-cyan-500 hover:from-indigo-400 hover:to-cyan-400 text-white font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Refining Code with Gemini AI...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Apply AI Refinement</span>
                    </>
                  )}
                </button>
              </div>

              {error && (
                <div className="p-2.5 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-300 text-xs">
                  {error}
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="pt-3 border-t border-cyan-900/30 space-y-2">
              {onSendToChat && (
                <button
                  onClick={() => {
                    onSendToChat(code, 'Senux Custom Web Application');
                    onClose();
                  }}
                  className="w-full py-2 px-3 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-cyan-300 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
                >
                  <Send className="w-3.5 h-3.5" /> Send to Main Chat
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
