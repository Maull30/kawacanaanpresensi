import React, { useEffect, useState, useMemo } from 'react';
import { Printer, Share2, CheckCircle2, ArrowLeft, School, FileText, Loader2, AlertCircle } from 'lucide-react';
import { SchoolLogo } from './SchoolLogo';
import { formatDateToIndoLong } from '../utils/whatsappBroadcast';

interface PublicDailyReportData {
  schoolName: string;
  npsn?: string;
  alamat?: string;
  logoUrl?: string;
  letterheadType?: 'custom_image' | 'standard_text';
  letterheadImageUrl?: string;
  showLetterhead?: boolean;
  className: string;
  grade?: string | number;
  date: string;
  attendanceType: 'DAILY' | 'SUBJECT';
  subjectName?: string | null;
  teacherName: string;
  teacherNip?: string;
  principalName: string;
  principalNip?: string;
  reportPlace?: string;
  stats: {
    totalStudents: number;
    hadir: number;
    sakit: number;
    izin: number;
    alfa: number;
    terlambat: number;
    persentase: number;
  };
  students: Array<{
    no: number;
    nisn: string;
    nama: string;
    gender: 'L' | 'P';
    status: string;
    checkInTime: string;
    checkOutTime: string;
    notes: string;
  }>;
}

interface PublicDailyReportViewerProps {
  classId: string;
  date: string;
  attendanceType?: 'DAILY' | 'SUBJECT';
  subjectId?: string | null;
  onBackToApp?: () => void;
}

