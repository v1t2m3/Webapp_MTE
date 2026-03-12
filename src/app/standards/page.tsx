"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, ExternalLink, BookOpen, Globe, Building2, Shield } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Standard = {
    code: string;
    name: string;
    category: "TCVN" | "IEC" | "IEEE" | "ANSI" | "ISO" | "QCVN";
    scope: string;
    link?: string;
};

const STANDARDS: Standard[] = [
    // TCVN
    { code: "TCVN 6306-1:2015", name: "Máy biến áp điện lực – Phần 1: Yêu cầu chung", category: "TCVN", scope: "Máy biến áp" },
    { code: "TCVN 6306-2:2006", name: "Máy biến áp điện lực – Phần 2: Nhiệt độ tăng thêm", category: "TCVN", scope: "Máy biến áp" },
    { code: "TCVN 6306-3:2006", name: "Máy biến áp điện lực – Phần 3: Mức cách điện, thử nghiệm điện môi", category: "TCVN", scope: "Máy biến áp" },
    { code: "TCVN 6306-5:2006", name: "Máy biến áp điện lực – Phần 5: Khả năng chịu ngắn mạch", category: "TCVN", scope: "Máy biến áp" },
    { code: "TCVN 6306-10:2013", name: "Máy biến áp điện lực – Phần 10: Xác định mức tiếng ồn", category: "TCVN", scope: "Máy biến áp" },
    { code: "TCVN 7998:2009", name: "Máy cắt điện xoay chiều cao áp", category: "TCVN", scope: "Máy cắt" },
    { code: "TCVN 7921-3:2008", name: "Phân cấp điều kiện môi trường – Phần 3: Nhóm tác nhân", category: "TCVN", scope: "Môi trường" },
    { code: "TCVN 8092:2009", name: "Chống sét van", category: "TCVN", scope: "Chống sét" },
    { code: "TCVN 5926-1:2007", name: "Cáp điện – Phần 1: Cáp có cách điện PVC", category: "TCVN", scope: "Cáp điện" },
    { code: "TCVN 5935-1:2013", name: "Cáp điện – Phần 1: Cáp điều khiển", category: "TCVN", scope: "Cáp điện" },
    { code: "TCVN 8086:2009", name: "Trang bị đóng cắt và điều khiển cao áp", category: "TCVN", scope: "Đóng cắt" },
    { code: "TCVN 7994-1:2009", name: "Trang bị đóng cắt và điều khiển hạ áp", category: "TCVN", scope: "Đóng cắt" },
    { code: "TCVN 7995:2009", name: "Biến dòng điện", category: "TCVN", scope: "Biến dòng" },
    { code: "TCVN 7996:2009", name: "Biến điện áp", category: "TCVN", scope: "Biến áp đo lường" },
    // IEC
    { code: "IEC 60076-1", name: "Power transformers – Part 1: General", category: "IEC", scope: "Máy biến áp" },
    { code: "IEC 60076-3", name: "Power transformers – Part 3: Insulation levels, dielectric tests", category: "IEC", scope: "Máy biến áp" },
    { code: "IEC 60076-5", name: "Power transformers – Part 5: Ability to withstand short circuit", category: "IEC", scope: "Máy biến áp" },
    { code: "IEC 60137", name: "Insulated bushings for alternating voltages above 1000V", category: "IEC", scope: "Sứ xuyên" },
    { code: "IEC 60270", name: "High-voltage test techniques – Partial discharge measurements", category: "IEC", scope: "Phóng điện cục bộ" },
    { code: "IEC 60502", name: "Power cables with extruded insulation (1kV ~ 30kV)", category: "IEC", scope: "Cáp điện" },
    { code: "IEC 60060-1", name: "High-voltage test techniques – General definitions and test requirements", category: "IEC", scope: "Thử nghiệm cao áp" },
    { code: "IEC 62271-100", name: "High-voltage switchgear – AC circuit breakers", category: "IEC", scope: "Máy cắt" },
    { code: "IEC 62271-200", name: "AC metal-enclosed switchgear (1kV ~ 52kV)", category: "IEC", scope: "Tủ trung thế" },
    { code: "IEC 60099-4", name: "Surge arresters – Metal-oxide type", category: "IEC", scope: "Chống sét" },
    // IEEE
    { code: "IEEE C57.12.90", name: "Test Code for Liquid-Immersed Distribution, Power, and Regulating Transformers", category: "IEEE", scope: "Máy biến áp" },
    { code: "IEEE C57.12.00", name: "General Requirements for Liquid-Immersed Distribution, Power, and Regulating Transformers", category: "IEEE", scope: "Máy biến áp" },
    { code: "IEEE C57.152", name: "Guide for Diagnostic Field Testing of Fluid-Filled Power Transformers", category: "IEEE", scope: "Máy biến áp" },
    { code: "IEEE C62.11", name: "Standard for Metal-Oxide Surge Arresters for AC Power Circuits", category: "IEEE", scope: "Chống sét" },
    { code: "IEEE 62", name: "Guide for Diagnostic Field Testing of Electric Power Apparatus – Insulation", category: "IEEE", scope: "Cách điện" },
    // ISO
    { code: "ISO 17025:2017", name: "Yêu cầu chung về năng lực của phòng thử nghiệm và hiệu chuẩn", category: "ISO", scope: "Hệ thống QL" },
    { code: "ISO 9001:2015", name: "Hệ thống quản lý chất lượng – Các yêu cầu", category: "ISO", scope: "Hệ thống QL" },
    // QCVN
    { code: "QCVN 01:2020/BCT", name: "Quy chuẩn kỹ thuật quốc gia về an toàn điện", category: "QCVN", scope: "An toàn điện" },
    { code: "QCVN QTĐ-5:2009/BCT", name: "Quy phạm trang bị điện – Phần V: Kiểm tra và thử nghiệm thiết bị", category: "QCVN", scope: "Thử nghiệm" },
];

