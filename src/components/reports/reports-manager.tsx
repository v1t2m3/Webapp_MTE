"use client";

import { useState, useEffect, useCallback } from "react";
import { GlassPageHeader } from "@/components/ui/GlassCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PieChart, Briefcase, User as UserIcon, CalendarDays, Loader2, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WeeklyMonthlyReport } from "./weekly-monthly-report";
import { ContractReport } from "./contract-report";
import { PersonalReport } from "./personal-report";
import { OverviewReport } from "./overview-report";
import { Schedule, Contract, Personnel, WorkOutline, SupplementalReport } from "@/types";

export interface ReportData {
    schedules: Schedule[];
    contracts: Contract[];
    personnel: Personnel[];
    workOutlines: WorkOutline[];
    supplementalReports: SupplementalReport[];
}

export function ReportsManager() {
    const [activeTab, setActiveTab] = useState("overview");
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<ReportData | null>(null);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const [woRes, schedRes, persRes, contRes, suppRes] = await Promise.all([
                fetch("/api/work-outlines").catch(() => ({ json: () => [] })),
                fetch("/api/schedules").catch(() => ({ json: () => [] })),
                fetch("/api/personnel").catch(() => ({ json: () => [] })),
                fetch("/api/contracts").catch(() => ({ json: () => [] })),
                fetch("/api/supplemental-reports").catch(() => ({ json: () => [] }))
            ]);

            const [workOutlines, schedules, personnel, contracts, supplementalReports] = await Promise.all([
                woRes.json(), schedRes.json(), persRes.json(), contRes.json(), suppRes.json()
            ]);

            setData({
                workOutlines: workOutlines || [],
                schedules: schedules || [],
                personnel: personnel || [],
                contracts: contracts || [],
                supplementalReports: supplementalReports || []
            });
        } catch (error) {
            console.error("Failed to fetch report data:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    if (loading || !data) {
        return (
            <div className="flex flex-col space-y-6 animate-fade-in w-full h-[60vh] items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-[#3a0ca3]" />
                <p className="text-muted-foreground font-medium">Đang tải dữ liệu báo cáo...</p>
            </div>
        );
    }

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="flex flex-col space-y-6 animate-fade-in reports-print-container">
            <div className="flex items-center justify-between">
                <GlassPageHeader
                    title="Báo cáo & Phân tích"
                    description="Hệ thống thống kê, theo dõi khối lượng công việc, tiến độ hợp đồng và năng suất cá nhân."
                />
                <Button onClick={handlePrint} className="bg-[#3a0ca3] hover:bg-[#3a0ca3]/90 text-white shadow-lg print:hidden">
                    <Printer className="w-4 h-4 mr-2" />
                    In Báo cáo
                </Button>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-4 bg-white/50 backdrop-blur-md p-1 h-auto rounded-xl border border-white/20 shadow-sm mb-6">
                    <TabsTrigger
                        value="overview"
                        className="data-[state=active]:bg-[#3a0ca3] data-[state=active]:text-white py-3 rounded-lg transition-all"
                    >
                        <PieChart className="w-4 h-4 mr-2" />
                        Tổng quan
                    </TabsTrigger>
                    <TabsTrigger
                        value="weekly-monthly"
                        className="data-[state=active]:bg-[#4cc9f0] data-[state=active]:text-white py-3 rounded-lg transition-all"
                    >
                        <CalendarDays className="w-4 h-4 mr-2" />
                        Tuần / Tháng
                    </TabsTrigger>
                    <TabsTrigger
                        value="contract"
                        className="data-[state=active]:bg-[#4361ee] data-[state=active]:text-white py-3 rounded-lg transition-all"
                    >
                        <Briefcase className="w-4 h-4 mr-2" />
                        Theo Hợp đồng
                    </TabsTrigger>
                    <TabsTrigger
                        value="personal"
                        className="data-[state=active]:bg-[#f72585] data-[state=active]:text-white py-3 rounded-lg transition-all"
                    >
                        <UserIcon className="w-4 h-4 mr-2" />
                        Cá nhân
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="mt-0 outline-none">
                    <OverviewReport data={data} />
                </TabsContent>

                <TabsContent value="weekly-monthly" className="mt-0 outline-none">
                    <WeeklyMonthlyReport data={data} />
                </TabsContent>

                <TabsContent value="contract" className="mt-0 outline-none">
                    <ContractReport data={data} />
                </TabsContent>

                <TabsContent value="personal" className="mt-0 outline-none">
                    <PersonalReport data={data} />
                </TabsContent>
            </Tabs>
        </div>
    );
}
