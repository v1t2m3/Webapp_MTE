"use client";

import { ContractTable } from "@/components/ContractTable";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { Contract } from "@/types";
import { ContractForm } from "@/components/ContractForm";

export default function ContractPage() {
    const [data, setData] = useState<Contract[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [currentContract, setCurrentContract] = useState<Contract | null>(null);

    const fetchData = async () => {
        try {
            const res = await fetch("/api/contracts");
            if (res.ok) {
                const json = await res.json();
                setData(json);
            }
        } catch (error) {
            console.error("Failed to fetch contracts:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleAdd = () => {
        setCurrentContract(null);
        setIsDialogOpen(true);
    };

    const handleEdit = (contract: Contract) => {
        setCurrentContract(contract);
        setIsDialogOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Bạn có chắc chắn muốn xóa hợp đồng này không?")) return;

        try {
            const res = await fetch(`/api/contracts?id=${id}`, {
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

    const handleFormSubmit = async (formData: Partial<Contract>) => {
        try {
            if (currentContract) {
                // Edit
                const res = await fetch("/api/contracts", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ ...formData, id: currentContract.id }),
                });
                if (!res.ok) throw new Error("Failed to update");
            } else {
                // Add
                const newId = formData.id || `HD${Date.now().toString().slice(-4)}`;
                const res = await fetch("/api/contracts", {
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
        <div className="p-8 space-y-8 animate-fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-primary">Quản lý Hợp đồng</h2>
                    <p className="text-muted-foreground mt-2">
                        Danh sách hợp đồng và tiến độ (Dữ liệu từ Google Sheets).
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="default"
                        className="bg-secondary hover:bg-secondary/90 text-white shadow-lg shadow-secondary/20"
                        onClick={handleAdd}
                    >
                        <Plus className="mr-2 h-4 w-4" /> Thêm hợp đồng
                    </Button>
                    <Button variant="outline" className="border-accent text-accent-foreground hover:bg-accent/10">
                        Xuất Excel
                    </Button>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center p-8">Đang tải dữ liệu...</div>
            ) : (
                <ContractTable
                    data={data}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />
            )}

            <ContractForm
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                initialData={currentContract}
                onSubmit={handleFormSubmit}
            />
        </div>
    );
}
