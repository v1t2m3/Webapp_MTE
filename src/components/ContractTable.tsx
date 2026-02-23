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
import { Contract } from "@/types";
import { Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ContractTableProps {
    data: Contract[];
    onEdit?: (contract: Contract) => void;
    onDelete?: (id: string) => void;
}

export function ContractTable({ data, onEdit, onDelete }: ContractTableProps) {
    const formatDate = (dateString?: string) => {
        if (!dateString) return "";
        const parts = dateString.split("-");
        if (parts.length === 3) {
            return `${parts[2]}/${parts[1]}/${parts[0]}`;
        }
        return dateString;
    };

    return (
        <div className="rounded-md border bg-card text-card-foreground shadow-sm animate-fade-in">
            <Table>
                <TableHeader>
                    <TableRow className="bg-muted/50">
                        <TableHead className="w-[80px]">ID</TableHead>
                        <TableHead>Mã HĐ</TableHead>
                        <TableHead>Tên hợp đồng</TableHead>
                        <TableHead>Giá trị</TableHead>
                        <TableHead>Thời hạn</TableHead>
                        <TableHead>Đại diện CĐT</TableHead>
                        <TableHead className="text-right">Thao tác</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.map((item, index) => (
                        <TableRow
                            key={item.id}
                            className="hover:bg-muted/50 transition-colors animate-slide-up"
                            style={{ animationDelay: `${index * 0.05}s` }}
                        >
                            <TableCell className="font-medium">{item.id}</TableCell>
                            <TableCell>
                                <Badge variant="outline" className="font-mono bg-[#4361ee]/10 text-[#4361ee] border-[#4361ee]/20 whitespace-nowrap">
                                    {item.code}
                                </Badge>
                            </TableCell>
                            <TableCell className="font-semibold text-primary max-w-[200px] truncate" title={item.name}>{item.name}</TableCell>
                            <TableCell className="font-mono whitespace-nowrap">{item.value}</TableCell>
                            <TableCell className="whitespace-nowrap">
                                <div className="flex flex-col text-xs text-muted-foreground">
                                    <span>BĐ: {formatDate(item.startDate)}</span>
                                    <span>KT: {formatDate(item.endDate)}</span>
                                </div>
                            </TableCell>
                            <TableCell>{item.investorRep}</TableCell>
                            <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-[#4361ee] hover:text-[#3a0ca3] hover:bg-[#4361ee]/10"
                                        onClick={() => onEdit && onEdit(item)}
                                    >
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-[#f72585] hover:text-[#b5179e] hover:bg-[#f72585]/10"
                                        onClick={() => onDelete && onDelete(item.id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                    {data.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={7} className="text-center h-24 text-muted-foreground">
                                Chưa có dữ liệu hợp đồng.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
