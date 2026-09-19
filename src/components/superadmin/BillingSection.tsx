import React, { useState, useEffect, useMemo } from 'react';
import {
  CreditCard,
  QrCode,
  AlertTriangle,
  Ban,
  Search,
  RefreshCw,
  Clock,
  CheckCircle2,
  Calendar,
  Sparkles,
  Printer,
  ShieldCheck,
  Building2,
  ExternalLink,
  Phone,
  Mail,
  ArrowUpRight,
  Filter,
  Check,
  X,
  RotateCcw,
  SlidersHorizontal,
  Trash2,
  CheckCircle,
  XCircle,
  FileText,
  PlusCircle,
} from 'lucide-react';
import { getTenantLifecycleInfo } from '../../utils/tenantLifecycle';
import { PackageFeatureMatrixTab } from './PackageFeatureMatrixTab';

export type BillingSubTab = 'transaksi' | 'lisensi' | 'matriks';

const subTabs: { id: BillingSubTab; label: string; icon: any; desc: string }[] = [
  { id: 'transaksi', label: 'Riwayat Transaksi & Invoice', icon: QrCode, desc: 'Verifikasi & rekaman mutasi pembayaran' },
  { id: 'lisensi', label: 'Pemantauan Lisensi', icon: Sparkles, desc: 'Masa aktif, tenggang & pemulihan sekolah' },
  { id: 'matriks', label: 'Konfigurasi Fitur & Paket', icon: SlidersHorizontal, desc: 'Matriks kontrol 24 hak akses fitur' },
];

