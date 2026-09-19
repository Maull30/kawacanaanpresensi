import React from 'react';
import { 
  Star,
  ShieldCheck, 
  CalendarDays, 
  FileSpreadsheet, 
  Database, 
  Clock, 
  Users, 
  Cloud, 
  Heart,
  School,
  FileCheck,
  TrendingUp,
  Lock,
  Smartphone,
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface AdvantagesSectionProps {
  lang: 'ID' | 'EN';
  onOpenRegister?: () => void;
}

export const AdvantagesSection: React.FC<AdvantagesSectionProps> = ({ lang, onOpenRegister }) => {
  const isId = lang === 'ID';

  const advantages = isId ? [
    {
      num: '01',
      title: 'Alur Khusus Sekolah Dasar',
      desc: 'Presensi harian Wali Kelas dan jam pelajaran Guru Mapel.',
      badgeText: 'Sesuai Regulasi',
      badgeIcon: ShieldCheck,
      numPillClass: 'bg-blue-100/70 text-blue-700',
      badgeClass: 'bg-blue-50 text-blue-700 border-blue-200/80',
      blobClass: 'bg-blue-100/60',
      cornerBlob: 'bg-blue-100/40',
      iconContainer: 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-blue-500/25',
      mainIcon: School,
    },
    {
      num: '02',
      title: 'Hari Efektif Otomatis',
      desc: 'Kalkulasi hari belajar efektif bulanan dan semester berdasarkan kalender akademik.',
      badgeText: 'Otomatis & Akurat',
      badgeIcon: CalendarDays,
      numPillClass: 'bg-purple-100/70 text-purple-700',
      badgeClass: 'bg-purple-50 text-purple-700 border-purple-200/80',
      blobClass: 'bg-purple-100/60',
      cornerBlob: 'bg-purple-100/40',
      iconContainer: 'bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-purple-500/25',
      mainIcon: CalendarDays,
    },
    {
      num: '03',
      title: 'Format Cetak Kedinasan',
      desc: 'Ekspor dokumen A4 berstandar dinas dengan tanda tangan resmi.',
      badgeText: 'Standar Pemerintah',
      badgeIcon: FileSpreadsheet,
      numPillClass: 'bg-teal-100/70 text-teal-700',
      badgeClass: 'bg-teal-50 text-teal-700 border-teal-200/80',
      blobClass: 'bg-teal-100/60',
      cornerBlob: 'bg-teal-100/40',
      iconContainer: 'bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-teal-500/25',
      mainIcon: FileCheck,
    },
    {
      num: '04',
      title: 'Database Rombel Terstruktur',
      desc: 'Pengelolaan data siswa kelas 1–6, NISN, dan arsip kelas rapi.',
      badgeText: 'Rapi & Aman',
      badgeIcon: Database,
      numPillClass: 'bg-indigo-100/70 text-indigo-700',
      badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200/80',
      blobClass: 'bg-indigo-100/60',
      cornerBlob: 'bg-indigo-100/40',
      iconContainer: 'bg-gradient-to-br from-indigo-500 to-blue-700 text-white shadow-indigo-500/25',
      mainIcon: Database,
    },
    {
      num: '05',
      title: 'Monitoring Kepsek & TU',
      desc: 'Pantau rekapitulasi kehadiran seluruh rombel secara real-time.',
      badgeText: 'Real-time',
      badgeIcon: Clock,
      numPillClass: 'bg-emerald-100/70 text-emerald-700',
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
      blobClass: 'bg-emerald-100/60',
      cornerBlob: 'bg-emerald-100/40',
      iconContainer: 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-emerald-500/25',
      mainIcon: TrendingUp,
    },
    {
      num: '06',
      title: 'Hak Akses Multi-Peran',
      desc: 'Pemisahan wewenang aman antara Kepsek, TU, Guru, dan Siswa.',
      badgeText: 'Role-Based',
      badgeIcon: Users,
      numPillClass: 'bg-amber-100/70 text-amber-700',
      badgeClass: 'bg-amber-50 text-amber-800 border-amber-200/80',
      blobClass: 'bg-amber-100/60',
      cornerBlob: 'bg-amber-100/40',
      iconContainer: 'bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-amber-500/25',
      mainIcon: Lock,
    },
    {
      num: '07',
      title: 'Cloud Native & Multi-Device',
      desc: 'Akses lancar via smartphone, tablet, dan PC tanpa server lokal.',
      badgeText: 'Akses Fleksibel',
      badgeIcon: Cloud,
      numPillClass: 'bg-sky-100/70 text-sky-700',
      badgeClass: 'bg-sky-50 text-sky-700 border-sky-200/80',
      blobClass: 'bg-sky-100/60',
      cornerBlob: 'bg-sky-100/40',
      iconContainer: 'bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-sky-500/25',
      mainIcon: Smartphone,
    },
    {
      num: '08',
      title: 'Kolaborasi Portal Siswa & Orang Tua',
      desc: 'Cek kehadiran harian dan pengajuan surat izin online transparan.',
      badgeText: 'Transparan & Mudah',
      badgeIcon: Heart,
      numPillClass: 'bg-rose-100/70 text-rose-700',
      badgeClass: 'bg-rose-50 text-rose-700 border-rose-200/80',
      blobClass: 'bg-rose-100/60',
      cornerBlob: 'bg-rose-100/40',
      iconContainer: 'bg-gradient-to-br from-rose-500 to-pink-600 text-white shadow-rose-500/25',
      mainIcon: Users,
    },
  ] : [
    {
      num: '01',
      title: 'Primary School Workflow',
      desc: 'Daily homeroom check-ins and subject period logs for specialist teachers.',
      badgeText: 'Compliant Flow',
      badgeIcon: ShieldCheck,
      numPillClass: 'bg-blue-100/70 text-blue-700',
      badgeClass: 'bg-blue-50 text-blue-700 border-blue-200/80',
      blobClass: 'bg-blue-100/60',
      cornerBlob: 'bg-blue-100/40',
      iconContainer: 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-blue-500/25',
      mainIcon: School,
    },
    {
      num: '02',
      title: 'Auto Effective Days',
      desc: 'Automated learning day calculations for monthly and semester schedules.',
      badgeText: 'Auto & Accurate',
      badgeIcon: CalendarDays,
      numPillClass: 'bg-purple-100/70 text-purple-700',
      badgeClass: 'bg-purple-50 text-purple-700 border-purple-200/80',
      blobClass: 'bg-purple-100/60',
      cornerBlob: 'bg-purple-100/40',
      iconContainer: 'bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-purple-500/25',
      mainIcon: CalendarDays,
    },
    {
      num: '03',
      title: 'Kedinasan Print Format',
      desc: 'Official A4 exports with standard principal signature formats.',
      badgeText: 'Government Standard',
      badgeIcon: FileSpreadsheet,
      numPillClass: 'bg-teal-100/70 text-teal-700',
      badgeClass: 'bg-teal-50 text-teal-700 border-teal-200/80',
      blobClass: 'bg-teal-100/60',
      cornerBlob: 'bg-teal-100/40',
      iconContainer: 'bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-teal-500/25',
      mainIcon: FileCheck,
    },
    {
      num: '04',
      title: 'Structured Cohort Database',
      desc: 'Organized management of grade 1-6 cohorts, national IDs, and archives.',
      badgeText: 'Neat & Secure',
      badgeIcon: Database,
      numPillClass: 'bg-indigo-100/70 text-indigo-700',
      badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200/80',
      blobClass: 'bg-indigo-100/60',
      cornerBlob: 'bg-indigo-100/40',
      iconContainer: 'bg-gradient-to-br from-indigo-500 to-blue-700 text-white shadow-indigo-500/25',
      mainIcon: Database,
    },
    {
      num: '05',
      title: 'Principal & Staff Oversight',
      desc: 'Real-time recap and attendance supervision across all cohorts.',
      badgeText: 'Real-time',
      badgeIcon: Clock,
      numPillClass: 'bg-emerald-100/70 text-emerald-700',
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
      blobClass: 'bg-emerald-100/60',
      cornerBlob: 'bg-emerald-100/40',
      iconContainer: 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-emerald-500/25',
      mainIcon: TrendingUp,
    },
    {
      num: '06',
      title: 'Multi-Role Access Control',
      desc: 'Secure permission separation among Principal, TU, Teachers, and Students.',
      badgeText: 'Role-Based',
      badgeIcon: Users,
      numPillClass: 'bg-amber-100/70 text-amber-700',
      badgeClass: 'bg-amber-50 text-amber-800 border-amber-200/80',
      blobClass: 'bg-amber-100/60',
      cornerBlob: 'bg-amber-100/40',
      iconContainer: 'bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-amber-500/25',
      mainIcon: Lock,
    },
    {
      num: '07',
      title: 'Cloud Native & Multi-Device',
      desc: 'Seamless access on smartphone, tablet, and PC without local servers.',
      badgeText: 'Flexible Access',
      badgeIcon: Cloud,
      numPillClass: 'bg-sky-100/70 text-sky-700',
      badgeClass: 'bg-sky-50 text-sky-700 border-sky-200/80',
      blobClass: 'bg-sky-100/60',
      cornerBlob: 'bg-sky-100/40',
      iconContainer: 'bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-sky-500/25',
      mainIcon: Smartphone,
    },
    {
      num: '08',
      title: 'Student & Parent Portal',
      desc: 'Transparent access for parents to check attendance and submit online leaves.',
      badgeText: 'Transparent & Easy',
      badgeIcon: Heart,
      numPillClass: 'bg-rose-100/70 text-rose-700',
      badgeClass: 'bg-rose-50 text-rose-700 border-rose-200/80',
      blobClass: 'bg-rose-100/60',
      cornerBlob: 'bg-rose-100/40',
      iconContainer: 'bg-gradient-to-br from-rose-500 to-pink-600 text-white shadow-rose-500/25',
      mainIcon: Users,
    },
  ];

  return (
    <section 
      id="keunggulan" 
      className="scroll-mt-16 sm:scroll-mt-20 py-14 sm:py-16 lg:py-20 bg-gradient-to-b from-[#F2F8FF] via-[#EAF3FE] to-[#DCEBFE] text-slate-900 relative antialiased overflow-hidden"
    >
      {/* Background Soft Glows & Ambient Orbs */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-blue-200/35 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-indigo-200/30 rounded-full blur-3xl pointer-events-none" />

      {/* Decorative Dot Matrix Patterns on Left & Right Margins (as in screenshot) */}
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
        {/* SECTION HEADER: Pill Badge, Main Title, Subtitle & Playful 3D / Doodle    */}
        {/* ========================================================================= */}
        <div className="relative text-center mb-12 sm:mb-16">
          
          {/* Top-Left Playful Handwritten Annotation with Rays */}
          <div className="hidden lg:block absolute -top-4 left-4 xl:left-8 pointer-events-none select-none text-left">
            <div className="inline-block -rotate-[7deg] bg-white/50 backdrop-blur-xs px-3.5 py-2 rounded-2xl border border-blue-200/50 shadow-2xs">
              <div className="relative font-bold text-blue-600 leading-tight tracking-tight text-sm xl:text-base">
                <div className="text-blue-600 font-medium">`Solusi Lengkap</div>
                <div className="text-blue-700 font-extrabold">untuk Manajemen`</div>
                <div className="text-blue-800 font-black">Sekolah Dasar.</div>

                {/* Playful Ray Lines */}
                <svg className="absolute -top-3.5 -right-3 w-7 h-7 text-blue-500" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2V6M19 5L16 8M22 12H18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
                </svg>
              </div>
            </div>
          </div>

          {/* Top-Right 3D Illustration of Indonesian School, Books & Pencil Holder */}
          <div className="hidden lg:block absolute -top-12 right-2 xl:right-6 pointer-events-none select-none w-48 xl:w-56">
            <img 
              src="/images/advantages_school_3d.jpg" 
              alt="Indonesian School & Books 3D Illustration" 
              className="w-full h-auto object-contain drop-shadow-lg"
              loading="lazy"
            />
          </div>

          {/* Center Pill Badge with Star Icon */}
          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-blue-100/90 border border-blue-200 text-blue-800 text-xs font-bold tracking-wide shadow-2xs mb-3.5">
            <Star className="w-3.5 h-3.5 text-blue-600 fill-blue-600/30 shrink-0" />
            <span>{isId ? 'Keunggulan Platform SAAS' : 'SaaS Platform Advantages'}</span>
          </div>

          {/* High-Contrast Main Title */}
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight uppercase max-w-2xl mx-auto">
            <span>{isId ? 'Keunggulan Khusus' : 'Special Advantages'}</span>
            <span className="block text-blue-600 mt-1">{isId ? 'Sekolah Dasar' : 'Primary School'}</span>
          </h2>

          {/* Subtitle Description */}
          <p className="mt-3 text-slate-600 text-xs sm:text-sm md:text-base leading-relaxed max-w-xl mx-auto font-normal">
            {isId
              ? 'Arsitektur sistem presensi modern yang dirancang khusus memenuhi regulasi administrasi sekolah dasar.'
              : 'Modern attendance system architecture specifically engineered to comply with primary school administrative regulations.'}
          </p>

          {/* Small Blue Divider Capsule */}
          <div className="w-12 h-1.5 bg-blue-600 rounded-full mx-auto mt-4" />
        </div>

        {/* ========================================================================= */}
        {/* 8 CARDS GRID: 4 columns x 2 rows (Responsive for Mobile, Tablet & PC)     */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {advantages.map((item, idx) => {
            const MainIcon = item.mainIcon;
            const BadgeIcon = item.badgeIcon;
            return (
              <div 
                key={idx}
                id={`advantage-card-${idx}`}
                className="bg-white/95 rounded-3xl p-6 shadow-[0_8px_24px_-8px_rgba(37,99,235,0.09)] border border-blue-50/80 hover:border-blue-300 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 flex flex-col justify-between relative overflow-hidden group min-h-[230px]"
              >
                {/* Bottom-right organic pastel decorative corner shape */}
                <div className={`absolute -bottom-8 -right-8 w-28 h-28 ${item.cornerBlob} rounded-tl-full pointer-events-none transition-transform group-hover:scale-110`} />

                <div>
                  {/* Top Row: Icon + Soft Blob Background on Left, Number Pill on Right */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    {/* Soft Blob + Icon */}
                    <div className="relative">
                      <div className={`w-14 h-14 rounded-2xl ${item.blobClass} flex items-center justify-center p-2 transition-transform group-hover:scale-105 duration-300`}>
                        <div className={`w-10 h-10 rounded-xl ${item.iconContainer} flex items-center justify-center shadow-md`}>
                          <MainIcon className="w-5 h-5 stroke-[2.2]" />
                        </div>
                      </div>
                    </div>

                    {/* Number Badge Pill (e.g. 01, 02, etc.) */}
                    <span className={`px-3 py-0.5 rounded-full text-xs font-black font-mono tracking-wider ${item.numPillClass}`}>
                      {item.num}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight leading-snug mb-2 group-hover:text-blue-600 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-[13px] text-slate-500 leading-relaxed font-normal">
                    {item.desc}
                  </p>
                </div>

                {/* Bottom Pill Badge with Icon & Label (e.g. Sesuai Regulasi, Otomatis & Akurat) */}
                <div className="relative z-10 pt-4 mt-2 border-t border-slate-100/80">
                  <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border shadow-2xs ${item.badgeClass}`}>
                    <BadgeIcon className="w-3.5 h-3.5 shrink-0" />
                    <span>{item.badgeText}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* Subtle Bottom Wave Curve */}
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

