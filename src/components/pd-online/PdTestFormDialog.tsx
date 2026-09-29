"use client";

import { useState, useEffect } from "react";
import { Transformer110kV, SensorSetup, PrpdPoint, PdTestRecord } from "@/types/pd-online";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileUp, Plus, Edit, CheckCircle2, Sliders, UserCheck, ShieldAlert } from "lucide-react";

interface PdTestFormDialogProps {
    open: boolean;
    onClose: () => void;
    transformer: Transformer110kV;
    record?: PdTestRecord | null;
    onSubmit: (recordPayload: any, isEdit?: boolean) => Promise<void>;
}

export function PdTestFormDialog({ open, onClose, transformer, record, onSubmit }: PdTestFormDialogProps) {
    const isEdit = !!record;

    const [testDate, setTestDate] = useState(new Date().toISOString().split("T")[0]);
    const [oilTemp, setOilTemp] = useState("55");
    const [ambientTemp, setAmbientTemp] = useState("30");
    const [humidity, setHumidity] = useState("65");
    
    // Auto-parsed from CSV
    const [qMax, setQMax] = useState("650");
    const [qAvg, setQAvg] = useState("180");
    const [pulseCount, setPulseCount] = useState("12.5");
    const [prpdPoints, setPrpdPoints] = useState<PrpdPoint[]>([
        { phase_deg: 45, q_pc: 320, count: 12, face: 1 },
        { phase_deg: 65, q_pc: 650, count: 35, face: 2 },
        { phase_deg: 225, q_pc: 520, count: 22, face: 3 }
    ]);

    // User editable AE Sensor setup
    const [sensorsSetup, setSensorsSetup] = useState<SensorSetup[]>([
        { sensorId: "HFCT", channel: 0, attachedTo: "Dây tiếp địa thân thùng", x_m: 0, y_m: 0, z_m: 0 },
        { sensorId: "AE1", channel: 1, attachedTo: "Mặt trước trái", x_m: 1.2, y_m: 0.0, z_m: 1.5 },
        { sensorId: "AE2", channel: 2, attachedTo: "Mặt trước phải", x_m: 3.8, y_m: 0.0, z_m: 1.2 },
        { sensorId: "AE3", channel: 3, attachedTo: "Mặt sau trái", x_m: 2.0, y_m: 2.2, z_m: 1.8 },
        { sensorId: "AE4", channel: 4, attachedTo: "Mặt sau phải", x_m: 4.2, y_m: 2.2, z_m: 0.9 }
    ]);

    // User editable Fields
    const [defectType, setDefectType] = useState<any>("Internal PD");
    const [riskLevel, setRiskLevel] = useState<any>("WATCH");
    const [notes, setNotes] = useState("Đã bóc tách tự động ma trận PRPD từ file CSV.");
    const [inspectorName, setInspectorName] = useState("Trần Quốc Cường");
    
    const [loading, setLoading] = useState(false);
    const [parsedFileName, setParsedFileName] = useState<string | null>(null);

    useEffect(() => {
        if (record) {
            setTestDate(record.testDate || new Date().toISOString().split("T")[0]);
            setOilTemp(record.oilTempC?.toString() || "55");
            setAmbientTemp(record.ambientTempC?.toString() || "30");
            setHumidity(record.humidityPct?.toString() || "65");
            setQMax(record.metrics?.qMaxPc?.toString() || "650");
            setQAvg(record.metrics?.qAvgPc?.toString() || "180");
            setPulseCount(record.metrics?.pulseCountPerCycle?.toString() || "12.5");
            if (record.prpdPoints && record.prpdPoints.length > 0) {
                setPrpdPoints(record.prpdPoints);
            }
            if (record.sensorsSetup && record.sensorsSetup.length > 0) {
                setSensorsSetup(record.sensorsSetup);
            }
            setDefectType(record.inspectorAssessment?.defectType || "Internal PD");
            setRiskLevel(record.inspectorAssessment?.riskLevel || "WATCH");
            setNotes(record.inspectorAssessment?.notes || "");
            setInspectorName(record.inspectorAssessment?.inspectorName || "");
            setParsedFileName(null);
        } else {
            setTestDate(new Date().toISOString().split("T")[0]);
            setOilTemp("55");
            setAmbientTemp("30");
            setHumidity("65");
            setQMax("650");
            setQAvg("180");
            setPulseCount("12.5");
            setPrpdPoints([
                { phase_deg: 45, q_pc: 320, count: 12, face: 1 },
                { phase_deg: 65, q_pc: 650, count: 35, face: 2 },
                { phase_deg: 225, q_pc: 520, count: 22, face: 3 }
            ]);
            setSensorsSetup([
                { sensorId: "HFCT", channel: 0, attachedTo: "Dây tiếp địa thân thùng", x_m: 0, y_m: 0, z_m: 0 },
                { sensorId: "AE1", channel: 1, attachedTo: "Mặt trước trái", x_m: 1.2, y_m: 0.0, z_m: 1.5 },
                { sensorId: "AE2", channel: 2, attachedTo: "Mặt trước phải", x_m: 3.8, y_m: 0.0, z_m: 1.2 },
                { sensorId: "AE3", channel: 3, attachedTo: "Mặt sau trái", x_m: 2.0, y_m: 2.2, z_m: 1.8 },
                { sensorId: "AE4", channel: 4, attachedTo: "Mặt sau phải", x_m: 4.2, y_m: 2.2, z_m: 0.9 }
            ]);
            setDefectType("Internal PD");
            setRiskLevel("WATCH");
            setNotes("Dữ liệu thử nghiệm PD Online định kỳ.");
            setInspectorName("Trần Quốc Cường");
            setParsedFileName(null);
        }
    }, [record, open]);

    // CSV File Upload & Auto-Parsing Handler
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setParsedFileName(file.name);
        const reader = new FileReader();
        reader.onload = (evt) => {
            const text = evt.target?.result as string;
            if (!text) return;

            let extractedDate = "";
            let extractedQmax = "";
            let extractedQavg = "";
            let extractedPulse = "";
            let extractedRisk = "";
            let extractedDefect = "";
            const extractedPRPD: PrpdPoint[] = [];

            const lines = text.split("\n");
            let inPrpdSection = false;

            for (const line of lines) {
                const trimmed = line.trim();
                if (!trimmed) continue;

                if (trimmed.includes("PRPD_MATRIX")) {
                    inPrpdSection = true;
                    continue;
                }

                if (inPrpdSection) {
                    const parts = trimmed.split(",");
                    if (parts.length >= 3 && !isNaN(parseFloat(parts[0])) && !isNaN(parseFloat(parts[1]))) {
                        extractedPRPD.push({
                            phase_deg: parseFloat(parts[0]),
                            q_pc: parseFloat(parts[1]),
                            count: parseInt(parts[2]) || 1,
                            face: parseInt(parts[3]) || 1
                        });
                    }
                    continue;
                }

                const parts = trimmed.split(",");
                if (parts.length >= 2) {
                    const key = parts[0].trim();
                    const val = parts[1].trim();

                    if (key === "Test_Date") extractedDate = val;
                    if (key === "Qmax_pC") extractedQmax = val;
                    if (key === "Qavg_pC") extractedQavg = val;
                    if (key === "Pulse_Per_Cycle") extractedPulse = val;
                    if (key === "Risk_Level") extractedRisk = val;
                    if (key === "AI_Defect_Diagnosis") extractedDefect = val;
                }
            }

            if (extractedDate) {
                // Convert DD/MM/YYYY to YYYY-MM-DD for date input
                const dateParts = extractedDate.split("/");
                if (dateParts.length === 3) {
                    setTestDate(`${dateParts[2]}-${dateParts[1].padStart(2, '0')}-${dateParts[0].padStart(2, '0')}`);
                }
            }
            if (extractedQmax) setQMax(extractedQmax);
            if (extractedQavg) setQAvg(extractedQavg);
            if (extractedPulse) setPulseCount(extractedPulse);
            if (extractedRisk && (extractedRisk === "NORMAL" || extractedRisk === "WATCH" || extractedRisk === "CRITICAL")) {
                setRiskLevel(extractedRisk);
            }
            if (extractedDefect) {
                if (extractedDefect.toLowerCase().includes("surface")) setDefectType("Surface PD");
                else if (extractedDefect.toLowerCase().includes("internal") || extractedDefect.toLowerCase().includes("arc")) setDefectType("Internal PD");
                else if (extractedDefect.toLowerCase().includes("corona")) setDefectType("Corona");
            }
            if (extractedPRPD.length > 0) {
                setPrpdPoints(extractedPRPD);
            }
            setNotes(`Đã bóc tách tự động ${extractedPRPD.length} điểm ma trận PRPD từ file ${file.name}.`);
        };
        reader.readAsText(file);
    };

    const handleSensorChange = (index: number, field: keyof SensorSetup, value: any) => {
        const updated = [...sensorsSetup];
        updated[index] = { ...updated[index], [field]: value };
        setSensorsSetup(updated);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const qMaxNum = parseFloat(qMax) || 580;
        const payload: any = {
            id: record ? record.id : undefined,
            testCode: record ? record.testCode : undefined,
            transformerId: transformer.id,
            testDate,
            oilTempC: parseFloat(oilTemp) || 55,
            ambientTempC: parseFloat(ambientTemp) || 30,
            humidityPct: parseFloat(humidity) || 65,
            noiseLevelDb: record ? record.noiseLevelDb : 32.5,
            tankDimensions: record?.tankDimensions || { length_m: 4.5, width_m: 2.2, height_m: 3.2 },
            sensorsSetup,
            metrics: {
                qMaxPc: qMaxNum,
                qAvgPc: parseFloat(qAvg) || 150,
                pulseCountPerCycle: parseFloat(pulseCount) || 12.5
            },
            prpdPoints,
            inspectorAssessment: {
                defectType,
                riskLevel,
                notes,
                inspectorName,
                reviewedAt: new Date().toISOString()
            },
            aiDiagnostic: {
                predictedDefect: defectType,
                confidence: record?.aiDiagnostic?.confidence || 0.94,
                riskLevel,
                recommendedAction: riskLevel === "CRITICAL" ? "Dừng vận hành kiểm tra khẩn cấp" : "Đo kiểm định kỳ và theo dõi tiến triển DGA"
            },
            localization3D: {
                computedCoord: {
                    x: roundVal((sensorsSetup[1].x_m + sensorsSetup[2].x_m) / 2, 2),
                    y: roundVal((sensorsSetup[1].y_m + sensorsSetup[3].y_m) / 2 + 0.1, 2),
                    z: roundVal((sensorsSetup[1].z_m + sensorsSetup[2].z_m) / 2 + 0.3, 2)
                },
                errorMarginM: 0.15,
                nearestComponent: "Cuộn dây Pha B",
                waveVelocityUsedMps: 1410.0,
                tdoaDeltasMicrosec: record?.localization3D?.tdoaDeltasMicrosec || [1250, 1890, 850, 2100]
            }
        };

        await onSubmit(payload, isEdit);
        setLoading(false);
        onClose();
    };

    function roundVal(num: number, decimals: number) {
        return parseFloat(num.toFixed(decimals));
    }

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-slate-900 border-indigo-500/30 text-white scrollbar-thin">
                <DialogHeader className="border-b border-slate-800 pb-3">
                    <DialogTitle className="text-lg font-bold flex items-center gap-2 text-indigo-300">
                        {isEdit ? <Edit className="h-5 w-5 text-amber-400" /> : <Plus className="h-5 w-5 text-emerald-400" />}
                        {isEdit ? `Cập nhật Biên bản Đo PD Online (${record?.testCode})` : `Tạo Biên bản Kết quả Đo PD Online cho ${transformer?.name}`}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 pt-2 text-sm">
                    {/* Device Upload Section */}
                    <div className="p-3.5 bg-slate-950 rounded-xl border border-indigo-500/30 space-y-2">
                        <Label className="text-xs text-indigo-300 font-bold flex items-center gap-1.5">
                            <FileUp className="h-4 w-4 text-cyan-400" /> Nạp file dữ liệu kết quả bóc tách (.csv / .dat / .bin)
                        </Label>
                        <Input
                            type="file"
                            accept=".csv,.txt,.dat,.bin"
                            onChange={handleFileUpload}
                            className="bg-slate-900 border-slate-700 text-xs text-slate-300 file:bg-indigo-600 file:text-white file:border-0 file:rounded file:px-3 file:py-1.5 file:text-xs file:font-semibold cursor-pointer"
                        />
                        {parsedFileName && (
                            <div className="text-xs text-emerald-400 flex items-center gap-1.5 pt-1">
                                <CheckCircle2 className="h-4 w-4 shrink-0" />
                                <span>Đã bóc tách tự động dữ liệu từ file <strong className="font-mono text-white">{parsedFileName}</strong> ({prpdPoints.length} điểm PRPD)</span>
                            </div>
                        )}
                    </div>

                    {/* Section: Auto-extracted Metrics Summary */}
                    <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 space-y-2">
                        <div className="text-xs font-bold text-slate-400 flex items-center gap-1">
                            <Sliders className="h-3.5 w-3.5 text-indigo-400" /> Dữ liệu đo tự động bóc tách từ file CSV:
                        </div>
                        <div className="grid grid-cols-4 gap-3 text-xs">
                            <div className="bg-slate-900 p-2 rounded border border-slate-800">
                                <span className="text-slate-400 block text-[10px]">Ngày thử nghiệm:</span>
                                <span className="font-bold text-indigo-300">{testDate}</span>
                            </div>
                            <div className="bg-slate-900 p-2 rounded border border-slate-800">
                                <span className="text-slate-400 block text-[10px]">Qmax (pC):</span>
                                <span className="font-bold text-rose-400 text-sm">{qMax} pC</span>
                            </div>
                            <div className="bg-slate-900 p-2 rounded border border-slate-800">
                                <span className="text-slate-400 block text-[10px]">Qavg (pC):</span>
                                <span className="font-bold text-amber-300">{qAvg} pC</span>
                            </div>
                            <div className="bg-slate-900 p-2 rounded border border-slate-800">
                                <span className="text-slate-400 block text-[10px]">Xung/chu kỳ (n):</span>
                                <span className="font-bold text-cyan-300">{pulseCount} /n</span>
                            </div>
                        </div>
                    </div>

                    {/* Section: User Input Fields */}
                    <div className="space-y-4 bg-slate-950/40 p-4 rounded-xl border border-slate-800/80">
                        <div className="text-xs font-bold text-indigo-300 flex items-center gap-1.5 border-b border-slate-800 pb-2">
                            <UserCheck className="h-4 w-4 text-emerald-400" /> Thông tin người dùng nhập trực tiếp:
                        </div>

                        {/* Temperatures */}
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label className="text-xs text-slate-300 font-semibold">Nhiệt độ dầu tại thời điểm thử nghiệm (°C)</Label>
                                <Input
                                    type="number"
                                    value={oilTemp}
                                    onChange={(e) => setOilTemp(e.target.value)}
                                    className="bg-slate-950 border-slate-700 text-xs text-white"
                                />
                            </div>
                            <div>
                                <Label className="text-xs text-slate-300 font-semibold">Nhiệt độ môi trường (°C)</Label>
                                <Input
                                    type="number"
                                    value={ambientTemp}
                                    onChange={(e) => setAmbientTemp(e.target.value)}
                                    className="bg-slate-950 border-slate-700 text-xs text-white"
                                />
                            </div>
                        </div>

                        {/* AE Sensors Position Input Table */}
                        <div className="space-y-2">
                            <Label className="text-xs text-amber-300 font-bold flex items-center gap-1.5">
                                <ShieldAlert className="h-3.5 w-3.5" /> Vị trí &amp; Tọa độ 4 Đầu dò Siêu âm AE (Sensor Setup):
                            </Label>
                            <div className="space-y-2">
                                {sensorsSetup.filter(s => s.sensorId.startsWith("AE")).map((sensor, idx) => {
                                    const realIdx = idx + 1;
                                    return (
                                        <div key={sensor.sensorId} className="grid grid-cols-12 gap-2 bg-slate-900 p-2 rounded-lg border border-slate-800 items-center text-xs">
                                            <div className="col-span-2 font-bold text-emerald-400 font-mono flex items-center gap-1">
                                                <span>{sensor.sensorId}</span>
                                            </div>
                                            <div className="col-span-4">
                                                <Input
                                                    type="text"
                                                    placeholder="Vị trí gắn cảm biến"
                                                    value={sensor.attachedTo}
                                                    onChange={(e) => handleSensorChange(realIdx, "attachedTo", e.target.value)}
                                                    className="bg-slate-950 border-slate-800 text-[11px] text-white h-7"
                                                />
                                            </div>
                                            <div className="col-span-2 flex items-center gap-1">
                                                <span className="text-[10px] text-slate-400 font-mono">X:</span>
                                                <Input
                                                    type="number"
                                                    step="0.1"
                                                    value={sensor.x_m}
                                                    onChange={(e) => handleSensorChange(realIdx, "x_m", parseFloat(e.target.value) || 0)}
                                                    className="bg-slate-950 border-slate-800 text-[11px] text-cyan-300 h-7 text-center font-mono"
                                                />
                                            </div>
                                            <div className="col-span-2 flex items-center gap-1">
                                                <span className="text-[10px] text-slate-400 font-mono">Y:</span>
                                                <Input
                                                    type="number"
                                                    step="0.1"
                                                    value={sensor.y_m}
                                                    onChange={(e) => handleSensorChange(realIdx, "y_m", parseFloat(e.target.value) || 0)}
                                                    className="bg-slate-950 border-slate-800 text-[11px] text-cyan-300 h-7 text-center font-mono"
                                                />
                                            </div>
                                            <div className="col-span-2 flex items-center gap-1">
                                                <span className="text-[10px] text-slate-400 font-mono">Z:</span>
                                                <Input
                                                    type="number"
                                                    step="0.1"
                                                    value={sensor.z_m}
                                                    onChange={(e) => handleSensorChange(realIdx, "z_m", parseFloat(e.target.value) || 0)}
                                                    className="bg-slate-950 border-slate-800 text-[11px] text-cyan-300 h-7 text-center font-mono"
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Defect Type & Risk Level */}
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label className="text-xs text-slate-300 font-semibold">Dạng khuyết tật PD</Label>
                                <Select value={defectType} onValueChange={setDefectType}>
                                    <SelectTrigger className="bg-slate-950 border-slate-700 text-xs text-white">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-slate-900 border-slate-700 text-white">
                                        <SelectItem value="Internal PD">Internal PD (Phóng điện bọt khí)</SelectItem>
                                        <SelectItem value="Surface PD">Surface PD (Phóng điện bề mặt)</SelectItem>
                                        <SelectItem value="Corona">Corona (Vầng quang)</SelectItem>
                                        <SelectItem value="Noise">Noise (Nhiễu ngoài)</SelectItem>
                                        <SelectItem value="Normal">Normal (Bình thường)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label className="text-xs text-slate-300 font-semibold">Đánh giá Mức độ rủi ro</Label>
                                <Select value={riskLevel} onValueChange={setRiskLevel}>
                                    <SelectTrigger className="bg-slate-950 border-slate-700 text-xs text-white">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-slate-900 border-slate-700 text-white">
                                        <SelectItem value="NORMAL">NORMAL (Bình thường)</SelectItem>
                                        <SelectItem value="WATCH">WATCH (Chú ý theo dõi)</SelectItem>
                                        <SelectItem value="CRITICAL">CRITICAL (Cảnh báo nguy hiểm)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Inspector Notes */}
                        <div>
                            <Label className="text-xs text-slate-300 font-semibold">Nhận định của Kỹ thuật viên (KTV Notes)</Label>
                            <Textarea
                                rows={2}
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                className="bg-slate-950 border-slate-700 text-xs text-white"
                            />
                        </div>

                        {/* Inspector Name */}
                        <div>
                            <Label className="text-xs text-slate-300 font-semibold">Tên người kiểm tra (KTV)</Label>
                            <Input
                                type="text"
                                value={inspectorName}
                                onChange={(e) => setInspectorName(e.target.value)}
                                className="bg-slate-950 border-slate-700 text-xs text-white"
                            />
                        </div>
                    </div>

                    <DialogFooter className="pt-2 border-t border-slate-800">
                        <Button type="button" variant="outline" onClick={onClose} className="bg-slate-800 border-slate-700 text-slate-300">
                            Hủy
                        </Button>
                        <Button type="submit" disabled={loading} className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold px-6">
                            {loading ? "Đang lưu..." : (isEdit ? "Cập nhật Biên bản" : "Lưu Biên bản Thử nghiệm")}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
