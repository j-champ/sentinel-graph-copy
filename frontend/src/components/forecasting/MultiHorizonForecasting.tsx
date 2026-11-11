import React from 'react';
import { ForecastHorizons, AlertLevel } from '../../types';
import { Clock, TrendingUp, AlertOctagon, CheckCircle2 } from 'lucide-react';

interface MultiHorizonForecastingProps {
  horizons: ForecastHorizons;
  intensity: number;
  xgbRisk?: number;
  alertLevel: AlertLevel;
}

export default function MultiHorizonForecasting({
  horizons,
  intensity,
  xgbRisk,
  alertLevel,
}: MultiHorizonForecastingProps) {
  const horizonConfig = [
    { label: '30s Lookahead (h=1)', key: '30s_ahead' as const, time: '30 SEC' },
    { label: '60s Lookahead (h=2)', key: '60s_ahead' as const, time: '1 MIN' },
    { label: '120s Lookahead (h=4)', key: '120s_ahead' as const, time: '2 MIN' },
    { label: '300s Lookahead (h=10)', key: '300s_ahead' as const, time: '5 MIN' },
  ];

  // Helper for color coding based on threshold
  const getHorizonColor = (val: number) => {
    if (val >= 0.85) return 'from-red-500 to-rose-600';
    if (val >= 0.50) return 'from-orange-500 to-amber-600';
    if (val >= 0.35) return 'from-amber-400 to-yellow-500';
    return 'from-cyan-400 to-blue-500';
  };

  const getTextColor = (val: number) => {
    if (val >= 0.85) return 'text-red-400';
    if (val >= 0.50) return 'text-orange-400';
    if (val >= 0.35) return 'text-amber-400';
    return 'text-cyan-400';
  };

  return (
    <div className="p-4 sm:p-5 rounded-xl border border-cyber-border bg-cyber-card/70 backdrop-blur-md flex flex-col gap-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-cyber-border pb-3">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-cyber-cyan" />
          <h2 className="text-sm font-bold tracking-wider text-slate-100 uppercase font-mono">
            TEMPORAL ATTACK PROBABILITY ROLLOUT
          </h2>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-mono text-cyber-muted">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span> θ=0.35 (FPR≤5%)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-400"></span> θ=0.85 (CRITICAL)
          </span>
        </div>
      </div>

      {/* 4 Multi-Horizon Visual Progress Gauges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {horizonConfig.map((item) => {
          const prob = horizons[item.key] ?? 0.0;
          const pct = Math.min(Math.max(prob * 100, 0), 100);

          return (
            <div
              key={item.key}
              className="p-3 rounded-lg border border-cyber-border bg-cyber-surface/60 flex flex-col gap-2"
            >
              <div className="flex items-center justify-between font-mono text-xs">
                <span className="text-cyber-muted">{item.label}</span>
                <span className={`font-bold ${getTextColor(prob)}`}>
                  {(prob * 100).toFixed(1)}%
                </span>
              </div>

              {/* Progress track with threshold markers */}
              <div className="relative w-full h-2.5 rounded-full bg-slate-900 border border-cyber-border overflow-hidden">
                <div
                  className={`h-full rounded-full bg-gradient-to-r transition-all duration-500 ${getHorizonColor(prob)}`}
                  style={{ width: `${pct}%` }}
                />
                {/* 35% Threshold Line */}
                <div className="absolute top-0 bottom-0 left-[35%] w-[1px] bg-amber-400/60 z-10" />
                {/* 85% Threshold Line */}
                <div className="absolute top-0 bottom-0 left-[85%] w-[1px] bg-red-500/60 z-10" />
              </div>

              <div className="flex items-center justify-between text-[10px] font-mono text-cyber-muted/80">
                <span>LOOKAHEAD: {item.time}</span>
                <span>STATUS: {prob >= 0.35 ? 'ELEVATED RISK' : 'NOMINAL'}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Continuous Attack Intensity & Dual Classifier Telemetry */}
      <div className="p-3.5 rounded-lg border border-cyber-border/80 bg-cyber-surface/80 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono">
        <div className="flex-1 w-full">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-cyber-muted flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-cyber-violet" />
              <span>PREDICTED ATTACK INTENSITY (y_intensity)</span>
            </span>
            <span className="font-bold text-cyber-violet text-sm">
              {(intensity * 100).toFixed(1)}%
            </span>
          </div>

          <div className="w-full h-2 rounded-full bg-slate-900 border border-cyber-border overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-500 via-cyber-violet to-rose-500 transition-all duration-500"
              style={{ width: `${Math.min(intensity * 100, 100)}%` }}
            />
          </div>
          <div className="text-[10px] text-cyber-muted mt-1">
            Continuous fraction of future network traffic predicted to be malicious
          </div>
        </div>

        {xgbRisk !== undefined && (
          <div className="w-full sm:w-auto sm:border-l sm:border-cyber-border sm:pl-4 flex flex-col justify-center">
            <span className="text-[10px] text-cyber-muted">SECONDARY XGBOOST RISK</span>
            <span className="text-sm font-bold text-slate-200">
              {(xgbRisk * 100).toFixed(1)}%
            </span>
            <span className="text-[9px] text-cyber-muted">FLAT 240-DIM BASELINE</span>
          </div>
        )}
      </div>
    </div>
  );
}
