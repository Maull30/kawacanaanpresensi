import React from 'react';
import { 
  BarChart3, 
  Users, 
  Clock, 
  Smartphone, 
  ShieldCheck, 
  CalendarRange, 
  FileSpreadsheet, 
  CalendarDays,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

interface FeaturesSectionProps {
  lang: 'ID' | 'EN';
}

export const FeaturesSection: React.FC<FeaturesSectionProps> = ({ lang }) => {
  const features = lang === 'ID' ? [
    {
      icon: BarChart3,
      title: 'Dashboard Presensi',
      desc: 'Pantau persentase dan rekap kehadiran siswa kelas 1–6 secara real-time.',
      items: [
        'Persentase kehadiran real-time',
        'Akumulasi H, S, I, & A harian',
        'Peringatan absensi berulang'
      ],
      badge: 'Real-time'
    },
    {
      icon: Clock,
      title: 'Dual-Mode Presensi',
      desc: 'Presensi harian oleh Wali Kelas dan presensi jam oleh Guru Mapel khusus.',
      items: [
        'Presensi harian Wali Kelas',
        'Presensi jam pelajaran Guru Mapel',
        'Sinkronisasi otomatis satu klik'
      ],
      badge: 'Dual-Mode'
    },
    {
      icon: Users,
      title: 'Manajemen Rombel 1–6',
      desc: 'Kelola data siswa, NISN, data wali, dan arsip kenaikan kelas terpusat.',
      items: [
        'Database rombel kelas 1 s/d 6',
        'Import & Export Excel / Dapodik',
        'Riwayat kenaikan kelas rapi'
      ],
      badge: 'Database'
    },
    {
      icon: CalendarDays,
      title: 'Kalender Hari Efektif',
      desc: 'Hitung otomatis hari belajar efektif bulanan dan semester kedinasan.',
      items: [
        'Kalkulasi hari efektif otomatis',
        'Jadwal libur & jeda semester',
        'Persentase kehadiran akurat'
      ],
      badge: 'Otomatis'
    },
    {
      icon: CalendarRange,
      title: 'Rekapitulasi Otomatis',
      desc: 'Rekap instan harian, bulanan, dan semester tanpa rumus spreadsheet manual.',
      items: [
        'Rekap instan per rombel & siswa',
        'Akumulasi semester ganjil & genap',
        'Filter cepat tanpa rumus manual'
      ],
      badge: 'Rekap Cepat'
    },
    {
      icon: FileSpreadsheet,
      title: 'Format Cetak Kedinasan',
      desc: 'Format cetak A4 terstruktur lengkap dengan kolom tanda tangan resmi.',
      items: [
        'Dokumen A4 standar kedinasan',
        'Kolom tanda tangan Kepsek & Guru',
        'Siap lampiran akreditasi & SPJ'
      ],
      badge: 'Standar A4'
    },
    {
      icon: Smartphone,
      title: 'Portal Siswa & Wali',
      desc: 'Akses mudah bagi orang tua untuk memantau kehadiran dan mengajukan izin.',
      items: [
        'Cek status hadir masuk & pulang',
        'Pengajuan izin & unggah surat sakit',
        'Tampilan ringan di smartphone'
      ],
      badge: 'Portal Murid'
    },
    {
      icon: ShieldCheck,
      title: 'Akses Multi-Peran',
      desc: 'Pembagian wewenang aman antara Kepsek, TU, Wali Kelas, dan Siswa.',
      items: [
        'Peran Kepsek, TU, & Guru Mapel',
        'Akses data terisolasi & aman',
        'Proteksi privasi data sekolah'
      ],
      badge: 'Multi-Peran'
    },
  ] : [
    {
      icon: BarChart3,
      title: 'Attendance Dashboard',
      desc: 'Monitor real-time student attendance across Grade 1–6 cohorts.',
      items: [
        'Real-time attendance rates',
        'Daily present, sick, & leave totals',
        'Repeated absence alerts'
      ],
      badge: 'Real-time'
    },
    {
      icon: Clock,
      title: 'Dual-Mode Attendance',
      desc: 'Homeroom daily check-ins and subject period logs for specialist teachers.',
      items: [
        'Daily homeroom check-in',
        'Subject period attendance logs',
        'One-click automated sync'
      ],
      badge: 'Dual-Mode'
    },
    {
      icon: Users,
      title: 'Grade 1–6 Cohorts',
      desc: 'Centralized management of student profiles, IDs, guardians, and archives.',
      items: [
        'Grade 1 to 6 cohort database',
        'Excel & student registry import/export',
        'Promotion history records'
      ],
      badge: 'Database'
    },
    {
      icon: CalendarDays,
      title: 'Academic Calendar',
      desc: 'Automated calculation of monthly and semester effective learning days.',
      items: [
        'Automated effective day counts',
        'Holiday and break management',
        'Accurate official attendance rates'
      ],
      badge: 'Automated'
    },
    {
      icon: CalendarRange,
      title: 'Auto Recapitulation',
      desc: 'Instant attendance summaries without manual spreadsheet formulas.',
      items: [
        'Instant cohort & student recaps',
        'Semester totals accumulation',
        'Quick filters without formulas'
      ],
      badge: 'Fast Recap'
    },
    {
      icon: FileSpreadsheet,
      title: 'Official Print Reports',
      desc: 'Standard A4 printable reports ready for Principal and Teacher signatures.',
      items: [
        'Official standard A4 format',
        'Principal & Teacher signature boxes',
        'Accreditation & audit ready'
      ],
      badge: 'Standard A4'
    },
    {
      icon: Smartphone,
      title: 'Student & Parent Portal',
      desc: 'Accessible portal for parents to monitor attendance and submit sick leaves.',
      items: [
        'Daily check-in & check-out status',
        'Leave submission & doctor notes',
        'Clean & lightweight mobile layout'
      ],
      badge: 'Portal'
    },
    {
      icon: ShieldCheck,
      title: 'Role-Based Access',
      desc: 'Structured permissions for Principals, Admins, Teachers, and Students.',
      items: [
        'Principal, Admin, & Teacher roles',
        'Isolated & secure permissions',
        'Student data privacy protection'
      ],
      badge: 'Multi-Role'
    },
  ];

  return (
    <section id="fitur" className="py-14 sm:py-18 lg:py-24 bg-slate-50 text-slate-900 relative border-b border-blue-100 antialiased overflow-hidden">
      {/* Background Subtle Grid Pattern */}
      <div className="absolute inset-0 z-0 pointer-events-none bg-grid-pattern opacity-25" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl space-y-3 sm:space-y-4 mb-10 sm:mb-12 lg:mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100/70 border border-blue-200 text-blue-800 text-xs font-bold tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span>{lang === 'ID' ? 'FITUR UTAMA SEKOLAH DASAR' : 'CORE PRIMARY FEATURES'}</span>
          </div>

          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-[#0B2F64] tracking-tight leading-[1.12]">
            {lang === 'ID' ? (
              <>
                Sistem Terpadu Dirancang Khusus untuk{' '}
                <span className="text-blue-600">Sekolah Dasar</span>
              </>
            ) : (
              <>
                Integrated Ecosystem Built for{' '}
                <span className="text-blue-600">Primary Schools</span>
              </>
            )}
          </h2>

          <p className="text-slate-600 text-sm sm:text-base lg:text-lg leading-relaxed font-normal">
            {lang === 'ID' 
              ? 'Seluruh kebutuhan pencatatan kehadiran, rekapitulasi rombel kelas 1–6, hingga pencetakan laporan kedinasan dalam satu sistem terintegrasi.'
              : 'End-to-end attendance logging, Grade 1–6 cohort recaps, and official reporting compiled into one intuitive platform.'}
          </p>
        </div>

        {/* Commercial Feature Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div
                key={idx}
                id={`feature-card-${idx}`}
                className="bg-white border border-slate-200/90 hover:border-blue-500/80 rounded-2xl p-5 sm:p-6 hover:shadow-lg hover:shadow-blue-600/10 transition-all duration-200 flex flex-col justify-between group relative overflow-hidden"
              >
                {/* Top Subtle Brand Bar on Hover */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div>
                  {/* Top Bar: Icon + Badge */}
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-blue-50 border border-blue-150 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-200 shadow-xs">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] sm:text-[11px] font-semibold tracking-wide px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                      {feature.badge}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-base sm:text-lg font-bold text-[#0B2F64] mb-1.5 group-hover:text-blue-600 transition-colors tracking-tight">
                    {feature.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal mb-4">
                    {feature.desc}
                  </p>
                </div>

                {/* 3 Key Highlights */}
                <div className="space-y-2 pt-3.5 border-t border-slate-100">
                  {feature.items.map((item, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs sm:text-[13px] text-slate-700">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                      <span className="leading-snug">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

