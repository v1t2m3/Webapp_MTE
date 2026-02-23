"use client";

import { useState, useMemo } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { ReportData } from "@/types";
import { format, parseISO } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

const COLORS = ['#4361ee', '#4cc9f0', '#3a0ca3'];

export function ContractReport({ data }: { data: ReportData }) {
    const { contracts, schedules } = data;

    // Default to the first contract if available
    const [selectedContractId, setSelectedContractId] = useState<string>(contracts.length > 0 ? contracts[0].id : "");

    const selectedContract = useMemo(() => {
        return contracts.find(c => c.id === selectedContractId) || null;
    }, [contracts, selectedContractId]);

    // Filter schedules linked to the selected contract
    const linkedSchedules = useMemo(() => {
        if (!selectedContractId) return [];
        return schedules.filter(s => s.contractId === selectedContractId)
            .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
    }, [schedules, selectedContractId]);

    // KPIs
    const totalLinkedSchedules = linkedSchedules.length;

    // Format currency
    const formatCurrency = (valueStr: string | undefined) => {
        if (!valueStr) return "N/A";
        // Simple heuristic to add commas if it's just numbers
        const num = parseInt(valueStr.replace(/\D/g, ''));
        if (isNaN(num)) return valueStr;
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);
    };

    // Chart Data (Schedules by Month for this contract)
    const chartData = useMemo(() => {
        if (linkedSchedules.length === 0) return [];

        const monthMap: Record<string, number> = {};
        linkedSchedules.forEach(s => {
            if (!s.startDate) return;
            const d = new Date(s.startDate);
            const key = `T${d.getMonth() + 1}/${d.getFullYear()}`;
            monthMap[key] = (monthMap[key] || 0) + 1;
        });

        return Object.keys(monthMap).map(key => ({
            name: key,
            'Số Lịch': monthMap[key]
        }));
    }, [linkedSchedules]);

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Filters */}
            <GlassCard className="p-4 flex flex-wrap items-center gap-4">
                <div className="flex items-center space-x-2 w-full md:w-auto">
                    <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">Hợp đồng:</span>
                    <Select value={selectedContractId} onValueChange={setSelectedContractId}>
                        <SelectTrigger className="w-full md:w-[400px] bg-white border-blue-100">
                            <SelectValue placeholder="Chọn hợp đồng để xem báo cáo" />
                        </SelectTrigger>
                        <SelectContent>
                            {contracts.map(c => (
                                <SelectItem key={c.id} value={c.id}>
                                    {c.code} - {c.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {selectedContract && (
                    <div className="ml-auto flex gap-4 w-full md:w-auto mt-4 md:mt-0">
                        <div className="px-4 py-2 bg-[#4361ee]/10 text-[#4361ee] rounded-lg border border-[#4361ee]/20 flex-1 md:flex-none text-center">
                            <span className="text-xs block text-muted-foreground uppercase tracking-wider mb-1">Giá trị HĐ</span>
                            <span className="text-sm font-bold">{formatCurrency(selectedContract.value)}</span>
                        </div>
                        <div className="px-4 py-2 bg-[#f72585]/10 text-[#f72585] rounded-lg border border-[#f72585]/20 flex-1 md:flex-none text-center">
                            <span className="text-xs block text-muted-foreground uppercase tracking-wider mb-1">Số Lịch thực hiện</span>
                            <span className="text-sm font-bold">{totalLinkedSchedules}</span>
                        </div>
                    </div>
                )}
            </GlassCard>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Chart Segment - 1/3 width based on layout vibes */}
                <GlassCard className="p-6 h-[400px] lg:col-span-1 border-t-4 border-t-[#4361ee]">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Tiến độ theo Tháng</h3>
                    {chartData.length > 0 ? (
                        <div className="flex-1 w-full h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} allowDecimals={false} />
                                    <Tooltip
                                        cursor={{ fill: 'rgba(67, 97, 238, 0.05)' }}
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    />
                                    <Bar dataKey="Số Lịch" fill="#4361ee" radius={[4, 4, 0, 0]} maxBarSize={50}>
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-muted-foreground h-[250px]">
                            Chưa có dữ liệu Lịch công tác.
                        </div>
                    )}
                </GlassCard>

                {/* Data Table Segment - 2/3 width */}
                <GlassCard className="overflow-hidden lg:col-span-2 flex flex-col h-[400px]">
                    <div className="p-4 border-b bg-white/50 flex items-center justify-between">
                        <h3 className="text-lg font-bold text-gray-800">Danh sách Lịch công tác liên kết</h3>
                        {selectedContract && (
                            <Badge variant="outline" className="border-[#4361ee] text-[#4361ee] bg-[#4361ee]/5">
                                {selectedContract.code}
                            </Badge>
                        )}
                    </div>
                    <div className="overflow-y-auto flex-1">
                        <Table>
                            <TableHeader className="bg-slate-50/80 sticky top-0 z-10 backdrop-blur-sm">
                                <TableRow>
                                    <TableHead className="w-[120px] text-[#3a0ca3] font-bold">Ngày TC</TableHead>
                                    <TableHead className="w-[120px] text-[#3a0ca3] font-bold">Đơn vị</TableHead>
                                    <TableHead className="min-w-[200px] text-[#3a0ca3] font-bold">Nội dung</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {linkedSchedules.length > 0 ? (
                                    linkedSchedules.map((s) => (
                                        <TableRow key={s.id} className="hover:bg-blue-50/50 transition-colors">
                                            <TableCell className="font-medium whitespace-nowrap">
                                                {format(parseISO(s.startDate), 'dd/MM/yyyy')}
                                            </TableCell>
                                            <TableCell>
                                                <span className="font-semibold text-gray-700">{s.unit}</span>
                                            </TableCell>
                                            <TableCell>
                                                <p className="text-gray-600 line-clamp-2" title={s.content}>{s.content}</p>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={3} className="h-32 text-center text-muted-foreground">
                                            Không có Lịch công tác nào được liên kết với Hợp đồng này.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </GlassCard>
            </div>
        </div>
    );
}
