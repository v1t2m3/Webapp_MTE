"use client";

import { useState } from "react";
import { DocumentTable } from "@/components/documents/document-table";
import { DocumentForm } from "@/components/documents/document-form";
import { Button } from "@/components/ui/button";
import { Plus, FileText, FileCheck, AlertTriangle, Clock } from "lucide-react";
import { Document } from "@/types";
import { useSession } from "next-auth/react";
import { hasAccess } from "@/lib/rbac";

function getExpiryStats(data: Document[]) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let expiredCount = 0;
    let expiringCount = 0;

    data.forEach(doc => {
        if (!doc.expiryDate || doc.status === "Đã lỗi thời") return;

        const parts = doc.expiryDate.split('/');
        let expiry: Date | null = null;
        if (parts.length === 3) {
            expiry = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
        } else if (doc.expiryDate.includes('-')) {
            expiry = new Date(doc.expiryDate);
        }

        if (!expiry || isNaN(expiry.getTime())) return;

        const diffDays = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays < 0) expiredCount++;
        else if (diffDays <= 30) expiringCount++;
    });

    return { expiredCount, expiringCount };
}

export function DocumentClient({ data }: { data: Document[] }) {
    const { data: session } = useSession();
    const [open, setOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<Document | null>(null);

    const canAdd = hasAccess(session?.user?.role, session?.user?.level, "create", "tai-lieu-83");
    const canEdit = hasAccess(session?.user?.role, session?.user?.level, "update", "tai-lieu-83");
    const canDelete = hasAccess(session?.user?.role, session?.user?.level, "delete", "tai-lieu-83");

    const handleEdit = (item: Document) => {
        setEditingItem(item);
        setOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa tài liệu này? Hành động này không thể hoàn tác.")) return;

        try {
            const res = await fetch(`/api/documents/${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Thất bại");
            window.location.reload();
        } catch (error) {
            console.error("Xóa tài liệu lỗi:", error);
            alert("Không thể xóa tài liệu.");
        }
    };

    const handleOpenChange = (isOpen: boolean) => {
        setOpen(isOpen);
        if (!isOpen) {
            setTimeout(() => setEditingItem(null), 300);
        }
    };

    const activeCount = data.filter(d => d.status === "Đang hiệu lực").length;
    const draftCount = data.filter(d => d.status === "Đang dự thảo").length;
    const { expiredCount, expiringCount } = getExpiryStats(data);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight text-slate-800 dark:text-slate-200">
                    Tài liệu (Mục 8.3)
                </h2>
                {canAdd && (
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm" onClick={() => {
                        setEditingItem(null);
                        setOpen(true);
                    }}>
                        <Plus className="mr-2 h-4 w-4" /> Thêm tài liệu mới
                    </Button>
                )}
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-slate-500 mb-1">Đang hiệu lực</p>
                        <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{activeCount}</h3>
                    </div>
                    <div className="p-3 bg-emerald-100 dark:bg-emerald-900/40 rounded-full text-emerald-600 dark:text-emerald-400">
                        <FileCheck className="w-5 h-5" />
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-slate-500 mb-1">Đang dự thảo</p>
                        <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{draftCount}</h3>
                    </div>
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/40 rounded-full text-blue-600 dark:text-blue-400">
                        <FileText className="w-5 h-5" />
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-amber-200 dark:border-amber-800/50 p-5 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-slate-500 mb-1">Sắp hết hạn</p>
                        <h3 className="text-2xl font-bold text-amber-600 dark:text-amber-400">{expiringCount}</h3>
                    </div>
                    <div className="p-3 bg-amber-100 dark:bg-amber-900/40 rounded-full text-amber-600 dark:text-amber-400">
                        <Clock className="w-5 h-5" />
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-red-200 dark:border-red-800/50 p-5 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-slate-500 mb-1">Đã hết hạn</p>
                        <h3 className="text-2xl font-bold text-red-600 dark:text-red-400">{expiredCount}</h3>
                    </div>
                    <div className="p-3 bg-red-100 dark:bg-red-900/40 rounded-full text-red-600 dark:text-red-400">
                        <AlertTriangle className="w-5 h-5" />
                    </div>
                </div>
            </div>

            <DocumentTable
                data={data}
                onEdit={canEdit ? handleEdit : undefined}
                onDelete={canDelete ? handleDelete : undefined}
            />
            {(canAdd || canEdit) && (
                <DocumentForm open={open} onOpenChange={handleOpenChange} initialData={editingItem} />
            )}
        </div>
    );
}
