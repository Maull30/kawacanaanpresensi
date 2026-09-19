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

/* Vector SVG Illustration for Authentic Indonesian Ibu Guru (Wali Kelas) */
const IbuGuruAvatar: React.FC<{ className?: string }> = ({ 
  className = "w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 shrink-0" 
}) => (
  <div className={`relative flex items-center justify-center select-none pointer-events-none ${className}`}>
    {/* Soft aura glow behind avatar */}
    <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-100 via-sky-50 to-indigo-100/80 shadow-inner" />
    
    <svg viewBox="0 0 120 120" className="w-full h-full relative z-10 drop-shadow-sm overflow-visible">
      <defs>
        {/* Soft radial background */}
        <linearGradient id="bgIbu" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#dbeafe" />
          <stop offset="100%" stopColor="#bfdbfe" />
        </linearGradient>
        {/* Hijab gradient */}
        <linearGradient id="hijabGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="60%" stopColor="#0284c7" />
          <stop offset="100%" stopColor="#0369a1" />
        </linearGradient>
        {/* Blazer navy gradient */}
        <linearGradient id="blazerIbu" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#1e3a8a" />
          <stop offset="100%" stopColor="#0f172a" />
        </linearGradient>
      </defs>

      {/* Background circle badge */}
      <circle cx="60" cy="60" r="54" fill="url(#bgIbu)" />

      {/* Classroom chalkboard in backdrop with '1-A' & Golden Star */}
      <rect x="74" y="16" width="34" height="26" rx="3" fill="#0f172a" stroke="#d97706" strokeWidth="1.5" />
      <rect x="76" y="18" width="30" height="22" rx="2" fill="#1e293b" />
      <text x="80" y="29" fill="#38bdf8" fontSize="6" fontWeight="bold" fontFamily="sans-serif">KELAS 1</text>
      <path d="M96 26 L97.5 29.5 L101 30 L98.5 32.5 L99 36 L96 34 L93 36 L93.5 32.5 L91 30 L94.5 29.5 Z" fill="#fbbf24" />
      <line x1="78" y1="35" x2="89" y2="35" stroke="#ffffff" strokeWidth="1" strokeDasharray="2,1" />

      {/* Ibu Guru Body - Blazer & Shoulders */}
      <path d="M30 114 C30 92 42 86 60 86 C78 86 90 92 90 114 Z" fill="url(#blazerIbu)" />
      {/* Inner white shirt & collar */}
      <path d="M52 86 L60 102 L68 86 Z" fill="#ffffff" />
      <path d="M47 86 L56 102 L46 114 Z" fill="#1d4ed8" opacity="0.4" />
      <path d="M73 86 L64 102 L74 114 Z" fill="#1d4ed8" opacity="0.4" />

      {/* Official Lanyard Ribbon with Badge */}
      <path d="M55 86 L59 104 L61 104 L65 86" stroke="#ef4444" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <rect x="56" y="103" width="8" height="10" rx="1.5" fill="#ffffff" stroke="#94a3b8" strokeWidth="0.6" />
      <rect x="57" y="104.5" width="6" height="3" rx="0.5" fill="#0284c7" />
      <rect x="57.5" y="108.5" width="5" height="0.8" fill="#1e293b" />
      <rect x="57.5" y="110" width="3.5" height="0.6" fill="#64748b" />

      {/* Hijab Back Fold */}
      <path d="M36 50 C34 26 86 26 84 50 C84 68 80 88 60 88 C40 88 36 68 36 50 Z" fill="url(#hijabGrad)" />

      {/* Face & Neck */}
      <path d="M53 66 L53 76 C53 80 67 80 67 76 L67 66 Z" fill="#fed7aa" />
      <ellipse cx="60" cy="55" rx="15" ry="17" fill="#fed7aa" />

      {/* Hijab Inner Frame around Face (Rapi & Menutup Kepala) */}
      <path d="M45 52 C45 37 75 37 75 52 C75 67 73 75 60 75 C47 75 45 67 45 52 Z" fill="none" stroke="#0284c7" strokeWidth="3" />
      <path d="M43 46 C43 32 77 32 77 46 C77 60 76 72 60 72 C44 72 43 60 43 46 Z" fill="none" stroke="#38bdf8" strokeWidth="1.8" />
      {/* Little hijab brooch/pin */}
      <circle cx="60" cy="74" r="2" fill="#fbbf24" stroke="#d97706" strokeWidth="0.6" />

      {/* Friendly Ibu Guru Eyes */}
      {/* Left Eye */}
      <ellipse cx="53" cy="53" rx="2.5" ry="3" fill="#0f172a" />
      <circle cx="54" cy="52" r="1" fill="#ffffff" />
      <path d="M49 48 Q53 46 57 48" stroke="#334155" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      {/* Right Eye */}
      <ellipse cx="67" cy="53" rx="2.5" ry="3" fill="#0f172a" />
      <circle cx="68" cy="52" r="1" fill="#ffffff" />
      <path d="M63 48 Q67 46 71 48" stroke="#334155" strokeWidth="1.2" fill="none" strokeLinecap="round" />

      {/* Rosy Cheeks */}
      <ellipse cx="50" cy="58" rx="3" ry="1.5" fill="#f43f5e" opacity="0.3" />
      <ellipse cx="70" cy="58" rx="3" ry="1.5" fill="#f43f5e" opacity="0.3" />

      {/* Gentle Nose & Warm Motherly Smile */}
      <path d="M59 55 Q60 57 61 55" stroke="#f97316" strokeWidth="0.8" fill="none" strokeLinecap="round" />
      <path d="M55 62 Q60 67 65 62" stroke="#be123c" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <path d="M56 62.5 Q60 65 64 62.5" stroke="#ffffff" strokeWidth="1" fill="none" />

      {/* Hijab Drape over Chest */}
      <path d="M42 75 C42 88 52 94 60 94 C68 94 78 88 78 75 C70 82 50 82 42 75 Z" fill="url(#hijabGrad)" />

      {/* Attendance Clipboard held by Ibu Guru */}
      <g transform="translate(18, 72) rotate(-8)">
        {/* Board */}
        <rect x="0" y="0" width="22" height="30" rx="2.5" fill="#b45309" stroke="#78350f" strokeWidth="0.8" />
        {/* Paper Sheet */}
        <rect x="2" y="3" width="18" height="24" rx="1.5" fill="#ffffff" />
        {/* Clip at top */}
        <rect x="7" y="1" width="8" height="3" rx="1" fill="#94a3b8" />
        {/* Attendance checklist rows */}
        <line x1="5" y1="8" x2="11" y2="8" stroke="#cbd5e1" strokeWidth="1" />
        <path d="M14 8 L15.5 9.5 L18 7" stroke="#16a34a" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <line x1="5" y1="13" x2="11" y2="13" stroke="#cbd5e1" strokeWidth="1" />
        <path d="M14 13 L15.5 14.5 L18 12" stroke="#16a34a" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <line x1="5" y1="18" x2="11" y2="18" stroke="#cbd5e1" strokeWidth="1" />
        <path d="M14 18 L15.5 19.5 L18 17" stroke="#16a34a" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        {/* Red pen in hand */}
        <line x1="17" y1="20" x2="21" y2="28" stroke="#dc2626" strokeWidth="1.5" strokeLinecap="round" />
      </g>
      {/* Hand holding clipboard */}
      <circle cx="38" cy="93" r="4.5" fill="#fed7aa" />

      {/* Bottom label pill: IBU GURU */}
      <g transform="translate(32, 105)">
        <rect width="56" height="13" rx="6.5" fill="#0B2F64" stroke="#38bdf8" strokeWidth="1" />
        <text x="28" y="9" fill="#ffffff" fontSize="6.5" fontWeight="900" textAnchor="middle" letterSpacing="0.5" fontFamily="sans-serif">
          IBU GURU
        </text>
      </g>
    </svg>
  </div>
);

