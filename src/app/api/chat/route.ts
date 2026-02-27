import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { streamText } from 'ai';
import { z } from 'zod';
import { dataService } from "@/lib/data-service";
import { Personnel, Vehicle, Contract, Schedule, ReportData } from '@/types';

export async function POST(req: Request) {
    try {
        const { messages } = await req.json();

        // fetchAllData does not exist as a single export, so we fetch sequentially inside the tool
        const customGoogle = createGoogleGenerativeAI({
            apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY,
        });

        const result = await streamText({
            model: customGoogle('gemini-2.5-flash'),
            system: `Bạn là trợ lý AI tên MTE cho phần mềm Quản lý Nguồn lực & Lịch trình.
      Bạn BẮT BUỘC PHẢI LUÔN LUÔN TRẢ LỜI BẰNG TIẾNG VIỆT trong mọi hoàn cảnh.
      Hãy trả lời ngắn gọn, lịch sự và súc tích.`,
            messages,
            maxSteps: 5,
            tools: {
                getSystemData: {
                    description: 'Lấy toàn bộ dữ liệu cấu hình của hệ thống bao gồm số lượng Nhân sự, Xe/Thiết bị, Hợp đồng và Lịch trình.',
                    parameters: z.object({}),
                    execute: async () => {
                        console.log("TOOL CALL: getSystemData");
                        try {
                            const [personnels, vehicles, contracts, schedules] = await Promise.all([
                                dataService.getPersonnel(),
                                dataService.getVehicles(),
                                dataService.getContracts(),
                                dataService.getSchedules()
                            ]);

                            return {
                                success: true,
                                data: {
                                    personnelCount: personnels.length,
                                    vehicleCount: vehicles.length,
                                    contractCount: contracts.length,
                                    scheduleCount: schedules.length,
                                    summary: `Hệ thống hiện có ${personnels.length} nhân sự, ${vehicles.length} xe/thiết bị, và ${contracts.length} hợp đồng quản lý.`
                                }
                            };
                        } catch (error: any) {
                            return { success: false, error: error.message };
                        }
                    }
                },
                getPersonnelList: {
                    description: 'Tra cứu danh sách chi tiết các nhân sự trong hệ thống.',
                    parameters: z.object({}),
                    execute: async () => {
                        console.log("TOOL CALL: getPersonnelList");
                        const personnels = await dataService.getPersonnel();
                        return { results: personnels };
                    }
                },
                navigateToPage: {
                    description: 'Điều hướng người dùng đến một trang cụ thể trong ứng dụng. Các đường dẫn hợp lệ DUY NHẤT là: / (Tổng quan), /nguon-luc (Tổng hợp danh sách), /nhan-su (Quản lý Nhân sự), /xe-thiet-bi (Quản lý Xe máy & Thiết bị), /hop-dong (Hợp đồng), /cong-viec (Công việc/Lịch trình), /de-cuong (Đề cương).',
                    parameters: z.object({
                        path: z.string().describe('Đường dẫn URL đích CHÍNH XÁC (ví dụ: /xe-thiet-bi)')
                    }),
                    // This is a client-side tool, no execute block here.
                }
            }
        });

        return result.toDataStreamResponse();
    } catch (error: any) {
        console.error("Chat API Error:", error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
