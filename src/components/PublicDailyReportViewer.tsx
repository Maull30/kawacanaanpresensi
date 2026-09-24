import React, { useEffect, useState, useMemo } from 'react';
import { Printer, Share2, CheckCircle2, ArrowLeft, FileText, Loader2, AlertCircle } from 'lucide-react';
import { SchoolLogo } from './SchoolLogo';

interface PublicDailyReportData {
  schoolName: string;
  pemerintahDaerah?: string;
  dinasPendidikan?: string;
  npsn?: string;
  alamat?: string;
  logoUrl?: string;
  letterheadType?: 'custom_image' | 'standard_text';
  letterheadImageUrl?: string;
  showLetterhead?: boolean;
  className: string;
  grade?: string | number;
  fase?: string;
  semester?: string;
  tahunPelajaran?: string;
  date: string;
  attendanceType: 'DAILY' | 'SUBJECT';
  subjectName?: string | null;
  teacherName: string;
  teacherNip?: string;
  principalName: string;
  principalNip?: string;
  reportPlace?: string;
  reportDateOfficial?: string;
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

  // Helper formatting for dates & days
  const formatReportDateIndo = (dateStr: string): string => {
    if (!dateStr) return '';
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const months = [
          'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
          'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
        ];
        const day = parseInt(parts[2], 10);
        const monthIdx = parseInt(parts[1], 10) - 1;
        const year = parts[0];
        return `${day} ${months[monthIdx]} ${year}`;
      }
      return dateStr;
    } catch (_) {
      return dateStr;
    }
  };

  const getDayNameIndo = (dateStr: string): string => {
    if (!dateStr) return '';
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
        const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
        return days[d.getDay()] || '';
      }
      return '';
    } catch (_) {
      return '';
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
  const total = stats.totalStudents || students.length || 1;
  const pctHadir = ((stats.hadir / total) * 100).toFixed(1).replace('.0', '');
  const pctSakit = ((stats.sakit / total) * 100).toFixed(1).replace('.0', '');
  const pctIzin = ((stats.izin / total) * 100).toFixed(1).replace('.0', '');
  const pctAlfa = ((stats.alfa / total) * 100).toFixed(1).replace('.0', '');

  const activeClassClean = reportData.className.replace(/^kelas\s+/i, '');
  const activeFase = reportData.fase || 'Fase A';

  return (
    <div className="min-h-screen bg-slate-200/70 text-slate-900 antialiased print:bg-white print:p-0 font-sans">
      {/* Non-Printable Floating Top Action Bar */}
      <header className="print:hidden sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-300 shadow-xs px-4 py-3">
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
                  Dokumen Rekap Resmi Kehadiran Siswa
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-emerald-100 text-emerald-800">
                  <CheckCircle2 size={11} /> Sah & Terverifikasi
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
              title="Bagikan Tautan Dokumen"
            >
              <Share2 size={15} />
              <span className="hidden sm:inline">Bagikan</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-[#1D82F5] hover:bg-blue-600 text-white text-xs font-black transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Printer size={15} />
              <span>Cetak / Unduh PDF</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Printable Document Sheet (Exact Official PDF Layout) */}
      <main className="max-w-4xl mx-auto p-3 sm:p-6 md:p-8 print:p-0 print:max-w-none">
        <div
          id="printable-report"
          className="bg-white rounded-xl shadow-xl border border-slate-300 p-5 sm:p-8 md:p-12 font-serif text-slate-900 leading-normal print:p-4 print:shadow-none print:border-none print:rounded-none"
        >
          {/* Formal Indonesian School Letterhead (Kop Surat) */}
          {(reportData.showLetterhead ?? true) && (
            <>
              {reportData.letterheadType === 'custom_image' && reportData.letterheadImageUrl ? (
                /* 1. Custom Image Letterhead */
                <div className="kop-surat-a4-container w-full mb-5 pb-2 border-b-2 border-slate-900 break-inside-avoid print:mb-4 print:pb-1 flex justify-center items-center">
                  <img
                    src={reportData.letterheadImageUrl}
                    alt="Kop Surat Resmi Sekolah"
                    className="kop-surat-a4-img w-full max-w-full h-auto object-contain mx-auto block max-h-[140px] print:max-h-[155px]"
                  />
                </div>
              ) : (
                /* 2. Standard Text Letterhead with School Logo & Double Lines */
                <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-6 pb-3 border-b-4 border-double border-slate-900 mb-6 text-center sm:text-left break-inside-avoid">
                  {reportData.logoUrl ? (
                    <div className="w-16 h-16 sm:w-[74px] sm:h-[74px] shrink-0 flex items-center justify-center">
                      <img
                        src={reportData.logoUrl}
                        alt="Logo Sekolah"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  ) : (
                    <SchoolLogo size={60} className="sm:w-[74px] sm:h-[74px] shrink-0" />
                  )}
                  <div className="flex-1 text-center font-sans">
                    <h4 className="text-[10px] sm:text-xs font-bold tracking-wider uppercase text-slate-700 leading-tight">
                      {reportData.pemerintahDaerah || 'PEMERINTAH PROVINSI DAERAH KHUSUS IBUKOTA JAKARTA'}
                    </h4>
                    <h4 className="text-[10px] sm:text-xs font-bold tracking-wider uppercase text-slate-700 leading-tight">
                      {reportData.dinasPendidikan || 'DINAS PENDIDIKAN'}
                    </h4>
                    <h2 className="text-lg sm:text-2xl font-black tracking-tight text-slate-900 uppercase my-0.5">
                      {reportData.schoolName || 'SD NEGERI CONTOH'}
                    </h2>
                    <p className="text-[10px] sm:text-[11px] text-slate-600 font-normal">
                      {reportData.alamat || 'Jl. Pendidikan No. 123, Kel. Merdeka, Kec. Nusantara, Kota Jakarta'}
                    </p>
                    <p className="text-[10px] sm:text-[11px] text-slate-600 font-semibold">
                      NPSN: {reportData.npsn || '20104501'} | KELAS: {activeClassClean} | FASE: {activeFase.toUpperCase()}
                    </p>
                  </div>
                  <div className="w-16 hidden sm:block" />
                </div>
              )}
            </>
          )}

          {/* Report Document Title based on Official Laporan Harian */}
          <div className="text-center mb-5 sm:mb-6 font-sans">
            <h3 className="text-sm sm:text-lg font-extrabold uppercase underline tracking-wide">
              LAPORAN KEHADIRAN HARIAN SISWA
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-600 font-bold mt-1 uppercase">
              HARI/TANGGAL: {getDayNameIndo(reportData.date).toUpperCase()},{' '}
              {formatReportDateIndo(reportData.date).toUpperCase()} | SEMESTER:{' '}
              {(reportData.semester || 'GANJIL').toUpperCase()} (TP:{' '}
              {reportData.tahunPelajaran || '2026/2027'})
            </p>
          </div>

          {/* School Attributes Matrix */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 text-xs font-sans mb-4 border border-slate-200 p-3 rounded-lg bg-slate-50/50">
            <div>
              <p>
                <span className="font-semibold text-slate-600">Satuan Pendidikan:</span>{' '}
                {reportData.schoolName}
              </p>
              <p>
                <span className="font-semibold text-slate-600">Kelas / Fase:</span>{' '}
                {reportData.className} / {activeFase}
              </p>
              {reportData.attendanceType === 'SUBJECT' ? (
                <p>
                  <span className="font-semibold text-slate-600">Mata Pelajaran:</span>{' '}
                  <strong className="text-blue-900">
                    {reportData.subjectName || 'Mata Pelajaran Khusus'}
                  </strong>
                </p>
              ) : (
                <p>
                  <span className="font-semibold text-slate-600">Wali Kelas:</span>{' '}
                  {reportData.teacherName}
                </p>
              )}
            </div>
            <div>
              <p>
                <span className="font-semibold text-slate-600">Tanggal Presensi:</span>{' '}
                {formatReportDateIndo(reportData.date)}
              </p>
              <p>
                <span className="font-semibold text-slate-600">Total Siswa:</span>{' '}
                {students.length} Siswa
              </p>
              <p>
                <span className="font-semibold text-slate-600">Tahun Pelajaran:</span>{' '}
                {reportData.tahunPelajaran || '2026/2027'}
              </p>
            </div>
          </div>

          {/* Tabel Kehadiran Harian Siswa (Identik Laporan PDF) */}
          <div className="overflow-x-auto mb-6 sm:mb-8">
            <table className="w-full text-left border-collapse border border-slate-400 text-xs font-sans min-w-[500px]">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-400 text-center font-bold">
                  <th className="border border-slate-400 p-1.5 w-8">NO</th>
                  <th className="border border-slate-400 p-1.5 w-24 sm:w-28">NISN</th>
                  <th className="border border-slate-400 p-1.5 text-left">NAMA SISWA</th>
                  <th className="border border-slate-400 p-1.5 w-10">L/P</th>
                  <th className="border border-slate-400 p-1.5 w-20">STATUS</th>
                  <th className="border border-slate-400 p-1.5 w-20">MASUK</th>
                  <th className="border border-slate-400 p-1.5 w-20">PULANG</th>
                  <th className="border border-slate-400 p-1.5 text-left">KETERANGAN</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s, idx) => (
                  <tr key={idx} className="border-b border-slate-300">
                    <td className="border border-slate-300 p-1 text-center font-semibold">{s.no}</td>
                    <td className="border border-slate-300 p-1 text-center font-mono">{s.nisn || '-'}</td>
                    <td className="border border-slate-300 p-1 font-semibold">{s.nama}</td>
                    <td className="border border-slate-300 p-1 text-center">{s.gender || '-'}</td>
                    <td className="border border-slate-300 p-1 text-center font-bold">
                      <span
                        className={
                          s.status === 'Hadir'
                            ? 'text-emerald-700'
                            : s.status === 'Sakit'
                            ? 'text-sky-700'
                            : s.status === 'Izin'
                            ? 'text-amber-700'
                            : s.status === 'Alfa'
                            ? 'text-rose-700'
                            : 'text-slate-500'
                        }
                      >
                        {s.status || '-'}
                      </span>
                    </td>
                    <td className="border border-slate-300 p-1 text-center font-mono text-[11px]">
                      {s.checkInTime || '-'}
                    </td>
                    <td className="border border-slate-300 p-1 text-center font-mono text-[11px]">
                      {s.checkOutTime || '-'}
                    </td>
                    <td className="border border-slate-300 p-1 text-slate-600 italic text-[11px]">
                      {s.notes || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Ringkasan & Kesimpulan Kehadiran (Summary Box) */}
          <div className="border border-slate-400 bg-slate-50/70 p-3.5 sm:p-4 rounded-lg font-sans mb-6 text-xs break-inside-avoid">
            <h4 className="font-bold text-slate-900 uppercase text-[11px] sm:text-xs mb-2 border-b border-slate-300 pb-1 flex items-center justify-between">
              <span>KESIMPULAN & RINGKASAN REKAPITULASI KEHADIRAN</span>
              <span className="text-[10px] text-slate-500 font-normal">
                Tanggal: {formatReportDateIndo(reportData.date)}
              </span>
            </h4>

            {/* Metrics Row - Persentase Saja Sesuai Standar PDF */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 text-center my-2.5">
              <div className="p-2.5 bg-emerald-50/90 border border-emerald-300 rounded-lg text-emerald-950">
                <span className="text-[10px] block font-bold uppercase text-emerald-700">Hadir (H)</span>
                <span className="text-lg sm:text-xl font-black text-emerald-800 tracking-tight">
                  {pctHadir}%
                </span>
                <span className="block text-[9px] font-semibold text-emerald-600 uppercase">
                  Persentase Kehadiran
                </span>
              </div>
              <div className="p-2.5 bg-sky-50/90 border border-sky-300 rounded-lg text-sky-950">
                <span className="text-[10px] block font-bold uppercase text-sky-700">Sakit (S)</span>
                <span className="text-lg sm:text-xl font-black text-sky-800 tracking-tight">
                  {pctSakit}%
                </span>
                <span className="block text-[9px] font-semibold text-sky-600 uppercase">
                  Persentase Sakit
                </span>
              </div>
              <div className="p-2.5 bg-amber-50/90 border border-amber-300 rounded-lg text-amber-950">
                <span className="text-[10px] block font-bold uppercase text-amber-700">Izin (I)</span>
                <span className="text-lg sm:text-xl font-black text-amber-800 tracking-tight">
                  {pctIzin}%
                </span>
                <span className="block text-[9px] font-semibold text-amber-600 uppercase">
                  Persentase Izin
                </span>
              </div>
              <div className="p-2.5 bg-rose-50/90 border border-rose-300 rounded-lg text-rose-950">
                <span className="text-[10px] block font-bold uppercase text-rose-700">Alfa (A)</span>
                <span className="text-lg sm:text-xl font-black text-rose-800 tracking-tight">
                  {pctAlfa}%
                </span>
                <span className="block text-[9px] font-semibold text-rose-600 uppercase">
                  Persentase Tanpa Keterangan
                </span>
              </div>
            </div>

            <div className="text-[11px] text-slate-700 pt-1.5 border-t border-slate-200 leading-relaxed">
              <p>
                <strong>Catatan Evaluasi:</strong> Tingkat kehadiran siswa {reportData.className} pada tanggal{' '}
                {formatReportDateIndo(reportData.date)} tercatat sebesar{' '}
                <span className="font-extrabold text-blue-900 bg-blue-50 px-1 py-0.5 rounded border border-blue-200">
                  {pctHadir}%
                </span>.
              </p>
            </div>
          </div>

          {/* Lembar Pengesahan Tanda Tangan Resmi (Identik Laporan PDF) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 text-xs font-sans pt-4 break-inside-avoid">
            <div className="text-center">
              <p>Mengetahui,</p>
              <p className="font-bold">Kepala {reportData.schoolName || 'Sekolah'}</p>
              <div className="h-14 sm:h-20" />
              <p className="font-bold underline text-sm">
                {reportData.principalName || 'Nama Kepala Sekolah'}
              </p>
              <p className="text-slate-600 font-mono">
                {reportData.principalNip && reportData.principalNip !== '-'
                  ? `NIP. ${reportData.principalNip}`
                  : 'NIP. -'}
              </p>
            </div>

            <div className="text-center">
              <p>
                {reportData.reportPlace || 'Jakarta'},{' '}
                {formatReportDateIndo(reportData.reportDateOfficial || reportData.date)}
              </p>
              <p className="font-bold">
                {reportData.attendanceType === 'SUBJECT'
                  ? `Guru Mata Pelajaran ${reportData.subjectName || ''}`
                  : `Wali ${reportData.className}`}
              </p>
              <div className="h-14 sm:h-20" />
              <p className="font-bold underline text-sm">
                {reportData.teacherName}
              </p>
              <p className="text-slate-600 font-mono">
                {reportData.teacherNip && reportData.teacherNip !== '-'
                  ? `NIP. ${reportData.teacherNip}`
                  : 'NIP. -'}
              </p>
            </div>
          </div>

          {/* Footer Verifikasi Digital */}
          <div className="mt-10 pt-4 border-t border-slate-300 text-center text-[10px] text-slate-500 font-sans">
            Dokumen Rekapitulasi Presensi Resmi Terverifikasi • Diterbitkan oleh Sistem Kawacanaan Presensi
          </div>
        </div>
      </main>
    </div>
  );
};
