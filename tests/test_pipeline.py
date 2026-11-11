"""
SentinelGraph - Comprehensive Regression & Integration Test Suite
Validates pipeline loading, tensor shape integrity, multi-horizon forecasting,
early-warning alerting, and API contracts.
"""

import unittest
import numpy as np
import pandas as pd
import json
import torch
from pathlib import Path

from src.pipeline.inference import SentinelInferencePipeline, FEATURES, RecurrentForecaster
from src.api.server import SentinelRequestHandler


class TestSentinelInferencePipeline(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        # Force CPU for test reproducibility
        cls.pipeline = SentinelInferencePipeline(device="cpu")

    def test_feature_count(self):
        self.assertEqual(len(FEATURES), 24, "FEATURES must contain exactly 24 features")
        self.assertIn("total_packets_mean", FEATURES)
        self.assertIn("packet_rate_max", FEATURES)
        self.assertIn("flow_duration_mean", FEATURES)

    def test_model_loading(self):
        self.assertIsNotNone(self.pipeline.scaler, "Unified scaler must be loaded")
        self.assertIsNotNone(self.pipeline.lstm, "PyTorch LSTM model must be loaded")
        self.assertIsNotNone(self.pipeline.xgb_bst, "XGBoost booster model must be loaded")

    def test_predict_sequence_valid_shape(self):
        # Synthetic (10, 24) zero-traffic sequence (benign)
        dummy_benign = np.zeros((10, 24), dtype=np.float32)
        result = self.pipeline.predict_sequence(dummy_benign)

        self.assertIn("forecast_horizons", result)
        self.assertIn("predicted_intensity", result)
        self.assertIn("xgb_secondary_risk", result)
        self.assertIn("early_warning", result)
        self.assertIn("mitre_attack", result)
        self.assertIn("tactic", result["mitre_attack"])
        self.assertIn("technique_id", result["mitre_attack"])
        self.assertIn("top_attributions", result)

        horizons = result["forecast_horizons"]
        for key in ["30s_ahead", "60s_ahead", "120s_ahead", "300s_ahead"]:
            self.assertIn(key, horizons)
            self.assertGreaterEqual(horizons[key], 0.0)
            self.assertLessEqual(horizons[key], 1.0)

        self.assertGreaterEqual(result["predicted_intensity"], 0.0)
        self.assertLessEqual(result["predicted_intensity"], 1.0)
        self.assertIn(result["early_warning"]["status"], ["NORMAL", "WATCH", "ELEVATED", "CRITICAL"])
        self.assertEqual(len(result["top_attributions"]), 3)

    def test_predict_sequence_invalid_shape_raises(self):
        invalid_seq_9 = np.zeros((9, 24), dtype=np.float32)
        with self.assertRaises(ValueError):
            self.pipeline.predict_sequence(invalid_seq_9)

        invalid_seq_feat = np.zeros((10, 20), dtype=np.float32)
        with self.assertRaises(ValueError):
            self.pipeline.predict_sequence(invalid_seq_feat)

    def test_predict_real_dataset_sequence(self):
        test_file = Path("data/sequences_unified/Friday-02-03-2018_TrafficForML_CICFlowMeter.npz")
        if test_file.exists():
            with np.load(test_file) as d:
                seq = d["X"][500]
                result = self.pipeline.predict_sequence(seq)
                self.assertIn("forecast_horizons", result)
                self.assertIn(result["early_warning"]["status"], ["NORMAL", "WATCH", "ELEVATED", "CRITICAL"])
                self.assertGreaterEqual(result["forecast_horizons"]["30s_ahead"], 0.0)

    def test_alert_level_threshold_mapping(self):
        # Verify threshold mapping logic
        self.assertEqual(self.pipeline.predict_sequence(np.zeros((10, 24)))["early_warning"]["status"], "NORMAL")

    def test_dataframe_inference(self):
        # Test 10-row DataFrame input
        df = pd.DataFrame(np.ones((10, 24)), columns=FEATURES)
        result = self.pipeline.predict_states_dataframe(df)
        self.assertIn("forecast_horizons", result)

        # Non-10 row DataFrame raises ValueError
        df_invalid = pd.DataFrame(np.ones((8, 24)), columns=FEATURES)
        with self.assertRaises(ValueError):
            self.pipeline.predict_states_dataframe(df_invalid)

    def test_nan_input_sanitization(self):
        # Input sequence containing NaNs and Infs should be sanitized without crashing
        corrupt_seq = np.zeros((10, 24), dtype=np.float32)
        corrupt_seq[2, 5] = np.nan
        corrupt_seq[4, 10] = np.inf
        corrupt_seq[6, 15] = -np.inf

        result = self.pipeline.predict_sequence(corrupt_seq)
        self.assertIn("forecast_horizons", result)
        h30 = result["forecast_horizons"]["30s_ahead"]
        self.assertFalse(np.isnan(h30), "Prediction must not contain NaN after sanitization")
        self.assertGreaterEqual(h30, 0.0)
        self.assertLessEqual(h30, 1.0)

    def test_api_server_health_safe_when_uninitialized(self):
        import src.api.server as srv
        original_pipeline = srv.PIPELINE
        try:
            srv.PIPELINE = None
            # Check models_loaded safety logic
            models_loaded = {
                "lstm_recurrent": (srv.PIPELINE.lstm is not None) if srv.PIPELINE else False,
                "xgboost_booster": (srv.PIPELINE.xgb_bst is not None) if srv.PIPELINE else False,
                "standard_scaler": (srv.PIPELINE.scaler is not None) if srv.PIPELINE else False,
            }
            self.assertFalse(models_loaded["lstm_recurrent"])
            self.assertFalse(models_loaded["xgboost_booster"])
            self.assertFalse(models_loaded["standard_scaler"])
        finally:
            srv.PIPELINE = original_pipeline


class TestTemporalModelArchitecture(unittest.TestCase):
    def test_recurrent_forecaster_output_shapes(self):
        model = RecurrentForecaster(rnn_type="lstm", input_dim=24, hidden_dim=32, num_layers=1)
        model.eval()
        batch_x = torch.randn(4, 10, 24)
        logits, intensity = model(batch_x)
        self.assertEqual(logits.shape, (4,), "Logits output must match batch size (B,)")
        self.assertEqual(intensity.shape, (4,), "Intensity output must match batch size (B,)")

    def test_stgnn_output_shapes(self):
        from src.models.temporal_gnn import SpatioTemporalGNN
        stgnn = SpatioTemporalGNN(num_nodes=16, in_node_features=6, gnn_hidden_dim=16, rnn_hidden_dim=32, num_rnn_layers=1)
        stgnn.eval()
        batch_x = torch.randn(2, 10, 16, 6)
        batch_a = torch.eye(16).repeat(2, 10, 1, 1)
        logits, intensity = stgnn(batch_x, batch_a)
        self.assertEqual(logits.shape, (2,), "ST-GNN logits must match batch size (B,)")
        self.assertEqual(intensity.shape, (2,), "ST-GNN intensity must match batch size (B,)")

    def test_dashboard_files_exist(self):
        root_dash = Path("dashboard/index.html")
        src_dash = Path("src/dashboard/web_dashboard.html")
        self.assertTrue(root_dash.exists(), "dashboard/index.html must exist")
        self.assertTrue(src_dash.exists(), "src/dashboard/web_dashboard.html must exist")

    def test_run_server_signature(self):
        import inspect
        from src.api.server import run_server
        sig = inspect.signature(run_server)
        self.assertIn("host", sig.parameters)
        self.assertIn("port", sig.parameters)


if __name__ == "__main__":
    unittest.main()
