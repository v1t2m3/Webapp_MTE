"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { ReportData } from "@/types";
import {
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
    BarChart, Bar, XAxis, YAxis, CartesianGrid
} from "recharts";
import { Calendar, Briefcase, Users, Zap } from "lucide-react";

const COLORS = ['#3a0ca3', '#4cc9f0', '#f72585', '#4361ee', '#7209b7', '#f8961e', '#f9c74f', '#90be6d'];

export function OverviewReport({ data }: { data: ReportData }) {
    const { schedules, contracts, workOutlines, personnel } = data;

    // --- KPI CALCULATION FOR CURRENT MONTH ---
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const currentMonthSchedules = schedules.filter(s => {
        if (!s.startDate) return false;
        const d = new Date(s.startDate);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    const totalSchedules = currentMonthSchedules.length;
    const cutPowerSchedules = currentMonthSchedules.filter(s => s.type === "Cắt điện").length;

    // Active contracts loosely based on end date (or just total if no end date logic)
    // We'll just show total contracts for now to make it look full.
    const activeContracts = contracts.length;

    // Total unique personnel deployed this month
    const currentMonthWorkOutlines = workOutlines.filter(wo => {
        if (!wo.startDate) return false;
        const d = new Date(wo.startDate);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    const uniquePersonnelIds = new Set<string>();
    currentMonthWorkOutlines.forEach(wo => {
        wo.personnelAssignments?.forEach(pa => uniquePersonnelIds.add(pa.personnelId));
    });
    const deployedPersonnelCount = uniquePersonnelIds.size;

    // --- CHARTS DATA ---

    // 1. Pie Chart: Schedules by Unit this month
    const unitCountMap: Record<string, number> = {};
    currentMonthSchedules.forEach(s => {
        const u = s.unit || 'Khác';
        unitCountMap[u] = (unitCountMap[u] || 0) + 1;
    });
    const pieData = Object.keys(unitCountMap).map(key => ({
        name: key,
        value: unitCountMap[key]
    })).sort((a, b) => b.value - a.value); // sort descending

    // 2. Bar Chart: Schedules over the weeks of the current month
    // Group into 4-5 weeks based on date ranges
    const weeksData = [
        { name: "Tuần 1", Lịch: 0 },
        { name: "Tuần 2", Lịch: 0 },
        { name: "Tuần 3", Lịch: 0 },
        { name: "Tuần 4", Lịch: 0 },
        { name: "Tuần 5", Lịch: 0 },
    ];

    currentMonthSchedules.forEach(s => {
        const d = new Date(s.startDate);
        const dayOfMonth = d.getDate();
        if (dayOfMonth <= 7) weeksData[0].Lịch += 1;
        else if (dayOfMonth <= 14) weeksData[1].Lịch += 1;
        else if (dayOfMonth <= 21) weeksData[2].Lịch += 1;
        else if (dayOfMonth <= 28) weeksData[3].Lịch += 1;
        else weeksData[4].Lịch += 1;
    });

    // Clean up empty weeks at the end if wk 5 is empty
    if (weeksData[4].Lịch === 0 && weeksData[3].Lịch === 0) weeksData.pop();

    return (
        <div className="space-y-6 animate-fade-in">
            {/* KPI ROW */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <GlassCard className="p-4 flex items-center space-x-4 border-l-4 border-l-[#3a0ca3]">
                    <div className="p-3 bg-indigo-100 rounded-lg text-[#3a0ca3]">
                        <Calendar className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground font-medium">Lịch Công Tác (Tháng {currentMonth + 1})</p>
                        <h3 className="text-2xl font-bold text-gray-900">{totalSchedules}</h3>
                    </div>
                </GlassCard>

                <GlassCard className="p-4 flex items-center space-x-4 border-l-4 border-l-[#f72585]">
                    <div className="p-3 bg-pink-100 rounded-lg text-[#f72585]">
                        <Zap className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground font-medium">Cắt Điện / Tổng</p>
                        <h3 className="text-2xl font-bold text-gray-900">{cutPowerSchedules} / {totalSchedules}</h3>
                    </div>
                </GlassCard>

                <GlassCard className="p-4 flex items-center space-x-4 border-l-4 border-l-[#4361ee]">
                    <div className="p-3 bg-blue-100 rounded-lg text-[#4361ee]">
                        <Briefcase className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground font-medium">Tổng số Hợp đồng</p>
                        <h3 className="text-2xl font-bold text-gray-900">{activeContracts}</h3>
                    </div>
                </GlassCard>

                <GlassCard className="p-4 flex items-center space-x-4 border-l-4 border-l-[#7209b7]">
                    <div className="p-3 bg-purple-100 rounded-lg text-[#7209b7]">
                        <Users className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground font-medium">Nhân sự huy động (Tháng)</p>
                        <h3 className="text-2xl font-bold text-gray-900">{deployedPersonnelCount}</h3>
                    </div>
                </GlassCard>
            </div>

            {/* CHARTS ROW */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <GlassCard className="flex flex-col h-[400px]">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Phân bổ Lịch theo Đơn vị (Tháng {currentMonth + 1} / {currentYear})</h3>
                    {pieData.length > 0 ? (
                        <div className="flex-1 w-full relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        paddingAngle={5}
                                        dataKey="value"
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value) => [`${value} Lịch`, 'Khối lượng']} />
                                    <Legend verticalAlign="bottom" height={36} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-muted-foreground">
                            Không có dữ liệu trong tháng này.
                        </div>
                    )}
                </GlassCard>

                <GlassCard className="flex flex-col h-[400px]">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Mật độ Lịch theo Tuần (Tháng {currentMonth + 1} / {currentYear})</h3>
                    <div className="flex-1 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={weeksData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                <YAxis axisLine={false} tickLine={false} allowDecimals={false} />
                                <Tooltip
                                    cursor={{ fill: 'rgba(58, 12, 163, 0.05)' }}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                />
                                <Bar dataKey="Lịch" fill="#4cc9f0" radius={[6, 6, 0, 0]} maxBarSize={60}>
                                    {
                                        weeksData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[(index + 1) % COLORS.length]} />
                                        ))
                                    }
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </GlassCard>
            </div>
        </div>
    );
}
