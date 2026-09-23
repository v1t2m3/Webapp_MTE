import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { PdTestRecord, Transformer110kV } from "@/types/pd-online";

const DATA_PATH = path.join(process.cwd(), "src/data/pd-online-data.json");

function getInitialData() {
    try {
        if (fs.existsSync(DATA_PATH)) {
            const fileData = fs.readFileSync(DATA_PATH, "utf-8");
            return JSON.parse(fileData);
        }
    } catch (error) {
        console.error("Error reading pd-online-data.json:", error);
    }
    return { powerCompanies: [], substations: [], transformers: [], records: [] };
}

function saveData(data: any) {
    try {
        const dir = path.dirname(DATA_PATH);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2), "utf-8");
    } catch (error) {
        console.error("Error saving pd-online-data.json:", error);
    }
}

export async function GET() {
    try {
        const data = getInitialData();
        return NextResponse.json(data);
    } catch (error) {
        console.error("GET /api/pd-online error:", error);
        return NextResponse.json({ error: "Lỗi tải dữ liệu PD Online" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { action, payload } = body;
        const data = getInitialData();

        if (action === "ADD_RECORD") {
            const newRecord: PdTestRecord = {
                ...payload,
                id: payload.id || `MTE-PD-${Date.now()}`,
                testCode: payload.testCode || `MTE-PD-${Date.now()}`
            };
            data.records = [newRecord, ...(data.records || [])];

            // Update status on target transformer if risk level specified
            const targetTf = data.transformers.find((t: Transformer110kV) => t.id === newRecord.transformerId);
            if (targetTf && newRecord.inspectorAssessment?.riskLevel) {
                targetTf.status = newRecord.inspectorAssessment.riskLevel;
                targetTf.lastTestedDate = newRecord.testDate;
            }

            saveData(data);
            return NextResponse.json({ message: "Thêm biên bản thử nghiệm PD thành công", record: newRecord, data });
        }

        if (action === "ADD_TRANSFORMER") {
            const newTf: Transformer110kV = {
                ...payload,
                id: payload.id || `mba-${Date.now()}`
            };
            data.transformers = [...(data.transformers || []), newTf];
            saveData(data);
            return NextResponse.json({ message: "Thêm máy biến áp thành công", transformer: newTf, data });
        }

        return NextResponse.json({ error: "Action không hợp lệ" }, { status: 400 });
    } catch (error) {
        console.error("POST /api/pd-online error:", error);
        return NextResponse.json({ error: "Lỗi lưu dữ liệu PD Online" }, { status: 500 });
    }
}
