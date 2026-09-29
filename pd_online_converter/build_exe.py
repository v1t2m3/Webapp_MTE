"""
PyInstaller Build Script for PDonline-PT500A-Convert.exe
Packages CustomTkinter Desktop Application into 01 Portable Standalone .exe file.
"""

import os
import sys
import subprocess

def build_standalone_exe():
    print("=" * 70)
    print("   BUILDING STANDALONE PORTABLE EXE: PDonline-PT500A-Convert.exe")
    print("=" * 70)

    base_dir = os.path.dirname(os.path.abspath(__file__))
    main_gui_script = os.path.join(base_dir, "gui_app.py")
    output_name = "PDonline-PT500A-Convert"

    # PyInstaller Build Flags
    pyinstaller_cmd = [
        sys.executable, "-m", "PyInstaller",
        "--noconfirm",
        "--onedir",                # Can be --onefile or --onedir
        "--windowed",              # No raw black console window
        "--name", output_name,
        "--collect-all", "customtkinter",
        "--clean",
        main_gui_script
    ]

    print(f"[*] Running PyInstaller Command:\n    {' '.join(pyinstaller_cmd)}\n")
    
    try:
        subprocess.check_call(pyinstaller_cmd, cwd=base_dir)
        print("\n" + "=" * 70)
        print("[SUCCESS] Build process completed successfully!")
        print(f"          Executable output folder: {os.path.join(base_dir, 'dist', output_name)}")
        print("=" * 70)
    except Exception as e:
        print(f"\n[Error] PyInstaller build failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    build_standalone_exe()
