export type OperatingMode = 'LIVE_INTELLIGENCE' | 'SCENARIO_SIMULATION';

export type AlertLevel = 'NORMAL' | 'WATCH' | 'ELEVATED' | 'CRITICAL';

export interface MitreAttack {
  tactic: string;
  technique_id: string;
  description: string;
}

export interface EarlyWarning {
  status: AlertLevel;
  color: string;
  operational_threshold_active?: number;
  expected_fpr?: string;
}

export interface FeatureAttribution {
  feature: string;
  delta: number;
  current_value: number;
}

export interface ForecastHorizons {
  '30s_ahead': number;
  '60s_ahead': number;
  '120s_ahead': number;
  '300s_ahead': number;
}

export interface StateSummary {
  total_packets?: number;
  total_bytes?: number;
  packet_rate?: number;
}

export interface ForecastResponse {
  forecast_horizons: ForecastHorizons;
  predicted_intensity: number;
  xgb_secondary_risk: number;
  early_warning: EarlyWarning;
  mitre_attack: MitreAttack;
  top_attributions: FeatureAttribution[];
  current_state_summary?: StateSummary;
}

export interface HealthResponse {
  status: string;
  system: string;
  device: string;
  models_loaded: {
    lstm_recurrent: boolean;
    xgboost_booster: boolean;
    standard_scaler: boolean;
  };
}

export interface PortNodeDefinition {
  id: number;
  port: number | string;
  name: string;
  service: string;
  protocol: 'TCP' | 'UDP' | 'IP' | 'DYNAMIC';
  description: string;
  x: number;
  y: number;
  z: number;
}

export interface ScenarioStep {
  time: string;
  h1: number;
  h2: number;
  h4: number;
  h10: number;
  int: number;
  status: AlertLevel;
  mitre: string;
  technique_id: string;
  targetPort: number;
  topAttr: string;
  delta: number;
  description: string;
}

export interface Scenario {
  id: string;
  name: string;
  type: string;
  description: string;
  steps: ScenarioStep[];
}

export interface ModelBenchmark {
  model: string;
  type: string;
  f1: string;
  prAuc: string;
  rocAuc: string;
  recall: string;
  precision: string;
  fpr: string;
  latency: string;
  params: string;
  highlight?: boolean;
  gnn?: boolean;
}
