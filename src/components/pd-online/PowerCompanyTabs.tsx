"use client";

import { PowerCompany, Substation110kV, Transformer110kV } from "@/types/pd-online";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
            {/* Top Bar: Power Company Tabs & Search */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                <div className="flex items-center space-x-2 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
                    <span className="text-xs font-semibold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5 whitespace-nowrap mr-2">
                        <Building2 className="h-4 w-4 text-indigo-400" /> Đơn vị Điện lực:
                    </span>
                    {powerCompanies.map(pc => (
                        <button
                            key={pc.id}
                            onClick={() => onSelectCompany(pc.id)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${selectedCompanyId === pc.id
                                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                                    : "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
                                }`}
                        >
                            <Building2 className="h-3.5 w-3.5" />
                            {pc.name}
                        </button>
                    ))}
                </div>

                <div className="relative w-full lg:w-64">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                    <Input
                        type="text"
                        placeholder="Tìm kiếm Trạm / MBA..."
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="pl-9 bg-slate-950 border-slate-700 text-slate-200 placeholder:text-slate-500 h-9 text-xs"
                    />
                </div>
            </div>

            {/* Middle Bar: Substation Selector */}
            <div className="flex items-center space-x-2 overflow-x-auto pb-1 border-t border-slate-800 pt-3">
                <span className="text-xs font-semibold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5 whitespace-nowrap mr-2">
                    <Landmark className="h-4 w-4 text-cyan-400" /> Trạm 110kV:
                </span>
                {filteredSubstations.length === 0 ? (
                    <span className="text-xs text-slate-500 italic">Không có trạm 110kV</span>
                ) : (
                    filteredSubstations.map(sub => (
                        <button
                            key={sub.id}
                            onClick={() => onSelectSubstation(sub.id)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${selectedSubstationId === sub.id
                                    ? "bg-cyan-600 text-white shadow-md shadow-cyan-600/30"
                                    : "bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white"
                                }`}
                        >
                            <Landmark className="h-3.5 w-3.5" />
                            {sub.name}
                        </button>
                    ))
                )}
            </div>

            {/* Bottom Bar: Transformer Selector (T1, T2, T3...) */}
            <div className="flex items-center space-x-2 overflow-x-auto pt-2 border-t border-slate-800/80">
                <span className="text-xs font-semibold text-amber-300 uppercase tracking-wider flex items-center gap-1.5 whitespace-nowrap mr-2">
                    <Zap className="h-4 w-4 text-amber-400" /> Máy biến áp (MBA):
                </span>
                {filteredTransformers.length === 0 ? (
                    <span className="text-xs text-slate-500 italic">Không có máy biến áp</span>
                ) : (
                    filteredTransformers.map(tf => (
                        <button
                            key={tf.id}
                            onClick={() => onSelectTransformer(tf.id)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 border ${selectedTransformerId === tf.id
                                    ? "bg-amber-500 border-amber-400 text-slate-950 shadow-md shadow-amber-500/30"
                                    : "bg-slate-950 border-slate-800 text-slate-200 hover:bg-slate-800"
                                }`}
                        >
                            <Zap className="h-3.5 w-3.5" />
                            {tf.code} - {tf.capacityMva}MVA
                            {tf.status === "CRITICAL" && <Badge className="bg-red-500 text-white text-[9px] px-1 py-0">NGUY HIỂM</Badge>}
                            {tf.status === "WATCH" && <Badge className="bg-amber-600 text-white text-[9px] px-1 py-0">CHÚ Ý</Badge>}
                        </button>
                    ))
                )}
            </div>
        </div>
    );
}
