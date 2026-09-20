import React, { useState } from 'react';
import {
  X,
  Download,
  FileSpreadsheet,
  SlidersHorizontal,
  CreditCard,
  Building,
  CheckCircle2,
  Headphones,
  Phone,
  Mail,
  ExternalLink,
  QrCode,
  Sparkles,
  Save
} from 'lucide-react';

/**
 * Modal Unduh Laporan Keuangan
 */
export const FinancialReportModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  showToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}> = ({ isOpen, onClose, showToast }) => {
  const [period, setPeriod] = useState('september-2026');
  const [format, setFormat] = useState<'csv' | 'xlsx'>('csv');
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen) return null;

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      // Mock CSV generation and download
      const csvContent = "data:text/csv;charset=utf-8," + 
        "No,ID Transaksi,Sekolah,Siswa/PIC,Paket,Metode,Jumlah,Tanggal,Status\n" +
        "1,TRX-2026-000248,SDN KAWUNG LUWUK,Rina Putri,Paket Sekolah Pro (1 Bulan),Transfer Bank,25000,19/09/2026 10:24,Lunas\n" +
        "2,TRX-2026-000247,SMKN 1 Luwuk,Andi Saputra,Paket Premium (1 Bulan),Virtual Account,150000,19/09/2026 09:17,Lunas\n" +
        "3,TRX-2026-000246,SMPN 1 Luwuk,Siti Nurhaliza,Paket Basic (1 Bulan),QRIS,75000,18/09/2026 16:43,Lunas\n" +
        "4,TRX-2026-000245,SMK Negeri 1 Luwuk,Budi Santoso,Paket Premium (1 Bulan),E-Wallet,120000,18/09/2026 14:20,Lunas\n" +
        "5,TRX-2026-000244,SDN 1 Luwuk,Nabila Zahra,Paket Sekolah Pro (1 Bulan),Transfer Bank,25000,17/09/2026 11:05,Menunggu\n";
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `laporan_keuangan_kawacanaan_${period}.${format}`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setIsExporting(false);
      showToast(`Laporan keuangan ${period} berhasil diunduh!`, 'success');
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 my-8 space-y-5 animate-in fade-in zoom-in duration-150">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <FileSpreadsheet size={18} />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900">Ekspor Laporan Keuangan</h3>
              <p className="text-[11px] text-slate-400">Unduh data transaksi & rekapitulasi</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer transition"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4 text-xs">
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700">Pilih Periode Laporan</label>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 font-medium text-slate-800 focus:outline-blue-600"
            >
              <option value="september-2026">September 2026 (Bulan Berjalan)</option>
              <option value="agustus-2026">Agustus 2026</option>
              <option value="q3-2026">Kuartal 3 2026 (Juli - Sep)</option>
              <option value="ta-2026-2027">Tahun Ajaran 2026/2027 Penuh</option>
              <option value="all-time">Seluruh Riwayat Transaksi (All Time)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-slate-700">Format Dokumen</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFormat('csv')}
                className={`p-2.5 rounded-xl border text-center font-bold transition cursor-pointer ${
                  format === 'csv'
                    ? 'border-blue-600 bg-blue-50 text-blue-700 ring-2 ring-blue-600/20'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                CSV (.csv)
              </button>
              <button
                type="button"
                onClick={() => setFormat('xlsx')}
                className={`p-2.5 rounded-xl border text-center font-bold transition cursor-pointer ${
                  format === 'xlsx'
                    ? 'border-blue-600 bg-blue-50 text-blue-700 ring-2 ring-blue-600/20'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Microsoft Excel (.xlsx)
              </button>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-[11px] text-slate-500 space-y-1">
            <div className="flex justify-between">
              <span>Estimasi Transaksi:</span>
              <strong className="text-slate-800">248 baris</strong>
            </div>
            <div className="flex justify-between">
              <span>Total Nominal:</span>
              <strong className="text-emerald-700 font-bold">Rp 257.800.000</strong>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleExport}
            disabled={isExporting}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition cursor-pointer disabled:opacity-50"
          >
            <Download size={14} />
            <span>{isExporting ? 'Mengekspor...' : 'Unduh Laporan'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Modal Pengaturan Metode Pembayaran & Rekening
 */
export const PaymentSettingsModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  showToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}> = ({ isOpen, onClose, showToast }) => {
  const [methodsState, setMethodsState] = useState({
    bankBCA: { active: true, accNo: '8720192831', accName: 'PT KAWACANAAN EDUKASI' },
    bankMandiri: { active: true, accNo: '1370019283712', accName: 'PT KAWACANAAN EDUKASI' },
    bankBRI: { active: true, accNo: '028101002918301', accName: 'PT KAWACANAAN EDUKASI' },
    vaMidtrans: { active: true },
    qrisGopay: { active: true },
    ewallet: { active: true },
  });

  if (!isOpen) return null;

  const handleSave = () => {
    showToast('Pengaturan kanal pembayaran berhasil disimpan.', 'success');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 my-8 space-y-5 animate-in fade-in zoom-in duration-150">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <SlidersHorizontal size={18} />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900">Pengaturan Metode Pembayaran</h3>
              <p className="text-[11px] text-slate-400">Konfigurasi rekening tujuan & gateway aktif</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer transition"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-3.5 text-xs max-h-[60vh] overflow-y-auto pr-1">
          {/* BCA */}
          <div className="p-3 rounded-2xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-bold text-[10px]">Bank BCA</span>
                <span className="font-bold text-slate-800">Transfer Manual BCA</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={methodsState.bankBCA.active}
                  onChange={(e) => setMethodsState(p => ({ ...p, bankBCA: { ...p.bankBCA, active: e.target.checked } }))}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <span className="text-slate-400 block">Nomor Rekening:</span>
                <input
                  type="text"
                  value={methodsState.bankBCA.accNo}
                  onChange={(e) => setMethodsState(p => ({ ...p, bankBCA: { ...p.bankBCA, accNo: e.target.value } }))}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 font-mono font-bold text-slate-800"
                />
              </div>
              <div>
                <span className="text-slate-400 block">Atas Nama:</span>
                <input
                  type="text"
                  value={methodsState.bankBCA.accName}
                  onChange={(e) => setMethodsState(p => ({ ...p, bankBCA: { ...p.bankBCA, accName: e.target.value } }))}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 font-semibold text-slate-800"
                />
              </div>
            </div>
          </div>

          {/* Virtual Account Midtrans */}
          <div className="p-3 rounded-2xl border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs">
                VA
              </div>
              <div>
                <div className="font-bold text-slate-800">Virtual Account Otomatis (Midtrans)</div>
                <div className="text-[10px] text-slate-400">BCA, Mandiri, BNI, BRI, Permata VA</div>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Aktif Otomatis
            </span>
          </div>

          {/* QRIS */}
          <div className="p-3 rounded-2xl border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-xs">
                <QrCode size={16} />
              </div>
              <div>
                <div className="font-bold text-slate-800">QRIS Dinamis (Semua E-Wallet & M-Banking)</div>
                <div className="text-[10px] text-slate-400">Verifikasi instan detik itu juga</div>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Aktif
            </span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
          >
            Tutup
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
          >
            <Save size={14} />
            <span>Simpan Perubahan</span>
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Modal Dialog Bantuan Super Admin
 */
export const SupportModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 my-8 space-y-5 animate-in fade-in zoom-in duration-150">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Headphones size={20} />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900">Bantuan Billing & Pembayaran</h3>
              <p className="text-[11px] text-slate-400">Dukungan operasional platform Kawacanaan</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer transition"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-3 text-xs">
          <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-100 text-slate-700 leading-relaxed text-[11.5px]">
            Jika mengalami kendala penagihan, status invoice gantung di gateway, atau rekonsiliasi manual mutasi rekening sekolah, Anda dapat langsung menghubungi pusat kendali teknis:
          </div>

          <div className="space-y-2">
            <div className="p-3 rounded-xl border border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                  <Phone size={14} />
                </div>
                <div>
                  <div className="font-bold text-slate-800">WhatsApp Support Superadmin</div>
                  <div className="text-[10px] text-slate-400 font-mono">+62 812-3456-7890</div>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                Online 24/7
              </span>
            </div>

            <div className="p-3 rounded-xl border border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                  <Mail size={14} />
                </div>
                <div>
                  <div className="font-bold text-slate-800">Email Operasional Finansial</div>
                  <div className="text-[10px] text-slate-400 font-mono">finance@kawacanaan.id</div>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 text-[10px] font-bold">
                Respon Cepat
              </span>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
