"use client";

import { useState, useMemo } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { ReportData } from "@/types";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from "recharts";
import { format, parseISO, getDaysInMonth } from "date-fns";
import { vi } from "date-fns/locale";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const COLORS = ['#4cc9f0', '#f72585', '#3a0ca3'];

export function WeeklyMonthlyReport({ data }: { data: ReportData }) {
    const { schedules } = data;

    const [selectedMonth, setSelectedMonth] = useState<string>((new Date().getMonth() + 1).toString());
    const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());

    // Filter schedules
    const filteredSchedules = useMemo(() => {
        return schedules.filter(s => {
            if (!s.startDate) return false;
            const d = new Date(s.startDate);
            return d.getMonth() + 1 === parseInt(selectedMonth) && d.getFullYear() === parseInt(selectedYear);
        }).sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
    }, [schedules, selectedMonth, selectedYear]);

    // KPIs
    const total = filteredSchedules.length;
    const cutPower = filteredSchedules.filter(s => s.type === "Cắt điện").length;
    const noCutPower = total - cutPower;

    // Chart Data (Days of month)
    const chartData = useMemo(() => {
        const daysInMonth = getDaysInMonth(new Date(parseInt(selectedYear), parseInt(selectedMonth) - 1));
        const days = Array.from({ length: daysInMonth }, (_, i) => ({
            day: (i + 1).toString(),
            'Lịch công tác': 0
        }));

        filteredSchedules.forEach(s => {
            const d = new Date(s.startDate);
            const dayIndex = d.getDate() - 1;
            if (days[dayIndex]) {
                days[dayIndex]['Lịch công tác'] += 1;
            }
        });

        return days;
    }, [filteredSchedules, selectedMonth, selectedYear]);

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Filters */}
            <GlassCard className="p-4 flex flex-wrap items-center gap-4">
                <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-muted-foreground w-16">Tháng:</span>
                    <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                        <SelectTrigger className="w-[120px] bg-white border-blue-100">
                            <SelectValue placeholder="Chọn tháng" />
                        </SelectTrigger>
                        <SelectContent>
                            {Array.from({ length: 12 }, (_, i) => (
                                <SelectItem key={i + 1} value={(i + 1).toString()}>Tháng {i + 1}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-muted-foreground w-16">Năm:</span>
                    <Select value={selectedYear} onValueChange={setSelectedYear}>
                        <SelectTrigger className="w-[120px] bg-white border-blue-100">
                            <SelectValue placeholder="Chọn năm" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="2025">2025</SelectItem>
                            <SelectItem value="2026">2026</SelectItem>
                            <SelectItem value="2027">2027</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="ml-auto flex gap-4">
                    <div className="px-4 py-2 bg-[#3a0ca3]/10 text-[#3a0ca3] rounded-lg border border-[#3a0ca3]/20">
                        <span className="text-sm font-bold">Tổng số: {total}</span>
                    </div>
                    <div className="px-4 py-2 bg-[#f72585]/10 text-[#f72585] rounded-lg border border-[#f72585]/20">
                        <span className="text-sm font-bold">Cắt điện: {cutPower}</span>
                    </div>
                </div>
            </GlassCard>

            {/* Chart */}
            <GlassCard className="p-6 h-[350px]">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Biểu đồ Lịch công tác theo Ngày</h3>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} allowDecimals={false} />
                        <Tooltip
                            cursor={{ fill: 'rgba(58, 12, 163, 0.05)' }}
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        />
                        <Bar dataKey="Lịch công tác" fill="#4cc9f0" radius={[4, 4, 0, 0]}>
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry['Lịch công tác'] > 0 ? '#4cc9f0' : '#e2e8f0'} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </GlassCard>

            {/* Data Table */}
            <GlassCard className="overflow-hidden">
                <div className="p-4 border-b bg-white/50">
                    <h3 className="text-lg font-bold text-gray-800">Chi tiết Lịch công tác</h3>
                </div>
                <div className="overflow-x-auto max-h-[400px]">
                    <Table>
                        <TableHeader className="bg-slate-50/80 sticky top-0 z-10 backdrop-blur-sm">
                            <TableRow>
                                <TableHead className="w-[120px] text-[#3a0ca3] font-bold">Ngày TC</TableHead>
                                <TableHead className="w-[150px] text-[#3a0ca3] font-bold">Đơn vị</TableHead>
                                <TableHead className="min-w-[300px] text-[#3a0ca3] font-bold">Nội dung</TableHead>
                                <TableHead className="w-[150px] text-[#3a0ca3] font-bold">Loại hình</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredSchedules.length > 0 ? (
                                filteredSchedules.map((s) => (
                                    <TableRow key={s.id} className="hover:bg-blue-50/50 transition-colors">
                                        <TableCell className="font-medium">
                                            {format(parseISO(s.startDate), 'dd/MM/yyyy')}
                                        </TableCell>
                                        <TableCell>
                                            <span className="font-semibold text-gray-700">{s.unit}</span>
                                        </TableCell>
                                        <TableCell className="max-w-[400px]">
                                            <p className="truncate text-gray-600" title={s.content}>{s.content}</p>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={s.type === 'Cắt điện' ? 'destructive' : 'default'}
                                                className={s.type === 'Cắt điện' ? 'bg-[#f72585]' : 'bg-[#4cc9f0]'}
                                            >
                                                {s.type}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                                        Không có lịch công tác nào trong tháng này.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </GlassCard>
        </div>
    );
}
