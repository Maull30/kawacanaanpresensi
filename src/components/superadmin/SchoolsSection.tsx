import React, { useState, useEffect, useMemo } from 'react';
import {
  Building2,
  Plus,
  Search,
  RefreshCw,
  Users,
  ExternalLink,
  ShieldCheck,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Ban,
  Sparkles,
  X,
  Trash2,
  KeyRound,
  Check,
  Copy,
  CreditCard,
  Activity,
  FileText,
  Filter,
  ArrowLeft,
  Save,
  User,
  Power,
  MoreVertical,
  ChevronDown,
  RotateCcw,
  Info,
  Lock,
  Mail,
  Phone,
  MapPin
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getTenantLifecycleInfo } from '../../utils/tenantLifecycle';
import { SchoolOnboardingModal } from '../SchoolOnboardingModal';

export type SchoolDetailTab = 'profil-lisensi' | 'pengguna-akses' | 'riwayat-audit';

const detailTabs: { id: SchoolDetailTab; label: string; icon: any; desc: string }[] = [
  { id: 'profil-lisensi', label: 'Profil & Lisensi', icon: Building2, desc: 'Identitas, kuota & perpanjangan' },
  { id: 'pengguna-akses', label: 'Pengguna & Akses', icon: Users, desc: 'Akun admin sekolah & staf' },
  { id: 'riwayat-audit', label: 'Riwayat & Audit', icon: Activity, desc: 'Log aktivitas & transaksi' },
];

