import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { supabase, signInWithEmail, signInWithGoogle } from '../lib/supabaseClient';
import { KawacanaanEmblem } from '../components/KawacanaanEmblem';
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
  ShieldCheck,
  CheckCircle2,
  LogOut,
} from 'lucide-react';

type RoleType = 'homeroom' | 'subject';

interface OnboardingViewProps {
  onCompleted?: (userId: string) => void;
}

export const OnboardingView: React.FC<OnboardingViewProps> = ({ onCompleted }) => {
  const {
    showToast,
    logout,
    loadUserDataAfterOnboarding,
    loginWithCredentials,
    setActiveView,
    setIsOnboarding,
  } = useApp();

  // Wizard step untuk registrasi manual: 1 = Pilih Peran, 2 = Pendaftaran Akun Pendidik
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedRole, setSelectedRole] = useState<RoleType>('homeroom');

  // Google SSO session detection
  const [hasGoogleSession, setHasGoogleSession] = useState(false);
  const [googleUserEmail, setGoogleUserEmail] = useState('');
  const [googleUserId, setGoogleUserId] = useState('');
  const [googleAvatar, setGoogleAvatar] = useState('');

  // Form Fields (untuk registrasi manual)
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

  // Check on mount if user arrived with active Supabase session (e.g. from Google OAuth)
  useEffect(() => {
    let isMounted = true;
    const checkActiveSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        const sessionUser = data?.session?.user;
        if (sessionUser && isMounted) {
          setHasGoogleSession(true);
          setGoogleUserId(sessionUser.id);
          const userEmail = sessionUser.email || '';
          setGoogleUserEmail(userEmail);
          setEmail(userEmail);

          const meta = sessionUser.user_metadata || {};
          const detectedName = meta.full_name || meta.name || '';
          const avatar = meta.avatar_url || meta.picture || '';
          if (avatar) setGoogleAvatar(avatar);

          const finalName = detectedName || (userEmail ? userEmail.split('@')[0] : 'Pendidik');
          setFullName(finalName);

          const sanitized = finalName
            .toLowerCase()
            .replace(/dr\.|dra\.|drs\.|s\.pd\.|m\.pd\.|h\.|hj\./gi, '')
            .trim()
            .replace(/\s+/g, '.')
            .replace(/[^a-z0-9.]/g, '')
            .slice(0, 24);
          if (sanitized) {
            setUsername(sanitized);
          } else if (userEmail) {
            setUsername(userEmail.split('@')[0].toLowerCase().replace(/[^a-z0-9._-]/g, ''));
          }
        }
      } catch (err) {
        console.warn('Session check error in OnboardingView:', err);
      }
    };

    void checkActiveSession();
    return () => {
      isMounted = false;
    };
  }, []);

  // Alur khusus Google: Langsung pilih peran dan siapkan ruang kerja tanpa form onboarding
  const handleSelectGoogleRole = async (role: RoleType) => {
    setSelectedRole(role);
    setFormError('');
    setIsSubmitting(true);

    try {
      const cleanName = fullName.trim() || googleUserEmail.split('@')[0] || 'Pendidik';
      const payloadRole = role === 'homeroom' ? 'WALI KELAS' : 'GURU MAPEL';
      const action = role === 'homeroom' ? 'onboard_homeroom' : 'onboard_subject_teacher';

      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      const targetUserId = googleUserId || sessionData?.session?.user?.id;

      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          action,
          mode: 'personal',
          teacherName: cleanName,
          nip: '-',
          gender: 'L',
          phone: '-',
          employmentStatus: 'PNS',
          workspaceName: role === 'homeroom'
            ? `Ruang Kerja Wali Kelas - ${cleanName}`
            : `Ruang Kerja Guru Mapel - ${cleanName}`,
          subjectName: role === 'subject' ? 'Guru Mata Pelajaran' : undefined,
          grade: 1,
          className: 'Kelas 1',
        }),
      });

      const data = await res.json();
      if (!res.ok || (!data.ok && !data.success)) {
        throw new Error(data.error || 'Gagal menyiapkan ruang kerja. Silakan coba lagi.');
      }

      // Simpan preferensi akun di localStorage
      try {
        localStorage.removeItem('kawacanaan_cached_school_ws');
        localStorage.removeItem('kawacanaan_last_workspace_id');
        localStorage.setItem('kawacanaan_last_registered_name', cleanName);
        localStorage.setItem('kawacanaan_last_registered_role', payloadRole);
        localStorage.setItem('kawacanaan_user_has_logged_in', 'true');
        const resolvedUserId = targetUserId || data.userId;
        if (resolvedUserId && data.schoolId) {
          localStorage.setItem(`kawacanaan_last_workspace_id_${resolvedUserId}`, data.schoolId);
          const personalWs = {
            id: `ws-mem-${resolvedUserId}-${data.schoolId}`,
            userId: resolvedUserId,
            workspaceId: data.schoolId,
            workspaceCode: null,
            role: payloadRole,
            workspaceName: role === 'homeroom' ? 'Ruang Kerja Wali Kelas' : 'Ruang Kerja Guru Mapel',
            workspaceType: 'personal',
            registrationMode: 'personal',
            npsn: null,
            subscriptionPlan: 'mulai',
            joinedAt: new Date().toISOString(),
          };
          localStorage.setItem(`kawacanaan_school_ws_${resolvedUserId}`, JSON.stringify(personalWs));
        }
      } catch (_) {}

      showToast(
        `Selamat datang, ${cleanName}! Ruang kerja ${role === 'homeroom' ? 'Wali Kelas' : 'Guru Mata Pelajaran'} Anda siap digunakan.`,
        'success'
      );
      setIsOnboarding(false);

      const finalUserId = targetUserId || data.userId;
      if (onCompleted) {
        onCompleted(finalUserId);
      } else if (loadUserDataAfterOnboarding) {
        await loadUserDataAfterOnboarding(finalUserId);
      } else {
        setActiveView('dashboard');
      }
    } catch (err: any) {
      setFormError(err.message || 'Terjadi kesalahan pada sistem saat menyiapkan ruang kerja.');
      setIsSubmitting(false);
    }
  };

  // Auto-generate suggested username from Full Name if not manually edited (untuk registrasi manual)
  const handleFullNameChange = (name: string) => {
    setFullName(name);
    if (!usernameManuallyEdited && !hasGoogleSession) {
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

  const handleBackToLogin = async () => {
    if (hasGoogleSession) {
      await logout();
    }
    setIsOnboarding(false);
    setActiveView('login');
  };

  // Submit form untuk pengguna registrasi manual
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const cleanName = fullName.trim();
    const cleanUsername = username.trim().toLowerCase();

    if (!cleanName) {
      setFormError('Nama lengkap wajib diisi.');
      return;
    }

    if (!cleanUsername) {
      setFormError('Username login wajib diisi.');
      return;
    }

    if (cleanUsername.length < 3) {
      setFormError('Username minimal 3 karakter.');
      return;
    }

    if (!/^[a-z0-9._-]+$/.test(cleanUsername)) {
      setFormError('Username hanya boleh berisi huruf kecil, angka, titik, atau strip.');
      return;
    }

    if (!password) {
      setFormError('Kata sandi wajib diisi.');
      return;
    }
    if (password.length < 6) {
      setFormError('Kata sandi minimal 6 karakter.');
      return;
    }
    if (password !== confirmPassword) {
      setFormError('Konfirmasi kata sandi tidak cocok.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payloadRole = selectedRole === 'homeroom' ? 'WALI KELAS' : 'GURU MAPEL';
      const cleanEmail = email.trim() || `${cleanUsername}@kawacanaan.internal`;

      const payload = {
        action: selectedRole === 'homeroom' ? 'onboard_homeroom' : 'onboard_subject_teacher',
        fullName: cleanName,
        teacherName: cleanName,
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
        workspaceName: selectedRole === 'homeroom'
          ? `Ruang Kerja Wali Kelas - ${cleanName}`
          : `Ruang Kerja Guru Mapel - ${cleanName}`,
        schoolId: null,
      };

      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || (!data.ok && !data.success)) {
        throw new Error(data.error || 'Pendaftaran gagal. Silakan coba lagi.');
      }

      // Simpan preferensi akun di localStorage
      try {
        localStorage.removeItem('kawacanaan_cached_school_ws');
        localStorage.removeItem('kawacanaan_last_workspace_id');
        localStorage.setItem('kawacanaan_last_registered_name', cleanName);
        localStorage.setItem('kawacanaan_last_registered_role', payloadRole);
        localStorage.setItem('kawacanaan_user_has_logged_in', 'true');
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

      // Otomatis login dengan akun yang baru dibuat
      const loginResult = await loginWithCredentials(cleanUsername, password);
      if (!loginResult.success) {
        const retryEmailResult = await loginWithCredentials(cleanEmail, password);
        if (!retryEmailResult.success) {
          const fallbackSignIn = await signInWithEmail(cleanEmail, password);
          if (fallbackSignIn.error) {
            throw new Error(loginResult.error || 'Akun berhasil dibuat. Silakan login kembali.');
          }
        }
      }

      showToast('Pendaftaran akun pendidik berhasil! Selamat datang.', 'success');
      setIsOnboarding(false);

      if (onCompleted) {
        onCompleted(data.userId);
      } else if (loadUserDataAfterOnboarding) {
        await loadUserDataAfterOnboarding(data.userId);
      } else {
        setActiveView('dashboard');
      }
    } catch (err: any) {
      setFormError(err.message || 'Terjadi kesalahan pada sistem saat pendaftaran.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-3 sm:p-6 md:p-8 selection:bg-blue-600 selection:text-white antialiased">
      {/* Container Utama Onboarding */}
      <div className="w-full max-w-xl bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-slate-200/80 overflow-hidden my-auto animate-in fade-in duration-200">
        
        {/* Header Onboarding */}
        <div className="relative bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 px-4 sm:px-7 md:px-8 py-4 sm:py-6 text-white">
          <button
            type="button"
            onClick={handleBackToLogin}
            className="absolute top-3.5 sm:top-5 right-3.5 sm:right-5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center gap-1.5 text-xs font-semibold transition-colors cursor-pointer"
            aria-label="Kembali ke halaman masuk"
            id="btn-onboarding-back-to-login"
          >
            <LogOut size={14} />
            <span className="hidden sm:inline">Keluar</span>
          </button>

          <div className="flex items-center gap-2 text-blue-200 text-xs font-bold uppercase tracking-wider mb-1">
            <Sparkles size={14} className="text-yellow-300 shrink-0" />
            <span>
              {hasGoogleSession
                ? 'Aktivasi Akun Google'
                : step === 1
                ? 'Langkah 1 dari 2'
                : 'Langkah 2 dari 2'}
            </span>
          </div>

          <h2 className="text-lg sm:text-2xl font-black tracking-tight text-white pr-16 sm:pr-0">
            {hasGoogleSession
              ? 'Pilih Peran Anda'
              : step === 1
              ? 'Pilih Peran Anda'
              : 'Pendaftaran Akun Pendidik'}
          </h2>
          <p className="text-xs sm:text-sm text-blue-100/90 mt-1 max-w-lg leading-relaxed">
            {hasGoogleSession
              ? 'Nama pendidik otomatis mengikuti akun Google Anda. Cukup pilih salah satu peran untuk langsung mulai:'
              : step === 1
              ? 'Tentukan peran pendidik Anda untuk mulai presensi digital secara gratis tanpa komitmen.'
              : 'Lengkapi data akun untuk langsung membuat dan masuk ke ruang kerja Anda.'}
          </p>
        </div>

        {/* Konten Onboarding */}
        <div className="p-4 sm:p-6 md:p-8 space-y-4">

          {/* ========================================================================= */}
          {/* ALUR KHUSUS GOOGLE: CUKUP PILIH PERAN SAJA TANPA MENAMPILKAN FORM         */}
          {/* ========================================================================= */}
          {hasGoogleSession ? (
            <div className="space-y-4 sm:space-y-5">
              {/* Kartu Profil Google */}
              <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-blue-50/90 via-indigo-50/50 to-slate-50 border border-blue-100 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  {googleAvatar ? (
                    <img
                      src={googleAvatar}
                      alt={fullName}
                      referrerPolicy="no-referrer"
                      className="w-11 h-11 sm:w-12 sm:h-12 rounded-full border-2 border-white shadow-sm object-cover shrink-0"
                    />
                  ) : (
                    <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-blue-600 text-white font-black flex items-center justify-center text-base shadow-sm shrink-0">
                      {fullName ? fullName.charAt(0).toUpperCase() : 'P'}
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[11px] font-semibold text-slate-500">Akun Google:</span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-100 text-[10px] font-bold text-blue-800">
                        <ShieldCheck size={12} className="text-blue-600" />
                        Terverifikasi
                      </span>
                    </div>
                    <div className="font-extrabold text-sm sm:text-base text-slate-900 truncate">
                      {fullName || 'Pendidik'}
                    </div>
                    <div className="text-[11px] sm:text-xs text-slate-500 truncate">
                      {googleUserEmail}
                    </div>
                  </div>
                </div>
              </div>

              {/* Error Alert Banner */}
              {formError && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5">
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  <span className="font-semibold">{formError}</span>
                </div>
              )}

              {/* Dua Pilihan Peran Pendidik */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {/* 1. WALI KELAS */}
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleSelectGoogleRole('homeroom')}
                  className={`group relative bg-white border-2 rounded-2xl p-4 sm:p-5 text-left transition-all duration-200 flex flex-col justify-between cursor-pointer focus:outline-none focus:ring-4 focus:ring-blue-100 min-h-[175px] ${
                    isSubmitting && selectedRole === 'homeroom'
                      ? 'border-blue-600 ring-2 ring-blue-500 bg-blue-50/40'
                      : isSubmitting
                      ? 'opacity-50 cursor-not-allowed border-slate-200'
                      : 'border-slate-200 hover:border-blue-600 hover:shadow-lg active:scale-98'
                  }`}
                  id="btn-google-role-homeroom"
                >
                  <div className="space-y-2.5 sm:space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors shrink-0">
                        <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6" />
                      </div>
                      <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                        Kapasitas: 1 Kelas
                      </span>
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-base font-black uppercase tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">
                        1. WALI KELAS
                      </h3>
                      <p className="mt-1 text-xs text-slate-600 leading-relaxed font-normal">
                        Mengelola presensi harian, jurnal kelas, data siswa, dan rekapitulasi kehadiran untuk rombel binaan Anda.
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-600">
                    {isSubmitting && selectedRole === 'homeroom' ? (
                      <span className="flex items-center gap-1.5 text-blue-700">
                        <Loader2 size={15} className="animate-spin" />
                        Menyiapkan Ruang Kerja...
                      </span>
                    ) : (
                      <>
                        <span>Pilih Sebagai Wali Kelas</span>
                        <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </div>
                </button>

                {/* 2. GURU MATA PELAJARAN */}
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleSelectGoogleRole('subject')}
                  className={`group relative bg-white border-2 rounded-2xl p-4 sm:p-5 text-left transition-all duration-200 flex flex-col justify-between cursor-pointer focus:outline-none focus:ring-4 focus:ring-emerald-100 min-h-[175px] ${
                    isSubmitting && selectedRole === 'subject'
                      ? 'border-emerald-600 ring-2 ring-emerald-500 bg-emerald-50/40'
                      : isSubmitting
                      ? 'opacity-50 cursor-not-allowed border-slate-200'
                      : 'border-slate-200 hover:border-emerald-600 hover:shadow-lg active:scale-98'
                  }`}
                  id="btn-google-role-subject"
                >
                  <div className="space-y-2.5 sm:space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors shrink-0">
                        <BookOpen className="w-5 h-5 sm:w-6 sm:h-6" />
                      </div>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        Kapasitas: Maks. 6 Kelas
                      </span>
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-base font-black uppercase tracking-tight text-slate-900 group-hover:text-emerald-600 transition-colors">
                        2. GURU MATA PELAJARAN
                      </h3>
                      <p className="mt-1 text-xs text-slate-600 leading-relaxed font-normal">
                        Mengelola absensi per jam pelajaran khusus (PJOK, PAI, Bahasa Inggris, dll) di berbagai rombel kelas.
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-600">
                    {isSubmitting && selectedRole === 'subject' ? (
                      <span className="flex items-center gap-1.5 text-emerald-700">
                        <Loader2 size={15} className="animate-spin" />
                        Menyiapkan Ruang Kerja...
                      </span>
                    ) : (
                      <>
                        <span>Pilih Sebagai Guru Mapel</span>
                        <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </div>
                </button>
              </div>

              {/* Aturan Pendaftaran & Immutability Notice */}
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-900 leading-relaxed flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Aturan Pendaftaran:</strong> Nama akun pendidik otomatis tersimpan sebagai <strong>{fullName}</strong>. Pilihan peran menentukan batas kapasitas ruang kerja Anda.
                </div>
              </div>

              {/* Opsi Ganti Akun Google */}
              <div className="pt-2 text-center">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleBackToLogin}
                  className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 font-semibold cursor-pointer disabled:opacity-50"
                  id="btn-google-change-account"
                >
                  <LogOut size={13} />
                  <span>Ganti akun Google atau keluar</span>
                </button>
              </div>
            </div>
          ) : (
            /* ========================================================================= */
            /* ALUR MANUAL: LANGKAH 1 (PILIH PERAN) ATAU LANGKAH 2 (FORM IDENTITAS)      */
            /* ========================================================================= */
            <>
              {step === 1 && (
                <div className="space-y-4">
                  {/* Pilihan Cepat dengan Google SSO */}
                  <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 text-left">
                      <div className="w-8 h-8 rounded-full bg-white border border-blue-200 flex items-center justify-center shrink-0 shadow-xs">
                        <svg className="w-4 h-4" viewBox="0 0 24 24">
                          <path
                            fill="#4285F4"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          />
                          <path
                            fill="#34A853"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          />
                          <path
                            fill="#FBBC05"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                          />
                          <path
                            fill="#EA4335"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                          />
                        </svg>
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-800">
                          Lebih Cepat dengan Akun Google
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Cukup pilih peran tanpa perlu mengisi formulir pendaftaran.
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => signInWithGoogle()}
                      className="w-full sm:w-auto px-4 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-xs font-bold text-slate-700 shadow-xs cursor-pointer shrink-0 transition-colors"
                      id="btn-onboarding-google-fast"
                    >
                      Masuk dengan Google
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    {/* KARTU 1: WALI KELAS */}
                    <button
                      type="button"
                      onClick={() => handleSelectRole('homeroom')}
                      className="group relative bg-white border-2 border-slate-200 hover:border-blue-600 hover:shadow-lg rounded-2xl p-4 sm:p-5 text-left transition-all duration-200 flex flex-col justify-between cursor-pointer active:scale-98 focus:outline-none focus:ring-4 focus:ring-blue-100 min-h-[160px]"
                      id="btn-onboarding-role-homeroom"
                    >
                      <div className="space-y-2.5 sm:space-y-3.5">
                        <div className="flex items-center justify-between">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors shrink-0">
                            <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6" />
                          </div>
                          <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                            Kapasitas: 1 Kelas
                          </span>
                        </div>
                        <div>
                          <h3 className="text-sm sm:text-base font-black uppercase tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">
                            1. WALI KELAS
                          </h3>
                          <p className="mt-1 text-xs text-slate-600 leading-relaxed font-normal">
                            Kapasitas 1 kelas (maks. 50 siswa). Data & visualisasi presensi khusus untuk rombel binaan.
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-600">
                        <span>Pilih Wali Kelas</span>
                        <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                      </div>
                    </button>

                    {/* KARTU 2: GURU MATA PELAJARAN */}
                    <button
                      type="button"
                      onClick={() => handleSelectRole('subject')}
                      className="group relative bg-white border-2 border-slate-200 hover:border-emerald-600 hover:shadow-lg rounded-2xl p-4 sm:p-5 text-left transition-all duration-200 flex flex-col justify-between cursor-pointer active:scale-98 focus:outline-none focus:ring-4 focus:ring-emerald-100 min-h-[160px]"
                      id="btn-onboarding-role-subject"
                    >
                      <div className="space-y-2.5 sm:space-y-3.5">
                        <div className="flex items-center justify-between">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors shrink-0">
                            <BookOpen className="w-5 h-5 sm:w-6 sm:h-6" />
                          </div>
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            Kapasitas: Maks. 6 Kelas
                          </span>
                        </div>
                        <div>
                          <h3 className="text-sm sm:text-base font-black uppercase tracking-tight text-slate-900 group-hover:text-emerald-600 transition-colors">
                            2. GURU MATA PELAJARAN
                          </h3>
                          <p className="mt-1 text-xs text-slate-600 leading-relaxed font-normal">
                            Kapasitas hingga 6 kelas berbeda (maks. 50 siswa/kelas). Akses data presensi untuk semua kelas ajar.
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-600">
                        <span>Pilih Guru Mapel</span>
                        <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                      </div>
                    </button>
                  </div>

                  {/* Aturan Pendaftaran Notice */}
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-900 leading-relaxed flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <strong>Aturan Pendaftaran:</strong> Peran kunci (Wali Kelas / Guru Mapel) yang dipilih saat pendaftaran bersifat <strong>permanen dan tidak dapat diubah lagi</strong> setelah akun dibuat.
                    </div>
                  </div>

                  {/* Footer Langkah 1 */}
                  <div className="pt-3 flex flex-wrap items-center justify-center gap-1.5 text-xs text-slate-500 text-center">
                    <span>Sudah memiliki akun?</span>
                    <button
                      type="button"
                      onClick={handleBackToLogin}
                      className="font-bold text-blue-700 hover:underline cursor-pointer"
                      id="btn-onboarding-login-link"
                    >
                      Masuk Sekarang
                    </button>
                  </div>
                </div>
              )}

              {/* LANGKAH 2: FORMULIR IDENTITAS & AKUN MANUAL */}
              {step === 2 && (
                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                  {/* Baris Navigasi Balik & Label Peran */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                    <button
                      type="button"
                      onClick={() => {
                        setStep(1);
                        setFormError('');
                      }}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer py-1"
                      id="btn-onboarding-back-to-step1"
                    >
                      <ArrowLeft size={16} />
                      <span>Ganti Pilihan Peran</span>
                    </button>

                    <span
                      className={`px-2.5 sm:px-3 py-1 rounded-full text-[10px] sm:text-[11px] font-black uppercase tracking-wider ${
                        selectedRole === 'homeroom'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}
                    >
                      {selectedRole === 'homeroom' ? 'Peran: Wali Kelas' : 'Peran: Guru Mata Pelajaran'}
                    </span>
                  </div>

                  {/* Error Alert Banner */}
                  {formError && (
                    <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5">
                      <AlertCircle size={16} className="shrink-0 mt-0.5" />
                      <span className="font-semibold">{formError}</span>
                    </div>
                  )}

                  {/* Formulir Akun */}
                  <div className="p-3.5 sm:p-5 rounded-2xl bg-blue-50/40 border border-blue-100/80 space-y-3.5">
                    <div className="flex items-center gap-2 text-blue-900 pb-2 border-b border-blue-100">
                      <ShieldCheck size={18} className="text-blue-600 shrink-0" />
                      <div>
                        <h4 className="font-black text-xs uppercase tracking-wider text-slate-900">
                          Identitas Akun & Masuk
                        </h4>
                        <p className="text-[11px] text-slate-500">
                          Gunakan informasi ini saat masuk ke dalam aplikasi presensi.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Nama Lengkap */}
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                          Nama Lengkap & Gelar: <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            required
                            value={fullName}
                            onChange={(e) => handleFullNameChange(e.target.value)}
                            placeholder="Contoh: Dra. Hj. Siti Rahmawati, M.Pd."
                            className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold text-slate-900 bg-white focus:border-blue-600 outline-none min-h-[44px]"
                            id="input-onboarding-fullname"
                          />
                        </div>
                      </div>

                      {/* Username */}
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                          Username (ID Login): <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={username}
                          onChange={(e) => {
                            setUsernameManuallyEdited(true);
                            setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9._-]/g, ''));
                          }}
                          placeholder="Contoh: sitirahmawati"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold text-slate-900 bg-white focus:border-blue-600 outline-none min-h-[44px]"
                          id="input-onboarding-username"
                        />
                        <p className="text-[10px] text-slate-500 mt-1">
                          Huruf kecil, angka, titik, atau strip.
                        </p>
                      </div>

                      {/* Email */}
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                          Email (Opsional):
                        </label>
                        <div className="relative">
                          <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="email@pribadi.com"
                            className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold text-slate-900 bg-white focus:border-blue-600 outline-none min-h-[44px]"
                            id="input-onboarding-email"
                          />
                        </div>
                        <p className="text-[10px] text-slate-500 mt-1">
                          Untuk pemulihan kata sandi.
                        </p>
                      </div>

                      {/* Kata Sandi */}
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                          Kata Sandi: <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <input
                            type={showPassword ? 'text' : 'password'}
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Minimal 6 karakter..."
                            className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold text-slate-900 bg-white focus:border-blue-600 outline-none min-h-[44px]"
                            id="input-onboarding-password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-1 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 w-9 h-9 flex items-center justify-center cursor-pointer"
                            aria-label="Tampilkan sandi"
                          >
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                      </div>

                      {/* Konfirmasi Kata Sandi */}
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                          Ulangi Kata Sandi: <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <input
                            type={showPassword ? 'text' : 'password'}
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Ketik ulang kata sandi..."
                            className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold text-slate-900 bg-white focus:border-blue-600 outline-none min-h-[44px]"
                            id="input-onboarding-confirm-password"
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
                      className="w-full py-3.5 sm:py-4 rounded-2xl bg-blue-700 hover:bg-blue-800 active:scale-98 text-white font-black text-xs sm:text-sm uppercase tracking-wider transition-all shadow-md shadow-blue-700/20 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer min-h-[48px]"
                      id="btn-submit-onboarding-registration"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 size={18} className="animate-spin" />
                          <span>Menyiapkan Ruang Kerja...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 size={18} />
                          <span>Daftar & Masuk ke Ruang Kerja</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </>
          )}

        </div>
      </div>

      {/* Footer Minimalist */}
      <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
        <KawacanaanEmblem size={16} />
        <span>Kawacanaan Presensi Digital Sekolah Dasar</span>
      </div>
    </div>
  );
};
