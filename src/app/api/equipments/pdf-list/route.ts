import { NextResponse } from "next/server";
import { dataService } from "@/lib/data-service";
import fs from "fs";
import path from "path";

const PDF_DIR = path.join(process.cwd(), "public/pdfs");

export async function GET() {
    try {
        if (!fs.existsSync(PDF_DIR)) {
            fs.mkdirSync(PDF_DIR, { recursive: true });
            return NextResponse.json({ files: [], totalSizeMb: "0.0 MB", totalFiles: 0 });
        }

        // Get equipments to check usage reference
        let equipments: any[] = [];
        try {
            equipments = await dataService.getEquipments();
        } catch (err) {
            console.warn("Could not fetch equipments for PDF usage check:", err);
        }

        const dirEntries = fs.readdirSync(PDF_DIR, { withFileTypes: true });
        const pdfFiles = dirEntries.filter(entry => entry.isFile() && entry.name.toLowerCase().endsWith(".pdf"));

        let totalSizeBytes = 0;

        const files = pdfFiles.map(entry => {
            const filePath = path.join(PDF_DIR, entry.name);
            const stats = fs.statSync(filePath);
            totalSizeBytes += stats.size;

            const sizeMb = (stats.size / (1024 * 1024)).toFixed(2) + " MB";

            // Find all equipments referencing this PDF
            const usedEquipments = equipments.filter(eq => {
                const url = eq.calibrationReportUrl || "";
                return url.includes(entry.name);
            });

            return {
                fileName: entry.name,
                fileUrl: `/pdfs/${entry.name}`,
                sizeBytes: stats.size,
                fileSize: sizeMb,
                updatedAt: stats.mtime.toISOString(),
                usedCount: usedEquipments.length,
                usedBy: usedEquipments.map(eq => eq.name || eq.id)
            };
        });

        // Sort newest first
        files.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

        const totalSizeMb = (totalSizeBytes / (1024 * 1024)).toFixed(1) + " MB";

        return NextResponse.json({
            files,
            totalSizeMb,
            totalFiles: files.length
        });
    } catch (error) {
        console.error("Error in GET /api/equipments/pdf-list:", error);
        return NextResponse.json({ error: "Lỗi tải danh mục file PDF" }, { status: 500 });
    }
}
