import { Contract, Personnel, Schedule, Vehicle } from "@/types";

export const mockPersonnel: Personnel[] = [
    { id: 'P001', name: 'Nguyễn Văn A', position: 'Kỹ sư', department: 'Kỹ thuật', status: 'Active', fullName: 'Nguyễn Văn A', birthYear: '1990', job: 'Kỹ sư', skillLevel: 'Chuyên gia', safetyLevel: 'Bậc 5', education: 'Đại học', contractType: 'Không thời hạn' },
    { id: 'P002', name: 'Trần Thị B', position: 'Kế toán', department: 'Tài chính', status: 'Active', fullName: 'Trần Thị B', birthYear: '1992', job: 'Kế toán', skillLevel: 'Khá', safetyLevel: 'Bậc 3', education: 'Đại học', contractType: 'Không thời hạn' },
    { id: 'P003', name: 'Lê Văn C', position: 'Lái xe', department: 'Vận hành', status: 'Active', fullName: 'Lê Văn C', birthYear: '1988', job: 'Lái xe', skillLevel: 'Giỏi', safetyLevel: 'Bậc 4', education: 'Cao đẳng', contractType: 'Không thời hạn' },
    { id: 'P004', name: 'Phạm Văn D', position: 'Công nhân', department: 'Vận hành', status: 'On Leave', fullName: 'Phạm Văn D', birthYear: '1995', job: 'Công nhân', skillLevel: 'Trung bình', safetyLevel: 'Bậc 2', education: 'Trung cấp', contractType: 'Có thời hạn', leaveType: 'phép', leaveDates: [new Date().toISOString()] },
    { id: 'P005', name: 'Hoàng Thị E', position: 'Giám sát', department: 'Kỹ thuật', status: 'Active', fullName: 'Hoàng Thị E', birthYear: '1985', job: 'Giám sát', skillLevel: 'Chuyên gia', safetyLevel: 'Bậc 5', education: 'Đại học', contractType: 'Không thời hạn' },
];

export const mockVehicles: Vehicle[] = [
    { id: 'V001', licensePlate: '29C-123.45', type: 'Xe tải 5 tấn', status: 'Available', name: 'Xe tải', inspectionExpiry: '', insuranceExpiry: '' },
    { id: 'V002', licensePlate: '29H-987.65', type: 'Xe cẩu', status: 'Maintenance', name: 'Xe cẩu', inspectionExpiry: '', insuranceExpiry: '' },
];

export const mockContracts: Contract[] = [
    { id: 'C001', name: 'Hợp đồng bảo trì trạm biến áp', investorRep: 'EVN Hà Nội', startDate: '2023-01-01', endDate: '2023-12-31', code: 'HD01', value: '1 Tỷ' },
    { id: 'C002', name: 'Xây lắp đường dây 22kV', investorRep: 'Vingroup', startDate: '2023-06-01', endDate: '2023-09-30', code: 'HD02', value: '2 Tỷ' },
];

export const mockSchedules: Schedule[] = [
    {
        id: 'S001',
        unit: 'Đơn vị 1',
        deviceName: 'Trạm 110kV',
        startTime: '08:00',
        startDate: '2023-08-16',
        endTime: '17:00',
        endDate: '2023-08-16',
        target: 'Bảo trì',
        content: 'Khảo sát hiện trường và lên phương án thay thế',
        type: 'Cắt điện',
        voltage: '110kV',
        contractId: 'C003'
    }
];
