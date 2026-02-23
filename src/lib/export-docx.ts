import PizZip from 'pizzip';
import PizZipUtils from 'pizzip/utils/index.js';
import Docxtemplater from 'docxtemplater';
import { saveAs } from 'file-saver';
import { WorkOutline, Schedule, Contract, Personnel } from '@/types';

export const exportWorkOutlineDocx = async (
    outline: WorkOutline,
    schedules: Schedule[],
    contracts: Contract[],
    personnelOptions: Personnel[]
) => {
    try {
        // Fetch the template
        const response = await fetch('/Temple_DCCT.docx');
        if (!response.ok) {
            throw new Error(`Failed to fetch template: ${response.statusText}`);
        }
        const content = await response.arrayBuffer();

        // Parse Zip
        const zip = new PizZip(content as any);

        // Initialize docxtemplater
        const doc = new Docxtemplater(zip, {
            paragraphLoop: true,
            linebreaks: true,
            nullGetter(part) {
                if (!part.module) return "";
                if (part.module === "rawxml") return "";
                return "";
            }
        });

        // Prepare data mapping
        const date = new Date();

        let hopDong = outline.customContractName || '';
        let noiDung = outline.customContent || '';
        let target = '';

        if (!outline.isCustom) {
            const schedule = schedules.find(s => s.id === outline.scheduleId);
            if (schedule) {
                noiDung = schedule.content;
                target = schedule.target;
                const contract = contracts.find(c => c.id === schedule.contractId);
                if (contract) {
                    hopDong = `${contract.code} - ${contract.name}`;
                }
            }
        } else if (outline.customContractId) {
            const contract = contracts.find(c => c.id === outline.customContractId);
            if (contract) {
                hopDong = `${contract.code} - ${contract.name}`;
            }
        }

        const data: Record<string, any> = {
            dd: String(date.getDate()).padStart(2, '0'),
            mm: String(date.getMonth() + 1).padStart(2, '0'),
            yyyy: String(date.getFullYear()),
            Hop_dong: hopDong || '...',
            Noi_dung_cong_viec: noiDung || '...',
            Start_date: outline.startDate ? outline.startDate.split('-').reverse().join('/') : '...',
            End_date: outline.endDate ? outline.endDate.split('-').reverse().join('/') : '...',
            Bo_phan: personnelOptions[0]?.section || '', // Fallback, will be overwritten if person exists
        };

        // Ensure date range strings
        const outlineStart = outline.startDate;
        const outlineEnd = outline.endDate;

        // Add personnel data
        if (outline.personnelAssignments) {
            outline.personnelAssignments.forEach((assignment, index) => {
                const i = index + 1;
                const person = personnelOptions.find(p => p.id === assignment.personnelId);
                data[`Ten_Nhan_su_${i}`] = person ? person.fullName : '...';

                // For Bo_phan, the template uses a static {Bo_phan} tag.
                // Docxtemplater will replace all occurrences of {Bo_phan} with whatever is in data.Bo_phan
                // We will set Bo_phan to the first person's section, as we can't index it without modifying the template.
                if (i === 1 && person) {
                    data['Bo_phan'] = person.section || '...';
                }

                data[`Chuc_danh_${i}`] = assignment.role ? assignment.role.split(' - ')[0] : '...';

                // Format Time string
                let timeStr = '';
                if (assignment.startDate === outlineStart && assignment.endDate === outlineEnd) {
                    // Trùng lịch công tác chung thì bỏ qua ngày giờ theo format user yêu cầu
                    timeStr = '';
                } else {
                    const startStr = assignment.startDate ? assignment.startDate.split('-').reverse().join('/') : '';
                    const endStr = assignment.endDate ? assignment.endDate.split('-').reverse().join('/') : '';
                    timeStr = `${startStr}-${endStr}`;
                }

                // Handling specific tags from user template: {Sd1-Ed1/pm1}, {Sd2-Ed2/pm2}
                // {Sdn-Edn/pmn}
                data[`Sd${i}-Ed${i}/pm${i}`] = timeStr;
            });
        }

        // Render document
        doc.render(data);

        // Export Buffer
        const out = doc.getZip().generate({
            type: 'blob',
            mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        });

        // Sanitize filename to prevent OS file saving issues
        const sanitizeFilename = (name: string) => {
            return name.replace(/[/\\?%*:|"<>_]/g, '-').trim().substring(0, 100);
        };
        const safeTarget = sanitizeFilename(target || outline.id);
        const fileName = `DeCuongCongTac_${safeTarget}.docx`;

        // Save File
        saveAs(out, fileName);

    } catch (error) {
        console.error('Error generating document:', error);
        throw error;
    }
};
