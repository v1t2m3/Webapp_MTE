"""
MDB Database & Folder Metadata Parser Utility.
Dynamically extracts Test Metadata, Substation Name, Power Company, Transformer Code, Test Date, Inspector Name.
"""

import os
import re
import glob
import datetime

class MdbParserUtil:
    def __init__(self, mdb_path: str = "", folder_path: str = ""):
        self.mdb_path = mdb_path
        self.folder_path = folder_path
        self.metadata = {
            "transformer_code": "T1",
            "transformer_name": "Máy biến áp 110kV T1",
            "substation_name": "TBA 110kV Thắng Bình",
            "power_company": "Công ty Điện lực Quảng Nam",
            "test_date": datetime.date.today().strftime("%d/%m/%Y"),
            "inspector_name": "KTV Thí nghiệm PD",
            "capacity_mva": 63,
            "voltage_ratio": "115/38,5/24kV",
            "manufacturer": "EEMC"
        }

    def parse(self):
        raw_text_chunks = []

        # 1. Read binary content from .mdb file if present
        if self.mdb_path and os.path.exists(self.mdb_path):
            try:
                with open(self.mdb_path, "rb") as f:
                    data = f.read()
                    raw_text_chunks.append(data.decode("utf-16le", errors="ignore"))
                    raw_text_chunks.append(data.decode("latin1", errors="ignore"))
            except Exception as e:
                print(f"[Warning] Cannot read MDB file {self.mdb_path}: {e}")

        # 2. Read binary headers from .pwa files if folder_path provided
        if self.folder_path and os.path.exists(self.folder_path):
            pwa_files = sorted(glob.glob(os.path.join(self.folder_path, "*.pwa")))
            for pf in pwa_files[:10]:
                try:
                    with open(pf, "rb") as f:
                        header_data = f.read(4096)
                        raw_text_chunks.append(header_data.decode("latin1", errors="ignore"))
                        raw_text_chunks.append(header_data.decode("utf-16le", errors="ignore"))
                except Exception:
                    pass
            
            # Append folder path and file names to text corpus
            raw_text_chunks.append(self.folder_path)
            for pf in pwa_files[:10]:
                raw_text_chunks.append(os.path.basename(pf))

        if not raw_text_chunks:
            return self.metadata

        full_blob = " ".join(raw_text_chunks)

        try:
            # A. Detect Power Company
            if re.search(r"Quang\s*Nam", full_blob, re.IGNORECASE):
                self.metadata["power_company"] = "Công ty Điện lực Quảng Nam"
            elif re.search(r"Da\s*Nang|\u0110\u00e0\s*N\u1eb5ng", full_blob, re.IGNORECASE):
                self.metadata["power_company"] = "Công ty Điện lực Đà Nẵng"
            elif re.search(r"Quang\s*Ninh", full_blob, re.IGNORECASE):
                self.metadata["power_company"] = "Công ty Điện lực Quảng Ninh"
            elif re.search(r"Thua\s*Thien\s*Hue|Hue", full_blob, re.IGNORECASE):
                self.metadata["power_company"] = "Công ty Điện lực Thừa Thiên Huế"
            else:
                pc_m = re.search(r"(?:PC|C\u00f4ng ty \u0110i\u1ec7n l\u1ef1c)\s+([A-Z][a-zA-Z\s]+)", full_blob)
                if pc_m:
                    self.metadata["power_company"] = "Công ty Điện lực " + pc_m.group(1).strip()

            # B. Detect Substation Name
            tba_m = re.search(r"(TBA\s*(?:110kV)?\s*[\w\s\u00C0-\u024F]+|Tr\u1ea1m\s*(?:110kV)?\s*[\w\s\u00C0-\u024F]+)", full_blob, re.IGNORECASE)
            if tba_m:
                clean_tba = tba_m.group(0).strip()
                for sep in ["\\", "/", "\x00", "\n", ";", ",", "MBA", "EQ1"]:
                    if sep in clean_tba and not clean_tba.startswith(sep):
                        clean_tba = clean_tba.split(sep)[0].strip()
                if len(clean_tba) > 3:
                    self.metadata["substation_name"] = clean_tba

            if not self.metadata["substation_name"] and self.folder_path:
                folder_base = os.path.basename(os.path.abspath(self.folder_path))
                self.metadata["substation_name"] = "TBA 110kV " + folder_base

            # C. Detect Transformer Code (T1, T2, T3, T4...)
            code_m = re.search(r"\b(T[1-9]|MBA\s*T[1-9])\b", full_blob, re.IGNORECASE)
            if code_m:
                raw_c = code_m.group(0).upper().replace("MBA", "").strip()
                self.metadata["transformer_code"] = raw_c
            
            self.metadata["transformer_name"] = "Máy biến áp 110kV " + self.metadata["transformer_code"]

            # D. Detect Test Date (e.g. 202402251102 -> 25/02/2024)
            date_fn_m = re.search(r"20(2[0-9])(0[1-9]|1[0-2])(0[1-9]|[12][0-9]|3[01])", full_blob)
            if date_fn_m:
                full_date_str = date_fn_m.group(0)
                yyyy, mm, dd = full_date_str[:4], full_date_str[4:6], full_date_str[6:8]
                self.metadata["test_date"] = f"{dd}/{mm}/{yyyy}"
            else:
                std_date = re.search(r"\b(0[1-9]|[12][0-9]|3[01])/(0[1-9]|1[0-2])/(202[0-9])\b", full_blob)
                if std_date:
                    self.metadata["test_date"] = std_date.group(0)
                elif self.folder_path:
                    pwas = glob.glob(os.path.join(self.folder_path, "*.pwa"))
                    if pwas:
                        mtime = os.path.getmtime(pwas[0])
                        self.metadata["test_date"] = datetime.datetime.fromtimestamp(mtime).strftime("%d/%m/%Y")

            # E. Detect Manufacturer if present
            if "ABB" in full_blob:
                self.metadata["manufacturer"] = "ABB"
            elif "Hitachi" in full_blob or "HITACHI" in full_blob:
                self.metadata["manufacturer"] = "Hitachi"
            elif "VEC" in full_blob:
                self.metadata["manufacturer"] = "VEC"

        except Exception as e:
            print(f"[Warning] Error parsing MDB/PWA metadata ({e}), using schema fallback.")

        return self.metadata

