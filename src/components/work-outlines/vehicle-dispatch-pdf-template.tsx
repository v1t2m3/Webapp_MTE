import React, { forwardRef } from 'react';
import { WorkOutline, Schedule } from '@/types';
import { format, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';

export interface VehicleDispatchPrintData {
    workOutlineId: string;
    vehicleName: string;
    driverName: string;
    route: string;
    dispatchDate: string; // YYYY-MM-DD
}

interface VehicleDispatchPdfTemplateProps {
    printData: VehicleDispatchPrintData | null;
    workOutline: WorkOutline | null;
    schedules: Schedule[];
    currentUser?: string | null;
}

export const VehicleDispatchPdfTemplate = forwardRef<HTMLDivElement, VehicleDispatchPdfTemplateProps>(
    ({ printData, workOutline, schedules, currentUser }, ref) => {
        if (!printData || !workOutline) return null;

        const schedule = schedules.find(s => s.id === workOutline.scheduleId);

        // Construct Content string for 'Căn cứ yêu cầu'
        let contentText = "";
        let deviceName = "";

        if (workOutline.isCustom) {
            contentText = workOutline.customContent || "";
        } else if (schedule) {
            contentText = schedule.content;
            deviceName = schedule.deviceName;
        }

        const fullContent = `${contentText} ${deviceName}`.trim();

        // Parse date for signatures
        let dateObj = new Date();
        if (printData.dispatchDate) {
            try {
                dateObj = parseISO(printData.dispatchDate);
            } catch (e) {
                // fallback
            }
        }

        const dayStr = format(dateObj, 'dd', { locale: vi });
        const monthStr = format(dateObj, 'MM', { locale: vi });
        const yearStr = format(dateObj, 'yyyy', { locale: vi });

        // Component representing exactly one half of the page
        const HalfPageContent = () => (
            <div className="flex-1 px-4 py-20 h-full flex flex-col font-['Times_New_Roman'] relative" style={{ fontSize: '10pt' }}>
                {/* Header Section */}
                <div className="flex justify-between items-start mb-2 w-full">
                    <div className="text-center" style={{ width: '45%' }}>
                        <p className="m-0 uppercase leading-snug" style={{ fontSize: '10pt' }}>CÔNG TY DỊCH VỤ ĐIỆN LỰC<br />MIỀN TRUNG</p>
                        <p className="m-0 border-b border-black inline-block pb-0.5 mt-1 uppercase font-bold" style={{ fontSize: '10pt' }}>XÍ NGHIỆP SỬA CHỮA THÍ NGHIỆM</p>
                        <p className="m-0 mt-1" style={{ fontSize: '9pt' }}>Số: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; / CPSC.MTE</p>
                    </div>
                    <div className="text-center" style={{ width: '55%' }}>
                        <p className="m-0 uppercase font-bold" style={{ fontSize: '10pt' }}>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</p>
                        <p className="m-0 border-b border-black inline-block pb-0.5 font-bold mt-1" style={{ fontSize: '10pt' }}>Độc lập - Tự do - Hạnh phúc</p>
                    </div>
                </div>

                {/* Title */}
                <h1 className="text-center font-bold mb-4 mt-4 uppercase" style={{ fontSize: '12pt' }}>
                    QUYẾT ĐỊNH ĐIỀU XE
                </h1>

                {/* Request Reason */}
                <div className="text-justify mb-2 leading-relaxed">
                    Căn cứ yêu cầu: Phục vụ <span className="font-bold">Phân xưởng Thí nghiệm</span>: <span>{fullContent}</span>.
                </div>

                <h2 className="text-center font-bold mb-4 mt-4 uppercase" style={{ fontSize: '12pt' }}>
                    GIÁM ĐỐC XÍ NGHIỆP SC-TN ĐIỀU ĐỘNG
                </h2>

                {/* Details List */}
                <div className="space-y-3 ms-2 mb-4">
                    <div>Xe mang biển số : <span >{printData.vehicleName}</span></div>
                    <div>Họ và tên lái xe điều khiển: <span>{printData.driverName}</span></div>
                    <div>Lộ trình : Xí nghiệp đi <span className="font-bold">{printData.route}</span> và ngược lại</div>
                    <div>Số chỉ công tơ mét xuất phát : ..............................................................</div>
                    <div className="text-justify leading-relaxed">
                        Lái xe phải chấp hành nghiêm chỉnh luật lệ giao thông và các nội quy, quy chế của cơ quan.
                    </div>
                </div>

                {/* Footer Signatures - Stick to bottom somewhat */}
                <div className="mt-8 relative">
                    <div className="absolute right-0 top-0 text-right italic" style={{ fontSize: '10pt' }}>
                        Đà Nẵng, ngày <span>{dayStr}</span> tháng <span>{monthStr}</span> năm <span>{yearStr}</span>
                    </div>

                    <div className="flex justify-between w-full mt-8 px-4">
                        <div className="text-center">
                            <p className="font-bold mb-20">NGƯỜI VIẾT LỆNH</p>
                            <p>{currentUser || "................................"}</p>
                        </div>
                        <div className="text-center me-10">
                            <p className="font-bold mb-20">GIÁM ĐỐC</p>
                        </div>
                    </div>
                </div>
            </div>
        );

        return (
            <div className="hidden">
                <div
                    ref={ref}
                    className="preview-landscape-paper bg-white text-black vehicle-dispatch-print-container"
                >
                    {/* The Two Halves container */}
                    <div className="flex w-full h-full relative">
                        {/* Middle dash cut line for visuals (optional, but good for A4 split) */}
                        <div className="absolute left-1/2 top-[1%] bottom-[1%] border-l border-dashed border-gray-400"></div>

                        {/* Left Half */}
                        <div className="w-1/2 h-full border-r border-transparent">
                            <HalfPageContent />
                        </div>

                        {/* Right Half */}
                        <div className="w-1/2 h-full">
                            <HalfPageContent />
                        </div>
                    </div>
                </div>

                {/* Print Styles */}
                <style dangerouslySetInnerHTML={{
                    __html: `
                    @media print {
                        @page {
                            size: A4 landscape;
                            margin: 0 !important;
                        }
                        
                        .vehicle-dispatch-print-container {
                            display: flex !important;
                            width: 297mm !important;
                            height: 210mm !important;
                        }
                        
                        .preview-landscape-paper {
                            width: 100% !important;
                            height: 100% !important;
                            min-height: auto !important;
                            padding: 0 !important;
                            margin: 0 !important;
                        }

                        * {
                            -webkit-print-color-adjust: exact !important;
                            print-color-adjust: exact !important;
                        }
                    }
                    
                    @media screen {
                        .preview-landscape-paper {
                            width: 297mm;
                            height: 210mm;
                            margin: 0 auto;
                            box-shadow: 0 0 10px rgba(0,0,0,0.1);
                        }
                    }
                `}} />
            </div>
        );
    }
);

VehicleDispatchPdfTemplate.displayName = 'VehicleDispatchPdfTemplate';
