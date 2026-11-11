import React, { useState, useEffect, useCallback, useRef } from 'react';
import Header from './components/header/Header';
import NetworkTopology3D from './components/canvas/NetworkTopology3D';
import MultiHorizonForecasting from './components/forecasting/MultiHorizonForecasting';
import ProgressionTimeline from './components/timeline/ProgressionTimeline';
import ThreatIntelligencePanel from './components/intelligence/ThreatIntelligencePanel';
import ExplainabilityPanel from './components/explainability/ExplainabilityPanel';
import ModelBenchmarkDrawer from './components/benchmarks/ModelBenchmarkDrawer';
import { OperatingMode, AlertLevel, PortNodeDefinition, ForecastResponse, HealthResponse } from './types';
import { SCENARIOS } from './constants/scenarios';
import { PORT_MAP, CANONICAL_PORTS } from './constants/nodes';
import { checkBackendHealth, requestForecast } from './services/api';
import { AlertTriangle, Server, Shield, Activity, Info } from 'lucide-react';

export default function App() {
  // Operating Mode: Scenario Simulation vs Live Backend Intelligence
  const [mode, setMode] = useState<OperatingMode>('SCENARIO_SIMULATION');

  // Scenario Simulation State
  const [selectedScenarioKey, setSelectedScenarioKey] = useState<string>('botnet');
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(3); // Default to WATCH step
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);

  // Live Backend State
  const [backendOnline, setBackendOnline] = useState<boolean>(false);
  const [liveHealth, setLiveHealth] = useState<HealthResponse | null>(null);
  const [liveForecast, setLiveForecast] = useState<ForecastResponse | null>(null);
  const [liveError, setLiveError] = useState<string | null>(null);
  const [isTriggeringInference, setIsTriggeringInference] = useState<boolean>(false);

  // Topology Interaction State
  const [selectedPortNode, setSelectedPortNode] = useState<PortNodeDefinition | null>(null);
  const [reducedMotion, setReducedMotion] = useState<boolean>(false);
  const [isBenchmarksOpen, setIsBenchmarksOpen] = useState<boolean>(false);

  // Active scenario data
  const scenario = SCENARIOS[selectedScenarioKey] || SCENARIOS.botnet;
  const currentStep = scenario.steps[currentStepIndex] || scenario.steps[0];

  // Poll backend health on mount and periodically
  const verifyHealth = useCallback(async () => {
    try {
      const h = await checkBackendHealth();
      setBackendOnline(true);
      setLiveHealth(h);
      setLiveError(null);
    } catch {
      setBackendOnline(false);
      setLiveHealth(null);
    }
  }, []);

  useEffect(() => {
    verifyHealth();
    const interval = setInterval(verifyHealth, 10000);
    return () => clearInterval(interval);
  }, [verifyHealth]);

  // Handle Mode Change (Clear stale data per requirement)
  const handleModeChange = (newMode: OperatingMode) => {
    setMode(newMode);
    setSelectedPortNode(null);
    setIsPlaying(false);
    if (newMode === 'LIVE_INTELLIGENCE' && !liveForecast && backendOnline) {
      triggerLiveInference();
    }
  };

  // Trigger real backend inference with realistic 10x24 input tensor
  const triggerLiveInference = async () => {
    setIsTriggeringInference(true);
    setLiveError(null);
    try {
      // Create a normalized (10, 24) sequence representing incoming traffic
      const testSequence: number[][] = Array.from({ length: 10 }, (_, stepIdx) => {
        const row = new Array(24).fill(0.0);
        row[0] = 5000 + stepIdx * 1500; // total_packets_sum
        row[1] = 850000 + stepIdx * 450000; // total_bytes_sum
        row[2] = 25000 + stepIdx * 8000; // packet_rate_mean
        row[3] = 45000; // packet_rate_max
        row[4] = 0.45; // syn_rate_mean
        row[5] = 0.15; // rst_rate_mean
        row[6] = 1200000; // flow_duration_mean
        row[7] = 25000000; // byte_rate_max
        return row;
      });

      const forecast = await requestForecast(testSequence);
      setLiveForecast(forecast);
      setLiveError(null);
    } catch (err: any) {
      setLiveError(err.message || 'Failed to reach Python backend inference service.');
    } finally {
      setIsTriggeringInference(false);
    }
  };

  // Playback timer for scenario simulation
  useEffect(() => {
    if (mode !== 'SCENARIO_SIMULATION' || !isPlaying) return;

    const intervalTime = 1800 / playbackSpeed;
    const timer = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev >= scenario.steps.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [mode, isPlaying, playbackSpeed, scenario.steps.length]);

  // Compute unified display telemetry based on active mode
  const displayTelemetry = React.useMemo(() => {
    if (mode === 'LIVE_INTELLIGENCE' && liveForecast) {
      return {
        horizons: liveForecast.forecast_horizons,
        intensity: liveForecast.predicted_intensity,
        xgbRisk: liveForecast.xgb_secondary_risk,
        alertLevel: liveForecast.early_warning.status,
        mitre: liveForecast.mitre_attack,
        attributions: liveForecast.top_attributions,
        activePort: selectedPortNode?.port ?? 80,
        targetPortNode: selectedPortNode ?? PORT_MAP[80],
        isOnset: false,
        isSimulated: false,
      };
    }

    // Default to Scenario Simulation
    const targetNode = PORT_MAP[currentStep.targetPort] || PORT_MAP[80];
    const isOnset = currentStep.status !== 'NORMAL' && currentStepIndex > 0 && scenario.steps[currentStepIndex - 1].status === 'NORMAL';

    return {
      horizons: {
        '30s_ahead': currentStep.h1,
        '60s_ahead': currentStep.h2,
        '120s_ahead': currentStep.h4,
        '300s_ahead': currentStep.h10,
      },
      intensity: currentStep.int,
      xgbRisk: Math.max(0.01, currentStep.h1 * 0.85),
      alertLevel: currentStep.status,
      mitre: {
        tactic: currentStep.mitre,
        technique_id: currentStep.technique_id,
        description: currentStep.description,
      },
      attributions: [
        { feature: currentStep.topAttr, delta: currentStep.delta, current_value: currentStep.delta * 1.5 },
        { feature: 'flow_duration_mean', delta: currentStep.delta * 0.45, current_value: 125000 },
        { feature: 'rst_rate_mean', delta: currentStep.delta * 0.2, current_value: 0.12 },
      ],
      activePort: selectedPortNode?.port ?? currentStep.targetPort,
      targetPortNode: selectedPortNode ?? targetNode,
      isOnset,
      isSimulated: true,
    };
  }, [mode, liveForecast, currentStep, currentStepIndex, scenario.steps, selectedPortNode]);

  return (
    <div className="min-h-screen bg-cyber-bg text-slate-100 flex flex-col font-sans cyber-grid selection:bg-cyber-cyan/20 selection:text-cyber-cyan">
      {/* Header */}
      <Header
        mode={mode}
        onChangeMode={handleModeChange}
        selectedScenarioKey={selectedScenarioKey}
        onChangeScenario={(key) => {
          setSelectedScenarioKey(key);
          setCurrentStepIndex(0);
          setIsPlaying(false);
        }}
        backendOnline={backendOnline}
        onOpenBenchmarks={() => setIsBenchmarksOpen(true)}
        onTriggerLiveInference={triggerLiveInference}
        isTriggeringInference={isTriggeringInference}
        reducedMotion={reducedMotion}
        onToggleReducedMotion={() => setReducedMotion((prev) => !prev)}
      />

      {/* Main Container */}
      <main className="flex-1 p-3 sm:p-5 lg:p-6 max-w-7xl mx-auto w-full flex flex-col gap-5">
        {/* Live Mode Error / Warning Banner */}
        {mode === 'LIVE_INTELLIGENCE' && !backendOnline && (
          <div className="p-4 rounded-xl border border-red-500/40 bg-red-500/10 text-red-300 flex items-center justify-between gap-4 font-mono text-xs">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
              <div>
                <span className="font-bold">LIVE BACKEND OFFLINE:</span> Unable to connect to Python REST microservice at{' '}
                <code className="text-white">http://localhost:8080/forecast</code>.
                <p className="text-[11px] text-red-400/80 mt-0.5">
                  Start the server with <code className="text-white">.venv/bin/python src/api/server.py 8080</code> or switch to Scenario Mode.
                </p>
              </div>
            </div>
            <button
              onClick={verifyHealth}
              className="px-3 py-1.5 rounded-lg bg-red-500/20 border border-red-500/40 hover:bg-red-500/30 text-white font-bold transition-colors"
            >
              RETRY CONNECTION
            </button>
          </div>
        )}

        {/* Live Mode Inference Error */}
        {mode === 'LIVE_INTELLIGENCE' && liveError && (
          <div className="p-3.5 rounded-xl border border-amber-500/40 bg-amber-500/10 text-amber-300 font-mono text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Inference Error: {liveError}</span>
          </div>
        )}

        {/* Primary View: 3D Topology + Side Intelligence Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Left Column (7 cols): Spatial 3D Topology + Timeline Scrubber */}
          <div className="lg:col-span-7 flex flex-col gap-5">
            <NetworkTopology3D
              activePort={displayTelemetry.activePort}
              onSelectPort={(node) => setSelectedPortNode(node)}
              alertLevel={displayTelemetry.alertLevel}
              threatIntensity={displayTelemetry.intensity}
              isSimulated={displayTelemetry.isSimulated}
              reducedMotion={reducedMotion}
            />

            {/* Progression Timeline underneath 3D canvas */}
            {mode === 'SCENARIO_SIMULATION' ? (
              <ProgressionTimeline
                steps={scenario.steps}
                currentStepIndex={currentStepIndex}
                onSelectStep={(idx) => {
                  setCurrentStepIndex(idx);
                  setIsPlaying(false);
                }}
                isPlaying={isPlaying}
                onTogglePlay={() => setIsPlaying((p) => !p)}
                playbackSpeed={playbackSpeed}
                onChangeSpeed={setPlaybackSpeed}
                isOnsetDetected={displayTelemetry.isOnset}
              />
            ) : (
              <div className="p-4 rounded-xl border border-cyber-border bg-cyber-card/70 font-mono text-xs flex items-center justify-between text-cyber-muted">
                <span className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-cyber-cyan" />
                  <span>LIVE INTELLIGENCE STREAM — ACTIVE WINDOW t (30-SECOND REFRESH)</span>
                </span>
                <span className="text-cyber-cyan font-bold">DEVICE: {liveHealth?.device || 'PyTorch MPS'}</span>
              </div>
            )}
          </div>

          {/* Right Column (5 cols): Threat Intelligence Banner & Multi-Horizon Rollout */}
          <div className="lg:col-span-5 flex flex-col gap-5">
            <ThreatIntelligencePanel
              alertLevel={displayTelemetry.alertLevel}
              mitre={displayTelemetry.mitre}
              activePortNode={displayTelemetry.targetPortNode}
              expectedFpr="<= 5%"
              isSimulated={displayTelemetry.isSimulated}
            />

            <MultiHorizonForecasting
              horizons={displayTelemetry.horizons}
              intensity={displayTelemetry.intensity}
              xgbRisk={displayTelemetry.xgbRisk}
              alertLevel={displayTelemetry.alertLevel}
            />
          </div>
        </div>

        {/* Lower Row: Explainability Panel & Node Telemetry Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-7">
            <ExplainabilityPanel attributions={displayTelemetry.attributions} />
          </div>

          {/* Node Inspector Card */}
          <div className="lg:col-span-5 p-4 sm:p-5 rounded-xl border border-cyber-border bg-cyber-card/70 backdrop-blur-md flex flex-col justify-between gap-4 font-mono">
            <div>
              <div className="flex items-center justify-between border-b border-cyber-border pb-2.5 mb-3">
                <span className="text-xs font-bold text-cyber-cyan flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  <span>TOPOLOGY SERVICE INSPECTOR</span>
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-cyber-surface border border-cyber-border text-slate-300">
                  {displayTelemetry.targetPortNode?.protocol || 'TCP'}
                </span>
              </div>

              <div className="text-base font-bold text-slate-100">
                PORT {displayTelemetry.targetPortNode?.port}: {displayTelemetry.targetPortNode?.name}
              </div>
              <div className="text-xs text-cyber-muted mb-2">{displayTelemetry.targetPortNode?.service}</div>
              <p className="text-xs text-slate-400 font-sans leading-relaxed">
                {displayTelemetry.targetPortNode?.description}
              </p>
            </div>

            <div className="p-3 rounded-lg border border-cyber-border/80 bg-cyber-surface/60 flex items-center justify-between text-xs">
              <span className="text-cyber-muted">THREAT DISPERSAL:</span>
              <span className={`font-bold ${
                displayTelemetry.alertLevel === 'CRITICAL' ? 'text-red-400' : 'text-cyber-cyan'
              }`}>
                {displayTelemetry.alertLevel === 'CRITICAL' ? 'PORT SATURATION / BURST' : 'NOMINAL RESOLUTION'}
              </span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-cyber-border bg-cyber-surface/70 px-4 py-3 sm:px-6 text-center text-xs font-mono text-cyber-muted flex flex-wrap items-center justify-between gap-2">
        <span>SENTINELGRAPH // TEMPORAL NETWORK ATTACK PROGRESSION FORECASTING SYSTEM</span>
        <span>CIC-IDS2018 RESEARCH PROTOCOL // APPLE SILICON MPS</span>
      </footer>

      {/* Model Benchmark Matrix Modal Drawer */}
      <ModelBenchmarkDrawer
        isOpen={isBenchmarksOpen}
        onClose={() => setIsBenchmarksOpen(false)}
      />
    </div>
  );
}
