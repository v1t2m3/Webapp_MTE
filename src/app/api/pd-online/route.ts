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
        return true;
    } catch (error) {
        console.error("Error saving pd-online-data.json:", error);
        throw error;
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

        if (action === "UPDATE_RECORD") {
            const index = (data.records || []).findIndex((r: PdTestRecord) => r.id === payload.id);
            if (index !== -1) {
                const existing = data.records[index];
                const updatedRecord: PdTestRecord = {
                    ...existing,
                    ...payload,
                    oilTempC: payload.oilTempC !== undefined ? payload.oilTempC : existing.oilTempC,
                    ambientTempC: payload.ambientTempC !== undefined ? payload.ambientTempC : existing.ambientTempC,
                    sensorsSetup: payload.sensorsSetup || existing.sensorsSetup,
                    inspectorAssessment: {
                        ...(existing.inspectorAssessment || {}),
                        ...(payload.inspectorAssessment || {})
                    },
                    aiDiagnostic: {
                        ...(existing.aiDiagnostic || {}),
                        ...(payload.aiDiagnostic || {})
                    },
                    localization3D: payload.localization3D || existing.localization3D
                };
                data.records[index] = updatedRecord;

                // Update status on target transformer if risk level changed
                const targetTf = data.transformers.find((t: Transformer110kV) => t.id === updatedRecord.transformerId);
                if (targetTf && updatedRecord.inspectorAssessment?.riskLevel) {
                    targetTf.status = updatedRecord.inspectorAssessment.riskLevel;
                }

                saveData(data);
                return NextResponse.json({ message: "Cập nhật biên bản thử nghiệm PD thành công", record: updatedRecord, data });
            }
            return NextResponse.json({ error: "Không tìm thấy biên bản thử nghiệm để cập nhật" }, { status: 404 });
        }

        if (action === "DELETE_RECORD") {
            const recordToDelete = (data.records || []).find((r: PdTestRecord) => r.id === payload.id);
            data.records = (data.records || []).filter((r: PdTestRecord) => r.id !== payload.id);

            // Re-evaluate transformer status based on latest remaining record
            if (recordToDelete) {
                const remainingForTf = (data.records || [])
                    .filter((r: PdTestRecord) => r.transformerId === recordToDelete.transformerId)
                    .sort((a: any, b: any) => new Date(b.testDate).getTime() - new Date(a.testDate).getTime());
                const targetTf = data.transformers.find((t: Transformer110kV) => t.id === recordToDelete.transformerId);
                if (targetTf) {
                    if (remainingForTf.length > 0) {
                        targetTf.status = remainingForTf[0].inspectorAssessment?.riskLevel || "NORMAL";
                        targetTf.lastTestedDate = remainingForTf[0].testDate;
                    } else {
                        targetTf.status = "NORMAL";
                    }
                }
            }

            saveData(data);
            return NextResponse.json({ message: "Xóa biên bản thử nghiệm PD thành công", data });
        }

        // Helper function to resolve or create PowerCompany & Substation
        const resolveCompanyAndSubstation = (companyName?: string, subName?: string, existingSubId?: string) => {
            let targetCompany = data.powerCompanies.find((c: any) => c.name === companyName || c.id === companyName);
            if (!targetCompany && companyName) {
                targetCompany = {
                    id: `pc-${Date.now()}`,
                    code: `PC-${companyName.substring(0, 3).toUpperCase()}`,
                    name: companyName,
                    region: "Miền Trung"
                };
                data.powerCompanies.push(targetCompany);
            }

            let targetSub = data.substations.find((s: any) => s.id === existingSubId || s.name === subName);
            if (!targetSub && subName) {
                targetSub = {
                    id: `tba-${Date.now()}`,
                    powerCompanyId: targetCompany ? targetCompany.id : (data.powerCompanies[0]?.id || "pc-da-nang"),
                    code: `TBA-110-${Date.now().toString().slice(-4)}`,
                    name: subName,
                    address: subName
                };
                data.substations.push(targetSub);
            } else if (targetSub && targetCompany) {
                targetSub.powerCompanyId = targetCompany.id;
            }

            return {
                company: targetCompany || data.powerCompanies[0],
                substation: targetSub || data.substations[0]
            };
        };

        if (action === "ADD_TRANSFORMER") {
            const { company, substation } = resolveCompanyAndSubstation(
                payload.powerCompanyName,
                payload.substationName,
                payload.substationId
            );

            const newTf: Transformer110kV = {
                ...payload,
                id: payload.id ? payload.id.trim() : `mba-${Date.now()}`,
                substationId: substation ? substation.id : payload.substationId,
                powerCompanyName: company ? company.name : payload.powerCompanyName,
                substationName: substation ? substation.name : payload.substationName
            };

            // Avoid duplicate ID if existing
            const existingIdx = data.transformers.findIndex((t: Transformer110kV) => t.id === newTf.id);
            if (existingIdx !== -1) {
                data.transformers[existingIdx] = newTf;
            } else {
                data.transformers = [...(data.transformers || []), newTf];
            }

            saveData(data);
            return NextResponse.json({ message: "Thêm máy biến áp thành công", transformer: newTf, data });
        }

        if (action === "UPDATE_TRANSFORMER") {
            const { company, substation } = resolveCompanyAndSubstation(
                payload.powerCompanyName,
                payload.substationName,
                payload.substationId
            );

            const index = data.transformers.findIndex((t: Transformer110kV) => t.id === payload.id);
            const updatedTf: Transformer110kV = {
                ...(index !== -1 ? data.transformers[index] : {}),
                ...payload,
                substationId: substation ? substation.id : payload.substationId,
                powerCompanyName: company ? company.name : payload.powerCompanyName,
                substationName: substation ? substation.name : payload.substationName
            };

            if (index !== -1) {
                data.transformers[index] = updatedTf;
            } else {
                data.transformers.push(updatedTf);
            }

            saveData(data);
            return NextResponse.json({ message: "Cập nhật máy biến áp thành công", transformer: updatedTf, data });
        }

        if (action === "DELETE_TRANSFORMER") {
            data.transformers = data.transformers.filter((t: Transformer110kV) => t.id !== payload.id);
            data.records = data.records.filter((r: PdTestRecord) => r.transformerId !== payload.id);
            saveData(data);
            return NextResponse.json({ message: "Xóa máy biến áp thành công", data });
        }

        return NextResponse.json({ error: "Action không hợp lệ" }, { status: 400 });
    } catch (error) {
        console.error("POST /api/pd-online error:", error);
        return NextResponse.json({ error: "Lỗi lưu dữ liệu PD Online" }, { status: 500 });
    }
}
