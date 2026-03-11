"use client";

import { useState } from "react";
import { EquipmentTable } from "@/components/equipments/equipment-table";
import { EquipmentForm } from "@/components/equipments/equipment-form";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { AlertCircle, FileWarning, Settings2, ShieldAlert } from "lucide-react";
import { Equipment } from "@/types";
import { useSession } from "next-auth/react";
import { hasAccess } from "@/lib/rbac";

export function EquipmentClient({ data }: { data: Equipment[] }) {
    const { data: session } = useSession();
    const [open, setOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<Equipment | null>(null);

    const canAdd = hasAccess(session?.user?.role, session?.user?.level, "create", "may-moc-64");
    const canEdit = hasAccess(session?.user?.role, session?.user?.level, "update", "may-moc-64");
    const canDelete = hasAccess(session?.user?.role, session?.user?.level, "delete", "may-moc-64");

    const handleEdit = (item: Equipment) => {
        setEditingItem(item);
        setOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Bạn có chắc chắn muốn xóa thiết bị này không?")) return;
        try {
            const res = await fetch(`/api/equipments/${id}`, { method: 'DELETE' });
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
            // Reset editing item when dialog closes after a short delay for animation
            setTimeout(() => setEditingItem(null), 300);
        }
    };

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const totalEquipments = data.length;
    let brokenCount = 0;
    let warningCount = 0;

    data.forEach(item => {
        const baseStatusLower = (item.status || "").toLowerCase();
        const isBroken = baseStatusLower.includes("broken") || baseStatusLower.includes("hư hỏng") || baseStatusLower.includes("đang hỏng") || baseStatusLower.includes("bị hỏng");
        if (isBroken) brokenCount++;

        const isLiquidatedRow = baseStatusLower.includes("thanh lý") || baseStatusLower === "disposed" || baseStatusLower === "đã thanh lý";
        
        if (!isBroken && !isLiquidatedRow) {
            if (item.nextCalibrationDate) {
                let nextDate: Date | null = null;
                const parts = item.nextCalibrationDate.split('/');
                if (parts.length === 3) {
                    nextDate = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
                } else if (item.nextCalibrationDate.includes('-')) {
                    nextDate = new Date(item.nextCalibrationDate);
                }

                if (nextDate) {
                    const diffTime = nextDate.getTime() - today.getTime();
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    if (diffDays <= 90) {
                        warningCount++;
                    }
                }
            }
        }
    });

    return (
        <>
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight text-slate-800 dark:text-slate-200">
                    Thiết bị thí nghiệm và phương tiện đo
                </h2>
                {canAdd && (
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm" onClick={() => {
                        setEditingItem(null);
                        setOpen(true);
                    }}>
                        <Plus className="mr-2 h-4 w-4" /> Thêm thiết bị
                    </Button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-slate-500 mb-1">Tổng số TB thí nghiệm</p>
                        <h3 className="text-3xl font-bold text-slate-800 dark:text-slate-100">{totalEquipments}</h3>
                    </div>
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/40 rounded-full text-blue-600 dark:text-blue-400">
                        <Settings2 className="w-6 h-6" />
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-xl border border-red-200 dark:border-red-800/50 p-6 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-slate-500 mb-1">Thiết bị đang hư hỏng</p>
                        <h3 className="text-3xl font-bold text-red-600 dark:text-red-400">{brokenCount}</h3>
                    </div>
                    <div className="p-3 bg-red-100 dark:bg-red-900/40 rounded-full text-red-600 dark:text-red-400">
                        <FileWarning className="w-6 h-6" />
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-xl border border-orange-200 dark:border-orange-800/50 p-6 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-slate-500 mb-1">Cảnh báo hiệu chuẩn (≤3 tháng)</p>
                        <h3 className="text-3xl font-bold text-orange-600 dark:text-orange-400">{warningCount}</h3>
                    </div>
                    <div className="p-3 bg-orange-100 dark:bg-orange-900/40 rounded-full text-orange-600 dark:text-orange-400">
                        <ShieldAlert className="w-6 h-6" />
                    </div>
                </div>
            </div>

            <EquipmentTable data={data} onEdit={canEdit ? handleEdit : undefined} onDelete={canDelete ? handleDelete : undefined} />
            {(canAdd || canEdit) && <EquipmentForm open={open} onOpenChange={handleOpenChange} initialData={editingItem} />}
        </>
    );
}
