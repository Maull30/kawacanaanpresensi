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
  BookOpen,
  School,
  Sparkles
} from 'lucide-react';

interface FeaturesSectionProps {
  lang: 'ID' | 'EN';
}

export const FeaturesSection: React.FC<FeaturesSectionProps> = ({ lang }) => {
  const features = lang === 'ID' ? [
    {
      icon: BarChart3,
      title: 'DASHBOARD PRESENSI SD',
      desc: 'Pantau kondisi kehadiran seluruh siswa SD secara real-time berdasarkan persentase kehadiran dan hari efektif belajar.',
      items: [
        'Total siswa terdaftar kelas 1-6',
        'Jumlah hadir hari ini',
        'Rekap sakit, izin, dan alfa',
        'Persentase kehadiran real-time',
        'Peringatan absensi berulang'
      ],
      badge: 'Real-time'
    },
    {
      icon: Clock,
      title: 'DUAL-MODE PRESENSI SD',
      desc: 'Mendukung pencatatan presensi harian oleh Wali Kelas serta presensi per jam mata pelajaran khusus (PJOK, PABP/Agama, dsb).',
      items: [
        'Presensi harian oleh Wali Kelas',
        'Presensi jam pelajaran Guru Mapel',
        'Catatan keterlambatan siswa',
        'Verifikasi cepat satu klik',
        'Sinkronisasi lintas guru'
      ],
      badge: 'Dual-Mode SD'
    },
    {
      icon: Users,
      title: 'ROMBEL & DATA SISWA SD',
      desc: 'Kelola data siswa jenjang Sekolah Dasar dari Kelas 1 sampai Kelas 6 secara rapi dengan NISN dan identitas lengkap.',
      items: [
        'Rombongan belajar Kelas 1 s/d 6',
        'Data NIS, NISN, & data wali',
        'Import & Export Excel/Dapodik',
        'Pencarian & filter siswa cepat',
        'Arsip riwayat kenaikan kelas'
      ],
      badge: 'Database SD'
    },
    {
      icon: CalendarDays,
      title: 'KALENDER & HARI EFEKTIF',
      desc: 'Kalkulasi otomatis hari belajar efektif bulanan dan semester ganjil/genap sesuai kalender pendidikan kedinasan.',
      items: [
        'Penetapan hari efektif belajar',
        'Pengaturan hari libur nasional & cuti',
        'Jeda tengah semester & ujian',
        'Kalkulasi persentase akurat',
        'Sinkronisasi kalender kedinasan'
      ],
      badge: 'Otomatis'
    },
    {
      icon: CalendarRange,
      title: 'REKAPITULASI OTOMATIS',
      desc: 'Rekap kehadiran siswa terhitung otomatis tanpa perlu rumus Excel manual, tersaji per rombel maupun per siswa.',
      items: [
        'Rekapitulasi harian & mingguan',
        'Rekapitulasi bulanan kelas',
        'Rekapitulasi semester ganjil & genap',
        'Akumulasi H, S, I, A per siswa',
        'Filter per mata pelajaran'
      ],
      badge: 'Rekap Cepat'
    },
    {
      icon: FileSpreadsheet,
      title: 'LAPORAN & CETAK KEDINASAN',
      desc: 'Cetak dokumen laporan presensi dan berita acara format standar A4 yang siap ditandatangani Kepala Sekolah & Guru.',
      items: [
        'Format A4 standar kedinasan',
        'Export Excel terstruktur rapi',
        'Kolom tanda tangan Kepsek & Wali',
        'Siap lampiran SPJ & Akreditasi',
        'Download PDF instan'
      ],
      badge: 'Format Kedinasan'
    },
    {
      icon: Smartphone,
      title: 'PORTAL SISWA & WALI MURID',
      desc: 'Akses ramah siswa SD dan orang tua untuk memantau status kehadiran harian serta mengajukan izin atau sakit.',
      items: [
        'Cek status hadir masuk & pulang',
        'Jadwal mapel khusus hari ini',
        'Pengajuan izin & unggah surat sakit',
        'Riwayat kehadiran semester',
        'Tampilan simpel mudah diakses'
      ],
      badge: 'Portal Siswa'
    },
    {
      icon: ShieldCheck,
      title: 'MULTI-ROLE SEKOLAH DASAR',
      desc: 'Hak akses bertingkat yang disesuaikan dengan struktur organisasi SD agar data tetap aman dan terorganisir.',
      items: [
        'Super Admin & Admin Tata Usaha',
        'Kepala Sekolah Dasar',
        'Wali Kelas 1 s/d 6',
        'Guru Mapel (PJOK, Agama, dll)',
        'Siswa & Wali Murid'
      ],
      badge: 'Hak Akses'
    },
  ] : [
    {
      icon: BarChart3,
      title: 'PRIMARY SCHOOL DASHBOARD',
      desc: 'Monitor all elementary student attendance in real-time calculated against effective learning days.',
      items: [
        'Total enrolled students Grade 1-6',
        'Present count today',
        'Sick, leave, & unexcused totals',
        'Real-time attendance percentage',
        'Repeated absence alerts'
      ],
      badge: 'Real-time'
    },
    {
      icon: Clock,
      title: 'DUAL-MODE SD ATTENDANCE',
      desc: 'Supports daily homeroom check-ins by classroom teachers and subject-based logs by specialized teachers (PE, Religion, etc).',
      items: [
        'Daily homeroom teacher attendance',
        'Subject period attendance for specialists',
        'Lateness recording with timestamps',
        'One-click batch verification',
        'Cross-teacher synchronization'
      ],
      badge: 'Dual-Mode SD'
    },
    {
      icon: Users,
      title: 'CLASS & STUDENT RECORDS',
      desc: 'Manage elementary students from Grade 1 to 6 systematically with national student IDs and parent details.',
      items: [
        'Grade 1 through 6 study groups',
        'NIS, NISN, & guardian contacts',
        'Excel / Student registry import & export',
        'Quick student search & filters',
        'Grade promotion history archive'
      ],
      badge: 'SD Database'
    },
    {
      icon: CalendarDays,
      title: 'ACADEMIC CALENDAR & DAYS',
      desc: 'Automated calculation of monthly and semester effective learning days aligned with Ministry regulations.',
      items: [
        'Effective learning day configuration',
        'National holidays & school breaks',
        'Mid-semester & examination periods',
        'Accurate percentage calculations',
        'Official calendar synchronization'
      ],
      badge: 'Automated'
    },
    {
      icon: CalendarRange,
      title: 'AUTOMATED RECAPITULATION',
      desc: 'Attendance data is compiled automatically without manual spreadsheet formulas, available per class and per student.',
      items: [
        'Daily & weekly summaries',
        'Monthly classroom recaps',
        'Odd & even semester totals',
        'Accumulated present, sick, leave, unexcused',
        'Subject-specific breakdown'
      ],
      badge: 'Fast Recap'
    },
    {
      icon: FileSpreadsheet,
      title: 'OFFICIAL KEDINASAN REPORTS',
      desc: 'Print official A4 attendance records and minutes ready for Principal and Teacher institutional signatures.',
      items: [
        'Standard Kedinasan A4 format',
        'Structured clean Excel export',
        'Principal & Homeroom signature boxes',
        'Accreditation & audit ready',
        'Instant PDF generation'
      ],
      badge: 'Kedinasan Format'
    },
    {
      icon: Smartphone,
      title: 'STUDENT & PARENT PORTAL',
      desc: 'Student-friendly interface for young learners and parents to verify daily attendance and submit sickness notes.',
      items: [
        'Daily check-in & check-out status',
        'Today specialized subject schedule',
        'Leave submission & doctor note upload',
        'Semester attendance log',
        'Clean & intuitive mobile layout'
      ],
      badge: 'Student Portal'
    },
    {
      icon: ShieldCheck,
      title: 'ROLE-BASED PERMISSIONS',
      desc: 'Structured hierarchical access tailored for Primary School operations to safeguard records and integrity.',
      items: [
        'Super Admin & Administrative Staff',
        'School Principal',
        'Homeroom Teachers (Grade 1-6)',
        'Specialized Subject Teachers',
        'Students & Parents'
      ],
      badge: 'Access Control'
    },
  ];

  return (
    <section id="fitur" className="py-14 sm:py-18 lg:py-24 bg-slate-50 text-slate-900 relative border-b border-blue-100 antialiased overflow-hidden">
      {/* Background Subtle Grid Pattern */}
      <div className="absolute inset-0 z-0 pointer-events-none bg-grid-pattern opacity-30" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header - Commercial SaaS Style */}
        <div className="max-w-3xl space-y-3 sm:space-y-4 mb-10 sm:mb-14 lg:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100/70 border border-blue-200 text-blue-800 text-xs font-bold tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span>{lang === 'ID' ? 'MODUL LENGKAP SEKOLAH DASAR' : 'COMPREHENSIVE PRIMARY SUITE'}</span>
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
              ? 'Seluruh kebutuhan administrasi, pencatatan rombel kelas 1–6, presensi harian, hingga pencetakan laporan kedinasan dalam satu platform praktis.'
              : 'End-to-end administration, Grade 1–6 cohort monitoring, daily logs, and official reporting compiled into one powerful, intuitive platform.'}
          </p>
        </div>

        {/* Commercial Feature Cards Grid - Ultra Responsive: Phone (1-col) -> Tablet (2-col) -> Laptop (3-col) -> PC/Desktop (4-col) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div
                key={idx}
                id={`feature-card-${idx}`}
                className="bg-white border border-slate-200/90 hover:border-blue-500/80 rounded-2xl p-5 sm:p-6 hover:shadow-xl hover:shadow-blue-600/10 transition-all duration-200 flex flex-col justify-between group relative overflow-hidden shadow-xs"
              >
                {/* Top Subtle Brand Bar on Hover */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div>
                  {/* Top Bar: Icon + Badge */}
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-blue-50 border border-blue-150 flex items-center justify-center text-blue-700 group-hover:bg-[#0066FF] group-hover:text-white transition-all duration-200 shadow-xs">
                      <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200/80 font-mono">
                      {feature.badge}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-base sm:text-lg font-black text-[#0B2F64] mb-2 group-hover:text-blue-600 transition-colors uppercase tracking-tight">
                    {feature.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal mb-5">
                    {feature.desc}
                  </p>

                  {/* Bullet points - Clean directly rendered list without 'Fitur & Kemampuan' */}
                  <div className="space-y-2 pt-4 border-t border-slate-100">
                    {feature.items.map((item, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs sm:text-sm text-slate-700">
                        <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                        <span className="leading-snug">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
