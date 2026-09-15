import React from 'react';
import {
  Sparkles,
  Globe,
  Code2,
  Image as ImageIcon,
  Palette,
  Volume2,
  VolumeX,
  Trash2,
  Zap,
} from 'lucide-react';
import { AppMode, FontTheme } from '../types';

interface HeaderProps {
  activeMode: AppMode;
  onSelectMode: (mode: AppMode) => void;
  fontTheme: FontTheme;
  onChangeFontTheme: (theme: FontTheme) => void;
  isAudioMuted: boolean;
  onToggleAudioMute: () => void;
  onClearChat: () => void;
  onOpenImageStudio: () => void;
  onOpenWebStudio: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeMode,
  onSelectMode,
  fontTheme,
  onChangeFontTheme,
  isAudioMuted,
  onToggleAudioMute,
  onClearChat,
  onOpenImageStudio,
  onOpenWebStudio,
}) => {
  const getLogoThemeClass = () => {
    switch (fontTheme) {
      case 'aurora':
        return 'font-colorful-aurora';
      case 'cosmic':
        return 'font-colorful-cosmic';
      case 'cyber':
        return 'font-colorful-cyber';
      case 'fire':
        return 'font-colorful-fire';
      default:
        return 'font-colorful-aurora';
    }
  };

  const fontOptions: { id: FontTheme; label: string; dotColor: string }[] = [
    { id: 'aurora', label: 'Aurora', dotColor: 'bg-cyan-400' },
    { id: 'cosmic', label: 'Cosmic', dotColor: 'bg-purple-400' },
    { id: 'cyber', label: 'Cyber', dotColor: 'bg-blue-400' },
    { id: 'fire', label: 'Solar Fire', dotColor: 'bg-amber-400' },
  ];

  return (
    <header
      id="senux-header"
      className="sticky top-0 z-30 w-full bg-slate-950/80 backdrop-blur-xl border-b border-cyan-900/30 px-3 md:px-6 py-2.5 transition-all"
    >
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2.5">
        {/* Brand & Animated Stars */}
        <div className="flex items-center justify-between w-full md:w-auto">
          <div className="flex items-center gap-2.5 group cursor-pointer">
            <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-400 via-blue-600 to-indigo-600 text-white shadow-[0_0_16px_rgba(6,182,212,0.6)] border border-cyan-300/40">
              <Sparkles className="w-5 h-5 animate-pulse text-cyan-100" />
              {/* Star orbit tiny particle */}
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-cyan-300 shadow-[0_0_8px_#38bdf8] animate-twinkle" />
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <span className={`text-xl md:text-2xl font-black tracking-tight ${getLogoThemeClass()}`}>
                  SenuxGPT
                </span>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-800/60 text-cyan-300 uppercase tracking-wider">
                  v3.8
                </span>
              </div>
              <p className="text-[10px] text-slate-400 hidden sm:block">
                Celestial AI • Google Search • Web Studio • Voice • Art
              </p>
            </div>
          </div>

          {/* Mobile Right Controls */}
          <div className="flex items-center gap-1.5 md:hidden">
            <button
              onClick={onToggleAudioMute}
              title={isAudioMuted ? 'Unmute Audio' : 'Mute Audio'}
              className={`p-1.5 rounded-lg border text-xs transition-colors ${
                !isAudioMuted
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                  : 'bg-slate-900 text-slate-400 border-slate-800'
              }`}
            >
              {!isAudioMuted ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <button
              onClick={onClearChat}
              title="Clear Conversation"
              className="p-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-rose-400 border border-slate-800"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mode Selectors */}
        <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-cyan-900/40 overflow-x-auto max-w-full">
          <button
            onClick={() => onSelectMode('all')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeMode === 'all'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_12px_rgba(6,182,212,0.5)]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="w-3 h-3 text-amber-300" />
            <span>Omni Mode</span>
          </button>

          <button
            onClick={() => onSelectMode('search')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeMode === 'search'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_12px_rgba(6,182,212,0.5)]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Globe className="w-3 h-3 text-sky-300" />
            <span>Google Search</span>
          </button>

          <button
            onClick={() => {
              onSelectMode('website');
              onOpenWebStudio();
            }}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeMode === 'website'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_12px_rgba(6,182,212,0.5)]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code2 className="w-3 h-3 text-indigo-300" />
            <span>Web Studio</span>
          </button>

          <button
            onClick={() => {
              onSelectMode('image');
              onOpenImageStudio();
            }}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeMode === 'image'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_12px_rgba(6,182,212,0.5)]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ImageIcon className="w-3 h-3 text-pink-300" />
            <span>Image Studio</span>
          </button>
        </div>

        {/* Right Controls: Font Theme Selector, Audio Toggle, Clear */}
        <div className="hidden md:flex items-center gap-2">
          {/* Font Palette Selector */}
          <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800 text-xs">
            <Palette className="w-3.5 h-3.5 text-cyan-400 ml-1 mr-0.5" />
            {fontOptions.map((opt) => (
              <button
                key={opt.id}
                onClick={() => onChangeFontTheme(opt.id)}
                title={`Theme: ${opt.label}`}
                className={`px-2 py-1 rounded-lg flex items-center gap-1 transition-all ${
                  fontTheme === opt.id
                    ? 'bg-slate-800 text-cyan-300 font-semibold border border-cyan-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${opt.dotColor}`} />
                <span className="text-[11px]">{opt.label}</span>
              </button>
            ))}
          </div>

          {/* Audio toggle */}
          <button
            onClick={onToggleAudioMute}
            title={isAudioMuted ? 'Enable Voice Output' : 'Mute Voice Output'}
            className={`p-2 rounded-xl border transition-all ${
              !isAudioMuted
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-[0_0_10px_rgba(6,182,212,0.25)]'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            {!isAudioMuted ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Clear chat */}
          <button
            onClick={onClearChat}
            title="Reset Conversation"
            className="p-2 rounded-xl bg-slate-900 text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 border border-slate-800 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
