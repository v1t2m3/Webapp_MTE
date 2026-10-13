import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

const PDF_DIR = path.join(process.cwd(), "public/pdfs");

export async function GET(
    req: NextRequest,
    context: { params: Promise<{ filename: string }> }
) {
    try {
        const { filename } = await context.params;
        const decodedFileName = decodeURIComponent(filename);

        // Security check against Path Traversal
        if (
            !decodedFileName ||
            decodedFileName.includes("..") ||
            decodedFileName.includes("/") ||
            decodedFileName.includes("\\") ||
            !decodedFileName.toLowerCase().endsWith(".pdf")
        ) {
            return new NextResponse("Tên file không hợp lệ", { status: 400 });
        }

        const filePath = path.join(PDF_DIR, decodedFileName);

        if (!fs.existsSync(filePath)) {
            return new NextResponse("Không tìm thấy tệp tin PDF trên máy chủ", { status: 404 });
        }

        const stat = fs.statSync(filePath);
        const range = req.headers.get("range");

        // Handle HTTP Range requests for fast seeking and page jumping in PDF viewer
        if (range) {
            const parts = range.replace(/bytes=/, "").split("-");
            const start = parseInt(parts[0], 10);
            const end = parts[1] ? parseInt(parts[1], 10) : stat.size - 1;

            if (isNaN(start) || start >= stat.size || end >= stat.size || start > end) {
                return new NextResponse("Requested range not satisfiable", {
                    status: 416,
                    headers: { "Content-Range": `bytes */${stat.size}` }
                });
            }

            const chunkSize = end - start + 1;
            const nodeStream = fs.createReadStream(filePath, { start, end });

            const webStream = new ReadableStream({
                start(controller) {
                    nodeStream.on("data", (chunk) => controller.enqueue(chunk));
                    nodeStream.on("end", () => controller.close());
                    nodeStream.on("error", (err) => controller.error(err));
                },
                cancel() {
                    nodeStream.destroy();
                }
            });

            return new NextResponse(webStream, {
                status: 206,
                headers: {
                    "Content-Type": "application/pdf",
                    "Content-Range": `bytes ${start}-${end}/${stat.size}`,
                    "Accept-Ranges": "bytes",
                    "Content-Length": chunkSize.toString(),
                    "Content-Disposition": `inline; filename="${encodeURIComponent(decodedFileName)}"`,
                    "Cache-Control": "public, max-age=3600",
                },
            });
        }

        // Full file stream
        const nodeStream = fs.createReadStream(filePath);
        const webStream = new ReadableStream({
            start(controller) {
                nodeStream.on("data", (chunk) => controller.enqueue(chunk));
                nodeStream.on("end", () => controller.close());
                nodeStream.on("error", (err) => controller.error(err));
            },
            cancel() {
                nodeStream.destroy();
            }
        });

        return new NextResponse(webStream, {
            status: 200,
            headers: {
                "Content-Type": "application/pdf",
                "Content-Length": stat.size.toString(),
                "Content-Disposition": `inline; filename="${encodeURIComponent(decodedFileName)}"`,
                "Accept-Ranges": "bytes",
                "Cache-Control": "public, max-age=3600",
            },
        });
    } catch (error) {
        console.error("Error serving PDF file:", error);
        return new NextResponse("Lỗi máy chủ khi đọc tệp tin PDF", { status: 500 });
    }
}
