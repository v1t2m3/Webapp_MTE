"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { UploadCloud, AlertCircle, CheckCircle2, ShieldAlert } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ApkRelease } from "@/types";

interface ApkUploadDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: (releases: ApkRelease[]) => void;
}

export function ApkUploadDialog({ open, onOpenChange, onSuccess }: ApkUploadDialogProps) {
    const [file, setFile] = useState<File | null>(null);
    const [version, setVersion] = useState<string>("v1.1.0");
    const [releaseDate, setReleaseDate] = useState<string>(
        new Date().toISOString().split("T")[0]
    );
    const [description, setDescription] = useState<string>(
        "- Thêm công cụ tính toán mới\n- Tối ưu hiệu năng và vá lỗi giao diện"
    );
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            if (!selectedFile.name.endsWith(".apk")) {
                setError("Chỉ chấp nhận file có đuôi mở rộng .apk");
                setFile(null);
                return;
            }
            setError(null);
            setFile(selectedFile);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) {
            setError("Vui lòng chọn file APK để upload");
            return;
        }

        setLoading(true);
        setError(null);
        setSuccessMessage(null);

        try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("version", version);
            formData.append("releaseDate", releaseDate);
            formData.append("description", description);

            const res = await fetch("/api/apk-releases", {
                method: "POST",
                body: formData,
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Lỗi khi upload file APK");
            }

            setSuccessMessage("Đã đăng tải bản phát hành APK thành công!");
            onSuccess(data.allReleases || []);
            
            setTimeout(() => {
                onOpenChange(false);
                setFile(null);
                setSuccessMessage(null);
            }, 1200);
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Lỗi không xác định khi upload");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[550px] bg-white/95 backdrop-blur-md">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-blue-900 flex items-center gap-2 border-b pb-3">
                        <UploadCloud className="h-6 w-6 text-blue-600" />
                        Đăng Bản Phát Hành APK Mới (MTE Cal-Notes)
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-2">
                    {error && (
                        <Alert variant="destructive" className="py-2">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {successMessage && (
                        <Alert className="bg-emerald-50 border-emerald-200 text-emerald-800 py-2">
                            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                            <AlertDescription>{successMessage}</AlertDescription>
                        </Alert>
                    )}

                    <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg flex items-start gap-2 text-xs text-amber-800">
                        <ShieldAlert className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                            <strong>Quy tắc lưu trữ:</strong> Hệ thống sẽ lưu giữ tối đa <strong>3 bản mới nhất</strong>. Bản thứ 4 (cũ nhất) sẽ tự động bị xóa khỏi đĩa server.
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="version" className="text-sm font-medium">Mã phiên bản (Version) *</Label>
                            <Input
                                id="version"
                                placeholder="VD: v1.2.0"
                                value={version}
                                onChange={(e) => setVersion(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="releaseDate" className="text-sm font-medium">Ngày phát hành *</Label>
                            <Input
                                id="releaseDate"
                                type="date"
                                value={releaseDate}
                                onChange={(e) => setReleaseDate(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="apkFile" className="text-sm font-medium">File ứng dụng (.apk) *</Label>
                        <Input
                            id="apkFile"
                            type="file"
                            accept=".apk"
                            onChange={handleFileChange}
                            required
                        />
                        {file && (
                            <p className="text-xs text-blue-600 font-mono">
                                Đã chọn: {file.name} ({(file.size / (1024 * 1024)).toFixed(1)} MB)
                            </p>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="description" className="text-sm font-medium">Mô tả tính năng / Sửa lỗi (Release Notes) *</Label>
                        <Textarea
                            id="description"
                            rows={4}
                            placeholder="Nhập danh sách tính năng mới hoặc vá lỗi..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                        />
                    </div>

                    <DialogFooter className="pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={loading}
                        >
                            Hủy bỏ
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading || !file}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            {loading ? "Đang tải lên..." : "Đăng phát hành"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
