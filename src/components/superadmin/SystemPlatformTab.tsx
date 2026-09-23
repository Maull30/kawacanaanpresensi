import React, { useState, useEffect } from 'react';
import {
  SlidersHorizontal,
  Clock,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Save,
  RefreshCw,
  Building2,
  ShieldAlert,
  Info,
  Layers,
  FileCheck
} from 'lucide-react';

interface PlatformConfig {
  app_name: string;
  app_url: string;
  default_academic_year: string;
  default_semester: string;
  attendance_rules: {
    checkin_start: string;
    checkin_late: string;
    checkout_start: string;
    active_days_per_week: number;
    require_photo_for_leave: boolean;
  };
  maintenance_mode: {
    enabled: boolean;
    message: string;
    estimated_finish?: string;
  };
  workspace_rules?: any;
}

interface PlatformStats {
  schoolsCount?: number;
  studentsCount?: number;
  teachersCount?: number;
  classesCount?: number;
  updatedAt?: string;
}

interface Props {
  call: (action: string, payload?: any) => Promise<any>;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  initialConfig?: PlatformConfig;
  platformStats?: PlatformStats;
  onSaved?: (newConfig: PlatformConfig) => void;
}

export const SystemPlatformTab: React.FC<Props> = ({
  call,
  showToast,
  initialConfig,
  platformStats,
  onSaved,
}) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState<PlatformConfig>(() => ({
    app_name: initialConfig?.app_name || 'Kawacanaan Presensi',
    app_url: initialConfig?.app_url || 'https://kawacanaanpresensi.vercel.app',
    default_academic_year: initialConfig?.default_academic_year || '2026/2027',
    default_semester: initialConfig?.default_semester || '1 (Ganjil)',
    attendance_rules: {
      checkin_start: initialConfig?.attendance_rules?.checkin_start || '06:00',
      checkin_late: initialConfig?.attendance_rules?.checkin_late || '07:00',
      checkout_start: initialConfig?.attendance_rules?.checkout_start || '12:30',
      active_days_per_week: initialConfig?.attendance_rules?.active_days_per_week || 6,
      require_photo_for_leave: initialConfig?.attendance_rules?.require_photo_for_leave ?? true,
    },
    maintenance_mode: {
      enabled: initialConfig?.maintenance_mode?.enabled ?? false,
      message:
        initialConfig?.maintenance_mode?.message ||
        'Sistem Kawacanaan Presensi sedang dalam pemeliharaan rutin. Silakan kembali dalam beberapa saat.',
      estimated_finish: initialConfig?.maintenance_mode?.estimated_finish || '',
    },
  }));

  useEffect(() => {
    if (initialConfig) {
      setForm({
        app_name: initialConfig.app_name || 'Kawacanaan Presensi',
        app_url: initialConfig.app_url || 'https://kawacanaanpresensi.vercel.app',
        default_academic_year: initialConfig.default_academic_year || '2026/2027',
        default_semester: initialConfig.default_semester || '1 (Ganjil)',
        attendance_rules: {
          checkin_start: initialConfig.attendance_rules?.checkin_start || '06:00',
          checkin_late: initialConfig.attendance_rules?.checkin_late || '07:00',
          checkout_start: initialConfig.attendance_rules?.checkout_start || '12:30',
          active_days_per_week: initialConfig.attendance_rules?.active_days_per_week || 6,
          require_photo_for_leave: initialConfig.attendance_rules?.require_photo_for_leave ?? true,
        },
        maintenance_mode: {
          enabled: initialConfig.maintenance_mode?.enabled ?? false,
          message:
            initialConfig.maintenance_mode?.message ||
            'Sistem Kawacanaan Presensi sedang dalam pemeliharaan rutin. Silakan kembali dalam beberapa saat.',
          estimated_finish: initialConfig.maintenance_mode?.estimated_finish || '',
        },
      });
    }
  }, [initialConfig]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await call('update_system_settings', {
        section: 'platform',
        data: form,
      });
      if (res.ok) {
        showToast('Konfigurasi platform berhasil disimpan di database server.', 'success');
        if (onSaved) onSaved(form);
      } else {
        throw new Error(res.error || 'Gagal menyimpan.');
      }
    } catch (err: any) {
      showToast(err.message || 'Gagal menyimpan konfigurasi platform.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* Banner Maintenance Alert jika aktif */}
      {form.maintenance_mode.enabled && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3.5 text-amber-800">
          <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs">
            <p className="font-bold text-amber-900 text-sm">Mode Pemeliharaan (Maintenance) Sedang Aktif</p>
            <p className="mt-0.5 text-amber-800">
              Pengguna non-superadmin yang membuka aplikasi akan melihat pesan pemeliharaan.
            </p>
          </div>
        </div>
      )}

      {/* Ringkasan Metrik Multi-Tenant Real-Time dari Database */}
      {platformStats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Tenant Sekolah</span>
            <p className="text-xl font-black text-slate-900 mt-1 font-mono">{platformStats.schoolsCount || 0}</p>
            <span className="text-[10px] text-emerald-600 font-medium mt-0.5 block flex items-center gap-1">
              <CheckCircle2 size={11} /> Instansi Terhubung
            </span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Siswa Terdaftar</span>
            <p className="text-xl font-black text-slate-900 mt-1 font-mono">{platformStats.studentsCount || 0}</p>
            <span className="text-[10px] text-indigo-600 font-medium mt-0.5 block">Akun Siswa Multi-Tenant</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Guru & Tendik Aktif</span>
            <p className="text-xl font-black text-slate-900 mt-1 font-mono">{platformStats.teachersCount || 0}</p>
            <span className="text-[10px] text-blue-600 font-medium mt-0.5 block">Wali Kelas & Mapel</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Rombel Kelas</span>
            <p className="text-xl font-black text-slate-900 mt-1 font-mono">{platformStats.classesCount || 0}</p>
            <span className="text-[10px] text-slate-500 font-medium mt-0.5 block">
              {platformStats.updatedAt ? `Update: ${new Date(platformStats.updatedAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB` : 'Sinkronisasi Otomatis'}
            </span>
          </div>
        </div>
      )}

      {/* Bagian 1: Identitas & Domain Platform */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <SlidersHorizontal size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Identitas & Lingkungan Platform</h3>
            <p className="text-xs text-slate-500">Konfigurasi nama aplikasi, domain publik, dan tahun ajaran acuan nasional.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">Nama Aplikasi Sistem</label>
            <input
              type="text"
              value={form.app_name}
              onChange={(e) => setForm({ ...form, app_name: e.target.value })}
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 outline-none text-slate-800 font-medium"
              placeholder="Contoh: Kawacanaan Presensi"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">URL Aplikasi (Production Domain)</label>
            <input
              type="url"
              value={form.app_url}
              onChange={(e) => setForm({ ...form, app_url: e.target.value })}
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 outline-none text-slate-800 font-medium font-mono text-[11px]"
              placeholder="https://kawacanaanpresensi.vercel.app"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">Tahun Ajaran Default (Sekolah Baru)</label>
            <input
              type="text"
              value={form.default_academic_year}
              onChange={(e) => setForm({ ...form, default_academic_year: e.target.value })}
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 outline-none text-slate-800 font-medium"
              placeholder="2026/2027"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">Semester Acuan Default</label>
            <select
              value={form.default_semester}
              onChange={(e) => setForm({ ...form, default_semester: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 outline-none text-slate-800 font-medium bg-white"
            >
              <option value="1 (Ganjil)">Semester 1 (Ganjil)</option>
              <option value="2 (Genap)">Semester 2 (Genap)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bagian 2: Standar Presensi Bawaan Nasional */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Clock size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Standar Jam & Aturan Presensi Bawaan</h3>
            <p className="text-xs text-slate-500">Nilai default yang otomatis diterapkan pada saat sekolah baru mendaftarkan instansinya.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">Jam Masuk Dibuka</label>
            <input
              type="time"
              value={form.attendance_rules.checkin_start}
              onChange={(e) =>
                setForm({
                  ...form,
                  attendance_rules: { ...form.attendance_rules, checkin_start: e.target.value },
                })
              }
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none font-semibold text-slate-800"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">Waktu paling awal siswa boleh tap presensi.</span>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">Batas Toleransi Terlambat</label>
            <input
              type="time"
              value={form.attendance_rules.checkin_late}
              onChange={(e) =>
                setForm({
                  ...form,
                  attendance_rules: { ...form.attendance_rules, checkin_late: e.target.value },
                })
              }
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none font-semibold text-slate-800"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">Lewat jam ini, kehadiran otomatis dihitung 'Terlambat'.</span>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">Jam Buka Presensi Pulang</label>
            <input
              type="time"
              value={form.attendance_rules.checkout_start}
              onChange={(e) =>
                setForm({
                  ...form,
                  attendance_rules: { ...form.attendance_rules, checkout_start: e.target.value },
                })
              }
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none font-semibold text-slate-800"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">Siswa dapat tap pulang mulai jam ini.</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-100 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">Jumlah Hari Belajar Efektif</label>
            <select
              value={form.attendance_rules.active_days_per_week}
              onChange={(e) =>
                setForm({
                  ...form,
                  attendance_rules: {
                    ...form.attendance_rules,
                    active_days_per_week: Number(e.target.value),
                  },
                })
              }
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 outline-none bg-white font-medium text-slate-800"
            >
              <option value={5}>5 Hari Kerja (Senin - Jumat)</option>
              <option value={6}>6 Hari Kerja (Senin - Sabtu)</option>
            </select>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/60">
            <div>
              <p className="font-semibold text-slate-800">Wajib Lampiran Surat Sakit</p>
              <p className="text-[11px] text-slate-500">Wali murid wajib mengunggah foto surat dokter/surat orang tua saat izin sakit.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer ml-3">
              <input
                type="checkbox"
                checked={form.attendance_rules.require_photo_for_leave}
                onChange={(e) =>
                  setForm({
                    ...form,
                    attendance_rules: {
                      ...form.attendance_rules,
                      require_photo_for_leave: e.target.checked,
                    },
                  })
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Bagian 3: Aturan Multi-Tenant & Ruang Kerja */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Layers size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Ketentuan Arsitektur Multi-Tenant</h3>
            <p className="text-xs text-slate-500">Regulasi pemisahan ruang kerja sekolah dan ruang kerja individu mandiri.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
          <div className="p-3.5 rounded-xl border border-emerald-100 bg-emerald-50/50">
            <div className="flex items-center gap-2 font-bold text-emerald-900 mb-1">
              <Building2 size={16} className="text-emerald-700" />
              <span>Ruang Kerja Sekolah (Multi-Tenant)</span>
            </div>
            <p className="text-emerald-800 leading-relaxed">
              Memiliki kode sekolah 8 digit unik (contoh: <code>9B3366AB</code>). Menampung banyak wali kelas, guru mapel, dan kepala sekolah di bawah 1 NPSN resmi.
            </p>
          </div>

          <div className="p-3.5 rounded-xl border border-indigo-100 bg-indigo-50/50">
            <div className="flex items-center gap-2 font-bold text-indigo-900 mb-1">
              <FileCheck size={16} className="text-indigo-700" />
              <span>Ruang Kerja Individu (Guru Mandiri)</span>
            </div>
            <p className="text-indigo-800 leading-relaxed">
              Dibuat khusus bagi guru yang memilih <em>'Kelola Kelas Sendiri'</em>. Berdiri mandiri dengan kode berawalan <code>PER-</code> tanpa NPSN sekolah induk.
            </p>
          </div>
        </div>
      </div>

      {/* Bagian 4: Mode Pemeliharaan Sistem (Maintenance Mode) */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <AlertTriangle size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Mode Pemeliharaan (Maintenance Mode)</h3>
              <p className="text-xs text-slate-500">Kunci akses sementara untuk rilis fitur baru atau sinkronisasi database.</p>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={form.maintenance_mode.enabled}
              onChange={(e) =>
                setForm({
                  ...form,
                  maintenance_mode: { ...form.maintenance_mode, enabled: e.target.checked },
                })
              }
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
          </label>
        </div>

        <div className="space-y-3 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">Pesan Pemeliharaan ke Pengguna</label>
            <textarea
              rows={2}
              value={form.maintenance_mode.message}
              onChange={(e) =>
                setForm({
                  ...form,
                  maintenance_mode: { ...form.maintenance_mode, message: e.target.value },
                })
              }
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 outline-none text-slate-800 font-medium"
              placeholder="Sistem Kawacanaan Presensi sedang dalam pemeliharaan..."
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">Estimasi Selesai (Opsional)</label>
            <input
              type="text"
              value={form.maintenance_mode.estimated_finish}
              onChange={(e) =>
                setForm({
                  ...form,
                  maintenance_mode: { ...form.maintenance_mode, estimated_finish: e.target.value },
                })
              }
              className="w-full max-w-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-amber-500 outline-none text-slate-800 font-medium"
              placeholder="Contoh: Pukul 15:00 WIB"
            />
          </div>
        </div>
      </div>

      {/* Tombol Simpan Aksi */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs hover:shadow transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {saving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
          <span>{saving ? 'Menyimpan ke Server...' : 'Simpan Konfigurasi Platform'}</span>
        </button>
      </div>
    </form>
  );
};
