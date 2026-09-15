import React, { useState } from 'react';
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
  ExternalLink,
} from 'lucide-react';

interface WebStudioModalProps {
  htmlCode: string;
  isOpen: boolean;
  onClose: () => void;
  title?: string;
}

export const WebStudioModal: React.FC<WebStudioModalProps> = ({
  htmlCode,
  isOpen,
  onClose,
  title = 'Senux Live Web & Code Studio',
}) => {
  const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview');
  const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(htmlCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([htmlCode], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'senux-web-application.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleOpenNewTab = () => {
    const blob = new Blob([htmlCode], { type: 'text/html' });
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
      id="senux-web-studio-modal"
      className={`fixed inset-0 z-50 flex flex-col bg-slate-950/90 backdrop-blur-xl transition-all duration-300 ${
        isFullscreen ? 'p-0' : 'p-3 md:p-6'
      }`}
    >
      {/* Studio Container with glowing cosmic blue border */}
      <div
        className={`flex flex-col flex-1 bg-slate-900/95 border border-cyan-500/40 shadow-[0_0_50px_rgba(6,182,212,0.25)] rounded-2xl overflow-hidden`}
      >
        {/* Top Control Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-slate-950/80 border-b border-cyan-900/40">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-[0_0_12px_#06b6d4]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm md:text-base font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-200 to-indigo-300">
                {title}
              </h2>
              <p className="text-xs text-slate-400">Interactive Single-Page Live Sandbox</p>
            </div>
          </div>

          {/* Mode Switchers: Preview vs Code */}
          <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60">
            <button
              onClick={() => setActiveTab('preview')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'preview'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_10px_rgba(6,182,212,0.5)]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              Live Preview
            </button>
            <button
              onClick={() => setActiveTab('code')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'code'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_10px_rgba(6,182,212,0.5)]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              Source Code
            </button>
          </div>

          {/* Viewport Resizer (Preview mode only) */}
          {activeTab === 'preview' && (
            <div className="hidden sm:flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60">
              <button
                onClick={() => setViewport('desktop')}
                title="Desktop View (Full)"
                className={`p-1.5 rounded-lg transition-colors ${
                  viewport === 'desktop'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Monitor className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewport('tablet')}
                title="Tablet View (768px)"
                className={`p-1.5 rounded-lg transition-colors ${
                  viewport === 'tablet'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Tablet className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewport('mobile')}
                title="Mobile View (390px)"
                className={`p-1.5 rounded-lg transition-colors ${
                  viewport === 'mobile'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Smartphone className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Actions: Reload, Copy, Download, Fullscreen, Close */}
          <div className="flex items-center gap-1.5">
            {activeTab === 'preview' && (
              <button
                onClick={() => setIframeKey((k) => k + 1)}
                title="Reload Preview"
                className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-cyan-300 hover:bg-slate-700 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={handleCopy}
              title="Copy Code"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-cyan-300 hover:bg-slate-700 transition-colors text-xs font-medium"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Copy</span>
                </>
              )}
            </button>

            <button
              onClick={handleDownload}
              title="Download HTML File"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-cyan-300 hover:bg-slate-700 transition-colors text-xs font-medium"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Download</span>
            </button>

            <button
              onClick={handleOpenNewTab}
              title="Open in new window"
              className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-cyan-300 hover:bg-slate-700 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-cyan-300 hover:bg-slate-700 transition-colors"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            <button
              onClick={onClose}
              title="Close Studio"
              className="p-1.5 rounded-lg bg-rose-950/40 text-rose-300 hover:bg-rose-900/60 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="relative flex-1 bg-slate-950 overflow-hidden flex items-center justify-center p-2">
          {activeTab === 'preview' ? (
            <div
              className={`h-full mx-auto transition-all duration-300 rounded-xl overflow-hidden shadow-2xl border border-slate-800 bg-white ${getViewportWidth()}`}
            >
              <iframe
                key={iframeKey}
                title="Senux Live Website Preview"
                srcDoc={htmlCode}
                sandbox="allow-scripts allow-modals allow-same-origin allow-forms"
                className="w-full h-full border-none bg-white"
              />
            </div>
          ) : (
            <div className="w-full h-full overflow-auto bg-slate-950 p-4 rounded-xl font-mono text-xs sm:text-sm text-cyan-200/90 leading-relaxed select-text">
              <pre className="whitespace-pre-wrap break-words">{htmlCode}</pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
