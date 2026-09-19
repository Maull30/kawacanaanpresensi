import React, { useState } from 'react';
import { Check, Sparkles, QrCode, ArrowRight, ShieldCheck, Building2, User } from 'lucide-react';
import { formatRupiah } from '../../utils/packageSystem';

export type BillingCycle = 'monthly' | 'yearly';
export type PlanIdType = 'free' | 'teacher' | 'school';

interface PricingSectionProps {
  onOpenRegister: (planId?: PlanIdType) => void;
  lang: 'ID' | 'EN';
  customPackagesConfig?: any;
}

export const PricingSection: React.FC<PricingSectionProps> = ({ onOpenRegister, lang, customPackagesConfig }) => {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');
  const [activeMobilePlan, setActiveMobilePlan] = useState<PlanIdType>('school');

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
      name: lang === 'ID' ? 'PAKET GRATIS' : 'FREE PLAN',
      workspaceType: lang === 'ID' ? 'Ruang Kerja Individu' : 'Personal Workspace',
      workspaceIcon: User,
      price: 'Rp0',
      period: lang === 'ID' ? '/selamanya' : '/lifetime',
      originalPrice: null,
      savingsBadge: null,
      subNote: null,
      tagline: lang === 'ID'
        ? 'Akses dasar mandiri untuk 1 guru mengelola presensi harian 1 rombel tanpa biaya.'
        : 'Basic self-service access for 1 teacher to manage 1 class cohort with zero fees.',
      highlight: false,
      badge: null,
      features: freeConfig?.fitur && freeConfig.fitur.length > 0 ? freeConfig.fitur : [
        lang === 'ID' ? '1 Akun Guru (Wali Kelas Mandiri)' : '1 Teacher Account (Homeroom)',
        lang === 'ID' ? 'Maksimal 32 Siswa SD' : 'Up to 32 Elementary Students',
        lang === 'ID' ? '1 Rombongan Belajar / Kelas' : '1 Class Cohort',
        lang === 'ID' ? 'Presensi Pagi & Rekap Bulanan' : 'Daily Morning Check-in & Monthly Recap',
        lang === 'ID' ? 'Unduh Format Spreadsheet (Excel)' : 'Download Spreadsheet Recap (Excel)',
        lang === 'ID' ? 'Aktif Selamanya (Tanpa Expired)' : 'Active Forever (No Expiration)'
      ],
      ctaText: lang === 'ID' ? 'Mulai Gratis Sekarang' : 'Start for Free',
      ctaStyle: 'bg-slate-800 hover:bg-slate-900 text-white',
      paymentNote: lang === 'ID' ? 'Tanpa Kartu Kredit / Rp0' : 'No Credit Card Required',
      isCustom: false,
    },

    // -------------------------------------------------------------
    // 2. PAKET GURU (Ruang Kerja Individu Pro)
    // -------------------------------------------------------------
    {
      id: 'teacher' as const,
      name: lang === 'ID' ? 'PAKET GURU' : 'TEACHER PLAN',
      workspaceType: lang === 'ID' ? 'Ruang Kerja Individu Pro' : 'Teacher Workspace Pro',
      workspaceIcon: User,
      price: billingCycle === 'monthly'
        ? formatRupiah(teacherMonthlyPrice)
        : formatRupiah(teacherYearlyPrice),
      period: billingCycle === 'monthly'
        ? (lang === 'ID' ? '/bulan' : '/month')
        : (lang === 'ID' ? '/tahun' : '/year'),
      originalPrice: null,
      savingsBadge: billingCycle === 'yearly'
        ? (lang === 'ID' ? 'Aktif 1 Tahun Penuh' : 'Full 1 Year Access')
        : null,
      subNote: null,
      tagline: lang === 'ID'
        ? 'Solusi lengkap bagi wali kelas atau guru mapel yang mengajar beberapa rombel belajar.'
        : 'Complete solution for teachers or subject specialists handling multiple classes.',
      highlight: false,
      badge: lang === 'ID' ? 'Favorit Guru SD' : 'Teacher Favorite',
      features: teacherConfig?.fitur && teacherConfig.fitur.length > 0 ? teacherConfig.fitur : [
        lang === 'ID' ? 'Semua Fitur Paket Gratis' : 'All Free Plan Features',
        lang === 'ID' ? 'Kelola s/d 5 Rombongan Belajar' : 'Manage up to 5 Class Cohorts',
        lang === 'ID' ? 'Kapasitas hingga 150 Siswa SD' : 'Up to 150 Elementary Students',
        lang === 'ID' ? 'Presensi Jam Mata Pelajaran' : 'Subject Schedule Check-in',
        lang === 'ID' ? 'Cetak Laporan Format Kedinasan' : 'Print Official Kedinasan Format',
        lang === 'ID' ? 'Ekspor Rekap Semester PDF & Excel' : 'Semester PDF & Excel Recap Export',
        lang === 'ID' ? 'Bantuan Teknis Cepat via WhatsApp' : 'Fast WhatsApp Technical Support'
      ],
      ctaText: lang === 'ID' ? 'Pilih Paket Guru' : 'Select Teacher Plan',
      ctaStyle: 'bg-blue-600 hover:bg-blue-700 text-white',
      paymentNote: lang === 'ID' ? 'QRIS Real-Time Settlement' : 'QRIS Real-Time Settlement',
      isCustom: false,
    },

    // -------------------------------------------------------------
    // 3. PAKET SEKOLAH (Ruang Kerja Sekolah / Institusi)
    // -------------------------------------------------------------
    {
      id: 'school' as const,
      name: lang === 'ID' ? 'PAKET SEKOLAH' : 'SCHOOL PLAN',
      workspaceType: lang === 'ID' ? 'Ruang Kerja Sekolah (Institusi)' : 'School Workspace (Full)',
      workspaceIcon: Building2,
      price: billingCycle === 'monthly'
        ? formatRupiah(schoolMonthlyPrice)
        : formatRupiah(schoolYearlyEffectivePrice),
      period: billingCycle === 'monthly'
        ? (lang === 'ID' ? '/bulan' : '/month')
        : (lang === 'ID' ? '/tahun' : '/year'),
      originalPrice: billingCycle === 'yearly'
        ? formatRupiah(schoolYearlyRegularPrice)
        : null,
      savingsBadge: billingCycle === 'yearly'
        ? (lang === 'ID' ? 'Hemat 2 Bulan (Rp50.000) • Promo Perdana' : 'Save 2 Months • First-Time Promo')
        : null,
      subNote: billingCycle === 'yearly'
        ? (lang === 'ID' ? 'Catatan: Pembelian perdana Rp250.000 (hemat 2 bulan). Perpanjangan tahun berikutnya: Rp300.000/thn.' : 'Special note: First purchase Rp250,000 (save 2 months). Annual renewal: Rp300,000/yr.')
        : null,
      tagline: lang === 'ID'
        ? 'Sistem presensi terpadu 1 sekolah dasar: kepala sekolah, operator, seluruh guru & siswa.'
        : 'Integrated system for entire school: principal, operator, all teachers & students.',
      highlight: true,
      badge: lang === 'ID' ? 'Rekomendasi Utama SD' : 'Best Choice for SD',
      features: schoolConfig?.fitur && schoolConfig.fitur.length > 0 ? schoolConfig.fitur : [
        lang === 'ID' ? 'Seluruh Fitur Terbuka Penuh' : 'All Features Fully Unlocked',
        lang === 'ID' ? 'Semua Guru & Tenaga Kependidikan' : 'All Teachers & School Staff',
        lang === 'ID' ? 'Semua Rombel Kelas 1–6 (Paralel A/B/C)' : 'All Classes 1 to 6 (Parallel)',
        lang === 'ID' ? 'Kapasitas hingga 1.000 Siswa SD' : 'Capacity up to 1,000 Students',
        lang === 'ID' ? 'Perhitungan Hari Efektif Kalender' : 'Automatic Effective Days Calculation',
        lang === 'ID' ? 'Cetak Laporan Format Kedinasan Resmi' : 'Official Printable Kedinasan Reports',
        lang === 'ID' ? 'Kop Surat Resmi & Stempel Digital' : 'Official School Header & Stamp',
        lang === 'ID' ? 'Portal Siswa & Pengajuan Izin HP' : 'Student Portal & Self Excuse Form',
        lang === 'ID' ? 'Bantuan Migrasi & Unggah Data Awal' : 'Data Migration & Initial Setup Support'
      ],
      ctaText: lang === 'ID' ? 'Daftarkan Sekolah' : 'Register School',
      ctaStyle: 'bg-amber-400 hover:bg-amber-300 text-slate-950 font-black shadow-md shadow-amber-400/20',
      paymentNote: lang === 'ID' ? 'QRIS / Semua Bank & Faktur' : 'QRIS & Official Receipt',
      isCustom: false,
    }
  ];

  const handleCtaClick = (plan: typeof plans[0]) => {
    onOpenRegister(plan.id);
  };

  return (
    <section id="harga" className="scroll-mt-16 sm:scroll-mt-20 py-14 sm:py-16 lg:py-20 bg-slate-50 text-slate-900 relative border-b border-blue-100 antialiased">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Seksi */}
        <div className="text-center max-w-3xl mx-auto space-y-2.5 mb-8 sm:mb-10 lg:mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold uppercase tracking-wider font-mono">
            <QrCode className="w-3.5 h-3.5 text-blue-700 shrink-0" />
            <span>{lang === 'ID' ? 'PILIHAN LISENSI & HARGA RESMI' : 'OFFICIAL LICENSING & PRICING'}</span>
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#0B2F64] tracking-tight uppercase leading-tight">
            {lang === 'ID' ? (
              <>PILIH PAKET SESUAI <span className="text-blue-600">RUANG KERJA ANDA</span></>
            ) : (
              <>CHOOSE PLAN FOR YOUR <span className="text-blue-600">WORKSPACE</span></>
            )}
          </h2>

          <p className="text-slate-600 text-xs sm:text-sm md:text-base leading-relaxed max-w-2xl mx-auto font-normal">
            {lang === 'ID'
              ? 'Paket ditentukan berdasarkan ruang kerja: mulai dari Ruang Kerja Individu hingga Ruang Kerja Sekolah terpadu.'
              : 'Plans are organized by workspace: from standalone personal workspaces for individual teachers to fully integrated institutional school deployment.'}
          </p>

          {/* Toggle Switch Periode Waktu: Bulanan vs Tahunan (Tanpa kata Tagihan) */}
          <div className="pt-2 flex items-center justify-center">
            <div className="inline-flex items-center p-1 bg-white border border-slate-200 rounded-xl shadow-xs">
              <button
                type="button"
                onClick={() => setBillingCycle('monthly')}
                className={`px-3.5 sm:px-4 py-1.5 rounded-lg text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
                  billingCycle === 'monthly'
                    ? 'bg-[#0B2F64] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {lang === 'ID' ? 'Bulanan' : 'Monthly'}
              </button>

              <button
                type="button"
                onClick={() => setBillingCycle('yearly')}
                className={`px-3.5 sm:px-4 py-1.5 rounded-lg text-xs sm:text-sm font-extrabold transition-all flex items-center gap-1.5 cursor-pointer ${
                  billingCycle === 'yearly'
                    ? 'bg-[#0B2F64] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>{lang === 'ID' ? 'Tahunan' : 'Yearly'}</span>
                <span className="px-1.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-black bg-emerald-500 text-white">
                  {lang === 'ID' ? 'Hemat 2 Bulan' : 'Save ~20%'}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Quick Plan Switcher Bar */}
        <div className="md:hidden flex items-center justify-between gap-1 p-1 bg-slate-200/80 border border-slate-300/80 rounded-xl mb-3 overflow-x-auto">
          {plans.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => scrollToPlan(p.id)}
              className={`flex-1 min-w-[70px] py-1.5 px-2 text-[10px] font-black rounded-lg transition-all text-center whitespace-nowrap cursor-pointer ${
                activeMobilePlan === p.id
                  ? 'bg-[#0B2F64] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {p.id === 'free' ? (lang === 'ID' ? 'Gratis' : 'Free') :
               p.id === 'teacher' ? (lang === 'ID' ? 'Guru' : 'Teacher') :
               (lang === 'ID' ? 'Sekolah ★' : 'School ★')}
            </button>
          ))}
        </div>

        {/* 3 Kartu: Horizontal Swipe dengan Snap di Mobile, Grid 3 di Tablet/Desktop */}
        <div className="flex md:grid md:grid-cols-3 overflow-x-auto md:overflow-x-visible snap-x snap-mandatory gap-4 sm:gap-6 lg:gap-8 items-stretch pb-2 md:pb-0 -mx-3 px-3 sm:mx-0 sm:px-0 max-w-6xl mx-auto">
          {plans.map((plan) => {
            const IconComponent = plan.workspaceIcon;

            return (
              <div
                key={plan.id}
                id={`pricing-card-${plan.id}`}
                className={`w-[82vw] min-[380px]:w-[78vw] sm:w-[350px] md:w-auto shrink-0 md:shrink snap-center rounded-2xl p-4 sm:p-6 lg:p-6 flex flex-col justify-between transition-all relative ${
                  plan.highlight
                    ? 'bg-gradient-to-b from-[#0B2F64] to-[#071F42] text-white border-2 border-blue-500 shadow-xl lg:-translate-y-1.5 ring-2 ring-blue-500/20'
                    : 'bg-white text-slate-900 border border-slate-200 shadow-xs hover:shadow-sm'
                }`}
              >
                {/* Badge Status / Rekomendasi */}
                {plan.badge && (
                  <div className={`absolute -top-2.5 left-4 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider shadow-xs flex items-center gap-1 ${
                    plan.highlight
                      ? 'bg-amber-400 text-slate-950 ring-1 ring-white/30'
                      : 'bg-blue-600 text-white'
                  }`}>
                    <Sparkles className="w-2.5 h-2.5" />
                    <span>{plan.badge}</span>
                  </div>
                )}

                <div>
                  {/* Workspace Category Tag */}
                  <div className={`flex items-center gap-1.5 text-[9.5px] sm:text-[10.5px] font-bold uppercase tracking-wider mb-1 ${
                    plan.highlight ? 'text-blue-200' : 'text-blue-700'
                  }`}>
                    <IconComponent className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{plan.workspaceType}</span>
                  </div>

                  {/* Plan Name */}
                  <h3 className={`text-base sm:text-lg font-black uppercase tracking-tight mb-1 ${
                    plan.highlight ? 'text-white' : 'text-[#0B2F64]'
                  }`}>
                    {plan.name}
                  </h3>

                  {/* Tagline */}
                  <p className={`text-[11px] mb-3 min-h-[32px] sm:min-h-[36px] leading-relaxed ${
                    plan.highlight ? 'text-blue-100' : 'text-slate-600'
                  }`}>
                    {plan.tagline}
                  </p>

                  {/* Price Block */}
                  <div className={`mb-3 pb-3 border-b ${
                    plan.highlight ? 'border-blue-800/80' : 'border-slate-100'
                  }`}>
                    {plan.originalPrice && (
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs sm:text-sm line-through text-blue-300 font-bold opacity-90">
                          {plan.originalPrice}
                        </span>
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-amber-400 text-slate-950">
                          {lang === 'ID' ? 'Hemat Rp50.000' : 'Save Rp50k'}
                        </span>
                      </div>
                    )}
                    <div className="flex items-baseline gap-1 flex-wrap">
                      <span className={`text-xl sm:text-2xl lg:text-3xl font-black tracking-tight ${
                        plan.highlight ? 'text-white' : 'text-slate-900'
                      }`}>
                        {plan.price}
                      </span>
                      <span className={`text-[10px] sm:text-[11px] font-bold ${
                        plan.highlight ? 'text-blue-200' : 'text-slate-500'
                      }`}>
                        {plan.period}
                      </span>
                    </div>

                    {/* Savings Tag for Yearly */}
                    {plan.savingsBadge && (
                      <div className="mt-1">
                        <span className={`inline-block px-1.5 py-0.5 rounded text-[8.5px] sm:text-[9.5px] font-black uppercase tracking-wider ${
                          plan.highlight
                            ? 'bg-emerald-500 text-white'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}>
                          {plan.savingsBadge}
                        </span>
                      </div>
                    )}

                    {plan.subNote && (
                      <p className={`mt-1.5 text-[9.5px] sm:text-[10px] leading-snug font-medium ${
                        plan.highlight ? 'text-blue-200/90' : 'text-slate-500'
                      }`}>
                        {plan.subNote}
                      </p>
                    )}

                    <div className={`mt-1.5 text-[8.5px] sm:text-[9.5px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                      plan.highlight ? 'text-blue-200' : 'text-slate-500'
                    }`}>
                      <QrCode className="w-3 h-3 shrink-0 text-blue-500" />
                      <span>{plan.paymentNote}</span>
                    </div>
                  </div>

                  {/* Features List */}
                  <div className="space-y-1.5 sm:space-y-2 mb-4">
                    <div className={`text-[8.5px] sm:text-[9.5px] font-black uppercase tracking-wider ${
                      plan.highlight ? 'text-blue-200' : 'text-slate-400'
                    }`}>
                      {lang === 'ID' ? 'FITUR UTAMA:' : 'KEY FEATURES:'}
                    </div>

                    {plan.features.map((feat: string, i: number) => (
                      <div key={i} className={`flex items-start gap-1.5 sm:gap-2 leading-snug ${
                        plan.highlight ? 'text-blue-50' : 'text-slate-700'
                      }`}>
                        <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                          plan.highlight ? 'bg-blue-500 text-white' : 'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}>
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                        <span className="text-[10.5px] sm:text-[11.5px]">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CTA Button */}
                <button
                  type="button"
                  onClick={() => handleCtaClick(plan)}
                  className={`w-full py-2.5 px-3 text-[11px] font-black uppercase tracking-wider transition-all cursor-pointer rounded-xl flex items-center justify-center gap-1.5 active:scale-98 min-h-[38px] ${plan.ctaStyle}`}
                  id={`btn-select-plan-${plan.id}`}
                >
                  <span>{plan.ctaText}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
