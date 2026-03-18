"use client";

import React, { useState, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import Image from "next/image";

interface PageProps {
  children: React.ReactNode;
  pageNumber: number;
  isLeft?: boolean;
}

const Page = React.forwardRef<HTMLDivElement, PageProps>(({ children, pageNumber, isLeft }, ref) => {
  return (
    <div
      ref={ref}
      className={`absolute inset-0 w-full h-full bg-white shadow-2xl overflow-hidden flex flex-col p-10 ${
        isLeft ? "rounded-l-lg border-r border-slate-100" : "rounded-r-lg border-l border-slate-100"
      }`}
      style={{ backfaceVisibility: "hidden" }}
    >
      <div className="flex-1 flex flex-col relative">
        {children}
        <div className={`absolute bottom-0 ${isLeft ? "left-0" : "right-0"} text-slate-300 text-[10px] font-mono uppercase tracking-widest`}>
          MTE-LAB | {pageNumber}
        </div>
      </div>
      {/* Decorative inner shade for book spine depth */}
      <div className={`absolute top-0 bottom-0 w-12 opacity-10 pointer-events-none ${
        isLeft ? "right-0 bg-gradient-to-l from-black to-transparent" : "left-0 bg-gradient-to-r from-black to-transparent"
      }`} />
    </div>
  );
});

Page.displayName = "Page";

export default function Flipbook() {
  const [currentSpread, setCurrentSpread] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);

  // Content for pages
  const pageContents = useMemo(() => [
    // Page 1: Cover (Right strictly)
    { type: 'cover', content: (
      <div className="flex flex-col items-center justify-center h-full text-center space-y-8">
        <div className="relative w-40 h-40">
          <Image src="/images/LogoCPCCPSC_bg_White.png" alt="Logo" fill className="object-contain" unoptimized />
        </div>
        <div className="space-y-2">
          <h1 className="text-5xl font-black text-[#3a0ca3] tracking-tighter leading-none">HỒ SƠ<br/>NĂNG LỰC</h1>
          <p className="text-[#4cc9f0] font-bold tracking-[0.2em] text-sm">DIGITAL PROFILE 2026</p>
        </div>
        <div className="w-24 h-1 bg-[#3a0ca3]"></div>
        <div className="text-slate-400 font-mono text-[10px] uppercase tracking-widest">
          Phòng Thử Nghiệm MTE-LAB
        </div>
      </div>
    )},
    // Page 2: Introduction
    { type: 'content', title: 'Tầm Nhìn & Sứ Mệnh', content: (
      <div className="space-y-6">
        <p className="text-slate-600 leading-relaxed first-letter:text-4xl first-letter:font-bold first-letter:text-[#3a0ca3] first-letter:mr-2 first-letter:float-left">
          MTE-LAB định hướng trở thành trung tâm thí nghiệm điện hàng đầu Khu vực Miền Trung - Tây Nguyên, cung cấp các giải pháp kỹ thuật tin cậy và chính xác nhất cho hạ tầng năng lượng quốc gia.
        </p>
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded bg-blue-50 flex items-center justify-center text-[#3a0ca3] font-bold">01</div>
            <p className="text-sm text-slate-500"><strong className="text-slate-800">Chất lượng:</strong> Tuân thủ nghiêm ngặt hệ thống ISO/IEC 17025.</p>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded bg-pink-50 flex items-center justify-center text-[#f72585] font-bold">02</div>
            <p className="text-sm text-slate-500"><strong className="text-slate-800">Con người:</strong> Đội ngũ kỹ sư giàu kinh nghiệm, đào tạo chuyên sâu.</p>
          </div>
        </div>
      </div>
    )},
    // Page 3: Experience
    { type: 'content', title: 'Kinh Nghiệm Thực Tiễn', content: (
      <div className="grid grid-cols-2 gap-4">
        {[
          { label: 'Dự án hoàn thành', val: '500+' },
          { label: 'Khách hàng tin dùng', val: '120+' },
          { label: 'Thiết bị thí nghiệm', val: '200+' },
          { label: 'Năm hoạt động', val: '20+' },
        ].map((s, i) => (
          <div key={i} className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col justify-center items-center text-center">
            <span className="text-2xl font-black text-[#4cc9f0]">{s.val}</span>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{s.label}</span>
          </div>
        ))}
        <div className="col-span-2 p-4 border border-dashed border-slate-200 rounded-xl">
          <p className="text-xs text-slate-500 italic">Thực hiện thí nghiệm định kỳ cho hơn 100 trạm biến áp 110kV tại Miền Trung.</p>
        </div>
      </div>
    )},
    // Page 4: Services Detailed
    { type: 'content', title: 'Dịch Vụ Kỹ Thuật', content: (
      <div className="space-y-3">
        {[
          "Thí nghiệm MBA công suất lớn (đến 250MVA).",
          "Kiểm định MC, DCL 110kV - 220kV.",
          "Phân tích hàm lượng khí hòa tan (DGA) trong dầu.",
          "Thử nghiệm cáp ngầm trung & cao thế.",
          "Cung cấp giải pháp bảo dưỡng hướng tới tin cậy (RCM)."
        ].map((item, i) => (
          <div key={i} className="flex items-center gap-3 p-2 bg-slate-50/50 rounded-lg group">
            <div className="w-1.5 h-1.5 rounded-full bg-[#3a0ca3] group-hover:scale-150 transition-transform" />
            <span className="text-sm text-slate-700">{item}</span>
          </div>
        ))}
      </div>
    )},
    // Page 5: Certifications
    { type: 'content', title: 'Tiêu Chuẩn Quốc Tế', content: (
      <div className="flex flex-col gap-6">
        <div className="p-4 border-l-4 border-[#4cc9f0] bg-blue-50/30">
          <h4 className="font-bold text-slate-800">ISO/IEC 17025:2017</h4>
          <p className="text-xs text-slate-500">Tiêu chuẩn vàng cho năng lực phòng thử nghiệm.</p>
        </div>
        <div className="p-4 border-l-4 border-[#3a0ca3] bg-indigo-50/30">
          <h4 className="font-bold text-slate-800">ISO 9001:2015</h4>
          <p className="text-xs text-slate-500">Quản lý quy trình chất lượng đồng nhất.</p>
        </div>
        <div className="p-4 border-l-4 border-[#f72585] bg-pink-50/30">
          <h4 className="font-bold text-slate-800">VALAS 019</h4>
          <p className="text-xs text-slate-500">Chứng nhận năng lực thí nghiệm chuyên ngành điện.</p>
        </div>
      </div>
    )},
    // Page 6: Contact & Credits
    { type: 'content', title: 'Thông Tin Liên Hệ', content: (
      <div className="h-full flex flex-col justify-between py-4">
        <div className="space-y-4">
          <div>
            <span className="text-[10px] font-bold text-slate-400 block uppercase">Địa chỉ</span>
            <span className="text-sm text-slate-700">145 Xô Viết Nghệ Tĩnh, Đà Nẵng</span>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 block uppercase">Email</span>
            <span className="text-sm text-slate-700">mte.lab@evncpc.vn</span>
          </div>
          <div className="pt-4">
            <div className="flex gap-2">
              <div className="w-12 h-1 bg-[#3a0ca3]" />
              <div className="w-12 h-1 bg-[#4cc9f0]" />
              <div className="w-12 h-1 bg-[#f72585]" />
            </div>
          </div>
        </div>
        <div className="text-center opacity-40 grayscale group-hover:grayscale-0 transition-all cursor-crosshair">
          <Image src="/images/LogoCPCCPSC_bg_White.png" alt="MTE" width={100} height={50} className="mx-auto" unoptimized />
        </div>
      </div>
    )}
  ], []);

  // Split content into spreads of 2 pages
  const spreads = useMemo(() => {
    // Page index: 0 is right (cover), then spreads of [left, right]
    const list = [];
    // Spread 0: [null, page0]
    list.push([null, pageContents[0]]);
    // Other spreads
    for (let i = 1; i < pageContents.length; i += 2) {
      list.push([pageContents[i], pageContents[i+1] || null]);
    }
    return list;
  }, [pageContents]);

  const nextSpread = () => {
    if (currentSpread < spreads.length - 1 && !isFlipping) {
      setIsFlipping(true);
      setCurrentSpread(prev => prev + 1);
      setTimeout(() => setIsFlipping(false), 800);
    }
  };

  const prevSpread = () => {
    if (currentSpread > 0 && !isFlipping) {
      setIsFlipping(true);
      setCurrentSpread(prev => prev - 1);
      setTimeout(() => setIsFlipping(false), 800);
    }
  };

  const exportToPDF = async () => {
    if (!exportRef.current) return;
    setIsExporting(true);

    try {
      const pdf = new jsPDF("l", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      // Render all spreads as single A4 landscape pages
      for (let i = 0; i < spreads.length; i++) {
        const canvas = await html2canvas(exportRef.current.querySelector(`[data-spread-index="${i}"]`) as HTMLElement, {
          scale: 2,
          useCORS: true,
          logging: false
        });

        const imgData = canvas.toDataURL("image/png");
        if (i > 0) pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, 0, pageWidth, pageHeight);
      }

      pdf.save("MTE-LAB_Capability_Profile_Digital.pdf");
    } catch (error) {
      console.error("PDF Export failed", error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="relative w-full h-screen flex flex-col items-center justify-center py-20 bg-transparent">
      
      {/* Container for PDF Generation */}
      <div className="fixed -left-[4000px] -top-[4000px]">
        <div ref={exportRef}>
          {spreads.map((spread, idx) => (
            <div key={`exp-${idx}`} data-spread-index={idx} className="w-[297mm] h-[210mm] flex bg-white">
              <div className="w-1/2 h-full border-r border-slate-100 flex flex-col p-16">
                 {spread[0]?.title && <h3 className="text-2xl font-black mb-8 text-[#3a0ca3]">{spread[0].title}</h3>}
                 {spread[0]?.content}
              </div>
              <div className="w-1/2 h-full flex flex-col p-16">
                 {spread[1]?.title && <h3 className="text-2xl font-black mb-8 text-[#3a0ca3]">{spread[1].title}</h3>}
                 {spread[1]?.content}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Flipbook View (A4 Landscape Ratio = 1.414) */}
      <div className="relative w-[1120px] h-[400px] flex items-center justify-center perspective-2000">
        
        {/* Double Page UI */}
        <div className="relative w-[1000px] h-[350px] preserve-3d">
          
          <AnimatePresence initial={false} mode="wait">
            <motion.div
              key={currentSpread}
              initial={{ rotateY: 10, opacity: 0 }}
              animate={{ rotateY: 0, opacity: 1 }}
              exit={{ rotateY: -10, opacity: 0 }}
              transition={{ duration: 0.8, ease: "anticipate" }}
              className="absolute inset-0 flex"
            >
              {/* Left Page */}
              <div className="w-1/2 h-full relative">
                {spreads[currentSpread][0] ? (
                  <Page pageNumber={currentSpread * 2} isLeft>
                    {spreads[currentSpread][0].title && <h3 className="text-2xl font-black mb-6 text-[#3a0ca3] tracking-tight">{spreads[currentSpread][0].title}</h3>}
                    {spreads[currentSpread][0].content}
                  </Page>
                ) : (
                  <div className="inset-0 w-full h-full bg-black/5 backdrop-blur-sm rounded-l-lg border-r border-white/5" />
                )}
              </div>

              {/* Right Page */}
              <div className="w-1/2 h-full relative">
                {spreads[currentSpread][1] ? (
                  <Page pageNumber={(currentSpread * 2) + 1}>
                    {spreads[currentSpread][1].title && <h3 className="text-2xl font-black mb-6 text-[#3a0ca3] tracking-tight">{spreads[currentSpread][1].title}</h3>}
                    {spreads[currentSpread][1].content}
                  </Page>
                ) : (
                  <div className="inset-0 w-full h-full bg-black/5 backdrop-blur-sm rounded-r-lg" />
                )}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Controls - Left Side */}
          <div className="absolute left-[-100px] top-1/2 -translate-y-1/2 z-30">
            <Button
              onClick={prevSpread}
              disabled={currentSpread === 0 || isFlipping}
              variant="outline"
              size="icon"
              className="w-14 h-14 rounded-full border-white/20 bg-black/20 text-white backdrop-blur-md hover:bg-white hover:text-indigo-900 transition-all shadow-2xl"
            >
              <ChevronLeft size={32} />
            </Button>
          </div>

          {/* Controls - Right Side */}
          <div className="absolute right-[-100px] top-1/2 -translate-y-1/2 z-30">
            <Button
              onClick={nextSpread}
              disabled={currentSpread === spreads.length - 1 || isFlipping}
              variant="outline"
              size="icon"
              className="w-14 h-14 rounded-full border-white/20 bg-black/20 text-white backdrop-blur-md hover:bg-white hover:text-indigo-900 transition-all shadow-2xl"
            >
              <ChevronRight size={32} />
            </Button>
          </div>
        </div>
      </div>

      {/* Floating Toolbar */}
      <div className="fixed bottom-10 flex gap-4 z-40">
        <div className="bg-black/50 backdrop-blur-xl p-2 rounded-full border border-white/10 flex items-center gap-2 px-6">
          <span className="text-xs text-blue-200 font-mono">PAGE {currentSpread + 1} / {spreads.length}</span>
          <div className="w-px h-4 bg-white/10 mx-2" />
          <Button
            onClick={exportToPDF}
            disabled={isExporting}
            className="bg-[#f72585] text-white hover:bg-white hover:text-[#f72585] transition-all rounded-full h-8 px-4 text-xs font-bold"
          >
            {isExporting ? <div className="w-3 h-3 animate-spin border border-white border-t-transparent rounded-full mr-2" /> : <Download size={14} className="mr-2" />}
            XUẤT PDF
          </Button>
        </div>
      </div>
    </div>
  );
}
