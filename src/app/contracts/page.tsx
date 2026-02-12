import { ContractTable } from "@/components/contracts/contract-table";
import { dataService } from "@/lib/data-service";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default async function ContractPage() {
    const contracts = await dataService.getContracts();

    return (
        <div className="flex flex-col space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Quản lý Hợp đồng</h2>
                <Button>
                    <Plus className="mr-2 h-4 w-4" /> Thêm hợp đồng
                </Button>
            </div>
            <ContractTable data={contracts} />
        </div>
    );
}
