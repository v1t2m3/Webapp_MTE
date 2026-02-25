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
import { Personnel } from "@/types";
import { Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PersonnelTableProps {
    data: Personnel[];
    onEdit?: (personnel: Personnel) => void;
    onDelete?: (id: string) => void;
}

export function PersonnelTable({ data, onEdit, onDelete }: PersonnelTableProps) {
    return (
        <div className="rounded-md border bg-card text-card-foreground shadow-sm animate-fade-in">
            <Table>
                <TableHeader>
                    <TableRow className="bg-muted/50">
                        <TableHead className="w-[100px]">ID</TableHead>
                        <TableHead>Họ và tên</TableHead>
                        <TableHead>Năm sinh</TableHead>
                        <TableHead>Nghề nghiệp</TableHead>
                        <TableHead>Bậc nghề</TableHead>
                        <TableHead>Bậc an toàn</TableHead>
                        <TableHead>Trình độ</TableHead>
                        <TableHead>Loại HĐLĐ</TableHead>
                        <TableHead>Nghỉ phép</TableHead>
                        <TableHead className="text-right">Thao tác</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.map((item, index) => (
                        <TableRow
                            key={item.id}
                            className={`hover:bg-muted/50 transition-colors animate-slide-up ${item.leaveDates && item.leaveDates.length > 0 ? "bg-amber-50/30" : ""}`}
                            style={{ animationDelay: `${index * 0.05}s` }}
                        >
                            <TableCell className="font-medium">{item.id}</TableCell>
                            <TableCell className="font-semibold text-primary">{item.fullName}</TableCell>
                            <TableCell>{item.birthYear}</TableCell>
                            <TableCell>{item.job}</TableCell>
                            <TableCell>
                                <Badge variant="outline" className="border-accent text-accent-foreground">
                                    {item.skillLevel}
                                </Badge>
                            </TableCell>
                            <TableCell>{item.safetyLevel}</TableCell>
                            <TableCell>{item.education}</TableCell>
                            <TableCell>
                                <Badge
                                    variant="outline"
                                    className={`whitespace-nowrap ${item.contractType === "Không thời hạn" ? "bg-[#4cc9f0]/10 text-[#3a0ca3] border-[#4cc9f0]/20" :
                                        item.contractType === "Thử việc" ? "bg-[#f72585]/10 text-[#f72585] border-[#f72585]/20" :
                                            "bg-[#4361ee]/10 text-[#4361ee] border-[#4361ee]/20"
                                        }`}
                                >
                                    {item.contractType}
                                </Badge>
                            </TableCell>
                            <TableCell>
                                {(() => {
                                    const currentYear = new Date().getFullYear().toString();
                                    const leavesThisYear = item.leaveDates?.filter(d => d.startsWith(currentYear)).length || 0;
                                    const isOnLeaveToday = item.status === "On Leave";

                                    if (isOnLeaveToday) {
                                        return (
                                            <Badge
                                                variant="outline"
                                                className={`whitespace-nowrap ${item.leaveType === "phép" ? "bg-amber-100/50 text-amber-700 border-amber-200" :
                                                    item.leaveType === "bù" ? "bg-orange-100/50 text-orange-700 border-orange-200" :
                                                        "bg-red-100/50 text-red-700 border-red-200"
                                                    }`}
                                            >
                                                Nghỉ {item.leaveType} - {leavesThisYear}
                                            </Badge>
                                        );
                                    }

                                    return (
                                        <span className="text-muted-foreground font-medium text-sm">
                                            {leavesThisYear > 0 ? leavesThisYear : "-"}
                                        </span>
                                    );
                                })()}
                            </TableCell>
                            <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
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
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
