import { NextResponse } from 'next/server';
import { dataService } from '@/lib/data-service';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const success = await dataService.addIsoPersonnel(body);

        if (success) {
            return NextResponse.json({ success: true });
        } else {
            return NextResponse.json({ error: 'Failed to add personnel' }, { status: 500 });
        }
    } catch (error) {
        console.error('Error in personnel API:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
