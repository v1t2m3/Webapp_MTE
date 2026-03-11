import { Metadata } from "next"
import { LoginForm } from "@/components/auth/login-form"

export const dynamic = 'force-dynamic';
export const revalidate = 0;


export const metadata: Metadata = {
    title: "Đăng nhập | MTE-LAB",
    description: "Đăng nhập vào hệ thống quản lý phòng thí nghiệm CPSC-MTE",
}

export default function LoginPage() {
    return (
        <div className="min-h-screen grid lg:grid-cols-2 relative h-full">
            {/* Cột trái: Form Đăng nhập */}
            <div className="flex flex-col justify-top items-center px-4 py-12 sm:px-8 lg:flex-none lg:px-20 xl:px-24 bg-white dark:bg-slate-950 z-10 relative">
                <div className="w-full max-w-[400px]">
                    <LoginForm />
                </div>
            </div>

            {/* Cột phải: Aesthetic Banner */}
            <div className="hidden lg:block relative w-full h-full bg-[#3a0ca3] overflow-hidden">
                {/* Background decorative elements */}
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-400 via-[#3a0ca3] to-[#7209b7]"></div>
                <div className="absolute top-0 left-0 right-0 h-full bg-[url('/images/grid-pattern.svg')] opacity-10 bg-repeat"></div>

                {/* Glowing Orbs */}
                <div className="absolute -top-[20%] -right-[10%] w-[70%] h-[70%] rounded-full bg-cyan-400/30 blur-[120px]"></div>
                <div className="absolute bottom-[10%] -left-[20%] w-[60%] h-[60%] rounded-full bg-[#f72585]/20 blur-[100px]"></div>

                <div className="absolute inset-0 flex flex-col justify-center items-center text-white p-12 text-center z-10">
                    <h2 className="text-5xl font-extrabold tracking-tight mb-6 drop-shadow-lg">
                        MTE<span className="text-[#4cc9f0]">-LAB</span>
                    </h2>
                    <p className="text-xl text-blue-100/90 font-medium max-w-lg leading-relaxed drop-shadow-md">
                        Trang quản lý Phòng Thử nghiệm theo tiêu chuẩn ISO
                    </p>

                    <div className="mt-12 flex items-center justify-center space-x-6 bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 shadow-2xl">
                        <div className="flex flex-col items-center">
                            <span className="text-2xl font-bold text-white shadow-sm mb-1">9001 : 2015</span>
                            <span className="text-xs uppercase tracking-widest text-blue-200">ISO</span>
                        </div>
                        <div className="w-px h-12 bg-white/20"></div>
                        <div className="flex flex-col items-center">
                            <span className="text-2xl font-bold text-[#4cc9f0] shadow-sm mb-1">17025 : 2017</span>
                            <span className="text-xs uppercase tracking-widest text-blue-200">ISO</span>
                        </div>
                        <div className="w-px h-12 bg-white/20"></div>
                        <div className="flex flex-col items-center">
                            <span className="text-2xl font-bold text-[#f72585] shadow-sm mb-1">VALAS 019</span>
                            <span className="text-xs uppercase tracking-widest text-blue-200">2023-2028</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
