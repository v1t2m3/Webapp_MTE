"use client";

import { useState } from "react";
import { EquipmentTable } from "@/components/equipments/equipment-table";
import { EquipmentForm } from "@/components/equipments/equipment-form";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Equipment } from "@/types";
import { useSession } from "next-auth/react";
import { hasAccess } from "@/lib/rbac";

export function EquipmentClient({ data }: { data: Equipment[] }) {
    const { data: session } = useSession();
    const [open, setOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<Equipment | null>(null);

    const canAdd = hasAccess(session?.user?.role, session?.user?.level, "create", "may-moc-64");
    const canEdit = hasAccess(session?.user?.role, session?.user?.level, "update", "may-moc-64");

    const handleEdit = (item: Equipment) => {
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

    return (
        <>
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight text-slate-800 dark:text-slate-200">
                    Máy móc, Thiết bị (Mục 6.4)
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

            <EquipmentTable data={data} onEdit={canEdit ? handleEdit : undefined} />
            {(canAdd || canEdit) && <EquipmentForm open={open} onOpenChange={handleOpenChange} initialData={editingItem} />}
        </>
    );
}
