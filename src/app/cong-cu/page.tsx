'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Smartphone, Globe, Apple, MonitorSmartphone, ArrowRight, Share, PlusSquare } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Badge } from "@/components/ui/badge";

export default function AppDownloadPage() {
    return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto pb-12">
            <div className="text-center space-y-4 flex flex-col items-center">
                <div className="relative w-36 h-36 mb-2 drop-shadow-xl overflow-hidden rounded-[1.8rem] border-1  border-slate-100/10 shadow-[0_0_30px_rgba(59,130,246,0.3)]">
                    <Image src="/images/cong-cu/Cal_notes_icon.png" alt="MTE-LAB Cal-Notes Icon" fill className="object-cover" />
                </div>
                <h1 className="text-4xl p-2 md:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
                    Ứng dụng MTE-LAB Cal-Notes
                </h1>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    Thay thế cho các công cụ tính toán cũ, nay chúng tôi cung cấp giải pháp toàn diện và tiện lợi hơn thông qua ứng dụng di động và nền tảng Web App PWA.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
                {/* Android Card */}
                <Card className="relative overflow-hidden border-t-4 border-t-green-500 rounded-[1.8rem] shadow-lg hover:shadow-xl transition-all duration-300 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Smartphone className="w-32 h-32" />
                    </div>
                    <CardHeader>
                        <div className="flex items-center gap-2 mb-2">
                            <Badge className="bg-green-500 hover:bg-green-600 text-white">Android</Badge>
                        </div>
                        <CardTitle className="text-2xl font-bold flex items-center gap-2">
                            Tải App Android (APK)
                        </CardTitle>
                        <CardDescription className="text-base">
                            Cài đặt trực tiếp ứng dụng lên điện thoại Android của bạn để sử dụng offline mọi lúc mọi nơi.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 relative z-10">
                        <div className="bg-green-50 dark:bg-green-950/30 p-4 rounded-xl border border-green-200 dark:border-green-900">
                            <h4 className="font-semibold text-green-800 dark:text-green-400 mb-2 flex items-center gap-2">
                                <Download className="w-4 h-4" /> Hướng dẫn cài đặt
                            </h4>
                            <ul className="space-y-2 text-sm text-green-700 dark:text-green-500/90 list-decimal list-inside">
                                <li>Nhấn nút <strong>Tải file APK</strong> bên dưới.</li>
                                <li>Mở file <code className="bg-white/50 dark:bg-black/50 px-1 rounded">MTELAB_CalNotes.apk</code> vừa tải về.</li>
                                <li>Nếu hệ thống yêu cầu, hãy chọn <strong>Cấp quyền (Cho phép) cài đặt ứng dụng từ nguồn không xác định</strong>.</li>
                                <li>Hoàn tất cài đặt và mở ứng dụng <strong>MTE Cal-Notes</strong>.</li>
                            </ul>
                        </div>
                    </CardContent>
                    <CardFooter className="relative z-10 pt-4">
                        <Button asChild size="lg" className="w-full h-14 text-lg bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-md hover:shadow-lg transition-all group">
                            <Link href="/apk/MTELAB_CalNotes.apk" target="_blank" download>
                                <Download className="mr-2 h-5 w-5 group-hover:-translate-y-1 transition-transform" />
                                Tải file APK (Android)
                            </Link>
                        </Button>
                    </CardFooter>
                </Card>

                {/* iOS & Desktop Card */}
                <Card className="relative overflow-hidden border-t-4 border-t-blue-500 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Globe className="w-32 h-32" />
                    </div>
                    <CardHeader>
                        <div className="flex items-center gap-2 mb-2">
                            <Badge className="bg-blue-500 hover:bg-blue-600 text-white"><Apple className="w-3 h-3 mr-1" /> iOS</Badge>
                            <Badge variant="outline" className="border-blue-200 text-blue-600 dark:border-blue-800 dark:text-blue-400"><MonitorSmartphone className="w-3 h-3 mr-1" /> Máy tính</Badge>
                        </div>
                        <CardTitle className="text-2xl font-bold">
                            Sử dụng Web App (PWA)
                        </CardTitle>
                        <CardDescription className="text-base">
                            Sử dụng phiên bản Web App siêu nhẹ, có thể lưu ra màn hình chính và chạy offline như app thật.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 relative z-10">
                        <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-xl border border-blue-200 dark:border-blue-900">
                            <h4 className="font-semibold text-blue-800 dark:text-blue-400 mb-2 flex items-center gap-2">
                                <Apple className="w-4 h-4" /> Hướng dẫn cài lên iPhone/iPad
                            </h4>
                            <ul className="space-y-2 text-sm text-blue-700 dark:text-blue-500/90 list-decimal list-inside">
                                <li>Mở link web bằng trình duyệt <strong>Safari</strong>.</li>
                                <li>Nhấn vào biểu tượng <strong>Chia sẻ (Share)</strong> <Share className="inline w-3 h-3 mx-1" /> ở thanh công cụ.</li>
                                <li>Kéo xuống và chọn <strong>Thêm vào MH chính (Add to Home Screen)</strong> <PlusSquare className="inline w-3 h-3 mx-1" />.</li>
                                <li>Ra màn hình chính để mở ứng dụng.</li>
                            </ul>
                        </div>

                        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                            <h4 className="font-semibold text-slate-800 dark:text-slate-300 mb-2 flex items-center gap-2">
                                <MonitorSmartphone className="w-4 h-4" /> Hướng dẫn với Máy tính / Chrome
                            </h4>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                Truy cập link, nhấn vào biểu tượng <strong>Cài đặt ứng dụng</strong> ở góc phải thanh địa chỉ (Address bar) để cài đặt dạng Desktop App.
                            </p>
                        </div>
                    </CardContent>
                    <CardFooter className="relative z-10 pt-4">
                        <Button asChild size="lg" className="w-full h-14 text-lg bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-md hover:shadow-lg transition-all group">
                            <Link href="https://cal-note.vercel.app/" target="_blank" rel="noopener noreferrer">
                                <Globe className="mr-2 h-5 w-5" />
                                Truy cập Web App
                                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </Button>
                    </CardFooter>
                </Card>
            </div>

            {/* Visual Guide Section */}
            <div className="mt-16 text-center space-y-8">
                <h3 className="text-2xl font-bold tracking-tight">Giao diện Ứng dụng Trực quan</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 px-4">
                    {/* Mockup 1: Main Menu */}
                    <div className="rounded-[2rem] overflow-hidden border-8 border-slate-200 dark:border-slate-800 shadow-2xl aspect-[1/2] bg-[#0a1128] flex items-center justify-center relative transform transition duration-500 hover:scale-105">
                        <div className="absolute inset-0 flex flex-col pt-6">
                            <div className="w-full px-4 mb-4 flex items-center justify-between text-white">
                                <div className="w-6 h-1 bg-white/50 rounded"></div>
                                <div className="text-xs font-bold">MTE-LAB Cal-Notes</div>
                                <div className="w-4 h-4 rounded-full border-2 border-white/50"></div>
                            </div>
                            <div className="grid grid-cols-2 gap-3 px-3 w-full mt-4">
                                <div className="aspect-[4/5] bg-[#162145] rounded-xl flex flex-col items-center justify-center gap-3 border border-white/5">
                                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-[#ff6b35]">⚡</div>
                                    <div className="text-[10px] text-white font-medium">Máy Biến Áp</div>
                                </div>
                                <div className="aspect-[4/5] bg-[#162145] rounded-xl flex flex-col items-center justify-center gap-3 border border-white/5">
                                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-[#ff6b35]">🔌</div>
                                    <div className="text-[10px] text-white font-medium">Máy Cắt</div>
                                </div>
                                <div className="aspect-[4/5] bg-[#162145] rounded-xl flex flex-col items-center justify-center gap-3 border border-white/5">
                                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-[#ff6b35]">🔋</div>
                                    <div className="text-[10px] text-white font-medium">TI / TU</div>
                                </div>
                                <div className="aspect-[4/5] bg-[#162145] rounded-xl flex flex-col items-center justify-center gap-3 border border-white/5">
                                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-[#ff6b35]">⛈️</div>
                                    <div className="text-[10px] text-white font-medium">Chống Sét Van</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Mockup 2: Calculation Page */}
                    <div className="rounded-[2rem] overflow-hidden border-8 border-slate-200 dark:border-slate-800 shadow-2xl aspect-[1/2] bg-[#0a1128] flex items-center justify-center relative transform transition duration-500 hover:scale-105">
                        <div className="absolute inset-0 flex flex-col pt-6 px-4">
                            <div className="w-full flex items-center mb-6 text-white">
                                <div className="w-4 h-4 border-l-2 border-t-2 border-white transform -rotate-45 mr-3"></div>
                                <div className="text-xs font-bold uppercase">TÍNH TOÁN MBA 3 PHA</div>
                            </div>
                            <div className="w-full space-y-4">
                                <div className="p-3 bg-[#162145] rounded-xl border border-blue-900 w-full space-y-2">
                                    <div className="text-[9px] text-blue-300 font-bold">1. ĐIỆN TRỞ CÁCH ĐIỆN (MΩ)</div>
                                    <div className="flex gap-2">
                                        <div className="h-6 bg-[#0a1128] rounded border border-blue-900/50 flex-1 flex items-center px-2 text-[8px] text-white/50">C-H</div>
                                        <div className="h-6 bg-[#0a1128] rounded border border-blue-900/50 flex-1 flex items-center px-2 text-[8px] text-white/50">C-V</div>
                                        <div className="h-6 bg-[#0a1128] rounded border border-blue-900/50 flex-1 flex items-center px-2 text-[8px] text-white/50">H-V</div>
                                    </div>
                                    <div className="h-7 bg-blue-600 rounded text-white text-[9px] font-bold flex items-center justify-center mt-2">CẬP NHẬT Rcd</div>
                                </div>
                                <div className="p-3 bg-[#162145] rounded-xl border border-blue-900 w-full space-y-2">
                                    <div className="text-[9px] text-blue-300 font-bold">2. ĐIỆN TRỞ MỘT CHIỀU QUY ĐỔI</div>
                                    <div className="flex gap-2">
                                        <div className="h-6 bg-[#0a1128] rounded border border-blue-900/50 flex-1"></div>
                                        <div className="h-6 bg-[#0a1128] rounded border border-blue-900/50 flex-1"></div>
                                        <div className="h-6 bg-[#0a1128] rounded border border-blue-900/50 flex-1"></div>
                                    </div>
                                    <div className="h-7 bg-blue-600 rounded text-white text-[9px] font-bold flex items-center justify-center mt-2">TÍNH QUY ĐỔI</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Mockup 3: iOS Home Screen */}
                    <div className="rounded-[2rem] overflow-hidden border-8 border-slate-200 dark:border-slate-800 shadow-2xl aspect-[1/2] bg-gradient-to-b from-green-800 to-blue-900 flex items-center justify-center relative transform transition duration-500 hover:scale-105">
                        <div className="absolute inset-0 flex flex-col p-4">
                            <div className="mt-8 grid grid-cols-4 gap-3 mb-8">
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(i => <div key={i} className="aspect-square bg-white/20 rounded-xl shadow-sm"></div>)}
                            </div>

                            <div className="absolute bottom-24 left-4 flex flex-col items-center gap-1">
                                <div className="w-14 h-14 bg-black rounded-[1.2rem] flex items-center justify-center shadow-lg overflow-hidden border-2 border-slate-800/50">
                                    <div className="relative w-full h-full">
                                        <Image src="/images/cong-cu/Cal_notes_icon.png" alt="Icon" fill className="object-cover" />
                                    </div>
                                </div>
                                <div className="text-[9px] text-white font-medium drop-shadow-md">MTE Cal-Notes</div>
                            </div>

                            <div className="mt-auto mb-2 mx-auto w-full max-w-[80%] h-16 bg-white/20 backdrop-blur-md rounded-[2rem] flex justify-between items-center px-4">
                                <div className="w-10 h-10 bg-green-500 rounded-xl"></div>
                                <div className="w-10 h-10 bg-blue-400 rounded-xl"></div>
                                <div className="w-10 h-10 bg-blue-500 rounded-xl"></div>
                                <div className="w-10 h-10 bg-orange-400 rounded-xl"></div>
                            </div>
                        </div>
                    </div>
                </div>
                <p className="text-sm text-muted-foreground mt-8 italic">
                    *Giao diện trực quan, đồng bộ và chuyên nghiệp trên mọi nền tảng. Thiết kế dành riêng cho kỹ sư thí nghiệm điện.
                </p>
            </div>
        </div>
    );
}
