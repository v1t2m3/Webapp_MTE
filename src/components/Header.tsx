"use client";

import { MobileSidebar } from "@/components/Sidebar";
import { UserCircle, LogOut, KeyRound } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import { ChangePasswordDialog } from "@/components/auth/ChangePasswordDialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export function Header() {
    const { data: session } = useSession();
    const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
    return (
        <header className="flex items-center p-4 border-b dark:border-slate-800 h-16 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md sticky top-0 z-10 w-full">
            <MobileSidebar />
            <div className="flex w-full justify-between items-center">
                <h2 className="text-lg font-semibold ml-4 lg:ml-0">

                </h2>
                <div className="flex items-center gap-x-2">
                    <div className="text-sm font-medium hidden md:block text-slate-700 dark:text-slate-200">
                        {session?.user?.name || "Khách"}
                        {session?.user?.role && (
                            <span className="ml-2 text-xs text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full dark:bg-blue-900/40 dark:text-blue-400">
                                {session.user.role}
                            </span>
                        )}
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="rounded-full">
                                <UserCircle className="h-8 w-8 text-zinc-500 hover:text-blue-600 transition-colors" />
                                <span className="sr-only">Toggle user menu</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuLabel>Tài khoản của tôi</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-slate-500">
                                {session?.user?.email || "Chưa đăng nhập"}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => setIsPasswordDialogOpen(true)} className="cursor-pointer">
                                <KeyRound className="mr-2 h-4 w-4 text-blue-600" />
                                <span>Đổi mật khẩu</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => signOut({ callbackUrl: '/login' })} className="text-red-600 focus:bg-red-50 focus:text-red-700 cursor-pointer">
                                <LogOut className="mr-2 h-4 w-4" />
                                <span>Đăng xuất</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
            <ChangePasswordDialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen} />
        </header>
    );
}
