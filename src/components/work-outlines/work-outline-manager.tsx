"use client";

import { useState, useEffect, useCallback } from "react";
import { Schedule, Personnel, Vehicle, Contract, WorkOutline } from "@/types";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, Download } from "lucide-react";
import { GlassCard, GlassPageHeader } from "@/components/ui/GlassCard";
import { WorkOutlineForm } from "./work-outline-form";
import { exportWorkOutlineDocx } from "@/lib/export-docx";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";

export function WorkOutlineManager() {
    const [workOutlines, setWorkOutlines] = useState<WorkOutline[]>([]);
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [personnel, setPersonnel] = useState<Personnel[]>([]);
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [contracts, setContracts] = useState<Contract[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingOutline, setEditingOutline] = useState<WorkOutline | null>(null);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const [woRes, schedRes, persRes, vehRes, contRes] = await Promise.all([
                fetch("/api/work-outlines"),
                fetch("/api/schedules"),
                fetch("/api/personnel"),
                fetch("/api/vehicles"),
                fetch("/api/contracts")
            ]);

            setWorkOutlines(await woRes.json() || []);
            setSchedules(await schedRes.json() || []);
            setPersonnel(await persRes.json() || []);
            setVehicles(await vehRes.json() || []);
            setContracts(await contRes.json() || []);
        } catch (error) {
            console.error("Failed to fetch data:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleSubmit = async (data: Partial<WorkOutline>) => {
        try {
            const isEditing = !!data.id;
            const url = "/api/work-outlines";
            const method = isEditing ? "PUT" : "POST";

            const payload = {
                ...data,
                id: isEditing ? data.id : `DC${Date.now()}`
            };

            const response = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!response.ok) throw new Error("Failed to save work outline");
            await fetchData();
            setIsFormOpen(false);
        } catch (error) {
            console.error(error);
            alert("Lỗi khi lưu đề cương");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Bạn có chắc chắn muốn xóa đề cương này?")) return;
        try {
            const response = await fetch(`/api/work-outlines?id=${id}`, { method: "DELETE" });
            if (!response.ok) throw new Error("Failed to delete work outline");
            await fetchData();
        } catch (error) {
            console.error(error);
            alert("Lỗi khi xóa đề cương");
        }
    };

    const handleEdit = (outline: WorkOutline) => {
        setEditingOutline(outline);
        setIsFormOpen(true);
    };

    const handleDownload = async (outline: WorkOutline) => {
        try {
            await exportWorkOutlineDocx(outline, schedules, contracts, personnel);
        } catch (error) {
            console.error("Lỗi khi tải xuống:", error);
            alert("Đã xảy ra lỗi khi tạo Tệp Đề Cương Docx. Vui lòng thử lại!");
        }
    };

    const handleOpenNew = () => {
        setEditingOutline(null);
        setIsFormOpen(true);
    };

    const getScheduleInfo = (outline: WorkOutline) => {
        if (outline.isCustom) {
            return {
                name: outline.customContractName || "Không có HĐ",
                target: outline.customContent || "N/A",
                content: outline.customContent || "",
                deviceName: "Tùy chọn",
                unit: ""
            };
        }

        const schedule = schedules.find(s => s.id === outline.scheduleId);
        if (!schedule) return { name: "N/A", target: "N/A", content: "", deviceName: "", unit: "" };
        const contract = contracts.find(c => c.id === schedule.contractId);
        const contractName = contract ? `${contract.code} - ${contract.name}` : "Không có HĐ";
        return {
            name: contractName,
            target: schedule.target,
            content: schedule.content,
            deviceName: schedule.deviceName,
            unit: schedule.unit
        };
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return "";
        const parts = dateString.split("-");
        if (parts.length === 3) {
            return `${parts[2]}/${parts[1]}/${parts[0]}`;
        }
        return dateString;
    };

    return (
        <div className="flex flex-col space-y-6 animate-fade-in">
            <GlassPageHeader
                title="Đề cương công tác"
                description="Quản lý chi tiết giao việc, phân công nhân sự và phương tiện cho từng Lịch công tác."
            >
                <Button onClick={handleOpenNew} className="bg-[#3f37c9] hover:bg-[#3f37c9]/90 text-white shadow-lg shadow-indigo-900/20 px-6 py-5 rounded-xl font-medium">
                    <Plus className="mr-2 h-5 w-5" /> Thêm Đề Cương
                </Button>
            </GlassPageHeader>

            <div className="w-full">
                {loading ? (
                    <GlassCard className="h-64 flex items-center justify-center">
                        <div className="animate-pulse text-indigo-600 font-medium">Đang tải Đề cương...</div>
                    </GlassCard>
                ) : (
                    <GlassCard className="p-0 overflow-hidden">
                        <div className="overflow-x-auto min-w-full">
                            <Table className="whitespace-nowrap">
                                <TableHeader>
                                    <TableRow className="bg-muted/50">
                                        <TableHead>Lịch công tác (Đối tượng)</TableHead>
                                        <TableHead>Tên Hợp Đồng</TableHead>
                                        <TableHead>Thời gian</TableHead>
                                        <TableHead>Số lượng Nhân sự</TableHead>
                                        <TableHead>Số lượng Phương tiện</TableHead>
                                        <TableHead className="text-right sticky right-0 bg-white shadow-[-4px_0_10px_rgba(0,0,0,0.05)]">Thao tác</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {workOutlines.map((item, index) => {
                                        const scheduleInfo = getScheduleInfo(item);
                                        return (
                                            <TableRow
                                                key={item.id}
                                                className="hover:bg-muted/50 transition-colors animate-slide-up align-top"
                                                style={{ animationDelay: `${index * 0.05}s` }}
                                            >
                                                <TableCell>
                                                    <div className="flex flex-col">
                                                        <span className="font-semibold text-primary max-w-[200px] truncate" title={scheduleInfo.target}>{scheduleInfo.target}</span>
                                                        <span className="text-xs text-muted-foreground">{scheduleInfo.unit} - {scheduleInfo.deviceName}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="max-w-[250px] truncate text-sm" title={scheduleInfo.name}>{scheduleInfo.name}</div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col text-xs space-y-1">
                                                        <div><span className="font-medium text-blue-700">Bắt đầu:</span> {item.startTime} {formatDate(item.startDate)}</div>
                                                        <div><span className="font-medium text-pink-700">Kết thúc:</span> {item.endTime} {formatDate(item.endDate)}</div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                                        {item.personnelAssignments?.length || 0} người
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                                        {item.vehicleIds?.length || 0} xe
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-right sticky right-0 bg-white/95 shadow-[-4px_0_10px_rgba(0,0,0,0.05)]">
                                                    <div className="flex justify-end gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-[#4361ee] hover:text-[#4361ee] hover:bg-[#4361ee]/10"
                                                            onClick={() => handleEdit(item)}
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-[#f72585] hover:text-[#f72585] hover:bg-[#f72585]/10"
                                                            onClick={() => handleDelete(item.id)}
                                                            title="Xoá"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-[#3a0ca3] hover:text-[#3a0ca3] hover:bg-[#3a0ca3]/10"
                                                            onClick={() => handleDownload(item)}
                                                            title="Tải mẫu DOCX"
                                                        >
                                                            <Download className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                    {workOutlines.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                                                Chưa có dữ liệu Đề cương công tác.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </GlassCard>
                )}
            </div>

            <WorkOutlineForm
                open={isFormOpen}
                onOpenChange={setIsFormOpen}
                initialData={editingOutline}
                onSubmit={handleSubmit}
                schedules={schedules}
                personnel={personnel}
                vehicles={vehicles}
                contracts={contracts}
            />
        </div>
    );
}
