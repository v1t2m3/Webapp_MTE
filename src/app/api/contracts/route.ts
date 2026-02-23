import { googleSheetsService } from "@/lib/google-sheets";
import { NextResponse } from "next/server";

export async function GET() {
    const data = await googleSheetsService.getContracts();
    return NextResponse.json(data);
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const success = await googleSheetsService.addContract(body);
        if (success) {
            return NextResponse.json({ message: "Contract added successfully" }, { status: 201 });
        } else {
            return NextResponse.json({ message: "Failed to add contract" }, { status: 500 });
        }
    } catch (error) {
        return NextResponse.json({ message: "Error adding contract", error }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const body = await req.json();
        const { id, ...data } = body;
        if (!id) {
            return NextResponse.json({ message: "ID is required" }, { status: 400 });
        }
        const success = await googleSheetsService.updateContract(id, data);
        if (success) {
            return NextResponse.json({ message: "Contract updated successfully" });
        } else {
            return NextResponse.json({ message: "Failed to update contract" }, { status: 500 });
        }
    } catch (error) {
        return NextResponse.json({ message: "Error updating contract", error }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");
        if (!id) {
            return NextResponse.json({ message: "ID is required" }, { status: 400 });
        }
        const success = await googleSheetsService.deleteContract(id);
        if (success) {
            return NextResponse.json({ message: "Contract deleted successfully" });
        } else {
            return NextResponse.json({ message: "Failed to delete contract" }, { status: 500 });
        }
    } catch (error) {
        return NextResponse.json({ message: "Error deleting contract", error }, { status: 500 });
    }
}
