import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import fs from "fs";
import path from "path";

const PDF_DIR = path.join(process.cwd(), "public/pdfs");
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB

function removeVietnameseTones(str: string): string {
    return str
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/Đ/g, "D");
}

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user?.role !== "Admin") {
            return NextResponse.json(
                { error: "Chỉ tài khoản Admin mới có quyền tải lên file PDF chứng nhận" },
                { status: 403 }
            );
        }

        const formData = await req.formData();
        const file = formData.get("file") as File | null;

        if (!file) {
            return NextResponse.json({ error: "Vui lòng chọn file PDF để tải lên" }, { status: 400 });
        }

        if (!file.name.toLowerCase().endsWith(".pdf")) {
            return NextResponse.json({ error: "Định dạng file bắt buộc phải là .pdf" }, { status: 400 });
        }

        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json(
                { error: `Dung lượng file (${(file.size / (1024 * 1024)).toFixed(1)} MB) vượt quá giới hạn tối đa 50 MB` },
                { status: 400 }
            );
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Validate PDF magic bytes (%PDF-)
        if (buffer.length < 5 || buffer.toString("utf-8", 0, 5) !== "%PDF-") {
            return NextResponse.json(
                { error: "Nội dung tệp tin không hợp lệ hoặc bị lỗi (không đúng cấu trúc PDF tiêu chuẩn)" },
                { status: 400 }
            );
        }

        if (!fs.existsSync(PDF_DIR)) {
            fs.mkdirSync(PDF_DIR, { recursive: true });
        }

        const baseName = path.parse(file.name).name;
        const sanitizedBase = removeVietnameseTones(baseName)
            .trim()
            .replace(/[^a-zA-Z0-9_-]/g, "_")
            .replace(/_+/g, "_");

        let finalFileName = `${sanitizedBase || "GCN_KDHC"}.pdf`;
        let targetPath = path.join(PDF_DIR, finalFileName);

        // If file exists, add timestamp to prevent accidental overwrite
        if (fs.existsSync(targetPath)) {
            finalFileName = `${sanitizedBase || "GCN_KDHC"}_${Date.now()}.pdf`;
            targetPath = path.join(PDF_DIR, finalFileName);
        }

        fs.writeFileSync(targetPath, buffer, { mode: 0o666 });

        const fileSizeMb = (file.size / (1024 * 1024)).toFixed(1) + " MB";

        return NextResponse.json({
            success: true,
            message: "Tải lên file PDF thành công",
            fileName: finalFileName,
            fileUrl: `/pdfs/${finalFileName}`,
            fileSize: fileSizeMb
        });
    } catch (error) {
        console.error("Error in POST /api/equipments/upload-pdf:", error);
        return NextResponse.json({ error: "Lỗi máy chủ khi tải lên file PDF" }, { status: 500 });
    }
}
