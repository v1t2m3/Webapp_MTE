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
                        <TableHead className="text-slate-800 dark:text-slate-200 font-bold whitespace-nowrap">Hồ sơ đính kèm</TableHead>
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
                                    {item.profileLink ? (
                                        <a 
                                            href={item.profileLink} 
                                            target="_blank" 
                                            rel="noopener noreferrer" 
                                            className="inline-flex items-center justify-center h-8 w-8 text-[#4cc9f0] bg-[#4cc9f0]/5 hover:bg-[#4cc9f0]/20 rounded-md border border-[#4cc9f0]/30 hover:border-[#4cc9f0]/80 shadow-[0_0_8px_rgba(76,201,240,0.15)] hover:shadow-[0_0_12px_rgba(76,201,240,0.4)] transition-all" 
                                            title="Xem hồ sơ"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-file-text"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/></svg>
                                        </a>
                                    ) : (
                                        <span className="text-slate-400 italic text-sm select-none">-</span>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <Badge
                                        variant="outline"
                                        className={`font-medium whitespace-nowrap ${
                                            item.status === "Hoạt động"
                                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.2)]"
                                                : "bg-orange-500/10 text-orange-400 border-orange-500/50 shadow-[0_0_10px_rgba(249,115,22,0.2)]"
                                        }`}
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
                                                    className="h-8 w-8 text-[#4cc9f0] border border-transparent hover:border-[#4cc9f0]/50 hover:bg-[#4cc9f0]/10 hover:shadow-[0_0_10px_rgba(76,201,240,0.3)] transition-all"
                                                    onClick={() => onEdit(item)}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                            )}
                                            {onDelete && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-[#f72585] border border-transparent hover:border-[#f72585]/50 hover:bg-[#f72585]/10 hover:shadow-[0_0_10px_rgba(247,37,133,0.3)] transition-all"
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
