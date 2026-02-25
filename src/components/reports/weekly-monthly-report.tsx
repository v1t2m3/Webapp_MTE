"use client";

import { useState, useMemo, useEffect } from "react";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getISOWeek, getISOWeeksInYear } from "date-fns";
import { formatScheduleTime } from "@/lib/utils";
import { Plus, Save, PenSquare, Trash2, Edit2 } from "lucide-react";

const COLORS = ['#4cc9f0', '#f72585', '#3a0ca3'];

export function WeeklyMonthlyReport({ data }: { data: ReportData }) {
    const { schedules } = data;
    const [reportType, setReportType] = useState<"week" | "month">("month");
    const [selectedMonth, setSelectedMonth] = useState<string>((new Date().getMonth() + 1).toString());
    const [selectedWeek, setSelectedWeek] = useState<string>(getISOWeek(new Date()).toString());
    const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
    const [customNotes, setCustomNotes] = useState("");

    // Local state for inline editing
    const [editableSchedules, setEditableSchedules] = useState<any[]>([]);

    // Initialize/Update editable schedules based on filters
    useEffect(() => {
        let filtered: any[] = schedules.filter(s => {
            if (!s.startDate) return false;
            const d = new Date(s.startDate);

            if (reportType === "month") {
                return d.getMonth() + 1 === parseInt(selectedMonth) && d.getFullYear() === parseInt(selectedYear);
            } else {
                return getISOWeek(d) === parseInt(selectedWeek) && d.getFullYear() === parseInt(selectedYear);
            }
        }).map(s => ({ ...s, isCustomReport: false }));

        if (data.supplementalReports) {
            const supps = data.supplementalReports.filter(sr => {
                if (sr.reportType !== 'WEEKLY_MONTHLY') return false;
                if (!sr.startDate) return false;
                const d = new Date(sr.startDate);

                if (reportType === "month") {
                    return d.getMonth() + 1 === parseInt(selectedMonth) && d.getFullYear() === parseInt(selectedYear);
                } else {
                    return getISOWeek(d) === parseInt(selectedWeek) && d.getFullYear() === parseInt(selectedYear);
                }
            }).map(sr => ({
                ...sr,
                isCustomReport: true, // Mark it so UI renders the badge
                isNewOrEditing: false, // It's from DB, so not editing yet
                bucket: ''
            }));

            filtered = [...filtered, ...supps];
        }

        filtered = filtered.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
        setEditableSchedules(filtered); // mapped directly to array values
    }, [schedules, data.supplementalReports, selectedMonth, selectedWeek, selectedYear, reportType]);

    // Handle inline input change for multiple fields
    const handleChange = (id: string, field: string, value: string) => {
        setEditableSchedules(prev =>
            prev.map(s => s.id === id ? { ...s, [field]: value } : s)
        );
    };

    const handleAddCustomRow = (isPast: boolean) => {
        const d = new Date();
        if (!isPast) {
            d.setDate(d.getDate() + 1); // tomorrow maps to future table
        }
        const dateStr = format(d, 'yyyy-MM-dd');
        const newId = `custom-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        setEditableSchedules(prev => [
            ...prev,
            {
                id: newId,
                startDate: dateStr,
                endDate: dateStr,
                unit: "",
                content: "",
                type: "Khác",
                isCustomReport: true,
                isNewOrEditing: true,
                bucket: isPast ? 'past' : 'future'
            }
        ]);
    };

    const handleDeleteCustomRow = async (id: string) => {
        // Optimistic UI deletion
        setEditableSchedules(prev => prev.filter(s => s.id !== id));

        try {
            await fetch(`/api/supplemental-reports?id=${id}`, { method: 'DELETE' });
        } catch (error) {
            console.error("Error deleting report:", error);
        }
    };

    const handleEditCustomRow = (id: string) => {
        setEditableSchedules(prev => prev.map(s => s.id === id ? { ...s, isNewOrEditing: true } : s));
    };

    const handleSaveReports = async () => {
        try {
            const newCustomRows = editableSchedules.filter(s => s.isCustomReport && s.isNewOrEditing);

            for (const row of newCustomRows) {
                const payload = {
                    id: row.id,
                    reportType: 'WEEKLY_MONTHLY',
                    referenceId: "NONE", // No specific reference for general reports
                    startDate: row.startDate,
                    endDate: row.endDate,
                    unit: row.unit,
                    content: row.content,
                };

                const response = await fetch('/api/supplemental-reports', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (!response.ok) {
                    console.error("Failed to save row:", row.id);
                }
            }

            setEditableSchedules(prev => prev.map(s => s.isCustomReport ? { ...s, isNewOrEditing: false } : s));
            alert("Báo cáo đã được lưu thành công!");
        } catch (error) {
            console.error(error);
            alert("Lỗi khi lưu báo cáo!");
        }
    };

    // Split schedules
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const pastSchedules = editableSchedules.filter(s => {
        if (s.isCustomReport && s.isNewOrEditing) {
            return s.bucket === 'past';
        }
        if (!s.startDate) return false;
        const d = new Date(s.startDate);
        d.setHours(0, 0, 0, 0);
        return d <= today;
    });

    const futureSchedules = editableSchedules.filter(s => {
        if (s.isCustomReport && s.isNewOrEditing) {
            return s.bucket === 'future';
        }
        if (!s.startDate) return false;
        const d = new Date(s.startDate);
        d.setHours(0, 0, 0, 0);
        return d > today;
    });

    // KPIs based on all filtered data for the period
    const total = editableSchedules.length;
    const cutPower = editableSchedules.filter(s => s.type === "Cắt điện").length;
    const noCutPower = total - cutPower;

    // Chart Data (Days of month/week)
    const chartData = useMemo(() => {
        if (reportType === "month") {
            const daysInMonth = getDaysInMonth(new Date(parseInt(selectedYear), parseInt(selectedMonth) - 1));
            const days = Array.from({ length: daysInMonth }, (_, i) => ({
                day: (i + 1).toString(),
                'Lịch công tác': 0
            }));

            editableSchedules.forEach(s => {
                const d = new Date(s.startDate);
                const dayIndex = d.getDate() - 1;
                if (days[dayIndex]) {
                    days[dayIndex]['Lịch công tác'] += 1;
                }
            });
            return days;
        } else {
            // For week, just show 7 days roughly or by specific dates
            const days = Array.from({ length: 7 }, (_, i) => ({
                day: `T${i + 2 === 8 ? 'CN' : i + 2}`, // T2 -> T7, CN
                'Lịch công tác': 0
            }));

            editableSchedules.forEach(s => {
                const d = new Date(s.startDate);
                let dayIndex = d.getDay() - 1; // 0 is Sunday in JS, we want Monday=0
                if (dayIndex === -1) dayIndex = 6; // Sunday
                if (days[dayIndex]) {
                    days[dayIndex]['Lịch công tác'] += 1;
                }
            });
            return days;
        }
    }, [editableSchedules, selectedMonth, selectedWeek, selectedYear, reportType]);

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Filters */}
            <GlassCard className="p-4 flex flex-wrap items-center gap-4">
                <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-muted-foreground">Loại:</span>
                    <Select value={reportType} onValueChange={(val: "week" | "month") => setReportType(val)}>
                        <SelectTrigger className="w-[120px] bg-white border-blue-100">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="week">Theo Tuần</SelectItem>
                            <SelectItem value="month">Theo Tháng</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {reportType === "month" ? (
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
                ) : (
                    <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-muted-foreground w-16">Tuần:</span>
                        <Select value={selectedWeek} onValueChange={setSelectedWeek}>
                            <SelectTrigger className="w-[120px] bg-white border-blue-100">
                                <SelectValue placeholder="Chọn tuần" />
                            </SelectTrigger>
                            <SelectContent>
                                {Array.from({ length: getISOWeeksInYear(new Date(parseInt(selectedYear))) }, (_, i) => (
                                    <SelectItem key={i + 1} value={(i + 1).toString()}>Tuần {i + 1}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}
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
                    <div className="px-4 py-2 bg-[#3a0ca3]/10 text-[#3a0ca3] rounded-lg border border-[#3a0ca3]/20 md:flex flex-col justify-center hidden">
                        <span className="text-sm font-bold">Tổng: {total}</span>
                    </div>
                    <Button onClick={handleSaveReports} className="bg-green-600 hover:bg-green-700 text-white shadow-md">
                        <Save className="w-4 h-4 mr-2" /> Lưu Báo Cáo
                    </Button>
                </div>
            </GlassCard>

            {/* Chart */}
            <GlassCard className="p-6 flex flex-col min-h-[350px]">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Biểu đồ Lịch công tác theo Ngày</h3>
                <div className="w-full h-[300px]">
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
                </div>
            </GlassCard>

            {/* Data Table: Past Schedules */}
            <GlassCard className="overflow-hidden">
                <div className="p-4 border-b bg-white/50">
                    <h3 className="text-lg font-bold text-gray-800">1. Công việc đã thực hiện</h3>
                </div>
                <div className="overflow-x-auto max-h-[400px]">
                    <Table>
                        <TableHeader className="bg-slate-50/80 sticky top-0 z-10 backdrop-blur-sm">
                            <TableRow>
                                <TableHead className="w-[120px] text-[#3a0ca3] font-bold">Thời gian</TableHead>
                                <TableHead className="w-[150px] text-[#3a0ca3] font-bold">Đơn vị</TableHead>
                                <TableHead className="min-w-[400px] text-[#3a0ca3] font-bold">Nội dung (Bấm để sửa)</TableHead>
                                <TableHead className="w-[150px] text-[#3a0ca3] font-bold">Loại hình</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {pastSchedules.length > 0 ? (
                                pastSchedules.map((s) => (
                                    <TableRow key={`past-${s.id}`} className="hover:bg-blue-50/50 transition-colors">
                                        <TableCell className="font-medium whitespace-nowrap">
                                            {s.isCustomReport && s.isNewOrEditing ? (
                                                <div className="flex flex-col gap-1 items-start">
                                                    <div className="flex items-center gap-1 text-[10px] text-gray-500"><span className="w-6">Từ:</span> <Input type="date" value={s.startDate} onChange={(e) => handleChange(s.id, 'startDate', e.target.value)} className="w-[110px] h-6 text-xs bg-white focus:border-[#4cc9f0] px-1" /></div>
                                                    <div className="flex items-center gap-1 text-[10px] text-gray-500"><span className="w-6">Đến:</span> <Input type="date" value={s.endDate} onChange={(e) => handleChange(s.id, 'endDate', e.target.value)} className="w-[110px] h-6 text-xs bg-white focus:border-[#4cc9f0] px-1" /></div>
                                                </div>
                                            ) : (
                                                formatScheduleTime(s.startDate, s.endDate)
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {s.isCustomReport && s.isNewOrEditing ? (
                                                <Input value={s.unit} onChange={(e) => handleChange(s.id, 'unit', e.target.value)} placeholder="Nhập Đơn vị" className="w-full h-8 text-xs bg-white focus:border-[#4cc9f0]" />
                                            ) : (
                                                <span className="font-semibold text-gray-700">{s.unit || "Chưa nhập"}</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="max-w-[500px] p-2">
                                            <div className="flex items-center gap-2">
                                                {s.isCustomReport && <span title="Báo cáo thêm bằng tay"><PenSquare className="w-4 h-4 min-w-4 text-orange-500" /></span>}
                                                <Input
                                                    value={s.content}
                                                    onChange={(e) => handleChange(s.id, 'content', e.target.value)}
                                                    placeholder="Nhập nội dung công việc..."
                                                    className={`w-full bg-transparent border-transparent hover:border-gray-300 focus:bg-white focus:border-[#4cc9f0] shadow-none h-auto py-1 px-2 resize-y ${s.isCustomReport ? 'font-semibold text-orange-700' : ''}`}
                                                />
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center justify-between gap-2">
                                                <Badge variant={s.type === 'Cắt điện' ? 'destructive' : 'default'}
                                                    className={`whitespace-nowrap ${s.isCustomReport ? 'bg-orange-500' : (s.type === 'Cắt điện' ? 'bg-[#f72585]' : 'bg-[#4cc9f0]')}`}
                                                >
                                                    {s.isCustomReport ? 'Nhập tay' : s.type}
                                                </Badge>
                                                {s.isCustomReport && (
                                                    <div className="flex gap-1">
                                                        {!s.isNewOrEditing && (
                                                            <Button variant="ghost" size="icon" className="h-6 w-6 text-blue-500 hover:bg-blue-50" onClick={() => handleEditCustomRow(s.id)}>
                                                                <Edit2 className="w-3 h-3" />
                                                            </Button>
                                                        )}
                                                        <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500 hover:bg-red-50" onClick={() => handleDeleteCustomRow(s.id)}>
                                                            <Trash2 className="w-3 h-3" />
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                                        Không có công việc đã thực hiện.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
                <div className="p-3 bg-slate-50 border-t flex justify-end">
                    <Button variant="outline" size="sm" onClick={() => handleAddCustomRow(true)} className="text-[#3a0ca3] border-[#3a0ca3] hover:bg-[#3a0ca3]/10">
                        <Plus className="w-4 h-4 mr-2" /> Bổ sung công việc
                    </Button>
                </div>
            </GlassCard>

            {/* Data Table: Future Schedules */}
            <GlassCard className="overflow-hidden">
                <div className="p-4 border-b bg-white/50">
                    <h3 className="text-lg font-bold text-[#f72585]">2. Kế hoạch công tác {reportType === 'week' ? 'Tuần' : 'Tháng'} tiếp theo</h3>
                </div>
                <div className="overflow-x-auto max-h-[400px]">
                    <Table>
                        <TableHeader className="bg-slate-50/80 sticky top-0 z-10 backdrop-blur-sm">
                            <TableRow>
                                <TableHead className="w-[120px] text-[#f72585] font-bold">Thời gian</TableHead>
                                <TableHead className="w-[150px] text-[#f72585] font-bold">Đơn vị</TableHead>
                                <TableHead className="min-w-[400px] text-[#f72585] font-bold">Nội dung (Bấm để sửa)</TableHead>
                                <TableHead className="w-[150px] text-[#f72585] font-bold">Loại hình</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {futureSchedules.length > 0 ? (
                                futureSchedules.map((s) => (
                                    <TableRow key={`future-${s.id}`} className="hover:bg-pink-50/50 transition-colors">
                                        <TableCell className="font-medium whitespace-nowrap">
                                            {s.isCustomReport && s.isNewOrEditing ? (
                                                <div className="flex flex-col gap-1 items-start">
                                                    <div className="flex items-center gap-1 text-[10px] text-gray-500"><span className="w-6">Từ:</span> <Input type="date" value={s.startDate} onChange={(e) => handleChange(s.id, 'startDate', e.target.value)} className="w-[110px] h-6 text-xs bg-white focus:border-[#f72585] px-1" /></div>
                                                    <div className="flex items-center gap-1 text-[10px] text-gray-500"><span className="w-6">Đến:</span> <Input type="date" value={s.endDate} onChange={(e) => handleChange(s.id, 'endDate', e.target.value)} className="w-[110px] h-6 text-xs bg-white focus:border-[#f72585] px-1" /></div>
                                                </div>
                                            ) : (
                                                formatScheduleTime(s.startDate, s.endDate)
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {s.isCustomReport && s.isNewOrEditing ? (
                                                <Input value={s.unit} onChange={(e) => handleChange(s.id, 'unit', e.target.value)} placeholder="Nhập Đơn vị" className="w-full h-8 text-xs bg-white focus:border-[#f72585]" />
                                            ) : (
                                                <span className="font-semibold text-gray-700">{s.unit || "Chưa nhập"}</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="max-w-[500px] p-2">
                                            <div className="flex items-center gap-2">
                                                {s.isCustomReport && <span title="Báo cáo thêm bằng tay"><PenSquare className="w-4 h-4 min-w-4 text-orange-500" /></span>}
                                                <Input
                                                    value={s.content}
                                                    onChange={(e) => handleChange(s.id, 'content', e.target.value)}
                                                    placeholder="Nhập nội dung công việc..."
                                                    className={`w-full bg-transparent border-transparent hover:border-gray-300 focus:bg-white focus:border-[#f72585] shadow-none h-auto py-1 px-2 resize-y ${s.isCustomReport ? 'font-semibold text-orange-700' : ''}`}
                                                />
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center justify-between gap-2">
                                                <Badge variant={s.type === 'Cắt điện' ? 'destructive' : 'default'}
                                                    className={`whitespace-nowrap ${s.isCustomReport ? 'bg-orange-500' : (s.type === 'Cắt điện' ? 'bg-[#f72585]' : 'bg-[#4cc9f0]')}`}
                                                >
                                                    {s.isCustomReport ? 'Nhập tay' : s.type}
                                                </Badge>
                                                {s.isCustomReport && (
                                                    <div className="flex gap-1">
                                                        {!s.isNewOrEditing && (
                                                            <Button variant="ghost" size="icon" className="h-6 w-6 text-blue-500 hover:bg-blue-50" onClick={() => handleEditCustomRow(s.id)}>
                                                                <Edit2 className="w-3 h-3" />
                                                            </Button>
                                                        )}
                                                        <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500 hover:bg-red-50" onClick={() => handleDeleteCustomRow(s.id)}>
                                                            <Trash2 className="w-3 h-3" />
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                                        Không có kế hoạch công tác.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
                <div className="p-3 bg-slate-50 border-t flex justify-end">
                    <Button variant="outline" size="sm" onClick={() => handleAddCustomRow(false)} className="text-[#f72585] border-[#f72585] hover:bg-[#f72585]/10">
                        <Plus className="w-4 h-4 mr-2" /> Bổ sung kế hoạch
                    </Button>
                </div>
            </GlassCard>

            {/* Custom Notes Section */}
            <GlassCard className="overflow-hidden">
                <div className="p-4 border-b bg-white/50">
                    <h3 className="text-lg font-bold text-[#3a0ca3]">3. Nội dung báo cáo bổ sung</h3>
                </div>
                <div className="p-4 bg-white">
                    <Textarea
                        placeholder="Nhập thêm ghi chú, đánh giá kết quả, hoặc đề xuất cho tuần/tháng này..."
                        className="min-h-[120px] resize-y border-gray-200 focus-visible:ring-[#3a0ca3] print:border-none print:resize-none print:p-0"
                        value={customNotes}
                        onChange={(e) => setCustomNotes(e.target.value)}
                    />
                </div>
            </GlassCard>
        </div>
    );
}
