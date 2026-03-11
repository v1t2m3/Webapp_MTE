"use client";

import { useMemo } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Equipment } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Edit2, FileText, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const parseDateStr = (dateStr: string) => {
    if (!dateStr) return null;
    const parts = dateStr.split('/');
    if (parts.length === 3) {
        return new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
    } else if (dateStr.includes('-')) {
        return new Date(dateStr);
    }
    return null;
};

const getEquipmentDerivedStatus = (item: Equipment, today: Date) => {
    let displayStatus = item.status || "Đang hoạt động";
    const baseStatusLower = displayStatus.toLowerCase();
    const isLiquidatedRow = baseStatusLower.includes("thanh lý") || baseStatusLower === "disposed" || baseStatusLower === "đã thanh lý";
    const isBrokenRow = baseStatusLower.includes("broken") || baseStatusLower.includes("hư hỏng") || baseStatusLower.includes("đang hỏng") || baseStatusLower.includes("bị hỏng");

    if (!isLiquidatedRow && !isBrokenRow) {
        const lastDate = item.lastCalibrationDate ? parseDateStr(item.lastCalibrationDate) : null;
        const nextDate = item.nextCalibrationDate ? parseDateStr(item.nextCalibrationDate) : null;

        if (lastDate && nextDate) {
            if (today < lastDate || today > nextDate) {
                displayStatus = "Chờ hiệu chuẩn";
            }
        } else if (nextDate) {
            if (today > nextDate) {
                displayStatus = "Chờ hiệu chuẩn";
            }
        }
    }
    return {
        displayStatus,
        isLiquidated: isLiquidatedRow,
        isBroken: isBrokenRow,
        isPendingCalibration: displayStatus === "Chờ hiệu chuẩn" || displayStatus.toLowerCase().includes("chờ h/c")
    };
};

