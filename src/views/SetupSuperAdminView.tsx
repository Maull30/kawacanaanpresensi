import React, { useState, useEffect } from 'react';
import { ShieldCheck, Loader2, CheckCircle2, AlertCircle, ArrowRight, Lock } from 'lucide-react';
import { KawacanaanEmblem } from '../components/KawacanaanEmblem';

export const SetupSuperAdminView: React.FC = () => {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secret, setSecret] = useState('');
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [isAlreadySetup, setIsAlreadySetup] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [newPasswordInput, setNewPasswordInput] = useState('SuperAdmin2026!');
  const [activeUsername, setActiveUsername] = useState('superadmin');
  const [activeEmail, setActiveEmail] = useState('superadmin@login.edushift.local');
  const [showResetForm, setShowResetForm] = useState(false);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const r = await fetch('/api/setup-superadmin');
        const b = await r.json();
        if (isMounted) {
          if (b.isSetup) {
            setIsAlreadySetup(true);
            if (b.username) setActiveUsername(b.username);
            if (b.email) setActiveEmail(b.email);
          }
        }
      } catch (_) {
        // Ignore check errors
      } finally {
        if (isMounted) setChecking(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const r = await fetch('/api/setup-superadmin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reset_superadmin_password',
          newPassword: newPasswordInput,
        }),
      });
      const b = await r.json();
      if (!r.ok) throw new Error(b.error || 'Gagal mereset kata sandi Super Admin.');
      setSuccess(`Kata sandi Super Admin (${b.username}) berhasil diperbarui! Silakan gunakan kata sandi ini untuk login.`);
    } catch (err: any) {
      setError(err?.message || 'Gagal memproses pembaruan kata sandi.');
    } finally {
      setLoading(false);
    }
  };

  const goToLogin = () => {
    try {
      const cleanUrl = new URL(window.location.href);
      cleanUrl.searchParams.set('page', 'login');
      window.location.href = cleanUrl.toString();
    } catch (_) {
      window.location.search = '?page=login';
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const r = await fetch('/api/setup-superadmin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          username,
          email,
          password,
          setupSecret: secret || undefined,
        }),
      });
      const b = await r.json();
      if (!r.ok) throw new Error(b.error || 'Setup gagal.');
      setSuccess(b.message || 'Super Admin berhasil dibuat.');
      setPassword('');
      setIsAlreadySetup(true);
    } catch (e: any) {
      setError(e.message || 'Setup gagal.');
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-5">
        <div className="flex flex-col items-center gap-3 text-white">
          <Loader2 className="animate-spin text-indigo-400" size={32} />
          <p className="text-sm font-medium text-slate-400">Memeriksa status sistem...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-5">
      <div className="w-full max-w-lg bg-white rounded-3xl p-7 sm:p-9 shadow-2xl border border-slate-800/10">
        <div className="flex flex-col items-center text-center">
          <KawacanaanEmblem size={68} />
          <h1 className="mt-4 text-2xl font-black text-slate-900 tracking-tight">
            {isAlreadySetup && !success ? 'Setup Super Admin Terkunci' : 'Setup Super Admin Pertama'}
          </h1>
          <p className="mt-2 text-sm text-slate-500 max-w-md">
            {isAlreadySetup && !success
              ? 'Akun Super Admin untuk platform ini sudah dibuat dan endpoint setup telah dikunci secara otomatis demi keamanan.'
              : 'Inisialisasi akun Super Admin (Platform Owner) untuk mengelola multi-tenant sekolah, lisensi, dan sistem global.'}
          </p>
        </div>

        {error && (
          <div className="mt-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span className="font-semibold">{error}</span>
          </div>
        )}

        {success && (
          <div className="mt-5 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex flex-col gap-3">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
              <span className="font-bold text-sm leading-relaxed">{success}</span>
            </div>
            <button
              type="button"
              onClick={goToLogin}
              className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
            >
              <span>Lanjut ke Halaman Login</span>
              <ArrowRight size={15} />
            </button>
          </div>
        )}

        {isAlreadySetup && !success ? (
          <div className="mt-6 space-y-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 shrink-0">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Akun Super Admin Aktif</h4>
                  <p className="text-[11px] text-slate-500">Username: <span className="font-mono font-bold text-indigo-600">{activeUsername}</span></p>
                  <p className="text-[11px] text-slate-500">Email: <span className="font-mono text-slate-700">{activeEmail}</span></p>
                </div>
              </div>
              <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Kata Sandi Default:</span>
                <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200">SuperAdmin2026!</span>
              </div>
            </div>

            <div className="flex flex-col gap-2.5">
              <button
                type="button"
                onClick={goToLogin}
                className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
              >
                <span>Buka Halaman Login</span>
                <ArrowRight size={16} />
              </button>

              <button
                type="button"
                onClick={() => setShowResetForm(!showResetForm)}
                className="w-full py-2.5 rounded-2xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Lock size={14} />
                <span>{showResetForm ? 'Sembunyikan Form Reset' : 'Ubah / Reset Kata Sandi Super Admin'}</span>
              </button>
            </div>

            {showResetForm && (
              <form onSubmit={handleResetPassword} className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 space-y-3 mt-2">
                <h5 className="text-xs font-bold text-indigo-900">Tetapkan Kata Sandi Baru Super Admin:</h5>
                <input
                  type="text"
                  required
                  value={newPasswordInput}
                  onChange={(e) => setNewPasswordInput(e.target.value)}
                  placeholder="Masukkan kata sandi baru (min 8 karakter)"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-60"
                >
                  {loading ? <Loader2 size={14} className="animate-spin" /> : <ShieldCheck size={14} />}
                  <span>Perbarui Kata Sandi Sekarang</span>
                </button>
              </form>
            )}
          </div>
        ) : !success ? (
          <form onSubmit={submit} className="mt-6 space-y-3.5">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5 ml-1">
                Nama Lengkap Super Admin
              </label>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Administrator Utama"
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-slate-900"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5 ml-1">
                Username Akun
              </label>
              <input
                required
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9._-]/g, ''))}
                placeholder="Contoh: superadmin"
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-slate-900"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5 ml-1">
                Email Google / Resmi <span className="text-slate-400 font-normal">(Disarankan)</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Contoh: emailAnda@gmail.com"
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-slate-900"
              />
              <p className="mt-1 text-[10px] text-slate-400 ml-1">
                Masukkan email Google Anda agar dapat login dengan tombol "Lanjutkan dengan Google".
              </p>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5 ml-1">
                Kata Sandi <span className="text-rose-500 font-normal">(Min. 12 Karakter)</span>
              </label>
              <input
                required
                minLength={12}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimal 12 karakter aman"
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-slate-900"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5 ml-1">
                Setup Secret <span className="text-emerald-600 font-normal">(Opsional untuk inisialisasi pertama)</span>
              </label>
              <input
                type="password"
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
                placeholder="Diverifikasi otomatis pada setup awal"
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-slate-900"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white font-bold flex items-center justify-center gap-2 disabled:opacity-60 transition-all cursor-pointer shadow-lg shadow-indigo-200"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <ShieldCheck size={18} />}
              <span>{loading ? 'Memproses Akun...' : 'Buat Super Admin Pertama'}</span>
            </button>
          </form>
        ) : null}

        <p className="mt-5 text-[11px] text-slate-400 text-center">
          Setelah berhasil dibuat, Anda dapat langsung login melalui dasbor utama.
        </p>
      </div>
    </div>
  );
};

