import React, { useState } from 'react';
import {
  GraduationCap,
  BookOpen,
  ArrowLeft,
  ChevronRight,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  Sparkles,
  X,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface FreeStartModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenLogin: () => void;
  onEnterSystem: () => void;
  onEnterDashboard?: () => void;
  lang: 'ID' | 'EN';
}

type RoleType = 'homeroom' | 'subject';

export const FreeStartModal: React.FC<FreeStartModalProps> = ({
  isOpen,
  onClose,
  onOpenLogin,
  onEnterSystem,
  onEnterDashboard,
  lang,
}) => {
  const { loginWithCredentials, setActiveView } = useApp();

  // Wizard Steps: 1 = Pilih Peran, 2 = Formulir Identitas & Akun
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedRole, setSelectedRole] = useState<RoleType>('homeroom');

  // Form Fields (Hanya Identitas Akun & Masuk)
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [usernameManuallyEdited, setUsernameManuallyEdited] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Submission & Error State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  if (!isOpen) return null;

  // Auto-generate suggested username from Full Name if not manually edited
  const handleFullNameChange = (name: string) => {
    setFullName(name);
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

  const handleSelectRole = (role: RoleType) => {
    setSelectedRole(role);
    setFormError('');
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    // Validasi Dasar
    const cleanName = fullName.trim();
    const cleanUsername = username.trim().toLowerCase();

    if (!cleanName) {
      setFormError(lang === 'ID' ? 'Nama lengkap wajib diisi.' : 'Full name is required.');
      return;
    }
    if (!cleanUsername) {
      setFormError(lang === 'ID' ? 'Username wajib diisi.' : 'Username is required.');
      return;
    }
    if (cleanUsername.length < 3) {
      setFormError(lang === 'ID' ? 'Username minimal 3 karakter.' : 'Username must be at least 3 characters.');
      return;
    }
    if (!/^[a-z0-9._-]+$/.test(cleanUsername)) {
      setFormError(
        lang === 'ID'
          ? 'Username hanya boleh berisi huruf kecil, angka, titik, atau strip.'
          : 'Username can only contain lowercase letters, numbers, dots, or hyphens.'
      );
      return;
    }
    if (!password) {
      setFormError(lang === 'ID' ? 'Kata sandi wajib diisi.' : 'Password is required.');
      return;
    }
    if (password.length < 6) {
      setFormError(lang === 'ID' ? 'Kata sandi minimal 6 karakter.' : 'Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setFormError(lang === 'ID' ? 'Konfirmasi kata sandi tidak cocok.' : 'Password confirmation does not match.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payloadRole = selectedRole === 'homeroom' ? 'WALI KELAS' : 'GURU MAPEL';
      const cleanEmail = email.trim().toLowerCase() || `${cleanUsername}@login.edushift.local`;

      const payload = {
        action: 'register_and_onboard',
        fullName: cleanName,
        username: cleanUsername,
        email: cleanEmail,
        password: password,
        role: payloadRole,
        mode: 'personal',
        nip: '-',
        gender: 'L',
        phone: '-',
        employmentStatus: 'PNS',
        grade: 1,
        className: 'Kelas 1',
        subjectName: selectedRole === 'subject' ? 'Guru Mata Pelajaran' : undefined,
        workspaceName: selectedRole === 'homeroom' ? `Ruang Kerja Wali Kelas - ${cleanName}` : `Ruang Kerja Guru Mapel - ${cleanName}`,
        schoolId: null,
      };

      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.ok && !data.success) {
        throw new Error(data.error || (lang === 'ID' ? 'Pendaftaran gagal. Silakan coba lagi.' : 'Registration failed.'));
      }

      // Bersihkan seluruh cache lama yang mungkin tersisa di browser dari akun/sekolah sebelumnya
      try {
        localStorage.removeItem('kawacanaan_cached_school_ws');
        localStorage.removeItem('kawacanaan_last_workspace_id');
        localStorage.setItem('kawacanaan_last_registered_name', cleanName);
        localStorage.setItem('kawacanaan_last_registered_role', payloadRole);
        if (data.userId && data.schoolId) {
          localStorage.setItem(`kawacanaan_last_workspace_id_${data.userId}`, data.schoolId);
          const personalWs = {
            id: `ws-mem-${data.userId}-${data.schoolId}`,
            userId: data.userId,
            workspaceId: data.schoolId,
            workspaceCode: null,
            role: payloadRole,
            workspaceName: 'Ruang Kerja Individu',
            workspaceType: 'personal',
            registrationMode: 'personal',
            npsn: null,
            subscriptionPlan: 'mulai',
            joinedAt: new Date().toISOString(),
          };
          localStorage.setItem(`kawacanaan_school_ws_${data.userId}`, JSON.stringify(personalWs));
        }
      } catch (_) {}

      // Otomatis login dengan akun yang baru dibuat dan masuk langsung ke Ruang Kerja
      const loginResult = await loginWithCredentials(cleanUsername, password);
      if (!loginResult.success) {
        // Coba alternatif login menggunakan email
        const retryEmailResult = await loginWithCredentials(cleanEmail, password);
        if (!retryEmailResult.success) {
          throw new Error(loginResult.error || (lang === 'ID' ? 'Akun berhasil dibuat. Silakan login.' : 'Account created. Please log in.'));
        }
      }

      // Berhasil login dan masuk ke ruang kerja / dashboard secara langsung
      setActiveView('dashboard');
      if (onEnterDashboard) {
        onEnterDashboard();
      } else {
        try {
          const url = new URL(window.location.href);
          url.searchParams.delete('page');
          window.history.pushState(null, '', url.pathname + (url.search ? url.search : ''));
        } catch (_) {}
      }
      onClose();
    } catch (err: any) {
      setFormError(err.message || (lang === 'ID' ? 'Terjadi kesalahan pada sistem.' : 'A system error occurred.'));
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-900/70 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-150">
      <div className="relative w-full max-w-md sm:max-w-lg bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden my-auto animate-in zoom-in-95 duration-200 flex flex-col max-h-[calc(100dvh-1.5rem)] sm:max-h-[88vh]">
        
        {/* Header Modal - Commercial SaaS Style */}
        <div className="relative bg-gradient-to-r from-blue-800 via-indigo-800 to-slate-900 px-5 py-4 sm:px-6 sm:py-5 text-white shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3.5 right-3.5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Tutup Modal"
          >
            <X size={16} />
          </button>

          <div className="flex items-center gap-1.5 text-blue-200 text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-1">
            <Sparkles size={12} className="text-amber-300 shrink-0" />
            <span>{step === 1 ? 'Langkah 1/2' : 'Langkah 2/2'}</span>
            <span className="text-white/30">•</span>
            <span className="text-blue-100">Gratis • Pendidik</span>
          </div>

          <h2 className="text-lg sm:text-xl font-black tracking-tight text-white pr-8 sm:pr-0">
            {step === 1
              ? (lang === 'ID' ? 'Mulai Gratis' : 'Start for Free')
              : (lang === 'ID' ? 'Pendaftaran Pendidik' : 'Educator Registration')}
          </h2>
          <p className="text-xs text-blue-100/80 mt-0.5 max-w-sm line-clamp-1">
            {step === 1
              ? (lang === 'ID'
                  ? 'Pilih peran untuk akses presensi digital.'
                  : 'Select your role for instant digital access.')
              : (lang === 'ID'
                  ? 'Lengkapi akun untuk langsung masuk.'
                  : 'Complete your credentials to enter.')}
          </p>
        </div>

        {/* Isi Modal */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
          
          {/* ========================================================================= */}
          {/* LANGKAH 1: PILIH PERAN (WALI KELAS & GURU MAPEL)                          */}
          {/* ========================================================================= */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                
                {/* KARTU 1: WALI KELAS */}
                <button
                  type="button"
                  onClick={() => handleSelectRole('homeroom')}
                  className="group relative bg-white border border-slate-200 hover:border-blue-600 hover:shadow-md rounded-xl sm:rounded-2xl p-4 text-left transition-all duration-200 flex flex-col justify-between cursor-pointer active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-blue-100"
                  id="btn-free-role-homeroom"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors shrink-0">
                        <GraduationCap className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                        1 Kelas
                      </span>
                    </div>
                    <div>
                      <h3 className="text-sm font-black uppercase tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">
                        WALI KELAS
                      </h3>
                      <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                        {lang === 'ID'
                          ? 'Presensi harian siswa (maks. 50 siswa).'
                          : 'Daily student attendance (max 50 students).'}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-600">
                    <span>{lang === 'ID' ? 'Pilih Wali Kelas' : 'Select Homeroom'}</span>
                    <ChevronRight size={15} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>

                {/* KARTU 2: GURU MATA PELAJARAN */}
                <button
                  type="button"
                  onClick={() => handleSelectRole('subject')}
                  className="group relative bg-white border border-slate-200 hover:border-emerald-600 hover:shadow-md rounded-xl sm:rounded-2xl p-4 text-left transition-all duration-200 flex flex-col justify-between cursor-pointer active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-emerald-100"
                  id="btn-free-role-subject"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors shrink-0">
                        <BookOpen className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Hingga 6 Kelas
                      </span>
                    </div>
                    <div>
                      <h3 className="text-sm font-black uppercase tracking-tight text-slate-900 group-hover:text-emerald-600 transition-colors">
                        GURU MAPEL
                      </h3>
                      <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                        {lang === 'ID'
                          ? 'Presensi per jam pelajaran khusus.'
                          : 'Attendance by subject teaching periods.'}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-600">
                    <span>{lang === 'ID' ? 'Pilih Guru Mapel' : 'Select Subject Teacher'}</span>
                    <ChevronRight size={15} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
              </div>

              {/* Footer Langkah 1 */}
              <div className="pt-2 flex flex-wrap items-center justify-center gap-1.5 text-xs text-slate-500 text-center">
                <span>{lang === 'ID' ? 'Sudah memiliki akun?' : 'Already have an account?'}</span>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenLogin();
                  }}
                  className="font-bold text-blue-700 hover:underline cursor-pointer"
                >
                  {lang === 'ID' ? 'Masuk Sekarang' : 'Sign In Now'}
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* LANGKAH 2: FORMULIR IDENTITAS & AKUN                                      */}
          {/* ========================================================================= */}
          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Baris Navigasi Balik & Label Peran */}
              <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setFormError('');
                  }}
                  className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer py-1"
                  id="btn-back-to-step1"
                >
                  <ArrowLeft size={14} />
                  <span>{lang === 'ID' ? 'Ganti Peran' : 'Change Role'}</span>
                </button>

                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  selectedRole === 'homeroom'
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                }`}>
                  {selectedRole === 'homeroom'
                    ? (lang === 'ID' ? 'Wali Kelas' : 'Homeroom')
                    : (lang === 'ID' ? 'Guru Mapel' : 'Subject Teacher')}
                </span>
              </div>

              {/* Error Alert Banner */}
              {formError && (
                <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
                  <AlertCircle size={15} className="shrink-0 mt-0.5" />
                  <span className="font-semibold leading-tight">{formError}</span>
                </div>
              )}

              {/* Formulir Akun */}
              <div className="space-y-3">
                {/* Nama Lengkap */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Nama Lengkap <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => handleFullNameChange(e.target.value)}
                      placeholder="Nama dan gelar pendidik"
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm font-medium text-slate-900 bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 outline-none transition-all h-10"
                      id="input-free-fullname"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Username */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Username <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => {
                        setUsernameManuallyEdited(true);
                        setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9._-]/g, ''));
                      }}
                      placeholder="username.anda"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm font-mono font-medium text-slate-900 bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 outline-none transition-all h-10"
                      id="input-free-username"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Email (Opsional)
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="email@sekolah.sch.id"
                        className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm font-medium text-slate-900 bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 outline-none transition-all h-10"
                        id="input-free-email"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Kata Sandi */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Kata Sandi <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Min. 6 karakter"
                        className="w-full pl-9 pr-9 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm font-medium text-slate-900 bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 outline-none transition-all h-10"
                        id="input-free-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 w-7 h-7 flex items-center justify-center cursor-pointer"
                        aria-label="Tampilkan sandi"
                      >
                        {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>

                  {/* Konfirmasi Sandi */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Konfirmasi Sandi <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Ketik ulang sandi"
                        className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm font-medium text-slate-900 bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 outline-none transition-all h-10"
                        id="input-free-confirm-password"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Tombol Simpan & Masuk */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 px-5 rounded-xl bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 active:scale-[0.99] text-white font-bold text-xs sm:text-sm uppercase tracking-wider transition-all shadow-md shadow-blue-700/20 flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer min-h-[44px]"
                  id="btn-submit-free-registration"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>{lang === 'ID' ? 'Membuat Akun...' : 'Creating Account...'}</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={16} />
                      <span>
                        {lang === 'ID'
                          ? 'Daftar & Masuk Sekarang'
                          : 'Register & Enter Now'}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};
