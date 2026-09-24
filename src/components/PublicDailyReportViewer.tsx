import React, { useEffect, useState, useMemo } from 'react';
import { Printer, Share2, CheckCircle2, ArrowLeft, FileText, Loader2, AlertCircle } from 'lucide-react';
import { SchoolLogo } from './SchoolLogo';
import { useApp } from '../context/AppContext';
import { getFaseByClassName } from '../utils/faseKurikulum';
import { generateSmartReportLink } from '../utils/whatsappBroadcast';

export interface PublicDailyReportViewerProps {
  classId?: string;
  date?: string;
  attendanceType?: 'DAILY' | 'SUBJECT';
  subjectId?: string | null;
  onBackToApp?: () => void;
  reportType?: 'Laporan Harian' | 'Laporan Mingguan' | 'Laporan Bulanan' | 'Laporan Semester' | 'Laporan Kepala Sekolah (Bulanan)' | 'Laporan Kepala Sekolah (Semester)';
  selectedWeek?: string;
  month?: string;
  year?: string;
  semester?: 'Ganjil' | 'Genap';
  academicYear?: string;
}

export const PublicDailyReportViewer: React.FC<PublicDailyReportViewerProps> = ({
  classId: propClassId,
  date: propDate,
  attendanceType = 'DAILY',
  subjectId = null,
  onBackToApp,
  reportType = 'Laporan Harian',
  selectedWeek = 'Minggu Ke-1',
  month = 'Juli',
  year = '2026',
  semester = 'Ganjil',
  academicYear: propAcademicYear,
}) => {
  const {
    currentUser,
    schoolProfile: ctxSchoolProfile,
    systemConfig: ctxSystemConfig,
    classes: ctxClasses,
    students: ctxStudents,
    attendanceRecords: ctxAttendanceRecords,
    teachers: ctxTeachers,
    subjects: ctxSubjects,
  } = useApp();

  const isInternalUser = Boolean(currentUser && ctxClasses && ctxClasses.length > 0);

  // External fetch state (for public visitors via smart link without active session)
  const [loading, setLoading] = useState(!isInternalUser);
  const [error, setError] = useState<string | null>(null);
  const [externalReportData, setExternalReportData] = useState<any | null>(null);

  const selectedDate = propDate || new Date().toISOString().split('T')[0];
  const isKepsekReport = reportType.startsWith('Laporan Kepala Sekolah');

  const monthNumberMap: { [key: string]: number } = {
    'Januari': 1, 'Februari': 2, 'Maret': 3, 'April': 4,
    'Mei': 5, 'Juni': 6, 'Juli': 7, 'Agustus': 8,
    'September': 9, 'Oktober': 10, 'November': 11, 'Desember': 12
  };

  const mNum = monthNumberMap[month] || 7;
  const effectiveYear = Number(year) || 2026;
  const academicYear = propAcademicYear || ctxSchoolProfile?.tahunPelajaran || `${effectiveYear}/${effectiveYear + 1}`;

  const [startYearStr, endYearStr] = academicYear.split('/');
  const startYear = parseInt(startYearStr, 10) || effectiveYear;
  const endYear = parseInt(endYearStr, 10) || (startYear + 1);

  // Effective days helper
  const getEffectiveDaysForMonth = (yr: number, mIndex: number) => {
    let count = 0;
    const daysInMonth = new Date(yr, mIndex, 0).getDate();
    for (let d = 1; d <= daysInMonth; d++) {
      const day = new Date(yr, mIndex - 1, d).getDay();
      if (day >= 1 && day <= 5) count++;
    }
    return count > 0 ? count : 20;
  };

  const effectiveDays = getEffectiveDaysForMonth(effectiveYear, mNum);
  const monthKey = `${effectiveYear}-${String(mNum).padStart(2, '0')}`;

  // Week working days
  const weekNum = parseInt(selectedWeek.replace(/\D/g, ''), 10) || 1;
  const weekWorkingDays = useMemo(() => {
    const daysInMonth = new Date(effectiveYear, mNum, 0).getDate();
    const startDay = (weekNum - 1) * 7 + 1;
    const endDay = Math.min(daysInMonth, weekNum * 7);

    const days: { dateStr: string; dayNum: number; dayShort: string; dayName: string }[] = [];
    const dayNamesShort = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
    const dayNamesFull = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

    for (let d = startDay; d <= endDay; d++) {
      const jsDate = new Date(effectiveYear, mNum - 1, d);
      const dow = jsDate.getDay();
      if (dow >= 1 && dow <= 5) {
        const dateStr = `${effectiveYear}-${String(mNum).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        days.push({
          dateStr,
          dayNum: d,
          dayShort: dayNamesShort[dow],
          dayName: dayNamesFull[dow],
        });
      }
    }
    return days;
  }, [effectiveYear, mNum, weekNum]);

  // Semester months list
  const semesterMonthList = useMemo(() => {
    if (semester === 'Genap') {
      return [
        { name: 'Januari', num: 1, year: endYear },
        { name: 'Februari', num: 2, year: endYear },
        { name: 'Maret', num: 3, year: endYear },
        { name: 'April', num: 4, year: endYear },
        { name: 'Mei', num: 5, year: endYear },
        { name: 'Juni', num: 6, year: endYear },
      ];
    }
    return [
      { name: 'Juli', num: 7, year: startYear },
      { name: 'Agustus', num: 8, year: startYear },
      { name: 'September', num: 9, year: startYear },
      { name: 'Oktober', num: 10, year: startYear },
      { name: 'November', num: 11, year: startYear },
      { name: 'Desember', num: 12, year: startYear },
    ];
  }, [semester, startYear, endYear]);

  const semesterTotalEffectiveDays = useMemo(() => {
    return semesterMonthList.reduce((acc, m) => acc + getEffectiveDaysForMonth(m.year, m.num), 0);
  }, [semesterMonthList]);

  // Target class resolution
  const resolvedClass = useMemo(() => {
    if (!isInternalUser) return null;
    if (propClassId) {
      const byId = ctxClasses.find((c) => c.id === propClassId);
      if (byId) return byId;
      const byName = ctxClasses.find((c) => c.name.toLowerCase() === propClassId.toLowerCase());
      if (byName) return byName;
    }
    return ctxClasses[0] || null;
  }, [isInternalUser, propClassId, ctxClasses]);

  const resolvedSubject = useMemo(() => {
    if (!isInternalUser || !subjectId) return null;
    return ctxSubjects.find((s) => s.id === subjectId) || null;
  }, [isInternalUser, subjectId, ctxSubjects]);

  const resolvedWaliKelas = useMemo(() => {
    if (!isInternalUser || !resolvedClass) return null;
    if (resolvedClass.waliKelasTeacherId) {
      const t = ctxTeachers.find((tch) => tch.id === resolvedClass.waliKelasTeacherId);
      if (t) return t;
    }
    return null;
  }, [isInternalUser, resolvedClass, ctxTeachers]);

  // Target students
  const targetStudents = useMemo(() => {
    if (!isInternalUser) return [];
    if (isKepsekReport) return ctxStudents;
    if (!resolvedClass) return ctxStudents;
    return ctxStudents
      .filter((s) => s.classId === resolvedClass.id || s.className === resolvedClass.name)
      .sort((a, b) => a.nama.localeCompare(b.nama));
  }, [isInternalUser, isKepsekReport, resolvedClass, ctxStudents]);

  // Target records
  const targetRecords = useMemo(() => {
    if (!isInternalUser) return [];
    const studentIds = new Set(targetStudents.map((s) => s.id));
    return ctxAttendanceRecords.filter((r) => {
      const matchesStudent = studentIds.has(r.studentId);
      if (!matchesStudent) return false;
      if (attendanceType === 'SUBJECT') {
        return r.type === 'SUBJECT' && (!subjectId || r.subjectId === subjectId);
      }
      return r.type === 'DAILY' || !r.type;
    });
  }, [isInternalUser, targetStudents, ctxAttendanceRecords, attendanceType, subjectId]);

  const formatPct = (val: number) => (val % 1 === 0 ? val.toFixed(0) : val.toFixed(1));

  // --- 1. DATA COMPUTATION FOR LAPORAN HARIAN ---
  const dailyStudentRows = useMemo(() => {
    return targetStudents.map((s) => {
      const record = targetRecords.find((r) => r.studentId === s.id && r.date === selectedDate);
      const status = record?.status || 'Belum Diabsen';
      const timeIn = record?.checkInTime || '-';
      const timeOut = record?.checkOutTime || '-';
      const note = record?.notes || '-';
      return {
        ...s,
        status,
        timeIn,
        timeOut,
        note,
      };
    });
  }, [targetStudents, targetRecords, selectedDate]);

  const dailyHadir = dailyStudentRows.filter((s) => s.status === 'Hadir').length;
  const dailySakit = dailyStudentRows.filter((s) => s.status === 'Sakit').length;
  const dailyIzin = dailyStudentRows.filter((s) => s.status === 'Izin').length;
  const dailyAlfa = dailyStudentRows.filter((s) => s.status === 'Alfa').length;
  const dailyTotalKnown = dailyHadir + dailySakit + dailyIzin + dailyAlfa;
  const dailyDenom = dailyTotalKnown > 0 ? dailyTotalKnown : targetStudents.length || 1;

  const dailyPctHadir = (dailyHadir / dailyDenom) * 100;
  const dailyPctSakit = (dailySakit / dailyDenom) * 100;
  const dailyPctIzin = (dailyIzin / dailyDenom) * 100;
  const dailyPctAlfa = (dailyAlfa / dailyDenom) * 100;

  // --- 2. DATA COMPUTATION FOR LAPORAN MINGGUAN ---
  const weeklyStudentRows = useMemo(() => {
    const weekDateStrings = weekWorkingDays.map((d) => d.dateStr);
    return targetStudents.map((s) => {
      const recordsForWeek = targetRecords.filter(
        (r) => r.studentId === s.id && weekDateStrings.includes(r.date)
      );

      const dayStatusMap: { [dateStr: string]: string } = {};
      weekWorkingDays.forEach((wDay) => {
        const found = recordsForWeek.find((r) => r.date === wDay.dateStr);
        dayStatusMap[wDay.dateStr] = found ? (found.status === 'Hadir' ? 'H' : found.status === 'Sakit' ? 'S' : found.status === 'Izin' ? 'I' : 'A') : '-';
      });

      const hadir = recordsForWeek.filter((r) => r.status === 'Hadir').length;
      const sakit = recordsForWeek.filter((r) => r.status === 'Sakit').length;
      const izin = recordsForWeek.filter((r) => r.status === 'Izin').length;
      const alfa = recordsForWeek.filter((r) => r.status === 'Alfa').length;
      const totalDaysInWeek = weekWorkingDays.length || 1;
      const pct = (hadir / totalDaysInWeek) * 100;

      return {
        ...s,
        dayStatusMap,
        hadir,
        sakit,
        izin,
        alfa,
        pct: formatPct(pct),
      };
    });
  }, [targetStudents, targetRecords, weekWorkingDays]);

  const weeklyTotalHadir = weeklyStudentRows.reduce((a, b) => a + b.hadir, 0);
  const weeklyTotalSakit = weeklyStudentRows.reduce((a, b) => a + b.sakit, 0);
  const weeklyTotalIzin = weeklyStudentRows.reduce((a, b) => a + b.izin, 0);
  const weeklyTotalAlfa = weeklyStudentRows.reduce((a, b) => a + b.alfa, 0);
  const weeklyTotalRecorded = weeklyTotalHadir + weeklyTotalSakit + weeklyTotalIzin + weeklyTotalAlfa;
  const weeklyDenom = (targetStudents.length * (weekWorkingDays.length || 1)) || weeklyTotalRecorded || 1;

  const weeklyPctHadir = (weeklyTotalHadir / weeklyDenom) * 100;
  const weeklyPctSakit = (weeklyTotalSakit / weeklyDenom) * 100;
  const weeklyPctIzin = (weeklyTotalIzin / weeklyDenom) * 100;
  const weeklyPctAlfa = (weeklyTotalAlfa / weeklyDenom) * 100;

  // --- 3. DATA COMPUTATION FOR LAPORAN BULANAN ---
  const monthlyStudentRows = useMemo(() => {
    return targetStudents.map((s) => {
      const recordsForMonth = targetRecords.filter(
        (r) => r.studentId === s.id && r.date.startsWith(monthKey)
      );

      const hadir = recordsForMonth.filter((r) => r.status === 'Hadir').length;
      const sakit = recordsForMonth.filter((r) => r.status === 'Sakit').length;
      const izin = recordsForMonth.filter((r) => r.status === 'Izin').length;
      const alfa = recordsForMonth.filter((r) => r.status === 'Alfa').length;
      const totalRecorded = hadir + sakit + izin + alfa;
      const denom = effectiveDays > 0 ? effectiveDays : (totalRecorded > 0 ? totalRecorded : 1);
      const pct = (hadir / denom) * 100;

      return {
        ...s,
        hadir,
        sakit,
        izin,
        alfa,
        pct: formatPct(pct),
      };
    });
  }, [targetStudents, targetRecords, monthKey, effectiveDays]);

  const monthlyTotalHadir = monthlyStudentRows.reduce((a, b) => a + b.hadir, 0);
  const monthlyTotalSakit = monthlyStudentRows.reduce((a, b) => a + b.sakit, 0);
  const monthlyTotalIzin = monthlyStudentRows.reduce((a, b) => a + b.izin, 0);
  const monthlyTotalAlfa = monthlyStudentRows.reduce((a, b) => a + b.alfa, 0);
  const monthlyTotalRecorded = monthlyTotalHadir + monthlyTotalSakit + monthlyTotalIzin + monthlyTotalAlfa;
  const monthlyDenom = (targetStudents.length * effectiveDays) || monthlyTotalRecorded || 1;

  const monthlyPctHadir = (monthlyTotalHadir / monthlyDenom) * 100;
  const monthlyPctSakit = (monthlyTotalSakit / monthlyDenom) * 100;
  const monthlyPctIzin = (monthlyTotalIzin / monthlyDenom) * 100;
  const monthlyPctAlfa = (monthlyTotalAlfa / monthlyDenom) * 100;

  // --- 4. DATA COMPUTATION FOR LAPORAN SEMESTER ---
  const semesterStudentRows = useMemo(() => {
    const monthPrefixes = semesterMonthList.map((m) => `${m.year}-${String(m.num).padStart(2, '0')}`);
    return targetStudents.map((s) => {
      const recordsForSemester = targetRecords.filter((r) =>
        r.studentId === s.id && monthPrefixes.some((p) => r.date.startsWith(p))
      );

      const hadir = recordsForSemester.filter((r) => r.status === 'Hadir').length;
      const sakit = recordsForSemester.filter((r) => r.status === 'Sakit').length;
      const izin = recordsForSemester.filter((r) => r.status === 'Izin').length;
      const alfa = recordsForSemester.filter((r) => r.status === 'Alfa').length;
      const totalRecorded = hadir + sakit + izin + alfa;
      const denom = semesterTotalEffectiveDays > 0 ? semesterTotalEffectiveDays : (totalRecorded > 0 ? totalRecorded : 1);

      const pctHadir = (hadir / denom) * 100;
      const pctSakit = (sakit / denom) * 100;
      const pctIzin = (izin / denom) * 100;
      const pctAlfa = (alfa / denom) * 100;

      let predicate = 'Sangat Baik';
      if (pctHadir < 75) predicate = 'Perlu Pembinaan';
      else if (pctHadir < 85) predicate = 'Cukup';
      else if (pctHadir < 95) predicate = 'Baik';

      return {
        ...s,
        hadir,
        sakit,
        izin,
        alfa,
        pctHadir: formatPct(pctHadir),
        pctSakit: formatPct(pctSakit),
        pctIzin: formatPct(pctIzin),
        pctAlfa: formatPct(pctAlfa),
        predicate,
      };
    });
  }, [targetStudents, targetRecords, semesterMonthList, semesterTotalEffectiveDays]);

  const semesterTotalHadir = semesterStudentRows.reduce((a, b) => a + b.hadir, 0);
  const semesterTotalSakit = semesterStudentRows.reduce((a, b) => a + b.sakit, 0);
  const semesterTotalIzin = semesterStudentRows.reduce((a, b) => a + b.izin, 0);
  const semesterTotalAlfa = semesterStudentRows.reduce((a, b) => a + b.alfa, 0);
  const semesterTotalRecorded = semesterTotalHadir + semesterTotalSakit + semesterTotalIzin + semesterTotalAlfa;
  const semesterDenom = (targetStudents.length * semesterTotalEffectiveDays) || semesterTotalRecorded || 1;

  const semesterPctHadir = (semesterTotalHadir / semesterDenom) * 100;
  const semesterPctSakit = (semesterTotalSakit / semesterDenom) * 100;
  const semesterPctIzin = (semesterTotalIzin / semesterDenom) * 100;
  const semesterPctAlfa = (semesterTotalAlfa / semesterDenom) * 100;

  // --- 5. DATA COMPUTATION FOR LAPORAN SUPERVISI KEPALA SEKOLAH ---
  const isKepsekSemester = reportType === 'Laporan Kepala Sekolah (Semester)';
  const kepsekEffectiveDays = isKepsekSemester ? semesterTotalEffectiveDays : effectiveDays;

  const kepsekClassRows = useMemo(() => {
    return ctxClasses.map((cls) => {
      const clsStudents = ctxStudents.filter(
        (s) => s.classId === cls.id || s.className === cls.name
      );
      const maleCount = clsStudents.filter((s) => s.gender === 'Laki-laki' || s.gender === 'L').length;
      const femaleCount = clsStudents.filter((s) => s.gender === 'Perempuan' || s.gender === 'P').length;
      const totalClsStudents = clsStudents.length;

      const clsStudentIds = new Set(clsStudents.map((s) => s.id));
      let clsRecords: any[] = [];

      if (isKepsekSemester) {
        const monthPrefixes = semesterMonthList.map((m) => `${m.year}-${String(m.num).padStart(2, '0')}`);
        clsRecords = ctxAttendanceRecords.filter(
          (r) =>
            clsStudentIds.has(r.studentId) &&
            (r.type === 'DAILY' || !r.type) &&
            monthPrefixes.some((p) => r.date.startsWith(p))
        );
      } else {
        clsRecords = ctxAttendanceRecords.filter(
          (r) =>
            clsStudentIds.has(r.studentId) &&
            (r.type === 'DAILY' || !r.type) &&
            r.date.startsWith(monthKey)
        );
      }

      const hadir = clsRecords.filter((r) => r.status === 'Hadir').length;
      const sakit = clsRecords.filter((r) => r.status === 'Sakit').length;
      const izin = clsRecords.filter((r) => r.status === 'Izin').length;
      const alfa = clsRecords.filter((r) => r.status === 'Alfa').length;
      const totalRecorded = hadir + sakit + izin + alfa;

      const denom = (totalClsStudents * kepsekEffectiveDays) || totalRecorded || 1;
      const pctHadir = (hadir / denom) * 100;

      let predicate = 'Sangat Baik';
      if (pctHadir < 75) predicate = 'Perlu Pembinaan';
      else if (pctHadir < 85) predicate = 'Cukup';
      else if (pctHadir < 95) predicate = 'Baik';

      let waliName = '-';
      if (cls.waliKelasTeacherId) {
        const tch = ctxTeachers.find((t) => t.id === cls.waliKelasTeacherId);
        if (tch) waliName = tch.nama;
      }

      return {
        classId: cls.id,
        className: cls.name.replace(/^kelas\s*/i, ''),
        grade: cls.grade,
        fase: getFaseByClassName(cls.name, cls.grade),
        waliKelasName: waliName,
        maleCount,
        femaleCount,
        totalStudents: totalClsStudents,
        hadir,
        sakit,
        izin,
        alfa,
        totalRecorded,
        pctHadir: formatPct(pctHadir),
        predicate,
      };
    });
  }, [ctxClasses, ctxStudents, ctxAttendanceRecords, ctxTeachers, isKepsekSemester, semesterMonthList, monthKey, kepsekEffectiveDays]);

  const kepsekSchoolTotalMale = kepsekClassRows.reduce((a, c) => a + c.maleCount, 0);
  const kepsekSchoolTotalFemale = kepsekClassRows.reduce((a, c) => a + c.femaleCount, 0);
  const kepsekSchoolTotalStudents = kepsekClassRows.reduce((a, c) => a + c.totalStudents, 0);
  const kepsekSchoolTotalHadir = kepsekClassRows.reduce((a, c) => a + c.hadir, 0);
  const kepsekSchoolTotalSakit = kepsekClassRows.reduce((a, c) => a + c.sakit, 0);
  const kepsekSchoolTotalIzin = kepsekClassRows.reduce((a, c) => a + c.izin, 0);
  const kepsekSchoolTotalAlfa = kepsekClassRows.reduce((a, c) => a + c.alfa, 0);
  const kepsekSchoolTotalRecorded = kepsekSchoolTotalHadir + kepsekSchoolTotalSakit + kepsekSchoolTotalIzin + kepsekSchoolTotalAlfa;
  const kepsekSchoolDenom = (kepsekSchoolTotalStudents * kepsekEffectiveDays) || kepsekSchoolTotalRecorded || 1;

  const kepsekSchoolPctHadir = (kepsekSchoolTotalHadir / kepsekSchoolDenom) * 100;
  const kepsekSchoolPctSakit = (kepsekSchoolTotalSakit / kepsekSchoolDenom) * 100;
  const kepsekSchoolPctIzin = (kepsekSchoolTotalIzin / kepsekSchoolDenom) * 100;
  const kepsekSchoolPctAlfa = (kepsekSchoolTotalAlfa / kepsekSchoolDenom) * 100;

  let kepsekSchoolPredicate = 'Sangat Baik';
  if (kepsekSchoolPctHadir < 75) kepsekSchoolPredicate = 'Perlu Pembinaan';
  else if (kepsekSchoolPctHadir < 85) kepsekSchoolPredicate = 'Cukup';
  else if (kepsekSchoolPctHadir < 95) kepsekSchoolPredicate = 'Baik';

  // Fallback fetching for external visitor via URL
  useEffect(() => {
    if (isInternalUser) return;
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
            classId: propClassId,
            date: selectedDate,
            attendanceType,
            subjectId,
          }),
        });

        const json = await res.json();
        if (!res.ok || !json.ok) {
          throw new Error(json.error || 'Gagal memuat dokumen rekap kehadiran.');
        }

        if (isMounted) {
          setExternalReportData(json.report);
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
  }, [isInternalUser, propClassId, selectedDate, attendanceType, subjectId]);

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      const shareUrl = window.location.href;
      if (navigator.share) {
        navigator.share({
          title: `Laporan Kehadiran - ${ctxSchoolProfile?.namaSekolah || 'Sekolah'}`,
          url: shareUrl,
        }).catch(() => {});
      } else {
        navigator.clipboard?.writeText(shareUrl);
        alert('Tautan dokumen smart link berhasil disalin ke papan klip!');
      }
    }
  };

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
        const yr = parts[0];
        return `${day} ${months[monthIdx]} ${yr}`;
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

  // Determine current active metrics for the summary cards
  const activeMetrics = useMemo(() => {
    if (!isInternalUser && externalReportData) {
      const total = externalReportData.stats?.totalStudents || externalReportData.students?.length || 1;
      return {
        pctHadir: formatPct((externalReportData.stats.hadir / total) * 100),
        pctSakit: formatPct((externalReportData.stats.sakit / total) * 100),
        pctIzin: formatPct((externalReportData.stats.izin / total) * 100),
        pctAlfa: formatPct((externalReportData.stats.alfa / total) * 100),
      };
    }
    if (isKepsekReport) {
      return {
        pctHadir: formatPct(kepsekSchoolPctHadir),
        pctSakit: formatPct(kepsekSchoolPctSakit),
        pctIzin: formatPct(kepsekSchoolPctIzin),
        pctAlfa: formatPct(kepsekSchoolPctAlfa),
      };
    }
    if (reportType === 'Laporan Mingguan') {
      return {
        pctHadir: formatPct(weeklyPctHadir),
        pctSakit: formatPct(weeklyPctSakit),
        pctIzin: formatPct(weeklyPctIzin),
        pctAlfa: formatPct(weeklyPctAlfa),
      };
    }
    if (reportType === 'Laporan Bulanan') {
      return {
        pctHadir: formatPct(monthlyPctHadir),
        pctSakit: formatPct(monthlyPctSakit),
        pctIzin: formatPct(monthlyPctIzin),
        pctAlfa: formatPct(monthlyPctAlfa),
      };
    }
    if (reportType === 'Laporan Semester') {
      return {
        pctHadir: formatPct(semesterPctHadir),
        pctSakit: formatPct(semesterPctSakit),
        pctIzin: formatPct(semesterPctIzin),
        pctAlfa: formatPct(semesterPctAlfa),
      };
    }
    return {
      pctHadir: formatPct(dailyPctHadir),
      pctSakit: formatPct(dailyPctSakit),
      pctIzin: formatPct(dailyPctIzin),
      pctAlfa: formatPct(dailyPctAlfa),
    };
  }, [
    isInternalUser,
    externalReportData,
    isKepsekReport,
    reportType,
    dailyPctHadir,
    dailyPctSakit,
    dailyPctIzin,
    dailyPctAlfa,
    weeklyPctHadir,
    weeklyPctSakit,
    weeklyPctIzin,
    weeklyPctAlfa,
    monthlyPctHadir,
    monthlyPctSakit,
    monthlyPctIzin,
    monthlyPctAlfa,
    semesterPctHadir,
    semesterPctSakit,
    semesterPctIzin,
    semesterPctAlfa,
    kepsekSchoolPctHadir,
    kepsekSchoolPctSakit,
    kepsekSchoolPctIzin,
    kepsekSchoolPctAlfa,
  ]);

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
          Sistem sedang merender lembar laporan terverifikasi secara langsung dari database.
        </p>
        <Loader2 size={24} className="animate-spin text-blue-600 mt-5" />
      </div>
    );
  }

  if (!isInternalUser && (error || !externalReportData)) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 mb-4">
          <AlertCircle size={28} />
        </div>
        <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
          Dokumen Tidak Ditemukan atau Belum Tersedia
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 mt-2 max-w-md leading-relaxed">
          {error || 'Data rekap kehadiran untuk rombel dan periode ini belum diterbitkan oleh pihak sekolah.'}
        </p>
        <div className="mt-6 flex items-center gap-3">
          {onBackToApp && (
            <button
              onClick={onBackToApp}
              className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition-all cursor-pointer shadow-xs"
            >
              Kembali ke Aplikasi
            </button>
          )}
        </div>
      </div>
    );
  }

  // Active School and Teacher Profile Data
  const schoolName = ctxSchoolProfile?.namaSekolah || externalReportData?.schoolName || 'SD NEGERI CONTOH';
  const pemerintahDaerah = ctxSystemConfig?.pemerintahDaerah || externalReportData?.pemerintahDaerah || 'PEMERINTAH PROVINSI DAERAH KHUSUS IBUKOTA JAKARTA';
  const dinasPendidikan = ctxSystemConfig?.dinasPendidikan || externalReportData?.dinasPendidikan || 'DINAS PENDIDIKAN';
  const npsn = ctxSchoolProfile?.npsn || externalReportData?.npsn || '20104501';
  const alamatSekolah = ctxSchoolProfile?.alamat || externalReportData?.alamat || 'Jl. Pendidikan No. 123, Kel. Merdeka, Kec. Nusantara, Kota Jakarta';
  const showLetterhead = ctxSystemConfig?.showLetterhead ?? externalReportData?.showLetterhead ?? true;
  const letterheadType = ctxSystemConfig?.letterheadType || externalReportData?.letterheadType || 'standard_text';
  const letterheadImageUrl = ctxSystemConfig?.letterheadImageUrl || externalReportData?.letterheadImageUrl || '';
  const schoolLogoUrl = ctxSystemConfig?.schoolLogoUrl || externalReportData?.logoUrl || '';

  const activeClassName = resolvedClass?.name || externalReportData?.className || 'Kelas';
  const activeClassClean = activeClassName.replace(/^kelas\s*/i, '');
  const activeFase = resolvedClass ? getFaseByClassName(resolvedClass.name, resolvedClass.grade) : (externalReportData?.fase || 'Fase A');
  const principalName = ctxSchoolProfile?.namaKepalaSekolah || externalReportData?.principalName || 'Nama Kepala Sekolah';
  const principalNip = ctxSchoolProfile?.nipKepalaSekolah || externalReportData?.principalNip || '-';

  const teacherName = resolvedSubject?.teacherName || resolvedWaliKelas?.nama || ctxSchoolProfile?.namaWaliKelas || externalReportData?.teacherName || 'Wali Kelas';
  const teacherNip = resolvedSubject ? '' : (resolvedWaliKelas?.nip || ctxSchoolProfile?.nipWaliKelas || externalReportData?.teacherNip || '-');
  const reportPlace = ctxSystemConfig?.reportPlace || externalReportData?.reportPlace || 'Jakarta';
  const reportDateOfficial = ctxSystemConfig?.reportDate || externalReportData?.reportDateOfficial || selectedDate;

  return (
    <div className="min-h-screen bg-slate-200/70 text-slate-900 antialiased print:bg-white print:p-0 font-sans">
      {/* Floating Top Action Bar (Non-Printable) */}
      <header className="print:hidden sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-300 shadow-xs px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            {onBackToApp && (
              <button
                type="button"
                onClick={onBackToApp}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                title="Kembali ke Pengaturan Laporan"
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
                {schoolName} • {isKepsekReport ? 'Supervisi Seluruh Rombel' : activeClassName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleShare}
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              title="Bagikan Tautan Smart Link Dokumen"
            >
              <Share2 size={15} />
              <span className="hidden sm:inline">Bagikan</span>
            </button>

            {/* Tombol biru Cetak / Unduh dengan teks persis "Cetak / Unduh" */}
            <button
              type="button"
              onClick={handlePrint}
              id="btn-cetak-unduh-smart-report"
              className="px-4 py-2 rounded-xl bg-[#1D82F5] hover:bg-blue-600 text-white text-xs font-black transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Printer size={15} />
              <span>Cetak / Unduh</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Printable Document Sheet (Exact Official A4 Layout) */}
      <main className="max-w-4xl mx-auto p-3 sm:p-6 md:p-8 print:p-0 print:max-w-none">
        <div
          id="printable-report"
          className="bg-white rounded-xl shadow-xl border border-slate-300 p-5 sm:p-8 md:p-12 font-serif text-slate-900 leading-normal print:p-4 print:shadow-none print:border-none print:rounded-none"
        >
          {/* 1. Formal Indonesian School Letterhead (Kop Surat) */}
          {showLetterhead && (
            <>
              {letterheadType === 'custom_image' && letterheadImageUrl ? (
                /* Custom Image Letterhead */
                <div className="kop-surat-a4-container w-full mb-5 pb-2 border-b-2 border-slate-900 break-inside-avoid print:mb-4 print:pb-1 flex justify-center items-center">
                  <img
                    src={letterheadImageUrl}
                    alt="Kop Surat Resmi Sekolah"
                    className="kop-surat-a4-img w-full max-w-full h-auto object-contain mx-auto block max-h-[140px] print:max-h-[155px]"
                  />
                </div>
              ) : (
                /* Standard Text Letterhead with School Logo & Double Lines */
                <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-6 pb-3 border-b-4 border-double border-slate-900 mb-6 text-center sm:text-left break-inside-avoid">
                  {schoolLogoUrl ? (
                    <div className="w-16 h-16 sm:w-[74px] sm:h-[74px] shrink-0 flex items-center justify-center">
                      <img
                        src={schoolLogoUrl}
                        alt="Logo Sekolah"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  ) : (
                    <SchoolLogo size={60} className="sm:w-[74px] sm:h-[74px] shrink-0" />
                  )}
                  <div className="flex-1 text-center font-sans">
                    <h4 className="text-[10px] sm:text-xs font-bold tracking-wider uppercase text-slate-700 leading-tight">
                      {pemerintahDaerah}
                    </h4>
                    <h4 className="text-[10px] sm:text-xs font-bold tracking-wider uppercase text-slate-700 leading-tight">
                      {dinasPendidikan}
                    </h4>
                    <h2 className="text-lg sm:text-2xl font-black tracking-tight text-slate-900 uppercase my-0.5">
                      {schoolName}
                    </h2>
                    <p className="text-[10px] sm:text-[11px] text-slate-600 font-normal">
                      {alamatSekolah}
                    </p>
                    <p className="text-[10px] sm:text-[11px] text-slate-600 font-semibold">
                      {isKepsekReport ? (
                        <>NPSN: {npsn} | TAHUN PELAJARAN: {academicYear} | KEPALA SEKOLAH: {principalName}</>
                      ) : (
                        <>NPSN: {npsn} | KELAS: {activeClassClean} | FASE: {activeFase.toUpperCase()}</>
                      )}
                    </p>
                  </div>
                  <div className="w-16 hidden sm:block" />
                </div>
              )}
            </>
          )}

          {/* 2. Official Report Title based on Selected Period */}
          <div className="text-center mb-5 sm:mb-6 font-sans">
            <h3 className="text-sm sm:text-lg font-extrabold uppercase underline tracking-wide">
              {isKepsekReport
                ? (isKepsekSemester ? 'LAPORAN REKAPITULASI KEHADIRAN SEMESTER' : 'LAPORAN REKAPITULASI KEHADIRAN BULANAN')
                : reportType === 'Laporan Harian'
                ? 'LAPORAN KEHADIRAN HARIAN SISWA'
                : reportType === 'Laporan Mingguan'
                ? 'LAPORAN KEHADIRAN MINGGUAN SISWA'
                : reportType === 'Laporan Bulanan'
                ? 'LAPORAN REKAPITULASI KEHADIRAN BULANAN'
                : 'LAPORAN REKAPITULASI KEHADIRAN SEMESTER'}
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-600 font-bold mt-1 uppercase">
              {isKepsekReport ? (
                isKepsekSemester
                  ? <>SEMESTER: {semester.toUpperCase()} | TAHUN PELAJARAN: {academicYear} (KOMPARASI SELURUH KELAS)</>
                  : <>BULAN: {month.toUpperCase()} {year} | SEMESTER: {semester.toUpperCase()} (KOMPARASI SELURUH KELAS)</>
              ) : reportType === 'Laporan Harian' ? (
                <>HARI/TANGGAL: {getDayNameIndo(selectedDate).toUpperCase()}, {formatReportDateIndo(selectedDate).toUpperCase()} | SEMESTER: {semester.toUpperCase()} (TP: {academicYear})</>
              ) : reportType === 'Laporan Mingguan' ? (
                <>PERIODE: {selectedWeek.toUpperCase()} ({month.toUpperCase()} {year}) | KELAS: {activeClassClean} (TP: {academicYear})</>
              ) : reportType === 'Laporan Bulanan' ? (
                <>BULAN: {month.toUpperCase()} {year} | SEMESTER: {semester.toUpperCase()} (TP: {academicYear})</>
              ) : (
                <>SEMESTER: {semester.toUpperCase()} | TAHUN PELAJARAN: {academicYear}</>
              )}
            </p>
          </div>

          {/* 3. School and Class Attributes Matrix */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 text-xs font-sans mb-4 border border-slate-200 p-3 rounded-lg bg-slate-50/50">
            <div>
              <p>
                <span className="font-semibold text-slate-600">Satuan Pendidikan:</span> {schoolName}
              </p>
              {isKepsekReport ? (
                <>
                  <p><span className="font-semibold text-slate-600">NPSN:</span> {npsn}</p>
                  <p><span className="font-semibold text-slate-600">Kepala Sekolah:</span> {principalName}</p>
                </>
              ) : (
                <>
                  <p><span className="font-semibold text-slate-600">Kelas / Fase:</span> {activeClassName} / {activeFase}</p>
                  {attendanceType === 'SUBJECT' ? (
                    <p>
                      <span className="font-semibold text-slate-600">Mata Pelajaran:</span>{' '}
                      <strong className="text-blue-900">{resolvedSubject?.name || 'Mata Pelajaran Khusus'}</strong>
                    </p>
                  ) : (
                    <p><span className="font-semibold text-slate-600">Wali Kelas:</span> {teacherName}</p>
                  )}
                </>
              )}
            </div>
            <div>
              <p>
                <span className="font-semibold text-slate-600">
                  {reportType === 'Laporan Harian' ? 'Tanggal Presensi:' : 'Periode Presensi:'}
                </span>{' '}
                {reportType === 'Laporan Harian' && formatReportDateIndo(selectedDate)}
                {reportType === 'Laporan Mingguan' && `${selectedWeek} (${month} ${year})`}
                {reportType === 'Laporan Bulanan' && `${month} ${year}`}
                {reportType === 'Laporan Semester' && `Semester ${semester} (${academicYear})`}
                {isKepsekReport && (isKepsekSemester ? `Semester ${semester} (${academicYear})` : `${month} ${year}`)}
              </p>
              <p>
                <span className="font-semibold text-slate-600">
                  {isKepsekReport ? 'Total Rombel:' : 'Total Siswa:'}
                </span>{' '}
                {isKepsekReport ? `${ctxClasses.length} Rombel` : `${targetStudents.length || externalReportData?.students?.length || 0} Siswa`}
              </p>
              <p>
                <span className="font-semibold text-slate-600">Tahun Pelajaran:</span> {academicYear}
              </p>
            </div>
          </div>

          {/* 4. TABEL PRESENSI (KOLOM TIDAK DIUBAH SAMA SEKALI - TETAP & DIPERTAHANKAN) */}

          {/* A. PREVIEW & CETAK: LAPORAN HARIAN */}
          {reportType === 'Laporan Harian' && (
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
                  {(isInternalUser ? dailyStudentRows : (externalReportData?.students || [])).map((s: any, idx: number) => (
                    <tr key={idx} className="border-b border-slate-300">
                      <td className="border border-slate-300 p-1 text-center font-semibold">{s.no || (idx + 1)}</td>
                      <td className="border border-slate-300 p-1 text-center font-mono">{s.nisn || '-'}</td>
                      <td className="border border-slate-300 p-1 font-semibold">{s.nama}</td>
                      <td className="border border-slate-300 p-1 text-center">{s.gender === 'Laki-laki' || s.gender === 'L' ? 'L' : 'P'}</td>
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
                      <td className="border border-slate-300 p-1 text-center font-mono text-[11px]">{s.timeIn || s.checkInTime || '-'}</td>
                      <td className="border border-slate-300 p-1 text-center font-mono text-[11px]">{s.timeOut || s.checkOutTime || '-'}</td>
                      <td className="border border-slate-300 p-1 text-slate-600 italic text-[11px]">{s.note || s.notes || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* B. PREVIEW & CETAK: LAPORAN MINGGUAN */}
          {reportType === 'Laporan Mingguan' && (
            <div className="overflow-x-auto mb-6 sm:mb-8">
              <table className="w-full text-left border-collapse border border-slate-400 text-xs font-sans min-w-[500px]">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-400 text-center font-bold">
                    <th className="border border-slate-400 p-1.5 w-8">NO</th>
                    <th className="border border-slate-400 p-1.5 w-24">NISN</th>
                    <th className="border border-slate-400 p-1.5 text-left">NAMA SISWA</th>
                    <th className="border border-slate-400 p-1.5 w-8">L/P</th>
                    {weekWorkingDays.map((d) => (
                      <th key={d.dateStr} className="border border-slate-400 p-1 text-center w-10 sm:w-12">
                        <div className="text-[9px]">{d.dayShort}</div>
                        <div className="text-[8px] text-slate-500 font-normal">{d.dayNum}</div>
                      </th>
                    ))}
                    <th className="border border-slate-400 p-1 w-8 text-emerald-800">H</th>
                    <th className="border border-slate-400 p-1 w-8 text-sky-800">S</th>
                    <th className="border border-slate-400 p-1 w-8 text-amber-800">I</th>
                    <th className="border border-slate-400 p-1 w-8 text-rose-800">A</th>
                    <th className="border border-slate-400 p-1.5 w-14">% HADIR</th>
                  </tr>
                </thead>
                <tbody>
                  {weeklyStudentRows.map((s, idx) => (
                    <tr key={s.id} className="border-b border-slate-300">
                      <td className="border border-slate-300 p-1 text-center font-semibold">{idx + 1}</td>
                      <td className="border border-slate-300 p-1 text-center font-mono">{s.nisn || '-'}</td>
                      <td className="border border-slate-300 p-1 font-semibold">{s.nama}</td>
                      <td className="border border-slate-300 p-1 text-center">{s.gender === 'Laki-laki' || s.gender === 'L' ? 'L' : 'P'}</td>
                      {weekWorkingDays.map((d) => {
                        const st = s.dayStatusMap[d.dateStr] || '-';
                        return (
                          <td key={d.dateStr} className="border border-slate-300 p-1 text-center font-bold text-[11px]">
                            <span
                              className={
                                st === 'H'
                                  ? 'text-emerald-700'
                                  : st === 'S'
                                  ? 'text-sky-700'
                                  : st === 'I'
                                  ? 'text-amber-700'
                                  : st === 'A'
                                  ? 'text-rose-700'
                                  : 'text-slate-300'
                              }
                            >
                              {st}
                            </span>
                          </td>
                        );
                      })}
                      <td className="border border-slate-300 p-1 text-center font-semibold text-emerald-800">{s.hadir}</td>
                      <td className="border border-slate-300 p-1 text-center font-semibold text-sky-800">{s.sakit}</td>
                      <td className="border border-slate-300 p-1 text-center font-semibold text-amber-800">{s.izin}</td>
                      <td className="border border-slate-300 p-1 text-center font-semibold text-rose-800">{s.alfa}</td>
                      <td className="border border-slate-300 p-1 text-center font-bold text-blue-900">{s.pct}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* C. PREVIEW & CETAK: LAPORAN BULANAN */}
          {reportType === 'Laporan Bulanan' && (
            <div className="overflow-x-auto mb-6 sm:mb-8">
              <table className="w-full text-left border-collapse border border-slate-400 text-xs font-sans min-w-[500px]">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-400 text-center font-bold">
                    <th className="border border-slate-400 p-1.5 w-8">NO</th>
                    <th className="border border-slate-400 p-1.5 w-28">NISN</th>
                    <th className="border border-slate-400 p-1.5 text-left">NAMA SISWA</th>
                    <th className="border border-slate-400 p-1.5 w-10">L/P</th>
                    <th className="border border-slate-400 p-1.5 w-16 text-emerald-800">HADIR</th>
                    <th className="border border-slate-400 p-1.5 w-16 text-sky-800">SAKIT</th>
                    <th className="border border-slate-400 p-1.5 w-16 text-amber-800">IZIN</th>
                    <th className="border border-slate-400 p-1.5 w-16 text-rose-800">ALFA</th>
                    <th className="border border-slate-400 p-1.5 w-20">% HADIR</th>
                  </tr>
                </thead>
                <tbody>
                  {monthlyStudentRows.map((s, idx) => (
                    <tr key={s.id} className="border-b border-slate-300">
                      <td className="border border-slate-300 p-1 text-center font-semibold">{idx + 1}</td>
                      <td className="border border-slate-300 p-1 text-center font-mono">{s.nisn || '-'}</td>
                      <td className="border border-slate-300 p-1 font-semibold">{s.nama}</td>
                      <td className="border border-slate-300 p-1 text-center">{s.gender === 'Laki-laki' || s.gender === 'L' ? 'L' : 'P'}</td>
                      <td className="border border-slate-300 p-1 text-center font-semibold text-emerald-800">{s.hadir}</td>
                      <td className="border border-slate-300 p-1 text-center font-semibold text-sky-800">{s.sakit}</td>
                      <td className="border border-slate-300 p-1 text-center font-semibold text-amber-800">{s.izin}</td>
                      <td className="border border-slate-300 p-1 text-center font-semibold text-rose-800">{s.alfa}</td>
                      <td className="border border-slate-300 p-1 text-center font-bold text-blue-900">{s.pct}%</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-100 font-bold border-t-2 border-slate-400">
                    <td colSpan={4} className="border border-slate-400 p-1.5 text-right uppercase">
                      TOTAL / RATA-RATA:
                    </td>
                    <td className="border border-slate-400 p-1.5 text-center text-emerald-900 font-extrabold">{monthlyTotalHadir}</td>
                    <td className="border border-slate-400 p-1.5 text-center text-sky-900 font-extrabold">{monthlyTotalSakit}</td>
                    <td className="border border-slate-400 p-1.5 text-center text-amber-900 font-extrabold">{monthlyTotalIzin}</td>
                    <td className="border border-slate-400 p-1.5 text-center text-rose-900 font-extrabold">{monthlyTotalAlfa}</td>
                    <td className="border border-slate-400 p-1.5 text-center text-blue-950 font-black">{formatPct(monthlyPctHadir)}%</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}

          {/* D. PREVIEW & CETAK: LAPORAN SEMESTER */}
          {reportType === 'Laporan Semester' && (
            <div className="overflow-x-auto mb-6 sm:mb-8">
              <table className="w-full text-left border-collapse border border-slate-400 text-xs font-sans min-w-[500px]">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-400 text-center font-bold">
                    <th className="border border-slate-400 p-1.5 w-8">NO</th>
                    <th className="border border-slate-400 p-1.5 w-24">NISN</th>
                    <th className="border border-slate-400 p-1.5 text-left">NAMA SISWA</th>
                    <th className="border border-slate-400 p-1.5 w-8">L/P</th>
                    <th className="border border-slate-400 p-1.5 w-12 text-emerald-800">H (HARI)</th>
                    <th className="border border-slate-400 p-1.5 w-12 text-sky-800">S (HARI)</th>
                    <th className="border border-slate-400 p-1.5 w-12 text-amber-800">I (HARI)</th>
                    <th className="border border-slate-400 p-1.5 w-12 text-rose-800">A (HARI)</th>
                    <th className="border border-slate-400 p-1.5 w-12">%H</th>
                    <th className="border border-slate-400 p-1.5 w-12">%S</th>
                    <th className="border border-slate-400 p-1.5 w-12">%I</th>
                    <th className="border border-slate-400 p-1.5 w-12">%A</th>
                    <th className="border border-slate-400 p-1.5 w-24">PREDIKAT</th>
                  </tr>
                </thead>
                <tbody>
                  {semesterStudentRows.map((s, idx) => (
                    <tr key={s.id} className="border-b border-slate-300">
                      <td className="border border-slate-300 p-1 text-center font-semibold">{idx + 1}</td>
                      <td className="border border-slate-300 p-1 text-center font-mono">{s.nisn || '-'}</td>
                      <td className="border border-slate-300 p-1 font-semibold">{s.nama}</td>
                      <td className="border border-slate-300 p-1 text-center">{s.gender === 'Laki-laki' || s.gender === 'L' ? 'L' : 'P'}</td>
                      <td className="border border-slate-300 p-1 text-center font-semibold text-emerald-800">{s.hadir}</td>
                      <td className="border border-slate-300 p-1 text-center font-semibold text-sky-800">{s.sakit}</td>
                      <td className="border border-slate-300 p-1 text-center font-semibold text-amber-800">{s.izin}</td>
                      <td className="border border-slate-300 p-1 text-center font-semibold text-rose-800">{s.alfa}</td>
                      <td className="border border-slate-300 p-1 text-center font-bold text-emerald-900">{s.pctHadir}%</td>
                      <td className="border border-slate-300 p-1 text-center text-sky-900">{s.pctSakit}%</td>
                      <td className="border border-slate-300 p-1 text-center text-amber-900">{s.pctIzin}%</td>
                      <td className="border border-slate-300 p-1 text-center text-rose-900">{s.pctAlfa}%</td>
                      <td className="border border-slate-300 p-1 text-center font-bold text-[11px]">{s.predicate}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-100 font-bold border-t-2 border-slate-400">
                    <td colSpan={4} className="border border-slate-400 p-1.5 text-right uppercase">
                      TOTAL / RATA-RATA:
                    </td>
                    <td className="border border-slate-400 p-1.5 text-center text-emerald-900 font-extrabold">{semesterTotalHadir}</td>
                    <td className="border border-slate-400 p-1.5 text-center text-sky-900 font-extrabold">{semesterTotalSakit}</td>
                    <td className="border border-slate-400 p-1.5 text-center text-amber-900 font-extrabold">{semesterTotalIzin}</td>
                    <td className="border border-slate-400 p-1.5 text-center text-rose-900 font-extrabold">{semesterTotalAlfa}</td>
                    <td className="border border-slate-400 p-1.5 text-center text-emerald-950 font-black">{formatPct(semesterPctHadir)}%</td>
                    <td className="border border-slate-400 p-1.5 text-center text-sky-950 font-black">{formatPct(semesterPctSakit)}%</td>
                    <td className="border border-slate-400 p-1.5 text-center text-amber-950 font-black">{formatPct(semesterPctIzin)}%</td>
                    <td className="border border-slate-400 p-1.5 text-center text-rose-950 font-black">{formatPct(semesterPctAlfa)}%</td>
                    <td className="border border-slate-400 p-1.5 text-center text-slate-500">-</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}

          {/* E. PREVIEW & CETAK: LAPORAN SUPERVISI KEPALA SEKOLAH */}
          {isKepsekReport && (
            <div className="overflow-x-auto mb-6 sm:mb-8">
              <table className="w-full text-left border-collapse border border-slate-400 text-xs font-sans min-w-[500px]">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-400 text-center font-bold">
                    <th className="border border-slate-400 p-1.5 w-8">NO</th>
                    <th className="border border-slate-400 p-1.5 w-20">KELAS</th>
                    <th className="border border-slate-400 p-1.5 w-12">FASE</th>
                    <th className="border border-slate-400 p-1.5 text-left">WALI KELAS</th>
                    <th className="border border-slate-400 p-1 w-8">L</th>
                    <th className="border border-slate-400 p-1 w-8">P</th>
                    <th className="border border-slate-400 p-1 w-10">TOTAL</th>
                    <th className="border border-slate-400 p-1.5 w-12 text-emerald-800">HADIR</th>
                    <th className="border border-slate-400 p-1.5 w-12 text-sky-800">SAKIT</th>
                    <th className="border border-slate-400 p-1.5 w-12 text-amber-800">IZIN</th>
                    <th className="border border-slate-400 p-1.5 w-12 text-rose-800">ALFA</th>
                    <th className="border border-slate-400 p-1.5 w-14">TOTAL REKAP</th>
                    <th className="border border-slate-400 p-1.5 w-16">% KEHADIRAN</th>
                    <th className="border border-slate-400 p-1.5 w-24">PREDIKAT</th>
                  </tr>
                </thead>
                <tbody>
                  {kepsekClassRows.map((c, idx) => (
                    <tr key={c.classId} className="border-b border-slate-300">
                      <td className="border border-slate-300 p-1 text-center font-semibold">{idx + 1}</td>
                      <td className="border border-slate-300 p-1 text-center font-bold">{c.className}</td>
                      <td className="border border-slate-300 p-1 text-center">{c.fase}</td>
                      <td className="border border-slate-300 p-1">{c.waliKelasName}</td>
                      <td className="border border-slate-300 p-1 text-center font-mono">{c.maleCount}</td>
                      <td className="border border-slate-300 p-1 text-center font-mono">{c.femaleCount}</td>
                      <td className="border border-slate-300 p-1 text-center font-bold font-mono">{c.totalStudents}</td>
                      <td className="border border-slate-300 p-1 text-center font-semibold text-emerald-800">{c.hadir}</td>
                      <td className="border border-slate-300 p-1 text-center font-semibold text-sky-800">{c.sakit}</td>
                      <td className="border border-slate-300 p-1 text-center font-semibold text-amber-800">{c.izin}</td>
                      <td className="border border-slate-300 p-1 text-center font-semibold text-rose-800">{c.alfa}</td>
                      <td className="border border-slate-300 p-1 text-center font-mono">{c.totalRecorded}</td>
                      <td className="border border-slate-300 p-1 text-center font-black text-blue-900">{c.pctHadir}%</td>
                      <td className="border border-slate-300 p-1 text-center font-bold text-[11px]">{c.predicate}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-100 font-bold border-t-2 border-slate-400">
                    <td colSpan={4} className="border border-slate-400 p-1.5 text-right uppercase">
                      TOTAL SEKOLAH:
                    </td>
                    <td className="border border-slate-400 p-1.5 text-center font-mono">{kepsekSchoolTotalMale}</td>
                    <td className="border border-slate-400 p-1.5 text-center font-mono">{kepsekSchoolTotalFemale}</td>
                    <td className="border border-slate-400 p-1.5 text-center font-mono text-blue-950 font-black">{kepsekSchoolTotalStudents}</td>
                    <td className="border border-slate-400 p-1.5 text-center text-emerald-900 font-extrabold">{kepsekSchoolTotalHadir}</td>
                    <td className="border border-slate-400 p-1.5 text-center text-sky-900 font-extrabold">{kepsekSchoolTotalSakit}</td>
                    <td className="border border-slate-400 p-1.5 text-center text-amber-900 font-extrabold">{kepsekSchoolTotalIzin}</td>
                    <td className="border border-slate-400 p-1.5 text-center text-rose-900 font-extrabold">{kepsekSchoolTotalAlfa}</td>
                    <td className="border border-slate-400 p-1.5 text-center font-mono">{kepsekSchoolTotalRecorded}</td>
                    <td className="border border-slate-400 p-1.5 text-center text-blue-950 font-black">{formatPct(kepsekSchoolPctHadir)}%</td>
                    <td className="border border-slate-400 p-1.5 text-center font-extrabold text-blue-950">{kepsekSchoolPredicate}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}

          {/* 5. Summary & Evaluation Box */}
          <div className="border border-slate-400 bg-slate-50/70 p-3.5 sm:p-4 rounded-lg font-sans mb-6 text-xs break-inside-avoid">
            <h4 className="font-bold text-slate-900 uppercase text-[11px] sm:text-xs mb-2 border-b border-slate-300 pb-1 flex items-center justify-between">
              <span>KESIMPULAN & RINGKASAN REKAPITULASI KEHADIRAN</span>
              <span className="text-[10px] text-slate-500 font-normal">
                {reportType === 'Laporan Harian' && `Tanggal: ${formatReportDateIndo(selectedDate)}`}
                {reportType === 'Laporan Mingguan' && `Periode: ${selectedWeek} (${month} ${year})`}
                {reportType === 'Laporan Bulanan' && `Bulan: ${month} ${year}`}
                {reportType === 'Laporan Semester' && `Semester: ${semester} (${academicYear})`}
                {isKepsekReport && (isKepsekSemester ? `Semester ${semester} (${academicYear})` : `Bulan ${month} ${year}`)}
              </span>
            </h4>

            {/* Metrics Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 text-center my-2.5">
              <div className="p-2.5 bg-emerald-50/90 border border-emerald-300 rounded-lg text-emerald-950">
                <span className="text-[10px] block font-bold uppercase text-emerald-700">Hadir (H)</span>
                <span className="text-lg sm:text-xl font-black text-emerald-800 tracking-tight">
                  {activeMetrics.pctHadir}%
                </span>
                <span className="block text-[9px] font-semibold text-emerald-600 uppercase">
                  Persentase Kehadiran
                </span>
              </div>
              <div className="p-2.5 bg-sky-50/90 border border-sky-300 rounded-lg text-sky-950">
                <span className="text-[10px] block font-bold uppercase text-sky-700">Sakit (S)</span>
                <span className="text-lg sm:text-xl font-black text-sky-800 tracking-tight">
                  {activeMetrics.pctSakit}%
                </span>
                <span className="block text-[9px] font-semibold text-sky-600 uppercase">
                  Persentase Sakit
                </span>
              </div>
              <div className="p-2.5 bg-amber-50/90 border border-amber-300 rounded-lg text-amber-950">
                <span className="text-[10px] block font-bold uppercase text-amber-700">Izin (I)</span>
                <span className="text-lg sm:text-xl font-black text-amber-800 tracking-tight">
                  {activeMetrics.pctIzin}%
                </span>
                <span className="block text-[9px] font-semibold text-amber-600 uppercase">
                  Persentase Izin
                </span>
              </div>
              <div className="p-2.5 bg-rose-50/90 border border-rose-300 rounded-lg text-rose-950">
                <span className="text-[10px] block font-bold uppercase text-rose-700">Alfa (A)</span>
                <span className="text-lg sm:text-xl font-black text-rose-800 tracking-tight">
                  {activeMetrics.pctAlfa}%
                </span>
                <span className="block text-[9px] font-semibold text-rose-600 uppercase">
                  Persentase Tanpa Keterangan
                </span>
              </div>
            </div>

            <div className="text-[11px] text-slate-700 pt-1.5 border-t border-slate-200 leading-relaxed">
              <p>
                <strong>Catatan Evaluasi:</strong> Tingkat kehadiran {isKepsekReport ? 'seluruh rombel sekolah' : `siswa ${activeClassName}`} pada periode ini tercatat sebesar{' '}
                <span className="font-extrabold text-blue-900 bg-blue-50 px-1 py-0.5 rounded border border-blue-200">
                  {activeMetrics.pctHadir}%
                </span>.
              </p>
            </div>
          </div>

          {/* 6. Lembar Pengesahan Tanda Tangan Resmi */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 text-xs font-sans pt-4 break-inside-avoid">
            <div className="text-center">
              <p>Mengetahui,</p>
              <p className="font-bold">Kepala {schoolName}</p>
              <div className="h-14 sm:h-20" />
              <p className="font-bold underline text-sm">{principalName}</p>
              <p className="text-slate-600 font-mono">
                {principalNip && principalNip !== '-' ? `NIP. ${principalNip}` : 'NIP. -'}
              </p>
            </div>

            <div className="text-center">
              <p>
                {reportPlace}, {formatReportDateIndo(reportDateOfficial)}
              </p>
              <p className="font-bold">
                {isKepsekReport
                  ? 'Koordinator Kurikulum / Tim Presensi'
                  : attendanceType === 'SUBJECT'
                  ? `Guru Mata Pelajaran ${resolvedSubject?.name || ''}`
                  : `Wali ${activeClassName}`}
              </p>
              <div className="h-14 sm:h-20" />
              <p className="font-bold underline text-sm">
                {isKepsekReport ? (ctxSchoolProfile?.namaWaliKelas || teacherName) : teacherName}
              </p>
              <p className="text-slate-600 font-mono">
                {teacherNip && teacherNip !== '-' ? `NIP. ${teacherNip}` : 'NIP. -'}
              </p>
            </div>
          </div>

          {/* 7. Footer Verifikasi Digital */}
          <div className="mt-10 pt-4 border-t border-slate-300 text-center text-[10px] text-slate-500 font-sans">
            Dokumen Rekapitulasi Presensi Resmi Terverifikasi • Diterbitkan oleh Sistem Kawacanaan Presensi
          </div>
        </div>
      </main>
    </div>
  );
};
