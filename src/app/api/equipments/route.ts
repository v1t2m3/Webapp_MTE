import { NextResponse } from 'next/server';
import { dataService } from '@/lib/data-service';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const success = await dataService.addEquipment(body);

        if (success) {
            return NextResponse.json({ success: true });
        } else {
            return NextResponse.json({ error: 'Failed to add equipment' }, { status: 500 });
        }
    } catch (error) {
        console.error('Error in equipment API:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
