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
    // Generate dates for the current week (Monday to Sunday)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const currentDayOfWeek = today.getDay(); // 0 is Sunday, 1 is Monday...
    const diffToMonday = today.getDate() - currentDayOfWeek + (currentDayOfWeek === 0 ? -6 : 1);
    
    const monday = new Date(today);
    monday.setDate(diffToMonday);

    const weekData = [
        { name: "Thứ 2", schedules: 0, date: new Date(monday) },
        { name: "Thứ 3", schedules: 0, date: new Date(monday.getTime() + 1 * 86400000) },
        { name: "Thứ 4", schedules: 0, date: new Date(monday.getTime() + 2 * 86400000) },
        { name: "Thứ 5", schedules: 0, date: new Date(monday.getTime() + 3 * 86400000) },
        { name: "Thứ 6", schedules: 0, date: new Date(monday.getTime() + 4 * 86400000) },
        { name: "Thứ 7", schedules: 0, date: new Date(monday.getTime() + 5 * 86400000) },
        { name: "CN", schedules: 0, date: new Date(monday.getTime() + 6 * 86400000) },
    ];

    schedules.forEach(s => {
        if (!s.startDate) return;
        const sDate = new Date(s.startDate);
        sDate.setHours(0, 0, 0, 0);
        
        const eDate = s.endDate ? new Date(s.endDate) : new Date(sDate);
        eDate.setHours(0, 0, 0, 0);
        
        weekData.forEach(dayMatch => {
            const matchTime = dayMatch.date.getTime();
            if (matchTime >= sDate.getTime() && matchTime <= eDate.getTime()) {
                dayMatch.schedules += 1;
            }
        });
    });

    const data = weekData.map(({ name, schedules }) => ({ name, schedules }));

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
