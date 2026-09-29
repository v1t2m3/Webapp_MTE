"""
PDonline-PT500A convert - GUI Desktop Application (CustomTkinter)
Powered by MTELAB • ISO/IEC 17025 Engine

Features:
- Single Folder & Batch Mode Conversion
- Real-time Progress Bar & Terminal Log Output
- Auto-open Output Folder Checkbox
- Synchronized Webapp-MTE Dark Theme Aesthetics
- Standalone Portable Executable Ready (PyInstaller)
"""

import sys
import os
import threading
import time
import subprocess
import platform
import tkinter as tk
from tkinter import filedialog, messagebox

try:
    import customtkinter as ctk
except ImportError:
    print("[Error] customtkinter module not found. Installing...")
    subprocess.check_call([sys.executable, "-m", "pip", "install", "customtkinter"])
    import customtkinter as ctk

from csv_exporter import CsvExporter

# Configure CustomTkinter Theme to match Webapp-MTE Dark Aesthetics
ctk.set_appearance_mode("dark")
ctk.set_default_color_theme("blue")

class PDonlineConverterApp(ctk.CTk):
    def __init__(self):
        super().__init__()

        # Window Setup - Adjusted height and minsize so action button is ALWAYS visible
        self.title("PDonline-PT500A convert - Powered by MTELAB")
        self.geometry("780x720")
        self.minsize(720, 650)

        # Color Tokens matching Webapp-MTE
        self.COLOR_BG = "#090d16"
        self.COLOR_CARD = "#0f172a"
        self.COLOR_CARD_BORDER = "#1e293b"
        self.COLOR_ACCENT_AMBER = "#f59e0b"
        self.COLOR_ACCENT_CYAN = "#06b6d4"
        self.COLOR_ACCENT_EMERALD = "#10b981"
        self.COLOR_ACCENT_INDIGO = "#6366f1"
        
        self.configure(fg_color=self.COLOR_BG)

        # State Variables
        self.selected_folder = ctk.StringVar(value="/home/mte_lab/Webapp_MTE/public/modul_py_convert")
        self.output_csv_path = ctk.StringVar(value="")
        self.auto_open_folder = ctk.BooleanVar(value=True)
        self.is_batch_mode = ctk.BooleanVar(value=False)
        self.is_processing = False

        self._build_ui()

    def _build_ui(self):
        # 1. HEADER BANNER
        header_frame = ctk.CTkFrame(self, fg_color="#020617", corner_radius=12, border_width=1, border_color="#1e1b4b")
        header_frame.pack(fill="x", padx=16, pady=(14, 8))

        header_content = ctk.CTkFrame(header_frame, fg_color="transparent")
        header_content.pack(fill="x", padx=16, pady=10)

        # Title & Subtitle Left
        title_label = ctk.CTkLabel(
            header_content,
            text="⚡ PDonline-PT500A convert",
            font=ctk.CTkFont(family="Inter", size=18, weight="bold"),
            text_color="#f8fafc"
        )
        title_label.pack(side="left", anchor="w")

        # Subtitle Badge Right
        badge_label = ctk.CTkLabel(
            header_content,
            text="Powered by MTELAB • ISO/IEC 17025",
            font=ctk.CTkFont(family="Inter", size=11, weight="bold"),
            text_color=self.COLOR_ACCENT_CYAN,
            fg_color="#0f172a",
            corner_radius=6,
            padx=10,
            pady=4
        )
        badge_label.pack(side="right", anchor="e")

        # 2. MAIN CARD CONTAINER
        main_card = ctk.CTkFrame(self, fg_color=self.COLOR_CARD, corner_radius=14, border_width=1, border_color=self.COLOR_CARD_BORDER)
        main_card.pack(fill="both", expand=True, padx=16, pady=(0, 14))

        # Tab / Mode Switcher Row
        mode_frame = ctk.CTkFrame(main_card, fg_color="transparent")
        mode_frame.pack(fill="x", padx=16, pady=(12, 4))

        mode_title = ctk.CTkLabel(
            mode_frame,
            text="CHẾ ĐỘ CHUYỂN ĐỔI:",
            font=ctk.CTkFont(size=12, weight="bold"),
            text_color="#94a3b8"
        )
        mode_title.pack(side="left", padx=(0, 10))

        self.single_mode_btn = ctk.CTkRadioButton(
            mode_frame,
            text="Đơn Thư mục",
            variable=self.is_batch_mode,
            value=False,
            command=self._on_mode_change,
            fg_color=self.COLOR_ACCENT_INDIGO,
            text_color="#e2e8f0"
        )
        self.single_mode_btn.pack(side="left", padx=10)

        self.batch_mode_btn = ctk.CTkRadioButton(
            mode_frame,
            text="Nhiều thư mục",
            variable=self.is_batch_mode,
            value=True,
            command=self._on_mode_change,
            fg_color=self.COLOR_ACCENT_AMBER,
            text_color="#e2e8f0"
        )
        self.batch_mode_btn.pack(side="left", padx=10)

        # Input Folder Selection Row
        input_frame = ctk.CTkFrame(main_card, fg_color="#020617", corner_radius=10, border_width=1, border_color="#1e293b")
        input_frame.pack(fill="x", padx=16, pady=6)

        input_label = ctk.CTkLabel(
            input_frame,
            text="📁 Thư mục nguồn chứa file (.pwa & .mdb):",
            font=ctk.CTkFont(size=11, weight="bold"),
            text_color="#cbd5e1"
        )
        input_label.pack(anchor="w", padx=12, pady=(6, 2))

        input_inner = ctk.CTkFrame(input_frame, fg_color="transparent")
        input_inner.pack(fill="x", padx=12, pady=(0, 6))

        self.folder_entry = ctk.CTkEntry(
            input_inner,
            textvariable=self.selected_folder,
            placeholder_text="Chọn thư mục chứa các file .pwa...",
            font=ctk.CTkFont(size=11),
            fg_color="#090d16",
            border_color="#334155",
            text_color="#f1f5f9"
        )
        self.folder_entry.pack(side="left", fill="x", expand=True, padx=(0, 8))

        btn_browse_folder = ctk.CTkButton(
            input_inner,
            text="Browse...",
            width=110,
            command=self._browse_folder,
            fg_color="#3b82f6",
            hover_color="#2563eb",
            font=ctk.CTkFont(size=11, weight="bold")
        )
        btn_browse_folder.pack(side="right")

        # Output CSV Save Location Row
        output_frame = ctk.CTkFrame(main_card, fg_color="#020617", corner_radius=10, border_width=1, border_color="#1e293b")
        output_frame.pack(fill="x", padx=16, pady=6)

        output_label = ctk.CTkLabel(
            output_frame,
            text="💾 Tên & Nơi lưu File (.csv) kết quả:",
            font=ctk.CTkFont(size=11, weight="bold"),
            text_color="#cbd5e1"
        )
        output_label.pack(anchor="w", padx=12, pady=(6, 2))

        output_inner = ctk.CTkFrame(output_frame, fg_color="transparent")
        output_inner.pack(fill="x", padx=12, pady=(0, 6))

        self.output_entry = ctk.CTkEntry(
            output_inner,
            textvariable=self.output_csv_path,
            placeholder_text="Mặc định tự động lưu vào thư mục nguồn ở trên...",
            font=ctk.CTkFont(size=11),
            fg_color="#090d16",
            border_color="#334155",
            text_color="#f1f5f9"
        )
        self.output_entry.pack(side="left", fill="x", expand=True, padx=(0, 8))

        btn_browse_csv = ctk.CTkButton(
            output_inner,
            text="Save...",
            width=110,
            command=self._browse_save_csv,
            fg_color="#475569",
            hover_color="#334155",
            font=ctk.CTkFont(size=11, weight="bold")
        )
        btn_browse_csv.pack(side="right")

        # Checkboxes Options
        options_frame = ctk.CTkFrame(main_card, fg_color="transparent")
        options_frame.pack(fill="x", padx=16, pady=2)

        chk_open_folder = ctk.CTkCheckBox(
            options_frame,
            text="Tự động mở thư mục chứa file .csv sau khi chuyển đổi thành công",
            variable=self.auto_open_folder,
            fg_color=self.COLOR_ACCENT_EMERALD,
            hover_color="#059669",
            font=ctk.CTkFont(size=11),
            text_color="#cbd5e1"
        )
        chk_open_folder.pack(side="left")

        # Progress Bar & Status Text
        progress_frame = ctk.CTkFrame(main_card, fg_color="transparent")
        progress_frame.pack(fill="x", padx=16, pady=(8, 2))

        self.status_label = ctk.CTkLabel(
            progress_frame,
            text="Trạng thái: Sẵn sàng chuyển đổi",
            font=ctk.CTkFont(size=11, weight="bold"),
            text_color=self.COLOR_ACCENT_CYAN
        )
        self.status_label.pack(side="left")

        self.percent_label = ctk.CTkLabel(
            progress_frame,
            text="0%",
            font=ctk.CTkFont(size=11, weight="bold"),
            text_color="#f8fafc"
        )
        self.percent_label.pack(side="right")

        self.progress_bar = ctk.CTkProgressBar(
            main_card,
            fg_color="#1e293b",
            progress_color=self.COLOR_ACCENT_EMERALD,
            height=10,
            corner_radius=5
        )
        self.progress_bar.set(0)
        self.progress_bar.pack(fill="x", padx=16, pady=2)

        # Real-time Terminal Log Console with fixed height to fit action button inside view
        log_frame = ctk.CTkFrame(main_card, fg_color="#020617", corner_radius=8, border_width=1, border_color="#1e293b")
        log_frame.pack(fill="both", expand=True, padx=16, pady=6)

        self.log_textbox = ctk.CTkTextbox(
            log_frame,
            font=ctk.CTkFont(family="Monospace", size=10),
            fg_color="transparent",
            text_color="#34d399",
            height=130,
            wrap="word"
        )
        self.log_textbox.pack(fill="both", expand=True, padx=6, pady=4)
        self._log("⚡ Đã khởi tạo PDonline-PT500A converter. Vui lòng chọn thư mục và ấn Chuyển đổi.")

        # 3. ACTION BUTTON AT BOTTOM OF MAIN CARD (ALWAYS VISIBLE)
        action_button_frame = ctk.CTkFrame(main_card, fg_color="transparent")
        action_button_frame.pack(fill="x", padx=16, pady=(4, 12))

        self.btn_convert = ctk.CTkButton(
            action_button_frame,
            text="🚀 CHUYỂN ĐỔI FILE ",
            height=40,
            command=self._start_conversion_thread,
            fg_color=self.COLOR_ACCENT_AMBER,
            hover_color="#d97706",
            text_color="#020617",
            font=ctk.CTkFont(size=13, weight="bold")
        )
        self.btn_convert.pack(fill="x")

    def _log(self, text: str):
        self.log_textbox.insert("end", f"{text}\n")
        self.log_textbox.see("end")

    def _on_mode_change(self):
        if self.is_batch_mode.get():
            self._log("[Chế độ]: Đã chuyển đổi hàng loạt thư mục.")
        else:
            self._log("[Chế độ]: Đã chuyển đổi thư mục.")

    def _browse_folder(self):
        folder = filedialog.askdirectory(title="Chọn Thư mục chứa các file .pwa")
        if folder:
            self.selected_folder.set(folder)
            self._log(f"[Đã chọn Thư mục]: {folder}")

    def _browse_save_csv(self):
        file_path = filedialog.asksaveasfilename(
            title="Chọn nơi lưu file .csv kết quả",
            defaultextension=".csv",
            filetypes=[("CSV File", "*.csv"), ("All Files", "*.*")]
        )
        if file_path:
            self.output_csv_path.set(file_path)
            self._log(f"[Nơi lưu CSV]: {file_path}")

    def _update_progress(self, percent: int, status_msg: str):
        def _update():
            self.progress_bar.set(percent / 100.0)
            self.percent_label.configure(text=f"{percent}%")
            self.status_label.configure(text=status_msg)
            self._log(f"[{percent}%] {status_msg}")
        self.after(0, _update)

    def _start_conversion_thread(self):
        if self.is_processing:
            return

        folder = self.selected_folder.get().strip()
        if not folder or not os.path.exists(folder):
            messagebox.showerror("Lỗi Đường Dẫn", "Vui lòng chọn thư mục chứa các file .pwa hợp lệ!")
            return

        self.is_processing = True
        self.btn_convert.configure(state="disabled", text="⏳ ĐANG XỬ LÝ CHUYỂN ĐỔI...")
        self.progress_bar.set(0)

        # Run conversion in background worker thread to prevent UI freezing
        thread = threading.Thread(target=self._run_conversion_process, daemon=True)
        thread.start()

    def _run_conversion_process(self):
        folder = self.selected_folder.get().strip()
        custom_out = self.output_csv_path.get().strip() or None
        start_time = time.time()

        try:
            if self.is_batch_mode.get():
                self._update_progress(5, f"Quét danh sách các thư mục con trong {folder}...")
                subdirs = [
                    os.path.join(folder, d)
                    for d in os.listdir(folder)
                    if os.path.isdir(os.path.join(folder, d))
                ]
                if not subdirs:
                    subdirs = [folder]

                total_sub = len(subdirs)
                success_cnt = 0
                out_files = []

                for idx, sd in enumerate(subdirs):
                    pct = int(((idx + 1) / total_sub) * 90)
                    self._update_progress(pct, f"Đang chuyển đổi thư mục ({idx+1}/{total_sub}): {os.path.basename(sd)}")
                    try:
                        exporter = CsvExporter(sd)
                        out_file = exporter.export_unified_csv()
                        out_files.append(out_file)
                        success_cnt += 1
                    except Exception as sub_err:
                        self.after(0, lambda e=sub_err, d=sd: self._log(f"  [CẢNH BÁO/BỎ QUA] {os.path.basename(d)}: {e}"))

                elapsed = round(time.time() - start_time, 2)
                self._update_progress(100, f"Hoàn thành chuyển đổi hàng loạt {success_cnt}/{total_sub} thư mục!")

                self.after(0, lambda: self._show_success_modal(
                    f"Đã chuyển đổi hàng loạt thành công {success_cnt} thư mục MBA!\n\nThời gian xử lý: {elapsed} giây.",
                    folder
                ))

            else:
                self._update_progress(10, f"Bắt đầu xử lý thư mục: {folder}")
                exporter = CsvExporter(folder)
                
                out_path = exporter.export_unified_csv(
                    output_csv_path=custom_out,
                    progress_callback=self._update_progress
                )

                elapsed = round(time.time() - start_time, 2)
                file_size_kb = round(os.path.getsize(out_path) / 1024, 1)

                self.after(0, lambda: self._show_success_modal(
                    f"Chuyển đổi file CSV thành công!\n\nFile kết quả: {os.path.basename(out_path)}\nDung lượng: {file_size_kb} KB\nThời gian: {elapsed} giây",
                    out_path
                ))

        except Exception as err:
            err_msg = str(err)
            self._update_progress(0, f"LỖI: {err_msg}")
            self.after(0, lambda: messagebox.showerror("Lỗi Chuyển Đổi", f"Đã xảy ra lỗi khi chuyển đổi:\n\n{err_msg}"))
        finally:
            self.is_processing = False
            self.after(0, lambda: self.btn_convert.configure(state="normal", text="🚀 BẮT ĐẦU CHUYỂN ĐỔI FILE CSV"))

    def _show_success_modal(self, message: str, target_path: str):
        if self.auto_open_folder.get():
            self._open_file_location(target_path)
            
        messagebox.showinfo("Thành Công (MTELAB)", message)

    def _open_file_location(self, path: str):
        try:
            folder = path if os.path.isdir(path) else os.path.dirname(path)
            if platform.system() == "Windows":
                os.startfile(folder)
            elif platform.system() == "Darwin":
                subprocess.Popen(["open", folder])
            else:
                subprocess.Popen(["xdg-open", folder])
        except Exception as e:
            self._log(f"[Không thể mở thư mục]: {e}")

if __name__ == "__main__":
    app = PDonlineConverterApp()
    app.mainloop()
