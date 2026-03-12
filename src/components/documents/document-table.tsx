"use client";

import { Document } from "@/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2, FileText, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useMemo } from "react";

const CATEGORIES = [
    "Tài liệu hệ thống",
    "Tài liệu kỹ thuật",
    "Tài liệu bên ngoài",
    "Tài liệu nội bộ",
    "Biểu mẫu",
];

const APPROVAL_LEVELS = ["Xí nghiệp", "Công ty", "Tổng công ty", "Tập đoàn", "Bộ ngành", "Quốc gia"];

function getExpiryInfo(expiryDate: string) {
    if (!expiryDate) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let expiry: Date | null = null;
    const parts = expiryDate.split('/');
    if (parts.length === 3) {
        expiry = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
    } else if (expiryDate.includes('-')) {
        expiry = new Date(expiryDate);
    }

    if (!expiry || isNaN(expiry.getTime())) return null;

    const diffDays = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { label: `Hết hạn ${Math.abs(diffDays)} ngày`, type: "expired" as const };
    if (diffDays <= 30) return { label: `Còn ${diffDays} ngày`, type: "warning" as const };
    return null;
}

function getStatusBadgeClasses(status: string) {
    switch (status) {
        case "Đang hiệu lực":
            return "bg-emerald-500/10 text-emerald-400 border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.2)]";
        case "Đang dự thảo":
            return "bg-blue-500/10 text-blue-400 border-blue-500/50 shadow-[0_0_10px_rgba(59,130,246,0.2)]";
        case "Hết hiệu lực":
            return "bg-slate-500/10 text-slate-400 border-slate-500/50 shadow-[0_0_10px_rgba(100,116,139,0.2)]";
        default:
            return "bg-slate-500/10 text-slate-400 border-slate-500/50";
    }
}

