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
import { Vehicle } from "@/types";
import { Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VehicleTableProps {
    data: Vehicle[];
    onEdit?: (vehicle: Vehicle) => void;
    onDelete?: (id: string) => void;
}

export function VehicleTable({ data, onEdit, onDelete }: VehicleTableProps) {
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
                        <TableHead className="w-[100px]">ID</TableHead>
                        <TableHead>Tên xe</TableHead>
                        <TableHead>Loại</TableHead>
                        <TableHead>Biển số</TableHead>
                        <TableHead>Hạn đăng kiểm</TableHead>
                        <TableHead>Hạn bảo hiểm</TableHead>
                        <TableHead>Trạng thái</TableHead>
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
                            <TableCell className="font-semibold text-primary">{item.name}</TableCell>
                            <TableCell>{item.type}</TableCell>
                            <TableCell>
                                <Badge variant="outline" className="font-mono whitespace-nowrap bg-[#b5179e]/10 text-[#b5179e] border-[#b5179e]/20">
                                    {item.licensePlate}
                                </Badge>
                            </TableCell>
                            <TableCell>{formatDate(item.inspectionExpiry)}</TableCell>
                            <TableCell>{formatDate(item.insuranceExpiry)}</TableCell>
                            <TableCell>
                                <Badge className={`whitespace-nowrap ${item.status === "Available" ? "bg-[#4cc9f0] hover:bg-[#4cc9f0]/80" :
                                    item.status === "Maintenance" ? "bg-[#f72585] hover:bg-[#f72585]/80" :
                                        "bg-[#4361ee] hover:bg-[#4361ee]/80"
                                    }`}>
                                    {item.status}
                                </Badge>
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
                    {data.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={8} className="text-center h-24 text-muted-foreground">
                                Chưa có dữ liệu xe.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
