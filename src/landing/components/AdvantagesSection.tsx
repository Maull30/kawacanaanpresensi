import React from 'react';
import { 
  Users, 
  Database, 
  Activity, 
  FileText, 
  Lock, 
  Cloud, 
  School, 
  CalendarCheck, 
  Check, 
  Zap, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

interface AdvantagesSectionProps {
  lang: 'ID' | 'EN';
  onOpenRegister: () => void;
}

export const AdvantagesSection: React.FC<AdvantagesSectionProps> = ({ lang, onOpenRegister }) => {
  const advantages = lang === 'ID' ? [
    {
      num: '01',
      title: 'Alur Khusus Sekolah Dasar',
      highlight: 'Mendukung presensi harian Wali Kelas dan presensi jam Guru Mapel.',
      badge: 'Alur Spesifik',
      metric: 'Dual-Mode SD',
      icon: School,
    },
    {
      num: '02',
      title: 'Hari Efektif Otomatis',
      highlight: 'Kalkulasi hari belajar efektif bulanan dan semester kedinasan instan.',
      badge: 'Otomatisasi',
      metric: '100% Akurat',
      icon: CalendarCheck,
    },
    {
      num: '03',
      title: 'Format Cetak Kedinasan',
      highlight: 'Ekspor dokumen A4 berstandar dinas dengan kolom tanda tangan resmi.',
      badge: 'Format Resmi',
      metric: 'Standar A4',
      icon: FileText,
    },
    {
      num: '04',
      title: 'Database Rombel Terstruktur',
      highlight: 'Pengelolaan data siswa kelas 1–6, NISN, dan arsip kenaikan kelas rapi.',
      badge: 'Data Suite',
      metric: 'Kelas 1–6',
      icon: Database,
    },
    {
      num: '05',
      title: 'Monitoring Terpusat Kepsek & TU',
      highlight: 'Pantau rekapitulasi kehadiran seluruh rombel secara real-time.',
      badge: 'Pengawasan',
      metric: 'Real-time',
      icon: Activity,
    },
    {
      num: '06',
      title: 'Hak Akses Multi-Peran',
      highlight: 'Pemisahan wewenang aman antara Kepsek, TU, Guru, dan Siswa.',
      badge: 'Keamanan',
      metric: 'Role-Based',
      icon: Lock,
    },
    {
      num: '07',
      title: 'Cloud Native & Multi-Device',
      highlight: 'Akses lancar via smartphone, tablet, dan PC tanpa server fisik lokal.',
      badge: 'Infrastruktur',
      metric: 'Cloud 24/7',
      icon: Cloud,
    },
    {
      num: '08',
      title: 'Portal Siswa & Orang Tua',
      highlight: 'Akses transparan untuk cek kehadiran harian dan unggah surat izin online.',
      badge: 'Kolaborasi',
      metric: 'Akses Instan',
      icon: Users,
    },
  ] : [
    {
      num: '01',
      title: 'Primary School Workflow',
      highlight: 'Supports daily homeroom check-ins and subject period logs for specialists.',
      badge: 'Tailored Flow',
      metric: 'Dual-Mode',
      icon: School,
    },
    {
      num: '02',
      title: 'Auto Effective School Days',
      highlight: 'Automated calculation of monthly and semester learning days.',
      badge: 'Automation',
      metric: '100% Accurate',
      icon: CalendarCheck,
    },
    {
      num: '03',
      title: 'Official Kedinasan Reports',
      highlight: 'Print-ready standard A4 records with official signature boxes.',
      badge: 'Official Format',
      metric: 'A4 Standard',
      icon: FileText,
    },
    {
      num: '04',
      title: 'Structured Grade 1–6 Database',
      highlight: 'Centralized management of student profiles, IDs, and promotion records.',
      badge: 'Data Suite',
      metric: 'Grade 1–6',
      icon: Database,
    },
    {
      num: '05',
      title: 'Centralized Principal Oversight',
      highlight: 'Real-time attendance monitoring across all cohorts from one dashboard.',
      badge: 'Oversight',
      metric: 'Real-time',
      icon: Activity,
    },
    {
      num: '06',
      title: 'Role-Based Permissions',
      highlight: 'Hierarchical role access for Principal, Admin Staff, and Teachers.',
      badge: 'Security',
      metric: 'Role-Based',
      icon: Lock,
    },
    {
      num: '07',
      title: 'Cloud-Based & Cross-Device',
      highlight: 'Seamless access on mobile, tablet, or desktop without on-premise servers.',
      badge: 'Infrastructure',
      metric: '24/7 Cloud',
      icon: Cloud,
    },
    {
      num: '08',
      title: 'Student & Parent Portal',
      highlight: 'Transparent portal for guardians to verify attendance and submit sick notes.',
      badge: 'Collaboration',
      metric: 'Instant Access',
      icon: Users,
    },
  ];

  return (
    <section id="keunggulan" className="py-14 sm:py-18 lg:py-24 bg-white text-slate-900 relative border-b border-blue-100 antialiased overflow-hidden">
      {/* Background Subtle Grid Pattern */}
      <div className="absolute inset-0 z-0 pointer-events-none bg-grid-pattern opacity-20" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header - Modern Commercial SaaS Style */}
        <div className="max-w-3xl space-y-3 sm:space-y-4 mb-10 sm:mb-12 lg:mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-700 shrink-0" />
            <span>{lang === 'ID' ? 'KEUNGGULAN PLATFORM SAAS' : 'PLATFORM ADVANTAGES'}</span>
          </div>

          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-[#0B2F64] tracking-tight uppercase leading-[1.1]">
            {lang === 'ID' ? (
              <>
                KEUNGGULAN KHUSUS<br />
                <span className="text-blue-600">SEKOLAH DASAR</span>
              </>
            ) : (
              <>
                PURPOSE-BUILT FOR<br />
                <span className="text-blue-600">PRIMARY SCHOOLS</span>
              </>
            )}
          </h2>

          <p className="text-slate-600 text-sm sm:text-base lg:text-lg leading-relaxed font-normal">
            {lang === 'ID'
              ? 'Arsitektur sistem presensi modern yang dirancang khusus memenuhi regulasi administrasi dan kebutuhan operasional sekolah dasar.'
              : 'Modern SaaS attendance platform engineered specifically to satisfy primary school administrative guidelines and day-to-day operations.'}
          </p>
        </div>

        {/* 8 Commercial SaaS Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
          {advantages.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div 
                key={idx}
                id={`advantage-card-${idx}`}
                className="bg-white hover:bg-slate-50/50 border border-slate-200/90 hover:border-blue-500 rounded-2xl p-5 sm:p-6 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10 group flex flex-col justify-between relative overflow-hidden"
              >
                {/* Top Subtle Brand Bar on Hover */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div>
                  {/* Header: Number, Badge & Icon */}
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-black text-blue-600 bg-blue-50 border border-blue-200/70 px-2 py-0.5 rounded-md">
                        {item.num}
                      </span>
                      <span className="text-[10px] sm:text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                        {item.badge}
                      </span>
                    </div>

                    <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-center text-slate-700 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-all duration-300 shadow-xs shrink-0">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>

                  {/* Title & Concise Highlight */}
                  <div className="mb-4">
                    <h3 className="text-base font-bold text-[#0B2F64] group-hover:text-blue-600 transition-colors tracking-tight mb-1.5 leading-snug">
                      {item.title}
                    </h3>
                    <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed font-normal">
                      {item.highlight}
                    </p>
                  </div>
                </div>

                {/* Bottom Row: SaaS Metric + Active Tag */}
                <div className="pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-[11px] font-semibold text-slate-500 font-mono">
                    {item.metric}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    <Check className="w-3 h-3 stroke-[3]" />
                    <span>{lang === 'ID' ? 'Tersedia' : 'Active'}</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Commercial SaaS Conversion Banner */}
        <div className="mt-12 sm:mt-16 bg-gradient-to-r from-[#0B2F64] via-[#0E3B7D] to-[#0B2F64] rounded-2xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 border border-blue-400/30 relative overflow-hidden">
          <div className="space-y-1.5 text-center md:text-left z-10">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-[11px] font-bold tracking-wide uppercase">
              <Zap className="w-3 h-3 text-amber-300" />
              <span>{lang === 'ID' ? 'Siap Pakai Dalam 2 Menit' : 'Ready In 2 Minutes'}</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black tracking-tight">
              {lang === 'ID' 
                ? 'Standarisasi Presensi Sekolah Dasar Anda Sekarang'
                : 'Standardize Your Primary School Attendance Today'}
            </h3>
            <p className="text-blue-100/80 text-xs sm:text-sm max-w-xl font-normal">
              {lang === 'ID'
                ? 'Tanpa perlu instalasi server fisik atau konfigurasi rumit. Mulai langsung dengan akun gratis.'
                : 'Zero on-premise servers or complex setup required. Get started immediately with a free tier.'}
            </p>
          </div>

          <div className="shrink-0 z-10">
            <button
              onClick={onOpenRegister}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm transition-all duration-200 shadow-md shadow-amber-400/20 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <span>{lang === 'ID' ? 'Mulai Sekarang' : 'Get Started Now'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </section>
  );
};
