"use client";

import { useState, useEffect } from "react";
import { Schedule, Contract } from "@/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface ScheduleFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    initialData?: Schedule | null;
    onSubmit: (data: Partial<Schedule>) => Promise<void>;
    contracts?: Contract[];
}

const DEFAULT_UNITS = ["QTPC", "HPC", "ĐNPC", "QNPC", "GLPC", "ĐLPC", "KHoPC", "CPSC"];
const VOLTAGE_LEVELS = ["0,4kV", "6kV", "22kV", "35kV", "110kV"];

export function ScheduleForm({ open, onOpenChange, initialData, onSubmit, contracts = [] }: ScheduleFormProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<Partial<Schedule>>({
        id: "",
        unit: "",
        deviceName: "",
        startTime: "08:00",
        startDate: "",
        endTime: "17:00",
        endDate: "",
        target: "",
        content: "",
        type: "Cắt điện",
        voltage: "",
        contractId: "",
    });

    // For custom unit input
    const [isCustomUnit, setIsCustomUnit] = useState(false);
    const [customUnitStr, setCustomUnitStr] = useState("");

    const [dateWarning, setDateWarning] = useState("");

    // Time generation (00-24 for hours, 00-55 step 5 for mins)
    const generateTimeOptions = () => {
        const options = [];
        for (let h = 0; h < 24; h++) {
            for (let m = 0; m < 60; m += 5) {
                const hh = h.toString().padStart(2, "0");
                const mm = m.toString().padStart(2, "0");
                options.push(`${hh}:${mm}`);
            }
        }
        return options;
    };
    const timeOptions = generateTimeOptions();

    // Reset when open changes or data changes
    useEffect(() => {
        if (open) {
            if (initialData) {
                setFormData({ ...initialData });
                const unitMatch = DEFAULT_UNITS.includes(initialData.unit);
                if (initialData.unit && !unitMatch) {
                    setIsCustomUnit(true);
                    setCustomUnitStr(initialData.unit);
                } else {
                    setIsCustomUnit(false);
                    setCustomUnitStr("");
                }
            } else {
                setFormData({
                    id: "",
                    unit: "",
                    deviceName: "",
                    startTime: "08:00",
                    startDate: new Date().toISOString().split("T")[0],
                    endTime: "17:00",
                    endDate: new Date().toISOString().split("T")[0],
                    target: "",
                    content: "",
                    type: "Cắt điện",
                    voltage: "",
                    contractId: "",
                });
                setIsCustomUnit(false);
                setCustomUnitStr("");
            }
            setDateWarning("");
        }
    }, [open, initialData]);

    const handleDateChange = (field: "startDate" | "endDate", val: string) => {
        setFormData((prev) => ({ ...prev, [field]: val }));

        if (!val) {
            setDateWarning("");
            return;
        }

        // Logic warning
        const selectedDate = new Date(val);
        selectedDate.setHours(0, 0, 0, 0);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const nextYear = new Date();
        nextYear.setFullYear(today.getFullYear() + 1);
        nextYear.setHours(0, 0, 0, 0);

        if (selectedDate < today) {
            setDateWarning("Cảnh báo: Ngày được chọn nằm trong quá khứ.");
        } else if (selectedDate > nextYear) {
            setDateWarning("Cảnh báo: Ngày được chọn cách hiện tại quá 1 năm.");
        } else {
            setDateWarning("");
        }
    };

    const handleUnitChange = (val: string) => {
        if (val === "custom") {
            setIsCustomUnit(true);
            setFormData((prev) => ({ ...prev, unit: customUnitStr }));
        } else {
            setIsCustomUnit(false);
            setFormData((prev) => ({ ...prev, unit: val }));
        }
    };

    const handleCustomUnitText = (val: string) => {
        setCustomUnitStr(val);
        setFormData((prev) => ({ ...prev, unit: val }));
    };

    const handleVoltageChange = (v: string, checked: boolean) => {
        const currentM = formData.voltage ? formData.voltage.split(",").map(s => s.trim()).filter(Boolean) : [];
        if (checked) {
            currentM.push(v);
        } else {
            const index = currentM.indexOf(v);
            if (index > -1) currentM.splice(index, 1);
        }
        setFormData((prev) => ({ ...prev, voltage: currentM.join(", ") }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onSubmit(formData);
            onOpenChange(false);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const isEdit = !!initialData;
    const currentVoltages = formData.voltage ? formData.voltage.split(",").map(v => v.trim()) : [];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-md">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-[#3a0ca3] border-b pb-2">
                        {isEdit ? "Cập nhật Lịch công tác" : "Thêm mới Lịch công tác"}
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    {/* Unit & Device */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="unit" className="font-semibold text-gray-700">Tỉnh/Đơn vị QLVH *</Label>
                            {!isCustomUnit ? (
                                <Select value={formData.unit} onValueChange={handleUnitChange} required>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Chọn đơn vị" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {DEFAULT_UNITS.map(u => (
                                            <SelectItem key={u} value={u}>{u}</SelectItem>
                                        ))}
                                        <SelectItem value="custom" className="text-blue-600 font-medium">+ Nhập tùy chọn khác</SelectItem>
                                    </SelectContent>
                                </Select>
                            ) : (
                                <div className="flex gap-2">
                                    <Input
                                        value={customUnitStr}
                                        onChange={(e) => handleCustomUnitText(e.target.value)}
                                        placeholder="Nhập đơn vị..."
                                        required
                                    />
                                    <Button type="button" variant="outline" onClick={() => setIsCustomUnit(false)}>Chọn từ DS</Button>
                                </div>
                            )}
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="deviceName" className="font-semibold text-gray-700">Tên ĐD/TBA/Tổ máy *</Label>
                            <Input
                                id="deviceName"
                                value={formData.deviceName || ""}
                                onChange={(e) => setFormData({ ...formData, deviceName: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    {/* Time & Date fields */}
                    <div className="grid grid-cols-2 gap-x-6 gap-y-4 bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                        {/* Start */}
                        <div className="flex flex-col gap-2">
                            <Label className="font-semibold text-blue-800">Bắt đầu</Label>
                            <div className="flex gap-2">
                                <Select value={formData.startTime} onValueChange={(val) => setFormData({ ...formData, startTime: val })}>
                                    <SelectTrigger className="w-[120px]">
                                        <SelectValue placeholder="Giờ" />
                                    </SelectTrigger>
                                    <SelectContent className="max-h-60">
                                        {timeOptions.map(t => (
                                            <SelectItem key={t} value={t}>{t}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant={"outline"}
                                            className={cn(
                                                "w-[140px] pl-3 text-left font-normal flex-1",
                                                !formData.startDate && "text-muted-foreground"
                                            )}
                                        >
                                            {formData.startDate ? (
                                                format(new Date(formData.startDate), "dd/MM/yyyy")
                                            ) : (
                                                <span>Chọn ngày</span>
                                            )}
                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={formData.startDate ? new Date(formData.startDate) : undefined}
                                            onSelect={(date) => {
                                                if (date) {
                                                    const year = date.getFullYear();
                                                    const month = String(date.getMonth() + 1).padStart(2, '0');
                                                    const day = String(date.getDate()).padStart(2, '0');
                                                    handleDateChange("startDate", `${year}-${month}-${day}`);
                                                } else {
                                                    handleDateChange("startDate", "");
                                                }
                                            }}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>

                        {/* End */}
                        <div className="flex flex-col gap-2">
                            <Label className="font-semibold text-pink-700">Kết thúc</Label>
                            <div className="flex gap-2">
                                <Select value={formData.endTime} onValueChange={(val) => setFormData({ ...formData, endTime: val })}>
                                    <SelectTrigger className="w-[120px]">
                                        <SelectValue placeholder="Giờ" />
                                    </SelectTrigger>
                                    <SelectContent className="max-h-60">
                                        {timeOptions.map(t => (
                                            <SelectItem key={t} value={t}>{t}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant={"outline"}
                                            className={cn(
                                                "w-[140px] pl-3 text-left font-normal flex-1",
                                                !formData.endDate && "text-muted-foreground"
                                            )}
                                        >
                                            {formData.endDate ? (
                                                format(new Date(formData.endDate), "dd/MM/yyyy")
                                            ) : (
                                                <span>Chọn ngày</span>
                                            )}
                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={formData.endDate ? new Date(formData.endDate) : undefined}
                                            onSelect={(date) => {
                                                if (date) {
                                                    const year = date.getFullYear();
                                                    const month = String(date.getMonth() + 1).padStart(2, '0');
                                                    const day = String(date.getDate()).padStart(2, '0');
                                                    handleDateChange("endDate", `${year}-${month}-${day}`);
                                                } else {
                                                    handleDateChange("endDate", "");
                                                }
                                            }}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>

                        {dateWarning && (
                            <div className="col-span-2 text-sm font-medium text-amber-600 bg-amber-50 p-2 rounded border border-amber-200">
                                ⚠ {dateWarning}
                            </div>
                        )}
                    </div>

                    {/* Target & Content */}
                    <div className="grid grid-cols-1 gap-4">
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="target" className="font-semibold text-gray-700">Đối tượng *</Label>
                            <Input
                                id="target"
                                value={formData.target || ""}
                                onChange={(e) => setFormData({ ...formData, target: e.target.value })}
                                placeholder="Nhập tên đối tượng công tác..."
                                required
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="contractId" className="font-semibold text-gray-700">Hợp đồng (Tùy chọn)</Label>
                            <Select
                                value={formData.contractId}
                                onValueChange={(val) => setFormData({ ...formData, contractId: val === "none" ? "" : val })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="-- Chọn Hợp đồng liên quan --" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none" className="text-gray-500 italic">-- Không chọn --</SelectItem>
                                    {contracts.map(c => (
                                        <SelectItem key={c.id} value={c.id}>
                                            <span className="font-medium text-blue-800">{c.code}</span> - {c.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="content" className="font-semibold text-gray-700">Nội dung công tác *</Label>
                            <Textarea
                                id="content"
                                value={formData.content || ""}
                                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                placeholder="Mô tả công việc cần làm..."
                                required
                                rows={3}
                            />
                        </div>
                    </div>

                    {/* Type & Voltage */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                            <Label className="font-semibold text-gray-700">Loại hình công tác</Label>
                            <RadioGroup
                                value={formData.type}
                                onValueChange={(val: string) => setFormData({ ...formData, type: val })}
                                className="flex gap-4 mt-1"
                            >
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="Cắt điện" id="r1" />
                                    <Label htmlFor="r1" className="cursor-pointer">Cắt điện</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="Không cắt điện" id="r2" />
                                    <Label htmlFor="r2" className="cursor-pointer">Không cắt điện</Label>
                                </div>
                            </RadioGroup>
                        </div>

                        <div className="flex flex-col gap-2">
                            <Label className="font-semibold text-gray-700">Cấp điện áp</Label>
                            <div className="flex flex-wrap gap-x-4 gap-y-2 mt-1">
                                {VOLTAGE_LEVELS.map((v) => (
                                    <div key={v} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`volt-${v}`}
                                            checked={currentVoltages.includes(v)}
                                            onCheckedChange={(checked) => handleVoltageChange(v, !!checked)}
                                        />
                                        <Label htmlFor={`volt-${v}`} className="cursor-pointer">{v}</Label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="mt-6 border-t pt-4">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                            Hủy
                        </Button>
                        <Button type="submit" disabled={loading} className="bg-[#4361ee] hover:bg-[#4361ee]/90 text-white min-w-[100px]">
                            {loading ? "Đang lưu..." : "Lưu dữ liệu"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
