import { NextResponse } from 'next/server';
import { dataService } from '@/lib/data-service';

export async function PUT(
    request: Request,
    { params }: { params: { id: string } | Promise<{ id: string }> }
) {
    try {
        const resolvedParams = await Promise.resolve(params);
        const { id } = resolvedParams;
        const body = await request.json();
        const success = await dataService.updateIsoPersonnel(id, body);

        if (success) {
            return NextResponse.json({ success: true });
        } else {
            return NextResponse.json({ error: 'Failed to update person' }, { status: 500 });
        }
    } catch (error) {
        console.error('Error updating ISO personnel:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } | Promise<{ id: string }> }
) {
    try {
        const resolvedParams = await Promise.resolve(params);
        const { id } = resolvedParams;
        const success = await dataService.deleteIsoPersonnel(id);

        if (success) {
            return NextResponse.json({ success: true });
        } else {
            return NextResponse.json({ error: 'Failed to delete person' }, { status: 500 });
        }
    } catch (error) {
        console.error('Error deleting ISO personnel:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
