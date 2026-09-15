import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Globe,
  Code2,
  Image as ImageIcon,
  Compass,
  ArrowRight,
  RefreshCw,
  Terminal,
} from 'lucide-react';
import { AppMode, FontTheme, Message, PromptSuggestion, GeneratedImageRecord } from './types';
import { StarfieldCanvas } from './components/StarfieldCanvas';
import { Header } from './components/Header';
import { SenuxCoreOrb } from './components/SenuxCoreOrb';
import { ChatMessageItem } from './components/ChatMessageItem';
import { ChatInputArea } from './components/ChatInputArea';
import { WebsiteCreatorAssistant } from './components/WebsiteCreatorAssistant';
import { AdvancedImageStudio } from './components/AdvancedImageStudio';
import { playSpeech, stopSpeech, createSpeechRecognizer } from './utils/voice';

const CHAT_STORAGE_KEY = 'senuxgpt_chat_history_v1';
const THEME_STORAGE_KEY = 'senuxgpt_font_theme';

const DEFAULT_WELCOME_MESSAGE: Message = {
  id: 'welcome-msg',
  role: 'assistant',
  content: `# Welcome to SenuxGPT ✨

I am **SenuxGPT**, your ultra-powerful celestial AI assistant powered by Gemini.

Here is what I can do for you:
- 🌐 **Real-time Google Search**: Query current facts, news, and research with live web citations.
- 💻 **Build Interactive Websites**: Ask me to create any web application or landing page — you can launch and test it immediately in the **Live Web Studio**!
- 🎨 **Cosmic Image Generation**: Generate celestial artwork and visuals with custom aspect ratios.
- 🔊 **Voice Integration**: Speak to me using your microphone and hear responses read aloud with rich audio.
- 🌈 **Colorful Typography**: Switch between luminous color themes using the palette above.

What shall we create or explore together today?`,
  timestamp: Date.now(),
};

