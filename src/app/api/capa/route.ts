import { NextResponse } from 'next/server';
import { dataService } from '@/lib/data-service';

export async function GET() {
    try {
        const capa = await dataService.getCapa();
        return NextResponse.json(capa);
    } catch (error) {
        console.error('Error in GET /api/capa:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const result = await dataService.addCapa(body);
        if (result) {
            return NextResponse.json(result, { status: 201 });
        } else {
            return NextResponse.json({ error: 'Failed to create CAPA' }, { status: 500 });
        }
    } catch (error) {
        console.error('Error in POST /api/capa:', error);
        return NextResponse.json({ error: 'Invalid Request' }, { status: 400 });
    }
}
