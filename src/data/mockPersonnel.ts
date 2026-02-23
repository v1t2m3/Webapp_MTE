
export interface Personnel {
    id: string;
    fullName: string;
    birthYear: string;
    job: string;
    skillLevel: string; // Bậc nghề
    safetyLevel: string; // Bậc an toàn
    education: string; // Trình độ học vấn
    contractType: string; // Loại HĐLĐ
}

export const mockPersonnel: Personnel[] = [
    {
        id: "NV001",
        fullName: "Nguyễn Văn A",
        birthYear: "1990",
        job: "Thợ hàn",
        skillLevel: "3/7",
        safetyLevel: "3",
        education: "Cao đẳng",
        contractType: "Không xác định thời hạn",
    },
    {
        id: "NV002",
        fullName: "Trần Thị B",
        birthYear: "1995",
        job: "Kế toán",
        skillLevel: "N/A",
        safetyLevel: "2",
        education: "Đại học",
        contractType: "12 tháng",
    },
    {
        id: "NV003",
        fullName: "Lê Văn C",
        birthYear: "1988",
        job: "Lái xe",
        skillLevel: "E",
        safetyLevel: "4",
        education: "12/12",
        contractType: "Không xác định thời hạn",
    },
    {
        id: "NV004",
        fullName: "Phạm Thị D",
        birthYear: "1992",
        job: "Kỹ sư điện",
        skillLevel: "5/7",
        safetyLevel: "5",
        education: "Đại học",
        contractType: "36 tháng",
    },
    {
        id: "NV005",
        fullName: "Hoàng Văn E",
        birthYear: "1998",
        job: "Công nhân phụ trợ",
        skillLevel: "2/7",
        safetyLevel: "3",
        education: "9/12",
        contractType: "Thử việc",
    },
];
