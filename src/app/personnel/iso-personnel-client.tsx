"use client";

import { useState } from "react";
import { IsoPersonnelTable } from "@/components/personnel/iso-personnel-table";
import { IsoPersonnelForm } from "@/components/personnel/iso-personnel-form";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Personnel, Equipment } from "@/types";
import { useSession } from "next-auth/react";
import { hasAccess } from "@/lib/rbac";

export function IsoPersonnelClient({
    personnel,
    equipments,
    allPersonnel
}: {
    personnel: Personnel[];
    equipments: Equipment[];
    allPersonnel?: Personnel[];
}) {
    const { data: session } = useSession();
    const [open, setOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<Personnel | null>(null);

    const canAdd = hasAccess(session?.user?.role, session?.user?.level, "create", "nhan-su-62");
    const canEdit = hasAccess(session?.user?.role, session?.user?.level, "update", "nhan-su-62");
    const canDelete = hasAccess(session?.user?.role, session?.user?.level, "delete", "nhan-su-62");

    const handleEdit = (item: Personnel) => {
        setEditingItem(item);
        setOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Bạn có chắc chắn muốn xoá nhân sự này?")) return;
        try {
            const res = await fetch(`/api/iso-personnel/${id}`, { method: 'DELETE' });
            if (res.ok) {
                window.location.reload();
            } else {
                alert("Xoá thất bại");
            }
        } catch (error) {
            console.error(error);
            alert("Đã xảy ra lỗi khi xoá");
        }
    };

    return (
        <div className="flex flex-col space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight text-[#3a0ca3] dark:text-slate-200">
                    Quản lý Nhân sự (ISO 17025)
                </h2>
                {canAdd && (
                    <Button className="bg-[#4361ee] hover:bg-[#4361ee]/90 text-white" onClick={() => {
                        setEditingItem(null);
                        setOpen(true);
                    }}>
                        <Plus className="mr-2 h-4 w-4" /> Thêm nhân sự
                    </Button>
                )}
            </div>

            <IsoPersonnelTable
                data={personnel}
                onEdit={canEdit ? handleEdit : undefined}
                onDelete={canDelete ? handleDelete : undefined}
            />
            {(canAdd || canEdit) && (
                <IsoPersonnelForm
                    open={open}
                    onOpenChange={(isOpen) => {
                        setOpen(isOpen);
                        if (!isOpen) setTimeout(() => setEditingItem(null), 300);
                    }}
                    availableEquipments={equipments}
                    initialData={editingItem}
                    allPersonnel={allPersonnel || []}
                />
            )}
        </div>
    );
}
