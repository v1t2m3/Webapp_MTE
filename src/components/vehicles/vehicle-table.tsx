"use client";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Vehicle } from "@/types";
import { Badge } from "@/components/ui/badge";

export function VehicleTable({ data }: { data: Vehicle[] }) {
    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Biển số</TableHead>
                        <TableHead>Loại xe</TableHead>
                        <TableHead>Trạng thái</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.map((item) => (
                        <TableRow key={item.id}>
                            <TableCell className="font-medium">{item.licensePlate}</TableCell>
                            <TableCell>{item.type}</TableCell>
                            <TableCell>
                                <Badge
                                    variant={
                                        item.status === "Available"
                                            ? "default"
                                            : item.status === "Maintenance"
                                                ? "destructive"
                                                : "secondary"
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
