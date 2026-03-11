import { IsoPersonnelClient } from "./iso-personnel-client";
import { dataService } from "@/lib/data-service";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function PersonnelPage() {
    const personnel = await dataService.getIsoPersonnel();
    const equipments = await dataService.getEquipments();

    return (
        <IsoPersonnelClient personnel={personnel} equipments={equipments} />
    );
}