export const BillingSection: React.FC<{
  call: any;
  showToast: any;
  activeSubTab?: string;
  onSubTabChange?: (tab: string) => void;
  onNavigateToSchool?: (schoolId: string) => void;
}> = ({ call, showToast, activeSubTab = 'transaksi', onSubTabChange, onNavigateToSchool }) => {
  const [currentSubTab, setCurrentSubTab] = useState<BillingSubTab>('transaksi');
  const [schools, setSchools] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Filter Tab 1: Transaksi
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<'all' | 'settled' | 'pending' | 'cancelled'>('all');

  // Filter Tab 2: Pemantauan Lisensi
  const [licenseFilter, setLicenseFilter] = useState<'all' | '7' | '30' | 'expired'>('all');

  // Modal Invoice
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);

  // Modal Direct Subscription (Super Admin)
  const [showDirectSubModal, setShowDirectSubModal] = useState(false);
  const [submittingDirectSub, setSubmittingDirectSub] = useState(false);
  const [directSubForm, setDirectSubForm] = useState({
    schoolId: '',
    plan: 'sekolah_pro' as 'sekolah_pro' | 'guru_pro',
    durationDays: 365,
    isCustomDuration: false,
    customDays: 30,
    amount: 250000,
    notes: '',
  });

  // Normalisasi tab awal & perubahan eksternal
  useEffect(() => {
    if (activeSubTab) {
      if (['transaksi', 'pembayaran', 'payments', 'ringkasan'].includes(activeSubTab)) {
        setCurrentSubTab('transaksi');
      } else if (['lisensi', 'langganan', 'akan-habis', 'tidak-aktif', 'subscriptions', 'expiring', 'suspended'].includes(activeSubTab)) {
        setCurrentSubTab('lisensi');
        if (activeSubTab === 'akan-habis' || activeSubTab === 'expiring') setLicenseFilter('7');
        if (activeSubTab === 'tidak-aktif' || activeSubTab === 'suspended') setLicenseFilter('expired');
      } else if (['matriks', 'matriks-fitur', 'paket'].includes(activeSubTab)) {
        setCurrentSubTab('matriks');
      } else {
        setCurrentSubTab('transaksi');
      }
    }
  }, [activeSubTab]);

  const switchSubTab = (t: BillingSubTab) => {
    setCurrentSubTab(t);
    onSubTabChange?.(t);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [resSchools, resPayments] = await Promise.all([
        call('list'),
        call('payments').catch(() => ({ payments: [] })),
      ]);
      setSchools(resSchools.schools || []);
      setPayments(resPayments.payments || []);
    } catch (e: any) {
      showToast(e.message || 'Gagal memuat data pembayaran.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleQuickExtend = async (school: any, days: number) => {
    try {
      const currentExpiry = school.subscription_expires_at || new Date().toISOString().slice(0, 10);
      const baseDate = new Date(currentExpiry) > new Date() ? currentExpiry : new Date().toISOString().slice(0, 10);
      const nextDate = new Date(baseDate);
      nextDate.setDate(nextDate.getDate() + days);
      const nextExpiryStr = nextDate.toISOString().slice(0, 10);

      await call('update_school', {
        school_id: school.school_id || school.id,
        name: school.name,
        npsn: school.npsn,
        plan: school.plan,
        subscription_expires_at: nextExpiryStr,
        status: 'active',
      });
      showToast(`Masa aktif ${school.name} diperpanjang +${days} hari hingga ${nextExpiryStr}.`, 'success');
      loadData();
    } catch (e: any) {
      showToast(e.message || 'Gagal memperpanjang masa aktif.', 'error');
    }
  };

  const handleReactivate = async (school: any) => {
    try {
      const nextDate = new Date();
      nextDate.setDate(nextDate.getDate() + 30);
      const nextExpiryStr = nextDate.toISOString().slice(0, 10);

      await call('update_school', {
        school_id: school.school_id || school.id,
        name: school.name,
        npsn: school.npsn,
        plan: school.plan || 'school',
        status: 'active',
        subscription_expires_at: nextExpiryStr,
      });
      showToast(`Sekolah ${school.name} berhasil diaktifkan kembali (+30 hari).`, 'success');
      loadData();
    } catch (e: any) {
      showToast(e.message || 'Gagal mengaktifkan kembali sekolah.', 'error');
    }
  };

  const handleApprovePayment = async (p: any) => {
    const inv = p.invoiceNo || p.invoice_no;
    if (!window.confirm(`Konfirmasi pembayaran LUNAS untuk invoice ${inv}? Masa aktif langganan sekolah akan otomatis diperpanjang.`)) {
      return;
    }
    try {
      const res = await call('approve_payment', { payment_id: p.id, invoice_no: inv });
      showToast(res.message || `Transaksi ${inv} berhasil disetujui & diverifikasi LUNAS!`, res.already_settled ? 'info' : 'success');
      loadData();
    } catch (e: any) {
      showToast(e.message || 'Gagal menyetujui transaksi.', 'error');
    }
  };

  const handleCancelPayment = async (p: any) => {
    const inv = p.invoiceNo || p.invoice_no;
    if (!window.confirm(`Batalkan transaksi ${inv}? Status akan diubah menjadi CANCELLED.`)) {
      return;
    }
    try {
      const res = await call('reject_payment', { payment_id: p.id, invoice_no: inv });
      showToast(res.message || `Transaksi ${inv} berhasil dibatalkan.`, 'success');
      loadData();
    } catch (e: any) {
      showToast(e.message || 'Gagal membatalkan transaksi.', 'error');
    }
  };

  const handleDeletePayment = async (p: any) => {
    const inv = p.invoiceNo || p.invoice_no;
    if (!window.confirm(`Yakin ingin menghapus catatan transaksi ${inv}? Transaksi yang belum lunas akan dihapus permanen.`)) {
      return;
    }
    try {
      await call('delete_payment', { payment_id: p.id, invoice_no: inv });
      showToast(`Catatan transaksi ${inv} berhasil dihapus.`, 'success');
      loadData();
    } catch (e: any) {
      showToast(e.message || 'Gagal menghapus transaksi.', 'error');
    }
  };

  // Handler Buka Modal Direct Subscription
  const handleOpenDirectSubModal = (preselectedSchoolId?: string) => {
    const targetSchoolId = preselectedSchoolId || (schools[0]?.id || schools[0]?.school_id || '');
    const defaultSchool = schools.find((s) => (s.id || s.school_id) === targetSchoolId);
    const defaultPlan = (defaultSchool?.plan?.includes('guru') ? 'guru_pro' : 'sekolah_pro') as 'sekolah_pro' | 'guru_pro';
    setDirectSubForm({
      schoolId: targetSchoolId,
      plan: defaultPlan,
      durationDays: 365,
      isCustomDuration: false,
      customDays: 30,
      amount: defaultPlan === 'sekolah_pro' ? 250000 : 60000,
      notes: '',
    });
    setShowDirectSubModal(true);
  };

  // Helper ganti durasi / paket otomatis kalkulasi nominal referensi
  const updatePlanAndDuration = (newPlan: 'sekolah_pro' | 'guru_pro', newDays: number, isCustom = false) => {
    let calculatedAmount = 0;
    if (newPlan === 'sekolah_pro') {
      if (newDays === 365) calculatedAmount = 250000;
      else if (newDays === 730) calculatedAmount = 500000;
      else if (newDays === 180) calculatedAmount = 150000;
      else if (newDays === 90) calculatedAmount = 75000;
      else if (newDays === 30) calculatedAmount = 25000;
      else calculatedAmount = Math.round((newDays / 30) * 25000);
    } else {
      if (newDays === 365) calculatedAmount = 60000;
      else if (newDays === 730) calculatedAmount = 120000;
      else if (newDays === 180) calculatedAmount = 30000;
      else if (newDays === 30) calculatedAmount = 5000;
      else calculatedAmount = Math.round((newDays / 30) * 5000);
    }

    setDirectSubForm((prev) => ({
      ...prev,
      plan: newPlan,
      durationDays: newDays,
      isCustomDuration: isCustom,
      amount: calculatedAmount,
    }));
  };

  // Sekolah yang sedang dipilih di Modal Direct Subscription
  const selectedSchoolForDirectSub = useMemo(() => {
    return schools.find((s) => (s.id || s.school_id) === directSubForm.schoolId) || null;
  }, [schools, directSubForm.schoolId]);

  // Pratinjau Tanggal Berakhir Lisensi Baru Real-Time
  const previewNewExpiry = useMemo(() => {
    if (!selectedSchoolForDirectSub) return null;
    const now = new Date();
    const currentExpiry = selectedSchoolForDirectSub.subscription_expires_at
      ? new Date(selectedSchoolForDirectSub.subscription_expires_at)
      : now;
    const baseDate = currentExpiry > now ? currentExpiry : now;
    const nextDate = new Date(baseDate.getTime() + directSubForm.durationDays * 24 * 60 * 60 * 1000);
    return nextDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  }, [selectedSchoolForDirectSub, directSubForm.durationDays]);

  // Submit Direct Subscription (Server Authoritative & Idempotent)
  const handleSubmitDirectSub = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!directSubForm.schoolId) {
      showToast('Silakan pilih sekolah tujuan terlebih dahulu.', 'error');
      return;
    }
    if (directSubForm.durationDays <= 0) {
      showToast('Durasi langganan minimal 1 hari.', 'error');
      return;
    }

    setSubmittingDirectSub(true);
    try {
      // Idempotency key untuk mencegah duplikasi eksekusi request ganda
      const idempotencyKey = `DS-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const res = await call('create_direct_subscription', {
        school_id: directSubForm.schoolId,
        plan: directSubForm.plan,
        duration_days: directSubForm.durationDays,
        amount: Number(directSubForm.amount) || 0,
        notes: directSubForm.notes.trim(),
        idempotency_key: idempotencyKey,
      });

      showToast(
        res.message || 'Direct Subscription berhasil diaktifkan!',
        res.already_processed ? 'info' : 'success'
      );
      setShowDirectSubModal(false);
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Gagal membuat Direct Subscription.', 'error');
    } finally {
      setSubmittingDirectSub(false);
    }
  };

  // Ringkasan Metrics Finansial
  const summaryMetrics = useMemo(() => {
    let totalRevenue = 0;
    let paidCount = 0;
    let pendingCount = 0;
    let cancelledCount = 0;

    payments.forEach((p) => {
      const isSettled = p.status === 'SETTLED' || p.status === 'paid';
      const isPending = p.status === 'PENDING' || p.status === 'pending' || p.status === 'menunggu_pembayaran';
      const isCancelled = p.status === 'CANCELLED' || p.status === 'EXPIRED' || p.status === 'batal';

      if (isSettled) {
        paidCount++;
        totalRevenue += Number(p.totalAmount || p.total_amount || p.amount || 0);
      } else if (isPending) {
        pendingCount++;
      } else if (isCancelled) {
        cancelledCount++;
      }
    });

    let activeSchools = 0;
    let expiringSchools = 0;
    let inactiveSchools = 0;

    schools.forEach((s) => {
      const lf = getTenantLifecycleInfo(s);
      if (s.status === 'inactive' || lf.isSuspended) {
        inactiveSchools++;
      } else if (lf.isExpiringSoon || lf.isGracePeriod) {
        expiringSchools++;
        activeSchools++;
      } else {
        activeSchools++;
      }
    });

    return {
      totalRevenue,
      paidCount,
      pendingCount,
      cancelledCount,
      activeSchools,
      expiringSchools,
      inactiveSchools,
    };
  }, [payments, schools]);

  // Tab 1: Pembayaran Terfilter
  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      const isSettled = p.status === 'SETTLED' || p.status === 'paid';
      const isPending = p.status === 'PENDING' || p.status === 'pending' || p.status === 'menunggu_pembayaran';
      const isCancelled = p.status === 'CANCELLED' || p.status === 'EXPIRED' || p.status === 'batal';

      if (paymentStatusFilter === 'settled' && !isSettled) return false;
      if (paymentStatusFilter === 'pending' && !isPending) return false;
      if (paymentStatusFilter === 'cancelled' && !isCancelled) return false;

      if (!search.trim()) return true;
      const q = search.toLowerCase();
      const schoolName = (p.schoolName || p.school_name || '').toLowerCase();
      const invoiceNo = (p.invoiceNo || p.invoice_no || '').toLowerCase();
      const method = (p.paymentMethod || p.payment_method || '').toLowerCase();
      return schoolName.includes(q) || invoiceNo.includes(q) || method.includes(q);
    });
  }, [payments, paymentStatusFilter, search]);

  // Tab 2: Lisensi Terfilter
  const filteredLicenses = useMemo(() => {
    return schools
      .map((s) => ({ ...s, lifecycle: getTenantLifecycleInfo(s) }))
      .filter((s) => {
        const lf = s.lifecycle;
        const days = lf.daysRemaining;
        const isSuspendedOrExpired = s.status === 'inactive' || lf.isSuspended;

        if (licenseFilter === '7') {
          if (isSuspendedOrExpired) return false;
          if (days === null || days === undefined || days > 7) return false;
        } else if (licenseFilter === '30') {
          if (isSuspendedOrExpired) return false;
          if (days === null || days === undefined || days > 30) return false;
        } else if (licenseFilter === 'expired') {
          if (!isSuspendedOrExpired) return false;
        }

        if (!search.trim()) return true;
        const q = search.toLowerCase();
        return (
          (s.name || '').toLowerCase().includes(q) ||
          (s.npsn || '').toLowerCase().includes(q) ||
          (s.plan || '').toLowerCase().includes(q)
        );
      });
  }, [schools, licenseFilter, search]);

  return (
    <div className="space-y-6">
      {/* ========================================================================= */}
      {/* 1. KARTU RINGKASAN FINANSIAL (EKSEKUTIF)                                   */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Pendapatan Tercatat */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Total Pendapatan Tercatat</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CreditCard size={16} />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black text-emerald-700 tracking-tight">
            Rp {summaryMetrics.totalRevenue.toLocaleString('id-ID')}
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center gap-1.5">
            <CheckCircle2 size={13} className="text-emerald-600" />
            <span>Dari <strong>{summaryMetrics.paidCount}</strong> transaksi lunas terverifikasi</span>
          </div>
        </div>

        {/* Transaksi Berhasil vs Tertunda */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Transaksi & Antrean</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock size={16} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{summaryMetrics.paidCount} Berhasil</span>
            {summaryMetrics.pendingCount > 0 && (
              <span className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                {summaryMetrics.pendingCount} Menunggu
              </span>
            )}
          </div>
          <div className="mt-2 text-xs text-slate-500">
            {summaryMetrics.pendingCount > 0 ? (
              <span className="text-amber-700 font-semibold">Memerlukan verifikasi status atau konfirmasi gateway</span>
            ) : (
              'Tidak ada antrean transaksi tertunda'
            )}
          </div>
        </div>

        {/* Jumlah Sekolah Berlangganan Aktif */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Lisensi Sekolah Aktif</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Building2 size={16} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{summaryMetrics.activeSchools} Aktif</span>
            {summaryMetrics.inactiveSchools > 0 && (
              <span className="text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
                {summaryMetrics.inactiveSchools} Kedaluwarsa
              </span>
            )}
          </div>
          <div className="mt-2 text-xs text-slate-500">
            {summaryMetrics.expiringSchools > 0 ? (
              <span className="text-amber-700 font-semibold">
                {summaryMetrics.expiringSchools} sekolah mendekati masa habis (≤30 hari)
              </span>
            ) : (
              'Semua sekolah berstatus langganan aman'
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. TAB NAVIGASI UTAMA PEMBAYARAN (3 TAB TERSTRUKTUR)                      */}
      {/* ========================================================================= */}
      <div className="bg-white border border-slate-200/80 p-1.5 rounded-2xl shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
          {subTabs.map((st) => {
            const isActive = currentSubTab === st.id;
            const Icon = st.icon;
            return (
              <button
                key={st.id}
                type="button"
                onClick={() => switchSubTab(st.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left cursor-pointer ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <div
                  className={`p-2 rounded-lg shrink-0 ${
                    isActive ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  <Icon size={18} />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-black truncate">{st.label}</div>
                  <div className={`text-[10px] truncate mt-0.5 ${isActive ? 'text-slate-300' : 'text-slate-400'}`}>
                    {st.desc}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. TAB 1: RIWAYAT TRANSAKSI & INVOICE                                     */}
      {/* ========================================================================= */}
      {currentSubTab === 'transaksi' && (
        <div className="space-y-4">
          {/* Toolbar & Filter Pembayaran */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Filter Status Pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { id: 'all', label: 'Semua Transaksi' },
                { id: 'settled', label: 'Berhasil / Lunas' },
                { id: 'pending', label: 'Menunggu Konfirmasi' },
                { id: 'cancelled', label: 'Batal / Kedaluwarsa' },
              ].map((f) => {
                const isActive = paymentStatusFilter === f.id;
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setPaymentStatusFilter(f.id as any)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
                    }`}
                  >
                    {f.label}
                  </button>
                );
              })}
            </div>

            {/* Pencarian & Refresh */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1 sm:w-64">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari invoice atau sekolah..."
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-indigo-600"
                />
              </div>

              <button
                type="button"
                onClick={loadData}
                disabled={loading}
                title="Muat ulang transaksi"
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer disabled:opacity-50"
              >
                <RefreshCw size={15} className={loading ? 'animate-spin text-indigo-600' : ''} />
              </button>

              <button
                type="button"
                onClick={() => handleOpenDirectSubModal()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition cursor-pointer whitespace-nowrap"
              >
                <PlusCircle size={14} />
                <span>+ Direct Subscription</span>
              </button>
            </div>
          </div>

          {/* Tabel Pembayaran Utama */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                <RefreshCw size={24} className="animate-spin text-indigo-600 mb-2" />
                <span className="text-xs font-semibold">Memuat rekaman transaksi...</span>
              </div>
            ) : filteredPayments.length === 0 ? (
              <div className="py-16 text-center text-xs text-slate-400">
                Tidak ada data transaksi pembayaran yang cocok dengan kriteria filter.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 font-bold bg-slate-50/80">
                      <th className="py-3.5 px-4 font-bold">ID Invoice</th>
                      <th className="py-3.5 px-4 font-bold">Sekolah / Instansi</th>
                      <th className="py-3.5 px-4 font-bold">Paket</th>
                      <th className="py-3.5 px-4 font-bold">Metode Pembayaran</th>
                      <th className="py-3.5 px-4 font-bold">Nominal Tagihan</th>
                      <th className="py-3.5 px-4 font-bold">Tanggal</th>
                      <th className="py-3.5 px-4 font-bold">Status</th>
                      <th className="py-3.5 px-4 text-right font-bold">Tindakan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredPayments.map((p) => {
                      const isSettled = p.status === 'SETTLED' || p.status === 'paid';
                      const isPending = p.status === 'PENDING' || p.status === 'pending' || p.status === 'menunggu_pembayaran';
                      const inv = p.invoiceNo || p.invoice_no;

                      return (
                        <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                            {inv || '-'}
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="font-bold text-slate-900">{p.schoolName || p.school_name || '-'}</div>
                            {p.contactName && (
                              <div className="text-[10px] text-slate-400 mt-0.5">Kontak: {p.contactName}</div>
                            )}
                          </td>

                          <td className="py-3.5 px-4">
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 text-indigo-700 uppercase border border-indigo-100">
                              {p.planName || p.plan_name || 'Sekolah'}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 text-slate-700">
                            {p.paymentMethod === 'DIRECT_SUBSCRIPTION' || p.payment_method === 'DIRECT_SUBSCRIPTION' ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                                <Sparkles size={11} className="text-purple-600" />
                                <span>Direct Subscription</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 font-semibold text-slate-700">
                                <QrCode size={13} className="text-slate-400" />
                                <span>{p.paymentMethod || p.payment_method || 'Midtrans'}</span>
                              </span>
                            )}
                          </td>

                          <td className="py-3.5 px-4 font-black text-slate-900">
                            Rp {Number(p.totalAmount || p.total_amount || p.amount || 0).toLocaleString('id-ID')}
                          </td>

                          <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                            {p.createdAt ? new Date(p.createdAt).toLocaleDateString('id-ID') : '-'}
                          </td>

                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                isSettled
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : isPending
                                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                  : 'bg-slate-100 text-slate-600 border border-slate-200'
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  isSettled ? 'bg-emerald-500' : isPending ? 'bg-amber-500' : 'bg-slate-400'
                                }`}
                              />
                              {isSettled ? 'Lunas' : isPending ? 'Menunggu Konfirmasi' : 'Batal'}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Tombol Konfirmasi Manual jika Menunggu */}
                              {isPending && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => handleApprovePayment(p)}
                                    title="Konfirmasi Manual (Approve Lunas)"
                                    className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-[11px] inline-flex items-center gap-1 cursor-pointer transition shadow-2xs"
                                  >
                                    <Check size={12} />
                                    <span>Approve</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleCancelPayment(p)}
                                    title="Batalkan Transaksi Ini"
                                    className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold text-[11px] inline-flex items-center gap-1 cursor-pointer transition shadow-2xs"
                                  >
                                    <X size={12} />
                                    <span>Tolak</span>
                                  </button>
                                </>
                              )}

                              {/* Tombol Pratinjau & Cetak Invoice */}
                              <button
                                type="button"
                                onClick={() => setSelectedInvoice(p)}
                                title="Lihat & Cetak Bukti Invoice"
                                className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[11px] inline-flex items-center gap-1 cursor-pointer transition shadow-2xs"
                              >
                                <Printer size={12} />
                                <span>Invoice</span>
                              </button>

                              {/* Tombol Hapus Transaksi (Hanya jika belum lunas) */}
                              {!isSettled && (
                                <button
                                  type="button"
                                  onClick={() => handleDeletePayment(p)}
                                  title="Hapus Catatan Transaksi Belum Lunas"
                                  className="p-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs cursor-pointer transition shadow-2xs"
                                >
                                  <Trash2 size={13} />
                                </button>
                              )}
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
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. TAB 2: PEMANTAUAN LISENSI (PENGGABUNGAN LANGGANAN + AKAN HABIS + TIDAK AKTIF) */}
      {/* ========================================================================= */}
      {currentSubTab === 'lisensi' && (
        <div className="space-y-4">
          {/* Toolbar Filter Masa Tenggang */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { id: 'all', label: 'Semua Sekolah' },
                { id: '7', label: 'Akan Habis ≤ 7 Hari' },
                { id: '30', label: 'Akan Habis ≤ 30 Hari' },
                { id: 'expired', label: 'Sudah Kedaluwarsa / Nonaktif' },
              ].map((f) => {
                const isActive = licenseFilter === f.id;
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setLicenseFilter(f.id as any)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
                    }`}
                  >
                    {f.label}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2">
              <div className="relative flex-1 sm:w-64">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari sekolah atau NPSN..."
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-indigo-600"
                />
              </div>

              <button
                type="button"
                onClick={loadData}
                disabled={loading}
                title="Muat ulang data lisensi"
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer disabled:opacity-50"
              >
                <RefreshCw size={15} className={loading ? 'animate-spin text-indigo-600' : ''} />
              </button>

              <button
                type="button"
                onClick={() => handleOpenDirectSubModal()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition cursor-pointer whitespace-nowrap"
              >
                <PlusCircle size={14} />
                <span>+ Direct Subscription</span>
              </button>
            </div>
          </div>

          {/* Tabel Lisensi & Sisa Hari Aktif */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                <RefreshCw size={24} className="animate-spin text-indigo-600 mb-2" />
                <span className="text-xs font-semibold">Memuat status lisensi sekolah...</span>
              </div>
            ) : filteredLicenses.length === 0 ? (
              <div className="py-16 text-center text-xs text-slate-400">
                Tidak ada sekolah yang sesuai dengan filter masa tenggang ini.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 font-bold bg-slate-50/80">
                      <th className="py-3.5 px-4 font-bold">Instansi Sekolah</th>
                      <th className="py-3.5 px-4 font-bold">NPSN</th>
                      <th className="py-3.5 px-4 font-bold">Paket</th>
                      <th className="py-3.5 px-4 font-bold">Status Lisensi</th>
                      <th className="py-3.5 px-4 font-bold">Tanggal Berakhir</th>
                      <th className="py-3.5 px-4 font-bold">Sisa Hari Aktif</th>
                      <th className="py-3.5 px-4 text-right font-bold">Aksi Cepat Perpanjang / Pulihkan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredLicenses.map((s) => {
                      const lf = s.lifecycle;
                      const isInactive = s.status === 'inactive' || lf.isSuspended;
                      const days = lf.daysRemaining;

                      return (
                        <tr key={s.id || s.school_id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-slate-900">{s.name}</div>
                            {s.headmaster_name && (
                              <div className="text-[10px] text-slate-400 mt-0.5">Kepsek: {s.headmaster_name}</div>
                            )}
                          </td>

                          <td className="py-3.5 px-4 font-mono text-slate-600">
                            {s.npsn || '-'}
                          </td>

                          <td className="py-3.5 px-4">
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 text-indigo-700 uppercase border border-indigo-100">
                              {s.plan === 'teacher' ? 'Guru' : s.plan === 'school' || s.plan === 'sekolah' ? 'Sekolah' : 'Mulai'}
                            </span>
                          </td>

                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                !isInactive
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-rose-50 text-rose-700 border border-rose-200'
                              }`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${!isInactive ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                              {!isInactive ? 'Aktif Berlangganan' : 'Kedaluwarsa / Nonaktif'}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 font-medium text-slate-800">
                            {s.subscription_expires_at || 'Seumur Hidup'}
                          </td>

                          <td className="py-3.5 px-4">
                            {days === null ? (
                              <span className="text-slate-500 font-semibold">Permanen</span>
                            ) : isInactive ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                                Sudah Habis
                              </span>
                            ) : days <= 7 ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-800">
                                {days} Hari Lagi (Mendesak)
                              </span>
                            ) : days <= 30 ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900">
                                {days} Hari Lagi
                              </span>
                            ) : (
                              <span className="text-emerald-700 font-bold font-mono">{days} hari</span>
                            )}
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Jika nonaktif/kedaluwarsa, sediakan tombol pulihkan */}
                              {isInactive ? (
                                <button
                                  type="button"
                                  onClick={() => handleReactivate(s)}
                                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer shadow-xs transition"
                                >
                                  Pulihkan (+30 Hari)
                                </button>
                              ) : (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => handleQuickExtend(s, 30)}
                                    title="Tambah masa aktif 30 hari"
                                    className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[11px] cursor-pointer transition shadow-2xs"
                                  >
                                    +30 Hari
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleQuickExtend(s, 365)}
                                    title="Tambah masa aktif 1 tahun"
                                    className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-[11px] cursor-pointer transition shadow-2xs"
                                  >
                                    +1 Tahun
                                  </button>
                                </>
                              )}

                              <button
                                type="button"
                                onClick={() => handleOpenDirectSubModal(s.id || s.school_id)}
                                title="Buat Direct Subscription untuk sekolah ini"
                                className="px-2.5 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-[11px] cursor-pointer transition shadow-2xs"
                              >
                                Direct Sub
                              </button>

                              <button
                                type="button"
                                onClick={() => onNavigateToSchool?.(s.id || s.school_id)}
                                title="Lihat detail instansi sekolah"
                                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] cursor-pointer transition shadow-2xs"
                              >
                                Detail
                              </button>
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
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. TAB 3: KONFIGURASI FITUR & PAKET (PACKAGE FEATURE MATRIX)               */}
      {/* ========================================================================= */}
      {currentSubTab === 'matriks' && (
        <PackageFeatureMatrixTab showToast={showToast} />
      )}

      {/* ========================================================================= */}
      {/* MODAL INVOICE PEMBAYARAN (PRATINJAU & CETAK)                              */}
      {/* ========================================================================= */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-100 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                  <FileText size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">Bukti Invoice Pembayaran</h3>
                  <p className="text-[11px] text-slate-500 font-mono">{selectedInvoice.invoiceNo || selectedInvoice.invoice_no}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedInvoice(null)}
                className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Sekolah / Pelanggan:</span>
                <span className="font-bold text-slate-900">{selectedInvoice.schoolName || selectedInvoice.school_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">NPSN:</span>
                <span className="font-mono text-slate-700">{selectedInvoice.npsn || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Paket Layanan:</span>
                <span className="font-bold text-indigo-700 uppercase">{selectedInvoice.planName || selectedInvoice.plan_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Metode:</span>
                <span className="font-semibold text-slate-800">{selectedInvoice.paymentMethod || selectedInvoice.payment_method || 'Midtrans / QRIS'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Tanggal:</span>
                <span className="text-slate-700 font-mono">
                  {selectedInvoice.createdAt ? new Date(selectedInvoice.createdAt).toLocaleString('id-ID') : '-'}
                </span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline">
                <span className="text-slate-700 font-bold">Total Pembayaran:</span>
                <span className="font-black text-emerald-800 text-base">
                  Rp {Number(selectedInvoice.totalAmount || selectedInvoice.total_amount || selectedInvoice.amount || 0).toLocaleString('id-ID')}
                </span>
              </div>
              <div className="flex justify-between items-center pt-1">
                <span className="text-slate-500">Status Transaksi:</span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    selectedInvoice.status === 'SETTLED' || selectedInvoice.status === 'paid'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {selectedInvoice.status}
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedInvoice(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer transition"
              >
                <Printer size={14} />
                <span>Cetak Invoice</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. MODAL DIRECT SUBSCRIPTION (SUPER ADMIN AUTHORITATIVE)                  */}
      {/* ========================================================================= */}
      {showDirectSubModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 my-8 space-y-5 animate-in fade-in zoom-in duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center border border-purple-100 shadow-2xs">
                  <Sparkles size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-black text-slate-900">Direct Subscription</h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-100 text-indigo-800 uppercase tracking-wider">
                      Super Admin Only
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Aktivasi atau perpanjang lisensi sekolah secara langsung tanpa melalui Midtrans
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowDirectSubModal(false)}
                disabled={submittingDirectSub}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form Direct Subscription */}
            <form onSubmit={handleSubmitDirectSub} className="space-y-4">
              {/* 1. Pilih Sekolah */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Sekolah Tujuan <span className="text-rose-500">*</span>
                </label>
                <select
                  value={directSubForm.schoolId}
                  onChange={(e) => {
                    const nextId = e.target.value;
                    const sch = schools.find((s) => (s.id || s.school_id) === nextId);
                    const defaultPlan = (sch?.plan?.includes('guru') ? 'guru_pro' : 'sekolah_pro') as 'sekolah_pro' | 'guru_pro';
                    setDirectSubForm((prev) => ({
                      ...prev,
                      schoolId: nextId,
                      plan: defaultPlan,
                    }));
                  }}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 bg-white focus:outline-indigo-600 focus:border-indigo-600"
                >
                  <option value="">-- Pilih Instansi Sekolah --</option>
                  {schools.map((s) => {
                    const id = s.id || s.school_id;
                    const planLabel = s.plan === 'teacher' || s.plan === 'guru_pro' ? 'Guru Pro' : 'Sekolah Pro';
                    const statusLabel = s.status === 'active' ? 'Aktif' : 'Nonaktif';
                    return (
                      <option key={id} value={id}>
                        {s.name} (NPSN: {s.npsn || '-'}) • {planLabel} [{statusLabel}]
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* 2. Pilih Paket Lisensi */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Paket Langganan <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => updatePlanAndDuration('sekolah_pro', directSubForm.durationDays, directSubForm.isCustomDuration)}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      directSubForm.plan === 'sekolah_pro'
                        ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 ring-2 ring-indigo-600/20'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                    }`}
                  >
                    <div className="font-bold text-xs flex items-center justify-between">
                      <span>Paket Sekolah Pro</span>
                      {directSubForm.plan === 'sekolah_pro' && <CheckCircle size={14} className="text-indigo-600" />}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-1 leading-tight">
                      Akses multi-guru, kelas paralel 1-6, portal siswa & sinkronisasi dinas
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => updatePlanAndDuration('guru_pro', directSubForm.durationDays, directSubForm.isCustomDuration)}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      directSubForm.plan === 'guru_pro'
                        ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 ring-2 ring-indigo-600/20'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                    }`}
                  >
                    <div className="font-bold text-xs flex items-center justify-between">
                      <span>Paket Guru Pro</span>
                      {directSubForm.plan === 'guru_pro' && <CheckCircle size={14} className="text-indigo-600" />}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-1 leading-tight">
                      Ruang kerja guru personal, input nilai mapel & cetak rapor siswa
                    </div>
                  </button>
                </div>
              </div>

              {/* 3. Periode / Durasi Langganan */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Periode / Durasi Langganan <span className="text-rose-500">*</span>
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { days: 30, label: '1 Bulan (30 Hari)' },
                    { days: 90, label: '3 Bulan (90 Hari)' },
                    { days: 180, label: '6 Bulan (180 Hari)' },
                    { days: 365, label: '1 Tahun (365 Hari)' },
                    { days: 730, label: '2 Tahun (730 Hari)' },
                  ].map((p) => {
                    const isSelected = !directSubForm.isCustomDuration && directSubForm.durationDays === p.days;
                    return (
                      <button
                        key={p.days}
                        type="button"
                        onClick={() => updatePlanAndDuration(directSubForm.plan, p.days, false)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-slate-900 text-white shadow-xs'
                            : 'bg-slate-100 hover:bg-slate-200/70 text-slate-700'
                        }`}
                      >
                        {p.label}
                      </button>
                    );
                  })}
                  <button
                    type="button"
                    onClick={() => {
                      setDirectSubForm((prev) => ({
                        ...prev,
                        isCustomDuration: true,
                        durationDays: prev.customDays || 30,
                      }));
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      directSubForm.isCustomDuration
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200/70 text-slate-700'
                    }`}
                  >
                    Kustom Hari...
                  </button>
                </div>

                {directSubForm.isCustomDuration && (
                  <div className="pt-2 flex items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      max={3650}
                      value={directSubForm.durationDays}
                      onChange={(e) => {
                        const val = Math.max(1, parseInt(e.target.value || '1', 10));
                        updatePlanAndDuration(directSubForm.plan, val, true);
                      }}
                      className="w-32 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:outline-indigo-600"
                      placeholder="Jumlah hari"
                    />
                    <span className="text-xs text-slate-500 font-medium">Hari kalender</span>
                  </div>
                )}
              </div>

              {/* 4. Nominal Pembayaran & Catatan */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Nominal Transaksi (Rp)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={1000}
                    value={directSubForm.amount}
                    onChange={(e) =>
                      setDirectSubForm((prev) => ({
                        ...prev,
                        amount: Math.max(0, parseInt(e.target.value || '0', 10)),
                      }))
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:outline-indigo-600"
                    placeholder="0 jika hibah / beasiswa dinas"
                  />
                  <span className="text-[10px] text-slate-400">Isi 0 jika hibah dinas/beasiswa</span>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Referensi / Catatan Administrasi
                  </label>
                  <input
                    type="text"
                    value={directSubForm.notes}
                    onChange={(e) =>
                      setDirectSubForm((prev) => ({
                        ...prev,
                        notes: e.target.value,
                      }))
                    }
                    placeholder="Misal: Dana BOS, APBD Dinas, dll"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-indigo-600"
                  />
                  <span className="text-[10px] text-slate-400">Disimpan pada audit log & invoice</span>
                </div>
              </div>

              {/* 5. Pratinjau Lisensi Baru (Visual Card) */}
              {selectedSchoolForDirectSub && (
                <div className="p-3.5 rounded-2xl bg-purple-50/60 border border-purple-100 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-purple-950 flex items-center gap-1.5">
                      <ShieldCheck size={14} className="text-purple-600" />
                      Pratinjau Lisensi Baru
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-white text-purple-700 border border-purple-200">
                      Metode: DIRECT_SUBSCRIPTION
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                    <div>
                      <span className="text-slate-500 block text-[10px]">Masa Aktif Saat Ini:</span>
                      <span className="font-semibold text-slate-700">
                        {selectedSchoolForDirectSub.subscription_expires_at
                          ? new Date(selectedSchoolForDirectSub.subscription_expires_at).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })
                          : 'Nonaktif / Kedaluwarsa'}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-500 block text-[10px]">Masa Aktif Setelah Terbit:</span>
                      <span className="font-black text-emerald-700">
                        {previewNewExpiry} (+{directSubForm.durationDays} hari)
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Modal Footer Actions */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowDirectSubModal(false)}
                  disabled={submittingDirectSub}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submittingDirectSub || !directSubForm.schoolId}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition cursor-pointer disabled:opacity-50"
                >
                  {submittingDirectSub ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      <span>Menerbitkan Direct Subscription...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={14} />
                      <span>Konfirmasi & Terbitkan Lisensi</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
