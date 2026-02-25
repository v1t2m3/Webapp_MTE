import { google } from 'googleapis';
import { JWT } from 'google-auth-library';

// Types for our data
import { Personnel, Vehicle, Contract, Schedule, Report } from '@/types';

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

// Function to get authenticated client
async function getAuthClient() {
    if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
        throw new Error('Google Sheets credentials missing');
    }

    const client = new JWT({
        email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
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
                range: 'NhanSu!A2:I', // id, fullName, birthYear, job, skillLevel, safetyLevel, education, contractType, section
            });

            const rows = response.data.values;
            if (!rows) return [];

            return rows
                .filter(row => row[0]) // Filter out empty rows (cleared rows)
                .map((row) => {
                    let leaveDates: string[] = [];
                    try {
                        leaveDates = row[10] ? JSON.parse(row[10]) : [];
                    } catch (e) {
                        leaveDates = [];
                    }

                    return {
                        id: row[0],
                        // Dashboard fields
                        name: row[1],
                        position: row[3],
                        department: 'N/A',
                        status: row[9] ? 'On Leave' : 'Active', // Column J for status (Active/On Leave, though usually derived from dates)
                        // Personnel Page fields
                        fullName: row[1],
                        birthYear: row[2],
                        job: row[3],
                        skillLevel: row[4],
                        safetyLevel: row[5],
                        education: row[6],
                        contractType: row[7],
                        section: row[8] || '', // Bộ phận
                        leaveType: row[9] || undefined, // Column J for Leave Type
                        leaveDates: leaveDates // Column K for JSON formatted leave dates
                    } as Personnel;
                });
        } catch (error) {
            console.error('Error fetching personnel:', error);
            return [];
        }
    },

    // Helper to find row index by ID
    findPersonnelRowIndex: async (id: string): Promise<number | null> => {
        try {
            if (!process.env.GOOGLE_SHEET_ID) return null;
            const client = await getAuthClient();
            const sheets = google.sheets({ version: 'v4', auth: client });

            const response = await sheets.spreadsheets.values.get({
                spreadsheetId: process.env.GOOGLE_SHEET_ID,
                range: 'NhanSu!A:A', // Search only ID column
            });

            const rows = response.data.values;
            if (!rows) return null;

            // Find index. IDs are in column A. Row 1 is header.
            const index = rows.findIndex((row) => row[0] === id);
            return index !== -1 ? index + 1 : null; // Return 1-based row index
        } catch (error) {
            console.error('Error finding personnel row:', error);
            return null;
        }
    },

    addPersonnel: async (personnel: any): Promise<boolean> => {
        try {
            if (!process.env.GOOGLE_SHEET_ID) return false;
            const client = await getAuthClient();
            const sheets = google.sheets({ version: 'v4', auth: client });

            const values = [
                [
                    personnel.id,
                    personnel.fullName,
                    personnel.birthYear,
                    personnel.job,
                    personnel.skillLevel,
                    personnel.safetyLevel,
                    personnel.education,
                    personnel.contractType,
                    personnel.section || '',
                    personnel.leaveType || '',
                    JSON.stringify(personnel.leaveDates || []),
                ],
            ];

            await sheets.spreadsheets.values.append({
                spreadsheetId: process.env.GOOGLE_SHEET_ID,
                range: 'NhanSu!A:K',
                valueInputOption: 'USER_ENTERED',
                requestBody: { values },
            });

            return true;
        } catch (error) {
            console.error('Error adding personnel:', error);
            return false;
        }
    },

    updatePersonnel: async (id: string, personnel: any): Promise<boolean> => {
        try {
            if (!process.env.GOOGLE_SHEET_ID) return false;
            const rowIndex = await googleSheetsService.findPersonnelRowIndex(id);
            if (!rowIndex) return false;

            const client = await getAuthClient();
            const sheets = google.sheets({ version: 'v4', auth: client });

            const values = [
                [
                    id, // Keep ID same
                    personnel.fullName,
                    personnel.birthYear,
                    personnel.job,
                    personnel.skillLevel,
                    personnel.safetyLevel,
                    personnel.education,
                    personnel.contractType,
                    personnel.section || '',
                    personnel.leaveType || '',
                    JSON.stringify(personnel.leaveDates || []),
                ],
            ];

            await sheets.spreadsheets.values.update({
                spreadsheetId: process.env.GOOGLE_SHEET_ID,
                range: `NhanSu!A${rowIndex}:K${rowIndex}`,
                valueInputOption: 'USER_ENTERED',
                requestBody: { values },
            });

            return true;
        } catch (error) {
            console.error('Error updating personnel:', error);
            return false;
        }
    },

    deletePersonnel: async (id: string): Promise<boolean> => {
        try {
            if (!process.env.GOOGLE_SHEET_ID) return false;
            const rowIndex = await googleSheetsService.findPersonnelRowIndex(id);
            if (!rowIndex) return false;

            const client = await getAuthClient();
            const sheets = google.sheets({ version: 'v4', auth: client });

            // Clearing the row content instead of deleting the dimension to avoid needing GID
            await sheets.spreadsheets.values.clear({
                spreadsheetId: process.env.GOOGLE_SHEET_ID,
                range: `NhanSu!A${rowIndex}:I${rowIndex}`,
            });

            return true;
        } catch (error) {
            console.error('Error deleting personnel:', error);
            return false;
        }
    },

    // --- VEHICLE MANAGEMENT ---

    getVehicles: async (): Promise<Vehicle[]> => {
        try {
            if (!process.env.GOOGLE_SHEET_ID) return [];
            const client = await getAuthClient();
            const sheets = google.sheets({ version: 'v4', auth: client });

            const response = await sheets.spreadsheets.values.get({
                spreadsheetId: process.env.GOOGLE_SHEET_ID,
                range: 'XeThietBi!A2:H',
            });

            const rows = response.data.values;
            if (!rows) return [];

            return rows
                .filter(row => row[0])
                .map((row) => ({
                    id: row[0],
                    name: row[1],
                    type: row[2],
                    licensePlate: row[3],
                    inspectionExpiry: row[4],
                    insuranceExpiry: row[5],
                    status: (row[6] as any) || 'Available',
                    driverId: row[7],
                }));
        } catch (error) {
            console.error('Error fetching vehicles:', error);
            return [];
        }
    },

    findVehicleRowIndex: async (id: string): Promise<number | null> => {
        try {
            if (!process.env.GOOGLE_SHEET_ID) return null;
            const client = await getAuthClient();
            const sheets = google.sheets({ version: 'v4', auth: client });

            const response = await sheets.spreadsheets.values.get({
                spreadsheetId: process.env.GOOGLE_SHEET_ID,
                range: 'XeThietBi!A:A',
            });

            const rows = response.data.values;
            if (!rows) return null;

            const index = rows.findIndex((row) => row[0] === id);
            return index !== -1 ? index + 1 : null;
        } catch (error) {
            console.error('Error finding vehicle row:', error);
            return null;
        }
    },

    addVehicle: async (vehicle: any): Promise<boolean> => {
        try {
            if (!process.env.GOOGLE_SHEET_ID) return false;
            const client = await getAuthClient();
            const sheets = google.sheets({ version: 'v4', auth: client });

            const values = [
                [
                    vehicle.id,
                    vehicle.name,
                    vehicle.type,
                    vehicle.licensePlate,
                    vehicle.inspectionExpiry,
                    vehicle.insuranceExpiry,
                    vehicle.status,
                    vehicle.driverId,
                ],
            ];

            await sheets.spreadsheets.values.append({
                spreadsheetId: process.env.GOOGLE_SHEET_ID,
                range: 'XeThietBi!A:H',
                valueInputOption: 'USER_ENTERED',
                requestBody: { values },
            });

            return true;
        } catch (error) {
            console.error('Error adding vehicle:', error);
            return false;
        }
    },

    updateVehicle: async (id: string, vehicle: any): Promise<boolean> => {
        try {
            if (!process.env.GOOGLE_SHEET_ID) return false;
            const rowIndex = await googleSheetsService.findVehicleRowIndex(id);
            if (!rowIndex) return false;

            const client = await getAuthClient();
            const sheets = google.sheets({ version: 'v4', auth: client });

            const values = [
                [
                    id,
                    vehicle.name,
                    vehicle.type,
                    vehicle.licensePlate,
                    vehicle.inspectionExpiry,
                    vehicle.insuranceExpiry,
                    vehicle.status,
                    vehicle.driverId,
                ],
            ];

            await sheets.spreadsheets.values.update({
                spreadsheetId: process.env.GOOGLE_SHEET_ID,
                range: `XeThietBi!A${rowIndex}:H${rowIndex}`,
                valueInputOption: 'USER_ENTERED',
                requestBody: { values },
            });

            return true;
        } catch (error) {
            console.error('Error updating vehicle:', error);
            return false;
        }
    },

    deleteVehicle: async (id: string): Promise<boolean> => {
        try {
            if (!process.env.GOOGLE_SHEET_ID) return false;
            const rowIndex = await googleSheetsService.findVehicleRowIndex(id);
            if (!rowIndex) return false;

            const client = await getAuthClient();
            const sheets = google.sheets({ version: 'v4', auth: client });

            await sheets.spreadsheets.values.clear({
                spreadsheetId: process.env.GOOGLE_SHEET_ID,
                range: `XeThietBi!A${rowIndex}:H${rowIndex}`,
            });

            return true;
        } catch (error) {
            console.error('Error deleting vehicle:', error);
            return false;
        }
    },

    // --- CONTRACT MANAGEMENT ---

    getContracts: async (): Promise<Contract[]> => {
        try {
            if (!process.env.GOOGLE_SHEET_ID) return [];
            const client = await getAuthClient();
            const sheets = google.sheets({ version: 'v4', auth: client });

            const response = await sheets.spreadsheets.values.get({
                spreadsheetId: process.env.GOOGLE_SHEET_ID,
                range: 'HopDong!A2:G',
            });

            const rows = response.data.values;
            if (!rows) return [];

            return rows
                .filter(row => row[0])
                .map((row) => ({
                    id: row[0],
                    code: row[1],
                    name: row[2],
                    value: row[3],
                    startDate: row[4],
                    endDate: row[5],
                    investorRep: row[6],
                }));
        } catch (error) {
            console.error('Error fetching contracts:', error);
            return [];
        }
    },

    findContractRowIndex: async (id: string): Promise<number | null> => {
        try {
            if (!process.env.GOOGLE_SHEET_ID) return null;
            const client = await getAuthClient();
            const sheets = google.sheets({ version: 'v4', auth: client });

            const response = await sheets.spreadsheets.values.get({
                spreadsheetId: process.env.GOOGLE_SHEET_ID,
                range: 'HopDong!A:A',
            });

            const rows = response.data.values;
            if (!rows) return null;

            const index = rows.findIndex((row) => row[0] === id);
            return index !== -1 ? index + 1 : null;
        } catch (error) {
            console.error('Error finding contract row:', error);
            return null;
        }
    },

    addContract: async (contract: any): Promise<boolean> => {
        try {
            if (!process.env.GOOGLE_SHEET_ID) return false;
            const client = await getAuthClient();
            const sheets = google.sheets({ version: 'v4', auth: client });

            const values = [
                [
                    contract.id,
                    contract.code,
                    contract.name,
                    contract.value,
                    contract.startDate,
                    contract.endDate,
                    contract.investorRep,
                ],
            ];

            await sheets.spreadsheets.values.append({
                spreadsheetId: process.env.GOOGLE_SHEET_ID,
                range: 'HopDong!A:G',
                valueInputOption: 'USER_ENTERED',
                requestBody: { values },
            });

            return true;
        } catch (error) {
            console.error('Error adding contract:', error);
            return false;
        }
    },

    updateContract: async (id: string, contract: any): Promise<boolean> => {
        try {
            if (!process.env.GOOGLE_SHEET_ID) return false;
            const rowIndex = await googleSheetsService.findContractRowIndex(id);
            if (!rowIndex) return false;

            const client = await getAuthClient();
            const sheets = google.sheets({ version: 'v4', auth: client });

            const values = [
                [
                    id,
                    contract.code,
                    contract.name,
                    contract.value,
                    contract.startDate,
                    contract.endDate,
                    contract.investorRep,
                ],
            ];

            await sheets.spreadsheets.values.update({
                spreadsheetId: process.env.GOOGLE_SHEET_ID,
                range: `HopDong!A${rowIndex}:G${rowIndex}`,
                valueInputOption: 'USER_ENTERED',
                requestBody: { values },
            });

            return true;
        } catch (error) {
            console.error('Error updating contract:', error);
            return false;
        }
    },

    deleteContract: async (id: string): Promise<boolean> => {
        try {
            if (!process.env.GOOGLE_SHEET_ID) return false;
            const rowIndex = await googleSheetsService.findContractRowIndex(id);
            if (!rowIndex) return false;

            const client = await getAuthClient();
            const sheets = google.sheets({ version: 'v4', auth: client });

            await sheets.spreadsheets.values.clear({
                spreadsheetId: process.env.GOOGLE_SHEET_ID,
                range: `HopDong!A${rowIndex}:G${rowIndex}`,
            });

            return true;
        } catch (error) {
            console.error('Error deleting contract:', error);
            return false;
        }
    },

    // --- SCHEDULE MANAGEMENT ---

    getSchedules: async (): Promise<Schedule[]> => {
        try {
            if (!process.env.GOOGLE_SHEET_ID) return [];
            const client = await getAuthClient();
            const sheets = google.sheets({ version: 'v4', auth: client });

            const response = await sheets.spreadsheets.values.get({
                spreadsheetId: process.env.GOOGLE_SHEET_ID,
                range: 'LichCT!A2:L',
            });

            const rows = response.data.values;
            if (!rows) return [];

            return rows
                .filter(row => row[0])
                .map((row) => ({
                    id: row[0] || '',
                    unit: row[1] || '',
                    deviceName: row[2] || '',
                    startTime: row[3] || '',
                    startDate: row[4] || '',
                    endTime: row[5] || '',
                    endDate: row[6] || '',
                    target: row[7] || '',
                    content: row[8] || '',
                    type: row[9] || '',
                    voltage: row[10] || '',
                    contractId: row[11] || '',
                    isCustomReport: String(row[12]).trim().toUpperCase() === 'TRUE',
                }));
        } catch (error) {
            console.error('Error fetching schedules:', error);
            // Return empty array for error so app doesn't break
            return [];
        }
    },

    findScheduleRowIndex: async (id: string): Promise<number | null> => {
        try {
            if (!process.env.GOOGLE_SHEET_ID) return null;
            const client = await getAuthClient();
            const sheets = google.sheets({ version: 'v4', auth: client });

            const response = await sheets.spreadsheets.values.get({
                spreadsheetId: process.env.GOOGLE_SHEET_ID,
                range: 'LichCT!A:A',
            });

            const rows = response.data.values;
            if (!rows) return null;

            const index = rows.findIndex((row) => row[0] === id);
            return index !== -1 ? index + 1 : null;
        } catch (error) {
            console.error('Error finding schedule row:', error);
            return null;
        }
    },

    addSchedule: async (schedule: any): Promise<boolean> => {
        try {
            if (!process.env.GOOGLE_SHEET_ID) return false;
            const client = await getAuthClient();
            const sheets = google.sheets({ version: 'v4', auth: client });

            const values = [
                [
                    schedule.id,
                    schedule.unit,
                    schedule.deviceName,
                    schedule.startTime,
                    schedule.startDate,
                    schedule.endTime,
                    schedule.endDate,
                    schedule.target,
                    schedule.content,
                    schedule.type,
                    schedule.voltage,
                    schedule.contractId || '',
                    schedule.isCustomReport ? 'TRUE' : 'FALSE',
                ],
            ];

            await sheets.spreadsheets.values.append({
                spreadsheetId: process.env.GOOGLE_SHEET_ID,
                range: 'LichCT!A:M',
                valueInputOption: 'USER_ENTERED',
                requestBody: { values },
            });

            return true;
        } catch (error) {
            console.error('Error adding schedule:', error);
            return false;
        }
    },

    updateSchedule: async (id: string, schedule: any): Promise<boolean> => {
        try {
            if (!process.env.GOOGLE_SHEET_ID) return false;
            const rowIndex = await googleSheetsService.findScheduleRowIndex(id);
            if (!rowIndex) return false;

            const client = await getAuthClient();
            const sheets = google.sheets({ version: 'v4', auth: client });

            const values = [
                [
                    id,
                    schedule.unit,
                    schedule.deviceName,
                    schedule.startTime,
                    schedule.startDate,
                    schedule.endTime,
                    schedule.endDate,
                    schedule.target,
                    schedule.content,
                    schedule.type,
                    schedule.voltage,
                    schedule.contractId || '',
                    schedule.isCustomReport ? 'TRUE' : 'FALSE',
                ],
            ];

            await sheets.spreadsheets.values.update({
                spreadsheetId: process.env.GOOGLE_SHEET_ID,
                range: `LichCT!A${rowIndex}:M${rowIndex}`,
                valueInputOption: 'USER_ENTERED',
                requestBody: { values },
            });

            return true;
        } catch (error) {
            console.error('Error updating schedule:', error);
            return false;
        }
    },

    deleteSchedule: async (id: string): Promise<boolean> => {
        try {
            if (!process.env.GOOGLE_SHEET_ID) return false;
            const rowIndex = await googleSheetsService.findScheduleRowIndex(id);
            if (!rowIndex) return false;

            const client = await getAuthClient();
            const sheets = google.sheets({ version: 'v4', auth: client });

            await sheets.spreadsheets.values.clear({
                spreadsheetId: process.env.GOOGLE_SHEET_ID,
                range: `LichCT!A${rowIndex}:L${rowIndex}`,
            });

            return true;
        } catch (error) {
            console.error('Error deleting schedule:', error);
            return false;
        }
    },

    // --- WORK OUTLINE MANAGEMENT ---

    getWorkOutlines: async (): Promise<any[]> => {
        try {
            if (!process.env.GOOGLE_SHEET_ID) return [];
            const client = await getAuthClient();
            const sheets = google.sheets({ version: 'v4', auth: client });

            const response = await sheets.spreadsheets.values.get({
                spreadsheetId: process.env.GOOGLE_SHEET_ID,
                range: 'DeCuongCongTac!A2:L',
            });

            const rows = response.data.values;
            if (!rows) return [];

            return rows
                .filter(row => row[0])
                .map((row) => ({
                    id: row[0] || '',
                    scheduleId: row[1] || '',
                    startDate: row[2] || '',
                    startTime: row[3] || '',
                    endDate: row[4] || '',
                    endTime: row[5] || '',
                    personnelAssignments: row[6] ? JSON.parse(row[6]) : [],
                    vehicleIds: row[7] ? JSON.parse(row[7]) : [],
                    isCustom: row[8] === 'TRUE' || row[8] === 'true',
                    customContractId: row[9] || '',
                    customContractName: row[10] || '',
                    customContent: row[11] || '',
                }));
        } catch (error) {
            console.error('Error fetching work outlines:', error);
            return [];
        }
    },

    findWorkOutlineRowIndex: async (id: string): Promise<number | null> => {
        try {
            if (!process.env.GOOGLE_SHEET_ID) return null;
            const client = await getAuthClient();
            const sheets = google.sheets({ version: 'v4', auth: client });

            const response = await sheets.spreadsheets.values.get({
                spreadsheetId: process.env.GOOGLE_SHEET_ID,
                range: 'DeCuongCongTac!A:A',
            });

            const rows = response.data.values;
            if (!rows) return null;

            const index = rows.findIndex((row) => row[0] === id);
            return index !== -1 ? index + 1 : null;
        } catch (error) {
            console.error('Error finding work outline row:', error);
            return null;
        }
    },

    addWorkOutline: async (workOutline: any): Promise<boolean> => {
        try {
            if (!process.env.GOOGLE_SHEET_ID) return false;
            const client = await getAuthClient();
            const sheets = google.sheets({ version: 'v4', auth: client });

            const values = [
                [
                    workOutline.id,
                    workOutline.scheduleId,
                    workOutline.startDate,
                    workOutline.startTime,
                    workOutline.endDate,
                    workOutline.endTime,
                    JSON.stringify(workOutline.personnelAssignments || []),
                    JSON.stringify(workOutline.vehicleIds || []),
                    workOutline.isCustom ? 'TRUE' : 'FALSE',
                    workOutline.customContractId || '',
                    workOutline.customContractName || '',
                    workOutline.customContent || '',
                ],
            ];

            await sheets.spreadsheets.values.append({
                spreadsheetId: process.env.GOOGLE_SHEET_ID,
                range: 'DeCuongCongTac!A:L',
                valueInputOption: 'USER_ENTERED',
                requestBody: { values },
            });

            return true;
        } catch (error) {
            console.error('Error adding work outline:', error);
            return false;
        }
    },

    updateWorkOutline: async (id: string, workOutline: any): Promise<boolean> => {
        try {
            if (!process.env.GOOGLE_SHEET_ID) return false;
            const rowIndex = await googleSheetsService.findWorkOutlineRowIndex(id);
            if (!rowIndex) return false;

            const client = await getAuthClient();
            const sheets = google.sheets({ version: 'v4', auth: client });

            const values = [
                [
                    id,
                    workOutline.scheduleId,
                    workOutline.startDate,
                    workOutline.startTime,
                    workOutline.endDate,
                    workOutline.endTime,
                    JSON.stringify(workOutline.personnelAssignments || []),
                    JSON.stringify(workOutline.vehicleIds || []),
                    workOutline.isCustom ? 'TRUE' : 'FALSE',
                    workOutline.customContractId || '',
                    workOutline.customContractName || '',
                    workOutline.customContent || '',
                ],
            ];

            await sheets.spreadsheets.values.update({
                spreadsheetId: process.env.GOOGLE_SHEET_ID,
                range: `DeCuongCongTac!A${rowIndex}:L${rowIndex}`,
                valueInputOption: 'USER_ENTERED',
                requestBody: { values },
            });

            return true;
        } catch (error) {
            console.error('Error updating work outline:', error);
            return false;
        }
    },

    deleteWorkOutline: async (id: string): Promise<boolean> => {
        try {
            if (!process.env.GOOGLE_SHEET_ID) return false;
            const rowIndex = await googleSheetsService.findWorkOutlineRowIndex(id);
            if (!rowIndex) return false;

            const client = await getAuthClient();
            const sheets = google.sheets({ version: 'v4', auth: client });

            await sheets.spreadsheets.values.clear({
                spreadsheetId: process.env.GOOGLE_SHEET_ID,
                range: `DeCuongCongTac!A${rowIndex}:L${rowIndex}`,
            });

            return true;
        } catch (error) {
            console.error('Error deleting work outline:', error);
            return false;
        }
    },

    // --- SUPPLEMENTAL REPORTS (BC_BoSung) ---
    getSupplementalReports: async (): Promise<any[]> => {
        try {
            if (!process.env.GOOGLE_SHEET_ID) return [];
            const client = await getAuthClient();
            const sheets = google.sheets({ version: 'v4', auth: client });

            const response = await sheets.spreadsheets.values.get({
                spreadsheetId: process.env.GOOGLE_SHEET_ID,
                range: 'BC_BoSung!A2:G',
            });

            const rows = response.data.values;
            if (!rows || rows.length === 0) return [];

            return rows
                .filter(row => row[0]) // Filter empty ID rows
                .map(row => ({
                    id: row[0],
                    reportType: row[1] || '',
                    referenceId: row[2] || '',
                    startDate: row[3] || '',
                    endDate: row[4] || '',
                    unit: row[5] || '',
                    content: row[6] || ''
                }));
        } catch (error) {
            console.error('Error fetching supplemental reports:', error);
            return [];
        }
    },

    addSupplementalReport: async (report: any): Promise<boolean> => {
        try {
            if (!process.env.GOOGLE_SHEET_ID) return false;
            const client = await getAuthClient();
            const sheets = google.sheets({ version: 'v4', auth: client });

            const values = [
                [
                    report.id,
                    report.reportType || '',
                    report.referenceId || '',
                    report.startDate || '',
                    report.endDate || '',
                    report.unit || '',
                    report.content || ''
                ],
            ];

            await sheets.spreadsheets.values.append({
                spreadsheetId: process.env.GOOGLE_SHEET_ID,
                range: 'BC_BoSung!A:G',
                valueInputOption: 'USER_ENTERED',
                requestBody: { values },
            });

            return true;
        } catch (error) {
            console.error('Error adding supplemental report:', error);
            return false;
        }
    },
};
