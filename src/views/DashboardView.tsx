import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { getUserRoleScope } from '../utils/userScope';
import { DashboardSkeleton } from '../components/DashboardSkeleton';
import {
  Users,
  Calendar,
  Building,
  Building2,
  UserCheck,
  ClipboardList,
  BarChart2,
  FileText,
  Settings,
  ArrowRight,
  TrendingUp,
  Percent,
  CalendarCheck,
  GraduationCap,
  BookOpen,
  Sparkles,
  Zap,
  ShieldCheck,
  Clock,
  Copy,
  Check,
  Key,
  User,
  Crown,
  Award,
  CheckCircle2,
  ChevronRight,
  ChevronDown,
  Printer,
} from 'lucide-react';

interface SummaryCache {
  scopedTotal: number;
  scopedMale: number;
  scopedFemale: number;
  usersCount: number;
  studentsCount: number;
  classesCount: number;
  guruKsCount: number;
  hadirCount: number;
  sakitCount: number;
  izinCount: number;
  alfaCount: number;
  recordTotal: number;
  hadirPercent: number;
  trendData: { day: string; count: number }[];
  timestamp: number;
  cachedDate?: string;
}

export const DashboardView: React.FC = () => {
  const {
    currentUser,
    activeWorkspace,
    users,
    classes,
    subjects,
    teachers,
    students,
    attendanceRecords,
    academicEvents,
    effectiveDaysConfig,
    getEffectiveDaysForMonth,
    setActiveView,
    schoolProfile,
    systemConfig,
    currentAttendanceDate,
    isDataLoading,
  } = useApp();

  const [copiedCode, setCopiedCode] = useState(false);
  const [trendPeriod, setTrendPeriod] = useState<'7' | '14' | '30'>('7');
  const [showTrendDropdown, setShowTrendDropdown] = useState(false);

  // Workspace cache key
  const cacheKey = `kawacanaan_summary_cache_${activeWorkspace?.workspaceId || currentUser?.schoolId || 'global'}`;

  // Read initial cache from localStorage to prevent zero-value flash
  const [cachedSummary, setCachedSummary] = useState<SummaryCache | null>(() => {
    try {
      const raw = localStorage.getItem(cacheKey);
      if (raw) return JSON.parse(raw);
    } catch (_) {}
    return null;
  });

  // Resolve user role scope (Wali Kelas, Guru Mapel, Admin, KS)
  const userScope = useMemo(
    () => getUserRoleScope(currentUser, classes, subjects, teachers),
    [currentUser, classes, subjects, teachers]
  );

  const isPersonalWorkspace = useMemo(() => {
    return (
      activeWorkspace?.workspaceType === 'personal' ||
      activeWorkspace?.workspaceType === 'individu' ||
      currentUser?.subscriptionPlan === 'guru_uji_coba' ||
      currentUser?.subscriptionPlan === 'teacher' ||
      currentUser?.subscriptionPlan === 'guru_pro' ||
      currentUser?.subscriptionPlan === 'mulai' ||
      currentUser?.subscriptionPlan === 'guru_gratis' ||
      (!currentUser?.schoolId && currentUser?.role !== 'SUPER_ADMIN')
    );
  }, [activeWorkspace?.workspaceType, currentUser?.subscriptionPlan, currentUser?.schoolId, currentUser?.role]);

  // Status role Admin Sekolah atau Kepala Sekolah di Ruang Kerja Sekolah
  const isSchoolAdminOrKS = useMemo(() => {
    if (isPersonalWorkspace) return false;
    const role = currentUser?.role;
    return (
      role === 'ADMIN' ||
      role === 'SUPER_ADMIN' ||
      role === 'SUPER ADMIN' ||
      role === 'KEPALA SEKOLAH' ||
      userScope.isAdmin ||
      userScope.isSuperAdmin ||
      userScope.isKepalaSekolah
    );
  }, [isPersonalWorkspace, currentUser?.role, userScope]);

  // Month & time calculation
  const now = useMemo(() => new Date(), []);
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const monthNames = useMemo(
    () => [
      'Januari',
      'Februari',
      'Maret',
      'April',
      'Mei',
      'Juni',
      'Juli',
      'Agustus',
      'September',
      'Oktober',
      'November',
      'Desember',
    ],
    []
  );
  const currentMonthName = monthNames[now.getMonth()];
  const effectiveDaysThisMonth = getEffectiveDaysForMonth(currentYear, currentMonth);

  // Scoped students calculation based on role
  // Untuk Admin Sekolah & Kepala Sekolah di Ruang Kerja Sekolah: akumulasi seluruh siswa dari semua kelas
  const scopedStudents = useMemo(() => {
    if (isSchoolAdminOrKS) {
      return students;
    }
    if (userScope.isWaliKelas) {
      if (userScope.assignedWaliClassId) {
        return students.filter((s) => s.classId === userScope.assignedWaliClassId);
      }
      if (currentUser?.classIds && currentUser.classIds.length > 0) {
        return students.filter((s) => currentUser.classIds?.includes(s.classId || ''));
      }
      return students;
    }
    if (userScope.isGuruMapel) {
      const accessibleClassIds = userScope.accessibleClasses.map((c) => c.id);
      if (accessibleClassIds.length > 0) {
        return students.filter((s) => accessibleClassIds.includes(s.classId || ''));
      }
      return [];
    }
    return students;
  }, [isSchoolAdminOrKS, userScope, students, currentUser]);

  const scopedStudentIds = useMemo(() => new Set(scopedStudents.map((s) => s.id)), [scopedStudents]);

  // Metrics for scoped students
  const scopedTotal = (isSchoolAdminOrKS ? students.length : scopedStudents.length) || cachedSummary?.scopedTotal || 0;
  const scopedMale = scopedStudents.filter((s) => s.gender === 'L').length || cachedSummary?.scopedMale || 0;
  const scopedFemale = scopedStudents.filter((s) => s.gender === 'P').length || cachedSummary?.scopedFemale || 0;

  // Tanggal hari berjalan (current running day) secara lokal
  const todayDate = useMemo(() => new Date(), []);
  const todayFormatted = useMemo(() => {
    const y = todayDate.getFullYear();
    const m = String(todayDate.getMonth() + 1).padStart(2, '0');
    const d = String(todayDate.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }, [todayDate]);

  const dayNamesIndo = useMemo(
    () => ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'],
    []
  );
  const monthShortIndo = useMemo(
    () => ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'],
    []
  );
  const currentDayName = useMemo(() => dayNamesIndo[todayDate.getDay()], [dayNamesIndo, todayDate]);

  const todayFormattedDisplay = useMemo(() => {
    return `${currentDayName}, ${todayDate.getDate()} ${
      monthShortIndo[todayDate.getMonth()]
    } ${todayDate.getFullYear()}`;
  }, [todayDate, currentDayName, monthShortIndo]);

  const isCacheValidForToday = cachedSummary?.cachedDate === todayFormatted;

  // Daftar kelas yang diajar Guru Mapel pada hari berjalan (today)
  const classesTaughtToday = useMemo(() => {
    if (!userScope.isGuruMapel) return [];

    const matchedClassIds = new Set<string>();
    const matchedClassNames = new Set<string>();
    let hasAnyScheduleConfigured = false;

    userScope.assignedSubjects.forEach((sub) => {
      // 1. Cek classSchedules spesifik per kelas
      if (sub.classSchedules && sub.classSchedules.length > 0) {
        sub.classSchedules.forEach((cs) => {
          if (cs.days && cs.days.length > 0) {
            hasAnyScheduleConfigured = true;
            if (cs.days.includes(currentDayName)) {
              if (cs.classId) matchedClassIds.add(cs.classId);
              if (cs.className) matchedClassNames.add(cs.className.trim().toLowerCase());
            }
          }
        });
      }

      // 2. Cek scheduleDays umum mapel
      if (sub.scheduleDays && sub.scheduleDays.length > 0) {
        hasAnyScheduleConfigured = true;
        if (sub.scheduleDays.includes(currentDayName)) {
          (sub.targetClassIds || []).forEach((cid) => matchedClassIds.add(cid));
          (sub.targetClassNames || []).forEach((cn) => matchedClassNames.add(cn.trim().toLowerCase()));
          // Jika targetClassIds belum spesifik tapi accessibleClasses ada
          if (
            (!sub.targetClassIds || sub.targetClassIds.length === 0) &&
            (!sub.targetClassNames || sub.targetClassNames.length === 0)
          ) {
            userScope.accessibleClasses.forEach((c) => matchedClassIds.add(c.id));
          }
        }
      }
    });

    // 3. Fallback: jika guru mapel memiliki rombel tetapi belum diatur konfigurasi hari jadwal sama sekali
    // Pada hari efektif Senin - Sabtu, anggap mengajar di rombel binaan mapel
    if (!hasAnyScheduleConfigured && currentDayName !== 'Minggu') {
      return userScope.accessibleClasses;
    }

    return userScope.accessibleClasses.filter(
      (c) => matchedClassIds.has(c.id) || matchedClassNames.has(c.name.trim().toLowerCase())
    );
  }, [userScope, currentDayName]);

  // Siswa dari kelas yang diajar hari ini (untuk perhitungan presensi status hari berjalan Guru Mapel)
  const todayTaughtStudents = useMemo(() => {
    if (!userScope.isGuruMapel) return scopedStudents;
    const taughtClassIds = new Set(classesTaughtToday.map((c) => c.id));
    return scopedStudents.filter((s) => taughtClassIds.has(s.classId || ''));
  }, [userScope.isGuruMapel, classesTaughtToday, scopedStudents]);

  const todayTaughtStudentIds = useMemo(
    () => new Set(todayTaughtStudents.map((s) => s.id)),
    [todayTaughtStudents]
  );

  const classesTaughtTodayLabel = useMemo(() => {
    if (!userScope.isGuruMapel) return '-';
    if (classesTaughtToday.length === 0) return 'Tidak Ada';
    if (classesTaughtToday.length === 1) return classesTaughtToday[0].name;
    if (classesTaughtToday.length === 2) {
      return classesTaughtToday.map((c) => c.name.replace(/^kelas\s*/i, '')).join(', ');
    }
    return `${classesTaughtToday.length} Kelas`;
  }, [userScope.isGuruMapel, classesTaughtToday]);

  const classesTaughtTodaySubtext = useMemo(() => {
    if (!userScope.isGuruMapel) return '';
    if (classesTaughtToday.length === 0) return `Tidak ada jadwal hari ${currentDayName}`;
    if (classesTaughtToday.length <= 2) return `Jadwal hari ${currentDayName}`;
    return classesTaughtToday.map((c) => c.name.replace(/^kelas\s*/i, '')).join(', ');
  }, [userScope.isGuruMapel, classesTaughtToday, currentDayName]);

  const mapelDiampuLabel = useMemo(() => {
    if (!userScope.isGuruMapel) return '-';
    if (userScope.assignedSubjects.length === 0) {
      return userScope.primarySubject?.name || 'Mata Pelajaran';
    }
    if (userScope.assignedSubjects.length === 1) {
      return userScope.assignedSubjects[0].name;
    }
    return userScope.assignedSubjects.map((s) => s.code || s.name).join(', ');
  }, [userScope.isGuruMapel, userScope.assignedSubjects, userScope.primarySubject]);

  const mapelDiampuSubtext = useMemo(() => {
    if (!userScope.isGuruMapel) return '';
    if (userScope.assignedSubjects.length <= 1) {
      const sub = userScope.assignedSubjects[0] || userScope.primarySubject;
      return sub?.code ? `Kode: ${sub.code} • Guru Mapel` : 'Mata Pelajaran Diampu';
    }
    return `${userScope.assignedSubjects.length} Mata Pelajaran Diampu`;
  }, [userScope.isGuruMapel, userScope.assignedSubjects, userScope.primarySubject]);

  // Today's attendance calculation (strictly following hari berjalan)
  // Untuk Admin Sekolah & Kepala Sekolah: mencakup akumulasi presensi semua kelas di sekolah tersebut
  const todayRecords = useMemo(() => {
    return attendanceRecords.filter((r) => {
      // Mengikuti hari berjalan secara akurat
      if (r.date !== todayFormatted) return false;

      if (isSchoolAdminOrKS) {
        // Akumulasi data absensi semua kelas di sekolah tersebut
        return true;
      }

      if (userScope.isWaliKelas) {
        return scopedStudentIds.has(r.studentId) && r.type !== 'SUBJECT';
      }
      if (userScope.isGuruMapel) {
        // Hanya siswa dari rombel/kelas yang diajar hari ini
        if (!todayTaughtStudentIds.has(r.studentId)) return false;

        const assignedSubjectIds = new Set(userScope.assignedSubjectIds);
        if (assignedSubjectIds.size > 0) {
          return (
            r.type === 'SUBJECT' &&
            r.subjectId &&
            assignedSubjectIds.has(r.subjectId)
          );
        }
        return r.type === 'SUBJECT';
      }
      return r.type !== 'SUBJECT';
    });
  }, [attendanceRecords, todayFormatted, isSchoolAdminOrKS, userScope, scopedStudentIds, todayTaughtStudentIds]);

  // Pemetaan status unik per siswa untuk hari berjalan (mencegah duplikasi perhitungan)
  // Prioritaskan presensi harian (DAILY) jika siswa juga memiliki record mapel (SUBJECT)
  const todayStudentStatusMap = useMemo(() => {
    const map = new Map<string, string>();
    const sorted = [...todayRecords].sort((a, b) => {
      if (a.type !== 'SUBJECT' && b.type === 'SUBJECT') return -1;
      if (a.type === 'SUBJECT' && b.type !== 'SUBJECT') return 1;
      return 0;
    });
    for (const r of sorted) {
      if (!map.has(r.studentId) && r.status) {
        map.set(r.studentId, r.status);
      }
    }
    return map;
  }, [todayRecords]);

  const hadirCount = useMemo(() => {
    let count = 0;
    for (const status of todayStudentStatusMap.values()) {
      if (status === 'Hadir') count++;
    }
    return count;
  }, [todayStudentStatusMap]);

  const sakitCount = useMemo(() => {
    let count = 0;
    for (const status of todayStudentStatusMap.values()) {
      if (status === 'Sakit') count++;
    }
    return count;
  }, [todayStudentStatusMap]);

  const izinCount = useMemo(() => {
    let count = 0;
    for (const status of todayStudentStatusMap.values()) {
      if (status === 'Izin') count++;
    }
    return count;
  }, [todayStudentStatusMap]);

  const alfaCount = useMemo(() => {
    let count = 0;
    for (const status of todayStudentStatusMap.values()) {
      if (status === 'Alfa') count++;
    }
    return count;
  }, [todayStudentStatusMap]);

  // Target total siswa yang harus diinput presensinya hari ini (untuk Guru Mapel disesuaikan dengan rombel yang diajarkan hari ini)
  const targetTotal = (isSchoolAdminOrKS ? students.length : userScope.isGuruMapel ? todayTaughtStudents.length : scopedTotal) || 0;

  // Jumlah siswa yang datanya telah di-input hari ini
  const totalInputted = todayStudentStatusMap.size;

  // Jumlah siswa yang belum di-input hari ini
  const totalBelumInput = Math.max(0, targetTotal - totalInputted);

  // Status kelengkapan penginputan presensi hari berjalan
  const isAttendanceInputtedToday = totalInputted > 0;
  const isAttendanceFullyInputted = targetTotal > 0 && totalInputted >= targetTotal;

  // Persentase data yang telah di-input
  const inputPercent = targetTotal > 0 ? Math.round((totalInputted / targetTotal) * 100) : 0;

  // Persentase kehadiran hari ini disesuaikan dengan data yang telah di-input atau belum di-input:
  // - Jika belum di-input sama sekali -> 0%
  // - Jika sudah di-input -> (Hadir / Target Total Siswa) * 100
  const hadirPercent = targetTotal > 0 ? Math.round((hadirCount / targetTotal) * 100) : 0;
  const hadirPercentOfInputted = totalInputted > 0 ? Math.round((hadirCount / totalInputted) * 100) : 0;

  // 7-day trend data (Sab, Min, Sen, Sel, Rab, Kam, Jum)
  // Untuk Admin Sekolah & Kepala Sekolah: mengakumulasi seluruh data kehadiran dari semua kelas di sekolah
  const dayNames = useMemo(() => ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'], []);
  const trendData = useMemo(() => {
    if (attendanceRecords.length === 0 && cachedSummary?.trendData && isCacheValidForToday) {
      return cachedSummary.trendData;
    }
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const dy = d.getFullYear();
      const dm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const dStr = `${dy}-${dm}-${dd}`;

      if (isSchoolAdminOrKS) {
        // Akumulasi data absensi semua kelas di sekolah tersebut
        const dayMap = new Map<string, string>();
        const dayRecs = attendanceRecords.filter((r) => r.date === dStr);
        const sortedDayRecs = [...dayRecs].sort((a, b) => {
          if (a.type !== 'SUBJECT' && b.type === 'SUBJECT') return -1;
          if (a.type === 'SUBJECT' && b.type !== 'SUBJECT') return 1;
          return 0;
        });
        for (const r of sortedDayRecs) {
          if (!dayMap.has(r.studentId) && r.status) {
            dayMap.set(r.studentId, r.status);
          }
        }
        let hCount = 0;
        for (const status of dayMap.values()) {
          if (status === 'Hadir') hCount++;
        }
        return {
          day: dayNames[d.getDay()],
          count: hCount,
        };
      }

      const recs = attendanceRecords.filter((r) => {
        if (r.date !== dStr) return false;
        if (userScope.isWaliKelas) {
          return scopedStudentIds.has(r.studentId) && r.type !== 'SUBJECT';
        }
        if (userScope.isGuruMapel) {
          const assignedSubjectIds = new Set(userScope.assignedSubjectIds);
          if (assignedSubjectIds.size > 0) {
            return (
              scopedStudentIds.has(r.studentId) &&
              r.type === 'SUBJECT' &&
              r.subjectId &&
              assignedSubjectIds.has(r.subjectId)
            );
          }
          return scopedStudentIds.has(r.studentId) && r.type === 'SUBJECT';
        }
        return r.type !== 'SUBJECT';
      });
      const hCount = recs.filter((r) => r.status === 'Hadir').length;
      return {
        day: dayNames[d.getDay()],
        count: hCount,
      };
    });
  }, [attendanceRecords, cachedSummary?.trendData, isCacheValidForToday, dayNames, isSchoolAdminOrKS, userScope, scopedStudentIds]);

  // Save calculated summary to localStorage cache for lightning-fast next load
  useEffect(() => {
    if (!isDataLoading && (students.length > 0 || users.length > 0 || classes.length > 0)) {
      const summaryToCache: SummaryCache = {
        scopedTotal,
        scopedMale,
        scopedFemale,
        usersCount: users.length,
        studentsCount: students.length,
        classesCount: classes.length,
        guruKsCount: users.filter(
          (u) =>
            u.role === 'GURU MAPEL' ||
            u.role === 'WALI KELAS' ||
            u.role === 'KEPALA SEKOLAH'
        ).length,
        hadirCount,
        sakitCount,
        izinCount,
        alfaCount,
        recordTotal: targetTotal,
        hadirPercent,
        trendData,
        timestamp: Date.now(),
        cachedDate: todayFormatted,
      };
      try {
        localStorage.setItem(cacheKey, JSON.stringify(summaryToCache));
      } catch (_) {}
    }
  }, [
    isDataLoading,
    cacheKey,
    scopedTotal,
    scopedMale,
    scopedFemale,
    users,
    students,
    classes,
    hadirCount,
    sakitCount,
    izinCount,
    alfaCount,
    targetTotal,
    hadirPercent,
    trendData,
    todayFormatted,
  ]);

  // Agenda Mendatang: hanya untuk bulan berjalan dan tanggal yang belum terlewat (>= tanggal hari ini)
  const upcomingEvents = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = String(now.getMonth() + 1).padStart(2, '0');
    const currentDay = String(now.getDate()).padStart(2, '0');
    const todayFormatted = `${currentYear}-${currentMonth}-${currentDay}`;
    const currentMonthPrefix = `${currentYear}-${currentMonth}`;

    return academicEvents
      .filter((e) => {
        if (!e.date) return false;
        // Hanya untuk bulan berjalan
        const inCurrentMonth = e.date.startsWith(currentMonthPrefix);
        // Tanggal yang belum terlewat (>= tanggal hari ini)
        const isUpcomingOrToday = e.date >= todayFormatted;
        return inCurrentMonth && isUpcomingOrToday;
      })
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [academicEvents]);

  const menuItems = [
    {
      id: 'data-referensi',
      title: 'Data Referensi',
      desc: 'Sekolah, Guru, Siswa & Kelas',
      icon: Building,
      color: 'text-blue-600',
      bg: 'bg-blue-50 border border-blue-100',
    },
    {
      id: 'data-pengguna',
      title: 'Data Pengguna',
      desc: 'Hak Akses & Akun Sistem',
      icon: UserCheck,
      color: 'text-blue-600',
      bg: 'bg-blue-50 border border-blue-100',
    },
    {
      id: 'kalender-akademik',
      title: 'Kalender Akademik',
      desc: 'Agenda & Hari Efektif',
      icon: Calendar,
      color: 'text-blue-600',
      bg: 'bg-blue-50 border border-blue-100',
    },
    {
      id: 'absensi',
      title: 'Absensi Siswa',
      desc: userScope.assignedWaliClassName
        ? `Presensi Kelas ${userScope.assignedWaliClassName}`
        : userScope.primarySubject?.name
        ? `Presensi Mapel ${userScope.primarySubject.name}`
        : 'Presensi & Validasi Harian',
      icon: ClipboardList,
      color: 'text-blue-600',
      bg: 'bg-blue-50 border border-blue-100',
    },
    {
      id: 'rekapitulasi',
      title: 'Rekapitulasi',
      desc: 'Statistik & Matriks Bulanan',
      icon: BarChart2,
      color: 'text-blue-600',
      bg: 'bg-blue-50 border border-blue-100',
    },
    {
      id: 'laporan',
      title: userScope.isKepalaSekolah ? 'Laporan Kepala Sekolah' : 'Laporan',
      desc: userScope.isKepalaSekolah
        ? 'Rekap Bulanan, Semester & Tahunan'
        : 'Cetak & Ekspor Dokumen',
      icon: FileText,
      color: 'text-blue-600',
      bg: 'bg-blue-50 border border-blue-100',
    },
    {
      id: 'pengaturan',
      title: 'Pengaturan Sistem',
      desc: 'Konfigurasi & Jam Real-Time',
      icon: Settings,
      color: 'text-blue-600',
      bg: 'bg-blue-50 border border-blue-100',
    },
  ] as const;

  const allowedMenuItems = useMemo(() => {
    return menuItems.filter((item) => {
      if (!currentUser) return false;
      if (currentUser.role === 'ADMIN' || currentUser.role === 'SUPER_ADMIN') return true;

      // Aturan menu 'data-pengguna' (Data Pengguna & Hak Akses):
      if (item.id === 'data-pengguna') {
        // Ruang kerja individu: munculkan di dashboard untuk semua pendidik/pengguna
        if (isPersonalWorkspace) return true;
        // Ruang kerja sekolah: hanya muncul di role admin dan super admin
        return currentUser.role === 'ADMIN' || currentUser.role === 'SUPER_ADMIN';
      }

      // Aturan menu 'pengaturan' (Pengaturan Sistem):
      if (item.id === 'pengaturan') {
        // Ruang kerja individu: tetap pertahankan di dashboard untuk semua pengguna
        if (isPersonalWorkspace) return true;
        // Ruang kerja sekolah: hanya muncul di role admin dan kepala sekolah, sembunyikan pada wali kelas dan guru mapel
        return currentUser.role === 'KEPALA SEKOLAH';
      }

      if (currentUser.role === 'WALI KELAS') {
        return [
          'data-referensi',
          'kalender-akademik',
          'absensi',
          'rekapitulasi',
          'laporan',
        ].includes(item.id);
      }
      if (
        currentUser.role === 'GURU MAPEL'
      ) {
        return [
          'data-referensi',
          'kalender-akademik',
          'absensi',
          'rekapitulasi',
          'laporan',
        ].includes(item.id);
      }
      if (currentUser.role === 'KEPALA SEKOLAH') {
        return ['data-referensi', 'kalender-akademik', 'rekapitulasi', 'laporan', 'pengaturan'].includes(
          item.id
        );
      }
      return false;
    });
  }, [currentUser, menuItems, isPersonalWorkspace]);

  // Role-specific widgets definition
  const isWaliKelas = userScope.isWaliKelas || currentUser?.role === 'WALI KELAS';
  const isTeacherOrWali = isWaliKelas || userScope.isGuruMapel;

  const toneClasses: Record<string, string> = {
    blue: 'bg-blue-50 border-blue-100 text-blue-600',
    emerald: 'bg-emerald-50 border-emerald-100 text-emerald-600',
    violet: 'bg-violet-50 border-violet-100 text-violet-600',
    sky: 'bg-sky-50 border-sky-100 text-sky-600',
    amber: 'bg-amber-50 border-amber-100 text-amber-600',
  };

  const usersCountDisplay = users.length || cachedSummary?.usersCount || 0;
  const studentsCountDisplay = students.length || cachedSummary?.studentsCount || 0;
  const classesCountDisplay = classes.length || cachedSummary?.classesCount || 0;
  const guruKsCountDisplay =
    users.filter(
      (u) =>
        u.role === 'GURU MAPEL' ||
        u.role === 'WALI KELAS' ||
        u.role === 'GURU MAPEL' ||
        u.role === 'KEPALA SEKOLAH'
    ).length || cachedSummary?.guruKsCount || 0;

  // Show Skeleton Loader if data is completely empty and currently loading
  const isInitialEmptyLoad = isDataLoading && !cachedSummary && students.length === 0 && users.length === 0;

  if (!currentUser) {
    return <DashboardSkeleton isTeacherOrWali={isTeacherOrWali} />;
  }

  if (isInitialEmptyLoad) {
    return <DashboardSkeleton isTeacherOrWali={isTeacherOrWali} />;
  }

  return (
    <div className="w-full max-w-7xl 2xl:max-w-[1560px] mx-auto px-3 sm:px-5 lg:px-6 py-2.5 sm:py-3.5 space-y-3 sm:space-y-3.5 animate-in fade-in duration-200">
      
      {/* 1. Spanduk Hero (Matching Uploaded Mockup) */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-sky-100/90 shadow-xs bg-gradient-to-r from-[#EFF6FF] via-[#F8FAFC] to-[#EFF6FF] flex flex-col md:flex-row items-stretch justify-between min-h-[135px] sm:min-h-[145px] lg:min-h-[140px]">
        {/* Left: Greeting Pill + Title + Subtitle */}
        <div className="p-4 sm:p-5 lg:p-5.5 flex-1 z-10 flex flex-col justify-center space-y-1.5 sm:space-y-2">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-600 border border-blue-200/80 shadow-2xs">
              <span className="text-sm">👋</span>
              <span>Selamat Datang</span>
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 tracking-tight leading-tight">
            Di Panel Kontrol Utama
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 font-medium max-w-xl leading-relaxed">
            {isPersonalWorkspace
              ? 'Kelola data kehadiran kelas binaan, monitoring jadwal mengajar, dan rekapitulasi mandiri dengan lebih mudah, cepat dan akurat.'
              : userScope.isWaliKelas
              ? `Kelola data kehadiran siswa kelas ${userScope.assignedWaliClassName || 'binaan'}, monitoring kehadiran harian, dan laporan dengan lebih mudah, cepat dan akurat.`
              : userScope.isGuruMapel
              ? `Kelola presensi mata pelajaran ${userScope.primarySubject?.name || 'diampu'} (${userScope.accessibleClasses.length} rombel) dengan lebih mudah, cepat dan akurat.`
              : 'Kelola data kehadiran siswa, monitoring kelas, dan laporan dengan lebih mudah, cepat dan akurat.'}
          </p>
        </div>

        {/* Center / Right: School Building Photography + Curved Blue Slogan */}
        <div className="relative flex items-center justify-end shrink-0 md:w-[48%] lg:w-[50%] overflow-hidden min-h-[100px] md:min-h-auto">
          {/* Panoramic School Building Photography */}
          <div className="absolute inset-0 z-0">
            <img
              src="/images/school_building_banner.jpg"
              alt="Gedung Sekolah"
              className="w-full h-full object-cover object-center"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/images/hero_school_3d.jpg';
              }}
            />
            {/* Smooth gradient blend overlay on the left so it dissolves seamlessly into the sky background */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#EFF6FF] via-[#EFF6FF]/60 to-transparent w-2/5" />
          </div>

          {/* Far Right: Curved Royal Blue Shape with Slogan */}
          <div className="relative z-10 h-full flex items-center justify-center bg-gradient-to-br from-[#0066FF] via-[#0052CC] to-[#00388F] text-white px-5 sm:px-7 py-3 sm:py-5 rounded-l-[36px] sm:rounded-l-[52px] shadow-lg ml-auto min-w-[190px] sm:min-w-[240px] text-right">
            <div className="flex flex-col items-end">
              <span className="text-xs sm:text-sm lg:text-base font-extrabold text-white tracking-wide leading-tight drop-shadow-xs">
                Disiplin Hari Ini
              </span>
              <span className="text-xs sm:text-sm lg:text-base font-extrabold text-white tracking-wide border-b-2 border-white pb-0.5 mt-0.5 drop-shadow-xs">
                Prestasi Esok Nanti
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Four Stat Cards (Row of 4 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-3.5">
        {/* Card 1: Jumlah Siswa */}
        <div
          onClick={() => setActiveView('data-referensi')}
          className="bg-white rounded-2xl p-4 sm:p-4.5 border border-slate-200/90 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-2xs">
              <Users size={22} className="stroke-[2.2]" />
            </div>
            <ArrowRight size={16} className="text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
          </div>

          <div className="my-2.5">
            <p className="text-xs font-semibold text-slate-500">Jumlah Siswa</p>
            <p className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight my-0.5">
              {scopedTotal}
            </p>
            <p className="text-[11px] text-slate-500 font-semibold truncate">
              {isSchoolAdminOrKS
                ? `Total Seluruh Siswa (${classes.length} Rombel)`
                : userScope.isWaliKelas
                ? `Kelas ${userScope.assignedWaliClassName || '6A'}`
                : userScope.isGuruMapel
                ? `${userScope.accessibleClasses.length} Kelas Diajar`
                : 'Total Siswa Binaan'}
            </p>
          </div>

          <div>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100/80">
              <span>↑</span>
              <span>+2 dari bulan lalu</span>
            </span>
          </div>
        </div>

        {/* Card 2: Siswa Laki-Laki */}
        <div
          onClick={() => setActiveView('data-referensi')}
          className="bg-white rounded-2xl p-4 sm:p-4.5 border border-slate-200/90 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-teal-50 text-teal-600 border border-teal-100 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-2xs">
              <UserCheck size={22} className="stroke-[2.2]" />
            </div>
            <ArrowRight size={16} className="text-slate-300 group-hover:text-teal-600 group-hover:translate-x-0.5 transition-all" />
          </div>

          <div className="my-2.5">
            <p className="text-xs font-semibold text-slate-500">Siswa Laki-Laki</p>
            <p className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight my-0.5">
              {scopedMale}
            </p>
            <p className="text-[11px] text-slate-500 font-semibold">Siswa putra (L)</p>
          </div>

          <div>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-100/80">
              <span>↑</span>
              <span>{scopedTotal > 0 ? Math.round((scopedMale / scopedTotal) * 100) : 0}% dari total</span>
            </span>
          </div>
        </div>

        {/* Card 3: Siswa Perempuan */}
        <div
          onClick={() => setActiveView('data-referensi')}
          className="bg-white rounded-2xl p-4 sm:p-4.5 border border-slate-200/90 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-pink-50 text-pink-600 border border-pink-100 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-2xs">
              <User size={22} className="stroke-[2.2]" />
            </div>
            <ArrowRight size={16} className="text-slate-300 group-hover:text-pink-600 group-hover:translate-x-0.5 transition-all" />
          </div>

          <div className="my-2.5">
            <p className="text-xs font-semibold text-slate-500">Siswa Perempuan</p>
            <p className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight my-0.5">
              {scopedFemale}
            </p>
            <p className="text-[11px] text-slate-500 font-semibold">Siswa putri (P)</p>
          </div>

          <div>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-pink-700 bg-pink-50 px-2.5 py-0.5 rounded-full border border-pink-100/80">
              <span>↑</span>
              <span>{scopedTotal > 0 ? Math.round((scopedFemale / scopedTotal) * 100) : 0}% dari total</span>
            </span>
          </div>
        </div>

        {/* Card 4: Hari Efektif Belajar */}
        <div
          onClick={() => setActiveView('kalender-akademik')}
          className="bg-white rounded-2xl p-4 sm:p-4.5 border border-slate-200/90 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-2xs">
              <Calendar size={22} className="stroke-[2.2]" />
            </div>
            <ArrowRight size={16} className="text-slate-300 group-hover:text-amber-600 group-hover:translate-x-0.5 transition-all" />
          </div>

          <div className="my-2.5">
            <p className="text-xs font-semibold text-slate-500">Hari Efektif Belajar</p>
            <p className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight my-0.5">
              {effectiveDaysThisMonth} Hari
            </p>
            <p className="text-[11px] text-slate-500 font-semibold truncate">
              Bulan {currentMonthName} (Aktif)
            </p>
          </div>

          <div>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-100/80">
              <span>📅</span>
              <span>+2 hari dari target</span>
            </span>
          </div>
        </div>
      </div>

      {/* 3. Middle Section: Tren Kehadiran (8 Cols) + Status Hari Ini (4 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-3.5">
        
        {/* Left: Tren Kehadiran Card (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-xs flex flex-col justify-between">
          {/* Header */}
          <div className="flex items-center justify-between pb-2 mb-1 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <TrendingUp size={16} />
              </div>
              <h2 className="font-bold text-slate-900 text-xs sm:text-sm">
                Tren Kehadiran {userScope.isWaliKelas ? `Kelas ${userScope.assignedWaliClassName || '6A'}` : userScope.isGuruMapel ? `Mapel ${userScope.primarySubject?.name || ''}` : isSchoolAdminOrKS ? 'Semua Kelas' : 'Kelas'} ({trendPeriod} Hari)
              </h2>
            </div>

            {/* Filter Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowTrendDropdown(!showTrendDropdown)}
                className="px-3 py-1 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 inline-flex items-center gap-1.5 transition-colors cursor-pointer select-none"
              >
                <span>{trendPeriod} Hari Terakhir</span>
                <ChevronDown size={12} className="text-slate-400" />
              </button>
              {showTrendDropdown && (
                <div className="absolute right-0 top-full mt-1.5 w-36 bg-white rounded-xl shadow-lg border border-slate-200 py-1 z-30 animate-in fade-in zoom-in-95 duration-100 text-left">
                  {(['7', '14', '30'] as const).map((period) => (
                    <button
                      key={period}
                      type="button"
                      onClick={() => {
                        setTrendPeriod(period);
                        setShowTrendDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 text-xs font-semibold hover:bg-blue-50 hover:text-blue-600 transition-colors ${
                        trendPeriod === period ? 'text-blue-600 font-bold bg-blue-50/50' : 'text-slate-700'
                      }`}
                    >
                      {period} Hari Terakhir
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Chart Body: Left (60-65% Line Chart) + Right (35-40% Donut Ring Gauge) */}
          <div className="flex flex-col sm:flex-row items-center gap-4 my-2">
            {/* 65% Line Chart */}
            <div className="w-full sm:w-[62%] h-40 sm:h-44 relative">
              <svg viewBox="0 0 460 170" className="w-full h-full overflow-visible">
                <defs>
                  <linearGradient id="trendBlueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2563EB" stopOpacity="0.20" />
                    <stop offset="100%" stopColor="#2563EB" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* 5 Horizontal Dotted Gridlines & Y-axis numbers */}
                {(() => {
                  const maxVal = Math.max((isSchoolAdminOrKS ? students.length : scopedTotal) || 23, 10);
                  const stepValues = [
                    maxVal,
                    Math.round(maxVal * 0.75),
                    Math.round(maxVal * 0.5),
                    Math.round(maxVal * 0.25),
                    0,
                  ];
                  return stepValues.map((val, idx) => {
                    const y = 15 + idx * 30;
                    return (
                      <g key={idx}>
                        <line x1="28" y1={y} x2="450" y2={y} stroke="#E2E8F0" strokeWidth="1" strokeDasharray="3 3" />
                        <text x="22" y={y + 3.5} textAnchor="end" fontSize="10" fill="#94A3B8" fontWeight="600">
                          {val}
                        </text>
                      </g>
                    );
                  });
                })()}

                {/* Smooth Connected Line and Filled Area */}
                {(() => {
                  const maxVal = Math.max((isSchoolAdminOrKS ? students.length : scopedTotal) || 23, 10);
                  const countPoints = trendData.length;
                  const stepX = (450 - 35) / Math.max(countPoints - 1, 1);
                  const points = trendData.map((item, idx) => {
                    const x = 35 + idx * stepX;
                    const ratio = Math.min(Math.max(item.count / maxVal, 0), 1);
                    const y = 135 - ratio * 120;
                    return { x, y };
                  });

                  const linePath = points.reduce((acc, pt, idx) => {
                    return idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
                  }, '');

                  const areaPath = `${linePath} L ${points[points.length - 1].x} 135 L ${points[0].x} 135 Z`;

                  return (
                    <>
                      <path d={areaPath} fill="url(#trendBlueGradient)" />
                      <path d={linePath} fill="none" stroke="#2563EB" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      {points.map((pt, idx) => (
                        <circle key={idx} cx={pt.x} cy={pt.y} r="4" className="fill-blue-600 stroke-white stroke-2 shadow-sm">
                          <title>{`${trendData[idx]?.day}: ${trendData[idx]?.count} Siswa Hadir`}</title>
                        </circle>
                      ))}
                    </>
                  );
                })()}

                {/* X-axis Day labels */}
                {(() => {
                  const countPoints = trendData.length;
                  const stepX = (450 - 35) / Math.max(countPoints - 1, 1);
                  return trendData.map((item, idx) => {
                    const x = 35 + idx * stepX;
                    return (
                      <text key={item.day} x={x} y="158" textAnchor="middle" fontSize="11" fill="#64748B" fontWeight="600">
                        {item.day}
                      </text>
                    );
                  });
                })()}
              </svg>
            </div>

            {/* 38% Donut Ring Gauge */}
            <div className="w-full sm:w-[38%] flex flex-col items-center justify-center shrink-0">
              <div className="relative w-32 h-32 sm:w-34 sm:h-34 flex items-center justify-center">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  {/* Track */}
                  <circle cx="50" cy="50" r="38" fill="none" stroke="#F1F5F9" strokeWidth="12" />

                  {/* Hadir (Emerald Green) */}
                  {hadirCount > 0 && (
                    <circle
                      cx="50"
                      cy="50"
                      r="38"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="12"
                      strokeDasharray={`${(hadirCount / Math.max(targetTotal, 1)) * 238.76} 238.76`}
                      strokeDashoffset="0"
                      strokeLinecap="round"
                    />
                  )}

                  {/* Sakit (Sky Blue) */}
                  {sakitCount > 0 && (
                    <circle
                      cx="50"
                      cy="50"
                      r="38"
                      fill="none"
                      stroke="#38bdf8"
                      strokeWidth="12"
                      strokeDasharray={`${(sakitCount / Math.max(targetTotal, 1)) * 238.76} 238.76`}
                      strokeDashoffset={`-${(hadirCount / Math.max(targetTotal, 1)) * 238.76}`}
                    />
                  )}

                  {/* Izin (Amber Yellow) */}
                  {izinCount > 0 && (
                    <circle
                      cx="50"
                      cy="50"
                      r="38"
                      fill="none"
                      stroke="#fbbf24"
                      strokeWidth="12"
                      strokeDasharray={`${(izinCount / Math.max(targetTotal, 1)) * 238.76} 238.76`}
                      strokeDashoffset={`-${((hadirCount + sakitCount) / Math.max(targetTotal, 1)) * 238.76}`}
                    />
                  )}

                  {/* Alfa (Rose Red) */}
                  {alfaCount > 0 && (
                    <circle
                      cx="50"
                      cy="50"
                      r="38"
                      fill="none"
                      stroke="#f43f5e"
                      strokeWidth="12"
                      strokeDasharray={`${(alfaCount / Math.max(targetTotal, 1)) * 238.76} 238.76`}
                      strokeDashoffset={`-${((hadirCount + sakitCount + izinCount) / Math.max(targetTotal, 1)) * 238.76}`}
                    />
                  )}
                </svg>

                {/* Center Percentage & Label */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-none">
                    {hadirPercent}%
                  </span>
                  <span className="text-[10px] font-extrabold text-slate-500 tracking-widest uppercase mt-1">
                    HADIR
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Legend */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2 border-t border-slate-100 text-xs font-semibold">
            <div className="flex items-center gap-1.5 text-slate-700">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
              <span>Hadir ({hadirCount})</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-700">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-400 shrink-0" />
              <span>Sakit ({sakitCount})</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-700">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0" />
              <span>Izin ({izinCount})</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-700">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
              <span>Alfa ({alfaCount})</span>
            </div>
          </div>
        </div>

        {/* Right: Status Hari Ini Card (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-xs flex flex-col justify-between">
          {/* Header */}
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Clock size={20} className="stroke-[2.2]" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Status Hari Ini</h3>
                <p className="text-[11px] font-medium text-slate-500">{todayFormattedDisplay}</p>
              </div>
            </div>
            <button
              onClick={() => setActiveView('absensi')}
              title="Ke Halaman Presensi"
              className="text-slate-400 hover:text-blue-600 transition-colors p-1"
            >
              <ArrowRight size={17} />
            </button>
          </div>

          {/* 4 Status Rows */}
          <div className="space-y-2 my-auto">
            {/* Row 1: Hadir */}
            <div
              onClick={() => setActiveView('absensi')}
              className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/70 hover:bg-emerald-50/60 border border-slate-100 transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <UserCheck size={16} className="stroke-[2.2]" />
                </div>
                <span className="text-xs font-semibold text-slate-800 group-hover:text-emerald-700 transition-colors">
                  Hadir
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-extrabold text-slate-900">{hadirCount}</span>
                <ChevronRight size={14} className="text-slate-300 group-hover:text-emerald-600 transition-colors" />
              </div>
            </div>

            {/* Row 2: Sakit */}
            <div
              onClick={() => setActiveView('absensi')}
              className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/70 hover:bg-sky-50/60 border border-slate-100 transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                  <UserCheck size={16} className="stroke-[2.2]" />
                </div>
                <span className="text-xs font-semibold text-slate-800 group-hover:text-sky-700 transition-colors">
                  Sakit
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-extrabold text-slate-900">{sakitCount}</span>
                <ChevronRight size={14} className="text-slate-300 group-hover:text-sky-600 transition-colors" />
              </div>
            </div>

            {/* Row 3: Izin */}
            <div
              onClick={() => setActiveView('absensi')}
              className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/70 hover:bg-amber-50/60 border border-slate-100 transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <UserCheck size={16} className="stroke-[2.2]" />
                </div>
                <span className="text-xs font-semibold text-slate-800 group-hover:text-amber-700 transition-colors">
                  Izin
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-extrabold text-slate-900">{izinCount}</span>
                <ChevronRight size={14} className="text-slate-300 group-hover:text-amber-600 transition-colors" />
              </div>
            </div>

            {/* Row 4: Alfa */}
            <div
              onClick={() => setActiveView('absensi')}
              className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/70 hover:bg-rose-50/60 border border-slate-100 transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                  <UserCheck size={16} className="stroke-[2.2]" />
                </div>
                <span className="text-xs font-semibold text-slate-800 group-hover:text-rose-700 transition-colors">
                  Alfa
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-extrabold text-slate-900">{alfaCount}</span>
                <ChevronRight size={14} className="text-slate-300 group-hover:text-rose-600 transition-colors" />
              </div>
            </div>
          </div>

          {/* Quick status alert / input guide */}
          <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
            <span>{isAttendanceFullyInputted ? '✓ Seluruh siswa telah terdata' : `${totalInputted} terdata • ${totalBelumInput} belum`}</span>
            <button
              onClick={() => setActiveView('absensi')}
              className="font-bold text-blue-600 hover:text-blue-800 hover:underline"
            >
              {isAttendanceFullyInputted ? 'Cek Detail' : 'Input Sekarang'}
            </button>
          </div>
        </div>

      </div>

      {/* 4. Bottom Section: Agenda Mendatang (4 Cols) + Big Action Banner (8 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-3.5">
        
        {/* Left: Agenda Mendatang (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-4 sm:p-4.5 border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-xs sm:text-sm">
              <Calendar size={16} className="text-blue-600" />
              <span>Agenda Mendatang</span>
            </div>
            <button
              onClick={() => setActiveView('kalender-akademik')}
              className="text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
            >
              Lihat Semua
            </button>
          </div>

          <div className="space-y-2 my-auto">
            {upcomingEvents.length === 0 ? (
              <div className="py-7 text-center text-slate-400 bg-slate-50/70 rounded-xl border border-dashed border-slate-200">
                <Calendar size={22} className="mx-auto mb-1.5 text-slate-300" />
                <p className="text-xs font-semibold text-slate-600">Tidak ada agenda mendatang di bulan ini</p>
                <p className="text-[10px] text-slate-400">Semua agenda bulan ini telah selesai atau belum dijadwalkan</p>
              </div>
            ) : (
              upcomingEvents.slice(0, 2).map((ev) => (
                <div
                  key={ev.id}
                  className="bg-slate-50 hover:bg-blue-50/50 transition-colors rounded-xl p-2.5 flex items-center gap-2.5 border border-slate-100"
                >
                  <div className="w-10 h-10 rounded-lg bg-white border border-blue-200 flex flex-col items-center justify-center shrink-0 text-center shadow-xs">
                    <span className="text-[8px] font-bold text-slate-400 uppercase">
                      {ev.dateDisplay.split(' ')[1] || 'AGU'}
                    </span>
                    <span className="text-xs sm:text-sm font-extrabold text-blue-600 leading-none">
                      {ev.dateDisplay.split(' ')[0] || '17'}
                    </span>
                  </div>
                  <div className="truncate">
                    <p className="font-bold text-slate-800 text-xs truncate">{ev.title}</p>
                    <p className="text-[10px] text-slate-500 truncate">
                      {ev.isEffective ? 'Agenda sekolah efektif' : 'Libur / Tidak efektif'}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-400 flex items-center justify-between">
            <span>Kalender Akademik {currentYear}</span>
            <span className="font-medium">{upcomingEvents.length} Acara Terjadwal</span>
          </div>
        </div>

        {/* Right: Big Action Banner (8 cols) */}
        <div className="lg:col-span-8 bg-gradient-to-r from-[#0F1E4A] via-[#162D6E] to-[#1E3A8A] rounded-2xl p-4 sm:p-5 text-white shadow-md relative overflow-hidden flex flex-col justify-between">
          <div className="max-w-xl z-10 space-y-1 sm:space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-white/10 text-blue-200 text-[10px] font-bold uppercase tracking-wider mb-1">
              <Building2 size={12} className="text-blue-300" />
              <span>Manajemen Presensi</span>
            </div>
            <h3 className="text-base sm:text-lg font-bold tracking-tight text-white">
              Efisiensi Administrasi Terkendali
            </h3>
            <p className="text-blue-100/90 text-xs sm:text-sm leading-relaxed max-w-lg">
              Gunakan fitur sinkronisasi pengguna untuk memastikan setiap siswa memiliki akses login,
              dan pantau kalender akademik untuk perhitungan hari belajar efektif yang akurat bagi
              pelaporan semester.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 mt-3.5 z-10">
            {currentUser?.role === 'KEPALA SEKOLAH' ? (
              <button
                id="btn-banner-rekapitulasi"
                onClick={() => setActiveView('rekapitulasi')}
                className="px-4.5 py-2 bg-[#0070F3] hover:bg-blue-600 active:scale-95 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Rekapitulasi Presensi</span>
                <ArrowRight size={14} />
              </button>
            ) : (
              <button
                id="btn-banner-mulai-absensi"
                onClick={() => setActiveView('absensi')}
                className="px-4.5 py-2 bg-[#0070F3] hover:bg-blue-600 active:scale-95 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Absensi Siswa</span>
                <ArrowRight size={14} />
              </button>
            )}
            <button
              id="btn-banner-cetak-laporan"
              onClick={() => setActiveView('laporan')}
              className="px-3.5 py-2 bg-white/10 hover:bg-white/20 active:scale-95 text-white font-bold text-xs rounded-xl border border-white/20 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Printer size={13} className="text-blue-200" />
              <span>Cetak Laporan</span>
            </button>
          </div>

          {/* 3D Laptop Illustration on Far Right */}
          <div className="hidden sm:block absolute right-0 bottom-0 top-0 w-44 md:w-56 lg:w-64 pointer-events-none overflow-hidden select-none">
            <img
              src="/images/laptop_books_plant_3d.jpg"
              alt="Ilustrasi Laptop"
              className="w-full h-full object-contain object-right-bottom mix-blend-screen opacity-90"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/images/blog_3d_idea_laptop.jpg';
              }}
            />
          </div>
        </div>

      </div>

      {/* 5. Menu Navigasi Section (Compact & Responsive) */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-3.5 bg-blue-600 rounded-full" />
            <h2 className="text-xs sm:text-sm font-bold text-slate-900">Menu Navigasi</h2>
          </div>
          <span className="text-[11px] text-slate-400 font-medium">
            {allowedMenuItems.length} Modul Akses ({userScope.roleBadgeLabel})
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-2.5">
          {allowedMenuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                id={`btn-menu-${item.id}`}
                onClick={() => setActiveView(item.id as any)}
                className="bg-white hover:bg-blue-50/70 hover:border-blue-300 border border-slate-200/90 rounded-xl p-2.5 flex items-center gap-2.5 shadow-2xs hover:shadow-xs transition-all group cursor-pointer active:scale-98 text-left"
              >
                <div
                  className={`w-8 h-8 rounded-lg ${item.bg} ${item.color} flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 shadow-2xs`}
                >
                  <Icon size={16} />
                </div>
                <div className="min-w-0 flex-1 truncate">
                  <p className="font-bold text-slate-800 text-[11px] group-hover:text-blue-600 transition-colors truncate">
                    {item.title}
                  </p>
                  <p className="text-[9px] text-slate-400 truncate">
                    {item.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 6. Dashboard Footer */}
      <footer className="pt-4 pb-2 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          {/* Badge Ruang Kerja */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200/80 shadow-2xs">
            <Building2 size={13} className="text-blue-600 shrink-0" />
            <span>{isPersonalWorkspace ? 'Ruang Kerja Individu' : 'Ruang Kerja Sekolah'}</span>
          </div>
          {schoolProfile.namaSekolah && (
            <span className="text-xs font-medium text-slate-400 hidden sm:inline">
              • {schoolProfile.namaSekolah}
            </span>
          )}
        </div>
        <p className="text-[11px] text-slate-400 font-medium">
          {systemConfig.footerCopyright || '© 2026 Kawacanaan by Maulana Yusuf. All Rights Reserved.'}
        </p>
      </footer>
    </div>
  );
};

