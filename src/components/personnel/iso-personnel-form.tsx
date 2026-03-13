"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Equipment, Personnel } from "@/types";
import { useRouter } from "next/navigation";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

export function IsoPersonnelForm({
    open,
    onOpenChange,
    availableEquipments,
    initialData,
    allPersonnel
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    availableEquipments: Equipment[];
    initialData?: Personnel | null;
    allPersonnel?: Personnel[];
}) {
    const { register, handleSubmit, reset, setValue, watch } = useForm<Partial<Personnel>>();
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Equipments Checkbox State
    const [equipSelectionType, setEquipSelectionType] = useState<"none" | "all" | "custom">("none");
    const [selectedEquipIds, setSelectedEquipIds] = useState<string[]>([]);

    const { toast } = useToast();
    const router = useRouter();

    // Filter out disposed equipments
    const validEquipments = availableEquipments.filter(eq =>
        !eq.status.toLowerCase().includes("thanh lý") &&
        eq.status.toLowerCase() !== "disposed"
    );

    useEffect(() => {
        if (open) {
            if (initialData) {
                let formattedDate = initialData.lastTrainingDate || "";
                if (formattedDate.includes('/')) {
                    const parts = formattedDate.split('/');
                    if (parts.length === 3) {
                        formattedDate = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
                    }
                }
                reset({
                    ...initialData,
                    lastTrainingDate: formattedDate
                });
                const equips = initialData.authorizedEquipments || "";
                if (!equips || equips === "Không") {
                    setEquipSelectionType("none");
                    setSelectedEquipIds([]);
                } else if (equips === "Tất cả") {
                    setEquipSelectionType("all");
                    setSelectedEquipIds([]);
                } else {
                    setEquipSelectionType("custom");
                    setSelectedEquipIds(equips.split(",").map(e => e.trim()));
                }
            } else {
                reset();
                setEquipSelectionType("none");
                setSelectedEquipIds([]);
            }
        }
    }, [open, initialData, reset]);

    const toggleEquip = (name: string) => {
        if (selectedEquipIds.includes(name)) {
            setSelectedEquipIds(selectedEquipIds.filter(id => id !== name));
        } else {
            setSelectedEquipIds([...selectedEquipIds, name]);
        }
    };

    const onSubmit = async (data: Partial<Personnel>) => {
        setIsSubmitting(true);
        try {
            // Compile final equipments string based on selection mode
            let finalEquipmentsStr = "Không";
            if (equipSelectionType === "all") {
                finalEquipmentsStr = "Tất cả"; // Valid equipments
            } else if (equipSelectionType === "custom" && selectedEquipIds.length > 0) {
                finalEquipmentsStr = selectedEquipIds.join(", ");
            }

            const isEditing = !!initialData;
            const url = isEditing ? `/api/iso-personnel/${initialData.id}` : '/api/iso-personnel';
            const method = isEditing ? 'PUT' : 'POST';

            const payload = {
                ...data,
                id: isEditing ? initialData.id : undefined,
                authorizedEquipments: finalEquipmentsStr,
                fullName: data.name,
                position: data.job,
            };

            const res = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!res.ok) throw new Error("Thất bại");

            toast({
                title: "Thành công",
                description: !!initialData ? "Đã cập nhật nhân sự thành công." : "Đã thêm nhân sự ISO 17025 thành công.",
            });
            reset();
            setEquipSelectionType("none");
            setSelectedEquipIds([]);
            onOpenChange(false);
            window.location.reload();
        } catch (error) {
            toast({
                title: "Lỗi",
                description: "Không thể lưu nhân sự. Vui lòng thử lại.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <form onSubmit={handleSubmit(onSubmit)}>
                    <DialogHeader>
                        <DialogTitle>{initialData ? "Sửa Nhân sự Thử nghiệm (ISO 17025)" : "Thêm Nhân sự Thử nghiệm (ISO 17025)"}</DialogTitle>
                        <DialogDescription>
                            Nhập thông tin nhân sự và chỉ định năng lực phương pháp, thiết bị thử nghiệm.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">Họ và Tên</Label>
                            <div className="col-span-3">
                                <Select 
                                    onValueChange={(val) => {
                                        setValue("name", val);
                                        // Auto-fill department and job if matched
                                        if (allPersonnel) {
                                            const matched = allPersonnel.find(p => (p.fullName || p.name) === val);
                                            if (matched) {
                                                if (matched.department) setValue("department", matched.department);
                                                if (matched.position || matched.job) setValue("job", matched.position || matched.job);
                                            }
                                        }
                                    }} 
                                    value={watch("name") || ""}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Chọn nhân sự" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Array.from(new Set((allPersonnel || []).map(p => p.fullName || p.name).filter(Boolean))).map(name => (
                                            <SelectItem key={name} value={name!}>{name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="department" className="text-right">Phòng ban</Label>
                            <Input id="department" {...register("department")} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="job" className="text-right">Chức vụ</Label>
                            <Input id="job" {...register("job")} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="authorizedMethods" className="text-right whitespace-nowrap">PP được phép</Label>
                            <Input id="authorizedMethods" placeholder="Nhị thứ, Nhất thứ, Hóa..." {...register("authorizedMethods")} className="col-span-3" />
                        </div>

                        {/* Custom Equipment Selector block */}
                        <div className="grid grid-cols-4 items-start gap-4 border-y py-4 my-2">
                            <Label className="text-right mt-2">Thiết bị được phép</Label>
                            <div className="col-span-3 space-y-4">
                                <div className="flex space-x-4">
                                    <label className="flex items-center space-x-2 cursor-pointer">
                                        <input type="radio" name="equip_type" value="none"
                                            checked={equipSelectionType === "none"}
                                            onChange={() => setEquipSelectionType("none")}
                                        />
                                        <span className="text-sm">Không</span>
                                    </label>
                                    <label className="flex items-center space-x-2 cursor-pointer">
                                        <input type="radio" name="equip_type" value="all"
                                            checked={equipSelectionType === "all"}
                                            onChange={() => setEquipSelectionType("all")}
                                        />
                                        <span className="text-sm">Tất cả thiết bị hợp lệ</span>
                                    </label>
                                    <label className="flex items-center space-x-2 cursor-pointer">
                                        <input type="radio" name="equip_type" value="custom"
                                            checked={equipSelectionType === "custom"}
                                            onChange={() => setEquipSelectionType("custom")}
                                        />
                                        <span className="text-sm">Từng thiết bị</span>
                                    </label>
                                </div>

                                {equipSelectionType === "custom" && (
                                    <div className="bg-slate-50 dark:bg-slate-900 border p-4 rounded-md h-40 overflow-y-auto space-y-2">
                                        {validEquipments.length === 0 ? (
                                            <p className="text-sm text-muted-foreground italic">Không có thiết bị hợp lệ nào trên hệ thống.</p>
                                        ) : (
                                            validEquipments.map(eq => (
                                                <div key={eq.id} className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id={`eq-${eq.id}`}
                                                        checked={selectedEquipIds.includes(eq.name)}
                                                        onCheckedChange={() => toggleEquip(eq.name)}
                                                    />
                                                    <label htmlFor={`eq-${eq.id}`} className="text-sm font-medium leading-none cursor-pointer">
                                                        {eq.name} <span className="text-muted-foreground font-normal">({eq.serialNumber})</span>
                                                    </label>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="lastTrainingDate" className="text-right">Ngày Đ.Tạo</Label>
                            <Input id="lastTrainingDate" type="date" {...register("lastTrainingDate")} className="col-span-3" />
                        </div>

                        <div className="grid grid-cols-4 items-center gap-4 border-t pt-4">
                            <Label htmlFor="profileLink" className="text-right">Hồ sơ đính kèm (Link Drive)</Label>
                            <Input 
                                id="profileLink" 
                                placeholder="Paste đường dẫn Google Drive vào đây..." 
                                {...register("profileLink")} 
                                className="col-span-3 font-mono text-sm text-blue-600 dark:text-blue-400" 
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Hủy
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Đang lưu..." : "Lưu nhân sự"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
