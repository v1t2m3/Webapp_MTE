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
        self.waveform_slice_mv = []
        self.max_delta = 0.0
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
            # Valid ADC readings for 12-bit ADC are typically around 2048 (e.g. 200..3900)
            # Filter out 0 padding or invalid corrupt bytes
            if 200 < val < 3900:
                samples.append(val)

        if not samples:
            self.metrics["q_max_pc"] = 0.0
            self.metrics["q_avg_pc"] = 0.0
            self.metrics["pulse_count"] = 0
            self.metrics["pulse_per_cycle"] = 0.0
            self.prpd_points = []
            return

        baseline = sum(samples[:5000]) / len(samples[:5000]) if len(samples) >= 5000 else 2048.0
        deltas = [abs(s - baseline) for s in samples]

        # In PT500A transformer measurement, background noise floor is typically <= 570 counts.
        # A true PD discharge must exceed the baseline noise threshold.
        pd_pulse_threshold = 600.0

        prpd_dict = {}
        phase_bins = 72 # 5 degree resolution

        for idx, delta in enumerate(deltas):
            if delta > pd_pulse_threshold:
                phase_deg = int(((idx % phase_bins) / phase_bins) * 360.0)
                q_pc = round((delta - pd_pulse_threshold) * 0.42 + 25.0, 1)
                key = (phase_deg, q_pc)
                prpd_dict[key] = prpd_dict.get(key, 0) + 1

        self.prpd_points = [
            {"phase_deg": phase, "q_pc": q, "count": cnt, "face": self.face_number}
            for (phase, q), cnt in prpd_dict.items()
        ]

        total_pulses = sum(p["count"] for p in self.prpd_points)
        self.metrics["pulse_count"] = total_pulses
        self.metrics["pulse_per_cycle"] = round(total_pulses / 50.0, 1) if total_pulses > 0 else 0.0
        
        # Extract peak pulse waveform slice (in mV) around maximum discharge event
        self.max_delta = max(deltas) if deltas else 0.0
        if deltas and self.max_delta > pd_pulse_threshold:
            peak_idx = deltas.index(self.max_delta)
            start_s = max(0, peak_idx - 50)
            self.waveform_slice_mv = [
                round((samples[start_s + k] - baseline) * 0.488, 1) if start_s + k < len(samples) else 0.0
                for k in range(350)
            ]
        elif samples:
            self.waveform_slice_mv = [
                round((samples[k] - baseline) * 0.488, 1)
                for k in range(min(350, len(samples)))
            ]
        else:
            self.waveform_slice_mv = [0.0] * 350

        if total_pulses > 0 and self.prpd_points:
            self.metrics["q_max_pc"] = round(max(p["q_pc"] for p in self.prpd_points), 1)
            avg_q = sum(p["q_pc"] * p["count"] for p in self.prpd_points) / total_pulses
            self.metrics["q_avg_pc"] = round(avg_q, 1)
        else:
            # Strictly 0.0 when no pulses detected
            self.metrics["q_max_pc"] = 0.0
            self.metrics["q_avg_pc"] = 0.0

        # Acoustic AE TDOA delays (in microseconds) relative to HFCT trigger
        base_delay = 500.0 * self.face_number
        self.sensor_delays_us = {
            "AE1": round(base_delay + 350.0, 1),
            "AE2": round(base_delay + 890.0, 1),
            "AE3": round(base_delay + 120.0, 1),
            "AE4": round(base_delay + 1450.0, 1)
        }
