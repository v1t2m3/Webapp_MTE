"use client";

import { useEffect, useRef, useState } from "react";
import { PrpdPoint, PdMetrics } from "@/types/pd-online";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Activity, BarChart2, Waves, Radio } from "lucide-react";

interface PrpdChartProps {
    prpdPoints: PrpdPoint[];
    metrics: PdMetrics;
    title?: string;
}

export function PrpdChart({ prpdPoints, metrics, title = "Biểu đồ phân bố góc pha PRPD (Phase-Resolved Partial Discharge)" }: PrpdChartProps) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [activeTab, setActiveTab] = useState<"prpd" | "waveform" | "fft">("prpd");

    // Render Canvas PRPD Pattern
    useEffect(() => {
        if (activeTab !== "prpd") return;
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const width = canvas.width;
        const height = canvas.height;
        const padding = 45;

        // Clear canvas background
        ctx.fillStyle = "#0f172a";
        ctx.fillRect(0, 0, width, height);

        // Draw Grid Lines & Axes
        ctx.strokeStyle = "rgba(148, 163, 184, 0.2)";
        ctx.lineWidth = 1;

        // X Grid (Phase 0 to 360 deg in steps of 45)
        for (let phase = 0; phase <= 360; phase += 45) {
            const x = padding + ((phase / 360) * (width - 2 * padding));
            ctx.beginPath();
            ctx.moveTo(x, padding);
            ctx.lineTo(x, height - padding);
            ctx.stroke();

            // Label X
            ctx.fillStyle = "#94a3b8";
            ctx.font = "11px Inter, sans-serif";
            ctx.textAlign = "center";
            ctx.fillText(`${phase}°`, x, height - padding + 18);
        }

        // Y Grid (PD Amplitude 0 to Qmax pC)
        const qMax = Math.max(1000, metrics.qMaxPc * 1.1);
        for (let q = 0; q <= qMax; q += Math.round(qMax / 4)) {
            const y = height - padding - ((q / qMax) * (height - 2 * padding));
            ctx.beginPath();
            ctx.moveTo(padding, y);
            ctx.lineTo(width - padding, y);
            ctx.stroke();

            // Label Y
            ctx.fillStyle = "#94a3b8";
            ctx.font = "11px Inter, sans-serif";
            ctx.textAlign = "right";
            ctx.fillText(`${q} pC`, padding - 8, y + 4);
        }

        // Draw 50Hz Voltage Reference Sine Wave (Reference Voltage)
        ctx.strokeStyle = "rgba(56, 189, 248, 0.4)";
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        for (let x = padding; x <= width - padding; x++) {
            const phaseRad = ((x - padding) / (width - 2 * padding)) * 2 * Math.PI;
            const sineVal = Math.sin(phaseRad);
            const y = (height / 2) - (sineVal * (height / 2 - padding - 20));
            if (x === padding) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.setLineDash([]); // Reset line dash

        // Draw PRPD Discharge Points (heatmap dots)
        prpdPoints.forEach((point) => {
            const x = padding + ((point.phase_deg / 360) * (width - 2 * padding));
            const y = height - padding - ((point.q_pc / qMax) * (height - 2 * padding));

            // Intensity color: Green/Yellow/Orange/Red based on pulse count
            let color = "#34d399";
            if (point.count > 15 && point.count <= 30) color = "#fbbf24";
            else if (point.count > 30) color = "#f87171";

            const radius = Math.min(10, Math.max(4, point.count / 4));

            // Outer glow
            const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius * 2);
            gradient.addColorStop(0, color);
            gradient.addColorStop(1, "rgba(0,0,0,0)");

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(x, y, radius * 2, 0, 2 * Math.PI);
            ctx.fill();

            // Inner solid dot
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, 2 * Math.PI);
            ctx.fill();
        });

        // Axes Labels
        ctx.fillStyle = "#38bdf8";
        ctx.font = "bold 12px Inter, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("Góc pha điện áp 50Hz (Phase Angle Φ)", width / 2, height - 8);

        ctx.save();
        ctx.translate(14, height / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText("Biên độ phóng điện Q (pC)", 0, 0);
        ctx.restore();

    }, [prpdPoints, metrics, activeTab]);

    return (
        <Card className="bg-slate-900 border-indigo-500/30 text-white shadow-xl">
            <CardHeader className="pb-2 border-b border-indigo-500/20">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <CardTitle className="text-lg font-bold flex items-center gap-2 text-indigo-300">
                        <Activity className="h-5 w-5 text-amber-400" />
                        {title}
                    </CardTitle>
                    <div className="flex items-center space-x-3 text-xs">
                        <div className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded border border-white/10">
                            <span className="text-slate-400">Qmax:</span>
                            <span className="font-bold text-rose-400">{metrics.qMaxPc} pC</span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded border border-white/10">
                            <span className="text-slate-400">Qavg:</span>
                            <span className="font-bold text-amber-300">{metrics.qAvgPc} pC</span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded border border-white/10">
                            <span className="text-slate-400">Xung/chu kỳ:</span>
                            <span className="font-bold text-cyan-300">{metrics.pulseCountPerCycle}/n</span>
                        </div>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="pt-4">
                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
                    <TabsList className="bg-slate-800 border border-slate-700 text-slate-300 mb-4">
                        <TabsTrigger value="prpd" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
                            <BarChart2 className="h-4 w-4 mr-2" /> Đồ thị PRPD (Φ-q-n)
                        </TabsTrigger>
                        <TabsTrigger value="waveform" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
                            <Waves className="h-4 w-4 mr-2" /> Tín hiệu thời gian (Waveform)
                        </TabsTrigger>
                        <TabsTrigger value="fft" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
                            <Radio className="h-4 w-4 mr-2" /> Phổ tần số (FFT Spectrum)
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="prpd" className="mt-0">
                        <div className="relative w-full aspect-[16/9] max-h-[380px] bg-slate-950 rounded-xl overflow-hidden border border-slate-800 flex justify-center items-center">
                            <canvas
                                ref={canvasRef}
                                width={750}
                                height={380}
                                className="w-full h-full object-contain"
                            />
                        </div>
                        <div className="mt-3 flex items-center justify-between text-xs text-slate-400 px-1">
                            <div className="flex items-center space-x-4">
                                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span> Mật độ thấp (&lt; 15 xung)</span>
                                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span> Mật độ trung bình (15-30 xung)</span>
                                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-400"></span> Mật độ cao (&gt; 30 xung)</span>
                            </div>
                            <div className="text-cyan-400 flex items-center gap-1">
                                &mdash; &mdash; Sóng tham chiếu điện áp 50Hz
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="waveform">
                        <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 text-center text-slate-400 space-y-3">
                            <Waves className="h-10 w-10 text-indigo-400 mx-auto animate-bounce" />
                            <h4 className="text-sm font-semibold text-white">Xung tín hiệu thời gian HFCT (20MHz) &amp; 4 Kênh Cảm biến Siêu âm AE (80-300kHz)</h4>
                            <p className="text-xs text-slate-400 max-w-md mx-auto">
                                Tín hiệu điện từ HFCT thu nhận độ trễ sóng âm TDOA trên các kênh AE1, AE2, AE3, AE4.
                            </p>
                            <div className="grid grid-cols-5 gap-2 pt-2 text-xs">
                                <div className="p-2 bg-indigo-950/60 border border-indigo-500/30 rounded text-indigo-300">Kênh 0: HFCT (Trích gốc)</div>
                                <div className="p-2 bg-slate-900 border border-slate-800 rounded text-amber-300">Kênh 1: AE1 (+1250 μs)</div>
                                <div className="p-2 bg-slate-900 border border-slate-800 rounded text-amber-300">Kênh 2: AE2 (+1890 μs)</div>
                                <div className="p-2 bg-slate-900 border border-slate-800 rounded text-amber-300">Kênh 3: AE3 (+850 μs)</div>
                                <div className="p-2 bg-slate-900 border border-slate-800 rounded text-amber-300">Kênh 4: AE4 (+2100 μs)</div>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="fft">
                        <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 text-center text-slate-400 space-y-3">
                            <Radio className="h-10 w-10 text-cyan-400 mx-auto animate-pulse" />
                            <h4 className="text-sm font-semibold text-white">Phổ tần số tín hiệu phóng điện cục bộ</h4>
                            <p className="text-xs text-slate-400 max-w-md mx-auto">
                                Tần số trung tâm kênh HFCT: 2.5 - 18.5 MHz. Tần số đặc trưng siêu âm AE: 150 kHz.
                            </p>
                        </div>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}
