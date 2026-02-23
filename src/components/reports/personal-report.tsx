"use client";

import { useState, useMemo } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { ReportData } from "@/types";
import { format, parseISO } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Clock, CheckSquare } from "lucide-react";

const COLORS = ['#f72585', '#4cc9f0', '#3a0ca3', '#f8961e'];

export function PersonalReport({ data }: { data: ReportData }) {
    const { personnel, workOutlines, schedules } = data;

    // Default selections
    const [selectedPersonId, setSelectedPersonId] = useState<string>(personnel.length > 0 ? personnel[0].id : "");
    const [selectedMonth, setSelectedMonth] = useState<string>((new Date().getMonth() + 1).toString());
    const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());

    // 1. Find the selected person
    const selectedPerson = useMemo(() => {
        return personnel.find(p => p.id === selectedPersonId) || null;
    }, [personnel, selectedPersonId]);

    // 2. Find work outlines for this person in the selected month/year
    const personWorkloads = useMemo(() => {
        if (!selectedPersonId) return [];

        const monthMatches = workOutlines.filter(wo => {
            if (!wo.startDate) return false;
            const d = new Date(wo.startDate);
            return d.getMonth() + 1 === parseInt(selectedMonth) && d.getFullYear() === parseInt(selectedYear);
        });

        // Map wo -> personnelAssignment
        const results: Array<{ schedule: any, assignment: any }> = [];

        monthMatches.forEach(wo => {
            const assignment = wo.personnelAssignments?.find(pa => pa.personnelId === selectedPersonId);
            if (assignment) {
                const sched = schedules.find(s => s.id === wo.scheduleId);
                if (sched) {
                    results.push({ schedule: sched, assignment });
                }
            }
        });

        return results.sort((a, b) => new Date(a.schedule.startDate).getTime() - new Date(b.schedule.startDate).getTime());
    }, [workOutlines, schedules, selectedPersonId, selectedMonth, selectedYear]);

    // KPIs
    const totalTasks = personWorkloads.length;

    // Estimate work hours (roughly, assuming standard YYYY-MM-DD and HH:mm)
    let totalMinutes = 0;
    personWorkloads.forEach(item => {
        try {
            const start = new Date(`${item.assignment.startDate}T${item.assignment.startTime}`);
            const end = new Date(`${item.assignment.endDate}T${item.assignment.endTime}`);
            const diff = (end.getTime() - start.getTime()) / (1000 * 60);
            if (diff > 0) totalMinutes += diff;
        } catch (e) {
            // Ignore parsing errors
        }
    });
    const totalHours = Math.round(totalMinutes / 60);

    // Chart Data (Pie Chart: Task Types)
    const pieData = useMemo(() => {
        const typeMap: Record<string, number> = {};
        personWorkloads.forEach(item => {
            const t = item.schedule.type || 'Khác';
            typeMap[t] = (typeMap[t] || 0) + 1;
        });
        return Object.keys(typeMap).map(key => ({
            name: key,
            value: typeMap[key]
        }));
    }, [personWorkloads]);

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Filters */}
            <GlassCard className="p-4 flex flex-wrap items-center gap-4">
                <div className="flex items-center space-x-2 w-full md:w-auto">
                    <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">Nhân sự:</span>
                    <Select value={selectedPersonId} onValueChange={setSelectedPersonId}>
                        <SelectTrigger className="w-full md:w-[250px] bg-white border-blue-100">
                            <SelectValue placeholder="Chọn nhân sự" />
                        </SelectTrigger>
                        <SelectContent>
                            {personnel.map(p => (
                                <SelectItem key={p.id} value={p.id}>
                                    {p.name} - {p.department}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-muted-foreground">Tháng:</span>
                    <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                        <SelectTrigger className="w-[100px] bg-white border-blue-100">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {Array.from({ length: 12 }, (_, i) => (
                                <SelectItem key={i + 1} value={(i + 1).toString()}>{i + 1}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-muted-foreground">Năm:</span>
                    <Select value={selectedYear} onValueChange={setSelectedYear}>
                        <SelectTrigger className="w-[100px] bg-white border-blue-100">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="2025">2025</SelectItem>
                            <SelectItem value="2026">2026</SelectItem>
                            <SelectItem value="2027">2027</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {selectedPerson && (
                    <div className="ml-auto flex gap-4 w-full md:w-auto mt-4 md:mt-0">
                        <div className="px-4 py-2 bg-[#f72585]/10 text-[#f72585] rounded-lg border border-[#f72585]/20 flex items-center space-x-2">
                            <CheckSquare className="w-5 h-5" />
                            <div>
                                <span className="text-xs block text-muted-foreground uppercase tracking-wider">Số Lịch tham gia</span>
                                <span className="text-sm font-bold leading-none">{totalTasks}</span>
                            </div>
                        </div>
                        <div className="px-4 py-2 bg-[#7209b7]/10 text-[#7209b7] rounded-lg border border-[#7209b7]/20 flex items-center space-x-2">
                            <Clock className="w-5 h-5" />
                            <div>
                                <span className="text-xs block text-muted-foreground uppercase tracking-wider">Giờ công (Ước tính)</span>
                                <span className="text-sm font-bold leading-none">{totalHours}h</span>
                            </div>
                        </div>
                    </div>
                )}
            </GlassCard>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Chart Segment */}
                <GlassCard className="p-6 h-[400px] lg:col-span-1 border-t-4 border-t-[#f72585]">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Loại hình công việc</h3>
                    {pieData.length > 0 ? (
                        <div className="flex-1 w-full h-[300px] relative">
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
                                        label={({ name, percent }) => percent !== undefined ? `${(percent * 100).toFixed(0)}%` : ''}
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value) => [`${value} Lịch`, 'Số lượng']} />
                                    <Legend verticalAlign="bottom" height={36} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-muted-foreground h-[250px]">
                            Chưa có dữ liệu công việc trong tháng này.
                        </div>
                    )}
                </GlassCard>

                {/* Data Table Segment */}
                <GlassCard className="overflow-hidden lg:col-span-2 flex flex-col h-[400px]">
                    <div className="p-4 border-b bg-white/50 flex items-center justify-between">
                        <h3 className="text-lg font-bold text-gray-800">Danh sách Công việc chi tiết</h3>
                        {selectedPerson && (
                            <Badge variant="outline" className="border-[#f72585] text-[#f72585] bg-[#f72585]/5">
                                {selectedPerson.name}
                            </Badge>
                        )}
                    </div>
                    <div className="overflow-y-auto flex-1">
                        <Table>
                            <TableHeader className="bg-slate-50/80 sticky top-0 z-10 backdrop-blur-sm">
                                <TableRow>
                                    <TableHead className="w-[120px] text-[#3a0ca3] font-bold">Ngày TC</TableHead>
                                    <TableHead className="w-[120px] text-[#3a0ca3] font-bold">Lịch trình/Nội dung</TableHead>
                                    <TableHead className="w-[150px] text-[#3a0ca3] font-bold">Ca làm việc</TableHead>
                                    <TableHead className="w-[100px] text-[#3a0ca3] font-bold">Loại hình</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {personWorkloads.length > 0 ? (
                                    personWorkloads.map((item, idx) => (
                                        <TableRow key={idx} className="hover:bg-pink-50/50 transition-colors">
                                            <TableCell className="font-medium whitespace-nowrap">
                                                {format(parseISO(item.schedule.startDate), 'dd/MM/yyyy')}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-gray-700">{item.schedule.unit}</span>
                                                    <span className="text-xs text-gray-500 line-clamp-1" title={item.schedule.content}>{item.schedule.content}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm font-medium text-gray-700">
                                                    {item.assignment.startTime} - {item.assignment.endTime}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {format(parseISO(item.assignment.startDate), 'dd/MM')} {item.assignment.startDate !== item.assignment.endDate ? `- ${format(parseISO(item.assignment.endDate), 'dd/MM')}` : ''}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className={item.schedule.type === 'Cắt điện' ? 'border-[#f72585] text-[#f72585]' : 'border-[#4cc9f0] text-[#4cc9f0]'}>
                                                    {item.schedule.type}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                                            Không có lịch công tác nào được phân công trong tháng này.
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
