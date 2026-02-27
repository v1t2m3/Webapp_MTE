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

export function PersonnelTable({ data }: { data: Personnel[] }) {
    return (
        <div className="rounded-md border bg-white dark:bg-slate-900/50 dark:border-slate-800 shadow-sm overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow className="bg-muted/30 dark:bg-slate-800/60 hover:bg-muted/30">
                        <TableHead className="text-slate-800 dark:text-slate-200 font-bold">Mã NV</TableHead>
                        <TableHead className="text-slate-800 dark:text-slate-200 font-bold">Họ và Tên</TableHead>
                        <TableHead className="text-slate-800 dark:text-slate-200 font-bold">Chức vụ</TableHead>
                        <TableHead className="text-slate-800 dark:text-slate-200 font-bold">Phòng ban</TableHead>
                        <TableHead className="text-slate-800 dark:text-slate-200 font-bold">Trạng thái</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.map((item) => (
                        <TableRow key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors">
                            <TableCell className="font-medium text-slate-900 dark:text-slate-100">{item.id}</TableCell>
                            <TableCell className="text-slate-700 dark:text-slate-300 font-semibold">{item.name}</TableCell>
                            <TableCell className="text-slate-600 dark:text-slate-400">{item.position}</TableCell>
                            <TableCell className="text-slate-600 dark:text-slate-400">{item.department}</TableCell>
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
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
