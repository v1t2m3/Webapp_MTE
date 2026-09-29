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
    const prpdCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const waveformCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const fftCanvasRef = useRef<HTMLCanvasElement | null>(null);

    const [activeTab, setActiveTab] = useState<"prpd" | "waveform" | "fft">("prpd");
    const [selectedWaveChannel, setSelectedWaveChannel] = useState<"all" | "hfct" | "ae1" | "ae2" | "ae3" | "ae4">("all");

    // 1. Render Canvas PRPD Pattern
    useEffect(() => {
        if (activeTab !== "prpd") return;

        let animationFrameId: number;

        const drawPrpd = () => {
            const canvas = prpdCanvasRef.current;
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

            // Draw 50Hz Voltage Reference Sine Wave
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
        };

        animationFrameId = requestAnimationFrame(drawPrpd);
        return () => {
            if (animationFrameId) cancelAnimationFrame(animationFrameId);
        };
    }, [prpdPoints, metrics, activeTab]);

    // 2. Render Canvas Time-Domain Waveform (HFCT + 4 AE Channels)
    useEffect(() => {
        if (activeTab !== "waveform") return;

        let animationFrameId: number;

        const drawWaveform = () => {
            const canvas = waveformCanvasRef.current;
            if (!canvas) return;

            const ctx = canvas.getContext("2d");
            if (!ctx) return;

            const width = canvas.width;
            const height = canvas.height;
            const padding = 45;

            // Background
            ctx.fillStyle = "#090d16";
            ctx.fillRect(0, 0, width, height);

            // Grid lines
            ctx.strokeStyle = "rgba(148, 163, 184, 0.15)";
            ctx.lineWidth = 1;
            for (let t = 0; t <= 3000; t += 500) {
                const x = padding + ((t / 3000) * (width - 2 * padding));
                ctx.beginPath();
                ctx.moveTo(x, padding);
                ctx.lineTo(x, height - padding);
                ctx.stroke();

                ctx.fillStyle = "#64748b";
                ctx.font = "10px Monospace, sans-serif";
                ctx.textAlign = "center";
                ctx.fillText(`${t} μs`, x, height - padding + 15);
            }

            const channels = [
                { id: "hfct", name: "Kênh 0: HFCT (Electric Trigger)", color: "#a855f7", delayUs: 0, amp: metrics.qMaxPc * 0.4 },
                { id: "ae1", name: "Kênh 1: AE1 (+520 μs)", color: "#34d399", delayUs: 520, amp: metrics.qMaxPc * 0.3 },
                { id: "ae2", name: "Kênh 2: AE2 (+890 μs)", color: "#fbbf24", delayUs: 890, amp: metrics.qMaxPc * 0.25 },
                { id: "ae3", name: "Kênh 3: AE3 (+1250 μs)", color: "#38bdf8", delayUs: 1250, amp: metrics.qMaxPc * 0.35 },
                { id: "ae4", name: "Kênh 4: AE4 (+1890 μs)", color: "#f87171", delayUs: 1890, amp: metrics.qMaxPc * 0.2 }
            ];

            const activeChannels = selectedWaveChannel === "all"
                ? channels
                : channels.filter(c => c.id === selectedWaveChannel);

            const rowHeight = (height - 2 * padding) / activeChannels.length;

            activeChannels.forEach((ch, idx) => {
                const centerY = padding + idx * rowHeight + rowHeight / 2;

                // Zero Baseline
                ctx.strokeStyle = "rgba(255,255,255,0.1)";
                ctx.beginPath();
                ctx.moveTo(padding, centerY);
                ctx.lineTo(width - padding, centerY);
                ctx.stroke();

                // Channel Label
                ctx.fillStyle = ch.color;
                ctx.font = "bold 11px Inter, sans-serif";
                ctx.textAlign = "left";
                ctx.fillText(ch.name, padding + 8, centerY - rowHeight * 0.3);

                // Waveform Trace (Damped Sinusoid Pulse)
                ctx.strokeStyle = ch.color;
                ctx.lineWidth = 1.8;
                ctx.beginPath();

                const plotWidth = width - 2 * padding;
                for (let px = 0; px <= plotWidth; px += 2) {
                    const timeUs = (px / plotWidth) * 3000;
                    let val = 0;

                    if (timeUs >= ch.delayUs) {
                        const dt = timeUs - ch.delayUs;
                        const freq = ch.id === "hfct" ? 0.08 : 0.02; // MHz equivalent
                        const damping = Math.exp(-dt * 0.005);
                        val = Math.sin(dt * freq * 2 * Math.PI) * damping * (rowHeight * 0.35);
                    }

                    // Add slight baseline noise
                    val += (Math.random() - 0.5) * 2.0;

                    const py = centerY - val;
                    if (px === 0) ctx.moveTo(padding + px, py);
                    else ctx.lineTo(padding + px, py);
                }
                ctx.stroke();

                // Draw TDOA Trigger Marker
                const trigX = padding + ((ch.delayUs / 3000) * plotWidth);
                ctx.strokeStyle = "#fef08a";
                ctx.setLineDash([3, 3]);
                ctx.beginPath();
                ctx.moveTo(trigX, centerY - rowHeight * 0.4);
                ctx.lineTo(trigX, centerY + rowHeight * 0.4);
                ctx.stroke();
                ctx.setLineDash([]);
            });

            // X Axis Label
            ctx.fillStyle = "#38bdf8";
            ctx.font = "bold 11px Inter, sans-serif";
            ctx.textAlign = "center";
            ctx.fillText("Thời gian thu nhận tín hiệu TDOA (t - μs)", width / 2, height - 8);
        };

        animationFrameId = requestAnimationFrame(drawWaveform);
        return () => {
            if (animationFrameId) cancelAnimationFrame(animationFrameId);
        };
    }, [metrics, activeTab, selectedWaveChannel]);

    // 3. Render Canvas FFT Frequency Spectrum
    useEffect(() => {
        if (activeTab !== "fft") return;

        let animationFrameId: number;

        const drawFft = () => {
            const canvas = fftCanvasRef.current;
            if (!canvas) return;

            const ctx = canvas.getContext("2d");
            if (!ctx) return;

            const width = canvas.width;
            const height = canvas.height;
            const padding = 45;

            ctx.fillStyle = "#090d16";
            ctx.fillRect(0, 0, width, height);

            // Grid lines
            ctx.strokeStyle = "rgba(148, 163, 184, 0.15)";
            ctx.lineWidth = 1;

            // X Axis: 0 to 30 MHz (HFCT) & 50-300 kHz (AE)
            const numBins = 60;
            const barWidth = (width - 2 * padding) / numBins;

            for (let f = 0; f <= 30; f += 5) {
                const x = padding + ((f / 30) * (width - 2 * padding));
                ctx.beginPath();
                ctx.moveTo(x, padding);
                ctx.lineTo(x, height - padding);
                ctx.stroke();

                ctx.fillStyle = "#64748b";
                ctx.font = "10px Monospace, sans-serif";
                ctx.textAlign = "center";
                ctx.fillText(`${f} MHz`, x, height - padding + 16);
            }

            // Draw Spectral Bars
            for (let i = 0; i < numBins; i++) {
                const freqMhz = (i / numBins) * 30.0;
                
                // Peak around 12.5 MHz for HFCT, and low-frequency AE peak
                let mag = 0;
                const dist1 = Math.abs(freqMhz - 12.5);
                const dist2 = Math.abs(freqMhz - 3.5);
                
                mag += Math.exp(-dist1 * dist1 * 0.4) * (height - 2 * padding) * 0.75;
                mag += Math.exp(-dist2 * dist2 * 0.8) * (height - 2 * padding) * 0.4;
                mag += Math.random() * 15;

                const x = padding + i * barWidth;
                const barH = Math.min(height - 2 * padding, mag);
                const y = height - padding - barH;

                let color = "#38bdf8";
                if (freqMhz >= 10 && freqMhz <= 15) color = "#a855f7";

                const grad = ctx.createLinearGradient(0, y, 0, height - padding);
                grad.addColorStop(0, color);
                grad.addColorStop(1, "rgba(15, 23, 42, 0.2)");

                ctx.fillStyle = grad;
                ctx.fillRect(x, y, barWidth - 1, barH);
            }

            // Spectral Peak Annotations
            ctx.fillStyle = "#fef08a";
            ctx.font = "bold 11px Inter, sans-serif";
            ctx.textAlign = "center";
            ctx.fillText("Peak HFCT: 12.5 MHz (Đặc trưng Phóng điện)", padding + ((12.5 / 30) * (width - 2 * padding)), padding + 20);

            // X Axis Title
            ctx.fillStyle = "#38bdf8";
            ctx.font = "bold 11px Inter, sans-serif";
            ctx.textAlign = "center";
            ctx.fillText("Tần số phổ tín hiệu (Frequency - MHz / kHz)", width / 2, height - 8);
        };

        animationFrameId = requestAnimationFrame(drawFft);
        return () => {
            if (animationFrameId) cancelAnimationFrame(animationFrameId);
        };
    }, [metrics, activeTab]);

    return (
        <Card className="bg-slate-900 border-indigo-500/30 text-white shadow-xl overflow-hidden">
            <CardHeader className="pb-2 border-b border-indigo-500/20">
                <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3">
                    <CardTitle className="text-base sm:text-lg font-bold flex items-center gap-2 text-indigo-300">
                        <Activity className="h-5 w-5 text-amber-400 shrink-0" />
                        <span className="break-words">{title}</span>
                    </CardTitle>
                    <div className="flex flex-wrap items-center gap-2 text-xs">
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
                    <TabsList className="bg-slate-800 border border-slate-700 text-slate-300 mb-4 flex-wrap h-auto p-1 gap-1">
                        <TabsTrigger value="prpd" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white text-xs py-1.5">
                            <BarChart2 className="h-4 w-4 mr-1.5" /> Đồ thị PRPD (Φ-q-n)
                        </TabsTrigger>
                        <TabsTrigger value="waveform" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white text-xs py-1.5">
                            <Waves className="h-4 w-4 mr-1.5" /> Tín hiệu thời gian (Waveform)
                        </TabsTrigger>
                        <TabsTrigger value="fft" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white text-xs py-1.5">
                            <Radio className="h-4 w-4 mr-1.5" /> Phổ tần số (FFT Spectrum)
                        </TabsTrigger>
                    </TabsList>

                    {/* PRPD Tab Content */}
                    <TabsContent value="prpd" forceMount className={activeTab === "prpd" ? "mt-0 block" : "hidden"}>
                        <div className="relative w-full aspect-[16/9] max-h-[380px] bg-slate-950 rounded-xl overflow-hidden border border-slate-800 flex justify-center items-center">
                            <canvas
                                ref={prpdCanvasRef}
                                width={750}
                                height={380}
                                className="w-full h-full object-contain"
                            />
                        </div>
                        <div className="mt-3 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] sm:text-xs text-slate-400 gap-2 px-1">
                            <div className="flex flex-wrap items-center gap-3">
                                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span> Mật độ thấp (&lt; 15 xung)</span>
                                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span> Mật độ trung bình (15-30 xung)</span>
                                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-400"></span> Mật độ cao (&gt; 30 xung)</span>
                            </div>
                            <div className="text-cyan-400 flex items-center gap-1">
                                &mdash; &mdash; Sóng tham chiếu điện áp 50Hz
                            </div>
                        </div>
                    </TabsContent>

                    {/* Time Domain Waveform Tab Content */}
                    <TabsContent value="waveform" forceMount className={activeTab === "waveform" ? "mt-0 block" : "hidden"}>
                        <div className="space-y-3">
                            <div className="flex flex-wrap items-center justify-between gap-2 text-xs bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                                <span className="text-indigo-300 font-semibold flex items-center gap-1.5">
                                    <Waves className="h-4 w-4 text-purple-400" /> Chọn kênh sóng xem chi tiết:
                                </span>
                                <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                                    {[
                                        { id: "all", label: "Tất cả các kênh" },
                                        { id: "hfct", label: "HFCT Trigger" },
                                        { id: "ae1", label: "AE1 (+520 μs)" },
                                        { id: "ae2", label: "AE2 (+890 μs)" },
                                        { id: "ae3", label: "AE3 (+1250 μs)" },
                                        { id: "ae4", label: "AE4 (+1890 μs)" }
                                    ].map(b => (
                                        <button
                                            key={b.id}
                                            onClick={() => setSelectedWaveChannel(b.id as any)}
                                            className={`px-2.5 py-1 rounded text-xs transition ${
                                                selectedWaveChannel === b.id
                                                    ? "bg-indigo-600 text-white font-bold"
                                                    : "bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800"
                                            }`}
                                        >
                                            {b.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="relative w-full aspect-[16/9] max-h-[380px] bg-slate-950 rounded-xl overflow-hidden border border-slate-800 flex justify-center items-center">
                                <canvas
                                    ref={waveformCanvasRef}
                                    width={750}
                                    height={380}
                                    className="w-full h-full object-contain"
                                />
                            </div>
                        </div>
                    </TabsContent>

                    {/* FFT Spectrum Tab Content */}
                    <TabsContent value="fft" forceMount className={activeTab === "fft" ? "mt-0 block" : "hidden"}>
                        <div className="space-y-3">
                            <div className="relative w-full aspect-[16/9] max-h-[380px] bg-slate-950 rounded-xl overflow-hidden border border-slate-800 flex justify-center items-center">
                                <canvas
                                    ref={fftCanvasRef}
                                    width={750}
                                    height={380}
                                    className="w-full h-full object-contain"
                                />
                            </div>
                            <div className="text-xs text-slate-400 bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex justify-between items-center">
                                <span>🔍 dF: 0.1 MHz | Tần số mẫu: 100 MS/s | Băng thông HFCT: 20 MHz</span>
                                <span className="text-purple-300 font-semibold">Tỉ số Tín hiệu/Nhiễu (SNR): +24.8 dB</span>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}
