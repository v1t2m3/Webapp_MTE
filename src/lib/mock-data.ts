import { Contract, Personnel, Schedule, Vehicle } from "@/types";

export const mockPersonnel: Personnel[] = [
    { id: 'P001', name: 'Nguyễn Văn A', position: 'Kỹ sư', department: 'Kỹ thuật', status: 'Active', fullName: 'Nguyễn Văn A', birthYear: '1990', job: 'Kỹ sư', skillLevel: 'Chuyên gia', safetyLevel: 'Bậc 5', education: 'Đại học', contractType: 'Không thời hạn' },
    { id: 'P002', name: 'Trần Thị B', position: 'Kế toán', department: 'Tài chính', status: 'Active', fullName: 'Trần Thị B', birthYear: '1992', job: 'Kế toán', skillLevel: 'Khá', safetyLevel: 'Bậc 3', education: 'Đại học', contractType: 'Không thời hạn' },
    { id: 'P003', name: 'Lê Văn C', position: 'Lái xe', department: 'Vận hành', status: 'Active', fullName: 'Lê Văn C', birthYear: '1988', job: 'Lái xe', skillLevel: 'Giỏi', safetyLevel: 'Bậc 4', education: 'Cao đẳng', contractType: 'Không thời hạn' },
    { id: 'P004', name: 'Phạm Văn D', position: 'Công nhân', department: 'Vận hành', status: 'On Leave', fullName: 'Phạm Văn D', birthYear: '1995', job: 'Công nhân', skillLevel: 'Trung bình', safetyLevel: 'Bậc 2', education: 'Trung cấp', contractType: 'Có thời hạn', leaveType: 'phép', leaveDates: [new Date().toISOString()] },
    { id: 'P005', name: 'Hoàng Thị E', position: 'Giám sát', department: 'Kỹ thuật', status: 'Active', fullName: 'Hoàng Thị E', birthYear: '1985', job: 'Giám sát', skillLevel: 'Chuyên gia', safetyLevel: 'Bậc 5', education: 'Đại học', contractType: 'Không thời hạn' },
];

export const mockVehicles: Vehicle[] = [
    { id: 'V001', licensePlate: '29C-123.45', type: 'Xe tải 5 tấn', status: 'Available' },
    { id: 'V002', licensePlate: '29H-987.65', type: 'Xe cẩu', status: 'Maintenance' },
    { id: 'V003', licensePlate: '30E-555.55', type: 'Xe bán tải', status: 'In Use' },
    { id: 'V004', licensePlate: '29A-111.22', type: 'Xe 7 chỗ', status: 'Available' },
];

export const mockContracts: Contract[] = [
    { id: 'C001', name: 'Hợp đồng bảo trì trạm biến áp', client: 'EVN Hà Nội', startDate: '2023-01-01', endDate: '2023-12-31', description: 'Bảo trì định kỳ các trạm 110kV' },
    { id: 'C002', name: 'Xây lắp đường dây 22kV', client: 'Vingroup', startDate: '2023-06-01', endDate: '2023-09-30', description: 'Kéo dây mới cho khu đô thị' },
    { id: 'C003', name: 'Sửa chữa sự cố đột xuất', client: 'KCN Thăng Long', startDate: '2023-08-15', endDate: '2023-08-20', description: 'Thay thế máy biến áp bị hỏng' },
];

export const mockSchedules: Schedule[] = [
    {
        id: 'S001',
        date: '2023-08-16',
        contractId: 'C003',
        personnelIds: ['P001', 'P003', 'P005'],
        vehicleIds: ['V002', 'V003'],
        workContent: 'Khảo sát hiện trường và lên phương án thay thế',
        description: 'Cần mang theo máy đo điện trở'
    },
    {
        id: 'S002',
        date: '2023-08-17',
        contractId: 'C001',
        personnelIds: ['P002'],
        vehicleIds: ['V004'],
        workContent: 'Kiểm kê vật tư tại kho',
        description: 'Chuẩn bị cho đợt bảo trì tháng 9'
    }
];