export function DocumentTable({
    data,
    onEdit,
    onDelete
}: {
    data: Document[];
    onEdit?: (item: Document) => void;
    onDelete?: (id: string) => void;
}) {
    const [searchTerm, setSearchTerm] = useState("");
    const [filterCategory, setFilterCategory] = useState<string>("all");
    const [filterStatus, setFilterStatus] = useState<string>("all");
    const [filterApproval, setFilterApproval] = useState<string>("all");

    const filteredData = useMemo(() => {
        return data.filter(doc => {
            const matchesSearch = !searchTerm ||
                doc.docCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                doc.docName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                doc.author.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesCategory = filterCategory === "all" || doc.category === filterCategory;
            const matchesStatus = filterStatus === "all" || doc.status === filterStatus;
            const matchesApproval = filterApproval === "all" || doc.approvalLevel === filterApproval;

            return matchesSearch && matchesCategory && matchesStatus && matchesApproval;
        });
    }, [data, searchTerm, filterCategory, filterStatus, filterApproval]);

    return (
        <div className="space-y-4">
            {/* Search & Filters — High contrast for dark mode */}
            <div className="flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
                    <Input
                        placeholder="Tìm theo mã hiệu, tên tài liệu, người soạn thảo..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                    />
                </div>
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger className="w-full md:w-[220px] bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100">
                        <SelectValue placeholder="Nhóm tài liệu" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                        <SelectItem value="all">Tất cả nhóm</SelectItem>
                        {CATEGORIES.map(cat => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Select value={filterApproval} onValueChange={setFilterApproval}>
                    <SelectTrigger className="w-full md:w-[200px] bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100">
                        <SelectValue placeholder="Cấp phê duyệt" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                        <SelectItem value="all">Tất cả cấp</SelectItem>
                        {APPROVAL_LEVELS.map(lvl => (
                            <SelectItem key={lvl} value={lvl}>{lvl}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-full md:w-[180px] bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100">
                        <SelectValue placeholder="Trạng thái" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                        <SelectItem value="all">Tất cả</SelectItem>
                        <SelectItem value="Đang hiệu lực">Đang hiệu lực</SelectItem>
                        <SelectItem value="Đang dự thảo">Đang dự thảo</SelectItem>
                        <SelectItem value="Hết hiệu lực">Hết hiệu lực</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Table — matching equipment-table style */}
            <div className="rounded-xl border border-slate-200 bg-white/70 backdrop-blur-md dark:bg-slate-900/50 dark:border-slate-800 shadow-sm overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-slate-50/80 dark:bg-slate-800/60 hover:bg-slate-50/80 border-b-slate-200 dark:border-b-slate-800">
                            <TableHead className="text-slate-700 dark:text-slate-300 font-semibold whitespace-nowrap">Mã hiệu</TableHead>
                            <TableHead className="text-slate-700 dark:text-slate-300 font-semibold whitespace-nowrap min-w-[250px]">Tên tài liệu</TableHead>
                            <TableHead className="text-slate-700 dark:text-slate-300 font-semibold whitespace-nowrap">Nhóm</TableHead>
                            <TableHead className="text-slate-700 dark:text-slate-300 font-semibold whitespace-nowrap">Loại</TableHead>
                            <TableHead className="text-slate-700 dark:text-slate-300 font-semibold whitespace-nowrap">Cấp phê duyệt</TableHead>
                            <TableHead className="text-slate-700 dark:text-slate-300 font-semibold whitespace-nowrap">Ngày ban hành</TableHead>
                            <TableHead className="text-slate-700 dark:text-slate-300 font-semibold whitespace-nowrap">Xem</TableHead>
                            <TableHead className="text-slate-700 dark:text-slate-300 font-semibold whitespace-nowrap">Trạng thái</TableHead>
                            <TableHead className="text-slate-700 dark:text-slate-300 w-[120px] text-right">Thao tác</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredData.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={9} className="h-32 text-center text-slate-500">
                                    {data.length === 0 ? "Chưa có tài liệu nào trong hệ thống." : "Không tìm thấy tài liệu phù hợp."}
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredData.map((doc) => {
                                const isObsolete = doc.status === "Đã lỗi thời";
                                const expiryInfo = getExpiryInfo(doc.expiryDate);

                                const rowClasses = `transition-all duration-200 ${isObsolete
                                    ? "opacity-60 grayscale hover:opacity-80 bg-slate-50/50 dark:bg-slate-900/20"
                                    : "hover:bg-slate-50/80 dark:hover:bg-slate-800/40"
                                    }`;

                                return (
                                    <TableRow key={doc.id} className={rowClasses}>
                                        <TableCell className="text-slate-600 dark:text-slate-400 font-mono text-sm">{doc.docCode}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-col gap-1">
                                                <span className="font-medium text-slate-900 dark:text-slate-100">{doc.docName}</span>
                                                {expiryInfo && (
                                                    <Badge variant="outline" className={`text-xs w-fit font-medium whitespace-nowrap ${expiryInfo.type === "expired"
                                                        ? "bg-red-500/10 text-red-500 border-red-500/50 shadow-[0_0_8px_rgba(239,68,68,0.2)]"
                                                        : "bg-amber-500/10 text-amber-500 border-amber-500/50 shadow-[0_0_8px_rgba(245,158,11,0.2)]"
                                                        }`}>
                                                        {expiryInfo.label}
                                                    </Badge>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-slate-600 dark:text-slate-400 text-sm">{doc.category}</TableCell>
                                        <TableCell className="text-slate-600 dark:text-slate-400 text-sm">{doc.subCategory}</TableCell>
                                        <TableCell className="text-slate-600 dark:text-slate-400">{doc.approvalLevel}</TableCell>
                                        <TableCell className="text-slate-600 dark:text-slate-400">{doc.issueDate}</TableCell>
                                        <TableCell>
                                            {doc.fileLink ? (
                                                <a
                                                    href={doc.fileLink}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center justify-center h-8 w-8 text-[#4cc9f0] bg-[#4cc9f0]/5 hover:bg-[#4cc9f0]/20 rounded-md border border-[#4cc9f0]/30 hover:border-[#4cc9f0]/80 shadow-[0_0_8px_rgba(76,201,240,0.15)] hover:shadow-[0_0_12px_rgba(76,201,240,0.4)] transition-all"
                                                    title="Xem tệp PDF"
                                                >
                                                    <FileText className="h-4 w-4" />
                                                </a>
                                            ) : (
                                                <span className="text-slate-400 italic text-sm">-</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={`font-medium whitespace-nowrap ${getStatusBadgeClasses(doc.status)}`}>
                                                {doc.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                {onEdit && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-[#4cc9f0] border border-transparent hover:border-[#4cc9f0]/50 hover:bg-[#4cc9f0]/10 hover:shadow-[0_0_10px_rgba(76,201,240,0.3)] transition-all"
                                                        onClick={() => onEdit(doc)}
                                                        title="Chỉnh sửa"
                                                    >
                                                        <Edit2 className="h-4 w-4" />
                                                    </Button>
                                                )}
                                                {onDelete && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-[#f72585] border border-transparent hover:border-[#f72585]/50 hover:bg-[#f72585]/10 hover:shadow-[0_0_10px_rgba(247,37,133,0.3)] transition-all"
                                                        onClick={() => onDelete(doc.id)}
                                                        title="Xóa tài liệu"
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

            <div className="text-sm text-slate-500 dark:text-slate-400">
                Hiển thị {filteredData.length} / {data.length} tài liệu
            </div>
        </div>
    );
}
