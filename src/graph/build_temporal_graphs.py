"""
SentinelGraph - Temporal Network Service Graph Construction (Phase 5 Extension)
Constructs spatio-temporal graph snapshots G_t = (V, E_t) for each 30-second window:
- Vertices V (16 nodes): Top 15 destination service ports + 1 aggregation node (OTHER).
- Node Features X_t in R^{16 x 6}: [flow_count, packet_sum, byte_sum, packet_rate, syn_rate, rst_rate].
- Normalized Adjacency A_t in R^{16 x 16}: Symmetrically normalized co-activation matrix with self-loops.
- Sequences (N, 10, 16, 6) aligned with unified sequence targets for rigorous benchmark comparison.
"""

from pathlib import Path
import numpy as np
import pandas as pd

STATES_DIR = Path("data/states_unified")
FEATURE_DIRS = [Path("data/features"), Path("data/features_expanded")]
OUTPUT_DIR = Path("data/graphs_unified")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

SEQ_LEN = 10
MAX_HORIZON = 10
HORIZONS = [1, 2, 4, 10]

TOP_PORTS = [80, 53, 443, 21, 3389, 22, 445, 0, 5355, 3128, 137, 67, 138, 500, 135]
NUM_NODES = len(TOP_PORTS) + 1  # 16 nodes (index 15 is OTHER)
NODE_FEATS = 6  # flow_count, packet_sum, byte_sum, packet_rate, syn_rate, rst_rate
PORT_TO_NODE = {p: i for i, p in enumerate(TOP_PORTS)}


def compute_normalized_laplacian(adj: np.ndarray) -> np.ndarray:
    """
    Computes symmetric normalized adjacency: D^{-1/2} A D^{-1/2} with self-loops.
    """
    A_tilde = adj + np.eye(adj.shape[0], dtype=np.float32)
    deg = np.sum(A_tilde, axis=1)
    deg_inv_sqrt = np.zeros_like(deg, dtype=np.float32)
    np.power(deg, -0.5, out=deg_inv_sqrt, where=deg > 0)
    D_inv_sqrt = np.diag(deg_inv_sqrt)
    return D_inv_sqrt @ A_tilde @ D_inv_sqrt