export function EquipmentTable({ data, onEdit, onDelete }: { data: Equipment[], onEdit?: (item: Equipment) => void, onDelete?: (id: string) => void }) {
    const sortedData = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return [...data].sort((a, b) => {
            const statusA = getEquipmentDerivedStatus(a, today);
            const statusB = getEquipmentDerivedStatus(b, today);
            
            const getPriority = (s: ReturnType<typeof getEquipmentDerivedStatus>) => {
                if (s.isLiquidated) return 5;
                if (s.isBroken) return 4;
                if (s.isPendingCalibration) return 3;
                return 1; // Active / normal is priority 1. Inter-active priority 2 will be handled by name.
            };

            const prioA = getPriority(statusA);
            const prioB = getPriority(statusB);

            if (prioA !== prioB) return prioA - prioB;
            
            // Priority 2: Sort by name if both are in same pool
            const nameA = a.name || "";
            const nameB = b.name || "";
            return nameA.localeCompare(nameB);
        });
    }, [data]);

    return (
        <div className="rounded-xl border border-slate-200 bg-white/70 backdrop-blur-md dark:bg-slate-900/50 dark:border-slate-800 shadow-sm overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow className="bg-slate-50/80 dark:bg-slate-800/60 hover:bg-slate-50/80 border-b-slate-200 dark:border-b-slate-800">
                        <TableHead className="text-slate-700 dark:text-slate-300 font-semibold whitespace-nowrap min-w-[150px]">Tên thiết bị</TableHead>
                        <TableHead className="text-slate-700 dark:text-slate-300 font-semibold whitespace-nowrap">Số Serial</TableHead>
                        <TableHead className="text-slate-700 dark:text-slate-300 font-semibold whitespace-nowrap">Vị trí</TableHead>
                        <TableHead className="text-slate-700 dark:text-slate-300 font-semibold whitespace-nowrap">Chu kỳ H/C</TableHead>
                        {/* <TableHead className="text-slate-700 dark:text-slate-300 font-semibold whitespace-nowrap">Ngày H/C gần nhất</TableHead> */}
                        <TableHead className="text-slate-700 dark:text-slate-300 font-semibold whitespace-nowrap">Ngày H/C tiếp theo</TableHead>
                        <TableHead className="text-slate-700 dark:text-slate-300 font-semibold whitespace-nowrap">Đơn vị H/C</TableHead>
                        <TableHead className="text-slate-700 dark:text-slate-300 font-semibold whitespace-nowrap">BBKĐ/HC</TableHead>
                        <TableHead className="text-slate-700 dark:text-slate-300 font-semibold whitespace-nowrap">Trạng thái</TableHead>
                        <TableHead className="text-slate-700 dark:text-slate-300 w-[120px] text-right">Thao tác</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {sortedData.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={10} className="h-32 text-center text-slate-500">
                                Chưa có dữ liệu thiết bị. Vui lòng thêm dữ liệu vào phần Equipments.
                            </TableCell>
                        </TableRow>
                    ) : (
                        sortedData.map((item) => {
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);
                            const derived = getEquipmentDerivedStatus(item, today);
                            let displayStatus = derived.displayStatus;
                            const isLiquidatedRow = derived.isLiquidated;
                            const isBrokenRow = derived.isBroken;

                            const displayStatusLower = displayStatus.toLowerCase();

                            const isBroken = displayStatusLower.includes("broken") || displayStatusLower.includes("hư hỏng") || displayStatusLower.includes("đang hỏng") || displayStatusLower.includes("bị hỏng");
                            const isCalibrating = displayStatusLower === "calibrating" || displayStatusLower.includes("đang hiệu chuẩn");
                            const isPendingCalibration = displayStatusLower === "chờ hiệu chuẩn" || displayStatusLower.includes("chờ h/c");

                            // It is active if it's not any of the special states
                            const isActive = !isLiquidatedRow && !isBroken && !isCalibrating && !isPendingCalibration;

                            const badgeClasses = isLiquidatedRow
                                ? "bg-slate-500/10 text-slate-400 border-slate-500/50 shadow-[0_0_10px_rgba(100,116,139,0.2)]"
                                : isBroken
                                    ? "bg-red-500/10 text-red-500 border-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.2)]"
                                    : isCalibrating
                                        ? "bg-amber-500/10 text-amber-500 border-amber-500/50 shadow-[0_0_10px_rgba(245,158,11,0.2)]"
                                        : isPendingCalibration
                                            ? "bg-orange-500/10 text-orange-500 border-orange-500/50 shadow-[0_0_10px_rgba(249,115,22,0.2)]"
                                            : isActive
                                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.2)]"
                                                : "bg-blue-500/10 text-blue-500 border-blue-500/50 shadow-[0_0_10px_rgba(59,130,246,0.2)]";

                            // If liquidated, make row visually muted/disabled
                            const rowClasses = `transition-all duration-200 ${isLiquidatedRow
                                ? "opacity-60 grayscale hover:opacity-80 bg-slate-50/50 dark:bg-slate-900/20"
                                : "hover:bg-slate-50/80 dark:hover:bg-slate-800/40"
                                }`;

                            return (
                                <TableRow key={item.id} className={rowClasses}>
                                    <TableCell className="font-medium text-slate-900 dark:text-slate-100">{item.name}</TableCell>
                                    <TableCell className="text-slate-600 dark:text-slate-400 font-mono text-sm">{item.serialNumber}</TableCell>
                                    <TableCell className="text-slate-600 dark:text-slate-400">{item.location}</TableCell>
                                    <TableCell className="text-slate-600 dark:text-slate-400 whitespace-nowrap">
                                        {item.calibrationFrequency} {item.calibrationFrequency && !isNaN(Number(item.calibrationFrequency)) && "tháng"}
                                    </TableCell>
                                    {/* <TableCell className="text-slate-600 dark:text-slate-400">{item.lastCalibrationDate}</TableCell> */}
                                    <TableCell className="text-slate-600 dark:text-slate-400">{item.nextCalibrationDate}</TableCell>
                                    <TableCell className="text-slate-600 dark:text-slate-400">{item.calibrationAgent}</TableCell>
                                    <TableCell>
                                        {item.calibrationReportUrl ? (
                                            <a 
                                                href={`${item.calibrationReportUrl}#page=${item.calibrationReportPage || "01"}`}
                                                target="_blank" 
                                                rel="noopener noreferrer" 
                                                className="inline-flex items-center justify-center h-8 w-8 text-[#4cc9f0] bg-[#4cc9f0]/5 hover:bg-[#4cc9f0]/20 rounded-md border border-[#4cc9f0]/30 hover:border-[#4cc9f0]/80 shadow-[0_0_8px_rgba(76,201,240,0.15)] hover:shadow-[0_0_12px_rgba(76,201,240,0.4)] transition-all" 
                                                title="Xem BBKĐ/HC"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-file-text"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/></svg>
                                            </a>
                                        ) : (
                                            <span className="text-slate-400 italic text-sm">-</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={`font-medium whitespace-nowrap ${badgeClasses}`}>
                                            {displayStatus}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            {onEdit && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-[#4cc9f0] border border-transparent hover:border-[#4cc9f0]/50 hover:bg-[#4cc9f0]/10 hover:shadow-[0_0_10px_rgba(76,201,240,0.3)] transition-all"
                                                    onClick={() => onEdit({ ...item, status: displayStatus })}
                                                    title="Chỉnh sửa"
                                                >
                                                    <Edit2 className="h-4 w-4" />
                                                </Button>
                                            )}
                                            {onDelete && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-[#f72585] border border-transparent hover:border-[#f72585]/50 hover:bg-[#f72585]/10 hover:shadow-[0_0_10px_rgba(247,37,133,0.3)] transition-all"
                                                    onClick={() => onDelete(item.id)}
                                                    title="Xóa thiết bị"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            );
                        })
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
