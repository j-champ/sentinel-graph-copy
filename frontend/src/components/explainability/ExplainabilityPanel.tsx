import React from 'react';
import { Cpu, BarChart2, Layers } from 'lucide-react';
import { FeatureAttribution } from '../../types';

interface ExplainabilityPanelProps {
  attributions: FeatureAttribution[];
}

export default function ExplainabilityPanel({ attributions }: ExplainabilityPanelProps) {
  // Normalize delta values for visual bar scaling
  const maxDelta = Math.max(...attributions.map((a) => a.delta), 1.0);

  const formatDelta = (val: number) => {
    if (val >= 1000000) return `+${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `+${(val / 1000).toFixed(1)}K`;
    return `+${val.toFixed(0)}`;
  };

  return (
    <div className="p-4 sm:p-5 rounded-xl border border-cyber-border bg-cyber-card/70 backdrop-blur-md flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-cyber-border pb-3">
        <div className="flex items-center gap-2">
          <BarChart2 className="w-4 h-4 text-cyber-cyan" />
          <h2 className="text-sm font-bold tracking-wider text-slate-100 uppercase font-mono">
            MODEL EXPLAINABILITY & FEATURE ATTRIBUTION
          </h2>
        </div>
        <div className="text-[10px] font-mono text-cyber-muted">FIRST-TO-LAST DELTA ANALYSIS</div>
      </div>

      {/* Top Predictive Feature Deltas */}
      <div className="flex flex-col gap-3">
        <span className="text-[11px] font-mono text-cyber-muted">
          DOMINANT SECURITY FEATURES DRIVING PREDICTION:
        </span>

        {attributions.map((attr, idx) => {
          const pct = Math.min((attr.delta / maxDelta) * 100, 100);

          return (
            <div
              key={idx}
              className="p-3 rounded-lg border border-cyber-border bg-cyber-surface/60 flex flex-col gap-1.5 font-mono"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-200">
                  {idx + 1}. {attr.feature}
                </span>
                <span className="text-cyber-cyan font-bold">{formatDelta(attr.delta)}</span>
              </div>

              {/* Attribution Fill Bar */}
              <div className="w-full h-1.5 rounded-full bg-slate-900 border border-cyber-border overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyber-cyan to-cyber-violet transition-all duration-500"
                  style={{ width: `${Math.max(pct, 5)}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[10px] text-cyber-muted">
                <span>Current State Value: {attr.current_value.toLocaleString(undefined, { maximumFractionDigits: 1 })}</span>
                <span>Rank #{idx + 1} Impact</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Temporal Window Step Attention Breakdown */}
      <div className="p-3.5 rounded-lg border border-cyber-border/80 bg-cyber-surface/80 flex flex-col gap-2.5 font-mono">
        <div className="flex items-center justify-between text-xs">
          <span className="text-cyber-muted flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-cyber-violet" />
            <span>TEMPORAL GRADIENT CONTRIBUTION (5-MIN WINDOW)</span>
          </span>
          <span className="text-[10px] text-cyber-muted">REPRESENTATION DYNAMICS</span>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="p-2 rounded bg-cyber-card border border-cyber-border flex flex-col">
            <span className="text-cyber-muted text-[10px]">T-9 TO T-7</span>
            <span className="font-bold text-slate-300">22.4%</span>
            <span className="text-[9px] text-cyber-muted">Baseline Ref</span>
          </div>

          <div className="p-2 rounded bg-cyber-card border border-cyber-border flex flex-col">
            <span className="text-cyber-muted text-[10px]">T-6 TO T-3</span>
            <span className="font-bold text-cyber-violet">31.2%</span>
            <span className="text-[9px] text-cyber-muted">Background Drift</span>
          </div>

          <div className="p-2 rounded bg-cyber-card border border-cyber-cyan/30 flex flex-col bg-cyber-cyan/5">
            <span className="text-cyber-cyan text-[10px]">T-2 TO T</span>
            <span className="font-bold text-cyber-cyan">46.4%</span>
            <span className="text-[9px] text-cyber-cyan font-semibold">60s Momentum</span>
          </div>
        </div>
      </div>
    </div>
  );
}
