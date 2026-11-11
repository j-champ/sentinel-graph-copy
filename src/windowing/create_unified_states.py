"""
SentinelGraph - Unified Temporal Network State Construction
Imputes zero-traffic benign states for inactive 30-second windows
to eliminate artificial gaps and preserve continuous timelines across all 8 days.
"""

from pathlib import Path
import pandas as pd
import numpy as np

FEATURE_DIRS = [
    Path("data/features"),
    Path("data/features_expanded"),
]
OUTPUT_DIR = Path("data/states_unified")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

WINDOW = "30s"

def process_day(file_path: Path):
    print(f"Aggregating states for: {file_path.name}")
    df = pd.read_parquet(file_path)
    df["is_attack"] = (df["label"] != "Benign").astype(int)
    df["timestamp"] = pd.to_datetime(df["timestamp"])
    df = df.sort_values("timestamp")

    # Resample to 30-second window summary statistics
    states = df.set_index("timestamp").resample(WINDOW).agg({
        "total_packets": ["mean", "sum", "max"],
        "total_bytes": ["mean", "sum", "max"],
        "avg_packet_size": ["mean", "max"],
        "fwd_ratio": ["mean", "max"],
        "bwd_ratio": ["mean", "max"],
        "byte_rate": ["mean", "max"],
        "packet_rate": ["mean", "max"],
        "syn_rate": ["mean", "max"],
        "ack_rate": ["mean", "max"],
        "rst_rate": ["mean", "max"],
        "flow_duration": ["mean", "max"],
        "is_attack": "mean"
    })

    states.columns = ["_".join(c).strip("_") for c in states.columns]
    
    # Impute zero-activity benign states for empty windows
    states = states.fillna(0.0).reset_index()

    out_path = OUTPUT_DIR / file_path.name
    states.to_parquet(out_path, index=False)
    
    attacks = (states["is_attack_mean"] > 0).sum()
    print(f"  -> Total 30s states: {len(states)}, Attack states: {attacks}, Benign: {len(states) - attacks}")
    print(f"  -> Saved: {out_path}")

def main():
    seen = set()
    for fdir in FEATURE_DIRS:
        if not fdir.exists():
            continue
        for pfile in sorted(fdir.glob("*.parquet")):
            if pfile.name not in seen:
                seen.add(pfile.name)
                process_day(pfile)
    print(f"\nUnified state generation complete across {len(seen)} days.")

if __name__ == "__main__":
    main()
