import { CapaClient } from "./capa-client";
import { dataService } from "@/lib/data-service";

export default async function CapaPage() {
    const capa = await dataService.getCapa();
    const personnel = await dataService.getPersonnel();

    return (
        <div className="flex flex-col space-y-6">
            <CapaClient data={capa} personnel={personnel} />
        </div>
    );
}
