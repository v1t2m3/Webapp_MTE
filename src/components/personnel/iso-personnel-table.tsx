"use client";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Personnel } from "@/types";
import { Badge } from "@/components/ui/badge";

export function IsoPersonnelTable({ data }: { data: Personnel[] }) {
    return (
        <div className="rounded-md border bg-white dark:bg-slate-900/50 dark:border-slate-800 shadow-sm overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow className="bg-muted/30 dark:bg-slate-800/60 hover:bg-muted/30">
                        {/* ID Column is intentionally hidden based on user request */}
                        <TableHead className="text-slate-800 dark:text-slate-200 font-bold whitespace-nowrap min-w-[150px]">Họ và Tên</TableHead>
                        <TableHead className="text-slate-800 dark:text-slate-200 font-bold whitespace-nowrap">Phòng ban</TableHead>
                        <TableHead className="text-slate-800 dark:text-slate-200 font-bold whitespace-nowrap">Chức vụ</TableHead>
                        <TableHead className="text-slate-800 dark:text-slate-200 font-bold">Các phương pháp được phép</TableHead>
                        <TableHead className="text-slate-800 dark:text-slate-200 font-bold">Các thiết bị được phép</TableHead>
                        <TableHead className="text-slate-800 dark:text-slate-200 font-bold whitespace-nowrap">Ngày đào tạo gần nhất</TableHead>
                        <TableHead className="text-slate-800 dark:text-slate-200 font-bold whitespace-nowrap">Trạng thái</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                                Chưa có dữ liệu nhân sự ISO 17025. Vui lòng thêm dữ liệu vào Google Sheet "Personel".
                            </TableCell>
                        </TableRow>
                    ) : (
                        data.map((item) => (
                            <TableRow key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors">
                                <TableCell className="text-slate-700 dark:text-slate-300 font-semibold">{item.name}</TableCell>
                                <TableCell className="text-slate-600 dark:text-slate-400">{item.department}</TableCell>
                                <TableCell className="text-slate-600 dark:text-slate-400">{item.job || item.position}</TableCell>
                                <TableCell className="text-slate-600 dark:text-slate-400 max-w-[200px] truncate" title={item.authorizedMethods}>
                                    {item.authorizedMethods}
                                </TableCell>
                                <TableCell className="text-slate-600 dark:text-slate-400 max-w-[200px] truncate" title={item.authorizedEquipments}>
                                    {item.authorizedEquipments}
                                </TableCell>
                                <TableCell className="text-slate-600 dark:text-slate-400">{item.lastTrainingDate}</TableCell>
                                <TableCell>
                                    <Badge
                                        variant={
                                            item.status === "Active"
                                                ? "default"
                                                : item.status === "On Leave"
                                                    ? "secondary"
                                                    : "destructive"
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
