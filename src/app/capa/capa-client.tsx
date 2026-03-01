"use client";

import { useState } from "react";
import { CapaTable } from "@/components/capa/capa-table";
import { CapaForm } from "@/components/capa/capa-form";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { CAPA, Personnel } from "@/types";
import { AlertCircle, FileCheck, FileWarning, Clock } from "lucide-react";
import { useSession } from "next-auth/react";
import { hasAccess } from "@/lib/rbac";

export function CapaClient({ data, personnel }: { data: CAPA[], personnel: Personnel[] }) {
    const { data: session } = useSession();
    const [open, setOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<CAPA | null>(null);

    const canAdd = hasAccess(session?.user?.role, session?.user?.level, "create", "capa-87");
    const canEdit = hasAccess(session?.user?.role, session?.user?.level, "update", "capa-87");

    const handleEdit = (item: CAPA) => {
        setEditingItem(item);
        setOpen(true);
    };

    const handleOpenChange = (isOpen: boolean) => {
        setOpen(isOpen);
        if (!isOpen) {
            // Reset editing item when dialog closes after a short delay for animation
            setTimeout(() => setEditingItem(null), 300);
        }
    };

    // Calculate summary statistics
    const totalCapa = data.length;

    let inProgressCount = 0;
    let overdueCount = 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    data.forEach(item => {
        const baseStatusLower = (item.status || "").toLowerCase();

        if (baseStatusLower === "đang xử lý") {
            let isOverdue = false;
            if (item.deadline) {
                let deadlineDate: Date | null = null;
                const parts = item.deadline.split('/');
                if (parts.length === 3) {
                    deadlineDate = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
                } else if (item.deadline.includes('-')) {
                    deadlineDate = new Date(item.deadline);
                }

                if (deadlineDate && today > deadlineDate) {
                    isOverdue = true;
                }
            }

            if (isOverdue) {
                overdueCount++;
            } else {
                inProgressCount++;
            }
        } else if (baseStatusLower === "yêu cầu xử lý") {
            inProgressCount++; // counting open items as in progress for general view, or we can just count 'đang xử lý'
        }
    });

    // Let's strictly count 'Đang xử lý' and 'Yêu cầu xử lý' as actively working
    const activeCount = data.filter(i => {
        const s = (i.status || "").toLowerCase();
        return s === "đang xử lý" || s === "yêu cầu xử lý";
    }).length - overdueCount; // Subtract overdue from active if we consider overdue strictly its own bucket, but usually it's just a subset

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight text-slate-800 dark:text-slate-200">
                    CAPA (Mục 8.7)
                </h2>
                {canAdd && (
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm" onClick={() => {
                        setEditingItem(null);
                        setOpen(true);
                    }}>
                        <Plus className="mr-2 h-4 w-4" /> Thêm CAPA
                    </Button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-slate-500 mb-1">Tổng số CAPA</p>
                        <h3 className="text-3xl font-bold text-slate-800 dark:text-slate-100">{totalCapa}</h3>
                    </div>
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/40 rounded-full text-blue-600 dark:text-blue-400">
                        <FileCheck className="w-6 h-6" />
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-slate-500 mb-1">Đang xử lý</p>
                        <h3 className="text-3xl font-bold text-slate-800 dark:text-slate-100">{activeCount}</h3>
                    </div>
                    <div className="p-3 bg-cyan-100 dark:bg-cyan-900/40 rounded-full text-cyan-600 dark:text-cyan-400">
                        <Clock className="w-6 h-6" />
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-xl border border-red-200 dark:border-red-800/50 p-6 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-slate-500 mb-1">Đang quá hạn</p>
                        <h3 className="text-3xl font-bold text-red-600 dark:text-red-400">{overdueCount}</h3>
                    </div>
                    <div className="p-3 bg-red-100 dark:bg-red-900/40 rounded-full text-red-600 dark:text-red-400">
                        <AlertCircle className="w-6 h-6" />
                    </div>
                </div>
            </div>

            <CapaTable data={data} onEdit={canEdit ? handleEdit : undefined} />
            {(canAdd || canEdit) && <CapaForm open={open} onOpenChange={handleOpenChange} initialData={editingItem} personnel={personnel} />}
        </div>
    );
}
