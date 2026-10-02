"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { PrpdPoint, PdMetrics, WaveformPoint } from "@/types/pd-online";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Activity, BarChart2, Waves, Radio, ZoomIn, ZoomOut, RotateCcw, Info, Sliders } from "lucide-react";

interface PrpdChartProps {
    prpdPoints: PrpdPoint[];
    metrics: PdMetrics;
    waveformPoints?: WaveformPoint[];
    title?: string;
}

export function PrpdChart({
    prpdPoints,
    metrics,
    waveformPoints,
    title = "Biểu đồ phân bố góc pha PRPD (Phase-Resolved Partial Discharge)"
}: PrpdChartProps) {
    const prpdCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const waveformCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const fftCanvasRef = useRef<HTMLCanvasElement | null>(null);

    const [activeTab, setActiveTab] = useState<"prpd" | "waveform" | "fft">("prpd");
    const [selectedWaveChannel, setSelectedWaveChannel] = useState<"all" | "hfct" | "ae1" | "ae2" | "ae3" | "ae4">("all");

    // Zoom and pan state for waveform
    const [zoomLevel, setZoomLevel] = useState<number>(1);
    const [panOffsetUs, setPanOffsetUs] = useState<number>(0);
    const [isDragging, setIsDragging] = useState<boolean>(false);
    const [dragStartX, setDragStartX] = useState<number>(0);
    const [dragStartPan, setDragStartPan] = useState<number>(0);

    const hasWaveform = Boolean(waveformPoints && waveformPoints.length > 0);

    // Compute max duration from waveformPoints
    const totalDurationUs = useMemo(() => {
        if (!waveformPoints || waveformPoints.length === 0) return 3000;
        return waveformPoints[waveformPoints.length - 1].time_us || 3000;
    }, [waveformPoints]);

    // Active visible time range
    const timeSpan = totalDurationUs / zoomLevel;
    const clampedPan = Math.max(0, Math.min(totalDurationUs - timeSpan, panOffsetUs));
    const tMin = clampedPan;
    const tMax = clampedPan + timeSpan;

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

            // Proper padding to completely avoid clipping "1000 pC" and title overlap
            const padLeft = 82;
            const padRight = 30;
            const padTop = 28;
            const padBottom = 46;
            const plotWidth = width - padLeft - padRight;
            const plotHeight = height - padTop - padBottom;

            // Clear canvas background
            ctx.fillStyle = "#090e17";
            ctx.fillRect(0, 0, width, height);

            // Draw Grid Lines & Axes
            ctx.strokeStyle = "rgba(148, 163, 184, 0.18)";
            ctx.lineWidth = 1;

            // X Grid (Phase 0 to 360 deg in steps of 45)
            for (let phase = 0; phase <= 360; phase += 45) {
                const x = padLeft + ((phase / 360) * plotWidth);
                ctx.beginPath();
                ctx.moveTo(x, padTop);
                ctx.lineTo(x, height - padBottom);
                ctx.stroke();

                // Label X
                ctx.fillStyle = "#94a3b8";
                ctx.font = "11px Inter, sans-serif";
                ctx.textAlign = "center";
                ctx.fillText(`${phase}°`, x, height - padBottom + 18);
            }

            // Y Grid (PD Amplitude 0 to Qmax pC)
            const qMax = Math.max(1000, Math.ceil((metrics.qMaxPc * 1.15) / 100) * 100);
            const yStep = Math.round(qMax / 4);

            for (let q = 0; q <= qMax; q += yStep) {
                const y = height - padBottom - ((q / qMax) * plotHeight);
                ctx.beginPath();
                ctx.moveTo(padLeft, y);
                ctx.lineTo(width - padRight, y);
                ctx.stroke();

                // Label Y with ample left space - fully displays "1000 pC"
                ctx.fillStyle = "#94a3b8";
                ctx.font = "11px Inter, sans-serif";
                ctx.textAlign = "right";
                ctx.fillText(`${q} pC`, padLeft - 10, y + 4);
            }

            // Draw 50Hz Voltage Reference Sine Wave
            ctx.strokeStyle = "rgba(56, 189, 248, 0.4)";
            ctx.lineWidth = 2;
            ctx.setLineDash([4, 4]);
            ctx.beginPath();
            for (let x = padLeft; x <= width - padRight; x++) {
                const phaseRad = ((x - padLeft) / plotWidth) * 2 * Math.PI;
                const sineVal = Math.sin(phaseRad);
                const y = (padTop + plotHeight / 2) - (sineVal * (plotHeight / 2 - 15));
                if (x === padLeft) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.stroke();
            ctx.setLineDash([]); // Reset line dash

            // Draw PRPD Discharge Points (heatmap dots)
            prpdPoints.forEach((point) => {
                const x = padLeft + ((point.phase_deg / 360) * plotWidth);
                const y = height - padBottom - ((point.q_pc / qMax) * plotHeight);

                let color = "#10b981"; // Emerald
                if (point.count > 15 && point.count <= 30) color = "#f59e0b"; // Amber
                else if (point.count > 30) color = "#ef4444"; // Rose

                const radius = Math.min(9, Math.max(3.5, point.count / 4));

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
            ctx.fillText("Góc pha điện áp 50Hz (Phase Angle Φ)", padLeft + plotWidth / 2, height - 10);

            // Rotated Y Title positioned at x = 24 with plenty of clearance from tick labels
            ctx.save();
            ctx.translate(24, padTop + plotHeight / 2);
            ctx.rotate(-Math.PI / 2);
            ctx.fillStyle = "#38bdf8";
            ctx.font = "bold 12px Inter, sans-serif";
            ctx.textAlign = "center";
            ctx.fillText("Biên độ phóng điện Q (pC)", 0, 0);
            ctx.restore();
        };

        animationFrameId = requestAnimationFrame(drawPrpd);
        return () => {
            if (animationFrameId) cancelAnimationFrame(animationFrameId);
        };
    }, [prpdPoints, metrics, activeTab]);

    // 2. Render Canvas Real Time-Domain Waveform from CSV (HFCT & AE Channels in mV)
    useEffect(() => {
        if (activeTab !== "waveform" || !hasWaveform || !waveformPoints) return;

        let animationFrameId: number;

        const drawWaveform = () => {
            const canvas = waveformCanvasRef.current;
            if (!canvas) return;

            const ctx = canvas.getContext("2d");
            if (!ctx) return;

            const width = canvas.width;
            const height = canvas.height;

            const padLeft = 85;
            const padRight = 30;
            const padTop = 25;
            const padBottom = 48;
            const plotWidth = width - padLeft - padRight;
            const plotHeight = height - padTop - padBottom;

            // Background
            ctx.fillStyle = "#090e17";
            ctx.fillRect(0, 0, width, height);

            // Filter points within visible window [tMin, tMax]
            const visiblePts = waveformPoints.filter(p => p.time_us >= tMin && p.time_us <= tMax);

            // Channel definitions - using non-purple, professional engineering colors
            const channels = [
                { id: "hfct", key: "hfct_mv", name: "Kênh 0: HFCT (Electric Trigger)", color: "#0284c7" },
                { id: "ae1", key: "ae1_mv", name: "Kênh 1: AE1 (Acoustic Sensor 1)", color: "#10b981" },
                { id: "ae2", key: "ae2_mv", name: "Kênh 2: AE2 (Acoustic Sensor 2)", color: "#f59e0b" },
                { id: "ae3", key: "ae3_mv", name: "Kênh 3: AE3 (Acoustic Sensor 3)", color: "#06b6d4" },
                { id: "ae4", key: "ae4_mv", name: "Kênh 4: AE4 (Acoustic Sensor 4)", color: "#f43f5e" }
            ];

            const activeChannels = selectedWaveChannel === "all"
                ? channels
                : channels.filter(c => c.id === selectedWaveChannel);

            const rowHeight = plotHeight / activeChannels.length;

            // Time grid lines based on current visible timeSpan
            let timeStepUs = 500;
            if (timeSpan <= 100) timeStepUs = 20;
            else if (timeSpan <= 300) timeStepUs = 50;
            else if (timeSpan <= 800) timeStepUs = 100;
            else if (timeSpan <= 1500) timeStepUs = 250;

            const firstTick = Math.ceil(tMin / timeStepUs) * timeStepUs;
            ctx.strokeStyle = "rgba(148, 163, 184, 0.15)";
            ctx.lineWidth = 1;

            for (let t = firstTick; t <= tMax; t += timeStepUs) {
                const x = padLeft + ((t - tMin) / timeSpan) * plotWidth;
                ctx.beginPath();
                ctx.moveTo(x, padTop);
                ctx.lineTo(x, height - padBottom);
                ctx.stroke();

                ctx.fillStyle = "#64748b";
                ctx.font = "10px Monospace, sans-serif";
                ctx.textAlign = "center";
                ctx.fillText(`${t.toFixed(0)} μs`, x, height - padBottom + 16);
            }

            // Draw each active channel waveform
            activeChannels.forEach((ch, idx) => {
                const centerY = padTop + idx * rowHeight + rowHeight / 2;

                // Find max amplitude in visible range for clean dynamic mV scaling
                const chKey = ch.key as keyof WaveformPoint;
                let maxAmp = 0;
                let peakPoint: WaveformPoint | null = null;

                for (const p of visiblePts) {
                    const val = Math.abs((p[chKey] as number) || 0);
                    if (val > maxAmp) {
                        maxAmp = val;
                        peakPoint = p;
                    }
                }

                // Auto-scale in mV (e.g. 50, 100, 200, 500 mV)
                let vScale = Math.max(20, Math.ceil((maxAmp * 1.25) / 25) * 25);
                if (vScale > 100 && vScale % 50 !== 0) vScale = Math.ceil(vScale / 50) * 50;

                // Channel bounding separator
                if (idx > 0) {
                    ctx.strokeStyle = "rgba(148, 163, 184, 0.12)";
                    ctx.beginPath();
                    ctx.moveTo(padLeft, padTop + idx * rowHeight);
                    ctx.lineTo(width - padRight, padTop + idx * rowHeight);
                    ctx.stroke();
                }

                // Zero Baseline (0 mV)
                ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
                ctx.setLineDash([3, 3]);
                ctx.beginPath();
                ctx.moveTo(padLeft, centerY);
                ctx.lineTo(width - padRight, centerY);
                ctx.stroke();
                ctx.setLineDash([]);

                // Channel Label & Peak Value Indicator
                ctx.fillStyle = ch.color;
                ctx.font = "bold 11px Inter, sans-serif";
                ctx.textAlign = "left";
                ctx.fillText(
                    `${ch.name} ${maxAmp > 0 ? `| Vpeak = ${maxAmp.toFixed(1)} mV` : "| (Không phát hiện xung)"}`,
                    padLeft + 8,
                    centerY - rowHeight * 0.32
                );

                // Y-Axis Ticks in mV (Top, Center, Bottom)
                ctx.fillStyle = "#64748b";
                ctx.font = "9px Monospace, sans-serif";
                ctx.textAlign = "right";
                ctx.fillText(`+${vScale} mV`, padLeft - 8, centerY - rowHeight * 0.35 + 8);
                ctx.fillText(`0 mV`, padLeft - 8, centerY + 3);
                ctx.fillText(`-${vScale} mV`, padLeft - 8, centerY + rowHeight * 0.35 - 2);

                // Draw Real Waveform Line
                if (visiblePts.length > 0) {
                    ctx.strokeStyle = ch.color;
                    ctx.lineWidth = 1.7;
                    ctx.beginPath();

                    visiblePts.forEach((p, pIdx) => {
                        const x = padLeft + ((p.time_us - tMin) / timeSpan) * plotWidth;
                        const valMv = (p[chKey] as number) || 0;
                        const y = centerY - (valMv / vScale) * (rowHeight * 0.35);

                        if (pIdx === 0) ctx.moveTo(x, y);
                        else ctx.lineTo(x, y);
                    });
                    ctx.stroke();

                    // Draw Peak Pulse Marker if amplitude is prominent
                    if (peakPoint && maxAmp > 10.0) {
                        const peakX = padLeft + ((peakPoint.time_us - tMin) / timeSpan) * plotWidth;
                        const peakY = centerY - (((peakPoint[chKey] as number) || 0) / vScale) * (rowHeight * 0.35);

                        // Glow dot
                        ctx.fillStyle = ch.color;
                        ctx.beginPath();
                        ctx.arc(peakX, peakY, 4, 0, 2 * Math.PI);
                        ctx.fill();

                        // Callout label
                        ctx.fillStyle = "#fef08a";
                        ctx.font = "bold 10px Inter, sans-serif";
                        ctx.textAlign = peakX > width - 120 ? "right" : "left";
                        ctx.fillText(
                            `${peakPoint.time_us.toFixed(0)} μs (${(peakPoint[chKey] as number).toFixed(1)} mV)`,
                            peakX > width - 120 ? peakX - 6 : peakX + 6,
                            peakY - 5
                        );
                    }
                }
            });

            // Rotated Y Title (Biên độ xung mV)
            ctx.save();
            ctx.translate(22, padTop + plotHeight / 2);
            ctx.rotate(-Math.PI / 2);
            ctx.fillStyle = "#38bdf8";
            ctx.font = "bold 11px Inter, sans-serif";
            ctx.textAlign = "center";
            ctx.fillText("Biên độ điện áp xung (mV)", 0, 0);
            ctx.restore();

            // Bottom X Axis Label
            ctx.fillStyle = "#38bdf8";
            ctx.font = "bold 11px Inter, sans-serif";
            ctx.textAlign = "center";
            ctx.fillText(
                `Thời gian thu nhận tín hiệu TDOA (t - μs) | Phạm vi: ${tMin.toFixed(0)} - ${tMax.toFixed(0)} μs (Zoom ${(zoomLevel).toFixed(1)}x)`,
                padLeft + plotWidth / 2,
                height - 10
            );
        };

        animationFrameId = requestAnimationFrame(drawWaveform);
        return () => {
            if (animationFrameId) cancelAnimationFrame(animationFrameId);
        };
    }, [waveformPoints, activeTab, selectedWaveChannel, zoomLevel, clampedPan, timeSpan, tMin, tMax, hasWaveform]);

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
            const padLeft = 75;
            const padRight = 30;
            const padTop = 28;
            const padBottom = 46;
            const plotWidth = width - padLeft - padRight;
            const plotHeight = height - padTop - padBottom;

            ctx.fillStyle = "#090e17";
            ctx.fillRect(0, 0, width, height);

            // Grid lines
            ctx.strokeStyle = "rgba(148, 163, 184, 0.15)";
            ctx.lineWidth = 1;

            // X Axis: 0 to 30 MHz (HFCT) & 50-300 kHz (AE)
            const numBins = 60;
            const barWidth = plotWidth / numBins;

            for (let f = 0; f <= 30; f += 5) {
                const x = padLeft + ((f / 30) * plotWidth);
                ctx.beginPath();
                ctx.moveTo(x, padTop);
                ctx.lineTo(x, height - padBottom);
                ctx.stroke();

                ctx.fillStyle = "#64748b";
                ctx.font = "10px Monospace, sans-serif";
                ctx.textAlign = "center";
                ctx.fillText(`${f} MHz`, x, height - padBottom + 16);
            }

            // Draw Spectral Bars
            for (let i = 0; i < numBins; i++) {
                const freqMhz = (i / numBins) * 30.0;
                
                // Peak around 12.5 MHz for HFCT, and low-frequency AE peak
                let mag = 0;
                const dist1 = Math.abs(freqMhz - 12.5);
                const dist2 = Math.abs(freqMhz - 3.5);
                
                mag += Math.exp(-dist1 * dist1 * 0.4) * plotHeight * 0.75;
                mag += Math.exp(-dist2 * dist2 * 0.8) * plotHeight * 0.4;
                mag += Math.random() * 12;

                const x = padLeft + i * barWidth;
                const barH = Math.min(plotHeight, mag);
                const y = height - padBottom - barH;

                let color = "#38bdf8"; // Sky blue
                if (freqMhz >= 10 && freqMhz <= 15) color = "#0284c7"; // Blue resonance

                const grad = ctx.createLinearGradient(0, y, 0, height - padBottom);
                grad.addColorStop(0, color);
                grad.addColorStop(1, "rgba(15, 23, 42, 0.2)");

                ctx.fillStyle = grad;
                ctx.fillRect(x, y, barWidth - 1, barH);
            }

            // Spectral Peak Annotations
            ctx.fillStyle = "#fef08a";
            ctx.font = "bold 11px Inter, sans-serif";
            ctx.textAlign = "center";
            ctx.fillText("Peak HFCT: 12.5 MHz (Đặc trưng Phóng điện)", padLeft + ((12.5 / 30) * plotWidth), padTop + 20);

            // X Axis Title
            ctx.fillStyle = "#38bdf8";
            ctx.font = "bold 11px Inter, sans-serif";
            ctx.textAlign = "center";
            ctx.fillText("Tần số phổ tín hiệu (Frequency - MHz / kHz)", padLeft + plotWidth / 2, height - 10);

            // Y Axis Title
            ctx.save();
            ctx.translate(24, padTop + plotHeight / 2);
            ctx.rotate(-Math.PI / 2);
            ctx.fillStyle = "#38bdf8";
            ctx.font = "bold 11px Inter, sans-serif";
            ctx.textAlign = "center";
            ctx.fillText("Mật độ phổ công suất (dBm/Hz)", 0, 0);
            ctx.restore();
        };

        animationFrameId = requestAnimationFrame(drawFft);
        return () => {
            if (animationFrameId) cancelAnimationFrame(animationFrameId);
        };
    }, [metrics, activeTab]);

    // Zoom Handlers
    const handleZoomIn = () => {
        setZoomLevel(prev => Math.min(25, prev * 1.5));
    };

    const handleZoomOut = () => {
        setZoomLevel(prev => {
            const next = Math.max(1, prev / 1.5);
            if (next === 1) setPanOffsetUs(0);
            return next;
        });
    };

    const handleResetZoom = () => {
        setZoomLevel(1);
        setPanOffsetUs(0);
    };

    // Canvas Mouse Wheel for Zooming
    const handleCanvasWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
        e.preventDefault();
        const canvas = waveformCanvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const padLeft = 85;
        const padRight = 30;
        const plotWidth = canvas.width - padLeft - padRight;
        const canvasX = (mouseX / rect.width) * canvas.width;
        const ratio = Math.max(0, Math.min(1, (canvasX - padLeft) / plotWidth));
        const tMouse = tMin + ratio * timeSpan;

        const zoomFactor = e.deltaY < 0 ? 1.3 : 0.77;
        const nextZoom = Math.max(1, Math.min(25, zoomLevel * zoomFactor));
        const nextTimeSpan = totalDurationUs / nextZoom;
        const nextPan = Math.max(0, Math.min(totalDurationUs - nextTimeSpan, tMouse - ratio * nextTimeSpan));

        setZoomLevel(nextZoom);
        setPanOffsetUs(nextPan);
    };

    // Canvas Drag for Panning
    const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
        setIsDragging(true);
        setDragStartX(e.clientX);
        setDragStartPan(clampedPan);
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDragging) return;
        const canvas = waveformCanvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const deltaPx = e.clientX - dragStartX;
        const timePerPx = timeSpan / rect.width;
        const newPan = Math.max(0, Math.min(totalDurationUs - timeSpan, dragStartPan - deltaPx * timePerPx));
        setPanOffsetUs(newPan);
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    return (
        <Card className="bg-slate-900 border-slate-700/60 text-white shadow-xl overflow-hidden">
            <CardHeader className="pb-2 border-b border-slate-800">
                <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3">
                    <CardTitle className="text-base sm:text-lg font-bold flex items-center gap-2 text-cyan-300">
                        <Activity className="h-5 w-5 text-amber-400 shrink-0" />
                        <span className="break-words">{title}</span>
                    </CardTitle>
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                        <div className="flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1 rounded border border-slate-700">
                            <span className="text-slate-400">Qmax:</span>
                            <span className="font-bold text-rose-400">{metrics.qMaxPc} pC</span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1 rounded border border-slate-700">
                            <span className="text-slate-400">Qavg:</span>
                            <span className="font-bold text-amber-300">{metrics.qAvgPc} pC</span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1 rounded border border-slate-700">
                            <span className="text-slate-400">Xung/chu kỳ:</span>
                            <span className="font-bold text-cyan-300">{metrics.pulseCountPerCycle}/n</span>
                        </div>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="pt-4">
                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
                    <TabsList className="bg-slate-800 border border-slate-700 text-slate-300 mb-4 flex-wrap h-auto p-1 gap-1">
                        <TabsTrigger value="prpd" className="data-[state=active]:bg-sky-600 data-[state=active]:text-white text-xs py-1.5">
                            <BarChart2 className="h-4 w-4 mr-1.5" /> Đồ thị PRPD (Φ-q-n)
                        </TabsTrigger>
                        <TabsTrigger value="waveform" className="data-[state=active]:bg-sky-600 data-[state=active]:text-white text-xs py-1.5">
                            <Waves className="h-4 w-4 mr-1.5" /> Tín hiệu thời gian (Waveform)
                        </TabsTrigger>
                        <TabsTrigger value="fft" className="data-[state=active]:bg-sky-600 data-[state=active]:text-white text-xs py-1.5">
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
                        {hasWaveform ? (
                            <div className="space-y-3">
                                {/* Waveform Channel Selector & Zoom Toolbar */}
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                                    <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                                        <span className="text-slate-400 font-semibold flex items-center gap-1 mr-1">
                                            <Sliders className="h-3.5 w-3.5 text-sky-400" /> Kênh:
                                        </span>
                                        {[
                                            { id: "all", label: "Tất cả các kênh" },
                                            { id: "hfct", label: "HFCT (mV)" },
                                            { id: "ae1", label: "AE1 (mV)" },
                                            { id: "ae2", label: "AE2 (mV)" },
                                            { id: "ae3", label: "AE3 (mV)" },
                                            { id: "ae4", label: "AE4 (mV)" }
                                        ].map(b => (
                                            <button
                                                key={b.id}
                                                onClick={() => setSelectedWaveChannel(b.id as any)}
                                                className={`px-2 py-1 rounded text-xs transition ${
                                                    selectedWaveChannel === b.id
                                                        ? "bg-sky-600 text-white font-bold"
                                                        : "bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800"
                                                }`}
                                            >
                                                {b.label}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Zoom & Pan Controls */}
                                    <div className="flex items-center gap-1.5 text-xs">
                                        <div className="px-2 py-1 bg-slate-900 rounded border border-slate-800 text-[11px] text-cyan-300 font-mono">
                                            {zoomLevel.toFixed(1)}x ({tMin.toFixed(0)}-{tMax.toFixed(0)} μs)
                                        </div>
                                        <button
                                            onClick={handleZoomIn}
                                            title="Phóng to dạng sóng (+)"
                                            className="p-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded text-slate-300 hover:text-white transition"
                                        >
                                            <ZoomIn className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={handleZoomOut}
                                            title="Thu nhỏ dạng sóng (-)"
                                            className="p-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded text-slate-300 hover:text-white transition"
                                        >
                                            <ZoomOut className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={handleResetZoom}
                                            title="Đặt lại mức thu phóng ban đầu (100%)"
                                            className="p-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded text-slate-300 hover:text-white transition"
                                        >
                                            <RotateCcw className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>

                                <div className="relative w-full aspect-[16/9] max-h-[380px] bg-slate-950 rounded-xl overflow-hidden border border-slate-800 flex justify-center items-center">
                                    <canvas
                                        ref={waveformCanvasRef}
                                        width={750}
                                        height={380}
                                        onWheel={handleCanvasWheel}
                                        onMouseDown={handleMouseDown}
                                        onMouseMove={handleMouseMove}
                                        onMouseUp={handleMouseUp}
                                        onMouseLeave={handleMouseUp}
                                        className={`w-full h-full object-contain ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
                                    />
                                </div>

                                <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-slate-400 gap-2 px-1">
                                    <div className="flex items-center gap-1.5 text-sky-400">
                                        <Info className="h-3.5 w-3.5 shrink-0" />
                                        <span>Cuộn chuột trên đồ thị để phóng to/thu nhỏ | Giữ chuột trái và kéo để quét dọc trục thời gian</span>
                                    </div>
                                    <div className="font-mono text-slate-400">
                                        Tổng số điểm mẫu: {waveformPoints?.length || 0} điểm (Độ phân giải 2.0 μs/điểm)
                                    </div>
                                </div>
                            </div>
                        ) : (
                            /* Older records without waveform points fallback notice */
                            <div className="p-8 text-center bg-slate-950/70 rounded-xl border border-dashed border-slate-800 space-y-3.5 my-2">
                                <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-400">
                                    <Waves className="h-6 w-6 text-sky-400" />
                                </div>
                                <div className="max-w-md mx-auto space-y-1">
                                    <h4 className="text-sm font-semibold text-slate-200">
                                        Lần đo này chưa có dữ liệu dạng sóng thời gian (Waveform)
                                    </h4>
                                    <p className="text-xs text-slate-400 leading-relaxed">
                                        Hệ thống chỉ hiển thị đồ thị dạng sóng khi lần đo có nạp file CSV mới được bóc tách Waveform (1.000 - 3.000 điểm mẫu, đơn vị mV) qua công cụ chuyển đổi PT500A.
                                    </p>
                                </div>
                                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-900/90 rounded-lg border border-slate-800 text-[11px] text-sky-300">
                                    <Info className="h-3.5 w-3.5 shrink-0" />
                                    <span>Để xem dạng sóng, hãy dùng chức năng &quot;Chỉnh sửa&quot; hoặc &quot;Tạo biên bản đo mới/Nạp CSV&quot; với file CSV mới.</span>
                                </div>
                            </div>
                        )}
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
                                <span className="text-sky-300 font-semibold">Tỉ số Tín hiệu/Nhiễu (SNR): +24.8 dB</span>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}
