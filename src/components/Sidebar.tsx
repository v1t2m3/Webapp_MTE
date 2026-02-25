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
    Shield
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { useState } from "react";

const routes = [
    {
        label: "Tổng quan",
        icon: LayoutDashboard,
        href: "/",
        color: "text-[#4cc9f0]",
    },
    {
        label: "Nguồn lực",
        icon: Database,
        href: "/nguon-luc",
        color: "text-[#7209b7]",
    },
    {
        label: "Công việc",
        icon: Briefcase,
        href: "/cong-viec",
        color: "text-[#f72585]",
    }
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <div className="flex flex-col h-full w-full bg-[#3a0ca3] bg-sidebar-pattern text-white border-r border-white/20">
            {/* Header Section - Gradient White to Transparent */}
            <div className="bg-gradient-to-b from-white via-white/40 to-transparent px-3 pt-4 pb-8">
                <Link href="/" className="block w-full">
                    <div className="flex justify-between items-start">
                        {/* EVNCPC Logo */}
                        <div className="relative h-12 w-32">
                            <Image
                                src="/images/LogoEVN_v2.png"
                                alt="EVNCPC"
                                fill
                                className="object-contain object-left"
                                unoptimized
                            />
                        </div>


                    </div>
                    <div className="mt-4 text-center">
                        <h2 className="text-[39px] font-bold text-white uppercase leading-tight tracking-wide">
                            MTE-LAB
                        </h2>
                    </div>
                </Link>
            </div>

            {/* Navigation Section */}
            <div className="flex-1 flex flex-col overflow-y-auto">
                <div className="px-3 py-2 flex-1">
                    <div className="space-y-1">
                        {routes.map((route) => (
                            <Link
                                key={route.href}
                                href={route.href}
                                className={cn(
                                    "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:bg-white/10 rounded-lg transition",
                                    pathname === route.href ? "bg-white/10 text-white shadow-sm" : "text-white/70 hover:text-white"
                                )}
                            >
                                <div className="flex items-center flex-1">
                                    <route.icon className={cn("h-5 w-5 mr-3 text-white drop-shadow-sm")} />
                                    <span className="drop-shadow-sm font-semibold">{route.label}</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* ISO Footer */}
                <div className="px-3 py-8 mt-auto border-t border-white/10">
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
            <SheetContent side="left" className="p-0 bg-[#111827] border-r-gray-800">
                <SheetTitle className="hidden">Mobile Menu</SheetTitle>
                <Sidebar />
            </SheetContent>
        </Sheet>
    );
}
