"use client";

import { useEffect, useRef, useState } from "react";
import { Localization3D, SensorSetup, TankDimensions } from "@/types/pd-online";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Box, Camera, RefreshCw, Layers, ShieldAlert, Cpu } from "lucide-react";

interface Transformer3DViewerProps {
    tankDimensions: TankDimensions;
    sensorsSetup: SensorSetup[];
    localization3D: Localization3D;
    riskLevel?: "NORMAL" | "WATCH" | "CRITICAL";
}

export function Transformer3DViewer({
    tankDimensions,
    sensorsSetup,
    localization3D,
    riskLevel = "WATCH"
}: Transformer3DViewerProps) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [rotationAngle, setRotationAngle] = useState({ rx: 0.35, ry: 0.65 });
    const [isDragging, setIsDragging] = useState(false);
    const [lastMouse, setLastMouse] = useState({ x: 0, y: 0 });

    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        setLastMouse({ x: e.clientX, y: e.clientY });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return;
        const dx = e.clientX - lastMouse.x;
        const dy = e.clientY - lastMouse.y;
        setRotationAngle(prev => ({
            rx: prev.rx + dy * 0.008,
            ry: prev.ry + dx * 0.008
        }));
        setLastMouse({ x: e.clientX, y: e.clientY });
    };

    const handleMouseUp = () => setIsDragging(false);

    // Render 3D Canvas
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let animationFrameId: number;

        const render = () => {
            const width = canvas.width;
            const height = canvas.height;
            const cx = width / 2;
            const cy = height / 2 + 20;

            ctx.fillStyle = "#090d16";
            ctx.fillRect(0, 0, width, height);

            // 3D Projection Helpers
            const scale = 50; // pixels per meter
            const rx = rotationAngle.rx;
            const ry = rotationAngle.ry;

            const project = (x: number, y: number, z: number) => {
                // Center coordinates relative to tank center
                const cx_m = x - tankDimensions.length_m / 2;
                const cy_m = y - tankDimensions.width_m / 2;
                const cz_m = z - tankDimensions.height_m / 2;

                // Rotate around Y then X
                const x1 = cx_m * Math.cos(ry) + cy_m * Math.sin(ry);
                const y1 = cy_m * Math.cos(ry) - cx_m * Math.sin(ry);

                const y2 = y1 * Math.cos(rx) - cz_m * Math.sin(rx);
                const z2 = cz_m * Math.cos(rx) + y1 * Math.sin(rx);

                const px = cx + x1 * scale;
                const py = cy - y2 * scale;
                return { x: px, y: py, z: z2 };
            };

            // Tank 8 Vertices
            const L = tankDimensions.length_m;
            const W = tankDimensions.width_m;
            const H = tankDimensions.height_m;

            const vertices = [
                project(0, 0, 0), project(L, 0, 0), project(L, W, 0), project(0, W, 0),
                project(0, 0, H), project(L, 0, H), project(L, W, H), project(0, W, H)
            ];

            const edges = [
                [0, 1], [1, 2], [2, 3], [3, 0], // Bottom base
                [4, 5], [5, 6], [6, 7], [7, 4], // Top base
                [0, 4], [1, 5], [2, 6], [3, 7]  // Vertical pillars
            ];

            // Draw Tank Grid Base / Floor Reference
            ctx.strokeStyle = "rgba(71, 85, 105, 0.3)";
            ctx.lineWidth = 1;
            edges.forEach(([i, j]) => {
                ctx.beginPath();
                ctx.moveTo(vertices[i].x, vertices[i].y);
                ctx.lineTo(vertices[j].x, vertices[j].y);
                ctx.stroke();
            });

            // Tank Semi-transparent Faces
            ctx.fillStyle = "rgba(99, 102, 241, 0.08)";
            ctx.beginPath();
            ctx.moveTo(vertices[4].x, vertices[4].y);
            ctx.lineTo(vertices[5].x, vertices[5].y);
            ctx.lineTo(vertices[6].x, vertices[6].y);
            ctx.lineTo(vertices[7].x, vertices[7].y);
            ctx.closePath();
            ctx.fill();

            // Draw 3 High-Voltage Bushings on top cover
            const bushingX = [L * 0.25, L * 0.5, L * 0.75];
            bushingX.forEach((bx, idx) => {
                const bBase = project(bx, W / 2, H);
                const bTop = project(bx, W / 2, H + 0.9);

                ctx.strokeStyle = "#38bdf8";
                ctx.lineWidth = 4;
                ctx.beginPath();
                ctx.moveTo(bBase.x, bBase.y);
                ctx.lineTo(bTop.x, bTop.y);
                ctx.stroke();

                ctx.fillStyle = "#38bdf8";
                ctx.beginPath();
                ctx.arc(bTop.x, bTop.y, 5, 0, 2 * Math.PI);
                ctx.fill();

                ctx.fillStyle = "#94a3b8";
                ctx.font = "10px Inter, sans-serif";
                ctx.fillText(`Pha ${String.fromCharCode(65 + idx)}`, bTop.x - 12, bTop.y - 8);
            });

            // Draw 3 Transformer Coils Inside Tank (wireframe cylinders)
            [L * 0.25, L * 0.5, L * 0.75].forEach((cx_m) => {
                const cBottom = project(cx_m, W / 2, H * 0.15);
                const cTop = project(cx_m, W / 2, H * 0.85);

                ctx.strokeStyle = "rgba(251, 191, 36, 0.4)";
                ctx.lineWidth = 10;
                ctx.beginPath();
                ctx.moveTo(cBottom.x, cBottom.y);
                ctx.lineTo(cTop.x, cTop.y);
                ctx.stroke();
            });

            // Draw 4 AE Sensors Mounted on Tank Walls
            sensorsSetup.filter(s => s.sensorId.startsWith("AE")).forEach((s) => {
                const sp = project(s.x_m, s.y_m, s.z_m);

                ctx.fillStyle = "#34d399";
                ctx.beginPath();
                ctx.arc(sp.x, sp.y, 6, 0, 2 * Math.PI);
                ctx.fill();

                ctx.strokeStyle = "#ffffff";
                ctx.lineWidth = 1.5;
                ctx.stroke();

                ctx.fillStyle = "#a7f3d0";
                ctx.font = "bold 11px Inter, sans-serif";
                ctx.fillText(s.sensorId, sp.x + 8, sp.y + 4);
            });

            // Draw Glowing 3D PD Hotspot (TDOA Acoustic Calculated Location)
            const pdCoord = localization3D.computedCoord;
            const pdp = project(pdCoord.x, pdCoord.y, pdCoord.z);

            const pulseTime = Date.now() * 0.005;
            const pulseRadius = 10 + Math.sin(pulseTime) * 4;

            let spotColor = "#f87171"; // Red for critical/warning
            if (riskLevel === "WATCH") spotColor = "#fbbf24";
            if (riskLevel === "NORMAL") spotColor = "#34d399";

            const grad = ctx.createRadialGradient(pdp.x, pdp.y, 0, pdp.x, pdp.y, pulseRadius * 2.5);
            grad.addColorStop(0, spotColor);
            grad.addColorStop(1, "rgba(0,0,0,0)");

            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(pdp.x, pdp.y, pulseRadius * 2.5, 0, 2 * Math.PI);
            ctx.fill();

            ctx.fillStyle = spotColor;
            ctx.beginPath();
            ctx.arc(pdp.x, pdp.y, 6, 0, 2 * Math.PI);
            ctx.fill();
            ctx.strokeStyle = "#ffffff";
            ctx.lineWidth = 2;
            ctx.stroke();

            // Label PD Hotspot Coordinates
            ctx.fillStyle = "#fef08a";
            ctx.font = "bold 12px Inter, sans-serif";
            ctx.fillText(`PD Hotspot (${pdCoord.x}m, ${pdCoord.y}m, ${pdCoord.z}m)`, pdp.x + 12, pdp.y - 12);
            ctx.fillStyle = "#94a3b8";
            ctx.font = "10px Inter, sans-serif";
            ctx.fillText(`Vị trí: ${localization3D.nearestComponent} (Sai số ±${localization3D.errorMarginM}m)`, pdp.x + 12, pdp.y + 4);

            animationFrameId = requestAnimationFrame(render);
        };

        render();

        return () => cancelAnimationFrame(animationFrameId);
    }, [tankDimensions, sensorsSetup, localization3D, rotationAngle, riskLevel]);

    const resetView = () => setRotationAngle({ rx: 0.35, ry: 0.65 });

    return (
        <Card className="bg-slate-900 border-indigo-500/30 text-white shadow-xl">
            <CardHeader className="pb-2 border-b border-indigo-500/20">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <CardTitle className="text-lg font-bold flex items-center gap-2 text-indigo-300">
                        <Box className="h-5 w-5 text-indigo-400" />
                        Mô phỏng 3D Định vị Nguồn phóng điện TDOA (Acoustic Localization)
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm" onClick={resetView} className="bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700">
                            <RefreshCw className="h-3.5 w-3.5 mr-1" /> Reset Góc nhìn 3D
                        </Button>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="pt-4">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* 3D Canvas Box */}
                    <div className="lg:col-span-2 relative aspect-[16/10] bg-slate-950 rounded-xl overflow-hidden border border-slate-800 cursor-grab active:cursor-grabbing"
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                    >
                        <canvas
                            ref={canvasRef}
                            width={600}
                            height={380}
                            className="w-full h-full object-contain"
                        />
                        <div className="absolute bottom-2 left-2 bg-slate-900/80 backdrop-blur px-2.5 py-1 rounded text-[11px] text-slate-400 border border-slate-800">
                            💡 Kéo chuột để xoay mô hình 3D vỏ thùng MBA 110kV
                        </div>
                    </div>

                    {/* Localization Info Panel */}
                    <div className="space-y-3 bg-slate-950 p-4 rounded-xl border border-slate-800 text-sm">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                            <span className="text-slate-400 flex items-center gap-1.5"><Layers className="h-4 w-4 text-indigo-400" /> Tọa độ điểm PD (x, y, z):</span>
                            <span className="font-mono font-bold text-amber-300">
                                ({localization3D.computedCoord.x}m, {localization3D.computedCoord.y}m, {localization3D.computedCoord.z}m)
                            </span>
                        </div>

                        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                            <span className="text-slate-400 flex items-center gap-1.5"><ShieldAlert className="h-4 w-4 text-rose-400" /> Vùng bị ảnh hưởng:</span>
                            <span className="font-bold text-white text-xs">{localization3D.nearestComponent}</span>
                        </div>

                        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                            <span className="text-slate-400">Bán kính sai số (±Δr):</span>
                            <span className="font-bold text-cyan-300">±{localization3D.errorMarginM} m</span>
                        </div>

                        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                            <span className="text-slate-400">Vận tốc truyền sóng âm:</span>
                            <span className="font-bold text-slate-300">{localization3D.waveVelocityUsedMps} m/s (dầu 55°C)</span>
                        </div>

                        <div className="pt-2">
                            <span className="text-xs text-slate-400 block mb-1.5 font-semibold">Tọa độ 4 Đầu dò Siêu âm AE (Sensor Setup):</span>
                            <div className="space-y-1 text-xs">
                                {sensorsSetup.filter(s => s.sensorId.startsWith("AE")).map((s, idx) => (
                                    <div key={s.sensorId} className="flex justify-between items-center bg-slate-900/60 p-1.5 rounded border border-slate-800">
                                        <span className="text-emerald-400 font-bold">{s.sensorId}:</span>
                                        <span className="text-slate-300 font-mono">({s.x_m}m, {s.y_m}m, {s.z_m}m)</span>
                                        <span className="text-slate-400 text-[10px]">{s.attachedTo}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
