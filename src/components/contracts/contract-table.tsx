"use client";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Contract } from "@/types";

export function ContractTable({ data }: { data: Contract[] }) {
    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Tên Hợp đồng</TableHead>
                        <TableHead>Khách hàng</TableHead>
                        <TableHead>Ngày bắt đầu</TableHead>
                        <TableHead>Ngày kết thúc</TableHead>
                        <TableHead>Mô tả</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.map((item) => (
                        <TableRow key={item.id}>
                            <TableCell className="font-medium">{item.name}</TableCell>
                            <TableCell>{item.client}</TableCell>
                            <TableCell>{item.startDate}</TableCell>
                            <TableCell>{item.endDate}</TableCell>
                            <TableCell>{item.description}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
