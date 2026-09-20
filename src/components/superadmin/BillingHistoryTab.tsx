import React, { useState, useMemo } from 'react';
import {
  History,
  Search,
  Filter,
  Download,
  RefreshCw,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  Eye,
  Building2,
  ChevronLeft,
  ChevronRight,
  Printer,
  X,
  CreditCard,
  QrCode,
  Wallet
} from 'lucide-react';

interface TransactionRecord {
  id: string;
  orderId: string;
  schoolId: string;
  schoolName: string;
  payerName: string;
  amount: number;
  paymentType: string;
  channel: string;
  status: 'settled' | 'pending' | 'expired' | 'cancelled';
  createdAt: string;
  settledAt?: string;
  referenceNo: string;
}

const INITIAL_TRANSACTIONS: TransactionRecord[] = [
  {
    id: 'tx-1',
    orderId: 'TRX-2026-000248',
    schoolId: 'sch-1',
    schoolName: 'SMAN 1 Kota Bandung',
    payerName: 'Dra. Hj. Nunung M.Pd (Kepsek)',
    amount: 14500000,
    paymentType: 'bank_transfer',
    channel: 'BCA Virtual Account',
    status: 'settled',
    createdAt: '19 Sep 2026 10:24',
    settledAt: '19 Sep 2026 10:26',
    referenceNo: 'MDT-BCA-9812491',
  },
  {
    id: 'tx-2',
    orderId: 'TRX-2026-000247',
    schoolId: 'sch-2',
    schoolName: 'SMP Negeri 3 Jakarta',
    payerName: 'Drs. Bambang Sudiro (Bendahara)',
    amount: 11000000,
    paymentType: 'qris',
    channel: 'QRIS Dinamis (GoPay/Shopee)',
    status: 'settled',
    createdAt: '19 Sep 2026 09:17',
    settledAt: '19 Sep 2026 09:18',
    referenceNo: 'MDT-QRS-7721890',
  },
  {
    id: 'tx-3',
    orderId: 'TRX-2026-000246',
    schoolId: 'sch-3',
    schoolName: 'SMK Telkom Sandhy Putra',
    payerName: 'Ahmad Fauzi, M.T. (Wakasek)',
    amount: 16500000,
    paymentType: 'echannel',
    channel: 'Mandiri Bill Payment',
    status: 'pending',
    createdAt: '18 Sep 2026 16:43',
    referenceNo: 'MDT-MDR-6612098',
  },
  {
    id: 'tx-4',
    orderId: 'TRX-2026-000245',
    schoolId: 'sch-5',
    schoolName: 'SMA Al-Azhar 1 Kebayoran',
    payerName: 'Muhammad Rizki, M.Pd (Bendahara)',
    amount: 9500000,
    paymentType: 'bank_transfer',
    channel: 'BRI Virtual Account',
    status: 'settled',
    createdAt: '18 Sep 2026 14:20',
    settledAt: '18 Sep 2026 14:22',
    referenceNo: 'MDT-BRI-5510982',
  },
  {
    id: 'tx-5',
    orderId: 'TRX-2026-000244',
    schoolId: 'sch-4',
    schoolName: 'SD Negeri 01 Menteng',
    payerName: 'Sri Wahyuni, S.Pd',
    amount: 6500000,
    paymentType: 'bank_transfer',
    channel: 'BNI Virtual Account',
    status: 'expired',
    createdAt: '17 Sep 2026 11:05',
    referenceNo: 'MDT-BNI-4409182',
  },
  {
    id: 'tx-6',
    orderId: 'TRX-2026-000243',
    schoolId: 'sch-6',
    schoolName: 'SDIT Luqman Al Hakim',
    payerName: 'Ustadz Hamdan',
    amount: 3200000,
    paymentType: 'qris',
    channel: 'QRIS Dinamis',
    status: 'settled',
    createdAt: '16 Sep 2026 15:40',
    settledAt: '16 Sep 2026 15:41',
    referenceNo: 'MDT-QRS-3301982',
  },
  {
    id: 'tx-7',
    orderId: 'TRX-2026-000242',
    schoolId: 'sch-7',
    schoolName: 'SMP Labschool Rawamangun',
    payerName: 'Dra. Endah Suryani',
    amount: 8000000,
    paymentType: 'bank_transfer',
    channel: 'BCA Virtual Account',
    status: 'settled',
    createdAt: '15 Sep 2026 08:30',
    settledAt: '15 Sep 2026 08:32',
    referenceNo: 'MDT-BCA-2201992',
  },
  {
    id: 'tx-8',
    orderId: 'TRX-2026-000241',
    schoolId: 'sch-8',
    schoolName: 'SMA Taruna Nusantara',
    payerName: 'Kol. (Purn) Suryanto',
    amount: 10500000,
    paymentType: 'manual_transfer',
    channel: 'Transfer Bank Manual',
    status: 'cancelled',
    createdAt: '14 Sep 2026 13:10',
    referenceNo: 'MAN-TRF-1100293',
  },
];