/* Vector SVG Illustration for Authentic Indonesian Bapak Guru (Guru Mapel) */
const BapakGuruAvatar: React.FC<{ className?: string }> = ({ 
  className = "w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 shrink-0" 
}) => (
  <div className={`relative flex items-center justify-center select-none pointer-events-none ${className}`}>
    {/* Soft aura glow behind avatar */}
    <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-emerald-100 via-teal-50 to-green-100/80 shadow-inner" />
    
    <svg viewBox="0 0 120 120" className="w-full h-full relative z-10 drop-shadow-sm overflow-visible">
      <defs>
        {/* Soft radial background */}
        <linearGradient id="bgBapak" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#d1fae5" />
          <stop offset="100%" stopColor="#a7f3d0" />
        </linearGradient>
        {/* Batik green pattern gradient */}
        <linearGradient id="batikGreen" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#047857" />
          <stop offset="50%" stopColor="#065f46" />
          <stop offset="100%" stopColor="#064e3b" />
        </linearGradient>
      </defs>

      {/* Background circle badge */}
      <circle cx="60" cy="60" r="54" fill="url(#bgBapak)" />

      {/* Classroom chalkboard in backdrop: Math / Lesson symbols */}
      <rect x="12" y="16" width="34" height="26" rx="3" fill="#064e3b" stroke="#78350f" strokeWidth="1.5" />
      <rect x="14" y="18" width="30" height="22" rx="2" fill="#022c22" />
      <text x="18" y="27" fill="#34d399" fontSize="6" fontWeight="bold" fontFamily="sans-serif">MAPEL</text>
      <text x="18" y="36" fill="#fef08a" fontSize="6" fontWeight="bold" fontFamily="sans-serif">1+2=3</text>
      {/* Mini sports ball indicator in background */}
      <circle cx="36" cy="33" r="3" fill="#ffffff" stroke="#0f172a" strokeWidth="0.6" />
      <path d="M34.5 33 L37.5 33 M36 31.5 L36 34.5" stroke="#0f172a" strokeWidth="0.5" />

      {/* Bapak Guru Body - Indonesian Batik Shirt */}
      <path d="M28 114 C28 90 42 84 60 84 C78 84 92 90 92 114 Z" fill="url(#batikGreen)" />

      {/* Traditional Batik Motifs on Shirt (Gold & Light Emerald Accents) */}
      <g stroke="#f59e0b" strokeWidth="1" fill="none" opacity="0.75">
        {/* Center line placket */}
        <line x1="60" y1="84" x2="60" y2="114" stroke="#fbbf24" strokeWidth="2.5" />
        {/* Stylized batik flowers/diamonds */}
        <path d="M45 92 L48 95 L45 98 L42 95 Z" fill="#fbbf24" opacity="0.6" />
        <path d="M75 92 L78 95 L75 98 L72 95 Z" fill="#fbbf24" opacity="0.6" />
        <path d="M38 104 L42 108 L38 112 L34 108 Z" fill="#fbbf24" opacity="0.6" />
        <path d="M82 104 L86 108 L82 112 L78 108 Z" fill="#fbbf24" opacity="0.6" />
        <path d="M50 106 L53 109 L50 112 L47 109 Z" fill="#34d399" opacity="0.8" />
        <path d="M70 106 L73 109 L70 112 L67 109 Z" fill="#34d399" opacity="0.8" />
      </g>

      {/* Shirt Collar with gold edge */}
      <path d="M48 84 L60 96 L72 84 L60 80 Z" fill="#064e3b" stroke="#fbbf24" strokeWidth="1" />
      {/* Inner white undershirt */}
      <polygon points="56,84 60,91 64,84" fill="#ffffff" />

      {/* Teacher Lanyard Badge with "MAPEL" */}
      <path d="M54 84 L58 102 L62 102 L66 84" stroke="#059669" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <rect x="56" y="101" width="8" height="11" rx="1.5" fill="#ffffff" stroke="#94a3b8" strokeWidth="0.6" />
      <rect x="57" y="102.5" width="6" height="3" rx="0.5" fill="#059669" />
      <rect x="57.5" y="106.5" width="5" height="0.8" fill="#1e293b" />
      <rect x="57.5" y="108" width="3.5" height="0.6" fill="#64748b" />

      {/* Neck */}
      <path d="M53 66 L53 76 C53 80 67 80 67 76 L67 66 Z" fill="#fed7aa" />

      {/* Head & Face */}
      <ellipse cx="60" cy="53" rx="15" ry="17" fill="#fed7aa" />

      {/* Neat Hair (Gaya Rambut Pendidik Indonesia) */}
      <path d="M44 50 C43 30 77 28 76 50 C76 42 74 36 60 36 C46 36 44 42 44 50 Z" fill="#0f172a" />
      <path d="M43 47 C48 38 60 38 68 41 C64 36 54 35 43 47 Z" fill="#1e293b" />

      {/* Eyebrows */}
      <path d="M48 44 Q53 42 57 44" stroke="#0f172a" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <path d="M63 44 Q67 42 72 44" stroke="#0f172a" strokeWidth="1.6" fill="none" strokeLinecap="round" />

      {/* Bapak Guru Glasses (Kacamata Pendidik Cerdas) */}
      <circle cx="53" cy="51" r="5.5" stroke="#1e293b" strokeWidth="1.4" fill="#ffffff" fillOpacity="0.2" />
      <circle cx="67" cy="51" r="5.5" stroke="#1e293b" strokeWidth="1.4" fill="#ffffff" fillOpacity="0.2" />
      <line x1="58.5" y1="51" x2="61.5" y2="51" stroke="#1e293b" strokeWidth="1.4" />
      <line x1="47.5" y1="51" x2="43" y2="48" stroke="#1e293b" strokeWidth="1.2" />
      <line x1="72.5" y1="51" x2="77" y2="48" stroke="#1e293b" strokeWidth="1.2" />

      {/* Friendly Eyes behind glasses */}
      <circle cx="53" cy="51" r="2.2" fill="#0f172a" />
      <circle cx="54" cy="50" r="0.8" fill="#ffffff" />
      <circle cx="67" cy="51" r="2.2" fill="#0f172a" />
      <circle cx="68" cy="50" r="0.8" fill="#ffffff" />

      {/* Nose */}
      <path d="M59 52 Q60 56 61 54" stroke="#ea580c" strokeWidth="1" fill="none" strokeLinecap="round" />

      {/* Neat Indonesian Teacher Mustache (Kumis Rapi Khas Bapak Guru) */}
      <path d="M54 59 Q60 57.5 66 59 Q60 58.5 54 59 Z" fill="#1e293b" />

      {/* Warm Smiling Mouth */}
      <path d="M55 61 Q60 66 65 61" stroke="#ea580c" strokeWidth="1.5" fill="none" strokeLinecap="round" />

      {/* Modul Ajar / Teacher Binder in Arm */}
      <g transform="translate(74, 74) rotate(12)">
        <rect x="0" y="0" width="22" height="28" rx="2" fill="#065f46" stroke="#047857" strokeWidth="0.8" />
        <rect x="2" y="2" width="18" height="24" rx="1" fill="#f8fafc" />
        <line x1="4" y1="7" x2="16" y2="7" stroke="#059669" strokeWidth="1.2" />
        <line x1="4" y1="12" x2="18" y2="12" stroke="#94a3b8" strokeWidth="0.8" />
        <line x1="4" y1="16" x2="15" y2="16" stroke="#94a3b8" strokeWidth="0.8" />
        <line x1="4" y1="20" x2="17" y2="20" stroke="#94a3b8" strokeWidth="0.8" />
        {/* Colorful index bookmark tabs */}
        <rect x="18" y="5" width="3" height="4" fill="#ef4444" rx="0.5" />
        <rect x="18" y="11" width="3" height="4" fill="#3b82f6" rx="0.5" />
        <rect x="18" y="17" width="3" height="4" fill="#eab308" rx="0.5" />
      </g>
      {/* Hand holding book */}
      <circle cx="82" cy="94" r="4.5" fill="#fed7aa" />

      {/* Bottom label pill: BAPAK GURU */}
      <g transform="translate(30, 105)">
        <rect width="60" height="13" rx="6.5" fill="#064e3b" stroke="#34d399" strokeWidth="1" />
        <text x="30" y="9" fill="#ffffff" fontSize="6.5" fontWeight="900" textAnchor="middle" letterSpacing="0.5" fontFamily="sans-serif">
          BAPAK GURU
        </text>
      </g>
    </svg>
  </div>
);

