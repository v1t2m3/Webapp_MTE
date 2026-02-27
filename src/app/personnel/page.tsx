import { IsoPersonnelClient } from "./iso-personnel-client";
import { dataService } from "@/lib/data-service";

export default async function PersonnelPage() {
    const personnel = await dataService.getIsoPersonnel();
    const equipments = await dataService.getEquipments();

    return (
        <IsoPersonnelClient personnel={personnel} equipments={equipments} />
    );
}

