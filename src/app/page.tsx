import { GlassCard } from "@/components/ui/GlassCard";
import { dataService } from "@/lib/data-service";
import { Users, Truck, FileText, CalendarDays } from "lucide-react";
import { DashboardCharts } from "@/components/dashboard/dashboard-charts";
import Link from "next/link";

export const dynamic = 'force-dynamic';
export const revalidate = 0;


export default async function Home() {
  const personnel = await dataService.getPersonnel();
  const vehicles = await dataService.getVehicles();
  const contracts = await dataService.getContracts();
  const schedules = await dataService.getSchedules();

  const activePersonnel = personnel.filter((p) => p.status === "Hoạt động").length;
  const availableVehicles = vehicles.filter((v) => v.status === "Available").length;
  const totalContracts = contracts.length;
  // Sum contract values — VND format uses dots as thousand separators: "152.342.284 đ"
  const totalContractValue = contracts.reduce((sum, c) => {
    // Remove everything except digits (dots are thousand separators in VND, not decimals)
    const numVal = parseFloat((c.value || "0").replace(/[^0-9]/g, ""));
    return sum + (isNaN(numVal) ? 0 : numVal);
  }, 0);
  const totalContractValueBillion = (totalContractValue / 1000000000).toFixed(1);
  // Set today up for comparison and accurate schedule counts
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todaysSchedules = schedules.filter((s) => {
    if (!s.startDate) return false;
    const sDate = new Date(s.startDate);
    sDate.setHours(0, 0, 0, 0);
    return sDate.getTime() === today.getTime();
  }).length;

  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(today.getDate() - 7);

  const recentActivities = schedules
    .filter((s) => {
      if (!s.startDate) return false;
      const sDate = new Date(s.startDate);
      sDate.setHours(0, 0, 0, 0);
      return sDate < today && sDate >= sevenDaysAgo;
    })
    .sort((a, b) => new Date(b.startDate!).getTime() - new Date(a.startDate!).getTime())
    .slice(0, 10);


  const stats = [
    {
      title: "Tổng nhân sự",
      value: personnel.length,
      active: activePersonnel,
      icon: Users,
      color: "text-[#7209b7]",
      bgInfo: "bg-[#7209b7]/10 text-[#7209b7]",
      href: "/nhan-su",
    },
    {
      title: "Phương tiện",
      value: vehicles.length,
      active: availableVehicles,
      desc: "xe sẵn sàng",
      icon: Truck,
      color: "text-[#f72585]",
      bgInfo: "bg-[#f72585]/10 text-[#f72585]",
      href: "/xe-thiet-bi",
    },
    {
      title: "Hợp đồng",
      value: totalContracts,
      desc: `Tổng giá trị: ${totalContractValueBillion} tỷ đồng`,
      icon: FileText,
      color: "text-[#4361ee]",
      bgInfo: "bg-[#4361ee]/10 text-[#4361ee]",
      href: "/hop-dong",
    },
    {
      title: "Lịch hôm nay",
      value: todaysSchedules,
      icon: CalendarDays,
      color: "text-[#480ca8]",
      bgInfo: "bg-[#480ca8]/10 text-[#480ca8]",
      href: "/cong-viec",
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
          <Link key={index} href={stat.href} className="block">
            <GlassCard className="flex flex-col justify-between hover:scale-[1.02] transition-transform duration-200 cursor-pointer hover:shadow-lg">
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
                  {stat.active !== undefined ? `${stat.active} ${stat.desc || 'đang hoạt động'}` : (stat.desc || "Số liệu cập nhật")}
                </p>
              </div>
            </GlassCard>
          </Link>
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
              {recentActivities.map((s, i) => (
                <div key={i} className="flex items-center p-3 rounded-lg bg-gray-50/50 hover:bg-white transition-colors border border-transparent hover:border-gray-100">
                  <div className="ml-2 space-y-1">
                    <p className="text-sm font-medium leading-none text-gray-800">{s.content || "Chưa có nội dung"}</p>
                    <p className="text-xs text-muted-foreground">{s.startDate}</p>
                  </div>
                  <div className="ml-auto font-medium text-sm text-[#3a0ca3]">
                    {s.contractId || s.unit || ""}
                  </div>
                </div>
              ))}
              {recentActivities.length === 0 && (
                <div className="p-4 text-center text-sm text-gray-500">Không có hoạt động nào trong 7 ngày qua</div>
              )}
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
