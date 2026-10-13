import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { dataService } from "@/lib/data-service";
import fs from "fs";
import path from "path";

const PDF_DIR = path.join(process.cwd(), "public/pdfs");

export async function DELETE(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user?.role !== "Admin") {
            return NextResponse.json(
                { error: "Chỉ tài khoản Admin mới có quyền xóa file PDF chứng nhận" },
                { status: 403 }
            );
        }

        const body = await req.json().catch(() => ({}));
        const fileName = (body.fileName || req.nextUrl.searchParams.get("fileName") || "").trim();
        const force = Boolean(body.force || req.nextUrl.searchParams.get("force") === "true");

        if (!fileName) {
            return NextResponse.json({ error: "Tên file không được để trống" }, { status: 400 });
        }

        // Security check against Path Traversal
        if (
            fileName.includes("..") ||
            fileName.includes("/") ||
            fileName.includes("\\") ||
            !fileName.toLowerCase().endsWith(".pdf")
        ) {
            return NextResponse.json(
                { error: "Tên file không hợp lệ hoặc chứa ký tự bị cấm" },
                { status: 400 }
            );
        }

        const targetPath = path.join(PDF_DIR, fileName);

        if (!fs.existsSync(targetPath)) {
            return NextResponse.json(
                { error: `Tệp tin ${fileName} không tồn tại trên hệ thống` },
                { status: 404 }
            );
        }

        // If not forced, check if any equipment is currently using this PDF
        if (!force) {
            try {
                const equipments = await dataService.getEquipments();
                const usedEquipments = equipments.filter(eq => (eq.calibrationReportUrl || "").includes(fileName));

                if (usedEquipments.length > 0) {
                    const equipmentNames = usedEquipments.map(eq => eq.name || eq.id);
                    return NextResponse.json(
                        {
                            warning: "FILE_IN_USE",
                            usedCount: usedEquipments.length,
                            usedBy: equipmentNames,
                            message: `Tệp tin đang được liên kết với ${usedEquipments.length} thiết bị (${equipmentNames.slice(0, 3).join(", ")}${equipmentNames.length > 3 ? "..." : ""}). Xác nhận xóa sẽ gỡ bỏ tệp khỏi máy chủ.`
                        },
                        { status: 409 }
                    );
                }
            } catch (err) {
                console.warn("Could not check equipment references before delete:", err);
            }
        }

        // Delete physical file
        fs.unlinkSync(targetPath);

        return NextResponse.json({
            success: true,
            message: `Đã xóa vĩnh viễn tệp ${fileName} khỏi máy chủ`
        });
    } catch (error) {
        console.error("Error in DELETE /api/equipments/delete-pdf:", error);
        return NextResponse.json({ error: "Lỗi máy chủ khi xóa tệp PDF" }, { status: 500 });
    }
}
