"use client";

import { useState, useMemo, useEffect } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { ReportData } from "@/types";
import { format, parseISO } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Clock, CheckSquare, Plus, Save, PenSquare, Trash2, Edit2 } from "lucide-react";
import { formatScheduleTime } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card"; // Added Card import

const COLORS = ['#f72585', '#4cc9f0', '#3a0ca3', '#f8961e'];

export function PersonalReport({ data }: { data: ReportData }) {
    const { personnel, workOutlines, schedules } = data;

    // Default selections
    const [selectedPersonId, setSelectedPersonId] = useState<string>(personnel.length > 0 ? personnel[0].id : "");
    const [selectedMonth, setSelectedMonth] = useState<string>((new Date().getMonth() + 1).toString());
    const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());

    // Editable state
    const [editableWorkloads, setEditableWorkloads] = useState<Array<any>>([]); // Changed type to any for simplicity with custom rows

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
        const results: Array<any> = [];

        monthMatches.forEach(wo => {
            const assignment = wo.personnelAssignments?.find(pa => pa.personnelId === selectedPersonId);
            if (assignment) {
                const sched = schedules.find(s => s.id === wo.scheduleId);
                if (sched) {
                    results.push({
                        id: sched.id,
                        startDate: sched.startDate,
                        endDate: sched.endDate,
                        unit: sched.unit,
                        content: sched.content,
                        type: sched.type,
                        isCustomReport: false,
                        assignment: assignment
                    });
                }
            }
        });

        // Add Supplemental Reports specifically assigned to this person
        if (data.supplementalReports) {
            const supps = data.supplementalReports.filter(sr =>
                sr.reportType === 'PERSONAL' &&
                sr.referenceId === selectedPersonId
            );

            supps.forEach(sr => {
                const d = new Date(sr.startDate);
                if (d.getMonth() + 1 === parseInt(selectedMonth) && d.getFullYear() === parseInt(selectedYear)) {
                    results.push({
                        ...sr,
                        isCustomReport: true, // Mark it so UI renders the badge
                        isNewOrEditing: false, // It's from DB, so not editing yet
                        bucket: '' // Wil be calculated natively
                    });
                }
            });
        }

        return results.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
    }, [workOutlines, schedules, data.supplementalReports, selectedPersonId, selectedMonth, selectedYear]);

    useEffect(() => {
        setEditableWorkloads(personWorkloads.map(pw => ({
            ...pw
        })));
    }, [personWorkloads]);

    const handleChange = (id: string, field: string, value: string) => {
        setEditableWorkloads(prev =>
            prev.map(w => w.id === id ? { ...w, [field]: value } : w)
        );
    };

    const handleAddCustomRow = (isPast: boolean) => {
        const d = new Date();
        if (!isPast) {
            d.setDate(d.getDate() + 1); // tomorrow maps to future table
        }
        const dateStr = format(d, 'yyyy-MM-dd');
        const newId = `custom-${Date.now()}`;
        setEditableWorkloads(prev => [
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
        if (id.startsWith('custom-')) {
            setEditableWorkloads(prev => prev.filter(s => s.id !== id));
            return;
        }

        try {
            const res = await fetch(`/api/supplemental-reports?id=${id}`, { method: 'DELETE' });
            if (res.ok) {
                setEditableWorkloads(prev => prev.filter(s => s.id !== id));
            } else {
                console.error("Failed to delete report.");
            }
        } catch (error) {
            console.error("Error deleting report:", error);
        }
    };

    const handleEditCustomRow = (id: string) => {
        setEditableWorkloads(prev => prev.map(s => s.id === id ? { ...s, isNewOrEditing: true } : s));
    };

    const handleSaveReports = async () => {
        try {
            const newCustomRows = editableWorkloads.filter(s => s.isCustomReport && s.isNewOrEditing);

            for (const row of newCustomRows) {
                const payload = {
                    id: row.id,
                    reportType: 'PERSONAL',
                    referenceId: selectedPersonId,
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
                    console.error("Failed to save personal row:", row.id);
                }
            }

            setEditableWorkloads(prev => prev.map(s => s.isCustomReport ? { ...s, isNewOrEditing: false } : s));
            alert("Báo cáo đã được lưu thành công!");
        } catch (error) {
            console.error(error);
            alert("Lỗi khi lưu báo cáo!");
        }
    };

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const pastWorkloads = editableWorkloads.filter(pw => {
        if (pw.isCustomReport && pw.isNewOrEditing) {
            return pw.bucket === 'past';
        }
        if (!pw.startDate) return false;
        const d = new Date(pw.startDate);
        d.setHours(0, 0, 0, 0);
        return d <= today;
    });

    const futureWorkloads = editableWorkloads.filter(pw => {
        if (pw.isCustomReport && pw.isNewOrEditing) {
            return pw.bucket === 'future';
        }
        if (!pw.startDate) return false;
        const d = new Date(pw.startDate);
        d.setHours(0, 0, 0, 0);
        return d > today;
    });

    // KPIs
    const totalTasks = editableWorkloads.length;

    // Estimate work hours (roughly, assuming standard YYYY-MM-DD and HH:mm)
    let totalMinutes = 0;
    editableWorkloads.forEach(item => {
        // Only calculate for original reports that have assignment data
        if (!item.isCustomReport && item.assignment) {
            try {
                const start = new Date(`${item.assignment.startDate}T${item.assignment.startTime}`);
                const end = new Date(`${item.assignment.endDate}T${item.assignment.endTime}`);
                const diff = (end.getTime() - start.getTime()) / (1000 * 60);
                if (diff > 0) totalMinutes += diff;
            } catch (e) {
                // Ignore parsing errors
            }
        }
    });
    const totalHours = Math.round(totalMinutes / 60);

    // Chart Data (Pie Chart: Task Types)
    const pieData = useMemo(() => {
        const typeMap: Record<string, number> = {};
        personWorkloads.forEach(item => {
            const t = item.type || 'Khác';
            typeMap[t] = (typeMap[t] || 0) + 1;
        });
        return Object.keys(typeMap).map(key => ({
            name: key,
            value: typeMap[key]
        }));
    }, [personWorkloads]); // Changed dependency to personWorkloads as editableWorkloads can have custom types

    return (
        <div className="space-y-6 animate-fade-in print:space-y-4">
            {/* INVISIBLE PRINT HEADER */}
            <div className="hidden print:flex justify-between items-start w-full border-b-2 border-[#3a0ca3] pb-4 mb-6 pt-4 px-8 bg-white text-black">
                <div className="flex items-center gap-4">
                    <img src="/images/LogoEVN_v2.png" alt="EVNCPC" className="h-[40px] w-auto object-contain" />
                </div>
                <div className="text-right">
                    <h1 className="text-xl font-bold uppercase text-[#3a0ca3] m-0 leading-tight">Báo cáo MTE-LAB</h1>
                    <h2 className="text-lg font-semibold m-0 mt-1 leading-tight">
                        Cá nhân: {selectedPerson?.name || selectedPerson?.fullName}
                    </h2>
                    <p className="text-sm italic text-gray-600 drop-shadow-sm mt-1">
                        Tháng {selectedMonth}/{selectedYear}
                    </p>
                </div>
            </div>

            {/* Filters */}
            <GlassCard className="p-4 flex flex-wrap items-center gap-4 print:hidden">
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
                <div className="flex gap-4">
                    {/* Báo cáo cá nhân header info */}
                    <div className="px-4 py-2 bg-[#3a0ca3]/5 text-[#3a0ca3] rounded-lg border border-[#3a0ca3]/10">
                        <span className="text-sm font-bold">Tổng số công việc: {editableWorkloads.length}</span>
                    </div>
                    <Button onClick={handleSaveReports} className="bg-green-600 hover:bg-green-700 text-white shadow-md">
                        <Save className="w-4 h-4 mr-2" /> Lưu Báo Cáo
                    </Button>
                </div>
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
                        <h3 className="text-lg font-bold text-gray-800">1. Công việc đã thực hiện</h3>
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
                                    <TableHead className="w-[120px] text-[#3a0ca3] font-bold">Thời gian</TableHead>
                                    <TableHead className="w-[120px] text-[#3a0ca3] font-bold">Đơn vị</TableHead>
                                    <TableHead className="min-w-[200px] text-[#3a0ca3] font-bold">Nội dung (Bấm để sửa)</TableHead>
                                    <TableHead className="w-[100px] text-[#3a0ca3] font-bold">Loại hình</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {pastWorkloads.length > 0 ? (
                                    pastWorkloads.map((s, idx) => (
                                        <TableRow key={`past-${s.id}`} className="hover:bg-blue-50/50 transition-colors">
                                            <TableCell className="font-medium whitespace-nowrap">
                                                {s.isCustomReport && s.isNewOrEditing ? (
                                                    <div className="flex flex-col gap-1 items-start">
                                                        <div className="flex items-center gap-1 text-[10px] text-gray-500"><span className="w-6">Từ:</span> <Input type="date" value={s.startDate} onChange={(e) => handleChange(s.id, 'startDate', e.target.value)} className="w-[110px] h-6 text-xs bg-white focus:border-[#4361ee] px-1" /></div>
                                                        <div className="flex items-center gap-1 text-[10px] text-gray-500"><span className="w-6">Đến:</span> <Input type="date" value={s.endDate} onChange={(e) => handleChange(s.id, 'endDate', e.target.value)} className="w-[110px] h-6 text-xs bg-white focus:border-[#4361ee] px-1" /></div>
                                                    </div>
                                                ) : (
                                                    formatScheduleTime(s.startDate, s.endDate)
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {s.isCustomReport && s.isNewOrEditing ? (
                                                    <Input value={s.unit} onChange={(e) => handleChange(s.id, 'unit', e.target.value)} placeholder="Nhập Đơn vị" className="w-full h-8 text-xs bg-white focus:border-[#4361ee]" />
                                                ) : (
                                                    <span className="font-semibold text-gray-700">{s.unit || "Chưa nhập"}</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="p-2">
                                                <div className="flex items-center gap-2">
                                                    {s.isCustomReport && <span title="Báo cáo thêm bằng tay"><PenSquare className="w-4 h-4 min-w-4 text-orange-500" /></span>}
                                                    <Input
                                                        value={s.content}
                                                        onChange={(e) => handleChange(s.id, 'content', e.target.value)}
                                                        placeholder="Nhập nội dung công việc..."
                                                        className={`w-full bg-transparent border-transparent hover:border-gray-300 focus:bg-white focus:border-[#4361ee] shadow-none h-auto py-1 px-2 ${s.isCustomReport ? 'font-semibold text-orange-700' : ''}`}
                                                    />
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center justify-between gap-2">
                                                    <Badge variant="outline" className={`whitespace-nowrap ${s.isCustomReport ? 'border-orange-500 text-orange-600 bg-orange-50' : 'border-[#4361ee] text-[#4361ee] bg-[#4361ee]/5'}`}>
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
                                            Không có công việc đã thực hiện trong tháng này.
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

                {/* Future Table Segment */}
                <GlassCard className="overflow-hidden lg:col-span-3 flex flex-col max-h-[400px]">
                    <div className="p-4 border-b bg-white/50 flex items-center justify-between">
                        <h3 className="text-lg font-bold text-[#f72585]">2. Kế hoạch thực hiện</h3>
                    </div>
                    <div className="overflow-y-auto flex-1">
                        <Table>
                            <TableHeader className="bg-slate-50/80 sticky top-0 z-10 backdrop-blur-sm">
                                <TableRow>
                                    <TableHead className="w-[120px] text-[#f72585] font-bold">Thời gian</TableHead>
                                    <TableHead className="w-[120px] text-[#f72585] font-bold">Đơn vị</TableHead>
                                    <TableHead className="min-w-[200px] text-[#f72585] font-bold">Nội dung (Bấm để sửa)</TableHead>
                                    <TableHead className="w-[100px] text-[#f72585] font-bold">Loại hình</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {futureWorkloads.length > 0 ? (
                                    futureWorkloads.map((s, idx) => (
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
                                            <TableCell className="p-2">
                                                <div className="flex items-center gap-2">
                                                    {s.isCustomReport && <span title="Báo cáo thêm bằng tay"><PenSquare className="w-4 h-4 min-w-4 text-orange-500" /></span>}
                                                    <Input
                                                        value={s.content}
                                                        onChange={(e) => handleChange(s.id, 'content', e.target.value)}
                                                        placeholder="Nhập nội dung công việc..."
                                                        className={`w-full bg-transparent border-transparent hover:border-gray-300 focus:bg-white focus:border-[#f72585] shadow-none h-auto py-1 px-2 ${s.isCustomReport ? 'font-semibold text-orange-700' : ''}`}
                                                    />
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center justify-between gap-2">
                                                    <Badge variant="outline" className={`whitespace-nowrap ${s.isCustomReport ? 'border-orange-500 text-orange-600 bg-orange-50' : 'border-[#f72585] text-[#f72585] bg-[#f72585]/5'}`}>
                                                        {s.isCustomReport ? 'Nhập tay' : s.type}
                                                    </Badge>
                                                    {s.isCustomReport && (
                                                        <div className="flex gap-1">
                                                            {!s.isNewOrEditing && (
                                                                <Button variant="ghost" size="icon" className="h-6 w-6 text-pink-500 hover:bg-pink-50" onClick={() => handleEditCustomRow(s.id)}>
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
                                            Không có kế hoạch sắp tới.
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
            </div>
            {/* INVISIBLE PRINT FOOTER */}
            <div className="hidden print:flex fixed bottom-0 left-0 right-0 w-full justify-between items-center text-xs text-gray-500 py-3 px-8 bg-white border-t border-gray-200">
                <span>Ngày in: {format(new Date(), "dd/MM/yyyy HH:mm")}</span>
                <span>
                    XN Sửa Chữa Thiết Bị Điện - MTE
                </span>
            </div>
        </div>
    );
}
