"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Contract } from "@/types";
import { Calendar as CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { toDisplayDate, parseSafeDate } from "@/lib/date-utils";

interface ContractFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    initialData?: Contract | null;
    onSubmit: (data: Partial<Contract>) => Promise<void>;
}

export function ContractForm({ open, onOpenChange, initialData, onSubmit }: ContractFormProps) {
    const [formData, setFormData] = useState<Partial<Contract>>({
        code: "",
        name: "",
        value: "",
        startDate: "",
        endDate: "",
        investorRep: "",
        operationsManagementUnit: "",
        status: "Đang thực hiện",
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open) {
            if (initialData) {
                setFormData({
                    ...initialData,
                    status: initialData.status || "Đang thực hiện",
                });
            } else {
                setFormData({
                    code: "",
                    name: "",
                    value: "",
                    startDate: "",
                    endDate: "",
                    investorRep: "",
                    operationsManagementUnit: "",
                    status: "Đang thực hiện",
                });
            }
        }
    }, [open, initialData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onSubmit(formData);
            onOpenChange(false);
        } catch (error) {
            console.error("Form submission error:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{initialData ? "Sửa Hợp Đồng" : "Thêm Hợp Đồng Mới"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="code" className="text-right">Mã số HĐ *</Label>
                        <Input id="code" name="code" value={formData.code || ""} onChange={(e) => setFormData({ ...formData, code: e.target.value })} className="col-span-3" required placeholder="VD: HĐ-2024/01" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">Tên hợp đồng *</Label>
                        <Input id="name" name="name" value={formData.name || ""} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="col-span-3" required placeholder="VD: Bảo trì hệ thống..." />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="value" className="text-right">Giá trị HĐ *</Label>
                        <Input id="value" name="value" value={formData.value || ""} onChange={(e) => setFormData({ ...formData, value: e.target.value })} className="col-span-3" required placeholder="VD: 500.000.000 VNĐ" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="startDate" className="text-right">Ngày bắt đầu</Label>
                        <div className="col-span-3">
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={"outline"}
                                        className={cn(
                                            "w-full pl-3 text-left font-normal",
                                            !formData.startDate && "text-muted-foreground"
                                        )}
                                    >
                                        {formData.startDate ? (
                                            toDisplayDate(formData.startDate)
                                        ) : (
                                            <span>Chọn ngày</span>
                                        )}
                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={parseSafeDate(formData.startDate) || undefined}
                                        onSelect={(date) => {
                                            if (date) {
                                                const year = date.getFullYear();
                                                const month = String(date.getMonth() + 1).padStart(2, '0');
                                                const day = String(date.getDate()).padStart(2, '0');
                                                setFormData(prev => ({ ...prev, startDate: `${year}-${month}-${day}` }));
                                            } else {
                                                setFormData(prev => ({ ...prev, startDate: "" }));
                                            }
                                        }}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="endDate" className="text-right">Ngày kết thúc</Label>
                        <div className="col-span-3">
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={"outline"}
                                        className={cn(
                                            "w-full pl-3 text-left font-normal",
                                            !formData.endDate && "text-muted-foreground"
                                        )}
                                    >
                                        {formData.endDate ? (
                                            toDisplayDate(formData.endDate)
                                        ) : (
                                            <span>Chọn ngày</span>
                                        )}
                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={parseSafeDate(formData.endDate) || undefined}
                                        onSelect={(date) => {
                                            if (date) {
                                                const year = date.getFullYear();
                                                const month = String(date.getMonth() + 1).padStart(2, '0');
                                                const day = String(date.getDate()).padStart(2, '0');
                                                setFormData(prev => ({ ...prev, endDate: `${year}-${month}-${day}` }));
                                            } else {
                                                setFormData(prev => ({ ...prev, endDate: "" }));
                                            }
                                        }}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="investorRep" className="text-right">Đại diện CĐT</Label>
                        <Input id="investorRep" name="investorRep" value={formData.investorRep || ""} onChange={(e) => setFormData(prev => ({ ...prev, investorRep: e.target.value }))} className="col-span-3" placeholder="VD: Nguyễn Văn A" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="operationsManagementUnit" className="text-right">ĐV QLVH</Label>
                        <Input id="operationsManagementUnit" name="operationsManagementUnit" value={formData.operationsManagementUnit || ""} onChange={(e) => setFormData(prev => ({ ...prev, operationsManagementUnit: e.target.value }))} className="col-span-3" placeholder="VD: Điện lực Hải Châu" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="status" className="text-right font-semibold">Trạng thái *</Label>
                        <div className="col-span-3">
                            <Select
                                value={formData.status || "Đang thực hiện"}
                                onValueChange={(val) => setFormData(prev => ({ ...prev, status: val as 'Đang thực hiện' | 'Hoàn thành' }))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Chọn trạng thái" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Đang thực hiện">Đang thực hiện</SelectItem>
                                    <SelectItem value="Hoàn thành">Hoàn thành</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Đang lưu..." : "Lưu thông tin"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
