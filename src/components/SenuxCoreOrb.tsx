import React from 'react';
import { Sparkles, Radio, Cpu, Mic } from 'lucide-react';

interface SenuxCoreOrbProps {
  status: 'idle' | 'thinking' | 'speaking' | 'listening';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

export const SenuxCoreOrb: React.FC<SenuxCoreOrbProps> = ({
  status,
  size = 'md',
  onClick,
}) => {
  const sizeMap = {
    sm: 'w-10 h-10',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
  };

  const ringSizeMap = {
    sm: 'w-14 h-14 -inset-2',
    md: 'w-24 h-24 -inset-4',
    lg: 'w-36 h-36 -inset-6',
  };

  const outerRingMap = {
    sm: 'w-20 h-20 -inset-5',
    md: 'w-32 h-32 -inset-8',
    lg: 'w-48 h-48 -inset-12',
  };

  return (
    <div
      id="senux-core-orb-container"
      onClick={onClick}
      className={`relative flex items-center justify-center cursor-pointer select-none group transition-transform duration-300 hover:scale-105`}
    >
      {/* Outer ambient cosmic halo */}
      <div
        className={`absolute rounded-full transition-all duration-700 blur-xl ${
          status === 'thinking'
            ? 'bg-gradient-to-r from-blue-600 via-cyan-400 to-indigo-600 opacity-80 scale-125 animate-pulse'
            : status === 'speaking'
            ? 'bg-gradient-to-r from-cyan-400 via-sky-500 to-purple-600 opacity-90 scale-130 animate-pulse'
            : status === 'listening'
            ? 'bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500 opacity-90 scale-120 animate-pulse'
            : 'bg-gradient-to-r from-blue-600/50 via-cyan-500/40 to-indigo-600/50 opacity-40 group-hover:opacity-70'
        } ${outerRingMap[size]}`}
      />

      {/* Orbiting star ring 1 (Clockwise) */}
      <div
        className={`absolute rounded-full border border-cyan-500/30 border-dashed pointer-events-none ${
          status === 'thinking'
            ? 'animate-orbital-fast border-cyan-400/80'
            : 'animate-orbital border-cyan-500/40'
        } ${ringSizeMap[size]}`}
      >
        {/* Star node on orbit 1 */}
        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-cyan-300 shadow-[0_0_8px_#38bdf8] flex items-center justify-center">
          <div className="w-1 h-1 rounded-full bg-white" />
        </div>
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-blue-300 shadow-[0_0_6px_#60a5fa]" />
      </div>

      {/* Orbiting star ring 2 (Counter-Clockwise) */}
      <div
        className={`absolute rounded-full border border-blue-400/20 pointer-events-none ${
          status === 'thinking'
            ? 'animate-orbital-fast'
            : 'animate-orbital-reverse'
        } ${outerRingMap[size]}`}
        style={{ animationDuration: status === 'thinking' ? '6s' : '22s' }}
      >
        {/* Star node on orbit 2 */}
        <div className="absolute top-1/2 -left-1.5 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-sky-200 shadow-[0_0_10px_#38bdf8] flex items-center justify-center">
          <Sparkles className="w-2 h-2 text-cyan-500 animate-spin" style={{ animationDuration: '4s' }} />
        </div>
        <div className="absolute top-1/2 -right-1 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-indigo-300 shadow-[0_0_6px_#818cf8]" />
      </div>

      {/* Glowing Central Nucleus */}
      <div
        className={`relative z-10 rounded-full flex items-center justify-center shadow-lg transition-all duration-500 overflow-hidden ${
          sizeMap[size]
        } ${
          status === 'thinking'
            ? 'bg-gradient-to-br from-cyan-400 via-blue-600 to-indigo-700 shadow-[0_0_30px_#06b6d4]'
            : status === 'speaking'
            ? 'bg-gradient-to-br from-sky-400 via-cyan-500 to-violet-600 shadow-[0_0_35px_#38bdf8]'
            : status === 'listening'
            ? 'bg-gradient-to-br from-teal-400 via-cyan-500 to-blue-600 shadow-[0_0_35px_#2dd4bf]'
            : 'bg-gradient-to-br from-cyan-500 via-blue-600 to-slate-900 shadow-[0_0_20px_rgba(6,182,212,0.5)] border border-cyan-400/50'
        }`}
      >
        {/* Shimmer overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-white/20 via-transparent to-black/30 pointer-events-none" />

        {/* Central Icon / Waveform */}
        {status === 'speaking' ? (
          <div className="flex items-center gap-0.5 h-6">
            <span className="w-1 bg-white rounded-full animate-wave-bar" style={{ animation: 'wave-bar 0.6s infinite 0.1s' }} />
            <span className="w-1 bg-white rounded-full animate-wave-bar" style={{ animation: 'wave-bar 0.6s infinite 0.25s' }} />
            <span className="w-1 bg-white rounded-full animate-wave-bar" style={{ animation: 'wave-bar 0.6s infinite 0.4s' }} />
            <span className="w-1 bg-white rounded-full animate-wave-bar" style={{ animation: 'wave-bar 0.6s infinite 0.15s' }} />
          </div>
        ) : status === 'listening' ? (
          <Mic className="w-1/2 h-1/2 text-white animate-pulse" />
        ) : status === 'thinking' ? (
          <Radio className="w-1/2 h-1/2 text-white animate-spin" style={{ animationDuration: '3s' }} />
        ) : (
          <Cpu className="w-1/2 h-1/2 text-cyan-100 group-hover:text-white transition-colors" />
        )}
      </div>
    </div>
  );
};
