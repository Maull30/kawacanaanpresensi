import { AttendanceRecord, Student, SystemConfig, AttendanceType } from '../types';

export interface WhatsAppBroadcastOptions {
  type: 'MASUK' | 'PULANG';
  date: string; // YYYY-MM-DD
  schoolName: string;
  className: string;
  teacherName: string;
  teacherRole?: 'WALI_KELAS' | 'GURU_MAPEL' | string;
  subjectName?: string | null;
  attendanceType?: AttendanceType;
  records: AttendanceRecord[];
  students: Student[];
  systemConfig: SystemConfig;
  customNote?: string;
  includeStudentList?: boolean;
  includeSmartLink?: boolean;
  smartLinkUrl?: string;
}

export interface AttendanceSummaryStats {
  totalStudents: number;
  hadir: number;
  sakit: number;
  izin: number;
  alfa: number;
  terlambat: number;
  belum: number;
  persentase: number;
  sakitList: string[];
  izinList: string[];
  alfaList: string[];
  terlambatList: string[];
}

/**
 * Format tanggal YYYY-MM-DD menjadi format formal Indonesia (e.g. "Senin, 24 Agustus 2026")
 */
export const formatDateToIndoLong = (dateStr: string): string => {
  try {
    const [y, m, d] = dateStr.split('-');
    const monthNames = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
    ];
    const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const dObj = new Date(Number(y), Number(m) - 1, Number(d));
    const dayName = dayNames[dObj.getDay()] || 'Hari';
    const monthName = monthNames[Number(m) - 1] || m;
    return `${dayName}, ${Number(d)} ${monthName} ${y}`;
  } catch {
    return dateStr;
  }
};

/**
 * Menghitung rekapitulasi data presensi untuk broadcast
 */
export const calculateAttendanceStats = (
  records: AttendanceRecord[],
  students: Student[]
): AttendanceSummaryStats => {
  const hadir = records.filter((r) => r.status === 'Hadir').length;
  const sakitRecords = records.filter((r) => r.status === 'Sakit');
  const izinRecords = records.filter((r) => r.status === 'Izin');
  const alfaRecords = records.filter((r) => r.status === 'Alfa');
  const terlambatRecords = records.filter(
    (r) =>
      r.status === 'Hadir' &&
      ((r as any).isLate ||
        (r.checkInTime &&
          r.checkInTime.localeCompare('07:00') > 0 &&
          r.checkInTime.localeCompare('11:00') < 0))
  );

  const totalStudents = students.length || records.length || 1;
  const recordedCount = hadir + sakitRecords.length + izinRecords.length + alfaRecords.length;
  const belum = Math.max(0, totalStudents - recordedCount);
  const persentase = totalStudents > 0 ? Math.round((hadir / totalStudents) * 100) : 0;

  const getNameWithNote = (r: AttendanceRecord) => {
    const student = students.find((s) => s.id === r.studentId);
    const name = r.studentName || student?.nama || 'Siswa';
    return r.notes ? `${name} (${r.notes})` : name;
  };

  const getLateWithTime = (r: AttendanceRecord) => {
    const student = students.find((s) => s.id === r.studentId);
    const name = r.studentName || student?.nama || 'Siswa';
    const time = r.checkInTime ? ` (Masuk pk ${r.checkInTime})` : '';
    return `${name}${time}`;
  };

  return {
    totalStudents,
    hadir,
    sakit: sakitRecords.length,
    izin: izinRecords.length,
    alfa: alfaRecords.length,
    terlambat: terlambatRecords.length,
    belum,
    persentase,
    sakitList: sakitRecords.map(getNameWithNote),
    izinList: izinRecords.map(getNameWithNote),
    alfaList: alfaRecords.map(getNameWithNote),
    terlambatList: terlambatRecords.map(getLateWithTime),
  };
};

/**
 * Membuat Smart Short Link untuk laporan harian on-the-fly (dynamic render)
 */
export const generateSmartReportLink = (
  classId: string,
  date: string,
  attendanceType: AttendanceType = 'DAILY',
  subjectId?: string | null
): string => {
  if (typeof window === 'undefined') return '';
  const origin = window.location.origin;
  const params = new URLSearchParams();
  params.set('r', classId);
  params.set('d', date);
  if (attendanceType === 'SUBJECT' && subjectId) {
    params.set('s', subjectId);
    params.set('m', 'subject');
  }
  return `${origin}/?${params.toString()}`;
};

/**
 * Menyusun pesan narasi WhatsApp lengkap sesuai konfigurasi dan standar resmi
 */
