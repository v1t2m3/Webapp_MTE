# ⚡ PDonline-PT500A convert
> **Powered by MTELAB • ISO/IEC 17025 Engine**

Ứng dụng Desktop tự động nén & chuyển đổi 40 - 50 file đo phóng điện cục bộ (`.pwa` & `.mdb`) của một Máy biến áp 110kV thành **01 File CSV Duy Nhất** để tải lên hệ thống `https://mtelab.online/pd-online`.

---

## ✨ Tính năng Nổi bật (GUI Desktop App)

1. **Giao diện chuẩn Dark Mode đồng bộ Webapp-MTE**:
   - Tông màu Slate/Indigo/Amber hiện đại, giao diện trực quan cho Kỹ thuật viên hiện trường.
2. **Chế độ Chuyển đổi Linh hoạt**:
   - **Đơn thư mục**: Chuyển đổi 01 máy biến áp.
   - **Hàng loạt (Batch Mode)**: Quét và tự động chuyển đổi toàn bộ 200 thư mục máy biến áp cùng lúc.
3. **Thanh Tiến trình & Nhật ký Thời gian thực**:
   - Thanh tiến trình % mượt mà và ô Console log hiển thị chính xác từng file binary đang được giải mã.
4. **Hỗ trợ Tự động mở Thư mục**:
   - Có mục tích chọn `[x] Tự động mở thư mục chứa file .csv sau khi hoàn thành`.
5. **Đóng gói Standalone Portable Executable (`.exe`)**:
   - Chạy trực tiếp trên Windows 10/11 (64-bit và 32-bit), chỉ cần copy vào USB là sử dụng ngay không cần cài đặt Python.

---

## 🛠️ Hướng dẫn Khởi chạy & Đóng gói File `.exe`

### 1. Khởi chạy ứng dụng GUI trên máy phát triển (Python)
```bash
pip install -r requirements.txt
python gui_app.py
```

### 2. Tự động Đóng gói ứng dụng ra File `PDonline-PT500A-Convert.exe`
```bash
python build_exe.py
```
👉 *File `.exe` sẽ được tạo ra tại thư mục:*
`pd_online_converter/dist/PDonline-PT500A-Convert/PDonline-PT500A-Convert.exe`

---

## 📂 Cấu trúc Mã nguồn Dự án
```
pd_online_converter/
├── gui_app.py               # Giao diện Desktop CustomTkinter đa luồng
├── pwa_parser.py            # Module giải mã Binary file .pwa (NEWPD WAVE FORMAT Ver4.0)
├── mdb_parser_util.py     # Module trích xuất Metadata từ T1.mdb
├── csv_exporter.py          # Module xuất file .csv nén gộp hợp nhất
├── build_exe.py             # Script đóng gói ra file .exe standalone bằng PyInstaller
├── main.py                  # CLI script chạy trên terminal
├── requirements.txt         # Danh sách thư viện cần thiết
└── README.md              # Hướng dẫn chi tiết
```
