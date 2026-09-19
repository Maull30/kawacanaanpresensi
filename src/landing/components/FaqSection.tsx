import React, { useState } from 'react';
import { ChevronDown, HelpCircle, MessageSquare } from 'lucide-react';

interface FaqSectionProps {
  lang: 'ID' | 'EN';
  onOpenRegister: () => void;
}

export const FaqSection: React.FC<FaqSectionProps> = ({ lang, onOpenRegister }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = lang === 'ID' ? [
    {
      q: 'Apakah Kawacanaan dapat digunakan oleh semua sekolah?',
      a: 'Ya. Sistem dapat dikonfigurasi sesuai kebutuhan data dan operasional sekolah.'
    },
    {
      q: 'Siapa saja yang dapat menggunakan Kawacanaan?',
      a: 'Sistem mendukung beberapa peran, seperti Admin, Kepala Sekolah, Wali Kelas/Guru, dan Siswa.'
    },
    {
      q: 'Apakah siswa dapat melakukan presensi sendiri?',
      a: 'Ya. Sekolah dapat mengaktifkan fitur presensi mandiri siswa sesuai kebutuhan.'
    },
    {
      q: 'Apakah data kehadiran dapat direkap?',
      a: 'Ya. Sistem menyediakan rekapitulasi berdasarkan periode tertentu, termasuk harian, mingguan, bulanan, dan semester.'
    },
    {
      q: 'Apakah laporan dapat digunakan untuk kebutuhan administrasi sekolah?',
      a: 'Ya. Data kehadiran dapat disusun menjadi laporan berdasarkan periode yang dipilih.'
    },
    {
      q: 'Apakah setiap pengguna memiliki akses yang sama?',
      a: 'Tidak. Akses sistem disesuaikan berdasarkan peran pengguna.'
    }
  ] : [
    {
      q: 'Can Kawacanaan be used by any type of school?',
      a: 'Yes. The system can be configured flexibly according to the specific data structures and operational workflows of your school.'
    },
    {
      q: 'Who can use the Kawacanaan platform?',
      a: 'The system supports distinct role-based access for Administrators, School Principals, Homeroom/Subject Teachers, and Students.'
    },
    {
      q: 'Can students record their attendance independently?',
      a: 'Yes. Schools can enable student self check-in features via individual mobile or web devices as needed.'
    },
    {
      q: 'Can attendance records be summarized automatically?',
      a: 'Yes. The system generates automatic recapitulation across customizable periods including daily, weekly, monthly, and semester views.'
    },
    {
      q: 'Are reports suitable for official school administration?',
      a: 'Yes. Attendance records are readily formatted into structured printable PDFs and Excel spreadsheets for institutional filing.'
    },
    {
      q: 'Does every user have the same level of access?',
      a: 'No. Access permissions and administrative capabilities are strictly scoped by user roles to ensure security and privacy.'
    }
  ];

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="scroll-mt-16 sm:scroll-mt-20 py-14 sm:py-16 lg:py-20 bg-white text-slate-900 relative border-b border-blue-100 antialiased">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        
        {/* Section Header */}
        <div className="text-center sm:text-left space-y-2.5 mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold uppercase tracking-wider font-mono">
            <HelpCircle className="w-3.5 h-3.5 text-blue-700 shrink-0" />
            <span>{lang === 'ID' ? 'TANYA JAWAB RESMI' : 'FREQUENTLY ASKED QUESTIONS'}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#0B2F64] tracking-tight uppercase leading-tight">
            {lang === 'ID' ? (
              <>
                Pertanyaan <span className="text-blue-600">Sering Ditanyakan</span>
              </>
            ) : (
              <>
                Frequently <span className="text-blue-600">Asked Questions</span>
              </>
            )}
          </h2>
          <p className="text-slate-600 text-xs sm:text-sm md:text-base leading-relaxed max-w-2xl sm:border-l-3 sm:border-blue-600 sm:pl-3 font-normal">
            {lang === 'ID'
              ? 'Jawaban lengkap seputar fitur, akses pengguna, dan implementasi sistem Kawacanaan.'
              : 'Complete answers regarding features, user access levels, and system implementation of Kawacanaan.'}
          </p>
        </div>

        {/* Accordion List */}
        <div className="space-y-3 sm:space-y-3.5">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                id={`faq-item-${idx}`}
                className={`border rounded-2xl transition-all duration-150 overflow-hidden ${
                  isOpen 
                    ? 'border-blue-500 bg-blue-50/25 shadow-sm' 
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="w-full px-4 py-3.5 sm:px-5 sm:py-4 text-left flex items-center justify-between gap-3 cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 w-7 h-7 rounded-lg flex items-center justify-center shrink-0">
                      0{idx + 1}
                    </span>
                    <h3 className="text-sm sm:text-base font-bold text-[#0B2F64] leading-snug">
                      {faq.q}
                    </h3>
                  </div>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-transform duration-200 ${
                    isOpen ? 'rotate-180 bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'
                  }`}>
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-0 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-blue-100/60 mt-1 pt-3 sm:pl-14 font-normal">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Contact Hotline Note */}
        <div className="mt-8 sm:mt-10 text-center p-4 sm:p-5 bg-blue-50/60 border border-blue-200/80 rounded-2xl flex flex-col sm:flex-row items-center justify-center gap-2 text-xs sm:text-sm text-slate-600">
          <MessageSquare className="w-4 h-4 text-blue-600 shrink-0 hidden sm:block" />
          <span>
            {lang === 'ID' ? 'Punya pertanyaan spesifik seputar sekolah Anda? ' : 'Have specific questions about your institution? '}
          </span>
          <button
            onClick={onOpenRegister}
            className="text-blue-700 font-bold hover:underline cursor-pointer inline-flex items-center gap-1"
          >
            <span>{lang === 'ID' ? 'Konsultasi Gratis dengan Tim Kami' : 'Free Consultation with Our Team'}</span>
            <span aria-hidden="true">&rarr;</span>
          </button>
        </div>

      </div>
    </section>
  );
};
