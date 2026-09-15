import React, { useState } from 'react';
import {
  Sparkles,
  User,
  Globe,
  ExternalLink,
  Code,
  Copy,
  Check,
  Play,
  Square,
  Eye,
  Download,
  Share2,
  Search,
  CheckCircle2,
} from 'lucide-react';
import { Message, FontTheme } from '../types';

interface ChatMessageItemProps {
  message: Message;
  fontTheme: FontTheme;
  isSpeakingThis: boolean;
  onSpeak: (text: string, id: string) => void;
  onStopSpeak: () => void;
  onOpenWebStudio: (htmlCode: string) => void;
}

export const ChatMessageItem: React.FC<ChatMessageItemProps> = ({
  message,
  fontTheme,
  isSpeakingThis,
  onSpeak,
  onStopSpeak,
  onOpenWebStudio,
}) => {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);
  const [showSources, setShowSources] = useState(true);

  // Extract html code block if present
  const extractHtml = (text: string): string | null => {
    const htmlBlockRegex = /```html([\s\S]*?)```/i;
    const match = text.match(htmlBlockRegex);
    if (match && match[1]) {
      return match[1].trim();
    }
    // Also check for <!DOCTYPE html> in text
    if (text.includes('<!DOCTYPE html>') || (text.includes('<html') && text.includes('</html>'))) {
      const start = text.indexOf('<!DOCTYPE html>') !== -1 ? text.indexOf('<!DOCTYPE html>') : text.indexOf('<html');
      const end = text.lastIndexOf('</html>');
      if (start !== -1 && end !== -1) {
        return text.slice(start, end + 7);
      }
    }
    return null;
  };

  const detectedHtml = !isUser ? extractHtml(message.content) : null;

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getFontThemeClass = () => {
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

  // Simple Markdown renderer helper that handles code blocks, bold text, headers, lists
  const renderFormattedContent = (content: string) => {
    const parts = content.split(/(```[\s\S]*?```)/g);

    return parts.map((part, index) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        const lines = part.slice(3, -3).trim().split('\n');
        const language = lines[0].trim();
        const codeContent = lines.slice(language ? 1 : 0).join('\n');
        const isHtmlCode = language.toLowerCase() === 'html' || codeContent.includes('<div') || codeContent.includes('<!DOCTYPE');

        return (
          <div
            key={index}
            className="my-3 rounded-xl overflow-hidden border border-cyan-500/30 bg-slate-950 shadow-lg"
          >
            <div className="flex items-center justify-between px-3 py-2 bg-slate-900/90 border-b border-cyan-900/40 text-xs">
              <div className="flex items-center gap-2 text-cyan-400 font-mono font-medium">
                <Code className="w-3.5 h-3.5" />
                <span>{language || 'code'}</span>
              </div>
              <div className="flex items-center gap-2">
                {isHtmlCode && (
                  <button
                    onClick={() => onOpenWebStudio(codeContent)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium hover:brightness-110 shadow-[0_0_10px_rgba(6,182,212,0.4)] transition-all"
                  >
                    <Eye className="w-3 h-3" />
                    <span>Run in Web Studio</span>
                  </button>
                )}
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(codeContent);
                  }}
                  className="flex items-center gap-1 px-2 py-1 rounded-md bg-slate-800 text-slate-300 hover:text-white transition-colors"
                >
                  <Copy className="w-3 h-3" />
                  <span>Copy</span>
                </button>
              </div>
            </div>
            <pre className="p-4 text-xs md:text-sm font-mono text-cyan-100 overflow-x-auto leading-relaxed bg-slate-950/90">
              <code>{codeContent}</code>
            </pre>
          </div>
        );
      }

      // Format text with headers, bullet points, and colorful highlights
      const paragraphs = part.split('\n');
      return (
        <div key={index} className="space-y-2">
          {paragraphs.map((line, pIdx) => {
            if (!line.trim()) return <div key={pIdx} className="h-1" />;

            // Headers
            if (line.startsWith('### ')) {
              return (
                <h4
                  key={pIdx}
                  className="text-base font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-200 to-purple-300 pt-2"
                >
                  {line.replace('### ', '')}
                </h4>
              );
            }
            if (line.startsWith('## ')) {
              return (
                <h3
                  key={pIdx}
                  className="text-lg font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-cyan-200 to-indigo-300 pt-2"
                >
                  {line.replace('## ', '')}
                </h3>
              );
            }
            if (line.startsWith('# ')) {
              return (
                <h2
                  key={pIdx}
                  className={`text-xl font-black pt-2 ${getFontThemeClass()}`}
                >
                  {line.replace('# ', '')}
                </h2>
              );
            }

            // Bullet points
            if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
              const bulletText = line.trim().slice(2);
              return (
                <div key={pIdx} className="flex items-start gap-2 pl-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 shrink-0 shadow-[0_0_6px_#38bdf8]" />
                  <span className="text-slate-200 leading-relaxed">
                    {parseInlineBold(bulletText)}
                  </span>
                </div>
              );
            }

            // Numbered items (1. 2.)
            const numberedMatch = line.match(/^(\d+)\.\s+(.*)/);
            if (numberedMatch) {
              return (
                <div key={pIdx} className="flex items-start gap-2 pl-2">
                  <span className="text-xs font-bold font-mono text-cyan-400 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-800/40 shrink-0">
                    {numberedMatch[1]}
                  </span>
                  <span className="text-slate-200 leading-relaxed">
                    {parseInlineBold(numberedMatch[2])}
                  </span>
                </div>
              );
            }

            return (
              <p key={pIdx} className="text-slate-200 leading-relaxed">
                {parseInlineBold(line)}
              </p>
            );
          })}
        </div>
      );
    });
  };

  // Helper for **bold** text and `inline code`
  const parseInlineBold = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
    return parts.map((seg, i) => {
      if (seg.startsWith('**') && seg.endsWith('**')) {
        return (
          <strong
            key={i}
            className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-200 to-indigo-300"
          >
            {seg.slice(2, -2)}
          </strong>
        );
      }
      if (seg.startsWith('`') && seg.endsWith('`')) {
        return (
          <code
            key={i}
            className="px-1.5 py-0.5 rounded bg-slate-900 border border-cyan-800/40 text-cyan-300 font-mono text-xs font-semibold"
          >
            {seg.slice(1, -1)}
          </code>
        );
      }
      return seg;
    });
  };

  return (
    <div
      id={`chat-message-${message.id}`}
      className={`group flex gap-3.5 md:gap-4 p-4 md:p-5 rounded-2xl transition-all duration-300 ${
        isUser
          ? 'bg-slate-900/70 border border-cyan-800/30 ml-auto max-w-2xl'
          : 'bg-slate-900/90 border border-cyan-500/30 shadow-[0_0_30px_rgba(6,182,212,0.1)] w-full'
      }`}
    >
      {/* Avatar */}
      <div className="shrink-0 pt-0.5">
        {isUser ? (
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white shadow-md">
            <User className="w-4 h-4" />
          </div>
        ) : (
          <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 via-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-[0_0_15px_rgba(6,182,212,0.5)] border border-cyan-300/40">
            <Sparkles className="w-4 h-4 animate-spin" style={{ animationDuration: '8s' }} />
            <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#22d3ee]" />
          </div>
        )}
      </div>

      {/* Main Body */}
      <div className="flex-1 min-w-0 space-y-3">
        {/* Author Label & Timestamp */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-bold tracking-wide uppercase ${
                isUser ? 'text-indigo-400' : getFontThemeClass()
              }`}
            >
              {isUser ? 'You' : 'SenuxGPT'}
            </span>
            {!isUser && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-800/60 text-cyan-300 font-mono flex items-center gap-1">
                <CheckCircle2 className="w-2.5 h-2.5 text-cyan-400" /> Powered by Gemini
              </span>
            )}
          </div>

          {/* Action buttons (Copy, Speak) */}
          <div className="flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
            {!isUser && (
              <button
                onClick={() => {
                  if (isSpeakingThis) {
                    onStopSpeak();
                  } else {
                    onSpeak(message.content, message.id);
                  }
                }}
                title={isSpeakingThis ? 'Stop Voice' : 'Read Aloud with Voice'}
                className={`p-1.5 rounded-lg text-xs flex items-center gap-1 transition-all ${
                  isSpeakingThis
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-[0_0_10px_#06b6d4]'
                    : 'bg-slate-800 text-slate-300 hover:text-cyan-300 hover:bg-slate-700'
                }`}
              >
                {isSpeakingThis ? (
                  <>
                    <Square className="w-3 h-3 fill-current" />
                    <span className="text-[10px]">Speaking...</span>
                  </>
                ) : (
                  <Play className="w-3 h-3 fill-current" />
                )}
              </button>
            )}

            <button
              onClick={handleCopyMessage}
              title="Copy message"
              className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700 transition-colors"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            </button>
          </div>
        </div>

        {/* Google Search Grounding Section (If sources exist) */}
        {!isUser && (message.sources?.length || message.webSearchQueries?.length) ? (
          <div className="rounded-xl bg-slate-950/70 border border-cyan-500/20 p-3 space-y-2">
            <div className="flex items-center justify-between cursor-pointer" onClick={() => setShowSources(!showSources)}>
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-5 h-5 rounded-md bg-blue-600/30 text-cyan-400 border border-cyan-500/30">
                  <Globe className="w-3 h-3" />
                </div>
                <span className="text-xs font-semibold text-cyan-300">
                  Google Search Grounded
                </span>
                {message.sources?.length ? (
                  <span className="text-[10px] bg-cyan-950 text-cyan-400 border border-cyan-800/50 px-1.5 py-0.2 rounded-full font-mono">
                    {message.sources.length} sources
                  </span>
                ) : null}
              </div>
              <span className="text-[11px] text-slate-400 hover:text-cyan-300">
                {showSources ? 'Hide' : 'Show'}
              </span>
            </div>

            {showSources && (
              <div className="space-y-2 pt-1 border-t border-cyan-900/30">
                {/* Search Queries */}
                {message.webSearchQueries && message.webSearchQueries.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1 text-[11px] text-slate-400">
                    <Search className="w-3 h-3 text-slate-500" />
                    <span className="text-slate-500">Queries:</span>
                    {message.webSearchQueries.map((query, qIdx) => (
                      <span
                        key={qIdx}
                        className="px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-cyan-200/80 text-[10px]"
                      >
                        "{query}"
                      </span>
                    ))}
                  </div>
                )}

                {/* Sources list */}
                {message.sources && message.sources.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
                    {message.sources.map((src, sIdx) => (
                      <a
                        key={sIdx}
                        href={src.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between gap-2 p-2 rounded-lg bg-slate-900/90 border border-cyan-900/30 hover:border-cyan-500/50 hover:bg-slate-800/80 transition-all text-xs text-slate-300 hover:text-cyan-300 group/link"
                      >
                        <span className="truncate font-medium">{src.title}</span>
                        <ExternalLink className="w-3 h-3 shrink-0 text-slate-500 group-hover/link:text-cyan-400" />
                      </a>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : null}

        {/* Website Quick Launch Action if runnable HTML detected */}
        {detectedHtml && (
          <div className="p-3 rounded-xl bg-gradient-to-r from-blue-950/60 via-slate-900 to-indigo-950/60 border border-cyan-500/40 flex flex-wrap items-center justify-between gap-3 shadow-[0_0_20px_rgba(6,182,212,0.15)]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300">
                <Sparkles className="w-4 h-4 animate-pulse" />
              </div>
              <div>
                <h4 className="text-xs md:text-sm font-bold text-cyan-200">
                  Interactive Website Application Ready
                </h4>
                <p className="text-[11px] text-slate-400">
                  SenuxGPT built a self-contained responsive website
                </p>
              </div>
            </div>
            <button
              onClick={() => onOpenWebStudio(detectedHtml)}
              className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-[0_0_15px_rgba(6,182,212,0.5)] flex items-center gap-1.5 transition-all"
            >
              <Eye className="w-3.5 h-3.5" />
              Launch Live Preview
            </button>
          </div>
        )}

        {/* Message Content */}
        <div className="text-sm md:text-base leading-relaxed break-words">
          {renderFormattedContent(message.content)}
        </div>

        {/* Image Attachment Card */}
        {message.imageUrl && (
          <div className="mt-3 rounded-xl overflow-hidden border border-cyan-500/30 bg-slate-950 p-2 max-w-lg">
            <div className="relative group/img overflow-hidden rounded-lg">
              <img
                src={message.imageUrl}
                alt="Senux Generated Visual"
                referrerPolicy="no-referrer"
                className="w-full h-auto object-cover rounded-lg shadow-xl"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <a
                  href={message.imageUrl}
                  download="senux-artwork.png"
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1 shadow-lg"
                >
                  <Download className="w-3.5 h-3.5" /> Download
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
