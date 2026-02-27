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

    // ISO 17025 Fields
    authorizedMethods?: string;
    authorizedEquipments?: string;
    lastTrainingDate?: string;
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

export type EquipmentStatus = 'Active' | 'Broken' | 'Calibrating' | 'Disposed';

export interface Equipment {
    id: string;
    name: string;
    serialNumber: string;
    location: string;
    calibrationFrequency: number;
    lastCalibrationDate: string;
    nextCalibrationDate: string;
    calibrationAgent: string;
    status: EquipmentStatus | string;
}

export type ConsumableCategory = 'Hóa chất' | 'Chất chuẩn' | 'Vật tư tiêu hao' | string;
export type ConsumableStatus = 'Còn hạn' | 'Cận hạn' | 'Đã hết hạn' | string;

export interface Consumable {
    id: string;
    name: string;
    category: ConsumableCategory;
    supplier: string;
    lotNumber: string;
    receiveDate: string;
    openDate: string;
    expiryDate: string;
    quantity: number;
    unit: string;
    status: ConsumableStatus;
}

export type CapaStatus = 'Mở' | 'Đang xử lý' | 'Chờ duyệt đóng' | 'Đã đóng' | string;

export interface CAPA {
    id: string;
    issueDate: string;
    source: string;
    description: string;
    assignee: string;
    actionPlan: string;
    deadline: string;
    closeDate: string;
    status: CapaStatus;
}

export type DocumentType = 'Sổ tay' | 'Quy trình' | 'Hướng dẫn công việc' | 'Biểu mẫu' | string;
export type DocumentStatus = 'Hiệu lực' | 'Bị thay thế' | 'Hết hiệu lực' | string;

export interface Document {
    id: string;
    docName: string;
    type: DocumentType;
    version: string;
    issueDate: string;
    author: string;
    approver: string;
    fileLink: string;
    status: DocumentStatus;
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
    isCustomReport?: boolean;
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

export interface Workload {
    id: string;
    startDate: string;
    endDate: string;
    unit: string;
    content: string;
    type: string;
    isCustomReport: false | true;
    assignment?: PersonnelAssignment;
    isNewOrEditing?: boolean;
    bucket?: string;
}

export type EditableSchedule = Schedule & {
    isCustomReport?: boolean;
    isNewOrEditing?: boolean;
    bucket?: string;
};
