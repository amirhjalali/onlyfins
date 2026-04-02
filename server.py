#!/usr/bin/env python3
"""Simple dev server for OnlyFins — serves static files + HLS segments."""

import http.server
import os

PORT = 8080
PUBLIC_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "public")
HLS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "stream", "hls")


class OnlyFinsHandler(http.server.SimpleHTTPRequestHandler):
    def translate_path(self, path):
        # Route /stream/* to the HLS output directory
        if path.startswith("/stream/"):
            rel = path[len("/stream/"):]
            return os.path.join(HLS_DIR, rel)
        # Everything else from public/
        if path == "/":
            path = "/index.html"
        return os.path.join(PUBLIC_DIR, path.lstrip("/"))

    def end_headers(self):
        # CORS for HLS.js and proper MIME types
        self.send_header("Access-Control-Allow-Origin", "*")
        if self.path.endswith(".m3u8"):
            self.send_header("Content-Type", "application/vnd.apple.mpegurl")
        elif self.path.endswith(".ts"):
            self.send_header("Content-Type", "video/mp2t")
        super().end_headers()


if __name__ == "__main__":
    os.makedirs(HLS_DIR, exist_ok=True)
    server = http.server.HTTPServer(("0.0.0.0", PORT), OnlyFinsHandler)
    print(f"OnlyFins serving at http://localhost:{PORT}")
    print(f"  Static files: {PUBLIC_DIR}")
    print(f"  HLS segments: {HLS_DIR}")
    server.serve_forever()
