"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Equipment } from "@/types";
import { useRouter } from "next/navigation";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

export function EquipmentForm({
    open,
    onOpenChange,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    const { register, handleSubmit, reset, setValue } = useForm<Partial<Equipment>>();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();
    const router = useRouter();

    const onSubmit = async (data: Partial<Equipment>) => {
        setIsSubmitting(true);
        try {
            // Minimal client-side mock implementation for immediate UX or calling API endpoint if available.
            // But since addEquipment is in data-service, we should hit a Server Action or API Route.
            // For now, let's simulate the request here. Realistically, we'd have a server action:
            // await submitEquipmentAction(data);

            const res = await fetch('/api/equipments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (!res.ok) throw new Error("Thất bại");

            toast({
                title: "Thành công",
                description: "Đã thêm thiết bị mới thành công.",
            });
            reset();
            onOpenChange(false);
            router.refresh(); // Refresh page to get latest data
        } catch (error) {
            toast({
                title: "Lỗi",
                description: "Không thể lưu thiết bị. Vui lòng thử lại.",
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
                        <DialogTitle>Thêm Thiết Bị Mới</DialogTitle>
                        <DialogDescription>
                            Nhập thông tin thiết bị máy móc dùng cho thử nghiệm chuẩn ISO 17025.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">Tên thiết bị</Label>
                            <Input id="name" {...register("name", { required: true })} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="serialNumber" className="text-right">Số Serial</Label>
                            <Input id="serialNumber" {...register("serialNumber")} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="location" className="text-right">Vị trí</Label>
                            <Input id="location" {...register("location")} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="calibrationFrequency" className="text-right">Chu kỳ H/C (tháng)</Label>
                            <Input id="calibrationFrequency" type="number" {...register("calibrationFrequency", { valueAsNumber: true })} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="lastCalibrationDate" className="text-right">Ngày H/C gần nhất</Label>
                            <Input id="lastCalibrationDate" type="date" {...register("lastCalibrationDate")} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="nextCalibrationDate" className="text-right">Ngày H/C tiếp theo</Label>
                            <Input id="nextCalibrationDate" type="date" {...register("nextCalibrationDate")} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="calibrationAgent" className="text-right">Đơn vị H/C</Label>
                            <Input id="calibrationAgent" {...register("calibrationAgent")} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="status" className="text-right">Trạng thái</Label>
                            <div className="col-span-3">
                                <Select onValueChange={(val) => setValue("status", val)} defaultValue="Active">
                                    <SelectTrigger>
                                        <SelectValue placeholder="Chọn trạng thái" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Active">Hoạt động tốt (Active)</SelectItem>
                                        <SelectItem value="Broken">Hư hỏng (Broken)</SelectItem>
                                        <SelectItem value="Calibrating">Đang hiệu chuẩn</SelectItem>
                                        <SelectItem value="Chờ thanh lý">Chờ thanh lý</SelectItem>
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
                            {isSubmitting ? "Đang lưu..." : "Lưu thiết bị"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
