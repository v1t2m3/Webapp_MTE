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
    profileLink?: string;
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

export type ConstructionMachineStatus = 'đang sử dụng' | 'đang hư hỏng' | 'thanh lý' | string;

export interface ConstructionMachine {
    id: string;
    name: string;
    serialNumber: string;
    location: string;
    status: ConstructionMachineStatus;
}

export interface Equipment {
    id: string;
    name: string;
    serialNumber: string;
    location: string;
    calibrationFrequency: string | number;
    lastCalibrationDate: string;
    nextCalibrationDate: string;
    calibrationAgent: string;
    status: EquipmentStatus | string;
    calibrationReportUrl?: string;
    calibrationReportPage?: string;
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

export type CapaStatus = 'Yêu cầu xử lý' | 'Đang xử lý' | 'Đang quá hạn' | 'Hoàn thành' | string;

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
    level?: string;
    linkFile?: string;
}

export type DocumentCategory = 'Tài liệu hệ thống' | 'Tài liệu kỹ thuật' | 'Tài liệu bên ngoài' | 'Tài liệu nội bộ' | 'Biểu mẫu' | string;
export type DocumentStatus = 'Đang hiệu lực' | 'Đang dự thảo' | 'Đã lỗi thời' | string;

export interface Document {
    id: string;
    docCode: string;
    docName: string;
    category: DocumentCategory;
    subCategory: string;
    version: string;
    issueDate: string;
    expiryDate: string;
    status: DocumentStatus;
    author: string;
    approver: string;
    approvalLevel: string;
    fileLink: string;
    changeReason: string;
}

export interface Contract {
    id: string;
    code: string; // Mã số hợp đồng
    name: string; // Tên hợp đồng
    value: string; // Giá trị hợp đồng
    startDate: string; // Thời hạn bắt đầu
    endDate: string; // Thời hạn kết thúc
    investorRep: string; // Đại diện chủ đầu tư
    operationsManagementUnit?: string; // ĐV QLVH
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
    personnelId: string; // 'CUSTOM' for manual entry
    customName?: string; // Tên nhân sự nhập tay
    startDate: string;
    startTime: string;
    endDate: string;
    endTime: string;
    role?: string; // Chức danh (CHTT, LĐCV, NVCT, GSAT)
}

export interface VehicleAssignment {
    vehicleId: string; // 'CUSTOM' for manual entry
    customLicensePlate?: string; // Biển số nhập tay
    customType?: string; // Loại: 'Công ty' hoặc 'Thuê ngoài'
    startDate: string;
    startTime: string;
    endDate: string;
    endTime: string;
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
    vehicleAssignments: VehicleAssignment[]; // JSON stringified in Sheet
}

export interface SupplementalReport {
    id: string;
    reportType: 'PERSONAL' | 'CONTRACT' | 'WEEKLY_MONTHLY' | 'DEPARTMENT'; // Type constraints
    referenceId: string; // Personnel ID or Contract ID, empty if Week/Month
    startDate: string;
    endDate: string;
    unit: string;
    content: string;
}

// Types for our data

export interface ReportData {
    schedules: Schedule[];
    contracts: Contract[];
    personnel: Personnel[];
    workOutlines: WorkOutline[];
    supplementalReports: SupplementalReport[]; // Add supplemental storage array
    constructionMachines?: ConstructionMachine[];
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

// ROLE-BASED ACCESS CONTROL (RBAC)
export type UserRole = 'Admin' | 'User' | 'Viewer';

export interface User {
    id: string; // Mã nhân sự hoặc UUID
    username: string; // Tên đăng nhập hoặc Email
    passwordHash?: string; // Băm mật khẩu (chỉ backend)
    role: UserRole;
    level?: 1 | 2 | 3 | 4; // Mức phân quyền dành riêng cho Role "User"
    fullName: string;
    avatarUrl?: string;
    isActive: boolean;
}
