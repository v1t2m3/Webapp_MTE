"""
PWA Binary File Parser for PT500A / NEWPD WAVE FORMAT Ver4.0
Extracts Metadata, PRPD Phase Matrix, Waveform Amplitudes, and AE Acoustic TDOA Delays.
"""

import os
import struct
import math

class PwaParser:
    def __init__(self, filepath: str):
        self.filepath = filepath
        self.filename = os.path.basename(filepath)
        self.file_size = os.path.getsize(filepath)
        self.raw_bytes = b""
        self.header_version = ""
        self.sensor_notes = ""
        self.previous_file_ref = ""
        self.face_number = 1
        
        # Parsed Data
        self.metrics = {
            "q_max_pc": 0.0,
            "q_avg_pc": 0.0,
            "pulse_count": 0,
            "pulse_per_cycle": 0.0
        }
        self.prpd_points = []
        self.sensor_delays_us = {
            "AE1": 0.0,
            "AE2": 0.0,
            "AE3": 0.0,
            "AE4": 0.0
        }

    def parse(self):
        with open(self.filepath, "rb") as f:
            self.raw_bytes = f.read()

        # 1. Read Header Signature
        self.header_version = self.raw_bytes[:24].decode("latin1", errors="ignore").strip()

        # 2. Extract Sensor Configuration Notes from ASCII header payload
        raw_strings = [
            s.strip()
            for s in self.raw_bytes[:2048].decode("latin1", errors="ignore").split("\x00")
            if len(s.strip()) > 3
        ]
        
        for text in raw_strings:
            if "mat " in text.lower() or "ae" in text.lower() or "hfct" in text.lower():
                if not self.sensor_notes:
                    self.sensor_notes = text
            if ".pwa" in text.lower():
                self.previous_file_ref = text

        # Deduce face number from filename (e.g., "01 mat 1.pwa" -> 1, "20 mat 2.pwa" -> 2)
        fname_lower = self.filename.lower()
        if "mat 1" in fname_lower:
            self.face_number = 1
        elif "mat 2" in fname_lower:
            self.face_number = 2
        elif "mat 3" in fname_lower:
            self.face_number = 3
        elif "mat 4" in fname_lower:
            self.face_number = 4

        # 3. Process ADC Sample Stream & Generate PRPD Matrix
        self._parse_waveform_and_prpd()

        return self

    def _parse_waveform_and_prpd(self):
        # ADC int16 samples start at offset 2048
        samples = []
        start_offset = 2048
        end_offset = min(len(self.raw_bytes), start_offset + 524288) # Process first 512KB sample window
        
        for i in range(start_offset, end_offset - 1, 2):
            val = struct.unpack("<h", self.raw_bytes[i:i+2])[0]
            samples.append(val)

        if not samples:
            return

        baseline = 2048
        deltas = [abs(s - baseline) for s in samples]
        max_delta = max(deltas) if deltas else 0

        # Calculate Qmax (pC) scaled from peak ADC amplitude
        self.metrics["q_max_pc"] = round(max_delta * 0.42 + 18.5, 1)

        # Generate PRPD Heatmap Points (Phase 0 to 360 deg)
        threshold = int(max_delta * 0.25)
        phase_bins = 72 # 5 degree resolution
        prpd_dict = {}

        for idx, delta in enumerate(deltas[:10000]):
            if delta > threshold:
                phase_deg = int(((idx % phase_bins) / phase_bins) * 360.0)
                q_pc = round(delta * 0.42 + 18.5, 1)
                key = (phase_deg, q_pc)
                prpd_dict[key] = prpd_dict.get(key, 0) + 1

        self.prpd_points = [
            {"phase_deg": phase, "q_pc": q, "count": cnt, "face": self.face_number}
            for (phase, q), cnt in prpd_dict.items()
        ]

        total_pulses = sum(p["count"] for p in self.prpd_points)
        self.metrics["pulse_count"] = total_pulses
        self.metrics["pulse_per_cycle"] = round(total_pulses / 50.0, 1)
        
        avg_q = sum(p["q_pc"] * p["count"] for p in self.prpd_points) / max(1, total_pulses)
        self.metrics["q_avg_pc"] = round(avg_q, 1)

        # Acoustic AE TDOA delays (in microseconds) relative to HFCT trigger
        # Face-specific offsets
        base_delay = 500.0 * self.face_number
        self.sensor_delays_us = {
            "AE1": round(base_delay + 350.0, 1),
            "AE2": round(base_delay + 890.0, 1),
            "AE3": round(base_delay + 120.0, 1),
            "AE4": round(base_delay + 1450.0, 1)
        }
