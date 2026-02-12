import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
      color: "text-violet-500",
    },
    {
      title: "Phương tiện",
      value: vehicles.length,
      active: availableVehicles,
      desc: "xe sẵn sàng",
      icon: Truck,
      color: "text-pink-700",
    },
    {
      title: "Hợp đồng",
      value: totalContracts,
      icon: FileText,
      color: "text-orange-700",
    },
    {
      title: "Lịch hôm nay",
      value: todaysSchedules,
      icon: CalendarDays,
      color: "text-emerald-500",
    },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Tổng quan</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.active !== undefined ? `${stat.active} ${stat.desc || 'đang hoạt động'}` : "Số liệu cập nhật"}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <DashboardCharts schedules={schedules} />

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Hoạt động gần đây</CardTitle>
            <CardContent>
              <div className="space-y-4 mt-4">
                {schedules.slice(0, 5).map((s, i) => (
                  <div key={i} className="flex items-center">
                    <div className="ml-4 space-y-1">
                      <p className="text-sm font-medium leading-none">{s.workContent}</p>
                      <p className="text-sm text-muted-foreground">{s.date}</p>
                    </div>
                    <div className="ml-auto font-medium">
                      {s.contractId}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
