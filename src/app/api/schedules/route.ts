import { NextResponse } from 'next/server';
import { googleSheetsService } from '@/lib/google-sheets';

export async function GET() {
    try {
        const schedules = await googleSheetsService.getSchedules();
        return NextResponse.json(schedules);
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Failed to fetch schedules' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const success = await googleSheetsService.addSchedule(body);
        if (success) {
            return NextResponse.json({ message: 'Schedule added successfully' });
        } else {
            return NextResponse.json({ error: 'Failed to add schedule' }, { status: 500 });
        }
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
}

export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { id, ...data } = body;

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

        const success = await googleSheetsService.updateSchedule(id, body);
        if (success) {
            return NextResponse.json({ message: 'Schedule updated successfully' });
        } else {
            return NextResponse.json({ error: 'Failed to update schedule' }, { status: 500 });
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
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

        const success = await googleSheetsService.deleteSchedule(id);
        if (success) {
            return NextResponse.json({ message: 'Schedule deleted successfully' });
        } else {
            return NextResponse.json({ error: 'Failed to delete schedule' }, { status: 500 });
        }
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
}
