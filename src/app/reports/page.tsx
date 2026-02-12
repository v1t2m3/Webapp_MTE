"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { useState } from "react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Download, FileBarChart } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function ReportsPage() {
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [reportType, setReportType] = useState("daily");

    const handleDownload = () => {
        alert("Chức năng đang được phát triển: Tải báo cáo " + reportType + " ngày " + (date ? format(date, 'dd/MM/yyyy') : ''));
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Báo cáo & Thống kê</h2>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Tạo báo cáo công việc</CardTitle>
                        <CardDescription>Chọn loại báo cáo và thời gian để xuất dữ liệu.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Loại báo cáo</label>
                            <Select value={reportType} onValueChange={setReportType}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Chọn loại báo cáo" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="daily">Báo cáo ngày</SelectItem>
                                    <SelectItem value="weekly">Báo cáo tuần</SelectItem>
                                    <SelectItem value="monthly">Báo cáo tháng</SelectItem>
                                    <SelectItem value="project">Báo cáo theo hợp đồng</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Thời gian</label>
                            <div className="border rounded-md p-4 flex justify-center">
                                <Calendar
                                    mode="single"
                                    selected={date}
                                    onSelect={setDate}
                                    className="rounded-md border shadow"
                                />
                            </div>
                        </div>

                        <Button className="w-full" onClick={handleDownload} disabled={!date}>
                            <Download className="mr-2 h-4 w-4" /> Xuất báo cáo
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Lịch sử báo cáo</CardTitle>
                        <CardDescription>Các báo cáo đã tạo gần đây.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                                    <div className="flex items-center space-x-4">
                                        <div className="p-2 bg-slate-100 rounded-lg dark:bg-slate-800">
                                            <FileBarChart className="h-6 w-6 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="font-medium">Báo cáo ngày {format(new Date(), 'dd/MM/yyyy')}</p>
                                            <p className="text-sm text-muted-foreground">PDF • 2.4 MB</p>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="sm">Tải xuống</Button>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
