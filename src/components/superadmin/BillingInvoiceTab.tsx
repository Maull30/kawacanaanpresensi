import React, { useState, useMemo } from 'react';
import {
  FileText,
  Search,
  Filter,
  PlusCircle,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Send,
  Printer,
  Download,
  Copy,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Eye,
  Check,
  Building2,
  Calendar,
  DollarSign
} from 'lucide-react';

interface InvoiceItem {
  id: string;
  invoiceNumber: string;
  schoolId: string;
  schoolName: string;
  npsn: string;
  planName: string;
  amount: number;
  issueDate: string;
  dueDate: string;
  status: 'paid' | 'pending' | 'overdue' | 'cancelled';
  paymentMethod?: string;
  paidAt?: string;
  picName: string;
  picPhone: string;
}

const INITIAL_INVOICES: InvoiceItem[] = [
  {
    id: 'inv-1',
    invoiceNumber: 'INV-202609-088',
    schoolId: 'sch-1',
    schoolName: 'SMAN 1 Kota Bandung',
    npsn: '20219876',
    planName: 'Sekolah Pro (1.280 Siswa)',
    amount: 14500000,
    issueDate: '01 Sep 2026',
    dueDate: '15 Sep 2026',
    status: 'paid',
    paymentMethod: 'BCA Virtual Account',
    paidAt: '03 Sep 2026 09:14 WIB',
    picName: 'Dra. Hj. Nunung M.Pd',
    picPhone: '08122334455',
  },
  {
    id: 'inv-2',
    invoiceNumber: 'INV-202609-089',
    schoolId: 'sch-2',
    schoolName: 'SMP Negeri 3 Jakarta',
    npsn: '20104521',
    planName: 'Sekolah Pro (920 Siswa)',
    amount: 11000000,
    issueDate: '05 Sep 2026',
    dueDate: '20 Sep 2026',
    status: 'paid',
    paymentMethod: 'QRIS Dinamis',
    paidAt: '07 Sep 2026 14:22 WIB',
    picName: 'Drs. Bambang Sudiro',
    picPhone: '08139876543',
  },
  {
    id: 'inv-3',
    invoiceNumber: 'INV-202609-090',
    schoolId: 'sch-3',
    schoolName: 'SMK Telkom Sandhy Putra',
    npsn: '20220199',
    planName: 'Sekolah Pro (1.500 Siswa)',
    amount: 16500000,
    issueDate: '10 Sep 2026',
    dueDate: '25 Sep 2026',
    status: 'pending',
    paymentMethod: 'Mandiri Virtual Account',
    picName: 'Ahmad Fauzi, M.T.',
    picPhone: '08129088776',
  },
  {
    id: 'inv-4',
    invoiceNumber: 'INV-202609-091',
    schoolId: 'sch-4',
    schoolName: 'SD Negeri 01 Menteng',
    npsn: '20101188',
    planName: 'Sekolah Pro (510 Siswa)',
    amount: 6500000,
    issueDate: '01 Sep 2026',
    dueDate: '10 Sep 2026',
    status: 'overdue',
    paymentMethod: 'Menunggu Pemilihan',
    picName: 'Sri Wahyuni, S.Pd',
    picPhone: '08571234990',
  },
  {
    id: 'inv-5',
    invoiceNumber: 'INV-202609-092',
    schoolId: 'sch-5',
    schoolName: 'SMA Al-Azhar 1 Kebayoran',
    npsn: '20108876',
    planName: 'Sekolah Pro (780 Siswa)',
    amount: 9500000,
    issueDate: '12 Sep 2026',
    dueDate: '27 Sep 2026',
    status: 'pending',
    paymentMethod: 'BRI Virtual Account',
    picName: 'Muhammad Rizki, M.Pd',
    picPhone: '08123344112',
  },
  {
    id: 'inv-6',
    invoiceNumber: 'INV-202609-093',
    schoolId: 'sch-6',
    schoolName: 'SDIT Luqman Al Hakim',
    npsn: '20239910',
    planName: 'Guru Pro (32 Guru)',
    amount: 3200000,
    issueDate: '14 Sep 2026',
    dueDate: '29 Sep 2026',
    status: 'pending',
    paymentMethod: 'QRIS Dinamis',
    picName: 'Ustadz Hamdan',
    picPhone: '08781299881',
  },
  {
    id: 'inv-7',
    invoiceNumber: 'INV-202608-075',
    schoolId: 'sch-7',
    schoolName: 'SMP Labschool Rawamangun',
    npsn: '20109923',
    planName: 'Sekolah Pro (640 Siswa)',
    amount: 8000000,
    issueDate: '15 Agu 2026',
    dueDate: '30 Agu 2026',
    status: 'paid',
    paymentMethod: 'BNI Virtual Account',
    paidAt: '18 Agu 2026 11:30 WIB',
    picName: 'Dra. Endah Suryani',
    picPhone: '0811223399',
  },
  {
    id: 'inv-8',
    invoiceNumber: 'INV-202608-072',
    schoolId: 'sch-8',
    schoolName: 'SMA Taruna Nusantara',
    npsn: '20330011',
    planName: 'Sekolah Pro (850 Siswa)',
    amount: 10500000,
    issueDate: '10 Agu 2026',
    dueDate: '20 Agu 2026',
    status: 'overdue',
    paymentMethod: 'Transfer Bank Manual',
    picName: 'Kol. (Purn) Suryanto',
    picPhone: '08129990001',
  },
];

