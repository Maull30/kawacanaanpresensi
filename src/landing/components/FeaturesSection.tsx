import React from 'react';
import { 
  Clock, 
  Users, 
  CalendarDays, 
  BarChart3, 
  FileSpreadsheet, 
  Smartphone, 
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface FeaturesSectionProps {
  lang: 'ID' | 'EN';
}

export const FeaturesSection: React.FC<FeaturesSectionProps> = ({ lang }) => {
  const features = lang === 'ID' ? [
    {
      icon: Clock,
      title: 'Presensi Dual-Mode SD',
      desc: 'Presensi harian Wali Kelas dan presensi jam oleh Guru Mapel khusus.',
      tag: 'Harian & Mapel',
    },
    {
      icon: Users,
      title: 'Database Rombel 1–6',
      desc: 'Pengelolaan data siswa, NISN, kontak wali, dan riwayat kelas rapi.',
      tag: 'Kelas 1–6',
    },
    {
      icon: CalendarDays,
      title: 'Hari Efektif Otomatis',
      desc: 'Kalkulasi otomatis hari belajar efektif, libur dinas, dan jeda semester.',
      tag: 'Kalender Dinas',
    },
    {
      icon: BarChart3,
      title: 'Rekapitulasi Otomatis',
      desc: 'Akumulasi H, S, I, & A bulanan serta semester tanpa rumus spreadsheet.',
      tag: '100% Akurat',
    },
    {
      icon: FileSpreadsheet,
      title: 'Format Cetak Kedinasan',
      desc: 'Ekspor dokumen A4 standar kedinasan lengkap kolom tanda tangan resmi.',
      tag: 'Standar A4',
    },
    {
      icon: Smartphone,
      title: 'Portal Siswa & Wali',
      desc: 'Akses mudah orang tua untuk cek kehadiran harian dan kirim surat izin.',
      tag: 'Akses Mandiri',
    },
  ] : [
    {
      icon: Clock,
      title: 'Dual-Mode Attendance',
      desc: 'Daily homeroom check-ins and subject period logs for specialist teachers.',
      tag: 'Homeroom & Subject',
    },
    {
      icon: Users,
      title: 'Grade 1–6 Cohorts',
      desc: 'Organized database for student profiles, national IDs, and class records.',
      tag: 'Grade 1–6',
    },
    {
      icon: CalendarDays,
      title: 'Auto Effective Days',
      desc: 'Automated learning day counts, official breaks, and term schedules.',
      tag: 'Official Calendar',
    },
    {
      icon: BarChart3,
      title: 'Instant Recapitulation',
      desc: 'Automated monthly and semester attendance totals without formulas.',
      tag: '100% Accurate',
    },
    {
      icon: FileSpreadsheet,
      title: 'Official Print Reports',
      desc: 'Print-ready standard A4 records with institutional signature boxes.',
      tag: 'A4 Standard',
    },
    {
      icon: Smartphone,
      title: 'Student & Parent Portal',
      desc: 'Direct portal for parents to verify daily attendance and submit leaves.',
      tag: 'Direct Access',
    },
  ];

  return (
    <section 
      id="fitur" 
      className="scroll-mt-16 sm:scroll-mt-20 lg:min-h-[calc(100vh-4.5rem)] flex flex-col justify-center py-6 sm:py-8 lg:py-10 bg-slate-50 text-slate-900 relative border-b border-blue-100 antialiased overflow-hidden"
    >
      {/* Background Subtle Grid Pattern */}
      <div className="absolute inset-0 z-0 pointer-events-none bg-grid-pattern opacity-25" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        
        {/* Section Header - Compact, Focused & Professional */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-5 sm:mb-6 lg:mb-8">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-100/80 border border-blue-200 text-blue-800 text-[11px] font-bold tracking-wide">
              <Sparkles className="w-3 h-3 text-blue-600 shrink-0" />
              <span>{lang === 'ID' ? 'FITUR UTAMA SEKOLAH DASAR' : 'CORE PRIMARY FEATURES'}</span>
            </div>

            <h2 className="text-xl sm:text-3xl lg:text-4xl font-black text-[#0B2F64] tracking-tight leading-tight">
              {lang === 'ID' ? (
                <>
                  Fitur Kawacanaan <span className="text-blue-600">Sekolah Dasar</span>
                </>
              ) : (
                <>
                  Kawacanaan Primary <span className="text-blue-600">School Features</span>
                </>
              )}
            </h2>

            <p className="text-slate-600 text-xs sm:text-sm lg:text-base leading-relaxed font-normal">
              {lang === 'ID' 
                ? 'Sistem presensi terpadu, rekapitulasi rombel kelas 1–6, dan pelaporan kedinasan dalam satu antarmuka bersih.'
                : 'Integrated attendance logging, cohort recaps, and official reporting in one clean interface.'}
            </p>
          </div>

          {/* Swipe indicator hint for mobile only */}
          <div className="flex sm:hidden items-center gap-1 text-[11px] font-bold text-blue-700">
            <span>{lang === 'ID' ? 'Geser untuk fitur lainnya' : 'Swipe for more'}</span>
            <ArrowRight className="w-3 h-3" />
          </div>
        </div>

        {/* Clean, Non-Cluttered 6-Card Grid: Swipeable on Mobile, 3x2 on Desktop */}
        <div className="flex sm:grid sm:grid-cols-2 lg:grid-cols-3 overflow-x-auto sm:overflow-x-visible snap-x snap-mandatory gap-3 sm:gap-4 lg:gap-5 pb-2 sm:pb-0 -mx-4 px-4 sm:mx-0 sm:px-0">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div
                key={idx}
                id={`feature-card-${idx}`}
                className="w-[80vw] max-w-[320px] sm:w-auto shrink-0 sm:shrink snap-center bg-white border border-slate-200/90 hover:border-blue-500/80 rounded-xl p-4 sm:p-5 hover:shadow-md hover:shadow-blue-600/10 transition-all duration-200 flex flex-col justify-between group relative overflow-hidden"
              >
                {/* Top Subtle Brand Bar on Hover */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

                <div>
                  {/* Top Bar: Icon + Tag */}
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-blue-50 border border-blue-150 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-200 shadow-xs">
                      <Icon className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                    </div>
                    <span className="text-[10px] sm:text-[11px] font-semibold tracking-wide px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200/80 font-mono">
                      {feature.tag}
                    </span>
                  </div>

                  {/* Title & Concise Description */}
                  <h3 className="text-sm sm:text-base font-bold text-[#0B2F64] mb-1 group-hover:text-blue-600 transition-colors tracking-tight leading-snug">
                    {feature.title}
                  </h3>
                  <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed font-normal">
                    {feature.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

