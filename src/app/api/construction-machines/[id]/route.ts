import { NextResponse } from "next/server";
import { dataService } from "@/lib/data-service";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { hasAccess } from "@/lib/rbac";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !hasAccess(session.user?.role, session.user?.level, "update", "may-moc-64")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const id = (await params).id;
        const data = await request.json();

        const success = await dataService.updateConstructionMachine(id, data);
        if (success) {
            return NextResponse.json({ success: true });
        } else {
            return NextResponse.json({ error: "Failed to update construction machine" }, { status: 500 });
        }
    } catch (error) {
        console.error("Error updating construction machine:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !hasAccess(session.user?.role, session.user?.level, "delete", "may-moc-64")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const id = (await params).id;
        const success = await dataService.deleteConstructionMachine(id);
        
        if (success) {
            return NextResponse.json({ success: true });
        } else {
            return NextResponse.json({ error: "Failed to delete construction machine" }, { status: 500 });
        }
    } catch (error) {
        console.error("Error deleting construction machine:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
