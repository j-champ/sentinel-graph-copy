import React from 'react';
import { Shield, Activity, Radio, Cpu, Award, Zap, RefreshCw, Sliders, ExternalLink } from 'lucide-react';
import { OperatingMode } from '../../types';
import { SCENARIOS } from '../../constants/scenarios';

interface HeaderProps {
  mode: OperatingMode;
  onChangeMode: (mode: OperatingMode) => void;
  selectedScenarioKey: string;
  onChangeScenario: (key: string) => void;
  backendOnline: boolean;
  onOpenBenchmarks: () => void;
  onTriggerLiveInference: () => void;
  isTriggeringInference: boolean;
  reducedMotion: boolean;
  onToggleReducedMotion: () => void;
}

export default function Header({
  mode,
  onChangeMode,
  selectedScenarioKey,
  onChangeScenario,
  backendOnline,
  onOpenBenchmarks,
  onTriggerLiveInference,
  isTriggeringInference,
  reducedMotion,
  onToggleReducedMotion,
}: HeaderProps) {
  return (
    <header className="border-b border-cyber-border bg-cyber-surface/90 backdrop-blur-md px-4 py-3 sm:px-6 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-40">
      {/* Brand Identification */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-cyber-cyan/10 border border-cyber-cyan/30 flex items-center justify-center text-cyber-cyan shadow-glow-cyan">
          <Shield className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-lg font-bold tracking-tight bg-gradient-to-r from-cyber-cyan via-blue-400 to-cyber-violet bg-clip-text text-transparent">
              SENTINELGRAPH
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border border-cyber-cyan/30 bg-cyber-cyan/10 text-cyber-cyan uppercase font-semibold">
              Spatial Intelligence
            </span>
          </div>
          <p className="text-xs text-cyber-muted font-mono hidden md:block">
            Temporal Network Attack Progression & Early-Warning Forecasting System
          </p>
        </div>
      </div>

      {/* Controls & Mode Switches */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Mode Selector */}
        <div className="flex items-center bg-cyber-card border border-cyber-border rounded-lg p-1 text-xs font-mono">
          <button
            onClick={() => onChangeMode('SCENARIO_SIMULATION')}
            className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${
              mode === 'SCENARIO_SIMULATION'
                ? 'bg-cyber-violet/20 text-cyber-violet border border-cyber-violet/40 font-semibold'
                : 'text-cyber-muted hover:text-slate-200'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Scenario Mode</span>
          </button>
          <button
            onClick={() => onChangeMode('LIVE_INTELLIGENCE')}
            className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${
              mode === 'LIVE_INTELLIGENCE'
                ? 'bg-cyber-cyan/20 text-cyber-cyan border border-cyber-cyan/40 font-semibold'
                : 'text-cyber-muted hover:text-slate-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Live Backend</span>
          </button>
        </div>

        {/* Scenario Selection Dropdown (Only in Scenario Mode) */}
        {mode === 'SCENARIO_SIMULATION' ? (
          <select
            value={selectedScenarioKey}
            onChange={(e) => onChangeScenario(e.target.value)}
            className="bg-cyber-card border border-cyber-border text-slate-200 text-xs font-mono rounded-lg px-3 py-1.5 focus:border-cyber-violet focus:outline-none"
          >
            {Object.entries(SCENARIOS).map(([key, s]) => (
              <option key={key} value={key}>
                {s.name}
              </option>
            ))}
          </select>
        ) : (
          /* Live Trigger Button (Only in Live Mode) */
          <button
            onClick={onTriggerLiveInference}
            disabled={isTriggeringInference || !backendOnline}
            className="px-3 py-1.5 rounded-lg bg-cyber-cyan/20 border border-cyber-cyan/40 hover:bg-cyber-cyan/30 text-cyber-cyan text-xs font-mono font-bold flex items-center gap-1.5 disabled:opacity-50 transition-all shadow-glow-cyan"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isTriggeringInference ? 'animate-spin' : ''}`} />
            <span>TRIGGER INFERENCE</span>
          </button>
        )}

        {/* Backend Online Status Pill */}
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-mono ${
            backendOnline
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-red-500/10 border-red-500/30 text-red-400'
          }`}
          title={backendOnline ? 'Python REST API connected' : 'Python REST API unavailable at localhost:8080'}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              backendOnline ? 'bg-emerald-400 animate-pulse' : 'bg-red-500'
            }`}
          />
          <span className="hidden sm:inline">{backendOnline ? 'BACKEND ONLINE' : 'OFFLINE'}</span>
        </div>

        {/* Open Benchmarks Modal Button */}
        <button
          onClick={onOpenBenchmarks}
          className="p-1.5 sm:px-2.5 sm:py-1 rounded-lg bg-cyber-card border border-cyber-border hover:border-cyber-borderLight text-slate-300 text-xs font-mono flex items-center gap-1.5 transition-colors"
          title="Open Master Benchmark Matrix"
        >
          <Award className="w-3.5 h-3.5 text-cyber-cyan" />
          <span className="hidden md:inline">BENCHMARKS</span>
        </button>

        {/* Motion Accessibility Toggle */}
        <button
          onClick={onToggleReducedMotion}
          className={`p-1.5 rounded-lg border text-xs font-mono transition-colors ${
            reducedMotion
              ? 'bg-cyber-amber/20 border-cyber-amber text-cyber-amber'
              : 'bg-cyber-card border-cyber-border text-cyber-muted hover:text-white'
          }`}
          title={reducedMotion ? 'Reduced motion enabled' : 'Toggle reduced motion'}
        >
          <Sliders className="w-3.5 h-3.5" />
        </button>

        {/* Link to Legacy Dashboard */}
        <a
          href="/dashboard"
          target="_blank"
          rel="noreferrer"
          className="hidden lg:flex items-center gap-1 text-[11px] font-mono text-cyber-muted hover:text-cyber-cyan transition-colors"
          title="Open legacy scenario dashboard"
        >
          <span>LEGACY UI</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </header>
  );
}
