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
                        <TableHead className="text-slate-700 dark:text-slate-300 font-semibold whitespace-nowrap">Ngày H/C gần nhất</TableHead>
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
                                ? "bg-slate-100/80 text-slate-500 border-transparent dark:bg-slate-800/50 dark:text-slate-400"
                                : isBroken
                                    ? "bg-red-50 text-red-600 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-900/50"
                                    : isCalibrating
                                        ? "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/50"
                                        : isPendingCalibration
                                            ? "bg-orange-50 text-orange-600 border-orange-200 dark:bg-orange-950/30 dark:text-orange-400 dark:border-orange-900/50"
                                            : isActive
                                                ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/50"
                                                : "bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900/50";

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
                                    <TableCell className="text-slate-600 dark:text-slate-400">{item.lastCalibrationDate}</TableCell>
                                    <TableCell className="text-slate-600 dark:text-slate-400">{item.nextCalibrationDate}</TableCell>
                                    <TableCell className="text-slate-600 dark:text-slate-400">{item.calibrationAgent}</TableCell>
                                    <TableCell>
                                        {item.calibrationReportUrl ? (
                                            <Button 
                                                variant="outline" 
                                                size="sm" 
                                                className="h-8 shadow-sm flex items-center bg-blue-50/50 hover:bg-blue-100 text-blue-700 border-blue-200"
                                                onClick={() => {
                                                    const page = item.calibrationReportPage || "01";
                                                    window.open(`${item.calibrationReportUrl}#page=${page}`, "_blank");
                                                }}
                                            >
                                                <FileText className="w-3.5 h-3.5 mr-1.5" />
                                                Xem
                                            </Button>
                                        ) : (
                                            <span className="text-slate-400 italic text-sm">-</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={`font-medium shadow-sm whitespace-nowrap ${badgeClasses}`}>
                                            {displayStatus}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            {onEdit && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/40"
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
                                                    className="h-8 w-8 text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/40"
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
