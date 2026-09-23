"use client";

import { Transformer110kV, Substation110kV, PowerCompany } from "@/types/pd-online";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Plus, Zap, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";

interface TransformerTableProps {
    transformers: Transformer110kV[];
    substations: Substation110kV[];
    powerCompanies: PowerCompany[];
    onEdit: (transformer: Transformer110kV) => void;
    onDelete: (id: string) => void;
    onAddNew: () => void;
}

export function TransformerTable({
    transformers,
    substations,
    powerCompanies,
    onEdit,
    onDelete,
    onAddNew
}: TransformerTableProps) {
    const [search, setSearch] = useState("");

    const getFullTransformer = (t: Transformer110kV) => {
        const sub = substations.find(s => s.id === t.substationId);
        const comp = sub ? powerCompanies.find(c => c.id === sub.powerCompanyId) : null;

        return {
            ...t,
            powerCompanyName: comp ? comp.name : (t.powerCompanyName || "Công ty Điện lực Đà Nẵng"),
            substationName: sub ? sub.name : (t.substationName || "TBA 110kV Liên Chiểu")
        };
    };

    const fullTransformers = transformers.map(getFullTransformer);

    const searchLower = search.toLowerCase().trim();
    const filtered = fullTransformers.filter(t => {
        if (!searchLower) return true;
        return (
            t.code.toLowerCase().includes(searchLower) ||
            t.name.toLowerCase().includes(searchLower) ||
            t.powerCompanyName.toLowerCase().includes(searchLower) ||
            t.substationName.toLowerCase().includes(searchLower) ||
            t.id.toLowerCase().includes(searchLower) ||
            t.manufacturer.toLowerCase().includes(searchLower) ||
            (t.oltcManufacturer && t.oltcManufacturer.toLowerCase().includes(searchLower)) ||
            (t.oltcType && t.oltcType.toLowerCase().includes(searchLower)) ||
            (t.coolingType && t.coolingType.toLowerCase().includes(searchLower)) ||
            (t.voltageRatio && t.voltageRatio.toLowerCase().includes(searchLower)) ||
            (t.pdTestType && t.pdTestType.toLowerCase().includes(searchLower)) ||
            t.manufacturedYear.toString().includes(searchLower) ||
            t.commissionedYear.toString().includes(searchLower) ||
            t.capacityMva.toString().includes(searchLower)
        );
    });

    const getpdTestTypeBadge = (type?: string) => {
        switch (type) {
            case "Sự cố":
                return <Badge className="bg-red-500 text-white text-[10px] font-semibold px-2 py-0.5">Sự cố</Badge>;
            case "Sửa chữa":
                return <Badge className="bg-purple-600 text-white text-[10px] font-semibold px-2 py-0.5">Sửa chữa</Badge>;
            case "Lần đầu":
                return <Badge className="bg-cyan-600 text-white text-[10px] font-semibold px-2 py-0.5">Lần đầu</Badge>;
            default:
                return <Badge className="bg-emerald-600 text-white text-[10px] font-semibold px-2 py-0.5">Định kỳ</Badge>;
        }
    };

    return (
        <div className="space-y-3 bg-slate-900/90 p-4 rounded-xl border border-amber-500/20 shadow-xl">
            {/* Table Action Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800">
                <div className="flex items-center space-x-2">
                    <Zap className="h-5 w-5 text-amber-400" />
                    <h3 className="text-base font-bold text-white">
                        Danh mục Bảng Dữ liệu Quản lý Máy biến áp 110kV
                    </h3>
                    <span className="text-xs text-slate-400 font-mono">({filtered.length} máy)</span>
                </div>

                <div className="flex items-center space-x-3">
                    <div className="relative w-72">
                        <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                        <Input
                            type="text"
                            placeholder="Lọc theo tên, hãng SX, năm SX/VH..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-8 h-8 text-xs bg-slate-950 border-slate-700 text-white"
                        />
                    </div>
                    <Button
                        onClick={onAddNew}
                        className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs h-8 shadow-md"
                    >
                        <Plus className="h-3.5 w-3.5 mr-1" /> Thêm MBA mới
                    </Button>
                </div>
            </div>

            {/* Excel-like Data Table with Yellow Format */}
            <div className="overflow-x-auto rounded-lg border border-slate-800">
                <table className="w-full text-left text-xs border-collapse">
                    <thead>
                        {/* Yellow Header 14 Columns as requested in attached image */}
                        <tr className="bg-yellow-400 text-slate-950 font-bold border-b border-yellow-500 text-[11px]">
                            <th className="p-2 border-r border-yellow-500/60 min-w-[130px]">ID</th>
                            <th className="p-2 border-r border-yellow-500/60 min-w-[160px]">Công ty Điện lực</th>
                            <th className="p-2 border-r border-yellow-500/60 min-w-[150px]">Trạm biến áp</th>
                            <th className="p-2 border-r border-yellow-500/60 min-w-[110px]">Ký hiệu vận hành</th>
                            <th className="p-2 border-r border-yellow-500/60 min-w-[90px] text-center">Công suất</th>
                            <th className="p-2 border-r border-yellow-500/60 min-w-[120px]">Tỉ số điện áp</th>
                            <th className="p-2 border-r border-yellow-500/60 min-w-[130px]">Phương pháp làm mát</th>
                            <th className="p-2 border-r border-yellow-500/60 min-w-[130px]">Hãng sản xuất MBA</th>
                            <th className="p-2 border-r border-yellow-500/60 min-w-[80px]">OLTC</th>
                            <th className="p-2 border-r border-yellow-500/60 min-w-[130px]">Hãng sản xuất OLTC</th>
                            <th className="p-2 border-r border-yellow-500/60 min-w-[90px] text-center">Năm sản xuất</th>
                            <th className="p-2 border-r border-yellow-500/60 min-w-[90px] text-center">Năm vận hành</th>
                            <th className="p-2 border-r border-yellow-500/60 min-w-[130px] text-center">Lần PD online gần nhất</th>
                            <th className="p-2 border-r border-yellow-500/60 min-w-[140px] text-center">Tính chất PD online</th>
                            <th className="p-2 text-center min-w-[100px]">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 bg-slate-950/60">
                        {filtered.length === 0 ? (
                            <tr>
                                <td colSpan={15} className="p-6 text-center text-slate-400">
                                    Không có dữ liệu máy biến áp nào phù hợp.
                                </td>
                            </tr>
                        ) : (
                            filtered.map((tf) => (
                                <tr key={tf.id} className="hover:bg-slate-800/50 transition">
                                    <td className="p-2.5 font-mono text-amber-300 font-semibold border-r border-slate-800">{tf.id}</td>
                                    <td className="p-2.5 text-slate-200 border-r border-slate-800">{tf.powerCompanyName}</td>
                                    <td className="p-2.5 text-slate-200 border-r border-slate-800">{tf.substationName}</td>
                                    <td className="p-2.5 font-bold text-white border-r border-slate-800">{tf.code}</td>
                                    <td className="p-2.5 text-center font-bold text-amber-400 border-r border-slate-800">{tf.capacityMva}</td>
                                    <td className="p-2.5 text-slate-300 border-r border-slate-800">{tf.voltageRatio}</td>
                                    <td className="p-2.5 text-slate-300 border-r border-slate-800">{tf.coolingType}</td>
                                    <td className="p-2.5 text-slate-200 font-semibold border-r border-slate-800">{tf.manufacturer}</td>
                                    <td className="p-2.5 text-slate-300 border-r border-slate-800">{tf.oltcType}</td>
                                    <td className="p-2.5 text-slate-300 border-r border-slate-800">{tf.oltcManufacturer}</td>
                                    <td className="p-2.5 text-center text-slate-300 border-r border-slate-800">{tf.manufacturedYear}</td>
                                    <td className="p-2.5 text-center text-slate-300 border-r border-slate-800">{tf.commissionedYear}</td>
                                    <td className="p-2.5 text-center font-mono text-emerald-400 border-r border-slate-800">{tf.lastTestedDate || "14/05/2025"}</td>
                                    <td className="p-2.5 text-center border-r border-slate-800">
                                        {getpdTestTypeBadge(tf.pdTestType)}
                                    </td>
                                    <td className="p-2.5 text-center">
                                        <div className="flex items-center justify-center space-x-1">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => onEdit(tf)}
                                                className="h-7 w-7 p-0 text-cyan-400 hover:text-white hover:bg-cyan-600/30"
                                                title="Sửa máy biến áp"
                                            >
                                                <Edit className="h-3.5 w-3.5" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => onDelete(tf.id)}
                                                className="h-7 w-7 p-0 text-rose-400 hover:text-white hover:bg-rose-600/30"
                                                title="Xóa máy biến áp"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
