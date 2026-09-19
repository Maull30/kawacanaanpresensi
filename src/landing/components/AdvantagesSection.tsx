import React from 'react';
import { 
  Users, 
  Settings2, 
  Database, 
  Activity, 
  FileText, 
  Lock, 
  Cloud, 
  School,
  CalendarCheck,
  Award,
  Check
} from 'lucide-react';

interface AdvantagesSectionProps {
  lang: 'ID' | 'EN';
  onOpenRegister: () => void;
}

export const AdvantagesSection: React.FC<AdvantagesSectionProps> = ({ lang, onOpenRegister }) => {
  const advantages = lang === 'ID' ? [
    {
      num: '01',
      title: 'ALUR KHUSUS SEKOLAH DASAR',
      icon: School,
    },
    {
      num: '02',
      title: 'HARI EFEKTIF OTOMATIS',
      icon: CalendarCheck,
    },
    {
      num: '03',
      title: 'FORMAT CETAK STANDAR KEDINASAN',
      icon: FileText,
    },
    {
      num: '04',
      title: 'DATABASE ROMBEL 1-6 RAPI',
      icon: Database,
    },
    {
      num: '05',
      title: 'MONITORING KEPSEK & TU',
      icon: Activity,
    },
    {
      num: '06',
      title: 'HAK AKSES MULTI-PERAN',
      icon: Lock,
    },
    {
      num: '07',
      title: 'BERBASIS CLOUD & MULTI-DEVICE',
      icon: Cloud,
    },
    {
      num: '08',
      title: 'PORTAL RAMAH SISWA & WALI',
      icon: Users,
    },
  ] : [
    {
      num: '01',
      title: 'PRIMARY SCHOOL WORKFLOW',
      icon: School,
    },
    {
      num: '02',
      title: 'AUTO EFFECTIVE SCHOOL DAYS',
      icon: CalendarCheck,
    },
    {
      num: '03',
      title: 'OFFICIAL KEDINASAN PRINT FORMAT',
      icon: FileText,
    },
    {
      num: '04',
      title: 'ORGANIZED GRADE 1-6 DATABASE',
      icon: Database,
    },
    {
      num: '05',
      title: 'REAL-TIME PRINCIPAL OVERSIGHT',
      icon: Activity,
    },
    {
      num: '06',
      title: 'STRUCTURED ROLE PERMISSIONS',
      icon: Lock,
    },
    {
      num: '07',
      title: 'CLOUD-BASED & CROSS-DEVICE',
      icon: Cloud,
    },
    {
      num: '08',
      title: 'STUDENT & PARENT FRIENDLY',
      icon: Users,
    },
  ];

  return (
    <section id="keunggulan" className="py-14 sm:py-18 lg:py-24 bg-white text-slate-900 relative border-b border-blue-100 antialiased">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="max-w-3xl space-y-3 sm:space-y-4 mb-10 sm:mb-12 lg:mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold uppercase tracking-wider">
            <Award className="w-3.5 h-3.5 text-blue-700 shrink-0" />
            <span>{lang === 'ID' ? 'KEUNGGULAN UTAMA' : 'KEY ADVANTAGES'}</span>
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
              ? 'Standarisasi sistem presensi digital yang dirancang tepat guna bagi guru, kepala sekolah, serta wali murid.'
              : 'Standardized digital attendance system purposefully engineered for teachers, principals, and school communities.'}
          </p>
        </div>

        {/* 8 Advantages High-Impact Grid - Responsive across Phone, Tablet, Laptop, PC, Desktop Monitors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4 lg:gap-5">
          {advantages.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div 
                key={idx}
                id={`advantage-card-${idx}`}
                className="bg-slate-50/80 hover:bg-white border border-slate-200/90 hover:border-blue-500 rounded-2xl p-5 sm:p-6 transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/10 group flex flex-col justify-between relative overflow-hidden"
              >
                {/* Header: Number & Icon */}
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-xl sm:text-2xl font-black text-blue-600/70 group-hover:text-blue-600 transition-colors">
                    {item.num}
                  </span>
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 group-hover:bg-[#0066FF] group-hover:text-white group-hover:border-blue-600 transition-all duration-200 shadow-xs">
                    <Icon className="w-5 h-5" />
                  </div>
                </div>

                {/* Title */}
                <div>
                  <h3 className="text-sm sm:text-base font-black text-[#0B2F64] group-hover:text-blue-600 transition-colors uppercase tracking-tight leading-snug">
                    {item.title}
                  </h3>
                </div>

                {/* Bottom Status Tag */}
                <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <span>{lang === 'ID' ? 'Standar SD' : 'Primary Standard'}</span>
                  <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1 font-bold">
                    <Check className="w-3 h-3 stroke-[3]" />
                    {lang === 'ID' ? 'Tersedia' : 'Active'}
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
