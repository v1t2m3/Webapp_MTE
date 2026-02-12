import { VehicleTable } from "@/components/vehicles/vehicle-table";
import { dataService } from "@/lib/data-service";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default async function VehiclePage() {
    const vehicles = await dataService.getVehicles();

    return (
        <div className="flex flex-col space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Quản lý Xe & Thiết bị</h2>
                <Button>
                    <Plus className="mr-2 h-4 w-4" /> Thêm xe
                </Button>
            </div>
            <VehicleTable data={vehicles} />
        </div>
    );
}
