'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calculator, Save, AlertTriangle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast"; // Assuming use-toast hook exists, else we can mock it

export default function CalculationsPage() {
    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-[#3a0ca3] dark:text-primary-foreground">
                        Công cụ Tính toán MTE
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Tự động hóa quy đổi nhiệt độ, tính toán sai số và độ không đảm bảo đo
                    </p>
                </div>
            </div>

            <Tabs defaultValue="dc-resistance" className="w-full">
                <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 bg-muted/50 p-1">
                    <TabsTrigger value="dc-resistance">Điện trở 1 chiều</TabsTrigger>
                    <TabsTrigger value="contact-resistance">Điện trở tiếp xúc</TabsTrigger>
                    <TabsTrigger value="tan-delta">Đo tgδ</TabsTrigger>
                    <TabsTrigger value="turns-ratio">Tỉ số biến</TabsTrigger>
                </TabsList>

                <TabsContent value="dc-resistance" className="mt-6">
                    <DcResistanceCalculator />
                </TabsContent>

                <TabsContent value="contact-resistance" className="mt-6">
                    <ContactResistanceCalculator />
                </TabsContent>

                <TabsContent value="tan-delta" className="mt-6">
                    <TanDeltaCalculator />
                </TabsContent>

                <TabsContent value="turns-ratio" className="mt-6">
                    <TurnsRatioCalculator />
                </TabsContent>
            </Tabs>
        </div>
    );
}

