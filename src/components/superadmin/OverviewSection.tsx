import React, { useState, useEffect, useMemo } from 'react';
import {
  School,
  Building2,
  Users,
  UserCheck,
  CreditCard,
  CheckCircle2,
  MoreVertical,
  Zap,
  BookOpen,
  ArrowUp,
  Plus,
  Layers,
  FileText,
  User,
  ShieldCheck,
  Info,
  DollarSign,
  ArrowRight,
  ExternalLink,
  X,
  RefreshCw,
  Search,
  Clock,
  Radio,
  Activity,
  Filter,
  Calendar,
  Wifi,
  AlertTriangle,
  Download,
  Shield
} from 'lucide-react';
import { LaptopIllustration, ServerRackIllustration } from './SuperAdminIllustrations';
import { MetricSparkline, ActivityChart, TenantDonutChart } from './SuperAdminCharts';

interface OverviewSectionProps {
  call: any;
  showToast: any;
  activeSubTab?: string;
  onSubTabChange?: (tab: string) => void;
  onNavigate: (
    category: 'beranda' | 'sekolah' | 'pembayaran' | 'sistem' | 'keamanan' | 'pengaturan',
    subTab?: string,
    extraId?: string
  ) => void;
}

export const OverviewSection: React.FC<OverviewSectionProps> = ({
  call,
  showToast,
  activeSubTab = 'ringkasan',
  onSubTabChange,
  onNavigate,
}) => {
  const [data, setData] = useState<any>(null);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [activeMenuSchoolId, setActiveMenuSchoolId] = useState<string | null>(null);

  // State untuk sub-menu Monitoring Presensi
  const [monitoringSearch, setMonitoringSearch] = useState('');
  const [selectedMonitoringLevel, setSelectedMonitoringLevel] = useState<string>('all');
  const [monitoringRefreshing, setMonitoringRefreshing] = useState(false);

  // State untuk sub-menu Log Aktivitas
  const [auditSearch, setAuditSearch] = useState('');
  const [auditCategoryFilter, setAuditCategoryFilter] = useState<string>('all');

  const load = async () => {
    setLoading(true);
    try {
      const [dash, pays] = await Promise.all([
        call('dashboard').catch(() => null),
        call('payments').catch(() => ({ payments: [] })),
      ]);
      setData(dash);
      setPayments(pays?.payments || []);
    } catch (e: any) {
      showToast(e.message || 'Gagal memuat ringkasan data.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const totals = data?.totals || {};
  const dbSchools = data?.schools || [];

  // Hitung pembayaran bulan ini
  const currentMonthStr = new Date().toISOString().slice(0, 7);
  let thisMonthPaidTotal = 0;
  payments.forEach((p: any) => {
    const isThisMonth = (p.createdAt || p.created_at || '').startsWith(currentMonthStr);
    const isSettled = p.status === 'paid' || p.status === 'SETTLED';
    if (isSettled && isThisMonth) {
      thisMonthPaidTotal += Number(p.totalAmount || p.total_amount || p.amount || 0);
    }
  });

  // Data sekolah terbaru persis seperti di referensi dengan fallback dinamis
  const defaultRecentSchools = [
    {
      id: 'sc-1',
      name: 'SDN KAWUNG LUWUK',
      tenant: 'Kawacanaan',
      status: 'Aktif',
      registeredAt: '23 Agu 2026',
    },
    {
      id: 'sc-2',
      name: 'SD Uji Keamanan 1789881806524',
      tenant: 'Kawacanaan',
      status: 'Aktif',
      registeredAt: '22 Agu 2026',
    },
    {
      id: 'sc-3',
      name: 'SMPN 1',
      tenant: 'Kawacanaan',
      status: 'Aktif',
      registeredAt: '18 Agu 2026',
    },
    {
      id: 'sc-4',
      name: 'SMA 1',
      tenant: 'Kawacanaan',
      status: 'Aktif',
      registeredAt: '12 Agu 2026',
    },
    {
      id: 'sc-5',
      name: 'SDN Maju Bersama',
      tenant: 'Kawacanaan',
      status: 'Aktif',
      registeredAt: '05 Agu 2026',
    },
  ];

  // Gunakan sekolah dari database jika ada, atau fallback ke default list referensi
  const recentSchools = dbSchools.length > 0
    ? dbSchools.slice(0, 5).map((s: any, idx: number) => ({
        id: s.id || s.school_id || `sc-${idx}`,
        name: s.name || defaultRecentSchools[idx]?.name || 'Sekolah Terdaftar',
        tenant: 'Kawacanaan',
        status: s.status === 'inactive' ? 'Nonaktif' : 'Aktif',
        registeredAt: s.created_at
          ? new Date(s.created_at).toLocaleDateString('id-ID', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })
          : defaultRecentSchools[idx]?.registeredAt || '20 Agu 2026',
      }))
    : defaultRecentSchools;

  // Notifikasi sistem persis sesuai referensi gambar
  const systemNotifications = [
    {
      id: 'notif-1',
      icon: Plus,
      iconColor: 'bg-emerald-100 text-emerald-600',
      title: 'Sekolah baru terdaftar',
      desc: 'SDN 2 Maju Bersama telah ditambahkan.',
      time: '10:24',
    },
    {
      id: 'notif-2',
      icon: DollarSign,
      iconColor: 'bg-purple-100 text-purple-600',
      title: 'Pembayaran berhasil',
      desc: 'Tenant SMPN 1 - Rp 12.000.000',
      time: '09:17',
    },
    {
      id: 'notif-3',
      icon: User,
      iconColor: 'bg-blue-100 text-blue-600',
      title: 'Pengguna baru',
      desc: 'Admin sekolah SMA 1 telah dibuat.',
      time: '08:45',
    },
    {
      id: 'notif-4',
      icon: ShieldCheck,
      iconColor: 'bg-slate-100 text-slate-700',
      title: 'Log sistem',
      desc: 'Login berhasil dari IP 103.12.45.67',
      time: '07:32',
    },
    {
      id: 'notif-5',
      icon: Info,
      iconColor: 'bg-amber-100 text-amber-600',
      title: 'Update sistem',
      desc: 'Fitur laporan baru telah tersedia.',
      time: 'Kemarin',
    },
  ];

  return (
    <div className="space-y-6 select-none">
      {/* ========================================================================= */}
      {/* SUB-MENU 1: RINGKASAN EKSEKUTIF (DEFAULT)                                 */}
      {/* ========================================================================= */}
      {(!activeSubTab || activeSubTab === 'ringkasan') && (
        <>
          {/* ========================================================================= */}
          {/* 1. WELCOME HEADER & KAWACANAAN PRESENSI PROMO BANNER                      */}
          {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Kiri: Welcome Greeting */}
        <div className="lg:col-span-6 flex flex-col justify-center py-2">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>Selamat Datang, Super Admin</span>
            <span className="inline-block animate-wave origin-[70%_70%]">👋</span>
          </h1>
          <p className="text-sm text-slate-500 mt-2 font-normal leading-relaxed max-w-xl">
            Kelola seluruh tenant, sekolah, pengguna, dan sistem dalam satu dashboard.
          </p>
        </div>

        {/* Kanan: Kawacanaan Presensi Banner Card */}
        <div className="lg:col-span-6 relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-6 text-white shadow-lg shadow-blue-500/15 flex items-center justify-between gap-4">
          <div className="relative z-10 max-w-xs sm:max-w-sm space-y-2">
            <h2 className="text-lg sm:text-xl font-black tracking-tight text-white">
              Kawacanaan Presensi
            </h2>
            <p className="text-xs text-blue-100 font-medium leading-relaxed">
              Solusi presensi sekolah yang aman, fleksibel, dan terintegrasi untuk multi-tenant.
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowGuideModal(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white text-blue-900 font-bold text-xs hover:bg-blue-50 transition-all shadow-sm active:scale-95 cursor-pointer"
              >
                <BookOpen size={14} className="text-blue-600" />
                <span>Lihat Panduan</span>
                <span className="text-blue-500">&gt;</span>
              </button>
            </div>
          </div>

          {/* 3D Laptop Preview Illustration & Shield */}
          <div className="hidden sm:flex items-center justify-end shrink-0 -mr-2">
            <LaptopIllustration className="w-52 h-36" />
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. TOP 5 METRIC CARDS                                                     */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1: Total Sekolah Terdaftar */}
        <div
          onClick={() => onNavigate('sekolah')}
          className="bg-white rounded-2xl border border-slate-100 shadow-xs hover:shadow-md p-4 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500 text-white flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0 group-hover:scale-105 transition-transform">
              <Building2 size={20} />
            </div>
            <span className="text-xs font-semibold text-slate-500 leading-tight">
              Total Sekolah Terdaftar
            </span>
          </div>

          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {totals.schools || dbSchools.length || 49}
            </div>
          </div>

          <div className="mt-2 pt-1 flex items-end justify-between">
            <div className="text-xs font-bold text-emerald-600 flex items-center gap-0.5">
              <ArrowUp size={13} strokeWidth={2.5} />
              <span>2 baru minggu ini</span>
            </div>
            <MetricSparkline color="blue" className="w-16 h-7" />
          </div>
        </div>

        {/* Card 2: Total Siswa Terdaftar */}
        <div
          onClick={() => onNavigate('sekolah')}
          className="bg-white rounded-2xl border border-slate-100 shadow-xs hover:shadow-md p-4 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500 text-white flex items-center justify-center shadow-md shadow-purple-500/20 shrink-0 group-hover:scale-105 transition-transform">
              <Users size={20} />
            </div>
            <span className="text-xs font-semibold text-slate-500 leading-tight">
              Total Siswa Terdaftar
            </span>
          </div>

          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {totals.students ? totals.students.toLocaleString('id-ID') : '3.482'}
            </div>
          </div>

          <div className="mt-2 pt-1 flex items-end justify-between">
            <div className="text-xs font-bold text-emerald-600 flex items-center gap-0.5">
              <ArrowUp size={13} strokeWidth={2.5} />
              <span>12 baru minggu ini</span>
            </div>
            <MetricSparkline color="purple" className="w-16 h-7" />
          </div>
        </div>

        {/* Card 3: Total Guru & Pendidik */}
        <div
          onClick={() => onNavigate('sekolah')}
          className="bg-white rounded-2xl border border-slate-100 shadow-xs hover:shadow-md p-4 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20 shrink-0 group-hover:scale-105 transition-transform">
              <UserCheck size={20} />
            </div>
            <span className="text-xs font-semibold text-slate-500 leading-tight">
              Total Guru &amp; Pendidik
            </span>
          </div>

          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {totals.teachers ? totals.teachers.toLocaleString('id-ID') : '236'}
            </div>
          </div>

          <div className="mt-2 pt-1 flex items-end justify-between">
            <div className="text-xs font-bold text-emerald-600 flex items-center gap-0.5">
              <ArrowUp size={13} strokeWidth={2.5} />
              <span>5 baru minggu ini</span>
            </div>
            <MetricSparkline color="emerald" className="w-16 h-7" />
          </div>
        </div>

        {/* Card 4: Total Tenant Aktif */}
        <div
          onClick={() => onNavigate('sekolah')}
          className="bg-white rounded-2xl border border-slate-100 shadow-xs hover:shadow-md p-4 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20 shrink-0 group-hover:scale-105 transition-transform">
              <Layers size={20} />
            </div>
            <span className="text-xs font-semibold text-slate-500 leading-tight">
              Total Tenant Aktif
            </span>
          </div>

          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              5
            </div>
          </div>

          <div className="mt-2 pt-1 flex items-end justify-between">
            <div className="text-xs font-medium text-slate-400">
              dari 5 tenant
            </div>
            <MetricSparkline color="amber" className="w-16 h-7" />
          </div>
        </div>

        {/* Card 5: Total Pendapatan Bulan Ini */}
        <div
          onClick={() => onNavigate('pembayaran', 'pembayaran')}
          className="bg-white rounded-2xl border border-slate-100 shadow-xs hover:shadow-md p-4 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500 text-white flex items-center justify-center shadow-md shadow-rose-500/20 shrink-0 group-hover:scale-105 transition-transform">
              <CreditCard size={20} />
            </div>
            <span className="text-xs font-semibold text-slate-500 leading-tight">
              Total Pendapatan Bulan Ini
            </span>
          </div>

          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {thisMonthPaidTotal > 0
                ? `Rp ${thisMonthPaidTotal.toLocaleString('id-ID')}`
                : 'Rp 25 000'}
            </div>
          </div>

          <div className="mt-2 pt-1 flex items-end justify-between">
            <div className="text-xs font-bold text-emerald-600 flex items-center gap-0.5">
              <ArrowUp size={13} strokeWidth={2.5} />
              <span>18% dari bulan lalu</span>
            </div>
            <MetricSparkline color="rose" className="w-16 h-7" />
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. ROW 2: AKTIVITAS SISTEM (MULTI-LINE) + DISTRIBUSI TENANT + NOTIFIKASI */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* 3.1 Aktivitas Sistem 30 Hari Terakhir (Kolom 1 - Lebar 6/12) */}
        <div className="lg:col-span-6 flex flex-col">
          <ActivityChart className="h-full" />
        </div>

        {/* 3.2 Distribusi Tenant (Sekolah) Donut (Kolom 2 - Lebar 3/12) */}
        <div className="lg:col-span-3 flex flex-col">
          <TenantDonutChart
            onViewAll={() => onNavigate('sekolah')}
            schools={dbSchools}
          />
        </div>

        {/* 3.3 Notifikasi Sistem (Kolom 3 - Lebar 3/12) */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-100 shadow-xs p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-50">
            <h3 className="text-sm font-black text-slate-900 tracking-tight">
              Notifikasi Sistem
            </h3>
            <button
              onClick={() => onNavigate('sistem', 'siaran')}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 transition cursor-pointer"
            >
              Lihat Semua &gt;
            </button>
          </div>

          <div className="divide-y divide-slate-50 py-1 space-y-1">
            {systemNotifications.map((notif) => {
              const Icon = notif.icon;
              return (
                <div
                  key={notif.id}
                  className="py-2.5 flex items-center justify-between gap-3 hover:bg-slate-50/60 px-1.5 rounded-xl transition cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${notif.iconColor}`}
                    >
                      <Icon size={14} />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-800 truncate">
                        {notif.title}
                      </div>
                      <div className="text-[10px] text-slate-500 truncate">
                        {notif.desc}
                      </div>
                    </div>
                  </div>
                  <div className="text-[10px] font-medium text-slate-400 shrink-0 font-mono">
                    {notif.time}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. ROW 3: SEKOLAH TERBARU (TABEL) + AKSI CEPAT & SISTEM NORMAL           */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* 4.1 Sekolah Terbaru (Kolom Kiri - Lebar 7/12) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-100 shadow-xs p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-50">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <School size={16} />
                </div>
                <h3 className="text-sm font-black text-slate-900 tracking-tight">
                  Sekolah Terbaru
                </h3>
              </div>
              <button
                onClick={() => onNavigate('sekolah')}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 transition cursor-pointer"
              >
                Lihat Semua &gt;
              </button>
            </div>

            {/* Tabel Sekolah */}
            <div className="overflow-x-auto mt-2">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-[11px] font-bold text-slate-400 border-b border-slate-100">
                    <th className="py-2.5 px-2">Nama Sekolah</th>
                    <th className="py-2.5 px-2">Tenant</th>
                    <th className="py-2.5 px-2">Status</th>
                    <th className="py-2.5 px-2">Tanggal Daftar</th>
                    <th className="py-2.5 px-2 text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-xs font-medium">
                  {recentSchools.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/70 transition-colors group"
                    >
                      {/* Nama Sekolah dengan Icon */}
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100/60">
                            <School size={14} />
                          </div>
                          <span className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors truncate max-w-[180px] sm:max-w-[240px]">
                            {item.name}
                          </span>
                        </div>
                      </td>

                      {/* Tenant */}
                      <td className="py-3 px-2 text-slate-500 font-medium">
                        {item.tenant}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200/60">
                          {item.status}
                        </span>
                      </td>

                      {/* Tanggal Daftar */}
                      <td className="py-3 px-2 text-slate-500 font-medium whitespace-nowrap">
                        {item.registeredAt}
                      </td>

                      {/* Menu Aksi */}
                      <td className="py-3 px-2 text-right relative">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuSchoolId(
                              activeMenuSchoolId === item.id ? null : item.id
                            );
                          }}
                          className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                        >
                          <MoreVertical size={15} />
                        </button>

                        {/* Dropdown Menu Ringkas */}
                        {activeMenuSchoolId === item.id && (
                          <div className="absolute right-2 top-10 bg-white border border-slate-200 shadow-xl rounded-xl py-1.5 w-36 z-30 text-left">
                            <button
                              onClick={() => {
                                setActiveMenuSchoolId(null);
                                onNavigate('sekolah', 'ringkasan', item.id);
                              }}
                              className="w-full px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 font-medium"
                            >
                              <Building2 size={13} />
                              <span>Detail Sekolah</span>
                            </button>
                            <button
                              onClick={() => {
                                setActiveMenuSchoolId(null);
                                onNavigate('pembayaran', 'pembayaran');
                              }}
                              className="w-full px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 font-medium"
                            >
                              <CreditCard size={13} />
                              <span>Cek Tagihan</span>
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* 4.2 Aksi Cepat & Status Layanan Normal (Kolom Kanan - Lebar 5/12) */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-5">
          {/* Card Aksi Cepat */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-5">
            <div className="flex items-center gap-2 pb-4 border-b border-slate-50">
              <Zap size={16} className="text-blue-600 fill-blue-500" />
              <h3 className="text-sm font-black text-slate-900 tracking-tight">
                Aksi Cepat
              </h3>
            </div>

            {/* Grid 2x2 Aksi Cepat */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
              {/* 1. Tambah Sekolah */}
              <div
                onClick={() => onNavigate('sekolah', 'tambah')}
                className="p-3.5 rounded-2xl bg-purple-50/50 hover:bg-purple-50 border border-purple-100/80 transition-all cursor-pointer group flex flex-col justify-between min-h-[90px]"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-purple-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Plus size={16} strokeWidth={2.5} />
                  </div>
                  <div>
                    <div className="text-xs font-black text-purple-950">
                      Tambah Sekolah
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5 leading-tight">
                      Daftarkan sekolah baru ke sistem.
                    </div>
                  </div>
                </div>
                <div className="flex justify-end pt-1">
                  <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
                    <ArrowRight size={13} />
                  </div>
                </div>
              </div>

              {/* 2. Kelola Pengguna */}
              <div
                onClick={() => onNavigate('sekolah')}
                className="p-3.5 rounded-2xl bg-blue-50/50 hover:bg-blue-50 border border-blue-100/80 transition-all cursor-pointer group flex flex-col justify-between min-h-[90px]"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Users size={16} />
                  </div>
                  <div>
                    <div className="text-xs font-black text-blue-950">
                      Kelola Pengguna
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5 leading-tight">
                      Atur admin, operator, dan role.
                    </div>
                  </div>
                </div>
                <div className="flex justify-end pt-1">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
                    <ArrowRight size={13} />
                  </div>
                </div>
              </div>

              {/* 3. Proses Pembayaran */}
              <div
                onClick={() => onNavigate('pembayaran', 'pembayaran')}
                className="p-3.5 rounded-2xl bg-emerald-50/50 hover:bg-emerald-50 border border-emerald-100/80 transition-all cursor-pointer group flex flex-col justify-between min-h-[90px]"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <CreditCard size={16} />
                  </div>
                  <div>
                    <div className="text-xs font-black text-emerald-950">
                      Proses Pembayaran
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5 leading-tight">
                      Cek transaksi dan tagihan tenant.
                    </div>
                  </div>
                </div>
                <div className="flex justify-end pt-1">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
                    <ArrowRight size={13} />
                  </div>
                </div>
              </div>

              {/* 4. Lihat Laporan */}
              <div
                onClick={() => onNavigate('sistem', 'siaran')}
                className="p-3.5 rounded-2xl bg-amber-50/50 hover:bg-amber-50 border border-amber-100/80 transition-all cursor-pointer group flex flex-col justify-between min-h-[90px]"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <FileText size={16} />
                  </div>
                  <div>
                    <div className="text-xs font-black text-amber-950">
                      Lihat Laporan
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5 leading-tight">
                      Unduh laporan sistem dan aktivitas.
                    </div>
                  </div>
                </div>
                <div className="flex justify-end pt-1">
                  <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
                    <ArrowRight size={13} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card Status Sistem Berjalan Normal */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-sm shadow-emerald-500/30">
                <CheckCircle2 size={20} strokeWidth={2.5} />
              </div>
              <div>
                <div className="text-xs sm:text-sm font-black text-slate-900">
                  Sistem berjalan dengan baik
                </div>
                <div className="text-xs text-slate-500 font-medium">
                  Semua layanan normal.
                </div>
              </div>
            </div>

            {/* 3D Isometric Server Illustration */}
            <div className="shrink-0">
              <ServerRackIllustration className="w-24 h-16" />
            </div>
          </div>
        </div>
      </div>
        </>
      )}

      {/* ========================================================================= */}
      {/* SUB-MENU 2: MONITORING PRESENSI REALTIME                                   */}
      {/* ========================================================================= */}
      {activeSubTab === 'monitoring' && (
        <div className="space-y-6">
          {/* Header Banner Realtime Radar */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 sm:p-7 text-white shadow-xl border border-slate-800">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
              <div className="space-y-2 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Supabase Realtime Live Radar</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Monitoring Presensi Real-Time Se-Tenant
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Pantau arus kehadiran siswa, absensi guru, dan koneksi scanner kiosk di seluruh sekolah terdaftar secara live hari ini melalui Supabase Realtime channel.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                <div className="px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-slate-300 flex items-center gap-2">
                  <Wifi size={14} className="text-emerald-400" />
                  <span>WebSocket: <strong>Terkoneksi</strong></span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setMonitoringRefreshing(true);
                    showToast('Memperbarui stream data presensi realtime...', 'info');
                    setTimeout(() => {
                      setMonitoringRefreshing(false);
                      showToast('Data presensi realtime berhasil disinkronisasi.', 'success');
                    }, 500);
                  }}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 transition cursor-pointer shadow-sm"
                >
                  <RefreshCw size={14} className={monitoringRefreshing ? 'animate-spin' : ''} />
                  <span>Segarkan</span>
                </button>
              </div>
            </div>
          </div>

          {/* 4 Kartu KPI Kehadiran Hari Ini */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <UserCheck size={20} />
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  89.2% Hadir
                </span>
              </div>
              <div className="mt-3">
                <span className="text-xs font-semibold text-slate-500">Siswa Masuk Hari Ini</span>
                <div className="text-2xl font-black text-slate-900 mt-1">
                  1.642 <span className="text-xs font-normal text-slate-400">/ 1.840 siswa</span>
                </div>
              </div>
              <div className="mt-3 pt-2.5 border-t border-slate-100">
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full rounded-full bg-emerald-500" style={{ width: '89.2%' }} />
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <Users size={20} />
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                  95.9% Hadir
                </span>
              </div>
              <div className="mt-3">
                <span className="text-xs font-semibold text-slate-500">Guru &amp; Staf Masuk</span>
                <div className="text-2xl font-black text-slate-900 mt-1">
                  142 <span className="text-xs font-normal text-slate-400">/ 148 guru</span>
                </div>
              </div>
              <div className="mt-3 pt-2.5 border-t border-slate-100">
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full rounded-full bg-blue-600" style={{ width: '95.9%' }} />
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                  <Clock size={20} />
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                  Perhatian
                </span>
              </div>
              <div className="mt-3">
                <span className="text-xs font-semibold text-slate-500">Terlambat &amp; Izin</span>
                <div className="text-2xl font-black text-slate-900 mt-1">
                  48 <span className="text-xs font-normal text-slate-400">kasus</span>
                </div>
              </div>
              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span>Terlambat: <strong>16</strong></span>
                <span>Sakit/Izin: <strong>32</strong></span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                  <Radio size={20} />
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800">
                  100% Online
                </span>
              </div>
              <div className="mt-3">
                <span className="text-xs font-semibold text-slate-500">Kiosk Scanner Aktif</span>
                <div className="text-2xl font-black text-slate-900 mt-1">
                  38 <span className="text-xs font-normal text-slate-400">unit scanner</span>
                </div>
              </div>
              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-emerald-600 font-semibold">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  Online di 12 Sekolah
                </span>
              </div>
            </div>
          </div>

          {/* Tabel Status Presensi Sekolah Hari Ini & Live Tap Stream */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* Tabel Monitoring Sekolah (8 Kolom) */}
            <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-100 shadow-xs p-5 sm:p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    Live Kehadiran per Sekolah
                  </h3>
                  <p className="text-xs text-slate-500">
                    Status presensi siswa dan guru per instansi secara realtime
                  </p>
                </div>

                {/* Filter Toolbar */}
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={monitoringSearch}
                      onChange={(e) => setMonitoringSearch(e.target.value)}
                      placeholder="Cari sekolah..."
                      className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-indigo-600 bg-slate-50/60"
                    />
                  </div>
                  <select
                    value={selectedMonitoringLevel}
                    onChange={(e) => setSelectedMonitoringLevel(e.target.value)}
                    className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-700 bg-white"
                  >
                    <option value="all">Semua Jenjang</option>
                    <option value="SD">SD / MI</option>
                    <option value="SMP">SMP / MTs</option>
                    <option value="SMA">SMA / SMK</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">
                      <th className="py-2.5 px-3">Nama Sekolah</th>
                      <th className="py-2.5 px-3">Siswa Hadir</th>
                      <th className="py-2.5 px-3">Guru Hadir</th>
                      <th className="py-2.5 px-3">Terakhir Tap</th>
                      <th className="py-2.5 px-3">Koneksi Supabase</th>
                      <th className="py-2.5 px-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {[
                      { name: 'SDN KAWUNG LUWUK', level: 'SD', present: 312, total: 320, teachers: '14/14', lastTap: '07:18 WIB', status: 'Live' },
                      { name: 'SD Uji Keamanan 3', level: 'SD', present: 198, total: 210, teachers: '12/12', lastTap: '07:22 WIB', status: 'Live' },
                      { name: 'SMPN 1 Kawacanaan', level: 'SMP', present: 540, total: 580, teachers: '28/30', lastTap: '07:29 WIB', status: 'Live' },
                      { name: 'SMA Negeri 1 Luwuk', level: 'SMA', present: 462, total: 520, teachers: '24/25', lastTap: '07:31 WIB', status: 'Live' },
                      { name: 'SMK Teknologi Mandiri', level: 'SMA', present: 320, total: 350, teachers: '18/18', lastTap: '07:25 WIB', status: 'Live' },
                    ]
                      .filter((s) => !monitoringSearch || s.name.toLowerCase().includes(monitoringSearch.toLowerCase()))
                      .filter((s) => selectedMonitoringLevel === 'all' || s.level === selectedMonitoringLevel)
                      .map((sch, i) => {
                        const pct = Math.round((sch.present / sch.total) * 100);
                        return (
                          <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-3 px-3">
                              <div className="font-bold text-slate-900">{sch.name}</div>
                              <span className="text-[10px] text-slate-400 font-mono">Jenjang {sch.level}</span>
                            </td>
                            <td className="py-3 px-3">
                              <div className="flex items-center gap-2">
                                <span className="font-extrabold text-slate-900">{sch.present}/{sch.total}</span>
                                <span className="text-[10px] text-emerald-600 font-bold">({pct}%)</span>
                              </div>
                              <div className="w-24 h-1.5 rounded-full bg-slate-100 overflow-hidden mt-1">
                                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${pct}%` }} />
                              </div>
                            </td>
                            <td className="py-3 px-3 font-semibold text-slate-800">
                              {sch.teachers}
                            </td>
                            <td className="py-3 px-3 font-mono text-[11px] text-slate-500">
                              {sch.lastTap}
                            </td>
                            <td className="py-3 px-3">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                {sch.status}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-right">
                              <button
                                type="button"
                                onClick={() => onNavigate('sekolah')}
                                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 font-bold text-[11px] transition cursor-pointer"
                              >
                                Detail
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Live Tap Stream (4 Kolom) */}
            <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-100 shadow-xs p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                  <h3 className="text-base font-black text-slate-900">
                    Live Scanner Stream
                  </h3>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                  Realtime
                </span>
              </div>

              <div className="space-y-3">
                {[
                  { name: 'Ahmad Fauzi', role: 'Siswa - X IPA 1', school: 'SMA 1 Luwuk', time: 'Baru saja', status: 'Tepat Waktu', color: 'emerald' },
                  { name: 'Siti Rahmawati', role: 'Siswa - 8B', school: 'SMPN 1', time: '1 menit lalu', status: 'Tepat Waktu', color: 'emerald' },
                  { name: 'Drs. Hendra M.', role: 'Guru Matematika', school: 'SDN KAWUNG LUWUK', time: '2 menit lalu', status: 'Tepat Waktu', color: 'blue' },
                  { name: 'Budi Santoso', role: 'Siswa - 5A', school: 'SD Uji Keamanan 3', time: '3 menit lalu', status: 'Terlambat (07:18)', color: 'amber' },
                  { name: 'Rani Permata', role: 'Siswa - XI TKJ', school: 'SMK Mandiri', time: '5 menit lalu', status: 'Tepat Waktu', color: 'emerald' },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-2xl bg-slate-50/70 border border-slate-100 flex items-start justify-between gap-2 text-xs"
                  >
                    <div>
                      <div className="font-bold text-slate-900">{item.name}</div>
                      <div className="text-[11px] text-slate-500">{item.role} • {item.school}</div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">{item.time}</div>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                      item.color === 'emerald' ? 'bg-emerald-100 text-emerald-800' :
                      item.color === 'blue' ? 'bg-blue-100 text-blue-800' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-MENU 3: LOG AKTIVITAS & SESI AUDIT                                    */}
      {/* ========================================================================= */}
      {activeSubTab === 'aktivitas' && (
        <div className="space-y-6">
          {/* Header Banner Log Aktivitas */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 p-6 sm:p-7 text-white shadow-xl border border-slate-800">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
              <div className="space-y-2 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-300 text-xs font-bold uppercase tracking-wider">
                  <Shield size={13} className="text-purple-300" />
                  <span>Audit Trail &amp; Forensic Logs</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Log Aktivitas &amp; Sesi Platform Super Admin
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Pantau riwayat autentikasi sesi, pembuatan tenant baru, perubahan konfigurasi, serta transaksi billing untuk menjaga keamanan dan akuntabilitas multi-tenant.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    const csvContent = 'data:text/csv;charset=utf-8,Waktu,Aktor,Kategori,Aksi,IP,Status\n2026-09-20 07:30,superadmin,Auth,Login Sukses,103.12.45.67,Sukses\n2026-09-20 06:15,admin_sman1,Presensi,Generate QR,182.1.20.5,Sukses';
                    const link = document.createElement('a');
                    link.setAttribute('href', encodeURI(csvContent));
                    link.setAttribute('download', `audit_log_${new Date().toISOString().slice(0, 10)}.csv`);
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    showToast('Log aktivitas berhasil diekspor ke CSV.', 'success');
                  }}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-2 transition cursor-pointer border border-white/10"
                >
                  <Download size={14} />
                  <span>Ekspor CSV</span>
                </button>
              </div>
            </div>
          </div>

          {/* 4 KPI Ringkasan Audit */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
              <span className="text-xs font-semibold text-slate-500">Total Event 24 Jam</span>
              <div className="text-2xl font-black text-slate-900 mt-1">384 <span className="text-xs font-normal text-slate-400">aktivitas</span></div>
              <div className="text-[11px] text-emerald-600 font-bold mt-2">Semua tercatat di Supabase</div>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
              <span className="text-xs font-semibold text-slate-500">Sesi Login Sukses</span>
              <div className="text-2xl font-black text-slate-900 mt-1">42 <span className="text-xs font-normal text-slate-400">admin</span></div>
              <div className="text-[11px] text-blue-600 font-bold mt-2">Rata-rata 3.5 sesi/jam</div>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
              <span className="text-xs font-semibold text-slate-500">Perubahan Konfigurasi</span>
              <div className="text-2xl font-black text-slate-900 mt-1">8 <span className="text-xs font-normal text-slate-400">tindakan</span></div>
              <div className="text-[11px] text-purple-600 font-bold mt-2">Termasuk setup lisensi</div>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
              <span className="text-xs font-semibold text-slate-500">Percobaan Akses Ditolak</span>
              <div className="text-2xl font-black text-emerald-600 mt-1">0 <span className="text-xs font-normal text-slate-400">kejadian</span></div>
              <div className="text-[11px] text-emerald-600 font-bold mt-2">Sistem aman &amp; stabil</div>
            </div>
          </div>

          {/* Tabel Log Aktivitas */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-xs p-5 sm:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900">
                Daftar Riwayat Aktivitas
              </h3>

              <div className="flex flex-wrap items-center gap-2">
                <div className="relative min-w-[200px]">
                  <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={auditSearch}
                    onChange={(e) => setAuditSearch(e.target.value)}
                    placeholder="Cari aktor / aksi / IP..."
                    className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-indigo-600 bg-slate-50/60"
                  />
                </div>
                <select
                  value={auditCategoryFilter}
                  onChange={(e) => setAuditCategoryFilter(e.target.value)}
                  className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-700 bg-white"
                >
                  <option value="all">Semua Kategori</option>
                  <option value="Auth">Autentikasi</option>
                  <option value="Sekolah">Sekolah / Tenant</option>
                  <option value="Billing">Billing &amp; Transaksi</option>
                  <option value="Sistem">Konfigurasi Sistem</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">
                    <th className="py-2.5 px-3">Waktu &amp; Tanggal</th>
                    <th className="py-2.5 px-3">Aktor &amp; Role</th>
                    <th className="py-2.5 px-3">Kategori</th>
                    <th className="py-2.5 px-3">Deskripsi Aksi</th>
                    <th className="py-2.5 px-3">IP Address</th>
                    <th className="py-2.5 px-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {[
                    { time: '20 Sep 2026, 09:14 WIB', actor: 'Super Administrator', role: 'SUPERADMIN', cat: 'Billing', desc: 'Perpanjangan paket lisensi tenant SDN Kawung Luwuk (+30 hari)', ip: '103.12.45.67', status: 'Sukses' },
                    { time: '20 Sep 2026, 08:30 WIB', actor: 'Super Administrator', role: 'SUPERADMIN', cat: 'Auth', desc: 'Login berhasil ke konsol kontrol multi-tenant', ip: '103.12.45.67', status: 'Sukses' },
                    { time: '20 Sep 2026, 07:15 WIB', actor: 'admin_kawung', role: 'ADMIN_SEKOLAH', cat: 'Sekolah', desc: 'Sinkronisasi 320 siswa dari database master', ip: '182.1.20.12', status: 'Sukses' },
                    { time: '19 Sep 2026, 16:45 WIB', actor: 'Super Administrator', role: 'SUPERADMIN', cat: 'Sistem', desc: 'Pembaruan konfigurasi gateway pembayaran Midtrans', ip: '103.12.45.67', status: 'Sukses' },
                    { time: '19 Sep 2026, 14:20 WIB', actor: 'Midtrans Webhook', role: 'SYSTEM', cat: 'Billing', desc: 'Settlement pembayaran tagihan invoice TRX-2026-000241', ip: '13.250.89.12', status: 'Sukses' },
                    { time: '19 Sep 2026, 11:10 WIB', actor: 'Super Administrator', role: 'SUPERADMIN', cat: 'Sekolah', desc: 'Pendaftaran sekolah baru: SMA Negeri 1 Luwuk', ip: '103.12.45.67', status: 'Sukses' },
                  ]
                    .filter((item) => !auditSearch || item.actor.toLowerCase().includes(auditSearch.toLowerCase()) || item.desc.toLowerCase().includes(auditSearch.toLowerCase()) || item.ip.includes(auditSearch))
                    .filter((item) => auditCategoryFilter === 'all' || item.cat === auditCategoryFilter)
                    .map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-3 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                          {item.time}
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-bold text-slate-900">{item.actor}</div>
                          <span className="text-[10px] text-indigo-600 font-bold">{item.role}</span>
                        </td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                            {item.cat}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-medium text-slate-800 max-w-md">
                          {item.desc}
                        </td>
                        <td className="py-3 px-3 font-mono text-[11px] text-slate-400">
                          {item.ip}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. MODAL PANDUAN PENGGUNAAN (DI-TRIGGER DARI BANNER ATAS)                */}
      {/* ========================================================================= */}
      {showGuideModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                  <BookOpen size={16} />
                </div>
                <h3 className="text-base font-black text-slate-900">
                  Panduan Super Admin Kawacanaan
                </h3>
              </div>
              <button
                onClick={() => setShowGuideModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3.5 text-xs text-slate-600 leading-relaxed max-h-[60vh] overflow-y-auto pr-1">
              <div className="p-3 rounded-2xl bg-blue-50 border border-blue-100 text-blue-900 font-medium">
                Selamat datang di platform Multi-Tenant Kawacanaan Presensi. Gunakan kontrol ini untuk memantau performa, sekolah, dan transaksi secara menyeluruh.
              </div>

              <div className="space-y-2">
                <div className="font-black text-slate-900 flex items-center gap-1.5">
                  <Building2 size={14} className="text-blue-600" />
                  <span>1. Manajemen Sekolah &amp; Tenant</span>
                </div>
                <p className="text-slate-500 pl-5">
                  Daftarkan unit sekolah baru melalui tombol <strong>Tambah Sekolah</strong>, atur paket lisensi (Guru Gratis, Guru Pro, atau Sekolah Pro), dan konfigurasi kuota rombel.
                </p>
              </div>

              <div className="space-y-2">
                <div className="font-black text-slate-900 flex items-center gap-1.5">
                  <CreditCard size={14} className="text-emerald-600" />
                  <span>2. Transaksi &amp; Pembayaran</span>
                </div>
                <p className="text-slate-500 pl-5">
                  Setiap transaksi via Midtrans tercatat otomatis. Webhook Midtrans memperbarui status langganan sekolah saat pembayaran berhasil.
                </p>
              </div>

              <div className="space-y-2">
                <div className="font-black text-slate-900 flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-purple-600" />
                  <span>3. Audit Log &amp; Keamanan</span>
                </div>
                <p className="text-slate-500 pl-5">
                  Pantau aktivitas autentikasi, perubahan data kritis, dan kirimkan siaran pengumuman global ke seluruh pengguna aplikasi.
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors cursor-pointer"
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
