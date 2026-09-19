import React from 'react';
import { 
  Clock, 
  Users, 
  CalendarDays, 
  BarChart3, 
  FileSpreadsheet, 
  ShieldCheck, 
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface FeaturesSectionProps {
  lang: 'ID' | 'EN';
  onOpenRegister?: () => void;
}

export const FeaturesSection: React.FC<FeaturesSectionProps> = ({ lang, onOpenRegister }) => {
  const isId = lang === 'ID';

  const card1 = isId ? {
    title: 'Presensi Dual-Mode SD',
    desc: 'Presensi harian Wali Kelas dan presensi jam oleh Guru Mapel khusus dalam satu alur.',
    tag: 'Harian & Mapel',
  } : {
    title: 'Dual-Mode Attendance',
    desc: 'Daily homeroom check-ins and subject period logs for specialist teachers.',
    tag: 'Homeroom & Subject',
  };

  const card2 = isId ? {
    title: 'Database Rombel 1–6',
    desc: 'Pengelolaan data siswa, NISN, kontak wali murid, dan riwayat kenaikan kelas rapi.',
    tag: 'Kelas 1–6',
  } : {
    title: 'Grade 1–6 Cohorts',
    desc: 'Organized database for student profiles, national IDs, and progression records.',
    tag: 'Grade 1–6',
  };

  const bottomCards = isId ? [
    {
      icon: CalendarDays,
      title: 'Hari Efektif Otomatis',
      desc: 'Kalkulasi otomatis hari belajar efektif, libur dinas, dan kalender semester.',
      tag: 'Kalender Dinas',
      theme: {
        iconBg: 'bg-indigo-600',
        tagBg: 'bg-indigo-50 text-indigo-700 border-indigo-100',
        btnBg: 'bg-indigo-600 hover:bg-indigo-700',
        glowBg: 'bg-indigo-100/50',
      }
    },
    {
      icon: BarChart3,
      title: 'Rekapitulasi Otomatis',
      desc: 'Akumulasi kehadiran bulanan dan semester tanpa risiko rumus manual spreadsheet.',
      tag: '100% Akurat',
      theme: {
        iconBg: 'bg-amber-500',
        tagBg: 'bg-amber-50 text-amber-700 border-amber-100',
        btnBg: 'bg-amber-500 hover:bg-amber-600',
        glowBg: 'bg-amber-100/50',
      }
    },
    {
      icon: FileSpreadsheet,
      title: 'Format Cetak Kedinasan',
      desc: 'Ekspor dokumen A4 standar kedinasan siap tanda tangan resmi kepala sekolah.',
      tag: 'Standar A4',
      theme: {
        iconBg: 'bg-teal-600',
        tagBg: 'bg-teal-50 text-teal-700 border-teal-100',
        btnBg: 'bg-teal-600 hover:bg-teal-700',
        glowBg: 'bg-teal-100/50',
      }
    },
    {
      icon: ShieldCheck,
      title: 'Portal Siswa & Wali',
      desc: 'Akses transparan bagi orang tua untuk pantau kehadiran harian dan kirim surat izin.',
      tag: 'Akses Mandiri',
      theme: {
        iconBg: 'bg-rose-500',
        tagBg: 'bg-rose-50 text-rose-700 border-rose-100',
        btnBg: 'bg-rose-500 hover:bg-rose-600',
        glowBg: 'bg-rose-100/50',
      }
    },
  ] : [
    {
      icon: CalendarDays,
      title: 'Auto Effective Days',
      desc: 'Automated learning day counts, official breaks, and academic term schedules.',
      tag: 'Official Calendar',
      theme: {
        iconBg: 'bg-indigo-600',
        tagBg: 'bg-indigo-50 text-indigo-700 border-indigo-100',
        btnBg: 'bg-indigo-600 hover:bg-indigo-700',
        glowBg: 'bg-indigo-100/50',
      }
    },
    {
      icon: BarChart3,
      title: 'Instant Recapitulation',
      desc: 'Automated monthly and term attendance totals without manual spreadsheet formulas.',
      tag: '100% Accurate',
      theme: {
        iconBg: 'bg-amber-500',
        tagBg: 'bg-amber-50 text-amber-700 border-amber-100',
        btnBg: 'bg-amber-500 hover:bg-amber-600',
        glowBg: 'bg-amber-100/50',
      }
    },
    {
      icon: FileSpreadsheet,
      title: 'Official Print Reports',
      desc: 'Print-ready standard A4 records with institutional principal signature boxes.',
      tag: 'A4 Standard',
      theme: {
        iconBg: 'bg-teal-600',
        tagBg: 'bg-teal-50 text-teal-700 border-teal-100',
        btnBg: 'bg-teal-600 hover:bg-teal-700',
        glowBg: 'bg-teal-100/50',
      }
    },
    {
      icon: ShieldCheck,
      title: 'Student & Parent Portal',
      desc: 'Direct portal for parents to verify daily attendance and submit official leaves.',
      tag: 'Direct Access',
      theme: {
        iconBg: 'bg-rose-500',
        tagBg: 'bg-rose-50 text-rose-700 border-rose-100',
        btnBg: 'bg-rose-500 hover:bg-rose-600',
        glowBg: 'bg-rose-100/50',
      }
    },
  ];

  return (
    <section 
      id="fitur" 
      className="scroll-mt-16 sm:scroll-mt-20 pt-16 sm:pt-20 pb-12 sm:pb-16 bg-gradient-to-b from-[#F2F8FF] via-[#EAF3FE] to-[#DCEBFE] text-slate-900 relative antialiased overflow-hidden"
    >
      {/* Gentle Floating Atmospheric Background Orbs */}
      <div className="absolute top-10 left-1/4 w-80 h-80 bg-blue-200/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-40 right-10 w-96 h-96 bg-sky-200/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 left-10 w-72 h-72 bg-indigo-100/30 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        
        {/* ========================================================================= */}
        {/* SECTION HEADER: Pill Badge, Main Title, Subtitle & Playful Doodles       */}
        {/* ========================================================================= */}
        <div className="relative text-center mb-10 sm:mb-14">
          
          {/* Top-Left Playful Origami Paper Airplane with Looped Flight Path */}
          <div className="hidden md:block absolute -top-4 left-6 lg:left-12 pointer-events-none select-none">
            <svg 
              className="w-32 lg:w-40 h-24 text-blue-400/80" 
              viewBox="0 0 160 100" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Dotted Trajectory Trail with Loop */}
              <path 
                d="M 10 75 C 30 80, 50 65, 45 40 C 40 20, 65 25, 80 50 C 95 70, 115 50, 135 25" 
                stroke="#60A5FA" 
                strokeWidth="1.8" 
                strokeDasharray="4 4" 
                strokeLinecap="round"
              />
              {/* Origami Paper Airplane Facing Top-Right */}
              <g transform="translate(130, 12) rotate(22) scale(0.9)">
                {/* Main Body Facet */}
                <polygon points="0,22 28,0 20,28" fill="#3B82F6" />
                {/* Wing Top */}
                <polygon points="28,0 6,10 0,22" fill="#93C5FD" />
                {/* Wing Underside Fold */}
                <polygon points="0,22 14,18 20,28" fill="#1D4ED8" />
                <polygon points="14,18 28,0 20,28" fill="#2563EB" opacity="0.9" />
              </g>
            </svg>
          </div>

          {/* Top-Right Hand-Drawn Playful Typography Doodles */}
          <div className="hidden md:block absolute -top-2 right-6 lg:right-14 pointer-events-none select-none text-right">
            <div className="inline-block rotate-[8deg] bg-white/40 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-blue-200/40 shadow-2xs">
              <div className="relative font-bold text-blue-600 leading-tight tracking-tight text-sm lg:text-base select-none">
                <div className="flex items-center justify-end gap-1">
                  <span>{isId ? 'Mudah' : 'Easy'}</span>
                  <span className="text-blue-500 font-extrabold text-xs">ᐟ</span>
                </div>
                <div className="text-blue-700">{isId ? 'Cepat' : 'Fast'}</div>
                <div className="text-blue-800 font-extrabold">{isId ? 'Terpercaya' : 'Reliable'}</div>

                {/* Decorative Doodle Rays */}
                <svg className="absolute -top-3 -right-2.5 w-6 h-6 text-blue-500" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2V6M19 5L16 8M22 12H18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
            </div>
          </div>

          {/* Center Pill Badge */}
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-blue-100/90 border border-blue-200 text-blue-800 text-xs font-bold tracking-wide uppercase shadow-2xs mb-3">
            <Sparkles className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span>{isId ? 'Fitur Utama Sekolah Dasar' : 'Core Primary School Features'}</span>
          </div>

          {/* Big High-Contrast Title */}
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight uppercase max-w-2xl mx-auto">
            <span>{isId ? 'Fitur Kawacanaan' : 'Kawacanaan Features'}</span>
            <span className="block text-blue-600 mt-1">{isId ? 'Sekolah Dasar' : 'Primary School'}</span>
          </h2>

          {/* Subtitle Description */}
          <p className="mt-3 text-slate-600 text-xs sm:text-sm md:text-base leading-relaxed max-w-xl mx-auto font-normal">
            {isId 
              ? 'Sistem presensi terpadu, rekapitulasi rombel kelas 1–6, dan pelaporan kedinasan dalam satu antarmuka bersih.'
              : 'Integrated attendance logging, grade 1–6 cohort recap, and official educational reporting in one clean interface.'}
          </p>

          {/* Decorative Capsule Divider & Dots */}
          <div className="flex items-center justify-center gap-1.5 mt-4">
            <span className="w-9 h-1.5 bg-blue-600 rounded-full" />
            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
            <span className="w-1.5 h-1.5 bg-blue-300 rounded-full" />
          </div>
        </div>

        {/* ========================================================================= */}
        {/* BARIS ATAS: KARTU KIRI + 3D SHOWCASE ILUSTRASI TENGAH + KARTU KANAN       */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-center mb-6 sm:mb-8">
          
          {/* KARTU 1 (Kiri): Presensi Dual-Mode SD */}
          <div className="lg:col-span-4 bg-white/95 rounded-3xl p-6 sm:p-7 shadow-[0_12px_30px_-10px_rgba(37,99,235,0.12)] border border-blue-100/80 hover:border-blue-300 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300 flex flex-col justify-between relative overflow-hidden group min-h-[220px]">
            {/* Bottom-right organic pastel decorative corner shape */}
            <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-blue-100/60 rounded-tl-full pointer-events-none transition-transform group-hover:scale-110" />

            <div className="relative z-10">
              {/* Header Icon + Tag */}
              <div className="flex items-center justify-between gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-600/30 shrink-0">
                  <Clock className="w-6 h-6" />
                </div>
                <span className="text-[11px] sm:text-xs font-bold px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                  {card1.tag}
                </span>
              </div>

              {/* Title & Description */}
              <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight leading-snug mb-2 group-hover:text-blue-600 transition-colors">
                {card1.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                {card1.desc}
              </p>
            </div>

            {/* Bottom Arrow Action Button */}
            <div className="relative z-10 pt-5">
              <button 
                type="button"
                onClick={onOpenRegister}
                aria-label={card1.title}
                className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-xs group-hover:bg-blue-700 group-hover:translate-x-1 transition-all cursor-pointer"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* CENTERPIECE: 3D Schoolhouse, Modern Tablet Dashboard & Playful Note */}
          <div className="lg:col-span-4 flex flex-col items-center justify-center py-2 relative">
            <div className="w-full max-w-[340px] sm:max-w-[380px] lg:max-w-[420px] mx-auto relative group">
              {/* Backdrop Glow */}
              <div className="absolute inset-0 bg-blue-400/20 rounded-3xl blur-2xl transform group-hover:scale-105 transition-transform" />
              
              {/* High-Resolution 3D School & Attendance Tablet Visual */}
              <div className="relative rounded-2xl overflow-hidden shadow-[0_16px_36px_-8px_rgba(30,58,138,0.22)] border border-white/80 bg-white">
                <img 
                  src="/images/school_features_3d_showcase.jpg" 
                  alt="Kawacanaan 3D School & Attendance Dashboard" 
                  className="w-full h-auto object-cover object-center transform transition-transform duration-500 hover:scale-[1.02]"
                  loading="lazy"
                />
              </div>

              {/* Playful Handwritten Annotation Underneath with Curved Arrow */}
              <div className="flex items-center justify-center gap-1.5 mt-3 text-center">
                <span className="text-xs sm:text-sm font-bold text-blue-700 tracking-tight font-sans">
                  {isId ? 'Untuk administrasi sekolah yang lebih mudah!' : 'Making school administration simpler!'}
                </span>
                <svg className="w-5 h-5 text-blue-600 -rotate-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 14c4-6 10-6 14-2" />
                  <polyline points="15 8 18 12 14 14" />
                </svg>
              </div>
            </div>
          </div>

          {/* KARTU 2 (Kanan): Database Rombel 1–6 */}
          <div className="lg:col-span-4 bg-white/95 rounded-3xl p-6 sm:p-7 shadow-[0_12px_30px_-10px_rgba(16,185,129,0.12)] border border-emerald-100/80 hover:border-emerald-300 hover:shadow-lg hover:shadow-emerald-500/10 transition-all duration-300 flex flex-col justify-between relative overflow-hidden group min-h-[220px]">
            {/* Bottom-right organic pastel decorative corner shape */}
            <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-emerald-100/60 rounded-tl-full pointer-events-none transition-transform group-hover:scale-110" />

            <div className="relative z-10">
              {/* Header Icon + Tag */}
              <div className="flex items-center justify-between gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/30 shrink-0">
                  <Users className="w-6 h-6" />
                </div>
                <span className="text-[11px] sm:text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                  {card2.tag}
                </span>
              </div>

              {/* Title & Description */}
              <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight leading-snug mb-2 group-hover:text-emerald-600 transition-colors">
                {card2.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                {card2.desc}
              </p>
            </div>

            {/* Bottom Arrow Action Button */}
            <div className="relative z-10 pt-5">
              <button 
                type="button"
                onClick={onOpenRegister}
                aria-label={card2.title}
                className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs group-hover:bg-emerald-700 group-hover:translate-x-1 transition-all cursor-pointer"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>

        {/* ========================================================================= */}
        {/* BARIS BAWAH: 4 KARTU FITUR SPESIFIK BERJEJER RAPI SECARA HORIZONTAL       */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {bottomCards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <div
                key={idx}
                id={`feature-bottom-card-${idx}`}
                className="bg-white/95 rounded-3xl p-5 sm:p-6 shadow-[0_8px_24px_-8px_rgba(15,23,42,0.06)] border border-slate-100/90 hover:border-blue-200 hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300 flex flex-col justify-between relative overflow-hidden group min-h-[200px]"
              >
                {/* Bottom-right organic pastel decorative corner glow */}
                <div className={`absolute -bottom-8 -right-8 w-28 h-28 ${card.theme.glowBg} rounded-tl-full pointer-events-none transition-transform group-hover:scale-110`} />

                <div className="relative z-10">
                  {/* Top Bar: Icon + Tag */}
                  <div className="flex items-center justify-between gap-2 mb-3.5">
                    <div className={`w-11 h-11 rounded-2xl ${card.theme.iconBg} text-white flex items-center justify-center shadow-sm shrink-0`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${card.theme.tagBg}`}>
                      {card.tag}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-base font-bold text-slate-900 tracking-tight leading-snug mb-1.5 group-hover:text-blue-600 transition-colors">
                    {card.title}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed font-normal">
                    {card.desc}
                  </p>
                </div>

                {/* Bottom Arrow Action Button */}
                <div className="relative z-10 pt-4">
                  <button 
                    type="button"
                    onClick={onOpenRegister}
                    aria-label={card.title}
                    className={`w-7 h-7 rounded-full ${card.theme.btnBg} text-white flex items-center justify-center shadow-2xs group-hover:translate-x-1 transition-all cursor-pointer`}
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* ========================================================================= */}
        {/* BOTTOM PAGINATION INDICATOR DOTS SINKRON DENGAN DESAIN REFERENSI          */}
        {/* ========================================================================= */}
        <div className="flex items-center justify-center gap-2 pt-8 sm:pt-10">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-600 shadow-xs ring-2 ring-blue-400/30" />
          <span className="w-2 h-2 rounded-full bg-blue-300" />
          <span className="w-2 h-2 rounded-full bg-blue-300" />
          <span className="w-2 h-2 rounded-full bg-blue-300" />
        </div>

      </div>

      {/* Subtle Bottom Wave Section Transition */}
      <div className="absolute bottom-0 left-0 right-0 w-full overflow-hidden leading-none pointer-events-none">
        <svg 
          className="relative block w-full h-8 sm:h-12 text-white fill-current" 
          viewBox="0 0 1200 120" 
          preserveAspectRatio="none"
        >
          <path d="M0,0 C150,90 350,-40 500,45 C650,130 900,10 1200,50 L1200,120 L0,120 Z" />
        </svg>
      </div>
    </section>
  );
};


