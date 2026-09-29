"use client";

import { useEffect, useState } from "react";
import { PowerCompany, Substation110kV, Transformer110kV, PdTestRecord } from "@/types/pd-online";
import { PowerCompanyTabs } from "@/components/pd-online/PowerCompanyTabs";
import { TransformerSpecCard } from "@/components/pd-online/TransformerSpecCard";
import { PrpdChart } from "@/components/pd-online/PrpdChart";
import { Transformer3DViewer } from "@/components/pd-online/Transformer3DViewer";
import { PdReportModal } from "@/components/pd-online/PdReportModal";
import { PdTestFormDialog } from "@/components/pd-online/PdTestFormDialog";
import { TransformerTable } from "@/components/pd-online/TransformerTable";
import { TransformerManagerDialog } from "@/components/pd-online/TransformerManagerDialog";
import { exportPowerCompanyExcelReport } from "@/lib/pd-excel-export";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    Activity,
    FileSpreadsheet,
    FileText,
    Plus,
    BrainCircuit,
    Calendar,
    UserCheck,
    Box,
    TableProperties,
    LayoutDashboard,
    Zap,
    Edit,
    Trash2
} from "lucide-react";

export default function PdOnlinePage() {
    const [powerCompanies, setPowerCompanies] = useState<PowerCompany[]>([]);
    const [substations, setSubstations] = useState<Substation110kV[]>([]);
    const [transformers, setTransformers] = useState<Transformer110kV[]>([]);
    const [records, setRecords] = useState<PdTestRecord[]>([]);

    const [selectedCompanyId, setSelectedCompanyId] = useState<string>("");
    const [selectedSubstationId, setSelectedSubstationId] = useState<string>("");
    const [selectedTransformerId, setSelectedTransformerId] = useState<string>("");
    const [selectedRecordId, setSelectedRecordId] = useState<string>("");
    const [searchQuery, setSearchQuery] = useState("");
    const [viewMode, setViewMode] = useState<"dashboard" | "table">("dashboard");

    const [openNewDialog, setOpenNewDialog] = useState(false);
    const [editingRecord, setEditingRecord] = useState<PdTestRecord | null>(null);
    const [openReportModal, setOpenReportModal] = useState(false);
    const [activeRecord, setActiveRecord] = useState<PdTestRecord | null>(null);

    // Transformer CRUD Dialog State
    const [openTfDialog, setOpenTfDialog] = useState(false);
    const [editingTransformer, setEditingTransformer] = useState<Transformer110kV | null>(null);

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

    // Records for currently selected Transformer, sorted by testDate descending (latest date first)
    const currentRecords = records
        .filter(r => r.transformerId === selectedTransformerId)
        .sort((a, b) => new Date(b.testDate).getTime() - new Date(a.testDate).getTime());

    // Active Record Displayed on Dashboard (Selected or Latest by default)
    const displayedRecord = currentRecords.find(r => r.id === selectedRecordId) || (currentRecords.length > 0 ? currentRecords[0] : null);

    const handleSaveRecord = async (payload: any, isEdit?: boolean) => {
        try {
            const action = isEdit ? "UPDATE_RECORD" : "ADD_RECORD";
            const res = await fetch("/api/pd-online", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action, payload })
            });
            if (res.ok) {
                const data = await res.json();
                const newRecords = data.data.records || [];
                setRecords(newRecords);
                setTransformers(data.data.transformers || []);

                // Select the saved/updated record
                const targetRecord = newRecords.find((r: any) => r.id === (payload.id || data.record?.id)) || newRecords[0];
                if (targetRecord) {
                    setSelectedRecordId(targetRecord.id);
                }
            }
        } catch (err) {
            console.error("Failed to save record:", err);
        }
    };

    const handleDeleteRecord = async (recordId: string) => {
        if (!confirm("Bạn có chắc chắn muốn xóa biên bản thử nghiệm PD Online này?")) return;
        try {
            const res = await fetch("/api/pd-online", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "DELETE_RECORD", payload: { id: recordId } })
            });
            if (res.ok) {
                const data = await res.json();
                const newRecords = data.data.records || [];
                setRecords(newRecords);
                setTransformers(data.data.transformers || []);

                if (selectedRecordId === recordId) {
                    const remaining = newRecords.filter((r: any) => r.transformerId === selectedTransformerId);
                    setSelectedRecordId(remaining.length > 0 ? remaining[0].id : "");
                }
            }
        } catch (err) {
            console.error("Failed to delete record:", err);
        }
    };

    // Save or Edit Transformer Handler
    const handleSaveTransformer = async (payload: any, isEdit: boolean) => {
        try {
            const action = isEdit ? "UPDATE_TRANSFORMER" : "ADD_TRANSFORMER";
            const res = await fetch("/api/pd-online", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action, payload })
            });
            if (res.ok) {
                const data = await res.json();
                const newCompanies = data.data.powerCompanies || [];
                const newSubstations = data.data.substations || [];
                const newTransformers = data.data.transformers || [];

                setPowerCompanies(newCompanies);
                setSubstations(newSubstations);
                setTransformers(newTransformers);
                if (data.data.records) setRecords(data.data.records);

                // Auto-sync dashboard filters to the saved company & substation & transformer!
                if (payload.powerCompanyName) {
                    const comp = newCompanies.find((c: any) => c.name === payload.powerCompanyName);
                    if (comp) setSelectedCompanyId(comp.id);
                }
                if (payload.substationName) {
                    const sub = newSubstations.find((s: any) => s.name === payload.substationName);
                    if (sub) setSelectedSubstationId(sub.id);
                }
                if (payload.id) {
                    setSelectedTransformerId(payload.id);
                }
            }
        } catch (err) {
            console.error("Failed to save transformer:", err);
        }
    };

    // Delete Transformer Handler
    const handleDeleteTransformer = async (id: string) => {
        if (!confirm("Bạn có chắc chắn muốn xóa thông tin máy biến áp này?")) return;
        try {
            const res = await fetch("/api/pd-online", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "DELETE_TRANSFORMER", payload: { id } })
            });
            if (res.ok) {
                const data = await res.json();
                const newTfs = data.data.transformers || [];
                setPowerCompanies(data.data.powerCompanies || []);
                setSubstations(data.data.substations || []);
                setTransformers(newTfs);
                setRecords(data.data.records || []);
                if (selectedTransformerId === id) {
                    const nextTf = newTfs.find((t: any) => t.substationId === selectedSubstationId) || newTfs[0];
                    setSelectedTransformerId(nextTf ? nextTf.id : "");
                }
            }
        } catch (err) {
            console.error("Failed to delete transformer:", err);
        }
    };

    const handleExportExcel = () => {
        if (!currentCompany) return;
        exportPowerCompanyExcelReport(currentCompany, substations, transformers, records);
    };

    return (
        <div className="space-y-6 bg-slate-950 text-white">
            {/* Header Title Banner */}
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
                        Hệ thống giám sát phân tích ma trận PRPD $(\phi - q - n)$, thu thập tín hiệu HFCT/AE và định vị 3D vị trí khuyết tật TDOA.
                    </p>
                </div>
            </div>

            {/* View Mode Navigation Tabs */}
            <div className="flex justify-between items-center bg-slate-900/80 p-2 rounded-xl border border-slate-800">
                <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)} className="w-auto">
                    <TabsList className="bg-slate-950 border border-slate-800 text-slate-300">
                        <TabsTrigger value="dashboard" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white text-xs font-semibold">
                            <LayoutDashboard className="h-4 w-4 mr-1.5" /> Dashboard Phân tích &amp; Mô hình 3D
                        </TabsTrigger>
                        <TabsTrigger value="table" className="data-[state=active]:bg-amber-500 data-[state=active]:text-slate-950 text-xs font-bold">
                            <TableProperties className="h-4 w-4 mr-1.5" /> Danh mục MBA 110kV
                        </TabsTrigger>
                    </TabsList>
                </Tabs>

                <div className="text-xs text-slate-400 flex items-center gap-1.5">
                    <Zap className="h-4 w-4 text-amber-400" />
                    <span>Tổng số: <strong className="text-white">{transformers.length}</strong> máy biến áp 110kV</span>
                </div>
            </div>

            {viewMode === "table" ? (
                /* CRUD Data Table View matching exact yellow format from image */
                <TransformerTable
                    transformers={transformers}
                    substations={substations}
                    powerCompanies={powerCompanies}
                    onEdit={(tf) => {
                        setEditingTransformer(tf);
                        setOpenTfDialog(true);
                    }}
                    onDelete={handleDeleteTransformer}
                    onAddNew={() => {
                        setEditingTransformer(null);
                        setOpenTfDialog(true);
                    }}
                    onExportExcel={handleExportExcel}
                />
            ) : (
                /* Dashboard View */
                <>
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
                        onSelectTransformer={(id) => {
                            setSelectedTransformerId(id);
                            setSelectedRecordId(""); // Reset to latest for new transformer
                        }}
                        searchQuery={searchQuery}
                        onSearchChange={setSearchQuery}
                    />

                    {/* Main Dashboard Content Area */}
                    {currentTransformer ? (
                        <div className="space-y-6">
                            {/* Selected Transformer Specs */}
                            <TransformerSpecCard
                                transformer={currentTransformer}
                                substationName={currentSubstation?.name}
                                powerCompanyName={currentCompany?.name}
                            />

                            {/* Test Session Selector Dropdown */}
                            {currentRecords.length > 0 && (
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/90 p-3.5 rounded-xl border border-indigo-500/30 text-xs shadow-lg">
                                    <div className="flex items-center space-x-3 w-full sm:w-auto">
                                        <Calendar className="h-4 w-4 text-cyan-400 shrink-0" />
                                        <span className="font-bold text-indigo-200 whitespace-nowrap">Chọn Lần đo hiển thị:</span>
                                        <Select
                                            value={displayedRecord?.id || ""}
                                            onValueChange={(val) => setSelectedRecordId(val)}
                                        >
                                            <SelectTrigger className="w-full sm:w-80 bg-slate-950 border-indigo-500/40 text-xs text-white h-9 font-semibold">
                                                <SelectValue placeholder="Chọn đợt đo thử nghiệm" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-slate-900 border-slate-700 text-white text-xs max-h-64">
                                                {currentRecords.map((r, idx) => (
                                                    <SelectItem key={r.id} value={r.id} className="text-xs cursor-pointer focus:bg-indigo-600 focus:text-white">
                                                        <div className="flex items-center justify-between gap-3 w-full">
                                                            <span className="font-mono text-rose-300">({r.metrics?.qMaxPc} pC)</span>
                                                            <Badge className={`text-[9px] px-1.5 py-0 font-bold ${r.inspectorAssessment?.riskLevel === 'CRITICAL'
                                                                ? 'bg-red-500 text-white'
                                                                : r.inspectorAssessment?.riskLevel === 'WATCH'
                                                                    ? 'bg-amber-500 text-slate-950'
                                                                    : 'bg-emerald-600 text-white'
                                                                }`}>
                                                                {r.inspectorAssessment?.riskLevel}
                                                            </Badge>
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <span className="text-[11px] text-slate-400 italic shrink-0">
                                        Danh sách sắp xếp theo thời gian và đồng bộ với bảng Lịch sử
                                    </span>
                                </div>
                            )}

                            {displayedRecord ? (
                                <>
                                    {/* Row 1: PRPD Chart & AI vs KTV Diagnostic Box */}
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                        <div className="lg:col-span-2">
                                            <PrpdChart
                                                prpdPoints={displayedRecord.prpdPoints}
                                                metrics={displayedRecord.metrics}
                                            />
                                        </div>

                                        {/* AI & KTV Consensus Box */}
                                        <div className="space-y-4">
                                            <Card className="bg-slate-900 border-indigo-500/30 text-white shadow-xl h-full flex flex-col">
                                                <CardHeader className="pb-2 border-b border-indigo-500/20">
                                                    <CardTitle className="text-base font-bold text-indigo-300 flex items-center gap-2">
                                                        <BrainCircuit className="h-5 w-5 text-purple-400" />
                                                        Chẩn đoán AI &amp; Nhận định KTV (Lần đo: {displayedRecord.testDate})
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent className="pt-4 flex-1 flex flex-col justify-between space-y-4 text-xs">
                                                    {/* AI Suggestion */}
                                                    <div className="p-3 bg-purple-950/50 rounded-xl border border-purple-500/30 space-y-1.5">
                                                        <div className="flex justify-between items-center text-purple-300 font-bold">
                                                            <span className="flex items-center gap-1">
                                                                <BrainCircuit className="h-3.5 w-3.5" /> Chuẩn đoán tự động:
                                                            </span>
                                                            <Badge className="bg-purple-600 text-white text-[10px]">
                                                                {(displayedRecord.aiDiagnostic.confidence * 100).toFixed(1)}% tin cậy
                                                            </Badge>
                                                        </div>
                                                        <div className="text-sm font-extrabold text-white">
                                                            Dạng khuyết tật: <span className="text-amber-300">{displayedRecord.aiDiagnostic.predictedDefect}</span>
                                                        </div>
                                                        <p className="text-[11px] text-slate-300 leading-relaxed">
                                                            💡 <span className="font-semibold text-purple-300">Khuyến nghị xử lý:</span> {displayedRecord.aiDiagnostic.recommendedAction}
                                                        </p>
                                                    </div>

                                                    {/* KTV Assessment */}
                                                    <div className="p-3 bg-indigo-950/50 rounded-xl border border-indigo-500/30 space-y-1.5">
                                                        <div className="flex justify-between items-center text-indigo-300 font-bold">
                                                            <span className="flex items-center gap-1">
                                                                <UserCheck className="h-3.5 w-3.5 text-emerald-400" /> KTV Đánh giá:
                                                            </span>
                                                            <span className="text-slate-400 text-[10px]">{displayedRecord.inspectorAssessment.inspectorName}</span>
                                                        </div>
                                                        <div className="text-xs font-bold text-emerald-400">
                                                            Nhận định: {displayedRecord.inspectorAssessment.defectType} ({displayedRecord.inspectorAssessment.riskLevel})
                                                        </div>
                                                        <p className="text-[11px] text-slate-300 leading-relaxed italic">
                                                            "{displayedRecord.inspectorAssessment.notes}"
                                                        </p>
                                                    </div>

                                                    {/* Action Button: Export PDF */}
                                                    <Button
                                                        onClick={() => {
                                                            setActiveRecord(displayedRecord);
                                                            setOpenReportModal(true);
                                                        }}
                                                        className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold py-2.5 px-3 rounded-xl text-xs shadow-lg flex items-center justify-center gap-2 whitespace-normal break-words h-auto min-h-[40px] text-center"
                                                    >
                                                        <FileText className="h-4 w-4 shrink-0" />
                                                        <span className="truncate max-w-full">Xem &amp; In Biên bản PDF ({displayedRecord.testCode})</span>
                                                    </Button>
                                                </CardContent>
                                            </Card>
                                        </div>
                                    </div>

                                    {/* Row 2: 3D Acoustic Localization View */}
                                    <Transformer3DViewer
                                        tankDimensions={displayedRecord.tankDimensions}
                                        sensorsSetup={displayedRecord.sensorsSetup}
                                        localization3D={displayedRecord.localization3D}
                                        riskLevel={displayedRecord.inspectorAssessment.riskLevel}
                                    />

                                    {/* Row 3: Test History Table */}
                                    <Card className="bg-slate-900 border-indigo-500/30 text-white shadow-xl">
                                        <CardHeader className="pb-2 border-b border-indigo-500/20">
                                            <div className="flex justify-between items-center">
                                                <CardTitle className="text-base font-bold text-indigo-300 flex items-center gap-2">
                                                    <Calendar className="h-4 w-4 text-cyan-400" />
                                                    Lịch sử Các lần Thử nghiệm PD Online cho {currentTransformer.name}
                                                </CardTitle>
                                                <Button
                                                    size="sm"
                                                    onClick={() => {
                                                        setEditingRecord(null);
                                                        setOpenNewDialog(true);
                                                    }}
                                                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs h-7"
                                                >
                                                    <Plus className="h-3.5 w-3.5 mr-1" />Tạo Biên bản đo mới / Nạp CSV
                                                </Button>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="pt-3">
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-left text-xs border-collapse">
                                                    <thead>
                                                        <tr className="border-b border-slate-800 text-slate-400 font-semibold bg-slate-950/50">
                                                            <th className="p-2.5">Trạng thái</th>
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
                                                        {currentRecords.map((r) => {
                                                            const isSelected = displayedRecord?.id === r.id;
                                                            return (
                                                                <tr key={r.id} className={`border-b border-slate-800/60 transition ${isSelected ? 'bg-indigo-950/40' : 'hover:bg-slate-800/40'}`}>
                                                                    <td className="p-2.5">
                                                                        {isSelected ? (
                                                                            <Badge className="bg-indigo-600 text-white text-[10px] font-bold">Đang xem</Badge>
                                                                        ) : (
                                                                            <Button
                                                                                variant="ghost"
                                                                                size="sm"
                                                                                onClick={() => setSelectedRecordId(r.id)}
                                                                                className="h-6 text-[10px] text-slate-400 hover:text-white px-2"
                                                                            >
                                                                                Xem lần này
                                                                            </Button>
                                                                        )}
                                                                    </td>
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
                                                                        <div className="flex items-center justify-end space-x-1.5">
                                                                            <Button
                                                                                variant="ghost"
                                                                                size="sm"
                                                                                onClick={() => {
                                                                                    setActiveRecord(r);
                                                                                    setOpenReportModal(true);
                                                                                }}
                                                                                className="text-xs text-indigo-300 hover:text-white hover:bg-indigo-600/30 h-7 px-2"
                                                                                title="Xem biên bản PDF"
                                                                            >
                                                                                <FileText className="h-3.5 w-3.5 mr-1" /> Xem PDF
                                                                            </Button>
                                                                            <Button
                                                                                variant="ghost"
                                                                                size="sm"
                                                                                onClick={() => {
                                                                                    setEditingRecord(r);
                                                                                    setOpenNewDialog(true);
                                                                                }}
                                                                                className="text-xs text-cyan-400 hover:text-white hover:bg-cyan-600/30 h-7 px-2"
                                                                                title="Chỉnh sửa thông tin biên bản"
                                                                            >
                                                                                <Edit className="h-3.5 w-3.5 mr-1" /> Sửa
                                                                            </Button>
                                                                            <Button
                                                                                variant="ghost"
                                                                                size="sm"
                                                                                onClick={() => handleDeleteRecord(r.id)}
                                                                                className="text-xs text-rose-400 hover:text-white hover:bg-rose-600/30 h-7 px-2"
                                                                                title="Xóa biên bản này"
                                                                            >
                                                                                <Trash2 className="h-3.5 w-3.5 mr-1" /> Xóa
                                                                            </Button>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </>
                            ) : (
                                <Card className="bg-slate-900 border-indigo-500/20 text-center p-10 text-slate-400 shadow-xl">
                                    <Activity className="h-12 w-12 text-indigo-400 mx-auto mb-3 opacity-60 animate-pulse" />
                                    <p className="text-base font-bold text-white">Chưa có biên bản thử nghiệm PD cho máy biến áp này</p>
                                    <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                                        Nhấn nút bên dưới để nạp file dữ liệu CSV bóc tách từ thiết bị PD-TP500A hoặc nhập biên bản mới.
                                    </p>
                                    <Button
                                        onClick={() => setOpenNewDialog(true)}
                                        className="mt-5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold py-2.5 px-6 rounded-full text-xs shadow-lg shadow-indigo-600/30 flex items-center gap-2 mx-auto transition-all transform hover:scale-105"
                                    >
                                        <Plus className="h-4 w-4" />Tạo Biên bản đo mới / Nạp CSV
                                    </Button>
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
                </>
            )}

            {/* Modals & Dialogs */}
            {currentTransformer && (
                <PdTestFormDialog
                    open={openNewDialog}
                    onClose={() => {
                        setOpenNewDialog(false);
                        setEditingRecord(null);
                    }}
                    transformer={currentTransformer}
                    record={editingRecord}
                    onSubmit={handleSaveRecord}
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

            {/* Transformer CRUD Dialog */}
            <TransformerManagerDialog
                open={openTfDialog}
                onClose={() => {
                    setOpenTfDialog(false);
                    setEditingTransformer(null);
                }}
                transformer={editingTransformer}
                powerCompanies={powerCompanies}
                substations={substations}
                onSubmit={handleSaveTransformer}
            />
        </div>
    );
}
