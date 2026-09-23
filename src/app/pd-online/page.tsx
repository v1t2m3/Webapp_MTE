"use client";

import { useEffect, useState } from "react";
import { PowerCompany, Substation110kV, Transformer110kV, PdTestRecord } from "@/types/pd-online";
import { PowerCompanyTabs } from "@/components/pd-online/PowerCompanyTabs";
import { TransformerSpecCard } from "@/components/pd-online/TransformerSpecCard";
import { PrpdChart } from "@/components/pd-online/PrpdChart";
import { Transformer3DViewer } from "@/components/pd-online/Transformer3DViewer";
import { PdReportModal } from "@/components/pd-online/PdReportModal";
import { PdTestFormDialog } from "@/components/pd-online/PdTestFormDialog";
import { exportPowerCompanyExcelReport } from "@/lib/pd-excel-export";
import AppShell from "@/components/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Activity,
    FileSpreadsheet,
    FileText,
    Plus,
    ShieldAlert,
    BrainCircuit,
    CheckCircle2,
    Calendar,
    UserCheck,
    Box
} from "lucide-react";

export default function PdOnlinePage() {
    const [powerCompanies, setPowerCompanies] = useState<PowerCompany[]>([]);
    const [substations, setSubstations] = useState<Substation110kV[]>([]);
    const [transformers, setTransformers] = useState<Transformer110kV[]>([]);
    const [records, setRecords] = useState<PdTestRecord[]>([]);

    const [selectedCompanyId, setSelectedCompanyId] = useState<string>("");
    const [selectedSubstationId, setSelectedSubstationId] = useState<string>("");
    const [selectedTransformerId, setSelectedTransformerId] = useState<string>("");
    const [searchQuery, setSearchQuery] = useState("");

    const [openNewDialog, setOpenNewDialog] = useState(false);
    const [openReportModal, setOpenReportModal] = useState(false);
    const [activeRecord, setActiveRecord] = useState<PdTestRecord | null>(null);

    // Fetch Initial Data
    useEffect(() => {
        async function loadData() {
            try {
                const res = await fetch("/api/pd-online");
                if (res.ok) {
                    const data = await res.json();
                    setPowerCompanies(data.powerCompanies || []);
                    setSubstations(data.substations || []);
                    setTransformers(data.transformers || []);
                    setRecords(data.records || []);

                    // Default selections
                    if (data.powerCompanies?.length > 0) {
                        const firstCompany = data.powerCompanies[0];
                        setSelectedCompanyId(firstCompany.id);
                        const companySubs = (data.substations || []).filter((s: any) => s.powerCompanyId === firstCompany.id);
                        if (companySubs.length > 0) {
                            setSelectedSubstationId(companySubs[0].id);
                            const subTfs = (data.transformers || []).filter((t: any) => t.substationId === companySubs[0].id);
                            if (subTfs.length > 0) {
                                setSelectedTransformerId(subTfs[0].id);
                            }
                        }
                    }
                }
            } catch (err) {
                console.error("Failed to load PD Online data:", err);
            }
        }
        loadData();
    }, []);

    // Filter updates
    const handleSelectCompany = (companyId: string) => {
        setSelectedCompanyId(companyId);
        const companySubs = substations.filter(s => s.powerCompanyId === companyId);
        if (companySubs.length > 0) {
            setSelectedSubstationId(companySubs[0].id);
            const subTfs = transformers.filter(t => t.substationId === companySubs[0].id);
            if (subTfs.length > 0) {
                setSelectedTransformerId(subTfs[0].id);
            } else {
                setSelectedTransformerId("");
            }
        } else {
            setSelectedSubstationId("");
            setSelectedTransformerId("");
        }
    };

    const handleSelectSubstation = (substationId: string) => {
        setSelectedSubstationId(substationId);
        const subTfs = transformers.filter(t => t.substationId === substationId);
        if (subTfs.length > 0) {
            setSelectedTransformerId(subTfs[0].id);
        } else {
            setSelectedTransformerId("");
        }
    };

    const currentCompany = powerCompanies.find(c => c.id === selectedCompanyId);
    const currentSubstation = substations.find(s => s.id === selectedSubstationId);
    const currentTransformer = transformers.find(t => t.id === selectedTransformerId);

    // Records for currently selected Transformer
    const currentRecords = records.filter(r => r.transformerId === selectedTransformerId);
    const latestRecord = currentRecords.length > 0 ? currentRecords[0] : null;

    const handleAddRecord = async (payload: any) => {
        try {
            const res = await fetch("/api/pd-online", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "ADD_RECORD", payload })
            });
            if (res.ok) {
                const data = await res.json();
                setRecords(data.data.records);
                setTransformers(data.data.transformers);
            }
        } catch (err) {
            console.error("Failed to add record:", err);
        }
    };

    const handleExportExcel = () => {
        if (!currentCompany) return;
        exportPowerCompanyExcelReport(currentCompany, substations, transformers, records);
    };

    return (
        <AppShell>
            <div className="p-4 sm:p-6 space-y-6 bg-slate-950 min-h-screen text-white">
                {/* Header Title & Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-indigo-900/60 via-slate-900 to-slate-900 p-5 rounded-2xl border border-indigo-500/30 shadow-xl">
                    <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                            <Badge className="bg-indigo-600 text-white font-bold text-xs uppercase px-2.5 py-0.5">
                                ISO/IEC 17025 &bull; EVN Standards
                            </Badge>
                            <span className="text-xs text-indigo-300 font-mono">PD-TP500A Engine</span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
                            <Activity className="h-8 w-8 text-amber-400 animate-pulse" />
                            Quản lý Phóng điện Cục bộ PD Online MBA 110kV &amp; 3D Localization
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-400 max-w-3xl">
                            Hệ thống giám sát phân tích ma trận PRPD $(\phi - q - n)$, thu thập tín hiệu HFCT/AE và định vị 3D vị trí khuyết tật TDOA bằng giải thuật âm học.
                        </p>
                    </div>

                    <div className="flex items-center space-x-3">
                        <Button
                            onClick={handleExportExcel}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-lg shadow-emerald-600/30"
                        >
                            <FileSpreadsheet className="h-4 w-4 mr-2" />
                            Xuất báo cáo Excel ({currentCompany?.code || "Tất cả"})
                        </Button>
                        {currentTransformer && (
                            <Button
                                onClick={() => setOpenNewDialog(true)}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30"
                            >
                                <Plus className="h-4 w-4 mr-1.5" /> Tạo Biên bản mới
                            </Button>
                        )}
                    </div>
                </div>

                {/* Hierarchical Filter Tabs */}
                <PowerCompanyTabs
                    powerCompanies={powerCompanies}
                    substations={substations}
                    transformers={transformers}
                    selectedCompanyId={selectedCompanyId}
                    selectedSubstationId={selectedSubstationId}
                    selectedTransformerId={selectedTransformerId}
                    onSelectCompany={handleSelectCompany}
                    onSelectSubstation={handleSelectSubstation}
                    onSelectTransformer={(id) => setSelectedTransformerId(id)}
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                />

                {/* Main Content Area */}
                {currentTransformer ? (
                    <div className="space-y-6">
                        {/* Selected Transformer Specs */}
                        <TransformerSpecCard
                            transformer={currentTransformer}
                            substationName={currentSubstation?.name}
                            powerCompanyName={currentCompany?.name}
                        />

                        {latestRecord ? (
                            <>
                                {/* Row 1: PRPD Chart & AI vs KTV Diagnostic Box */}
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    <div className="lg:col-span-2">
                                        <PrpdChart
                                            prpdPoints={latestRecord.prpdPoints}
                                            metrics={latestRecord.metrics}
                                        />
                                    </div>

                                    {/* AI & KTV Consensus Box */}
                                    <div className="space-y-4">
                                        <Card className="bg-slate-900 border-indigo-500/30 text-white shadow-xl h-full flex flex-col">
                                            <CardHeader className="pb-2 border-b border-indigo-500/20">
                                                <CardTitle className="text-base font-bold text-indigo-300 flex items-center gap-2">
                                                    <BrainCircuit className="h-5 w-5 text-purple-400" />
                                                    Chẩn đoán AI &amp; Nhận định Kỹ thuật viên
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="pt-4 flex-1 flex flex-col justify-between space-y-4 text-xs">
                                                {/* AI Suggestion */}
                                                <div className="p-3 bg-purple-950/50 rounded-xl border border-purple-500/30 space-y-1.5">
                                                    <div className="flex justify-between items-center text-purple-300 font-bold">
                                                        <span className="flex items-center gap-1">
                                                            <BrainCircuit className="h-3.5 w-3.5" /> Mô hình AI CNN:
                                                        </span>
                                                        <Badge className="bg-purple-600 text-white text-[10px]">
                                                            {(latestRecord.aiDiagnostic.confidence * 100).toFixed(1)}% tin cậy
                                                        </Badge>
                                                    </div>
                                                    <div className="text-sm font-extrabold text-white">
                                                        Dạng khuyết tật: <span className="text-amber-300">{latestRecord.aiDiagnostic.predictedDefect}</span>
                                                    </div>
                                                    <p className="text-[11px] text-slate-300 leading-relaxed">
                                                        💡 <span className="font-semibold text-purple-300">Khuyến nghị xử lý:</span> {latestRecord.aiDiagnostic.recommendedAction}
                                                    </p>
                                                </div>

                                                {/* KTV Assessment */}
                                                <div className="p-3 bg-indigo-950/50 rounded-xl border border-indigo-500/30 space-y-1.5">
                                                    <div className="flex justify-between items-center text-indigo-300 font-bold">
                                                        <span className="flex items-center gap-1">
                                                            <UserCheck className="h-3.5 w-3.5 text-emerald-400" /> KTV Đánh giá:
                                                        </span>
                                                        <span className="text-slate-400 text-[10px]">{latestRecord.inspectorAssessment.inspectorName}</span>
                                                    </div>
                                                    <div className="text-xs font-bold text-emerald-400">
                                                        Nhận định: {latestRecord.inspectorAssessment.defectType} ({latestRecord.inspectorAssessment.riskLevel})
                                                    </div>
                                                    <p className="text-[11px] text-slate-300 leading-relaxed italic">
                                                        "{latestRecord.inspectorAssessment.notes}"
                                                    </p>
                                                </div>

                                                {/* Action Button: Export PDF */}
                                                <Button
                                                    onClick={() => {
                                                        setActiveRecord(latestRecord);
                                                        setOpenReportModal(true);
                                                    }}
                                                    className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold py-2 rounded-xl text-xs shadow-lg"
                                                >
                                                    <FileText className="h-4 w-4 mr-2" /> Xem &amp; In Biên bản PDF ({latestRecord.testCode})
                                                </Button>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </div>

                                {/* Row 2: 3D Acoustic Localization View */}
                                <Transformer3DViewer
                                    tankDimensions={latestRecord.tankDimensions}
                                    sensorsSetup={latestRecord.sensorsSetup}
                                    localization3D={latestRecord.localization3D}
                                    riskLevel={latestRecord.inspectorAssessment.riskLevel}
                                />

                                {/* Row 3: Test History Table */}
                                <Card className="bg-slate-900 border-indigo-500/30 text-white shadow-xl">
                                    <CardHeader className="pb-2 border-b border-indigo-500/20">
                                        <CardTitle className="text-base font-bold text-indigo-300 flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-cyan-400" />
                                            Lịch sử Các lần Thử nghiệm PD Online cho {currentTransformer.name}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="pt-3">
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left text-xs border-collapse">
                                                <thead>
                                                    <tr className="border-b border-slate-800 text-slate-400 font-semibold bg-slate-950/50">
                                                        <th className="p-2.5">Mã biên bản</th>
                                                        <th className="p-2.5">Ngày thử nghiệm</th>
                                                        <th className="p-2.5">Qmax (pC)</th>
                                                        <th className="p-2.5">Xung/chu kỳ</th>
                                                        <th className="p-2.5">Khuyết tật PD</th>
                                                        <th className="p-2.5">Tọa độ 3D (x,y,z)</th>
                                                        <th className="p-2.5">KTV Đánh giá</th>
                                                        <th className="p-2.5 text-right">Thao tác</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {currentRecords.map((r) => (
                                                        <tr key={r.id} className="border-b border-slate-800/60 hover:bg-slate-800/40 transition">
                                                            <td className="p-2.5 font-bold text-indigo-400 font-mono">{r.testCode}</td>
                                                            <td className="p-2.5 text-slate-300">{r.testDate}</td>
                                                            <td className="p-2.5 font-bold text-rose-400">{r.metrics.qMaxPc} pC</td>
                                                            <td className="p-2.5 text-slate-300">{r.metrics.pulseCountPerCycle} /n</td>
                                                            <td className="p-2.5 text-amber-300 font-medium">{r.inspectorAssessment.defectType}</td>
                                                            <td className="p-2.5 font-mono text-cyan-300">
                                                                ({r.localization3D.computedCoord.x}, {r.localization3D.computedCoord.y}, {r.localization3D.computedCoord.z})
                                                            </td>
                                                            <td className="p-2.5 text-slate-300">{r.inspectorAssessment.inspectorName}</td>
                                                            <td className="p-2.5 text-right">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => {
                                                                        setActiveRecord(r);
                                                                        setOpenReportModal(true);
                                                                    }}
                                                                    className="text-xs text-indigo-300 hover:text-white hover:bg-indigo-600/30 h-7 px-2"
                                                                >
                                                                    <FileText className="h-3.5 w-3.5 mr-1" /> Xem PDF
                                                                </Button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </CardContent>
                                </Card>
                            </>
                        ) : (
                            <Card className="bg-slate-900 border-slate-800 text-center p-8 text-slate-400">
                                <Activity className="h-10 w-10 text-indigo-400 mx-auto mb-2 opacity-50" />
                                <p className="text-sm font-semibold text-white">Chưa có biên bản thử nghiệm PD cho máy biến áp này</p>
                                <p className="text-xs text-slate-400 mt-1">Nhấn "Tạo Biên bản mới" để nạp dữ liệu từ thiết bị PD-TP500A</p>
                            </Card>
                        )}
                    </div>
                ) : (
                    <Card className="bg-slate-900 border-slate-800 text-center p-12 text-slate-400">
                        <Box className="h-12 w-12 text-indigo-400 mx-auto mb-3 opacity-40 animate-pulse" />
                        <h3 className="text-base font-bold text-white">Vui lòng chọn Công ty Điện lực, Trạm 110kV và Máy biến áp</h3>
                        <p className="text-xs text-slate-400 mt-1">Sử dụng bộ lọc phía trên để chọn máy biến áp cần xem báo cáo PD Online</p>
                    </Card>
                )}

                {/* Modals */}
                {currentTransformer && (
                    <PdTestFormDialog
                        open={openNewDialog}
                        onClose={() => setOpenNewDialog(false)}
                        transformer={currentTransformer}
                        onSubmit={handleAddRecord}
                    />
                )}

                {activeRecord && currentTransformer && (
                    <PdReportModal
                        open={openReportModal}
                        onClose={() => setOpenReportModal(false)}
                        record={activeRecord}
                        transformer={currentTransformer}
                        substation={currentSubstation}
                        powerCompany={currentCompany}
                    />
                )}
            </div>
        </AppShell>
    );
}
