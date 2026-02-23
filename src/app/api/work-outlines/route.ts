import { NextResponse } from "next/server";
import { googleSheetsService } from "@/lib/google-sheets";

export async function GET() {
    try {
        const workOutlines = await googleSheetsService.getWorkOutlines();
        return NextResponse.json(workOutlines);
    } catch (error) {
        console.error("Error in GET /api/work-outlines:", error);
        return NextResponse.json({ error: "Failed to fetch work outlines" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const data = await request.json();
        const success = await googleSheetsService.addWorkOutline(data);
        if (success) {
            return NextResponse.json({ success: true, message: "Work outline added successfully" }, { status: 201 });
        } else {
            return NextResponse.json({ success: false, error: "Failed to add work outline to Sheets" }, { status: 500 });
        }
    } catch (error) {
        console.error("Error in POST /api/work-outlines:", error);
        return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const data = await request.json();
        if (!data.id) {
            return NextResponse.json({ success: false, error: "ID is required for updating" }, { status: 400 });
        }

        const success = await googleSheetsService.updateWorkOutline(data.id, data);
        if (success) {
            return NextResponse.json({ success: true, message: "Work outline updated successfully" }, { status: 200 });
        } else {
            return NextResponse.json({ success: false, error: "Failed to update work outline in Sheets" }, { status: 500 });
        }
    } catch (error) {
        console.error("Error in PUT /api/work-outlines:", error);
        return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ success: false, error: "ID is required for deleting" }, { status: 400 });
        }

        const success = await googleSheetsService.deleteWorkOutline(id);
        if (success) {
            return NextResponse.json({ success: true, message: "Work outline deleted successfully" }, { status: 200 });
        } else {
            return NextResponse.json({ success: false, error: "Failed to delete work outline in Sheets" }, { status: 500 });
        }
    } catch (error) {
        console.error("Error in DELETE /api/work-outlines:", error);
        return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
    }
}
