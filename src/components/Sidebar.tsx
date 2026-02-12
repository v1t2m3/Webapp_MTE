"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    Users,
    Truck,
    FileText,
    CalendarDays,
    FileBarChart,
    Settings,
    Menu
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";

const routes = [
    {
        label: "Tổng quan",
        icon: LayoutDashboard,
        href: "/",
        color: "text-sky-500",
    },
    {
        label: "Nhân sự",
        icon: Users,
        href: "/personnel",
        color: "text-violet-500",
    },
    {
        label: "Xe & Thiết bị",
        icon: Truck,
        href: "/vehicles",
        color: "text-pink-700",
    },
    {
        label: "Hợp đồng",
        icon: FileText,
        href: "/contracts",
        color: "text-orange-700",
    },
    {
        label: "Lịch công tác",
        icon: CalendarDays,
        href: "/schedules",
        color: "text-emerald-500",
    },
    {
        label: "Báo cáo",
        icon: FileBarChart,
        href: "/reports",
        color: "text-green-700",
    },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <div className="space-y-4 py-4 flex flex-col h-full bg-[#111827] text-white">
            <div className="px-3 py-2 flex-1">
                <Link href="/" className="flex items-center pl-3 mb-14">
                    <div className="relative w-8 h-8 mr-4">
                        {/* Logo placeholder */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-lg animate-pulse" />
                    </div>
                    <h1 className="text-2xl font-bold">
                        MTE Manager
                    </h1>
                </Link>
                <div className="space-y-1">
                    {routes.map((route) => (
                        <Link
                            key={route.href}
                            href={route.href}
                            className={cn(
                                "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-white/10 rounded-lg transition",
                                pathname === route.href ? "text-white bg-white/10" : "text-zinc-400"
                            )}
                        >
                            <div className="flex items-center flex-1">
                                <route.icon className={cn("h-5 w-5 mr-3", route.color)} />
                                {route.label}
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
            <div className="px-3 py-2">
                {/* Footer or settings could go here */}
            </div>
        </div>
    );
}

export function MobileSidebar() {
    const [open, setOpen] = useState(false);

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu />
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 bg-[#111827] border-r-gray-800">
                <Sidebar />
            </SheetContent>
        </Sheet>
    );
}
