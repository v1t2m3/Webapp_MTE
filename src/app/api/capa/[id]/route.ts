import { NextResponse } from 'next/server';
import { dataService } from '@/lib/data-service';

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const body = await request.json();
        const id = (await params).id;

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

        const success = await dataService.updateCapa(id, body);
        if (success) {
            return NextResponse.json({ success: true });
        } else {
            return NextResponse.json({ error: 'Failed to update CAPA or not found' }, { status: 404 });
        }
    } catch (error) {
        console.error(`Error in PUT /api/capa/[id]:`, error);
        return NextResponse.json({ error: 'Invalid Request' }, { status: 400 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const id = (await params).id;
        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

        const success = await dataService.deleteCapa(id);
        if (success) {
            return NextResponse.json({ success: true });
        } else {
            return NextResponse.json({ error: 'Failed to delete CAPA or not found' }, { status: 404 });
        }
    } catch (error) {
        console.error(`Error in DELETE /api/capa/[id]:`, error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
