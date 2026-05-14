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
import { toDisplayDate } from "@/lib/date-utils";

export function ContractTable({ data }: { data: Contract[] }) {
    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Tên Hợp đồng</TableHead>
                        <TableHead>Đại diện CĐT</TableHead>
                        <TableHead>Ngày bắt đầu</TableHead>
                        <TableHead>Ngày kết thúc</TableHead>
                        <TableHead>Mã HĐ</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.map((item) => (
                        <TableRow key={item.id}>
                            <TableCell className="font-medium">{item.name}</TableCell>
                            <TableCell>{item.investorRep}</TableCell>
                            <TableCell>{toDisplayDate(item.startDate)}</TableCell>
                            <TableCell>{toDisplayDate(item.endDate)}</TableCell>
                            <TableCell>{item.code}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