interface BillingInvoiceTabProps {
  showToast: (msg: string, type: 'success' | 'error' | 'info') => void;
  onOpenDirectSub: () => void;
  onSelectInvoice: (inv: any) => void;
}

export const BillingInvoiceTab: React.FC<BillingInvoiceTabProps> = ({
  showToast,
  onOpenDirectSub,
  onSelectInvoice,
}) => {
  const [invoices, setInvoices] = useState<InvoiceItem[]>(INITIAL_INVOICES);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [planFilter, setPlanFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Stats calculation
  const totalAmount = useMemo(() => invoices.reduce((acc, i) => acc + i.amount, 0), [invoices]);
  const paidInvoices = useMemo(() => invoices.filter((i) => i.status === 'paid'), [invoices]);
  const paidAmount = useMemo(() => paidInvoices.reduce((acc, i) => acc + i.amount, 0), [paidInvoices]);
  const pendingInvoices = useMemo(() => invoices.filter((i) => i.status === 'pending'), [invoices]);
  const pendingAmount = useMemo(() => pendingInvoices.reduce((acc, i) => acc + i.amount, 0), [pendingInvoices]);
  const overdueInvoices = useMemo(() => invoices.filter((i) => i.status === 'overdue'), [invoices]);
  const overdueAmount = useMemo(() => overdueInvoices.reduce((acc, i) => acc + i.amount, 0), [overdueInvoices]);

  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      if (statusFilter !== 'all' && inv.status !== statusFilter) return false;
      if (planFilter !== 'all' && !inv.planName.toLowerCase().includes(planFilter.toLowerCase())) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          inv.invoiceNumber.toLowerCase().includes(q) ||
          inv.schoolName.toLowerCase().includes(q) ||
          inv.npsn.includes(q) ||
          inv.picName.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [invoices, search, statusFilter, planFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredInvoices.length / itemsPerPage));
  const displayedInvoices = filteredInvoices.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleMarkAsPaid = (invId: string) => {
    setInvoices((prev) =>
      prev.map((item) =>
        item.id === invId
          ? {
              ...item,
              status: 'paid',
              paidAt: new Date().toLocaleString('id-ID'),
              paymentMethod: item.paymentMethod === 'Menunggu Pemilihan' ? 'Transfer Bank Manual' : item.paymentMethod,
            }
          : item
      )
    );
    showToast('Status invoice berhasil diubah menjadi Lunas.', 'success');
  };

  const handleSendReminder = (inv: InvoiceItem) => {
    showToast(`Pengingat tagihan ${inv.invoiceNumber} berhasil dikirim ke WhatsApp bendahara (${inv.picPhone}).`, 'success');
  };

  const handleCopyPaymentLink = (inv: InvoiceItem) => {
    const link = `https://kawacanaan.sch.id/pay/${inv.invoiceNumber.toLowerCase()}`;
    navigator.clipboard.writeText(link);
    showToast(`Tautan bayar untuk ${inv.schoolName} disalin ke clipboard!`, 'info');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner Tagihan & Invoice */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 sm:p-7 text-white shadow-xl border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold uppercase tracking-wider">
              <FileText size={13} />
              <span>Manajemen Billing &amp; Penagihan SaaS</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Tagihan &amp; Invoice Resmi Sekolah
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Kelola penerbitan faktur tagihan lisensi, pantau masa jatuh tempo termin sekolah, kirim pengingat otomatis via WhatsApp, serta rekonsiliasi pembayaran manual.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={onOpenDirectSub}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/30"
            >
              <PlusCircle size={15} />
              <span>Buat Tagihan Baru</span>
            </button>

            <button
              type="button"
              onClick={() => {
                showToast('Pengingat massal berhasil dikirim ke 6 sekolah dengan tagihan pending!', 'success');
              }}
              className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border border-slate-700"
            >
              <Send size={14} />
              <span>Pengingat Massal</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Kartu Status Ringkasan Tagihan */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Diterbitkan</span>
            <span className="p-2 rounded-xl bg-slate-100 text-slate-700">
              <FileText size={16} />
            </span>
          </div>
          <div className="mt-3">
            <h3 className="text-xl font-black text-slate-900 font-mono">
              Rp {totalAmount.toLocaleString('id-ID')}
            </h3>
            <span className="text-[11px] font-bold text-slate-500 mt-1 inline-block">
              {invoices.length} Total Faktur Dibuat
            </span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Terbayar / Lunas</span>
            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 size={16} />
            </span>
          </div>
          <div className="mt-3">
            <h3 className="text-xl font-black text-emerald-700 font-mono">
              Rp {paidAmount.toLocaleString('id-ID')}
            </h3>
            <span className="text-[11px] font-bold text-emerald-600 mt-1 inline-block">
              {paidInvoices.length} Faktur Selesai Rekonsiliasi
            </span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Menunggu Pembayaran</span>
            <span className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Clock size={16} />
            </span>
          </div>
          <div className="mt-3">
            <h3 className="text-xl font-black text-blue-700 font-mono">
              Rp {pendingAmount.toLocaleString('id-ID')}
            </h3>
            <span className="text-[11px] font-bold text-blue-600 mt-1 inline-block">
              {pendingInvoices.length} Faktur Aktif Menunggu Bayar
            </span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Jatuh Tempo (Overdue)</span>
            <span className="p-2 rounded-xl bg-rose-50 text-rose-600">
              <AlertTriangle size={16} />
            </span>
          </div>
          <div className="mt-3">
            <h3 className="text-xl font-black text-rose-700 font-mono">
              Rp {overdueAmount.toLocaleString('id-ID')}
            </h3>
            <span className="text-[11px] font-bold text-rose-600 mt-1 inline-block">
              {overdueInvoices.length} Faktur Melewati Batas
            </span>
          </div>
        </div>
      </div>

      {/* Filter & Toolbar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 min-w-[260px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Cari nomor invoice, nama sekolah, NPSN, atau PIC..."
            className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
          >
            <option value="all">Semua Status Tagihan</option>
            <option value="paid">Lunas (Paid)</option>
            <option value="pending">Menunggu Pembayaran</option>
            <option value="overdue">Jatuh Tempo (Overdue)</option>
          </select>

          <select
            value={planFilter}
            onChange={(e) => {
              setPlanFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
          >
            <option value="all">Semua Jenis Paket</option>
            <option value="sekolah">Paket Sekolah Pro</option>
            <option value="guru">Paket Guru Pro</option>
          </select>
        </div>
      </div>

      {/* Tabel Tagihan & Invoice */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/90 border-b border-slate-200/80 text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-3.5 px-4">No. Faktur</th>
                <th className="py-3.5 px-4">Sekolah / Tenant</th>
                <th className="py-3.5 px-4">Paket Langganan</th>
                <th className="py-3.5 px-4 text-right">Nominal Tagihan</th>
                <th className="py-3.5 px-4 text-center">Tgl Terbit / Jatuh Tempo</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Aksi Kelola</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayedInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-indigo-700">
                    {inv.invoiceNumber}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900">{inv.schoolName}</div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      NPSN: {inv.npsn} • PIC: {inv.picName}
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-semibold text-[11px]">
                      {inv.planName}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900 text-[13px]">
                    Rp {inv.amount.toLocaleString('id-ID')}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <div className="text-slate-700 font-medium">{inv.issueDate}</div>
                    <div className={`text-[10px] font-bold mt-0.5 ${inv.status === 'overdue' ? 'text-rose-600' : 'text-slate-400'}`}>
                      Tempo: {inv.dueDate}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    {inv.status === 'paid' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                        <CheckCircle2 size={11} />
                        <span>Lunas</span>
                      </span>
                    )}
                    {inv.status === 'pending' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold">
                        <Clock size={11} />
                        <span>Menunggu</span>
                      </span>
                    )}
                    {inv.status === 'overdue' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold">
                        <AlertTriangle size={11} />
                        <span>Jatuh Tempo</span>
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          onSelectInvoice({
                            id: inv.id,
                            order_id: inv.invoiceNumber,
                            school_name: inv.schoolName,
                            amount: inv.amount,
                            status: inv.status === 'paid' ? 'settled' : 'pending',
                            payment_type: inv.paymentMethod || 'virtual_account',
                            created_at: inv.issueDate,
                            settlement_time: inv.paidAt || '-',
                          });
                        }}
                        title="Pratinjau / Cetak Faktur"
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                      >
                        <Eye size={13} />
                      </button>

                      {inv.status !== 'paid' && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleSendReminder(inv)}
                            title="Kirim Pengingat WhatsApp"
                            className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition cursor-pointer"
                          >
                            <Send size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMarkAsPaid(inv.id)}
                            title="Tandai Lunas Manual"
                            className="p-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 transition cursor-pointer"
                          >
                            <Check size={13} />
                          </button>
                        </>
                      )}

                      <button
                        type="button"
                        onClick={() => handleCopyPaymentLink(inv)}
                        title="Salin Tautan Bayar"
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                      >
                        <Copy size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {displayedInvoices.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    <FileText size={32} className="mx-auto text-slate-300 mb-2" />
                    <p className="text-xs font-medium">Tidak ada tagihan atau invoice yang cocok dengan kriteria pencarian.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Paginasi */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div>
            Menampilkan <strong>{displayedInvoices.length}</strong> dari <strong>{filteredInvoices.length}</strong> tagihan
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50 cursor-pointer"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="font-mono text-slate-700">
              {currentPage} / {totalPages}
            </span>
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50 cursor-pointer"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
