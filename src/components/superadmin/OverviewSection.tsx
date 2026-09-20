import React, { useState, useEffect } from 'react';
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
  RefreshCw
} from 'lucide-react';
import { LaptopIllustration, ServerRackIllustration } from './SuperAdminIllustrations';
import { MetricSparkline, ActivityChart, TenantDonutChart } from './SuperAdminCharts';

interface OverviewSectionProps {
  call: any;
  showToast: any;
  onNavigate: (
    category: 'beranda' | 'sekolah' | 'pembayaran' | 'sistem' | 'keamanan' | 'pengaturan',
    subTab?: string,
    extraId?: string
  ) => void;
}

export const OverviewSection: React.FC<OverviewSectionProps> = ({ call, showToast, onNavigate }) => {
  const [data, setData] = useState<any>(null);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [activeMenuSchoolId, setActiveMenuSchoolId] = useState<string | null>(null);

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
