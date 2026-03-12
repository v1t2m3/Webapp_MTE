import { DocumentClient } from "./document-client";
import { dataService } from "@/lib/data-service";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function DocumentsPage() {
    const documents = await dataService.getDocuments();

    return (
        <div className="flex flex-col space-y-6">
            <DocumentClient data={documents} />
        </div>
    );
}