def process_day(states_file: Path, features_file: Path):
    print(f"\nProcessing graph snapshots for: {states_file.name}")
    states_df = pd.read_parquet(states_file)
    states_df["timestamp"] = pd.to_datetime(states_df["timestamp"])
    states_df = states_df.sort_values("timestamp").reset_index(drop=True)
    timestamps = states_df["timestamp"].values
    T = len(states_df)

    # Read flow records
    flows = pd.read_parquet(
        features_file,
        columns=[
            "timestamp", "dst_port", "total_packets", "total_bytes",
            "packet_rate", "syn_rate", "rst_rate", "label"
        ]
    )
    flows["timestamp"] = pd.to_datetime(flows["timestamp"])
    flows["port_node"] = flows["dst_port"].map(PORT_TO_NODE).fillna(NUM_NODES - 1).astype(int)
    flows["window_dt"] = flows["timestamp"].dt.floor("30s")

    # Aggregate by 30s window and port_node
    grouped = flows.groupby(["window_dt", "port_node"]).agg(
        flow_count=("total_packets", "count"),
        packet_sum=("total_packets", "sum"),
        byte_sum=("total_bytes", "sum"),
        packet_rate_mean=("packet_rate", "mean"),
        syn_rate_mean=("syn_rate", "mean"),
        rst_rate_mean=("rst_rate", "mean"),
    ).reset_index()

    # Create timestamp lookup
    window_to_idx = {ts: idx for idx, ts in enumerate(states_df["timestamp"])}

    node_tensors = np.zeros((T, NUM_NODES, NODE_FEATS), dtype=np.float32)
    adj_tensors = np.zeros((T, NUM_NODES, NUM_NODES), dtype=np.float32)

    # Populate active node features
    active_nodes_per_window = {}
    for _, row in grouped.iterrows():
        w_ts = row["window_dt"]
        if w_ts not in window_to_idx:
            continue
        t_idx = window_to_idx[w_ts]
        n_idx = int(row["port_node"])
        node_tensors[t_idx, n_idx, 0] = float(row["flow_count"])
        node_tensors[t_idx, n_idx, 1] = float(row["packet_sum"])
        node_tensors[t_idx, n_idx, 2] = float(row["byte_sum"])
        node_tensors[t_idx, n_idx, 3] = float(row["packet_rate_mean"])
        node_tensors[t_idx, n_idx, 4] = float(row["syn_rate_mean"])
        node_tensors[t_idx, n_idx, 5] = float(row["rst_rate_mean"])

        if t_idx not in active_nodes_per_window:
            active_nodes_per_window[t_idx] = []
        active_nodes_per_window[t_idx].append(n_idx)

    # Sanitize any NaNs or Infs in node features
    node_tensors = np.nan_to_num(node_tensors, nan=0.0, posinf=0.0, neginf=0.0)

    # Construct co-activation graph adjacency
    for t_idx in range(T):
        raw_adj = np.zeros((NUM_NODES, NUM_NODES), dtype=np.float32)
        active = active_nodes_per_window.get(t_idx, [])
        for u in active:
            for v in active:
                raw_adj[u, v] = 1.0
        adj_tensors[t_idx] = compute_normalized_laplacian(raw_adj)

    # Extract sequences (10-step rolling window)
    attack_ratio = states_df["is_attack_mean"].to_numpy(dtype=np.float32)
    attack_binary = (attack_ratio > 0).astype(np.int32)
    max_valid_idx = T - SEQ_LEN - MAX_HORIZON

    X_node = []
    A_adj = []
    y_attack = {h: [] for h in HORIZONS}
    y_intensity = {h: [] for h in HORIZONS}
    last_attack = []

    for i in range(max_valid_idx):
        X_node.append(node_tensors[i : i + SEQ_LEN])
        A_adj.append(adj_tensors[i : i + SEQ_LEN])
        last_attack.append(attack_binary[i + SEQ_LEN - 1])

        for h in HORIZONS:
            target_idx = i + SEQ_LEN - 1 + h
            y_attack[h].append(attack_binary[target_idx])
            y_intensity[h].append(attack_ratio[target_idx])

    X_node = np.array(X_node, dtype=np.float32)
    A_adj = np.array(A_adj, dtype=np.float32)
    last_attack = np.array(last_attack, dtype=np.int32)

    save_dict = {
        "X_node": X_node,
        "A_adj": A_adj,
        "last_attack": last_attack,
        "y_attack_h1": np.array(y_attack[1], dtype=np.int32),
        "y_intensity_h1": np.array(y_intensity[1], dtype=np.float32),
        "y_attack_h2": np.array(y_attack[2], dtype=np.int32),
        "y_intensity_h2": np.array(y_intensity[2], dtype=np.float32),
        "y_attack_h4": np.array(y_attack[4], dtype=np.int32),
        "y_intensity_h4": np.array(y_intensity[4], dtype=np.float32),
        "y_attack_h10": np.array(y_attack[10], dtype=np.int32),
        "y_intensity_h10": np.array(y_intensity[10], dtype=np.float32),
        "y_onset_h1": ((np.array(y_attack[1]) == 1) & (last_attack == 0)).astype(np.int32),
    }

    out_file = OUTPUT_DIR / f"{states_file.stem}.npz"
    np.savez_compressed(out_file, **save_dict)
    print(f"  -> Generated {len(X_node)} graph sequences. Tensor shapes: X_node={X_node.shape}, A_adj={A_adj.shape}")
    print(f"  -> Saved: {out_file}")


def main():
    states_files = sorted(STATES_DIR.glob("*.parquet"))
    for sfile in states_files:
        # Locate corresponding feature parquet
        feat_file = None
        for fdir in FEATURE_DIRS:
            candidate = fdir / sfile.name
            if candidate.exists():
                feat_file = candidate
                break
        if feat_file is None:
            print(f"Warning: feature parquet for {sfile.name} not found in {FEATURE_DIRS}")
            continue

        process_day(sfile, feat_file)


if __name__ == "__main__":
    main()
