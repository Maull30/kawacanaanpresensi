import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { AttendanceRecord, Student, AttendanceType } from '../types';
import {
  generateWhatsAppBroadcastMessage,
  generateSmartReportLink,
  calculateAttendanceStats,
  formatDateToIndoLong,
  openWhatsAppBroadcast,
} from '../utils/whatsappBroadcast';
import { WhatsAppIcon } from './WhatsAppIcon';
import {
  X,
  Send,
  Copy,
  Check,
  Sun,
  Home,
  FileText,
  Sparkles,
  ExternalLink,
  CheckCheck,
  MessageSquare,
  AlertCircle,
  HelpCircle,
  Loader2,
} from 'lucide-react';

interface WhatsAppBroadcastModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: string; // YYYY-MM-DD
  classId: string;
  className: string;
  attendanceType?: AttendanceType;
  subjectId?: string | null;
  subjectName?: string | null;
  records?: AttendanceRecord[];
  students?: Student[];
  initialType?: 'MASUK' | 'PULANG';
  reportType?: string;
  selectedWeek?: string;
  month?: string;
  year?: string;
  semester?: 'Ganjil' | 'Genap';
  academicYear?: string;
  onOpenPdfPreview?: () => void;
  onOpenSmartReport?: () => void;
}

export const WhatsAppBroadcastModal: React.FC<WhatsAppBroadcastModalProps> = ({
  isOpen,
  onClose,
  date,
  classId,
  className,
  attendanceType: rawAttendanceType = 'DAILY',
  subjectId = null,
  subjectName = null,
  records: propRecords,
  students: propStudents,
  initialType = 'MASUK',
  reportType,
  selectedWeek,
  month,
  year,
  semester,
  academicYear,
  onOpenPdfPreview,
  onOpenSmartReport,
}) => {
  const attendanceType: AttendanceType = (rawAttendanceType as AttendanceType) || 'DAILY';
  const {
    systemConfig,
    schoolProfile,
    currentUser,
    attendanceRecords,
    students: contextStudents,
    classes: contextClasses,
    teachers,
    showToast,
  } = useApp();

  const [broadcastType, setBroadcastType] = useState<'MASUK' | 'PULANG'>(initialType);
  const [copied, setCopied] = useState(false);
  const [includeStudentList, setIncludeStudentList] = useState(
    systemConfig.broadcastIncludeStudentList ?? true
  );
  const [includeSmartLink, setIncludeSmartLink] = useState(
    systemConfig.broadcastIncludeSmartLink ?? true
  );
  const [customNote, setCustomNote] = useState('');

  // Robust class ID resolution
  const effectiveClassId = useMemo(() => {
    if (classId) return classId;
    if (currentUser?.classIds && currentUser.classIds.length > 0) return currentUser.classIds[0];
    if (className) {
      const found = contextClasses.find((c) => c.name.toLowerCase() === className.toLowerCase() || c.name.toLowerCase().includes(className.toLowerCase()));
      if (found) return found.id;
    }
    if (schoolProfile.kelas) {
      const found = contextClasses.find((c) => c.name.toLowerCase() === schoolProfile.kelas.toLowerCase());
      if (found) return found.id;
    }
    return contextClasses[0]?.id || '';
  }, [classId, currentUser, className, schoolProfile.kelas, contextClasses]);

  // Target students in class
  const targetStudents = useMemo(() => {
    if (propStudents && propStudents.length > 0) return propStudents;
    if (effectiveClassId) return contextStudents.filter((s) => s.classId === effectiveClassId);
    return contextStudents;
  }, [propStudents, effectiveClassId, contextStudents]);

  // Target records for selected date, class, and attendance mode
  const targetRecords = useMemo(() => {
    if (propRecords && propRecords.length > 0) return propRecords;
    return attendanceRecords.filter((r) => {
      if (r.date !== date) return false;
      if (attendanceType === 'SUBJECT') {
        if (r.type !== 'SUBJECT') return false;
        if (subjectId && r.subjectId !== subjectId) return false;
      } else {
        if (r.type === 'SUBJECT') return false;
      }
      if (effectiveClassId && r.classId && r.classId !== effectiveClassId) return false;
      return true;
    });
  }, [propRecords, attendanceRecords, date, attendanceType, subjectId, effectiveClassId]);

  // Teacher name resolution
  const resolvedTeacherName = useMemo(() => {
    if (currentUser?.role === 'GURU MAPEL' || attendanceType === 'SUBJECT') {
      return currentUser?.name || 'Guru Mata Pelajaran';
    }
    const matchedTeacher = teachers.find((t) => t.id === currentUser?.teacherId);
    return (
      matchedTeacher?.nama ||
      currentUser?.name ||
      schoolProfile.namaWaliKelas ||
      'Wali Kelas'
    );
  }, [currentUser, attendanceType, teachers, schoolProfile.namaWaliKelas]);

  // Dynamic Smart Link directly from application domain: https://[domain-aplikasi]/?r=[id_kelas]&d=[tanggal]
  const smartLinkUrl = useMemo(() => {
    let period: 'daily' | 'weekly' | 'monthly' | 'semester' | 'kepsek' = 'daily';
    if (reportType === 'Laporan Mingguan') period = 'weekly';
    else if (reportType === 'Laporan Bulanan') period = 'monthly';
    else if (reportType === 'Laporan Semester') period = 'semester';
    else if (reportType?.startsWith('Laporan Kepala Sekolah')) period = 'kepsek';

    return generateSmartReportLink(
      effectiveClassId,
      date,
      attendanceType,
      subjectId,
      period,
      {
        week: selectedWeek,
        month,
        year,
        semester,
        academicYear,
      }
    );
  }, [
    effectiveClassId,
    date,
    attendanceType,
    subjectId,
    reportType,
    selectedWeek,
    month,
    year,
    semester,
    academicYear,
  ]);

  const handleOpenSmartReportDocument = (e?: React.MouseEvent, targetUrl?: string) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const finalUrl = targetUrl || smartLinkUrl;

    // 1. If parent component provided onOpenSmartReport or onOpenPdfPreview, open directly in-app!
    if (onOpenSmartReport) {
      onOpenSmartReport();
      return;
    }
    if (onOpenPdfPreview) {
      onOpenPdfPreview();
      return;
    }

    // 2. Open smoothly in-app via popstate routing (avoids iframe about:blank white screen)
    try {
      window.history.pushState(null, '', finalUrl);
      window.dispatchEvent(new PopStateEvent('popstate'));
      onClose();
    } catch (_) {
      try {
        window.location.href = finalUrl;
      } catch (_) {}
    }
  };

  // Computed summary statistics
  const stats = useMemo(() => {
    return calculateAttendanceStats(targetRecords, targetStudents);
  }, [targetRecords, targetStudents]);

  // Generated WhatsApp message text with official domain smart link
  const messageText = useMemo(() => {
    return generateWhatsAppBroadcastMessage({
      type: broadcastType,
      date,
      schoolName: schoolProfile.namaSekolah || 'SATUAN PENDIDIKAN',
      className: className || schoolProfile.kelas || 'Kelas',
      teacherName: resolvedTeacherName,
      teacherRole: currentUser?.role || 'WALI_KELAS',
      subjectName,
      attendanceType,
      records: targetRecords,
      students: targetStudents,
      systemConfig,
      customNote,
      includeStudentList,
      includeSmartLink,
      smartLinkUrl,
    });
  }, [
    broadcastType,
    date,
    schoolProfile.namaSekolah,
    className,
    schoolProfile.kelas,
    resolvedTeacherName,
    currentUser?.role,
    subjectName,
    attendanceType,
    targetRecords,
    targetStudents,
    systemConfig,
    customNote,
    includeStudentList,
    includeSmartLink,
    smartLinkUrl,
  ]);

  if (!isOpen) return null;

  const handleCopyText = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(messageText);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = messageText;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      showToast('Teks narasi WhatsApp berhasil disalin ke clipboard!', 'success');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      showToast('Gagal menyalin teks, silakan salin secara manual', 'error');
    }
  };

  const handleSendWhatsApp = () => {
    openWhatsAppBroadcast(messageText);
    showToast('Membuka WhatsApp...', 'info');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Top Modal Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-700 text-white flex items-center justify-between shadow-xs shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl overflow-hidden shadow-md shrink-0 flex items-center justify-center">
              <WhatsAppIcon size={40} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black tracking-tight leading-tight">
                  Broadcast Laporan WhatsApp Group
                </h3>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/40 text-emerald-100 border border-emerald-400/40">
                  <Sparkles size={11} /> 1-Klik Otomatis
                </span>
              </div>
              <p className="text-xs text-emerald-100 font-medium">
                {className || 'Kelas'} • {formatDateToIndoLong(date)}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white hover:bg-white/15 rounded-xl transition-colors cursor-pointer"
            title="Tutup Modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-5">
          {/* Commercial Tab Switcher: Laporan Masuk (Pagi) vs Laporan Pulang (Siang) */}
          <div className="bg-slate-100 p-1.5 rounded-2xl grid grid-cols-2 gap-1.5 border border-slate-200">
            <button
              type="button"
              onClick={() => setBroadcastType('MASUK')}
              className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                broadcastType === 'MASUK'
                  ? 'bg-white text-emerald-700 shadow-sm border border-emerald-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <Sun
                size={17}
                className={broadcastType === 'MASUK' ? 'text-amber-500' : 'text-slate-400'}
              />
              <span>☀️ Laporan Masuk (Pagi)</span>
            </button>

            <button
              type="button"
              onClick={() => setBroadcastType('PULANG')}
              className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                broadcastType === 'PULANG'
                  ? 'bg-white text-teal-800 shadow-sm border border-teal-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <Home
                size={17}
                className={broadcastType === 'PULANG' ? 'text-teal-600' : 'text-slate-400'}
              />
              <span>🏠 Laporan Pulang (Siang)</span>
            </button>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-5 gap-2 text-center">
            <div className="p-2 sm:p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl">
              <span className="text-[10px] font-bold text-emerald-700 block uppercase">Hadir</span>
              <span className="text-sm sm:text-base font-black text-emerald-900 leading-tight">
                {stats.hadir}
              </span>
            </div>
            <div className="p-2 sm:p-2.5 bg-sky-50 border border-sky-200 rounded-xl">
              <span className="text-[10px] font-bold text-sky-700 block uppercase">Sakit</span>
              <span className="text-sm sm:text-base font-black text-sky-900 leading-tight">
                {stats.sakit}
              </span>
            </div>
            <div className="p-2 sm:p-2.5 bg-amber-50 border border-amber-200 rounded-xl">
              <span className="text-[10px] font-bold text-amber-700 block uppercase">Izin</span>
              <span className="text-sm sm:text-base font-black text-amber-900 leading-tight">
                {stats.izin}
              </span>
            </div>
            <div className="p-2 sm:p-2.5 bg-rose-50 border border-rose-200 rounded-xl">
              <span className="text-[10px] font-bold text-rose-700 block uppercase">Alfa</span>
              <span className="text-sm sm:text-base font-black text-rose-900 leading-tight">
                {stats.alfa}
              </span>
            </div>
            <div className="p-2 sm:p-2.5 bg-indigo-50 border border-indigo-200 rounded-xl">
              <span className="text-[10px] font-bold text-indigo-700 block uppercase">Persentase</span>
              <span className="text-sm sm:text-base font-black text-indigo-900 leading-tight">
                {stats.persentase}%
              </span>
            </div>
          </div>

          {/* Realistic WhatsApp Chat Bubble Mockup */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span className="flex items-center gap-1.5">
                <WhatsAppIcon size={16} />
                <span>Pratinjau Pesan WhatsApp Group:</span>
              </span>
              <span className="text-[11px] text-slate-400 font-medium">
                Otomatis disesuaikan dengan data presensi
              </span>
            </div>

            <div className="relative bg-[#EFEAE2] p-3.5 sm:p-4 rounded-2xl border border-slate-300 shadow-inner">
              {/* WhatsApp Speech Bubble */}
              <div className="relative bg-white text-slate-800 rounded-2xl p-4 shadow-sm max-w-full text-xs font-mono sm:text-[13px] leading-relaxed whitespace-pre-wrap border border-slate-200/80">
                {messageText.split('\n').map((line, lIdx) => {
                  const urlMatch = line.match(/(https?:\/\/[^\s]+)/);
                  if (urlMatch) {
                    const url = urlMatch[1];
                    const [before, after] = line.split(url);
                    return (
                      <div key={lIdx} className="break-all">
                        <span>{before}</span>
                        <button
                          type="button"
                          onClick={(e) => handleOpenSmartReportDocument(e, url)}
                          className="inline-flex items-center gap-1 font-bold text-emerald-700 hover:text-emerald-900 underline bg-emerald-50 px-1 py-0.5 rounded cursor-pointer transition-colors text-left break-all"
                          title="Klik untuk membuka tautan dokumen rekap resmi"
                        >
                          <span>{url}</span>
                          <ExternalLink size={12} className="shrink-0" />
                        </button>
                        <span>{after}</span>
                      </div>
                    );
                  }
                  return <div key={lIdx}>{line || '\u00A0'}</div>;
                })}

                <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-end gap-1.5 text-[10px] text-slate-400 font-sans">
                  <span>Hari ini</span>
                  <CheckCheck size={14} className="text-emerald-500" />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Options Toggles */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2.5 text-xs font-bold text-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeStudentList}
                  onChange={(e) => setIncludeStudentList(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 cursor-pointer"
                />
                <span>Sertakan rincian siswa yang Sakit, Izin, Alfa, atau Terlambat</span>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2.5 text-xs font-bold text-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeSmartLink}
                  onChange={(e) => setIncludeSmartLink(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 cursor-pointer"
                />
                <span className="flex items-center gap-1.5">
                  <span>Sertakan tautan Smart Link Dokumen Rekap Resmi</span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">
                    Tanpa Unggah PDF
                  </span>
                </span>
              </label>
            </div>

            {/* Smart Link Live Access Card */}
            {includeSmartLink && smartLinkUrl && (
              <div className="p-3 bg-emerald-50/90 border border-emerald-300/80 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mt-2">
                <div className="flex items-start sm:items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0 shadow-2xs">
                    <FileText size={16} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-black text-emerald-950">
                        Tautan Dokumen Rekap Resmi
                      </span>
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-200 text-emerald-900">
                        Siap Dibuka
                      </span>
                    </div>
                    <span className="text-[11px] text-emerald-700 font-mono block truncate max-w-sm sm:max-w-md">
                      {smartLinkUrl}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={(e) => handleOpenSmartReportDocument(e, smartLinkUrl)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
                    title="Buka dokumen rekap resmi"
                  >
                    <ExternalLink size={13} />
                    <span>Buka Tautan Resmi</span>
                  </button>
                </div>
              </div>
            )}

            {/* Custom Announcement / Teacher's Note */}
            <div className="pt-1">
              <input
                type="text"
                value={customNote}
                onChange={(e) => setCustomNote(e.target.value)}
                placeholder="Tambah pengumuman/pesan tambahan khusus ke grup (opsional)..."
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/10 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Modal Commercial Action Footer */}
        <div className="p-3.5 sm:p-5 bg-white border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            {includeSmartLink && smartLinkUrl && (
              <button
                type="button"
                onClick={(e) => handleOpenSmartReportDocument(e, smartLinkUrl)}
                className="px-3.5 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 min-h-[40px] cursor-pointer shadow-2xs"
                title="Buka langsung tautan dokumen rekap resmi"
              >
                <ExternalLink size={14} />
                <span>Buka Tautan Rekap</span>
              </button>
            )}

            {onOpenPdfPreview && (
              <button
                type="button"
                onClick={onOpenPdfPreview}
                className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 min-h-[40px] cursor-pointer"
                title="Buka pratinjau lembar cetak PDF resmi"
              >
                <FileText size={15} />
                <span>Lihat PDF</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleCopyText}
              className="flex-1 sm:flex-none px-4 py-2.5 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-800 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 min-h-[40px] cursor-pointer"
            >
              {copied ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} />}
              <span>{copied ? 'Tersalin!' : 'Salin Teks Pesan'}</span>
            </button>
          </div>

          <div className="w-full sm:w-auto">
            <button
              type="button"
              onClick={handleSendWhatsApp}
              className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-emerald-600 via-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 active:scale-95 text-white font-black text-xs sm:text-sm rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2.5 min-h-[42px] cursor-pointer"
            >
              <WhatsAppIcon size={18} />
              <span>Buka WhatsApp & Kirim Sekarang</span>
              <ExternalLink size={14} className="opacity-80" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
