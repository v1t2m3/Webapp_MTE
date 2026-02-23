"use client";

import { GlassCard } from "@/components/ui/GlassCard";
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
        <GlassCard className="col-span-4">
            <div className="mb-4">
                <h3 className="font-semibold text-lg text-gray-800">Biểu đồ công việc tuần này</h3>
            </div>
            <div className="pl-0">
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
            </div>
        </GlassCard>
    );
}
