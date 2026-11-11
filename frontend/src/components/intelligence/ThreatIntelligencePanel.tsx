import React from 'react';
import { ShieldAlert, ShieldCheck, AlertCircle, ExternalLink, Network, Shield } from 'lucide-react';
import { AlertLevel, MitreAttack } from '../../types';
import { PortNodeDefinition } from '../../types';

interface ThreatIntelligencePanelProps {
  alertLevel: AlertLevel;
  mitre: MitreAttack;
  activePortNode: PortNodeDefinition | null;
  expectedFpr?: string;
  isSimulated?: boolean;
}

export default function ThreatIntelligencePanel({
  alertLevel,
  mitre,
  activePortNode,
  expectedFpr = '<= 5%',
  isSimulated = false,
}: ThreatIntelligencePanelProps) {
  // Banner background and border accents based on status
  const getBannerStyle = () => {
    switch (alertLevel) {
      case 'CRITICAL':
        return {
          bg: 'bg-red-500/10 border-red-500/40 text-red-400',
          badge: 'bg-red-500 text-white',
          pulse: 'bg-red-500',
          icon: <ShieldAlert className="w-6 h-6 text-red-400" />,
        };
      case 'ELEVATED':
        return {
          bg: 'bg-orange-500/10 border-orange-500/40 text-orange-400',
          badge: 'bg-orange-500 text-white',
          pulse: 'bg-orange-500',
          icon: <AlertCircle className="w-6 h-6 text-orange-400" />,
        };
      case 'WATCH':
        return {
          bg: 'bg-amber-400/10 border-amber-400/40 text-amber-400',
          badge: 'bg-amber-400 text-amber-950',
          pulse: 'bg-amber-400',
          icon: <AlertCircle className="w-6 h-6 text-amber-400" />,
        };
      default:
        return {
          bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
          badge: 'bg-emerald-500 text-emerald-950',
          pulse: 'bg-emerald-400',
          icon: <ShieldCheck className="w-6 h-6 text-emerald-400" />,
        };
    }
  };

  const style = getBannerStyle();

  return (
    <div className="p-4 sm:p-5 rounded-xl border border-cyber-border bg-cyber-card/70 backdrop-blur-md flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-cyber-border pb-3">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-cyber-cyan" />
          <h2 className="text-sm font-bold tracking-wider text-slate-100 uppercase font-mono">
            THREAT INTELLIGENCE & MITRE ATT&CK MAPPING
          </h2>
        </div>
        <div className="text-[10px] font-mono text-cyber-muted">
          OPERATIONAL TARGET: FPR {expectedFpr}
        </div>
      </div>

      {/* Main Threat Status Banner */}
      <div className={`p-4 rounded-xl border flex flex-wrap items-center justify-between gap-4 ${style.bg}`}>
        <div className="flex items-center gap-3.5">
          <div className="p-2 rounded-lg bg-cyber-surface/60 border border-cyber-border">{style.icon}</div>
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-cyber-muted">
              EARLY-WARNING THREAT LEVEL
            </div>
            <div className="text-xl sm:text-2xl font-black font-mono tracking-tight flex items-center gap-2">
              <span>{alertLevel}</span>
              <span className={`w-2.5 h-2.5 rounded-full ${style.pulse} animate-ping`} />
            </div>
          </div>
        </div>

        {/* Operational False Alarm Rate Guard */}
        <div className="text-right font-mono">
          <div className="text-[10px] text-cyber-muted">OPERATIONAL ALERT RATE</div>
          <div className="text-xs font-semibold text-slate-200">
            {alertLevel === 'CRITICAL' ? '< 0.8 Alerts / Hr' : 'Nominal Background'}
          </div>
        </div>
      </div>

      {/* MITRE ATT&CK Behavioral Stage Card */}
      <div className="p-4 rounded-xl border border-cyber-border bg-cyber-surface/80 flex flex-col gap-3 font-mono">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs text-cyber-muted">MITRE ATT&CK TACTIC / TECHNIQUE</span>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-cyber-violet/20 border border-cyber-violet/40 text-cyber-violet text-xs font-bold">
              {mitre.tactic}
            </span>
            {mitre.technique_id !== 'N/A' && (
              <span className="px-2 py-0.5 rounded bg-cyber-card border border-cyber-border text-[11px] text-cyber-cyan font-bold flex items-center gap-1">
                <span>{mitre.technique_id}</span>
              </span>
            )}
          </div>
        </div>

        <p className="text-xs text-slate-300 font-sans leading-relaxed">
          {mitre.description}
        </p>
      </div>

      {/* Target Port & Active Topology Service Tracker */}
      <div className="p-3.5 rounded-lg border border-cyber-border/80 bg-cyber-surface/60 flex items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-2 text-cyber-muted">
          <Network className="w-4 h-4 text-cyber-cyan" />
          <span>FOCUSED TARGET PORT:</span>
        </div>

        {activePortNode ? (
          <div className="flex items-center gap-2">
            <span className="font-bold text-cyber-cyan">PORT {activePortNode.port}</span>
            <span className="text-cyber-muted">({activePortNode.name} • {activePortNode.protocol})</span>
          </div>
        ) : (
          <span className="text-cyber-muted italic">Global Multi-Port Activity</span>
        )}
      </div>
    </div>
  );
}
