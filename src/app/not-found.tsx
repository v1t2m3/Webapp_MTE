"use client";

import Link from "next/link";
import { ArrowLeft, Home, FileQuestion } from "lucide-react";

export default function NotFound() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50 flex flex-col justify-center items-center px-4 sm:px-6 relative overflow-hidden">

            {/* Nền trang trí phía sau (Background Patterns/Gradients) */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-gradient-to-br from-blue-100/50 to-transparent blur-3xl" />
                <div className="absolute top-[60%] -right-[10%] w-[60%] h-[60%] rounded-full bg-gradient-to-tl from-indigo-100/50 to-transparent blur-3xl" />
            </div>

            <div className="max-w-2xl w-full text-center p-8 sm:p-12 bg-white/70 backdrop-blur-2xl rounded-3xl shadow-xl shadow-blue-900/5 border border-white/60 relative z-10">

                {/* Biểu tượng 404 */}
                <div className="flex justify-center mb-6 relative">
                    <div className="bg-gradient-to-b from-blue-50 to-white text-blue-600 p-5 rounded-2xl shadow-inner border border-blue-100">
                        <FileQuestion className="w-20 h-20 stroke-[1.5] animate-pulse opacity-80" />
                    </div>
                </div>

                {/* Chữ 404 Cách Điệu */}
                <h1 className="text-8xl sm:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 drop-shadow-sm mb-2 tracking-tighter">
                    404
                </h1>

                <div className="space-y-3 mb-10 mt-4">
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
                        Không tìm thấy trang yêu cầu
                    </h2>
                    <p className="text-slate-600 leading-relaxed max-w-md mx-auto text-base sm:text-lg">
                        Dường như địa chỉ anh đang truy cập không tồn tại hoặc đã bị gỡ bỏ khỏi hệ thống của <span className="font-semibold text-blue-600">MTE-LAB</span>.
                    </p>
                </div>

                {/* Các nút điều hướng */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <button
                        onClick={() => window.history.back()}
                        className="group flex items-center justify-center gap-2 w-full sm:w-auto px-7 py-3.5 bg-white text-slate-700 font-medium rounded-xl border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all duration-300 hover:shadow-sm"
                    >
                        <ArrowLeft className="w-5 h-5 text-slate-400 group-hover:-translate-x-1 group-hover:text-slate-600 transition-transform" />
                        Trở về hệ thống
                    </button>

                    <Link
                        href="/"
                        className="group flex items-center justify-center gap-2 w-full sm:w-auto px-7 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5"
                    >
                        <Home className="w-5 h-5 opacity-90 group-hover:scale-110 transition-transform" />
                        Quay lại Trang chủ
                    </Link>
                </div>

                {/* Chân trang nhỏ chuyên nghiệp */}
                <div className="mt-14 pt-6 border-t border-slate-100">
                    <div className="flex justify-center items-center gap-3 opacity-70">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">
                            Phòng thí nghiệm MTE - VALAS 019
                        </p>
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                    </div>
                </div>
            </div>
        </div>
    );
}
