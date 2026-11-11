import React from 'react';
import { Play, Pause, SkipBack, SkipForward, FastForward, AlertTriangle, ShieldCheck } from 'lucide-react';
import { AlertLevel, ScenarioStep } from '../../types';

interface ProgressionTimelineProps {
  steps: ScenarioStep[];
  currentStepIndex: number;
  onSelectStep: (index: number) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  playbackSpeed: number;
  onChangeSpeed: (speed: number) => void;
  isOnsetDetected?: boolean;
}

export default function ProgressionTimeline({
  steps,
  currentStepIndex,
  onSelectStep,
  isPlaying,
  onTogglePlay,
  playbackSpeed,
  onChangeSpeed,
  isOnsetDetected = false,
}: ProgressionTimelineProps) {
  const current = steps[currentStepIndex] || steps[0];

  const getStepColor = (status: AlertLevel) => {
    switch (status) {
      case 'CRITICAL':
        return 'bg-red-500 border-red-400 text-red-200';
      case 'ELEVATED':
        return 'bg-orange-500 border-orange-400 text-orange-200';
      case 'WATCH':
        return 'bg-amber-400 border-amber-300 text-amber-950';
      default:
        return 'bg-cyber-cyan border-cyan-300 text-cyan-950';
    }
  };

  return (
    <div className="p-4 sm:p-5 rounded-xl border border-cyber-border bg-cyber-card/70 backdrop-blur-md flex flex-col gap-4">
      {/* Header and Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-cyber-border pb-3">
        <div className="flex items-center gap-2">
          <FastForward className="w-4 h-4 text-cyber-violet" />
          <h2 className="text-sm font-bold tracking-wider text-slate-100 uppercase font-mono">
            ATTACK PROGRESSION TIMELINE (5-MIN WINDOW)
          </h2>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center gap-2 font-mono text-xs">
          <button
            onClick={() => onSelectStep(Math.max(0, currentStepIndex - 1))}
            className="p-1.5 rounded bg-cyber-surface border border-cyber-border hover:border-cyber-borderLight text-slate-300 transition-colors"
            title="Step Backward"
          >
            <SkipBack className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onTogglePlay}
            className={`px-3 py-1.5 rounded flex items-center gap-1.5 font-bold transition-all ${
              isPlaying
                ? 'bg-cyber-amber/20 text-cyber-amber border border-cyber-amber/40'
                : 'bg-cyber-cyan/20 text-cyber-cyan border border-cyber-cyan/40 hover:bg-cyber-cyan/30'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                <span>PAUSE</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" />
                <span>REPLAY</span>
              </>
            )}
          </button>

          <button
            onClick={() => onSelectStep(Math.min(steps.length - 1, currentStepIndex + 1))}
            className="p-1.5 rounded bg-cyber-surface border border-cyber-border hover:border-cyber-borderLight text-slate-300 transition-colors"
            title="Step Forward"
          >
            <SkipForward className="w-3.5 h-3.5" />
          </button>

          {/* Speed Toggle */}
          <div className="flex items-center bg-cyber-surface border border-cyber-border rounded overflow-hidden">
            {[1, 2, 5].map((spd) => (
              <button
                key={spd}
                onClick={() => onChangeSpeed(spd)}
                className={`px-2 py-1 text-[10px] font-semibold transition-colors ${
                  playbackSpeed === spd
                    ? 'bg-cyber-violet text-white'
                    : 'text-cyber-muted hover:text-slate-200'
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Interactive Step Slider / Timeline Track */}
      <div className="relative pt-4 pb-2">
        {/* Track Line */}
        <div className="absolute top-[26px] left-0 right-0 h-1 bg-cyber-surface border border-cyber-border rounded-full" />
        <div
          className="absolute top-[26px] left-0 h-1 bg-gradient-to-r from-cyber-cyan via-cyber-violet to-red-500 rounded-full transition-all duration-300"
          style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
        />

        {/* Step Nodes */}
        <div className="relative flex items-center justify-between">
          {steps.map((st, idx) => {
            const isSelected = idx === currentStepIndex;
            return (
              <button
                key={st.time}
                onClick={() => onSelectStep(idx)}
                className="group flex flex-col items-center focus:outline-none"
              >
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                    isSelected
                      ? `${getStepColor(st.status)} scale-125 shadow-lg`
                      : 'bg-cyber-card border-cyber-border group-hover:border-slate-400'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-current' : 'bg-transparent'}`} />
                </div>
                <span
                  className={`mt-2 font-mono text-[10px] transition-colors ${
                    isSelected ? 'font-bold text-cyber-cyan' : 'text-cyber-muted group-hover:text-slate-300'
                  }`}
                >
                  {st.time}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Current Step Telemetry Card */}
      <div className="p-3 rounded-lg border border-cyber-border bg-cyber-surface/80 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-3">
          <span className="text-cyber-cyan font-bold">{current.time}</span>
          <span className="text-cyber-borderLight">•</span>
          <span className="text-slate-300">{current.description}</span>
        </div>

        {/* Attack Onset Detection Badge */}
        {isOnsetDetected && (
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-red-500/20 border border-red-500/40 text-red-400 text-[11px] font-bold animate-pulse">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>ATTACK ONSET DETECTED (RISK SET TRANSITION)</span>
          </div>
        )}
      </div>
    </div>
  );
}
