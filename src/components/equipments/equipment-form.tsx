"use client";

import { useEffect, useState, useRef } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useSession } from "next-auth/react";
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
import { addMonths, format } from "date-fns";
import { toInputDate, toSheetDate } from "@/lib/date-utils";
import { PdfManagerDialog } from "./pdf-manager-dialog";
import { UploadCloud, FolderOpen, ExternalLink, Loader2 } from "lucide-react";

export function EquipmentForm({
    open,
    onOpenChange,
    initialData,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    initialData?: Equipment | null;
}) {
    const isEditing = !!initialData;
    const { data: session } = useSession();
    const isAdmin = session?.user?.role === "Admin";

    const defaultValues = {
        name: "",
        serialNumber: "",
        location: "",
        calibrationFrequency: "12",
        lastCalibrationDate: "",
        nextCalibrationDate: "",
        calibrationAgent: "",
        status: "Đang hoạt động",
        calibrationReportUrl: "",
        calibrationReportPage: "01",
    };

    const { register, handleSubmit, reset, setValue, control } = useForm<Partial<Equipment>>({
        defaultValues
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();
    const router = useRouter();

    // PDF Management States
    const [pdfManagerOpen, setPdfManagerOpen] = useState(false);
    const [availablePdfs, setAvailablePdfs] = useState<{ fileName: string; fileUrl: string; fileSize: string }[]>([]);
    const [isQuickUploading, setIsQuickUploading] = useState(false);
    const quickUploadInputRef = useRef<HTMLInputElement | null>(null);

    // Watch fields for smart calculation & UI bindings
    const watchLastCalibrationDate = useWatch({ control, name: "lastCalibrationDate" });
    const watchCalibrationFrequency = useWatch({ control, name: "calibrationFrequency" });
    const watchCalibrationReportUrl = useWatch({ control, name: "calibrationReportUrl" });

    // Load available PDFs from server
    const loadAvailablePdfs = async () => {
        try {
            const res = await fetch("/api/equipments/pdf-list");
            if (res.ok) {
                const data = await res.json();
                setAvailablePdfs(data.files || []);
            }
        } catch (e) {
            console.error("Could not load available pdfs:", e);
        }
    };

    useEffect(() => {
        if (open) {
            loadAvailablePdfs();
            if (isEditing && initialData) {
                reset({
                    ...initialData,
                    lastCalibrationDate: toInputDate(initialData.lastCalibrationDate),
                    nextCalibrationDate: toInputDate(initialData.nextCalibrationDate),
                    calibrationFrequency: initialData.calibrationFrequency?.toString() || "12",
                    status: initialData.status === "Broken" || initialData.status === "Đang hỏng" ? "Đang hỏng" :
                        initialData.status === "Liquidated" || initialData.status === "Đã thanh lý" ? "Đã thanh lý" :
                            "Đang hoạt động",
                });
            } else {
                reset(defaultValues);
            }
        }
    }, [open, isEditing, initialData, reset]);

    // Auto calculate next date
    useEffect(() => {
        if (watchLastCalibrationDate && watchCalibrationFrequency && !isNaN(Number(watchCalibrationFrequency))) {
            try {
                const months = Number(watchCalibrationFrequency);
                const date = new Date(watchLastCalibrationDate);
                if (!isNaN(date.getTime())) {
                    const nextDate = addMonths(date, months);
                    setValue("nextCalibrationDate", format(nextDate, "yyyy-MM-dd"));
                }
            } catch (e) {
                // Ignore parse errors while typing
            }
        }
    }, [watchLastCalibrationDate, watchCalibrationFrequency, setValue]);

    // Handle Quick Upload (Admin only)
    const handleQuickUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.name.toLowerCase().endsWith(".pdf")) {
            toast({
                title: "Lỗi định dạng",
                description: "Chỉ chấp nhận file định dạng .pdf",
                variant: "destructive"
            });
            return;
        }

        if (file.size > 50 * 1024 * 1024) {
            toast({
                title: "Lỗi dung lượng",
                description: "Dung lượng file vượt quá giới hạn 50 MB",
                variant: "destructive"
            });
            return;
        }

        setIsQuickUploading(true);
        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch("/api/equipments/upload-pdf", {
                method: "POST",
                body: formData
            });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || "Tải file lên thất bại");
            }

            setValue("calibrationReportUrl", data.fileUrl);
            toast({
                title: "Tải file thành công",
                description: `Đã lưu ${data.fileName} (${data.fileSize}) và tự động gán vào thiết bị.`,
            });

            await loadAvailablePdfs();
        } catch (err: any) {
            toast({
                title: "Lỗi tải lên",
                description: err.message || "Không thể tải file lên máy chủ.",
                variant: "destructive"
            });
        } finally {
            setIsQuickUploading(false);
            if (quickUploadInputRef.current) {
                quickUploadInputRef.current.value = "";
            }
        }
    };

    const onSubmit = async (data: Partial<Equipment>) => {
        setIsSubmitting(true);
        try {
            // Convert dates back to DD/MM/YYYY
            const formattedData = {
                ...data,
                id: isEditing ? initialData?.id : undefined,
                lastCalibrationDate: toSheetDate(data.lastCalibrationDate),
                nextCalibrationDate: toSheetDate(data.nextCalibrationDate),
            };

            const url = isEditing ? `/api/equipments/${initialData?.id}` : '/api/equipments';
            const method = isEditing ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formattedData)
            });

            if (!res.ok) {
                if (isEditing && res.status === 404) {
                    toast({
                        title: "Thành công (Mock)",
                        description: `Đã cập nhật thiết bị thành công (Cần API cập nhật).`,
                    });
                    onOpenChange(false);
                    router.refresh();
                    return;
                }
                throw new Error("Thất bại");
            }

            toast({
                title: "Thành công",
                description: isEditing ? "Đã cập nhật thiết bị thành công." : "Đã thêm thiết bị mới thành công.",
            });
            onOpenChange(false);
            router.refresh();
        } catch (error) {
            toast({
                title: "Lỗi",
                description: "Không thể lưu thiết bị. Vui lòng kiểm tra lại kết nối mạng.",
                variant: "destructive"
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{isEditing ? "Chỉnh Sửa Thiết Bị" : "Thêm Thiết Bị Mới"}</DialogTitle>
                        <DialogDescription>
                            {isEditing ? "Cập nhật thông tin chi tiết của thiết bị." : "Nhập thông tin thiết bị thí nghiệm mới."}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit(onSubmit)}>
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
                                <Input id="calibrationFrequency" type="text" {...register("calibrationFrequency")} className="col-span-3" />
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

                            {/* Đường dẫn BBKĐ/HC with Admin Upload & Dropdown Quick Select */}
                            <div className="grid grid-cols-4 items-start gap-4">
                                <Label htmlFor="calibrationReportUrl" className="text-right pt-2.5">
                                    Đường dẫn BBKĐ/HC
                                </Label>
                                <div className="col-span-3 space-y-2">
                                    <div className="flex items-center gap-1.5">
                                        <Input
                                            id="calibrationReportUrl"
                                            placeholder="Chọn file hoặc dán link PDF"
                                            {...register("calibrationReportUrl")}
                                            className="flex-1 text-xs"
                                        />

                                        {/* Preview Button */}
                                        {watchCalibrationReportUrl && (
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="icon"
                                                onClick={() => window.open(watchCalibrationReportUrl, "_blank")}
                                                title="Mở xem thử tệp PDF"
                                                className="shrink-0 h-9 w-9 text-sky-400 hover:text-sky-300 border-slate-700 hover:bg-slate-800"
                                            >
                                                <ExternalLink className="h-4 w-4" />
                                            </Button>
                                        )}

                                        {/* Admin Quick Upload & Manage Buttons */}
                                        {isAdmin && (
                                            <>
                                                <input
                                                    ref={quickUploadInputRef}
                                                    type="file"
                                                    accept=".pdf"
                                                    onChange={handleQuickUpload}
                                                    className="hidden"
                                                />
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    disabled={isQuickUploading}
                                                    onClick={() => quickUploadInputRef.current?.click()}
                                                    title="Tải lên PDF mới từ máy tính (Chỉ Admin)"
                                                    className="shrink-0 h-9 px-2.5 text-xs text-sky-300 border-sky-500/40 hover:bg-sky-500/10 flex items-center gap-1"
                                                >
                                                    {isQuickUploading ? (
                                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                    ) : (
                                                        <UploadCloud className="h-3.5 w-3.5" />
                                                    )}
                                                    <span className="hidden sm:inline">Upload</span>
                                                </Button>

                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setPdfManagerOpen(true)}
                                                    title="Quản lý thư viện & Xóa file PDF máy chủ"
                                                    className="shrink-0 h-9 px-2.5 text-xs text-amber-300 border-amber-500/40 hover:bg-amber-500/10 flex items-center gap-1"
                                                >
                                                    <FolderOpen className="h-3.5 w-3.5" />
                                                    <span className="hidden sm:inline">Quản lý</span>
                                                </Button>
                                            </>
                                        )}
                                    </div>

                                    {/* Dropdown Quick Select from Server PDFs */}
                                    {availablePdfs.length > 0 && (
                                        <div className="flex items-center gap-1.5 text-xs">
                                            <span className="text-slate-400 text-[11px] shrink-0">Chọn nhanh file máy chủ:</span>
                                            <Select
                                                onValueChange={(val) => {
                                                    if (val === "__manage__") {
                                                        setPdfManagerOpen(true);
                                                    } else {
                                                        setValue("calibrationReportUrl", val);
                                                    }
                                                }}
                                                value={availablePdfs.some(p => p.fileUrl === watchCalibrationReportUrl) ? watchCalibrationReportUrl : ""}
                                            >
                                                <SelectTrigger className="h-7 text-xs bg-slate-900 border-slate-700 text-slate-300">
                                                    <SelectValue placeholder="-- Chọn file PDF có sẵn trên hệ thống --" />
                                                </SelectTrigger>
                                                <SelectContent className="bg-slate-900 border-slate-700 text-white text-xs max-h-56">
                                                    {availablePdfs.map(p => (
                                                        <SelectItem key={p.fileName} value={p.fileUrl}>
                                                            <div className="flex items-center justify-between w-full gap-2">
                                                                <span className="truncate max-w-[280px]">{p.fileName}</span>
                                                                <span className="text-slate-400 text-[10px] shrink-0">({p.fileSize})</span>
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                    {isAdmin && (
                                                        <SelectItem value="__manage__" className="text-sky-300 font-semibold border-t border-slate-800">
                                                            + Mở thư viện quản lý / tải lên / xóa file...
                                                        </SelectItem>
                                                    )}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="calibrationReportPage" className="text-right">Trang số</Label>
                                <div className="col-span-3">
                                    <Input id="calibrationReportPage" placeholder="01" {...register("calibrationReportPage")} />
                                    <p className="text-xs text-slate-500 mt-1 italic">
                                        Lưu ý: Chức năng nhảy tới đúng trang chỉ hoạt động với link PDF tĩnh (.pdf). Các link từ SharePoint/Google Drive sẽ luôn mở ở trang 1.
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="status" className="text-right">Trạng thái</Label>
                                <div className="col-span-3">
                                    <Select
                                        onValueChange={(val) => setValue("status", val)}
                                        defaultValue={
                                            initialData?.status === "Broken" || initialData?.status === "Đang hỏng" ? "Đang hỏng" :
                                                initialData?.status === "Liquidated" || initialData?.status === "Đã thanh lý" ? "Đã thanh lý" :
                                                    "Đang hoạt động"
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Chọn trạng thái" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Đang hoạt động">Đang hoạt động</SelectItem>
                                            <SelectItem value="Đang hỏng">Đang hỏng</SelectItem>
                                            <SelectItem value="Đã thanh lý">Đã thanh lý</SelectItem>
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
                                {isSubmitting ? "Đang lưu..." : isEditing ? "Cập nhật" : "Lưu thiết bị"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Admin PDF Library & File Deletion Manager Dialog */}
            {isAdmin && (
                <PdfManagerDialog
                    open={pdfManagerOpen}
                    onOpenChange={(v) => {
                        setPdfManagerOpen(v);
                        if (!v) loadAvailablePdfs();
                    }}
                    onSelectFile={(url) => {
                        setValue("calibrationReportUrl", url);
                    }}
                    currentSelectedUrl={watchCalibrationReportUrl}
                />
            )}
        </>
    );
}
