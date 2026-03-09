import React, { forwardRef } from 'react';
import { Workload, Personnel } from '@/types';
import { parseISO, startOfDay, getDaysInMonth } from 'date-fns';

interface PersonalReportPdfTemplateProps {
    personnel: Personnel | null;
    workloads: Workload[];
    month: string;
    year: string;
    currentUser?: string | null;
}

export const PersonalReportPdfTemplate = forwardRef<HTMLDivElement, PersonalReportPdfTemplateProps>(
    ({ personnel, workloads, month, year, currentUser }, ref) => {
        const yearNum = parseInt(year) || new Date().getFullYear();
        const monthNum = parseInt(month) || (new Date().getMonth() + 1);
        const daysInMonth = getDaysInMonth(new Date(yearNum, monthNum - 1));

        let headerDepartment = "PHÂN XƯỞNG THÍ NGHIỆM-SỬA CHỮA";
        const personDept = personnel?.section || personnel?.department || "";
        if (personDept.toUpperCase() === "PX.TNSC") {
            headerDepartment = "PHÂN XƯỞNG THÍ NGHIỆM-SỬA CHỮA";
        } else if (personDept.toUpperCase() === "PX.XL") {
            headerDepartment = "PHÂN XƯỞNG XÂY LẮP";
        } else if (personDept.toUpperCase() === "P.TH" || personDept.toUpperCase() === "PTH") {
            headerDepartment = "PHÒNG TỔNG HỢP";
        } else if (personDept) {
            headerDepartment = personDept.toUpperCase();
        }

        const rows = Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const date = new Date(yearNum, monthNum - 1, day);
            const dayOfWeek = date.getDay();

            const dayWorkloads = workloads.filter(w => {
                if (!w.startDate) return false;
                try {
                    const startD = startOfDay(parseISO(w.startDate));
                    const endD = w.endDate ? startOfDay(parseISO(w.endDate)) : startD;
                    const current = startOfDay(date);
                    return current >= startD && current <= endD;
                } catch {
                    return false;
                }
            });

            let content = "";
            if (dayWorkloads.length > 0) {
                content = dayWorkloads.map(w => w.content).filter(Boolean).join("; ");
            } else {
                if (dayOfWeek === 0) content = "Nghỉ CN";
                else if (dayOfWeek === 6) content = "Nghỉ thứ 7";
            }

            return {
                stt: day,
                dayStr: day.toString().padStart(2, '0'),
                content
            };
        });

        const startDateStr = `01/${month.padStart(2, '0')}/${year}`;
        const endDateStr = `${daysInMonth.toString().padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;

        return (
            <div className="hidden">
                <div
                    ref={ref}
                    className="personal-report-print-container bg-white text-black font-['Times_New_Roman'] leading-tight"
                    style={{ boxSizing: 'border-box', fontSize: '12pt' }}
                >
                    {/* Header Top */}
                    <div className="flex justify-between items-start mb-6">
                        <div className="text-center">
                            <p className="m-0 uppercase" style={{ fontSize: '11pt' }}>XÍ NGHIỆP SỬA CHỮA - THÍ NGHIỆM</p>
                            <p className="m-0 uppercase font-bold border-b border-black inline-block pb-0.5" style={{ fontSize: '12pt' }}>{headerDepartment}</p>
                        </div>
                        <div className="text-center font-bold">
                            <p className="m-0 uppercase" style={{ fontSize: '11pt' }}>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</p>
                            <p className="m-0 border-b border-black inline-block pb-0.5" style={{ fontSize: '12pt' }}>Độc lập - Tự do - Hạnh phúc</p>
                        </div>
                    </div>

                    <h1 className="text-center font-bold mt-4 mb-6 uppercase" style={{ fontSize: '14pt' }}>
                        BÁO CÁO CÔNG VIỆC HÀNG THÁNG CỦA NHÂN VIÊN
                    </h1>

                    <div className="mb-4">
                        <div className="mb-1">
                            Thời gian thực hiện: Từ ngày: <span className="text-red-600">{startDateStr}</span> Đến ngày: <span className="text-red-600">{endDateStr}</span>
                        </div>
                        <div className="mb-1">
                            Họ và tên người thực hiện: <span className="text-red-600">{personnel?.fullName || personnel?.name || ""}</span>
                        </div>
                        <div className="mb-1">
                            Chức vụ hiện tại: <span className="text-red-600">{personnel?.job || "Nhân viên"}</span>
                        </div>
                        <div className="mb-1">
                            Thuộc bộ phận: <span className="text-red-600">{personDept}</span>
                        </div>
                    </div>

                    {/* Report Table */}
                    <table className="w-full border-collapse border border-black text-center mb-2" style={{ fontSize: '11pt' }}>
                        <thead>
                            <tr>
                                <th className="border border-black p-1" rowSpan={2} style={{ width: '4%' }}>STT</th>
                                <th className="border border-black p-1" rowSpan={2} style={{ width: '6%' }}>Ngày</th>
                                <th className="border border-black p-1" rowSpan={2} style={{ width: '40%' }}>Nội dung công việc thực hiện</th>
                                <th className="border border-black p-1" colSpan={7}>Kết quả</th>
                                <th className="border border-black p-1" colSpan={7}>Đánh giá chung<br />(dành cho trưởng đơn vị)</th>
                            </tr>
                            <tr>
                                {/* Result Columns */}
                                <th className="border border-black p-0.5 w-[3%] font-normal">1</th>
                                <th className="border border-black p-0.5 w-[3%] font-normal">2</th>
                                <th className="border border-black p-0.5 w-[3%] font-normal">3</th>
                                <th className="border border-black p-0.5 w-[3%] font-normal">4</th>
                                <th className="border border-black p-0.5 w-[3%] font-normal">5</th>
                                <th className="border border-black p-0.5 w-[3%] font-normal">6</th>
                                <th className="border border-black p-0.5 w-[3%] font-normal">7</th>
                                {/* Evaluation Columns */}
                                <th className="border border-black p-0.5 w-[3%] font-normal">1</th>
                                <th className="border border-black p-0.5 w-[3%] font-normal">2</th>
                                <th className="border border-black p-0.5 w-[3%] font-normal">3</th>
                                <th className="border border-black p-0.5 w-[3%] font-normal">4</th>
                                <th className="border border-black p-0.5 w-[3%] font-normal">5</th>
                                <th className="border border-black p-0.5 w-[3%] font-normal">6</th>
                                <th className="border border-black p-0.5 w-[3%] font-normal">7</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((row) => (
                                <tr key={row.stt}>
                                    <td className="border border-black p-1">{row.stt}</td>
                                    <td className="border border-black p-1 ">{row.dayStr}</td>
                                    <td className="border border-black p-1 text-left ">{row.content}</td>
                                    {/* Empty cells for 7 result + 7 evaluation cols */}
                                    <td className="border border-black p-1"></td>
                                    <td className="border border-black p-1"></td>
                                    <td className="border border-black p-1"></td>
                                    <td className="border border-black p-1"></td>
                                    <td className="border border-black p-1"></td>
                                    <td className="border border-black p-1"></td>
                                    <td className="border border-black p-1"></td>
                                    <td className="border border-black p-1"></td>
                                    <td className="border border-black p-1"></td>
                                    <td className="border border-black p-1"></td>
                                    <td className="border border-black p-1"></td>
                                    <td className="border border-black p-1"></td>
                                    <td className="border border-black p-1"></td>
                                    <td className="border border-black p-1"></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div className="mb-2">
                        Ghi chú : (dành cho trưởng đơn vị) ....................................................................................................................................
                    </div>

                    <div className="flex items-center gap-10 mb-6 font-bold">
                        <span>Xét loại:</span>
                        <div className="flex items-center gap-2">
                            <div className="w-5 h-5 border border-black"></div> Giỏi
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-5 h-5 border border-black"></div> Khá
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-5 h-5 border border-black"></div> Tr/bình
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-5 h-5 border border-black"></div> Kém
                        </div>
                    </div>

                    <div className="flex justify-between text-center mt-6">
                        <div style={{ width: '33%' }} className="font-bold">BAN GIÁM ĐỐC</div>
                        <div style={{ width: '33%' }} className="font-bold">TRƯỞNG ĐƠN VỊ</div>
                        <div style={{ width: '33%' }}>
                            <div className="font-bold">NGƯỜI BÁO CÁO</div>
                            <div className="font-bold mt-16">{currentUser || "................................"}</div>
                        </div>
                    </div>

                    <div className="mt-8 text-sm" style={{ fontSize: '11pt' }}>
                        <div className="flex">
                            <div className="w-24">Ghi chú:</div>
                            <div>
                                <div>Mức 1: không chấp nhận</div>
                                <div>Mức 2: kém</div>
                                <div>Mức 3: yếu</div>
                                <div>Mức 4: trung bình</div>
                                <div>Mức 5: khá</div>
                                <div>Mức 6: tốt</div>
                                <div>Mức 7: xuất sắc</div>
                                <div>Mục Ban Giám đốc :</div>
                                <div>Giám đốc theo dõi trực tiếp phòng tổng hợp</div>
                                <div>Hai phó Giám đốc theo dõi trực tiếp 2 phân xưởng</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Print Styles */}
                <style dangerouslySetInnerHTML={{
                    __html: `
                    @media print {
                        @page {
                            size: A4 landscape;
                            margin: 15mm;
                        }
                        
                        .personal-report-print-container {
                            display: block !important;
                            page-break-inside: auto;
                        }
                        
                        tr {
                            page-break-inside: avoid;
                            page-break-after: auto;
                        }
                        
                        thead {
                            display: table-header-group;
                        }

                        * {
                            -webkit-print-color-adjust: exact !important;
                            print-color-adjust: exact !important;
                        }
                    }
                `}} />
            </div>
        );
    }
);

PersonalReportPdfTemplate.displayName = 'PersonalReportPdfTemplate';