export const PublicDailyReportViewer: React.FC<PublicDailyReportViewerProps> = ({
  classId,
  date,
  attendanceType = 'DAILY',
  subjectId = null,
  onBackToApp,
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reportData, setReportData] = useState<PublicDailyReportData | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchReport = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/onboarding', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'get_public_daily_report',
            classId,
            date,
            attendanceType,
            subjectId,
          }),
        });

        const json = await res.json();
        if (!res.ok || !json.ok) {
          throw new Error(json.error || 'Gagal memuat dokumen rekap kehadiran.');
        }

        if (isMounted) {
          setReportData(json.report);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || 'Terjadi kesalahan saat memuat dokumen rekapitulasi.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchReport();
    return () => {
      isMounted = false;
    };
  }, [classId, date, attendanceType, subjectId]);

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      const shareUrl = window.location.href;
      if (navigator.share) {
        navigator.share({
          title: `Laporan Kehadiran ${reportData?.className || ''} - ${reportData?.date || ''}`,
          url: shareUrl,
        }).catch(() => {});
      } else {
        navigator.clipboard?.writeText(shareUrl);
        alert('Tautan dokumen berhasil disalin ke clipboard!');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 mb-4 animate-bounce">
          <FileText size={28} />
        </div>
        <h2 className="text-base sm:text-lg font-black text-slate-800 tracking-tight">
          Memuat Dokumen Rekap Kehadiran Resmi...
        </h2>
        <p className="text-xs text-slate-500 mt-1 max-w-sm">
          Sistem sedang merender lembar laporan terverifikasi secara on-the-fly.
        </p>
        <Loader2 size={24} className="animate-spin text-blue-600 mt-5" />
      </div>
    );
  }

  if (error || !reportData) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 mb-4">
          <AlertCircle size={28} />
        </div>
        <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
          Dokumen Tidak Ditemukan atau Belum Tersedia
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 mt-2 max-w-md leading-relaxed">
          {error || 'Data rekap kehadiran untuk rombel dan tanggal ini belum diterbitkan oleh pihak sekolah.'}
        </p>
        <div className="mt-6 flex items-center gap-3">
          {onBackToApp && (
            <button
              onClick={onBackToApp}
              className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition-all cursor-pointer shadow-xs"
            >
              Masuk ke Aplikasi
            </button>
          )}
        </div>
      </div>
    );
  }

  const { stats, students } = reportData;
  const formattedDate = formatDateToIndoLong(reportData.date);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 antialiased print:bg-white print:p-0">
      {/* Non-Printable Floating Top Action Bar */}
      <header className="print:hidden sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            {onBackToApp && (
              <button
                type="button"
                onClick={onBackToApp}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                title="Buka Aplikasi"
              >
                <ArrowLeft size={18} />
              </button>
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-slate-900 tracking-tight">
                  Dokumen Rekap Resmi Kehadiran
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-emerald-100 text-emerald-800">
                  <CheckCircle2 size={11} /> Terverifikasi
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                {reportData.schoolName} • {reportData.className}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleShare}
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              title="Bagikan Tautan Laporan"
            >
              <Share2 size={15} />
              <span className="hidden sm:inline">Bagikan</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Printer size={15} />
              <span>Cetak / Unduh PDF</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Document Body (A4 Paper Container) */}
      <main className="max-w-4xl mx-auto p-4 sm:p-8 print:p-0 print:max-w-none">
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-lg border border-slate-200 p-6 sm:p-10 print:p-4 print:shadow-none print:border-none print:rounded-none">
          {/* 1. KOP SURAT RESMI SEKOLAH */}
          {reportData.showLetterhead !== false && (
            <div className="border-b-2 border-slate-900 pb-4 mb-6">
              {reportData.letterheadType === 'custom_image' && reportData.letterheadImageUrl ? (
                <div className="w-full flex justify-center mb-2">
                  <img
                    src={reportData.letterheadImageUrl}
                    alt="Kop Surat Resmi"
                    className="max-h-28 w-full object-contain"
                  />
                </div>
              ) : (
                <div className="flex items-center gap-4 text-center justify-center">
                  {reportData.logoUrl ? (
                    <img
                      src={reportData.logoUrl}
                      alt="Logo Sekolah"
                      className="w-16 h-16 object-contain shrink-0"
                    />
                  ) : (
                    <SchoolLogo className="w-16 h-16 shrink-0" />
                  )}
                  <div>
                    <h1 className="text-lg sm:text-xl font-black uppercase text-slate-900 tracking-wider">
                      {reportData.schoolName}
                    </h1>
                    {reportData.npsn && (
                      <p className="text-xs font-bold text-slate-700">NPSN: {reportData.npsn}</p>
                    )}
                    {reportData.alamat && (
                      <p className="text-xs text-slate-600 max-w-xl mx-auto">{reportData.alamat}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 2. JUDUL DOKUMEN & IDENTITAS */}
          <div className="text-center space-y-1 mb-6">
            <h2 className="text-base sm:text-lg font-black uppercase text-slate-900 tracking-wide underline">
              REKAPITULASI KEHADIRAN HARIAN SISWA
            </h2>
            <p className="text-xs font-semibold text-slate-600">
              Hari/Tanggal: <strong className="text-slate-900">{formattedDate}</strong>
            </p>
          </div>

          {/* 3. METADATA ROMBEL & PENGAJAR */}
          <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-200 mb-6 font-medium">
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Rombel Kelas:</span>
              <span className="font-extrabold text-slate-900">{reportData.className}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold">
                {reportData.attendanceType === 'SUBJECT' ? 'Mata Pelajaran & Pengajar:' : 'Wali Kelas:'}
              </span>
              <span className="font-extrabold text-slate-900">
                {reportData.attendanceType === 'SUBJECT' && reportData.subjectName
                  ? `${reportData.subjectName} • ${reportData.teacherName}`
                  : reportData.teacherName}
              </span>
            </div>
          </div>

          {/* 4. REKAPITULASI ANGKA (KPI CARDS) */}
          <div className="grid grid-cols-5 gap-2 text-center mb-6">
            <div className="p-2 sm:p-2.5 rounded-xl bg-emerald-50 border border-emerald-200">
              <span className="text-[10px] font-bold text-emerald-800 block uppercase">Hadir</span>
              <span className="text-base sm:text-lg font-black text-emerald-950 leading-tight">
                {stats.hadir}
              </span>
            </div>
            <div className="p-2 sm:p-2.5 rounded-xl bg-sky-50 border border-sky-200">
              <span className="text-[10px] font-bold text-sky-800 block uppercase">Sakit</span>
              <span className="text-base sm:text-lg font-black text-sky-950 leading-tight">
                {stats.sakit}
              </span>
            </div>
            <div className="p-2 sm:p-2.5 rounded-xl bg-amber-50 border border-amber-200">
              <span className="text-[10px] font-bold text-amber-800 block uppercase">Izin</span>
              <span className="text-base sm:text-lg font-black text-amber-950 leading-tight">
                {stats.izin}
              </span>
            </div>
            <div className="p-2 sm:p-2.5 rounded-xl bg-rose-50 border border-rose-200">
              <span className="text-[10px] font-bold text-rose-800 block uppercase">Alfa</span>
              <span className="text-base sm:text-lg font-black text-rose-950 leading-tight">
                {stats.alfa}
              </span>
            </div>
            <div className="p-2 sm:p-2.5 rounded-xl bg-indigo-50 border border-indigo-200">
              <span className="text-[10px] font-bold text-indigo-800 block uppercase">Kehadiran</span>
              <span className="text-base sm:text-lg font-black text-indigo-950 leading-tight">
                {stats.persentase}%
              </span>
            </div>
          </div>

          {/* 5. TABEL DAFTAR SISWA RESMI */}
          <div className="overflow-x-auto mb-8 border border-slate-300 rounded-xl">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-800 font-extrabold uppercase text-[10px] border-b border-slate-300 text-center">
                  <th className="py-2.5 px-2 border-r border-slate-200 w-10">No</th>
                  <th className="py-2.5 px-3 border-r border-slate-200 text-left">Nama Siswa</th>
                  <th className="py-2.5 px-2 border-r border-slate-200 w-12">L/P</th>
                  <th className="py-2.5 px-3 border-r border-slate-200 w-24">Status</th>
                  <th className="py-2.5 px-2 border-r border-slate-200 w-20">Masuk</th>
                  <th className="py-2.5 px-2 border-r border-slate-200 w-20">Pulang</th>
                  <th className="py-2.5 px-3 text-left">Keterangan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-medium">
                {students.map((s, idx) => (
                  <tr key={idx} className={idx % 2 === 1 ? 'bg-slate-50/50' : 'bg-white'}>
                    <td className="py-2 px-2 text-center text-slate-500 border-r border-slate-200">
                      {s.no}
                    </td>
                    <td className="py-2 px-3 font-semibold text-slate-900 border-r border-slate-200">
                      {s.nama}
                      {s.nisn && <span className="block text-[9px] text-slate-400 font-normal">NISN: {s.nisn}</span>}
                    </td>
                    <td className="py-2 px-2 text-center text-slate-600 border-r border-slate-200">
                      {s.gender || '-'}
                    </td>
                    <td className="py-2 px-3 text-center border-r border-slate-200">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-extrabold ${
                          s.status === 'Hadir'
                            ? 'bg-emerald-100 text-emerald-800'
                            : s.status === 'Sakit'
                            ? 'bg-sky-100 text-sky-800'
                            : s.status === 'Izin'
                            ? 'bg-amber-100 text-amber-800'
                            : s.status === 'Alfa'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {s.status || 'Belum'}
                      </span>
                    </td>
                    <td className="py-2 px-2 text-center text-slate-600 border-r border-slate-200 font-mono text-[11px]">
                      {s.checkInTime || '-'}
                    </td>
                    <td className="py-2 px-2 text-center text-slate-600 border-r border-slate-200 font-mono text-[11px]">
                      {s.checkOutTime || '-'}
                    </td>
                    <td className="py-2 px-3 text-slate-600 text-[11px]">
                      {s.notes || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 6. LEMBAR PENGESAHAN RESMI (TANDA TANGAN) */}
          <div className="pt-4 grid grid-cols-2 gap-8 text-xs text-center font-medium">
            <div className="space-y-16">
              <p className="font-semibold text-slate-800">Mengetahui,<br />Kepala Sekolah</p>
              <div>
                <p className="font-extrabold text-slate-900 underline uppercase">
                  {reportData.principalName || 'Kepala Sekolah'}
                </p>
                <p className="text-[11px] text-slate-500">
                  NIP. {reportData.principalNip || '................................'}
                </p>
              </div>
            </div>

            <div className="space-y-16">
              <p className="font-semibold text-slate-800">
                {reportData.reportPlace || 'Jakarta'}, {formattedDate}<br />
                {reportData.attendanceType === 'SUBJECT' ? 'Guru Mata Pelajaran' : 'Wali Kelas'}
              </p>
              <div>
                <p className="font-extrabold text-slate-900 underline uppercase">
                  {reportData.teacherName}
                </p>
                <p className="text-[11px] text-slate-500">
                  NIP. {reportData.teacherNip || '................................'}
                </p>
              </div>
            </div>
          </div>

          {/* Footer watermark & verification notice */}
          <div className="mt-12 pt-4 border-t border-slate-200 text-center text-[10px] text-slate-400">
            Dokumen ini di-generate secara otomatis oleh Sistem KawaCanaan Presensi Sekolah • Sah dan terverifikasi digital.
          </div>
        </div>
      </main>
    </div>
  );
};
