import React, { useState } from 'react';
import { 
  Check, 
  Sparkles, 
  QrCode, 
  ArrowRight, 
  ShieldCheck, 
  Building2, 
  User, 
  Users, 
  CreditCard,
  Headphones,
  RefreshCw,
  Star,
  Zap,
  Globe
} from 'lucide-react';
import { formatRupiah } from '../../utils/packageSystem';

export type BillingCycle = 'monthly' | 'yearly';
export type PlanIdType = 'free' | 'teacher' | 'school';

interface PricingSectionProps {
  onOpenRegister: (planId?: PlanIdType, billingCycle?: BillingCycle) => void;
  lang: 'ID' | 'EN';
  customPackagesConfig?: any;
}

export const PricingSection: React.FC<PricingSectionProps> = ({ onOpenRegister, lang, customPackagesConfig }) => {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');
  const [activeMobilePlan, setActiveMobilePlan] = useState<PlanIdType>('school');
  const isId = lang === 'ID';

  const scrollToPlan = (id: PlanIdType) => {
    setActiveMobilePlan(id);
    const el = document.getElementById(`pricing-card-${id}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  };

  // Ambil data harga dari customPackagesConfig (Super Admin) jika tersedia, atau gunakan default
  const freeConfig = customPackagesConfig?.guru_gratis;
  const teacherConfig = customPackagesConfig?.guru_pro;
  const schoolConfig = customPackagesConfig?.sekolah_pro;

  // Harga Bulanan & Tahunan
  const teacherMonthlyPrice = teacherConfig?.hargaBulanan ?? teacherConfig?.harga ?? 5000;
  const teacherYearlyPrice = teacherConfig?.hargaTahunan ?? 60000;

  const schoolMonthlyPrice = schoolConfig?.hargaBulanan ?? schoolConfig?.harga ?? 25000;
  const schoolYearlyRegularPrice = schoolConfig?.hargaTahunan ?? 300000;
  const schoolYearlyEffectivePrice = schoolConfig?.hargaTahunanPerdana ?? 250000;

  const plans = [
    // -------------------------------------------------------------
    // 1. PAKET GRATIS (Ruang Kerja Individu / Guru)
    // -------------------------------------------------------------
    {
      id: 'free' as const,
      name: isId ? 'Paket Gratis' : 'Free Plan',
      workspaceType: isId ? 'Ruang Kerja Individu' : 'Personal Workspace',
      workspaceIcon: User,
      price: 'Rp0',
      period: isId ? '/selamanya' : '/lifetime',
      originalPrice: null,
      savingsBadge: null,
      subNote: null,
      tagline: isId
        ? 'Akses dasar mandiri untuk 1 guru mengelola presensi harian 1 rombel tanpa biaya.'
        : 'Basic self-service access for 1 teacher to manage 1 class cohort with zero fees.',
      highlight: false,
      badge: null,
      features: freeConfig?.fitur && freeConfig.fitur.length > 0 ? freeConfig.fitur : [
        isId ? '1 Akun Guru (Wali Kelas Mandiri)' : '1 Teacher Account (Homeroom)',
        isId ? 'Maksimal 32 Siswa SD' : 'Up to 32 Elementary Students',
        isId ? '1 Rombongan Belajar / Kelas' : '1 Class Cohort',
        isId ? 'Presensi Pagi & Rekap Bulanan' : 'Daily Morning Check-in & Monthly Recap',
        isId ? 'Unduh Format Spreadsheet (Excel)' : 'Download Spreadsheet Recap (Excel)',
        isId ? 'Aktif Selamanya (Tanpa Expired)' : 'Active Forever (No Expiration)'
      ],
      ctaText: isId ? 'Mulai Gratis Sekarang' : 'Start for Free',
      paymentNote: isId ? 'TANPA KARTU KREDIT / RP0' : 'NO CREDIT CARD REQUIRED',
    },

    // -------------------------------------------------------------
    // 2. PAKET GURU (Ruang Kerja Individu Pro)
    // -------------------------------------------------------------
    {
      id: 'teacher' as const,
      name: isId ? 'Paket Guru' : 'Teacher Plan',
      workspaceType: isId ? 'Ruang Kerja Individu Pro' : 'Teacher Workspace Pro',
      workspaceIcon: Users,
      price: billingCycle === 'monthly'
        ? formatRupiah(teacherMonthlyPrice)
        : formatRupiah(teacherYearlyPrice),
      period: billingCycle === 'monthly'
        ? (isId ? '/bulan' : '/month')
        : (isId ? '/tahun' : '/year'),
      originalPrice: null,
      savingsBadge: billingCycle === 'yearly'
        ? (isId ? 'Aktif 1 Tahun Penuh' : 'Full 1 Year Access')
        : null,
      subNote: null,
      tagline: isId
        ? 'Solusi lengkap bagi wali kelas atau guru mapel yang mengajar beberapa rombel belajar.'
        : 'Complete solution for homeroom or subject specialist teachers managing multiple classes.',
      highlight: false,
      isPopular: true,
      badge: isId ? 'Paling Populer' : 'Most Popular',
      features: teacherConfig?.fitur && teacherConfig.fitur.length > 0 ? teacherConfig.fitur : [
        isId ? 'Semua Fitur Paket Gratis' : 'All Free Plan Features',
        isId ? 'Kelola s/d 5 Rombongan Belajar' : 'Manage up to 5 Class Cohorts',
        isId ? 'Kapasitas hingga 150 Siswa SD' : 'Up to 150 Elementary Students',
        isId ? 'Presensi Jam Mata Pelajaran' : 'Subject Schedule Check-in',
        isId ? 'Cetak Laporan Format Kedinasan' : 'Print Official Kedinasan Format',
        isId ? 'Ekspor Rekap Semester PDF & Excel' : 'Semester PDF & Excel Recap Export',
        isId ? 'Bantuan Teknis Cepat via WhatsApp' : 'Fast WhatsApp Technical Support'
      ],
      ctaText: isId ? 'Pilih Paket Guru' : 'Select Teacher Plan',
      paymentNote: isId ? 'QRIS / REAL-TIME SETTLEMENT' : 'QRIS / REAL-TIME SETTLEMENT',
    },

    // -------------------------------------------------------------
    // 3. PAKET SEKOLAH (Ruang Kerja Sekolah / Institusi)
    // -------------------------------------------------------------
    {
      id: 'school' as const,
      name: isId ? 'Paket Sekolah' : 'School Plan',
      workspaceType: isId ? 'Ruang Kerja Sekolah (Institusi)' : 'School Workspace (Full)',
      workspaceIcon: Building2,
      price: billingCycle === 'monthly'
        ? formatRupiah(schoolMonthlyPrice)
        : formatRupiah(schoolYearlyEffectivePrice),
      period: billingCycle === 'monthly'
        ? (isId ? '/bulan' : '/month')
        : (isId ? '/tahun' : '/year'),
      originalPrice: billingCycle === 'yearly'
        ? formatRupiah(schoolYearlyRegularPrice)
        : null,
      savingsBadge: billingCycle === 'yearly'
        ? (isId ? 'Hemat 2 Bulan' : 'Save 2 Months')
        : null,
      subNote: billingCycle === 'yearly'
        ? (isId ? 'Catatan: Pembelian perdana Rp250.000 (hemat 2 bulan). Perpanjangan tahun berikutnya: Rp300.000/thn.' : 'Special note: First purchase Rp250,000 (save 2 months). Annual renewal: Rp300,000/yr.')
        : null,
      tagline: isId
        ? 'Sistem presensi terpadu 1 sekolah dasar, kepala sekolah, operator, seluruh guru & siswa.'
        : 'Integrated attendance system for entire school, principal, operator, all teachers & students.',
      highlight: true,
      badge: isId ? 'Rekomendasi Utama Sekolah' : 'Primary School Recommendation',
      features: schoolConfig?.fitur && schoolConfig.fitur.length > 0 ? schoolConfig.fitur : [
        isId ? 'Seluruh Fitur Terbuka Penuh' : 'All Features Fully Unlocked',
        isId ? 'Semua Guru & Tenaga Kependidikan' : 'All Teachers & School Staff',
        isId ? 'Semua Rombel Kelas 1–6 (Paralel A/B/C)' : 'All Classes 1 to 6 (Parallel A/B/C)',
        isId ? 'Kapasitas hingga 1.000 Siswa SD' : 'Capacity up to 1,000 Students',
        isId ? 'Perhitungan Hari Efektif Kalender' : 'Automatic Effective Days Calculation',
        isId ? 'Cetak Laporan Format Kedinasan Resmi' : 'Official Printable Kedinasan Reports',
        isId ? 'Kop Surat Resmi & Stempel Digital' : 'Official School Header & Stamp',
        isId ? 'Portal Siswa & Pengajuan Izin HP' : 'Student Portal & Self Excuse Form',
        isId ? 'Bantuan Migrasi & Unggah Data Awal' : 'Data Migration & Initial Setup Support'
      ],
      ctaText: isId ? 'Daftarkan Sekolah' : 'Register School',
      paymentNote: isId ? 'QRIS / SEMUA BANK & FAKTUR' : 'QRIS / ALL BANKS & INVOICE',
    }
  ];

  const handleCtaClick = (planId: PlanIdType) => {
    onOpenRegister(planId, billingCycle);
  };

  return (
    <section 
      id="harga" 
      className="scroll-mt-16 sm:scroll-mt-20 py-14 sm:py-16 lg:py-20 bg-gradient-to-b from-[#F3F8FF] via-[#E9F3FE] to-[#DCEBFE] text-slate-900 relative antialiased overflow-hidden"
    >
      {/* Background Soft Glows & Ambient Orbs */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-blue-200/35 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-indigo-200/30 rounded-full blur-3xl pointer-events-none" />

      {/* Decorative Dot Matrix Patterns on Left & Right Margins (matching screenshot) */}
      <div className="hidden 2xl:block absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-30 select-none">
        <div className="grid grid-cols-4 gap-2.5">
          {[...Array(24)].map((_, i) => (
            <div key={i} className="w-1.5 h-1.5 rounded-full bg-blue-400" />
          ))}
        </div>
      </div>
      <div className="hidden 2xl:block absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-30 select-none">
        <div className="grid grid-cols-4 gap-2.5">
          {[...Array(24)].map((_, i) => (
            <div key={i} className="w-1.5 h-1.5 rounded-full bg-blue-400" />
          ))}
        </div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        
        {/* ========================================================================= */}
        {/* SECTION HEADER: Pill Badge, Main Title, Subtitle & 3D School & Doodle     */}
        {/* ========================================================================= */}
        <div className="relative text-center mb-12 sm:mb-16">
          
          {/* Top-Left Playful Handwritten Annotation with Rays */}
          <div className="hidden lg:block absolute -top-4 left-4 xl:left-8 pointer-events-none select-none text-left">
            <div className="inline-block -rotate-[7deg] bg-white/50 backdrop-blur-xs px-3.5 py-2 rounded-2xl border border-blue-200/50 shadow-2xs">
              <div className="relative font-bold text-blue-600 leading-tight tracking-tight text-sm xl:text-base">
                <div className="text-blue-600 font-medium">`Solusi Lengkap</div>
                <div className="text-blue-700 font-extrabold">untuk Manajemen`</div>
                <div className="text-blue-800 font-black">Sekolah Anda.</div>

                {/* Playful Ray Lines */}
                <svg className="absolute -top-3.5 -right-3 w-7 h-7 text-blue-500" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2V6M19 5L16 8M22 12H18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
                </svg>
              </div>
            </div>
          </div>

          {/* Top-Right 3D Illustration of Indonesian School with 'SCHOOL' Sign */}
          <div className="hidden lg:block absolute -top-12 right-2 xl:right-6 pointer-events-none select-none w-48 xl:w-56">
            <img 
              src="/images/pricing_school_3d.jpg" 
              alt="School 3D Illustration" 
              className="w-full h-auto object-contain drop-shadow-lg"
              loading="lazy"
            />
          </div>

          {/* Center Pill Badge with Icon */}
          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-blue-100/90 border border-blue-200 text-blue-800 text-xs font-bold tracking-wide shadow-2xs mb-3.5">
            <Star className="w-3.5 h-3.5 text-blue-600 fill-blue-600/30 shrink-0" />
            <span>{isId ? 'Paket & Harga' : 'Packages & Pricing'}</span>
          </div>

          {/* High-Contrast Main Title */}
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight uppercase max-w-2xl mx-auto">
            <span>{isId ? 'Pilih Paket Sesuai' : 'Choose Plan For'}</span>
            <span className="block text-blue-600 mt-1">{isId ? 'Ruang Kerja Anda' : 'Your Workspace'}</span>
          </h2>

          {/* Subtitle Description */}
          <p className="mt-3 text-slate-600 text-xs sm:text-sm md:text-base leading-relaxed max-w-xl mx-auto font-normal">
            {isId
              ? 'Paket ditentukan berdasarkan ruang kerja: mulai dari Ruang Kerja Individu hingga Ruang Kerja Sekolah terpadu.'
              : 'Plans are organized by workspace: from standalone personal workspaces for individual teachers to fully integrated institutional school deployment.'}
          </p>

          {/* Toggle Switch Periode Waktu: Bulanan vs Tahunan (Rounded Pill Style) */}
          <div className="pt-4 flex items-center justify-center">
            <div className="inline-flex items-center p-1 bg-white border border-slate-200/90 rounded-full shadow-xs">
              <button
                type="button"
                onClick={() => setBillingCycle('monthly')}
                className={`px-5 py-2 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  billingCycle === 'monthly'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {isId ? 'Bulanan' : 'Monthly'}
              </button>

              <button
                type="button"
                onClick={() => setBillingCycle('yearly')}
                className={`px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  billingCycle === 'yearly'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>{isId ? 'Tahunan' : 'Yearly'}</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500 text-white">
                  {isId ? 'Hemat 2 Bulan' : 'Save 2 Mos'}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Quick Plan Switcher Bar */}
        <div className="md:hidden flex items-center justify-between gap-1 p-1 bg-blue-100/60 border border-blue-200/80 rounded-2xl mb-4 overflow-x-auto">
          {plans.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => scrollToPlan(p.id)}
              className={`flex-1 min-w-[70px] py-2 px-2 text-xs font-black rounded-xl transition-all text-center whitespace-nowrap cursor-pointer ${
                activeMobilePlan === p.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {p.id === 'free' ? (isId ? 'Gratis' : 'Free') :
               p.id === 'teacher' ? (isId ? 'Guru' : 'Teacher') :
               (isId ? 'Sekolah ★' : 'School ★')}
            </button>
          ))}
        </div>

        {/* ========================================================================= */}
        {/* 3 PRICING CARDS: White Card, Blue-Bordered Card, Dark Blue Institution Card */}
        {/* ========================================================================= */}
        <div className="flex md:grid md:grid-cols-3 overflow-x-auto md:overflow-x-visible snap-x snap-mandatory gap-6 items-stretch pb-4 md:pb-0 -mx-3 px-3 sm:mx-0 sm:px-0 max-w-6xl mx-auto">
          
          {/* CARD 1: PAKET GRATIS (Ruang Kerja Individu) */}
          <div 
            id="pricing-card-free"
            className="w-[85vw] sm:w-[350px] md:w-auto shrink-0 md:shrink snap-center bg-white rounded-3xl p-6 sm:p-7 flex flex-col justify-between border border-blue-100/80 shadow-[0_8px_24px_-8px_rgba(37,99,235,0.08)] hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 relative"
          >
            <div>
              {/* Workspace Badge */}
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                  <User className="w-4 h-4" />
                </div>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700">
                  {plans[0].workspaceType}
                </span>
              </div>

              {/* Title & Tagline */}
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mb-2">
                {plans[0].name}
              </h3>
              <p className="text-xs sm:text-[13px] text-slate-500 leading-relaxed min-h-[38px] mb-4">
                {plans[0].tagline}
              </p>

              {/* Price Block */}
              <div className="mb-4 pb-4 border-b border-slate-100">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                    {plans[0].price}
                  </span>
                  <span className="text-xs font-bold text-slate-500">
                    {plans[0].period}
                  </span>
                </div>
                <div className="mt-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                  <span>{plans[0].paymentNote}</span>
                </div>
              </div>

              {/* Features List */}
              <div className="space-y-2 mb-6">
                <div className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                  {isId ? 'FITUR UTAMA:' : 'KEY FEATURES:'}
                </div>
                {plans[0].features.map((feat, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-slate-600">
                    <div className="w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mt-0.5 text-blue-600">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                    <span className="text-xs sm:text-[13px] leading-snug">{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA Button */}
            <button
              type="button"
              onClick={() => handleCtaClick('free')}
              className="w-full py-3 px-4 text-xs sm:text-sm font-bold text-blue-600 bg-white border-2 border-blue-500 hover:bg-blue-50 rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs active:scale-98"
            >
              <span>{plans[0].ctaText}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* CARD 2: PAKET GURU (Ruang Kerja Individu Pro) - Paling Populer */}
          <div 
            id="pricing-card-teacher"
            className="w-[85vw] sm:w-[350px] md:w-auto shrink-0 md:shrink snap-center bg-white rounded-3xl p-6 sm:p-7 flex flex-col justify-between border-2 border-blue-500 shadow-[0_12px_32px_-8px_rgba(37,99,235,0.18)] hover:shadow-2xl transition-all duration-300 relative"
          >
            {/* Top Pill Badge - Paling Populer */}
            <div className="absolute -top-3 left-6 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-blue-600 text-white shadow-md flex items-center gap-1.5">
              <Star className="w-3 h-3 fill-white" />
              <span>{plans[1].badge}</span>
            </div>

            <div>
              {/* Workspace Badge */}
              <div className="flex items-center gap-2 mb-4 mt-1">
                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                  <Users className="w-4 h-4" />
                </div>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700">
                  {plans[1].workspaceType}
                </span>
              </div>

              {/* Title & Tagline */}
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mb-2">
                {plans[1].name}
              </h3>
              <p className="text-xs sm:text-[13px] text-slate-500 leading-relaxed min-h-[38px] mb-4">
                {plans[1].tagline}
              </p>

              {/* Price Block */}
              <div className="mb-4 pb-4 border-b border-slate-100">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                    {plans[1].price}
                  </span>
                  <span className="text-xs font-bold text-slate-500">
                    {plans[1].period}
                  </span>
                </div>
                <div className="mt-2 text-[11px] font-bold text-blue-600 uppercase tracking-wider flex items-center gap-1.5">
                  <QrCode className="w-3.5 h-3.5 text-blue-600" />
                  <span>{plans[1].paymentNote}</span>
                </div>
              </div>

              {/* Features List */}
              <div className="space-y-2 mb-6">
                <div className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                  {isId ? 'FITUR UTAMA:' : 'KEY FEATURES:'}
                </div>
                {plans[1].features.map((feat, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-slate-600">
                    <div className="w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mt-0.5 text-blue-600">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                    <span className="text-xs sm:text-[13px] leading-snug">{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA Button */}
            <button
              type="button"
              onClick={() => handleCtaClick('teacher')}
              className="w-full py-3.5 px-4 text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-blue-500/25 active:scale-98"
            >
              <span>{plans[1].ctaText}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* CARD 3: PAKET SEKOLAH (Ruang Kerja Sekolah / Institusi) - Dark Blue Theme */}
          <div 
            id="pricing-card-school"
            className="w-[85vw] sm:w-[350px] md:w-auto shrink-0 md:shrink snap-center bg-[#0C2D64] text-white rounded-3xl p-6 sm:p-7 flex flex-col justify-between shadow-2xl relative overflow-hidden"
          >
            {/* Top Pill Badge - Rekomendasi Utama Sekolah */}
            <div className="absolute -top-3 left-6 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-400 text-slate-950 shadow-md flex items-center gap-1.5">
              <Star className="w-3 h-3 fill-slate-950" />
              <span>{plans[2].badge}</span>
            </div>

            <div>
              {/* Workspace Badge */}
              <div className="flex items-center gap-2 mb-4 mt-1">
                <div className="w-8 h-8 rounded-full bg-blue-800/70 flex items-center justify-center text-blue-300">
                  <Building2 className="w-4 h-4" />
                </div>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-800/60 text-blue-200">
                  {plans[2].workspaceType}
                </span>
              </div>

              {/* Title & Tagline */}
              <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight mb-2">
                {plans[2].name}
              </h3>
              <p className="text-xs sm:text-[13px] text-blue-200/90 leading-relaxed min-h-[38px] mb-4">
                {plans[2].tagline}
              </p>

              {/* Price Block */}
              <div className="mb-4 pb-4 border-b border-blue-800/80">
                {plans[2].originalPrice && (
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs line-through text-blue-300 font-bold">
                      {plans[2].originalPrice}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500 text-white">
                      {plans[2].savingsBadge}
                    </span>
                  </div>
                )}
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                    {plans[2].price}
                  </span>
                  <span className="text-xs font-bold text-blue-200">
                    {plans[2].period}
                  </span>
                </div>
                <div className="mt-2 text-[11px] font-bold text-blue-300 uppercase tracking-wider flex items-center gap-1.5">
                  <QrCode className="w-3.5 h-3.5 text-blue-300" />
                  <span>{plans[2].paymentNote}</span>
                </div>
              </div>

              {/* Features List */}
              <div className="space-y-2 mb-6">
                <div className="text-[11px] font-black uppercase tracking-wider text-blue-300">
                  {isId ? 'FITUR UTAMA:' : 'KEY FEATURES:'}
                </div>
                {plans[2].features.map((feat, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-blue-50">
                    <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center shrink-0 mt-0.5 text-white">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                    <span className="text-xs sm:text-[13px] leading-snug">{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA Button: Yellow/Amber Accent */}
            <button
              type="button"
              onClick={() => handleCtaClick('school')}
              className="w-full py-3.5 px-4 text-xs sm:text-sm font-black text-slate-950 bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-amber-400/20 active:scale-98"
            >
              <span>{plans[2].ctaText}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>

        {/* ========================================================================= */}
        {/* BOTTOM GUARANTEE & TRUST BAR: 4 Columns (Matching Bottom Row of Image)    */}
        {/* ========================================================================= */}
        <div className="mt-12 sm:mt-16 bg-white/90 backdrop-blur-xs rounded-3xl p-6 sm:p-7 border border-blue-100/80 shadow-[0_8px_24px_-8px_rgba(37,99,235,0.08)] max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            
            {/* 1. Aman & Terpercaya */}
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-black text-slate-900 mb-0.5">
                  {isId ? 'Aman & Terpercaya' : 'Secure & Trusted'}
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {isId ? 'Data sekolah Anda terlindungi dengan sistem keamanan modern.' : 'Your school data is protected with modern security systems.'}
                </p>
              </div>
            </div>

            {/* 2. Akses Fleksibel */}
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-black text-slate-900 mb-0.5">
                  {isId ? 'Akses Fleksibel' : 'Flexible Access'}
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {isId ? 'Bisa diakses dari mana saja, kapan saja, di semua perangkat.' : 'Accessible from anywhere, anytime, across all devices.'}
                </p>
              </div>
            </div>

            {/* 3. Dukungan Penuh */}
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0">
                <Headphones className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-black text-slate-900 mb-0.5">
                  {isId ? 'Dukungan Penuh' : 'Full Support'}
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {isId ? 'Tim support siap membantu kapanpun Anda butuh.' : 'Our support team is ready to assist whenever you need.'}
                </p>
              </div>
            </div>

            {/* 4. Update Berkala */}
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0">
                <RefreshCw className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-black text-slate-900 mb-0.5">
                  {isId ? 'Update Berkala' : 'Regular Updates'}
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {isId ? 'Fitur selalu berkembang sesuai kebutuhan sekolah.' : 'Features constantly evolve with modern school requirements.'}
                </p>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};

