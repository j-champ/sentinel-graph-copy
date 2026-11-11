"""
SentinelGraph - Unified Multi-Horizon Temporal Sequence Generation
Constructs 10-step (5-minute) sequence tensors and multi-horizon forecasting targets
(h=1: 30s, h=2: 1 min, h=4: 2 min, h=10: 5 min) across gapless unified states.
"""

from pathlib import Path
import numpy as np
import pandas as pd

INPUT_DIR = Path("data/states_unified")
OUTPUT_DIR = Path("data/sequences_unified")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

SEQ_LEN = 10
MAX_HORIZON = 10  # 10 steps = 5 minutes ahead
HORIZONS = [1, 2, 4, 10]

FEATURES = [
    "total_packets_mean",
    "total_packets_sum",
    "total_packets_max",
    "total_bytes_mean",
    "total_bytes_sum",
    "total_bytes_max",
    "avg_packet_size_mean",
    "avg_packet_size_max",
    "fwd_ratio_mean",
    "fwd_ratio_max",
    "bwd_ratio_mean",
    "bwd_ratio_max",
    "byte_rate_mean",
    "byte_rate_max",
    "packet_rate_mean",
    "packet_rate_max",
    "syn_rate_mean",
    "syn_rate_max",
    "ack_rate_mean",
    "ack_rate_max",
    "rst_rate_mean",
    "rst_rate_max",
    "flow_duration_mean",
    "flow_duration_max",
]


def build_sequences_for_day(parquet_file: Path):
    df = pd.read_parquet(parquet_file)
    df["timestamp"] = pd.to_datetime(df["timestamp"])
    df = df.sort_values("timestamp").reset_index(drop=True)

    values = df[FEATURES].to_numpy(dtype=np.float32)
    attack_ratio = df["is_attack_mean"].to_numpy(dtype=np.float32)
    attack_binary = (attack_ratio > 0).astype(np.int32)
    timestamps = df["timestamp"].values

    total_states = len(df)
    max_valid_idx = total_states - SEQ_LEN - MAX_HORIZON

    if max_valid_idx <= 0:
        print(f"Warning: file {parquet_file.name} too short for SEQ_LEN={SEQ_LEN} and MAX_HORIZON={MAX_HORIZON}")
        return

    X = []
    y_attack = {h: [] for h in HORIZONS}
    y_intensity = {h: [] for h in HORIZONS}
    last_attack = []
    last_intensity = []
    seq_timestamps = []

    for i in range(max_valid_idx):
        # Input sequence: states [i, ..., i + SEQ_LEN - 1]
        X.append(values[i : i + SEQ_LEN])

        current_attack = attack_binary[i + SEQ_LEN - 1]
        current_intensity = attack_ratio[i + SEQ_LEN - 1]
        last_attack.append(current_attack)
        last_intensity.append(current_intensity)
        seq_timestamps.append(timestamps[i + SEQ_LEN - 1])

        # Target states at future horizons
        for h in HORIZONS:
            target_idx = i + SEQ_LEN - 1 + h
            y_attack[h].append(attack_binary[target_idx])
            y_intensity[h].append(attack_ratio[target_idx])

    X = np.asarray(X, dtype=np.float32)
    last_attack = np.asarray(last_attack, dtype=np.int32)
    last_intensity = np.asarray(last_intensity, dtype=np.float32)
    y_attack = {h: np.asarray(y_attack[h], dtype=np.int32) for h in HORIZONS}
    y_intensity = {h: np.asarray(y_intensity[h], dtype=np.float32) for h in HORIZONS}
    y_onset_h1 = ((y_attack[1] == 1) & (last_attack == 0)).astype(np.int32)

    out_file = OUTPUT_DIR / f"{parquet_file.stem}.npz"
    np.savez_compressed(
        out_file,
        X=X,
        last_attack=last_attack,
        last_intensity=last_intensity,
        y_onset_h1=y_onset_h1,
        y_attack_h1=y_attack[1],
        y_attack_h2=y_attack[2],
        y_attack_h4=y_attack[4],
        y_attack_h10=y_attack[10],
        y_intensity_h1=y_intensity[1],
        y_intensity_h2=y_intensity[2],
        y_intensity_h4=y_intensity[4],
        y_intensity_h10=y_intensity[10],
        timestamps=np.asarray(seq_timestamps),
    )

    eligible_risk_set = int((last_attack == 0).sum())
    onsets = int(y_onset_h1.sum())
    print(f"{parquet_file.name}:")
    print(f"  -> Sequences: {len(X)}, Shape: {X.shape}")
    print(f"  -> Risk set (last=0): {eligible_risk_set}, Onsets (h=1): {onsets}")
    print(f"  -> Attack prevalence (h=1): {int(y_attack[1].sum())} ({y_attack[1].mean()*100:.2f}%)")
    print(f"  -> Saved: {out_file}")


def main():
    files = sorted(INPUT_DIR.glob("*.parquet"))
    print(f"Building unified multi-horizon sequences for {len(files)} days...\n")
    for f in files:
        build_sequences_for_day(f)
    print("\nSequence generation complete.")


if __name__ == "__main__":
    main()