// Dedicated Components for each Calculator
function DcResistanceCalculator() {
    const { toast } = useToast();

    // Measurement Inputs
    const [r1, setR1] = useState<string>(''); // R1 đo được
    const [t1, setT1] = useState<string>(''); // Nhiệt độ đo

    // Target Conversion
    const [t2, setT2] = useState<string>('75'); // Nhiệt độ quy đổi (Thường 75C)
    const [materialK, setMaterialK] = useState<string>('235'); // Hệ số Đồng = 235, Nhôm = 225

    // Standard Device Data (Saved in LocalStorage)
    const [uStandard, setUStandard] = useState<string>('');
    const [resolution, setResolution] = useState<string>(''); // Độ phân giải

    // Results
    const [resultR2, setResultR2] = useState<number | null>(null);
    const [uncertainty, setUncertainty] = useState<number | null>(null);

    // Load saved settings on mount
    useEffect(() => {
        const savedU = localStorage.getItem('MTE_DC_U_STANDARD');
        const savedRes = localStorage.getItem('MTE_DC_RESOLUTION');
        if (savedU) setUStandard(savedU);
        if (savedRes) setResolution(savedRes);
    }, []);

    const saveSettings = () => {
        localStorage.setItem('MTE_DC_U_STANDARD', uStandard);
        localStorage.setItem('MTE_DC_RESOLUTION', resolution);
        toast({ title: "Đã lưu thông số thiết bị chuẩn", className: "bg-green-500 text-white" });
    };

    const calculate = () => {
        const R1 = parseFloat(r1);
        const T1 = parseFloat(t1);
        const T2 = parseFloat(t2);
        const K = parseFloat(materialK);

        if (isNaN(R1) || isNaN(T1) || isNaN(T2) || isNaN(K)) {
            toast({ title: "Lỗi", description: "Vui lòng nhập đầy đủ các thông số đo", variant: "destructive" });
            return;
        }

        // Formula: R2 = R1 * (K + t2) / (K + t1)
        const R2 = R1 * ((K + T2) / (K + T1));
        setResultR2(R2);

        // Calculate Type A & Type B Uncertainty if parameters are provided
        const u_std = parseFloat(uStandard);
        const res = parseFloat(resolution);

        if (!isNaN(u_std) && !isNaN(res)) {
            // Type B from standard calibration certificate (Assume normal distribution k=2)
            const uB_std = u_std / 2;

            // Type B from resolution (Assume rectangular distribution sqrt(3))
            const uB_res = (res / 2) / Math.sqrt(3);

            // Combined Standard Uncertainty (Simplified just for Type B here as demo)
            const uc = Math.sqrt(Math.pow(uB_std, 2) + Math.pow(uB_res, 2));

            // Expanded Uncertainty (k=2, 95% confidence)
            const U = uc * 2;
            setUncertainty(U);
        } else {
            setUncertainty(null);
        }
    };

    return (
        <Card className="border-t-4 border-t-[#3a0ca3] shadow-md">
            <CardHeader className="bg-muted/20 border-b">
                <CardTitle className="flex items-center gap-2">
                    <Calculator className="h-5 w-5 text-[#f72585]" />
                    Quy đổi Nhiệt độ Điện trở Một chiều (DC)
                </CardTitle>
                <CardDescription>
                    Sử dụng công thức R₂ = R₁ × (K + t₂) / (K + t₁) và tính ĐKĐBĐ Type B
                </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-8">

                {/* Cột 1: Thông số Nhập liệu */}
                <div className="space-y-6">
                    <div className="bg-primary/5 p-4 rounded-lg border border-primary/10">
                        <h3 className="font-semibold text-primary mb-4">1. Thông số đo thực tế</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="r1">Điện trở đo được (R₁)</Label>
                                <Input id="r1" type="number" value={r1} onChange={e => setR1(e.target.value)} placeholder="0.00" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="t1">Nhiệt độ lúc đo (t₁ °C)</Label>
                                <Input id="t1" type="number" value={t1} onChange={e => setT1(e.target.value)} placeholder="25" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-muted/30 p-4 rounded-lg border shadow-sm">
                        <h3 className="font-semibold mb-4">2. Thông số Quy đổi</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="materialK">Hệ số vật liệu (K)</Label>
                                <select
                                    id="materialK"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                                    value={materialK}
                                    onChange={e => setMaterialK(e.target.value)}
                                >
                                    <option value="235">Đồng (Cu) - 235</option>
                                    <option value="225">Nhôm (Al) - 225</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="t2">Nhiệt độ đích (t₂ °C)</Label>
                                <Input id="t2" type="number" value={t2} onChange={e => setT2(e.target.value)} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Cột 2: Cấu hình Thiết bị & Kết quả */}
                <div className="space-y-6">
                    <div className="bg-amber-50 dark:bg-amber-950/20 p-4 rounded-lg border border-amber-200">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-semibold text-amber-900 dark:text-amber-500 flex items-center gap-2">
                                <AlertTriangle className="h-4 w-4" /> 3. Thông số Thiết bị chuẩn
                            </h3>
                            <Button variant="outline" size="sm" onClick={saveSettings} className="h-8 text-xs">
                                <Save className="h-3 w-3 mr-1" /> Lưu Config
                            </Button>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="uStandard" className="text-amber-900/80 dark:text-amber-500/80">ĐKĐBĐ Mở rộng (U chuẩn)</Label>
                                <Input id="uStandard" type="number" value={uStandard} onChange={e => setUStandard(e.target.value)} placeholder="Ví dụ: 0.05" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="resolution" className="text-amber-900/80 dark:text-amber-500/80">Độ phân giải máy đo</Label>
                                <Input id="resolution" type="number" value={resolution} onChange={e => setResolution(e.target.value)} placeholder="Ví dụ: 0.001" />
                            </div>
                        </div>
                        <p className="text-xs text-amber-700 mt-2 italic">
                            * Hệ thống sẽ lưu ID thiết bị này tại Local Storage để không phải nhập lại lần sau.
                        </p>
                    </div>

                    <Button onClick={calculate} size="lg" className="w-full text-lg h-14 bg-[#f72585] hover:bg-[#b5179e] transition-colors">
                        Tính Toán
                    </Button>

                    {resultR2 !== null && (
                        <div className="mt-6 p-6 rounded-xl bg-green-50 dark:bg-green-950/30 border-2 border-green-500 flex flex-col items-center justify-center animate-in zoom-in-95 duration-300">
                            <h4 className="text-green-800 dark:text-green-400 font-medium mb-2">Kết quả Điện trở tại {t2}°C</h4>
                            <div className="text-5xl font-bold tracking-tighter text-green-600 dark:text-green-500">
                                {resultR2.toFixed(4)} <span className="text-2xl font-normal text-muted-foreground">Ω</span>
                            </div>

                            {uncertainty !== null && (
                                <div className="mt-4 pt-4 border-t border-green-200 dark:border-green-800 w-full text-center">
                                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400 block mb-1">
                                        Độ không đảm bảo đo (U) với k=2, 95%:
                                    </span>
                                    <span className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                                        ± {uncertainty.toFixed(6)} <span className="text-base font-normal opacity-70">Ω</span>
                                    </span>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

// Tan Delta Calculator
function TanDeltaCalculator() {
    const { toast } = useToast();

    // Inputs
    const [measuredTanD, setMeasuredTanD] = useState<string>(''); // tgD do duoc (%)
    const [t1, setT1] = useState<string>(''); // Nhiet do do
    const [t2, setT2] = useState<string>('20'); // Nhiet do quy doi (Thuong 20C)

    // Type of Equipment for K1 coefficient 
    // Theo TCVN hoặc IEEE, hệ số K cho Máy biến áp thường Tra Bảng, giả lập K = 1.04 ^ (T2 - T1)
    const [equipmentType, setEquipmentType] = useState<string>('transformer');

    // Results
    const [resultTanD, setResultTanD] = useState<number | null>(null);

    const calculate = () => {
        const tgD1 = parseFloat(measuredTanD);
        const T1 = parseFloat(t1);
        const T2 = parseFloat(t2);

        if (isNaN(tgD1) || isNaN(T1) || isNaN(T2)) {
            toast({ title: "Lỗi", description: "Vui lòng nhập đầy đủ các thông số đo", variant: "destructive" });
            return;
        }

        // Empirical Formula for Transformers (Often K=1.04 per Degree C difference, roughly K20 = Kt / 1.04^(T-20))
        // tgD_20 = tgD_T / K
        // Where K = 1.3 for 10C diff, etc. Standard IEEE approximation: K = 1.04^(T - 20)
        let K_factor = 1.0;

        if (equipmentType === 'transformer') {
            K_factor = Math.pow(1.04, (T1 - T2));
        } else if (equipmentType === 'bushing') {
            // Bushing OIP is different, roughly 1.03
            K_factor = Math.pow(1.03, (T1 - T2));
        } else {
            // Cáp khô (XLPE) tgD ít phụ thuộc nhiệt độ ở dải thường, K ~ 1
            K_factor = 1.0;
        }

        const tgD2 = tgD1 / K_factor;
        setResultTanD(tgD2);
    };

    return (
        <Card className="border-t-4 border-t-[#7209b7] shadow-md">
            <CardHeader className="bg-muted/20 border-b">
                <CardTitle className="flex items-center gap-2">
                    <Calculator className="h-5 w-5 text-[#4cc9f0]" />
                    Quy đổi Tổn hao điện môi (tgδ %)
                </CardTitle>
                <CardDescription>
                    Hiệu chỉnh nhiệt độ cho phép đo tgδ theo tiêu chuẩn IEEE / TCVN (Hệ số K)
                </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-8">

                <div className="space-y-6">
                    <div className="bg-primary/5 p-4 rounded-lg border border-primary/10">
                        <h3 className="font-semibold text-primary mb-4">1. Thông số đo thực tế</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="tgd1">tgδ đo được (%)</Label>
                                <Input id="tgd1" type="number" step="0.01" value={measuredTanD} onChange={e => setMeasuredTanD(e.target.value)} placeholder="Ví dụ: 0.35" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="ttgd1">Nhiệt độ lúc đo (t₁ °C)</Label>
                                <Input id="ttgd1" type="number" value={t1} onChange={e => setT1(e.target.value)} placeholder="32" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-muted/30 p-4 rounded-lg border shadow-sm">
                        <h3 className="font-semibold mb-4">2. Thông số Quy đổi</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="eqType">Đối tượng thiết bị</Label>
                                <select
                                    id="eqType"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                                    value={equipmentType}
                                    onChange={e => setEquipmentType(e.target.value)}
                                >
                                    <option value="transformer">Máy biến áp (K~1.04)</option>
                                    <option value="bushing">Sứ (OIP) (K~1.03)</option>
                                    <option value="cable">Cáp XLPE (K~1.00)</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="ttgd2">Nhiệt độ đích (t₂ °C)</Label>
                                <Input id="ttgd2" type="number" value={t2} onChange={e => setT2(e.target.value)} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-6 flex flex-col justify-center">
                    <Button onClick={calculate} size="lg" className="w-full text-lg h-14 bg-[#7209b7] hover:bg-[#560bad] transition-colors shadow-lg">
                        Xử lý Số liệu tgδ
                    </Button>

                    {resultTanD !== null && (
                        <div className="mt-6 p-6 rounded-xl bg-blue-50 dark:bg-blue-950/30 border-2 border-blue-500 flex flex-col items-center justify-center animate-in zoom-in-95 duration-300">
                            <h4 className="text-blue-800 dark:text-blue-400 font-medium mb-2">Kết quả tgδ tại {t2}°C</h4>
                            <div className="text-6xl font-black tracking-tighter text-blue-600 dark:text-blue-500 drop-shadow-sm">
                                {resultTanD.toFixed(3)} <span className="text-3xl font-bold text-blue-400">%</span>
                            </div>
                            <p className="text-sm text-blue-600/70 mt-4 text-center">
                                * Lưu ý: Kết quả quy đổi chỉ mang tính chất tham khảo gần đúng theo công thức thực nghiệm bề mặt.
                            </p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

// Contact Resistance Calculator
function ContactResistanceCalculator() {
    const { toast } = useToast();

    // Inputs (Ohm's Law: R = U / I)
    const [voltageDrop, setVoltageDrop] = useState<string>(''); // Điện áp rơi (mV)
    const [currentInject, setCurrentInject] = useState<string>('100'); // Dòng điện bơm (A), thường là 100A

    // Results
    const [resultMicroOhm, setResultMicroOhm] = useState<number | null>(null);

    const calculate = () => {
        const U_mV = parseFloat(voltageDrop);
        const I_A = parseFloat(currentInject);

        if (isNaN(U_mV) || isNaN(I_A) || I_A === 0) {
            toast({ title: "Lỗi", description: "Vui lòng nhập Thông số đo hợp lệ (Dòng điện phải > 0)", variant: "destructive" });
            return;
        }

        // R (Ohm) = U (Volt) / I (Ampere)
        // U_Volt = U_mV / 1000
        // R_MicroOhm = (U_Volt / I_A) * 1_000_000 
        // Suy ra: R_MicroOhm = (U_mV / I_A) * 1000 
        const R_uOhm = (U_mV / I_A) * 1000;

        setResultMicroOhm(R_uOhm);
    };

    return (
        <Card className="border-t-4 border-t-[#f77f00] shadow-md">
            <CardHeader className="bg-muted/20 border-b">
                <CardTitle className="flex items-center gap-2">
                    <Calculator className="h-5 w-5 text-[#f77f00]" />
                    Tính toán Điện trở Tiếp xúc (Micro-Ohm)
                </CardTitle>
                <CardDescription>
                    Nhanh chóng quy đổi Điện áp rơi (mV) và Dòng cực đại (A) ra Micro-Ohms (µΩ)
                </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-8">

                <div className="space-y-6">
                    <div className="bg-primary/5 p-4 rounded-lg border border-primary/10">
                        <h3 className="font-semibold text-primary mb-4">Thông số Bơm dòng</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="u_drop">Điện áp rơi (mV)</Label>
                                <Input id="u_drop" type="number" step="0.01" value={voltageDrop} onChange={e => setVoltageDrop(e.target.value)} placeholder="Ví dụ: 1.5" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="i_inj">Dòng điện thử (A)</Label>
                                <Input id="i_inj" type="number" value={currentInject} onChange={e => setCurrentInject(e.target.value)} placeholder="100" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-6 flex flex-col justify-center">
                    <Button onClick={calculate} size="lg" className="w-full text-lg h-14 bg-[#f77f00] hover:bg-[#d66e00] transition-colors shadow-lg">
                        Xử lý Số liệu µΩ
                    </Button>

                    {resultMicroOhm !== null && (
                        <div className="mt-6 p-6 rounded-xl bg-orange-50 dark:bg-orange-950/30 border-2 border-orange-500 flex flex-col items-center justify-center animate-in zoom-in-95 duration-300">
                            <h4 className="text-orange-800 dark:text-orange-400 font-medium mb-2">Kết quả Điện trở Tiếp xúc</h4>
                            <div className="text-6xl font-black tracking-tighter text-orange-600 dark:text-orange-500 drop-shadow-sm">
                                {resultMicroOhm.toFixed(2)} <span className="text-3xl font-bold text-orange-400">µΩ</span>
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

// Turns Ratio Calculator
function TurnsRatioCalculator() {
    const { toast } = useToast();

    // Inputs
    const [vPrimary, setVPrimary] = useState<string>(''); // HV (Cao ap)
    const [vSecondary, setVSecondary] = useState<string>(''); // LV (Ha ap)
    const [kMeasured, setKMeasured] = useState<string>(''); // K_do

    // Results
    const [kNominal, setKNominal] = useState<number | null>(null);
    const [errorMargin, setErrorMargin] = useState<number | null>(null);

    const calculate = () => {
        const VP = parseFloat(vPrimary);
        const VS = parseFloat(vSecondary);
        const K_do = parseFloat(kMeasured);

        if (isNaN(VP) || isNaN(VS) || isNaN(K_do) || VS === 0) {
            toast({ title: "Lỗi", description: "Vui lòng nhập Thông số điện áp định mức hợp lệ", variant: "destructive" });
            return;
        }

        // Tỉ số biến định mức
        const K_dm = VP / VS;
        setKNominal(K_dm);

        // Sai số vòng dây Delta U % = ((K_do - K_dm) / K_dm) * 100
        const deltaU = ((K_do - K_dm) / K_dm) * 100;
        setErrorMargin(deltaU);
    };

    return (
        <Card className="border-t-4 border-t-[#06d6a0] shadow-md">
            <CardHeader className="bg-muted/20 border-b">
                <CardTitle className="flex items-center gap-2">
                    <Calculator className="h-5 w-5 text-[#06d6a0]" />
                    Tính toán Sai số Tỉ số biến (ΔU %)
                </CardTitle>
                <CardDescription>
                    Tính Tỉ số định mức (K_{"dm"}) và Phần trăm sai số giữa thực đo so với nhãn máy
                </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-8">

                <div className="space-y-6">
                    <div className="bg-primary/5 p-4 rounded-lg border border-primary/10">
                        <h3 className="font-semibold text-primary mb-4">1. Điện áp Định mức Nấc hiện tại</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="vP">Cao áp U1 (V)</Label>
                                <Input id="vP" type="number" step="0.1" value={vPrimary} onChange={e => setVPrimary(e.target.value)} placeholder="Ví dụ: 110000" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="vS">Hạ áp U2 (V)</Label>
                                <Input id="vS" type="number" step="0.1" value={vSecondary} onChange={e => setVSecondary(e.target.value)} placeholder="Ví dụ: 22000" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-muted/30 p-4 rounded-lg border shadow-sm">
                        <h3 className="font-semibold mb-4">2. Thông số đo thực tế</h3>
                        <div className="space-y-2 w-1/2">
                            <Label htmlFor="kDo">Tỉ số đo được (K_{"đo"})</Label>
                            <Input id="kDo" type="number" step="0.0001" value={kMeasured} onChange={e => setKMeasured(e.target.value)} placeholder="Ví dụ: 5.002" />
                        </div>
                    </div>
                </div>

                <div className="space-y-6 flex flex-col justify-center">
                    <Button onClick={calculate} size="lg" className="w-full text-lg h-14 bg-[#06d6a0] hover:bg-[#04a077] transition-colors shadow-lg">
                        Xử lý Sai số Tỉ số biến
                    </Button>

                    {errorMargin !== null && kNominal !== null && (
                        <div className="mt-6 space-y-4 animate-in zoom-in-95 duration-300">

                            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 flex justify-between items-center">
                                <span className="font-medium text-slate-600">Máy Tỉ số Định mức (K_{"dm"}):</span>
                                <span className="text-2xl font-bold text-slate-700 dark:text-slate-300">{kNominal.toFixed(4)}</span>
                            </div>

                            <div className={`p-6 rounded-xl border-2 flex flex-col items-center justify-center 
                                ${Math.abs(errorMargin) > 0.5 ? 'bg-red-50 dark:bg-red-950/30 border-red-500' : 'bg-green-50 dark:bg-green-950/30 border-green-500'}`}
                            >
                                <h4 className={`font-medium mb-2 ${Math.abs(errorMargin) > 0.5 ? 'text-red-800 dark:text-red-400' : 'text-green-800 dark:text-green-400'}`}>
                                    Sai số Vòng dây (ΔU %)
                                </h4>
                                <div className={`text-6xl font-black tracking-tighter drop-shadow-sm ${Math.abs(errorMargin) > 0.5 ? 'text-red-600 dark:text-red-500' : 'text-green-600 dark:text-green-500'}`}>
                                    {errorMargin > 0 ? '+' : ''}{errorMargin.toFixed(3)} <span className="text-3xl font-bold opacity-70">%</span>
                                </div>
                                <p className={`text-sm mt-4 font-bold flex items-center gap-2 ${Math.abs(errorMargin) > 0.5 ? 'text-red-600 dark:text-red-500' : 'text-green-600 dark:text-green-500'}`}>
                                    {Math.abs(errorMargin) > 0.5 ? (
                                        <><AlertTriangle className="h-4 w-4" /> KHÔNG ĐẠT (Theo IEC &gt; 0.5%)</>
                                    ) : (
                                        <>✓ ĐẠT TIÊU CHUẨN</>
                                    )}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
