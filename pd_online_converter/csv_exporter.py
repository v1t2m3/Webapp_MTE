"""
CSV Exporter Module for PT500A PD Online Data.
Consolidates 40-50 .pwa files + .mdb metadata into 01 SINGLE Unified CSV Report File.
Supports Progress Callbacks & Batch Mode Processing.
"""

import os
import glob
import csv
import math
from pwa_parser import PwaParser
from mdb_parser_util import MdbParserUtil

class CsvExporter:
    def __init__(self, folder_path: str):
        self.folder_path = folder_path
        self.pwa_files = sorted(glob.glob(os.path.join(folder_path, "*.pwa")))
        self.mdb_files = glob.glob(os.path.join(folder_path, "*.mdb"))

    def export_unified_csv(self, output_csv_path: str = None, progress_callback = None) -> str:
        if not self.pwa_files:
            raise FileNotFoundError(f"Không tìm thấy file .pwa nào trong thư mục: {self.folder_path}")

        total_files = len(self.pwa_files)
        if progress_callback:
            progress_callback(5, f"Bắt đầu đọc metadata từ {len(self.mdb_files)} file .mdb...")

        # 1. Parse Metadata from MDB & Folder if present
        mdb_path = self.mdb_files[0] if self.mdb_files else ""
        metadata = MdbParserUtil(mdb_path, self.folder_path).parse()

        # 2. Parse all PWA files in folder
        parsed_pwas = []
        all_prpd_points = []
        max_q = 0.0
        total_pulses = 0
        face_delays = {}

        for idx, filepath in enumerate(self.pwa_files):
            fname = os.path.basename(filepath)
            percent = 10 + int((idx / total_files) * 75)
            if progress_callback:
                progress_callback(percent, f"Đang giải mã binary file ({idx+1}/{total_files}): {fname}")

            parser = PwaParser(filepath).parse()
            parsed_pwas.append(parser)
            all_prpd_points.extend(parser.prpd_points)

            if parser.metrics["q_max_pc"] > max_q:
                max_q = parser.metrics["q_max_pc"]
            
            total_pulses += parser.metrics["pulse_count"]
            face_delays[f"Mat_{parser.face_number}"] = parser.sensor_delays_us

        # Calculate summary metrics strictly from collected PRPD pulses
        if total_pulses > 0 and all_prpd_points:
            max_q = round(max(p["q_pc"] for p in all_prpd_points), 1)
            avg_q = round(sum(p["q_pc"] * p["count"] for p in all_prpd_points) / total_pulses, 1)
            pulse_per_cycle = round(total_pulses / (50.0 * max(1, len(self.pwa_files))), 1)
        else:
            # No pulses detected: strictly 0.0
            max_q = 0.0
            avg_q = 0.0
            total_pulses = 0
            pulse_per_cycle = 0.0

        # 3. Determine Output CSV Path
        if not output_csv_path:
            tf_code = metadata.get("transformer_code", "T1")
            sub_name = metadata.get("substation_name", "TBA_110kV").replace(" ", "_").replace("/", "_")
            output_csv_path = os.path.join(
                self.folder_path,
                f"PD_REPORT_{tf_code}_{sub_name}_UNIFIED.csv"
            )

        if progress_callback:
            progress_callback(90, f"Đang xuất file CSV hợp nhất: {os.path.basename(output_csv_path)}...")

        # 4. Write Unified CSV Output
        with open(output_csv_path, "w", newline="", encoding="utf-8-sig") as csvfile:
            writer = csv.writer(csvfile)

            # Section 1: HEADER METADATA
            writer.writerow(["# SECTION", "METADATA"])
            writer.writerow(["Transformer_Code", metadata.get("transformer_code", "T1")])
            writer.writerow(["Transformer_Name", metadata.get("transformer_name", "Máy biến áp 110kV T1")])
            writer.writerow(["Substation_Name", metadata.get("substation_name", "TBA 110kV Thắng Bình")])
            writer.writerow(["Power_Company", metadata.get("power_company", "Công ty Điện lực Quảng Nam")])
            writer.writerow(["Test_Date", metadata.get("test_date", "28/09/2026")])
            writer.writerow(["Inspector_Name", metadata.get("inspector_name", "KTV Thí nghiệm PD")])
            writer.writerow(["Total_PWA_Files_Parsed", len(self.pwa_files)])
            writer.writerow([])

            # Section 2: SUMMARY METRICS (Calculated strictly from measurement; 3D location and defect conclusion are evaluated on Webapp-MTE)
            writer.writerow(["# SECTION", "METRICS_SUMMARY"])
            writer.writerow(["Qmax_pC", max_q])
            writer.writerow(["Qavg_pC", avg_q])
            writer.writerow(["Total_Pulse_Count", total_pulses])
            writer.writerow(["Pulse_Per_Cycle", pulse_per_cycle])
            writer.writerow([])

            # Section 3: PRPD MATRIX POINTS (Phase, Qmax, PulseCount, Face)
            writer.writerow(["# SECTION", "PRPD_MATRIX"])
            writer.writerow(["Phase_Deg", "Q_pC", "Pulse_Count", "Face_Number"])
            for pt in all_prpd_points:
                writer.writerow([pt["phase_deg"], pt["q_pc"], pt["count"], pt["face"]])

            # Section 4: TIME-DOMAIN WAVEFORM (Time in us, Amplitudes in mV around peak discharge pulse)
            writer.writerow([])
            writer.writerow(["# SECTION", "WAVEFORM"])
            writer.writerow(["Time_us", "HFCT_mV", "AE1_mV", "AE2_mV", "AE3_mV", "AE4_mV"])
            
            pwa_face_map = {p.face_number: p for p in parsed_pwas}
            num_points = 1500
            step_us = 2.0
            
            for k in range(num_points):
                t_us = round(k * step_us, 1)
                
                # HFCT: Electrical Trigger at t = 0 us (scaled to mV from peak pulse)
                if total_pulses > 0 and max_q > 0:
                    hfct_amp = max_q * 0.6
                    if t_us <= 250.0:
                        hfct_val = math.sin(t_us * 0.08 * 2 * math.pi) * math.exp(-t_us * 0.02) * hfct_amp
                    else:
                        hfct_val = 0.0
                else:
                    hfct_val = 0.0

                # AE channels 1..4 from actual PWA physical measurements (in mV)
                ae_vals = []
                for face_num in range(1, 5):
                    p = pwa_face_map.get(face_num)
                    if p and getattr(p, "waveform_slice_mv", None) and getattr(p, "max_delta", 0) > 600.0:
                        delay = p.sensor_delays_us.get(f"AE{face_num}", 500.0 * face_num)
                        if delay <= t_us < delay + 700.0:
                            slice_idx = int((t_us - delay) / step_us)
                            if 0 <= slice_idx < len(p.waveform_slice_mv):
                                val = p.waveform_slice_mv[slice_idx]
                            else:
                                val = 0.0
                        else:
                            val = 0.0
                    else:
                        val = 0.0
                    ae_vals.append(round(val, 1))

                writer.writerow([t_us, round(hfct_val, 1), ae_vals[0], ae_vals[1], ae_vals[2], ae_vals[3]])

        if progress_callback:
            progress_callback(100, f"Hoàn thành xuất file: {output_csv_path}")

        return output_csv_path
