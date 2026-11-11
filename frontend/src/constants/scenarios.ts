import { Scenario } from '../types';

export const SCENARIOS: Record<string, Scenario> = {
  botnet: {
    id: 'botnet',
    name: 'Botnet Mirai C2 & UDP Flood',
    type: 'Volumetric Distributed Flood',
    description: 'Sustained distributed zombie-net coordinated bandwidth exhaustion targeting core DNS & Web gateways.',
    steps: [
      { time: 'T+00:00', h1: 0.04, h2: 0.04, h4: 0.04, h10: 0.03, int: 0.00, status: 'NORMAL', mitre: 'None (Benign)', technique_id: 'N/A', targetPort: 53, topAttr: 'packet_rate_mean', delta: 42, description: 'Baseline DNS resolver resolution query traffic.' },
      { time: 'T+00:30', h1: 0.08, h2: 0.07, h4: 0.06, h10: 0.05, int: 0.00, status: 'NORMAL', mitre: 'None (Benign)', technique_id: 'N/A', targetPort: 53, topAttr: 'flow_duration_mean', delta: 128, description: 'Slight deviation in flow lifetime on UDP port 53.' },
      { time: 'T+01:00', h1: 0.22, h2: 0.19, h4: 0.16, h10: 0.12, int: 0.05, status: 'NORMAL', mitre: 'Reconnaissance / Probe', technique_id: 'T1595', targetPort: 80, topAttr: 'total_packets_sum', delta: 980, description: 'Pre-attack synchronization probes hitting port 80.' },
      { time: 'T+01:30', h1: 0.38, h2: 0.35, h4: 0.31, h10: 0.25, int: 0.12, status: 'WATCH', mitre: 'Reconnaissance / Initial Probe', technique_id: 'T1595', targetPort: 80, topAttr: 'packet_rate_mean', delta: 2400, description: 'Surge in packet velocity; model crosses operational alert threshold (0.35).' },
      { time: 'T+02:00', h1: 0.62, h2: 0.58, h4: 0.51, h10: 0.42, int: 0.45, status: 'ELEVATED', mitre: 'Command & Control Signaling', technique_id: 'T1043', targetPort: 80, topAttr: 'total_packets_sum', delta: 5410, description: 'Coordinated beaconing pulse detected across bot nodes.' },
      { time: 'T+02:30', h1: 0.89, h2: 0.86, h4: 0.81, h10: 0.72, int: 0.88, status: 'CRITICAL', mitre: 'Impact / Denial of Service', technique_id: 'T1498', targetPort: 80, topAttr: 'packet_rate_mean', delta: 12900, description: 'Severe packet flood onset saturating web ingress.' },
      { time: 'T+03:00', h1: 0.98, h2: 0.96, h4: 0.92, h10: 0.85, int: 0.97, status: 'CRITICAL', mitre: 'Impact / Denial of Service', technique_id: 'T1498', targetPort: 80, topAttr: 'byte_rate_max', delta: 28500000, description: 'Full bandwidth saturation; byte rate max exceeds 28MB/s.' },
      { time: 'T+03:30', h1: 0.99, h2: 0.97, h4: 0.94, h10: 0.87, int: 0.99, status: 'CRITICAL', mitre: 'Impact / Denial of Service', technique_id: 'T1498', targetPort: 80, topAttr: 'packet_rate_mean', delta: 45000, description: 'Peak flood pressure maintained; multi-horizon risk pinned at 0.99.' },
      { time: 'T+04:00', h1: 0.99, h2: 0.98, h4: 0.95, h10: 0.89, int: 1.00, status: 'CRITICAL', mitre: 'Impact / Denial of Service', technique_id: 'T1498', targetPort: 80, topAttr: 'total_packets_sum', delta: 78000, description: 'Continuous volumetric overwhelm with near zero forward/backward asymmetry.' },
      { time: 'T+04:30', h1: 0.99, h2: 0.98, h4: 0.95, h10: 0.90, int: 1.00, status: 'CRITICAL', mitre: 'Impact / Denial of Service', technique_id: 'T1498', targetPort: 80, topAttr: 'packet_rate_mean', delta: 64000, description: 'Exhaustion persistence phase; service latency at maximum.' },
    ]
  },
  web: {
    id: 'web',
    name: 'Web Application Brute Force & XSS',
    type: 'Targeted Application Layer Attack',
    description: 'Pulsed credential enumeration and injection fuzzing directed at HTTP endpoints.',
    steps: [
      { time: 'T+00:00', h1: 0.02, h2: 0.02, h4: 0.02, h10: 0.02, int: 0.00, status: 'NORMAL', mitre: 'None (Benign)', technique_id: 'N/A', targetPort: 443, topAttr: 'flow_duration_mean', delta: 15, description: 'Standard TLS web browsing sessions.' },
      { time: 'T+00:30', h1: 0.15, h2: 0.14, h4: 0.12, h10: 0.10, int: 0.02, status: 'NORMAL', mitre: 'Reconnaissance / Initial Probe', technique_id: 'T1595', targetPort: 80, topAttr: 'syn_rate_mean', delta: 320, description: 'Automated crawler spidering active web endpoints.' },
      { time: 'T+01:00', h1: 0.45, h2: 0.41, h4: 0.37, h10: 0.30, int: 0.22, status: 'WATCH', mitre: 'Initial Access / Service Exploitation', technique_id: 'T1190', targetPort: 80, topAttr: 'syn_rate_mean', delta: 750, description: 'Rapid SYN bursts without connection completion; scanner behavior.' },
      { time: 'T+01:30', h1: 0.76, h2: 0.71, h4: 0.65, h10: 0.54, int: 0.65, status: 'ELEVATED', mitre: 'Credential Access / Password Spraying', technique_id: 'T1110', targetPort: 80, topAttr: 'packet_rate_mean', delta: 1850, description: 'Multi-threaded dictionary attack pulse on login endpoint.' },
      { time: 'T+02:00', h1: 0.35, h2: 0.32, h4: 0.28, h10: 0.22, int: 0.10, status: 'WATCH', mitre: 'Initial Access / Service Exploitation', technique_id: 'T1190', targetPort: 80, topAttr: 'rst_rate_mean', delta: 640, description: 'Scanner pause interval; RST rate spikes as dropped sockets close.' },
      { time: 'T+02:30', h1: 0.05, h2: 0.05, h4: 0.04, h10: 0.04, int: 0.00, status: 'NORMAL', mitre: 'None (Benign)', technique_id: 'N/A', targetPort: 53, topAttr: 'flow_duration_mean', delta: 45, description: 'Inter-pulse lull; traffic returns toward baseline.' },
      { time: 'T+03:00', h1: 0.68, h2: 0.64, h4: 0.58, h10: 0.48, int: 0.52, status: 'ELEVATED', mitre: 'Credential Access / Password Spraying', technique_id: 'T1110', targetPort: 80, topAttr: 'syn_rate_mean', delta: 1420, description: 'Second attack wave commences with varied user-agent headers.' },
      { time: 'T+03:30', h1: 0.88, h2: 0.84, h4: 0.79, h10: 0.68, int: 0.82, status: 'CRITICAL', mitre: 'Credential Access / Password Spraying', technique_id: 'T1110', targetPort: 80, topAttr: 'packet_rate_mean', delta: 2900, description: 'High-intensity credential stuffing surge.' },
      { time: 'T+04:00', h1: 0.25, h2: 0.22, h4: 0.19, h10: 0.15, int: 0.05, status: 'NORMAL', mitre: 'None (Benign)', technique_id: 'N/A', targetPort: 443, topAttr: 'rst_rate_mean', delta: 310, description: 'Attacker socket teardown upon IP firewall throttle.' },
      { time: 'T+04:30', h1: 0.03, h2: 0.03, h4: 0.03, h10: 0.03, int: 0.00, status: 'NORMAL', mitre: 'None (Benign)', technique_id: 'N/A', targetPort: 53, topAttr: 'flow_duration_mean', delta: 20, description: 'Baseline network normalization.' },
    ]
  },
  ssh: {
    id: 'ssh',
    name: 'SSH Infiltration & Lateral Movement',
    type: 'Targeted Infiltration & Tunneling',
    description: 'Stealthy credential brute force on port 22 transitioning to internal command execution.',
    steps: [
      { time: 'T+00:00', h1: 0.01, h2: 0.01, h4: 0.01, h10: 0.01, int: 0.00, status: 'NORMAL', mitre: 'None (Benign)', technique_id: 'N/A', targetPort: 22, topAttr: 'flow_duration_mean', delta: 5, description: 'Periodic routine SSH management connections.' },
      { time: 'T+00:30', h1: 0.08, h2: 0.07, h4: 0.06, h10: 0.05, int: 0.01, status: 'NORMAL', mitre: 'Reconnaissance / Initial Probe', technique_id: 'T1595', targetPort: 22, topAttr: 'syn_rate_mean', delta: 85, description: 'Targeted port 22 banner grabbing and cipher negotiation.' },
      { time: 'T+01:00', h1: 0.28, h2: 0.25, h4: 0.22, h10: 0.18, int: 0.09, status: 'NORMAL', mitre: 'Credential Access / Brute Force', technique_id: 'T1110', targetPort: 22, topAttr: 'total_packets_sum', delta: 420, description: 'Rapid sequential authentication attempts.' },
      { time: 'T+01:30', h1: 0.42, h2: 0.39, h4: 0.35, h10: 0.29, int: 0.28, status: 'WATCH', mitre: 'Credential Access / Brute Force', technique_id: 'T1110', targetPort: 22, topAttr: 'packet_rate_mean', delta: 960, description: 'Model flags abnormal SSH authentication session velocity.' },
      { time: 'T+02:00', h1: 0.69, h2: 0.65, h4: 0.60, h10: 0.51, int: 0.58, status: 'ELEVATED', mitre: 'Lateral Movement / Remote Services', technique_id: 'T1021', targetPort: 22, topAttr: 'syn_rate_mean', delta: 1850, description: 'Successful session entry followed by internal subnet scanning.' },
      { time: 'T+02:30', h1: 0.87, h2: 0.83, h4: 0.78, h10: 0.69, int: 0.84, status: 'CRITICAL', mitre: 'Lateral Movement / Remote Services', technique_id: 'T1021', targetPort: 22, topAttr: 'packet_rate_mean', delta: 3100, description: 'Active lateral pivot established across internal hosts.' },
      { time: 'T+03:00', h1: 0.92, h2: 0.89, h4: 0.85, h10: 0.77, int: 0.91, status: 'CRITICAL', mitre: 'Lateral Movement / Remote Services', technique_id: 'T1021', targetPort: 22, topAttr: 'total_packets_sum', delta: 4200, description: 'Encrypted tunnel transfer volume accelerating.' },
      { time: 'T+03:30', h1: 0.95, h2: 0.93, h4: 0.89, h10: 0.82, int: 0.95, status: 'CRITICAL', mitre: 'Lateral Movement / Remote Services', technique_id: 'T1021', targetPort: 22, topAttr: 'packet_rate_mean', delta: 5100, description: 'High-throughput tunnel channel fully active.' },
      { time: 'T+04:00', h1: 0.96, h2: 0.94, h4: 0.90, h10: 0.84, int: 0.96, status: 'CRITICAL', mitre: 'Lateral Movement / Remote Services', technique_id: 'T1021', targetPort: 22, topAttr: 'flow_duration_mean', delta: 6200, description: 'Sustained long-duration SSH session with elevated payload transfer.' },
      { time: 'T+04:30', h1: 0.97, h2: 0.95, h4: 0.92, h10: 0.86, int: 0.97, status: 'CRITICAL', mitre: 'Lateral Movement / Remote Services', technique_id: 'T1021', targetPort: 22, topAttr: 'total_packets_sum', delta: 6800, description: 'Compromise established; exfiltration channel active.' },
    ]
  },
  benign: {
    id: 'benign',
    name: 'Benign Background Enterprise Baseline',
    type: 'Operational Normal Activity',
    description: 'Clean day-to-day enterprise traffic across DNS, HTTP, SMB, and DHCP services.',
    steps: Array.from({ length: 10 }, (_, i) => ({
      time: `T+0${Math.floor(i / 2)}:${(i % 2) * 30 === 0 ? '00' : '30'}`,
      h1: 0.02 + (i % 3) * 0.01,
      h2: 0.02 + (i % 3) * 0.01,
      h4: 0.02 + (i % 2) * 0.01,
      h10: 0.02,
      int: 0.00,
      status: 'NORMAL' as const,
      mitre: 'None (Benign)',
      technique_id: 'N/A',
      targetPort: [80, 53, 443, 445, 67][i % 5],
      topAttr: ['flow_duration_mean', 'packet_rate_mean', 'total_packets_sum'][i % 3],
      delta: 12 + (i * 4),
      description: 'Nominal enterprise network telemetry within statistical tolerances.',
    }))
  }
};
