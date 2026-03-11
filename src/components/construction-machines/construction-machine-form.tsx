"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ConstructionMachine } from "@/types";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

export function ConstructionMachineForm({
    open,
    onOpenChange,
    initialData
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    initialData?: ConstructionMachine | null;
}) {
    const { register, handleSubmit, reset, setValue, watch } = useForm<Partial<ConstructionMachine>>();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        if (open) {
            if (initialData) {
                reset(initialData);
            } else {
                reset({ status: "đang sử dụng" });
            }
        }
    }, [open, initialData, reset]);

    const onSubmit = async (data: Partial<ConstructionMachine>) => {
        setIsSubmitting(true);
        try {
            const isEditing = !!initialData;
            const url = isEditing ? `/api/construction-machines/${initialData.id}` : '/api/construction-machines';
            const method = isEditing ? 'PUT' : 'POST';

            const payload = {
                ...data,
                id: isEditing ? initialData.id : undefined,
            };

            const res = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!res.ok) throw new Error("Thất bại");

            toast({
                title: "Thành công",
                description: !!initialData ? "Đã cập nhật máy thi công thành công." : "Đã thêm máy thi công thành công.",
            });
            reset();
            onOpenChange(false);
            window.location.reload();
        } catch (error) {
            toast({
                title: "Lỗi",
                description: "Không thể lưu thông tin. Vui lòng thử lại.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <form onSubmit={handleSubmit(onSubmit)}>
                    <DialogHeader>
                        <DialogTitle>{initialData ? "Sửa thông tin máy thi công" : "Thêm máy thi công"}</DialogTitle>
                        <DialogDescription>
                            Nhập thông tin chi tiết về thiết bị và trạng thái hiện tại.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">Tên máy</Label>
                            <Input id="name" {...register("name", { required: true })} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="serialNumber" className="text-right">Số Serial</Label>
                            <Input id="serialNumber" {...register("serialNumber", { required: true })} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="location" className="text-right">Vị trí</Label>
                            <Input id="location" {...register("location")} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="status" className="text-right">Trạng thái</Label>
                            <div className="col-span-3">
                                <Select onValueChange={(val) => setValue("status", val)} value={watch("status") || "đang sử dụng"}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Chọn trạng thái" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="đang sử dụng">Đang sử dụng</SelectItem>
                                        <SelectItem value="đang hư hỏng">Đang hư hỏng</SelectItem>
                                        <SelectItem value="thanh lý">Thanh lý</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Hủy
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Đang lưu..." : "Lưu máy thi công"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
