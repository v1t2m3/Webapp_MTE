#!/usr/bin/env python3
"""
CLI Entry point for Module Converter Python PD Online PT500A.
Supports Single Folder Conversion & Batch Directory Processing.
"""

import sys
import os
import argparse
from csv_exporter import CsvExporter

def main():
    parser = argparse.ArgumentParser(
        description="Module Converter Python PD Online PT500A (.pwa -> Unified .csv)"
    )
    parser.add_argument(
        "dir_path",
        nargs="?",
        default="/home/mte_lab/Webapp_MTE/public/modul_py_convert",
        help="Path to folder containing .pwa and .mdb files"
    )
    parser.add_argument(
        "-o", "--output",
        help="Custom output CSV file path"
    )
    parser.add_argument(
        "--batch",
        action="store_true",
        help="Process all subdirectories in batch mode"
    )

    args = parser.parse_args()

    target_dir = os.path.abspath(args.dir_path)
    if not os.path.exists(target_dir):
        print(f"[Error] Directory not found: {target_dir}")
        sys.exit(1)

    print("=" * 70)
    print("      MODULE CONVERTER PYTHON PD ONLINE PT500A (v1.0)")
    print("=" * 70)

    if args.batch:
        subdirs = [
            os.path.join(target_dir, d)
            for d in os.listdir(target_dir)
            if os.path.isdir(os.path.join(target_dir, d))
        ]
        if not subdirs:
            subdirs = [target_dir]

        print(f"[*] Batch Mode Enabled: Processing {len(subdirs)} folders...")
        for sd in subdirs:
            try:
                exporter = CsvExporter(sd)
                out_path = exporter.export_unified_csv()
                print(f"  [SUCCESS] Converted {len(exporter.pwa_files)} .pwa files -> {out_path}")
            except Exception as e:
                print(f"  [SKIPPED] {sd}: {e}")
    else:
        try:
            print(f"[*] Processing Directory: {target_dir}")
            exporter = CsvExporter(target_dir)
            print(f"[*] Found {len(exporter.pwa_files)} .pwa file(s) and {len(exporter.mdb_files)} .mdb file(s).")
            out_path = exporter.export_unified_csv(args.output)
            print(f"[SUCCESS] Unified CSV file generated at:")
            print(f"          -> {out_path}")
            print(f"[INFO] File Size: {os.path.getsize(out_path)} bytes")
        except Exception as e:
            print(f"[Error] Conversion failed: {e}")
            sys.exit(1)

if __name__ == "__main__":
    main()
