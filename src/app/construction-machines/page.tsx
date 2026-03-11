import { ConstructionMachineClient } from "./construction-machine-client";
import { dataService } from "@/lib/data-service";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ConstructionMachinesPage() {
    const data = await dataService.getConstructionMachines();

    return (
        <div className="flex flex-col space-y-6">
            <ConstructionMachineClient data={data} />
        </div>
    );
}
