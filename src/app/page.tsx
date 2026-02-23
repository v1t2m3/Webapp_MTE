import { GlassCard } from "@/components/ui/GlassCard";
import { dataService } from "@/lib/data-service";
import { Users, Truck, FileText, CalendarDays } from "lucide-react";
import { DashboardCharts } from "@/components/dashboard/dashboard-charts";

export default async function Home() {
  const personnel = await dataService.getPersonnel();
  const vehicles = await dataService.getVehicles();
  const contracts = await dataService.getContracts();
  const schedules = await dataService.getSchedules();

  const activePersonnel = personnel.filter((p) => p.status === "Active").length;
  // Vehicles status might be lowercase or uppercase in mock data, let's correspond to the type
  const availableVehicles = vehicles.filter((v) => v.status === "Available").length;
  const totalContracts = contracts.length;
  // Simple check for today's schedules
  const todaysSchedules = schedules.filter((s) => s.date === new Date().toISOString().split("T")[0]).length;

  const stats = [
    {
      title: "Tổng nhân sự",
      value: personnel.length,
      active: activePersonnel,
      icon: Users,
      color: "text-[#7209b7]",
      bgInfo: "bg-[#7209b7]/10 text-[#7209b7]",
    },
    {
      title: "Phương tiện",
      value: vehicles.length,
      active: availableVehicles,
      desc: "xe sẵn sàng",
      icon: Truck,
      color: "text-[#f72585]",
      bgInfo: "bg-[#f72585]/10 text-[#f72585]",
    },
    {
      title: "Hợp đồng",
      value: totalContracts,
      icon: FileText,
      color: "text-[#4361ee]",
      bgInfo: "bg-[#4361ee]/10 text-[#4361ee]",
    },
    {
      title: "Lịch hôm nay",
      value: todaysSchedules,
      icon: CalendarDays,
      color: "text-[#480ca8]",
      bgInfo: "bg-[#480ca8]/10 text-[#480ca8]",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-[#3a0ca3] uppercase drop-shadow-sm">Tổng quan</h2>
        <p className="text-muted-foreground mt-1">Hệ thống quản lý và báo cáo hoạt động.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <GlassCard key={index} className="flex flex-col justify-between hover:scale-[1.02] transition-transform duration-200">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <span className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </span>
              <div className={`p-2 rounded-full ${stat.bgInfo || 'bg-gray-100'}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-800">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.active !== undefined ? `${stat.active} ${stat.desc || 'đang hoạt động'}` : "Số liệu cập nhật"}
              </p>
            </div>
          </GlassCard>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4">
          {/* Wrap Chart in GlassCard? DashboardCharts might behave as a Card. 
               I'll wrap it in a GlassCard in the component or here. 
               The original code passed `schedules` to `DashboardCharts`. 
               I'll assume DashboardCharts renders a card. I should probably modify DashboardCharts too. 
               For now, I'll wrap it if it's just content. 
               Actually, the previous code had DashboardCharts as a sibling to a Card. 
           */}
          <DashboardCharts schedules={schedules} />
        </div>

        <GlassCard className="col-span-3">
          <div className="flex flex-col space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">Hoạt động gần đây</h3>
            <div className="space-y-4">
              {schedules.slice(0, 5).map((s, i) => (
                <div key={i} className="flex items-center p-3 rounded-lg bg-gray-50/50 hover:bg-white transition-colors border border-transparent hover:border-gray-100">
                  <div className="ml-2 space-y-1">
                    <p className="text-sm font-medium leading-none text-gray-800">{s.workContent}</p>
                    <p className="text-xs text-muted-foreground">{s.date}</p>
                  </div>
                  <div className="ml-auto font-medium text-sm text-[#3a0ca3]">
                    {s.contractId}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
