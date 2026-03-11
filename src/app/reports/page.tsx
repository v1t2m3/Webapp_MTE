import { ReportsManager } from "@/components/reports/reports-manager";

export const dynamic = 'force-dynamic';
export const revalidate = 0;


export default function ReportsPage() {
    return (
        <div className="w-full">
            <ReportsManager />
        </div>
    );
}