/* Vector SVG Illustration for Laptop + Phone + Checkmark Badge (Top Right) */
const DevicesIllustration: React.FC = () => (
  <div className="relative w-52 h-32 flex items-center justify-center select-none pointer-events-none">
    {/* Soft cloud backdrop aura */}
    <div className="absolute w-44 h-28 rounded-full bg-gradient-to-tr from-blue-50 via-sky-50 to-indigo-50/60 blur-xs" />
    
    {/* Plant Leaf behind laptop */}
    <svg className="absolute -right-1 bottom-4 w-10 h-16 text-emerald-400/80" viewBox="0 0 40 70" fill="currentColor">
      <path d="M20 70 C20 50 40 40 35 15 C30 30 15 35 20 70 Z" />
      <path d="M20 70 C20 40 0 30 5 5 C15 25 25 35 20 70 Z" opacity="0.75" />
    </svg>

    {/* Laptop Device */}
    <div className="relative z-10 w-36 h-24 bg-slate-800 rounded-lg p-1.5 shadow-md flex flex-col justify-between border border-slate-700">
      {/* Screen */}
      <div className="w-full h-16 bg-white rounded-md p-1.5 flex flex-col justify-between relative overflow-hidden">
        {/* Mock table bars */}
        <div className="w-12 h-1.5 bg-blue-100 rounded-full" />
        <div className="space-y-1 my-auto">
          <div className="w-full h-1 bg-slate-100 rounded-full" />
          <div className="w-4/5 h-1 bg-slate-100 rounded-full" />
          <div className="w-3/5 h-1.5 bg-blue-500/80 rounded-full" />
        </div>
        {/* Large Blue Checkmark on Laptop */}
        <div className="absolute right-2 bottom-2 w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-xs">
          <CheckCircle2 className="w-3.5 h-3.5" />
        </div>
      </div>
      {/* Base & Trackpad */}
      <div className="w-full h-2 bg-slate-700 rounded-b flex items-center justify-center">
        <div className="w-8 h-0.5 bg-slate-500 rounded-full" />
      </div>
    </div>

    {/* Smartphone Device overlapping */}
    <div className="absolute -left-1 bottom-1 z-20 w-11 h-20 bg-teal-800 rounded-xl p-1 shadow-lg border-2 border-white flex flex-col justify-between">
      <div className="w-3 h-0.5 bg-white/40 rounded-full mx-auto" />
      <div className="w-full h-13 bg-teal-700/80 rounded-lg flex items-center justify-center">
        <div className="w-5 h-5 rounded-md bg-teal-500 flex items-center justify-center text-white">
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
          </svg>
        </div>
      </div>
      <div className="w-2 h-2 rounded-full bg-white/30 mx-auto" />
    </div>
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 md:p-6 lg:p-8 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div className="relative w-full max-w-5xl bg-white rounded-2xl sm:rounded-3xl lg:rounded-4xl shadow-2xl border border-slate-200/90 overflow-hidden my-auto animate-in zoom-in-95 duration-200 flex flex-col max-h-[calc(100dvh-0.75rem)] sm:max-h-[92vh]">
        
        {/* ========================================================================= */}
        {/* TOP HEADER: Logo, Tagline, GRATIS UNTUK PENDIDIK & Stepper                 */}
        {/* ========================================================================= */}
        <div className="flex items-center justify-between px-4 sm:px-8 py-3.5 sm:py-5 border-b border-slate-100 bg-white shrink-0">
          {/* Brand / Logo */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
              <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-black text-slate-900 text-sm sm:text-lg tracking-tight">PresensiEdu</span>
                <span className="px-2 sm:px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-200/80 text-[9px] sm:text-[11px] font-bold uppercase tracking-wider">
                  GRATIS PENDIDIK
                </span>
              </div>
              <span className="text-[10px] sm:text-xs text-slate-400 font-medium">
                Mudah • Ramah Guru • Terpercaya
              </span>
            </div>
          </div>

          {/* Stepper & Close Button */}
          <div className="flex items-center gap-2.5 sm:gap-6">
            {/* Stepper indicator on Mobile (< sm) */}
            <div className="flex sm:hidden items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-[11px] font-bold text-slate-700">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
              <span>{step === 1 ? '1/2 Peran' : '2/2 Akun'}</span>
            </div>

            {/* Stepper on Tablet, Laptop, PC, Desktop (>= sm) */}
            <div className="hidden sm:flex items-center gap-2 text-xs">
              {/* 01 Pilih Peran */}
              <div className="flex items-center gap-1.5">
                <span className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full font-bold flex items-center justify-center text-[11px] sm:text-xs ${
                  step === 1 ? 'bg-blue-600 text-white shadow-xs' : 'bg-blue-100 text-blue-700'
                }`}>
                  {step > 1 ? '✓' : '01'}
                </span>
                <span className={`font-semibold ${step === 1 ? 'text-blue-600' : 'text-slate-600'}`}>
                  {lang === 'ID' ? 'Pilih Peran' : 'Role'}
                </span>
              </div>
              <div className="w-3 sm:w-5 h-[1.5px] bg-slate-200" />

              {/* 02 Buat Akun */}
              <div className="flex items-center gap-1.5">
                <span className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full font-bold flex items-center justify-center text-[11px] sm:text-xs ${
                  step === 2 ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-100 text-slate-400'
                }`}>
                  02
                </span>
                <span className={`font-semibold ${step === 2 ? 'text-blue-600' : 'text-slate-400'}`}>
                  {lang === 'ID' ? 'Buat Akun' : 'Account'}
                </span>
              </div>
              <div className="w-3 sm:w-5 h-[1.5px] bg-slate-200" />

              {/* 03 Selesai */}
              <div className="flex items-center gap-1.5">
                <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-slate-100 text-slate-400 font-bold flex items-center justify-center text-[11px] sm:text-xs">
                  03
                </span>
                <span className="font-semibold text-slate-400">
                  {lang === 'ID' ? 'Selesai' : 'Finish'}
                </span>
              </div>
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 sm:p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center"
              aria-label="Tutup"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Content Body */}
        <div className="p-4 sm:p-6 md:p-8 lg:p-9 overflow-y-auto flex-1">

          {/* ========================================================================= */}
          {/* LANGKAH 1: PILIH PERAN DENGAN ILUSTRASI IBU GURU & BAPAK GURU              */}
          {/* ========================================================================= */}
          {step === 1 && (
            <div>
              {/* Headline & Graphic Top Row */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6 mb-5 sm:mb-7">
                <div>
                  <h2 className="text-xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight leading-tight">
                    {lang === 'ID' ? 'Mulai dengan' : 'Start with'}{' '}
                    <span className="text-blue-600">{lang === 'ID' ? 'Presensi Digital' : 'Digital Attendance'}</span>
                  </h2>
                  <p className="mt-1 sm:mt-1.5 text-xs sm:text-sm text-slate-500 font-medium">
                    {lang === 'ID' 
                      ? 'Pilih peran Anda untuk mendapatkan fitur presensi yang disesuaikan khusus untuk pendidik.' 
                      : 'Select your role to access attendance tools tailored for educators.'}
                  </p>
                </div>

                {/* Right Callout Quote & Device Illustration (Visible on tablet & desktop) */}
                <div className="hidden md:flex items-center gap-3 lg:gap-4 shrink-0">
                  <div className="relative max-w-[170px] text-right">
                    <p className="text-xs text-slate-600 font-medium leading-relaxed">
                      {lang === 'ID' ? 'Satu aplikasi, untuk proses belajar yang lebih baik.' : 'One app, for an elevated teaching experience.'}
                    </p>
                  </div>
                  <DevicesIllustration />
                </div>
              </div>

              {/* Two Role Selection Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                
                {/* KARTU 1: WALI KELAS (IBU GURU - BLUE THEME) */}
                <div 
                  className="bg-white border-2 border-blue-300/90 hover:border-blue-600 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-7 relative flex flex-col justify-between shadow-xs hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-200 group"
                >
                  <div>
                    {/* Top Row: Left Info + Right Authentic Ibu Guru Avatar */}
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
                            <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                          </div>
                          <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[10px] sm:text-xs font-bold uppercase tracking-wider">
                            Ibu Guru
                          </span>
                        </div>

                        <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-2.5">
                          {lang === 'ID' ? 'Wali Kelas' : 'Homeroom Teacher'}
                        </h3>
                        <div className="text-xs sm:text-sm font-semibold text-blue-700 mt-0.5">
                          {lang === 'ID' ? 'Presensi Kelas Harian SD' : 'Class Attendance & Recap'}
                        </div>
                      </div>

                      {/* Authentic Ibu Guru Illustration */}
                      <IbuGuruAvatar className="w-20 h-20 xs:w-24 xs:h-24 sm:w-28 sm:h-28 md:w-28 md:h-28 lg:w-32 lg:h-32 shrink-0" />
                    </div>

                    {/* Description */}
                    <p className="text-xs sm:text-sm text-slate-600 mt-3 leading-relaxed">
                      {lang === 'ID'
                        ? 'Kelola kehadiran seluruh siswa dalam satu kelas dengan mudah, cetak rekap kedinasan, dan hitung hari efektif otomatis.'
                        : 'Manage daily attendance for your classroom students seamlessly, export official reports, and track learning days.'}
                    </p>

                    {/* Feature Badges */}
                    <div className="mt-3.5 flex flex-wrap gap-1.5 sm:gap-2">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50/90 border border-blue-200/80 text-blue-700 text-[11px] sm:text-xs font-semibold">
                        <Users className="w-3 h-3 shrink-0" />
                        <span>{lang === 'ID' ? 'Hingga 50 siswa' : 'Up to 50 students'}</span>
                      </span>
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50/90 border border-blue-200/80 text-blue-700 text-[11px] sm:text-xs font-semibold">
                        <span>📋 {lang === 'ID' ? 'Format Kedinasan' : 'Official Report'}</span>
                      </span>
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50/90 border border-blue-200/80 text-blue-700 text-[11px] sm:text-xs font-semibold">
                        <span>⚡ {lang === 'ID' ? 'Hari Efektif Otomatis' : 'Auto School Days'}</span>
                      </span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <button
                    type="button"
                    onClick={() => handleSelectRole('homeroom')}
                    id="btn-choose-homeroom"
                    className="mt-5 sm:mt-6 w-full bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-bold py-3 sm:py-3.5 px-4 rounded-xl sm:rounded-2xl flex items-center justify-center gap-2 shadow-md shadow-blue-600/20 transition-all cursor-pointer text-xs sm:text-sm min-h-[46px]"
                  >
                    <span>{lang === 'ID' ? 'Pilih Wali Kelas (Ibu Guru)' : 'Select Homeroom (Ibu Guru)'}</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>

                {/* KARTU 2: GURU MAPEL (BAPAK GURU - EMERALD/GREEN THEME) */}
                <div 
                  className="bg-white border-2 border-emerald-300/90 hover:border-emerald-600 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-7 relative flex flex-col justify-between shadow-xs hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-200 group"
                >
                  <div>
                    {/* Top Row: Left Info + Right Authentic Bapak Guru Avatar */}
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-[#059669] text-white flex items-center justify-center shadow-md shadow-emerald-600/20 shrink-0">
                            <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
                          </div>
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] sm:text-xs font-bold uppercase tracking-wider">
                            Bapak Guru
                          </span>
                        </div>

                        <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-2.5">
                          {lang === 'ID' ? 'Guru Mapel' : 'Subject Teacher'}
                        </h3>
                        <div className="text-xs sm:text-sm font-semibold text-emerald-700 mt-0.5">
                          {lang === 'ID' ? 'Presensi Mata Pelajaran SD' : 'Subject Attendance & Journal'}
                        </div>
                      </div>

                      {/* Authentic Bapak Guru Illustration */}
                      <BapakGuruAvatar className="w-20 h-20 xs:w-24 xs:h-24 sm:w-28 sm:h-28 md:w-28 md:h-28 lg:w-32 lg:h-32 shrink-0" />
                    </div>

                    {/* Description */}
                    <p className="text-xs sm:text-sm text-slate-600 mt-3 leading-relaxed">
                      {lang === 'ID'
                        ? 'Catat kehadiran siswa berdasarkan jam pelajaran (PJOK, PAI, dll), kelola banyak rombel kelas, dan buat jurnal mengajar.'
                        : 'Record attendance by teaching periods, manage multiple student classrooms, and track teaching journals.'}
                    </p>

                    {/* Feature Badges */}
                    <div className="mt-3.5 flex flex-wrap gap-1.5 sm:gap-2">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50/90 border border-emerald-200/80 text-emerald-700 text-[11px] sm:text-xs font-semibold">
                        <GraduationCap className="w-3 h-3 shrink-0" />
                        <span>{lang === 'ID' ? 'Hingga 6 rombel kelas' : 'Up to 6 classes'}</span>
                      </span>
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50/90 border border-emerald-200/80 text-emerald-700 text-[11px] sm:text-xs font-semibold">
                        <span>⏱️ {lang === 'ID' ? 'Jadwal Jam Mengajar' : 'Teaching Periods'}</span>
                      </span>
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50/90 border border-emerald-200/80 text-emerald-700 text-[11px] sm:text-xs font-semibold">
                        <span>📖 {lang === 'ID' ? 'Jurnal Pembelajaran' : 'Teaching Journal'}</span>
                      </span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <button
                    type="button"
                    onClick={() => handleSelectRole('subject')}
                    id="btn-choose-subject"
                    className="mt-5 sm:mt-6 w-full bg-[#0D6B4F] hover:bg-[#09533D] active:scale-[0.99] text-white font-bold py-3 sm:py-3.5 px-4 rounded-xl sm:rounded-2xl flex items-center justify-center gap-2 shadow-md shadow-emerald-800/20 transition-all cursor-pointer text-xs sm:text-sm min-h-[46px]"
                  >
                    <span>{lang === 'ID' ? 'Pilih Guru Mapel (Bapak Guru)' : 'Select Subject (Bapak Guru)'}</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>

              </div>

              {/* Bottom Trust & Login Footer */}
              <div className="mt-6 sm:mt-8 pt-4 sm:pt-5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 sm:gap-4">
                  <div className="flex items-center gap-1.5 font-medium">
                    <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>{lang === 'ID' ? 'Data presensi tersimpan aman di perangkat Anda' : 'Your data is securely stored'}</span>
                  </div>
                  <span className="hidden sm:inline text-slate-300">|</span>
                  <div className="flex items-center gap-1.5 font-medium">
                    <CreditCard className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>{lang === 'ID' ? 'Tanpa kartu kredit' : 'No credit card required'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1 font-medium">
                  <span>{lang === 'ID' ? 'Sudah memiliki akun?' : 'Already have an account?'}</span>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenLogin();
                    }}
                    className="font-bold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer inline-flex items-center gap-1 min-h-[36px] py-1"
                  >
                    <span>{lang === 'ID' ? 'Masuk ke akun' : 'Sign in'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* LANGKAH 2: FORMULIR BUAT AKUN (STEP 02)                                  */}
          {/* ========================================================================= */}
          {step === 2 && (
            <div className="max-w-xl mx-auto">
              {/* Back to Step 1 & Selected Role Banner */}
              <div className="flex items-center justify-between gap-3 pb-3 mb-4 border-b border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setFormError('');
                  }}
                  className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors cursor-pointer py-1.5"
                  id="btn-back-to-step1"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>{lang === 'ID' ? 'Ganti Peran' : 'Change Role'}</span>
                </button>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 font-medium hidden xs:inline">
                    {lang === 'ID' ? 'Peran Terpilih:' : 'Selected Role:'}
                  </span>
                  {selectedRole === 'homeroom' ? (
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold shadow-2xs">
                      <IbuGuruAvatar className="w-5 h-5 shrink-0" />
                      <span>{lang === 'ID' ? 'Wali Kelas (Ibu Guru)' : 'Homeroom Teacher'}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold shadow-2xs">
                      <BapakGuruAvatar className="w-5 h-5 shrink-0" />
                      <span>{lang === 'ID' ? 'Guru Mapel (Bapak Guru)' : 'Subject Teacher'}</span>
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
