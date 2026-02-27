"use client";

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

export function EquipmentTable({ data }: { data: Equipment[] }) {
    return (
        <div className="rounded-md border bg-white dark:bg-slate-900/50 dark:border-slate-800 shadow-sm overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow className="bg-muted/30 dark:bg-slate-800/60 hover:bg-muted/30">
                        <TableHead className="text-slate-800 dark:text-slate-200 font-bold whitespace-nowrap min-w-[150px]">Tên thiết bị</TableHead>
                        <TableHead className="text-slate-800 dark:text-slate-200 font-bold whitespace-nowrap">Số Serial</TableHead>
                        <TableHead className="text-slate-800 dark:text-slate-200 font-bold whitespace-nowrap">Vị trí</TableHead>
                        <TableHead className="text-slate-800 dark:text-slate-200 font-bold whitespace-nowrap">Chu kỳ H/C (tháng)</TableHead>
                        <TableHead className="text-slate-800 dark:text-slate-200 font-bold whitespace-nowrap">Ngày H/C gần nhất</TableHead>
                        <TableHead className="text-slate-800 dark:text-slate-200 font-bold whitespace-nowrap">Ngày H/C tiếp theo</TableHead>
                        <TableHead className="text-slate-800 dark:text-slate-200 font-bold whitespace-nowrap">Đơn vị H/C</TableHead>
                        <TableHead className="text-slate-800 dark:text-slate-200 font-bold whitespace-nowrap">Trạng thái</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                                Chưa có dữ liệu thiết bị. Vui lòng thêm dữ liệu vào Google Sheet "Equipments ".
                            </TableCell>
                        </TableRow>
                    ) : (
                        data.map((item) => (
                            <TableRow key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors">
                                <TableCell className="text-slate-700 dark:text-slate-300 font-semibold">{item.name}</TableCell>
                                <TableCell className="text-slate-600 dark:text-slate-400">{item.serialNumber}</TableCell>
                                <TableCell className="text-slate-600 dark:text-slate-400">{item.location}</TableCell>
                                <TableCell className="text-slate-600 dark:text-slate-400">{item.calibrationFrequency}</TableCell>
                                <TableCell className="text-slate-600 dark:text-slate-400">{item.lastCalibrationDate}</TableCell>
                                <TableCell className="text-slate-600 dark:text-slate-400">{item.nextCalibrationDate}</TableCell>
                                <TableCell className="text-slate-600 dark:text-slate-400">{item.calibrationAgent}</TableCell>
                                <TableCell>
                                    <Badge
                                        variant={
                                            item.status.toLowerCase().includes("thanh lý") || item.status.toLowerCase() === "disposed" || item.status.toLowerCase() === "broken"
                                                ? "destructive"
                                                : item.status.toLowerCase() === "active" || item.status.toLowerCase().includes("tốt")
                                                    ? "default"
                                                    : "secondary"
                                        }
                                    >
                                        {item.status}
                                    </Badge>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
