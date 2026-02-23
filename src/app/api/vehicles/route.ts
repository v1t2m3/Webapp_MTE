import { googleSheetsService } from "@/lib/google-sheets";
import { NextResponse } from "next/server";

export async function GET() {
    const data = await googleSheetsService.getVehicles();
    return NextResponse.json(data);
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const success = await googleSheetsService.addVehicle(body);
        if (success) {
            return NextResponse.json({ message: "Vehicle added successfully" }, { status: 201 });
        } else {
            return NextResponse.json({ message: "Failed to add vehicle" }, { status: 500 });
        }
    } catch (error) {
        return NextResponse.json({ message: "Error adding vehicle", error }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const body = await req.json();
        const { id, ...data } = body;
        if (!id) {
            return NextResponse.json({ message: "ID is required" }, { status: 400 });
        }
        const success = await googleSheetsService.updateVehicle(id, data);
        if (success) {
            return NextResponse.json({ message: "Vehicle updated successfully" });
        } else {
            return NextResponse.json({ message: "Failed to update vehicle" }, { status: 500 });
        }
    } catch (error) {
        return NextResponse.json({ message: "Error updating vehicle", error }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");
        if (!id) {
            return NextResponse.json({ message: "ID is required" }, { status: 400 });
        }
        const success = await googleSheetsService.deleteVehicle(id);
        if (success) {
            return NextResponse.json({ message: "Vehicle deleted successfully" });
        } else {
            return NextResponse.json({ message: "Failed to delete vehicle" }, { status: 500 });
        }
    } catch (error) {
        return NextResponse.json({ message: "Error deleting vehicle", error }, { status: 500 });
    }
}
