"use client";

import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Schedule, Contract, Personnel, Vehicle } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

interface SchedulePageProps {
    schedules: Schedule[];
    contracts: Contract[];
    personnel: Personnel[];
    vehicles: Vehicle[];
}

export function ScheduleManager({ schedules, contracts, personnel, vehicles }: SchedulePageProps) {
    const [date, setDate] = useState<Date | undefined>(new Date());

    const selectedDateStr = date ? format(date, 'yyyy-MM-dd') : '';

    const schedulesOnDate = schedules.filter(s => s.date === selectedDateStr);

    return (
        <div className="flex flex-col space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Lịch công tác</h2>
                <Dialog>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> Tạo lịch mới
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Tạo lịch công tác mới</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <label htmlFor="date" className="text-right text-sm font-medium">
                                    Ngày
                                </label>
                                <input
                                    id="date"
                                    type="date"
                                    className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    defaultValue={selectedDateStr}
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <label htmlFor="content" className="text-right text-sm font-medium">
                                    Nội dung
                                </label>
                                <input
                                    id="content"
                                    className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    placeholder="Nội dung công việc"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <label htmlFor="contract" className="text-right text-sm font-medium">
                                    Hợp đồng
                                </label>
                                <select id="contract" className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                                    <option value="">Chọn hợp đồng</option>
                                    {contracts.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-4 items-center gap-4">
                                <div className="col-start-2 col-span-3 text-xs text-muted-foreground">
                                    * Chức năng chọn nhân sự và xe đang được hoàn thiện.
                                </div>
                            </div>

                            <Button onClick={() => alert("Đã lưu lịch công tác (Mock)")}>Lưu lịch</Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                <div className="md:col-span-4">
                    <Card>
                        <CardContent className="p-4">
                            <Calendar
                                mode="single"
                                selected={date}
                                onSelect={setDate}
                                className="rounded-md border shadow"
                            />
                        </CardContent>
                    </Card>
                </div>

                <div className="md:col-span-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Công việc ngày {date ? format(date, 'dd/MM/yyyy') : ''}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {schedulesOnDate.length === 0 ? (
                                <p className="text-muted-foreground text-center py-8">Không có lịch công tác nào.</p>
                            ) : (
                                <div className="space-y-4">
                                    {schedulesOnDate.map(schedule => {
                                        const contract = contracts.find(c => c.id === schedule.contractId);
                                        return (
                                            <div key={schedule.id} className="flex flex-col space-y-2 border p-4 rounded-lg bg-slate-50 dark:bg-slate-900">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h4 className="font-semibold">{schedule.workContent}</h4>
                                                        <p className="text-sm text-muted-foreground">{contract?.name || schedule.contractId}</p>
                                                    </div>
                                                    <Badge variant="outline">{schedule.id}</Badge>
                                                </div>

                                                <div className="text-sm">
                                                    <span className="font-medium">Nhân sự: </span>
                                                    {schedule.personnelIds.map(pid => {
                                                        const p = personnel.find(per => per.id === pid);
                                                        return p ? p.name : pid;
                                                    }).join(", ")}
                                                </div>

                                                <div className="text-sm">
                                                    <span className="font-medium">Xe: </span>
                                                    {schedule.vehicleIds.map(vid => {
                                                        const v = vehicles.find(veh => veh.id === vid);
                                                        return v ? `${v.type} (${v.licensePlate})` : vid;
                                                    }).join(", ")}
                                                </div>

                                                {schedule.description && (
                                                    <div className="text-sm italic text-muted-foreground mt-2">
                                                        Ghi chú: {schedule.description}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
