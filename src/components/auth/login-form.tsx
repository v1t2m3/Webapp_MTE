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
        <div className="w-full flex flex-col justify-top space-y-2 sm:w-[400px]">
            <div className="flex flex-col space-y-2 text-center items-center mb-8 w-full">
                <div className="relative h-[200px] w-[300px] mx-auto">
                    <Image
                        src="/images/LogoCPCCPSC_bg_White.png"
                        alt="CPCCPSC"
                        fill
                        className="object-contain"
                        unoptimized
                    />
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Đăng nhập</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">
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
                                <UserIcon className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                            </div>
                            {errors.username && <p className="text-sm text-red-500">{errors.username.message}</p>}
                        </div>

                        <div className="grid gap-2 relative">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="passwordHash">Mật khẩu</Label>
                                <a href="#" className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors">
                                    Quên mật khẩu?
                                </a>
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
                                <Lock className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
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

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-slate-200 dark:border-slate-800" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white dark:bg-slate-950 px-2 text-slate-500">
                            Hoặc tiếp tục với
                        </span>
                    </div>
                </div>

                <Button variant="outline" type="button" disabled={isLoading} className="w-full">
                    EVNCPC Portal SSO
                </Button>
            </div>

            <p className="px-8 text-center text-sm text-slate-500 dark:text-slate-400 mt-4">
                Chỉ dành cho cán bộ công nhân viên nội bộ MTE.
                <br />
                Hệ thống được xây dựng và phát triển theo tiêu chuẩn ISO.
            </p>
        </div>
    );
}
