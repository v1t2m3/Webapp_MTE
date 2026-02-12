import { MobileSidebar } from "@/components/Sidebar";
import { UserCircle } from "lucide-react";

export function Header() {
    return (
        <header className="flex items-center p-4 border-b h-16 bg-white/50 backdrop-blur-md sticky top-0 z-10 w-full">
            <MobileSidebar />
            <div className="flex w-full justify-between items-center">
                <h2 className="text-lg font-semibold ml-4 md:ml-0">
                    Dashboard
                </h2>
                <div className="flex items-center gap-x-2">
                    <div className="text-sm font-medium hidden md:block">
                        Admin User
                    </div>
                    <UserCircle className="h-8 w-8 text-zinc-500" />
                </div>
            </div>
        </header>
    );
}
