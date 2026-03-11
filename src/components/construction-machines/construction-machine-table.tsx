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
import { ConstructionMachine } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2 } from "lucide-react";

export function ConstructionMachineTable({
    data,
    onEdit,
    onDelete
}: {
    data: ConstructionMachine[];
    onEdit?: (item: ConstructionMachine) => void;
    onDelete?: (id: string) => void;
}) {
    const sortedData = useMemo(() => {
        return [...data].sort((a, b) => {
            const getPriority = (status: string) => {
                const s = status.toLowerCase();
                if (s === "thanh lý" || s.includes("thanh lý")) return 5;
                if (s === "đang hư hỏng" || s.includes("hỏng")) return 4;
                return 1; // đang sử dụng
            };

            const prioA = getPriority(a.status);
            const prioB = getPriority(b.status);

            if (prioA !== prioB) return prioA - prioB;
            
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
                        <TableHead className="text-slate-700 dark:text-slate-300 font-semibold whitespace-nowrap min-w-[150px]">Tên máy thi công</TableHead>
                        <TableHead className="text-slate-700 dark:text-slate-300 font-semibold whitespace-nowrap">Số Serial</TableHead>
                        <TableHead className="text-slate-700 dark:text-slate-300 font-semibold whitespace-nowrap">Vị trí</TableHead>
                        <TableHead className="text-slate-700 dark:text-slate-300 font-semibold whitespace-nowrap">Trạng thái</TableHead>
                        <TableHead className="text-slate-700 dark:text-slate-300 w-[120px] text-right">Thao tác</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {sortedData.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={5} className="h-32 text-center text-slate-500">
                                Chưa có dữ liệu Máy thi công. Vui lòng thêm dữ liệu vào phần mềm hoặc Sheet "Cons_Machin".
                            </TableCell>
                        </TableRow>
                    ) : (
                        sortedData.map((item) => {
                            const statusLower = item.status.toLowerCase();
                            const isLiquidated = statusLower === "thanh lý" || statusLower.includes("thanh lý");
                            const isBroken = statusLower === "đang hư hỏng" || statusLower.includes("hỏng");
                            const isUsing = !isLiquidated && !isBroken;

                            const badgeClasses = isLiquidated
                                ? "bg-slate-500/10 text-slate-400 border-slate-500/50 shadow-[0_0_10px_rgba(100,116,139,0.2)]"
                                : isBroken
                                    ? "bg-red-500/10 text-red-500 border-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.2)]"
                                    : "bg-emerald-500/10 text-emerald-400 border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.2)]";

                            const rowClasses = `transition-all duration-200 ${isLiquidated
                                ? "opacity-60 grayscale hover:opacity-80 bg-slate-50/50 dark:bg-slate-900/20"
                                : "hover:bg-slate-50/80 dark:hover:bg-slate-800/40"
                            }`;

                            return (
                                <TableRow key={item.id} className={rowClasses}>
                                    <TableCell className="font-medium text-slate-900 dark:text-slate-100">{item.name}</TableCell>
                                    <TableCell className="text-slate-600 dark:text-slate-400 font-mono text-sm">{item.serialNumber}</TableCell>
                                    <TableCell className="text-slate-600 dark:text-slate-400">{item.location}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={`font-medium whitespace-nowrap ${badgeClasses}`}>
                                            {item.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            {onEdit && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-[#4cc9f0] border border-transparent hover:border-[#4cc9f0]/50 hover:bg-[#4cc9f0]/10 hover:shadow-[0_0_10px_rgba(76,201,240,0.3)] transition-all"
                                                    onClick={() => onEdit(item)}
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
                                                    title="Xóa máy thi công"
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
