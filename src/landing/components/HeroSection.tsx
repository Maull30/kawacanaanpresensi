import React from 'react';
import { ArrowRight, School } from 'lucide-react';
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
  onOpenLogin,
  lang 
}) => {
  return (
    <section 
      id="beranda" 
      className="relative min-h-[calc(100vh-80px)] pt-20 sm:pt-28 pb-10 sm:pb-16 lg:pt-32 lg:pb-24 flex items-center justify-center overflow-hidden bg-white text-slate-900 border-b border-blue-100"
    >
      {/* Educational Technical Grid & Blue Lighting Backdrop */}
      <div className="absolute inset-0 z-0 pointer-events-none bg-grid-pattern opacity-60" />
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-b from-blue-50/50 via-transparent to-transparent pointer-events-none hidden lg:block" />
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-100/70 rounded-full blur-3xl opacity-70 pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-96 h-96 bg-sky-100/60 rounded-full blur-3xl opacity-60 pointer-events-none" />

      {/* Hero Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 lg:gap-10 items-center">
          
          {/* Left Column: Headline, Narrative, and CTAs */}
          <div className="w-full lg:col-span-7 space-y-6 sm:space-y-8 text-left">
            
            {/* Educational Badge */}
            <div className="space-y-3.5">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-blue-50 text-blue-800 text-[10px] sm:text-xs font-bold uppercase tracking-wider rounded-lg border border-blue-200/90 shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                <School className="w-3.5 h-3.5 text-blue-700 shrink-0" />
                <span>{lang === 'ID' ? 'SISTEM PRESENSI DIGITAL SEKOLAH DASAR' : 'PRIMARY SCHOOL DIGITAL ATTENDANCE SYSTEM'}</span>
              </div>

              {/* Main Headline - Authoritative Blue Display Typography */}
              <h1 className="text-[20px] min-[360px]:text-[22px] min-[420px]:text-2xl sm:text-3xl md:text-4xl lg:text-[42px] xl:text-[50px] leading-[1.12] sm:leading-[1.08] font-black tracking-tight text-[#0B2F64] uppercase">
                {lang === 'ID' ? (
                  <>
                    <span className="block whitespace-nowrap">PRESENSI SEKOLAH DASAR</span>
                    <span className="block text-blue-600">LEBIH TERTIB & AKURAT</span>
                  </>
                ) : (
                  <>
                    <span className="block whitespace-nowrap">PRIMARY ATTENDANCE</span>
                    <span className="block text-blue-600">STRUCTURED & PRECISE</span>
                  </>
                )}
              </h1>

              <div className="flex items-center gap-2 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 pt-0.5">
                <span className="px-2 py-0.5 rounded bg-blue-100/80 text-blue-800 text-[10px] font-extrabold font-mono">
                  TERPADU
                </span>
                <span>Kawacanaan Presensi • Platform Presensi Khusus Jenjang SD</span>
              </div>
            </div>

            {/* Narrative with Blue Border Accent */}
            <p className="text-xs sm:text-sm md:text-base lg:text-lg text-slate-600 leading-relaxed max-w-xl border-l-4 border-blue-600 pl-3 sm:pl-5 font-normal">
              {lang === 'ID' 
                ? "Sistem presensi digital terpadu untuk Sekolah Dasar. Mendukung presensi harian oleh Wali Kelas, presensi per mata pelajaran khusus (PJOK & Agama), penghitungan otomatis hari efektif belajar, hingga cetak laporan administrasi format kedinasan."
                : "Integrated digital attendance platform built specifically for Primary Schools. Supporting daily homeroom check-ins, specialized subject attendance (PE & Religious Studies), automatic effective school day calculations, and official administrative report exports."
              }
            </p>

            {/* Action Buttons Group with Blue Theme Styling */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 pt-1 w-full sm:w-auto">
              
              {/* Primary Button with Animated Rotating Chromatic Border Beam & Shimmer: MULAI GRATIS */}
              <div className="relative rounded-2xl w-full sm:w-auto inline-flex items-center justify-center group transition-all duration-300">
                {/* Ambient Soft Glow Aura behind the rotating beam */}
                <div 
                  className="absolute -inset-0.5 rounded-2xl opacity-60 group-hover:opacity-100 blur-md pointer-events-none transition-opacity duration-300 animate-pulse-aura"
                  style={{
                    background: 'conic-gradient(from 0deg, #0284c7, #38bdf8, #818cf8, #c084fc, #f472b6, #fbbf24, #34d399, #0284c7)'
                  }}
                  aria-hidden="true"
                />

                {/* Masked Border Container: strictly clips the rotating conic gradient to the perimeter */}
                <div className="relative p-[2.5px] rounded-2xl overflow-hidden w-full sm:w-auto inline-flex items-center justify-center shadow-xl shadow-blue-900/20">
                  {/* Rotating colorful laser border beam (conic gradient) */}
                  <div 
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320%] aspect-square pointer-events-none animate-spin-border"
                    style={{
                      background: 'conic-gradient(from 0deg, #0284c7 0%, #38bdf8 14%, #6366f1 28%, #a855f7 42%, #ec4899 57%, #f59e0b 71%, #10b981 85%, #0284c7 100%)'
                    }}
                    aria-hidden="true"
                  />

                  {/* Core Button Face with Sheen Sweep */}
                  <button
                    type="button"
                    id="btn-hero-trial"
                    onClick={onOpenRegister}
                    className="relative z-10 w-full sm:w-auto bg-gradient-to-r from-[#0B2F64] via-[#0E3B7D] to-[#0B2F64] hover:from-[#0E3B7D] hover:to-[#164996] active:scale-[0.98] text-white px-7 sm:px-9 py-3.5 sm:py-4 text-xs sm:text-sm font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2.5 cursor-pointer rounded-[13.5px] overflow-hidden select-none"
                  >
                    {/* Subtle Light Sheen Reflection pass */}
                    <div 
                      className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none animate-shimmer-sweep" 
                      aria-hidden="true" 
                    />

                    <span className="relative z-10 font-black">{lang === 'ID' ? 'MULAI GRATIS' : 'START FOR FREE'}</span>
                    <ArrowRight className="relative z-10 w-4 h-4 shrink-0 group-hover:translate-x-1.5 transition-transform" />
                  </button>
                </div>
              </div>

              {/* Secondary Button: DAFTAR SEKOLAH */}
              <button
                type="button"
                id="btn-hero-register-school"
                onClick={onOpenRegisterSchool || onOpenRegister}
                className="w-full sm:w-auto border-2 border-[#0B2F64] bg-white hover:bg-blue-50 text-[#0B2F64] px-6 sm:px-8 py-3.5 sm:py-4 text-xs sm:text-sm font-bold uppercase tracking-widest active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs rounded-lg"
              >
                <span>{lang === 'ID' ? 'DAFTAR SEKOLAH' : 'REGISTER SCHOOL'}</span>
                <ArrowRight className="w-4 h-4 shrink-0" />
              </button>

            </div>

          </div>

          {/* Device Mockup Display: Responsive across mobile, tablet, laptop, and desktop */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end relative w-full pt-2 sm:pt-4 lg:pt-0">
            <div className="w-full max-w-sm sm:max-w-lg lg:max-w-none">
              <DeviceMockup lang={lang} />
            </div>
          </div>

        </div>

        {/* Spanduk Statistik Aktual Beranda */}
        <div className="mt-10 sm:mt-12 lg:mt-16 w-full">
          <PublicStatsBanner lang={lang} />
        </div>
      </div>

    </section>
  );
};


