import { GlassCard } from "@/components/ui/GlassCard";
import { dataService } from "@/lib/data-service";
import { CalendarDays, ClipboardList, FileBarChart } from "lucide-react";
import Link from "next/link";
import { addDays, isWithinInterval, startOfDay } from "date-fns";

export default async function CongViecPage() {
    const schedules = await dataService.getSchedules();
    const workOutlines = await dataService.getWorkOutlines();

    const today = startOfDay(new Date());
    const next10Days = addDays(today, 10);

    // Filter schedules for the future (>= today)
    const futureSchedules = schedules.filter(s => {
        if (!s.startDate) return false;
        const sDate = startOfDay(new Date(s.startDate));
        return sDate.getTime() >= today.getTime();
    });

    // Filter schedules in the next 10 days
    const upcomingSchedules = schedules.filter(s => {
        if (!s.startDate) return false;
        const sDate = startOfDay(new Date(s.startDate));
        return isWithinInterval(sDate, { start: today, end: next10Days });
    }).length;

    // Filter work outlines for today
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const todaysOutlines = workOutlines.filter((w: any) => {
        if (!w.startDate) return false;
        const oDate = startOfDay(new Date(w.startDate));
        return oDate.getTime() === today.getTime();
    }).length;

    const stats = [
        {
            title: "Lịch công tác",
            value: futureSchedules.length,
            desc: "Tổng lịch khả dụng",
            extraInfo: `${upcomingSchedules} lịch trong 10 ngày tới`,
            icon: CalendarDays,
            color: "text-[#480ca8]",
            bgInfo: "bg-[#480ca8]/10 text-[#480ca8]",
            href: "/schedules",
        },
        {
            title: "Đề cương công tác",
            value: workOutlines.length,
            desc: "Tổng đề cương",
            extraInfo: `${todaysOutlines} đề cương hôm nay`,
            icon: ClipboardList,
            color: "text-[#3f37c9]",
            bgInfo: "bg-[#3f37c9]/10 text-[#3f37c9]",
            href: "/de-cuong",
        },
        {
            title: "Báo cáo",
            value: 0,
            active: 0,
            desc: "Tùy chỉnh",
            extraInfo: "Xem và xuất các loại báo cáo",
            icon: FileBarChart,
            color: "text-[#b5179e]",
            bgInfo: "bg-[#b5179e]/10 text-[#b5179e]",
            href: "/reports",
        },
    ];

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-[#f72585] uppercase drop-shadow-sm">Công việc</h2>
                <p className="text-muted-foreground mt-1">Quản lý Lịch công tác, Đề cương và Báo cáo.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {stats.map((stat, index) => (
                    <Link href={stat.href} key={index} className="block">
                        <GlassCard className="flex flex-col justify-between hover:scale-[1.02] transition-transform duration-200 h-full cursor-pointer hover:border-[#f72585]/30">
                            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <span className="text-sm font-medium text-muted-foreground">
                                    {stat.title}
                                </span>
                                <div className={`p-2 rounded-full ${stat.bgInfo || 'bg-gray-100'}`}>
                                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                                </div>
                            </div>
                            <div className="mt-4">
                                {stat.value > 0 ? (
                                    <div className="text-3xl font-bold text-gray-800">{stat.value}</div>
                                ) : (
                                    <div className="text-3xl font-bold text-gray-800">Báo cáo</div>
                                )}
                                <p className="text-xs text-muted-foreground mt-1">
                                    {stat.active && stat.active > 0 ? `${stat.active} ` : ""}{stat.desc}
                                </p>
                                {stat.extraInfo && (
                                    <p className="text-xs font-medium text-[#f72585] mt-2 bg-[#f72585]/10 p-1.5 rounded-md inline-block">
                                        {stat.extraInfo}
                                    </p>
                                )}
                            </div>
                        </GlassCard>
                    </Link>
                ))}
            </div>
        </div>
    );
}
