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
        leaveType: undefined,
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
                    leaveType: undefined,
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
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="leaveType" className="text-right">Loại nghỉ</Label>
                        <select
                            id="leaveType"
                            name="leaveType"
                            value={formData.leaveType || ""}
                            onChange={(e) => setFormData((prev) => ({ ...prev, leaveType: e.target.value as "thường" | "phép" | "bù" | undefined }))}
                            className="col-span-3 h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        >
                            <option value="">Không nghỉ</option>
                            <option value="thường">Nghỉ thường</option>
                            <option value="phép">Nghỉ phép</option>
                            <option value="bù">Nghỉ bù</option>
                        </select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">Ngày nghỉ</Label>
                        <div className="col-span-3">
                            <Input
                                type="date"
                                onChange={(e) => {
                                    if (e.target.value) {
                                        const newDates = [...(formData.leaveDates || [])];
                                        if (!newDates.includes(e.target.value)) {
                                            newDates.push(e.target.value);
                                            setFormData((prev) => ({ ...prev, leaveDates: newDates, status: "On Leave" }));
                                        }
                                        e.target.value = ""; // Reset input after selection
                                    }
                                }}
                            />
                            <div className="mt-2 flex flex-wrap gap-2">
                                {(formData.leaveDates || []).map((date) => (
                                    <span key={date} className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded">
                                        {new Date(date).toLocaleDateString("vi-VN")}
                                        <button
                                            type="button"
                                            onClick={() => setFormData((prev) => ({ ...prev, leaveDates: (prev.leaveDates || []).filter((d) => d !== date) }))}
                                            className="text-amber-600 hover:text-amber-900 font-bold ml-1"
                                        >
                                            &times;
                                        </button>
                                    </span>
                                ))}
                            </div>
                        </div>
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
