import { Metadata } from "next";
import CapabilityProfile from "@/components/profile/capability-profile";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Hồ sơ năng lực | MTE-LAB",
  description: "Hồ sơ năng lực Digital của MTE-LAB - Phòng Thử nghiệm chuyên nghiệp",
};

export default function ProfilePage() {
  return (
    <div className="min-h-screen w-full bg-[#000d1a] relative overflow-hidden flex flex-col items-center justify-center font-sans">
      {/* Blueprint Background */}
      <div 
        className="absolute inset-0 opacity-40 bg-cover bg-center pointer-events-none"
        style={{ backgroundImage: "url('/images/blueprint-bg-detailed.png')" }}
      />
      
      {/* Grid Overlay */}
      <div className="absolute inset-0 bg-math-grid opacity-20 pointer-events-none" />

      {/* Header Overlay */}
      <div className="absolute top-0 left-0 right-0 p-8 flex justify-between items-center z-20">
        <Link href="/login">
          <Button variant="ghost" className="text-white hover:bg-white/10 space-x-2">
            <ChevronLeft className="w-5 h-5" />
            <span>Quay lại Đăng nhập</span>
          </Button>
        </Link>
        
        <div className="text-right">
          <h1 className="text-2xl font-black text-white tracking-widest uppercase">MTE<span className="text-[#4cc9f0]">-LAB</span></h1>
          <p className="text-[10px] text-blue-300 font-mono">TECHNICAL CAPABILITY PROFILE</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="z-10 w-full flex flex-col items-center pt-10">
        <CapabilityProfile />
      </div>

      {/* Decorative footer */}
      <div className="absolute bottom-4 left-6 z-20">
        <div className="flex items-center space-x-3 text-[10px] text-blue-400/60 font-mono tracking-tighter">
          <span>LAT: 16.0544° N</span>
          <span>LNG: 108.2022° E</span>
          <span className="w-20 h-px bg-blue-400/30"></span>
          <span>SYSTEM ONLINE: OK</span>
        </div>
      </div>
    </div>
  );
}
