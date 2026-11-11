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
            return
        elif self.path in ["/app", "/app/"]:
            spa_index = BASE_DIR / "frontend/dist/index.html"
            if spa_index.exists():
                self.send_response(200)
                self.send_header("Content-Type", "text/html; charset=utf-8")
                self.end_headers()
                with open(spa_index, "rb") as f:
                    self.wfile.write(f.read())
                return
            self._send_json(404, {"error": "Frontend build not found. Run 'npm --prefix frontend run build' first."})
            return
        elif self.path.startswith("/assets/") or self.path.startswith("/app/assets/"):
            rel_path = self.path.replace("/app/assets/", "").replace("/assets/", "")
            asset_path = BASE_DIR / "frontend/dist/assets" / rel_path
            if asset_path.exists() and asset_path.is_file():
                content_type = "application/octet-stream"
                if asset_path.suffix == ".js":
                    content_type = "application/javascript; charset=utf-8"
                elif asset_path.suffix == ".css":
                    content_type = "text/css; charset=utf-8"
                elif asset_path.suffix == ".svg":
                    content_type = "image/svg+xml"
                elif asset_path.suffix == ".png":
                    content_type = "image/png"
                elif asset_path.suffix in [".woff", ".woff2"]:
                    content_type = f"font/{asset_path.suffix[1:]}"

                self.send_response(200)
                self.send_header("Content-Type", content_type)
                self.send_header("Cache-Control", "public, max-age=31536000")
                self.end_headers()
                with open(asset_path, "rb") as f:
                    self.wfile.write(f.read())
                return
            self._send_json(404, {"error": f"Asset {rel_path} not found."})
            return
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


def run_server(port=8080, host=""):
    global PIPELINE
    # Flexible argument parsing if host and port are swapped
    if isinstance(port, str) and not port.isdigit():
        host, port = port, (host if isinstance(host, int) else 8080)
    port = int(port)
    host = str(host)

    print(f"Initializing SentinelGraph Inference Engine...")
    PIPELINE = SentinelInferencePipeline()
    server_address = (host, port)
    HTTPServer.allow_reuse_address = True
    httpd = HTTPServer(server_address, SentinelRequestHandler)
    print(f"SentinelGraph REST API Server listening on port {port}...")
    print(f"  Intelligence Platform: http://localhost:{port}/app/")
    print(f"  Legacy Dashboard:      http://localhost:{port}/dashboard")
    print(f"  Health Check:          http://localhost:{port}/health")
    print(f"  Forecast Endpoint:     POST http://localhost:{port}/forecast")
    print(f"  Metrics Endpoint:      http://localhost:{port}/metrics")
    httpd.serve_forever()


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8080
    run_server(port=port)

