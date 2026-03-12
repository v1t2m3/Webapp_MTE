"use client";

import { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Document } from "@/types";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

const CATEGORY_OPTIONS: Record<string, string[]> = {
    "Tài liệu hệ thống": [
        "Sổ tay chất lượng",
        "Quy trình chung (SOP)",
        "Hướng dẫn công việc",
    ],
    "Tài liệu kỹ thuật": [
        "TCVN/QCVN",
        "IEC/IEEE/ANSI",
        "Quy trình thử nghiệm MTE",
    ],
    "Tài liệu bên ngoài": [
        "Văn bản pháp quy",
        "BCT (NĐ/TT/QĐ)",
        "BKH&CN (NĐ/TT/QĐ)",
    ],
    "Tài liệu nội bộ": [
        "EVN (QĐ/QT)",
        "EVNCPC (QĐ/QT)",
        "CPSC (QĐ/QT)",
        "MTE (QĐ/QT)",
    ],
    "Biểu mẫu": [
        "Biên bản hiện trường",
        "Bảng ghi dữ liệu gốc",
    ],
};

const STATUS_OPTIONS = ["Đang hiệu lực", "Đang dự thảo", "Hết hiệu lực"];
const APPROVAL_LEVELS = ["Xí nghiệp", "Công ty", "Tổng công ty", "Tập đoàn", "Bộ ngành", "Quốc gia"];

export function DocumentForm({
    open,
    onOpenChange,
    initialData,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    initialData?: Document | null;
}) {
    const { register, handleSubmit, reset, setValue, watch } = useForm<Partial<Document>>();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();

    const selectedCategory = watch("category");

    const subCategoryOptions = useMemo(() => {
        if (!selectedCategory || !CATEGORY_OPTIONS[selectedCategory]) return [];
        return CATEGORY_OPTIONS[selectedCategory];
    }, [selectedCategory]);

    useEffect(() => {
        if (open) {
            if (initialData) {
                reset(initialData);
            } else {
                reset({
                    status: "Đang hiệu lực",
                    category: "",
                    subCategory: "",
                    approvalLevel: "",
                });
            }
        }
    }, [open, initialData, reset]);

    // Reset subCategory when category changes (only if not editing)
    useEffect(() => {
        if (!initialData && selectedCategory) {
            const options = CATEGORY_OPTIONS[selectedCategory] || [];
            const currentSub = watch("subCategory");
            if (currentSub && !options.includes(currentSub)) {
                setValue("subCategory", "");
            }
        }
    }, [selectedCategory, initialData, setValue, watch]);

    const onSubmit = async (data: Partial<Document>) => {
        setIsSubmitting(true);
        try {
            const isEditing = !!initialData;
            const url = isEditing ? `/api/documents/${initialData.id}` : '/api/documents';
            const method = isEditing ? 'PUT' : 'POST';

            const payload = {
                ...data,
                id: isEditing ? initialData.id : undefined,
            };

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!res.ok) throw new Error("Thất bại");

            toast({
                title: "Thành công",
                description: isEditing ? "Đã cập nhật tài liệu." : "Đã thêm tài liệu mới.",
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
            <DialogContent className="sm:max-w-[680px] max-h-[90vh] overflow-y-auto">
                <form onSubmit={handleSubmit(onSubmit)}>
                    <DialogHeader>
                        <DialogTitle>{initialData ? "Sửa thông tin tài liệu" : "Thêm tài liệu mới"}</DialogTitle>
                        <DialogDescription>
                            Nhập đầy đủ thông tin tài liệu theo yêu cầu ISO 17025 Mục 8.3.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        {/* Row 1: Mã hiệu + Tên tài liệu */}
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="docCode" className="text-right">Mã hiệu <span className="text-red-500">*</span></Label>
                            <Input id="docCode" {...register("docCode", { required: true })} className="col-span-3" placeholder="VD: QT-KT-01, BM-TN-05" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="docName" className="text-right">Tên tài liệu <span className="text-red-500">*</span></Label>
                            <Input id="docName" {...register("docName", { required: true })} className="col-span-3" placeholder="VD: Quy trình thử nghiệm MBA 110kV" />
                        </div>

                        {/* Row 2: Category + SubCategory (Dropdowns) */}
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Nhóm TL <span className="text-red-500">*</span></Label>
                            <div className="col-span-3">
                                <Select onValueChange={(val) => setValue("category", val)} value={selectedCategory || ""}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Chọn nhóm tài liệu" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.keys(CATEGORY_OPTIONS).map(cat => (
                                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Loại TL <span className="text-red-500">*</span></Label>
                            <div className="col-span-3">
                                <Select
                                    onValueChange={(val) => setValue("subCategory", val)}
                                    value={watch("subCategory") || ""}
                                    disabled={!selectedCategory}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder={selectedCategory ? "Chọn loại tài liệu" : "Chọn nhóm trước"} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {subCategoryOptions.map(sub => (
                                            <SelectItem key={sub} value={sub}>{sub}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Row 3: Phiên bản + Trạng thái */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="version" className="text-right col-span-2">Phiên bản</Label>
                                <Input id="version" {...register("version")} className="col-span-2" placeholder="VD: Lần 1, Rev.0" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right col-span-2">Trạng thái</Label>
                                <div className="col-span-2">
                                    <Select onValueChange={(val) => setValue("status", val)} value={watch("status") || "Đang hiệu lực"}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {STATUS_OPTIONS.map(s => (
                                                <SelectItem key={s} value={s}>{s}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        {/* Row 4: Ngày ban hành + Ngày hết hạn */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="issueDate" className="text-right col-span-2">Ngày ban hành</Label>
                                <Input id="issueDate" {...register("issueDate")} className="col-span-2" placeholder="dd/MM/yyyy" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="expiryDate" className="text-right col-span-2">Ngày hết hạn</Label>
                                <Input id="expiryDate" {...register("expiryDate")} className="col-span-2" placeholder="dd/MM/yyyy" />
                            </div>
                        </div>

                        {/* Row 5: Người soạn thảo + Người phê duyệt */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="author" className="text-right col-span-2">Người soạn</Label>
                                <Input id="author" {...register("author")} className="col-span-2" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="approver" className="text-right col-span-2">Người duyệt</Label>
                                <Input id="approver" {...register("approver")} className="col-span-2" />
                            </div>
                        </div>

                        {/* Row 6: Cấp phê duyệt */}
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Cấp phê duyệt</Label>
                            <div className="col-span-3">
                                <Select onValueChange={(val) => setValue("approvalLevel", val)} value={watch("approvalLevel") || ""}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Chọn cấp phê duyệt" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {APPROVAL_LEVELS.map(lvl => (
                                            <SelectItem key={lvl} value={lvl}>{lvl}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Row 7: Link tệp PDF */}
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="fileLink" className="text-right">Link tệp PDF</Label>
                            <Input id="fileLink" {...register("fileLink")} className="col-span-3" placeholder="https://drive.google.com/file/d/..." />
                        </div>

                        {/* Row 8: Lý do sửa đổi */}
                        <div className="grid grid-cols-4 items-start gap-4">
                            <Label htmlFor="changeReason" className="text-right pt-2">Lý do sửa đổi</Label>
                            <Textarea
                                id="changeReason"
                                {...register("changeReason")}
                                className="col-span-3"
                                rows={2}
                                placeholder="Ghi rõ lý do sửa đổi (theo yêu cầu 8.3.2.c)"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Hủy
                        </Button>
                        <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 text-white">
                            {isSubmitting ? "Đang lưu..." : initialData ? "Cập nhật" : "Thêm tài liệu"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
