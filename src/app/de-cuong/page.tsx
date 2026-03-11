import { WorkOutlineManager } from "@/components/work-outlines/work-outline-manager";

export const dynamic = 'force-dynamic';
export const revalidate = 0;


export default function WorkOutlinePage() {
    return (
        <div className="w-full">
            <WorkOutlineManager />
        </div>
    );
}
