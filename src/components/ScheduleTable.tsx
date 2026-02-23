"use client";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Schedule, Contract } from "@/types";
import { Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMemo } from "react";

interface ScheduleTableProps {
    data: Schedule[];
    contracts?: Contract[];
    onEdit?: (schedule: Schedule) => void;
    onDelete?: (id: string) => void;
    overlapMap: Map<string, number>;
    overlapColors: string[];
    onHover?: (id: string | null) => void;
}

export function ScheduleTable({ data, contracts = [], onEdit, onDelete, overlapMap, overlapColors, onHover }: ScheduleTableProps) {
    const getContractDisplay = (id?: string) => {
        if (!id) return "---";
        const contract = contracts.find(c => c.id === id);
        return contract ? `${contract.code} - ${contract.name}` : id;
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
        <div className="rounded-md border bg-card text-card-foreground shadow-sm overflow-x-auto min-w-full">
            <Table className="whitespace-nowrap">
                <TableHeader>
                    <TableRow className="bg-muted/50">
                        <TableHead>Đơn vị</TableHead>
                        <TableHead>Tên ĐD/TBA/Tổ máy</TableHead>
                        <TableHead>Bắt đầu</TableHead>
                        <TableHead>Kết thúc</TableHead>
                        <TableHead>Đối tượng</TableHead>
                        <TableHead className="w-[300px]">Nội dung</TableHead>
                        <TableHead>Loại hình</TableHead>
                        <TableHead className="text-right sticky right-0 bg-white shadow-[-4px_0_10px_rgba(0,0,0,0.05)]">Thao tác</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.map((item, index) => {
                        const overlapIndex = overlapMap.get(item.id);
                        const rowColorClass = overlapIndex !== undefined
                            ? overlapColors[overlapIndex % overlapColors.length]
                            : "hover:bg-muted/50";

                        return (
                            <TableRow
                                key={item.id}
                                className={`${rowColorClass} transition-colors animate-slide-up align-top`}
                                style={{ animationDelay: `${index * 0.05}s` }}
                                onMouseEnter={() => onHover && onHover(item.id)}
                                onMouseLeave={() => onHover && onHover(null)}
                            >
                                <TableCell className="font-semibold text-primary">{item.unit}</TableCell>
                                <TableCell className="max-w-[150px] truncate" title={item.deviceName}>{item.deviceName}</TableCell>
                                <TableCell>
                                    <div className="flex flex-col text-xs">
                                        <span className="font-semibold text-blue-700">{item.startTime}</span>
                                        <span className="text-muted-foreground">{formatDate(item.startDate)}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col text-xs">
                                        <span className="font-semibold text-pink-700">{item.endTime}</span>
                                        <span className="text-muted-foreground">{formatDate(item.endDate)}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="max-w-[150px] whitespace-normal break-words">{item.target}</TableCell>
                                <TableCell className="w-[300px] whitespace-normal break-words">{item.content}</TableCell>
                                <TableCell>
                                    <Badge variant="outline" className={`${item.type !== "Cắt điện" ? "bg-[#4cc9f0]/10 text-[#3a0ca3] border-[#4cc9f0]/20" : "bg-[#f72585]/10 text-[#f72585] border-[#f72585]/20"}`}>
                                        {item.type}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right sticky right-0 bg-transparent shadow-[-4px_0_10px_rgba(0,0,0,0.05)]">
                                    <div className="flex justify-end gap-1">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-[#4361ee] hover:text-[#4361ee] hover:bg-[#4361ee]/10"
                                            onClick={() => onEdit && onEdit(item)}
                                        >
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-[#f72585] hover:text-[#f72585] hover:bg-[#f72585]/10"
                                            onClick={() => onDelete && onDelete(item.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                    {data.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={8} className="text-center h-24 text-muted-foreground">
                                Chưa có dữ liệu Lịch công tác.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}

