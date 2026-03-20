"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Lock, User as UserIcon } from "lucide-react";
import Image from "next/image";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";

type LoginFormData = {
    username: string;
    passwordHash: string;
};

export function LoginForm() {
    const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>();
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const { toast } = useToast();
    const router = useRouter();

    const onSubmit = async (data: LoginFormData) => {
        setIsLoading(true);
        try {
            const res = await signIn("credentials", {
                username: data.username,
                password: data.passwordHash,
                redirect: false,
            });

            if (res?.error) {
                toast({
                    title: "Lỗi đăng nhập",
                    description: res.error,
                    variant: "destructive",
                });
            } else {
                toast({
                    title: "Thành công",
                    description: "Đăng nhập thành công, đang chuyển hướng...",
                });
                router.push("/");
                router.refresh();
            }
        } catch (error) {
            toast({
                title: "Lỗi",
                description: "Không thể kết nối máy chủ xác thực",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full flex flex-col justify-center items-center space-y-2 sm:w-[400px]">
            <div className="flex flex-col space-y-2 text-center items-center mb-8 w-full">
                <div className="relative mx-auto group">
                    <Link href="/profile/index.html" target="_blank" rel="noopener noreferrer" className="cursor-pointer block">
                        <motion.div
                            whileHover={{ scale: 1.02 }}
                            className="relative"
                        >
                            <h2 className="text-5xl font-extrabold tracking-tight mb-2 drop-shadow-lg">
                                MTE<span className="text-[#4cc9f0]">-LAB</span>
                            </h2>
                            {/* Animated Tooltip */}
                            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-[#3a0ca3] text-white text-[10px] py-1 px-3 rounded-full whitespace-nowrap shadow-xl pointer-events-none">
                                Xem Hồ sơ năng lực Digital
                            </div>
                        </motion.div>
                    </Link>
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-[#3a0ca3] dark:text-white">LOGIN</h1>
                <p className="text-sm text-[#3a0ca3]/70 dark:text-slate-400">
                    Nhập thông tin xác thực để truy cập MTE-LAB
                </p>
            </div>

            <div className="grid gap-6">
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="grid gap-5">
                        <div className="grid gap-2 relative">
                            <Label htmlFor="username">Tên đăng nhập / Email</Label>
                            <div className="relative">
                                <Input
                                    id="username"
                                    placeholder="name@evncpc.vn"
                                    type="text"
                                    autoCapitalize="none"
                                    autoComplete="username"
                                    autoCorrect="off"
                                    disabled={isLoading}
                                    className="pl-10"
                                    {...register("username", { required: "Vui lòng nhập tên đăng nhập" })}
                                />
                                <UserIcon className="absolute left-3 top-2.5 h-5 w-5 text-[#3a0ca3]" />
                            </div>
                            {errors.username && <p className="text-sm text-red-500">{errors.username.message}</p>}
                        </div>

                        <div className="grid gap-2 relative">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="passwordHash">Mật khẩu</Label>
                            </div>
                            <div className="relative">
                                <Input
                                    id="passwordHash"
                                    type={showPassword ? "text" : "password"}
                                    autoComplete="current-password"
                                    disabled={isLoading}
                                    className="pl-10 pr-10"
                                    placeholder="••••••••"
                                    {...register("passwordHash", { required: "Vui lòng nhập mật khẩu" })}
                                />
                                <Lock className="absolute left-3 top-2.5 h-5 w-5 text-[#3a0ca3]" />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                            {errors.passwordHash && <p className="text-sm text-red-500">{errors.passwordHash.message}</p>}
                        </div>

                        <Button disabled={isLoading} className="mt-2 w-full bg-[#3a0ca3] hover:bg-[#2b097a] text-white">
                            {isLoading && (
                                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            )}
                            Đăng nhập hệ thống
                        </Button>
                    </div>
                </form>
            </div>

            <p className="px-8 text-center text-sm text-[#3a0ca3]/70 dark:text-slate-400 mt-4">
                Chỉ dành cho cán bộ, nhân viên nội bộ MTE.
                <br />
                Hệ thống được xây dựng và phát triển theo tiêu chuẩn ISO.
            </p>
        </div>
    )
}
