import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Users, 
  ExternalLink, 
  Sparkles, 
  CheckCircle2, 
  ShieldCheck, 
  QrCode, 
  Download, 
  Copy, 
  Check, 
  Maximize2, 
  ChevronRight,
  Share2
} from 'lucide-react';
import QRCode from 'qrcode';
import { KawacanaanEmblem } from '../../components/KawacanaanEmblem';
import { WhatsAppQrModal } from './WhatsAppQrModal';
import kawacanaanLogo from '../../assets/images/kawacanaan_logo_1787055634013.jpg';

interface ContactSectionProps {
  lang: 'ID' | 'EN';
  onOpenRegister?: () => void;
}

export const ContactSection: React.FC<ContactSectionProps> = ({ lang }) => {
  // Official WhatsApp Group Community Link (Updated as requested)
  const whatsappCommunityLink = 'https://chat.whatsapp.com/Fjs8tXlNzkN44wolTS9zBC?s=cl&p=a&mlu=4&ilr=4';
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);

  // Generate high-resolution scannable QR Code matching the group link
  useEffect(() => {
    QRCode.toDataURL(whatsappCommunityLink, {
      width: 500,
      margin: 2,
      errorCorrectionLevel: 'H',
      color: {
        dark: '#071F42', // Deep navy for crisp optical scanner contrast
        light: '#FFFFFF',
      },
    })
      .then((url) => {
        setQrDataUrl(url);
      })
      .catch((err) => {
        console.error('Gagal membuat QR Code WhatsApp:', err);
      });
  }, [whatsappCommunityLink]);

  const handleCopyLink = async () => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(whatsappCommunityLink);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = whatsappCommunityLink;
        textArea.style.position = 'fixed';
        textArea.style.left = '-9999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  };

  // Generate downloadable flyer image (canvas export matching the uploaded poster exactly)
  const handleDownloadFlyer = () => {
    if (!qrDataUrl) return;
    setIsDownloading(true);

    try {
      const canvas = document.createElement('canvas');
      canvas.width = 720;
      canvas.height = 1280; // 9:16 vertical poster ratio matching official WhatsApp invite
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        setIsDownloading(false);
        return;
      }

      // WhatsApp Brand Green Background (#20C659 / #25D366)
      ctx.fillStyle = '#20C659';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // White invitation card container
      const cardW = 580;
      const cardH = 680;
      const cardX = (canvas.width - cardW) / 2;
      const cardY = 260;
      const cardRadius = 28;

      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.roundRect(cardX, cardY, cardW, cardH, cardRadius);
      ctx.fill();

      // Load QR Image & Emblem
      const qrImg = new Image();
      qrImg.onload = () => {
        const emblemImg = new Image();
        emblemImg.onload = () => {
          // Circular emblem on top edge of white card
          const emblemSize = 100;
          const emblemX = (canvas.width - emblemSize) / 2;
          const emblemY = cardY - (emblemSize / 2);

          // White ring around emblem
          ctx.save();
          ctx.beginPath();
          ctx.arc(canvas.width / 2, cardY, (emblemSize / 2) + 6, 0, Math.PI * 2);
          ctx.fillStyle = '#FFFFFF';
          ctx.fill();
          ctx.restore();

          // Clip and draw emblem
          ctx.save();
          ctx.beginPath();
          ctx.arc(canvas.width / 2, cardY, emblemSize / 2, 0, Math.PI * 2);
          ctx.clip();
          ctx.drawImage(emblemImg, emblemX, emblemY, emblemSize, emblemSize);
          ctx.restore();

          // Card Titles
          ctx.fillStyle = '#111827';
          ctx.font = 'bold 36px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('Kawacanaan Presensi', canvas.width / 2, cardY + 95);

          ctx.fillStyle = '#4B5563';
          ctx.font = '500 24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
          ctx.fillText('Grup WhatsApp', canvas.width / 2, cardY + 138);

          // Draw QR Code
          const qrSize = 420;
          const qrX = (canvas.width - qrSize) / 2;
          const qrY = cardY + 180;
          ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);

          // Center WhatsApp badge on QR
          const pinSize = 64;
          const pinX = (canvas.width - pinSize) / 2;
          const pinY = qrY + (qrSize - pinSize) / 2;

          ctx.save();
          ctx.beginPath();
          ctx.arc(canvas.width / 2, qrY + (qrSize / 2), (pinSize / 2) + 4, 0, Math.PI * 2);
          ctx.fillStyle = '#FFFFFF';
          ctx.fill();

          ctx.beginPath();
          ctx.arc(canvas.width / 2, qrY + (qrSize / 2), pinSize / 2, 0, Math.PI * 2);
          ctx.fillStyle = '#25D366';
          ctx.fill();
          ctx.restore();

          // Bottom caption on green background (matching the uploaded image text)
          ctx.fillStyle = '#FFFFFF';
          ctx.font = '500 24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('Pindai kode QR ini menggunakan', canvas.width / 2, cardY + cardH + 90);
          ctx.fillText('kamera WhatsApp untuk bergabung', canvas.width / 2, cardY + cardH + 128);
          ctx.fillText('ke grup ini', canvas.width / 2, cardY + cardH + 166);

          // Trigger download
          const link = document.createElement('a');
          link.download = 'Barcode-WhatsApp-Kawacanaan-Presensi.png';
          link.href = canvas.toDataURL('image/png');
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          setIsDownloading(false);
        };
        emblemImg.src = kawacanaanLogo;
      };
      qrImg.src = qrDataUrl;
    } catch (err) {
      console.error('Gagal mengunduh flyer barcode:', err);
      setIsDownloading(false);
    }
  };

  return (
    <section 
      id="kontak" 
      className="scroll-mt-16 sm:scroll-mt-20 py-14 sm:py-16 lg:py-20 bg-slate-50/70 text-slate-900 relative border-b border-blue-100 antialiased overflow-hidden"
    >
      {/* Decorative background grid subtle overlay */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.03] bg-[radial-gradient(#0B2F64_1px,transparent_1px)] [background-size:24px_24px]" />
      
      {/* Ambient decorative glow */}
      <div className="absolute -top-32 right-1/4 w-96 h-96 bg-blue-100/50 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 left-1/4 w-96 h-96 bg-emerald-100/40 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* ================= SECTION HEADER ================= */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-10 sm:mb-12 lg:mb-14">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold uppercase tracking-wider font-mono">
            <Users className="w-3.5 h-3.5 text-blue-700 shrink-0" />
            <span>{lang === 'ID' ? 'KOMUNITAS RESMI PENDIDIK' : 'OFFICIAL EDUCATOR COMMUNITY'}</span>
          </div>
          
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#0B2F64] tracking-tight uppercase leading-tight">
            {lang === 'ID' ? (
              <>
                <span className="block">KOMUNITAS WHATSAPP</span>
                <span className="block text-blue-600">KAWACANAAN PRESENSI</span>
              </>
            ) : (
              <>
                <span className="block">WHATSAPP COMMUNITY</span>
                <span className="block text-blue-600">KAWACANAAN PRESENSI</span>
              </>
            )}
          </h2>
          
          <p className="text-slate-600 text-xs sm:text-sm md:text-base leading-relaxed font-normal max-w-2xl mx-auto">
            {lang === 'ID'
              ? 'Wadah resmi silaturahmi, diskusi praktik baik presensi kurikulum SD, pembaruan format cetak kedinasan, dan konsultasi interaktif bersama rekan pendidik se-Indonesia.'
              : 'Official space for collaboration, primary curriculum attendance best practices, official kedinasan reporting updates, and interactive peer consultations across Indonesia.'}
          </p>
        </div>

        {/* ================= MAIN CONTAINER: 2 BALANCED COLUMNS ================= */}
        <div className="max-w-5xl mx-auto">
          <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-0 items-stretch">
            
            {/* ================= LEFT COLUMN: INFORMASI & NILAI KOMUNITAS (7 COLS) ================= */}
            <div className="lg:col-span-7 p-6 sm:p-8 lg:p-10 flex flex-col justify-between space-y-6 sm:space-y-8 border-b lg:border-b-0 lg:border-r border-slate-100">
              
              <div className="space-y-5">
                {/* Header Sub-badge */}
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold uppercase tracking-wider font-mono">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>WhatsApp Community SD</span>
                  </span>
                  
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-500">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{lang === 'ID' ? 'Terbuka & Gratis' : 'Free & Open'}</span>
                  </span>
                </div>

                {/* Subtitle & Value Proposition */}
                <div className="space-y-2">
                  <h3 className="text-lg sm:text-xl lg:text-2xl font-black text-[#0B2F64] tracking-tight uppercase">
                    {lang === 'ID' ? 'Mari Berjejaring & Maju Bersama' : 'Network & Grow Together'}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                    {lang === 'ID'
                      ? 'Dapatkan bimbingan teknis langsung, template administrasi kehadiran siap cetak, dan pertukaran informasi seputar pengelolaan kelas sekolah dasar secara cepat melalui WhatsApp.'
                      : 'Get direct technical guidance, print-ready attendance administration templates, and rapid information sharing on primary school management.'}
                  </p>
                </div>

                {/* 4 Feature Highlights in 2x2 Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/80 hover:border-blue-200 transition-colors">
                    <div className="flex items-center gap-2 font-bold text-xs text-slate-900">
                      <div className="w-7 h-7 rounded-lg bg-blue-100/70 text-blue-700 flex items-center justify-center shrink-0">
                        <Users className="w-3.5 h-3.5" />
                      </div>
                      <span className="truncate">{lang === 'ID' ? 'Praktik Baik Guru & Wali' : 'Teacher Best Practices'}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">
                      {lang === 'ID' ? 'Diskusi pengelolaan presensi harian dan mapel kelas 1 sampai 6.' : 'Daily and subject attendance management for grades 1-6.'}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/80 hover:border-emerald-200 transition-colors">
                    <div className="flex items-center gap-2 font-bold text-xs text-slate-900">
                      <div className="w-7 h-7 rounded-lg bg-emerald-100/70 text-emerald-700 flex items-center justify-center shrink-0">
                        <Sparkles className="w-3.5 h-3.5" />
                      </div>
                      <span className="truncate">{lang === 'ID' ? 'Update Rilis & Kedinasan' : 'Official Updates'}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">
                      {lang === 'ID' ? 'Info format cetak standar kedinasan dan pembaruan fitur baru.' : 'Official educational printing standards and feature release updates.'}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/80 hover:border-amber-200 transition-colors">
                    <div className="flex items-center gap-2 font-bold text-xs text-slate-900">
                      <div className="w-7 h-7 rounded-lg bg-amber-100/70 text-amber-800 flex items-center justify-center shrink-0">
                        <MessageSquare className="w-3.5 h-3.5" />
                      </div>
                      <span className="truncate">{lang === 'ID' ? 'Diskusi & Tanya Jawab' : 'Q&A Discussions'}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">
                      {lang === 'ID' ? 'Saling berbagi solusi kendala operasional presensi di lapangan.' : 'Rapid peer solutions for daily school operational attendance.'}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/80 hover:border-purple-200 transition-colors">
                    <div className="flex items-center gap-2 font-bold text-xs text-slate-900">
                      <div className="w-7 h-7 rounded-lg bg-purple-100/70 text-purple-700 flex items-center justify-center shrink-0">
                        <ShieldCheck className="w-3.5 h-3.5" />
                      </div>
                      <span className="truncate">{lang === 'ID' ? '100% Akses Terbuka' : '100% Free Access'}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">
                      {lang === 'ID' ? 'Terbuka bagi guru, operator, dan kepala sekolah di Indonesia.' : 'Open to all teachers, operators, and principals nationwide.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Area: Direct Join & Copy Link */}
              <div className="space-y-3 pt-2">
                {/* Primary CTA: Direct Join WhatsApp Community */}
                <a
                  href={whatsappCommunityLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  id="btn-join-whatsapp-direct"
                  className="w-full py-3.5 sm:py-4 px-5 bg-[#25D366] hover:bg-[#20bd5a] active:scale-[0.99] text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider transition-all rounded-2xl shadow-sm flex items-center justify-center gap-2.5 cursor-pointer"
                >
                  <svg className="w-5 h-5 fill-current shrink-0" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                  </svg>
                  <span>{lang === 'ID' ? 'Gabung Komunitas WhatsApp' : 'Join WhatsApp Community'}</span>
                  <ExternalLink className="w-4 h-4 ml-1 shrink-0" />
                </a>

                {/* Secondary Action: Copy Link */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    id="btn-copy-community-link"
                    className={`flex-1 py-2.5 sm:py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer border ${
                      copied
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-500" />}
                    <span>
                      {copied
                        ? (lang === 'ID' ? '✓ Tautan Berhasil Disalin!' : '✓ Link Copied to Clipboard!')
                        : (lang === 'ID' ? 'Salin Tautan Undangan' : 'Copy Invitation Link')}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsModalOpen(true)}
                    id="btn-enlarge-qr"
                    className="py-2.5 sm:py-3 px-3.5 rounded-xl text-xs font-bold bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    title={lang === 'ID' ? 'Perbesar Barcode QR' : 'Enlarge Barcode QR'}
                  >
                    <Maximize2 className="w-4 h-4 text-slate-500" />
                    <span className="hidden sm:inline">{lang === 'ID' ? 'Perbesar' : 'Enlarge'}</span>
                  </button>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{lang === 'ID' ? 'Tautan Resmi Terverifikasi' : 'Official Verified Link'}</span>
                  </div>
                  <span className="font-mono text-[10px] text-slate-400 hidden sm:inline">chat.whatsapp.com</span>
                </div>
              </div>

            </div>

            {/* ================= RIGHT COLUMN: WHATSAPP BARCODE FLYER (5 COLS) ================= */}
            {/* Styled faithfully to match the uploaded WhatsApp flyer card */}
            <div className="lg:col-span-5 bg-gradient-to-b from-[#20C659] via-[#1EB852] to-[#128C7E] p-6 sm:p-8 flex flex-col items-center justify-center text-center relative">
              
              {/* Subtle ambient light behind white card */}
              <div className="absolute inset-0 bg-white/5 pointer-events-none" />

              {/* The WhatsApp White Card */}
              <div className="relative w-full max-w-[280px] sm:max-w-[310px] bg-white rounded-3xl p-5 sm:p-6 shadow-xl border border-white/40 my-2">
                
                {/* Circular Emblem at top of card */}
                <div className="flex justify-center -mt-10 sm:-mt-11 mb-2.5">
                  <div className="p-1 rounded-full bg-white shadow-md ring-2 ring-slate-100">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden flex items-center justify-center bg-[#071F42]">
                      <img 
                        src={kawacanaanLogo} 
                        alt="Kawacanaan Logo" 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                  </div>
                </div>

                {/* Card Titles */}
                <h4 className="text-base sm:text-lg font-black text-slate-900 tracking-tight leading-snug">
                  Kawacanaan Presensi
                </h4>
                <p className="text-xs text-slate-500 font-semibold mb-3">
                  Grup WhatsApp
                </p>

                {/* QR Code Container with WhatsApp Pin */}
                <div 
                  className="relative mx-auto p-2 bg-white rounded-2xl border border-slate-200/90 shadow-2xs cursor-pointer group"
                  onClick={() => setIsModalOpen(true)}
                  title="Klik untuk memperbesar Barcode QR"
                >
                  {qrDataUrl ? (
                    <img
                      src={qrDataUrl}
                      alt="Barcode QR WhatsApp Kawacanaan Presensi"
                      className="w-44 h-44 sm:w-48 sm:h-48 object-contain rounded-lg mx-auto transition-transform duration-200 group-hover:scale-[1.02]"
                    />
                  ) : (
                    <div className="w-44 h-44 sm:w-48 sm:h-48 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400">
                      <QrCode className="w-12 h-12 animate-pulse text-slate-300" />
                    </div>
                  )}

                  {/* Centered WhatsApp Telephone Badge */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white p-0.5 shadow-md border border-slate-100 flex items-center justify-center pointer-events-none">
                    <div className="w-full h-full rounded-full bg-[#25D366] flex items-center justify-center text-white">
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                      </svg>
                    </div>
                  </div>

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-slate-900/60 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1.5 backdrop-blur-2xs">
                    <Maximize2 className="w-4 h-4" />
                    <span>{lang === 'ID' ? 'Perbesar' : 'Enlarge'}</span>
                  </div>
                </div>

              </div>

              {/* Caption text below white card (matches the uploaded image) */}
              <p className="text-white text-xs sm:text-[13px] font-medium leading-relaxed max-w-[260px] sm:max-w-[280px] mt-3.5 opacity-95">
                {lang === 'ID'
                  ? 'Pindai kode QR ini menggunakan kamera WhatsApp untuk bergabung ke grup ini'
                  : 'Scan this QR code using your WhatsApp camera to join this group'}
              </p>

              {/* Download Flyer Button */}
              <div className="w-full max-w-[280px] sm:max-w-[310px] mt-4">
                <button
                  type="button"
                  onClick={handleDownloadFlyer}
                  disabled={isDownloading}
                  className="w-full py-2.5 px-4 bg-white/20 hover:bg-white/30 text-white border border-white/30 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 active:scale-98 shadow-sm"
                  title={lang === 'ID' ? 'Unduh Barcode Format Siap Cetak & Bagikan' : 'Download Barcode Ready to Print/Share'}
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>
                    {isDownloading 
                      ? (lang === 'ID' ? 'Menyiapkan Gambar...' : 'Preparing Image...') 
                      : (lang === 'ID' ? 'Unduh Barcode (PNG)' : 'Download Barcode (PNG)')}
                  </span>
                </button>
              </div>

            </div>

          </div>
        </div>

      </div>

      {/* WhatsApp QR Modal for High-Resolution Scan & Download */}
      <WhatsAppQrModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        qrDataUrl={qrDataUrl}
        communityUrl={whatsappCommunityLink}
        lang={lang}
        onDownloadQr={handleDownloadFlyer}
      />
    </section>
  );
};
