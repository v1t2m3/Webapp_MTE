import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { PowerCompany, Substation110kV, Transformer110kV, PdTestRecord } from "@/types/pd-online";

export async function exportPowerCompanyExcelReport(
    company: PowerCompany,
    substations: Substation110kV[],
    transformers: Transformer110kV[],
    records: PdTestRecord[]
) {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "MTE-LAB System";
    workbook.created = new Date();

    const sheet = workbook.addWorksheet(`Báo cáo PD - ${company.code}`, {
        pageSetup: { paperSize: 9, orientation: "landscape" }
    });

    // Header Title
    sheet.mergeCells("A1:M1");
    const titleCell = sheet.getCell("A1");
    titleCell.value = `BÁO CÁO KẾT QUẢ PHÓNG ĐIỆN CỤC BỘ (PD ONLINE) DÂN MỤC MBA 110kV`;
    titleCell.font = { name: "Arial", size: 16, bold: true, color: { argb: "FF1E3A8A" } };
    titleCell.alignment = { horizontal: "center", vertical: "middle" };

    sheet.mergeCells("A2:M2");
    const subTitleCell = sheet.getCell("A2");
    subTitleCell.value = `ĐƠN VỊ QUẢN LÝ: ${company.name.toUpperCase()} - Ngày xuất báo cáo: ${new Date().toLocaleDateString("vi-VN")}`;
    subTitleCell.font = { name: "Arial", size: 11, italic: true, color: { argb: "FF475569" } };
    subTitleCell.alignment = { horizontal: "center", vertical: "middle" };

    sheet.addRow([]);

    // Table Column Headers
    const headers = [
        "STT",
        "Trạm 110kV",
        "Tên MBA",
        "Công suất (MVA)",
        "Tỷ số điện áp",
        "Hãng sản xuất",
        "Năm SX",
        "Năm VH",
        "Lần thử gần nhất",
        "Biên độ Qmax (pC)",
        "Loại khuyết tật PD",
        "Mức độ rủi ro",
        "Nhận định / Đề xuất xử lý"
    ];

    const headerRow = sheet.addRow(headers);
    headerRow.font = { name: "Arial", size: 11, bold: true, color: { argb: "FFFFFFFF" } };
    headerRow.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
    headerRow.height = 30;

    headerRow.eachCell((cell) => {
        cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FF3B82F6" }
        };
        cell.border = {
            top: { style: "thin", color: { argb: "FF94A3B8" } },
            left: { style: "thin", color: { argb: "FF94A3B8" } },
            bottom: { style: "medium", color: { argb: "FF1E3A8A" } },
            right: { style: "thin", color: { argb: "FF94A3B8" } }
        };
    });

    // Populate Data Rows
    const companySubstationIds = substations.filter(s => s.powerCompanyId === company.id).map(s => s.id);
    const companyTransformers = transformers.filter(t => companySubstationIds.includes(t.substationId));

    let stt = 1;
    companyTransformers.forEach((tf) => {
        const sub = substations.find(s => s.id === tf.substationId);
        const lastRecord = records.find(r => r.transformerId === tf.id);

        const rowValues = [
            stt++,
            sub ? sub.name : "",
            `${tf.name} (${tf.code})`,
            tf.capacityMva,
            tf.voltageRatio,
            tf.manufacturer,
            tf.manufacturedYear,
            tf.commissionedYear,
            lastRecord ? lastRecord.testDate : (tf.lastTestedDate || "Chưa đo"),
            lastRecord ? lastRecord.metrics.qMaxPc : "-",
            lastRecord ? lastRecord.inspectorAssessment.defectType : "-",
            tf.status === "CRITICAL" ? "CẢNH BÁO NGUY HIỂM" : tf.status === "WATCH" ? "CHÚ Ý THEO DÕI" : "BÌNH THƯỜNG",
            lastRecord ? lastRecord.inspectorAssessment.notes : "Tình trạng vận hành bình thường"
        ];

        const row = sheet.addRow(rowValues);
        row.font = { name: "Arial", size: 10 };
        row.alignment = { vertical: "middle" };

        // Highlight Risk Status cell
        const statusCell = row.getCell(12);
        if (tf.status === "CRITICAL") {
            statusCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFECACA" } };
            statusCell.font = { name: "Arial", size: 10, bold: true, color: { argb: "FF991B1B" } };
        } else if (tf.status === "WATCH") {
            statusCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFDE68A" } };
            statusCell.font = { name: "Arial", size: 10, bold: true, color: { argb: "FF92400E" } };
        } else {
            statusCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFD1FAE5" } };
            statusCell.font = { name: "Arial", size: 10, bold: true, color: { argb: "FF065F46" } };
        }

        row.eachCell((cell) => {
            cell.border = {
                top: { style: "thin", color: { argb: "FFE2E8F0" } },
                left: { style: "thin", color: { argb: "FFE2E8F0" } },
                bottom: { style: "thin", color: { argb: "FFE2E8F0" } },
                right: { style: "thin", color: { argb: "FFE2E8F0" } }
            };
        });
    });

    // Column widths
    sheet.columns = [
        { width: 6 },
        { width: 24 },
        { width: 28 },
        { width: 14 },
        { width: 18 },
        { width: 16 },
        { width: 10 },
        { width: 10 },
        { width: 16 },
        { width: 16 },
        { width: 18 },
        { width: 20 },
        { width: 45 }
    ];

    // Buffer and Save
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    saveAs(blob, `Bao_Cao_PD_Online_${company.code}_${new Date().toISOString().split("T")[0]}.xlsx`);
}
