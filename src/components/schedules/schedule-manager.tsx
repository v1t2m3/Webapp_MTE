"use client";

import { useState, useEffect, useCallback } from "react";
import { Schedule, Contract } from "@/types";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { GlassCard, GlassPageHeader } from "@/components/ui/GlassCard";
import { ScheduleTable } from "@/components/ScheduleTable";
import { ScheduleForm } from "@/components/ScheduleForm";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

function getWeekNumber(d: Date) {
    const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
    return Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

export function ScheduleManager() {
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [contracts, setContracts] = useState<Contract[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
    const [hoveredScheduleId, setHoveredScheduleId] = useState<string | null>(null);

    // Filters
    const [filterTime, setFilterTime] = useState("Tất cả");
    const [filterUnit, setFilterUnit] = useState("Tất cả");
    const [filterType, setFilterType] = useState("Tất cả");

    const overlapColors = [
        "bg-[#f72585]/10 text-[#f72585]", // Pink pale
        "bg-[#4361ee]/10 text-[#4361ee]", // Blue pale
        "bg-[#4cc9f0]/10 text-[#4cc9f0]", // Sky pale
        "bg-[#7209b7]/10 text-[#7209b7]", // Purple pale
        "bg-[#f8961e]/10 text-[#f8961e]", // Orange pale
    ];

    const overlapColorsStrong = [
        "bg-[#f72585] text-white shadow-md font-bold scale-110", // Pink
        "bg-[#4361ee] text-white shadow-md font-bold scale-110", // Blue
        "bg-[#4cc9f0] text-white shadow-md font-bold scale-110", // Sky
        "bg-[#7209b7] text-white shadow-md font-bold scale-110", // Purple
        "bg-[#f8961e] text-white shadow-md font-bold scale-110", // Orange
    ];

    const fetchSchedules = useCallback(async () => {
        try {
            setLoading(true);
            const [schedulesRes, contractsRes] = await Promise.all([
                fetch("/api/schedules"),
                fetch("/api/contracts")
            ]);

            const schedulesData = await schedulesRes.json();
            const contractsData = await contractsRes.json();

            if (Array.isArray(schedulesData)) {
                setSchedules(schedulesData);
            }
            if (Array.isArray(contractsData)) {
                setContracts(contractsData);
            }
        } catch (error) {
            console.error("Failed to fetch data:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSchedules();
    }, [fetchSchedules]);

    const handleSubmit = async (data: Partial<Schedule>) => {
        try {
            const isEditing = !!data.id;
            const url = "/api/schedules";
            const method = isEditing ? "PUT" : "POST";

            // Generate a fake ID if creating new and saving to sheet
            const payload = {
                ...data,
                id: isEditing ? data.id : `LCT${Date.now()}`
            };

            const response = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!response.ok) throw new Error("Failed to save schedule");
            await fetchSchedules();
        } catch (error) {
            console.error(error);
            alert("Lỗi khi lưu lịch công tác");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Bạn có chắc chắn muốn xóa lịch này?")) return;
        try {
            const response = await fetch(`/api/schedules?id=${id}`, { method: "DELETE" });
            if (!response.ok) throw new Error("Failed to delete schedule");
            await fetchSchedules();
        } catch (error) {
            console.error(error);
            alert("Lỗi khi xóa lịch công tác");
        }
    };

    const handleEdit = (schedule: Schedule) => {
        setEditingSchedule(schedule);
        setIsFormOpen(true);
    };

    const handleOpenNew = () => {
        setEditingSchedule(null);
        setIsFormOpen(true);
    };

    // Current Time Info
    const now = new Date();
    const isTodayStr = now.toLocaleDateString("vi-VN");

    const filteredSchedules = schedules.filter(s => {
        // Unit Filter
        if (filterUnit !== "Tất cả" && s.unit !== filterUnit) return false;

        // Type Filter
        if (filterType !== "Tất cả" && s.type !== filterType) return false;

        // Time Filter
        if (filterTime !== "Tất cả") {
            const currentWeekFilter = getWeekNumber(now);
            const currentYearFilter = now.getFullYear();
            const sDateStr = s.startDate; // YYYY-MM-DD
            if (sDateStr) {
                const sDate = new Date(sDateStr);
                if (filterTime === "Tuần này") {
                    if (getWeekNumber(sDate) !== currentWeekFilter || sDate.getFullYear() !== currentYearFilter) return false;
                } else if (filterTime === "Tháng này") {
                    if (sDate.getMonth() !== now.getMonth() || sDate.getFullYear() !== currentYearFilter) return false;
                }
            }
        }

        return true;
    });

    const uniqueUnits = Array.from(new Set(schedules.map(s => s.unit))).filter(Boolean);

    // Helper to get precise Date from date string and time string
    const getPreciseDate = (dateStr: string, timeStr: string) => {
        // Assume dateStr is YYYY-MM-DD, timeStr is HH:mm
        return new Date(`${dateStr}T${timeStr}:00`);
    };

    const overlapMap = new Map<string, number>();

    // Step 1: determine overlaps by building groups of intersecting schedules
    const groups: Schedule[][] = [];

    filteredSchedules.forEach((schedule) => {
        const sStart = getPreciseDate(schedule.startDate, schedule.startTime);
        const sEnd = getPreciseDate(schedule.endDate, schedule.endTime);

        let placedInGroup = false;

        for (const group of groups) {
            // Check if schedule overlaps with ANY schedule in this group
            let overlapsWithGroup = false;
            for (const gSchedule of group) {
                const gStart = getPreciseDate(gSchedule.startDate, gSchedule.startTime);
                const gEnd = getPreciseDate(gSchedule.endDate, gSchedule.endTime);

                // Overlap condition: startA < endB AND endA > startB
                if (sStart < gEnd && sEnd > gStart) {
                    overlapsWithGroup = true;
                    break;
                }
            }

            if (overlapsWithGroup) {
                group.push(schedule);
                placedInGroup = true;
                break;
            }
        }

        if (!placedInGroup) {
            groups.push([schedule]);
        }
    });

    // Step 2: assign colors only to groups that actually overlap (size > 1)
    let colorIndex = 0;
    groups.forEach((group) => {
        if (group.length > 1) {
            group.forEach(s => overlapMap.set(s.id, colorIndex));
            colorIndex++;
        }
    });

    const getDaysInMonth = (year: number, month: number) => {
        const date = new Date(year, month, 1);
        const days: Date[] = [];
        let firstDayOfWeek = date.getDay() || 7; // 1 = Monday, 7 = Sunday
        const prevMonthDays = new Date(year, month, 0).getDate();

        for (let i = 1; i < firstDayOfWeek; i++) {
            days.push(new Date(year, month - 1, prevMonthDays - (firstDayOfWeek - 1 - i)));
        }

        while (date.getMonth() === month) {
            days.push(new Date(date));
            date.setDate(date.getDate() + 1);
        }

        const remainingDays = days.length % 7;
        if (remainingDays !== 0) {
            for (let i = 1; i <= 7 - remainingDays; i++) {
                days.push(new Date(year, month + 1, i));
            }
        }

        return days;
    };

    let displayRefDate = now;
    const hoveredSchedule = hoveredScheduleId ? filteredSchedules.find(s => s.id === hoveredScheduleId) : null;
    if (hoveredSchedule && hoveredSchedule.startDate) {
        displayRefDate = new Date(hoveredSchedule.startDate);
    }

    const displayYear = displayRefDate.getFullYear();
    const displayMonth = displayRefDate.getMonth();

    // Header format: mm/yyyy - Tuần week - Quý Quater
    const displayMonthStr = String(displayMonth + 1).padStart(2, '0');
    const weekNumStr = String(getWeekNumber(displayRefDate)).padStart(2, '0');
    const quarter = Math.floor(displayMonth / 3) + 1;
    const quarterRoman = ["I", "II", "III", "IV"][quarter - 1];
    const calendarHeaderTitle = `${displayMonthStr}/${displayYear} - Tuần ${weekNumStr} - Quý ${quarterRoman}`;

    const calendarDays = getDaysInMonth(displayYear, displayMonth);

    return (
        <div className="flex flex-col space-y-6 animate-fade-in">
            <GlassPageHeader
                title="Lịch công tác"
                description="Quản lý lịch trình, cắt điện và phân công công việc."
            >
                <Button onClick={handleOpenNew} className="bg-[#3a0ca3] hover:bg-[#3a0ca3]/90 text-white shadow-lg shadow-blue-900/20 px-6 py-5 rounded-xl font-medium">
                    <Plus className="mr-2 h-5 w-5" /> Thêm Lịch Mới
                </Button>
            </GlassPageHeader>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                <div className="md:col-span-2 space-y-4">
                    <GlassCard className="p-4 flex flex-col items-center sticky top-24 border-l-4 border-l-[#f72585] transition-all duration-300">
                        <h3 className="font-semibold text-sm text-[#3a0ca3] mb-3 w-full text-center border-b pb-2 border-blue-100 uppercase tracking-widest">
                            {calendarHeaderTitle}
                        </h3>
                        <div className="w-full select-none">
                            <div className="grid grid-cols-7 gap-1 text-center font-bold text-[10px] text-gray-500 mb-2">
                                <div>T2</div><div>T3</div><div>T4</div><div>T5</div><div>T6</div><div>T7</div><div>CN</div>
                            </div>
                            <div className="grid grid-cols-7 gap-1">
                                {calendarDays.map((day, idx) => {
                                    const dayStr = day.toLocaleDateString("en-CA"); // YYYY-MM-DD
                                    const isToday = dayStr === now.toLocaleDateString("en-CA");
                                    const isCurrentMonth = day.getMonth() === displayMonth;

                                    let dayColorClass = isCurrentMonth
                                        ? "text-gray-600 hover:bg-gray-100 bg-gray-50/50"
                                        : "text-gray-300 bg-transparent";

                                    let overlapIndex: number | undefined;

                                    if (hoveredSchedule && dayStr >= hoveredSchedule.startDate && dayStr <= hoveredSchedule.endDate) {
                                        overlapIndex = overlapMap.get(hoveredSchedule.id);
                                        if (overlapIndex !== undefined) {
                                            dayColorClass = overlapColorsStrong[overlapIndex % overlapColorsStrong.length] + " z-10 transition-all duration-300";
                                        } else {
                                            dayColorClass = "bg-gray-800 text-white shadow-md font-bold scale-110 z-10 transition-all duration-300";
                                        }
                                    } else {
                                        const schedulesOnDay = filteredSchedules.filter(s => dayStr >= s.startDate && dayStr <= s.endDate);
                                        if (schedulesOnDay.length > 0) {
                                            overlapIndex = overlapMap.get(schedulesOnDay[0].id);
                                            if (overlapIndex !== undefined) {
                                                dayColorClass = isCurrentMonth
                                                    ? overlapColors[overlapIndex % overlapColors.length]
                                                    : "bg-gray-100 text-gray-400"; // paler for non-current month
                                            } else {
                                                dayColorClass = isCurrentMonth ? "bg-gray-200 text-gray-800 font-medium" : "bg-gray-100 text-gray-400";
                                            }
                                        }
                                    }

                                    if (isToday) {
                                        dayColorClass += " ring-2 ring-[#f72585] ring-offset-1 font-bold !text-gray-900";
                                    }

                                    return (
                                        <div key={`day-${idx}-${dayStr}`} title={isToday ? "Hôm nay" : ""} className={`h-7 w-7 flex items-center justify-center rounded-md text-[11px] cursor-default ${dayColorClass}`}>
                                            {day.getDate()}
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </GlassCard>

                    <GlassCard className="p-5 sticky top-80 border-t-4 border-t-[#4cc9f0]">
                        <h3 className="font-semibold text-lg text-[#3a0ca3] mb-4 w-full text-center border-b pb-2 border-blue-100">Bộ lọc công tác</h3>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-xs font-semibold text-gray-500 uppercase">Thời gian</Label>
                                <Select value={filterTime} onValueChange={setFilterTime}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Chọn thời gian" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Tất cả">Tất cả thời gian</SelectItem>
                                        <SelectItem value="Tuần này">Trong tuần này</SelectItem>
                                        <SelectItem value="Tháng này">Trong tháng này</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-semibold text-gray-500 uppercase">Đơn vị</Label>
                                <Select value={filterUnit} onValueChange={setFilterUnit}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Chọn đơn vị" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Tất cả">Tất cả đơn vị</SelectItem>
                                        {uniqueUnits.map(u => (
                                            <SelectItem key={u} value={u}>{u}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-semibold text-gray-500 uppercase">Loại hình</Label>
                                <Select value={filterType} onValueChange={setFilterType}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Chọn loại hình" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Tất cả">Tất cả loại hình</SelectItem>
                                        <SelectItem value="Cắt điện">Cắt điện</SelectItem>
                                        <SelectItem value="Không cắt điện">Không cắt điện</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </GlassCard>
                </div>

                <div className="md:col-span-10">
                    {loading ? (
                        <GlassCard className="h-64 flex items-center justify-center">
                            <div className="animate-pulse text-blue-600 font-medium">Đang tải lịch công tác...</div>
                        </GlassCard>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between px-2">
                                <h2 className="text-xl font-bold text-gray-800 drop-shadow-sm">
                                    Danh sách công tác {filterTime !== "Tất cả" ? `(${filterTime})` : ""}
                                </h2>
                                <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                                    {filteredSchedules.length} lịch
                                </span>
                            </div>
                            <ScheduleTable
                                data={filteredSchedules}
                                contracts={contracts}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                                overlapMap={overlapMap}
                                overlapColors={overlapColors.map(c => c.split(' ')[0])} // Just the bg for the table rows
                                onHover={setHoveredScheduleId}
                            />
                        </div>
                    )}
                </div>
            </div>

            <ScheduleForm
                open={isFormOpen}
                onOpenChange={setIsFormOpen}
                initialData={editingSchedule}
                onSubmit={handleSubmit}
                contracts={contracts}
            />
        </div>
    );
}
