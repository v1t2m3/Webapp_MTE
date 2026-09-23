# TECHNICAL SPECIFICATION: MODULE PHÂN TÍCH PD ONLINE MBA 110kV & 3D LOCALIZATION
**Project:** webapp_mte  
**Target Device:** PowerPD PD-TP500A (1 kênh HFCT + 4 kênh AE)  
**Phân kỳ phát triển:** 2 Giai đoạn (Decoupled Architecture)

---

## 1. TỔNG QUAN KIẾN TRÚC HỆ THỐNG

```
[Raw Files: PD-TP500A]
       │
       ▼
┌────────────────────────────────────────────────────────┐
│ MODULE 1: Ingestion & Parser Engine                    │
│ - Tách 1 kênh HFCT (20MHz) & 4 kênh AE (80-300kHz)     │
│ - Trích xuất ma trận PRPD (φ, q, n), Waveform, TDOA    │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│ STORAGE: Canonical Schema Store                        │
│ - Timeseries/Waveform: Parquet/NPZ                     │
│ - Metadata/Measurements: PostgreSQL/SQLite             │
└──────────────┬───────────────────────────┬─────────────┘
               │                           │
               ▼ (Giai đoạn 1)             ▼ (Giai đoạn 2)
┌───────────────────────────────┐ ┌───────────────────────────────┐
│ MODULE 2: Manual Review & Rep │ │ MODULE 4: AI & 3D Engine      │
│ - Xem đồ thị PRPD / Waveform  │ │ - CNN Classification (PRPD)   │
│ - KTV nhập nhận định          │ │ - TDOA Acoustic Solver        │
│ - Export DOCX/PDF biên bản    │ │ - Three.js 3D Localization    │
└──────────────┬────────────────┘ └──────────────┬────────────────┘
               │                                 │
               └────────────────┬────────────────┘
                                ▼
┌────────────────────────────────────────────────────────┐
│ MODULE 3: Combined Reporting & Feedback Loop           │
│ - Biên bản tích hợp nhận định KTV & Đề xuất AI         │
│ - Tự động đính kèm Snapshot 3D vị trí khuyết tật      │
└────────────────────────────────────────────────────────┘
```

---

## 2. GIAI ĐOẠN 1: CHUẨN HÓA DỮ LIỆU & QUẢN LÝ BIÊN BẢN THÍ NGHIỆM

### 2.1. Yêu cầu nghiệp vụ
1. Đọc và parse dữ liệu trích xuất từ phần mềm PD-TP500A (file nhị phân `.dat`/`.bin` hoặc text export `.csv`/`.txt`).
2. Chuẩn hóa về Schema chung (`Canonical Data Schema`) lưu trữ tập trung.
3. Hiển thị đồ thị: Biểu đồ phân bố góc pha PRPD $(\phi - q - n)$, đồ thị xung thời gian (Time-domain), phổ tần số (FFT).
4. Cung cấp giao diện KTV nhập kết quả nhận định và vị trí gắn 4 đầu dò AE trên vỏ thùng.
5. Tự động điền dữ liệu và kết xuất file biên bản thí nghiệm (DOCX/PDF) theo mẫu chuẩn.

### 2.2. Canonical Data Contract (JSON / Schema)
Mỗi phép đo được lưu trữ với cấu trúc chuẩn:

```json
{
  "test_id": "MTE-PD-2026-001",
  "transformer": {
    "code": "T1-110kV",
    "substation": "TBA 110kV Lien Chieu",
    "mva": 63,
    "oil_temp_c": 55.0,
    "tank_dimensions": {
      "length_m": 4.5,
      "width_m": 2.2,
      "height_m": 3.2
    }
  },
  "sensors_setup": [
    {"sensor_id": "HFCT", "channel": 0, "attached_to": "Grounding lead"},
    {"sensor_id": "AE1", "channel": 1, "x_m": 1.2, "y_m": 0.0, "z_m": 1.5},
    {"sensor_id": "AE2", "channel": 2, "x_m": 3.8, "y_m": 0.0, "z_m": 1.2},
    {"sensor_id": "AE3", "channel": 3, "x_m": 2.0, "y_m": 2.2, "z_m": 1.8},
    {"sensor_id": "AE4", "channel": 4, "x_m": 4.2, "y_m": 2.2, "z_m": 0.9}
  ],
  "metrics": {
    "q_max_pc": 850.5,
    "q_avg_pc": 210.3,
    "pulse_count_per_cycle": 14.2
  },
  "prpd_matrix_path": "data/processed/MTE-PD-2026-001_prpd.npz",
  "raw_waveform_path": "data/processed/MTE-PD-2026-001_waves.parquet",
  "ktv_assessment": {
    "defect_type": "Surface PD",
    "risk_level": "WARNING",
    "notes": "Xung phóng điện rải đều ở nửa chu kỳ âm, nghi ngờ bề mặt sứ xuyên pha B",
    "inspector_name": "Nguyen Van A",
    "reviewed_at": "2026-09-23T10:00:00Z"
  }
}
```

### 2.3. Checklist tính năng Giai đoạn 1 (Antigravity Tasks)
- [ ] **Task 1.1:** Xây dựng module `pd_parser.py` bóc tách header, chu kỳ $50\text{ Hz}$, kênh HFCT và 4 kênh AE từ tệp gốc.
- [ ] **Task 1.2:** Viết hàm nội suy ma trận PRPD kích thước cố định $256 \times 256$ (Góc pha: $0^\circ - 360^\circ$; Biên độ: $0 - Q_{max}$).
- [ ] **Task 1.3:** Xây dựng UI hiển thị biểu đồ nhiệt PRPD ($\phi - q - n$) tương tác trên Web (Plotly.js hoặc Canvas).
- [ ] **Task 1.4:** Form khai báo thông số máy và tọa độ gắn 4 đầu dò AE trên vỏ thùng.
- [ ] **Task 1.5:** Engine sinh báo cáo tự động bằng `python-docx`, chèn ảnh đồ thị PRPD và thông số thí nghiệm vào template.

