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
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Mã NV</TableHead>
                        <TableHead>Họ và Tên</TableHead>
                        <TableHead>Chức vụ</TableHead>
                        <TableHead>Phòng ban</TableHead>
                        <TableHead>Trạng thái</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.map((item) => (
                        <TableRow key={item.id}>
                            <TableCell className="font-medium">{item.id}</TableCell>
                            <TableCell>{item.name}</TableCell>
                            <TableCell>{item.position}</TableCell>
                            <TableCell>{item.department}</TableCell>
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
