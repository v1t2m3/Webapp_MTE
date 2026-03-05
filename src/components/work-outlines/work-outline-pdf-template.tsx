import React, { forwardRef } from 'react';
import { WorkOutline, Personnel, Vehicle, Schedule, Contract } from '@/types';
import { format, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';

interface WorkOutlinePdfTemplateProps {
    workOutline: WorkOutline | null;
    personnel: Personnel[];
    vehicles: Vehicle[];
    schedules: Schedule[];
    contracts: Contract[];
}

export const WorkOutlinePdfTemplate = forwardRef<HTMLDivElement, WorkOutlinePdfTemplateProps>(
    ({ workOutline, personnel, vehicles, schedules, contracts }, ref) => {
        if (!workOutline) return null;

        const schedule = schedules.find(s => s.id === workOutline.scheduleId);

        let contentText = "";
        let deviceName = "";

        if (workOutline.isCustom) {
            contentText = workOutline.customContent || "";
        } else if (schedule) {
            contentText = schedule.content;
            deviceName = schedule.deviceName;
        }

        // Helper function to format date
        const formatDate = (dateString?: string) => {
            if (!dateString) return "...";
            try {
                return format(parseISO(dateString), "dd/MM/yyyy");
            } catch (e) {
                return dateString;
            }
        };

        // Get unique sorted roles
        const sortedPersonnelAssignments = [...(workOutline.personnelAssignments || [])].sort((a, b) => {
            const roleOrder: Record<string, number> = {
                "CHTT - Chỉ huy trực tiếp": 1,
                "LĐCV - Lãnh đạo công việc": 2,
                "GSAT - Giám sát an toàn": 3,
                "NVCT - Nhân viên công tác": 4
            };
            const getOrder = (role: string) => {
                for (const key in roleOrder) {
                    if (role && role.includes(key.split(" - ")[0])) return roleOrder[key];
                }
                return 99;
            };
            return getOrder(a.role || "") - getOrder(b.role || "");
        });

        // Current Date
        const today = new Date();
        const dateStr = `Đà Nẵng, ngày ${format(today, 'dd', { locale: vi })} tháng ${format(today, 'MM', { locale: vi })} năm ${format(today, 'yyyy', { locale: vi })}`;

        return (
            <div className="hidden">
                <div
                    ref={ref}
                    className="preview-padding bg-white text-black font-['Times_New_Roman'] leading-relaxed"
                    style={{
                        boxSizing: 'border-box',
                        fontSize: '13pt', // Default content size
                    }}
                >
                    {/* Header */}
                    <div className="flex justify-between items-start mb-6">
                        <div className="text-center">
                            <p className="m-0 uppercase" style={{ fontSize: '12pt' }}>XÍ NGHIỆP SỬA CHỮA-THÍ NGHIỆM</p>
                            <p className="m-0 border-b border-black inline-block pb-0.5 uppercase font-bold" style={{ fontSize: '13pt' }}>PX THÍ NGHIỆM-SỬA CHỮA</p>
                        </div>
                        <div className="text-center font-bold">
                            <p className="m-0 uppercase" style={{ fontSize: '12pt' }}>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</p>
                            <p className="m-0 border-b border-black inline-block pb-0.5" style={{ fontSize: '13pt' }}>Độc lập - Tự do - Hạnh phúc</p>
                            <p className="m-0 mt-2 font-normal text-right pr-4 italic" style={{ fontSize: '12pt' }}>
                                {dateStr}
                            </p>
                        </div>
                    </div>
                    <div style={{ margin: '0mm 0mm 0mm 5mm' }}>
                        {/* Title */}
                        <h1 className="text-center font-bold mt-4 mb-4 uppercase" style={{ fontSize: '14pt' }}>
                            ĐỀ CƯƠNG CÔNG TÁC
                        </h1>

                        <div className="mb-4 text-center" style={{ fontSize: '14pt' }}>
                            <span className="font-bold">Kính gửi:</span> Lãnh đạo Xí nghiệp Sửa chữa - Thí nghiệm
                        </div>

                        <div className="mb-4 text-justify" style={{ textIndent: '12.7mm' }}>
                            Thực hiện theo sự phân công của Lãnh đạo Xí nghiệp, Phân xưởng Thí nghiệm - Sửa chữa kính đề nghị
                            Lãnh đạo Xí nghiệp phê duyệt đề cương công tác như sau:
                        </div>
                        {/* I. Content */}
                        <div className="mb-2">
                            <div className="font-bold mb-1" style={{ textIndent: '12.7mm' }}>I. Nội dung công việc:</div>
                            <div className="text-justify" style={{ textIndent: '12.7mm' }}>
                                - {contentText} {deviceName}
                            </div>

                            {/* Contract Reference if available */}
                            {workOutline.isCustom && workOutline.customContractId && (
                                <div className="mt-2 text-justify italic" style={{ textIndent: '12.7mm' }}>
                                    (Căn cứ {workOutline.customContractName})
                                </div>
                            )}
                            {!workOutline.isCustom && schedule?.contractId && (
                                <div className="mt-2 text-justify italic" style={{ textIndent: '12.7mm' }}>
                                    (Căn cứ {contracts.find(c => c.id === schedule.contractId)?.name || "..."})
                                </div>
                            )}
                        </div>
                        {/* II. Personnel */}
                        <div className="mb-2">
                            <div className="font-bold mb-1" style={{ textIndent: '12.7mm' }}>II. Thành phần đoàn công tác:</div>
                            <div style={{ marginLeft: '9mm' }}>
                                {sortedPersonnelAssignments.length > 0 ? (
                                    <table className="w-full border-collapse border-none">
                                        <tbody>
                                            {sortedPersonnelAssignments.map((pa, index) => {
                                                const person = personnel.find(p => p.id === pa.personnelId);
                                                // Dynamic department: prefer section, then department, fallback to PXTNSC
                                                const department = person?.section || person?.department || "Công ty";

                                                // Format role (e.g., "CHTT - Chỉ huy trực tiếp" -> "CHTT")
                                                const shortRole = pa.role ? pa.role.split(" - ")[0] : "";
                                                let personName = person?.fullName || "...";
                                                let roleDisplay = `- ${department}${shortRole ? ` - ${shortRole}` : ''}`;

                                                if (person?.job === "Lái xe") {
                                                    roleDisplay = `- ${department} - Lái xe`;
                                                }

                                                if (pa.personnelId === "CUSTOM") {
                                                    personName = pa.customName || "...";
                                                    roleDisplay = `- ${department}${shortRole ? ` - ${shortRole}` : ''}`;
                                                }

                                                // Determine Custom Time if it differs from the general schedule
                                                let customTimeDisplay = "";
                                                const hasCustomTime = pa.startDate && pa.endDate &&
                                                    (pa.startDate !== workOutline.startDate ||
                                                        pa.endDate !== workOutline.endDate);
                                                if (hasCustomTime && pa.startDate && pa.endDate) {
                                                    try {
                                                        const sd = parseISO(pa.startDate);
                                                        const ed = parseISO(pa.endDate);
                                                        const sDay = format(sd, 'dd');
                                                        const sMon = format(sd, 'MM');
                                                        const eDay = format(ed, 'dd');
                                                        const eMon = format(ed, 'MM');
                                                        const eYear = format(ed, 'yy');
                                                        if (sMon === eMon && sDay !== eDay) {
                                                            // Same month: "03-06/03/26"
                                                            customTimeDisplay = `(${sDay}-${eDay}/${eMon}/${eYear})`;
                                                        } else {
                                                            if (sDay === eDay && sMon === eMon) {
                                                                // Same date: "04/03/26"
                                                                customTimeDisplay = `(${eDay}/${eMon}/${eYear})`;
                                                            }
                                                            else {
                                                                // Different month: "28/02-03/03/26"
                                                                customTimeDisplay = `(${sDay}/${sMon}-${eDay}/${eMon}/${eYear})`;
                                                            }
                                                        }
                                                    } catch {
                                                        customTimeDisplay = `(${formatDate(pa.startDate)}-${formatDate(pa.endDate)})`;
                                                    }
                                                }

                                                return (
                                                    <tr key={index}>
                                                        <td className="w-8 align-top pl-4">{index + 1}.</td>
                                                        <td className="w-[35%] align-top">{personName}</td>
                                                        <td className="w-[30%] align-top">{roleDisplay}</td>
                                                        <td className="w-[35%] align-top italic">{customTimeDisplay}</td>
                                                    </tr>
                                                );
                                            })}
                                            {/* Extra driver row implicitly from assigned vehicles? No, usually handled in Personnel */}
                                        </tbody>
                                    </table>
                                ) : (
                                    <div>- (Chưa phân công nhân sự)</div>
                                )}
                            </div>
                        </div>
                        {/* III. Time */}
                        <div className="mb-2">
                            <div className="font-bold mb-1" style={{ textIndent: '12.7mm' }}>III. Thời gian công tác:</div>
                            <div style={{ textIndent: '12.7mm' }}>
                                Từ ngày {formatDate(workOutline.startDate)} đến hết ngày {formatDate(workOutline.endDate)}
                            </div>
                        </div>

                        {/* IV. Vehicles */}
                        <div className="mb-2">
                            <div className="font-bold inline" style={{ textIndent: '12.7mm', display: 'inline-block' }}>IV. Phương tiện đi lại: </div>
                            <div style={{ textIndent: '12.7mm' }}>
                                {(() => {
                                    if (!workOutline.vehicleAssignments || workOutline.vehicleAssignments.length === 0) {
                                        return " Tự túc.";
                                    }

                                    const xiNghiep: string[] = [];
                                    const congTy: string[] = [];
                                    const thueNgoai: string[] = [];

                                    workOutline.vehicleAssignments.forEach(va => {
                                        let vName = "";
                                        let origin = "";
                                        if (va.vehicleId === "CUSTOM") {
                                            vName = va.customLicensePlate || "";
                                            origin = va.customType || "";
                                        } else {
                                            const vInfo = vehicles.find(vh => vh.id === va.vehicleId);
                                            if (vInfo) {
                                                vName = vInfo.licensePlate;
                                                origin = "Xí nghiệp";
                                            }
                                        }

                                        if (!vName) return;

                                        // Time logic
                                        let vTimeDisplay = "";
                                        const hasCustomTime = va.startDate && va.endDate &&
                                            (va.startDate !== workOutline.startDate ||
                                                va.endDate !== workOutline.endDate);

                                        if (hasCustomTime && va.startDate && va.endDate) {
                                            try {
                                                const sd = parseISO(va.startDate);
                                                const ed = parseISO(va.endDate);
                                                const sDay = format(sd, 'dd');
                                                const sMon = format(sd, 'MM');
                                                const eDay = format(ed, 'dd');
                                                const eMon = format(ed, 'MM');
                                                const eYear = format(ed, 'yy');
                                                if (sMon === eMon && sDay !== eDay) {
                                                    vTimeDisplay = `(${sDay}-${eDay}/${eMon}/${eYear})`;
                                                } else if (sDay === eDay && sMon === eMon) {
                                                    vTimeDisplay = `(${eDay}/${eMon}/${eYear})`;
                                                } else {
                                                    vTimeDisplay = `(${sDay}/${sMon}-${eDay}/${eMon}/${eYear})`;
                                                }
                                            } catch {
                                                vTimeDisplay = `(${formatDate(va.startDate)}-${formatDate(va.endDate)})`;
                                            }
                                        }

                                        const vStr = vTimeDisplay ? `${vName} ${vTimeDisplay}` : vName;

                                        if (origin === "Xí nghiệp") xiNghiep.push(vStr);
                                        else if (origin === "Công ty") congTy.push(vStr);
                                        else if (origin === "Thuê ngoài") thueNgoai.push(vStr);
                                    });

                                    const parts: string[] = [];
                                    if (xiNghiep.length > 0) parts.push(`Sử dụng xe của Xí nghiệp: ${xiNghiep.join(", ")}.`);
                                    if (congTy.length > 0) parts.push(`Sử dụng xe Công ty: ${congTy.join(", ")}.`);
                                    if (thueNgoai.length > 0) parts.push(`Sử dụng xe thuê ngoài: ${thueNgoai.join(", ")}.`);

                                    return (
                                        <>
                                            {parts.map((part, index) => (
                                                <div key={index}>
                                                    {part}
                                                    {index < parts.length - 1 && <br />}
                                                </div>
                                            ))}
                                        </>
                                    );
                                })()}
                            </div>
                        </div>

                        <div className="mb-4 text-justify" style={{ textIndent: '12.7mm' }}>
                            Kính đề nghị Lãnh đạo Xí nghiệp phê duyệt đề cương công tác để Phân xưởng và các nhân sự tham gia
                            công tác triển khai các nội dung tiếp theo.
                        </div>
                        {/* Signatures */}
                        <div className="flex justify-between text-center mt-4">
                            <div style={{ width: '33%' }}>
                                <div className="font-bold">NGƯỜI LẬP</div>
                                {/* Placeholder for Signature */}
                                <div className="font-bold mt-16">Hoàng Thị Vân</div>
                            </div>
                            <div style={{ width: '33%' }}>
                                <div className="font-bold">PX TNSC</div>
                                {/* Placeholder for Signature */}
                                <div className="font-bold mt-16">Lê Văn Việt</div>
                            </div>
                            <div style={{ width: '33%' }}>
                                <div className="font-bold">KT. GIÁM ĐỐC</div>
                                {/* Placeholder for Signature */}
                                <div className="font-bold mt-16">Nguyễn Văn Tâm</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Print Styles */}
                <style dangerouslySetInnerHTML={{
                    __html: `
                    @media print {
                        @page {
                            size: A4;
                            margin: 25mm 20mm 20mm 30mm;
                        }
                        
                        /* Unset inline/preview styles so the browser handles margins naturally without scaling */
                        .preview-padding {
                            width: auto !important;
                            min-height: auto !important;
                            padding: 0 !important;
                            margin: 0 !important;
                        }

                        * {
                            -webkit-print-color-adjust: exact !important;
                            print-color-adjust: exact !important;
                        }
                        
                        /* Create artificial top margin for pages after the first one */
                        tr, div.mb-2, div.mb-4, div.mb-6 {
                            page-break-inside: avoid;
                        }
                    }
                    
                    /* Add padding and A4 dimensions for preview on screen */
                    @media screen {
                        .preview-padding {
                            width: 210mm;
                            min-height: 297mm;
                            padding: 25mm 20mm 20mm 30mm;
                            margin: 0 auto;
                            box-shadow: 0 0 10px rgba(0,0,0,0.1);
                        }
                    }
                `}} />
            </div>
        );
    }
);

WorkOutlinePdfTemplate.displayName = 'WorkOutlinePdfTemplate';
