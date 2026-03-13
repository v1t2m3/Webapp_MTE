"use client";

import { useState, useEffect } from "react";
import { Schedule, Contract, Personnel, Vehicle, WorkOutline, PersonnelAssignment } from "@/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calendar as CalendarIcon, Plus, Trash2, AlertCircle } from "lucide-react";
import { format, isWithinInterval, parseISO } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface WorkOutlineFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    initialData?: WorkOutline | null;
    onSubmit: (data: Partial<WorkOutline>) => Promise<void>;
    schedules: Schedule[];
    personnel: Personnel[];
    vehicles: Vehicle[];
    contracts: Contract[];
    allWorkOutlines?: WorkOutline[];
}

export function WorkOutlineForm({
    open, onOpenChange, initialData, onSubmit, schedules, personnel, vehicles, contracts, allWorkOutlines = []
}: WorkOutlineFormProps) {
    const [loading, setLoading] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [formData, setFormData] = useState<Partial<WorkOutline>>({
        id: "",
        scheduleId: "",
        isCustom: false,
        customContractId: "",
        customContractName: "",
        customContent: "",
        startDate: "",
        startTime: "",
        endDate: "",
        endTime: "",
        personnelAssignments: [],
        vehicleAssignments: [],
    });

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

    // Reset error when form closes
    useEffect(() => {
        if (!open) setFormError(null);
    }, [open]);

    useEffect(() => {
        if (open) {
            if (initialData) {
                setFormData({ ...initialData });
            } else {
                setFormData({
                    id: "",
                    scheduleId: "",
                    isCustom: false,
                    customContractId: "",
                    customContractName: "",
                    customContent: "",
                    startDate: "",
                    startTime: "08:00",
                    endDate: "",
                    endTime: "17:00",
                    personnelAssignments: [],
                    vehicleAssignments: [],
                });
            }
        }
    }, [open, initialData]);

    const handleScheduleChange = (scheduleId: string) => {
        const schedule = schedules.find(s => s.id === scheduleId);
        if (schedule) {
            setFormData(prev => ({
                ...prev,
                scheduleId,
                startDate: schedule.startDate,
                startTime: schedule.startTime,
                endDate: schedule.endDate,
                endTime: schedule.endTime
            }));
        } else {
            setFormData(prev => ({ ...prev, scheduleId }));
        }
    };

    const handleContractChange = (val: string) => {
        if (val === "other") {
            setFormData(prev => ({ ...prev, customContractId: "", customContractName: "" }));
        } else if (val === "none") {
            setFormData(prev => ({ ...prev, customContractId: "", customContractName: "" }));
        } else {
            const c = contracts.find(c => c.id === val);
            setFormData(prev => ({
                ...prev,
                customContractId: val,
                customContractName: c ? `${c.code} - ${c.name}` : ""
            }));
        }
    };

    const addPersonnel = () => {
        setFormData(prev => ({
            ...prev,
            personnelAssignments: [
                ...(prev.personnelAssignments || []),
                {
                    personnelId: "",
                    role: "NVCT - Nhân viên công tác",
                    startDate: prev.startDate || "",
                    startTime: prev.startTime || "08:00",
                    endDate: prev.endDate || "",
                    endTime: prev.endTime || "17:00"
                }
            ]
        }));
    };

    const updatePersonnel = (index: number, field: keyof PersonnelAssignment, value: string) => {
        setFormData(prev => {
            const arr = [...(prev.personnelAssignments || [])];
            arr[index] = { ...arr[index], [field]: value };
            return { ...prev, personnelAssignments: arr };
        });
    };

    const removePersonnel = (index: number) => {
        setFormData(prev => {
            const arr = [...(prev.personnelAssignments || [])];
            arr.splice(index, 1);
            return { ...prev, personnelAssignments: arr };
        });
    };

    const getPersonnelStatusWarning = (personnelId: string, startDate?: string, endDate?: string) => {
        if (!personnelId || !startDate) return null;

        const pInfo = personnel.find(p => p.id === personnelId);
        if (!pInfo) return null;

        const checkDate = parseISO(startDate);

        // 1. Check Leaves
        if (pInfo.leaveDates && pInfo.leaveDates.length > 0) {
            const isOnLeave = pInfo.leaveDates.some(leaveStr => {
                const leaveDate = parseISO(leaveStr);
                return leaveDate.getFullYear() === checkDate.getFullYear() &&
                    leaveDate.getMonth() === checkDate.getMonth() &&
                    leaveDate.getDate() === checkDate.getDate();
            });

            if (isOnLeave) {
                return `Nhân sự đang có lịch nghỉ (${pInfo.leaveType}) vào ngày ${format(checkDate, 'dd/MM/yyyy')}.`;
            }
        }

        // 2. Check Other Outlines (excluding current one if editing)
        const activeOutlines = allWorkOutlines.filter(wo => wo.id !== formData.id);
        for (const wo of activeOutlines) {
            if (wo.startDate === startDate) {
                const isAssigned = wo.personnelAssignments?.some(pa => pa.personnelId === personnelId);
                if (isAssigned) {
                    const title = wo.isCustom ? wo.customContent : schedules.find(s => s.id === wo.scheduleId)?.target || "Đề cương khác";
                    return `Nhân sự đã được phân công vào thẻ: "${title}" trong cùng ngày.`;
                }
            }
        }

        return null;
    };

    const addVehicle = () => {
        setFormData(prev => ({
            ...prev,
            vehicleAssignments: [
                ...(prev.vehicleAssignments || []),
                {
                    vehicleId: "",
                    startDate: prev.startDate || "",
                    startTime: prev.startTime || "08:00",
                    endDate: prev.endDate || "",
                    endTime: prev.endTime || "17:00"
                }
            ]
        }));
    };

    const updateVehicle = (index: number, field: keyof NonNullable<WorkOutline['vehicleAssignments']>[number], value: string) => {
        setFormData(prev => {
            const arr = [...(prev.vehicleAssignments || [])];
            arr[index] = { ...arr[index], [field]: value };
            return { ...prev, vehicleAssignments: arr };
        });
    };

    const removeVehicle = (index: number) => {
        setFormData(prev => {
            const arr = [...(prev.vehicleAssignments || [])];
            arr.splice(index, 1);
            return { ...prev, vehicleAssignments: arr };
        });
    };

    const getVehicleStatusWarning = (vehicleId: string, startDate?: string, endDate?: string) => {
        if (!vehicleId || !startDate) return null;

        const activeOutlines = allWorkOutlines.filter(wo => wo.id !== formData.id);
        for (const wo of activeOutlines) {
            if (wo.startDate === startDate) {
                const isAssigned = wo.vehicleAssignments?.some(va => va.vehicleId === vehicleId);
                if (isAssigned) {
                    const title = wo.isCustom ? wo.customContent : schedules.find(s => s.id === wo.scheduleId)?.target || "Đề cương khác";
                    return `Phương tiện đã được điều động vào thẻ: "${title}" trong cùng ngày.`;
                }
            }
        }
        return null;
    };

    const renderDatePicker = (value: string, onChange: (val: string) => void) => (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant={"outline"}
                    className={cn(
                        "w-[130px] pl-3 text-left font-normal",
                        !value && "text-muted-foreground"
                    )}
                >
                    {value ? format(new Date(value), "dd/MM/yyyy") : <span>Chọn ngày</span>}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                    mode="single"
                    selected={value ? new Date(value) : undefined}
                    onSelect={(date) => {
                        if (date) {
                            const year = date.getFullYear();
                            const month = String(date.getMonth() + 1).padStart(2, '0');
                            const day = String(date.getDate()).padStart(2, '0');
                            onChange(`${year}-${month}-${day}`);
                        } else {
                            onChange("");
                        }
                    }}
                    initialFocus
                />
            </PopoverContent>
        </Popover>
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError(null);

        // Validation 1: Check for duplicate personnel in the same outline
        const assignedIds = formData.personnelAssignments?.map(pa => pa.personnelId === "CUSTOM" ? pa.customName : pa.personnelId).filter(id => id && id.trim() !== "");
        if (assignedIds && assignedIds.length > 0) {
            const uniqueIds = new Set(assignedIds);
            if (uniqueIds.size !== assignedIds.length) {
                setFormError("Có nhân sự bị trùng lặp trong danh sách phân công. Vui lòng kiểm tra lại.");
                return;
            }
        }

        // Validation 2: Check for duplicate vehicles in the same outline
        const assignedVehicleIds = formData.vehicleAssignments?.map(va => va.vehicleId === "CUSTOM" ? va.customLicensePlate : va.vehicleId).filter(id => id && id.trim() !== "");
        if (assignedVehicleIds && assignedVehicleIds.length > 0) {
            const uniqueVIds = new Set(assignedVehicleIds);
            if (uniqueVIds.size !== assignedVehicleIds.length) {
                setFormError("Có phương tiện bị trùng lặp trong danh sách điều động. Vui lòng kiểm tra lại.");
                return;
            }
        }

        setLoading(true);
        try {
            await onSubmit(formData);
        } catch (error) {
            console.error(error);
            setFormError("Lỗi hệ thống khi lưu đề cương.");
        } finally {
            setLoading(false);
        }
    };

    const isEdit = !!initialData;
    const selectedSchedule = schedules.find(s => s.id === formData.scheduleId);
    let contractInfo = "Không có thông tin HĐ";
    if (selectedSchedule && selectedSchedule.contractId) {
        const c = contracts.find(c => c.id === selectedSchedule.contractId);
        if (c) contractInfo = `${c.code} - ${c.name}`;
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-md">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-[#3a0ca3] border-b pb-2">
                        {isEdit ? "Cập nhật Đề cương" : "Lập Đề cương công tác"}
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-6 py-4">
                    {/* General Schedule Info */}
                    <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 flex flex-col gap-4">
                        <Label className="font-semibold text-blue-900 line-clamp-1">1. Nguồn dữ liệu</Label>
                        <RadioGroup
                            value={formData.isCustom ? "custom" : "schedule"}
                            onValueChange={(val) => setFormData(prev => ({ ...prev, isCustom: val === "custom" }))}
                            className="flex space-x-6"
                        >
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="schedule" id="r-schedule" />
                                <Label htmlFor="r-schedule" className="cursor-pointer font-medium text-blue-900">Lịch công tác gốc</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="custom" id="r-custom" />
                                <Label htmlFor="r-custom" className="cursor-pointer font-medium text-blue-900">Tuỳ chọn (Nhập tay)</Label>
                            </div>
                        </RadioGroup>

                        {!formData.isCustom ? (
                            <div className="flex flex-col gap-2 mt-1">
                                <Label className="font-medium text-gray-700">Lịch công tác *</Label>
                                <Select value={formData.scheduleId} onValueChange={handleScheduleChange} required={!formData.isCustom}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="-- Chọn Lịch công tác --" />
                                    </SelectTrigger>
                                    <SelectContent className="max-h-[300px]">
                                        {[...schedules]
                                            .sort((a, b) => {
                                                const dateA = a.startDate ? new Date(a.startDate).getTime() : 0;
                                                const dateB = b.startDate ? new Date(b.startDate).getTime() : 0;
                                                return dateB - dateA;
                                            })
                                            .map(s => (
                                            <SelectItem key={s.id} value={s.id}>
                                                <span className="font-semibold">{s.target}</span> - {s.deviceName} ({s.startDate ? format(new Date(s.startDate), 'dd/MM/yyyy') : ''})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {selectedSchedule && (
                                    <div className="mt-2 text-sm text-gray-700 bg-white p-3 rounded-lg border">
                                        <p><strong>Nội dung:</strong> {selectedSchedule.content}</p>
                                        <p className="mt-1"><strong>Hợp đồng:</strong> {contractInfo}</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex flex-col gap-4 mt-1">
                                <div className="flex flex-col gap-2">
                                    <Label className="font-medium text-gray-700">Hợp đồng</Label>
                                    <Select
                                        value={formData.customContractId || (formData.customContractName === "" ? "none" : (formData.customContractName ? "other" : ""))}
                                        onValueChange={handleContractChange}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="-- Chọn Hợp đồng (Tuỳ chọn) --" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">-- Không có / Bỏ qua --</SelectItem>
                                            {contracts.map(c => (
                                                <SelectItem key={c.id} value={c.id}>
                                                    {c.code} - {c.name}
                                                </SelectItem>
                                            ))}
                                            <SelectItem value="other">-- Nhập tay --</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {!formData.customContractId && formData.customContractName !== undefined && (
                                        <Input
                                            placeholder="Nhập tên hợp đồng / số hợp đồng..."
                                            value={formData.customContractName}
                                            onChange={(e) => setFormData(prev => ({ ...prev, customContractName: e.target.value }))}
                                            className="mt-1"
                                        />
                                    )}
                                </div>
                                <div className="flex flex-col gap-2">
                                    <Label className="font-medium text-gray-700">Nội dung công việc *</Label>
                                    <Input
                                        required={formData.isCustom}
                                        placeholder="Nhập nội dung công tác..."
                                        value={formData.customContent || ""}
                                        onChange={(e) => setFormData(prev => ({ ...prev, customContent: e.target.value }))}
                                    />
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                            <div className="flex flex-col gap-2">
                                <Label className="font-medium text-gray-700">Thời gian bắt đầu chung</Label>
                                <div className="flex gap-2">
                                    <Select value={formData.startTime} onValueChange={(val) => setFormData({ ...formData, startTime: val })}>
                                        <SelectTrigger className="w-[100px]">
                                            <SelectValue placeholder="Giờ" />
                                        </SelectTrigger>
                                        <SelectContent className="max-h-60">
                                            {timeOptions.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                    {renderDatePicker(formData.startDate || "", (val) => setFormData({ ...formData, startDate: val }))}
                                </div>
                            </div>
                            <div className="flex flex-col gap-2">
                                <Label className="font-medium text-gray-700">Thời gian kết thúc chung</Label>
                                <div className="flex gap-2">
                                    <Select value={formData.endTime} onValueChange={(val) => setFormData({ ...formData, endTime: val })}>
                                        <SelectTrigger className="w-[100px]">
                                            <SelectValue placeholder="Giờ" />
                                        </SelectTrigger>
                                        <SelectContent className="max-h-60">
                                            {timeOptions.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                    {renderDatePicker(formData.endDate || "", (val) => setFormData({ ...formData, endDate: val }))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Personnel Section */}
                    <div className="bg-purple-50/50 p-4 rounded-xl border border-purple-100 flex flex-col gap-4">
                        <div className="flex justify-between items-center">
                            <Label className="font-semibold text-purple-900">2. Phân công Nhân sự</Label>
                            <Button type="button" variant="outline" size="sm" onClick={addPersonnel} className="text-purple-700 border-purple-200 hover:bg-purple-100">
                                <Plus className="w-4 h-4 mr-1" /> Thêm nhân sự
                            </Button>
                        </div>

                        {formError && (
                            <Alert variant="destructive" className="bg-red-50 border-red-200">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>{formError}</AlertDescription>
                            </Alert>
                        )}

                        {(!formData.personnelAssignments || formData.personnelAssignments.length === 0) && (
                            <div className="text-center p-4 text-muted-foreground text-sm border border-dashed rounded-lg bg-white/50">
                                Chưa phân công nhân sự nào.
                            </div>
                        )}

                        {formData.personnelAssignments?.map((assignment, index) => {
                            // Extract assigned IDs excluding current row to disable them in dropdown
                            const otherAssignedIds = formData.personnelAssignments
                                ?.filter((_, i) => i !== index)
                                ?.map(pa => pa.personnelId) || [];

                            const warning = getPersonnelStatusWarning(assignment.personnelId, assignment.startDate, assignment.endDate);

                            return (
                                <div key={index} className="flex flex-col gap-2">
                                    <div className={cn(
                                        "flex flex-col lg:flex-row gap-3 items-end bg-white p-3 rounded-lg border shadow-sm transition-colors",
                                        warning ? "border-amber-300 bg-amber-50/30" : ""
                                    )}>
                                        <div className="flex gap-2 w-full">
                                            <div className="flex-[2] flex flex-col gap-2 relative">
                                                <Label className="text-xs mb-1 block text-gray-500">Nhân sự</Label>
                                                <Select value={assignment.personnelId} onValueChange={(v) => {
                                                    updatePersonnel(index, "personnelId", v);
                                                    if (v !== "CUSTOM") {
                                                        updatePersonnel(index, "customName", "");
                                                    }
                                                }} required>
                                                    <SelectTrigger className={warning ? "border-amber-300" : ""}>
                                                        <SelectValue placeholder="Chọn nhân sự" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {personnel.filter(p => p.status === "Hoạt động" || p.status === "Nghỉ phép").map(p => (
                                                            <SelectItem
                                                                key={p.id}
                                                                value={p.id}
                                                                disabled={otherAssignedIds.includes(p.id)}
                                                            >
                                                                {p.fullName} - {p.job}
                                                            </SelectItem>
                                                        ))}
                                                        <SelectItem value="CUSTOM" className="font-semibold text-purple-700">-- Nhập tay (Tuỳ chọn) --</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                {assignment.personnelId === "CUSTOM" && (
                                                    <Input
                                                        placeholder="Nhập tên nhân sự..."
                                                        value={assignment.customName || ""}
                                                        onChange={(e) => updatePersonnel(index, "customName", e.target.value)}
                                                        required
                                                        className="mt-1"
                                                    />
                                                )}
                                            </div>
                                            <div className="flex-1 max-w-[130px]">
                                                <Label className="text-xs mb-1 block text-gray-500">Chức danh</Label>
                                                <Select value={assignment.role || "NVCT - Nhân viên công tác"} onValueChange={(v) => updatePersonnel(index, "role", v)} required>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Chức danh" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="CHTT - Chỉ huy trực tiếp">CHTT</SelectItem>
                                                        <SelectItem value="LĐCV - Lãnh đạo công việc">LĐCV</SelectItem>
                                                        <SelectItem value="NVCT - Nhân viên công tác">NVCT</SelectItem>
                                                        <SelectItem value="GSAT - Giám sát an toàn">GSAT</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                        <div className="flex flex-col w-full lg:w-auto">
                                            <Label className="text-xs mb-1 block text-gray-500">Từ</Label>
                                            <div className="flex gap-1">
                                                <Select value={assignment.startTime} onValueChange={(v) => updatePersonnel(index, "startTime", v)}>
                                                    <SelectTrigger className="w-[80px] h-9"><SelectValue /></SelectTrigger>
                                                    <SelectContent className="max-h-60">{timeOptions.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                                                </Select>
                                                {renderDatePicker(assignment.startDate, (val) => updatePersonnel(index, "startDate", val))}
                                            </div>
                                        </div>
                                        <div className="flex flex-col w-full lg:w-auto">
                                            <Label className="text-xs mb-1 block text-gray-500">Đến</Label>
                                            <div className="flex gap-1">
                                                <Select value={assignment.endTime} onValueChange={(v) => updatePersonnel(index, "endTime", v)}>
                                                    <SelectTrigger className="w-[80px] h-9"><SelectValue /></SelectTrigger>
                                                    <SelectContent className="max-h-60">{timeOptions.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                                                </Select>
                                                {renderDatePicker(assignment.endDate, (val) => updatePersonnel(index, "endDate", val))}
                                            </div>
                                        </div>
                                        <Button type="button" variant="ghost" size="icon" className="text-red-500 hover:bg-red-50 h-9 shrink-0" onClick={() => removePersonnel(index)}>
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>

                                    {warning && (
                                        <div className="text-xs text-amber-600 bg-amber-50 px-3 py-1.5 rounded-md flex items-center w-full">
                                            <AlertCircle className="w-3.5 h-3.5 mr-1.5 inline" />
                                            Chú ý: {warning}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Vehicles Section */}
                    <div className="bg-orange-50/50 p-4 rounded-xl border border-orange-100 flex flex-col gap-4">
                        <div className="flex justify-between items-center">
                            <Label className="font-semibold text-orange-900">3. Điều động Phương tiện</Label>
                            <Button type="button" variant="outline" size="sm" onClick={addVehicle} className="text-orange-700 border-orange-200 hover:bg-orange-100">
                                <Plus className="w-4 h-4 mr-1" /> Thêm phương tiện
                            </Button>
                        </div>

                        {(!formData.vehicleAssignments || formData.vehicleAssignments.length === 0) && (
                            <div className="text-center p-4 text-muted-foreground text-sm border border-dashed rounded-lg bg-white/50">
                                Chưa điều động phương tiện nào.
                            </div>
                        )}

                        {formData.vehicleAssignments?.map((assignment, index) => {
                            const otherAssignedIds = formData.vehicleAssignments
                                ?.filter((_, i) => i !== index)
                                ?.map(va => va.vehicleId) || [];

                            const warning = getVehicleStatusWarning(assignment.vehicleId, assignment.startDate, assignment.endDate);

                            return (
                                <div key={index} className="flex flex-col gap-2">
                                    <div className={cn(
                                        "flex flex-col lg:flex-row gap-3 items-end bg-white p-3 rounded-lg border shadow-sm transition-colors",
                                        warning ? "border-amber-300 bg-amber-50/30" : ""
                                    )}>
                                        <div className="flex-[3] w-full flex flex-col gap-2 relative">
                                            <Label className="text-xs mb-1 block text-gray-500">Phương tiện</Label>
                                            <Select value={assignment.vehicleId} onValueChange={(v) => {
                                                updateVehicle(index, "vehicleId", v);
                                                if (v !== "CUSTOM") {
                                                    updateVehicle(index, "customLicensePlate", "");
                                                    updateVehicle(index, "customType", "");
                                                }
                                            }} required>
                                                <SelectTrigger className={warning ? "border-amber-300" : ""}>
                                                    <SelectValue placeholder="Chọn phương tiện" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {vehicles.map(v => (
                                                        <SelectItem
                                                            key={v.id}
                                                            value={v.id}
                                                            disabled={otherAssignedIds.includes(v.id)}
                                                        >
                                                            {v.licensePlate} - {v.name}
                                                        </SelectItem>
                                                    ))}
                                                    <SelectItem value="CUSTOM" className="font-semibold text-orange-700">-- Nhập tay (Tuỳ chọn) --</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            {assignment.vehicleId === "CUSTOM" && (
                                                <div className="flex gap-2 mt-1">
                                                    <Input
                                                        placeholder="Biển số..."
                                                        value={assignment.customLicensePlate || ""}
                                                        onChange={(e) => updateVehicle(index, "customLicensePlate", e.target.value)}
                                                        required
                                                        className="flex-[2]"
                                                    />
                                                    <Select value={assignment.customType || ""} onValueChange={(v) => updateVehicle(index, "customType", v)} required>
                                                        <SelectTrigger className="flex-[1]">
                                                            <SelectValue placeholder="Loại" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="Công ty">Công ty</SelectItem>
                                                            <SelectItem value="Thuê ngoài">Thuê ngoài</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex flex-col w-full lg:w-auto">
                                            <Label className="text-xs mb-1 block text-gray-500">Từ</Label>
                                            <div className="flex gap-1">
                                                <Select value={assignment.startTime} onValueChange={(v) => updateVehicle(index, "startTime", v)}>
                                                    <SelectTrigger className="w-[80px] h-9"><SelectValue /></SelectTrigger>
                                                    <SelectContent className="max-h-60">{timeOptions.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                                                </Select>
                                                {renderDatePicker(assignment.startDate, (val) => updateVehicle(index, "startDate", val))}
                                            </div>
                                        </div>
                                        <div className="flex flex-col w-full lg:w-auto">
                                            <Label className="text-xs mb-1 block text-gray-500">Đến</Label>
                                            <div className="flex gap-1">
                                                <Select value={assignment.endTime} onValueChange={(v) => updateVehicle(index, "endTime", v)}>
                                                    <SelectTrigger className="w-[80px] h-9"><SelectValue /></SelectTrigger>
                                                    <SelectContent className="max-h-60">{timeOptions.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                                                </Select>
                                                {renderDatePicker(assignment.endDate, (val) => updateVehicle(index, "endDate", val))}
                                            </div>
                                        </div>
                                        <Button type="button" variant="ghost" size="icon" className="text-red-500 hover:bg-red-50 h-9 shrink-0" onClick={() => removeVehicle(index)}>
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>

                                    {warning && (
                                        <div className="text-xs text-amber-600 bg-amber-50 px-3 py-1.5 rounded-md flex items-center w-full">
                                            <AlertCircle className="w-3.5 h-3.5 mr-1.5 inline" />
                                            Chú ý: {warning}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    <DialogFooter className="mt-4 border-t pt-4">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                            Hủy
                        </Button>
                        <Button type="submit" disabled={loading} className="bg-[#3f37c9] hover:bg-[#3f37c9]/90 text-white min-w-[120px]">
                            {loading ? "Đang lưu..." : "Lưu Đề Cương"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
