"""
SentinelGraph - Spatio-Temporal Graph Neural Network (ST-GNN) Model
Integrates spatial graph convolutions over service port topology with
temporal recurrent sequence modeling (GRU/LSTM) for multi-task attack forecasting.
"""

import torch
import torch.nn as nn
import torch.nn.functional as F


class GraphConvolution(nn.Module):
    def __init__(self, in_features: int, out_features: int):
        super().__init__()
        self.linear = nn.Linear(in_features, out_features, bias=True)

    def forward(self, adj: torch.Tensor, x: torch.Tensor) -> torch.Tensor:
        """
        adj: (B, N, N) normalized adjacency matrix
        x: (B, N, in_features) node feature matrix
        returns: (B, N, out_features)
        """
        # Batched graph convolution: A * X
        ax = torch.bmm(adj, x)
        return self.linear(ax)


class SpatioTemporalGNN(nn.Module):
    def __init__(
        self,
        num_nodes: int = 16,
        in_node_features: int = 6,
        gnn_hidden_dim: int = 32,
        rnn_hidden_dim: int = 64,
        num_rnn_layers: int = 2,
        dropout: float = 0.2,
    ):
        super().__init__()
        self.num_nodes = num_nodes
        self.gcn1 = GraphConvolution(in_node_features, gnn_hidden_dim)
        self.gcn2 = GraphConvolution(gnn_hidden_dim, gnn_hidden_dim)
        self.dropout = nn.Dropout(dropout)

        # Graph readout produces 2 * gnn_hidden_dim (mean pool + max pool)
        readout_dim = gnn_hidden_dim * 2
        self.rnn = nn.GRU(
            readout_dim,
            rnn_hidden_dim,
            num_layers=num_rnn_layers,
            batch_first=True,
            dropout=dropout if num_rnn_layers > 1 else 0.0,
        )

        # Multi-task heads
        self.head_clf = nn.Sequential(
            nn.Linear(rnn_hidden_dim, 32),
            nn.ReLU(),
            nn.Dropout(dropout),
            nn.Linear(32, 1),
        )
        self.head_reg = nn.Sequential(
            nn.Linear(rnn_hidden_dim, 32),
            nn.ReLU(),
            nn.Linear(32, 1),
            nn.Sigmoid(),
        )

    def forward(self, x_seq: torch.Tensor, adj_seq: torch.Tensor):
        """
        x_seq: (B, T, N, F)
        adj_seq: (B, T, N, N)
        """
        B, T, N, feat_dim = x_seq.shape
        graph_embeddings = []

        for t in range(T):
            x_t = x_seq[:, t, :, :]  # (B, N, F)
            adj_t = adj_seq[:, t, :, :]  # (B, N, N)

            h1 = F.relu(self.gcn1(adj_t, x_t))
            h1 = self.dropout(h1)
            h2 = F.relu(self.gcn2(adj_t, h1)) + h1  # residual skip

            # Graph readout: mean pooling and max pooling over nodes
            mean_pool = h2.mean(dim=1)  # (B, gnn_hidden_dim)
            max_pool = h2.max(dim=1).values  # (B, gnn_hidden_dim)
            g_t = torch.cat([mean_pool, max_pool], dim=-1)  # (B, 2 * gnn_hidden_dim)
            graph_embeddings.append(g_t)

        # Stack into temporal sequence (B, T, readout_dim)
        g_seq = torch.stack(graph_embeddings, dim=1)

        # Recurrent temporal propagation
        out, _ = self.rnn(g_seq)
        last_hidden = out[:, -1, :]  # (B, rnn_hidden_dim)

        logits = self.head_clf(last_hidden).squeeze(-1)
        intensity = self.head_reg(last_hidden).squeeze(-1)
        return logits, intensity
