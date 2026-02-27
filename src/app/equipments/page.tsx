import { EquipmentTable } from "@/components/equipments/equipment-table";
import { EquipmentClient } from "./equipment-client";
import { dataService } from "@/lib/data-service";

export default async function EquipmentsPage() {
    const equipments = await dataService.getEquipments();

    return (
        <div className="flex flex-col space-y-6">
            <EquipmentClient data={equipments} />
        </div>
    );
}
