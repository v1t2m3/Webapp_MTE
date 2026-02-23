"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Personnel } from "@/types";

interface PersonnelFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    initialData?: Personnel | null;
    onSubmit: (data: Partial<Personnel>) => Promise<void>;
}

export function PersonnelForm({ open, onOpenChange, initialData, onSubmit }: PersonnelFormProps) {
    const [formData, setFormData] = useState<Partial<Personnel>>({
        fullName: "",
        birthYear: "",
        job: "",
        skillLevel: "",
        safetyLevel: "",
        education: "",
        contractType: "",
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open) {
            if (initialData) {
                setFormData(initialData);
            } else {
                setFormData({
                    fullName: "",
                    birthYear: "",
                    job: "",
                    skillLevel: "",
                    safetyLevel: "",
                    education: "",
                    contractType: "",
                });
            }
        }
    }, [open, initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onSubmit(formData);
            onOpenChange(false);
        } catch (error) {
            console.error("Form submission error:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{initialData ? "Sửa nhân viên" : "Thêm nhân viên mới"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="fullName" className="text-right">Họ tên</Label>
                        <Input id="fullName" name="fullName" value={formData.fullName || ""} onChange={handleChange} className="col-span-3" required />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="birthYear" className="text-right">Năm sinh</Label>
                        <Input id="birthYear" name="birthYear" value={formData.birthYear || ""} onChange={handleChange} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="job" className="text-right">Nghề nghiệp</Label>
                        <Input id="job" name="job" value={formData.job || ""} onChange={handleChange} className="col-span-3" required />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="skillLevel" className="text-right">Bậc nghề</Label>
                        <Input id="skillLevel" name="skillLevel" value={formData.skillLevel || ""} onChange={handleChange} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="safetyLevel" className="text-right">Bậc an toàn</Label>
                        <Input id="safetyLevel" name="safetyLevel" value={formData.safetyLevel || ""} onChange={handleChange} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="education" className="text-right">Trình độ</Label>
                        <Input id="education" name="education" value={formData.education || ""} onChange={handleChange} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="contractType" className="text-right">Loại HĐLĐ</Label>
                        <Input id="contractType" name="contractType" value={formData.contractType || ""} onChange={handleChange} className="col-span-3" placeholder="VD: 12 tháng, Không xác định..." />
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Đang lưu..." : "Lưu tin"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
