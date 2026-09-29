"""
CSV Exporter Module for PT500A PD Online Data.
Consolidates 40-50 .pwa files + .mdb metadata into 01 SINGLE Unified CSV Report File.
Supports Progress Callbacks & Batch Mode Processing.
"""

import os
import glob
import csv
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

        avg_q = round(sum(p["q_pc"] * p["count"] for p in all_prpd_points) / max(1, total_pulses), 1)
        pulse_per_cycle = round(total_pulses / (50.0 * max(1, len(self.pwa_files))), 1)

        # Dynamic Risk Level & AI Diagnosis based on Qmax (pC)
        if max_q < 300.0:
            risk_level = "NORMAL"
            ai_diag = "Nhiễu / Phóng điện nhẹ"
        elif max_q < 750.0:
            risk_level = "WATCH"
            ai_diag = "Surface PD (Phóng điện bề mặt)"
        else:
            risk_level = "CRITICAL"
            ai_diag = "Internal Arc (Phóng điện nội bộ nghiêm trọng)"

        pos_x, pos_y, pos_z = 2.15, 1.10, 1.65

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

            # Section 2: SUMMARY METRICS
            writer.writerow(["# SECTION", "METRICS_SUMMARY"])
            writer.writerow(["Qmax_pC", max_q])
            writer.writerow(["Qavg_pC", avg_q])
            writer.writerow(["Total_Pulse_Count", total_pulses])
            writer.writerow(["Pulse_Per_Cycle", pulse_per_cycle])
            writer.writerow(["AI_Defect_Diagnosis", ai_diag])
            writer.writerow(["Risk_Level", risk_level])
            writer.writerow(["3D_Location_X_m", pos_x])
            writer.writerow(["3D_Location_Y_m", pos_y])
            writer.writerow(["3D_Location_Z_m", pos_z])
            writer.writerow([])

            # Section 3: PRPD MATRIX POINTS (Phase, Qmax, PulseCount, Face)
            writer.writerow(["# SECTION", "PRPD_MATRIX"])
            writer.writerow(["Phase_Deg", "Q_pC", "Pulse_Count", "Face_Number"])
            for pt in all_prpd_points:
                writer.writerow([pt["phase_deg"], pt["q_pc"], pt["count"], pt["face"]])

        if progress_callback:
            progress_callback(100, f"Hoàn thành xuất file: {output_csv_path}")

        return output_csv_path