---

## 3. GIAI ĐOẠN 2: CHẨN ĐOÁN AI & MÔ PHỎNG 3D VỊ TRÍ PHÓNG ĐIỆN

### 3.1. Yêu cầu nghiệp vụ
1. **AI Classification:** Tự động nạp ma trận PRPD và phân loại loại hình khuyết tật:
   - `Internal PD` (Phóng điện bọt khí/cách điện trong).
   - `Surface PD` (Phóng điện bề mặt).
   - `Corona` (Phóng điện vầng quang).
   - `Noise` (Nhiễu ngoài/tiếp xúc).
2. **AI Risk Assessment:** Tính toán mức độ rủi ro (`NORMAL`, `WATCH`, `CRITICAL`) dựa trên $Q_{max}$ và độ lặp xung.
3. **Acoustic Localization (TDOA Solver):**
   - Xác định chênh lệch thời gian $\Delta t_i = t_{AE_i} - t_{HFCT}$ bằng thuật toán tương quan chéo (Cross-Correlation).
   - Tính toán tọa độ $(x, y, z)$ của nguồn PD theo công thức truyền sóng âm trong dầu ($v_{dầu} \approx 1410\text{ m/s}$ tại $55^\circ\text{C}$):
   $$\sqrt{(x - x_i)^2 + (y - y_i)^2 + (z - z_i)^2} = v_{dầu} \cdot \Delta t_i$$
4. **Giao diện 3D (Three.js):**
   - Hiển thị mô hình 3D vỏ thùng MBA 110kV bán trong suốt.
   - Định vị 4 mốc cảm biến AE trên thành thùng.
   - Hiển thị điểm PD hotspot nhấp nháy phát sáng tại tọa độ tính toán, kèm bán kính sai số $\pm \Delta r$.
   - Chụp ảnh tự động (Canvas Snapshot) để chèn khối 3D vào biên bản xuất báo cáo.
5. **Human-in-the-loop Consensus:** KTV xem đề xuất của AI, có quyền bấm `Chấp nhận` hoặc `Hiệu chỉnh`. Toàn bộ dữ liệu hiệu chỉnh được lưu để Auto-retrain.

### 3.2. Contract dữ liệu đầu ra AI & Định vị 3D
```json
{
  "ai_diagnostic": {
    "predicted_defect": "Internal PD",
    "confidence": 0.912,
    "risk_level": "CRITICAL",
    "recommended_action": "Rút ngắn chu kỳ lấy mẫu DGA về 7 ngày, kiểm tra nồng độ H2, C2H2"
  },
  "localization_3d": {
    "computed_coord": {"x": 2.15, "y": 1.10, "z": 1.65},
    "error_margin_m": 0.18,
    "nearest_component": "Cuộn dây Pha B - Phía 110kV",
    "wave_velocity_used_mps": 1410.0,
    "tdoa_deltas_microsec": [1250.4, 1890.2, 850.1, 2100.7]
  }
}
```

### 3.3. Checklist tính năng Giai đoạn 2 (Antigravity Tasks)
- [ ] **Task 2.1:** Pipeline tiền xử lý: Lọc sóng con Wavelet (DWT Symlet 8) để khử nhiễu nền trên tín hiệu AE và HFCT.
- [ ] **Task 2.2:** Tích hợp mô hình CNN phân loại ma trận PRPD $256 \times 256$ (sử dụng ONNX Runtime để suy luận nhanh trên backend).
- [ ] **Task 2.3:** Viết module `tdoa_solver.py` sử dụng thuật toán tối ưu Levenberg-Marquardt để giải hệ mặt cầu phi tuyến tìm $(x, y, z)$.
- [ ] **Task 2.4:** Xây dựng component giao diện 3D bằng Three.js:
  - Khối hộp MBA kích thước $L \times W \times H$ bán trong suốt (Opacity: 0.35).
  - Mô phỏng 3 trụ cuộn dây và 3 sứ xuyên cao thế.
  - Chấm tròn định vị 4 đầu dò AE.
  - Khối cầu nhấp nháy (Glowing Pulse Mesh) tại $(x, y, z)$ với màu sắc theo `risk_level`.
- [ ] **Task 2.5:** Tích hợp tính năng xuất snapshot 3D Base64 gửi vào report engine để in trực tiếp vào biên bản thí nghiệm.
- [ ] **Task 2.6:** Xây dựng bảng so sánh nhận định AI vs KTV và lưu nhật ký phản hồi (Feedback Logging).

---

## 4. QUY TẮC PHÁT TRIỂN & CHUYỂN GIAO (MANDATORY GUIDELINES)

1. **Không can thiệp logic Giai đoạn 1 khi mở rộng Giai đoạn 2:**
   - Giai đoạn 1 xuất dữ liệu ra file chuẩn (JSON + Parquet).
   - Giai đoạn 2 hoạt động như một consumer độc lập đọc file chuẩn này để suy luận AI và giải TDOA.
2. **Đảm bảo tính Fallback:**
   - Nếu dữ liệu cảm biến AE bị thiếu (ví dụ chỉ đo 1 kênh HFCT và 2 kênh AE, không đủ để giải định vị 3D), hệ thống tự động ẩn view 3D và chỉ hiển thị phân tích đồ thị PRPD thông thường mà không gây crash ứng dụng.