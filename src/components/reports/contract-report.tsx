"use client";

import { useState, useMemo, useEffect } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { ReportData } from "@/types";
import { format, parseISO } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { formatScheduleTime } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Plus, Save, PenSquare, Trash2, Edit2 } from "lucide-react";

const COLORS = ['#4361ee', '#4cc9f0', '#3a0ca3'];

export function ContractReport({ data }: { data: ReportData }) {
    const { contracts, schedules } = data;

    // Default to the first contract if available
    const [selectedContractId, setSelectedContractId] = useState<string>(contracts.length > 0 ? contracts[0].id : "");

    const selectedContract = useMemo(() => {
        return contracts.find(c => c.id === selectedContractId) || null;
    }, [contracts, selectedContractId]);

    // Editable state
    const [editableSchedules, setEditableSchedules] = useState<any[]>([]);

    // Filter schedules linked to the selected contract
    const linkedSchedules = useMemo(() => {
        if (!selectedContractId) return [];
        const baseSchedules = schedules.filter(s => s.contractId === selectedContractId)
            .map(s => ({ ...s, isCustomReport: false }));

        if (data.supplementalReports) {
            const supps = data.supplementalReports.filter(sr =>
                sr.reportType === 'CONTRACT' &&
                sr.referenceId === selectedContractId
            ).map(sr => ({
                ...sr,
                isCustomReport: true, // Mark it so UI renders the badge
                isNewOrEditing: false, // It's from DB, so not editing yet
                bucket: ''
            }));
            return [...baseSchedules, ...supps].sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
        }

        return baseSchedules.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
    }, [schedules, data.supplementalReports, selectedContractId]);

    useEffect(() => {
        setEditableSchedules(linkedSchedules.map(s => ({ ...s })));
    }, [linkedSchedules]);

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
        const newId = `custom-${Date.now()}`;
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

    const handleDeleteCustomRow = (id: string) => {
        setEditableSchedules(prev => prev.filter(s => s.id !== id));
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
                    reportType: 'CONTRACT',
                    referenceId: selectedContractId || "CUSTOM",
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

    // KPIs
    const totalLinkedSchedules = editableSchedules.length;

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
                        <Button onClick={handleSaveReports} className="bg-green-600 hover:bg-green-700 text-white shadow-md flex-none self-end h-[52px]">
                            <Save className="w-4 h-4 mr-2" /> Lưu Báo Cáo
                        </Button>
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

                {/* Data Table Segment */}
                <GlassCard className="overflow-hidden lg:col-span-2 flex flex-col h-[400px]">
                    <div className="p-4 border-b bg-white/50 flex items-center justify-between">
                        <h3 className="text-lg font-bold text-gray-800">1. Công việc đã thực hiện</h3>
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
                                    <TableHead className="w-[120px] text-[#3a0ca3] font-bold">Thời gian</TableHead>
                                    <TableHead className="w-[120px] text-[#3a0ca3] font-bold">Đơn vị</TableHead>
                                    <TableHead className="min-w-[200px] text-[#3a0ca3] font-bold">Nội dung (Bấm để sửa)</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {pastSchedules.length > 0 ? (
                                    pastSchedules.map((s) => (
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
                                                    {s.isCustomReport && (
                                                        <div className="flex gap-1 ml-auto shrink-0">
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
                                        <TableCell colSpan={3} className="h-32 text-center text-muted-foreground">
                                            Không có Lịch công tác đã thực hiện.
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
                                            <TableCell className="p-2">
                                                <div className="flex items-center gap-2">
                                                    {s.isCustomReport && <span title="Báo cáo thêm bằng tay"><PenSquare className="w-4 h-4 min-w-4 text-orange-500" /></span>}
                                                    <Input
                                                        value={s.content}
                                                        onChange={(e) => handleChange(s.id, 'content', e.target.value)}
                                                        placeholder="Nhập nội dung công việc..."
                                                        className={`w-full bg-transparent border-transparent hover:border-gray-300 focus:bg-white focus:border-[#f72585] shadow-none h-auto py-1 px-2 ${s.isCustomReport ? 'font-semibold text-orange-700' : ''}`}
                                                    />
                                                    {s.isCustomReport && (
                                                        <div className="flex gap-1 ml-auto shrink-0">
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
                                        <TableCell colSpan={3} className="h-32 text-center text-muted-foreground">
                                            Không có kế hoạch công việc nào.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                    <div className="p-3 bg-slate-50 border-t flex justify-end">
                        <Button variant="outline" size="sm" onClick={() => handleAddCustomRow(false)} className="text-[#f72585] border-[#f72585] hover:bg-[#f72585]/10">
                            <Plus className="w-4 h-4 mr-2" /> Bổ sung kế hoạch liên kết
                        </Button>
                    </div>
                </GlassCard>
            </div>
        </div>
    );
}
