import React, { useState } from 'react';
import {
  GraduationCap,
  BookOpen,
  Users,
  CreditCard,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  X,
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

/* Professional Vector Illustration for Homeroom Teacher / Wali Kelas */
const HomeroomGraphic: React.FC<{ className?: string }> = ({ className = "w-14 h-14 shrink-0" }) => (
  <div className={`relative flex items-center justify-center select-none ${className}`}>
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-xs">
      <defs>
        <linearGradient id="hrGrad" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#2563EB" />
          <stop offset="100%" stopColor="#1D4ED8" />
        </linearGradient>
        <linearGradient id="hrCard" x1="0" y1="0" x2="0" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#F8FAFC" />
        </linearGradient>
      </defs>

      {/* Rounded squircle background */}
      <rect width="64" height="64" rx="14" fill="url(#hrGrad)" />

      {/* Modern Attendance Roster Card */}
      <g transform="translate(11, 10)">
        {/* Roster sheet */}
        <rect width="42" height="44" rx="5" fill="url(#hrCard)" stroke="#DBEAFE" strokeWidth="0.8" />
        
        {/* Header bar */}
        <rect x="5" y="5" width="18" height="3" rx="1.5" fill="#1E3A8A" />
        <circle cx="36" cy="6.5" r="2" fill="#10B981" />
        <line x1="5" y1="11" x2="37" y2="11" stroke="#E2E8F0" strokeWidth="0.8" />

        {/* Row 1: Student item with Hadir checkmark */}
        <circle cx="8" cy="17" r="2.2" fill="#93C5FD" />
        <rect x="13" y="15.5" width="14" height="3" rx="1.5" fill="#64748B" />
        <rect x="30" y="14.5" width="7" height="5" rx="2" fill="#DCFCE7" />
        <path d="M31.8 17 L33 18.2 L35.2 16" stroke="#16A34A" strokeWidth="0.9" strokeLinecap="round" strokeLinejoin="round" />

        {/* Row 2: Student item with Sakit badge */}
        <circle cx="8" cy="25" r="2.2" fill="#CBD5E1" />
        <rect x="13" y="23.5" width="12" height="3" rx="1.5" fill="#94A3B8" />
        <rect x="30" y="22.5" width="7" height="5" rx="2" fill="#FEF3C7" />
        <circle cx="33.5" cy="25" r="1" fill="#D97706" />

        {/* Row 3: Student item with Izin badge */}
        <circle cx="8" cy="33" r="2.2" fill="#93C5FD" />
        <rect x="13" y="31.5" width="15" height="3" rx="1.5" fill="#64748B" />
        <rect x="30" y="30.5" width="7" height="5" rx="2" fill="#E0F2FE" />
        <circle cx="33.5" cy="33" r="1" fill="#0284C7" />
      </g>

      {/* Verified Seal Badge */}
      <circle cx="51" cy="49" r="8.5" fill="#FFFFFF" />
      <circle cx="51" cy="49" r="7" fill="#1D4ED8" />
      <path d="M48.2 49 L49.9 50.7 L53.8 46.8" stroke="#FFFFFF" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </div>
);

/* Professional Vector Illustration for Subject Teacher / Guru Mapel */
const SubjectGraphic: React.FC<{ className?: string }> = ({ className = "w-14 h-14 shrink-0" }) => (
  <div className={`relative flex items-center justify-center select-none ${className}`}>
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-xs">
      <defs>
        <linearGradient id="subGrad" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#059669" />
          <stop offset="100%" stopColor="#047857" />
        </linearGradient>
        <linearGradient id="subCard" x1="0" y1="0" x2="0" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#F8FAFC" />
        </linearGradient>
      </defs>

      {/* Rounded squircle background */}
      <rect width="64" height="64" rx="14" fill="url(#subGrad)" />

      {/* Digital Teaching Schedule Matrix */}
      <g transform="translate(11, 10)">
        {/* Schedule card */}
        <rect width="42" height="44" rx="5" fill="url(#subCard)" stroke="#A7F3D0" strokeWidth="0.8" />

        {/* Header bar: Timetable title & active indicator */}
        <rect x="5" y="5" width="16" height="3" rx="1.5" fill="#064E3B" />
        <rect x="29" y="4.5" width="8" height="4" rx="1.5" fill="#10B981" />
        <line x1="5" y1="11" x2="37" y2="11" stroke="#E2E8F0" strokeWidth="0.8" />

        {/* Period 1: Class 4A */}
        <g transform="translate(5, 14)">
          <rect width="32" height="6.5" rx="2" fill="#ECFDF5" stroke="#A7F3D0" strokeWidth="0.6" />
          <rect x="2" y="1.8" width="2" height="3" rx="1" fill="#059669" />
          <rect x="6" y="2" width="13" height="2.5" rx="1.2" fill="#065F46" />
          <circle cx="28" cy="3.2" r="1.3" fill="#10B981" />
        </g>

        {/* Period 2: Class 5B */}
        <g transform="translate(5, 23)">
          <rect width="32" height="6.5" rx="2" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="0.6" />
          <rect x="2" y="1.8" width="2" height="3" rx="1" fill="#64748B" />
          <rect x="6" y="2" width="16" height="2.5" rx="1.2" fill="#475569" />
          <circle cx="28" cy="3.2" r="1.3" fill="#94A3B8" />
        </g>

        {/* Period 3: Class 6A */}
        <g transform="translate(5, 32)">
          <rect width="32" height="6.5" rx="2" fill="#ECFDF5" stroke="#A7F3D0" strokeWidth="0.6" />
          <rect x="2" y="1.8" width="2" height="3" rx="1" fill="#059669" />
          <rect x="6" y="2" width="11" height="2.5" rx="1.2" fill="#065F46" />
          <circle cx="28" cy="3.2" r="1.3" fill="#10B981" />
        </g>
      </g>

      {/* Floating Clock Period Badge */}
      <circle cx="51" cy="49" r="8.5" fill="#FFFFFF" />
      <circle cx="51" cy="49" r="7" fill="#047857" />
      <circle cx="51" cy="49" r="0.9" fill="#FFFFFF" />
      <line x1="51" y1="49" x2="51" y2="45.5" stroke="#FFFFFF" strokeWidth="1.1" strokeLinecap="round" />
      <line x1="51" y1="49" x2="53.8" y2="49" stroke="#FFFFFF" strokeWidth="1.1" strokeLinecap="round" />
    </svg>
  </div>
);

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

  // Form Fields
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

      if (!res.ok || (!data.ok && !data.success)) {
        throw new Error(data.error || (lang === 'ID' ? 'Pendaftaran gagal. Silakan coba lagi.' : 'Registration failed.'));
      }

      // Bersihkan cache lama
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

      // Login otomatis
      const loginResult = await loginWithCredentials(cleanUsername, password);
      if (!loginResult.success) {
        const retryEmailResult = await loginWithCredentials(cleanEmail, password);
        if (!retryEmailResult.success) {
          throw new Error(loginResult.error || (lang === 'ID' ? 'Akun berhasil dibuat. Silakan login.' : 'Account created. Please log in.'));
        }
      }

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden my-auto animate-in zoom-in-95 duration-200 flex flex-col max-h-[calc(100dvh-1rem)] sm:max-h-[90vh]">
        
        {/* ========================================================================= */}
        {/* TOP HEADER: Minimalist Logo, Badge & Stepper                              */}
        {/* ========================================================================= */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-3.5 border-b border-slate-100 bg-white shrink-0">
          {/* Brand / Logo */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs shrink-0">
              <GraduationCap className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-sm sm:text-base tracking-tight">PresensiEdu</span>
              <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-600 border border-blue-200/70 text-[10px] font-bold uppercase tracking-wider">
                GRATIS
              </span>
            </div>
          </div>

          {/* Stepper & Close Button */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Stepper indicator */}
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              <span className={`w-5 h-5 rounded-full font-bold flex items-center justify-center text-[10px] ${
                step === 1 ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-700'
              }`}>
                {step > 1 ? '✓' : '1'}
              </span>
              <span className={`hidden sm:inline font-semibold ${step === 1 ? 'text-blue-600' : 'text-slate-600'}`}>
                {lang === 'ID' ? 'Peran' : 'Role'}
              </span>
              <span className="text-slate-300">/</span>
              <span className={`w-5 h-5 rounded-full font-bold flex items-center justify-center text-[10px] ${
                step === 2 ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'
              }`}>
                2
              </span>
              <span className={`hidden sm:inline font-semibold ${step === 2 ? 'text-blue-600' : 'text-slate-400'}`}>
                {lang === 'ID' ? 'Akun' : 'Account'}
              </span>
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors cursor-pointer min-w-[32px] min-h-[32px] flex items-center justify-center"
              aria-label="Tutup"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Content Body */}
        <div className="p-4 sm:p-5 md:p-6 overflow-y-auto flex-1">

          {/* ========================================================================= */}
          {/* LANGKAH 1: PILIH PERAN MINIMALIS                                          */}
          {/* ========================================================================= */}
          {step === 1 && (
            <div>
              {/* Minimalist Heading */}
              <div className="mb-4 sm:mb-5">
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                  {lang === 'ID' ? 'Pilih Peran Pendidik' : 'Select Your Educator Role'}
                </h2>
                <p className="mt-0.5 text-xs text-slate-500">
                  {lang === 'ID' 
                    ? 'Pilih modul presensi yang sesuai dengan tugas mengajar Anda di sekolah.' 
                    : 'Choose the attendance module that fits your teaching assignment.'}
                </p>
              </div>

              {/* Two Role Selection Cards - Minimalist & Compact */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                
                {/* KARTU 1: WALI KELAS */}
                <div 
                  className="bg-white border border-slate-200 hover:border-blue-500 rounded-xl sm:rounded-2xl p-4 relative flex flex-col justify-between shadow-2xs hover:shadow-md transition-all duration-150 group"
                >
                  <div>
                    {/* Top Row: Info & Professional Graphic */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-2">
                          <Users className="w-4 h-4" />
                        </div>
                        <h3 className="text-base font-bold text-slate-900 tracking-tight">
                          {lang === 'ID' ? 'Wali Kelas' : 'Homeroom Teacher'}
                        </h3>
                        <p className="text-[11px] font-semibold text-blue-600 mt-0.5">
                          {lang === 'ID' ? 'Presensi Harian Kelas SD' : 'Class Attendance & Recap'}
                        </p>
                      </div>

                      {/* Professional Graphic */}
                      <HomeroomGraphic className="w-12 h-12 shrink-0" />
                    </div>

                    {/* Brief Description */}
                    <p className="text-xs text-slate-600 mt-2.5 leading-relaxed">
                      {lang === 'ID'
                        ? 'Kelola presensi seluruh siswa satu kelas, rekap bulanan otomatis, dan cetak format kedinasan.'
                        : 'Manage daily attendance for your classroom students, monthly recaps, and official reports.'}
                    </p>

                    {/* Feature Badges */}
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200/80 text-slate-600 text-[10px] font-medium">
                        {lang === 'ID' ? 'Format Kedinasan' : 'Official Report'}
                      </span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200/80 text-slate-600 text-[10px] font-medium">
                        {lang === 'ID' ? 'Hari Efektif Otomatis' : 'Auto School Days'}
                      </span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <button
                    type="button"
                    onClick={() => handleSelectRole('homeroom')}
                    id="btn-choose-homeroom"
                    className="mt-4 w-full bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-semibold py-2.5 px-3.5 rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer text-xs min-h-[40px]"
                  >
                    <span>{lang === 'ID' ? 'Pilih Wali Kelas' : 'Select Homeroom'}</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>

                {/* KARTU 2: GURU MAPEL */}
                <div 
                  className="bg-white border border-slate-200 hover:border-emerald-500 rounded-xl sm:rounded-2xl p-4 relative flex flex-col justify-between shadow-2xs hover:shadow-md transition-all duration-150 group"
                >
                  <div>
                    {/* Top Row: Info & Professional Graphic */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
                          <BookOpen className="w-4 h-4" />
                        </div>
                        <h3 className="text-base font-bold text-slate-900 tracking-tight">
                          {lang === 'ID' ? 'Guru Mapel' : 'Subject Teacher'}
                        </h3>
                        <p className="text-[11px] font-semibold text-emerald-600 mt-0.5">
                          {lang === 'ID' ? 'Presensi Mata Pelajaran SD' : 'Subject Attendance & Journal'}
                        </p>
                      </div>

                      {/* Professional Graphic */}
                      <SubjectGraphic className="w-12 h-12 shrink-0" />
                    </div>

                    {/* Brief Description */}
                    <p className="text-xs text-slate-600 mt-2.5 leading-relaxed">
                      {lang === 'ID'
                        ? 'Catat kehadiran per jam pelajaran (PJOK, PAI, dll), kelola multi-rombel, dan jurnal mengajar.'
                        : 'Record attendance by subject periods, manage multiple classroom groups, and teaching journals.'}
                    </p>

                    {/* Feature Badges */}
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200/80 text-slate-600 text-[10px] font-medium">
                        {lang === 'ID' ? 'Jadwal Jam Mengajar' : 'Teaching Periods'}
                      </span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200/80 text-slate-600 text-[10px] font-medium">
                        {lang === 'ID' ? 'Jurnal Pembelajaran' : 'Teaching Journal'}
                      </span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <button
                    type="button"
                    onClick={() => handleSelectRole('subject')}
                    id="btn-choose-subject"
                    className="mt-4 w-full bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-semibold py-2.5 px-3.5 rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer text-xs min-h-[40px]"
                  >
                    <span>{lang === 'ID' ? 'Pilih Guru Mapel' : 'Select Subject'}</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>

              </div>

              {/* Minimalist Bottom Footer */}
              <div className="mt-5 pt-3.5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs text-slate-500">
                <div className="flex items-center gap-2 font-medium text-[11px]">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>{lang === 'ID' ? 'Data tersimpan aman & tanpa kartu kredit' : 'Secure data storage & no credit card required'}</span>
                </div>

                <div className="flex items-center gap-1 font-medium text-[11px]">
                  <span>{lang === 'ID' ? 'Sudah punya akun?' : 'Have an account?'}</span>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenLogin();
                    }}
                    className="font-bold text-blue-600 hover:underline cursor-pointer inline-flex items-center gap-0.5 py-0.5"
                  >
                    <span>{lang === 'ID' ? 'Masuk' : 'Sign in'}</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* LANGKAH 2: FORMULIR BUAT AKUN (STEP 02)                                  */}
          {/* ========================================================================= */}
          {step === 2 && (
            <div className="max-w-lg mx-auto">
              {/* Back to Step 1 & Selected Role Banner */}
              <div className="flex items-center justify-between gap-3 pb-3 mb-3.5 border-b border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setFormError('');
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-blue-600 transition-colors cursor-pointer py-1"
                  id="btn-back-to-step1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>{lang === 'ID' ? 'Ganti Peran' : 'Change Role'}</span>
                </button>

                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-slate-500 font-medium hidden xs:inline">
                    {lang === 'ID' ? 'Peran:' : 'Role:'}
                  </span>
                  {selectedRole === 'homeroom' ? (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold">
                      <HomeroomGraphic className="w-4 h-4 shrink-0" />
                      <span>{lang === 'ID' ? 'Wali Kelas' : 'Homeroom Teacher'}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
                      <SubjectGraphic className="w-4 h-4 shrink-0" />
                      <span>{lang === 'ID' ? 'Guru Mapel' : 'Subject Teacher'}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Title Header */}
              <div className="mb-5">
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  {lang === 'ID' ? 'Buat Akun Pendidik Anda' : 'Create Your Educator Account'}
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  {lang === 'ID'
                    ? 'Lengkapi data akun untuk langsung mengakses Ruang Kerja digital gratis.'
                    : 'Fill in your details to immediately access your free digital workspace.'}
                </p>
              </div>

              {/* Error Alert Banner */}
              {formError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm flex items-start gap-2 mb-4">
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  <span className="font-semibold leading-tight">{formError}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-3.5">
                {/* Nama Lengkap */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Nama Lengkap <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => handleFullNameChange(e.target.value)}
                      placeholder="Contoh: Dra. Sri Wahyuni, M.Pd"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-medium text-slate-900 bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 outline-none transition-all h-11"
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
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-mono font-medium text-slate-900 bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 outline-none transition-all h-11"
                      id="input-free-username"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Email (Opsional)
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="nama@sekolah.sch.id"
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-medium text-slate-900 bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 outline-none transition-all h-11"
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
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Min. 6 karakter"
                        className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-medium text-slate-900 bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 outline-none transition-all h-11"
                        id="input-free-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 w-7 h-7 flex items-center justify-center cursor-pointer"
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
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Ketik ulang sandi"
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-medium text-slate-900 bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 outline-none transition-all h-11"
                        id="input-free-confirm-password"
                      />
                    </div>
                  </div>
                </div>

                {/* Tombol Simpan & Masuk */}
                <div className="pt-3">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 px-5 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-bold text-xs sm:text-sm uppercase tracking-wider transition-all shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer min-h-[46px]"
                    id="btn-submit-free-registration"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>{lang === 'ID' ? 'Menyiapkan Ruang Kerja...' : 'Setting up Workspace...'}</span>
                      </>
                    ) : (
                      <>
                        <span>
                          {lang === 'ID'
                            ? 'Selesaikan Pendaftaran & Masuk'
                            : 'Complete Registration & Enter'}
                        </span>
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
