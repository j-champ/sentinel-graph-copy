import React from 'react';
import { X, Award, ExternalLink, Cpu, Info } from 'lucide-react';
import { VERIFIED_BENCHMARKS } from '../../constants/benchmarks';

interface ModelBenchmarkDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ModelBenchmarkDrawer({ isOpen, onClose }: ModelBenchmarkDrawerProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-2xl border border-cyber-border bg-cyber-surface p-6 shadow-2xl flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-cyber-border pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyber-cyan/10 border border-cyber-cyan/30 text-cyber-cyan">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-mono tracking-tight text-slate-100 flex items-center gap-2">
                <span>MASTER RESEARCH BENCHMARK MATRIX</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyber-violet/20 border border-cyber-violet/40 text-cyber-violet">
                  UNTOUCHED HOLDOUT TEST SET
                </span>
              </h2>
              <p className="text-xs text-cyber-muted font-mono">
                Evaluated across 2,840 continuous sequence tensors (Feb 28 Infiltration & Mar 02 Botnet)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg border border-cyber-border hover:border-slate-400 text-cyber-muted hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Benchmark Matrix Table */}
        <div className="overflow-x-auto border border-cyber-border rounded-xl">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-cyber-card border-b border-cyber-border text-cyber-muted text-[11px]">
              <tr>
                <th className="py-3 px-4 font-semibold">MODEL ARCHITECTURE</th>
                <th className="py-3 px-3 font-semibold">REPRESENTATION</th>
                <th className="py-3 px-3 font-semibold text-right">F1 SCORE</th>
                <th className="py-3 px-3 font-semibold text-right">PR-AUC</th>
                <th className="py-3 px-3 font-semibold text-right">ROC-AUC</th>
                <th className="py-3 px-3 font-semibold text-right">RECALL</th>
                <th className="py-3 px-3 font-semibold text-right">PRECISION</th>
                <th className="py-3 px-3 font-semibold text-right">FPR</th>
                <th className="py-3 px-3 font-semibold text-right">LATENCY</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cyber-border/60">
              {VERIFIED_BENCHMARKS.map((m, idx) => (
                <tr
                  key={idx}
                  className={`hover:bg-cyber-card/50 transition-colors ${
                    m.highlight
                      ? 'bg-cyber-cyan/5 font-semibold text-cyber-cyan'
                      : m.gnn
                      ? 'bg-cyber-violet/5 font-semibold text-cyber-violet'
                      : 'text-slate-300'
                  }`}
                >
                  <td className="py-3 px-4 flex items-center gap-2">
                    {m.highlight && <span className="w-1.5 h-1.5 rounded-full bg-cyber-cyan animate-pulse" />}
                    {m.gnn && <span className="w-1.5 h-1.5 rounded-full bg-cyber-violet animate-pulse" />}
                    <span>{m.model}</span>
                  </td>
                  <td className="py-3 px-3 text-cyber-muted text-[11px]">{m.type}</td>
                  <td className="py-3 px-3 text-right">{m.f1}</td>
                  <td className="py-3 px-3 text-right">{m.prAuc}</td>
                  <td className="py-3 px-3 text-right">{m.rocAuc}</td>
                  <td className="py-3 px-3 text-right">{m.recall}</td>
                  <td className="py-3 px-3 text-right">{m.precision}</td>
                  <td className="py-3 px-3 text-right">{m.fpr}</td>
                  <td className="py-3 px-3 text-right text-cyber-muted">{m.latency}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Scientific Footnotes & Findings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
          <div className="p-3.5 rounded-xl border border-cyber-border bg-cyber-card/60 flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5 text-cyber-cyan font-bold">
              <Info className="w-4 h-4" />
              <span>THE PERSISTENCE TRAP IN NEXT-STATE IDS</span>
            </div>
            <p className="text-cyber-muted text-[11px] font-sans leading-relaxed">
              The naive Persistence Baseline achieves F1=0.9968 simply because volumetric floods persist unbroken
              for hundreds of consecutive 30s windows. High performance on next-state classification is an artifact of
              autocorrelation, not predictive foresight.
            </p>
          </div>

          <div className="p-3.5 rounded-xl border border-cyber-border bg-cyber-card/60 flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5 text-cyber-violet font-bold">
              <Cpu className="w-4 h-4" />
              <span>SPATIO-TEMPORAL GNN (ST-GNN) ADVANTAGE</span>
            </div>
            <p className="text-cyber-muted text-[11px] font-sans leading-relaxed">
              ST-GNN operates on 16 discrete port nodes (55,426 params; 1.17 ms latency). While broad volumetric
              floods aggregate easily in flat LSTM models, ST-GNN provides superior port localization during stealthy
              multi-vector reconnaissance.
            </p>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-cyber-card border border-cyber-border hover:border-slate-400 font-mono text-xs font-bold text-slate-200 transition-colors"
          >
            CLOSE BENCHMARK DRAWER
          </button>
        </div>
      </div>
    </div>
  );
}
