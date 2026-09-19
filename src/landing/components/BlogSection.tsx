import React from 'react';
import { Calendar, Clock, ArrowRight, BookOpen } from 'lucide-react';

interface BlogSectionProps {
  lang: 'ID' | 'EN';
}

export const BlogSection: React.FC<BlogSectionProps> = ({ lang }) => {
  const posts = lang === 'ID' ? [
    {
      id: '1',
      title: 'Mengapa Sekolah Perlu Beralih ke Sistem Presensi Digital?',
      category: 'DIGITALISASI SEKOLAH',
      readTime: '4 menit baca',
      date: '18 Agu 2026',
      snippet: 'Membahas efisiensi teknologi presensi digital dalam merapikan administrasi rombel dan pelaporan kedinasan.',
      image: '/images/blog/330-ribu-sekolah-akan-dibekali-layar-digital-pintar-tahun-ini-1758534297510_169.jpeg',
    },
    {
      id: '2',
      title: 'Cara Mengelola Rekap Kehadiran Siswa dengan Lebih Efisien',
      category: 'MANAJEMEN KEHADIRAN',
      readTime: '5 menit baca',
      date: '12 Agu 2026',
      snippet: 'Langkah praktis menyusun rekapitulasi kehadiran bulanan dan semester tanpa risiko rumus manual spreadsheet.',
      image: '/images/blog/batas-usia-masuk-sd-diperbarui-anak-di-bawah-7-tahun-bisa-sekolah-dengan-syarat-ini-154159.webp',
    },
    {
      id: '3',
      title: 'Digitalisasi Administrasi Sekolah: Dari Data hingga Laporan',
      category: 'ADMINISTRASI SEKOLAH',
      readTime: '6 menit baca',
      date: '05 Agu 2026',
      snippet: 'Panduan menyederhanakan alur kerja tata usaha dan dewan guru SD dalam pembuatan berkas kedinasan siap cetak.',
      image: '/images/blog/IFP_Elementary_School-_4259-scaled.jpg',
    }
  ] : [
    {
      id: '1',
      title: 'Why Should Schools Transition to Digital Attendance Systems?',
      category: 'DIGITALIZATION',
      readTime: '4 min read',
      date: 'Aug 18, 2026',
      snippet: 'Exploring how modern attendance tools streamline primary school administration and regulatory reports.',
      image: '/images/blog/330-ribu-sekolah-akan-dibekali-layar-digital-pintar-tahun-ini-1758534297510_169.jpeg',
    },
    {
      id: '2',
      title: 'How to Manage Student Attendance Summaries Efficiently',
      category: 'MANAGEMENT',
      readTime: '5 min read',
      date: 'Aug 12, 2026',
      snippet: 'Practical steps to compile monthly and term attendance records without spreadsheet errors.',
      image: '/images/blog/batas-usia-masuk-sd-diperbarui-anak-di-bawah-7-tahun-bisa-sekolah-dengan-syarat-ini-154159.webp',
    },
    {
      id: '3',
      title: 'School Administration Digitization: From Data to Reporting',
      category: 'ADMINISTRATION',
      readTime: '6 min read',
      date: 'Aug 05, 2026',
      snippet: 'Comprehensive insights into simplifying primary school workflows into print-ready institutional formats.',
      image: '/images/blog/IFP_Elementary_School-_4259-scaled.jpg',
    }
  ];

  return (
    <section 
      id="blog" 
      className="scroll-mt-16 sm:scroll-mt-20 lg:min-h-[calc(100vh-4.5rem)] flex flex-col justify-center py-6 sm:py-8 lg:py-10 bg-slate-50 text-slate-900 relative border-b border-blue-100 antialiased overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        
        {/* Header - Compact Educational Insights */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-5 sm:mb-6 lg:mb-7">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-100/80 border border-blue-200 text-blue-800 text-[11px] font-bold uppercase tracking-wider">
              <BookOpen className="w-3 h-3 text-blue-700 shrink-0" />
              <span>{lang === 'ID' ? 'BLOG & INFORMASI SEKOLAH' : 'BLOG & SCHOOL INSIGHTS'}</span>
            </div>

            <h2 className="text-xl sm:text-3xl lg:text-4xl font-black text-[#0B2F64] tracking-tight uppercase leading-tight">
              {lang === 'ID' ? (
                <>
                  Tips & <span className="text-blue-600">Digitalisasi Sekolah</span>
                </>
              ) : (
                <>
                  Tips & <span className="text-blue-600">School Digitalization</span>
                </>
              )}
            </h2>

            <p className="text-slate-600 text-xs sm:text-sm lg:text-base leading-relaxed font-normal">
              {lang === 'ID'
                ? 'Edukasi dan panduan praktis pengelolaan presensi serta administrasi sekolah dasar.'
                : 'Actionable guidance and practical insights for primary school attendance administration.'}
            </p>
          </div>

          {/* Swipe indicator hint for mobile only */}
          <div className="flex sm:hidden items-center gap-1 text-[11px] font-bold text-blue-700">
            <span>{lang === 'ID' ? 'Geser artikel' : 'Swipe articles'}</span>
            <ArrowRight className="w-3 h-3" />
          </div>
        </div>

        {/* Blog Cards Grid: Swipeable on Mobile, 3 Columns on Desktop */}
        <div className="flex sm:grid sm:grid-cols-2 lg:grid-cols-3 overflow-x-auto sm:overflow-x-visible snap-x snap-mandatory gap-3.5 sm:gap-4 lg:gap-5 pb-2 sm:pb-0 -mx-4 px-4 sm:mx-0 sm:px-0">
          {posts.map((post) => (
            <article
              key={post.id}
              id={`blog-card-${post.id}`}
              className="w-[80vw] max-w-[320px] sm:w-auto shrink-0 sm:shrink snap-center bg-white border border-slate-200/90 rounded-xl overflow-hidden hover:border-blue-500 hover:shadow-md transition-all group flex flex-col justify-between shadow-xs"
            >
              <div>
                {/* Thumbnail image */}
                <div className="relative h-32 sm:h-36 overflow-hidden bg-slate-100 block">
                  <img 
                    src={post.image} 
                    alt={post.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />
                  <span className="absolute top-2.5 left-2.5 bg-[#0B2F64]/90 backdrop-blur-xs text-white px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider">
                    {post.category}
                  </span>
                </div>

                <div className="p-3.5 sm:p-4 space-y-1.5">
                  <div className="flex items-center gap-2 text-[10px] font-semibold text-slate-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {post.date}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {post.readTime}
                    </span>
                  </div>

                  <h3 className="text-xs sm:text-sm font-bold text-[#0B2F64] group-hover:text-blue-600 transition-colors leading-snug line-clamp-2">
                    {post.title}
                  </h3>

                  <p className="text-[11px] sm:text-xs text-slate-600 leading-relaxed font-normal line-clamp-2">
                    {post.snippet}
                  </p>
                </div>
              </div>

              <div className="p-3.5 sm:p-4 pt-0">
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 group-hover:text-blue-900 flex items-center gap-1">
                  {lang === 'ID' ? 'Baca Selengkapnya →' : 'Read Article →'}
                </span>
              </div>
            </article>
          ))}
        </div>

      </div>
    </section>
  );
};
