"use client";

import { useState } from "react";
import { ConstructionMachineTable } from "@/components/construction-machines/construction-machine-table";
import { ConstructionMachineForm } from "@/components/construction-machines/construction-machine-form";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Settings2, FileWarning, Archive } from "lucide-react";
import { ConstructionMachine } from "@/types";
import { useSession } from "next-auth/react";
import { hasAccess } from "@/lib/rbac";

export function ConstructionMachineClient({ data }: { data: ConstructionMachine[] }) {
    const { data: session } = useSession();
    const [open, setOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<ConstructionMachine | null>(null);

    // Using the exact same RBAC property as Equipments (`may-moc-64`)
    const canAdd = hasAccess(session?.user?.role, session?.user?.level, "create", "may-moc-64");
    const canEdit = hasAccess(session?.user?.role, session?.user?.level, "update", "may-moc-64");
    const canDelete = hasAccess(session?.user?.role, session?.user?.level, "delete", "may-moc-64");

    const handleEdit = (item: ConstructionMachine) => {
        setEditingItem(item);
        setOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Bạn có chắc chắn muốn xóa máy thi công này không?")) return;
        try {
            const res = await fetch(`/api/construction-machines/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error("Lỗi khi xóa");
            window.location.reload();
        } catch (error) {
            console.error(error);
            alert("Không thể xóa thiết bị này. Vui lòng thử lại.");
        }
    };

    const handleOpenChange = (isOpen: boolean) => {
        setOpen(isOpen);
        if (!isOpen) {
            setTimeout(() => setEditingItem(null), 300);
        }
    };

    const totalMachines = data.length;
    let usingCount = 0;
    let brokenCount = 0;
    let liquidatedCount = 0;

    data.forEach(item => {
        const status = item.status.toLowerCase();
        if (status === "đang sử dụng") usingCount++;
        else if (status === "đang hư hỏng") brokenCount++;
        else if (status === "thanh lý") liquidatedCount++;
    });

    return (
        <>
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight text-slate-800 dark:text-slate-200">
                    Máy thi công
                </h2>
                {canAdd && (
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm" onClick={() => {
                        setEditingItem(null);
                        setOpen(true);
                    }}>
                        <Plus className="mr-2 h-4 w-4" /> Thêm máy thi công
                    </Button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-slate-500 mb-1">Tổng số máy thi công</p>
                        <h3 className="text-3xl font-bold text-slate-800 dark:text-slate-100">{totalMachines}</h3>
                    </div>
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/40 rounded-full text-blue-600 dark:text-blue-400">
                        <Settings2 className="w-6 h-6" />
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-xl border border-red-200 dark:border-red-800/50 p-6 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-slate-500 mb-1">Máy đang hư hỏng</p>
                        <h3 className="text-3xl font-bold text-red-600 dark:text-red-400">{brokenCount}</h3>
                    </div>
                    <div className="p-3 bg-red-100 dark:bg-red-900/40 rounded-full text-red-600 dark:text-red-400">
                        <FileWarning className="w-6 h-6" />
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-slate-500 mb-1">Máy đã thanh lý</p>
                        <h3 className="text-3xl font-bold text-slate-500 dark:text-slate-400">{liquidatedCount}</h3>
                    </div>
                    <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-600 dark:text-slate-400">
                        <Archive className="w-6 h-6" />
                    </div>
                </div>
            </div>

            <ConstructionMachineTable data={data} onEdit={canEdit ? handleEdit : undefined} onDelete={canDelete ? handleDelete : undefined} />
            {(canAdd || canEdit) && <ConstructionMachineForm open={open} onOpenChange={handleOpenChange} initialData={editingItem} />}
        </>
    );
}
