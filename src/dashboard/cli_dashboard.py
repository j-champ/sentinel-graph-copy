"""
SentinelGraph - Interactive Security Intelligence & Early-Warning Console (Phase 9 MVP)
Demonstration console visualizing live/replay multi-horizon forecasting,
early-warning alert signals, attack intensity tracking, and temporal attribution.
"""

import sys
import time
from pathlib import Path
import numpy as np

BASE_DIR = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(BASE_DIR))

from src.pipeline.inference import SentinelInferencePipeline

def make_bar(prob, length=20):
    filled = int(round(prob * length))
    filled = max(0, min(length, filled))
    return "█" * filled + "░" * (length - filled)

def render_frame(step, total, timestamp, forecast, actual_attack, actual_intensity):
    horizons = forecast["forecast_horizons"]
    warning = forecast["early_warning"]
    attr = forecast["top_attributions"]
    state = forecast["current_state_summary"]

    h30 = horizons["30s_ahead"]
    h60 = horizons["60s_ahead"]
    h120 = horizons["120s_ahead"]
    h300 = horizons["300s_ahead"]

    status_tag = f"[{warning['status']}]"

    print("\033[H\033[J", end="")  # Clear screen
    print("=" * 80)
    print(f" SENTINELGRAPH — TEMPORAL NETWORK ATTACK FORECASTING CONSOLE (MVP)")
    print(f" Replay Step: {step:04d}/{total:04d} | Target Timestamp: {timestamp}")
    print("=" * 80)

    print(f"\n[EARLY-WARNING THREAT STATUS]: {status_tag:<12} (Operational Threshold: {warning['operational_threshold_active']})")
    print(f"Predicted Attack Intensity: {forecast['predicted_intensity']*100:5.2f}% | Actual Threat State: {'ATTACK' if actual_attack else 'BENIGN'} ({actual_intensity*100:.2f}%)")

    print("\n--- MULTI-HORIZON ATTACK PROBABILITY ROLLOUT ---")
    print(f" Horizon +30s  : [{make_bar(h30)}] {h30*100:5.1f}%  Risk")
    print(f" Horizon +60s  : [{make_bar(h60)}] {h60*100:5.1f}%  Risk")
    print(f" Horizon +120s : [{make_bar(h120)}] {h120*100:5.1f}%  Risk")
    print(f" Horizon +300s : [{make_bar(h300)}] {h300*100:5.1f}%  Risk")

    print("\n--- OBSERVED NETWORK TRAFFIC METRICS (LAST 30s) ---")
    print(f" Packets: {state['total_packets']:>8.0f} flows/sec | Bytes: {state['total_bytes']:>10.0f} B/s | Packet Rate: {state['packet_rate']:>8.1f}")

    print("\n--- TEMPORAL EXPLAINABILITY & ATTRIBUTION (TOP 3 DRIVERS) ---")
    for i, a in enumerate(attr, 1):
        print(f" {i}. {a['feature']:<22} | 5-min Trend Delta: {a['delta']:>12.2f} | Value: {a['current_value']:>12.2f}")

    print("\n" + "=" * 80)


def run_demo(num_steps=10, pause=0.1):
    print("Initializing SentinelGraph Inference Pipeline...")
    pipeline = SentinelInferencePipeline()

    test_file = BASE_DIR / "data/sequences_unified/Friday-02-03-2018_TrafficForML_CICFlowMeter.npz"
    with np.load(test_file) as d:
        X_all = d["X"]
        y_att_all = d["y_attack_h1"]
        y_int_all = d["y_intensity_h1"]
        ts_all = d["timestamps"]

    # Choose a window that crosses from benign into attack onset
    # In Friday-02-03, attack onset occurs around step 750
    start_idx = 750
    end_idx = min(start_idx + num_steps, len(X_all))

    print(f"Starting console replay from sequence {start_idx} to {end_idx}...")
    for idx in range(start_idx, end_idx):
        seq = X_all[idx]
        target_attack = int(y_att_all[idx])
        target_int = float(y_int_all[idx])
        ts = str(ts_all[idx])

        forecast = pipeline.predict_sequence(seq)
        render_frame(idx - start_idx + 1, end_idx - start_idx, ts, forecast, target_attack, target_int)
        time.sleep(pause)

    print("\n[DEMO COMPLETE] Multi-horizon attack forecasting demonstrated successfully.")


if __name__ == "__main__":
    steps = int(sys.argv[1]) if len(sys.argv) > 1 else 5
    run_demo(num_steps=steps, pause=0.05)
