import { ScheduleManager } from "@/components/schedules/schedule-manager";
import { dataService } from "@/lib/data-service";

export default async function SchedulePage() {
    const schedules = await dataService.getSchedules();
    const contracts = await dataService.getContracts();
    const personnel = await dataService.getPersonnel();
    const vehicles = await dataService.getVehicles();

    return (
        <ScheduleManager
            schedules={schedules}
            contracts={contracts}
            personnel={personnel}
            vehicles={vehicles}
        />
    );
}
