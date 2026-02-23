"use client";

import { VehicleTable } from "@/components/VehicleTable";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { Vehicle } from "@/types";
import { VehicleForm } from "@/components/VehicleForm";
import { GlassCard, GlassPageHeader } from "@/components/ui/GlassCard";

export default function VehiclePage() {
    const [data, setData] = useState<Vehicle[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [currentVehicle, setCurrentVehicle] = useState<Vehicle | null>(null);

    const fetchData = async () => {
        try {
            const res = await fetch("/api/vehicles");
            if (res.ok) {
                const json = await res.json();
                setData(json);
            }
        } catch (error) {
            console.error("Failed to fetch vehicles:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleAdd = () => {
        setCurrentVehicle(null);
        setIsDialogOpen(true);
    };

    const handleEdit = (vehicle: Vehicle) => {
        setCurrentVehicle(vehicle);
        setIsDialogOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Bạn có chắc chắn muốn xóa xe này không?")) return;

        try {
            const res = await fetch(`/api/vehicles?id=${id}`, {
                method: "DELETE",
            });
            if (res.ok) {
                fetchData();
            } else {
                alert("Xóa thất bại");
            }
        } catch (error) {
            console.error("Failed to delete:", error);
            alert("Lỗi khi xóa");
        }
    };

    const handleFormSubmit = async (formData: Partial<Vehicle>) => {
        try {
            if (currentVehicle) {
                // Edit
                const res = await fetch("/api/vehicles", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ ...formData, id: currentVehicle.id }),
                });
                if (!res.ok) throw new Error("Failed to update");
            } else {
                // Add
                const newId = formData.id || `XE${Date.now().toString().slice(-4)}`;
                const res = await fetch("/api/vehicles", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ ...formData, id: newId }),
                });
                if (!res.ok) throw new Error("Failed to add");
            }
            fetchData();
        } catch (error) {
            console.error("Form submit error:", error);
            alert("Lỗi khi lưu dữ liệu");
            throw error;
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <GlassPageHeader
                title="Quản lý Xe & Thiết bị"
                description="Danh sách phương tiện và thiết bị (Dữ liệu từ Google Sheets)."
            >
                <div className="flex items-center gap-2">
                    <Button
                        variant="default"
                        className="bg-[#3a0ca3] hover:bg-[#3a0ca3]/90 text-white shadow-lg shadow-blue-900/20 transition-all hover:scale-105"
                        onClick={handleAdd}
                    >
                        <Plus className="mr-2 h-4 w-4" /> Thêm xe mới
                    </Button>
                    <Button variant="outline" className="border-indigo-100 text-indigo-700 hover:bg-indigo-50 hover:text-indigo-800">
                        Xuất Excel
                    </Button>
                </div>
            </GlassPageHeader>

            <GlassCard>
                {loading ? (
                    <div className="flex justify-center p-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                ) : (
                    <VehicleTable
                        data={data}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                    />
                )}
            </GlassCard>

            <VehicleForm
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                initialData={currentVehicle}
                onSubmit={handleFormSubmit}
            />
        </div>
    );
}
