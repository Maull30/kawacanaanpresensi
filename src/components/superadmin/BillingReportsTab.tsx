import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Download,
  Calendar,
  DollarSign,
  TrendingUp,
  CreditCard,
  PieChart,
  Printer,
  ChevronRight,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  Building2
} from 'lucide-react';

interface MonthlyRecord {
  month: string;
  txCount: number;
  gross: number;
  gatewayFee: number;
  net: number;
  growth: string;
  status: 'Audited' | 'Final' | 'Ongoing';
}

const MONTHLY_DATA: MonthlyRecord[] = [
  { month: 'September 2026 (Berjalan)', txCount: 248, gross: 257800000, gatewayFee: 2190000, net: 255610000, growth: '+14.2%', status: 'Ongoing' },
  { month: 'Agustus 2026', txCount: 212, gross: 225600000, gatewayFee: 1917600, net: 223682400, growth: '+18.5%', status: 'Audited' },
  { month: 'Juli 2026 (Tahun Ajaran Baru)', txCount: 195, gross: 190400000, gatewayFee: 1618400, net: 188781600, growth: '+32.1%', status: 'Audited' },
  { month: 'Juni 2026', txCount: 140, gross: 144100000, gatewayFee: 1224850, net: 142875150, growth: '+5.0%', status: 'Audited' },
  { month: 'Mei 2026', txCount: 132, gross: 137200000, gatewayFee: 1166200, net: 136033800, growth: '+8.2%', status: 'Audited' },
  { month: 'April 2026', txCount: 120, gross: 126800000, gatewayFee: 1077800, net: 125722200, growth: '+11.0%', status: 'Audited' },
];

interface BillingReportsTabProps {
  showToast: (msg: string, type: 'success' | 'error' | 'info') => void;
  onOpenReportModal: () => void;
}

export const BillingReportsTab: React.FC<BillingReportsTabProps> = ({
  showToast,
  onOpenReportModal,
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState<string>('q3-2026');

  const handleDownloadPDF = () => {
    showToast('Menyiapkan berkas Laporan Finansial Resmi Kawacanaan (PDF)...', 'info');
    setTimeout(() => {
      window.print();
    }, 400);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner Laporan Keuangan */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 sm:p-7 text-white shadow-xl border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-300 text-xs font-bold uppercase tracking-wider">
              <FileSpreadsheet size={13} />
              <span>Platform Financial Analytics</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Laporan Keuangan &amp; Analisis Finansial
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Ringkasan pembukuan omset kotor, potongan biaya gateway payment, pendapatan bersih (Net Revenue), serta estimasi MRR dan ARR platform Kawacanaan Presensi.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={onOpenReportModal}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border border-slate-700"
            >
              <Download size={14} />
              <span>Ekspor CSV / Excel</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadPDF}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/30"
            >
              <Printer size={14} />
              <span>Cetak / Cetak PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Metrik Keuangan SaaS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">MRR (Bulan Ini)</span>
            <span className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <TrendingUp size={16} />
            </span>
          </div>
          <div className="mt-3">
            <h3 className="text-xl font-black text-slate-900 font-mono">Rp 257.800.000</h3>
            <span className="text-[11px] font-bold text-emerald-600 mt-1 inline-flex items-center gap-1">
              <ArrowUpRight size={12} />
              <span>+14.2% MoM vs Agustus</span>
            </span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">ARR Proyeksi Tahunan</span>
            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <DollarSign size={16} />
            </span>
          </div>
          <div className="mt-3">
            <h3 className="text-xl font-black text-emerald-700 font-mono">Rp 3.093.600.000</h3>
            <span className="text-[11px] font-bold text-slate-500 mt-1 inline-block">
              Annualized Run Rate Terkalkulasi
            </span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Margin Laba Bersih</span>
            <span className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Sparkles size={16} />
            </span>
          </div>
          <div className="mt-3">
            <h3 className="text-xl font-black text-blue-700 font-mono">91.4%</h3>
            <span className="text-[11px] font-bold text-blue-600 mt-1 inline-block">
              Setelah dipotong MDR Gateway
            </span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">ARPU (Rata-rata / Sekolah)</span>
            <span className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <Building2 size={16} />
            </span>
          </div>
          <div className="mt-3">
            <h3 className="text-xl font-black text-purple-700 font-mono">Rp 2.148.000</h3>
            <span className="text-[11px] font-bold text-purple-600 mt-1 inline-block">
              Dari 120 Sekolah Terdaftar
            </span>
          </div>
        </div>
      </div>

      {/* Komposisi Pendapatan per Paket Langganan */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-black text-slate-900">Distribusi Pendapatan Menurut Paket Lisensi</h3>
            <p className="text-xs text-slate-500 mt-0.5">Komparasi kontribusi pendapatan antara Paket Sekolah Pro dan Paket Guru Pro.</p>
          </div>
        </div>

        <div className="space-y-3 pt-2">
          <div>
            <div className="flex justify-between text-xs font-bold mb-1.5">
              <span className="text-slate-800">Paket Sekolah Pro (Multi-Kiosk &amp; Siswa)</span>
              <span className="text-indigo-700 font-mono">Rp 218.000.000 (84.5%)</span>
            </div>
            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-600 rounded-full" style={{ width: '84.5%' }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-bold mb-1.5">
              <span className="text-slate-800">Paket Guru Pro (Absensi Mandiri PTK)</span>
              <span className="text-emerald-700 font-mono">Rp 39.800.000 (15.5%)</span>
            </div>
            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: '15.5%' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Rekapitulasi Pembukuan Finansial Bulanan */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-black text-slate-900">Buku Besar Rekapitulasi Pendapatan Bulanan (2026)</h3>
            <p className="text-xs text-slate-500 mt-0.5">Catatan historis pendapatan kotor, potongan beban MDR gateway, dan laba bersih.</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/90 border-b border-slate-200/80 text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-3.5 px-4">Periode Bulan</th>
                <th className="py-3.5 px-4 text-center">Jml Transaksi</th>
                <th className="py-3.5 px-4 text-right">Pendapatan Kotor (Gross)</th>
                <th className="py-3.5 px-4 text-right">Fee Gateway (Midtrans)</th>
                <th className="py-3.5 px-4 text-right">Pendapatan Bersih (Net)</th>
                <th className="py-3.5 px-4 text-center">Pertumbuhan (MoM)</th>
                <th className="py-3.5 px-4 text-center">Status Audit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {MONTHLY_DATA.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center gap-2">
                    <Calendar size={13} className="text-indigo-600 shrink-0" />
                    <span>{row.month}</span>
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono font-medium text-slate-700">
                    {row.txCount} Transaksi
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                    Rp {row.gross.toLocaleString('id-ID')}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-rose-600 font-medium">
                    -Rp {row.gatewayFee.toLocaleString('id-ID')}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-black text-emerald-700 text-[13px]">
                    Rp {row.net.toLocaleString('id-ID')}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full text-[11px] font-mono">
                      {row.growth}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      row.status === 'Audited' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' :
                      row.status === 'Ongoing' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