export const generateWhatsAppBroadcastMessage = (
  options: WhatsAppBroadcastOptions
): string => {
  const {
    type,
    date,
    schoolName,
    className,
    teacherName,
    teacherRole,
    subjectName,
    attendanceType = 'DAILY',
    records,
    students,
    systemConfig,
    customNote,
    includeStudentList = systemConfig.broadcastIncludeStudentList ?? true,
    includeSmartLink = systemConfig.broadcastIncludeSmartLink ?? true,
    smartLinkUrl,
  } = options;

  const stats = calculateAttendanceStats(records, students);
  const formattedDate = formatDateToIndoLong(date);
  const cleanSchool = schoolName || 'SATUAN PENDIDIKAN';
  const cleanClass = className.toLowerCase().startsWith('kelas') ? className : `Kelas ${className}`;
  const isMapel = attendanceType === 'SUBJECT' || teacherRole === 'GURU_MAPEL';

  const lines: string[] = [];

  // 1. Header Judul
  if (type === 'MASUK') {
    lines.push(systemConfig.broadcastMasukHeader || '*LAPORAN KEHADIRAN PAGI*');
  } else {
    lines.push(systemConfig.broadcastPulangHeader || '*LAPORAN KEPULANGAN SISWA*');
  }

  // 2. Identitas Sekolah & Rombel
  lines.push(`🏫 ${cleanSchool.toUpperCase()}`);
  lines.push(`📅 Hari/Tgl : ${formattedDate}`);
  lines.push(`👥 Rombel   : ${cleanClass}`);
  if (isMapel && subjectName) {
    lines.push(`📚 Mapel    : ${subjectName}`);
    lines.push(`👨‍🏫 Guru Pengajar : ${teacherName || 'Guru Mapel'}`);
  } else {
    lines.push(`👨‍🏫 Wali Kelas : ${teacherName || 'Wali Kelas'}`);
  }
  lines.push('');

  // 3. Salam Pembuka
  if (type === 'MASUK') {
    const opening =
      systemConfig.broadcastMasukOpening ||
      'Assalamu’alaikum Wr. Wb. & Selamat Pagi Bapak/Ibu Wali Murid,\nBerikut kami sampaikan rekapitulasi kehadiran ananda pada hari ini:';
    lines.push(opening);
  } else {
    const opening =
      systemConfig.broadcastPulangOpening ||
      'Assalamu’alaikum Wr. Wb. & Selamat Siang Bapak/Ibu Wali Murid,\nAlhamdulillah seluruh rangkaian kegiatan pembelajaran hari ini telah selesai:';
    lines.push(opening);
  }
  lines.push('');

  // 4. Ringkasan Kehadiran
  if (type === 'MASUK') {
    lines.push('📊 *RINGKASAN KEHADIRAN:*');
    lines.push(`✅ Hadir        : ${stats.hadir} Siswa`);
    lines.push(`🤒 Sakit        : ${stats.sakit} Siswa`);
    lines.push(`📝 Izin         : ${stats.izin} Siswa`);
    lines.push(`❌ Alfa         : ${stats.alfa} Siswa`);
    if (stats.terlambat > 0) {
      lines.push(`⏱️ Terlambat    : ${stats.terlambat} Siswa`);
    }
    lines.push(`📈 Kehadiran    : ${stats.persentase}%`);
  } else {
    lines.push('📊 *REKAP KEHADIRAN & KEPULANGAN:*');
    lines.push(`✅ Hadir Hingga Pulang : ${stats.hadir} Siswa`);
    lines.push(`🤒 Sakit : ${stats.sakit} Siswa`);
    lines.push(`📝 Izin  : ${stats.izin} Siswa`);
    lines.push(`❌ Alfa  : ${stats.alfa} Siswa`);
    lines.push(`📈 Total Kehadiran     : ${stats.persentase}%`);
  }
  lines.push('');

  // 5. Daftar Siswa Berhalangan / Terlambat (Opsional)
  if (includeStudentList) {
    const hasIssues =
      stats.sakitList.length > 0 ||
      stats.izinList.length > 0 ||
      stats.alfaList.length > 0 ||
      (type === 'MASUK' && stats.terlambatList.length > 0);

    if (hasIssues) {
      lines.push('📋 *KETERANGAN SISWA:*');
      if (stats.sakitList.length > 0) {
        lines.push(`🤒 *Sakit (${stats.sakitList.length}):*`);
        stats.sakitList.forEach((s) => lines.push(`  • ${s}`));
      }
      if (stats.izinList.length > 0) {
        lines.push(`📝 *Izin (${stats.izinList.length}):*`);
        stats.izinList.forEach((s) => lines.push(`  • ${s}`));
      }
      if (stats.alfaList.length > 0) {
        lines.push(`❌ *Tanpa Keterangan (${stats.alfaList.length}):*`);
        stats.alfaList.forEach((s) => lines.push(`  • ${s}`));
      }
      if (type === 'MASUK' && stats.terlambatList.length > 0) {
        lines.push(`⏱️ *Terlambat (${stats.terlambatList.length}):*`);
        stats.terlambatList.forEach((s) => lines.push(`  • ${s}`));
      }
      lines.push('');
    }
  }

  // 6. Catatan Khusus Guru (jika diisi)
  if (customNote && customNote.trim()) {
    lines.push('📢 *CATATAN/PENGUMUMAN KHUSUS:*');
    lines.push(customNote.trim());
    lines.push('');
  }

  // 7. Smart Link Dokumen Rekap Resmi (Instruksi eksplisit user: hilangkan kata/teks kop sekolahnya)
  if (includeSmartLink && smartLinkUrl) {
    lines.push('📄 Dokumen Rekap Resmi:');
    lines.push(smartLinkUrl);
    lines.push('');
  }

  // 8. Catatan Penutup
  if (type === 'MASUK') {
    const closing =
      systemConfig.broadcastMasukClosing ||
      'Terima kasih atas perhatian dan kerja sama Bapak/Ibu sekalian. Semoga anak-anak selalu sehat dan semangat belajar! 🙏✨';
    lines.push(closing);
  } else {
    const closing =
      systemConfig.broadcastPulangClosing ||
      'Mohon dipantau kepulangan ananda agar dapat tiba di rumah dengan selamat dan tertib. Terima kasih. 🏠🎒✨';
    lines.push(closing);
  }

  return lines.join('\n');
};

/**
 * Membuka WhatsApp (Web atau Desktop/Mobile App) dengan pesan yang sudah di-encode
 */
export const openWhatsAppBroadcast = (message: string): void => {
  const encoded = encodeURIComponent(message);
  const waUrl = `https://api.whatsapp.com/send?text=${encoded}`;
  window.open(waUrl, '_blank', 'noopener,noreferrer');
};
