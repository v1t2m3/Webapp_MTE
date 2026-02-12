import { google } from 'googleapis';
import { JWT } from 'google-auth-library';

// Types for our data
import { Personnel, Vehicle, Contract, Schedule, Report } from '@/types';

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

// Function to get authenticated client
async function getAuthClient() {
    if (!process.env.GOOGLE_CLIENT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
        throw new Error('Google Sheets credentials missing');
    }

    const client = new JWT({
        email: process.env.GOOGLE_CLIENT_EMAIL,
        key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        scopes: SCOPES,
    });

    return client;
}

// Service to interact with Sheets
export const googleSheetsService = {
    getPersonnel: async (): Promise<Personnel[]> => {
        try {
            if (!process.env.GOOGLE_SHEET_ID) return [];
            const client = await getAuthClient();
            const sheets = google.sheets({ version: 'v4', auth: client });

            const response = await sheets.spreadsheets.values.get({
                spreadsheetId: process.env.GOOGLE_SHEET_ID,
                range: 'Personnel!A2:E', // Assuming structure: ID, Name, Position, Department, Status
            });

            const rows = response.data.values;
            if (!rows) return [];

            return rows.map((row) => ({
                id: row[0],
                name: row[1],
                position: row[2],
                department: row[3],
                status: row[4] as any,
            }));
        } catch (error) {
            console.error('Error fetching personnel:', error);
            return [];
        }
    },

    // Similar methods for Vehicles, Contracts, Schedules...
    // For now we will return Mock Data if env is not set or error occurs
};
