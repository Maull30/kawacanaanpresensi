import React, { useRef } from 'react';
import {
  X,
  Printer,
  Download,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  Copy,
  Check,
  ShieldCheck,
  Building2,
  Calendar,
  CreditCard,
  QrCode,
  FileText,
  ExternalLink,
} from 'lucide-react';
import { KawacanaanEmblem } from './KawacanaanEmblem';

export interface InvoiceData {
  id?: string;
  invoiceNumber: string;
  orderId?: string;
  schoolName: string;
  npsn?: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  planName: string;
  planType?: 'guru_pro' | 'sekolah_pro' | 'guru_gratis' | string;
  billingCycle?: 'monthly' | 'yearly';
  amount: number;
  originalAmount?: number;
  discountAmount?: number;
  issueDate?: string;
  dueDate?: string;
  paidAt?: string;
  paymentMethod?: string;
  status: 'paid' | 'settled' | 'pending' | 'overdue' | 'expired' | 'cancelled';
  notes?: string;
}

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: InvoiceData | null;
}

/**
 * Konversi angka rupiah ke teks terbilang bahasa Indonesia
 */
function terbilang(n: number): string {
  if (isNaN(n) || n === 0) return 'Nol Rupiah';
  const satuan = ['', 'Satu', 'Dua', 'Tiga', 'Empat', 'Lima', 'Enam', 'Tujuh', 'Delapan', 'Sembilan', 'Sepuluh', 'Sebelas'];

  function spell(x: number): string {
    if (x < 12) return satuan[x];
    if (x < 20) return spell(x - 10) + ' Belas';
    if (x < 100) return spell(Math.floor(x / 10)) + ' Puluh ' + spell(x % 10);
    if (x < 200) return 'Seratus ' + spell(x - 100);
    if (x < 1000) return spell(Math.floor(x / 100)) + ' Ratus ' + spell(x % 100);
    if (x < 2000) return 'Seribu ' + spell(x - 1000);
    if (x < 1000000) return spell(Math.floor(x / 1000)) + ' Ribu ' + spell(x % 1000);
    if (x < 1000000000) return spell(Math.floor(x / 1000000)) + ' Juta ' + spell(x % 1000000);
    return spell(Math.floor(x / 1000000000)) + ' Miliar ' + spell(x % 1000000000);
  }

  const result = spell(Math.floor(n)).replace(/\s+/g, ' ').trim();
  return `${result} Rupiah`;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ isOpen, onClose, data }) => {
  const [copied, setCopied] = React.useState(false);
  const printableRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !data) return null;

  const isPaid = data.status === 'paid' || data.status === 'settled';
  const isPending = data.status === 'pending';
  const isOverdue = data.status === 'overdue' || data.status === 'expired';

  // Deteksi paket dan siklus secara cerdas berdasarkan data aktual
  const planLower = (data.planName || '').toLowerCase();
  const isSchoolPlan = planLower.includes('sekolah') || data.planType === 'sekolah_pro';
  const isTeacherPlan = !isSchoolPlan;
  const isYearly =
    data.billingCycle === 'yearly' ||
    planLower.includes('tahun') ||
    (isSchoolPlan ? data.amount >= 200000 : data.amount >= 50000);

  // Rincian deskripsi item paket berdasarkan alur kerja sistem Kawacanaan
  let itemTitle = '';
  let itemDescription = '';
  let itemPeriod = '';
  let unitPrice = data.amount;
  let discount = data.discountAmount || 0;

  if (isSchoolPlan) {
    if (isYearly) {
      const isPromo = data.amount === 250000 || discount > 0;
      itemTitle = isPromo
        ? 'Langganan Paket Sekolah Pro (1 Tahun - Promo Perdana)'
        : 'Langganan Paket Sekolah Pro (1 Tahun - Perpanjangan Resmi)';
      itemDescription =
        'Lisensi Satuan Pendidikan Penuh 365 Hari • Multi-Guru (Wali Kelas & Guru Mapel hingga 50 Pendidik) • Kuota 12 Rombongan Belajar & 600 Siswa • Portal Monitoring Orang Tua / Wali Murid Real-Time • Notifikasi WhatsApp Presensi & Surat Izin Sakit • Rekapitulasi Otomatis Format Resmi Siap Sinkronisasi Dapodik & SPJ BOS';
      itemPeriod = '1 Tahun (12 Bulan / 365 Hari Kalender)';
      if (isPromo) {
        unitPrice = 300000;
        discount = 50000;
      } else {
        unitPrice = 300000;
        discount = 0;
      }
    } else {
      itemTitle = 'Langganan Paket Sekolah Pro (1 Bulan)';
      itemDescription =
        'Lisensi Satuan Pendidikan 30 Hari • Multi-Guru & Multi-Kelas • Akses Kepala Sekolah & Operator • Portal Monitoring Wali Murid & WhatsApp Presensi • Rekapitulasi Presensi Siap Cetak';
      itemPeriod = '1 Bulan (30 Hari Kalender)';
      unitPrice = 25000;
      discount = 0;
    }
  } else {
    if (isYearly) {
      itemTitle = 'Langganan Paket Guru Pro (1 Tahun Penuh)';
      itemDescription =
        'Lisensi Pendidik Profesional 365 Hari • Kapasitas hingga 5 Rombongan Belajar Binaan & 150 Siswa • Akses Penuh Presensi Harian Wali Kelas & Presensi Jam Pelajaran Guru Mapel • Cetak PDF & Excel SPJ Resmi A4 • Rekapitulasi Semesteran & Bulanan Siap Tanda Tangan';
      itemPeriod = '1 Tahun (12 Bulan / 365 Hari Kalender)';
      unitPrice = 60000;
      discount = 0;
    } else {
      itemTitle = 'Langganan Paket Guru Pro (1 Bulan)';
      itemDescription =
        'Lisensi Pendidik Profesional 30 Hari • Kapasitas hingga 5 Rombongan Belajar Binaan & 150 Siswa • Akses Penuh Presensi Harian Wali Kelas & Presensi Guru Mapel • Cetak PDF & Excel SPJ Resmi A4 • Rekapitulasi Bulanan';
      itemPeriod = '1 Bulan (30 Hari Kalender)';
      unitPrice = 5000;
      discount = 0;
    }
  }

  // Jika ada custom notes atau amount yang berbeda dari standar
  const finalAmount = data.amount;
  const subtotal = discount > 0 ? unitPrice : finalAmount;

  const handleCopyNo = () => {
    navigator.clipboard.writeText(data.invoiceNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto print:p-0 print:bg-white print:static print:overflow-visible">
      {/* Container Faktur */}
      <div
        ref={printableRef}
        className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden my-6 flex flex-col text-slate-800 animate-in fade-in zoom-in-95 duration-200 print:shadow-none print:border-none print:rounded-none print:my-0 print:max-w-full"
      >
        {/* ACTION BAR (Hidden in print) */}
        <div className="bg-slate-900 text-white px-6 py-3.5 flex items-center justify-between border-b border-slate-800 print:hidden">
          <div className="flex items-center gap-2">
            <FileText size={16} className="text-indigo-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Dokumen Faktur Resmi Kawacanaan
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-sm active:scale-95"
            >
              <Printer size={14} />
              <span>Cetak / Simpan PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              title="Tutup Faktur"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* FAKTUR BODY (Printable Area) */}
        <div className="p-6 sm:p-8 space-y-6 print:p-8 text-xs">
          {/* HEADER FAKTUR: Brand & Status */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 pb-6 border-b-2 border-slate-100">
            {/* Logo & Identitas Perusahaan */}
            <div className="space-y-2.5">
              <div className="flex items-center gap-3">
                <KawacanaanEmblem size="lg" />
                <div>
                  <h1 className="text-lg font-black tracking-tight text-slate-900 leading-none">
                    KAWACANAAN PRESENSI
                  </h1>
                  <p className="text-[11px] font-semibold text-indigo-600 tracking-wider uppercase mt-0.5">
                    Platform Presensi Digital Terpadu Sekolah
                  </p>
                </div>
              </div>

              <div className="text-[11px] text-slate-500 leading-relaxed max-w-sm">
                <p className="font-semibold text-slate-700">PT Kawacanaan Edukasi Digital</p>
                <p>Divisi Finansial, Billing &amp; Layanan Operasional Langganan</p>
                <p>Email: finance@kawacanaan.id • WhatsApp: +62 812-3456-7890</p>
                <p>Portal Resmi: https://kawacanaan.sch.id</p>
              </div>
            </div>

            {/* Nomor Faktur & Status Tagihan */}
            <div className="text-left sm:text-right space-y-2">
              <div className="inline-block">
                <span className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400 block">
                  FAKTUR TAGIHAN / INVOICE
                </span>
                <div className="flex items-center sm:justify-end gap-1.5 mt-0.5">
                  <span className="font-mono text-base font-black text-slate-900">
                    {data.invoiceNumber}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyNo}
                    className="p-1 text-slate-400 hover:text-slate-600 print:hidden cursor-pointer"
                    title="Salin No. Faktur"
                  >
                    {copied ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                  </button>
                </div>
              </div>

              {/* Status Badge */}
              <div className="flex sm:justify-end">
                {isPaid && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs font-black uppercase tracking-wider">
                    <CheckCircle2 size={14} className="text-emerald-600" />
                    <span>LUNAS (SETTLED)</span>
                  </span>
                )}
                {isPending && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-800 border border-blue-300 text-xs font-black uppercase tracking-wider">
                    <Clock size={14} className="text-blue-600" />
                    <span>MENUNGGU PEMBAYARAN</span>
                  </span>
                )}
                {isOverdue && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-800 border border-rose-300 text-xs font-black uppercase tracking-wider">
                    <AlertTriangle size={14} className="text-rose-600" />
                    <span>JATUH TEMPO / EXPIRED</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* DITAGIHKAN KEPADA & INFORMASI TANGGAL */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80">
            {/* Ditagihkan Kepada */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                Ditagihkan Kepada:
              </span>
              <div className="text-sm font-black text-slate-900">
                {data.schoolName || 'Satuan Pendidikan'}
              </div>
              {data.npsn && data.npsn !== '-' && (
                <div className="text-[11px] text-slate-600 font-mono">
                  NPSN: <strong>{data.npsn}</strong>
                </div>
              )}
              <div className="text-[11px] text-slate-600">
                PIC / Kontak: <strong>{data.customerName || 'Bapak/Ibu Pendidik'}</strong>
              </div>
              {data.customerEmail && (
                <div className="text-[11px] text-slate-500 font-mono">
                  Email: {data.customerEmail}
                </div>
              )}
              {data.customerPhone && (
                <div className="text-[11px] text-slate-500 font-mono">
                  No. Telepon / WA: {data.customerPhone}
                </div>
              )}
            </div>

            {/* Informasi Waktu & Pembayaran */}
            <div className="space-y-1.5 sm:text-right">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                Parameter Tagihan:
              </span>
              <div className="text-[11px] text-slate-600">
                Tanggal Terbit:{' '}
                <strong className="text-slate-800">
                  {data.issueDate || new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}
                </strong>
              </div>
              <div className="text-[11px] text-slate-600">
                Batas Pembayaran:{' '}
                <strong className="text-slate-800">
                  {data.dueDate || new Date(Date.now() + 86400000).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}
                </strong>
              </div>
              <div className="text-[11px] text-slate-600">
                Metode Pembayaran:{' '}
                <strong className="text-indigo-700">
                  {data.paymentMethod || 'Midtrans Payment Gateway (QRIS, VA Bank, GoPay)'}
                </strong>
              </div>
              {isPaid && (
                <div className="text-[11px] text-emerald-700 font-semibold">
                  Tanggal Lunas:{' '}
                  <strong>
                    {data.paidAt || new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </strong>
                </div>
              )}
            </div>
          </div>

          {/* TABEL ITEM TAGIHAN / RINCIAN PAKET */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/90 text-slate-500 font-extrabold uppercase tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4 w-12 text-center">No</th>
                  <th className="py-3 px-4">Deskripsi Layanan &amp; Rincian Hak Akses</th>
                  <th className="py-3 px-4 text-center">Masa Aktif</th>
                  <th className="py-3 px-4 text-right">Harga</th>
                  <th className="py-3 px-4 text-right">Jumlah</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="py-4 px-4 text-center font-bold text-slate-400 align-top">
                    1
                  </td>
                  <td className="py-4 px-4 align-top space-y-1.5">
                    <div className="font-black text-slate-900 text-sm">
                      {itemTitle}
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      {itemDescription}
                    </p>
                    {data.notes && (
                      <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-[10.5px] text-slate-600">
                        Catatan: {data.notes}
                      </div>
                    )}
                  </td>
                  <td className="py-4 px-4 text-center align-top font-semibold text-slate-700 whitespace-nowrap">
                    {itemPeriod}
                  </td>
                  <td className="py-4 px-4 text-right align-top font-mono font-bold text-slate-700 whitespace-nowrap">
                    Rp {unitPrice.toLocaleString('id-ID')}
                  </td>
                  <td className="py-4 px-4 text-right align-top font-mono font-black text-slate-900 text-sm whitespace-nowrap">
                    Rp {subtotal.toLocaleString('id-ID')}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* PERHITUNGAN & TOTAL AKHIR */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
            {/* Kolom Kiri: Terbilang & Catatan Kebijakan */}
            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-100 space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-700">
                  Jumlah Terbilang:
                </span>
                <p className="text-xs font-bold text-indigo-950 italic">
                  # {terbilang(finalAmount)} #
                </p>
              </div>

              <div className="text-[10px] text-slate-500 leading-relaxed space-y-1">
                <p className="font-bold text-slate-700 uppercase tracking-wide">
                  Ketentuan &amp; Informasi Layanan:
                </p>
                <ul className="list-disc pl-3.5 space-y-0.5">
                  <li>Faktur ini diterbitkan secara sah dan otomatis oleh sistem Kawacanaan Presensi.</li>
                  <li>Bebas PPN Jasa Pendidikan berdasarkan ketentuan UU No. 7 Tahun 2021 (Harmonisasi Peraturan Perpajakan).</li>
                  <li>Akses fitur berbayar diaktifkan seketika setelah pembayaran terverifikasi lunas.</li>
                  <li>Simpan nomor faktur ini sebagai bukti pembayaran resmi untuk pelaporan SPJ BOS atau dinas pendidikan.</li>
                </ul>
              </div>
            </div>

            {/* Kolom Kanan: Rincian Angka Subtotal, Diskon, Total */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
              <div className="flex justify-between text-slate-600 text-xs">
                <span>Subtotal Layanan:</span>
                <span className="font-mono font-semibold">Rp {subtotal.toLocaleString('id-ID')}</span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-emerald-700 text-xs">
                  <span>Potongan Promo Perdana:</span>
                  <span className="font-mono font-bold">- Rp {discount.toLocaleString('id-ID')}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-600 text-xs">
                <span>PPN 0% (Jasa Pendidikan):</span>
                <span className="font-mono font-semibold">Rp 0</span>
              </div>

              <div className="flex justify-between text-slate-600 text-xs">
                <span>Biaya Transaksi / Gateway:</span>
                <span className="font-mono font-semibold text-emerald-700">Rp 0 (Ditanggung)</span>
              </div>

              <div className="pt-3 border-t-2 border-slate-200 flex justify-between items-baseline">
                <span className="font-black text-slate-900 text-sm">TOTAL TAGIHAN:</span>
                <span className="font-black text-emerald-800 font-mono text-xl">
                  Rp {finalAmount.toLocaleString('id-ID')}
                </span>
              </div>
            </div>
          </div>

          {/* STEMPEL RESMI & TANDA TANGAN DIGITAL */}
          <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-6">
            {/* Verifikasi Digital QR Code */}
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-800 shrink-0">
                <QrCode size={28} />
              </div>
              <div className="text-[10px] text-slate-500">
                <div className="font-bold text-slate-800">Verifikasi Faktur Digital</div>
                <div className="font-mono text-[9.5px] text-slate-400">
                  ID: {data.invoiceNumber}
                </div>
                <div className="text-emerald-700 font-semibold mt-0.5">
                  Tervalidasi Sistem Kawacanaan
                </div>
              </div>
            </div>

            {/* Cap Digital & Tanda Tangan */}
            <div className="text-center sm:text-right space-y-1">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                Diterbitkan secara digital oleh:
              </div>
              <div className="relative inline-block py-1">
                {isPaid && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 sm:translate-x-0 sm:right-6 border-2 border-dashed border-emerald-600 rounded-xl px-3 py-1 text-emerald-700 font-black text-xs uppercase tracking-widest rotate-[-8deg] pointer-events-none opacity-80 bg-white/90 shadow-xs">
                    LUNAS • PAID
                  </div>
                )}
                <div className="font-black text-slate-900 text-sm">
                  PT KAWACANAAN EDUKASI DIGITAL
                </div>
                <div className="text-[11px] text-slate-500">
                  Finance &amp; Subscription Directorate
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER DIALOG (Hidden in print) */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between gap-3 print:hidden">
          <div className="text-[11px] text-slate-500 font-mono">
            {data.orderId ? `Ref Order Gateway: ${data.orderId}` : `Ref ID: ${data.invoiceNumber}`}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold transition cursor-pointer"
            >
              Tutup
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition cursor-pointer active:scale-95"
            >
              <Printer size={14} />
              <span>Cetak Faktur Ini</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
