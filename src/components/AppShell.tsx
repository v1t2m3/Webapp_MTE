'use client';

import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { Toaster } from "@/components/ui/toaster";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, ChevronLeft } from "lucide-react";

export default function AppShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isIsoRoute = [
        '/cong-cu', '/personnel', '/equipments', '/construction-machines', '/consumables', '/capa', '/documents', '/standards', '/pd-online'
    ].some(route => pathname?.startsWith(route));

    const isBareRoute = pathname === '/login';
    const [isCollapsed, setIsCollapsed] = useState(false);

    // Auto-collapse sidebar on smaller screens (< 1280px) for optimal display
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 1280) {
                setIsCollapsed(true);
            }
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    if (isBareRoute) {
        return (
            <>
                {children}
                <Toaster />
            </>
        );
    }

    return (
        <div className={`h-full relative transition-colors duration-500 ${isIsoRoute ? "dark bg-slate-950" : "bg-gray-50/50"}`}>
            {/* Sidebar Container */}
            <div className={`fixed inset-y-0 left-0 z-50 transition-transform duration-300 ease-in-out w-72 flex flex-col ${isCollapsed ? '-translate-x-full' : 'translate-x-0'} ${isIsoRoute ? "border-r border-slate-800 bg-slate-950" : "border-r border-gray-800 bg-[#3a0ca3]"}`}>
                <Sidebar />
            </div>

            {/* Floating Toggle Button */}
            <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className={`fixed top-1/2 -translate-y-1/2 z-50 w-8 h-10 flex items-center justify-center shadow-lg transition-all duration-300 ease-in-out rounded-r-md border border-white/20 border-l-0 text-white hover:w-9 ${isCollapsed ? 'left-0' : 'left-72'} ${isIsoRoute ? 'bg-slate-900 hover:bg-slate-800 text-indigo-400 border-slate-700' : 'bg-[#3a0ca3] hover:bg-[#4a1cb3]'}`}
                title={isCollapsed ? "Mở rộng thanh bên" : "Thu gọn thanh bên"}
            >
                {isCollapsed ? <Menu className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>

            {/* Main Content Area */}
            <main className={`pb-10 transition-all duration-300 ease-in-out min-h-screen relative ${isCollapsed ? 'pl-0' : 'lg:pl-72'}`}>
                {!isIsoRoute && <div className="fixed inset-0 z-0 bg-math-grid pointer-events-none opacity-50" />}
                {isIsoRoute && <div className="fixed inset-0 z-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />}

                <div className="relative z-10">
                    <Header />
                    <div className="p-4 sm:p-6 lg:p-8 max-w-[1920px] mx-auto">
                        {children}
                    </div>
                </div>
                <Toaster />
            </main>
        </div>
    );
}
