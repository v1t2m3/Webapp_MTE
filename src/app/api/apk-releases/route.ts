import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { ApkRelease } from "@/types";
import fs from "fs";
import path from "path";

const DATA_PATH = path.join(process.cwd(), "src/data/apk-releases.json");
const APK_DIR = path.join(process.cwd(), "public/apk");

function getReleasesFromDisk(): ApkRelease[] {
    try {
        if (!fs.existsSync(DATA_PATH)) {
            return [];
        }
        const fileContent = fs.readFileSync(DATA_PATH, "utf-8");
        const data = JSON.parse(fileContent);
        if (Array.isArray(data)) {
            return data.sort(
                (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
        }
        return [];
    } catch (error) {
        console.error("Error reading apk releases from disk:", error);
        return [];
    }
}

function saveReleasesToDisk(releases: ApkRelease[]): void {
    const dir = path.dirname(DATA_PATH);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DATA_PATH, JSON.stringify(releases, null, 2), "utf-8");
}

export async function GET() {
    try {
        const releases = getReleasesFromDisk();
        return NextResponse.json(releases);
    } catch (error) {
        console.error("Error in GET /api/apk-releases:", error);
        return NextResponse.json({ error: "Failed to fetch releases" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user?.role !== "Admin") {
            return NextResponse.json(
                { error: "Chỉ tài khoản Admin mới có quyền upload bản phát hành mới" },
                { status: 403 }
            );
        }

        const formData = await req.formData();
        const file = formData.get("file") as File | null;
        const version = (formData.get("version") as string) || "v1.0.0";
        const releaseDate = (formData.get("releaseDate") as string) || new Date().toISOString().split("T")[0];
        const description = (formData.get("description") as string) || "";

        if (!file) {
            return NextResponse.json({ error: "Vui lòng chọn file APK" }, { status: 400 });
        }

        if (!file.name.endsWith(".apk")) {
            return NextResponse.json({ error: "Định dạng file phải là .apk" }, { status: 400 });
        }

        // Ensure public/apk directory exists
        if (!fs.existsSync(APK_DIR)) {
            fs.mkdirSync(APK_DIR, { recursive: true });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const sanitizedVersion = version.trim().replace(/[^a-zA-Z0-9.-]/g, "_");
        const fileName = `mte-calnotes-${sanitizedVersion}_${Date.now()}.apk`;
        const filePath = path.join(APK_DIR, fileName);

        fs.writeFileSync(filePath, buffer);

        // Also copy as standard default file for legacy download links if needed
        const defaultPath = path.join(APK_DIR, "MTELAB_CalNotes.apk");
        fs.writeFileSync(defaultPath, buffer);

        const fileSizeMb = (file.size / (1024 * 1024)).toFixed(1) + " MB";

        let currentReleases = getReleasesFromDisk();

        const newRelease: ApkRelease = {
            id: `apk-${Date.now()}`,
            version: version.trim(),
            releaseDate,
            fileName,
            fileUrl: `/apk/${fileName}`,
            fileSize: fileSizeMb,
            description: description.trim(),
            createdAt: new Date().toISOString(),
        };

        // Add new release at the beginning
        currentReleases = [newRelease, ...currentReleases];

        // STRICT RETENTION LIMIT: Only keep 3 latest versions
        if (currentReleases.length > 3) {
            const prunedReleases = currentReleases.slice(3);
            currentReleases = currentReleases.slice(0, 3);

            // Delete physical 4th (oldest) APK files from disk
            for (const old of prunedReleases) {
                if (
                    old.fileName &&
                    old.fileName !== "MTELAB_CalNotes.apk" &&
                    old.fileName !== fileName
                ) {
                    try {
                        const oldFilePath = path.join(APK_DIR, old.fileName);
                        if (fs.existsSync(oldFilePath)) {
                            fs.unlinkSync(oldFilePath);
                        }
                    } catch (err) {
                        console.error(`Failed to delete pruned APK file ${old.fileName}:`, err);
                    }
                }
            }
        }

        saveReleasesToDisk(currentReleases);

        return NextResponse.json({
            message: "Đăng bản phát hành mới thành công",
            release: newRelease,
            allReleases: currentReleases,
        });
    } catch (error) {
        console.error("Error in POST /api/apk-releases:", error);
        return NextResponse.json(
            { error: "Lỗi hệ thống khi tải lên file APK" },
            { status: 500 }
        );
    }
}
