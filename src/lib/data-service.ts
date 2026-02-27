import { googleSheetsService } from './google-sheets';
import { mockContracts, mockPersonnel, mockSchedules, mockVehicles } from './mock-data';
import { Contract, Personnel, Schedule, Vehicle, Equipment, Consumable, CAPA, Document } from '@/types';

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

    addPersonnel: async (data: Partial<Personnel>): Promise<boolean> => {
        try {
            if (!USE_MOCK_DATA) {
                const success = await googleSheetsService.addPersonnel(data);
                if (success) return true;
            }
        } catch (e) { console.error(e); }

        // Fallback to mock
        const newId = `M${(mockPersonnel.length + 1).toString().padStart(3, '0')}`;
        mockPersonnel.push({ id: newId, name: data.name || '', position: data.position || '', department: data.department || '', status: data.status || 'Active', fullName: data.fullName || '', birthYear: data.birthYear || '', job: data.job || '', skillLevel: data.skillLevel || '', safetyLevel: data.safetyLevel || '', education: data.education || '', contractType: data.contractType || '', ...data } as Personnel);
        return true;
    },

    updatePersonnel: async (id: string, data: Partial<Personnel>): Promise<boolean> => {
        try {
            if (!USE_MOCK_DATA) {
                const success = await googleSheetsService.updatePersonnel(id, data);
                if (success) return true;
            }
        } catch (e) { console.error(e); }

        // Fallback to mock
        const index = mockPersonnel.findIndex(p => p.id === id);
        if (index !== -1) {
            mockPersonnel[index] = { ...mockPersonnel[index], ...data };
            return true;
        }
        return false;
    },

    deletePersonnel: async (id: string): Promise<boolean> => {
        try {
            if (!USE_MOCK_DATA) {
                const success = await googleSheetsService.deletePersonnel(id);
                if (success) return true;
            }
        } catch (e) { console.error(e); }

        // Fallback to mock
        const index = mockPersonnel.findIndex(p => p.id === id);
        if (index !== -1) {
            mockPersonnel.splice(index, 1);
            return true;
        }
        return false;
    },

    getVehicles: async (): Promise<Vehicle[]> => {
        if (USE_MOCK_DATA) return mockVehicles;
        try {
            const data = await googleSheetsService.getVehicles();
            return data.length > 0 ? data : mockVehicles;
        } catch (error) {
            console.error('Failed to fetch vehicles', error);
            return mockVehicles;
        }
    },

    getContracts: async (): Promise<Contract[]> => {
        if (USE_MOCK_DATA) return mockContracts;
        // Implement googleSheetsService.getContracts() later
        return mockContracts;
    },

    getSchedules: async (): Promise<Schedule[]> => {
        if (USE_MOCK_DATA) return mockSchedules;
        try {
            const data = await googleSheetsService.getSchedules();
            return data.length > 0 ? data : mockSchedules;
        } catch (error) {
            console.error('Failed to fetch schedules', error);
            return mockSchedules;
        }
    },

    getWorkOutlines: async (): Promise<unknown[]> => {
        if (USE_MOCK_DATA) return [];
        try {
            const data = await googleSheetsService.getWorkOutlines();
            return data;
        } catch (error) {
            console.error('Failed to fetch work outlines', error);
            return [];
        }
    },

    // ISO 17025
    getEquipments: async (): Promise<Equipment[]> => {
        if (USE_MOCK_DATA) return [];
        try { return await googleSheetsService.getEquipments(); } catch { return []; }
    },
    addEquipment: async (data: Partial<Equipment>): Promise<boolean> => {
        if (USE_MOCK_DATA) return true;
        try { return await googleSheetsService.addEquipment(data); } catch { return false; }
    },
    getIsoPersonnel: async (): Promise<Personnel[]> => {
        if (USE_MOCK_DATA) return [];
        try { return await googleSheetsService.getIsoPersonnel(); } catch { return []; }
    },
    addIsoPersonnel: async (data: Partial<Personnel>): Promise<boolean> => {
        if (USE_MOCK_DATA) return true;
        try { return await googleSheetsService.addIsoPersonnel(data); } catch { return false; }
    },
    getConsumables: async (): Promise<Consumable[]> => {
        if (USE_MOCK_DATA) return [];
        try { return await googleSheetsService.getConsumables(); } catch { return []; }
    },
    getCapa: async (): Promise<CAPA[]> => {
        if (USE_MOCK_DATA) return [];
        try { return await googleSheetsService.getCapa(); } catch { return []; }
    },
    getDocuments: async (): Promise<Document[]> => {
        if (USE_MOCK_DATA) return [];
        try { return await googleSheetsService.getDocuments(); } catch { return []; }
    }
};
