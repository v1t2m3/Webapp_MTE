"use client";

import { useRef } from "react";
import { PdTestRecord, Transformer110kV, Substation110kV, PowerCompany } from "@/types/pd-online";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Printer, Download, FileText, Zap, ShieldCheck } from "lucide-react";
import { useReactToPrint } from "react-to-print";

interface PdReportModalProps {
    open: boolean;
    onClose: () => void;
    record: PdTestRecord;
    transformer: Transformer110kV;
    substation?: Substation110kV;
    powerCompany?: PowerCompany;
}

export function PdReportModal({
    open,
    onClose,
    record,
    transformer,
    substation,
    powerCompany
}: PdReportModalProps) {
    const reportRef = useRef<HTMLDivElement | null>(null);

    const handlePrint = useReactToPrint({
        contentRef: reportRef,
        documentTitle: `Bien_Ban_Thi_Nghiệm_PD_${transformer.code}_${record.testCode}`
    });

    if (!record || !transformer) return null;

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-900 border-indigo-500/30 text-white">
                <DialogHeader className="border-b border-slate-800 pb-3 flex flex-row items-center justify-between">
                    <DialogTitle className="text-lg font-bold flex items-center gap-2 text-indigo-300">
                        <FileText className="h-5 w-5 text-indigo-400" />
                        Xem Biên bản Báo cáo Kết quả Đo PD Online MBA 110kV
                    </DialogTitle>
                </DialogHeader>

                {/* Printable Report Document Container */}
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
                    <div ref={reportRef} className="p-8 bg-white text-slate-900 rounded shadow-md text-xs space-y-6 font-sans">
                        {/* Header ISO Standard Logo */}
                        <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4">
                            <div>
                                <h3 className="font-bold text-sm uppercase text-blue-900">TRUNG TÂM THÍ NGHIỆM ĐIỆN MTE-LAB</h3>
                                <p className="text-[10px] text-slate-600">ISO/IEC 17025:2017 &bull; VALAS 019 &bull; ISO 9001:2015</p>
                                <p className="text-[10px] text-slate-600">ĐC: KCN Liên Chiểu, Q. Liên Chiểu, TP. Đà Nẵng</p>
                            </div>
                            <div className="text-right">
                                <span className="font-bold text-xs text-red-600">Số BB: {record.testCode}</span>
                                <p className="text-[10px] text-slate-600">Ngày thực hiện: {record.testDate}</p>
                            </div>
                        </div>

                        {/* Title */}
                        <div className="text-center space-y-1">
                            <h2 className="text-base font-extrabold uppercase text-slate-900 tracking-wide">
                                BIÊN BẢN KẾT QUẢ THỬ NGHIỆM PHÓNG ĐIỆN CỤC BỘ (PD ONLINE)
                            </h2>
                            <p className="font-semibold text-xs text-blue-800">
                                MÁY BIẾN ÁP 110kV: {transformer.name} ({transformer.code})
                            </p>
                            <p className="text-[11px] text-slate-600">
                                Thuộc {substation?.name} &bull; {powerCompany?.name}
                            </p>
                        </div>

                        {/* 1. Technical Specs Table */}
                        <div>
                            <h4 className="font-bold text-xs uppercase text-blue-900 mb-1 border-b border-slate-300 pb-0.5">
                                I. THÔNG SỐ KỸ THUẬT MÁY BIẾN ÁP &amp; ĐIỀU KIỆN MÔI TRƯỜNG
                            </h4>
                            <table className="w-full border-collapse border border-slate-300 text-[11px]">
                                <tbody>
                                    <tr className="border-b border-slate-300 bg-slate-50">
                                        <td className="p-1.5 font-semibold w-1/4 border-r border-slate-300">Công suất danh định:</td>
                                        <td className="p-1.5 w-1/4 border-r border-slate-300 font-bold">{transformer.capacityMva} MVA</td>
                                        <td className="p-1.5 font-semibold w-1/4 border-r border-slate-300">Tỷ số điện áp:</td>
                                        <td className="p-1.5 w-1/4 font-bold">{transformer.voltageRatio}</td>
                                    </tr>
                                    <tr className="border-b border-slate-300">
                                        <td className="p-1.5 font-semibold border-r border-slate-300">Hãng sản xuất / Năm SX:</td>
                                        <td className="p-1.5 border-r border-slate-300">{transformer.manufacturer} ({transformer.manufacturedYear})</td>
                                        <td className="p-1.5 font-semibold border-r border-slate-300">Năm vận hành:</td>
                                        <td className="p-1.5">{transformer.commissionedYear}</td>
                                    </tr>
                                    <tr className="border-b border-slate-300 bg-slate-50">
                                        <td className="p-1.5 font-semibold border-r border-slate-300">Kiểu làm mát / OLTC:</td>
                                        <td className="p-1.5 border-r border-slate-300">{transformer.coolingType} / {transformer.oltcType} ({transformer.oltcManufacturer})</td>
                                        <td className="p-1.5 font-semibold border-r border-slate-300">Nhiệt độ dầu / Môi trường:</td>
                                        <td className="p-1.5 font-bold">{record.oilTempC}°C / {record.ambientTempC}°C (Độ ẩm: {record.humidityPct}%)</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* 2. PD Measurement Results */}
                        <div>
                            <h4 className="font-bold text-xs uppercase text-blue-900 mb-1 border-b border-slate-300 pb-0.5">
                                II. KẾT QUẢ ĐO PHÓNG ĐIỆN CỤC BỘ (THIẾT BỊ PD-TP500A)
                            </h4>
                            <div className="grid grid-cols-3 gap-2 p-2 bg-slate-100 rounded border border-slate-300 text-center font-semibold mb-2">
                                <div>Biên độ cực đại Qmax: <span className="text-red-700 font-bold">{record.metrics.qMaxPc} pC</span></div>
                                <div>Biên độ trung bình Qavg: <span className="text-amber-700 font-bold">{record.metrics.qAvgPc} pC</span></div>
                                <div>Tần số xung / chu kỳ: <span className="text-blue-700 font-bold">{record.metrics.pulseCountPerCycle} /n</span></div>
                            </div>
                        </div>

                        {/* 3. Sensor Setup Table */}
                        <div>
                            <h4 className="font-bold text-xs uppercase text-blue-900 mb-1 border-b border-slate-300 pb-0.5">
                                III. CẤU HÌNH VỊ TRÍ 4 ĐẦU DÒ SIÊU ÂM (AE SENSORS) &amp; HFCT
                            </h4>
                            <table className="w-full border-collapse border border-slate-300 text-[10px] text-center">
                                <thead>
                                    <tr className="bg-slate-200 border-b border-slate-300 font-bold">
                                        <th className="p-1 border-r border-slate-300">Cảm biến</th>
                                        <th className="p-1 border-r border-slate-300">Kênh</th>
                                        <th className="p-1 border-r border-slate-300">Vị trí gắn trên thùng MBA</th>
                                        <th className="p-1 border-r border-slate-300">Tọa độ X (m)</th>
                                        <th className="p-1 border-r border-slate-300">Tọa độ Y (m)</th>
                                        <th className="p-1 font-bold">Tọa độ Z (m)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {record.sensorsSetup.map(s => (
                                        <tr key={s.sensorId} className="border-b border-slate-300">
                                            <td className="p-1 font-bold border-r border-slate-300">{s.sensorId}</td>
                                            <td className="p-1 border-r border-slate-300">CH {s.channel}</td>
                                            <td className="p-1 border-r border-slate-300 text-left pl-2">{s.attachedTo}</td>
                                            <td className="p-1 border-r border-slate-300 font-mono">{s.x_m}</td>
                                            <td className="p-1 border-r border-slate-300 font-mono">{s.y_m}</td>
                                            <td className="p-1 font-mono">{s.z_m}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* 4. AI Diagnosis & 3D TDOA Localization */}
                        <div>
                            <h4 className="font-bold text-xs uppercase text-blue-900 mb-1 border-b border-slate-300 pb-0.5">
                                IV. ĐỊNH VỊ 3D (TDOA ACOUSTIC SOLVER) &amp; CHẨN ĐOÁN AI
                            </h4>
                            <div className="p-2.5 bg-blue-50 rounded border border-blue-200 space-y-1 text-[11px]">
                                <div><span className="font-semibold">Tọa độ nguồn PD 3D:</span> <span className="font-bold text-blue-900">X={record.localization3D.computedCoord.x}m, Y={record.localization3D.computedCoord.y}m, Z={record.localization3D.computedCoord.z}m</span> (Sai số ±{record.localization3D.errorMarginM}m)</div>
                                <div><span className="font-semibold">Vùng nguy cơ:</span> <span className="font-bold text-red-700">{record.localization3D.nearestComponent}</span></div>
                                <div><span className="font-semibold">Chẩn đoán AI CNN:</span> Dạng khuyết tật <span className="font-bold text-purple-900">{record.aiDiagnostic.predictedDefect}</span> (Độ tin cậy {(record.aiDiagnostic.confidence * 100).toFixed(1)}%)</div>
                            </div>
                        </div>

                        {/* 5. KTV Conclusion */}
                        <div>
                            <h4 className="font-bold text-xs uppercase text-blue-900 mb-1 border-b border-slate-300 pb-0.5">
                                V. ĐÁNH GIÁ KẾT LUẬN CỦA KỸ THUẬT VIÊN
                            </h4>
                            <div className="p-2.5 bg-amber-50 rounded border border-amber-200 text-[11px]">
                                <p className="font-bold text-amber-900">Mức độ rủi ro: {record.inspectorAssessment.riskLevel}</p>
                                <p className="mt-1 text-slate-800 font-medium">{record.inspectorAssessment.notes}</p>
                            </div>
                        </div>

                        {/* Signatures */}
                        <div className="pt-6 grid grid-cols-2 text-center text-[11px]">
                            <div>
                                <p className="font-bold uppercase">NGƯỜI THỰC HIỆN KÍNH THÍ</p>
                                <p className="text-[10px] text-slate-500 italic mb-12">(Ký và ghi rõ họ tên)</p>
                                <p className="font-bold text-blue-900">{record.inspectorAssessment.inspectorName}</p>
                            </div>
                            <div>
                                <p className="font-bold uppercase">TRƯỞNG PHÒNG THỬ NGHIỆM</p>
                                <p className="text-[10px] text-slate-500 italic mb-12">(Ký và ghi rõ họ tên)</p>
                                <p className="font-bold text-blue-900">KS. Nguyễn Văn Tâm</p>
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter className="gap-2">
                    <Button variant="outline" onClick={onClose} className="bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700">
                        Đóng
                    </Button>
                    <Button onClick={handlePrint} className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold">
                        <Printer className="h-4 w-4 mr-2" /> In / Xuất PDF Biên bản
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
