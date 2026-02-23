import { googleSheetsService } from "@/lib/google-sheets";
import { NextResponse } from "next/server";

export async function GET() {
    const data = await googleSheetsService.getPersonnel();
    return NextResponse.json(data);
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const success = await googleSheetsService.addPersonnel(body);
        if (success) {
            return NextResponse.json({ message: "Personnel added successfully" }, { status: 201 });
        } else {
            return NextResponse.json({ message: "Failed to add personnel" }, { status: 500 });
        }
    } catch (error) {
        return NextResponse.json({ message: "Error adding personnel", error }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const body = await req.json();
        const { id, ...data } = body;
        if (!id) {
            return NextResponse.json({ message: "ID is required" }, { status: 400 });
        }
        const success = await googleSheetsService.updatePersonnel(id, data);
        if (success) {
            return NextResponse.json({ message: "Personnel updated successfully" });
        } else {
            return NextResponse.json({ message: "Failed to update personnel" }, { status: 500 });
        }
    } catch (error) {
        return NextResponse.json({ message: "Error updating personnel", error }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");
        if (!id) {
            return NextResponse.json({ message: "ID is required" }, { status: 400 });
        }
        const success = await googleSheetsService.deletePersonnel(id);
        if (success) {
            return NextResponse.json({ message: "Personnel deleted successfully" });
        } else {
            return NextResponse.json({ message: "Failed to delete personnel" }, { status: 500 });
        }
    } catch (error) {
        return NextResponse.json({ message: "Error deleting personnel", error }, { status: 500 });
    }
}
