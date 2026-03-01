"use client";

import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CAPA, Personnel } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

interface CapaFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    initialData?: CAPA | null;
    personnel: Personnel[];
}

const defaultValues = {
    issueDate: "",
    source: "",
    description: "",
    assignee: "",
    actionPlan: "",
    deadline: "",
    closeDate: "",
    status: "Yêu cầu xử lý",
    level: "Khuyến nghị",
    linkFile: "",
};

// Helper for date conversion
const formatDateForInput = (dateStr: string | undefined) => {
    if (!dateStr) return "";
    if (dateStr.includes('-')) return dateStr;
    const parts = dateStr.split('/');
    if (parts.length === 3) {
        return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
    }
    return "";
};

const formatDateForSave = (dateStr: string | undefined) => {
    if (!dateStr) return "";
    if (dateStr.includes('/')) return dateStr;
    const parts = dateStr.split('-');
    if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return "";
};

export function CapaForm({ open, onOpenChange, initialData, personnel }: CapaFormProps) {
    const isEditing = !!initialData;
    const { register, handleSubmit, reset, setValue, control, formState: { errors, isValid } } = useForm<Partial<CAPA>>({
        defaultValues
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [customError, setCustomError] = useState<string | null>(null);
    const { toast } = useToast();
    const router = useRouter();

    const watchStatus = useWatch({ control, name: "status" });
    const watchLinkFile = useWatch({ control, name: "linkFile" });
    const watchAssignee = useWatch({ control, name: "assignee" });

    const { data: session } = useSession();
    const canComplete = session?.user?.role === "Admin" || (watchAssignee === session?.user?.fullName);

    useEffect(() => {
        if (open) {
            if (isEditing && initialData) {
                // Determine base status correctly, fallback any "Đang quá hạn" UI status back to "Đang xử lý" if it was internally that state
                let baseStatus = initialData.status || "Yêu cầu xử lý";
                if (baseStatus.toLowerCase() === "đang quá hạn") {
                    baseStatus = "Đang xử lý"; // UI mapping reverse
                }

                reset({
                    ...initialData,
                    issueDate: formatDateForInput(initialData.issueDate),
                    deadline: formatDateForInput(initialData.deadline),
                    closeDate: formatDateForInput(initialData.closeDate),
                    status: baseStatus,
                });
            } else {
                reset(defaultValues);
            }
            setCustomError(null);
        }
    }, [open, isEditing, initialData, reset]);

    const onSubmit = async (data: Partial<CAPA>) => {
        // Custom conditional validation
        if (data.status === "Hoàn thành" && (!data.linkFile || data.linkFile.trim() === "")) {
            setCustomError("Phải đính kèm link tài liệu chứng minh khi chuyển trạng thái Hoàn thành.");
            return;
        }

        setCustomError(null);
        setIsSubmitting(true);
        try {
            const formattedData = {
                ...data,
                id: isEditing ? initialData?.id : undefined,
                issueDate: formatDateForSave(data.issueDate),
                deadline: formatDateForSave(data.deadline),
                closeDate: formatDateForSave(data.closeDate),
            };

            const url = isEditing ? `/api/capa/${initialData?.id}` : '/api/capa';
            const method = isEditing ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formattedData)
            });

            if (!res.ok) {
                throw new Error("Thất bại");
            }

            toast({
                title: "Thành công",
                description: isEditing ? "Đã cập nhật CAPA thành công." : "Đã thêm CAPA mới thành công.",
            });
            onOpenChange(false);
            router.refresh();
        } catch (error) {
            toast({
                title: "Lỗi",
                description: "Không thể lưu CAPA. Vui lòng thử lại.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[550px]">
                <form onSubmit={handleSubmit(onSubmit)}>
                    <DialogHeader>
                        <DialogTitle>{isEditing ? "Chỉnh Sửa CAPA" : "Thêm CAPA Mới"}</DialogTitle>
                        <DialogDescription>
                            {isEditing ? "Cập nhật thông tin phiếu Hành động Khắc phục/Phòng ngừa." : "Tạo phiếu Hành động Khắc phục/Phòng ngừa (CAPA) mới."}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto px-1">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="issueDate" className="text-right">Ngày phát sinh <span className="text-red-500">*</span></Label>
                            <Input id="issueDate" type="date" {...register("issueDate", { required: true })} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="source" className="text-right">Nguồn <span className="text-red-500">*</span></Label>
                            <Input id="source" {...register("source", { required: true })} className="col-span-3" placeholder="VD: Đánh giá nội bộ" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="description" className="text-right">Mô tả sự cố <span className="text-red-500">*</span></Label>
                            <Input id="description" {...register("description", { required: true })} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="assignee" className="text-right">Người phụ trách <span className="text-red-500">*</span></Label>
                            <div className="col-span-3">
                                <Select
                                    onValueChange={(val) => setValue("assignee", val)}
                                    defaultValue={initialData?.assignee || ""}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Chọn người phụ trách" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {personnel.map((p) => (
                                            <SelectItem key={p.id} value={p.fullName || p.name}>
                                                {p.fullName || p.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="actionPlan" className="text-right">Kế hoạch CQ <span className="text-red-500">*</span></Label>
                            <Input id="actionPlan" {...register("actionPlan", { required: true })} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="deadline" className="text-right">Hạn chót <span className="text-red-500">*</span></Label>
                            <Input id="deadline" type="date" {...register("deadline", { required: true })} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="closeDate" className="text-right">Ngày đóng</Label>
                            <Input id="closeDate" type="date" {...register("closeDate")} className="col-span-3" />
                        </div>

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="level" className="text-right">Mức độ <span className="text-red-500">*</span></Label>
                            <div className="col-span-3">
                                <Select
                                    onValueChange={(val) => setValue("level", val)}
                                    defaultValue={initialData?.level || "Khuyến nghị"}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Chọn mức độ ưu tiên" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Lỗi nặng">Lỗi nặng</SelectItem>
                                        <SelectItem value="Lỗi nhẹ">Lỗi nhẹ</SelectItem>
                                        <SelectItem value="Khuyến nghị">Khuyến nghị</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="status" className="text-right">Trạng thái <span className="text-red-500">*</span></Label>
                            <div className="col-span-3">
                                <Select
                                    onValueChange={(val) => {
                                        setValue("status", val);
                                        if (val !== "Hoàn thành") setCustomError(null);
                                    }}
                                    defaultValue={
                                        initialData?.status?.toLowerCase() === "hoàn thành" ? "Hoàn thành" :
                                            initialData?.status?.toLowerCase().includes("xử lý") && initialData?.status?.toLowerCase().includes("đang") ? "Đang xử lý" :
                                                "Yêu cầu xử lý"
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Chọn trạng thái" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Yêu cầu xử lý">Yêu cầu xử lý</SelectItem>
                                        <SelectItem value="Đang xử lý">Đang xử lý</SelectItem>
                                        {canComplete && <SelectItem value="Hoàn thành">Hoàn thành</SelectItem>}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="linkFile" className="text-right">
                                Link hồ sơ {watchStatus === "Hoàn thành" && <span className="text-red-500">*</span>}
                            </Label>
                            <Input id="linkFile" {...register("linkFile")} className="col-span-3" placeholder="URL đính kèm tài liệu chứng minh..." />
                        </div>

                        {customError && (
                            <div className="text-red-500 text-sm font-medium mt-2 text-center col-span-4">
                                {customError}
                            </div>
                        )}
                        {Object.keys(errors).length > 0 && (
                            <div className="text-red-500 text-sm font-medium mt-2 text-center col-span-4">
                                Vui lòng điền đầy đủ các trường bắt buộc (*)
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Hủy
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Đang lưu..." : isEditing ? "Cập nhật" : "Lưu CAPA"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
