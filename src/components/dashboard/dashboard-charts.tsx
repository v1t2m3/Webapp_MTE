"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Schedule } from "@/types";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

export function DashboardCharts({ schedules }: { schedules: Schedule[] }) {
    // Basic aggregating for chart (mock logic for demo)
    const data = [
        { name: "Thứ 2", schedules: 4 },
        { name: "Thứ 3", schedules: 3 },
        { name: "Thứ 4", schedules: 2 },
        { name: "Thứ 5", schedules: 6 },
        { name: "Thứ 6", schedules: 5 },
        { name: "Thứ 7", schedules: 3 },
        { name: "CN", schedules: 1 },
    ];

    return (
        <Card className="col-span-4">
            <CardHeader>
                <CardTitle>Biểu đồ công việc tuần này</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
                <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={data}>
                        <XAxis
                            dataKey="name"
                            stroke="#888888"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis
                            stroke="#888888"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => `${value}`}
                        />
                        <Tooltip
                            cursor={{ fill: 'transparent' }}
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Bar dataKey="schedules" fill="currentColor" radius={[4, 4, 0, 0]} className="fill-primary" />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
