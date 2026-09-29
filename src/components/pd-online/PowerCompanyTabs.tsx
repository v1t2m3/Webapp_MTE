"use client";

import { PowerCompany, Substation110kV, Transformer110kV } from "@/types/pd-online";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2, Landmark, Zap, Search } from "lucide-react";

interface PowerCompanyTabsProps {
    powerCompanies: PowerCompany[];
    substations: Substation110kV[];
    transformers: Transformer110kV[];
    selectedCompanyId: string;
    selectedSubstationId: string;
    selectedTransformerId: string;
    onSelectCompany: (companyId: string) => void;
    onSelectSubstation: (substationId: string) => void;
    onSelectTransformer: (transformerId: string) => void;
    searchQuery: string;
    onSearchChange: (query: string) => void;
}

export function PowerCompanyTabs({
    powerCompanies,
    substations,
    transformers,
    selectedCompanyId,
    selectedSubstationId,
    selectedTransformerId,
    onSelectCompany,
    onSelectSubstation,
    onSelectTransformer,
    searchQuery,
    onSearchChange
}: PowerCompanyTabsProps) {
    const filteredSubstations = substations.filter(s => s.powerCompanyId === selectedCompanyId);
    const filteredTransformers = transformers.filter(t => t.substationId === selectedSubstationId);

    return (
        <div className="space-y-4 bg-slate-900/90 p-4 rounded-xl border border-indigo-500/20 text-white shadow-lg">
            {/* Top Section: 2 Select Dropdowns (Company & Substation) + Search Box */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                {/* Dropdown 1: Power Company */}
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                        <Building2 className="h-4 w-4 text-indigo-400" /> Đơn vị Điện lực:
                    </label>
                    <Select value={selectedCompanyId} onValueChange={onSelectCompany}>
                        <SelectTrigger className="bg-slate-950 border-slate-700 text-xs text-white h-9 font-semibold hover:border-indigo-500/50 transition">
                            <SelectValue placeholder="Chọn Công ty Điện lực" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-900 border-slate-700 text-white text-xs max-h-60">
                            {powerCompanies.map(pc => (
                                <SelectItem key={pc.id} value={pc.id} className="text-xs focus:bg-indigo-600 focus:text-white cursor-pointer">
                                    {pc.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Dropdown 2: Substation 110kV */}
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                        <Landmark className="h-4 w-4 text-cyan-400" /> Trạm biến áp 110kV:
                    </label>
                    <Select
                        value={selectedSubstationId}
                        onValueChange={onSelectSubstation}
                        disabled={filteredSubstations.length === 0}
                    >
                        <SelectTrigger className="bg-slate-950 border-slate-700 text-xs text-white h-9 font-semibold hover:border-cyan-500/50 transition disabled:opacity-50">
                            <SelectValue placeholder={filteredSubstations.length === 0 ? "Không có trạm 110kV" : "Chọn Trạm biến áp 110kV"} />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-900 border-slate-700 text-white text-xs max-h-60">
                            {filteredSubstations.map(sub => (
                                <SelectItem key={sub.id} value={sub.id} className="text-xs focus:bg-cyan-600 focus:text-white cursor-pointer">
                                    {sub.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Search Filter Box */}
                <div className="space-y-1.5 relative">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Search className="h-4 w-4 text-slate-400" /> Tìm kiếm Trạm / MBA:
                    </label>
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                        <Input
                            type="text"
                            placeholder="Nhập tên Trạm hoặc MBA..."
                            value={searchQuery}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="pl-9 bg-slate-950 border-slate-700 text-slate-200 placeholder:text-slate-500 h-9 text-xs"
                        />
                    </div>
                    {/* Instant Search Results Dropdown */}
                    {searchQuery.trim().length > 1 && (
                        <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-slate-900 border border-indigo-500/40 rounded-xl shadow-2xl overflow-hidden max-h-60 overflow-y-auto">
                            {(() => {
                                const q = searchQuery.toLowerCase().trim();
                                const matchedTfs = transformers.filter(t => {
                                    const sub = substations.find(s => s.id === t.substationId);
                                    const comp = sub ? powerCompanies.find(c => c.id === sub.powerCompanyId) : null;
                                    return (
                                        t.name.toLowerCase().includes(q) ||
                                        t.code.toLowerCase().includes(q) ||
                                        t.id.toLowerCase().includes(q) ||
                                        (sub && sub.name.toLowerCase().includes(q)) ||
                                        (comp && comp.name.toLowerCase().includes(q)) ||
                                        (t.manufacturer && t.manufacturer.toLowerCase().includes(q))
                                    );
                                });

                                if (matchedTfs.length === 0) {
                                    return <div className="p-3 text-xs text-slate-400 italic text-center">Không tìm thấy Máy biến áp nào khớp</div>;
                                }

                                return matchedTfs.map(t => {
                                    const sub = substations.find(s => s.id === t.substationId);
                                    const comp = sub ? powerCompanies.find(c => c.id === sub.powerCompanyId) : null;
                                    return (
                                        <div
                                            key={t.id}
                                            onClick={() => {
                                                if (comp) onSelectCompany(comp.id);
                                                if (sub) onSelectSubstation(sub.id);
                                                onSelectTransformer(t.id);
                                                onSearchChange("");
                                            }}
                                            className="p-2.5 hover:bg-indigo-950/70 cursor-pointer border-b border-slate-800 last:border-b-0 text-xs flex items-center justify-between transition"
                                        >
                                            <div>
                                                <div className="font-bold text-white flex items-center gap-1.5">
                                                    <Zap className="h-3 w-3 text-amber-400" /> {t.name} ({t.code})
                                                </div>
                                                <div className="text-[11px] text-indigo-300">
                                                    {comp?.name || "Điện lực"} &bull; {sub?.name || "Trạm biến áp"}
                                                </div>
                                            </div>
                                            <Badge className="text-[9px] bg-slate-800 text-slate-200">{t.capacityMva}MVA</Badge>
                                        </div>
                                    );
                                });
                            })()}
                        </div>
                    )}
                </div>
            </div>

            {/* Bottom Section: Operating Transformer (MBA) Selection Tabs */}
            <div className="flex items-center space-x-2 overflow-x-auto pt-3 border-t border-slate-800/80 scrollbar-none">
                <span className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5 whitespace-nowrap mr-2 shrink-0">
                    <Zap className="h-4 w-4 text-amber-400" /> Máy biến áp vận hành (MBA):
                </span>
                {filteredTransformers.length === 0 ? (
                    <span className="text-xs text-slate-500 italic">Chưa có máy biến áp nào thuộc trạm này</span>
                ) : (
                    filteredTransformers.map(tf => (
                        <button
                            key={tf.id}
                            onClick={() => onSelectTransformer(tf.id)}
                            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 border shrink-0 ${
                                selectedTransformerId === tf.id
                                    ? "bg-amber-500 border-amber-400 text-slate-950 shadow-md shadow-amber-500/30 scale-105"
                                    : "bg-slate-950 border-slate-800 text-slate-200 hover:bg-slate-800"
                            }`}
                        >
                            <Zap className="h-3.5 w-3.5" />
                            {tf.code} - {tf.capacityMva}MVA
                            {tf.status === "CRITICAL" && <Badge className="bg-red-500 text-white text-[9px] px-1 py-0 font-bold">NGUY HIỂM</Badge>}
                            {tf.status === "WATCH" && <Badge className="bg-amber-600 text-white text-[9px] px-1 py-0 font-bold">CHÚ Ý</Badge>}
                            {tf.status === "NORMAL" && <Badge className="bg-emerald-600 text-white text-[9px] px-1 py-0 font-bold">BÌNH THƯỜNG</Badge>}
                        </button>
                    ))
                )}
            </div>
        </div>
    );
}
