import { NextRequest, NextResponse } from 'next/server';
import { googleSheetsService } from '@/lib/google-sheets';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';

export async function GET() {
    try {
        const standards = await googleSheetsService.getStandards();
        return NextResponse.json(standards);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch standards' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await req.json();
        const id = `STD-${Date.now()}`;
        const ok = await googleSheetsService.addStandard({ ...body, id });
        if (!ok) throw new Error('Failed to add');
        return NextResponse.json({ success: true, id });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to add standard' }, { status: 500 });
    }
}
