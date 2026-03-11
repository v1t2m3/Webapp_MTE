import { ScheduleManager } from "@/components/schedules/schedule-manager";

export const dynamic = 'force-dynamic';
export const revalidate = 0;


export default function SchedulePage() {
    return (
        <ScheduleManager />
    );
}
