"use client";

import { useMemo } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { CAPA } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Edit2, ExternalLink, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

function parseDateStr(dateStr: string | undefined): Date | null {
    if (!dateStr) return null;
    const parts = dateStr.split('/');
    if (parts.length === 3) {
        return new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
    } else if (dateStr.includes('-')) {
        return new Date(dateStr);
    }
    return null;
}

export function CapaTable({ data, onEdit, onDelete }: { data: CAPA[], onEdit?: (item: CAPA) => void, onDelete?: (id: string) => void }) {
    const sortedData = useMemo(() => {
        return [...data].sort((a, b) => {
            const aStatus = (a.status || "").toLowerCase();
            const bStatus = (b.status || "").toLowerCase();
            const aIsFinished = aStatus === "hoàn thành";
            const bIsFinished = bStatus === "hoàn thành";

            // Push "Hoàn thành" to bottom
            if (aIsFinished && !bIsFinished) return 1;
            if (!aIsFinished && bIsFinished) return -1;

            // Prioritize by Level if neither or both are finished
            const getRank = (level: string) => {
                const l = (level || "").toLowerCase();
                if (l === "lỗi nặng") return 3;
                if (l === "lỗi nhẹ") return 2;
                if (l === "khuyến nghị") return 1;
                return 0;
            };

            const aRank = getRank(a.level || "");
            const bRank = getRank(b.level || "");

            if (aRank !== bRank) {
                return bRank - aRank; // Higher rank first
            }

            return 0; // maintain relative order
        });
    }, [data]);

    return (
        <div className="rounded-xl border border-slate-200 bg-white/70 backdrop-blur-md dark:bg-slate-900/50 dark:border-slate-800 shadow-sm overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow className="bg-slate-50/80 dark:bg-slate-800/60 hover:bg-slate-50/80 border-b-slate-200 dark:border-b-slate-800">
                        <TableHead className="text-slate-700 dark:text-slate-300 font-semibold whitespace-nowrap">Ngày phát sinh</TableHead>
                        <TableHead className="text-slate-700 dark:text-slate-300 font-semibold whitespace-nowrap min-w-[200px]">Mô tả lỗi</TableHead>
                        <TableHead className="text-slate-700 dark:text-slate-300 font-semibold whitespace-nowrap">Người phụ trách</TableHead>
                        <TableHead className="text-slate-700 dark:text-slate-300 font-semibold whitespace-nowrap">Hạn chót</TableHead>
                        <TableHead className="text-slate-700 dark:text-slate-300 font-semibold whitespace-nowrap">Đã đóng ngày</TableHead>
                        <TableHead className="text-slate-700 dark:text-slate-300 font-semibold whitespace-nowrap">Mức độ</TableHead>
                        <TableHead className="text-slate-700 dark:text-slate-300 font-semibold whitespace-nowrap">Hồ sơ đính kèm</TableHead>
                        <TableHead className="text-slate-700 dark:text-slate-300 font-semibold whitespace-nowrap">Trạng thái</TableHead>
                        <TableHead className="text-slate-700 dark:text-slate-300 w-[50px]"></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {sortedData.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={10} className="h-32 text-center text-slate-500">
                                Chưa có dữ liệu CAPA. Vui lòng thêm dữ liệu vào phần Equipments.
                            </TableCell>
                        </TableRow>
                    ) : (
                        sortedData.map((item) => {
                            let displayStatus = item.status || "Yêu cầu xử lý";
                            const baseStatusLower = displayStatus.toLowerCase();
                            const isFinished = baseStatusLower === "hoàn thành";

                            let rowClasses = "hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors";
                            const levelLower = (item.level || "").toLowerCase();

                            // Logic for dynamic 'Đang quá hạn'
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);

                            if (baseStatusLower === "đang xử lý") {
                                const deadlineDate = parseDateStr(item.deadline);
                                if (deadlineDate && today > deadlineDate) {
                                    displayStatus = "Đang quá hạn";
                                }
                            }

                            // Calculate Badge colors
                            let badgeClasses = "whitespace-nowrap px-3 py-1 font-medium bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700";

                            if (displayStatus === "Yêu cầu xử lý") {
                                badgeClasses = "whitespace-nowrap px-3 py-1 font-medium bg-cyan-100 text-cyan-800 border-cyan-200 dark:bg-cyan-900/30 dark:text-cyan-400 dark:border-cyan-800/50";
                            } else if (displayStatus === "Đang xử lý") {
                                badgeClasses = "whitespace-nowrap px-3 py-1 font-medium bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800/50";
                            } else if (displayStatus === "Đang quá hạn") {
                                badgeClasses = "whitespace-nowrap px-3 py-1 font-semibold bg-red-100 text-red-800 border-red-200 shadow-sm dark:bg-red-900/40 dark:text-red-400 dark:border-red-800/50";
                            } else if (displayStatus === "Hoàn thành") {
                                const deadlineDate = parseDateStr(item.deadline);
                                const closeDate = parseDateStr(item.closeDate);
                                if (closeDate && deadlineDate && closeDate > deadlineDate) {
                                    badgeClasses = "whitespace-nowrap px-3 py-1 font-medium bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800/50";
                                } else {
                                    badgeClasses = "whitespace-nowrap px-3 py-1 font-medium bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800/50";
                                }
                            }

                            // Calculate Row bg colors based on Level
                            let levelBadgeClasses = "whitespace-nowrap px-3 py-1 font-medium";
                            if (isFinished) {
                                rowClasses = "bg-slate-50/30 opacity-60 hover:bg-slate-50/50 dark:bg-slate-900/30 dark:hover:bg-slate-800/30 transition-all filter grayscale-[0.3]";
                                if (levelLower === "lỗi nặng") levelBadgeClasses += " bg-slate-100 text-slate-600 border-transparent dark:bg-slate-800 dark:text-slate-400";
                                else if (levelLower === "lỗi nhẹ") levelBadgeClasses += " bg-slate-100 text-slate-500 border-transparent dark:bg-slate-800 dark:text-slate-500";
                                else if (levelLower === "khuyến nghị") levelBadgeClasses += " bg-slate-100 text-slate-400 border-transparent dark:bg-slate-800 dark:text-slate-500";
                            } else {
                                if (levelLower === "lỗi nặng") {
                                    rowClasses = "bg-red-50/40 hover:bg-red-100/60 dark:bg-red-900/10 dark:hover:bg-red-900/20";
                                    levelBadgeClasses += " bg-red-200 text-red-900 border-red-300 dark:bg-red-900/50 dark:text-red-300 dark:border-red-800/50 font-bold";
                                } else if (levelLower === "lỗi nhẹ") {
                                    rowClasses = "bg-orange-50/40 hover:bg-orange-100/60 dark:bg-orange-900/10 dark:hover:bg-orange-900/20";
                                    levelBadgeClasses += " bg-orange-200 text-orange-900 border-orange-300 dark:bg-orange-900/50 dark:text-orange-300 dark:border-orange-800/50 font-semibold";
                                } else if (levelLower === "khuyến nghị") {
                                    rowClasses = "bg-yellow-50/40 hover:bg-yellow-100/60 dark:bg-yellow-900/10 dark:hover:bg-yellow-900/20";
                                    levelBadgeClasses += " bg-yellow-200 text-yellow-900 border-yellow-300 dark:bg-yellow-900/50 dark:text-yellow-300 dark:border-yellow-800/50";
                                }
                            }

                            return (
                                <TableRow key={item.id} className={rowClasses}>
                                    <TableCell className="text-slate-600 dark:text-slate-400 whitespace-nowrap">{item.issueDate}</TableCell>
                                    <TableCell className="text-slate-700 dark:text-slate-300 font-medium min-w-[250px]" title={item.description}>
                                        <div className="whitespace-pre-wrap">{item.description}</div>
                                        {item.source && <span className="block text-xs font-normal text-slate-500 mt-1">Từ: {item.source}</span>}
                                    </TableCell>
                                    <TableCell className="text-slate-700 dark:text-slate-300">{item.assignee}</TableCell>
                                    <TableCell className="text-slate-700 dark:text-slate-300 font-medium">
                                        {item.deadline}
                                    </TableCell>
                                    <TableCell className="text-slate-700 dark:text-slate-300">
                                        {item.closeDate || "-"}
                                    </TableCell>
                                    <TableCell>
                                        {item.level ? (
                                            <Badge variant="outline" className={levelBadgeClasses}>{item.level}</Badge>
                                        ) : "-"}
                                    </TableCell>
                                    <TableCell>
                                        {item.linkFile ? (
                                            <a 
                                                href={item.linkFile} 
                                                target="_blank" 
                                                rel="noopener noreferrer" 
                                                className="inline-flex items-center justify-center h-8 w-8 text-[#4cc9f0] bg-[#4cc9f0]/5 hover:bg-[#4cc9f0]/20 rounded-md border border-[#4cc9f0]/30 hover:border-[#4cc9f0]/80 shadow-[0_0_8px_rgba(76,201,240,0.15)] hover:shadow-[0_0_12px_rgba(76,201,240,0.4)] transition-all" 
                                                title="Xem hồ sơ"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-file-text"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/></svg>
                                            </a>
                                        ) : "-"}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={badgeClasses}>
                                            {displayStatus}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center justify-end gap-1">
                                            {onEdit && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-[#4cc9f0] border border-transparent hover:border-[#4cc9f0]/50 hover:bg-[#4cc9f0]/10 hover:shadow-[0_0_10px_rgba(76,201,240,0.3)] transition-all z-10 relative"
                                                    onClick={() => onEdit({ ...item, status: displayStatus })}
                                                    title="Chỉnh sửa"
                                                >
                                                    <Edit2 className="h-4 w-4" />
                                                </Button>
                                            )}
                                            {onDelete && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-[#f72585] border border-transparent hover:border-[#f72585]/50 hover:bg-[#f72585]/10 hover:shadow-[0_0_10px_rgba(247,37,133,0.3)] transition-all z-10 relative"
                                                    onClick={() => onDelete(item.id)}
                                                    title="Xóa CAPA"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            );
                        })
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
