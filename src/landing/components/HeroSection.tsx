import React from 'react';
import { ArrowRight, Gift, Home } from 'lucide-react';
import { DeviceMockup } from './DeviceMockup';
import { PublicStatsBanner } from './PublicStatsBanner';

interface HeroSectionProps {
  onOpenRegister: () => void;
  onOpenRegisterSchool?: () => void;
  onOpenLogin: () => void;
  lang: 'ID' | 'EN';
}

export const HeroSection: React.FC<HeroSectionProps> = ({ 
  onOpenRegister, 
  onOpenRegisterSchool,
  lang 
}) => {
  const isId = lang === 'ID';

  return (
    <section 
      id="beranda" 
      className="relative min-h-[calc(100vh-80px)] pt-24 sm:pt-28 lg:pt-32 pb-14 sm:pb-20 flex flex-col justify-between overflow-hidden bg-gradient-to-b from-[#F5F9FF] via-[#ECF4FE] to-[#DCEBFE] text-slate-900 antialiased"
    >
      {/* Background Soft Glow Circles & Orbs (as in screenshot) */}
      <div className="absolute -top-12 -left-12 w-64 h-64 sm:w-96 sm:h-96 bg-blue-300/25 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/4 -left-10 w-44 h-44 rounded-full bg-blue-200/40 blur-2xl pointer-events-none" />
      <div className="absolute top-16 right-1/4 w-80 h-80 bg-sky-200/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-20 right-10 w-40 h-28 bg-white/60 rounded-full blur-xl pointer-events-none" />

      {/* Decorative Dot Matrix on Left and Right Margins (as in screenshot) */}
      <div className="hidden xl:block absolute left-6 top-1/2 -translate-y-8 pointer-events-none opacity-40 select-none">
        <div className="grid grid-cols-4 gap-2.5">
          {[...Array(24)].map((_, i) => (
            <div key={i} className="w-1.5 h-1.5 rounded-full bg-blue-400" />
          ))}
        </div>
      </div>
      <div className="hidden xl:block absolute right-6 top-1/2 translate-y-6 pointer-events-none opacity-40 select-none">
        <div className="grid grid-cols-4 gap-2.5">
          {[...Array(24)].map((_, i) => (
            <div key={i} className="w-1.5 h-1.5 rounded-full bg-blue-400" />
          ))}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-1 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 lg:gap-8 items-center pt-2 sm:pt-4">
          
          {/* ========================================================================= */}
          {/* Left Column: Pill Badge, Bold Headline, Terpadu Tag, Text & 2 CTA Buttons */}
          {/* ========================================================================= */}
          <div className="w-full lg:col-span-6 xl:col-span-6 space-y-5 sm:space-y-6 text-left">
            
            {/* Top Pill Badge with Home Icon (as in screenshot: SISTEM PRESENSI DIGITAL SEKOLAH DASAR) */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-blue-100/80 border border-blue-200/90 text-blue-700 text-xs sm:text-xs font-black uppercase tracking-wider rounded-full shadow-2xs">
              <Home className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span>{isId ? 'SISTEM PRESENSI DIGITAL SEKOLAH DASAR' : 'PRIMARY SCHOOL DIGITAL ATTENDANCE SYSTEM'}</span>
            </div>

            {/* Main Headline (as in screenshot) */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[44px] xl:text-[52px] leading-[1.08] font-black tracking-tight text-slate-900 uppercase">
              {isId ? (
                <>
                  <span className="block">PRESENSI SEKOLAH DASAR</span>
                  <span className="block text-[#0066FF] mt-1">LEBIH TERTIB & AKURAT</span>
                </>
              ) : (
                <>
                  <span className="block">PRIMARY ATTENDANCE</span>
                  <span className="block text-[#0066FF] mt-1">STRUCTURED & PRECISE</span>
                </>
              )}
            </h1>

            {/* Sub-label with TERPADU pill (as in screenshot) */}
            <div className="flex flex-wrap items-center gap-2 text-xs sm:text-[13px] font-bold text-slate-600 pt-0.5">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-[#0066FF] text-[11px] font-black tracking-wider uppercase">
                TERPADU
              </span>
              <span className="text-slate-500 font-semibold tracking-wide">
                {isId ? 'KAWACANAAN PRESENSI • PLATFORM PRESENSI KHUSUS JENJANG SD' : 'KAWACANAAN PRESENSI • DEDICATED PRIMARY SCHOOL PLATFORM'}
              </span>
            </div>

            {/* Narrative with Left Blue Border Accent (as in screenshot) */}
            <p className="text-sm sm:text-base lg:text-[16px] text-slate-600 leading-relaxed max-w-xl border-l-[3.5px] border-[#0066FF] pl-4 sm:pl-5 font-normal">
              {isId 
                ? "Sistem presensi digital terpadu untuk Sekolah Dasar. Mendukung presensi harian oleh Wali Kelas, presensi per mata pelajaran khusus (PJOK & Agama), penghitungan otomatis hari efektif belajar, hingga cetak laporan administrasi format kedinasan."
                : "Integrated digital attendance platform built specifically for Primary Schools. Supporting daily homeroom check-ins, specialized subject attendance (PE & Religious Studies), automatic effective school day calculations, and official administrative report exports."
              }
            </p>

            {/* Action Buttons Group (as in screenshot) */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 pt-2 w-full sm:w-auto">
              
              {/* Primary Button: MULAI GRATIS with Gift Icon & Rounded Corners */}
              <button
                type="button"
                id="btn-hero-trial"
                onClick={onOpenRegister}
                className="w-full sm:w-auto bg-[#0066FF] hover:bg-blue-600 active:scale-[0.98] text-white px-7 sm:px-8 py-3.5 sm:py-4 text-xs sm:text-sm font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2.5 cursor-pointer rounded-2xl shadow-lg shadow-blue-500/25 select-none"
              >
                <Gift className="w-4 h-4 shrink-0 text-white" />
                <span>{isId ? 'MULAI GRATIS' : 'START FOR FREE'}</span>
                <ArrowRight className="w-4 h-4 shrink-0 ml-0.5" />
              </button>

              {/* Secondary Button: DAFTAR SEKOLAH with Clean Dark Navy Border & Rounded-2xl */}
              <button
                type="button"
                id="btn-hero-register-school"
                onClick={onOpenRegisterSchool || onOpenRegister}
                className="w-full sm:w-auto border-2 border-slate-900 hover:bg-white/80 bg-white/40 text-slate-900 px-6 sm:px-8 py-3.5 sm:py-4 text-xs sm:text-sm font-black uppercase tracking-wider active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer rounded-2xl select-none"
              >
                <span>{isId ? 'DAFTAR SEKOLAH' : 'REGISTER SCHOOL'}</span>
                <ArrowRight className="w-4 h-4 shrink-0" />
              </button>

            </div>

          </div>

          {/* ========================================================================= */}
          {/* Right Column: Interactive Laptop Dashboard + Smartphone + 3D School Model */}
          {/* ========================================================================= */}
          <div className="w-full lg:col-span-6 xl:col-span-6 flex justify-center lg:justify-end relative pt-4 lg:pt-0">
            <div className="relative w-full max-w-lg lg:max-w-none flex justify-center items-center">
              
              {/* 3D Stylized School with Flag, Clock Tower & Trees in the background (as in screenshot) */}
              <div className="hidden sm:block absolute -right-2 sm:-right-4 lg:-right-6 top-1/2 -translate-y-1/2 w-48 sm:w-56 lg:w-64 xl:w-72 pointer-events-none select-none z-0">
                <img 
                  src="/images/hero_school_3d.jpg" 
                  alt="Indonesian School 3D Building" 
                  className="w-full h-auto object-contain drop-shadow-2xl rounded-3xl"
                  loading="lazy"
                />
              </div>

              {/* Left Green Foliage Accent behind Laptop (as in screenshot) */}
              <div className="hidden sm:block absolute -left-6 bottom-8 w-20 h-28 pointer-events-none select-none z-0">
                <div className="w-16 h-16 bg-emerald-400/80 rounded-full blur-xs transform -rotate-12" />
                <div className="w-14 h-14 bg-emerald-500/80 rounded-full blur-xs -mt-6 ml-4" />
              </div>

              {/* Main Interactive Laptop & Smartphone Mockup */}
              <div className="relative z-10 w-full">
                <DeviceMockup lang={lang} />
              </div>

            </div>
          </div>

        </div>

        {/* ========================================================================= */}
        {/* Solid Blue Horizontal Public Statistics Banner (as in screenshot)         */}
        {/* ========================================================================= */}
        <div className="mt-12 sm:mt-14 lg:mt-16 w-full">
          <PublicStatsBanner lang={lang} />
        </div>
      </div>

      {/* Curved Wave Bottom Divider (as in screenshot) */}
      <div className="w-full overflow-hidden leading-none pointer-events-none mt-6 sm:mt-8">
        <svg 
          className="relative block w-full h-10 sm:h-16 text-white fill-current" 
          viewBox="0 0 1200 120" 
          preserveAspectRatio="none"
        >
          <path d="M0,0 C150,90 350,-40 500,45 C650,130 900,10 1200,50 L1200,120 L0,120 Z" />
        </svg>
      </div>

    </section>
  );
};


