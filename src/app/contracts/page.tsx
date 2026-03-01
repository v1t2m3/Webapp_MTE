"use client";

import { ContractTable } from "@/components/ContractTable";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { Contract } from "@/types";
import { ContractForm } from "@/components/ContractForm";
import { GlassCard, GlassPageHeader } from "@/components/ui/GlassCard";
import { useSession } from "next-auth/react";
import { hasAccess } from "@/lib/rbac";

export default function ContractPage() {
    const [data, setData] = useState<Contract[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [currentContract, setCurrentContract] = useState<Contract | null>(null);

    const { data: session } = useSession();
    const canAdd = hasAccess(session?.user?.role, session?.user?.level, "create", "quang-ly-hop-dong");
    const canEdit = hasAccess(session?.user?.role, session?.user?.level, "update", "quang-ly-hop-dong");
    const canDelete = hasAccess(session?.user?.role, session?.user?.level, "delete", "quang-ly-hop-dong");

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
        <div className="space-y-6 animate-fade-in">
            <GlassPageHeader
                title="Quản lý Hợp đồng"
                description="Danh sách hợp đồng và tiến độ (Dữ liệu từ Google Sheets)."
            >
                <div className="flex items-center gap-2">
                    {canAdd && (
                        <Button
                            variant="default"
                            className="bg-[#3a0ca3] hover:bg-[#3a0ca3]/90 text-white shadow-lg shadow-blue-900/20 transition-all hover:scale-105"
                            onClick={handleAdd}
                        >
                            <Plus className="mr-2 h-4 w-4" /> Thêm hợp đồng
                        </Button>
                    )}
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
                    <ContractTable
                        data={data}
                        onEdit={canEdit ? handleEdit : undefined}
                        onDelete={canDelete ? handleDelete : undefined}
                    />
                )}
            </GlassCard>

            {(canAdd || canEdit) && (
                <ContractForm
                    open={isDialogOpen}
                    onOpenChange={setIsDialogOpen}
                    initialData={currentContract}
                    onSubmit={handleFormSubmit}
                />
            )}
        </div>
    );
}
