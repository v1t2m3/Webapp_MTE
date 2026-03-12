import { TestTube, Construction, Clock } from "lucide-react";

export const dynamic = 'force-dynamic';

export default function ConsumablesPage() {
    return (
        <div className="flex flex-col space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight text-slate-800 dark:text-slate-200">
                    Hóa chất (Mục 6.6)
                </h2>
            </div>

            <div className="flex flex-col items-center justify-center py-20 px-6">
                <div className="relative mb-8">
                    <div className="absolute inset-0 bg-amber-500/20 dark:bg-amber-400/10 rounded-full blur-2xl scale-150" />
                    <div className="relative bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/30 dark:to-orange-900/20 p-6 rounded-2xl border border-amber-200 dark:border-amber-700/50 shadow-lg">
                        <Construction className="w-16 h-16 text-amber-600 dark:text-amber-400" />
                    </div>
                </div>

                <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-3 text-center">
                    Tính năng đang phát triển
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-center max-w-md mb-6 leading-relaxed">
                    Module quản lý <span className="font-semibold text-amber-600 dark:text-amber-400">Hóa chất & Vật tư tiêu hao</span> theo
                    yêu cầu ISO 17025 (Mục 6.6) đang được xây dựng và sẽ sớm được cập nhật.
                </p>

                <div className="flex items-center gap-2 text-sm text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800/50 px-4 py-2 rounded-full">
                    <Clock className="w-4 h-4" />
                    <span>Dự kiến ra mắt trong phiên bản tiếp theo</span>
                </div>
            </div>
        </div>
    );
}
