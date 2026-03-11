"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    Database,
    Briefcase,
    Settings,
    Menu,
    Shield,
    ShieldAlert,
    Calculator,
    ChevronDown,
    ChevronRight,
    Search,
    TestTube,
    AlertTriangle,
    FileText as FileTextIcon,
    CalendarDays,
    ClipboardList,
    FileBarChart,
    ChevronLeft,
    User,
    Badge,
    Drill,
    ShieldCheckIcon,
    TestTubes,
    Microscope,
    Atom,
    VectorSquare,
    Notebook,
    PencilRuler
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { useState } from "react";
import { useSession } from "next-auth/react";

const routes = [
    {
        label: "TỔNG QUAN",
        icon: LayoutDashboard,
        href: "/",

    },
    {
        label: "NGUỒN LỰC",
        icon: VectorSquare,
        href: "/nguon-luc",

    },
    {
        label: "CÔNG VIỆC",
        icon: Notebook,
        href: "/cong-viec",

    },
    {
        label: "QUẢN LÝ THỬ NGHIỆM",
        icon: Atom,
        isGroup: true,
        subRoutes: [
            { label: "Công cụ Tính toán", href: "/cong-cu", icon: Calculator },
            { label: "Nhân sự (Mục 6.2)", href: "/personnel", icon: User },
            {
                label: "Thiết bị (Mục 6.4)",
                icon: PencilRuler,
                isGroup: true,
                subRoutes: [
                    { label: "Thiết bị thí nghiệm", href: "/equipments", icon: Microscope },
                    { label: "Máy thi công", href: "/construction-machines", icon: Drill }
                ]
            },
            { label: "Hóa chất (Mục 6.6)", href: "/consumables", icon: TestTube },
            { label: "CAPA (Mục 8.7)", href: "/capa", icon: ShieldCheckIcon },
            { label: "Tài liệu (Mục 8.3)", href: "/documents", icon: FileTextIcon },
        ]
    },
    {
        label: "Quản trị Hệ thống",
        icon: ShieldAlert,
        href: "/admin/users",
        color: "text-rose-400",
        adminOnly: true,
    }
];

