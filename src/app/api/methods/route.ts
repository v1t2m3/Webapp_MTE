import { NextResponse } from 'next/server';
import { googleSheetsService } from '@/lib/google-sheets';

export async function GET() {
    try {
        const methods = await googleSheetsService.getMethods();
        return NextResponse.json(methods);
    } catch (error) {
        console.error('Error fetching methods API:', error);
        return NextResponse.json({ error: 'Failed to fetch methods' }, { status: 500 });
    }
}
