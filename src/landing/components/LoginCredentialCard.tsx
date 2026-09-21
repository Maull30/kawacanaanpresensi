import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import html2canvas from 'html2canvas';
import {
  Shield,
  MapPin,
  Lock,
  User,
  Building2,
  Calendar,
  FileText,
  CreditCard,
  ExternalLink,
  Smartphone,
  CheckCircle2,
  Download,
  Loader2,
  Copy,
  Check,
} from 'lucide-react';
import heroSchoolImg from '../../assets/images/hero_school_3d_1789857004173.jpg';

export interface LoginCredentialCardData {
  workspaceType: 'school' | 'personal';
  schoolName: string;
  personInCharge: string;
  username: string;
  password: string;
  schoolCode?: string;
  expiryDateText?: string;
  invoiceNo?: string;
  nominalText?: string;
  paymentMethodText?: string;
  portalUrl?: string;
  referenceId?: string;
  registeredDateText?: string;
  photoUrl?: string;
}

interface LoginCredentialCardProps {
  data: LoginCredentialCardData;
  onEnterSystem?: () => void;
  className?: string;
}

export const LoginCredentialCard: React.FC<LoginCredentialCardProps> = ({
  data,
  onEnterSystem,
  className = '',
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  const portalUrl =
    data.portalUrl ||
    (typeof window !== 'undefined'
      ? `${window.location.origin}/login`
      : 'https://kawacanaanpresensi.vercel.app/login');

  const todayText =
    data.registeredDateText ||
    new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
    });

  const refId =
    data.referenceId ||
    Math.random().toString(36).substring(2, 9).toLowerCase();

  const codeDisplay = data.schoolCode || (data.workspaceType === 'school' ? 'BELUM-TERBIT' : 'MANDIRI-PRO');

  // Generate QR Code untuk direct scan menuju portal login
  useEffect(() => {
    let isMounted = true;
    QRCode.toDataURL(portalUrl, {
      margin: 1,
      width: 140,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    })
      .then((url) => {
        if (isMounted) setQrCodeDataUrl(url);
      })
      .catch((err) => {
        console.error('QR generation error:', err);
      });

    return () => {
      isMounted = false;
    };
  }, [portalUrl]);

  // Fitur unduh kartu kredensial (1 tombol "Unduh" sesuai instruksi)
  const handleDownloadCard = async () => {
    if (!cardRef.current || isDownloading) return;
    setIsDownloading(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2, // 960x600 px untuk kualitas tajam resolusi tinggi
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: 480,
        height: 300,
        windowWidth: 480,
        windowHeight: 300,
        logging: false,
      });

      const dataUrl = canvas.toDataURL('image/png', 1.0);
      const anchor = document.createElement('a');
      anchor.download = `Kartu-Kredensial-${data.username || 'Login'}.png`;
      anchor.href = dataUrl;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
    } catch (error) {
      console.error('Gagal mengunduh kartu kredensial:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCopyCredentials = () => {
    const text = `KREDENSIAL LOGIN KAWACANAAN PRESENSI SD\n${
      data.workspaceType === 'school' ? 'Ruang Kerja Sekolah' : 'Ruang Kerja Individu'
    }: ${data.schoolName}\nPenanggung Jawab: ${data.personInCharge}\nUsername: ${
      data.username
    }\nPassword: ${data.password}\nKode Akses: ${codeDisplay}\nMasa Aktif: ${
      data.expiryDateText || 'Aktif'
    }\nPortal Akses: ${portalUrl}`;

    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className={`flex flex-col items-center gap-3.5 ${className}`}>
      {/* Container pembungkus scroll horizontal jika di mobile screen kecil */}
      <div className="w-full flex justify-center overflow-x-auto pb-1.5 pt-1 px-1">
        {/* ========================================================================= */}
        {/* KARTU KREDENSIAL LOGIN (UKURAN TEPAT: 480 × 300 PX)                        */}
        {/* Mengikuti layout, style, dan komposisi gambar referensi secara presisi    */}
        {/* ========================================================================= */}
        <div
          ref={cardRef}
          style={{ width: '480px', height: '300px', minWidth: '480px', minHeight: '300px' }}
          className="relative bg-white rounded-[20px] shadow-xl border border-slate-200/90 overflow-hidden flex select-none text-slate-900 shrink-0 font-sans"
        >
          {/* ===================================================================== */}
          {/* SISI KIRI (Background Navy Gradient + Logo + Foto Sekolah + QR)        */}
          {/* ===================================================================== */}
          <div className="w-[195px] h-full bg-gradient-to-b from-[#093570] via-[#0d4289] to-[#082a5c] relative flex flex-col justify-between text-white p-2.5 overflow-hidden shrink-0">
            {/* Latar Belakang Lengkung Putih Bagian Atas Logo */}
            <div className="absolute top-0 left-0 right-0 h-[56px] bg-white rounded-br-[28px] shadow-sm z-0 flex items-center px-2.5 pt-1.5">
              <div className="flex items-center gap-1.5">
                {/* Logo K squircle */}
                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-black text-xs shadow-xs border border-blue-400/40 shrink-0">
                  <span>K</span>
                </div>
                {/* Teks Logo */}
                <div className="leading-tight">
                  <div className="flex items-center gap-1 text-[11px] font-black tracking-tight">
                    <span className="text-slate-900">KawaCanaan</span>
                    <span className="text-blue-600">Presensi</span>
                  </div>
                  <div className="text-[6.5px] font-semibold text-slate-500 tracking-tight">
                    Platform Presensi Khusus Jenjang SD
                  </div>
                </div>
              </div>
            </div>

            {/* Konten Bagian Tengah Kiri (Di bawah lengkungan putih) */}
            <div className="relative z-10 pt-[52px] space-y-1.5">
              {/* Badge Ruang Kerja: Sesuai Instruksi Khusus User */}
              {/* (teks kartu kredensial resmi pendidikannya diganti dengan teks ruang kerja sekolah/ruang kerja individu) */}
              <div className="inline-flex items-center gap-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-[7.5px] font-black uppercase px-2 py-0.5 rounded-full shadow-xs tracking-wider border border-blue-300/30">
                <Building2 size={10} className="shrink-0" />
                <span className="truncate">
                  {data.workspaceType === 'school' ? 'RUANG KERJA SEKOLAH' : 'RUANG KERJA INDIVIDU'}
                </span>
              </div>

              {/* Satuan Pendidikan / Ruang Kerja Header */}
              <div className="space-y-0.5">
                <div className="text-[6.5px] font-bold tracking-widest text-blue-200/90 uppercase">
                  SATUAN PENDIDIKAN / RUANG KERJA
                </div>
                <div className="text-[12px] font-black text-white tracking-tight uppercase leading-snug line-clamp-1">
                  {data.schoolName || (data.workspaceType === 'school' ? 'SDN KAWACANAAN' : 'GURU INDIVIDU SD')}
                </div>
                <div className="flex items-center gap-1 text-[7px] text-blue-100/90 truncate font-medium">
                  <MapPin size={8} className="shrink-0 text-blue-300" />
                  <span className="truncate">Penanggung Jawab: {data.personInCharge}</span>
                </div>
              </div>

              {/* Grid 2 Kolom: Foto Gedung SD & QR Code Scan Masuk */}
              <div className="flex items-center gap-2 pt-0.5">
                {/* Foto Sekolah SD Melengkung */}
                <div className="w-[82px] h-[72px] rounded-t-[28px] rounded-b-lg overflow-hidden border border-white/40 shadow-xs bg-blue-900/40 shrink-0 relative">
                  <img
                    src={data.photoUrl || heroSchoolImg}
                    alt="Sekolah Dasar"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                </div>

                {/* Kotak QR Code Putih & Label Scan */}
                <div className="flex flex-col items-center gap-0.5">
                  <div className="w-[66px] h-[66px] bg-white rounded-lg p-0.5 shadow-sm flex items-center justify-center border border-white/60">
                    {qrCodeDataUrl ? (
                      <img
                        src={qrCodeDataUrl}
                        alt="QR Akses Login"
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="w-full h-full bg-slate-100 flex items-center justify-center text-[7px] text-slate-400 font-mono">
                        QR
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-0.5 text-[5.5px] text-blue-100/90 font-semibold tracking-tight">
                    <Smartphone size={7} className="shrink-0 text-blue-300" />
                    <span>Scan Masuk Portal</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Kiri: Watermark & Motto */}
            <div className="relative z-10 pt-1 border-t border-blue-400/20 flex items-center gap-1 text-[6.5px] text-blue-100/80">
              <Shield size={9} className="shrink-0 text-blue-300" />
              <div className="leading-tight">
                <span className="font-bold text-white">KawaCanaan Presensi</span>
                <span className="opacity-75"> • Solusi Presensi Jenjang SD</span>
              </div>
            </div>
          </div>

          {/* ===================================================================== */}
          {/* SISI KANAN (White Background: Header, Kredensial 2x2, Invoice, Link) */}
          {/* ===================================================================== */}
          <div className="flex-1 h-full bg-white p-3 flex flex-col justify-between overflow-hidden">
            {/* Header Slogan Kanan Atas */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-1">
              <div className="flex items-center gap-1.5 text-[10.5px] font-black text-slate-900 tracking-wide">
                <div className="w-4 h-4 rounded-md bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                  <Lock size={10} />
                </div>
                <span>KREDENSIAL LOGIN</span>
              </div>
              <div className="text-[7px] font-semibold text-slate-400 tracking-tight">
                Absensi Tertib • Data Akurat • Sekolah Maju
              </div>
            </div>

            {/* Grid 2x2 Field Kredensial */}
            <div className="grid grid-cols-2 gap-1.5 pt-1">
              {/* Box 1: Username */}
              <div className="bg-[#f0f5fc] border border-[#e0ebf9] rounded-lg p-1.5">
                <div className="flex items-center gap-1 text-[6.5px] font-bold text-slate-500 uppercase tracking-wider">
                  <User size={8} className="text-blue-600 shrink-0" />
                  <span>USERNAME LOGIN</span>
                </div>
                <div className="font-mono text-[10px] font-black text-slate-900 truncate mt-0.5 tracking-tight">
                  {data.username}
                </div>
              </div>

              {/* Box 2: Password */}
              <div className="bg-[#f0f5fc] border border-[#e0ebf9] rounded-lg p-1.5">
                <div className="flex items-center gap-1 text-[6.5px] font-bold text-slate-500 uppercase tracking-wider">
                  <Lock size={8} className="text-blue-600 shrink-0" />
                  <span>PASSWORD LOGIN</span>
                </div>
                <div className="font-mono text-[10px] font-black text-slate-900 truncate mt-0.5 tracking-tight">
                  {data.password}
                </div>
              </div>

              {/* Box 3: Kode Akses Sekolah / Ruang Kerja */}
              <div className="bg-[#f0f5fc] border border-[#e0ebf9] rounded-lg p-1.5">
                <div className="flex items-center gap-1 text-[6.5px] font-bold text-slate-500 uppercase tracking-wider">
                  <Building2 size={8} className="text-blue-600 shrink-0" />
                  <span>{data.workspaceType === 'school' ? 'KODE AKSES SEKOLAH' : 'KODE RUANG KERJA'}</span>
                </div>
                <div className="font-mono text-[10px] font-black text-slate-900 truncate mt-0.5 tracking-wider">
                  {codeDisplay}
                </div>
              </div>

              {/* Box 4: Masa Aktif Lisensi */}
              <div className="bg-[#f0f5fc] border border-[#e0ebf9] rounded-lg p-1.5">
                <div className="flex items-center gap-1 text-[6.5px] font-bold text-slate-500 uppercase tracking-wider">
                  <Calendar size={8} className="text-blue-600 shrink-0" />
                  <span>MASA AKTIF LISENSI</span>
                </div>
                <div className="text-[10px] font-black text-slate-900 truncate mt-0.5">
                  {data.expiryDateText || 'Aktif'}
                </div>
              </div>
            </div>

            {/* Status Aktif Pill */}
            <div className="pt-0.5">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[7px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 animate-pulse" />
                <span>STATUS: AKTIF (TERDAFTAR)</span>
              </div>
            </div>

            {/* Rincian Transaksi / Pendaftaran */}
            <div className="border-t border-slate-100 pt-1 space-y-0.5 text-[7px] text-slate-600">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 flex items-center gap-1">
                  <FileText size={7} className="text-slate-400 shrink-0" />
                  <span>No. Invoice</span>
                </span>
                <span className="font-mono font-bold text-slate-800">
                  {data.invoiceNo || `INV-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${refId.substring(0, 4).toUpperCase()}`}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500 flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-100 text-blue-700 text-[5.5px] font-bold flex items-center justify-center shrink-0">
                    Rp
                  </span>
                  <span>Nominal</span>
                </span>
                <span className="font-bold text-slate-900">
                  {data.nominalText || 'GRATIS (Rp 0)'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500 flex items-center gap-1">
                  <CreditCard size={7} className="text-slate-400 shrink-0" />
                  <span>Metode</span>
                </span>
                <span className="text-slate-700 font-medium truncate max-w-[170px]">
                  {data.paymentMethodText || 'Pendaftaran Otomatis'}
                </span>
              </div>
            </div>

            {/* Portal Akses Highlight Box */}
            <div className="bg-[#eef4fd] border border-[#d6e4fa] rounded-lg px-2 py-1 flex items-center justify-between gap-1">
              <div className="flex items-center gap-1 min-w-0">
                <ExternalLink size={8} className="text-blue-600 shrink-0" />
                <span className="text-[6.5px] font-bold text-slate-600 shrink-0">Portal Akses :</span>
                <span className="text-[6.5px] font-mono text-blue-700 truncate font-semibold">
                  {portalUrl}
                </span>
              </div>
            </div>

            {/* Footer Kanan */}
            <div className="flex items-center justify-between text-[6px] text-slate-400 border-t border-slate-100 pt-1 font-medium uppercase">
              <span>SISTEM TERVALIDASI KAWACANAAN SD</span>
              <span>ID: {refId} • {todayText}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ACTION CONTROLS: Fitur Unduh 1 Tombol + Salin + Masuk ke Sistem          */}
      {/* "fitur unduh/download cukup 1 saja dengan teks unduh"                      */}
      {/* ========================================================================= */}
      <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1 w-full max-w-[480px]">
        {/* 1 Tombol Unduh Sesuai Instruksi User */}
        <button
          type="button"
          onClick={handleDownloadCard}
          disabled={isDownloading}
          id="btn-download-credential-card"
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-all cursor-pointer disabled:opacity-60"
        >
          {isDownloading ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              <span>Mengunduh...</span>
            </>
          ) : (
            <>
              <Download size={14} />
              <span>Unduh</span>
            </>
          )}
        </button>

        {/* Tombol Salin Kredensial */}
        <button
          type="button"
          onClick={handleCopyCredentials}
          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-all cursor-pointer"
        >
          {isCopied ? (
            <>
              <Check size={14} className="text-emerald-600" />
              <span className="text-emerald-700">Tersalin!</span>
            </>
          ) : (
            <>
              <Copy size={14} />
              <span>Salin Kredensial</span>
            </>
          )}
        </button>

        {/* Tombol Masuk ke Sistem (Opsional jika user langsung ingin login/buka dashboard) */}
        {onEnterSystem && (
          <button
            type="button"
            onClick={onEnterSystem}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
          >
            <CheckCircle2 size={14} />
            <span>Masuk ke Sistem</span>
          </button>
        )}
      </div>
    </div>
  );
};