export const SchoolsSection: React.FC<{
  call: any;
  showToast: any;
  activeSubTab?: string;
  initialSchoolId?: string;
  onSubTabChange?: (tab: string) => void;
}> = ({ call, showToast, activeSubTab, initialSchoolId, onSubTabChange }) => {
  const { impersonateSchool } = useApp();
  const [schools, setSchools] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Toolbar state: Pencarian langsung & Filter utama
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [planFilter, setPlanFilter] = useState<'all' | 'school' | 'teacher' | 'mulai'>('all');

  // Filter lanjutan popover state
  const [isAdvancedFilterOpen, setIsAdvancedFilterOpen] = useState(false);
  const [expiryFilter, setExpiryFilter] = useState<'all' | 'safe' | 'expiring' | 'expired'>('all');
  const [workspaceFilter, setWorkspaceFilter] = useState<'all' | 'school' | 'personal'>('all');

  // School Detail Selection Context
  const [selectedSchoolId, setSelectedSchoolId] = useState<string | null>(initialSchoolId || null);
  const [currentDetailTab, setCurrentDetailTab] = useState<SchoolDetailTab>('profil-lisensi');
  const [detailData, setDetailData] = useState<any | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingNotes, setSavingNotes] = useState(false);
  const [internalNotes, setInternalNotes] = useState('');

  // Form State for Data Pokok Sekolah Edit
  const [profileForm, setProfileForm] = useState<any>({});

  // Modals for Create School
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Modal Create Admin for School
  const [isCreateAdminOpen, setIsCreateAdminOpen] = useState(false);
  const [adminForm, setAdminForm] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    role: 'ADMIN',
  });
  const [creatingAdmin, setCreatingAdmin] = useState(false);

  // Password Reset State
  const [resetModalUser, setResetModalUser] = useState<any | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [resettingPassword, setResettingPassword] = useState(false);

  // Protected Delete School State
  const [schoolToDelete, setSchoolToDelete] = useState<any | null>(null);
  const [deleteConfirmInput, setDeleteConfirmInput] = useState('');
  const [deletingSchool, setDeletingSchool] = useState(false);

  // Action Menu Dropdown state for table rows
  const [activeMenuSchoolId, setActiveMenuSchoolId] = useState<string | null>(null);

  // Code Copy & Regenerate State
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);
  const [regeneratingCode, setRegeneratingCode] = useState(false);

  // Handle outside click or Escape to close action menu
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveMenuSchoolId(null);
        setIsAdvancedFilterOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const loadSchools = async () => {
    setLoading(true);
    try {
      const res = await call('list');
      setSchools(res.schools || []);
    } catch (e: any) {
      showToast(e.message || 'Gagal memuat daftar sekolah.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSchools();
  }, []);

  // Sync initial school ID or navigation action if passed externally
  useEffect(() => {
    if (initialSchoolId) {
      setSelectedSchoolId(initialSchoolId);
    }
  }, [initialSchoolId]);

  useEffect(() => {
    if (activeSubTab === 'tambah') {
      setIsCreateOpen(true);
    }
  }, [activeSubTab]);

  // Load Single School Details when selected
  const loadSchoolDetail = async (id: string) => {
    setLoadingDetail(true);
    try {
      const res = await call('school_details', { school_id: id });
      setDetailData(res);
      setInternalNotes(res.school?.notes || '');
      setProfileForm(res.profile || {
        nama_sekolah: res.school?.name || '',
        npsn: res.school?.npsn || '',
        jenjang: 'SD',
        nama_kepala_sekolah: '',
        nip_kepala_sekolah: '',
        alamat: '',
        telepon_fax: '',
        email: ''
      });
    } catch (e: any) {
      showToast(e.message || 'Gagal memuat detail sekolah.', 'error');
    } finally {
      setLoadingDetail(false);
    }
  };

  useEffect(() => {
    if (selectedSchoolId) {
      loadSchoolDetail(selectedSchoolId);
    }
  }, [selectedSchoolId]);

  const handleSelectSchool = (school: any) => {
    const sId = school.school_id || school.id;
    setSelectedSchoolId(sId);
    setCurrentDetailTab('profil-lisensi');
    setActiveMenuSchoolId(null);
    onSubTabChange?.('profil-lisensi');
  };

  const handleBackToList = () => {
    setSelectedSchoolId(null);
    setDetailData(null);
    setActiveMenuSchoolId(null);
    loadSchools();
    onSubTabChange?.('semua');
  };

  // Filtered schools list
  const filteredSchools = useMemo(() => {
    return schools.filter((s) => {
      const lifecycle = getTenantLifecycleInfo(s);
      const query = search.toLowerCase().trim();
      const matchSearch =
        !query ||
        (s.name || '').toLowerCase().includes(query) ||
        (s.npsn || '').toLowerCase().includes(query) ||
        (s.code || '').toLowerCase().includes(query) ||
        (s.headmaster_name || '').toLowerCase().includes(query);

      const isSuspended = s.status === 'inactive' || lifecycle.isSuspended;
      const matchStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && !isSuspended) ||
        (statusFilter === 'inactive' && isSuspended);

      const matchPlan =
        planFilter === 'all' ||
        (planFilter === 'school' && (s.plan === 'school' || s.plan === 'sekolah')) ||
        (planFilter === 'teacher' && (s.plan === 'teacher' || s.plan === 'guru')) ||
        (planFilter === 'mulai' && (s.plan === 'mulai' || s.plan === 'free'));

      const isPersonal = s.workspace_type === 'personal' || s.is_personal;
      const matchWorkspace =
        workspaceFilter === 'all' ||
        (workspaceFilter === 'school' && !isPersonal) ||
        (workspaceFilter === 'personal' && isPersonal);

      let matchExpiry = true;
      if (expiryFilter === 'safe') {
        matchExpiry = !lifecycle.isExpiringSoon && !lifecycle.isGracePeriod && !lifecycle.isSuspended;
      } else if (expiryFilter === 'expiring') {
        matchExpiry = lifecycle.isExpiringSoon || lifecycle.isGracePeriod;
      } else if (expiryFilter === 'expired') {
        matchExpiry = lifecycle.isSuspended;
      }

      return matchSearch && matchStatus && matchPlan && matchWorkspace && matchExpiry;
    });
  }, [schools, search, statusFilter, planFilter, workspaceFilter, expiryFilter]);

  const hasAdvancedFilters = expiryFilter !== 'all' || workspaceFilter !== 'all';

  const resetAdvancedFilters = () => {
    setExpiryFilter('all');
    setWorkspaceFilter('all');
  };

  // Handle Save Profile
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSchoolId) return;
    setSavingProfile(true);
    try {
      await call('update_school_profile', {
        school_id: selectedSchoolId,
        profile: profileForm,
      });
      showToast('Informasi profil pokok sekolah berhasil disimpan.', 'success');
      loadSchoolDetail(selectedSchoolId);
      loadSchools();
    } catch (e: any) {
      showToast(e.message || 'Gagal menyimpan data sekolah.', 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  // Handle Save Notes
  const handleSaveNotes = async () => {
    if (!selectedSchoolId || !detailData?.school) return;
    setSavingNotes(true);
    try {
      await call('update_school', {
        school_id: selectedSchoolId,
        name: detailData.school.name,
        npsn: detailData.school.npsn,
        plan: detailData.school.plan,
        status: detailData.school.status,
        subscription_expires_at: detailData.school.subscription_expires_at,
        notes: internalNotes.trim(),
      });
      showToast('Catatan internal super admin berhasil disimpan.', 'success');
      loadSchoolDetail(selectedSchoolId);
    } catch (e: any) {
      showToast(e.message || 'Gagal menyimpan catatan.', 'error');
    } finally {
      setSavingNotes(false);
    }
  };

  // Handle Perpanjangan Langganan (+Days)
  const handleExtendSubscription = async (days: number, targetSchool?: any) => {
    const sch = targetSchool || detailData?.school;
    if (!sch) return;
    const sId = sch.school_id || sch.id;
    const currentExpiry = sch.subscription_expires_at || new Date().toISOString().slice(0, 10);
    const baseDate = new Date(currentExpiry) > new Date() ? currentExpiry : new Date().toISOString().slice(0, 10);
    const nextDate = new Date(baseDate);
    nextDate.setDate(nextDate.getDate() + days);
    const nextExpiryStr = nextDate.toISOString().slice(0, 10);

    try {
      await call('update_school', {
        school_id: sId,
        name: sch.name,
        npsn: sch.npsn,
        plan: sch.plan,
        status: 'active',
        subscription_expires_at: nextExpiryStr,
      });
      showToast(`Masa aktif diperpanjang +${days} hari hingga ${nextExpiryStr}.`, 'success');
      loadSchools();
      if (selectedSchoolId === sId) {
        loadSchoolDetail(sId);
      }
    } catch (e: any) {
      showToast(e.message || 'Gagal memperpanjang masa aktif.', 'error');
    }
  };

  // Handle Toggle Aktif / Bekukan Sekolah
  const handleToggleSchoolStatus = async (school: any) => {
    const sId = school.school_id || school.id;
    const currentStatus = school.status || 'active';
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';

    try {
      await call('update_school', {
        school_id: sId,
        name: school.name,
        npsn: school.npsn,
        plan: school.plan,
        status: newStatus,
        subscription_expires_at: school.subscription_expires_at,
      });
      showToast(
        newStatus === 'active'
          ? `Sekolah "${school.name}" berhasil diaktifkan kembali.`
          : `Sekolah "${school.name}" berhasil dinonaktifkan / dibekukan.`,
        'success'
      );
      loadSchools();
      if (selectedSchoolId === sId) {
        loadSchoolDetail(sId);
      }
    } catch (e: any) {
      showToast(e.message || 'Gagal mengubah status sekolah.', 'error');
    }
  };

  // Handle Salin Kode
  const handleCopyCode = (code: string, id: string) => {
    if (!code) return;
    const cleanCode = code.replace(/^SCH-?/i, '').trim().toUpperCase();
    navigator.clipboard.writeText(cleanCode);
    setCopiedCodeId(id);
    showToast(`Kode sekolah "${cleanCode}" berhasil disalin ke clipboard!`, 'success');
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  // Handle Acak Ulang Kode
  const handleRegenerateCode = async (schoolId: string) => {
    if (!confirm('Apakah Anda yakin ingin memperbarui / mengacak ulang Kode Undangan Sekolah ini? Pengguna baru harus menggunakan kode baru.')) {
      return;
    }
    setRegeneratingCode(true);
    try {
      const res = await call('regenerate_school_code', { school_id: schoolId });
      showToast(`Kode sekolah berhasil diperbarui menjadi: ${res.code}`, 'success');
      loadSchoolDetail(schoolId);
      loadSchools();
    } catch (e: any) {
      showToast(e.message || 'Gagal memperbarui kode sekolah.', 'error');
    } finally {
      setRegeneratingCode(false);
    }
  };

  // Handle Buat Admin Sekolah
  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSchoolId) return;
    if (!adminForm.name || !adminForm.username || !adminForm.password) {
      showToast('Nama, username, dan password wajib diisi.', 'error');
      return;
    }
    setCreatingAdmin(true);
    try {
      await call('create_admin', {
        school_id: selectedSchoolId,
        ...adminForm,
      });
      showToast(`Akun admin "${adminForm.name}" berhasil dibuat.`, 'success');
      setIsCreateAdminOpen(false);
      setAdminForm({ name: '', username: '', email: '', password: '', role: 'ADMIN' });
      loadSchoolDetail(selectedSchoolId);
    } catch (e: any) {
      showToast(e.message || 'Gagal membuat akun admin.', 'error');
    } finally {
      setCreatingAdmin(false);
    }
  };

  // Handle Reset Password
  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetModalUser) return;
    if (newPassword.length < 8) {
      showToast('Password baru minimal 8 karakter.', 'error');
      return;
    }
    setResettingPassword(true);
    try {
      await call('reset_admin_password', {
        user_id: resetModalUser.id,
        password: newPassword,
      });
      showToast(`Password untuk "${resetModalUser.name}" berhasil direset.`, 'success');
      setResetModalUser(null);
      setNewPassword('');
    } catch (e: any) {
      showToast(e.message || 'Gagal mereset password.', 'error');
    } finally {
      setResettingPassword(false);
    }
  };

  // Handle Impersonasi (Masuk Sesi Sekolah)
  const handleImpersonate = (school: any) => {
    try {
      impersonateSchool({
        id: school.school_id || school.id,
        name: school.name,
        npsn: school.npsn || '10000000',
        plan: school.plan || 'school',
        status: school.status || 'active',
        subscriptionExpiresAt: school.subscription_expires_at,
        subscriptionStatus: school.status,
      });
      showToast(`Beralih ke sesi kerja sekolah "${school.name}".`, 'info');
    } catch (e: any) {
      showToast(e.message || 'Gagal masuk sesi sekolah.', 'error');
    }
  };

  // Handle Protected Delete School
  const handleConfirmDeleteSchool = async () => {
    if (!schoolToDelete) return;
    const requiredName = (schoolToDelete.name || '').trim().toLowerCase();
    const typedName = deleteConfirmInput.trim().toLowerCase();

    if (typedName !== requiredName && typedName !== 'hapus') {
      showToast('Konfirmasi pengetikan nama sekolah belum sesuai.', 'error');
      return;
    }

    const sId = schoolToDelete.school_id || schoolToDelete.id;
    setDeletingSchool(true);
    try {
      const res = await call('delete_school', { school_id: sId });
      showToast(res.message || `Sekolah "${schoolToDelete.name}" berhasil dihapus permanen.`, 'success');
      setSchoolToDelete(null);
      setDeleteConfirmInput('');
      if (selectedSchoolId === sId) {
        setSelectedSchoolId(null);
        setDetailData(null);
      }
      loadSchools();
    } catch (e: any) {
      showToast(e.message || 'Gagal menghapus sekolah.', 'error');
    } finally {
      setDeletingSchool(false);
    }
  };

  // =========================================================================
  // TAMPILAN DETAIL SEKOLAH (3 TAB TERFOKUS)
  // =========================================================================
  if (selectedSchoolId) {
    const sch = detailData?.school || {};
    const users = detailData?.users || [];
    const classes = detailData?.classes || [];
    const students = detailData?.students || [];
    const payments = detailData?.payments || [];
    const auditLogs = detailData?.auditLogs || [];
    const lifecycle = getTenantLifecycleInfo(sch);
    const isSuspended = sch.status === 'inactive' || lifecycle.isSuspended;
    const rawDisplayCode = sch.code || sch.npsn || sch.id?.slice(0, 8)?.toUpperCase() || '9B3366AB';
    const displayCode = rawDisplayCode.replace(/^SCH-?/i, '').trim().toUpperCase();

    return (
      <div className="space-y-6">
        {/* Header Navigasi Detail Sekolah */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <button
              onClick={handleBackToList}
              className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer shrink-0"
              title="Kembali ke Direktori Sekolah"
            >
              <ArrowLeft size={18} />
            </button>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-slate-900">
                  {sch.name || 'Memuat Detail Sekolah...'}
                </h2>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    !isSuspended
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : 'bg-rose-100 text-rose-800 border border-rose-200'
                  }`}
                >
                  {!isSuspended ? 'Aktif' : 'Nonaktif / Dibekukan'}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase">
                  {sch.plan === 'teacher' ? 'Paket Guru Pro' : sch.plan === 'school' || sch.plan === 'sekolah' ? 'Paket Sekolah Pro' : 'Paket Gratis'}
                </span>
              </div>
              <div className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                <span>NPSN: <strong className="text-slate-700 font-mono">{sch.npsn || '-'}</strong></span>
                <span>•</span>
                <span>Kode Masuk: <span className="font-mono font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">{displayCode}</span></span>
                {sch.headmaster_name && (
                  <>
                    <span>•</span>
                    <span>Kepala Sekolah: <strong className="text-slate-700">{sch.headmaster_name}</strong></span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-start md:self-auto shrink-0">
            <button
              type="button"
              onClick={() => handleToggleSchoolStatus(sch)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition cursor-pointer flex items-center gap-1.5 ${
                !isSuspended
                  ? 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-200'
                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200'
              }`}
            >
              <Power size={14} />
              <span>{!isSuspended ? 'Bekukan Sekolah' : 'Aktifkan Kembali'}</span>
            </button>

            <button
              type="button"
              onClick={() => handleImpersonate(sch)}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition cursor-pointer flex items-center gap-1.5"
            >
              <ExternalLink size={14} />
              <span>Masuk Sesi (Mode Bantuan)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setSchoolToDelete(sch);
                setDeleteConfirmInput('');
              }}
              className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition cursor-pointer"
              title="Hapus Sekolah Terproteksi"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        {/* 3 Tab Navigasi Terpadu */}
        <div className="bg-white border border-slate-200/80 p-1.5 rounded-2xl shadow-xs">
          <div className="grid grid-cols-3 gap-1">
            {detailTabs.map((tab) => {
              const isActive = currentDetailTab === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setCurrentDetailTab(tab.id)}
                  className={`flex items-center justify-center sm:justify-start gap-2.5 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon size={16} className={isActive ? 'text-white' : 'text-slate-400'} />
                  <div className="text-left hidden sm:block">
                    <div className="font-extrabold">{tab.label}</div>
                    <div className={`text-[10px] ${isActive ? 'text-indigo-100' : 'text-slate-400'}`}>
                      {tab.desc}
                    </div>
                  </div>
                  <span className="sm:hidden font-extrabold">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Konten Tab Detail Sekolah */}
        {loadingDetail ? (
          <div className="bg-white rounded-3xl p-16 flex flex-col items-center justify-center text-slate-400 border border-slate-200/80">
            <RefreshCw size={26} className="animate-spin text-indigo-600 mb-2" />
            <span className="text-xs font-semibold">Memuat data instansi sekolah...</span>
          </div>
        ) : (
          <>
            {/* ============================================================= */}
            {/* TAB 1: PROFIL & LISENSI                                       */}
            {/* ============================================================= */}
            {currentDetailTab === 'profil-lisensi' && (
              <div className="space-y-6">
                {/* 1.1 Metrik Cepat Kapasitas */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                  <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
                    <div className="text-[11px] font-bold text-slate-500">Jumlah Siswa</div>
                    <div className="text-2xl font-black text-slate-900 mt-1">{students.length}</div>
                    <div className="text-[10px] text-emerald-600 font-bold mt-1">
                      {sch.max_students && sch.max_students < 9999 ? `Maks: ${sch.max_students} siswa` : 'Kapasitas Unlimited'}
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
                    <div className="text-[11px] font-bold text-slate-500">Guru & Admin</div>
                    <div className="text-2xl font-black text-slate-900 mt-1">{users.length}</div>
                    <div className="text-[10px] text-emerald-600 font-bold mt-1">
                      {sch.max_teachers && sch.max_teachers < 9999 ? `Maks: ${sch.max_teachers} akun` : 'Kapasitas Unlimited'}
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
                    <div className="text-[11px] font-bold text-slate-500">Kelas / Rombel</div>
                    <div className="text-2xl font-black text-slate-900 mt-1">{classes.length}</div>
                    <div className="text-[10px] text-indigo-600 font-bold mt-1">
                      {sch.max_classes && sch.max_classes < 9999 ? `Maks: ${sch.max_classes} rombel` : 'Rombel Fleksibel'}
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
                    <div className="text-[11px] font-bold text-slate-500">Masa Berlaku</div>
                    <div className="text-base font-black text-slate-900 mt-1 truncate">
                      {sch.subscription_expires_at || 'Seumur Hidup'}
                    </div>
                    <div className={`text-[10px] font-bold mt-1 ${
                      lifecycle.isSuspended ? 'text-rose-600' : lifecycle.isExpiringSoon ? 'text-amber-600' : 'text-emerald-600'
                    }`}>
                      {lifecycle.daysRemaining === null ? 'Permanen' : `${lifecycle.daysRemaining} hari tersisa`}
                    </div>
                  </div>
                </div>

                {/* 1.2 Banner Kode Akses & Undangan Sekolah */}
                <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-900 rounded-3xl p-5 sm:p-6 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1 max-w-xl">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-[10px] font-bold uppercase tracking-wider">
                      <KeyRound size={12} className="text-indigo-300" />
                      <span>Kode Undangan Sekolah</span>
                    </div>
                    <h3 className="text-base font-black text-white">
                      Kode Akses Masuk Guru & Siswa
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Bagikan kode unik ini kepada Guru, Wali Kelas, dan Siswa agar otomatis terdaftar ke dalam instansi sekolah ini tanpa konfigurasi manual.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2.5 rounded-2xl flex items-center justify-between gap-3">
                      <span className="font-mono text-xl font-black text-amber-300 tracking-wider">
                        {displayCode}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopyCode(displayCode, sch.id)}
                        className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white transition cursor-pointer"
                        title="Salin Kode"
                      >
                        {copiedCodeId === sch.id ? <Check size={16} className="text-emerald-300" /> : <Copy size={16} />}
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRegenerateCode(sch.id)}
                      disabled={regeneratingCode}
                      className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <RefreshCw size={14} className={regeneratingCode ? 'animate-spin' : ''} />
                      <span>Acak Ulang</span>
                    </button>
                  </div>
                </div>

                {/* 1.3 Pengaturan Lisensi & Perpanjangan Cepat */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                    <div>
                      <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                        <Sparkles size={16} className="text-indigo-600" />
                        Status Langganan & Perpanjangan Lisensi
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Tambahkan masa aktif langganan instansi sekolah secara instan.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-600">Status Saat Ini:</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-black ${
                        !isSuspended ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        {!isSuspended ? 'Aktif Beroperasi' : 'Dibekukan / Kedaluwarsa'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2">
                      Pilihan Perpanjangan Cepat:
                    </label>
                    <div className="flex flex-wrap gap-2.5">
                      <button
                        type="button"
                        onClick={() => handleExtendSubscription(7)}
                        className="px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 text-xs font-bold cursor-pointer transition flex items-center gap-1.5"
                      >
                        <Clock size={13} />
                        <span>+7 Hari (Masa Tenggang)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleExtendSubscription(30)}
                        className="px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-900 text-xs font-bold cursor-pointer transition flex items-center gap-1.5"
                      >
                        <Calendar size={13} />
                        <span>+30 Hari (1 Bulan)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleExtendSubscription(180)}
                        className="px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-900 text-xs font-bold cursor-pointer transition flex items-center gap-1.5"
                      >
                        <Calendar size={13} />
                        <span>+180 Hari (1 Semester)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleExtendSubscription(365)}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer transition flex items-center gap-1.5"
                      >
                        <CheckCircle2 size={13} />
                        <span>+365 Hari (1 Tahun Ajaran)</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* 1.4 Form Data Pokok & Kontak Resmi Sekolah */}
                <form onSubmit={handleSaveProfile} className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-5">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div>
                      <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                        <Building2 size={16} className="text-indigo-600" />
                        Data Pokok & Kontak Resmi Sekolah
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Identitas resmi yang tercantum di surat keterangan, cetak rapor, dan kop presensi.
                      </p>
                    </div>
                    <button
                      type="submit"
                      disabled={savingProfile}
                      className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {savingProfile ? <RefreshCw size={13} className="animate-spin" /> : <Save size={13} />}
                      <span>{savingProfile ? 'Menyimpan...' : 'Simpan Profil'}</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Nama Resmi Sekolah *</label>
                      <input
                        type="text"
                        value={profileForm.nama_sekolah || ''}
                        onChange={(e) => setProfileForm({ ...profileForm, nama_sekolah: e.target.value })}
                        required
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-indigo-600"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">NPSN Resmi *</label>
                      <input
                        type="text"
                        value={profileForm.npsn || ''}
                        onChange={(e) => setProfileForm({ ...profileForm, npsn: e.target.value })}
                        required
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-mono font-semibold focus:outline-indigo-600"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Nama Kepala Sekolah</label>
                      <input
                        type="text"
                        value={profileForm.nama_kepala_sekolah || ''}
                        onChange={(e) => setProfileForm({ ...profileForm, nama_kepala_sekolah: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-indigo-600"
                        placeholder="Contoh: Dra. Hj. Nurul Hidayah, M.Pd"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">NIP Kepala Sekolah</label>
                      <input
                        type="text"
                        value={profileForm.nip_kepala_sekolah || ''}
                        onChange={(e) => setProfileForm({ ...profileForm, nip_kepala_sekolah: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-mono focus:outline-indigo-600"
                        placeholder="19750812..."
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 mb-1">Alamat Lengkap Instansi</label>
                      <input
                        type="text"
                        value={profileForm.alamat || ''}
                        onChange={(e) => setProfileForm({ ...profileForm, alamat: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-indigo-600"
                        placeholder="Jl. Merdeka No. 45, Kecamatan Gambir, Kota Jakarta Pusat"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Nomor Telepon / Fax</label>
                      <input
                        type="text"
                        value={profileForm.telepon_fax || ''}
                        onChange={(e) => setProfileForm({ ...profileForm, telepon_fax: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-indigo-600"
                        placeholder="(021) 3847291"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Email Resmi Sekolah</label>
                      <input
                        type="email"
                        value={profileForm.email || ''}
                        onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-indigo-600"
                        placeholder="admin@sdncideng07.sch.id"
                      />
                    </div>
                  </div>
                </form>

                {/* 1.5 Catatan Internal Super Admin */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                        <FileText size={16} className="text-indigo-600" />
                        Catatan Khusus Super Admin
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Catatan internal rahasia (kontak PIC, riwayat negosiasi, dsb.) yang hanya dapat dilihat oleh Super Admin.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleSaveNotes}
                      disabled={savingNotes}
                      className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {savingNotes ? <RefreshCw size={13} className="animate-spin" /> : <Save size={13} />}
                      <span>{savingNotes ? 'Menyimpan...' : 'Simpan Catatan'}</span>
                    </button>
                  </div>
                  <textarea
                    rows={3}
                    value={internalNotes}
                    onChange={(e) => setInternalNotes(e.target.value)}
                    placeholder="Tulis catatan internal untuk sekolah ini di sini..."
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-xs text-slate-800 font-medium focus:outline-indigo-600 leading-relaxed"
                  />
                </div>
              </div>
            )}

            {/* ============================================================= */}
            {/* TAB 2: PENGGUNA & AKSES                                       */}
            {/* ============================================================= */}
            {currentDetailTab === 'pengguna-akses' && (
              <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                      <Users size={16} className="text-indigo-600" />
                      Daftar Akun Pengguna & Akses Sekolah
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Kelola akun Administrator Sekolah, Kepala Sekolah, dan Guru yang terikat dengan instansi ini.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsCreateAdminOpen(true)}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
                  >
                    <Plus size={14} />
                    <span>Tambah Akun Admin</span>
                  </button>
                </div>

                {users.length === 0 ? (
                  <div className="py-12 text-center text-xs text-slate-400">
                    Belum ada akun guru atau administrator yang terdaftar di sekolah ini.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 text-slate-500 font-bold bg-slate-50/80">
                          <th className="py-3 px-3.5">Nama Lengkap</th>
                          <th className="py-3 px-3.5">Username / Email</th>
                          <th className="py-3 px-3.5">Peran (Role)</th>
                          <th className="py-3 px-3.5">Status Akun</th>
                          <th className="py-3 px-3.5 text-right">Tindakan</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {users.map((u: any) => (
                          <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-3 px-3.5 font-bold text-slate-800">{u.name}</td>
                            <td className="py-3 px-3.5 text-slate-600 font-mono">{u.username || u.email}</td>
                            <td className="py-3 px-3.5">
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                                {u.role || 'GURU'}
                              </span>
                            </td>
                            <td className="py-3 px-3.5">
                              <span
                                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                  u.is_active !== false
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                                }`}
                              >
                                <span className={`w-1.5 h-1.5 rounded-full ${u.is_active !== false ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                {u.is_active !== false ? 'Aktif' : 'Nonaktif'}
                              </span>
                            </td>
                            <td className="py-3 px-3.5 text-right">
                              <button
                                type="button"
                                onClick={() => {
                                  setResetModalUser(u);
                                  setNewPassword('');
                                }}
                                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer transition"
                              >
                                <KeyRound size={12} />
                                <span>Reset Sandi</span>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* ============================================================= */}
            {/* TAB 3: RIWAYAT & AUDIT                                        */}
            {/* ============================================================= */}
            {currentDetailTab === 'riwayat-audit' && (
              <div className="space-y-6">
                {/* 3.1 Log Audit Forensik Sekolah */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
                  <div>
                    <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                      <Activity size={16} className="text-indigo-600" />
                      Rekam Jejak Aktivitas & Log Audit Sekolah
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Histori mutasi lisensi, regenerasi kode, perubahan profil, dan tindakan administratif pada sekolah ini.
                    </p>
                  </div>

                  {auditLogs.length === 0 ? (
                    <div className="py-10 text-center text-xs text-slate-400">
                      Belum ada catatan log aktivitas yang terekam untuk sekolah ini.
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto pr-1">
                      {auditLogs.map((log: any, i: number) => (
                        <div key={log.id || i} className="py-3 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <div className="font-bold text-slate-800">{log.action}</div>
                            <div className="text-[11px] text-slate-500 mt-0.5">
                              Pelaku: <strong className="text-slate-700">{log.actor_name || 'Super Admin'}</strong>
                              {log.ip_address && <span className="font-mono text-slate-400 ml-2">({log.ip_address})</span>}
                            </div>
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono shrink-0">
                            {log.created_at ? new Date(log.created_at).toLocaleString('id-ID') : '-'}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 3.2 Riwayat Pembayaran & Tagihan Sekolah */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
                  <div>
                    <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                      <CreditCard size={16} className="text-indigo-600" />
                      Riwayat Transaksi Finansial Sekolah
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Bukti invoice dan verifikasi perpanjangan paket langganan {sch.name}.
                    </p>
                  </div>

                  {payments.length === 0 ? (
                    <div className="py-10 text-center text-xs text-slate-400">
                      Belum ada riwayat transaksi finansial yang tercatat untuk sekolah ini.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-slate-200 text-slate-500 font-bold bg-slate-50/80">
                            <th className="py-2.5 px-3">No. Invoice</th>
                            <th className="py-2.5 px-3">Paket</th>
                            <th className="py-2.5 px-3">Nominal</th>
                            <th className="py-2.5 px-3">Metode</th>
                            <th className="py-2.5 px-3">Tanggal</th>
                            <th className="py-2.5 px-3">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {payments.map((p: any) => (
                            <tr key={p.id} className="hover:bg-slate-50/80">
                              <td className="py-2.5 px-3 font-mono font-bold text-slate-800">
                                {p.invoice_no || p.invoiceNo || p.id}
                              </td>
                              <td className="py-2.5 px-3">{p.plan_name || p.planName || 'Paket Sekolah'}</td>
                              <td className="py-2.5 px-3 font-bold text-slate-900">
                                Rp {Number(p.total_amount || p.amount || 0).toLocaleString('id-ID')}
                              </td>
                              <td className="py-2.5 px-3">{p.payment_method || 'QRIS'}</td>
                              <td className="py-2.5 px-3 text-slate-500">
                                {p.created_at ? new Date(p.created_at).toLocaleDateString('id-ID') : '-'}
                              </td>
                              <td className="py-2.5 px-3">
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                    p.status === 'paid'
                                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                                  }`}
                                >
                                  {p.status === 'paid' ? 'Lunas' : 'Menunggu'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {/* Modal Buat Admin Sekolah */}
        {isCreateAdminOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl space-y-4 border border-slate-100">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                    <Users size={16} />
                  </div>
                  <h3 className="text-sm font-black text-slate-900">Tambah Akun Admin Sekolah</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCreateAdminOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreateAdmin} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nama Lengkap *</label>
                  <input
                    type="text"
                    required
                    value={adminForm.name}
                    onChange={(e) => setAdminForm({ ...adminForm, name: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-indigo-600"
                    placeholder="Contoh: Budi Santoso, S.Kom"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Username Login *</label>
                  <input
                    type="text"
                    required
                    value={adminForm.username}
                    onChange={(e) => setAdminForm({ ...adminForm, username: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-mono focus:outline-indigo-600"
                    placeholder="admin_sdncideng07"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Alamat Email (Opsional)</label>
                  <input
                    type="email"
                    value={adminForm.email}
                    onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-indigo-600"
                    placeholder="admin@sekolah.sch.id"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Password Awal *</label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={adminForm.password}
                    onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-indigo-600"
                    placeholder="Minimal 8 karakter"
                  />
                </div>

                <div className="flex justify-end gap-2.5 pt-3">
                  <button
                    type="button"
                    onClick={() => setIsCreateAdminOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={creatingAdmin}
                    className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold cursor-pointer disabled:opacity-50 shadow-xs"
                  >
                    {creatingAdmin ? 'Membuat...' : 'Buat Akun Admin'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Reset Password */}
        {resetModalUser && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4 border border-slate-100">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                    <KeyRound size={16} />
                  </div>
                  <h3 className="text-sm font-black text-slate-900">Reset Sandi Pengguna</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setResetModalUser(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleResetPasswordSubmit} className="space-y-3.5">
                <p className="text-xs text-slate-600 leading-relaxed">
                  Atur ulang kata sandi untuk akun <strong>{resetModalUser.name}</strong> (@{resetModalUser.username}).
                </p>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Password Baru *</label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-indigo-600"
                    placeholder="Minimal 8 karakter"
                  />
                </div>

                <div className="flex justify-end gap-2.5 pt-3">
                  <button
                    type="button"
                    onClick={() => setResetModalUser(null)}
                    className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={resettingPassword}
                    className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold cursor-pointer disabled:opacity-50 shadow-xs"
                  >
                    {resettingPassword ? 'Menyimpan...' : 'Simpan Sandi Baru'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // TAMPILAN UTAMA: TOOLBAR & TABEL SEKOLAH UTAMA
  // =========================================================================
  return (
    <div className="space-y-5">
      {/* 1. TOOLBAR & FILTER TERPADU */}
      <div className="bg-white p-3.5 sm:p-4 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Pencarian Utama */}
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari berdasarkan nama sekolah, NPSN, atau kode akses..."
            className="w-full pl-10 pr-9 py-2.5 rounded-2xl border border-slate-200 text-xs font-medium focus:outline-indigo-600 transition"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Filter Utama & Filter Lanjutan */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Filter Status Utama */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3.5 py-2.5 rounded-2xl border border-slate-200 text-xs font-bold text-slate-700 bg-white hover:border-slate-300 focus:outline-indigo-600 cursor-pointer"
          >
            <option value="all">Semua Status</option>
            <option value="active">Aktif Beroperasi</option>
            <option value="inactive">Nonaktif / Kedaluwarsa</option>
          </select>

          {/* Filter Paket Utama */}
          <select
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value as any)}
            className="px-3.5 py-2.5 rounded-2xl border border-slate-200 text-xs font-bold text-slate-700 bg-white hover:border-slate-300 focus:outline-indigo-600 cursor-pointer"
          >
            <option value="all">Semua Paket</option>
            <option value="school">Paket Sekolah Pro</option>
            <option value="teacher">Paket Guru Pro</option>
            <option value="mulai">Paket Gratis</option>
          </select>

          {/* Tombol Filter Lanjutan (Popover) */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsAdvancedFilterOpen(!isAdvancedFilterOpen)}
              className={`px-3.5 py-2.5 rounded-2xl border text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                hasAdvancedFilters
                  ? 'bg-indigo-50 border-indigo-300 text-indigo-700 ring-2 ring-indigo-500/20'
                  : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
              }`}
            >
              <Filter size={14} className={hasAdvancedFilters ? 'text-indigo-600' : 'text-slate-500'} />
              <span>Filter Lanjutan</span>
              {hasAdvancedFilters && (
                <span className="w-2 h-2 rounded-full bg-indigo-600" />
              )}
            </button>

            {/* Menu Popover Filter Lanjutan */}
            {isAdvancedFilterOpen && (
              <>
                <div
                  className="fixed inset-0 z-20"
                  onClick={() => setIsAdvancedFilterOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 z-30 space-y-3.5">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="text-xs font-extrabold text-slate-800">Filter Lanjutan</span>
                    {hasAdvancedFilters && (
                      <button
                        type="button"
                        onClick={resetAdvancedFilters}
                        className="text-[11px] text-indigo-600 hover:text-indigo-800 font-bold cursor-pointer"
                      >
                        Reset Filter
                      </button>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Status Masa Berlaku (Lisensi)
                    </label>
                    <select
                      value={expiryFilter}
                      onChange={(e) => setExpiryFilter(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white"
                    >
                      <option value="all">Semua Masa Berlaku</option>
                      <option value="safe">Aktif & Aman (&gt; 30 Hari)</option>
                      <option value="expiring">Segera Habis (≤ 30 Hari)</option>
                      <option value="expired">Kedaluwarsa / Suspended</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Tipe Ruang Kerja
                    </label>
                    <select
                      value={workspaceFilter}
                      onChange={(e) => setWorkspaceFilter(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white"
                    >
                      <option value="all">Semua Ruang Kerja</option>
                      <option value="school">Ruang Kerja Sekolah (Multi-User)</option>
                      <option value="personal">Ruang Kerja Individu Guru</option>
                    </select>
                  </div>

                  <div className="pt-1 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setIsAdvancedFilterOpen(false)}
                      className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-bold cursor-pointer"
                    >
                      Terapkan
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Tombol Utama: + Tambah Sekolah */}
          <button
            type="button"
            onClick={() => setIsCreateOpen(true)}
            className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer transition shrink-0"
          >
            <Plus size={16} />
            <span>Tambah Sekolah</span>
          </button>
        </div>
      </div>

      {/* 2. TABEL SEKOLAH UTAMA */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <RefreshCw size={26} className="animate-spin text-indigo-600 mb-2" />
            <span className="text-xs font-semibold">Memuat data direktori sekolah...</span>
          </div>
        ) : filteredSchools.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-400 space-y-2">
            <Building2 size={32} className="mx-auto text-slate-300 mb-2" />
            <p className="font-semibold text-slate-600">Tidak ada sekolah yang sesuai dengan pencarian atau filter.</p>
            <p className="text-[11px] text-slate-400">Coba ubah kata kunci atau setel ulang filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-bold bg-slate-50/80">
                  <th className="py-3.5 px-4 font-bold">Sekolah & Instansi</th>
                  <th className="py-3.5 px-4 font-bold">Kode Akses</th>
                  <th className="py-3.5 px-4 font-bold">NPSN</th>
                  <th className="py-3.5 px-4 font-bold">Paket & Status</th>
                  <th className="py-3.5 px-4 text-center font-bold">Siswa</th>
                  <th className="py-3.5 px-4 text-center font-bold">Guru & Admin</th>
                  <th className="py-3.5 px-4 font-bold">Masa Berlaku</th>
                  <th className="py-3.5 px-4 text-right font-bold">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSchools.map((s) => {
                  const lifecycle = getTenantLifecycleInfo(s);
                  const isSuspendedOrExpired = s.status === 'inactive' || lifecycle.isSuspended;
                  const rawCode = s.code || s.npsn || s.id?.slice(0, 8)?.toUpperCase() || '9B3366AB';
                  const cleanCode = rawCode.replace(/^SCH-?/i, '').trim().toUpperCase();
                  const isMenuOpen = activeMenuSchoolId === (s.id || s.school_id);

                  return (
                    <tr
                      key={s.id || s.school_id}
                      onClick={() => handleSelectSchool(s)}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                    >
                      {/* Kolom 1: Sekolah & Instansi */}
                      <td className="py-3.5 px-4">
                        <div className="font-extrabold text-slate-900 group-hover:text-indigo-600">
                          {s.name}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1.5">
                          {s.headmaster_name ? (
                            <span>Kepsek: {s.headmaster_name}</span>
                          ) : (
                            <span>{s.workspace_type === 'personal' || s.is_personal ? 'Ruang Kerja Individu' : 'Instansi Sekolah'}</span>
                          )}
                        </div>
                      </td>

                      {/* Kolom 2: Kode Akses */}
                      <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                        <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-amber-50/80 border border-amber-200/80 text-amber-900 font-mono font-bold text-[11px]">
                          <span>{cleanCode}</span>
                          <button
                            type="button"
                            onClick={() => handleCopyCode(cleanCode, s.id)}
                            className="text-amber-700 hover:text-amber-950 p-0.5 cursor-pointer"
                            title="Salin Kode Undangan"
                          >
                            {copiedCodeId === s.id ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                          </button>
                        </div>
                      </td>

                      {/* Kolom 3: NPSN */}
                      <td className="py-3.5 px-4 font-mono font-semibold text-slate-700 text-xs">
                        {s.npsn || '-'}
                      </td>

                      {/* Kolom 4: Paket & Status */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col items-start gap-1">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 uppercase">
                            {s.plan === 'teacher' ? 'Guru Pro' : s.plan === 'school' || s.plan === 'sekolah' ? 'Sekolah Pro' : 'Gratis'}
                          </span>
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              !isSuspendedOrExpired
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${!isSuspendedOrExpired ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                            {!isSuspendedOrExpired ? 'Aktif' : 'Nonaktif'}
                          </span>
                        </div>
                      </td>

                      {/* Kolom 5: Siswa */}
                      <td className="py-3.5 px-4 text-center font-bold text-slate-800">
                        {s.student_count || 0}
                      </td>

                      {/* Kolom 6: Guru & Admin */}
                      <td className="py-3.5 px-4 text-center font-bold text-slate-800">
                        {s.teacher_admin_count || 0}
                      </td>

                      {/* Kolom 7: Masa Berlaku */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800">
                          {s.subscription_expires_at || 'Seumur Hidup'}
                        </div>
                        <div className={`text-[10px] font-semibold ${
                          lifecycle.isSuspended ? 'text-rose-600' : lifecycle.isExpiringSoon ? 'text-amber-600' : 'text-slate-400'
                        }`}>
                          {lifecycle.daysRemaining === null ? 'Permanen' : `${lifecycle.daysRemaining} hari lagi`}
                        </div>
                      </td>

                      {/* Kolom 8: Tindakan Rapi dengan Menu Dropdown (...) */}
                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5 relative">
                          <button
                            type="button"
                            onClick={() => handleSelectSchool(s)}
                            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer transition"
                          >
                            Kelola
                          </button>

                          <div className="relative">
                            <button
                              type="button"
                              onClick={() => setActiveMenuSchoolId(isMenuOpen ? null : (s.id || s.school_id))}
                              className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-800 cursor-pointer transition"
                              title="Aksi Lainnya"
                            >
                              <MoreVertical size={16} />
                            </button>

                            {/* Dropdown Menu Aksi */}
                            {isMenuOpen && (
                              <>
                                <div
                                  className="fixed inset-0 z-20"
                                  onClick={() => setActiveMenuSchoolId(null)}
                                />
                                <div className="absolute right-0 mt-1.5 w-48 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-30 text-left">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActiveMenuSchoolId(null);
                                      handleImpersonate(s);
                                    }}
                                    className="w-full px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-indigo-600 flex items-center gap-2 cursor-pointer"
                                  >
                                    <ExternalLink size={13} />
                                    <span>Masuk Sesi Sekolah</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActiveMenuSchoolId(null);
                                      handleExtendSubscription(30, s);
                                    }}
                                    className="w-full px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-emerald-600 flex items-center gap-2 cursor-pointer"
                                  >
                                    <Clock size={13} />
                                    <span>Perpanjang +30 Hari</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActiveMenuSchoolId(null);
                                      handleExtendSubscription(365, s);
                                    }}
                                    className="w-full px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-emerald-600 flex items-center gap-2 cursor-pointer"
                                  >
                                    <Calendar size={13} />
                                    <span>Perpanjang +1 Tahun</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActiveMenuSchoolId(null);
                                      handleToggleSchoolStatus(s);
                                    }}
                                    className="w-full px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                                  >
                                    <Power size={13} />
                                    <span>{!isSuspendedOrExpired ? 'Bekukan Sekolah' : 'Aktifkan Sekolah'}</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActiveMenuSchoolId(null);
                                      handleCopyCode(cleanCode, s.id);
                                    }}
                                    className="w-full px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                                  >
                                    <Copy size={13} />
                                    <span>Salin Kode Akses</span>
                                  </button>

                                  <div className="my-1 border-t border-slate-100" />

                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActiveMenuSchoolId(null);
                                      setSchoolToDelete(s);
                                      setDeleteConfirmInput('');
                                    }}
                                    className="w-full px-3.5 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
                                  >
                                    <Trash2 size={13} />
                                    <span>Hapus Sekolah</span>
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Onboarding Tambah Sekolah Baru */}
      {isCreateOpen && (
        <SchoolOnboardingModal
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          mode="superadmin"
          lang="ID"
          onSchoolCreated={async (newSchool) => {
            await loadSchools();
            if (newSchool?.id || newSchool?.school_id) {
              setSelectedSchoolId(newSchool.id || newSchool.school_id);
              setCurrentDetailTab('profil-lisensi');
            }
          }}
        />
      )}

      {/* Modal Konfirmasi Hapus Sekolah Terproteksi (Protected Delete Verification) */}
      {schoolToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-100 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                  <Trash2 size={20} />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                    Hapus Sekolah Permanen
                  </h3>
                  <p className="text-[11px] text-slate-500">Tindakan ini permanen & tidak dapat dikembalikan</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSchoolToDelete(null);
                  setDeleteConfirmInput('');
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Sekolah:</span>
                  <span className="font-bold text-slate-800">{schoolToDelete.name}</span>
                </div>
                {schoolToDelete.npsn && (
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">NPSN:</span>
                    <span className="font-mono text-slate-700">{schoolToDelete.npsn}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Paket:</span>
                  <span className="font-semibold text-slate-700 uppercase">{schoolToDelete.plan || 'Mulai'}</span>
                </div>
              </div>

              <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-[11px] leading-relaxed flex items-start gap-2">
                <AlertTriangle size={16} className="shrink-0 text-rose-600 mt-0.5" />
                <span>
                  Perhatian: Seluruh data akun pengguna, rombel kelas, peserta didik, dan rekap presensi instansi ini akan dihapus secara menyeluruh dari basis data.
                </span>
              </div>

              {/* Input Verifikasi Terproteksi */}
              <div className="pt-1">
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Ketik nama sekolah <span className="text-rose-700 font-extrabold select-all">"{schoolToDelete.name}"</span> untuk melanjutkan:
                </label>
                <input
                  type="text"
                  value={deleteConfirmInput}
                  onChange={(e) => setDeleteConfirmInput(e.target.value)}
                  placeholder={`Ketik "${schoolToDelete.name}"`}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-rose-600"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                disabled={deletingSchool}
                onClick={() => {
                  setSchoolToDelete(null);
                  setDeleteConfirmInput('');
                }}
                className="px-4 py-2 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer text-xs disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={
                  deletingSchool ||
                  (deleteConfirmInput.trim().toLowerCase() !== (schoolToDelete.name || '').trim().toLowerCase() &&
                    deleteConfirmInput.trim().toLowerCase() !== 'hapus')
                }
                onClick={handleConfirmDeleteSchool}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold transition shadow-xs cursor-pointer text-xs disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {deletingSchool ? (
                  <>
                    <RefreshCw size={13} className="animate-spin" /> Menghapus...
                  </>
                ) : (
                  <>
                    <Trash2 size={13} /> Hapus Permanen
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
