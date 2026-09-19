import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  School,
  User,
  KeyRound,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Check,
  Copy,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  CreditCard,
  RefreshCw,
  Clock,
  Zap,
  Sparkles,
  Building2,
  ShieldCheck,
  Calendar,
  Layers,
  FileText,
} from 'lucide-react';
import { KawacanaanEmblem } from '../../components/KawacanaanEmblem';

declare global {
  interface Window {
    snap?: {
      pay: (
        token: string,
        callbacks: {
          onSuccess?: (result: any) => void;
          onPending?: (result: any) => void;
          onError?: (result: any) => void;
          onClose?: () => void;
        }
      ) => void;
    };
  }
}

export interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenLogin?: () => void;
  initialPlanId?: 'free' | 'teacher' | 'school';
  lang?: 'ID' | 'EN';
  mode?: 'landing' | 'superadmin';
  onSchoolCreated?: (school: any, admin: any) => void;
}

interface PaymentSessionData {
  orderId: string;
  snapToken: string | null;
  redirectUrl: string | null;
  amount: number;
  planTitle: string;
  billingCycle: 'monthly' | 'yearly';
  schoolId?: string;
  schoolName: string;
  schoolCode?: string;
  npsn?: string;
  contactName: string;
  email: string;
  status: 'PENDING' | 'SETTLED' | 'EXPIRED';
  isSimulation?: boolean;
  notice?: string;
  createdAdminUsername: string;
  createdAdminRole: string;
}

interface RegistrationSuccessData {
  schoolName: string;
  schoolCode: string;
  npsn?: string;
  username: string;
  adminName: string;
  password: string;
  email?: string;
  invoiceNo?: string;
  plan: string;
  billingCycle: 'monthly' | 'yearly';
  expiryDays: number;
}

