"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Standard } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useSession } from "next-auth/react";
import {
    Dialog, DialogContent, DialogDescription, DialogFooter,
    DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
    Table, TableBody, TableCell, TableHead,
    TableHeader, TableRow,
} from "@/components/ui/table";
import {
    BookOpen, Plus, Edit, Trash2, Search, Copy, Check,
    Globe, FileText, ShieldCheck, ChevronDown, ChevronRight,
    RefreshCw,
    Star,
    PlugZap,
    ZapIcon,
} from "lucide-react";

// ──────────────────────────────────────────────
// Constants
// ──────────────────────────────────────────────
const CATEGORIES = ["TCVN", "IEC", "IEEE", "ANSI", "ISO", "QCVN"] as const;

const CATEGORY_STYLES: Record<string, string> = {
    TCVN: "bg-blue-500/10 text-blue-400 border-blue-500/50 shadow-[0_0_8px_rgba(59,130,246,0.25)]",
    IEC: "bg-cyan-500/10 text-cyan-400 border-cyan-500/50 shadow-[0_0_8px_rgba(6,182,212,0.25)]",
    IEEE: "bg-violet-500/10 text-violet-400 border-violet-500/50 shadow-[0_0_8px_rgba(139,92,246,0.25)]",
    ANSI: "bg-pink-500/10 text-pink-400 border-pink-500/50 shadow-[0_0_8px_rgba(236,72,153,0.25)]",
    ISO: "bg-amber-500/10 text-amber-400 border-amber-500/50 shadow-[0_0_8px_rgba(245,158,11,0.25)]",
    QCVN: "bg-emerald-500/10 text-emerald-400 border-emerald-500/50 shadow-[0_0_8px_rgba(16,185,129,0.25)]",
};

const CATEGORY_ICONS: Record<string, React.ElementType> = {
    TCVN: FileText,
    IEC: Globe,
    IEEE: PlugZap,
    ANSI: ZapIcon,
    ISO: ShieldCheck,
    QCVN: Star,
};

