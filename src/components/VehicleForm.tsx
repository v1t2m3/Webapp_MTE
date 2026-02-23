"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Vehicle } from "@/types";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface VehicleFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    initialData?: Vehicle | null;
    onSubmit: (data: Partial<Vehicle>) => Promise<void>;
}

export function VehicleForm({ open, onOpenChange, initialData, onSubmit }: VehicleFormProps) {
    const [formData, setFormData] = useState<Partial<Vehicle>>({
        name: "",
        type: "",
        licensePlate: "",
        inspectionExpiry: "",
        insuranceExpiry: "",
        status: "Available",
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open) {
            if (initialData) {
                setFormData(initialData);
            } else {
                setFormData({
                    name: "",
                    type: "",
                    licensePlate: "",
                    inspectionExpiry: "",
                    insuranceExpiry: "",
                    status: "Available",
                });
            }
        }
    }, [open, initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (name: string, value: string) => {
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

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
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{initialData ? "Sửa thông tin xe" : "Thêm xe mới"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">Tên xe</Label>
                        <Input id="name" name="name" value={formData.name || ""} onChange={handleChange} className="col-span-3" required placeholder="VD: Xe cẩu 5 tấn" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="type" className="text-right">Loại xe</Label>
                        <Input id="type" name="type" value={formData.type || ""} onChange={handleChange} className="col-span-3" required placeholder="VD: Xe cẩu, Xe tải..." />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="licensePlate" className="text-right">Biển số</Label>
                        <Input id="licensePlate" name="licensePlate" value={formData.licensePlate || ""} onChange={handleChange} className="col-span-3" required />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="status" className="text-right">Trạng thái</Label>
                        <div className="col-span-3">
                            <Select onValueChange={(val) => handleSelectChange("status", val)} defaultValue={formData.status}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Chọn trạng thái" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Available">Sẵn sàng</SelectItem>
                                    <SelectItem value="In Use">Đang sử dụng</SelectItem>
                                    <SelectItem value="Maintenance">Bảo trì</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="inspectionExpiry" className="text-right">Hạn đăng kiểm</Label>
                        <div className="col-span-3">
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={"outline"}
                                        className={cn(
                                            "w-full pl-3 text-left font-normal",
                                            !formData.inspectionExpiry && "text-muted-foreground"
                                        )}
                                    >
                                        {formData.inspectionExpiry ? (
                                            format(new Date(formData.inspectionExpiry), "dd/MM/yyyy")
                                        ) : (
                                            <span>Chọn ngày</span>
                                        )}
                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={formData.inspectionExpiry ? new Date(formData.inspectionExpiry) : undefined}
                                        onSelect={(date) => {
                                            if (date) {
                                                const year = date.getFullYear();
                                                const month = String(date.getMonth() + 1).padStart(2, '0');
                                                const day = String(date.getDate()).padStart(2, '0');
                                                setFormData(prev => ({ ...prev, inspectionExpiry: `${year}-${month}-${day}` }));
                                            } else {
                                                setFormData(prev => ({ ...prev, inspectionExpiry: "" }));
                                            }
                                        }}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="insuranceExpiry" className="text-right">Hạn bảo hiểm</Label>
                        <div className="col-span-3">
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={"outline"}
                                        className={cn(
                                            "w-full pl-3 text-left font-normal",
                                            !formData.insuranceExpiry && "text-muted-foreground"
                                        )}
                                    >
                                        {formData.insuranceExpiry ? (
                                            format(new Date(formData.insuranceExpiry), "dd/MM/yyyy")
                                        ) : (
                                            <span>Chọn ngày</span>
                                        )}
                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={formData.insuranceExpiry ? new Date(formData.insuranceExpiry) : undefined}
                                        onSelect={(date) => {
                                            if (date) {
                                                const year = date.getFullYear();
                                                const month = String(date.getMonth() + 1).padStart(2, '0');
                                                const day = String(date.getDate()).padStart(2, '0');
                                                setFormData(prev => ({ ...prev, insuranceExpiry: `${year}-${month}-${day}` }));
                                            } else {
                                                setFormData(prev => ({ ...prev, insuranceExpiry: "" }));
                                            }
                                        }}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
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