export const RegisterModal: React.FC<RegisterModalProps> = ({
  isOpen,
  onClose,
  onOpenLogin,
  lang = 'ID',
  mode = 'landing',
  onSchoolCreated,
}) => {
  const isSuperadmin = mode === 'superadmin';

  // 1. FORM STATE - ONBOARDING DAFTAR SEKOLAH
  const [schoolName, setSchoolName] = useState('');
  const [adminFullName, setAdminFullName] = useState('');
  const [username, setUsername] = useState('');
  const [usernameManuallyEdited, setUsernameManuallyEdited] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  // Khusus Superadmin: opsi layanan ruang kerja & masa berlaku
  const [workspaceService, setWorkspaceService] = useState<'school_integrated' | 'teacher_independent'>('school_integrated');
  const [subscriptionExpiresAt, setSubscriptionExpiresAt] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [npsn, setNpsn] = useState('');

  // 2. SUBMISSION & ERROR STATE
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // 3. MIDTRANS & PAYMENT SESSION STATE (Hanya untuk Landing Page)
  const [paymentSession, setPaymentSession] = useState<PaymentSessionData | null>(null);
  const [isCheckingPayment, setIsCheckingPayment] = useState(false);
  const [paymentCheckMessage, setPaymentCheckMessage] = useState<string | null>(null);
  const pollingRef = useRef<any>(null);

  // 4. SUCCESS ACTIVATION STATE
  const [registrationSuccessData, setRegistrationSuccessData] = useState<RegistrationSuccessData | null>(null);
  const [copiedCredentials, setCopiedCredentials] = useState(false);
  const [copiedSchoolCode, setCopiedSchoolCode] = useState(false);
  const [copiedInvoice, setCopiedInvoice] = useState(false);

  // Midtrans Client Key & Snap script loader (Hanya diperlukan di Landing Page flow)
  useEffect(() => {
    if (!isOpen || isSuperadmin) return;

    fetch('/api/midtrans?action=get_client_config')
      .then((res) => res.json())
      .then((cfg) => {
        if (cfg.ok && cfg.enabled && cfg.client_key) {
          if (!document.getElementById('midtrans-snap-script')) {
            const script = document.createElement('script');
            script.id = 'midtrans-snap-script';
            script.src = cfg.snap_url || 'https://app.sandbox.midtrans.com/snap/snap.js';
            script.setAttribute('data-client-key', cfg.client_key);
            script.async = true;
            document.body.appendChild(script);
          }
        }
      })
      .catch(() => {});
  }, [isOpen, isSuperadmin]);

  // Reset states on modal open
  useEffect(() => {
    if (isOpen) {
      setSchoolName('');
      setAdminFullName('');
      setUsername('');
      setUsernameManuallyEdited(false);
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setSubmitError('');
      setPaymentCheckMessage(null);
      setPaymentSession(null);
      setRegistrationSuccessData(null);
      setSubscriptionExpiresAt('');
      setAdminNotes('');
      setNpsn('');
      setWorkspaceService('school_integrated');
      setBillingCycle('monthly');
      setCopiedCredentials(false);
      setCopiedSchoolCode(false);
      setCopiedInvoice(false);
    } else {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    }
  }, [isOpen]);

  // Real-time polling when waiting for payment (Landing Page only)
  useEffect(() => {
    if (!isSuperadmin && paymentSession && paymentSession.status === 'PENDING' && !registrationSuccessData) {
      if (!pollingRef.current) {
        pollingRef.current = setInterval(async () => {
          try {
            const res = await fetch(`/api/midtrans?action=check_status&order_id=${encodeURIComponent(paymentSession.orderId)}`);
            const body = await res.json();
            if (res.ok && (body.is_settled || body.status === 'settlement' || body.status === 'capture')) {
              if (pollingRef.current) {
                clearInterval(pollingRef.current);
                pollingRef.current = null;
              }
              handleCompleteActivation(paymentSession);
            }
          } catch (_) {}
        }, 4000);
      }
    } else {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    }

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [paymentSession, registrationSuccessData, isSuperadmin]);

  if (!isOpen) return null;

  // Auto-generate username from Admin Full Name
  const handleAdminNameChange = (name: string) => {
    setAdminFullName(name);
    if (!usernameManuallyEdited) {
      const sanitized = name
        .toLowerCase()
        .replace(/dr\.|dra\.|drs\.|s\.pd\.|m\.pd\.|h\.|hj\./gi, '')
        .trim()
        .replace(/\s+/g, '.')
        .replace(/[^a-z0-9.]/g, '')
        .slice(0, 24);
      if (sanitized) {
        setUsername(sanitized);
      }
    }
  };

  const handleUsernameChange = (val: string) => {
    setUsernameManuallyEdited(true);
    setUsername(val.toLowerCase().replace(/[^a-z0-9._-]/g, '').slice(0, 28));
  };

  const handleResetAutoUsername = () => {
    setUsernameManuallyEdited(false);
    const sanitized = adminFullName
      .toLowerCase()
      .replace(/dr\.|dra\.|drs\.|s\.pd\.|m\.pd\.|h\.|hj\./gi, '')
      .trim()
      .replace(/\s+/g, '.')
      .replace(/[^a-z0-9.]/g, '')
      .slice(0, 24);
    setUsername(sanitized || 'admin.sekolah');
  };

  // Pricing calculation (Landing page - Pendaftaran Sekolah Baru)
  const priceMonthly = 25000;
  const priceYearly = 250000; // Hemat 2 bulan (Rp 50.000) untuk promo perdana pendaftaran sekolah
  const activeAmount = billingCycle === 'yearly' ? priceYearly : priceMonthly;

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(num);
  };

  // Trigger Snap Payment Modal (Landing Page)
  const triggerSnapPay = (token: string, session: PaymentSessionData) => {
    if (!window.snap) {
      setPaymentCheckMessage('Komponen Midtrans Snap sedang disiapkan. Silakan klik tombol bayar di bawah.');
      return;
    }
    window.snap.pay(token, {
      onSuccess: async () => {
        setIsCheckingPayment(true);
        try {
          await fetch(`/api/midtrans?action=check_status&order_id=${encodeURIComponent(session.orderId)}`);
          handleCompleteActivation(session);
        } catch (_) {
          handleCompleteActivation(session);
        } finally {
          setIsCheckingPayment(false);
        }
      },
      onPending: () => {
        setPaymentCheckMessage('Transaksi tercatat di Midtrans. Menunggu konfirmasi pembayaran Anda.');
      },
      onError: () => {
        setPaymentCheckMessage('Pembayaran belum berhasil. Silakan coba kembali atau gunakan metode lain.');
      },
      onClose: () => {
        setPaymentCheckMessage('Jendela pembayaran ditutup. Anda dapat membuka kembali pembayaran atau mengecek status.');
      },
    });
  };

  // Check Status Inquiry (Landing Page)
  const handleCheckStatus = async (orderId: string) => {
    setIsCheckingPayment(true);
    setPaymentCheckMessage(null);
    try {
      const res = await fetch(`/api/midtrans?action=check_status&order_id=${encodeURIComponent(orderId)}`);
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || 'Gagal memeriksa status pembayaran.');

      if (body.is_settled || body.status === 'settlement' || body.status === 'capture') {
        handleCompleteActivation(paymentSession);
      } else {
        setPaymentCheckMessage(`Status pembayaran: ${body.status || 'PENDING'}. Menunggu transfer/konfirmasi.`);
      }
    } catch (e: any) {
      setPaymentCheckMessage(e.message || 'Gagal menghubungi server Midtrans.');
    } finally {
      setIsCheckingPayment(false);
    }
  };

  // Simulate Instant Settlement (Sandbox)
  const handleSimulatePayment = async (orderId: string) => {
    setIsCheckingPayment(true);
    try {
      const res = await fetch('/api/midtrans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'simulate_settlement', order_id: orderId }),
      });
      const body = await res.json();
      if (!res.ok || !body.ok) throw new Error(body.error || 'Gagal simulasi pembayaran.');
      handleCompleteActivation(paymentSession);
    } catch (e: any) {
      setPaymentCheckMessage(e.message || 'Gagal melakukan simulasi pembayaran.');
    } finally {
      setIsCheckingPayment(false);
    }
  };

  // Selesaikan Aktivasi & Terbitkan Kredensial (Landing Page)
  const handleCompleteActivation = (session: PaymentSessionData | null) => {
    if (!session) return;
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }

    const successData: RegistrationSuccessData = {
      schoolName: session.schoolName,
      schoolCode: session.schoolCode || 'SCH-' + Math.floor(100000 + Math.random() * 900000),
      npsn: session.npsn,
      username: session.createdAdminUsername,
      adminName: session.contactName,
      password: password,
      email: session.email,
      invoiceNo: session.orderId,
      plan: 'Paket Sekolah Pro',
      billingCycle: session.billingCycle,
      expiryDays: session.billingCycle === 'yearly' ? 365 : 30,
    };

    setRegistrationSuccessData(successData);
    setPaymentSession(null);
  };

  // Submit Handler: Menangani Pendaftaran Onboarding
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');

    const cleanSchoolName = schoolName.trim();
    const cleanAdminName = adminFullName.trim();
    const cleanUsername = username.trim().toLowerCase();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanSchoolName) {
      setSubmitError(lang === 'ID' ? 'Nama satuan pendidikan / sekolah wajib diisi.' : 'School name is required.');
      return;
    }
    if (!cleanAdminName) {
      setSubmitError(lang === 'ID' ? 'Nama lengkap penanggung jawab / admin wajib diisi.' : 'Admin name is required.');
      return;
    }
    if (!cleanUsername) {
      setSubmitError(lang === 'ID' ? 'Username akses admin wajib ditentukan.' : 'Admin username is required.');
      return;
    }
    if (password.length < 6) {
      setSubmitError(lang === 'ID' ? 'Kata sandi minimal 6 karakter demi keamanan.' : 'Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setSubmitError(lang === 'ID' ? 'Konfirmasi kata sandi tidak cocok.' : 'Password confirmation does not match.');
      return;
    }

    setIsSubmitting(true);

    try {
      // -------------------------------------------------------------
      // ALUR SUPERADMIN: Langsung masuk onboarding tanpa pembayaran!
      // -------------------------------------------------------------
      if (isSuperadmin) {
        const isPersonal = workspaceService === 'teacher_independent';
        const regPayload = {
          schoolName: cleanSchoolName,
          namaSekolah: cleanSchoolName,
          adminName: cleanAdminName,
          fullName: cleanAdminName,
          username: cleanUsername,
          email: cleanEmail || undefined,
          password: password,
          plan: isPersonal ? 'teacher' : 'school',
          workspace_type: isPersonal ? 'personal' : 'school',
          workspace_service: workspaceService,
          subscription_expires_at: subscriptionExpiresAt || null,
          notes: adminNotes || undefined,
          npsn: npsn.trim() || undefined,
          isSuperadmin: true,
          mode: 'superadmin',
        };

        const regRes = await fetch('/api/register-school', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(regPayload),
        });

        const regData = await regRes.json();
        if (!regRes.ok || !regData.ok) {
          throw new Error(regData?.error || 'Pendaftaran sekolah oleh Superadmin gagal diproses.');
        }

        const createdSchool = regData.school;
        const createdAdmin = regData.admin;

        // Bypass Midtrans payment completely! Jumps directly to success activation screen
        const successData: RegistrationSuccessData = {
          schoolName: createdSchool?.name || cleanSchoolName,
          schoolCode: createdSchool?.code || createdSchool?.schoolCode || 'SCH-' + Math.floor(100000 + Math.random() * 900000),
          npsn: createdSchool?.npsn || (npsn.trim() ? npsn.trim() : undefined),
          username: createdAdmin?.username || cleanUsername,
          adminName: createdAdmin?.name || cleanAdminName,
          password: password,
          email: cleanEmail || undefined,
          invoiceNo: 'SUPERADMIN-BYPASS',
          plan: isPersonal ? 'Paket Guru Mandiri' : 'Paket Sekolah Terpadu',
          billingCycle: 'yearly',
          expiryDays: subscriptionExpiresAt
            ? Math.max(1, Math.round((new Date(subscriptionExpiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
            : 9999,
        };

        setRegistrationSuccessData(successData);
        if (onSchoolCreated) {
          onSchoolCreated(createdSchool, createdAdmin);
        }
        return;
      }

      // -------------------------------------------------------------
      // ALUR LANDING PAGE: Wajib menyelesaikan pembayaran Midtrans
      // -------------------------------------------------------------
      const regPayload = {
        schoolName: cleanSchoolName,
        adminName: cleanAdminName,
        fullName: cleanAdminName,
        username: cleanUsername,
        email: cleanEmail || undefined,
        password: password,
        plan: 'school',
      };

      const regRes = await fetch('/api/register-school', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(regPayload),
      });

      const regData = await regRes.json();
      if (!regRes.ok || !regData.ok) {
        throw new Error(regData?.error || 'Pendaftaran sekolah gagal diproses.');
      }

      const createdSchool = regData.school;
      const createdAdmin = regData.admin;

      // Buat Transaksi Midtrans Snap
      const midtransPayload = {
        action: 'create_transaction',
        plan_id: 'school',
        billing_cycle: billingCycle,
        school_id: createdSchool?.id,
        school_name: cleanSchoolName,
        school_code: createdSchool?.code || createdSchool?.schoolCode,
        npsn: createdSchool?.npsn,
        contact_name: cleanAdminName,
        email: cleanEmail || `${cleanUsername}@login.kawacanaan.local`,
      };

      const midRes = await fetch('/api/midtrans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(midtransPayload),
      });

      const midData = await midRes.json();
      if (!midRes.ok || !midData.ok) {
        throw new Error(midData?.error || 'Gagal menyiapkan tagihan Midtrans.');
      }

      const session: PaymentSessionData = {
        orderId: midData.order_id,
        snapToken: midData.snap_token || midData.token || null,
        redirectUrl: midData.redirect_url || null,
        amount: midData.amount || activeAmount,
        planTitle: midData.plan_title || (billingCycle === 'yearly' ? 'Paket Sekolah Dasar (1 Tahun)' : 'Paket Sekolah Dasar (1 Bulan)'),
        billingCycle,
        schoolId: createdSchool?.id,
        schoolName: cleanSchoolName,
        schoolCode: createdSchool?.code || createdSchool?.schoolCode,
        npsn: createdSchool?.npsn,
        contactName: cleanAdminName,
        email: cleanEmail,
        status: 'PENDING',
        isSimulation: !!midData.is_simulation,
        notice: midData.notice,
        createdAdminUsername: createdAdmin?.username || cleanUsername,
        createdAdminRole: createdAdmin?.role || 'ADMIN',
      };

      setPaymentSession(session);

      // Otomatis buka popup Midtrans Snap jika tersedia
      if (session.snapToken && window.snap) {
        triggerSnapPay(session.snapToken, session);
      }
    } catch (err: any) {
      setSubmitError(err.message || 'Terjadi kesalahan sistem saat pendaftaran.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Salin Kredensial
  const handleCopyCredentials = () => {
    if (!registrationSuccessData) return;
    const text = `KREDENSIAL ADMINISTRATOR KAWACANAAN SD
Nama Sekolah: ${registrationSuccessData.schoolName}
Kode Undangan Sekolah: ${registrationSuccessData.schoolCode}
${registrationSuccessData.npsn ? `NPSN: ${registrationSuccessData.npsn}\n` : ''}Nama Admin: ${registrationSuccessData.adminName}
Username: ${registrationSuccessData.username}
Kata Sandi: ${registrationSuccessData.password}
Email: ${registrationSuccessData.email || '-'}
Paket: ${registrationSuccessData.plan}
Status: AKTIF / LUNAS
${isSuperadmin ? 'Didaftarkan Oleh: SUPER ADMIN' : `Invoice: ${registrationSuccessData.invoiceNo || '-'}`}`;

    navigator.clipboard.writeText(text);
    setCopiedCredentials(true);
    setTimeout(() => setCopiedCredentials(false), 2500);
  };

  // Navigasi Masuk ke Dashboard Sekolah (Landing Page)
  const handleEnterDashboard = () => {
    if (registrationSuccessData) {
      try {
        sessionStorage.setItem('kwc_prefill_username', registrationSuccessData.username);
        sessionStorage.setItem('kwc_prefill_password', registrationSuccessData.password);
      } catch (_) {}
    }
    onClose();
    if (onOpenLogin) {
      onOpenLogin();
    }
  };

  // Selesai & Tutup untuk Superadmin
  const handleFinishSuperadmin = () => {
    onClose();
  };

  return (
    <div
      id="register-school-modal"
      className="fixed inset-0 z-[999] flex items-center justify-center p-3 sm:p-5 bg-slate-950/75 backdrop-blur-sm overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <div
        id="register-school-card"
        className="relative w-full max-w-lg sm:max-w-2xl lg:max-w-[920px] bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden my-auto flex flex-col max-h-[calc(100dvh-1.5rem)] lg:max-h-[88vh]"
      >
        {/* Header Modal */}
        <div
          id="modal-header"
          className="relative bg-slate-900 border-b border-slate-800 text-white px-4 py-3 sm:px-6 sm:py-3.5 shrink-0"
        >
          <button
            id="btn-close-register-modal"
            onClick={onClose}
            className="absolute top-2.5 sm:top-3 right-3 sm:right-4 w-8 h-8 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer flex items-center justify-center z-10"
            aria-label="Tutup modal"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between pr-8 lg:pr-12 gap-2 sm:gap-3">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <KawacanaanEmblem size={30} className="border border-amber-400/80 shadow-xs shrink-0" />
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-amber-300">
                    {isSuperadmin ? 'Super Admin' : 'Kawacanaan SD'}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] bg-blue-500/20 border border-blue-400/30 px-2 py-0.5 rounded-full font-bold text-blue-200">
                    <ShieldCheck className="w-2.5 h-2.5 text-amber-300" />
                    {isSuperadmin ? 'Aktivasi Instan' : 'Paket Sekolah Pro'}
                  </span>
                </div>
                <h2 className="text-sm sm:text-base font-bold tracking-tight text-white leading-snug">
                  {registrationSuccessData
                    ? isSuperadmin
                      ? 'Sekolah & Admin Berhasil Diterbitkan'
                      : 'Aktivasi Paket Sekolah Berhasil'
                    : paymentSession
                    ? 'Gateway Pembayaran Midtrans'
                    : isSuperadmin
                    ? 'Pendaftaran Satuan Pendidikan'
                    : 'Pendaftaran Sekolah SD'}
                </h2>
              </div>
            </div>

            {/* Step Indicator */}
            {isSuperadmin ? (
              /* Step Indicator Khusus Superadmin: 2 Langkah Langsung Aktif */
              <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-semibold shrink-0">
                <div
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full ${
                    !registrationSuccessData
                      ? 'bg-blue-600 text-white font-bold shadow-xs'
                      : 'bg-white/10 text-slate-400'
                  }`}
                >
                  <span className="w-3.5 h-3.5 rounded-full bg-white/20 flex items-center justify-center text-[9px] font-bold">1</span>
                  <span>Pendaftaran</span>
                </div>
                <div className="h-0.5 w-2 sm:w-3 bg-white/20" />
                <div
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full ${
                    registrationSuccessData
                      ? 'bg-emerald-500 text-white font-bold shadow-xs'
                      : 'bg-white/10 text-slate-400'
                  }`}
                >
                  <span className="w-3.5 h-3.5 rounded-full bg-white/20 flex items-center justify-center text-[9px] font-bold">2</span>
                  <span>Aktif Langsung</span>
                </div>
                <span className="ml-1 text-[9px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-400/30 font-bold hidden sm:inline-block">
                  Tanpa Pembayaran
                </span>
              </div>
            ) : (
              /* Step Indicator Landing Page: 3 Langkah (Pendaftaran -> Pembayaran -> Aktif) */
              <div className="flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-[11px] font-semibold shrink-0">
                <div
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full ${
                    !paymentSession && !registrationSuccessData
                      ? 'bg-blue-600 text-white font-bold shadow-xs'
                      : 'bg-white/10 text-slate-400'
                  }`}
                >
                  <span className="w-3.5 h-3.5 rounded-full bg-white/20 flex items-center justify-center text-[9px] font-bold">1</span>
                  <span>Pendaftaran</span>
                </div>
                <div className="h-0.5 w-2 sm:w-3 bg-white/20" />
                <div
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full ${
                    paymentSession
                      ? 'bg-amber-400 text-slate-950 font-bold shadow-xs'
                      : 'bg-white/10 text-slate-400'
                  }`}
                >
                  <span className="w-3.5 h-3.5 rounded-full bg-black/20 flex items-center justify-center text-[9px] font-bold">2</span>
                  <span>Pembayaran</span>
                </div>
                <div className="h-0.5 w-2 sm:w-3 bg-white/20" />
                <div
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full ${
                    registrationSuccessData
                      ? 'bg-emerald-500 text-white font-bold shadow-xs'
                      : 'bg-white/10 text-slate-400'
                  }`}
                >
                  <span className="w-3.5 h-3.5 rounded-full bg-white/20 flex items-center justify-center text-[9px] font-bold">3</span>
                  <span>Aktif</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* VIEW 3: LAYAR PAKET SEKOLAH AKTIF & KREDENSIAL TERBIT */}
        {/* ------------------------------------------------------------------ */}
        {registrationSuccessData ? (
          <div
            id="registration-success-view"
            className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1"
          >
            <div className="lg:grid lg:grid-cols-12 lg:gap-6 items-stretch">
              {/* Kolom Kiri: Notifikasi Sukses & Kode Sekolah */}
              <div className="lg:col-span-5 flex flex-col justify-between space-y-3.5">
                <div className="text-left space-y-2">
                  <div className="inline-flex items-center justify-center p-2.5 bg-emerald-100 text-emerald-700 rounded-xl shadow-xs">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900">
                    {isSuperadmin ? 'Sekolah & Admin Berhasil Dibuat!' : 'Paket Sekolah Aktif & Terverifikasi!'}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Satuan pendidikan{' '}
                    <span className="font-bold text-slate-900">{registrationSuccessData.schoolName}</span> telah resmi
                    terdaftar dan aktif di sistem database pusat Kawacanaan SD.
                  </p>
                </div>

                {/* School Invitation Code Card */}
                <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-amber-50 border border-blue-200/90 rounded-2xl p-4 shadow-xs">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-blue-900 flex items-center gap-1.5">
                    <KeyRound className="w-4 h-4 text-blue-700" />
                    Kode Undangan Sekolah
                  </div>
                  <div className="font-mono text-2xl font-black text-blue-950 mt-1 tracking-wider">
                    {registrationSuccessData.schoolCode}
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    Bagikan kode resmi ini kepada rekan Wali Kelas & Guru Mapel untuk bergabung ke sekolah.
                  </p>

                  <button
                    type="button"
                    id="btn-copy-school-code"
                    onClick={() => {
                      navigator.clipboard.writeText(registrationSuccessData.schoolCode);
                      setCopiedSchoolCode(true);
                      setTimeout(() => setCopiedSchoolCode(false), 2000);
                    }}
                    className="mt-3 w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
                  >
                    {copiedSchoolCode ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-300" />
                        <span>Kode Disalin!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Salin Kode Undangan</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Kolom Kanan: Kredensial Administrator & Navigasi */}
              <div className="lg:col-span-7 mt-3 lg:mt-0 flex flex-col justify-between space-y-3.5">
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      Kredensial Login Administrator
                    </span>
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300">
                      {isSuperadmin
                        ? 'Aktivasi Superadmin • Langsung Aktif'
                        : `Lunas (${registrationSuccessData.expiryDays} Hari Aktif)`}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5 text-xs">
                    <div>
                      <div className="text-slate-500 text-[10px] font-semibold">Satuan Pendidikan</div>
                      <div className="font-bold text-slate-900 truncate mt-0.5">{registrationSuccessData.schoolName}</div>
                    </div>

                    <div>
                      <div className="text-slate-500 text-[10px] font-semibold">Nama Admin</div>
                      <div className="font-bold text-slate-900 truncate mt-0.5">{registrationSuccessData.adminName}</div>
                    </div>

                    <div>
                      <div className="text-slate-500 text-[10px] font-semibold">Username Akses</div>
                      <div className="font-mono font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-1 rounded-lg mt-0.5 inline-block text-xs">
                        {registrationSuccessData.username}
                      </div>
                    </div>

                    <div>
                      <div className="text-slate-500 text-[10px] font-semibold">Kata Sandi (Password)</div>
                      <div className="font-mono font-bold text-slate-900 bg-white border border-slate-300 px-2 py-1 rounded-lg mt-0.5 inline-block text-xs">
                        {registrationSuccessData.password}
                      </div>
                    </div>

                    {registrationSuccessData.email && (
                      <div className="col-span-2">
                        <div className="text-slate-500 text-[10px] font-semibold">Email Korespondensi</div>
                        <div className="text-slate-800 font-medium text-xs truncate mt-0.5">{registrationSuccessData.email}</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
                  <button
                    id="btn-copy-credentials"
                    type="button"
                    onClick={handleCopyCredentials}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs uppercase tracking-wider hover:bg-slate-50 transition-all cursor-pointer min-h-[42px]"
                  >
                    {copiedCredentials ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-600" />
                        <span>Kredensial Disalin!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 text-slate-500" />
                        <span>Salin Kredensial</span>
                      </>
                    )}
                  </button>

                  {isSuperadmin ? (
                    <button
                      id="btn-finish-superadmin-onboarding"
                      type="button"
                      onClick={handleFinishSuperadmin}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold text-xs uppercase tracking-wider shadow-sm transition-all cursor-pointer min-h-[42px]"
                    >
                      <span>Selesai & Kelola Sekolah</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      id="btn-enter-school-dashboard"
                      type="button"
                      onClick={handleEnterDashboard}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 active:scale-95 text-white font-bold text-xs uppercase tracking-wider shadow-sm transition-all cursor-pointer min-h-[42px]"
                    >
                      <span>Masuk ke Dashboard</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : paymentSession ? (
          /* ------------------------------------------------------------------ */
          /* VIEW 2: TAHAP PEMBAYARAN MIDTRANS GATEWAY (LANDING PAGE ONLY)      */
          /* ------------------------------------------------------------------ */
          <div
            id="payment-gateway-view"
            className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1"
          >
            <div className="lg:grid lg:grid-cols-12 lg:gap-6 items-stretch">
              {/* Kolom Kiri: Rincian Tagihan & Invoice */}
              <div className="lg:col-span-5 flex flex-col justify-between space-y-3.5">
                <div className="flex items-start gap-3 p-3.5 bg-amber-50/90 border border-amber-200 rounded-2xl">
                  <div className="p-2.5 bg-amber-500 text-white rounded-xl shadow-xs shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold text-amber-900 uppercase tracking-wider">
                        Menunggu Pembayaran
                      </span>
                      <span className="inline-block w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                    </div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 mt-0.5">
                      {paymentSession.planTitle}
                    </h3>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Satuan pendidikan: <span className="font-bold text-slate-900">{paymentSession.schoolName}</span>
                    </p>
                  </div>
                </div>

                {/* Summary Box */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                    <div>
                      <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Nomor Invoice</div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="font-mono text-xs font-bold text-slate-900">
                          {paymentSession.orderId}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(paymentSession.orderId);
                            setCopiedInvoice(true);
                            setTimeout(() => setCopiedInvoice(false), 2000);
                          }}
                          className="p-1 rounded hover:bg-slate-200 text-slate-500 transition-colors cursor-pointer"
                          title="Salin Nomor Invoice"
                        >
                          {copiedInvoice ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Total Investasi</div>
                      <div className="text-base sm:text-lg font-black text-blue-700">
                        {formatRupiah(paymentSession.amount)}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Siklus:</span>
                      <span className="font-bold text-slate-800 text-xs">
                        {paymentSession.billingCycle === 'yearly' ? 'Tahunan (12 Bulan)' : 'Bulanan (1 Bulan)'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Metode:</span>
                      <span className="font-bold text-slate-800 text-xs">
                        QRIS, VA Bank, GoPay
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-blue-50/70 border border-blue-200/80 rounded-xl text-xs text-blue-950 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-700 shrink-0" />
                  <span>
                    Akun Admin <strong className="font-mono font-bold text-blue-900">{paymentSession.createdAdminUsername}</strong> otomatis aktif setelah pembayaran.
                  </span>
                </div>
              </div>

              {/* Kolom Kanan: Tombol Aksi Gateway */}
              <div className="lg:col-span-7 mt-3 lg:mt-0 flex flex-col justify-between space-y-3">
                {paymentCheckMessage && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <span>{paymentCheckMessage}</span>
                  </div>
                )}

                <div className="space-y-2.5">
                  {paymentSession.snapToken ? (
                    <button
                      id="btn-open-snap"
                      type="button"
                      onClick={() => triggerSnapPay(paymentSession.snapToken!, paymentSession)}
                      className="w-full inline-flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 hover:from-blue-800 hover:to-indigo-800 text-white font-bold text-sm shadow-md transition-all cursor-pointer min-h-[44px]"
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>Bayar Sekarang via Midtrans Snap</span>
                    </button>
                  ) : null}

                  <div className="flex flex-col sm:flex-row gap-2.5">
                    <button
                      id="btn-check-payment-status"
                      type="button"
                      disabled={isCheckingPayment}
                      onClick={() => handleCheckStatus(paymentSession.orderId)}
                      className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-blue-300 text-blue-800 font-bold text-xs hover:bg-blue-50 disabled:opacity-60 transition-colors cursor-pointer min-h-[40px]"
                    >
                      {isCheckingPayment ? (
                        <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                      ) : (
                        <RefreshCw className="w-4 h-4" />
                      )}
                      <span>Cek Status Pembayaran</span>
                    </button>

                    <button
                      id="btn-simulate-settlement"
                      type="button"
                      disabled={isCheckingPayment}
                      onClick={() => handleSimulatePayment(paymentSession.orderId)}
                      className="inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 font-bold text-xs transition-colors cursor-pointer min-h-[40px]"
                      title="Gunakan simulasi ini untuk verifikasi instan sandbox"
                    >
                      <Zap className="w-4 h-4 text-emerald-600" />
                      <span>Simulasi Bayar (Sandbox)</span>
                    </button>
                  </div>
                </div>

                <div className="text-center text-[10px] text-slate-400">
                  Terhubung ke Gateway Resmi Midtrans & database pusat Kawacanaan SD. Terintegrasi ke Super Admin.
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ------------------------------------------------------------------ */
          /* VIEW 1: FORMULIR ONBOARDING DAFTAR SEKOLAH                         */
          /* ------------------------------------------------------------------ */
          <form
            id="register-school-form"
            onSubmit={handleSubmit}
            className="p-4 sm:p-5 lg:p-6 space-y-3 overflow-y-auto lg:overflow-visible flex-1"
          >
            {submitError && (
              <div
                id="submit-error-alert"
                className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2 text-rose-800 text-xs"
              >
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold">Mohon lengkapi data:</div>
                  <div className="mt-0.5">{submitError}</div>
                </div>
              </div>
            )}

            {/* Layout 2 Kolom Profesional Layaknya Aplikasi Komersial */}
            <div className="lg:grid lg:grid-cols-12 lg:gap-5 items-stretch">
              {/* KOLOM KIRI: Superadmin Panel vs Landing Commercial Card */}
              {isSuperadmin ? (
                /* Card Khusus Superadmin: Pilihan Ruang Kerja, Masa Aktif & Fasilitas Lengkap */
                <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-3.5 shadow-inner border border-indigo-800/60">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                          <Building2 className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold uppercase tracking-wider text-amber-300">
                            Aktivasi Super Admin
                          </div>
                          <div className="text-[10px] text-indigo-200">
                            Penambahan Sekolah Baru
                          </div>
                        </div>
                      </div>
                      <span className="text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-bold">
                        Bypass Bayar
                      </span>
                    </div>

                    {/* Switcher Ruang Kerja */}
                    <div>
                      <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
                        Tipe Ruang Kerja:
                      </label>
                      <div className="grid grid-cols-2 gap-1.5 bg-slate-950/60 p-1 rounded-xl border border-white/10 text-xs font-semibold">
                        <button
                          type="button"
                          onClick={() => setWorkspaceService('school_integrated')}
                          className={`py-1.5 px-2 rounded-lg transition-all text-center cursor-pointer text-xs ${
                            workspaceService === 'school_integrated'
                              ? 'bg-indigo-600 text-white shadow-xs font-bold'
                              : 'text-slate-300 hover:text-white'
                          }`}
                        >
                          Sekolah Terpadu
                        </button>
                        <button
                          type="button"
                          onClick={() => setWorkspaceService('teacher_independent')}
                          className={`py-1.5 px-2 rounded-lg transition-all text-center cursor-pointer text-xs ${
                            workspaceService === 'teacher_independent'
                              ? 'bg-indigo-600 text-white shadow-xs font-bold'
                              : 'text-slate-300 hover:text-white'
                          }`}
                        >
                          Guru Mandiri
                        </button>
                      </div>
                    </div>

                    {/* Preset Masa Aktif */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-amber-300" />
                          <span>Masa Aktif Lisensi:</span>
                        </label>
                        <span className="text-[10px] font-mono font-bold text-amber-300">
                          {subscriptionExpiresAt || 'Permanen (Seumur Hidup)'}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-1 text-[11px] font-bold">
                        <button
                          type="button"
                          onClick={() => setSubscriptionExpiresAt('')}
                          className={`py-1 rounded-lg border transition-all cursor-pointer ${
                            !subscriptionExpiresAt
                              ? 'bg-amber-400 text-slate-950 border-amber-300 font-black'
                              : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                          }`}
                        >
                          Permanen
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const d = new Date();
                            d.setFullYear(d.getFullYear() + 1);
                            setSubscriptionExpiresAt(d.toISOString().slice(0, 10));
                          }}
                          className={`py-1 rounded-lg border transition-all cursor-pointer ${
                            subscriptionExpiresAt && subscriptionExpiresAt.startsWith(`${new Date().getFullYear() + 1}`)
                              ? 'bg-amber-400 text-slate-950 border-amber-300 font-black'
                              : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                          }`}
                        >
                          +1 Tahun
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const d = new Date();
                            d.setDate(d.getDate() + 30);
                            setSubscriptionExpiresAt(d.toISOString().slice(0, 10));
                          }}
                          className={`py-1 rounded-lg border transition-all cursor-pointer ${
                            subscriptionExpiresAt && !subscriptionExpiresAt.startsWith(`${new Date().getFullYear() + 1}`)
                              ? 'bg-amber-400 text-slate-950 border-amber-300 font-black'
                              : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                          }`}
                        >
                          +30 Hari
                        </button>
                      </div>
                    </div>

                    {/* Feature Highlights Superadmin */}
                    <div className="pt-2 border-t border-white/10 space-y-1.5 text-xs text-slate-200">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                          <Check className="w-3 h-3" />
                        </div>
                        <span>Kapasitas Siswa & Guru Unlimited</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                          <Check className="w-3 h-3" />
                        </div>
                        <span>Multi-Kelas Paralel Terbit Otomatis (1A–6B)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                          <Check className="w-3 h-3" />
                        </div>
                        <span>Akun Administrator Langsung Aktif</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-[10px] text-indigo-200/90 bg-white/5 p-2.5 rounded-xl border border-white/10 flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
                    <span>
                      <strong>Mode Super Admin:</strong> Sekolah dan akun admin langsung aktif ke database pusat tanpa proses pembayaran.
                    </span>
                  </div>
                </div>
              ) : (
                /* Card Landing Page: Siklus Pembayaran, Biaya & Fasilitas Komersial */
                <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-3.5 shadow-md border border-blue-800/40">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                          <Building2 className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold uppercase tracking-wider text-amber-300">
                            Paket Sekolah Pro
                          </div>
                          <div className="text-[10px] text-blue-200">
                            Presensi terpadu 1 SD
                          </div>
                        </div>
                      </div>
                      <span className="text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-bold">
                        Resmi
                      </span>
                    </div>

                    {/* Switcher Siklus Pembayaran */}
                    <div className="bg-slate-950/60 p-1 rounded-xl border border-white/10 flex items-center text-xs font-semibold">
                      <button
                        type="button"
                        onClick={() => setBillingCycle('monthly')}
                        className={`flex-1 py-1.5 rounded-lg transition-all text-center cursor-pointer ${
                          billingCycle === 'monthly'
                            ? 'bg-blue-600 text-white shadow-xs font-bold'
                            : 'text-slate-300 hover:text-white'
                        }`}
                      >
                        Bulanan
                      </button>
                      <button
                        type="button"
                        onClick={() => setBillingCycle('yearly')}
                        className={`flex-1 py-1.5 rounded-lg transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer ${
                          billingCycle === 'yearly'
                            ? 'bg-blue-600 text-white shadow-xs font-bold'
                            : 'text-slate-300 hover:text-white'
                        }`}
                      >
                        <span>Tahunan</span>
                        <span className="text-[9px] bg-amber-400 text-slate-950 font-black px-1.5 py-0.2 rounded">
                          Hemat 2 Bln
                        </span>
                      </button>
                    </div>

                    {/* Biaya Investasi */}
                    <div className="pt-2 border-t border-white/10 flex items-baseline justify-between">
                      <span className="text-xs text-slate-300">Biaya Investasi:</span>
                      <div className="text-right">
                        <div className="text-lg sm:text-xl font-black text-white">
                          {formatRupiah(activeAmount)}
                          <span className="text-xs font-normal text-slate-300 ml-1">
                            /{billingCycle === 'yearly' ? 'tahun' : 'bulan'}
                          </span>
                        </div>
                        {billingCycle === 'yearly' && (
                          <div className="text-[10px] text-emerald-400 font-bold">
                            Hemat Rp 50.000 (2 Bulan Gratis)
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Feature Highlights */}
                    <div className="pt-2.5 border-t border-white/10 space-y-1.5 text-xs text-slate-200">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                          <Check className="w-3 h-3" />
                        </div>
                        <span>12 Rombel Lengkap (1A–6B)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                          <Check className="w-3 h-3" />
                        </div>
                        <span>Maks. 50 Siswa per Rombel</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                          <Check className="w-3 h-3" />
                        </div>
                        <span>Multi-Akun Guru & Wali Kelas</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                          <Check className="w-3 h-3" />
                        </div>
                        <span>Rekap Format Kedinasan Resmi</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-[10px] text-blue-200/80 bg-white/5 p-2 rounded-xl border border-white/10 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-amber-300 shrink-0" />
                    <span>Midtrans Gateway (QRIS, VA Bank) • Aktivasi Otomatis</span>
                  </div>
                </div>
              )}

              {/* KOLOM KANAN: Form Input Fields & Tombol Submit */}
              <div className="lg:col-span-7 mt-3 lg:mt-0 flex flex-col justify-between space-y-3">
                <div className="space-y-2.5">
                  {/* 1. NAMA SEKOLAH */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1 flex items-center gap-1.5">
                      <School className="w-3.5 h-3.5 text-blue-700" />
                      <span>Nama Satuan Pendidikan / Sekolah</span>
                      <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="input-school-name"
                      type="text"
                      value={schoolName}
                      onChange={(e) => setSchoolName(e.target.value)}
                      placeholder="Contoh: SD Negeri 01 Menteng"
                      required
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all bg-white shadow-2xs h-10"
                    />
                  </div>

                  {/* 2. NAMA LENGKAP ADMIN & 3. USERNAME (2 Kolom Grid) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-blue-700" />
                        <span>Nama Lengkap Admin</span>
                        <span className="text-rose-500">*</span>
                      </label>
                      <input
                        id="input-admin-name"
                        type="text"
                        value={adminFullName}
                        onChange={(e) => handleAdminNameChange(e.target.value)}
                        placeholder="Contoh: Dra. Hj. Siti Aminah, M.Pd"
                        required
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all bg-white shadow-2xs h-10"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                          <KeyRound className="w-3.5 h-3.5 text-blue-700" />
                          <span>Username Admin</span>
                          <span className="text-rose-500">*</span>
                        </label>
                        {usernameManuallyEdited ? (
                          <button
                            type="button"
                            onClick={handleResetAutoUsername}
                            className="text-[10px] text-blue-700 hover:text-blue-800 font-bold underline cursor-pointer"
                          >
                            Reset
                          </button>
                        ) : (
                          <span className="text-[9px] bg-blue-50 text-blue-700 font-bold px-1.5 py-0.5 rounded border border-blue-200">
                            Otomatis
                          </span>
                        )}
                      </div>
                      <input
                        id="input-username"
                        type="text"
                        value={username}
                        onChange={(e) => handleUsernameChange(e.target.value)}
                        placeholder="admin.sekolah"
                        required
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm font-mono font-bold text-blue-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all bg-slate-50/70 shadow-2xs h-10"
                      />
                    </div>
                  </div>

                  {/* 4. EMAIL & KATA SANDI (2 Kolom Grid) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1 flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-blue-700" />
                        <span>Email Resmi (Opsional)</span>
                      </label>
                      <input
                        id="input-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="admin@sekolah.sch.id"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all bg-white shadow-2xs h-10"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {/* KATA SANDI */}
                      <div>
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1 flex items-center gap-1">
                          <Lock className="w-3.5 h-3.5 text-blue-700" />
                          <span>Sandi</span>
                          <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <input
                            id="input-password"
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Min 6 char"
                            required
                            minLength={6}
                            className="w-full px-2.5 py-2 pr-7 rounded-xl border border-slate-300 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all bg-white shadow-2xs h-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
                          >
                            {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>

                      {/* ULANGI KATA SANDI */}
                      <div>
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1 flex items-center gap-1">
                          <Lock className="w-3.5 h-3.5 text-blue-700" />
                          <span>Ulangi</span>
                          <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <input
                            id="input-confirm-password"
                            type={showConfirmPassword ? 'text' : 'password'}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Ketik ulang"
                            required
                            minLength={6}
                            className={`w-full px-2.5 py-2 pr-7 rounded-xl border text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all bg-white shadow-2xs h-10 ${
                              confirmPassword && password === confirmPassword
                                ? 'border-emerald-400 bg-emerald-50/20'
                                : confirmPassword && password !== confirmPassword
                                ? 'border-amber-400 bg-amber-50/20'
                                : 'border-slate-300'
                            }`}
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
                          >
                            {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 5. KHUSUS SUPERADMIN: NPSN & CATATAN INTERNAL */}
                  {isSuperadmin && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 border-t border-slate-100">
                      <div>
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1 flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5 text-indigo-700" />
                          <span>NPSN Sekolah (Opsional)</span>
                        </label>
                        <input
                          id="input-superadmin-npsn"
                          type="text"
                          value={npsn}
                          onChange={(e) => setNpsn(e.target.value)}
                          placeholder="Nomor Pokok Sekolah Nasional"
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all bg-white shadow-2xs h-10"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1 flex items-center gap-1.5">
                          <Layers className="w-3.5 h-3.5 text-indigo-700" />
                          <span>Catatan Super Admin (Opsional)</span>
                        </label>
                        <input
                          id="input-superadmin-notes"
                          type="text"
                          value={adminNotes}
                          onChange={(e) => setAdminNotes(e.target.value)}
                          placeholder="Contoh: Sekolah binaan dinas, aktivasi mandiri"
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all bg-white shadow-2xs h-10"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* SUBMIT BUTTON & FOOTER */}
                <div className="pt-2 border-t border-slate-200 space-y-1.5">
                  <button
                    id="btn-submit-registration"
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full py-2.5 sm:py-3 px-5 rounded-xl font-bold text-xs sm:text-sm uppercase tracking-wider text-white shadow-md active:scale-[0.99] transition-all inline-flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 min-h-[44px] ${
                      isSuperadmin
                        ? 'bg-gradient-to-r from-indigo-600 via-indigo-700 to-indigo-800 hover:from-indigo-700 hover:to-indigo-900'
                        : 'bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 hover:from-blue-800 hover:to-indigo-800'
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Mendaftarkan Sekolah...</span>
                      </>
                    ) : isSuperadmin ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Daftar & Aktifkan Sekolah Sekarang</span>
                      </>
                    ) : (
                      <>
                        <span>Daftar & Lanjut Bayar ({formatRupiah(activeAmount)})</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <div className="text-center text-[10px] text-slate-400">
                    {isSuperadmin
                      ? 'Sekolah dan admin langsung tersimpan & aktif di panel Super Admin.'
                      : 'Pembayaran aman via Midtrans • Aktivasi otomatis ke database pusat.'}
                  </div>
                </div>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