// ──────────────────────────────────────────────
// Form Modal
// ──────────────────────────────────────────────
function StandardForm({
    open,
    onOpenChange,
    initialData,
    onSaved,
}: {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    initialData: Standard | null;
    onSaved: () => void;
}) {
    const [form, setForm] = useState<Partial<Standard>>({});
    const [submitting, setSubmitting] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        if (open) setForm(initialData ?? {});
    }, [open, initialData]);

    const handleChange = (field: keyof Standard, val: string) =>
        setForm(f => ({ ...f, [field]: val }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.code || !form.name || !form.category || !form.equipment) {
            toast({ title: "Thiếu thông tin", description: "Vui lòng điền đầy đủ các trường bắt buộc.", variant: "destructive" });
            return;
        }
        setSubmitting(true);
        try {
            const isEditing = !!initialData;
            const url = isEditing ? `/api/standards/${initialData!.id}` : "/api/standards";
            const method = isEditing ? "PUT" : "POST";
            const res = await fetch(url, {
                method, headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            if (!res.ok) throw new Error();
            toast({ title: "Thành công", description: isEditing ? "Đã cập nhật tiêu chuẩn." : "Đã thêm tiêu chuẩn mới." });
            onOpenChange(false);
            onSaved();
        } catch {
            toast({ title: "Lỗi", description: "Không thể lưu tiêu chuẩn.", variant: "destructive" });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[580px] bg-[#0a0a1a] border border-white/10 text-white">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle className="text-[#4cc9f0]">
                            {initialData ? "Sửa Tiêu chuẩn" : "Thêm Tiêu chuẩn mới"}
                        </DialogTitle>
                        <DialogDescription className="text-white/50">
                            Điền đầy đủ thông tin tiêu chuẩn thử nghiệm điện.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right text-white/80">Mã tiêu chuẩn *</Label>
                            <Input
                                className="col-span-3 bg-white/5 border-white/20 text-white placeholder:text-white/30 focus:border-[#4cc9f0]/60"
                                placeholder="VD: TCVN 6306-1:2015"
                                value={form.code ?? ""}
                                onChange={e => handleChange("code", e.target.value)}
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right text-white/80">Tên tiêu chuẩn *</Label>
                            <Input
                                className="col-span-3 bg-white/5 border-white/20 text-white placeholder:text-white/30 focus:border-[#4cc9f0]/60"
                                placeholder="VD: Máy biến áp điện lực – Phần 1: Yêu cầu chung"
                                value={form.name ?? ""}
                                onChange={e => handleChange("name", e.target.value)}
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right text-white/80">Loại *</Label>
                            <div className="col-span-3">
                                <Select value={form.category ?? ""} onValueChange={v => handleChange("category", v)}>
                                    <SelectTrigger className="bg-white/5 border-white/20 text-white focus:border-[#4cc9f0]/60">
                                        <SelectValue placeholder="Chọn loại tiêu chuẩn" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-[#0a0a1a] border-white/10">
                                        {CATEGORIES.map(cat => (
                                            <SelectItem key={cat} value={cat} className="text-white focus:bg-white/10">
                                                {cat}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right text-white/80">Thiết bị *</Label>
                            <Input
                                className="col-span-3 bg-white/5 border-white/20 text-white placeholder:text-white/30 focus:border-[#4cc9f0]/60"
                                placeholder="VD: Máy biến áp, Máy cắt, Cáp điện..."
                                value={form.equipment ?? ""}
                                onChange={e => handleChange("equipment", e.target.value)}
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right text-white/80">Mô tả</Label>
                            <Input
                                className="col-span-3 bg-white/5 border-white/20 text-white placeholder:text-white/30 focus:border-[#4cc9f0]/60"
                                placeholder="Mô tả ngắn"
                                value={form.description ?? ""}
                                onChange={e => handleChange("description", e.target.value)}
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right text-white/80">Link file</Label>
                            <Input
                                className="col-span-3 bg-white/5 border-white/20 text-white placeholder:text-white/30 focus:border-[#4cc9f0]/60 font-mono text-sm"
                                placeholder="https://..."
                                value={form.fileLink ?? ""}
                                onChange={e => handleChange("fileLink", e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}
                            className="border-white/20 text-white/70 hover:bg-white/10">
                            Hủy
                        </Button>
                        <Button type="submit" disabled={submitting}
                            className="bg-[#4361ee] hover:bg-[#4361ee]/90 text-white">
                            {submitting ? "Đang lưu..." : "Lưu"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

// ──────────────────────────────────────────────
// Equipment Group Card (with Copy button)
// ──────────────────────────────────────────────
function EquipmentGroup({
    equipment,
    standards,
    onEdit,
    onDelete,
    canEdit,
    canDelete,
}: {
    equipment: string;
    standards: Standard[];
    onEdit: (s: Standard) => void;
    onDelete: (id: string) => void;
    canEdit: boolean;
    canDelete: boolean;
}) {
    const [open, setOpen] = useState(true);
    const [copied, setCopied] = useState(false);

    const copyText = standards.map(s => s.code).join("; ");

    const handleCopy = () => {
        navigator.clipboard.writeText(copyText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="mb-3 rounded-xl border border-white/10 bg-white/[0.02]">
            {/* Group header */}
            <div
                className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-white/5 transition-colors"
                onClick={() => setOpen(o => !o)}
            >
                <div className="flex items-center gap-3">
                    {open ? <ChevronDown className="h-4 w-4 text-white/50" /> : <ChevronRight className="h-4 w-4 text-white/50" />}
                    <span className="font-semibold text-white/90">{equipment}</span>
                    <Badge variant="outline" className="text-xs border-white/20 text-white/50">
                        {standards.length} tiêu chuẩn
                    </Badge>
                </div>
                <div onClick={e => e.stopPropagation()}>
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleCopy}
                        className="text-[#4cc9f0] border border-transparent hover:border-[#4cc9f0]/40 hover:bg-[#4cc9f0]/10 hover:text-pink-500 transition-all text-xs h-7 gap-1"
                        title="Copy danh sách mã tiêu chuẩn"
                    >
                        {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                        {copied ? "Đã copy!" : "Copy"}
                    </Button>
                </div>
            </div>

            {/* Rows */}
            {open && (
                <div className="border-t border-white/10">
                    <Table className="table-fixed">
                        <TableBody>
                            {standards.map(std => (
                                <TableRow key={std.id} className="hover:bg-white/5 border-white/5 transition-colors">

                                    {/* Cột 1: w-1/12, canh trái */}
                                    <TableCell className="py-2 w-2/12 text-left" style={{ width: "195px" }}>
                                        <Badge variant="outline" className={`text-xs font-mono ${CATEGORY_STYLES[std.category] ?? ""}`}>
                                            {std.code}
                                        </Badge>
                                    </TableCell>

                                    {/* Cột 2: w-3/12, canh trái, tự động xuống dòng */}
                                    <TableCell className="py-2 text-white/80 text-sm w-3/12 text-left" style={{ width: "280px" }}>
                                        <div className="line-clamp-2" title={std.name}>
                                            {std.name}
                                        </div>
                                    </TableCell>

                                    {/* Cột 3: w-5/12, canh trái, cắt chữ sau 2 dòng (...) */}
                                    <TableCell className="py-2 text-white/80 text-sm w-5/12 text-left" style={{ width: "560px" }}>
                                        <div className="line-clamp-2" title={std.description}>
                                            {std.description}
                                        </div>
                                    </TableCell>

                                    {/* Cột 4: w-1/12, canh phải */}
                                    <TableCell className="py-2 text-center w-1/12" style={{ width: "75px" }}>
                                        {std.fileLink ? (
                                            <a href={std.fileLink} target="_blank" rel="noopener noreferrer"
                                                className="text-[#4cc9f0]/70 hover:text-[#4cc9f0] text-xs underline-offset-2 hover:underline">
                                                Xem
                                            </a>
                                        ) : (
                                            <span className="text-white/20 text-xs">—</span>
                                        )}
                                    </TableCell>

                                    {/* Cột 5: w-2/12, canh phải */}
                                    <TableCell className="py-2 text-right w-1/12">
                                        <div className="flex justify-end gap-1">
                                            {canEdit && (
                                                <Button size="icon" variant="ghost"
                                                    className="h-7 w-7 text-[#4cc9f0] border border-transparent hover:border-[#4cc9f0]/50 hover:bg-[#4cc9f0]/10 hover:shadow-[0_0_8px_rgba(76,201,240,0.3)] transition-all"
                                                    onClick={() => onEdit(std)}>
                                                    <Edit className="h-3 w-3" />
                                                </Button>
                                            )}
                                            {canDelete && (
                                                <Button size="icon" variant="ghost"
                                                    className="h-7 w-7 text-[#f72585] border border-transparent hover:border-[#f72585]/50 hover:bg-[#f72585]/10 hover:shadow-[0_0_8px_rgba(247,37,133,0.3)] transition-all"
                                                    onClick={() => onDelete(std.id)}>
                                                    <Trash2 className="h-3 w-3" />
                                                </Button>
                                            )}
                                        </div>
                                    </TableCell>

                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}
        </div>
    );
}

// ──────────────────────────────────────────────
// Main Standards Page
// ──────────────────────────────────────────────
export default function StandardsPage() {
    const { data: session } = useSession();
    const { toast } = useToast();

    const [standards, setStandards] = useState<Standard[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [catFilter, setCatFilter] = useState("all");
    const [formOpen, setFormOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<Standard | null>(null);

    // RBAC: Admin or User can edit
    const isAdmin = session?.user?.role === "Admin";
    const userLevel = (session?.user as any)?.level;
    const canEdit = isAdmin || (session?.user?.role === "User" && (userLevel === 1 || userLevel === 2));
    const canDelete = isAdmin;

    const fetchStandards = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/standards");
            if (res.ok) setStandards(await res.json());
        } catch {
            toast({ title: "Lỗi tải dữ liệu", variant: "destructive" });
        } finally { setLoading(false); }
    }, [toast]);

    useEffect(() => { fetchStandards(); }, [fetchStandards]);

    const handleDelete = async (id: string) => {
        if (!confirm("Bạn có chắc chắn muốn xóa tiêu chuẩn này?")) return;
        try {
            const res = await fetch(`/api/standards/${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error();
            toast({ title: "Đã xóa tiêu chuẩn" });
            fetchStandards();
        } catch {
            toast({ title: "Lỗi xóa", variant: "destructive" });
        }
    };

    const handleEdit = (std: Standard) => {
        setEditingItem(std);
        setFormOpen(true);
    };

    const handleAdd = () => {
        setEditingItem(null);
        setFormOpen(true);
    };

    // ── Derived UI data ──
    const filtered = useMemo(() => {
        const q = search.toLowerCase();
        return standards.filter(s => {
            const matchSearch = !q || s.code.toLowerCase().includes(q) || s.name.toLowerCase().includes(q) || s.equipment.toLowerCase().includes(q);
            const matchCat = catFilter === "all" || s.category === catFilter;
            return matchSearch && matchCat;
        });
    }, [standards, search, catFilter]);

    // Stats per category
    const stats = useMemo(() => {
        const counts: Record<string, number> = {};
        standards.forEach(s => { counts[s.category] = (counts[s.category] ?? 0) + 1; });
        return counts;
    }, [standards]);

    // Group by equipment
    const grouped = useMemo(() => {
        const map: Record<string, Standard[]> = {};
        filtered.forEach(s => {
            const key = s.equipment || "Khác";
            if (!map[key]) map[key] = [];
            map[key].push(s);
        });
        return Object.entries(map).sort(([a], [b]) => a.localeCompare(b));
    }, [filtered]);

    return (
        <div className="flex flex-col space-y-6 p-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-white">
                        Tiêu chuẩn Thử nghiệm Điện
                    </h2>
                    <p className="mt-1 text-sm text-white/50">
                        Danh mục tiêu chuẩn Việt Nam (TCVN, QCVN) và quốc tế (IEC, IEEE, ISO) áp dụng tại MTE.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        size="icon" variant="ghost"
                        className="h-9 w-9 border border-white/20 text-white/60 hover:text-white hover:bg-white/10"
                        onClick={fetchStandards} title="Tải lại"
                    >
                        <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                    </Button>
                    {canEdit && (
                        <Button
                            className="bg-[#4361ee] hover:bg-[#4361ee]/90 text-white shadow-[0_0_15px_rgba(67,97,238,0.3)]"
                            onClick={handleAdd}
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Thêm tiêu chuẩn
                        </Button>
                    )}
                </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {CATEGORIES.map(cat => {
                    const Icon = CATEGORY_ICONS[cat] ?? BookOpen;
                    const count = stats[cat] ?? 0;
                    return (
                        <button
                            key={cat}
                            onClick={() => setCatFilter(prev => prev === cat ? "all" : cat)}
                            className={`group relative p-4 rounded-xl border transition-all text-left ${catFilter === cat
                                ? "border-[#4cc9f0]/60 bg-[#4cc9f0]/10 shadow-[0_0_20px_rgba(76,201,240,0.2)]"
                                : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]"
                                }`}
                        >
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-bold uppercase tracking-wider text-white/60">{cat}</span>
                                <Icon className="h-4 w-4 text-white/30 group-hover:text-white/60 transition-colors" />
                            </div>
                            <p className="text-2xl font-bold text-white">{count}</p>
                        </button>
                    );
                })}
            </div>

            {/* Search & Filter */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                    <Input
                        className="pl-10 bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:border-[#4cc9f0]/60 focus:bg-white/8"
                        placeholder="Tìm theo mã, tên tiêu chuẩn, thiết bị..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
                <Select value={catFilter} onValueChange={setCatFilter}>
                    <SelectTrigger className="w-44 bg-white/5 border-white/20 text-white focus:border-[#4cc9f0]/60">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0a0a1a] border-white/10">
                        <SelectItem value="all" className="text-white focus:bg-white/10">Tất cả ({standards.length})</SelectItem>
                        {CATEGORIES.map(cat => (
                            <SelectItem key={cat} value={cat} className="text-white focus:bg-white/10">
                                {cat} ({stats[cat] ?? 0})
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Results summary */}
            <div className="text-sm text-white/40">
                Hiển thị <span className="text-white/70 font-medium">{filtered.length}</span> / {standards.length} tiêu chuẩn
                {grouped.length > 0 && ` · ${grouped.length} thiết bị`}
            </div>

            {/* Equipment Groups */}
            {loading ? (
                <div className="flex items-center justify-center h-40 text-white/40">
                    <RefreshCw className="h-6 w-6 animate-spin mr-2" /> Đang tải...
                </div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-16 text-white/30">
                    <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-30" />
                    <p className="text-lg font-medium">Không tìm thấy tiêu chuẩn</p>
                    <p className="text-sm mt-1">Thử điều chỉnh bộ lọc hoặc thêm tiêu chuẩn mới.</p>
                </div>
            ) : (
                <div className="w-full overflow-auto">
                    {grouped.map(([equipment, stds]) => (
                        <EquipmentGroup
                            key={equipment}
                            equipment={equipment}
                            standards={stds}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            canEdit={canEdit}
                            canDelete={canDelete}
                        />
                    ))}
                </div>
            )}

            {/* Add/Edit Form */}
            <StandardForm
                open={formOpen}
                onOpenChange={open => { setFormOpen(open); if (!open) setTimeout(() => setEditingItem(null), 300); }}
                initialData={editingItem}
                onSaved={fetchStandards}
            />
        </div>
    );
}
