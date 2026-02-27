import { google } from 'googleapis';
import { JWT } from 'google-auth-library';

// Types for our data
import { Contract, Personnel, Schedule, Vehicle, WorkOutline, SupplementalReport, Equipment, Consumable, CAPA, Document } from '@/types';

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
                range: 'NhanSu!A2:K', // id, fullName, birthYear, job, skillLevel, safetyLevel, education, contractType, section, leaveType, leaveDates
            });

            const rows = response.data.values;
            if (!rows) return [];

            return rows
                .filter(row => row[0]) // Filter out empty rows (cleared rows)
                .map((row) => {
                    let leaveDates: string[] = [];
                    try {
                        leaveDates = row[10] ? JSON.parse(row[10]) : [];
                    } catch {
                        leaveDates = [];
                    }

                    const today = new Date();
                    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
                    const isOnLeaveToday = leaveDates.some((d: string) => d.includes(todayStr));

                    return {
                        id: row[0],
                        // Dashboard fields
                        name: row[1],
                        position: row[3],
                        department: 'N/A',
                        status: isOnLeaveToday ? 'On Leave' : 'Active',
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

    addPersonnel: async (personnel: Partial<Personnel>): Promise<boolean> => {
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

    updatePersonnel: async (id: string, personnel: Partial<Personnel>): Promise<boolean> => {
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
                range: `NhanSu!A${rowIndex}:K${rowIndex}`,
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
                    status: row[6] || 'Available',
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

    addVehicle: async (vehicle: Partial<Vehicle>): Promise<boolean> => {
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

    updateVehicle: async (id: string, vehicle: Partial<Vehicle>): Promise<boolean> => {
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

    addContract: async (contract: Partial<Contract>): Promise<boolean> => {
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

    updateContract: async (id: string, contract: Partial<Contract>): Promise<boolean> => {
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

    addSchedule: async (schedule: Partial<Schedule>): Promise<boolean> => {
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

    updateSchedule: async (id: string, schedule: Partial<Schedule>): Promise<boolean> => {
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

    getWorkOutlines: async (): Promise<WorkOutline[]> => {
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

    addWorkOutline: async (workOutline: Partial<WorkOutline>): Promise<boolean> => {
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

    updateWorkOutline: async (id: string, workOutline: Partial<WorkOutline>): Promise<boolean> => {
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
    getSupplementalReports: async (): Promise<SupplementalReport[]> => {
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

    addSupplementalReport: async (report: Partial<SupplementalReport>): Promise<boolean> => {
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

            const rowIndex = await googleSheetsService.findSupplementalReportRowIndex(report.id as string);

            if (rowIndex) {
                await sheets.spreadsheets.values.update({
                    spreadsheetId: process.env.GOOGLE_SHEET_ID,
                    range: `BC_BoSung!A${rowIndex}:G${rowIndex}`,
                    valueInputOption: 'USER_ENTERED',
                    requestBody: { values },
                });
            } else {
                await sheets.spreadsheets.values.append({
                    spreadsheetId: process.env.GOOGLE_SHEET_ID,
                    range: 'BC_BoSung!A:G',
                    valueInputOption: 'USER_ENTERED',
                    requestBody: { values },
                });
            }

            return true;
        } catch (error) {
            console.error('Error adding supplemental report:', error);
            return false;
        }
    },

    findSupplementalReportRowIndex: async (id: string): Promise<number | null> => {
        try {
            if (!process.env.GOOGLE_SHEET_ID) return null;
            const client = await getAuthClient();
            const sheets = google.sheets({ version: 'v4', auth: client });

            const response = await sheets.spreadsheets.values.get({
                spreadsheetId: process.env.GOOGLE_SHEET_ID,
                range: 'BC_BoSung!A:A',
            });

            const rows = response.data.values;
            if (!rows) return null;

            const index = rows.findIndex((row) => row[0] === id);
            return index !== -1 ? index + 1 : null;
        } catch (error) {
            console.error('Error finding supplemental report row:', error);
            return null;
        }
    },

    deleteSupplementalReport: async (id: string): Promise<boolean> => {
        try {
            if (!process.env.GOOGLE_SHEET_ID) return false;

            const client = await getAuthClient();
            const sheets = google.sheets({ version: 'v4', auth: client });

            const response = await sheets.spreadsheets.values.get({
                spreadsheetId: process.env.GOOGLE_SHEET_ID,
                range: 'BC_BoSung!A:A',
            });

            const rows = response.data.values;
            if (!rows) return false;

            let anyDeleted = false;
            for (let i = 0; i < rows.length; i++) {
                if (rows[i][0] === id) {
                    const rowIndex = i + 1;
                    await sheets.spreadsheets.values.clear({
                        spreadsheetId: process.env.GOOGLE_SHEET_ID,
                        range: `BC_BoSung!A${rowIndex}:G${rowIndex}`,
                    });
                    anyDeleted = true;
                }
            }

            return anyDeleted;
        } catch (error) {
            console.error('Error deleting supplemental report:', error);
            return false;
        }
    },

    // --- ISO 17025 MODULES ---

    getEquipments: async (): Promise<Equipment[]> => {
        try {
            if (!process.env.GOOGLE_SHEET_ID) return [];
            const client = await getAuthClient();
            const sheets = google.sheets({ version: 'v4', auth: client });
            const response = await sheets.spreadsheets.values.get({
                spreadsheetId: process.env.GOOGLE_SHEET_ID,
                range: 'Equipments !A2:I', // Trailing space required
            });
            const rows = response.data.values;
            if (!rows) return [];
            return rows.filter(row => row[0]).map((row) => ({
                id: row[0],
                name: row[1] || '',
                serialNumber: row[2] || '',
                location: row[3] || '',
                calibrationFrequency: parseInt(row[4]) || 12,
                lastCalibrationDate: row[5] || '',
                nextCalibrationDate: row[6] || '',
                calibrationAgent: row[7] || '',
                status: row[8] || 'Active',
            }));
        } catch (error) {
            console.error('Error fetching Equipments:', error);
            return [];
        }
    },

    addEquipment: async (equipment: Partial<Equipment>): Promise<boolean> => {
        try {
            if (!process.env.GOOGLE_SHEET_ID) return false;
            const client = await getAuthClient();
            const sheets = google.sheets({ version: 'v4', auth: client });

            const values = [
                [
                    equipment.id || `EQ-${Date.now()}`,
                    equipment.name || '',
                    equipment.serialNumber || '',
                    equipment.location || '',
                    (equipment.calibrationFrequency || 12).toString(),
                    equipment.lastCalibrationDate || '',
                    equipment.nextCalibrationDate || '',
                    equipment.calibrationAgent || '',
                    equipment.status || 'Active',
                ],
            ];

            await sheets.spreadsheets.values.append({
                spreadsheetId: process.env.GOOGLE_SHEET_ID,
                range: 'Equipments !A:I',
                valueInputOption: 'USER_ENTERED',
                requestBody: { values },
            });

            return true;
        } catch (error) {
            console.error('Error adding equipment:', error);
            return false;
        }
    },

    getIsoPersonnel: async (): Promise<Personnel[]> => {
        try {
            if (!process.env.GOOGLE_SHEET_ID) return [];
            const client = await getAuthClient();
            const sheets = google.sheets({ version: 'v4', auth: client });
            const response = await sheets.spreadsheets.values.get({
                spreadsheetId: process.env.GOOGLE_SHEET_ID,
                range: 'Personel!A2:H',
            });
            const rows = response.data.values;
            if (!rows) return [];
            return rows.filter(row => row[0]).map((row) => ({
                id: row[0],
                name: row[1] || '',
                fullName: row[1] || '',
                department: row[2] || '',
                position: row[3] || '',
                job: row[3] || '',
                authorizedMethods: row[4] || '',
                authorizedEquipments: row[5] || '',
                lastTrainingDate: row[6] || '',
                status: (row[7] as 'Active' | 'Inactive' | 'On Leave') || 'Active',
                // Stub out required fields
                birthYear: '', skillLevel: '', safetyLevel: '', education: '', contractType: ''
            }));
        } catch (error) {
            console.error('Error fetching ISO Personnel:', error);
            return [];
        }
    },

    addIsoPersonnel: async (personnel: Partial<Personnel>): Promise<boolean> => {
        try {
            if (!process.env.GOOGLE_SHEET_ID) return false;
            const client = await getAuthClient();
            const sheets = google.sheets({ version: 'v4', auth: client });

            const values = [
                [
                    personnel.id || `ISO-${Date.now()}`,
                    personnel.fullName || personnel.name || '',
                    personnel.department || '',
                    personnel.job || personnel.position || '',
                    personnel.authorizedMethods || '',
                    personnel.authorizedEquipments || '',
                    personnel.lastTrainingDate || '',
                    personnel.status || 'Active',
                ],
            ];

            await sheets.spreadsheets.values.append({
                spreadsheetId: process.env.GOOGLE_SHEET_ID,
                range: 'Personel!A:H',
                valueInputOption: 'USER_ENTERED',
                requestBody: { values },
            });

            return true;
        } catch (error) {
            console.error('Error adding ISO personnel:', error);
            return false;
        }
    },

    getConsumables: async (): Promise<Consumable[]> => {
        try {
            if (!process.env.GOOGLE_SHEET_ID) return [];
            const client = await getAuthClient();
            const sheets = google.sheets({ version: 'v4', auth: client });
            const response = await sheets.spreadsheets.values.get({
                spreadsheetId: process.env.GOOGLE_SHEET_ID,
                range: 'Consumables!A2:K',
            });
            const rows = response.data.values;
            if (!rows) return [];
            return rows.filter(row => row[0]).map((row) => ({
                id: row[0],
                name: row[1] || '',
                category: row[2] || '',
                supplier: row[3] || '',
                lotNumber: row[4] || '',
                receiveDate: row[5] || '',
                openDate: row[6] || '',
                expiryDate: row[7] || '',
                quantity: parseFloat(row[8]) || 0,
                unit: row[9] || '',
                status: row[10] || 'Còn hạn',
            }));
        } catch (error) {
            console.error('Error fetching Consumables:', error);
            return [];
        }
    },

    getCapa: async (): Promise<CAPA[]> => {
        try {
            if (!process.env.GOOGLE_SHEET_ID) return [];
            const client = await getAuthClient();
            const sheets = google.sheets({ version: 'v4', auth: client });
            const response = await sheets.spreadsheets.values.get({
                spreadsheetId: process.env.GOOGLE_SHEET_ID,
                range: 'CAPA!A2:I',
            });
            const rows = response.data.values;
            if (!rows) return [];
            return rows.filter(row => row[0]).map((row) => ({
                id: row[0],
                issueDate: row[1] || '',
                source: row[2] || '',
                description: row[3] || '',
                assignee: row[4] || '',
                actionPlan: row[5] || '',
                deadline: row[6] || '',
                closeDate: row[7] || '',
                status: row[8] || 'Mở',
            }));
        } catch (error) {
            console.error('Error fetching CAPA:', error);
            return [];
        }
    },

    getDocuments: async (): Promise<Document[]> => {
        try {
            if (!process.env.GOOGLE_SHEET_ID) return [];
            const client = await getAuthClient();
            const sheets = google.sheets({ version: 'v4', auth: client });
            const response = await sheets.spreadsheets.values.get({
                spreadsheetId: process.env.GOOGLE_SHEET_ID,
                range: 'Documents!A2:I',
            });
            const rows = response.data.values;
            if (!rows) return [];
            return rows.filter(row => row[0]).map((row) => ({
                id: row[0],
                docName: row[1] || '',
                type: row[2] || '',
                version: row[3] || '',
                issueDate: row[4] || '',
                author: row[5] || '',
                approver: row[6] || '',
                fileLink: row[7] || '',
                status: row[8] || 'Hiệu lực',
            }));
        } catch (error) {
            console.error('Error fetching Documents:', error);
            return [];
        }
    },
};
