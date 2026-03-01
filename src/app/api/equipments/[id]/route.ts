import { NextResponse } from 'next/server';
import { dataService } from '@/lib/data-service';

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const id = (await params).id;
        const body = await request.json();

        if (!id) {
            return NextResponse.json({ error: 'Equipment ID is required' }, { status: 400 });
        }

        const success = await dataService.updateEquipment(id, body);

        if (success) {
            return NextResponse.json({ success: true });
        } else {
            return NextResponse.json({ error: 'Failed to update equipment' }, { status: 500 });
        }
    } catch (error) {
        console.error('Error updating equipment:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const id = (await params).id;

        if (!id) {
            return NextResponse.json({ error: 'Equipment ID is required' }, { status: 400 });
        }

        const success = await dataService.deleteEquipment(id);

        if (success) {
            return NextResponse.json({ success: true });
        } else {
            return NextResponse.json({ error: 'Failed to delete equipment' }, { status: 500 });
        }
    } catch (error) {
        console.error('Error deleting equipment:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
