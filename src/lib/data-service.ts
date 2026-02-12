import { googleSheetsService } from './google-sheets';
import { mockContracts, mockPersonnel, mockSchedules, mockVehicles } from './mock-data';
import { Contract, Personnel, Schedule, Vehicle } from '@/types';

const USE_MOCK_DATA = !process.env.GOOGLE_SHEET_ID;

export const dataService = {
    getPersonnel: async (): Promise<Personnel[]> => {
        if (USE_MOCK_DATA) return mockPersonnel;
        try {
            const data = await googleSheetsService.getPersonnel();
            return data.length > 0 ? data : mockPersonnel;
        } catch (error) {
            console.error('Failed to fetch personnel', error);
            return mockPersonnel;
        }
    },

    getVehicles: async (): Promise<Vehicle[]> => {
        if (USE_MOCK_DATA) return mockVehicles;
        // Implement googleSheetsService.getVehicles() later
        return mockVehicles;
    },

    getContracts: async (): Promise<Contract[]> => {
        if (USE_MOCK_DATA) return mockContracts;
        // Implement googleSheetsService.getContracts() later
        return mockContracts;
    },

    getSchedules: async (): Promise<Schedule[]> => {
        if (USE_MOCK_DATA) return mockSchedules;
        // Implement googleSheetsService.getSchedules() later
        return mockSchedules;
    }
};
