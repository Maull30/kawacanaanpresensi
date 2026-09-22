import React, { useState, useEffect } from 'react';
import {
  Settings,
  Database,
  ShieldCheck,
  Users,
  Layers,
  Globe,
  Mail,
  FolderArchive,
  CreditCard,
  ChevronRight,
  Edit3,
  UserCheck,
  Link as LinkIcon,
  Lock,
  RefreshCw,
  Info,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  FileText,
  KeyRound,
  Download,
  Upload,
  X,
  Save,
  Check,
  ExternalLink,
  Shield,
  Sliders,
  ListFilter,
  Activity,
  HardDriveDownload,
  Building2,
  Megaphone,
  Sparkles
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SystemBannerIllustration } from './SuperAdminIllustrations';
import { SecuritySection } from './SecuritySection';

export interface SystemInfoConfig {
  appName: string;
  version: string;
  environment: string;
  appUrl: string;
  database: string;
  server: string;
  timezone: string;
  installDate: string;
  buildNumber: string;
  license: string;
}

export const SystemSection: React.FC<{
  call: any;
  showToast: any;
  activeSubTab?: string;
  onSubTabChange?: (tab: string) => void;
}> = ({ call, showToast, activeSubTab, onSubTabChange }) => {
  const { globalAnnouncement, updateGlobalAnnouncement } = useApp();

  // 1. System Info State
  const [systemInfo, setSystemInfo] = useState<SystemInfoConfig>(() => {
    try {
      const saved = localStorage.getItem('kawacanaan_system_info');
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    return {
      appName: 'Kawacanaan Presensi',
      version: '1.0.0',
      environment: 'Production',
      appUrl: 'https://kawacanaanpresensi.vercel.app',
      database: 'MySQL 8.0',
      server: 'Vercel (Serverless)',
      timezone: 'Asia/Jakarta',
      installDate: '12 Agustus 2026',
      buildNumber: '#20260812-001',
      license: 'Commercial',
    };
  });

  // Modal States
  const [activeModal, setActiveModal] = useState<
    | null
    | 'edit-info'
    | 'identitas'
    | 'notifikasi'
    | 'integrasi'
    | 'keamanan'
    | 'backup-restore'
    | 'kelola-role'
    | 'akses-menu'
    | 'log-aktivitas'
    | 'panduan'
  >(null);

  // Edit Info Form State
  const [editInfoForm, setEditInfoForm] = useState<SystemInfoConfig>(systemInfo);

  // Broadcast / Notifikasi State
  const [broadcastMsg, setBroadcastMsg] = useState(globalAnnouncement?.message || '');
  const [broadcastType, setBroadcastType] = useState<'info' | 'warning' | 'alert'>(globalAnnouncement?.type || 'info');
  const [broadcastActive, setBroadcastActive] = useState<boolean>(globalAnnouncement?.active || false);
  const [savingBroadcast, setSavingBroadcast] = useState(false);

  // Email Notification settings
  const [emailSmtp, setEmailSmtp] = useState({
    host: 'smtp.kawacanaan.sch.id',
    port: '587',
    senderEmail: 'noreply@kawacanaan.sch.id',
    senderName: 'Kawacanaan Multi-Tenant System',
    encryption: 'TLS',
  });

  // Identitas Aplikasi State
  const [appIdentity, setAppIdentity] = useState({
    companyName: 'PT Kawacanaan Edukasi Nusantara',
    tagline: 'Sistem Manajemen Presensi & Akademik Sekolah Multi-Tenant',
    supportEmail: 'bantuan@kawacanaan.sch.id',
    supportPhone: '+62 812-3456-7890',
    address: 'Jl. Merdeka No. 45, Jakarta Selatan, DKI Jakarta 12190',
  });

  // Integrasi Midtrans State
  const [midtransConfig, setMidtransConfig] = useState<any>({
    client_key: '',
    server_key: '',
    merchant_id: '',
    is_production: false,
    enabled: true,
  });
  const [loadingGateway, setLoadingGateway] = useState(false);
  const [savingMidtrans, setSavingMidtrans] = useState(false);
  const [testingMidtrans, setTestingMidtrans] = useState(false);

  // Keamanan & Password State
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState('60');
  const [superAdminEmail, setSuperAdminEmail] = useState('');
  const [savingSuperAdminEmail, setSavingSuperAdminEmail] = useState(false);

  // Role Management Matrix State
  const [rolesList, setRolesList] = useState([
    {
      id: 'superadmin',
      name: 'Super Administrator',
      count: 2,
      permissions: ['Kelola Sekolah', 'Kelola Billing', 'Akses Sistem', 'Audit Forensik', 'Ekspor Data'],
      color: 'indigo',
    },
    {
      id: 'admin_sekolah',
      name: 'Admin Sekolah',
      count: 48,
      permissions: ['Kelola Guru & Siswa', 'Jadwal & Kelas', 'Presensi Harian', 'Laporan Sekolah'],
      color: 'blue',
    },
    {
      id: 'guru',
      name: 'Guru / Pendidik',
      count: 145,
      permissions: ['Input Presensi Kelas', 'Jurnal Mengajar', 'Lihat Siswa Kelas'],
      color: 'emerald',
    },
    {
      id: 'siswa',
      name: 'Siswa / Siswi',
      count: 1840,
      permissions: ['Lihat Riwayat Presensi', 'Jadwal Pelajaran', 'QR Scan Kartu'],
      color: 'amber',
    },
    {
      id: 'orang_tua',
      name: 'Orang Tua / Wali',
      count: 1250,
      permissions: ['Monitoring Presensi Anak', 'Notifikasi Masuk/Pulang', 'Pengajuan Izin'],
      color: 'rose',
    },
  ]);

  // Akses Menu Feature Toggles State
  const [menuAccessToggles, setMenuAccessToggles] = useState([
    { id: 'presensi_qr', name: 'Presensi QR Code Interaktif', desc: 'Scan barcode & QR siswa dan guru', enabled: true },
    { id: 'parent_monitoring', name: 'Portal Monitoring Orang Tua', desc: 'Akses real-time notifikasi presensi anak', enabled: true },
    { id: 'payment_midtrans', name: 'Pembayaran SPP Online (Midtrans)', desc: 'Pembayaran tagihan via VA, QRIS, e-wallet', enabled: true },
    { id: 'ai_assistant', name: 'Asisten AI Rekap Cerdas', desc: 'Analisis tingkat kehadiran prediktif siswa', enabled: true },
    { id: 'multi_tenant_billing', name: 'Billing & Langganan Sekolah', desc: 'Pengingat invoice lisensi SaaS sekolah', enabled: true },
    { id: 'biometric_kiosk', name: 'Mode Kiosk Tablet Sekolah', desc: 'Tampilan tablet scanner di gerbang sekolah', enabled: true },
  ]);

  // Helper closeModal
  const closeModal = () => {
    setActiveModal(null);
    onSubTabChange?.('informasi');
  };

  // Handle external subTab if triggered
  useEffect(() => {
    if (activeSubTab) {
      if (['keamanan', 'audit', 'log'].includes(activeSubTab)) {
        setActiveModal('log-aktivitas');
      } else if (['gateway', 'midtrans', 'integrasi'].includes(activeSubTab)) {
        setActiveModal('integrasi');
      } else if (['ekspor', 'backup', 'restore'].includes(activeSubTab)) {
        setActiveModal('backup-restore');
      } else if (['siaran', 'broadcast', 'notifikasi'].includes(activeSubTab)) {
        setActiveModal('notifikasi');
      } else if (['role', 'kelola-role', 'rbac'].includes(activeSubTab)) {
        setActiveModal('kelola-role');
      } else if (['akses_menu', 'akses-menu', 'fitur'].includes(activeSubTab)) {
        setActiveModal('akses-menu');
      } else if (['konfigurasi', 'identitas', 'pengaturan'].includes(activeSubTab)) {
        setActiveModal('identitas');
      } else if (['informasi', 'server', 'info'].includes(activeSubTab)) {
        setActiveModal(null);
      }
    }
  }, [activeSubTab]);

  // Sync Global Announcement
  useEffect(() => {
    if (globalAnnouncement) {
      setBroadcastMsg(globalAnnouncement.message || '');
      setBroadcastType(globalAnnouncement.type || 'info');
      setBroadcastActive(globalAnnouncement.active || false);
    }
  }, [globalAnnouncement]);

  // Load Midtrans
  const loadGatewayConfig = async () => {
    setLoadingGateway(true);
    try {
      const midRes = await call('get_midtrans_config').catch(() => ({ midtrans: {} }));
      if (midRes?.midtrans) {
        setMidtransConfig((prev: any) => ({ ...prev, ...midRes.midtrans }));
      }
    } catch (e: any) {
      // quiet fallback
    } finally {
      setLoadingGateway(false);
    }
  };

  useEffect(() => {
    if (activeModal === 'integrasi') {
      loadGatewayConfig();
    }
  }, [activeModal]);

  // Save System Info
  const handleSaveSystemInfo = (e: React.FormEvent) => {
    e.preventDefault();
    setSystemInfo(editInfoForm);
    try {
      localStorage.setItem('kawacanaan_system_info', JSON.stringify(editInfoForm));
    } catch (_) {}
    showToast('Informasi sistem berhasil diperbarui.', 'success');
    setActiveModal(null);
  };

  // Save Broadcast
  const handleSaveAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingBroadcast(true);
    try {
      await updateGlobalAnnouncement({
        message: broadcastMsg.trim(),
        type: broadcastType,
        active: broadcastActive,
      });
      showToast(
        broadcastActive
          ? 'Pita pengumuman global berhasil disiarkan ke seluruh sekolah.'
          : 'Pengumuman global dinonaktifkan.',
        'success'
      );
    } catch (err: any) {
      showToast(err.message || 'Gagal menyimpan pengumuman.', 'error');
    } finally {
      setSavingBroadcast(false);
    }
  };

  // Save Midtrans
  const handleSaveMidtrans = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingMidtrans(true);
    try {
      await call('update_midtrans_config', {
        midtrans: {
          client_key: midtransConfig.client_key?.trim(),
          server_key: midtransConfig.server_key?.trim() || undefined,
          merchant_id: midtransConfig.merchant_id?.trim(),
          is_production: false,
          enabled: Boolean(midtransConfig.enabled),
        },
      });
      showToast('Konfigurasi Midtrans Gateway berhasil disimpan.', 'success');
      loadGatewayConfig();
    } catch (e: any) {
      showToast(e.message || 'Gagal menyimpan konfigurasi Midtrans.', 'error');
    } finally {
      setSavingMidtrans(false);
    }
  };

  // Test Midtrans
  const handleTestMidtrans = async () => {
    setTestingMidtrans(true);
    try {
      const res = await call('test_midtrans');
      if (res.ok) {
        showToast(res.message || 'Koneksi Midtrans Sandbox valid & aktif.', 'success');
      } else {
        showToast(res.error || 'Uji koneksi Midtrans gagal.', 'error');
      }
    } catch (e: any) {
      showToast(e.message || 'Uji koneksi Midtrans gagal.', 'error');
    } finally {
      setTestingMidtrans(false);
    }
  };

  // Change Password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      showToast('Password baru minimal 8 karakter.', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('Konfirmasi password tidak cocok.', 'error');
      return;
    }
    setSavingPassword(true);
    try {
      await call('reset_admin_password', {
        user_id: 'superadmin',
        new_password: newPassword,
      });
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      showToast('Password Super Administrator berhasil diperbarui.', 'success');
      setActiveModal(null);
    } catch (err: any) {
      showToast(err.message || 'Gagal memperbarui password.', 'error');
    } finally {
      setSavingPassword(false);
    }
  };

  // Update Super Admin Account (Email / Google SSO target)
  const handleUpdateSuperAdminEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!superAdminEmail || !superAdminEmail.includes('@')) {
      showToast('Format email tidak valid.', 'error');
      return;
    }
    setSavingSuperAdminEmail(true);
    try {
      const res = await fetch('/api/setup-superadmin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_superadmin_account', email: superAdminEmail.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast(data.message || `Akun Super Admin berhasil disinkronkan ke ${superAdminEmail}`, 'success');
        setActiveModal(null);
      } else {
        showToast(data.error || 'Gagal memperbarui email akun Super Admin.', 'error');
      }
    } catch (err: any) {
      showToast(err?.message || 'Gagal memperbarui akun Super Admin.', 'error');
    } finally {
      setSavingSuperAdminEmail(false);
    }
  };

  // Instant JSON Backup Downloader
  const handleInstantBackupJSON = async () => {
    showToast('Menyiapkan cadangan lengkap sistem...', 'info');
    try {
      const res = await call('list').catch(() => ({ schools: [] }));
      const backupPayload = {
        metadata: {
          platform: 'Kawacanaan Multi-Tenant Presensi',
          export_date: new Date().toISOString(),
          version: systemInfo.version,
          environment: systemInfo.environment,
        },
        system_info: systemInfo,
        data: res,
      };

      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupPayload, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute(
        'download',
        `kawacanaan_backup_sistem_${new Date().toISOString().slice(0, 10)}.json`
      );
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      showToast('Cadangan data sistem berhasil diunduh (JSON).', 'success');
    } catch (e: any) {
      showToast(e.message || 'Gagal mengunduh cadangan sistem.', 'error');
    }
  };

  // Helper CSV Downloader
  const downloadCSV = (filename: string, headers: string[], rows: any[][]) => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [
        headers.join(','),
        ...rows.map((e) =>
          e.map((val) => `"${String(val ?? '').replace(/"/g, '""')}"`).join(',')
        ),
      ].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportSchools = async () => {
    try {
      const res = await call('list');
      const schools = res.schools || [];
      const headers = ['ID', 'Nama Sekolah', 'NPSN', 'Paket', 'Status', 'Siswa', 'Guru/Admin', 'Masa Berlaku'];
      const rows = schools.map((s: any) => [
        s.school_id || s.id,
        s.name,
        s.npsn || '-',
        s.plan,
        s.status,
        s.student_count || 0,
        s.teacher_admin_count || 0,
        s.subscription_expires_at || 'Tanpa Batas',
      ]);
      downloadCSV('data_tenant_sekolah', headers, rows);
      showToast('Data tenant sekolah berhasil diekspor ke CSV.', 'success');
    } catch (e: any) {
      showToast(e.message || 'Gagal ekspor sekolah.', 'error');
    }
  };

  const handleExportUsers = async () => {
    try {
      const res = await call('list_users', { school_id: 'all' });
      const users = res.users || [];
      const headers = ['ID', 'Nama', 'Username', 'Email', 'Role', 'Sekolah', 'Status'];
      const rows = users.map((u: any) => [
        u.id,
        u.name || '-',
        u.username || '-',
        u.email || '-',
        u.role || 'ADMIN',
        u.school_name || '-',
        u.is_active !== false ? 'Aktif' : 'Nonaktif',
      ]);
      downloadCSV('data_pengguna_platform', headers, rows);
      showToast('Data seluruh pengguna platform berhasil diekspor.', 'success');
    } catch (e: any) {
      showToast(e.message || 'Gagal ekspor pengguna.', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* ========================================================================= */}
      {/* 1. HEADER BANNER PENGATURAN SISTEM (SESUAI GAMBAR REFERENSI)               */}
      {/* ========================================================================= */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-sky-50/90 via-blue-50/70 to-indigo-50/80 border border-sky-100/90 p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          {/* Sisi Kiri: Ikon Cyan Squircle + Judul + Deskripsi */}
          <div className="flex items-start sm:items-center gap-4.5">
            <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-cyan-500 text-white flex items-center justify-center shadow-lg shadow-cyan-500/25 shrink-0">
              <Settings size={28} className="text-white" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Pengaturan Sistem
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1 max-w-2xl leading-relaxed">
                Kelola konfigurasi aplikasi, role, akses menu, dan log aktivitas untuk menjaga keamanan dan stabilitas sistem.
              </p>
            </div>
          </div>

          {/* Sisi Kanan: Ilustrasi 3D Laptop + Floating Gear + Shield */}
          <div className="hidden md:flex items-center justify-end shrink-0">
            <SystemBannerIllustration className="w-48 sm:w-60 h-28 sm:h-32" />
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. 4 KARTU METRIK & STATUS SISTEM (KPI ROW SESUAI REFERENSI)               */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Kartu 1: Versi Aplikasi */}
        <div className="bg-white rounded-2xl border border-slate-100/90 shadow-xs p-5 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div className="w-11 h-11 rounded-xl bg-indigo-500 text-white flex items-center justify-center shadow-sm shadow-indigo-500/20 shrink-0">
              <Layers size={20} />
            </div>
            <div className="text-right">
              <div className="text-xs font-semibold text-slate-500">Versi Aplikasi</div>
              <div className="flex items-center justify-end gap-2 mt-1">
                <span className="text-2xl font-black text-slate-900 tracking-tight">
                  v{systemInfo.version}
                </span>
                <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                  Terbaru
                </span>
              </div>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-medium">
            <span>Terakhir diperbarui:</span>
            <span className="font-semibold text-slate-600">12 Sep 2026</span>
          </div>
        </div>

        {/* Kartu 2: Database */}
        <div className="bg-white rounded-2xl border border-slate-100/90 shadow-xs p-5 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div className="w-11 h-11 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-sm shadow-emerald-500/20 shrink-0">
              <Database size={20} />
            </div>
            <div className="text-right">
              <div className="text-xs font-semibold text-slate-500">Database</div>
              <div className="flex items-center justify-end gap-1.5 mt-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                <span className="text-2xl font-black text-slate-900 tracking-tight">Online</span>
              </div>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-medium">
            <span>Uptime:</span>
            <span className="font-semibold text-emerald-600">99.98%</span>
          </div>
        </div>

        {/* Kartu 3: Status Sistem */}
        <div className="bg-white rounded-2xl border border-slate-100/90 shadow-xs p-5 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div className="w-11 h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm shadow-blue-600/20 shrink-0">
              <ShieldCheck size={20} />
            </div>
            <div className="text-right">
              <div className="text-xs font-semibold text-slate-500">Status Sistem</div>
              <div className="flex items-center justify-end gap-1.5 mt-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                <span className="text-2xl font-black text-slate-900 tracking-tight">Normal</span>
              </div>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-medium truncate">
            <span className="truncate">Semua layanan berjalan dengan baik</span>
          </div>
        </div>

        {/* Kartu 4: Total Pengguna */}
        <div className="bg-white rounded-2xl border border-slate-100/90 shadow-xs p-5 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div className="w-11 h-11 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-sm shadow-purple-600/20 shrink-0">
              <Users size={20} />
            </div>
            <div className="text-right">
              <div className="text-xs font-semibold text-slate-500">Total Pengguna</div>
              <div className="text-2xl font-black text-slate-900 tracking-tight mt-1">
                248
              </div>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Aktif: 231
            </span>
            <span className="flex items-center gap-1 text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span> Nonaktif: 17
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. KONTEN UTAMA: 3 KOLOM SESUAI REFERENSI VISUAL                           */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ======================================================================= */}
        {/* KOLOM 1: INFORMASI SISTEM (lg:col-span-5)                                */}
        {/* ======================================================================= */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-100/90 shadow-xs p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <FileText size={18} />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-black text-slate-900">Informasi Sistem</h3>
                <p className="text-[11px] text-slate-400 font-normal">
                  Detail informasi dan konfigurasi dasar aplikasi.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setEditInfoForm(systemInfo);
                setActiveModal('edit-info');
              }}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-blue-600 hover:bg-blue-50/70 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition shadow-2xs"
            >
              <Edit3 size={13} />
              <span>Edit Informasi</span>
            </button>
          </div>

          {/* List Baris Informasi Sistem */}
          <div className="divide-y divide-slate-100 text-xs">
            <div className="py-2.5 flex items-center justify-between">
              <span className="text-slate-500 font-medium">Nama Aplikasi</span>
              <span className="font-bold text-slate-900">{systemInfo.appName}</span>
            </div>

            <div className="py-2.5 flex items-center justify-between">
              <span className="text-slate-500 font-medium">Versi</span>
              <span className="font-semibold text-slate-800">{systemInfo.version}</span>
            </div>

            <div className="py-2.5 flex items-center justify-between">
              <span className="text-slate-500 font-medium">Environment</span>
              <span className="bg-emerald-50 text-emerald-700 text-[11px] font-bold px-2 py-0.5 rounded-md border border-emerald-200">
                {systemInfo.environment}
              </span>
            </div>

            <div className="py-2.5 flex items-center justify-between gap-4">
              <span className="text-slate-500 font-medium shrink-0">URL Aplikasi</span>
              <a
                href={systemInfo.appUrl}
                target="_blank"
                rel="noreferrer"
                className="font-semibold text-blue-600 hover:underline truncate text-right flex items-center gap-1"
              >
                <span className="truncate">{systemInfo.appUrl}</span>
                <ExternalLink size={12} className="shrink-0" />
              </a>
            </div>

            <div className="py-2.5 flex items-center justify-between">
              <span className="text-slate-500 font-medium">Database</span>
              <span className="font-semibold text-slate-800">{systemInfo.database}</span>
            </div>

            <div className="py-2.5 flex items-center justify-between">
              <span className="text-slate-500 font-medium">Server</span>
              <span className="font-semibold text-slate-800">{systemInfo.server}</span>
            </div>

            <div className="py-2.5 flex items-center justify-between">
              <span className="text-slate-500 font-medium">Timezone</span>
              <span className="font-semibold text-slate-800">{systemInfo.timezone}</span>
            </div>

            <div className="py-2.5 flex items-center justify-between">
              <span className="text-slate-500 font-medium">Tanggal Instalasi</span>
              <span className="font-semibold text-slate-800">{systemInfo.installDate}</span>
            </div>

            <div className="py-2.5 flex items-center justify-between">
              <span className="text-slate-500 font-medium">Build Number</span>
              <span className="font-mono font-semibold text-slate-700">{systemInfo.buildNumber}</span>
            </div>

            <div className="py-2.5 flex items-center justify-between">
              <span className="text-slate-500 font-medium">Lisensi</span>
              <span className="font-semibold text-slate-900">{systemInfo.license}</span>
            </div>
          </div>
        </div>

        {/* ======================================================================= */}
        {/* KOLOM 2: PENGATURAN UMUM (lg:col-span-4)                                 */}
        {/* ======================================================================= */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-100/90 shadow-xs p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Settings size={18} />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-slate-900">Pengaturan Umum</h3>
              <p className="text-[11px] text-slate-400 font-normal">
                Konfigurasi global aplikasi.
              </p>
            </div>
          </div>

          {/* List 5 Kartu Pengaturan Global */}
          <div className="space-y-2.5">
            {/* 1. Identitas Aplikasi */}
            <button
              type="button"
              onClick={() => setActiveModal('identitas')}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50/70 hover:bg-blue-50/50 border border-slate-100 hover:border-blue-200 text-left transition group cursor-pointer"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-blue-500 text-white flex items-center justify-center shadow-xs shrink-0">
                  <UserCheck size={18} />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-700 transition">
                    Identitas Aplikasi
                  </h4>
                  <p className="text-[11px] text-slate-400 font-normal truncate">
                    Nama, logo, dan informasi perusahaan
                  </p>
                </div>
              </div>
              <ChevronRight size={16} className="text-slate-300 group-hover:text-blue-600 transition shrink-0 ml-2" />
            </button>

            {/* 2. Notifikasi & Email */}
            <button
              type="button"
              onClick={() => setActiveModal('notifikasi')}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50/70 hover:bg-indigo-50/50 border border-slate-100 hover:border-indigo-200 text-left transition group cursor-pointer"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-indigo-500 text-white flex items-center justify-center shadow-xs shrink-0">
                  <Mail size={18} />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-slate-900 group-hover:text-indigo-700 transition">
                    Notifikasi & Email
                  </h4>
                  <p className="text-[11px] text-slate-400 font-normal truncate">
                    Pengaturan email dan notifikasi sistem
                  </p>
                </div>
              </div>
              <ChevronRight size={16} className="text-slate-300 group-hover:text-indigo-600 transition shrink-0 ml-2" />
            </button>

            {/* 3. Integrasi */}
            <button
              type="button"
              onClick={() => setActiveModal('integrasi')}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50/70 hover:bg-emerald-50/50 border border-slate-100 hover:border-emerald-200 text-left transition group cursor-pointer"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-xs shrink-0">
                  <LinkIcon size={18} />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-slate-900 group-hover:text-emerald-700 transition">
                    Integrasi
                  </h4>
                  <p className="text-[11px] text-slate-400 font-normal truncate">
                    API, webhook, dan layanan eksternal
                  </p>
                </div>
              </div>
              <ChevronRight size={16} className="text-slate-300 group-hover:text-emerald-600 transition shrink-0 ml-2" />
            </button>

            {/* 4. Keamanan */}
            <button
              type="button"
              onClick={() => setActiveModal('keamanan')}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50/70 hover:bg-amber-50/50 border border-slate-100 hover:border-amber-200 text-left transition group cursor-pointer"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs shrink-0">
                  <Lock size={18} />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-slate-900 group-hover:text-amber-700 transition">
                    Keamanan
                  </h4>
                  <p className="text-[11px] text-slate-400 font-normal truncate">
                    Pengaturan keamanan dan enkripsi
                  </p>
                </div>
              </div>
              <ChevronRight size={16} className="text-slate-300 group-hover:text-amber-600 transition shrink-0 ml-2" />
            </button>

            {/* 5. Backup & Restore */}
            <button
              type="button"
              onClick={() => setActiveModal('backup-restore')}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50/70 hover:bg-rose-50/50 border border-slate-100 hover:border-rose-200 text-left transition group cursor-pointer"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-rose-500 text-white flex items-center justify-center shadow-xs shrink-0">
                  <RefreshCw size={18} />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-slate-900 group-hover:text-rose-700 transition">
                    Backup & Restore
                  </h4>
                  <p className="text-[11px] text-slate-400 font-normal truncate">
                    Jadwal backup dan pemulihan data
                  </p>
                </div>
              </div>
              <ChevronRight size={16} className="text-slate-300 group-hover:text-rose-600 transition shrink-0 ml-2" />
            </button>
          </div>
        </div>

        {/* ======================================================================= */}
        {/* KOLOM 3: STATUS LAYANAN & AKSI CEPAT (lg:col-span-3)                    */}
        {/* ======================================================================= */}
        <div className="lg:col-span-3 space-y-5">
          {/* Card 3A: Status Layanan */}
          <div className="bg-white rounded-2xl border border-slate-100/90 shadow-xs p-5 space-y-3.5">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Activity size={16} />
              </div>
              <div>
                <h3 className="text-xs font-black text-slate-900">Status Layanan</h3>
                <p className="text-[10px] text-slate-400">Monitoring sistem secara real-time.</p>
              </div>
            </div>

            {/* Daftar 6 Layanan & Status */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between py-1">
                <div className="flex items-center gap-2 text-slate-700 font-medium">
                  <Globe size={14} className="text-slate-400" />
                  <span>Web Server</span>
                </div>
                <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Online
                </span>
              </div>

              <div className="flex items-center justify-between py-1">
                <div className="flex items-center gap-2 text-slate-700 font-medium">
                  <Database size={14} className="text-slate-400" />
                  <span>Database</span>
                </div>
                <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Online
                </span>
              </div>

              <div className="flex items-center justify-between py-1">
                <div className="flex items-center gap-2 text-slate-700 font-medium">
                  <Layers size={14} className="text-slate-400" />
                  <span>Cache (Redis)</span>
                </div>
                <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Online
                </span>
              </div>

              <div className="flex items-center justify-between py-1">
                <div className="flex items-center gap-2 text-slate-700 font-medium">
                  <Mail size={14} className="text-slate-400" />
                  <span>Email Service</span>
                </div>
                <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Online
                </span>
              </div>

              <div className="flex items-center justify-between py-1">
                <div className="flex items-center gap-2 text-slate-700 font-medium">
                  <FolderArchive size={14} className="text-slate-400" />
                  <span>File Storage</span>
                </div>
                <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Online
                </span>
              </div>

              <div className="flex items-center justify-between py-1">
                <div className="flex items-center gap-2 text-slate-700 font-medium">
                  <CreditCard size={14} className="text-slate-400" />
                  <span>Payment Gateway</span>
                </div>
                <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Online
                </span>
              </div>
            </div>
          </div>

          {/* Card 3B: Aksi Cepat (2x2 Grid) */}
          <div className="bg-white rounded-2xl border border-slate-100/90 shadow-xs p-5 space-y-3.5">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Sparkles size={16} />
              </div>
              <div>
                <h3 className="text-xs font-black text-slate-900">Aksi Cepat</h3>
                <p className="text-[10px] text-slate-400">Lakukan pengaturan dengan cepat.</p>
              </div>
            </div>

            {/* Grid 2x2 Tombol Aksi Cepat */}
            <div className="grid grid-cols-2 gap-2.5">
              {/* 1. Kelola Role */}
              <button
                type="button"
                onClick={() => setActiveModal('kelola-role')}
                className="p-3 rounded-xl bg-slate-50/80 hover:bg-indigo-50/60 border border-slate-100 hover:border-indigo-200 transition group flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0">
                    <Users size={14} />
                  </div>
                  <span className="text-[11px] font-bold text-slate-800 group-hover:text-indigo-700 truncate">
                    Kelola Role
                  </span>
                </div>
                <ChevronRight size={14} className="text-slate-300 group-hover:text-indigo-600 shrink-0" />
              </button>

              {/* 2. Akses Menu */}
              <button
                type="button"
                onClick={() => setActiveModal('akses-menu')}
                className="p-3 rounded-xl bg-slate-50/80 hover:bg-blue-50/60 border border-slate-100 hover:border-blue-200 transition group flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
                    <Sliders size={14} />
                  </div>
                  <span className="text-[11px] font-bold text-slate-800 group-hover:text-blue-700 truncate">
                    Akses Menu
                  </span>
                </div>
                <ChevronRight size={14} className="text-slate-300 group-hover:text-blue-600 shrink-0" />
              </button>

              {/* 3. Lihat Log Aktivitas */}
              <button
                type="button"
                onClick={() => setActiveModal('log-aktivitas')}
                className="p-3 rounded-xl bg-slate-50/80 hover:bg-amber-50/60 border border-slate-100 hover:border-amber-200 transition group flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0">
                    <FileText size={14} />
                  </div>
                  <span className="text-[11px] font-bold text-slate-800 group-hover:text-amber-700 truncate">
                    Log Aktivitas
                  </span>
                </div>
                <ChevronRight size={14} className="text-slate-300 group-hover:text-amber-600 shrink-0" />
              </button>

              {/* 4. Backup Data */}
              <button
                type="button"
                onClick={handleInstantBackupJSON}
                className="p-3 rounded-xl bg-slate-50/80 hover:bg-emerald-50/60 border border-slate-100 hover:border-emerald-200 transition group flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                    <HardDriveDownload size={14} />
                  </div>
                  <span className="text-[11px] font-bold text-slate-800 group-hover:text-emerald-700 truncate">
                    Backup Data
                  </span>
                </div>
                <ChevronRight size={14} className="text-slate-300 group-hover:text-emerald-600 shrink-0" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. BOTTOM NOTICE BANNER (PENTING! SESUAI REFERENSI VISUAL)                 */}
      {/* ========================================================================= */}
      <div className="bg-blue-50/80 border border-blue-200/80 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 font-bold shadow-xs">
            <Info size={16} />
          </div>
          <div>
            <span className="font-black text-slate-900 text-xs sm:text-sm">Penting! </span>
            <span className="text-xs text-slate-600 font-medium">
              Pastikan semua pengaturan sistem telah sesuai sebelum melakukan perubahan. Perubahan pada pengaturan sistem dapat mempengaruhi seluruh pengguna.
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setActiveModal('panduan')}
          className="px-4 py-2 rounded-xl bg-white hover:bg-blue-50/60 border border-blue-200 text-blue-700 text-xs font-bold flex items-center gap-1.5 shadow-xs transition shrink-0 cursor-pointer self-start sm:self-auto"
        >
          <BookOpen size={14} />
          <span>Lihat Panduan</span>
          <ChevronRight size={14} />
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 5. MODAL-MODAL INTERAKTIF SISTEM LENGKAP                                   */}
      {/* ========================================================================= */}

      {/* Modal A: Edit Informasi Sistem */}
      {activeModal === 'edit-info' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Edit3 size={16} />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Edit Informasi Sistem</h3>
                  <p className="text-xs text-slate-400">Ubah konfigurasi dan detail informasi aplikasi</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveSystemInfo} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Aplikasi</label>
                <input
                  type="text"
                  required
                  value={editInfoForm.appName}
                  onChange={(e) => setEditInfoForm({ ...editInfoForm, appName: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 font-medium focus:outline-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Versi</label>
                  <input
                    type="text"
                    required
                    value={editInfoForm.version}
                    onChange={(e) => setEditInfoForm({ ...editInfoForm, version: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 font-medium focus:outline-blue-600"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Environment</label>
                  <select
                    value={editInfoForm.environment}
                    onChange={(e) => setEditInfoForm({ ...editInfoForm, environment: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 font-medium focus:outline-blue-600 bg-white"
                  >
                    <option value="Production">Production</option>
                    <option value="Staging">Staging</option>
                    <option value="Development">Development</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">URL Aplikasi</label>
                <input
                  type="url"
                  required
                  value={editInfoForm.appUrl}
                  onChange={(e) => setEditInfoForm({ ...editInfoForm, appUrl: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 font-medium focus:outline-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Database</label>
                  <input
                    type="text"
                    required
                    value={editInfoForm.database}
                    onChange={(e) => setEditInfoForm({ ...editInfoForm, database: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 font-medium focus:outline-blue-600"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Server Runtime</label>
                  <input
                    type="text"
                    required
                    value={editInfoForm.server}
                    onChange={(e) => setEditInfoForm({ ...editInfoForm, server: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 font-medium focus:outline-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Timezone</label>
                  <input
                    type="text"
                    required
                    value={editInfoForm.timezone}
                    onChange={(e) => setEditInfoForm({ ...editInfoForm, timezone: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 font-medium focus:outline-blue-600"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Build Number</label>
                  <input
                    type="text"
                    required
                    value={editInfoForm.buildNumber}
                    onChange={(e) => setEditInfoForm({ ...editInfoForm, buildNumber: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 font-mono font-medium focus:outline-blue-600"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Save size={14} />
                  <span>Simpan Perubahan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal B: Identitas Aplikasi */}
      {activeModal === 'identitas' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <UserCheck size={16} />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Identitas Aplikasi</h3>
                  <p className="text-xs text-slate-400">Konfigurasi nama instansi, logo, dan kontak resmi</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                showToast('Identitas aplikasi berhasil diperbarui.', 'success');
                setActiveModal(null);
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Perusahaan / Developer</label>
                <input
                  type="text"
                  required
                  value={appIdentity.companyName}
                  onChange={(e) => setAppIdentity({ ...appIdentity, companyName: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 font-medium focus:outline-blue-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Tagline Sistem</label>
                <input
                  type="text"
                  value={appIdentity.tagline}
                  onChange={(e) => setAppIdentity({ ...appIdentity, tagline: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 font-medium focus:outline-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email Dukungan</label>
                  <input
                    type="email"
                    value={appIdentity.supportEmail}
                    onChange={(e) => setAppIdentity({ ...appIdentity, supportEmail: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 font-medium focus:outline-blue-600"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Telepon / WhatsApp</label>
                  <input
                    type="text"
                    value={appIdentity.supportPhone}
                    onChange={(e) => setAppIdentity({ ...appIdentity, supportPhone: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 font-medium focus:outline-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Alamat Kantor</label>
                <textarea
                  rows={2}
                  value={appIdentity.address}
                  onChange={(e) => setAppIdentity({ ...appIdentity, address: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 font-medium focus:outline-blue-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Tutup
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Save size={14} />
                  <span>Simpan Identitas</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal C: Notifikasi & Email */}
      {activeModal === 'notifikasi' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-xl rounded-3xl p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Mail size={16} />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Notifikasi & Email</h3>
                  <p className="text-xs text-slate-400">Kelola pengumuman pita siaran dan konfigurasi SMTP</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Bagian 1: Pita Siaran Global */}
            <form onSubmit={handleSaveAnnouncement} className="space-y-4 p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-indigo-900 font-bold text-xs">
                  <Megaphone size={16} />
                  <span>Pita Pengumuman Broadcast Global</span>
                </div>
                <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={broadcastActive}
                    onChange={(e) => setBroadcastActive(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                  <span>Siarkan</span>
                </label>
              </div>

              <div>
                <textarea
                  rows={2}
                  required
                  value={broadcastMsg}
                  onChange={(e) => setBroadcastMsg(e.target.value)}
                  placeholder="Contoh: Pemeliharaan server dijadwalkan pada hari Sabtu pukul 23:00 WIB."
                  className="w-full px-3.5 py-2 rounded-xl border border-indigo-200 bg-white text-xs font-medium focus:outline-indigo-600"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-xs">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="btype"
                      value="info"
                      checked={broadcastType === 'info'}
                      onChange={() => setBroadcastType('info')}
                    />
                    <span>Info</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="btype"
                      value="warning"
                      checked={broadcastType === 'warning'}
                      onChange={() => setBroadcastType('warning')}
                    />
                    <span>Peringatan</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="btype"
                      value="alert"
                      checked={broadcastType === 'alert'}
                      onChange={() => setBroadcastType('alert')}
                    />
                    <span>Kritis</span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={savingBroadcast}
                  className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {savingBroadcast ? <RefreshCw size={12} className="animate-spin" /> : <Save size={12} />}
                  <span>Simpan Broadcast</span>
                </button>
              </div>
            </form>

            {/* Bagian 2: SMTP Relay Email */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-black text-slate-800">Konfigurasi SMTP Email Server</h4>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-600 mb-1">SMTP Host</label>
                  <input
                    type="text"
                    value={emailSmtp.host}
                    onChange={(e) => setEmailSmtp({ ...emailSmtp, host: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-600 mb-1">Port</label>
                  <input
                    type="text"
                    value={emailSmtp.port}
                    onChange={(e) => setEmailSmtp({ ...emailSmtp, port: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-600 mb-1">Sender Email</label>
                  <input
                    type="email"
                    value={emailSmtp.senderEmail}
                    onChange={(e) => setEmailSmtp({ ...emailSmtp, senderEmail: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-600 mb-1">Enkripsi</label>
                  <select
                    value={emailSmtp.encryption}
                    onChange={(e) => setEmailSmtp({ ...emailSmtp, encryption: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-medium bg-white"
                  >
                    <option value="TLS">TLS (Recommended)</option>
                    <option value="SSL">SSL</option>
                    <option value="NONE">None</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  showToast('Pengaturan notifikasi & email disimpan.', 'success');
                  setActiveModal(null);
                }}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                Selesai
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal D: Integrasi & API Webhook */}
      {activeModal === 'integrasi' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-xl rounded-3xl p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <LinkIcon size={16} />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Integrasi & Layanan Eksternal</h3>
                  <p className="text-xs text-slate-400">Payment gateway Midtrans, webhook API, dan integrasi cloud</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form Midtrans */}
            <form onSubmit={handleSaveMidtrans} className="space-y-4 text-xs">
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200/80">
                <div className="flex items-center gap-2 text-emerald-900 font-bold">
                  <CreditCard size={18} />
                  <span>Midtrans Payment Gateway (Snap & Core API)</span>
                </div>
                <label className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={midtransConfig.enabled}
                    onChange={(e) => setMidtransConfig({ ...midtransConfig, enabled: e.target.checked })}
                    className="w-4 h-4 rounded text-emerald-600"
                  />
                  <span>Aktif</span>
                </label>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Merchant ID</label>
                <input
                  type="text"
                  value={midtransConfig.merchant_id || ''}
                  onChange={(e) => setMidtransConfig({ ...midtransConfig, merchant_id: e.target.value })}
                  placeholder="G123456789"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 font-mono font-medium focus:outline-emerald-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Client Key</label>
                <input
                  type="text"
                  value={midtransConfig.client_key || ''}
                  onChange={(e) => setMidtransConfig({ ...midtransConfig, client_key: e.target.value })}
                  placeholder="SB-Mid-client-xxxxxxxx"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 font-mono font-medium focus:outline-emerald-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Server Key</label>
                <input
                  type="password"
                  value={midtransConfig.server_key || ''}
                  onChange={(e) => setMidtransConfig({ ...midtransConfig, server_key: e.target.value })}
                  placeholder="SB-Mid-server-xxxxxxxx (tetap rahasia)"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 font-mono font-medium focus:outline-emerald-600"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={handleTestMidtrans}
                  disabled={testingMidtrans}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw size={13} className={testingMidtrans ? 'animate-spin text-emerald-600' : ''} />
                  <span>Uji Koneksi Sandbox</span>
                </button>

                <button
                  type="submit"
                  disabled={savingMidtrans}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {savingMidtrans ? <RefreshCw size={13} className="animate-spin" /> : <Save size={13} />}
                  <span>Simpan Konfigurasi</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal E: Keamanan Sistem */}
      {activeModal === 'keamanan' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Lock size={16} />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Keamanan & Password</h3>
                  <p className="text-xs text-slate-400">Pengaturan proteksi akun Super Administrator</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                    <UserCheck size={14} className="text-amber-600" />
                    <span>Akun Super Admin & Google SSO</span>
                  </h4>
                  <p className="text-[11px] text-amber-800/80">
                    Kaitkan akun Super Administrator tunggal dengan email Google SSO
                  </p>
                </div>
              </div>
              <form onSubmit={handleUpdateSuperAdminEmail} className="flex gap-2">
                <input
                  type="email"
                  required
                  placeholder="30mey94@gmail.com"
                  value={superAdminEmail}
                  onChange={(e) => setSuperAdminEmail(e.target.value)}
                  className="flex-1 px-3 py-1.5 rounded-xl border border-amber-200 bg-white font-medium text-xs focus:outline-amber-600"
                />
                <button
                  type="submit"
                  disabled={savingSuperAdminEmail}
                  className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-1 shadow-xs cursor-pointer disabled:opacity-60 shrink-0"
                >
                  {savingSuperAdminEmail ? <RefreshCw size={12} className="animate-spin" /> : <Save size={12} />}
                  <span>Simpan Email</span>
                </button>
              </form>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Password Saat Ini</label>
                <input
                  type="password"
                  required
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="Masukkan password saat ini"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 font-medium focus:outline-amber-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Password Baru (min. 8 karakter)</label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Password baru yang kuat"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 font-medium focus:outline-amber-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Konfirmasi Password Baru</label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ulangi password baru"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 font-medium focus:outline-amber-600"
                />
              </div>

              <div className="pt-2 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-800">Autentikasi Dua Langkah (2FA)</div>
                    <div className="text-[11px] text-slate-400">Wajibkan verifikasi OTP saat login administrator</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={twoFactorEnabled}
                    onChange={(e) => setTwoFactorEnabled(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-600 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-800">Batas Waktu Sesi (Menit)</div>
                    <div className="text-[11px] text-slate-400">Logout otomatis setelah tidak aktif</div>
                  </div>
                  <select
                    value={sessionTimeout}
                    onChange={(e) => setSessionTimeout(e.target.value)}
                    className="px-2.5 py-1 rounded-lg border border-slate-200 font-bold bg-white text-slate-700"
                  >
                    <option value="30">30 Menit</option>
                    <option value="60">60 Menit</option>
                    <option value="120">2 Jam</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={savingPassword}
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {savingPassword ? <RefreshCw size={14} className="animate-spin" /> : <Lock size={14} />}
                  <span>Perbarui Kata Sandi</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal F: Backup & Restore */}
      {activeModal === 'backup-restore' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                  <RefreshCw size={16} />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Cadangan & Pemulihan Data</h3>
                  <p className="text-xs text-slate-400">Unduh data multi-tabel dalam format JSON atau CSV</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                <div className="font-bold text-slate-900 flex items-center gap-2">
                  <Database size={16} className="text-rose-600" />
                  <span>Cadangan Lengkap Platform (JSON)</span>
                </div>
                <p className="text-slate-500 text-[11px] leading-relaxed">
                  Menyimpan seluruh schema database, data tenant sekolah, pengguna, transaksi, dan log audit dalam satu berkas terenkripsi.
                </p>
                <button
                  type="button"
                  onClick={handleInstantBackupJSON}
                  className="w-full mt-2 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                >
                  <Download size={14} />
                  <span>Unduh JSON Lengkap</span>
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2.5">
                <div className="font-bold text-slate-900 flex items-center gap-2">
                  <FileText size={16} className="text-blue-600" />
                  <span>Ekspor Tabel Individual (CSV)</span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleExportSchools}
                    className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-blue-50/50 hover:border-blue-200 font-bold text-slate-800 flex items-center justify-between cursor-pointer transition"
                  >
                    <span>Data Sekolah</span>
                    <Download size={13} className="text-slate-400" />
                  </button>

                  <button
                    type="button"
                    onClick={handleExportUsers}
                    className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-blue-50/50 hover:border-blue-200 font-bold text-slate-800 flex items-center justify-between cursor-pointer transition"
                  >
                    <span>Data Pengguna</span>
                    <Download size={13} className="text-slate-400" />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal G: Kelola Role (RBAC) */}
      {activeModal === 'kelola-role' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-2xl rounded-3xl p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Users size={16} />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Manajemen Role & Hak Akses (RBAC)</h3>
                  <p className="text-xs text-slate-400">Kelola hirarki wewenang multi-tenant platform</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              {rolesList.map((r) => (
                <div key={r.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{r.name}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                        {r.count} Pengguna
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {r.permissions.map((p, idx) => (
                        <span key={idx} className="text-[10px] bg-white border border-slate-200 text-slate-600 font-medium px-2 py-0.5 rounded-md">
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => showToast(`Hak akses ${r.name} diperbarui.`, 'success')}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-white text-xs font-bold text-indigo-600 shrink-0 self-start sm:self-auto cursor-pointer"
                  >
                    Atur Hak Akses
                  </button>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold cursor-pointer"
              >
                Selesai
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal H: Akses Menu Feature Toggles */}
      {activeModal === 'akses-menu' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-xl rounded-3xl p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Sliders size={16} />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Akses Menu & Fitur Global</h3>
                  <p className="text-xs text-slate-400">Aktifkan atau nonaktifkan modul fitur di seluruh sekolah</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {menuAccessToggles.map((f) => (
                <div key={f.id} className="py-3 flex items-center justify-between gap-4">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{f.name}</h4>
                    <p className="text-[11px] text-slate-400">{f.desc}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={f.enabled}
                      onChange={() => {
                        setMenuAccessToggles((prev) =>
                          prev.map((item) => (item.id === f.id ? { ...item, enabled: !item.enabled } : item))
                        );
                        showToast(`Status modul "${f.name}" diperbarui.`, 'info');
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer"
              >
                Tutup & Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal I: Log Aktivitas Audit Forensik */}
      {activeModal === 'log-aktivitas' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-4xl rounded-3xl p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                  <FileText size={16} />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Log Aktivitas & Audit Forensik</h3>
                  <p className="text-xs text-slate-400">Rekam jejak login, mutasi data, dan aksi kritis sistem</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Render Komponen Security & Audit Log */}
            <div className="pt-2">
              <SecuritySection call={call} showToast={showToast} />
            </div>

            <div className="flex items-center justify-end pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal J: Panduan Pengaturan Sistem */}
      {activeModal === 'panduan' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-xl rounded-3xl p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <BookOpen size={16} />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Panduan Administrator Sistem</h3>
                  <p className="text-xs text-slate-400">Pedoman operasional dan kebijakan pemeliharaan platform</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 text-xs leading-relaxed text-slate-600">
              <div className="p-3.5 rounded-2xl bg-blue-50/60 border border-blue-100">
                <h4 className="font-bold text-slate-900 text-sm mb-1">1. Keamanan Akses Akun</h4>
                <p>
                  Gunakan sandi unik berkekuatan tinggi dengan minimal 8 karakter yang memadukan huruf kapital, angka, dan simbol. Disarankan untuk memperbarui kredensial superadmin secara berkala setiap 90 hari.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <h4 className="font-bold text-slate-900 text-sm mb-1">2. Rutinitas Cadangan Data</h4>
                <p>
                  Lakukan pengunduhan cadangan sistem format JSON atau CSV sebelum melakukan pembaruan versi mayor atau perubahan struktur role pengguna multi-tenant.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <h4 className="font-bold text-slate-900 text-sm mb-1">3. Kebijakan Broadcast Siaran</h4>
                <p>
                  Pita pengumuman global muncul di layar seluruh civitas sekolah tenant. Pastikan pesan berisi informasi esensial dan nonaktifkan siaran setelah agenda selesai.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <h4 className="font-bold text-slate-900 text-sm mb-1">4. Gateway Pembayaran</h4>
                <p>
                  Uji koneksi secara berkala pada lingkungan Sandbox Midtrans sebelum beralih ke kunci Server Key Production guna mencegah kegagalan pembuatan virtual account sekolah.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer shadow-xs"
              >
                Saya Mengerti
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
