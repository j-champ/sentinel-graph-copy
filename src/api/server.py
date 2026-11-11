"""
SentinelGraph - REST API Server (Phase 9 MVP)
Standard library microservice serving multi-horizon network attack forecasting,
early-warning detection alerts, intensity prediction, and metrics.
"""

import json
from http.server import HTTPServer, BaseHTTPRequestHandler
from pathlib import Path
import sys
import numpy as np

BASE_DIR = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(BASE_DIR))

from src.pipeline.inference import SentinelInferencePipeline

PIPELINE = None


class SentinelRequestHandler(BaseHTTPRequestHandler):
    def _send_json(self, status_code, data):
        self.send_response(status_code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(json.dumps(data, indent=2).encode("utf-8"))

    def do_GET(self):
        if self.path in ["/", "/dashboard"]:
            dash_path = BASE_DIR / "dashboard/index.html"
            if dash_path.exists():
                self.send_response(200)
                self.send_header("Content-Type", "text/html; charset=utf-8")
                self.end_headers()
                with open(dash_path, "rb") as f:
                    self.wfile.write(f.read())
                return
            self._send_json(404, {"error": "Dashboard HTML not found."})
        elif self.path == "/health":
            self._send_json(200, {
                "status": "healthy",
                "system": "SentinelGraph Attack Forecasting MVP",
                "device": PIPELINE.device if PIPELINE else "uninitialized",
                "models_loaded": {
                    "lstm_recurrent": (PIPELINE.lstm is not None) if PIPELINE else False,
                    "xgboost_booster": (PIPELINE.xgb_bst is not None) if PIPELINE else False,
                    "standard_scaler": (PIPELINE.scaler is not None) if PIPELINE else False,
                }
            })
        elif self.path == "/metrics":
            report_file = BASE_DIR / "reports/unified_benchmark_results.md"
            if report_file.exists():
                with open(report_file) as f:
                    content = f.read()
                self._send_json(200, {"report": content})
            else:
                self._send_json(404, {"error": "Benchmark report not found."})
        else:
            self._send_json(404, {"error": "Endpoint not found."})

    def do_POST(self):
        if self.path == "/forecast":
            content_length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(content_length)
            try:
                payload = json.loads(body.decode("utf-8"))
                # Expects a 10x24 array of historical states
                if "sequence" not in payload:
                    self._send_json(400, {"error": "Missing 'sequence' field in request body. Must be (10, 24) array."})
                    return
                seq = np.asarray(payload["sequence"], dtype=np.float32)
                if seq.shape != (10, 24):
                    self._send_json(400, {"error": f"Invalid sequence shape: expected (10, 24), got {seq.shape}"})
                    return
                forecast = PIPELINE.predict_sequence(seq)
                self._send_json(200, forecast)
            except Exception as e:
                self._send_json(500, {"error": str(e)})
        else:
            self._send_json(404, {"error": "Endpoint not found."})


def run_server(port=8080):
    global PIPELINE
    print(f"Initializing SentinelGraph Inference Engine...")
    PIPELINE = SentinelInferencePipeline()
    server_address = ("", port)
    httpd = HTTPServer(server_address, SentinelRequestHandler)
    print(f"SentinelGraph REST API Server listening on port {port}...")
    print(f"  Health Check: http://localhost:{port}/health")
    print(f"  Forecast Endpoint: POST http://localhost:{port}/forecast")
    print(f"  Metrics Endpoint: http://localhost:{port}/metrics")
    httpd.serve_forever()


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8080
    run_server(port)
