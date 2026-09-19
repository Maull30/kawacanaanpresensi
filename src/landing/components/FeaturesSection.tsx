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
      desc: 'Presensi harian Wali Kelas dan presensi jam oleh Guru Mapel khusus dalam satu alur.',
      tag: 'Harian & Mapel',
    },
    {
      icon: Users,
      title: 'Database Rombel 1–6',
      desc: 'Pengelolaan data siswa, NISN, kontak wali murid, dan riwayat kenaikan kelas rapi.',
      tag: 'Kelas 1–6',
    },
    {
      icon: CalendarDays,
      title: 'Hari Efektif Otomatis',
      desc: 'Kalkulasi otomatis hari belajar efektif, libur dinas, dan kalender semester.',
      tag: 'Kalender Dinas',
    },
    {
      icon: BarChart3,
      title: 'Rekapitulasi Otomatis',
      desc: 'Akumulasi kehadiran bulanan dan semester tanpa risiko rumus manual spreadsheet.',
      tag: '100% Akurat',
    },
    {
      icon: FileSpreadsheet,
      title: 'Format Cetak Kedinasan',
      desc: 'Ekspor dokumen A4 standar kedinasan siap tanda tangan resmi kepala sekolah.',
      tag: 'Standar A4',
    },
    {
      icon: Smartphone,
      title: 'Portal Siswa & Wali',
      desc: 'Akses transparan bagi orang tua untuk pantau kehadiran harian dan kirim surat izin.',
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
      desc: 'Organized database for student profiles, national IDs, and progression records.',
      tag: 'Grade 1–6',
    },
    {
      icon: CalendarDays,
      title: 'Auto Effective Days',
      desc: 'Automated learning day counts, official breaks, and academic term schedules.',
      tag: 'Official Calendar',
    },
    {
      icon: BarChart3,
      title: 'Instant Recapitulation',
      desc: 'Automated monthly and term attendance totals without manual spreadsheet formulas.',
      tag: '100% Accurate',
    },
    {
      icon: FileSpreadsheet,
      title: 'Official Print Reports',
      desc: 'Print-ready standard A4 records with institutional principal signature boxes.',
      tag: 'A4 Standard',
    },
    {
      icon: Smartphone,
      title: 'Student & Parent Portal',
      desc: 'Direct portal for parents to verify daily attendance and submit official leaves.',
      tag: 'Direct Access',
    },
  ];

  return (
    <section 
      id="fitur" 
      className="scroll-mt-16 sm:scroll-mt-20 py-14 sm:py-16 lg:py-20 bg-slate-50 text-slate-900 relative border-b border-blue-100 antialiased overflow-hidden"
    >
      {/* Background Subtle Grid Pattern */}
      <div className="absolute inset-0 z-0 pointer-events-none bg-grid-pattern opacity-25" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        
        {/* Section Header - Balanced, Professional & Commercial */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 sm:mb-10 lg:mb-12">
          <div className="space-y-2.5 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100/80 border border-blue-200 text-blue-800 text-xs font-bold tracking-wide uppercase">
              <Sparkles className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span>{lang === 'ID' ? 'FITUR UTAMA SEKOLAH DASAR' : 'CORE PRIMARY FEATURES'}</span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#0B2F64] tracking-tight uppercase leading-tight">
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

            <p className="text-slate-600 text-xs sm:text-sm md:text-base leading-relaxed font-normal">
              {lang === 'ID' 
                ? 'Sistem presensi terpadu, rekapitulasi rombel kelas 1–6, dan pelaporan kedinasan dalam satu antarmuka bersih.'
                : 'Integrated attendance logging, cohort recaps, and official reporting in one clean interface.'}
            </p>
          </div>

          {/* Swipe indicator hint for mobile only */}
          <div className="flex sm:hidden items-center gap-1.5 text-xs font-bold text-blue-700">
            <span>{lang === 'ID' ? 'Geser fitur' : 'Swipe features'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Balanced 6-Card Grid: Responsive across Phone, Tablet, Laptop, and Desktop PC */}
        <div className="flex sm:grid sm:grid-cols-2 lg:grid-cols-3 overflow-x-auto sm:overflow-x-visible snap-x snap-mandatory gap-4 sm:gap-5 lg:gap-6 pb-3 sm:pb-0 -mx-4 px-4 sm:mx-0 sm:px-0">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div
                key={idx}
                id={`feature-card-${idx}`}
                className="w-[84vw] max-w-[340px] sm:w-auto shrink-0 sm:shrink snap-center bg-white border border-slate-200 hover:border-blue-500 rounded-2xl p-5 sm:p-6 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-200 flex flex-col justify-between group relative overflow-hidden"
              >
                {/* Top Subtle Brand Bar on Hover */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

                <div>
                  {/* Top Bar: Icon + Tag */}
                  <div className="flex items-center justify-between gap-2 mb-3.5">
                    <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-200/80 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-200 shadow-xs shrink-0">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-semibold tracking-wide px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200/80 font-mono">
                      {feature.tag}
                    </span>
                  </div>

                  {/* Title & Concise Description */}
                  <h3 className="text-base sm:text-lg font-bold text-[#0B2F64] mb-1.5 group-hover:text-blue-600 transition-colors tracking-tight leading-snug">
                    {feature.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
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