export function Sidebar() {
    const pathname = usePathname();
    const { data: session } = useSession();
    const isAdmin = session?.user?.role === "Admin";
    const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
        "Quản lý Thử nghiệm": true
    });

    const toggleGroup = (label: string) => {
        setOpenGroups(prev => ({ ...prev, [label]: !prev[label] }));
    };

    return (
        <div className="flex flex-col h-full w-full bg-[#3a0ca3] bg-sidebar-pattern text-white border-r border-white/20 transition-all duration-300">
            {/* Header Section */}
            <div className="bg-gradient-to-b from-white via-white/40 to-transparent px-3 pt-4 pb-8 flex items-center justify-center">
                <Link href="/" className="block w-full">
                    <div className="flex items-center justify-center transition-all duration-300 mb-4">
                        {/* EVNCPC Logo */}
                        <div className="relative transition-all duration-300 h-12 w-32">
                            <Image
                                src="/images/LogoEVN_v2.png"
                                alt="EVNCPC"
                                fill
                                className="object-contain transition-all duration-300 object-left"
                                unoptimized
                            />
                        </div>
                    </div>
                    <div className="text-center overflow-hidden transition-all duration-300">
                        <h2 className="text-[39px] font-bold text-white uppercase leading-tight tracking-wide whitespace-nowrap">
                            MTE-LAB
                        </h2>
                    </div>
                </Link>
            </div>

            {/* Navigation Section */}
            <div className="flex-1 flex flex-col overflow-y-auto">
                <div className="px-3 py-2 flex-1">
                    <div className="space-y-1">
                        {routes.map((route) => {
                            // @ts-ignore
                            if (route.adminOnly && !isAdmin) return null;

                            if (route.isGroup) {
                                const isOpen = openGroups[route.label];
                                return (
                                    <div key={route.label} className="mt-4 mb-2">
                                        <button
                                            onClick={() => toggleGroup(route.label)}
                                            className="w-full flex items-center justify-between p-3 text-white/90 hover:bg-white/10 rounded-lg transition"
                                        >
                                            <div className="flex items-center">
                                                <route.icon className={cn("h-5 w-5 mr-3 drop-shadow-sm", route.color)} />
                                                <span className="font-bold text-sm uppercase tracking-wider">{route.label}</span>
                                            </div>
                                            {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                        </button>

                                        {isOpen && route.subRoutes && (
                                            <div className="mt-1 ml-4 space-y-1 border-l border-white/20 pl-4 py-2">
                                                {route.subRoutes.map((subRoute) => {
                                                    if (subRoute.isGroup) {
                                                        const isSubOpen = openGroups[subRoute.label];
                                                        return (
                                                            <div key={subRoute.label} className="mt-2 mb-1">
                                                                <button
                                                                    onClick={() => toggleGroup(subRoute.label)}
                                                                    className="w-full flex items-center justify-between p-2 text-white/90 hover:bg-white/10 rounded-lg transition"
                                                                >
                                                                    <div className="flex items-center flex-1">
                                                                        <subRoute.icon className="h-4 w-4 mr-3 text-white/80" />
                                                                        <span className="drop-shadow-sm text-sm">{subRoute.label}</span>
                                                                    </div>
                                                                    {isSubOpen ? <ChevronDown className="h-3 w-3 text-white/70" /> : <ChevronRight className="h-3 w-3 text-white/70" />}
                                                                </button>
                                                                {isSubOpen && subRoute.subRoutes && (
                                                                    <div className="mt-1 ml-2 space-y-1 border-l border-white/20 pl-4 py-1">
                                                                        {subRoute.subRoutes.map((nestedRoute) => (
                                                                            <Link
                                                                                key={nestedRoute.href}
                                                                                href={nestedRoute.href!}
                                                                                className={cn(
                                                                                    "text-sm group flex p-2 w-full justify-start font-medium cursor-pointer hover:bg-white/10 rounded-lg transition",
                                                                                    pathname === nestedRoute.href ? "bg-white/20 text-white shadow-sm" : "text-white/60 hover:text-white"
                                                                                )}
                                                                            >
                                                                                <div className="flex items-center flex-1">
                                                                                    <nestedRoute.icon className={cn("h-4 w-4 mr-3 text-white/60")} />
                                                                                    <span className="drop-shadow-sm">{nestedRoute.label}</span>
                                                                                </div>
                                                                            </Link>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    }

                                                    return (
                                                        <Link
                                                            key={subRoute.href}
                                                            href={subRoute.href!}
                                                            className={cn(
                                                                "text-sm group flex p-2 w-full justify-start font-medium cursor-pointer hover:bg-white/10 rounded-lg transition",
                                                                pathname === subRoute.href ? "bg-white/20 text-white shadow-sm" : "text-white/60 hover:text-white"
                                                            )}
                                                        >
                                                            <div className="flex items-center flex-1">
                                                                <subRoute.icon className={cn("h-4 w-4 mr-3 text-white/80")} />
                                                                <span className="drop-shadow-sm">{subRoute.label}</span>
                                                            </div>
                                                        </Link>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                );
                            }

                            return (
                                <Link
                                    key={route.href}
                                    href={route.href!}
                                    className={cn(
                                        "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:bg-white/10 rounded-lg transition",
                                        pathname === route.href ? "bg-white/10 text-white shadow-sm" : "text-white/70 hover:text-white"
                                    )}
                                >
                                    <div className="flex items-center flex-1">
                                        <route.icon className={cn("h-5 w-5 mr-3 drop-shadow-sm", route.color)} />
                                        <span className="drop-shadow-sm font-semibold">{route.label}</span>
                                    </div>
                                </Link>
                            )
                        })}
                    </div>
                </div>

                {/* ISO Footer */}
                <div className="px-3 py-6 mt-auto border-t border-white/10 transition-all duration-300">
                    <div className="flex items-start justify-between px-1">
                        <div className="relative w-[70px] h-[70px] bg-white/95 rounded-full flex items-center justify-center overflow-hidden hover:scale-105 transition-transform duration-200 shadow-lg shadow-black/20">
                            <Image
                                src="/images/Iso9001.png"
                                alt="ISO 9001:2015"
                                width={70}
                                height={70}
                                className="object-contain p-0.5"
                                unoptimized
                            />
                        </div>
                        <div className="relative w-[70px] h-[70px] flex items-center justify-center hover:scale-105 transition-transform duration-200">
                            <Image
                                src="/images/Iso17025_v2.png"
                                alt="ISO 17025:2015"
                                width={70}
                                height={70}
                                className="object-contain"
                                unoptimized
                            />
                        </div>
                        <div className="relative w-[70px] h-[70px] flex items-center justify-center hover:scale-105 transition-transform duration-200">
                            <Image
                                src="/images/vaci_valas019.png"
                                alt="VACI"
                                width={70}
                                height={70}
                                className="object-contain"
                                unoptimized
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export function MobileSidebar() {
    const [open, setOpen] = useState(false);

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                    <Menu />
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 bg-[#3a0ca3] border-r-gray-800 w-72">
                <SheetTitle className="hidden">Mobile Menu</SheetTitle>
                <div className="h-full relative pb-10">
                    <Sidebar />
                </div>
            </SheetContent>
        </Sheet>
    );
}
