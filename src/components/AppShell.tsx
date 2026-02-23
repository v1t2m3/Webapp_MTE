import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";

export default function AppShell({ children }: { children: React.ReactNode }) {
    return (
        <div className="h-full relative bg-gray-50/50">
            <div className="hidden h-full lg:flex lg:w-72 lg:flex-col lg:fixed lg:inset-y-0 z-50 border-r border-gray-800 bg-[#3a0ca3]">
                <Sidebar />
            </div>
            <main className="lg:pl-72 pb-10 transition-all duration-300 min-h-screen relative">
                <div className="fixed inset-0 z-0 bg-math-grid pointer-events-none" />
                <div className="relative z-10">
                    <Header />
                    <div className="p-8 max-w-[1920px] mx-auto">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
}
