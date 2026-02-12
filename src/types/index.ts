export type PersonnelStatus = 'Active' | 'Inactive' | 'On Leave';

export interface Personnel {
    id: string;
    name: string;
    position: string;
    department: string;
    status: PersonnelStatus;
}

export type VehicleStatus = 'Available' | 'Maintenance' | 'In Use';

export interface Vehicle {
    id: string;
    licensePlate: string;
    type: string; // e.g., 'Truck', 'Car', 'Crane'
    status: VehicleStatus;
}

export interface Contract {
    id: string;
    name: string; // "Hợp đồng A"
    client: string; // "Công ty X"
    startDate: string; // ISO Date string
    endDate: string; // ISO Date string
    description?: string;
}

export interface Schedule {
    id: string;
    date: string; // ISO Date string YYYY-MM-DD
    contractId: string;
    personnelIds: string[]; // List of Personnel IDs assigned
    vehicleIds: string[]; // List of Vehicle IDs assigned
    description?: string;
    workContent: string; // "Nội dung công việc"
}

export interface Report {
    id: string;
    date: string;
    generatedAt: string;
    content: string; // HTML or Markdown content of the report
}