interface BillingHistoryTabProps {
  showToast: (msg: string, type: 'success' | 'error' | 'info') => void;
  onSelectInvoice: (inv: any) => void;
}

export const BillingHistoryTab: React.FC<BillingHistoryTabProps> = ({
  showToast,
  onSelectInvoice,
}) => {
  const [transactions, setTransactions] = useState<TransactionRecord[]>(INITIAL_TRANSACTIONS);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [channelFilter, setChannelFilter] = useState<string>('all');
  const [isSyncing, setIsSyncing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedReceipt, setSelectedReceipt] = useState<TransactionRecord | null>(null);
  const itemsPerPage = 6;

  // Stats calculation
  const totalSettled = useMemo(() => transactions.filter((t) => t.status === 'settled').length, [transactions]);
  const totalSettledAmount = useMemo(
    () => transactions.filter((t) => t.status === 'settled').reduce((acc, t) => acc + t.amount, 0),
    [transactions]
  );
  const totalPending = useMemo(() => transactions.filter((t) => t.status === 'pending').length, [transactions]);
  const totalExpired = useMemo(
    () => transactions.filter((t) => t.status === 'expired' || t.status === 'cancelled').length,
    [transactions]
  );

  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      if (statusFilter !== 'all' && tx.status !== statusFilter) return false;
      if (channelFilter !== 'all' && !tx.channel.toLowerCase().includes(channelFilter.toLowerCase())) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          tx.orderId.toLowerCase().includes(q) ||
          tx.schoolName.toLowerCase().includes(q) ||
          tx.payerName.toLowerCase().includes(q) ||
          tx.referenceNo.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [transactions, search, statusFilter, channelFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredTransactions.length / itemsPerPage));
  const displayedTransactions = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleExportCSV = () => {
    const header = "ID Transaksi,Referensi Midtrans,Sekolah,PIC Pembayar,Saluran,Nominal,Waktu Buat,Waktu Selesai,Status\n";
    const rows = filteredTransactions.map(t => 
      `"${t.orderId}","${t.referenceNo}","${t.schoolName}","${t.payerName}","${t.channel}",${t.amount},"${t.createdAt}","${t.settledAt || '-'}","${t.status.toUpperCase()}"`
    ).join("\n");
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `riwayat_transaksi_kawacanaan_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Berkas CSV riwayat transaksi berhasil diunduh.', 'success');
  };

  const handleSyncGateway = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      showToast('Sinkronisasi status webhook Midtrans real-time selesai. Semua transaksi mutakhir.', 'success');
    }, 700);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner Riwayat Transaksi */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 p-6 sm:p-7 text-white shadow-xl border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold uppercase tracking-wider">
              <History size={13} />
              <span>Gateway Audit &amp; Settlement Log</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Riwayat Transaksi &amp; Rekonsiliasi Gateway
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Daftar seluruh transaksi yang diproses melalui gateway Midtrans (QRIS, Virtual Account bank, dan transfer manual). Pantau status mutasi dan unduh kuitansi resmi.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={handleExportCSV}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border border-slate-700"
            >
              <Download size={14} />
              <span>Ekspor CSV</span>
            </button>

            <button
              type="button"
              onClick={handleSyncGateway}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/30"
            >
              <RefreshCw size={14} className={isSyncing ? 'animate-spin' : ''} />
              <span>Sinkronkan Midtrans</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Kartu Metrik Ringkasan Transaksi */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Transaksi Sukses (Settled)</span>
            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 size={16} />
            </span>
          </div>
          <div className="mt-3">
            <h3 className="text-xl font-black text-emerald-700 font-mono">
              Rp {totalSettledAmount.toLocaleString('id-ID')}
            </h3>
            <span className="text-[11px] font-bold text-emerald-600 mt-1 inline-block">
              {totalSettled} Transaksi Berhasil
            </span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Transaksi Tertunda</span>
            <span className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Clock size={16} />
            </span>
          </div>
          <div className="mt-3">
            <h3 className="text-xl font-black text-blue-700 font-mono">
              {totalPending} Transaksi
            </h3>
            <span className="text-[11px] font-bold text-blue-600 mt-1 inline-block">
              Menunggu Pembayaran VA / QRIS
            </span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Kedaluwarsa / Batal</span>
            <span className="p-2 rounded-xl bg-rose-50 text-rose-600">
              <XCircle size={16} />
            </span>
          </div>
          <div className="mt-3">
            <h3 className="text-xl font-black text-rose-700 font-mono">
              {totalExpired} Transaksi
            </h3>
            <span className="text-[11px] font-bold text-rose-600 mt-1 inline-block">
              Expired Lewat Batas Waktu
            </span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Rata-rata Nilai Order</span>
            <span className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <Wallet size={16} />
            </span>
          </div>
          <div className="mt-3">
            <h3 className="text-xl font-black text-purple-700 font-mono">
              Rp {(totalSettledAmount / Math.max(1, totalSettled)).toLocaleString('id-ID', { maximumFractionDigits: 0 })}
            </h3>
            <span className="text-[11px] font-bold text-purple-600 mt-1 inline-block">
              Per Transaksi Berhasil
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
            placeholder="Cari ID transaksi, referensi Midtrans, sekolah, atau PIC..."
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
            <option value="all">Semua Status Transaksi</option>
            <option value="settled">Berhasil (Settled)</option>
            <option value="pending">Tertunda (Pending)</option>
            <option value="expired">Kedaluwarsa (Expired)</option>
            <option value="cancelled">Dibatalkan</option>
          </select>

          <select
            value={channelFilter}
            onChange={(e) => {
              setChannelFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
          >
            <option value="all">Semua Saluran Pembayaran</option>
            <option value="bca">BCA Virtual Account</option>
            <option value="mandiri">Mandiri Bill Payment</option>
            <option value="bri">BRI Virtual Account</option>
            <option value="bni">BNI Virtual Account</option>
            <option value="qris">QRIS Dinamis</option>
            <option value="manual">Transfer Bank Manual</option>
          </select>
        </div>
      </div>

      {/* Tabel Riwayat Transaksi */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/90 border-b border-slate-200/80 text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-3.5 px-4">Order ID &amp; Ref</th>
                <th className="py-3.5 px-4">Sekolah / Tenant</th>
                <th className="py-3.5 px-4">Metode &amp; Saluran</th>
                <th className="py-3.5 px-4 text-right">Nominal</th>
                <th className="py-3.5 px-4 text-center">Waktu Transaksi</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Bukti / Resi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayedTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-indigo-700">
                    <div>{tx.orderId}</div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                      {tx.referenceNo}
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900">{tx.schoolName}</div>
                    <div className="text-[10px] text-slate-400 font-medium">
                      PIC: {tx.payerName}
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-medium text-[11px]">
                      {tx.paymentType === 'qris' ? <QrCode size={12} className="text-indigo-600" /> : <CreditCard size={12} className="text-blue-600" />}
                      <span>{tx.channel}</span>
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900 text-[13px]">
                    Rp {tx.amount.toLocaleString('id-ID')}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <div className="text-slate-700 font-medium font-mono">{tx.createdAt}</div>
                    {tx.settledAt && (
                      <div className="text-[10px] font-bold text-emerald-600 font-mono mt-0.5">
                        Settled: {tx.settledAt.split(' ')[1]}
                      </div>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    {tx.status === 'settled' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                        <CheckCircle2 size={11} />
                        <span>SETTLED</span>
                      </span>
                    )}
                    {tx.status === 'pending' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold">
                        <Clock size={11} />
                        <span>PENDING</span>
                      </span>
                    )}
                    {tx.status === 'expired' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold">
                        <AlertCircle size={11} />
                        <span>EXPIRED</span>
                      </span>
                    )}
                    {tx.status === 'cancelled' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold">
                        <XCircle size={11} />
                        <span>BATAL</span>
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => setSelectedReceipt(tx)}
                      className="px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition cursor-pointer inline-flex items-center gap-1"
                    >
                      <Eye size={12} />
                      <span>Kuitansi</span>
                    </button>
                  </td>
                </tr>
              ))}

              {displayedTransactions.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    <History size={32} className="mx-auto text-slate-300 mb-2" />
                    <p className="text-xs font-medium">Tidak ada transaksi yang cocok dengan kriteria pencarian.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Paginasi */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div>
            Menampilkan <strong>{displayedTransactions.length}</strong> dari <strong>{filteredTransactions.length}</strong> transaksi
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

      {/* Modal Kuitansi / Bukti Pembayaran */}
      {selectedReceipt && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <CheckCircle2 size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">Bukti Pembayaran Resmi</h3>
                  <p className="text-[10px] text-slate-400 font-mono">{selectedReceipt.orderId}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedReceipt(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Sekolah / Tenant</span>
                  <span className="font-bold text-slate-900 text-right">{selectedReceipt.schoolName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">PIC / Pembayar</span>
                  <span className="font-medium text-slate-800">{selectedReceipt.payerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Metode &amp; Saluran</span>
                  <span className="font-medium text-indigo-700">{selectedReceipt.channel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Nomor Referensi Gateway</span>
                  <span className="font-mono text-slate-600">{selectedReceipt.referenceNo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Waktu Pembayaran</span>
                  <span className="font-mono text-slate-800">{selectedReceipt.settledAt || selectedReceipt.createdAt}</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-100 flex items-center justify-between">
                <span className="font-bold text-emerald-900">Total Dibayarkan</span>
                <span className="text-lg font-black text-emerald-800 font-mono">
                  Rp {selectedReceipt.amount.toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  window.print();
                }}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Printer size={14} />
                <span>Cetak Bukti</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  showToast('Bukti kuitansi dikirim ke email PIC sekolah!', 'success');
                  setSelectedReceipt(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-indigo-600/20"
              >
                <CheckCircle2 size={14} />
                <span>Kirim ke Sekolah</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
