export type PersonnelStatus = 'Active' | 'Inactive' | 'On Leave';

export interface Personnel {
    id: string;
    // Dashboard fields
    name: string;
    position: string;
    department: string;
    status: PersonnelStatus;
    // Personnel Page fields
    fullName: string;
    birthYear: string;
    job: string;
    skillLevel: string;
    safetyLevel: string;
    education: string;
    contractType: string;
    section?: string; // Bộ phận
    leaveType?: 'thường' | 'phép' | 'bù'; // Regular leave, Annual leave, Compensatory leave
    leaveDates?: string[]; // Array of ISO date strings for the leave days
}

export type VehicleStatus = 'Available' | 'Maintenance' | 'In Use';

export interface Vehicle {
    id: string;
    name: string;
    type: string; // e.g., 'Truck', 'Car', 'Crane'
    licensePlate: string;
    status: VehicleStatus;
    inspectionExpiry: string; // Han dang kiem
    insuranceExpiry: string; // Han bao hiem
    driverId?: string; // ID of assigned driver (Personnel)
}

export interface Contract {
    id: string;
    code: string; // Mã số hợp đồng
    name: string; // Tên hợp đồng
    value: string; // Giá trị hợp đồng
    startDate: string; // Thời hạn bắt đầu
    endDate: string; // Thời hạn kết thúc
    investorRep: string; // Đại diện chủ đầu tư
}

export interface Schedule {
    id: string;
    unit: string; // Tỉnh/Đơn vị
    deviceName: string; // Tên Đường dây/Trạm biến áp...
    startTime: string; // Giờ, phút bắt đầu
    startDate: string; // Ngày bắt đầu
    endTime: string; // Giờ, phút kết thúc
    endDate: string; // Ngày kết thúc
    target: string; // Đối tượng
    content: string; // Nội dung công tác
    type: string; // Loại hình công tác (Cắt điện / Không cắt điện)
    voltage: string; // Cấp điện áp (luu tru dang chuoi cach nhau dau phay)
    contractId: string; // Hợp đồng
}

export interface Report {
    id: string;
    date: string;
    generatedAt: string;
    content: string; // HTML or Markdown content of the report
}

export interface PersonnelAssignment {
    personnelId: string;
    startDate: string;
    startTime: string;
    endDate: string;
    endTime: string;
    role?: string; // Chức danh (CHTT, LĐCV, NVCT, GSAT)
}

export interface WorkOutline {
    id: string;
    scheduleId: string; // Will empty if isCustom is true
    isCustom?: boolean;
    customContractId?: string;
    customContractName?: string;
    customContent?: string;
    startDate: string;
    startTime: string;
    endDate: string;
    endTime: string;
    personnelAssignments: PersonnelAssignment[]; // JSON stringified in Sheet
    vehicleIds: string[]; // JSON stringified in Sheet
}

export interface SupplementalReport {
    id: string;
    reportType: 'PERSONAL' | 'CONTRACT' | 'WEEKLY_MONTHLY'; // Type constraints
    referenceId: string; // Personnel ID or Contract ID, empty if Week/Month
    startDate: string;
    endDate: string;
    unit: string;
    content: string;
}

export interface ReportData {
    schedules: Schedule[];
    contracts: Contract[];
    personnel: Personnel[];
    workOutlines: WorkOutline[];
    supplementalReports: SupplementalReport[]; // Add supplemental storage array
}
