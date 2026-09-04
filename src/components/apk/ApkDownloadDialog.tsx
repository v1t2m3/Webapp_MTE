"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Sparkles, History, Calendar, HardDrive, CheckCircle2 } from "lucide-react";
import { ApkRelease } from "@/types";
import { toDisplayDate } from "@/lib/date-utils";
import Link from "next/link";

interface ApkDownloadDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    releases: ApkRelease[];
}

export function ApkDownloadDialog({ open, onOpenChange, releases }: ApkDownloadDialogProps) {
    const sortedReleases = [...releases].sort(
        (a, b) => new Date(b.createdAt || b.releaseDate).getTime() - new Date(a.createdAt || a.releaseDate).getTime()
    );

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-md">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-extrabold text-blue-900 flex items-center gap-2 border-b pb-3">
                        <Download className="h-6 w-6 text-green-600" />
                        Tải Ứng Dụng MTE-LAB Cal-Notes (APK)
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    <p className="text-sm text-muted-foreground">
                        Hệ thống duy trì tối đa <strong>3 phiên bản APK mới nhất</strong>. Chúng tôi khuyến nghị bạn nên cài đặt bản mới nhất để có đầy đủ tính năng và bản sửa lỗi.
                    </p>

                    {sortedReleases.length === 0 ? (
                        <div className="p-6 text-center text-sm text-gray-500 bg-gray-50 rounded-xl">
                            Đang cập nhật phiên bản APK...
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {sortedReleases.map((rel, idx) => {
                                const isLatest = idx === 0;
                                return (
                                    <div
                                        key={rel.id || rel.version}
                                        className={
                                            isLatest
                                                ? "relative p-4 rounded-2xl border-2 border-green-500 bg-green-50/40 shadow-sm transition-all hover:shadow-md"
                                                : "p-4 rounded-2xl border border-gray-200 bg-slate-50/60 transition-all hover:bg-slate-50"
                                        }
                                    >
                                        <div className="flex items-start justify-between gap-2 mb-2">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <Badge
                                                    className={
                                                        isLatest
                                                            ? "bg-green-600 hover:bg-green-700 text-white font-bold text-sm px-2.5 py-0.5"
                                                            : "bg-slate-600 text-white text-sm"
                                                    }
                                                >
                                                    {rel.version}
                                                </Badge>
                                                {isLatest ? (
                                                    <Badge className="bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs flex items-center gap-1">
                                                        <Sparkles className="w-3 h-3" />
                                                        Khuyến nghị (Mới nhất)
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="outline" className="text-gray-500 border-gray-300 text-xs">
                                                        Bản lịch sử
                                                    </Badge>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-3 text-xs text-gray-500 font-mono">
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="w-3.5 h-3.5" />
                                                    {toDisplayDate(rel.releaseDate)}
                                                </span>
                                                {rel.fileSize && (
                                                    <span className="flex items-center gap-1">
                                                        <HardDrive className="w-3.5 h-3.5" />
                                                        {rel.fileSize}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Description / Release Notes */}
                                        {rel.description && (
                                            <div className="my-3 text-xs text-gray-700 bg-white/80 p-3 rounded-xl border border-gray-100/80 whitespace-pre-line leading-relaxed">
                                                <p className="font-semibold text-gray-900 mb-1 flex items-center gap-1">
                                                    <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                                                    Nội dung cập nhật:
                                                </p>
                                                {rel.description}
                                            </div>
                                        )}

                                        {/* Download Button */}
                                        <div className="mt-3">
                                            <Button
                                                asChild
                                                size="default"
                                                className={
                                                    isLatest
                                                        ? "w-full h-11 text-base bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-sm"
                                                        : "w-full h-10 text-sm bg-slate-800 hover:bg-slate-900 text-white"
                                                }
                                            >
                                                <Link href={rel.fileUrl} download target="_blank">
                                                    <Download className="mr-2 h-4 w-4" />
                                                    {isLatest
                                                        ? `Tải bản mới nhất (${rel.version})`
                                                        : `Tải bản ${rel.version}`}
                                                </Link>
                                            </Button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
