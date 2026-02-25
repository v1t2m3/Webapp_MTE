import { NextResponse } from 'next/server';
import { googleSheetsService } from '@/lib/google-sheets';

export async function GET() {
    try {
        const reports = await googleSheetsService.getSupplementalReports();
        return NextResponse.json(reports);
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Failed to fetch supplemental reports' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const success = await googleSheetsService.addSupplementalReport(body);

        if (success) {
            return NextResponse.json({ message: 'Supplemental report added successfully' });
        } else {
            return NextResponse.json({ error: 'Failed to add supplemental report' }, { status: 500 });
        }
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Missing ID' }, { status: 400 });
        }

        const success = await googleSheetsService.deleteSupplementalReport(id);

        if (success) {
            return NextResponse.json({ message: 'Supplemental report deleted successfully' });
        } else {
            return NextResponse.json({ error: 'Failed to delete supplemental report' }, { status: 500 });
        }
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
}
