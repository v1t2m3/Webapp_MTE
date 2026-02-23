"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Contract } from "@/types";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

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
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open) {
            if (initialData) {
                setFormData(initialData);
            } else {
                setFormData({
                    code: "",
                    name: "",
                    value: "",
                    startDate: "",
                    endDate: "",
                    investorRep: "",
                });
            }
        }
    }, [open, initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
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
                    <DialogTitle>{initialData ? "Sửa hợp đồng" : "Thêm hợp đồng mới"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="code" className="text-right">Mã số HĐ</Label>
                        <Input id="code" name="code" value={formData.code || ""} onChange={handleChange} className="col-span-3" required placeholder="VD: HĐ-2024/01" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">Tên HĐ</Label>
                        <Input id="name" name="name" value={formData.name || ""} onChange={handleChange} className="col-span-3" required placeholder="VD: Bảo trì hệ thống..." />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="value" className="text-right">Giá trị</Label>
                        <Input id="value" name="value" value={formData.value || ""} onChange={handleChange} className="col-span-3" required placeholder="VD: 500.000.000 VNĐ" />
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
                        <Input id="investorRep" name="investorRep" value={formData.investorRep || ""} onChange={handleChange} className="col-span-3" placeholder="VD: Nguyễn Văn A" />
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
