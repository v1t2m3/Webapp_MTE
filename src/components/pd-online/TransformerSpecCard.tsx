"use client";

import { Transformer110kV } from "@/types/pd-online";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, ShieldAlert, Cpu, Calendar, Activity, Factory, Wrench, Thermometer } from "lucide-react";

interface TransformerSpecCardProps {
    transformer: Transformer110kV;
    substationName?: string;
    powerCompanyName?: string;
}

export function TransformerSpecCard({ transformer, substationName, powerCompanyName }: TransformerSpecCardProps) {
    const getStatusBadge = (status: string) => {
        switch (status) {
            case "CRITICAL":
                return <Badge className="bg-red-500 hover:bg-red-600 text-white font-semibold px-3 py-1">CẢNH BÁO NGUY HIỂM</Badge>;
            case "WATCH":
                return <Badge className="bg-amber-500 hover:bg-amber-600 text-white font-semibold px-3 py-1">CHÚ Ý THEO DÕI</Badge>;
            default:
                return <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-3 py-1">BÌNH THƯỜNG</Badge>;
        }
    };

    return (
        <Card className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 border-indigo-500/30 text-white shadow-xl">
            <CardHeader className="pb-3 border-b border-indigo-500/20">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="flex items-center space-x-3">
                        <div className="p-2.5 bg-indigo-600/30 rounded-xl border border-indigo-400/30">
                            <Zap className="h-6 w-6 text-amber-400 animate-pulse" />
                        </div>
                        <div>
                            <div className="text-xs text-indigo-300 font-medium">
                                {powerCompanyName} &bull; {substationName}
                            </div>
                            <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
                                {transformer.name} <span className="text-indigo-400 text-base font-mono">({transformer.code})</span>
                            </CardTitle>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        {getStatusBadge(transformer.status)}
                    </div>
                </div>
            </CardHeader>

            <CardContent className="pt-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 text-sm">
                    <div className="bg-white/5 p-3 rounded-lg border border-white/10">
                        <div className="text-xs text-indigo-300 flex items-center gap-1.5 mb-1">
                            <Cpu className="h-3.5 w-3.5 text-indigo-400" />
                            Công suất danh định
                        </div>
                        <div className="text-base font-bold text-white">{transformer.capacityMva} MVA</div>
                    </div>

                    <div className="bg-white/5 p-3 rounded-lg border border-white/10">
                        <div className="text-xs text-indigo-300 flex items-center gap-1.5 mb-1">
                            <Zap className="h-3.5 w-3.5 text-amber-400" />
                            Tỷ số điện áp
                        </div>
                        <div className="text-base font-bold text-amber-300">{transformer.voltageRatio}</div>
                    </div>

                    <div className="bg-white/5 p-3 rounded-lg border border-white/10">
                        <div className="text-xs text-indigo-300 flex items-center gap-1.5 mb-1">
                            <Factory className="h-3.5 w-3.5 text-emerald-400" />
                            Hãng sản xuất
                        </div>
                        <div className="text-base font-bold text-white">{transformer.manufacturer}</div>
                    </div>

                    <div className="bg-white/5 p-3 rounded-lg border border-white/10">
                        <div className="text-xs text-indigo-300 flex items-center gap-1.5 mb-1">
                            <Calendar className="h-3.5 w-3.5 text-cyan-400" />
                            Năm SX / Vận hành
                        </div>
                        <div className="text-base font-bold text-white">
                            {transformer.manufacturedYear} / {transformer.commissionedYear}
                        </div>
                    </div>

                    <div className="bg-white/5 p-3 rounded-lg border border-white/10">
                        <div className="text-xs text-indigo-300 flex items-center gap-1.5 mb-1">
                            <Thermometer className="h-3.5 w-3.5 text-rose-400" />
                            Phương pháp làm mát
                        </div>
                        <div className="text-base font-bold text-white">{transformer.coolingType}</div>
                    </div>

                    <div className="bg-white/5 p-3 rounded-lg border border-white/10">
                        <div className="text-xs text-indigo-300 flex items-center gap-1.5 mb-1">
                            <Wrench className="h-3.5 w-3.5 text-purple-400" />
                            Bộ điều áp OLTC
                        </div>
                        <div className="text-base font-bold text-white">
                            {transformer.oltcType} <span className="text-xs font-normal text-indigo-300">({transformer.oltcManufacturer})</span>
                        </div>
                    </div>

                    <div className="bg-white/5 p-3 rounded-lg border border-white/10 col-span-2 sm:col-span-1">
                        <div className="text-xs text-indigo-300 flex items-center gap-1.5 mb-1">
                            <Activity className="h-3.5 w-3.5 text-emerald-400" />
                            Lần thử nghiệm gần nhất
                        </div>
                        <div className="text-base font-bold text-emerald-300">
                            {transformer.lastTestedDate || "Chưa ghi nhận"}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
