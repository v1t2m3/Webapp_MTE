import { NextResponse } from "next/server";
import { dataService } from "@/lib/data-service";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { hasAccess } from "@/lib/rbac";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !hasAccess(session.user?.role, session.user?.level, "update", "tai-lieu-83")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const id = (await params).id;
        const data = await request.json();

        const success = await dataService.updateDocument(id, data);
        if (success) {
            return NextResponse.json({ success: true });
        } else {
            return NextResponse.json({ error: "Failed to update document" }, { status: 500 });
        }
    } catch (error) {
        console.error("Error updating document:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !hasAccess(session.user?.role, session.user?.level, "delete", "tai-lieu-83")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const id = (await params).id;
        const success = await dataService.deleteDocument(id);

        if (success) {
            return NextResponse.json({ success: true });
        } else {
            return NextResponse.json({ error: "Failed to delete document" }, { status: 500 });
        }
    } catch (error) {
        console.error("Error deleting document:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
