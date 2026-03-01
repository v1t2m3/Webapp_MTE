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
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";

export function IsoPersonnelTable({
    data,
    onEdit,
    onDelete
}: {
    data: Personnel[];
    onEdit?: (item: Personnel) => void;
    onDelete?: (id: string) => void;
}) {
    return (
        <div className="rounded-md border bg-white dark:bg-slate-900/50 dark:border-slate-800 shadow-sm overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow className="bg-muted/30 dark:bg-slate-800/60 hover:bg-muted/30">
                        {/* ID Column is intentionally hidden based on user request */}
                        <TableHead className="text-slate-800 dark:text-slate-200 font-bold whitespace-nowrap min-w-[150px]">Họ và Tên</TableHead>
                        <TableHead className="text-slate-800 dark:text-slate-200 font-bold whitespace-nowrap">Phòng ban</TableHead>
                        <TableHead className="text-slate-800 dark:text-slate-200 font-bold whitespace-nowrap">Chức vụ</TableHead>
                        <TableHead className="text-slate-800 dark:text-slate-200 font-bold whitespace-nowrap">Các phương pháp<br />được phép</TableHead>
                        <TableHead className="text-slate-800 dark:text-slate-200 font-bold whitespace-nowrap">Các thiết bị<br />được phép</TableHead>
                        <TableHead className="text-slate-800 dark:text-slate-200 font-bold whitespace-nowrap">Ngày đào tạo<br />gần nhất</TableHead>
                        <TableHead className="text-slate-800 dark:text-slate-200 font-bold whitespace-nowrap">Trạng thái</TableHead>
                        {(onEdit || onDelete) && (
                            <TableHead className="text-right text-slate-800 dark:text-slate-200 font-bold whitespace-nowrap">Thao tác</TableHead>
                        )}
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
                                {(onEdit || onDelete) && (
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-1">
                                            {onEdit && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-[#4361ee] hover:text-[#4361ee] hover:bg-[#4361ee]/10"
                                                    onClick={() => onEdit(item)}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                            )}
                                            {onDelete && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-[#f72585] hover:text-[#f72585] hover:bg-[#f72585]/10"
                                                    onClick={() => onDelete(item.id)}
                                                    title="Xoá"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </TableCell>
                                )}
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
