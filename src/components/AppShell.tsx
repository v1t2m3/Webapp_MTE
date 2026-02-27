'use client';

import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { Toaster } from "@/components/ui/toaster";
import { usePathname } from "next/navigation";

export default function AppShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isIsoRoute = [
        '/cong-cu', '/personnel', '/equipments', '/consumables', '/capa', '/documents'
    ].some(route => pathname?.startsWith(route));

    return (
        <div className={`h-full relative transition-colors duration-500 ${isIsoRoute ? "dark bg-slate-950" : "bg-gray-50/50"}`}>
            <div className={`hidden h-full lg:flex lg:w-72 lg:flex-col lg:fixed lg:inset-y-0 z-50 border-r ${isIsoRoute ? "border-slate-800 bg-slate-950" : "border-gray-800 bg-[#3a0ca3]"}`}>
                <Sidebar />
            </div>
            <main className="lg:pl-72 pb-10 transition-all duration-300 min-h-screen relative">
                {!isIsoRoute && <div className="fixed inset-0 z-0 bg-math-grid pointer-events-none opacity-50" />}
                {isIsoRoute && <div className="fixed inset-0 z-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />}

                <div className="relative z-10">
                    <Header />
                    <div className="p-8 max-w-[1920px] mx-auto">
                        {children}
                    </div>
                </div>
                <Toaster />
            </main>
        </div>
    );
}
