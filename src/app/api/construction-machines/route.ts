import { NextResponse } from "next/server";
import { dataService } from "@/lib/data-service";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { hasAccess } from "@/lib/rbac";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        
        const data = await dataService.getConstructionMachines();
        return NextResponse.json(data);
    } catch (error) {
        console.error("Error fetching construction machines:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !hasAccess(session.user?.role, session.user?.level, "create", "may-moc-64")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const data = await request.json();
        
        // Generate a simple ID if not provided
        if (!data.id) {
            data.id = `CM${Date.now()}`;
        }
        
        const success = await dataService.addConstructionMachine(data);
        if (success) {
            return NextResponse.json({ success: true, id: data.id });
        } else {
            return NextResponse.json({ error: "Failed to add construction machine" }, { status: 500 });
        }
    } catch (error) {
        console.error("Error adding construction machine:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
