import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { WorkOutline, Personnel, Vehicle, Schedule } from '@/types';
import { Printer } from 'lucide-react';
import { format } from 'date-fns';

export interface VehicleDispatchPrintData {
    workOutlineId: string;
    vehicleName: string; // The license plate or custom name
    driverName: string;
    route: string;
    dispatchDate: string; // YYYY-MM-DD
}

interface VehicleDispatchDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    workOutline: WorkOutline | null;
    personnel: Personnel[];
    vehicles: Vehicle[];
    schedules: Schedule[];
    onPrint: (data: VehicleDispatchPrintData) => void;
}

export function VehicleDispatchDialog({
    open,
    onOpenChange,
    workOutline,
    personnel,
    vehicles,
    schedules,
    onPrint
}: VehicleDispatchDialogProps) {
    const [selectedVehicle, setSelectedVehicle] = useState<string>("");
    const [selectedDriver, setSelectedDriver] = useState<string>("");
    const [route, setRoute] = useState<string>("");
    const [dispatchDate, setDispatchDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));

    // Compute available vehicles from the work outline
    const availableVehicles = React.useMemo(() => {
        if (!workOutline?.vehicleAssignments) return [];
        return workOutline.vehicleAssignments.map(va => {
            if (va.vehicleId === "CUSTOM") {
                return {
                    id: `CUSTOM_${va.customLicensePlate}`,
                    name: va.customLicensePlate || "Chưa rõ biển số"
                };
            }
            const vInfo = vehicles.find(v => v.id === va.vehicleId);
            return {
                id: va.vehicleId,
                name: vInfo ? vInfo.licensePlate : "Không tìm thấy xe"
            };
        });
    }, [workOutline, vehicles]);

    // Compute available personnel (drivers) from the work outline
    const availableDrivers = React.useMemo(() => {
        if (!workOutline?.personnelAssignments) return [];
        return workOutline.personnelAssignments.map(pa => {
            if (pa.personnelId === "CUSTOM") {
                return {
                    id: `CUSTOM_${pa.customName}`,
                    name: pa.customName || "Tên không rõ",
                    job: "Ngoài đơn vị"
                };
            }
            const pInfo = personnel.find(p => p.id === pa.personnelId);
            return {
                id: pa.personnelId,
                name: pInfo ? pInfo.fullName : "Không tìm thấy người",
                job: pInfo ? pInfo.job : ""
            };
        });
    }, [workOutline, personnel]);

    // Pre-select if only one option exists when dialog opens
    React.useEffect(() => {
        if (open) {
            // Default select the first vehicle
            if (availableVehicles.length > 0) setSelectedVehicle(availableVehicles[0].name);
            else setSelectedVehicle("");

            // Try to auto-select a driver if there's someone with job "Lái xe", otherwise pick the first one
            const driver = availableDrivers.find(d => d.job?.toLowerCase().includes("lái xe"));
            if (driver) setSelectedDriver(driver.name);
            else if (availableDrivers.length > 0) setSelectedDriver(availableDrivers[0].name);
            else setSelectedDriver("");

            // Default Route according to schedule unit
            let defaultRoute = "";
            if (workOutline && schedules) {
                const schedule = schedules.find(s => s.id === workOutline.scheduleId);
                if (schedule && schedule.unit) {
                    switch (schedule.unit) {
                        case "QTPC": defaultRoute = "Quảng Trị"; break;
                        case "HPC": defaultRoute = "Huế"; break;
                        case "QNPC": defaultRoute = "Quảng Ngãi"; break;
                        case "GLPC": defaultRoute = "Gia Lai"; break;
                        case "ĐLPC": defaultRoute = "Đăk Lắk"; break;
                        case "KHoPC": defaultRoute = "Khánh Hòa"; break;
                    }
                }
            }
            setRoute(defaultRoute);

            setDispatchDate(format(new Date(), 'yyyy-MM-dd'));
        }
    }, [open, availableVehicles.length, availableDrivers.length, availableDrivers, availableVehicles, workOutline, schedules]);

    const handlePrintClick = () => {
        if (!workOutline) return;

        onPrint({
            workOutlineId: workOutline.id,
            vehicleName: selectedVehicle,
            driverName: selectedDriver,
            route,
            dispatchDate
        });

        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>In Quyết Định Điều Xe</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Chọn xe mang biển số</Label>
                        <Select value={selectedVehicle} onValueChange={setSelectedVehicle}>
                            <SelectTrigger>
                                <SelectValue placeholder="Chọn phương tiện..." />
                            </SelectTrigger>
                            <SelectContent>
                                {availableVehicles.map((v, i) => (
                                    <SelectItem key={i} value={v.name}>{v.name}</SelectItem>
                                ))}
                                {availableVehicles.length === 0 && (
                                    <SelectItem value="none" disabled>Không có phương tiện trong đề cương</SelectItem>
                                )}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Chọn họ và tên lái xe</Label>
                        <Select value={selectedDriver} onValueChange={setSelectedDriver}>
                            <SelectTrigger>
                                <SelectValue placeholder="Chọn người lái..." />
                            </SelectTrigger>
                            <SelectContent>
                                {availableDrivers.map((d, i) => (
                                    <SelectItem key={i} value={d.name}>
                                        {d.name} {d.job ? `(${d.job})` : ''}
                                    </SelectItem>
                                ))}
                                {availableDrivers.length === 0 && (
                                    <SelectItem value="none" disabled>Không có nhân sự trong đề cương</SelectItem>
                                )}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Lộ trình: Xí nghiệp đi... *(Điểm đến)*</Label>
                        <Input
                            placeholder="Ví dụ: Quảng Ngãi"
                            value={route}
                            onChange={(e) => setRoute(e.target.value)}
                        />
                        <p className="text-xs text-gray-500">Hệ thống sẽ tự form: "Xí nghiệp đi [Điểm đến] và ngược lại"</p>
                    </div>

                    <div className="space-y-2">
                        <Label>Ngày lập lệnh</Label>
                        <Input
                            type="date"
                            value={dispatchDate}
                            onChange={(e) => setDispatchDate(e.target.value)}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Hủy
                    </Button>
                    <Button
                        onClick={handlePrintClick}
                        disabled={!selectedVehicle || !selectedDriver || !route}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        <Printer className="w-4 h-4 mr-2" />
                        Chuẩn bị In
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
