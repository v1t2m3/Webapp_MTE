"use client";

import { useState } from "react";
import { IsoPersonnelTable } from "@/components/personnel/iso-personnel-table";
import { IsoPersonnelForm } from "@/components/personnel/iso-personnel-form";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Personnel, Equipment } from "@/types";

export function IsoPersonnelClient({
    personnel,
    equipments
}: {
    personnel: Personnel[];
    equipments: Equipment[];
}) {
    const [open, setOpen] = useState(false);

    return (
        <div className="flex flex-col space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight text-[#3a0ca3] dark:text-slate-200">
                    Quản lý Nhân sự (ISO 17025)
                </h2>
                <Button className="bg-[#4361ee] hover:bg-[#4361ee]/90 text-white" onClick={() => setOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Thêm nhân sự
                </Button>
            </div>

            <IsoPersonnelTable data={personnel} />
            <IsoPersonnelForm
                open={open}
                onOpenChange={setOpen}
                availableEquipments={equipments}
            />
        </div>
    );
}