const CATEGORY_META: Record<string, { label: string; color: string; icon: typeof BookOpen }> = {
    TCVN: { label: "TCVN", color: "bg-blue-500/10 text-blue-400 border-blue-500/50 shadow-[0_0_10px_rgba(59,130,246,0.2)]", icon: BookOpen },
    IEC: { label: "IEC", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.2)]", icon: Globe },
    IEEE: { label: "IEEE", color: "bg-amber-500/10 text-amber-400 border-amber-500/50 shadow-[0_0_10px_rgba(245,158,11,0.2)]", icon: Globe },
    ANSI: { label: "ANSI", color: "bg-orange-500/10 text-orange-400 border-orange-500/50 shadow-[0_0_10px_rgba(249,115,22,0.2)]", icon: Globe },
    ISO: { label: "ISO", color: "bg-cyan-500/10 text-cyan-400 border-cyan-500/50 shadow-[0_0_10px_rgba(6,182,212,0.2)]", icon: Shield },
    QCVN: { label: "QCVN", color: "bg-red-500/10 text-red-400 border-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.2)]", icon: Building2 },
};

export default function StandardsPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [filterCategory, setFilterCategory] = useState<string>("all");

    const filtered = useMemo(() => {
        return STANDARDS.filter(s => {
            const matchSearch = !searchTerm ||
                s.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                s.scope.toLowerCase().includes(searchTerm.toLowerCase());
            const matchCategory = filterCategory === "all" || s.category === filterCategory;
            return matchSearch && matchCategory;
        });
    }, [searchTerm, filterCategory]);

    const grouped = useMemo(() => {
        const groups: Record<string, Standard[]> = {};
        filtered.forEach(s => {
            if (!groups[s.category]) groups[s.category] = [];
            groups[s.category].push(s);
        });
        return groups;
    }, [filtered]);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight text-slate-800 dark:text-slate-200">
                    Tiêu chuẩn Thử nghiệm Điện
                </h2>
            </div>

            <p className="text-slate-500 dark:text-slate-400 text-sm max-w-2xl">
                Danh mục các tiêu chuẩn Việt Nam (TCVN, QCVN) và quốc tế (IEC, IEEE, ISO) áp dụng trong lĩnh vực thử nghiệm thiết bị điện tại Xí nghiệp Thí nghiệm Điện miền Trung (MTE).
            </p>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {Object.entries(CATEGORY_META).map(([key, meta]) => {
                    const count = STANDARDS.filter(s => s.category === key).length;
                    const Icon = meta.icon;
                    return (
                        <button
                            key={key}
                            onClick={() => setFilterCategory(filterCategory === key ? "all" : key)}
                            className={`bg-white dark:bg-slate-900 rounded-xl border p-4 shadow-sm flex items-center justify-between transition-all duration-200 hover:scale-[1.02] cursor-pointer ${filterCategory === key
                                    ? "border-[#4cc9f0] ring-1 ring-[#4cc9f0]/30"
                                    : "border-slate-200 dark:border-slate-800"
                                }`}
                        >
                            <div className="text-left">
                                <p className="text-xs font-medium text-slate-500 mb-0.5">{meta.label}</p>
                                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">{count}</h3>
                            </div>
                            <div className={`p-2 rounded-full ${meta.color.split(' ').slice(0, 1).join(' ')}`}>
                                <Icon className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Search & Filter */}
            <div className="flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
                    <Input
                        placeholder="Tìm theo mã, tên tiêu chuẩn, lĩnh vực..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                    />
                </div>
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger className="w-full md:w-[200px] bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100">
                        <SelectValue placeholder="Loại tiêu chuẩn" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                        <SelectItem value="all">Tất cả ({STANDARDS.length})</SelectItem>
                        {Object.entries(CATEGORY_META).map(([key, meta]) => (
                            <SelectItem key={key} value={key}>{meta.label} ({STANDARDS.filter(s => s.category === key).length})</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Standards grouped by category */}
            <div className="space-y-6">
                {Object.entries(grouped).map(([category, items]) => {
                    const meta = CATEGORY_META[category];
                    return (
                        <div key={category}>
                            <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                                <Badge variant="outline" className={`font-medium ${meta.color}`}>{meta.label}</Badge>
                                <span className="text-sm font-normal text-slate-500">({items.length} tiêu chuẩn)</span>
                            </h3>
                            <div className="rounded-xl border border-slate-200 bg-white/70 backdrop-blur-md dark:bg-slate-900/50 dark:border-slate-800 shadow-sm overflow-hidden">
                                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {items.map((standard) => (
                                        <div key={standard.code} className="flex items-center justify-between px-5 py-3.5 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-all duration-200">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-3">
                                                    <span className="font-mono text-sm font-semibold text-[#4cc9f0] whitespace-nowrap">{standard.code}</span>
                                                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                                                        {standard.scope}
                                                    </Badge>
                                                </div>
                                                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 truncate">{standard.name}</p>
                                            </div>
                                            {standard.link && (
                                                <a
                                                    href={standard.link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="ml-3 inline-flex items-center justify-center h-8 w-8 text-[#4cc9f0] bg-[#4cc9f0]/5 hover:bg-[#4cc9f0]/20 rounded-md border border-[#4cc9f0]/30 hover:border-[#4cc9f0]/80 shadow-[0_0_8px_rgba(76,201,240,0.15)] hover:shadow-[0_0_12px_rgba(76,201,240,0.4)] transition-all"
                                                    title="Xem tiêu chuẩn"
                                                >
                                                    <ExternalLink className="h-4 w-4" />
                                                </a>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    );
                })}

                {Object.keys(grouped).length === 0 && (
                    <div className="text-center py-16 text-slate-500">
                        Không tìm thấy tiêu chuẩn phù hợp.
                    </div>
                )}
            </div>

            <div className="text-sm text-slate-500 dark:text-slate-400">
                Hiển thị {filtered.length} / {STANDARDS.length} tiêu chuẩn
            </div>
        </div>
    );
}
