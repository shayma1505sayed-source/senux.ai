import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Globe,
  Code2,
  Image as ImageIcon,
  Mic,
  MicOff,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { AppMode } from '../types';

interface ChatInputAreaProps {
  onSendMessage: (message: string, enableSearch: boolean, mode: AppMode) => void;
  isLoading: boolean;
  activeMode: AppMode;
  onSelectMode: (mode: AppMode) => void;
  isListening: boolean;
  onToggleVoiceInput: () => void;
  onOpenImageStudio: () => void;
  onOpenWebStudio: () => void;
  enableSearch: boolean;
  onToggleSearch: () => void;
}

export const ChatInputArea: React.FC<ChatInputAreaProps> = ({
  onSendMessage,
  isLoading,
  activeMode,
  onSelectMode,
  isListening,
  onToggleVoiceInput,
  onOpenImageStudio,
  onOpenWebStudio,
  enableSearch,
  onToggleSearch,
}) => {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [input]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;

    onSendMessage(input.trim(), enableSearch, activeMode);
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-3 sm:px-4 pb-4 pt-2">
      <div
        id="senux-input-container"
        className={`relative rounded-2xl bg-slate-900/90 border transition-all duration-300 backdrop-blur-xl shadow-2xl ${
          isLoading
            ? 'border-cyan-500/30'
            : isListening
            ? 'border-emerald-400 shadow-[0_0_25px_rgba(52,211,153,0.4)] ring-1 ring-emerald-400'
            : 'border-cyan-500/40 hover:border-cyan-400/60 focus-within:border-cyan-400 focus-within:shadow-[0_0_25px_rgba(6,182,212,0.3)]'
        }`}
      >
        {/* Active Listening Wave Banner if Speech Recognition is recording */}
        {isListening && (
          <div className="flex items-center justify-between px-4 py-1.5 bg-emerald-950/70 border-b border-emerald-500/40 rounded-t-2xl text-xs text-emerald-300">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="font-semibold">Listening to your voice... speak now</span>
            </div>
            <button
              onClick={onToggleVoiceInput}
              className="text-emerald-400 hover:text-emerald-200 text-xs underline"
            >
              Stop listening
            </button>
          </div>
        )}

        {/* Textarea Input */}
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            activeMode === 'website'
              ? 'Describe a website or web app you want SenuxGPT to build (e.g. "Build a sleek neon calculator website with audio sound effects")...'
              : activeMode === 'search'
              ? 'Ask anything to search Google in real-time (e.g. "Latest discoveries from James Webb telescope 2026")...'
              : isListening
              ? 'Transcribing your speech in real-time...'
              : 'Ask SenuxGPT anything, request code, build a website, search Google, or generate art...'
          }
          rows={1}
          className="w-full px-4 pt-3.5 pb-2 bg-transparent text-slate-100 placeholder-slate-500 focus:outline-none text-sm md:text-base resize-none leading-relaxed"
        />

        {/* Action Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-3 pb-2.5 pt-1">
          {/* Capability Badges & Toggles */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Google Search Toggle */}
            <button
              type="button"
              onClick={onToggleSearch}
              title={enableSearch ? 'Google Search Grounding Active' : 'Enable Google Search Grounding'}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                enableSearch
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-300 hover:border-slate-700'
              }`}
            >
              <Globe className={`w-3.5 h-3.5 ${enableSearch ? 'text-cyan-400 animate-pulse' : ''}`} />
              <span>Google Search</span>
              {enableSearch && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 ml-0.5" />}
            </button>

            {/* Website Builder Assistant quick trigger */}
            <button
              type="button"
              onClick={() => {
                onSelectMode('website');
                onOpenWebStudio();
              }}
              title="Open Website Creation Assistant"
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                activeMode === 'website'
                  ? 'bg-indigo-500/20 text-indigo-300 border-indigo-400 shadow-[0_0_10px_rgba(99,102,241,0.3)]'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-300 hover:border-slate-700'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Website Creator</span>
            </button>

            {/* Image Studio quick trigger */}
            <button
              type="button"
              onClick={onOpenImageStudio}
              title="Open Image Art Studio"
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border bg-slate-950/60 border-slate-800 text-slate-400 hover:text-pink-300 hover:border-pink-500/30 transition-all"
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Generate Image</span>
            </button>
          </div>

          {/* Right: Microphone Voice Input & Submit */}
          <div className="flex items-center gap-1.5 ml-auto">
            {/* Voice Input (Speech Recognition) */}
            <button
              type="button"
              onClick={onToggleVoiceInput}
              title={isListening ? 'Stop Listening' : 'Talk with Voice (Speech Recognition)'}
              className={`p-2 rounded-xl border transition-all ${
                isListening
                  ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-[0_0_15px_#10b981] animate-pulse'
                  : 'bg-slate-950/80 text-slate-400 hover:text-cyan-300 hover:bg-slate-800 border-slate-800'
              }`}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            {/* Send Button */}
            <button
              type="button"
              onClick={() => handleSubmit()}
              disabled={!input.trim() || isLoading}
              title="Send to SenuxGPT (Enter)"
              className="p-2 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.5)] transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin text-white" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
