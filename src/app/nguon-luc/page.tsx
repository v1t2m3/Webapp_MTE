import { GlassCard } from "@/components/ui/GlassCard";
import { dataService } from "@/lib/data-service";
import { Users, Truck, FileText } from "lucide-react";
import Link from "next/link";

export default async function NguonLucPage() {
    const personnel = await dataService.getPersonnel();
    const vehicles = await dataService.getVehicles();
    const contracts = await dataService.getContracts();

    const activePersonnel = personnel.filter((p) => p.status === "Active").length;
    // Count personnel on leave today. For now mock data has 'On Leave'
    const onLeavePersonnel = personnel.filter((p) => p.status === "On Leave").length;

    const availableVehicles = vehicles.filter((v) => v.status === "Available").length;
    const maintenanceVehicles = vehicles.filter((v) => v.status === "Maintenance").length;
    const totalContracts = contracts.length;

    const stats = [
        {
            title: "Nhân sự",
            value: personnel.length,
            active: activePersonnel,
            desc: "đang làm việc",
            extraInfo: `${onLeavePersonnel} người nghỉ hôm nay`,
            icon: Users,
            color: "text-[#7209b7]",
            bgInfo: "bg-[#7209b7]/10 text-[#7209b7]",
            href: "/nhan-su",
        },
        {
            title: "Xe & Thiết bị",
            value: vehicles.length,
            active: availableVehicles,
            desc: "xe sẵn sàng",
            extraInfo: `${maintenanceVehicles} xe đang bảo trì`,
            icon: Truck,
            color: "text-[#f72585]",
            bgInfo: "bg-[#f72585]/10 text-[#f72585]",
            href: "/xe-thiet-bi",
        },
        {
            title: "Hợp đồng",
            value: totalContracts,
            active: totalContracts,
            desc: "hợp đồng",
            extraInfo: "Quản lý dữ liệu hợp đồng",
            icon: FileText,
            color: "text-[#4361ee]",
            bgInfo: "bg-[#4361ee]/10 text-[#4361ee]",
            href: "/contracts",
        },
    ];

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-[#3a0ca3] uppercase drop-shadow-sm">Nguồn lực</h2>
                <p className="text-muted-foreground mt-1">Quản lý Nhân sự, Phương tiện và Hợp đồng.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {stats.map((stat, index) => (
                    <Link href={stat.href} key={index} className="block">
                        <GlassCard className="flex flex-col justify-between hover:scale-[1.02] transition-transform duration-200 h-full cursor-pointer hover:border-[#3a0ca3]/30">
                            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <span className="text-sm font-medium text-muted-foreground">
                                    {stat.title}
                                </span>
                                <div className={`p-2 rounded-full ${stat.bgInfo || 'bg-gray-100'}`}>
                                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                                </div>
                            </div>
                            <div className="mt-4">
                                <div className="text-3xl font-bold text-gray-800">{stat.value}</div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {stat.active} {stat.desc}
                                </p>
                                {stat.extraInfo && (
                                    <p className="text-xs font-medium text-amber-600 mt-2 bg-amber-50 p-1.5 rounded-md inline-block">
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
