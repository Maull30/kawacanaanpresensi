import React from 'react';
import { Quote, School, CheckCircle2, Star, MessageSquareQuote } from 'lucide-react';

interface TestimonialSectionProps {
  lang: 'ID' | 'EN';
}

export const TestimonialSection: React.FC<TestimonialSectionProps> = ({ lang }) => {
  const testimonials = lang === 'ID' ? [
    {
      id: '1',
      name: 'Bpk. Hendra Pratama, M.Pd.',
      role: 'Kepala Sekolah',
      school: 'SDN 04 Nusantara',
      initials: 'HP',
      rating: 5,
      tag: 'Efisiensi Administrasi',
      content: 'Pencatatan kehadiran menjadi sangat tertib dan akurat. Saat pelaporan ke dinas atau akreditasi sekolah, kami tinggal cetak format A4 yang sudah rapi lengkap dengan tanda tangan.',
    },
    {
      id: '2',
      name: 'Ibu Siti Nurhaliza, S.Pd.',
      role: 'Wali Kelas & Guru',
      school: 'SD Bintang Kejora',
      initials: 'SN',
      rating: 5,
      tag: 'Mudah Digunakan Guru',
      content: 'Dashboard presensi sangat praktis untuk guru kelas 1 sampai 6. Perhitungan sakit, izin, dan alpa otomatis terakumulasi per bulan tanpa perlu rumus excel yang merepotkan.',
    },
    {
      id: '3',
      name: 'Bpk. Rizky Ramadhan, S.Kom.',
      role: 'Koordinator Tata Usaha',
      school: 'SD Al-Azhar Mandiri',
      initials: 'RR',
      rating: 5,
      tag: 'Integrasi Data Terpusat',
      content: 'Tata usaha dapat mengelola rombel dan kalender hari efektif sekolah dengan tenang. Akses multi-peran memastikan data siswa terlindungi dan selalu up-to-date.',
    }
  ] : [
    {
      id: '1',
      name: 'Hendra Pratama, M.Pd.',
      role: 'School Principal',
      school: 'SDN 04 Nusantara',
      initials: 'HP',
      rating: 5,
      tag: 'Administrative Efficiency',
      content: 'Daily attendance logs are now remarkably organized and accurate. For educational audits and reporting, we simply generate official standard A4 documents with complete signature boxes.',
    },
    {
      id: '2',
      name: 'Siti Nurhaliza, S.Pd.',
      role: 'Homeroom Teacher',
      school: 'SD Bintang Kejora',
      initials: 'SN',
      rating: 5,
      tag: 'Teacher-Friendly',
      content: 'The platform is intuitive for grade 1 through 6 classroom teachers. Sick leaves, excuses, and absences are compiled automatically every month without spreadsheet headaches.',
    },
    {
      id: '3',
      name: 'Rizky Ramadhan, S.Kom.',
      role: 'Administrative Coordinator',
      school: 'SD Al-Azhar Mandiri',
      initials: 'RR',
      rating: 5,
      tag: 'Centralized Records',
      content: 'Our administrative staff coordinates class cohorts and effective school days with ease. Granular role-based permissions keep student records reliable and securely safeguarded.',
    }
  ];

  return (
    <section id="testimoni" className="scroll-mt-16 sm:scroll-mt-20 py-14 sm:py-16 lg:py-20 bg-white text-slate-900 relative border-b border-blue-100 antialiased overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        
        {/* Header - Balanced Commercial SaaS Style */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 sm:mb-10 lg:mb-12">
          <div className="space-y-2.5 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold uppercase tracking-wider">
              <MessageSquareQuote className="w-3.5 h-3.5 text-blue-700 shrink-0" />
              <span>{lang === 'ID' ? 'TESTIMONI RESMI PENGGUNA' : 'CUSTOMER TESTIMONIALS'}</span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#0B2F64] tracking-tight uppercase leading-tight">
              {lang === 'ID' ? (
                <>
                  <span className="block">Kepercayaan Sekolah</span>
                  <span className="block text-blue-600">di Seluruh Indonesia</span>
                </>
              ) : (
                <>
                  <span className="block">Trusted by Schools</span>
                  <span className="block text-blue-600">Across Indonesia</span>
                </>
              )}
            </h2>

            <p className="text-slate-600 text-xs sm:text-sm md:text-base leading-relaxed font-normal">
              {lang === 'ID'
                ? 'Pengalaman nyata kepala sekolah, guru kelas, dan koordinator tata usaha yang merasakan kemudahan sistem presensi Kawacanaan.'
                : 'Real outcomes and experiences from principals, teachers, and school administrators using the Kawacanaan platform.'}
            </p>
          </div>

          {/* Swipe indicator hint for mobile only */}
          <div className="flex sm:hidden items-center gap-1.5 text-xs font-bold text-blue-700">
            <span>{lang === 'ID' ? 'Geser testimoni' : 'Swipe reviews'}</span>
            <span className="text-sm">→</span>
          </div>
        </div>

        {/* Commercial Testimonials Grid - Responsive across Phone, Tablet, Laptop, PC, Desktop Monitors */}
        <div className="flex sm:grid sm:grid-cols-2 lg:grid-cols-3 overflow-x-auto sm:overflow-x-visible snap-x snap-mandatory gap-4 sm:gap-6 lg:gap-8 pb-3 sm:pb-0 -mx-4 px-4 sm:mx-0 sm:px-0">
          {testimonials.map((t) => (
              <div
                key={t.id}
                id={`testimonial-card-${t.id}`}
                className="w-[84vw] max-w-[340px] sm:w-auto shrink-0 sm:shrink snap-center bg-slate-50/70 hover:bg-white border border-slate-200 hover:border-blue-500 rounded-2xl p-5 sm:p-6 lg:p-7 flex flex-col justify-between transition-all duration-200 hover:shadow-xl hover:shadow-blue-500/10 group relative"
              >
              <div>
                {/* Top Card Row: Star Rating + Tag */}
                <div className="flex items-center justify-between gap-2 mb-4">
                  <div className="flex items-center gap-1">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <span className="text-[10px] sm:text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                    {t.tag}
                  </span>
                </div>

                {/* Quote Icon & Content */}
                <div className="relative mb-6">
                  <Quote className="w-8 h-8 text-blue-200 group-hover:text-blue-500 transition-colors mb-2 stroke-[1.5]" />
                  <p className="text-sm sm:text-base text-slate-800 leading-relaxed font-normal">
                    "{t.content}"
                  </p>
                </div>
              </div>

              {/* Author Info */}
              <div className="pt-4 border-t border-slate-200/80 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[#0B2F64] text-white flex items-center justify-center font-bold text-xs sm:text-sm shrink-0 shadow-xs">
                    {t.initials}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm leading-tight">{t.name}</h4>
                    <div className="text-[11px] text-blue-600 font-bold uppercase tracking-wider mt-0.5">{t.role}</div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                      <School className="w-3 h-3 text-slate-400" /> {t.school}
                    </div>
                  </div>
                </div>

                {/* Verified Icon */}
                <div className="shrink-0 text-emerald-600" title={lang === 'ID' ? 'Terverifikasi' : 'Verified'}>
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
