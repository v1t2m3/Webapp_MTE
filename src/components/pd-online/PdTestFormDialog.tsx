"use client";

import { useState } from "react";
import { Transformer110kV } from "@/types/pd-online";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileUp, Plus, CheckCircle2, Zap } from "lucide-react";

interface PdTestFormDialogProps {
    open: boolean;
    onClose: () => void;
    transformer: Transformer110kV;
    onSubmit: (recordPayload: any) => Promise<void>;
}

export function PdTestFormDialog({ open, onClose, transformer, onSubmit }: PdTestFormDialogProps) {
    const [testDate, setTestDate] = useState(new Date().toISOString().split("T")[0]);
    const [oilTemp, setOilTemp] = useState("55");
    const [ambientTemp, setAmbientTemp] = useState("30");
    const [humidity, setHumidity] = useState("65");
    const [qMax, setQMax] = useState("650");
    const [qAvg, setQAvg] = useState("180");
    const [pulseCount, setPulseCount] = useState("12.5");
    const [defectType, setDefectType] = useState<any>("Surface PD");
    const [riskLevel, setRiskLevel] = useState<any>("WATCH");
    const [notes, setNotes] = useState("Ghi nhận xung phóng điện nhẹ ở chu kỳ âm.");
    const [inspectorName, setInspectorName] = useState("Nguyễn Văn Tám");
    const [loading, setLoading] = useState(false);
    const [parsedFileName, setParsedFileName] = useState<string | null>(null);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setParsedFileName(file.name);
            // Simulate device file parsing
            if (file.name.includes("critical") || file.name.includes("high")) {
                setQMax("1250");
                setQAvg("420");
                setRiskLevel("CRITICAL");
                setDefectType("Internal PD");
                setNotes("File nhị phân PD-TP500A: Biên độ Qmax vượt 1000 pC, phát hiện bong bóng bọt khí.");
            } else {
                setQMax("580");
                setQAvg("150");
                setRiskLevel("WATCH");
                setDefectType("Surface PD");
                setNotes(`Đã parse dữ liệu từ file ${file.name} thành công.`);
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const payload = {
            transformerId: transformer.id,
            testDate,
            oilTempC: parseFloat(oilTemp) || 55,
            ambientTempC: parseFloat(ambientTemp) || 30,
            humidityPct: parseFloat(humidity) || 65,
            noiseLevelDb: 32.5,
            tankDimensions: { length_m: 4.5, width_m: 2.2, height_m: 3.2 },
            sensorsSetup: [
                { sensorId: "HFCT", channel: 0, attachedTo: "Grounding lead", x_m: 0, y_m: 0, z_m: 0 },
                { sensorId: "AE1", channel: 1, attachedTo: "Mặt trước trái", x_m: 1.2, y_m: 0.0, z_m: 1.5 },
                { sensorId: "AE2", channel: 2, attachedTo: "Mặt trước phải", x_m: 3.8, y_m: 0.0, z_m: 1.2 },
                { sensorId: "AE3", channel: 3, attachedTo: "Mặt sau trái", x_m: 2.0, y_m: 2.2, z_m: 1.8 },
                { sensorId: "AE4", channel: 4, attachedTo: "Mặt sau phải", x_m: 4.2, y_m: 2.2, z_m: 0.9 }
            ],
            metrics: {
                qMaxPc: parseFloat(qMax) || 650,
                qAvgPc: parseFloat(qAvg) || 180,
                pulseCountPerCycle: parseFloat(pulseCount) || 12.5
            },
            prpdPoints: [
                { phase_deg: 45, q_pc: parseFloat(qMax) * 0.5, count: 12 },
                { phase_deg: 65, q_pc: parseFloat(qMax), count: 35 },
                { phase_deg: 225, q_pc: parseFloat(qMax) * 0.8, count: 22 }
            ],
            inspectorAssessment: {
                defectType,
                riskLevel,
                notes,
                inspectorName,
                reviewedAt: new Date().toISOString()
            },
            aiDiagnostic: {
                predictedDefect: defectType === "Normal" ? "Surface PD" : defectType,
                confidence: 0.925,
                riskLevel,
                recommendedAction: riskLevel === "CRITICAL" ? "Dừng vận hành kiểm tra khẩn cấp" : "Đo kiểm định kỳ và rút ngắn chu kỳ DGA"
            },
            localization3D: {
                computedCoord: { x: 2.15, y: 1.10, z: 1.65 },
                errorMarginM: 0.15,
                nearestComponent: "Cuộn dây Pha B",
                waveVelocityUsedMps: 1410.0,
                tdoaDeltasMicrosec: [1250, 1890, 850, 2100]
            }
        };

        await onSubmit(payload);
        setLoading(false);
        onClose();
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl bg-slate-900 border-indigo-500/30 text-white">
                <DialogHeader className="border-b border-slate-800 pb-3">
                    <DialogTitle className="text-lg font-bold flex items-center gap-2 text-indigo-300">
                        <Plus className="h-5 w-5 text-emerald-400" />
                        Tạo Biên bản Kết quả Đo PD Online cho {transformer?.name}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 pt-2 text-sm">
                    {/* Device Upload Section */}
                    <div className="p-3 bg-slate-950 rounded-lg border border-indigo-500/20 space-y-2">
                        <Label className="text-xs text-indigo-300 font-semibold flex items-center gap-1.5">
                            <FileUp className="h-4 w-4 text-cyan-400" /> Nạp file dữ liệu từ thiết bị đo PD-TP500A (.dat / .bin / .csv)
                        </Label>
                        <Input
                            type="file"
                            accept=".csv,.txt,.dat,.bin"
                            onChange={handleFileUpload}
                            className="bg-slate-900 border-slate-700 text-xs text-slate-300 file:bg-indigo-600 file:text-white file:border-0 file:rounded file:px-2.5 file:py-1 file:text-xs"
                        />
                        {parsedFileName && (
                            <p className="text-xs text-emerald-400 flex items-center gap-1">
                                <CheckCircle2 className="h-3.5 w-3.5" /> Đã bóc tách dữ liệu từ file {parsedFileName}
                            </p>
                        )}
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                        <div>
                            <Label className="text-xs text-slate-300">Ngày đo thử nghiệm</Label>
                            <Input
                                type="date"
                                value={testDate}
                                onChange={(e) => setTestDate(e.target.value)}
                                className="bg-slate-950 border-slate-700 text-xs text-white"
                            />
                        </div>
                        <div>
                            <Label className="text-xs text-slate-300">Nhiệt độ dầu (°C)</Label>
                            <Input
                                type="number"
                                value={oilTemp}
                                onChange={(e) => setOilTemp(e.target.value)}
                                className="bg-slate-950 border-slate-700 text-xs text-white"
                            />
                        </div>
                        <div>
                            <Label className="text-xs text-slate-300">Nhiệt độ môi trường (°C)</Label>
                            <Input
                                type="number"
                                value={ambientTemp}
                                onChange={(e) => setAmbientTemp(e.target.value)}
                                className="bg-slate-950 border-slate-700 text-xs text-white"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                        <div>
                            <Label className="text-xs text-amber-300 font-semibold">Qmax (pC)</Label>
                            <Input
                                type="number"
                                value={qMax}
                                onChange={(e) => setQMax(e.target.value)}
                                className="bg-slate-950 border-slate-700 text-xs text-white font-bold text-rose-400"
                            />
                        </div>
                        <div>
                            <Label className="text-xs text-slate-300">Qavg (pC)</Label>
                            <Input
                                type="number"
                                value={qAvg}
                                onChange={(e) => setQAvg(e.target.value)}
                                className="bg-slate-950 border-slate-700 text-xs text-white"
                            />
                        </div>
                        <div>
                            <Label className="text-xs text-slate-300">Xung/chu kỳ (n)</Label>
                            <Input
                                type="number"
                                value={pulseCount}
                                onChange={(e) => setPulseCount(e.target.value)}
                                className="bg-slate-950 border-slate-700 text-xs text-white"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <Label className="text-xs text-slate-300">Dạng khuyết tật PD</Label>
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
                            <Label className="text-xs text-slate-300">Đánh giá Mức độ rủi ro</Label>
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

                    <div>
                        <Label className="text-xs text-slate-300">Nhận định của Kỹ thuật viên (KTV Notes)</Label>
                        <Textarea
                            rows={3}
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="bg-slate-950 border-slate-700 text-xs text-white"
                        />
                    </div>

                    <div>
                        <Label className="text-xs text-slate-300">Người kiểm tra (KTV)</Label>
                        <Input
                            type="text"
                            value={inspectorName}
                            onChange={(e) => setInspectorName(e.target.value)}
                            className="bg-slate-950 border-slate-700 text-xs text-white"
                        />
                    </div>

                    <DialogFooter className="pt-2 border-t border-slate-800">
                        <Button type="button" variant="outline" onClick={onClose} className="bg-slate-800 border-slate-700 text-slate-300">
                            Hủy
                        </Button>
                        <Button type="submit" disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold">
                            {loading ? "Đang lưu..." : "Lưu Biên bản Thử nghiệm"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