export default function App() {
  // Restore persisted chat history from localStorage across page refreshes
  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const saved = localStorage.getItem(CHAT_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to restore chat history from localStorage:', e);
    }
    return [DEFAULT_WELCOME_MESSAGE];
  });

  const [activeMode, setActiveMode] = useState<AppMode>('all');
  const [fontTheme, setFontTheme] = useState<FontTheme>(() => {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY);
      if (saved && ['aurora', 'cosmic', 'cyber', 'fire'].includes(saved)) {
        return saved as FontTheme;
      }
    } catch (e) {}
    return 'aurora';
  });
  const [enableSearch, setEnableSearch] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [isListening, setIsListening] = useState<boolean>(false);

  // Modals & Assistant Studio state
  const [webStudioCode, setWebStudioCode] = useState<string | null>(null);
  const [webStudioPrompt, setWebStudioPrompt] = useState<string>('');
  const [isWebStudioOpen, setIsWebStudioOpen] = useState<boolean>(false);
  const [isImageStudioOpen, setIsImageStudioOpen] = useState<boolean>(false);
  const [imageStudioPrompt, setImageStudioPrompt] = useState<string>('');

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const speechRecognizerRef = useRef<any>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Persist chat history to localStorage whenever messages change
  useEffect(() => {
    try {
      // Retain up to 60 most recent messages to comfortably fit browser storage bounds
      const toSave = messages.slice(-60);
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(toSave));
    } catch (err: any) {
      if (err?.name === 'QuotaExceededError' || err?.code === 22) {
        try {
          const trimmed = messages.slice(-25);
          localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(trimmed));
        } catch (e) {
          console.warn('LocalStorage quota reached, unable to persist chat history:', e);
        }
      } else {
        console.warn('Failed to save chat history to localStorage:', err);
      }
    }
  }, [messages]);

  // Persist font theme preference
  useEffect(() => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, fontTheme);
    } catch (e) {}
  }, [fontTheme]);

  // Determine central AI orb status
  const getOrbStatus = (): 'idle' | 'thinking' | 'speaking' | 'listening' => {
    if (isListening) return 'listening';
    if (isLoading) return 'thinking';
    if (speakingMessageId) return 'speaking';
    return 'idle';
  };

  // Voice speech synthesis
  const handleSpeak = (text: string, id: string) => {
    if (isAudioMuted) return;
    setSpeakingMessageId(id);
    playSpeech(
      text,
      'Zephyr',
      () => setSpeakingMessageId(id),
      () => setSpeakingMessageId(null),
      () => setSpeakingMessageId(null)
    );
  };

  const handleStopSpeak = () => {
    stopSpeech();
    setSpeakingMessageId(null);
  };

  // Integration callbacks from Studios
  const handleSendImageToChat = (record: GeneratedImageRecord) => {
    const assistantMsg: Message = {
      id: `assistant-img-${Date.now()}`,
      role: 'assistant',
      content: `🎨 **Generated High-Fidelity Artwork**\n\nPrompt: *"${record.prompt}"*\nStyle: **${record.style}** • Aspect Ratio: **${record.aspectRatio}**`,
      imageUrl: record.url,
      imageRecord: record,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, assistantMsg]);
  };

  const handleSendWebsiteToChat = (htmlCode: string, title: string) => {
    const assistantMsg: Message = {
      id: `assistant-web-${Date.now()}`,
      role: 'assistant',
      content: `💻 **Website Application Created: "${title}"**\n\nHere is the full HTML, CSS, and JavaScript code. You can test and refine it using the **Live Web Studio**:\n\n\`\`\`html\n${htmlCode}\n\`\`\``,
      websiteHtml: htmlCode,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, assistantMsg]);
  };

  // Voice recognition (Speech to Text)
  const handleToggleVoiceInput = () => {
    if (isListening) {
      if (speechRecognizerRef.current) {
        speechRecognizerRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    const recognizer = createSpeechRecognizer(
      (transcript, isFinal) => {
        if (isFinal) {
          handleSendMessage(transcript, enableSearch, activeMode);
          setIsListening(false);
          recognizer.stop();
        }
      },
      (error) => {
        console.warn('Speech recognition error:', error);
        setIsListening(false);
      },
      () => {
        setIsListening(false);
      }
    );

    if (recognizer) {
      speechRecognizerRef.current = recognizer;
      try {
        recognizer.start();
        setIsListening(true);
      } catch (e) {
        console.error('Recognizer start failure:', e);
        setIsListening(false);
      }
    }
  };

  // Sending Chat Message
  const handleSendMessage = async (
    userText: string,
    useSearch: boolean = enableSearch,
    mode: AppMode = activeMode
  ) => {
    if (!userText.trim() || isLoading) return;

    // Stop ongoing speech
    handleStopSpeak();

    // Check if user specifically requested image generation in chat text
    const isImageRequest =
      mode === 'image' ||
      /\b(generate an image|create an image|draw|generate art|paint|make an image)\b/i.test(userText);

    if (isImageRequest && mode === 'image') {
      setIsImageStudioOpen(true);
      return;
    }

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: userText,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      // If user asks directly for an image in standard chat, handle via image endpoint
      if (isImageRequest) {
        const cleanPrompt = userText
          .replace(/\b(generate an image of|generate an image|create an image of|draw|make an image of)\b/i, '')
          .trim();

        const imgRes = await fetch('/api/generate-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: cleanPrompt || userText, aspectRatio: '1:1' }),
        });

        const imgData = await imgRes.json();
        if (imgData.imageUrl) {
          const assistantMsg: Message = {
            id: `assistant-${Date.now()}`,
            role: 'assistant',
            content: `I've manifested your celestial vision: **"${cleanPrompt || userText}"**\n\nDownload or expand the artwork using the controls below.`,
            imageUrl: imgData.imageUrl,
            timestamp: Date.now(),
          };
          setMessages((prev) => [...prev, assistantMsg]);
          if (!isAudioMuted) {
            handleSpeak(assistantMsg.content, assistantMsg.id);
          }
          setIsLoading(false);
          return;
        }
      }

      // Standard / Website / Coding / Search Chat request
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          history: messages.slice(-8).map((m) => ({
            role: m.role,
            content: m.content,
          })),
          enableSearch: useSearch || mode === 'search',
          mode: mode === 'website' ? 'website' : mode === 'coding' ? 'coding' : 'all-powerful',
        }),
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error || 'Failed to receive response from SenuxGPT.');
      }

      const assistantMsg: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.reply || 'No response returned.',
        sources: data.sources || [],
        webSearchQueries: data.webSearchQueries || [],
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, assistantMsg]);

      // Auto-read response if audio is not muted
      if (!isAudioMuted) {
        handleSpeak(assistantMsg.content, assistantMsg.id);
      }
    } catch (err: any) {
      const isRateLimit =
        err?.message?.includes('429') ||
        err?.message?.includes('quota') ||
        err?.message?.includes('RESOURCE_EXHAUSTED') ||
        err?.message?.includes('rate-limits');

      const errorMsg: Message = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: isRateLimit
          ? `⏳ **Gemini API Rate Limit / Quota Notice (429 RESOURCE_EXHAUSTED)**\n\nThe Google Gemini API rate limit or quota ceiling has been momentarily reached for your API key. The free tier rate limit automatically resets every 60 seconds.\n\n* **Quick retry**: You can re-send your message shortly.\n* **Quota details**: Check usage at [ai.google.dev/gemini-api/docs/rate-limits](https://ai.google.dev/gemini-api/docs/rate-limits).\n* **Instant tools**: The **Web Studio**, **Image Studio**, and **Code Editor** remain available above.`
          : `⚠️ **Notice**: ${err?.message || 'Could not complete request.'}\n\nPlease check your network connection or verify the Gemini API key in **Settings > Secrets**.`,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenWebStudio = (htmlCode: string) => {
    setWebStudioCode(htmlCode);
    setIsWebStudioOpen(true);
  };

  const handleClearChat = () => {
    handleStopSpeak();
    setMessages([
      {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: `# Fresh Canvas Initiated 🌌\n\nSenuxGPT is ready. Ask a question, search Google, build a web app, or generate artwork.`,
        timestamp: Date.now(),
      },
    ]);
  };

  const promptSuggestions: PromptSuggestion[] = [
    {
      title: 'Build Live Website',
      subtitle: 'Single-page app with animations & interactivity',
      prompt: 'Build a beautiful, interactive Cyberpunk Pomodoro & Task Manager website with glowing neon sound effects and custom audio chime',
      mode: 'website',
      icon: 'code',
    },
    {
      title: 'Google Search Fact',
      subtitle: 'Real-time verified information & citations',
      prompt: 'Search Google for the latest scientific discoveries and missions planned for space exploration in 2026',
      mode: 'search',
      icon: 'globe',
    },
    {
      title: 'Celestial Image Art',
      subtitle: 'Photorealistic & cosmic imagery',
      prompt: 'Generate an image of a radiant celestial cosmic wolf howling on an astral crystal cliff in deep blue space',
      mode: 'image',
      icon: 'image',
    },
    {
      title: 'Coding & Algorithms',
      subtitle: 'High-performance algorithms & scripts',
      prompt: 'Write a complete, highly optimized Python script to simulate N-body gravitational celestial physics with Matplotlib visualization',
      mode: 'coding',
      icon: 'terminal',
    },
  ];

  return (
    <div className="relative min-h-screen flex flex-col bg-[#030712] text-slate-100 selection:bg-cyan-500 selection:text-white">
      {/* Background Animated Celestial Starfield */}
      <StarfieldCanvas isGenerating={isLoading} isSpeaking={Boolean(speakingMessageId)} />

      {/* Main Header */}
      <Header
        activeMode={activeMode}
        onSelectMode={(mode) => {
          setActiveMode(mode);
          if (mode === 'search') setEnableSearch(true);
        }}
        fontTheme={fontTheme}
        onChangeFontTheme={setFontTheme}
        isAudioMuted={isAudioMuted}
        onToggleAudioMute={() => {
          if (!isAudioMuted) handleStopSpeak();
          setIsAudioMuted(!isAudioMuted);
        }}
        onClearChat={handleClearChat}
        onOpenImageStudio={() => setIsImageStudioOpen(true)}
        onOpenWebStudio={() => setIsWebStudioOpen(true)}
      />

      {/* Main Chat Stream Container */}
      <main className="relative z-10 flex-1 flex flex-col max-w-5xl w-full mx-auto px-3 sm:px-6 py-4 overflow-y-auto">
        {/* Core AI Orb Floating Station */}
        <div className="flex flex-col items-center justify-center my-3 py-2">
          <SenuxCoreOrb
            status={getOrbStatus()}
            size="md"
            onClick={() => {
              if (speakingMessageId) {
                handleStopSpeak();
              } else {
                handleToggleVoiceInput();
              }
            }}
          />
          <div className="mt-2 text-center">
            <span className="text-[11px] font-mono font-medium text-cyan-400/80 tracking-wider uppercase">
              {isLoading
                ? '✦ Synthesizing Neural Answers...'
                : isListening
                ? '✦ Voice Receptor Active'
                : speakingMessageId
                ? '✦ Audio Wave Transmission'
                : '✦ Senux Core Online'}
            </span>
          </div>
        </div>

        {/* Message Thread */}
        <div className="space-y-4 flex-1">
          {messages.map((msg) => (
            <ChatMessageItem
              key={msg.id}
              message={msg}
              fontTheme={fontTheme}
              isSpeakingThis={speakingMessageId === msg.id}
              onSpeak={handleSpeak}
              onStopSpeak={handleStopSpeak}
              onOpenWebStudio={handleOpenWebStudio}
            />
          ))}

          {/* Loading Skeleton */}
          {isLoading && (
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-900/80 border border-cyan-500/30 shadow-[0_0_25px_rgba(6,182,212,0.15)] animate-pulse">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/30 flex items-center justify-center text-cyan-300">
                <Sparkles className="w-4 h-4 animate-spin" />
              </div>
              <div className="space-y-1.5 flex-1">
                <div className="h-3 bg-cyan-500/20 rounded w-1/3" />
                <div className="h-2.5 bg-slate-800 rounded w-2/3" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Prompt Suggestions (Show when few messages) */}
        {messages.length <= 2 && (
          <div className="my-6 pt-4 border-t border-cyan-900/30">
            <div className="flex items-center gap-2 mb-3">
              <Compass className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Quick Starters & Capabilities
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {promptSuggestions.map((sug, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    if (sug.mode === 'image') {
                      setImageStudioPrompt(sug.prompt);
                      setIsImageStudioOpen(true);
                    } else if (sug.mode === 'website') {
                      setWebStudioPrompt(sug.prompt);
                      setIsWebStudioOpen(true);
                    } else {
                      setActiveMode(sug.mode);
                      if (sug.mode === 'search') setEnableSearch(true);
                      handleSendMessage(sug.prompt, sug.mode === 'search', sug.mode);
                    }
                  }}
                  className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/80 border border-cyan-900/40 hover:border-cyan-400/60 hover:bg-slate-800/80 hover:shadow-[0_0_15px_rgba(6,182,212,0.25)] transition-all text-left group"
                >
                  <div className="p-2 rounded-lg bg-cyan-950/80 text-cyan-300 border border-cyan-800/40 group-hover:scale-105 transition-transform">
                    {sug.icon === 'code' && <Code2 className="w-4 h-4" />}
                    {sug.icon === 'globe' && <Globe className="w-4 h-4" />}
                    {sug.icon === 'image' && <ImageIcon className="w-4 h-4" />}
                    {sug.icon === 'terminal' && <Terminal className="w-4 h-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold text-slate-200 group-hover:text-cyan-300 transition-colors">
                        {sug.title}
                      </h3>
                      <ArrowRight className="w-3 h-3 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                      {sug.subtitle}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Floating Chat Input Area */}
      <footer className="relative z-20 sticky bottom-0 w-full bg-gradient-to-t from-slate-950 via-slate-950/90 to-transparent pt-2">
        <ChatInputArea
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          activeMode={activeMode}
          onSelectMode={setActiveMode}
          isListening={isListening}
          onToggleVoiceInput={handleToggleVoiceInput}
          onOpenImageStudio={() => setIsImageStudioOpen(true)}
          onOpenWebStudio={() => setIsWebStudioOpen(true)}
          enableSearch={enableSearch}
          onToggleSearch={() => setEnableSearch(!enableSearch)}
        />
      </footer>

      {/* Advanced Website Creation Assistant */}
      {isWebStudioOpen && (
        <WebsiteCreatorAssistant
          isOpen={isWebStudioOpen}
          initialCode={webStudioCode || undefined}
          initialPrompt={webStudioPrompt || undefined}
          onClose={() => {
            setIsWebStudioOpen(false);
            setWebStudioPrompt('');
          }}
          onSendToChat={handleSendWebsiteToChat}
        />
      )}

      {/* Advanced DALL-E & Midjourney Grade Image Studio */}
      {isImageStudioOpen && (
        <AdvancedImageStudio
          isOpen={isImageStudioOpen}
          initialPrompt={imageStudioPrompt || undefined}
          onClose={() => {
            setIsImageStudioOpen(false);
            setImageStudioPrompt('');
          }}
          onSendToChat={handleSendImageToChat}
        />
      )}
    </div>
  );
}
