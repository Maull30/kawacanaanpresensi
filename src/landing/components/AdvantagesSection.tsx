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
  ShieldCheck,
  ArrowRight
} from 'lucide-react';

interface AdvantagesSectionProps {
  lang: 'ID' | 'EN';
  onOpenRegister?: () => void;
}

export const AdvantagesSection: React.FC<AdvantagesSectionProps> = ({ lang }) => {
  const advantages = lang === 'ID' ? [
    {
      num: '01',
      title: 'Alur Khusus Sekolah Dasar',
      highlight: 'Presensi harian Wali Kelas dan jam pelajaran Guru Mapel.',
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
      highlight: 'Ekspor dokumen A4 berstandar dinas dengan tanda tangan resmi.',
      badge: 'Format Resmi',
      metric: 'Standar A4',
      icon: FileText,
    },
    {
      num: '04',
      title: 'Database Rombel Terstruktur',
      highlight: 'Pengelolaan data siswa kelas 1–6, NISN, dan arsip kelas rapi.',
      badge: 'Data Suite',
      metric: 'Kelas 1–6',
      icon: Database,
    },
    {
      num: '05',
      title: 'Monitoring Kepsek & TU',
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
      highlight: 'Akses lancar via smartphone, tablet, dan PC tanpa server lokal.',
      badge: 'Infrastruktur',
      metric: 'Cloud 24/7',
      icon: Cloud,
    },
    {
      num: '08',
      title: 'Portal Siswa & Orang Tua',
      highlight: 'Cek kehadiran harian dan pengajuan surat izin online transparan.',
      badge: 'Kolaborasi',
      metric: 'Akses Instan',
      icon: Users,
    },
  ] : [
    {
      num: '01',
      title: 'Primary School Workflow',
      highlight: 'Daily homeroom check-ins and subject period logs for specialists.',
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
      highlight: 'Centralized management of student profiles, IDs, and records.',
      badge: 'Data Suite',
      metric: 'Grade 1–6',
      icon: Database,
    },
    {
      num: '05',
      title: 'Centralized Principal Oversight',
      highlight: 'Real-time attendance monitoring across all cohorts.',
      badge: 'Oversight',
      metric: 'Real-time',
      icon: Activity,
    },
    {
      num: '06',
      title: 'Role-Based Permissions',
      highlight: 'Hierarchical role access for Principal, Staff, and Teachers.',
      badge: 'Security',
      metric: 'Role-Based',
      icon: Lock,
    },
    {
      num: '07',
      title: 'Cloud-Based & Cross-Device',
      highlight: 'Seamless access on mobile, tablet, or desktop with zero servers.',
      badge: 'Infrastructure',
      metric: '24/7 Cloud',
      icon: Cloud,
    },
    {
      num: '08',
      title: 'Student & Parent Portal',
      highlight: 'Transparent portal for guardians to verify attendance and leaves.',
      badge: 'Collaboration',
      metric: 'Instant Access',
      icon: Users,
    },
  ];

  return (
    <section 
      id="keunggulan" 
      className="scroll-mt-16 sm:scroll-mt-20 py-14 sm:py-16 lg:py-20 bg-white text-slate-900 relative border-b border-blue-100 antialiased overflow-hidden"
    >
      {/* Background Subtle Grid Pattern */}
      <div className="absolute inset-0 z-0 pointer-events-none bg-grid-pattern opacity-20" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        
        {/* Header - Balanced Modern Commercial SaaS Style */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 sm:mb-10 lg:mb-12">
          <div className="space-y-2.5 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-700 shrink-0" />
              <span>{lang === 'ID' ? 'KEUNGGULAN PLATFORM SAAS' : 'PLATFORM ADVANTAGES'}</span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#0B2F64] tracking-tight uppercase leading-tight">
              {lang === 'ID' ? (
                <>
                  Keunggulan Khusus <span className="text-blue-600">Sekolah Dasar</span>
                </>
              ) : (
                <>
                  Purpose-Built For <span className="text-blue-600">Primary Schools</span>
                </>
              )}
            </h2>

            <p className="text-slate-600 text-xs sm:text-sm md:text-base leading-relaxed font-normal">
              {lang === 'ID'
                ? 'Arsitektur sistem presensi modern yang dirancang khusus memenuhi regulasi administrasi sekolah dasar.'
                : 'Modern SaaS attendance platform engineered specifically to satisfy primary school administrative guidelines.'}
            </p>
          </div>

          {/* Swipe indicator hint for mobile only */}
          <div className="flex sm:hidden items-center gap-1.5 text-xs font-bold text-blue-700">
            <span>{lang === 'ID' ? 'Geser keunggulan' : 'Swipe advantages'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* 8 SaaS Cards: Responsive 4-Column Grid on Desktop, 2-Col Tablet, Swipeable on Mobile */}
        <div className="flex sm:grid sm:grid-cols-2 lg:grid-cols-4 overflow-x-auto sm:overflow-x-visible snap-x snap-mandatory gap-4 sm:gap-5 lg:gap-6 pb-3 sm:pb-0 -mx-4 px-4 sm:mx-0 sm:px-0">
          {advantages.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div 
                key={idx}
                id={`advantage-card-${idx}`}
                className="w-[82vw] max-w-[300px] sm:w-auto shrink-0 sm:shrink snap-center bg-white hover:bg-slate-50/50 border border-slate-200 hover:border-blue-500 rounded-2xl p-5 sm:p-5.5 transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/10 group flex flex-col justify-between relative overflow-hidden"
              >
                {/* Top Subtle Brand Bar on Hover */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

                <div>
                  {/* Header: Number, Badge & Icon */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-black text-blue-600 bg-blue-50 border border-blue-200/70 px-2 py-0.5 rounded-md">
                        {item.num}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider truncate">
                        {item.badge}
                      </span>
                    </div>

                    <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-center text-slate-700 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-all duration-200 shadow-xs shrink-0">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>

                  {/* Title & Concise Highlight */}
                  <div className="mb-3">
                    <h3 className="text-sm sm:text-base font-bold text-[#0B2F64] group-hover:text-blue-600 transition-colors tracking-tight mb-1.5 leading-snug">
                      {item.title}
                    </h3>
                    <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed font-normal">
                      {item.highlight}
                    </p>
                  </div>
                </div>

                {/* Bottom Row: SaaS Metric + Active Tag */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-xs font-semibold text-slate-500 font-mono">
                    {item.metric}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    <Check className="w-3 h-3 stroke-[3]" />
                    <span>{lang === 'ID' ? 'Tersedia' : 'Active'}</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
