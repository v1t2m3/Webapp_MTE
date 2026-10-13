"use client";

import { useState, useEffect, useRef } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
    FileText,
    UploadCloud,
    Trash2,
    ExternalLink,
    Search,
    Check,
    HardDrive,
    AlertTriangle,
    RefreshCw,
    Loader2
} from "lucide-react";
import { format } from "date-fns";

export interface PdfFileItem {
    fileName: string;
    fileUrl: string;
    fileSize: string;
    sizeBytes: number;
    updatedAt: string;
    usedCount: number;
    usedBy: string[];
}

interface PdfManagerDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSelectFile?: (fileUrl: string) => void;
    currentSelectedUrl?: string;
}

export function PdfManagerDialog({
    open,
    onOpenChange,
    onSelectFile,
    currentSelectedUrl
}: PdfManagerDialogProps) {
    const [files, setFiles] = useState<PdfFileItem[]>([]);
    const [totalSizeMb, setTotalSizeMb] = useState<string>("0.0 MB");
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isUploading, setIsUploading] = useState<boolean>(false);
    const [deletingFileName, setDeletingFileName] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState<string>("");

    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const { toast } = useToast();

    const fetchFiles = async () => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/equipments/pdf-list");
            if (!res.ok) throw new Error("Không thể tải danh sách tệp");
            const data = await res.json();
            setFiles(data.files || []);
            setTotalSizeMb(data.totalSizeMb || "0.0 MB");
        } catch (error) {
            console.error(error);
            toast({
                title: "Lỗi tải tệp",
                description: "Không thể lấy danh mục file PDF từ máy chủ.",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (open) {
            fetchFiles();
        }
    }, [open]);

    // Handle File Upload
    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.name.toLowerCase().endsWith(".pdf")) {
            toast({
                title: "Định dạng không hợp lệ",
                description: "Chỉ chấp nhận tệp có định dạng .pdf.",
                variant: "destructive"
            });
            return;
        }

        if (file.size > 50 * 1024 * 1024) {
            toast({
                title: "Dung lượng vượt quá giới hạn",
                description: "Kích thước tệp vượt quá 50 MB.",
                variant: "destructive"
            });
            return;
        }

        setIsUploading(true);
        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch("/api/equipments/upload-pdf", {
                method: "POST",
                body: formData
            });
            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Tải lên tệp thất bại");
            }

            toast({
                title: "Tải lên thành công",
                description: `Đã lưu tệp ${data.fileName} (${data.fileSize})`,
            });

            // Refresh list
            await fetchFiles();

            // Auto-select if requested
            if (onSelectFile && data.fileUrl) {
                onSelectFile(data.fileUrl);
            }
        } catch (error: any) {
            toast({
                title: "Lỗi tải lên",
                description: error.message || "Không thể tải tệp lên máy chủ.",
                variant: "destructive"
            });
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    // Handle File Delete
    const handleDeleteFile = async (item: PdfFileItem) => {
        let confirmMsg = `Bạn có chắc chắn muốn xóa vĩnh viễn tệp "${item.fileName}" khỏi máy chủ? Thao tác này sẽ giải phóng ${item.fileSize}.`;
        let isForce = false;

        if (item.usedCount > 0) {
            confirmMsg = `⚠️ CẢNH BÁO: Tệp tin này đang được liên kết với ${item.usedCount} thiết bị (${item.usedBy.slice(0, 3).join(", ")}${item.usedCount > 3 ? "..." : ""}).\n\nNếu xóa, các thiết bị này sẽ không thể mở xem biên bản kiểm định. Bạn có CHẮC CHẮN muốn tiếp tục xóa không?`;
            isForce = true;
        }

        if (!window.confirm(confirmMsg)) {
            return;
        }

        setDeletingFileName(item.fileName);
        try {
            const res = await fetch("/api/equipments/delete-pdf", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ fileName: item.fileName, force: isForce })
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || data.message || "Xóa tệp thất bại");
            }

            toast({
                title: "Đã xóa tệp",
                description: data.message || `Đã giải phóng tệp ${item.fileName}`,
            });

            await fetchFiles();
        } catch (error: any) {
            toast({
                title: "Lỗi xóa tệp",
                description: error.message || "Không thể xóa tệp khỏi máy chủ.",
                variant: "destructive"
            });
        } finally {
            setDeletingFileName(null);
        }
    };

    const filteredFiles = files.filter(f =>
        f.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.usedBy.some(u => u.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col bg-slate-900 border-slate-700/60 text-white shadow-2xl p-0 overflow-hidden">
                <DialogHeader className="p-5 pb-3 border-b border-slate-800 bg-slate-900/90">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <div className="p-2 bg-sky-500/10 rounded-lg border border-sky-500/20 text-sky-400">
                                <HardDrive className="h-5 w-5" />
                            </div>
                            <div>
                                <DialogTitle className="text-base sm:text-lg font-bold text-sky-300">
                                    Quản lý Thư viện File PDF (BBKĐ/HC)
                                </DialogTitle>
                                <DialogDescription className="text-xs text-slate-400">
                                    Tải lên, xem trước và xóa dọn dẹp các tệp PDF chứng nhận trên máy chủ
                                </DialogDescription>
                            </div>
                        </div>

                        {/* Storage Stats */}
                        <div className="hidden sm:flex items-center gap-2 text-xs">
                            <span className="text-slate-400">Tổng dung lượng:</span>
                            <Badge variant="outline" className="bg-sky-950/60 text-sky-300 border-sky-500/30 font-mono">
                                {totalSizeMb} ({files.length} tệp)
                            </Badge>
                        </div>
                    </div>
                </DialogHeader>

                {/* Toolbar */}
                <div className="p-4 border-b border-slate-800 bg-slate-950/40 flex flex-col sm:flex-row items-center justify-between gap-3">
                    {/* Search */}
                    <div className="relative w-full sm:w-72">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Tìm kiếm theo tên file, thiết bị..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 h-9 bg-slate-900 border-slate-700 text-xs text-slate-200 placeholder:text-slate-500"
                        />
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={fetchFiles}
                            disabled={isLoading}
                            className="h-9 border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs"
                            title="Tải lại danh sách"
                        >
                            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
                        </Button>

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".pdf"
                            onChange={handleFileUpload}
                            className="hidden"
                        />

                        <Button
                            type="button"
                            size="sm"
                            disabled={isUploading}
                            onClick={() => fileInputRef.current?.click()}
                            className="h-9 bg-sky-600 hover:bg-sky-500 text-white font-medium text-xs flex items-center gap-1.5 shadow-md shadow-sky-600/20"
                        >
                            {isUploading ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Đang tải lên...
                                </>
                            ) : (
                                <>
                                    <UploadCloud className="h-4 w-4" />
                                    Tải lên PDF mới (≤ 50MB)
                                </>
                            )}
                        </Button>
                    </div>
                </div>

                {/* File List Content */}
                <div className="flex-1 overflow-y-auto p-4 space-y-2.5 max-h-[50vh] scrollbar-thin">
                    {isLoading ? (
                        <div className="p-12 text-center text-slate-400 text-xs flex flex-col items-center gap-2">
                            <Loader2 className="h-6 w-6 animate-spin text-sky-400" />
                            Đang tải danh sách tệp từ máy chủ...
                        </div>
                    ) : filteredFiles.length === 0 ? (
                        <div className="p-10 text-center bg-slate-950/30 rounded-xl border border-dashed border-slate-800 space-y-2">
                            <FileText className="h-8 w-8 text-slate-500 mx-auto" />
                            <p className="text-xs text-slate-400">
                                {searchQuery ? "Không tìm thấy file phù hợp từ khóa tìm kiếm" : "Chưa có file PDF nào trong thư mục máy chủ"}
                            </p>
                        </div>
                    ) : (
                        filteredFiles.map((file) => {
                            const isSelected = currentSelectedUrl === file.fileUrl || currentSelectedUrl?.includes(file.fileName);
                            const isDeleting = deletingFileName === file.fileName;

                            return (
                                <div
                                    key={file.fileName}
                                    className={`p-3 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                                        isSelected
                                            ? "bg-sky-950/30 border-sky-500/50 shadow-sm shadow-sky-500/10"
                                            : "bg-slate-950/60 hover:bg-slate-800/50 border-slate-800"
                                    }`}
                                >
                                    <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                                        <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20 shrink-0 mt-0.5 sm:mt-0">
                                            <FileText className="h-4 w-4" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="font-medium text-xs text-slate-100 truncate max-w-sm sm:max-w-md" title={file.fileName}>
                                                    {file.fileName}
                                                </span>
                                                <Badge variant="outline" className="text-[10px] py-0 px-1.5 bg-slate-900 border-slate-700 text-slate-400 font-mono">
                                                    {file.fileSize}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-400 flex-wrap">
                                                <span>Ngày tải: {format(new Date(file.updatedAt), "dd/MM/yyyy HH:mm")}</span>
                                                <span>•</span>
                                                {file.usedCount > 0 ? (
                                                    <span className="text-sky-300 font-medium flex items-center gap-1" title={file.usedBy.join(", ")}>
                                                        Đang dùng cho {file.usedCount} thiết bị
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-500 italic">
                                                        Chưa gán cho thiết bị nào
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action buttons */}
                                    <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                                        {/* Preview button */}
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => window.open(file.fileUrl, "_blank")}
                                            className="h-8 px-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800"
                                            title="Mở xem tài liệu PDF"
                                        >
                                            <ExternalLink className="h-3.5 w-3.5 mr-1" />
                                            Xem
                                        </Button>

                                        {/* Select button for form */}
                                        {onSelectFile && (
                                            <Button
                                                type="button"
                                                size="sm"
                                                onClick={() => {
                                                    onSelectFile(file.fileUrl);
                                                    onOpenChange(false);
                                                }}
                                                className={`h-8 px-2.5 text-xs font-semibold ${
                                                    isSelected
                                                        ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                                                        : "bg-sky-600 hover:bg-sky-500 text-white"
                                                }`}
                                            >
                                                {isSelected ? (
                                                    <>
                                                        <Check className="h-3.5 w-3.5 mr-1" />
                                                        Đang chọn
                                                    </>
                                                ) : (
                                                    "Chọn file này"
                                                )}
                                            </Button>
                                        )}

                                        {/* Delete button */}
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            disabled={isDeleting}
                                            onClick={() => handleDeleteFile(file)}
                                            className="h-8 w-8 p-0 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 border border-transparent hover:border-rose-800/40"
                                            title="Xóa file vĩnh viễn để giải phóng bộ nhớ"
                                        >
                                            {isDeleting ? (
                                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                            ) : (
                                                <Trash2 className="h-3.5 w-3.5" />
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Footer notes */}
                <div className="p-3 border-t border-slate-800 bg-slate-950/70 text-[11px] text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2 px-5">
                    <span className="flex items-center gap-1.5 text-slate-400">
                        <AlertTriangle className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                        Xóa file sẽ giải phóng dung lượng ổ cứng trên máy chủ vĩnh viễn.
                    </span>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => onOpenChange(false)}
                        className="h-7 text-xs border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800"
                    >
                        Đóng
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
