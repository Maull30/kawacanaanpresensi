import React, { useState, useEffect } from 'react';
import {
  X,
  Building2,
  User,
  Calendar,
  ShieldCheck,
  Check,
  Copy,
  ArrowRight,
  ArrowLeft,
  Eye,
  EyeOff,
  Lock,
  Mail,
  FileText,
  Zap,
  KeyRound,
  CheckCircle2,
  Sparkles,
  RefreshCw,
  Layers,
  School
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../context/AppContext';

export interface SchoolOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode?: 'superadmin' | 'public';
  lang?: 'ID' | 'EN';
  onSchoolCreated?: (newSchool: any) => Promise<void> | void;
}

export type DirectSubStep = 'pendaftaran' | 'direct_subscription' | 'aktif';

interface CreatedSuccessInfo {
  schoolId?: string;
  schoolName: string;
  schoolCode: string;
  adminName: string;
  username: string;
  password: string;
  npsn?: string;
  email?: string;
  workspaceType: 'school' | 'personal';
  durationPreset: 'monthly' | 'yearly' | 'permanent';
  subscriptionExpiresAt: string;
  rawSchool?: any;
}

export const SchoolOnboardingModal: React.FC<SchoolOnboardingModalProps> = ({
  isOpen,
  onClose,
  onSchoolCreated,
}) => {
  const { supabase } = useApp();

  // Step state: 1. pendaftaran -> 2. direct_subscription -> 3. aktif
  const [currentStep, setCurrentStep] = useState<DirectSubStep>('pendaftaran');

  // Step 1: Data Lembaga & Admin
  const [schoolName, setSchoolName] = useState('');
  const [npsn, setNpsn] = useState('');
  const [adminName, setAdminName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');

  // Step 2: Direct Subscription Config
  const [workspaceType, setWorkspaceType] = useState<'school' | 'personal'>('school');
  const [durationPreset, setDurationPreset] = useState<'monthly' | 'yearly' | 'permanent'>('yearly');
  const [customExpiresAt, setCustomExpiresAt] = useState('');
  const [adminNotes, setAdminNotes] = useState('');

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [createdInfo, setCreatedInfo] = useState<CreatedSuccessInfo | null>(null);
  const [copiedCredentials, setCopiedCredentials] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Initialize expiry date when modal opens or duration changes
  useEffect(() => {
    if (isOpen) {
      if (durationPreset === 'monthly') {
        const d = new Date();
        d.setDate(d.getDate() + 30);
        setCustomExpiresAt(d.toISOString().slice(0, 10));
      } else if (durationPreset === 'yearly') {
        const d = new Date();
        d.setFullYear(d.getFullYear() + 1);
        setCustomExpiresAt(d.toISOString().slice(0, 10));
      } else {
        setCustomExpiresAt('');
      }
    }
  }, [isOpen, durationPreset]);

  // Reset form when closed
  const handleClose = () => {
    if (isSubmitting) return;
    setCurrentStep('pendaftaran');
    setSchoolName('');
    setNpsn('');
    setAdminName('');
    setUsername('');
    setPassword('');
    setEmail('');
    setWorkspaceType('school');
    setDurationPreset('yearly');
    setAdminNotes('');
    setErrorMessage('');
    setCreatedInfo(null);
    setCopiedCredentials(false);
    setCopiedCode(false);
    onClose();
  };

  // Helper: Quick generate username suggestion
  const generateSuggestedUsername = () => {
    if (!schoolName.trim()) return;
    const clean = schoolName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .slice(0, 12);
    setUsername(`admin.${clean || 'sekolah'}`);
  };

  // Helper: Quick generate random secure password
  const generateRandomPassword = () => {
    const chars = 'abcdefghjkmnpqrstuvwxyz23456789';
    let rand = '';
    for (let i = 0; i < 6; i++) {
      rand += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(`Sdm@${rand}`);
  };

  // Duration selection handler
  const handleSelectDuration = (preset: 'monthly' | 'yearly' | 'permanent') => {
    setDurationPreset(preset);
    if (preset === 'monthly') {
      const d = new Date();
      d.setDate(d.getDate() + 30);
      setCustomExpiresAt(d.toISOString().slice(0, 10));
    } else if (preset === 'yearly') {
      const d = new Date();
      d.setFullYear(d.getFullYear() + 1);
      setCustomExpiresAt(d.toISOString().slice(0, 10));
    } else {
      setCustomExpiresAt('');
    }
  };

  // Validation Step 1
  const handleProceedToStep2 = () => {
    setErrorMessage('');
    const cleanSchool = schoolName.trim();
    const cleanAdmin = adminName.trim();
    const cleanUser = username.trim();
    const cleanPass = password.trim();

    if (!cleanSchool) {
      setErrorMessage('Mohon isi nama satuan pendidikan / sekolah.');
      return;
    }
    if (!cleanAdmin) {
      setErrorMessage('Mohon isi nama lengkap penanggung jawab / admin.');
      return;
    }
    if (!cleanUser) {
      setErrorMessage('Mohon isi username login administrator.');
      return;
    }
    if (cleanUser.length < 3) {
      setErrorMessage('Username minimal 3 karakter.');
      return;
    }
    if (!cleanPass) {
      setErrorMessage('Mohon isi kata sandi login.');
      return;
    }
    if (cleanPass.length < 6) {
      setErrorMessage('Kata sandi minimal 6 karakter.');
      return;
    }

    setCurrentStep('direct_subscription');
  };

  // Execute Direct Subscription (Submit to API)
  const handleExecuteDirectSubscription = async () => {
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      const cleanSchool = schoolName.trim();
      const cleanAdmin = adminName.trim();
      const cleanUser = username.trim().toLowerCase();
      const cleanPass = password.trim();
      const cleanNpsn = npsn.trim();
      const cleanEmail = email.trim();

      // Retrieve bearer token if available
      const { data: authSession } = await supabase.auth.getSession();
      const token = authSession?.session?.access_token;
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const payload = {
        schoolName: cleanSchool,
        adminName: cleanAdmin,
        username: cleanUser,
        password: cleanPass,
        email: cleanEmail || undefined,
        npsn: cleanNpsn || undefined,
        plan: workspaceType === 'school' ? 'sekolah_pro' : 'guru_pro',
        workspace_type: workspaceType,
        workspace_service: workspaceType === 'school' ? 'school_integrated' : 'teacher_independent',
        subscription_expires_at: durationPreset === 'permanent' ? null : (customExpiresAt || null),
        notes: adminNotes.trim() || undefined,
        isSuperadmin: true,
        mode: 'superadmin',
      };

      const res = await fetch('/api/register-school', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data?.error || 'Gagal memproses direct subscription sekolah.');
      }

      const createdSchool = data.school;
      const createdAdmin = data.admin;

      const successData: CreatedSuccessInfo = {
        schoolId: createdSchool?.id || createdSchool?.school_id,
        schoolName: createdSchool?.name || cleanSchool,
        schoolCode: createdSchool?.code || createdSchool?.schoolCode || 'SCH-' + Math.floor(100000 + Math.random() * 900000),
        adminName: createdAdmin?.name || cleanAdmin,
        username: createdAdmin?.username || cleanUser,
        password: cleanPass,
        npsn: cleanNpsn || createdSchool?.npsn,
        email: cleanEmail || undefined,
        workspaceType,
        durationPreset,
        subscriptionExpiresAt: durationPreset === 'permanent' ? 'Permanen (Seumur Hidup)' : (customExpiresAt || '-'),
        rawSchool: createdSchool,
      };

      setCreatedInfo(successData);
      setCurrentStep('aktif');
    } catch (err: any) {
      setErrorMessage(err?.message || 'Terjadi kesalahan sistem saat mendaftarkan sekolah.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Finish and notify parent
  const handleFinish = async () => {
    if (onSchoolCreated && createdInfo?.rawSchool) {
      await onSchoolCreated(createdInfo.rawSchool);
    }
    handleClose();
  };

  // Copy full credentials
  const handleCopyCredentials = () => {
    if (!createdInfo) return;
    const text = `KREDENSIAL AKSES KAWACANAAN SD
Lembaga: ${createdInfo.schoolName}
Tipe Ruang Kerja: ${createdInfo.workspaceType === 'school' ? 'Ruang Kerja Sekolah (Sekolah Terpadu)' : 'Ruang Kerja Individu (Guru Mandiri)'}
Kode Akses Sekolah: ${createdInfo.schoolCode}
${createdInfo.npsn ? `NPSN: ${createdInfo.npsn}\n` : ''}Penanggung Jawab: ${createdInfo.adminName}
Username: ${createdInfo.username}
Password: ${createdInfo.password}
Masa Aktif: ${createdInfo.subscriptionExpiresAt}
Status: AKTIF (DIRECT SUBSCRIPTION SUPER ADMIN)
Tautan Masuk: ${window.location.origin}/login`;

    navigator.clipboard.writeText(text);
    setCopiedCredentials(true);
    setTimeout(() => setCopiedCredentials(false), 2500);
  };

  const handleCopyCode = () => {
    if (!createdInfo?.schoolCode) return;
    navigator.clipboard.writeText(createdInfo.schoolCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn">
      <div
        id="modal-direct-subscription"
        className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-100 overflow-hidden my-auto flex flex-col transition-all max-h-[92vh]"
      >
        {/* MODAL HEADER: Superadmin & Stepper */}
        <div className="px-5 sm:px-7 py-4 border-b border-slate-100 flex items-center justify-between gap-4 bg-slate-50/70 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-sm shadow-blue-500/20 shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                  Super Admin
                </span>
                <span className="inline-flex items-center gap-1 text-[9px] bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded-full border border-blue-200">
                  <Zap className="w-2.5 h-2.5 text-blue-600 fill-blue-600" />
                  Direct Subscription
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                {currentStep === 'aktif' ? 'Aktivasi Berhasil' : 'Tambah Satuan Pendidikan'}
              </h2>
            </div>
          </div>

          {/* Stepper Minimalist (Pendaftaran -> Direct Subscription -> Aktif) */}
          <div className="hidden sm:flex items-center gap-1.5 text-xs font-bold shrink-0">
            {/* Step 1 */}
            <div
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full transition-all ${
                currentStep === 'pendaftaran'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : currentStep === 'direct_subscription' || currentStep === 'aktif'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-slate-100 text-slate-500'
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-black">
                {currentStep === 'direct_subscription' || currentStep === 'aktif' ? '✓' : '1'}
              </span>
              <span>Pendaftaran</span>
            </div>

            <div className="h-0.5 w-3 bg-slate-200" />

            {/* Step 2 */}
            <div
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full transition-all ${
                currentStep === 'direct_subscription'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : currentStep === 'aktif'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-slate-100 text-slate-400'
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-black">
                {currentStep === 'aktif' ? '✓' : '2'}
              </span>
              <span>Direct Subscription</span>
            </div>

            <div className="h-0.5 w-3 bg-slate-200" />

            {/* Step 3 */}
            <div
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full transition-all ${
                currentStep === 'aktif'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-400'
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-black">
                3
              </span>
              <span>Aktif</span>
            </div>
          </div>

          <button
            type="button"
            id="btn-close-direct-sub-modal"
            onClick={handleClose}
            disabled={isSubmitting}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
            title="Tutup Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* MODAL BODY */}
        <div className="overflow-y-auto p-5 sm:p-7 flex-1">
          {errorMessage && (
            <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs font-semibold flex items-center gap-2.5 animate-shake">
              <div className="w-6 h-6 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                !
              </div>
              <span className="flex-1">{errorMessage}</span>
            </div>
          )}

          {/* STEP 1: FORM PENDAFTARAN LEMBAGA & ADMIN */}
          {currentStep === 'pendaftaran' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Kolom Kiri: 3D Figur & Status Ringkas */}
              <div className="lg:col-span-4 bg-gradient-to-b from-blue-50/80 via-white to-blue-50/40 p-4 sm:p-5 rounded-2xl border border-blue-100/80 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="relative rounded-2xl overflow-hidden bg-white shadow-sm border border-blue-100/60 aspect-square flex items-center justify-center p-2">
                    <img
                      src="/images/superadmin_direct_sub_3d.jpg"
                      alt="Direct Subscription Illustration"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-contain drop-shadow-sm select-none"
                    />
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-white/95 text-blue-800 border border-blue-200 shadow-2xs backdrop-blur-xs flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5 text-blue-600" />
                      Layanan Resmi
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-black text-slate-900 leading-tight">
                      Registrasi Satuan Pendidikan
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      Daftarkan lembaga baru dengan otorisasi Super Admin. Akun langsung aktif tanpa antrean pembayaran.
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-white rounded-xl border border-blue-100 space-y-2 text-[11px] text-slate-600 font-medium">
                  <div className="flex items-center gap-2 text-slate-800 font-bold">
                    <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Fasilitas Direct Subscription:</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-600 pl-1">
                    <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3] shrink-0" />
                    <span>Aktivasi Instan ke Database Pusat</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-600 pl-1">
                    <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3] shrink-0" />
                    <span>Terbit Kode Akses &amp; Admin Utama</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-600 pl-1">
                    <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3] shrink-0" />
                    <span>Bypass Midtrans Payment Gateway</span>
                  </div>
                </div>
              </div>

              {/* Kolom Kanan: Form Inputs */}
              <div className="lg:col-span-8 space-y-5">
                {/* Bagian 1: Data Lembaga */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
                    <Building2 className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Identitas Satuan Pendidikan
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Nama Satuan Pendidikan / Sekolah <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="input-school-name"
                        value={schoolName}
                        onChange={(e) => setSchoolName(e.target.value)}
                        onBlur={() => {
                          if (!username && schoolName) generateSuggestedUsername();
                        }}
                        placeholder="Contoh: SD Negeri 01 Pagi Merdeka"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        NPSN <span className="text-slate-400 font-normal">(Opsional)</span>
                      </label>
                      <input
                        type="text"
                        id="input-school-npsn"
                        value={npsn}
                        onChange={(e) => setNpsn(e.target.value)}
                        placeholder="8 digit angka"
                        maxLength={8}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-mono text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition"
                      />
                    </div>
                  </div>
                </div>

                {/* Bagian 2: Akun Administrator Utama */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
                    <User className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Akun Administrator Utama
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Nama Lengkap Administrator <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="input-admin-name"
                        value={adminName}
                        onChange={(e) => setAdminName(e.target.value)}
                        placeholder="Nama penanggung jawab"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-bold text-slate-700">
                          Username Login <span className="text-rose-500">*</span>
                        </label>
                        {schoolName && (
                          <button
                            type="button"
                            onClick={generateSuggestedUsername}
                            className="text-[10px] font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
                          >
                            Buat Otomatis
                          </button>
                        )}
                      </div>
                      <input
                        type="text"
                        id="input-admin-username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9._-]/g, ''))}
                        placeholder="contoh: admin.sdn01"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-mono text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-bold text-slate-700">
                          Kata Sandi (Password) <span className="text-rose-500">*</span>
                        </label>
                        <button
                          type="button"
                          onClick={generateRandomPassword}
                          className="text-[10px] font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
                        >
                          Acak Sandi
                        </button>
                      </div>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          id="input-admin-password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Minimal 6 karakter"
                          className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-mono text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Email Korespondensi <span className="text-slate-400 font-normal">(Opsional)</span>
                      </label>
                      <input
                        type="email"
                        id="input-admin-email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="admin@sekolah.sch.id"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition"
                      />
                    </div>
                  </div>
                </div>

                {/* Footer Step 1 */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold cursor-pointer transition"
                  >
                    Batal
                  </button>

                  <button
                    type="button"
                    id="btn-goto-step-2"
                    onClick={handleProceedToStep2}
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-sm shadow-blue-500/25 transition active:scale-95"
                  >
                    <span>Lanjut ke Direct Subscription</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: KONFIGURASI DIRECT SUBSCRIPTION */}
          {currentStep === 'direct_subscription' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Kolom Kiri: Ringkasan Lembaga yang Didaftarkan */}
              <div className="lg:col-span-4 bg-gradient-to-b from-blue-50/80 via-white to-blue-50/40 p-4 sm:p-5 rounded-2xl border border-blue-100/80 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-sm shadow-blue-500/20 shrink-0">
                    <School className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-blue-700">
                      Entitas Baru
                    </span>
                    <h3 className="text-sm font-black text-slate-900 leading-tight truncate max-w-[190px]">
                      {schoolName}
                    </h3>
                    <p className="text-[11px] text-slate-500 truncate">
                      Admin: {adminName}
                    </p>
                  </div>
                </div>

                <div className="p-3.5 bg-white rounded-xl border border-blue-100 space-y-2 text-xs">
                  <div className="flex justify-between items-center pb-1.5 border-b border-slate-100">
                    <span className="text-slate-500 text-[11px]">Username</span>
                    <span className="font-mono font-bold text-slate-800">{username}</span>
                  </div>
                  {npsn && (
                    <div className="flex justify-between items-center pb-1.5 border-b border-slate-100">
                      <span className="text-slate-500 text-[11px]">NPSN</span>
                      <span className="font-mono font-bold text-slate-800">{npsn}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 text-[11px]">Metode</span>
                    <span className="text-blue-700 font-bold text-[11px]">Direct Sub</span>
                  </div>
                </div>

                {/* 3D Visual Miniature */}
                <div className="rounded-xl overflow-hidden border border-blue-100 bg-white p-2 flex items-center gap-3">
                  <img
                    src="/images/superadmin_direct_sub_3d.jpg"
                    alt="3D Badge"
                    referrerPolicy="no-referrer"
                    className="w-12 h-12 object-contain shrink-0"
                  />
                  <div className="text-[11px] leading-tight text-slate-600">
                    <span className="font-bold text-slate-900 block">Otorisasi Super Admin</span>
                    Status langsung aktif dengan kuota penuh.
                  </div>
                </div>
              </div>

              {/* Kolom Kanan: Pilihan Ruang Kerja & Durasi Lisensi */}
              <div className="lg:col-span-8 space-y-5">
                {/* 1. Tipe Ruang Kerja */}
                <div className="space-y-2.5">
                  <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                    1. Tentukan Tipe Ruang Kerja
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Ruang Kerja Sekolah */}
                    <button
                      type="button"
                      id="card-workspace-school"
                      onClick={() => setWorkspaceType('school')}
                      className={`p-3.5 rounded-2xl border text-left cursor-pointer transition-all flex flex-col justify-between space-y-2 ${
                        workspaceType === 'school'
                          ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-600/10 shadow-xs'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs">
                          <Building2 className="w-4 h-4" />
                        </div>
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            workspaceType === 'school'
                              ? 'border-blue-600 bg-blue-600 text-white'
                              : 'border-slate-300 bg-white'
                          }`}
                        >
                          {workspaceType === 'school' && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs font-black text-slate-900">Ruang Kerja Sekolah</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          Institusi resmi terpadu dengan input rombel mandiri &amp; multi-guru.
                        </div>
                      </div>
                    </button>

                    {/* Ruang Kerja Individu */}
                    <button
                      type="button"
                      id="card-workspace-personal"
                      onClick={() => setWorkspaceType('personal')}
                      className={`p-3.5 rounded-2xl border text-left cursor-pointer transition-all flex flex-col justify-between space-y-2 ${
                        workspaceType === 'personal'
                          ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-600/10 shadow-xs'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-xs">
                          <User className="w-4 h-4" />
                        </div>
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            workspaceType === 'personal'
                              ? 'border-blue-600 bg-blue-600 text-white'
                              : 'border-slate-300 bg-white'
                          }`}
                        >
                          {workspaceType === 'personal' && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs font-black text-slate-900">Ruang Kerja Individu</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          Pendidik mandiri untuk rombel binaan &amp; jurnal mengajar pribadi.
                        </div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* 2. Masa Aktif Lisensi */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                      2. Masa Berlaku Lisensi (Direct Subscription)
                    </label>
                    <span className="text-[11px] font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                      {durationPreset === 'permanent'
                        ? 'Permanen (Seumur Hidup)'
                        : durationPreset === 'yearly'
                        ? '1 Tahun (365 Hari)'
                        : '1 Bulan (30 Hari)'}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      id="btn-preset-monthly"
                      onClick={() => handleSelectDuration('monthly')}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition border cursor-pointer flex flex-col items-center justify-center ${
                        durationPreset === 'monthly'
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <span>1 Bulan</span>
                      <span className="text-[9px] font-normal opacity-85">30 Hari</span>
                    </button>

                    <button
                      type="button"
                      id="btn-preset-yearly"
                      onClick={() => handleSelectDuration('yearly')}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition border cursor-pointer flex flex-col items-center justify-center relative ${
                        durationPreset === 'yearly'
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <span className="absolute -top-1.5 px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-950 text-[8px] font-black uppercase">
                        Rekomendasi
                      </span>
                      <span>1 Tahun</span>
                      <span className="text-[9px] font-normal opacity-85">365 Hari</span>
                    </button>

                    <button
                      type="button"
                      id="btn-preset-permanent"
                      onClick={() => handleSelectDuration('permanent')}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition border cursor-pointer flex flex-col items-center justify-center ${
                        durationPreset === 'permanent'
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <span>Permanen</span>
                      <span className="text-[9px] font-normal opacity-85">Seumur Hidup</span>
                    </button>
                  </div>
                </div>

                {/* 3. Catatan Internal Super Admin */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                    3. Catatan Administrator <span className="text-slate-400 font-normal">(Opsional)</span>
                  </label>
                  <input
                    type="text"
                    id="input-admin-notes"
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Contoh: Kemitraan Dinas Pendidikan, aktivasi offline, dll."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition"
                  />
                </div>

                {/* Footer Step 2 */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setCurrentStep('pendaftaran')}
                    disabled={isSubmitting}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition disabled:opacity-50"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Kembali</span>
                  </button>

                  <button
                    type="button"
                    id="btn-execute-direct-sub"
                    onClick={handleExecuteDirectSubscription}
                    disabled={isSubmitting}
                    className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-sm shadow-blue-500/25 transition disabled:opacity-50 active:scale-95"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Menerbitkan Lisensi...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4 stroke-[3]" />
                        <span>Aktifkan Langsung Sekarang</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: SUKSES AKTIVASI LANGSUNG (KREDENSIAL SIAP PAKAI) */}
          {currentStep === 'aktif' && createdInfo && (
            <div className="max-w-2xl mx-auto space-y-6 py-2">
              <div className="text-center space-y-2">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm shadow-emerald-500/20">
                  <CheckCircle2 className="w-9 h-9 stroke-[2.5]" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    Direct Subscription Berhasil
                  </span>
                  <h3 className="text-lg sm:text-xl font-black text-slate-900 mt-1">
                    {createdInfo.schoolName} Langsung Aktif!
                  </h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto mt-0.5">
                    Data sekolah dan akun administrator telah terdaftar aktif di database pusat. Silakan salin dan serahkan kredensial di bawah ini.
                  </p>
                </div>
              </div>

              {/* Kartu Kredensial Akses */}
              <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 sm:p-5 space-y-4 shadow-2xs">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <KeyRound className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Kredensial Akses Administrator
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                    Status: Aktif
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                  <div>
                    <span className="text-slate-500 text-[10px] block font-semibold">Nama Satuan Pendidikan</span>
                    <span className="font-bold text-slate-900 text-xs sm:text-sm truncate block mt-0.5">
                      {createdInfo.schoolName}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-500 text-[10px] block font-semibold">Tipe Ruang Kerja</span>
                    <span className="font-bold text-blue-700 text-xs sm:text-sm block mt-0.5">
                      {createdInfo.workspaceType === 'school' ? 'Ruang Kerja Sekolah (Terpadu)' : 'Ruang Kerja Individu'}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-500 text-[10px] block font-semibold">Kode Akses Sekolah</span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="font-mono font-bold text-slate-900 text-xs sm:text-sm bg-white px-2 py-0.5 rounded border border-slate-200">
                        {createdInfo.schoolCode}
                      </span>
                      <button
                        type="button"
                        onClick={handleCopyCode}
                        className="p-1 rounded text-slate-400 hover:text-blue-600 cursor-pointer transition"
                        title="Salin Kode Akses"
                      >
                        {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-500 text-[10px] block font-semibold">Penanggung Jawab</span>
                    <span className="font-bold text-slate-900 text-xs sm:text-sm block mt-0.5">
                      {createdInfo.adminName}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-500 text-[10px] block font-semibold">Username Login</span>
                    <span className="font-mono font-bold text-slate-900 text-xs sm:text-sm block mt-0.5 bg-white px-2 py-0.5 rounded border border-slate-200 inline-block">
                      {createdInfo.username}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-500 text-[10px] block font-semibold">Kata Sandi (Password)</span>
                    <span className="font-mono font-bold text-slate-900 text-xs sm:text-sm block mt-0.5 bg-white px-2 py-0.5 rounded border border-slate-200 inline-block">
                      {createdInfo.password}
                    </span>
                  </div>

                  <div className="sm:col-span-2">
                    <span className="text-slate-500 text-[10px] block font-semibold">Masa Aktif Lisensi</span>
                    <span className="font-medium text-slate-800 text-xs block mt-0.5">
                      {createdInfo.subscriptionExpiresAt}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2.5">
                  <button
                    type="button"
                    id="btn-copy-full-credentials"
                    onClick={handleCopyCredentials}
                    className="w-full sm:w-auto px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition shadow-2xs"
                  >
                    {copiedCredentials ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-600" />
                        <span className="text-emerald-700">Tersalin ke Clipboard!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 text-slate-500" />
                        <span>Salin Kredensial Lengkap</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    id="btn-finish-direct-sub"
                    onClick={handleFinish}
                    className="w-full sm:w-auto px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-sm shadow-blue-500/25 transition active:scale-95"
                  >
                    <span>Selesai &amp; Kelola Sekolah</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SchoolOnboardingModal;
