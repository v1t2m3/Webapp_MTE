"use client";

import { useState } from "react";
import { EquipmentTable } from "@/components/equipments/equipment-table";
import { EquipmentForm } from "@/components/equipments/equipment-form";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Equipment } from "@/types";

export function EquipmentClient({ data }: { data: Equipment[] }) {
    const [open, setOpen] = useState(false);

    return (
        <>
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight text-[#3a0ca3] dark:text-slate-200">
                    Máy móc, Thiết bị (Mục 6.4)
                </h2>
                <Button className="bg-[#4361ee] hover:bg-[#4361ee]/90 text-white" onClick={() => setOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Thêm thiết bị
                </Button>
            </div>

            <EquipmentTable data={data} />
            <EquipmentForm open={open} onOpenChange={setOpen} />
        </>
    );
}
