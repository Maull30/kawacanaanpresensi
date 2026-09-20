import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  Search,
  Filter,
  RefreshCw,
  Download,
  Plus,
  KeyRound,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Mail,
  UserCheck,
  UserX,
  X,
  Shield,
  Eye,
  EyeOff,
  User,
  School,
  Lock,
} from 'lucide-react';

export interface SchoolUsersTabProps {
  call: (action: string, payload?: any) => Promise<any>;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
  schools?: any[];
  onNavigateToSchool?: (schoolId: string) => void;
}

export const SchoolUsersTab: React.FC<SchoolUsersTabProps> = ({
  call,
  showToast,
  schools = [],
  onNavigateToSchool,
}) => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [selectedSchool, setSelectedSchool] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  // Modal State Tambah Pengguna
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [addForm, setAddForm] = useState({
    school_id: '',
    name: '',
    username: '',
    email: '',
    password: '',
    role: 'ADMIN',
  });
  const [isSubmittingAdd, setIsSubmittingAdd] = useState(false);
  const [showAddPassword, setShowAddPassword] = useState(false);

  // Modal State Reset Sandi
  const [resetModalUser, setResetModalUser] = useState<any | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  // Modal State Hapus Pengguna
  const [userToDelete, setUserToDelete] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await call('list_users');
      setUsers(res.users || []);
    } catch (err: any) {
      showToast(err.message || 'Gagal memuat daftar pengguna.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // Metrik Statistik Pengguna
  const stats = useMemo(() => {
    let total = users.length;
    let admins = 0;
    let teachers = 0;
    let headmasters = 0;
    let students = 0;
    let active = 0;
    let inactive = 0;

    users.forEach((u) => {
      const r = (u.role || '').toUpperCase();
      if (r === 'ADMIN') admins++;
      else if (r === 'KEPALA SEKOLAH') headmasters++;
      else if (r === 'WALI KELAS' || r === 'GURU MAPEL') teachers++;
      else if (r === 'SISWA') students++;

      if (u.is_active !== false) active++;
      else inactive++;
    });

    return { total, admins, teachers, headmasters, students, active, inactive };
  }, [users]);

  // Filter Pengguna
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const q = search.toLowerCase().trim();
      const matchSearch =
        !q ||
        (u.name && u.name.toLowerCase().includes(q)) ||
        (u.username && u.username.toLowerCase().includes(q)) ||
        (u.email && u.email.toLowerCase().includes(q)) ||
        (u.school_name && u.school_name.toLowerCase().includes(q));

      const matchRole = selectedRole === 'all' || (u.role || '').toUpperCase() === selectedRole.toUpperCase();
      const matchSchool = selectedSchool === 'all' || u.school_id === selectedSchool;

      let matchStatus = true;
      if (selectedStatus === 'active') matchStatus = u.is_active !== false;
      if (selectedStatus === 'inactive') matchStatus = u.is_active === false;

      return matchSearch && matchRole && matchSchool && matchStatus;
    });
  }, [users, search, selectedRole, selectedSchool, selectedStatus]);

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / pageSize) || 1;
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredUsers.slice(start, start + pageSize);
  }, [filteredUsers, currentPage]);

  // Handle Toggle Aktif Pengguna
  const handleToggleStatus = async (user: any) => {
    const nextStatus = user.is_active === false ? true : false;
    try {
      await call('toggle_admin', { user_id: user.id, is_active: nextStatus });
      showToast(
        `Status akun "${user.name}" diubah menjadi ${nextStatus ? 'Aktif' : 'Nonaktif'}.`,
        'success'
      );
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, is_active: nextStatus } : u))
      );
    } catch (err: any) {
      showToast(err.message || 'Gagal mengubah status pengguna.', 'error');
    }
  };

  // Handle Simpan Tambah Pengguna
  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.school_id || !addForm.name || !addForm.username || !addForm.password) {
      showToast('Sekolah, Nama, Username, dan Password wajib diisi.', 'error');
      return;
    }
    if (addForm.password.length < 8) {
      showToast('Password minimal 8 karakter.', 'error');
      return;
    }

    setIsSubmittingAdd(true);
    try {
      await call('create_admin', {
        school_id: addForm.school_id,
        name: addForm.name,
        username: addForm.username,
        email: addForm.email,
        password: addForm.password,
        role: addForm.role,
      });

      showToast(`Pengguna "${addForm.name}" berhasil ditambahkan ke sistem!`, 'success');
      setIsAddUserOpen(false);
      setAddForm({
        school_id: '',
        name: '',
        username: '',
        email: '',
        password: '',
        role: 'ADMIN',
      });
      loadUsers();
    } catch (err: any) {
      showToast(err.message || 'Gagal menambahkan pengguna.', 'error');
    } finally {
      setIsSubmittingAdd(false);
    }
  };

  // Handle Reset Sandi
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetModalUser || !newPassword) return;
    if (newPassword.length < 8) {
      showToast('Kata sandi baru minimal 8 karakter.', 'error');
      return;
    }

    setIsResetting(true);
    try {
      await call('reset_admin_password', {
        user_id: resetModalUser.id,
        password: newPassword,
      });
      showToast(`Kata sandi untuk "${resetModalUser.name}" berhasil direset!`, 'success');
      setResetModalUser(null);
      setNewPassword('');
    } catch (err: any) {
      showToast(err.message || 'Gagal mereset kata sandi.', 'error');
    } finally {
      setIsResetting(false);
    }
  };

  // Handle Hapus Pengguna
  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    setIsDeleting(true);
    try {
      await call('delete_user', {
        user_id: userToDelete.id,
      });
      showToast(`Akun pengguna "${userToDelete.name}" berhasil dihapus.`, 'success');
      setUserToDelete(null);
      loadUsers();
    } catch (err: any) {
      showToast(err.message || 'Gagal menghapus pengguna.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    if (filteredUsers.length === 0) {
      showToast('Tidak ada data pengguna yang dapat diekspor.', 'info');
      return;
    }
    const headers = ['Nama Lengkap', 'Username', 'Email', 'Peran / Role', 'Asal Sekolah', 'Status Akun', 'Tanggal Daftar'];
    const rows = filteredUsers.map((u) => [
      `"${u.name || ''}"`,
      `"${u.username || ''}"`,
      `"${u.email || ''}"`,
      `"${u.role || ''}"`,
      `"${u.school_name || ''}"`,
      `"${u.is_active !== false ? 'Aktif' : 'Nonaktif'}"`,
      `"${u.created_at ? new Date(u.created_at).toLocaleDateString('id-ID') : '-'}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `pengguna_sekolah_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Data pengguna berhasil diekspor ke CSV!', 'success');
  };

  // Helper warna role badge
  const getRoleBadge = (role: string) => {
    const r = (role || '').toUpperCase();
    if (r === 'ADMIN' || r === 'SUPER_ADMIN') {
      return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    }
    if (r === 'KEPALA SEKOLAH') {
      return 'bg-purple-50 text-purple-700 border-purple-200';
    }
    if (r === 'WALI KELAS') {
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
    if (r === 'GURU MAPEL') {
      return 'bg-blue-50 text-blue-700 border-blue-200';
    }
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  return (
    <div className="space-y-6">
      {/* 1. HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-md shadow-teal-500/20 shrink-0">
            <Users size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Pengguna Sekolah
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-teal-50 text-teal-700 border border-teal-200">
                Multi-Tenant Accounts
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Direktori akun terintegrasi: Administrator tenant, Kepala Sekolah, Wali Kelas, Guru Mapel, dan Siswa.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadUsers}
            disabled={loading}
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition cursor-pointer"
            title="Muat Ulang Pengguna"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin text-teal-600' : ''} />
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition shadow-xs"
          >
            <Download size={14} />
            <span className="hidden sm:inline">Ekspor CSV</span>
          </button>

          <button
            type="button"
            onClick={() => setIsAddUserOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer transition shrink-0"
          >
            <Plus size={15} />
            <span>Tambah Pengguna</span>
          </button>
        </div>
      </div>

      {/* 2. STATS OVERVIEW CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Pengguna</span>
            <Users size={16} className="text-slate-400" />
          </div>
          <div className="text-2xl font-black text-slate-900">{stats.total}</div>
          <p className="text-[10px] text-slate-400 mt-1">Akun seluruh instansi</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-indigo-100 shadow-xs">
          <div className="flex items-center justify-between text-indigo-600 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Admin Tenant</span>
            <Shield size={16} className="text-indigo-500" />
          </div>
          <div className="text-2xl font-black text-indigo-700">{stats.admins}</div>
          <p className="text-[10px] text-slate-400 mt-1">Pengelola sistem sekolah</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-emerald-100 shadow-xs">
          <div className="flex items-center justify-between text-emerald-600 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Guru & Pendidik</span>
            <UserCheck size={16} className="text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-700">{stats.teachers}</div>
          <p className="text-[10px] text-slate-400 mt-1">Wali kelas & guru mapel</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Status Akun</span>
            <Building2 size={16} className="text-slate-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-600">{stats.active}</span>
            <span className="text-xs text-slate-400 font-bold">/ {stats.inactive} nonaktif</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Status operasional login</p>
        </div>
      </div>

      {/* 3. TOOLBAR FILTER */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Cari nama pengguna, username, email, atau instansi..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-teal-600 placeholder:text-slate-400"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {/* Filter Peran */}
          <select
            value={selectedRole}
            onChange={(e) => {
              setSelectedRole(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 focus:outline-teal-600"
          >
            <option value="all">Semua Peran</option>
            <option value="ADMIN">Admin Sekolah</option>
            <option value="KEPALA SEKOLAH">Kepala Sekolah</option>
            <option value="WALI KELAS">Wali Kelas</option>
            <option value="GURU MAPEL">Guru Mapel</option>
            <option value="SISWA">Siswa</option>
          </select>

          {/* Filter Sekolah */}
          {schools.length > 0 && (
            <select
              value={selectedSchool}
              onChange={(e) => {
                setSelectedSchool(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 focus:outline-teal-600 max-w-[180px] truncate"
            >
              <option value="all">Semua Sekolah</option>
              {schools.map((s) => (
                <option key={s.id || s.school_id} value={s.id || s.school_id}>
                  {s.name}
                </option>
              ))}
            </select>
          )}

          {/* Filter Status */}
          <select
            value={selectedStatus}
            onChange={(e: any) => {
              setSelectedStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 focus:outline-teal-600"
          >
            <option value="all">Semua Status</option>
            <option value="active">Aktif</option>
            <option value="inactive">Nonaktif</option>
          </select>
        </div>
      </div>

      {/* 4. TABEL PENGGUNA TERINTEGRASI */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-bold bg-slate-50/80">
                <th className="py-3 px-4">Pengguna</th>
                <th className="py-3 px-4">Asal Instansi</th>
                <th className="py-3 px-4">Peran (Role)</th>
                <th className="py-3 px-4">Kontak & Email</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <RefreshCw size={20} className="animate-spin mx-auto text-teal-600 mb-2" />
                    <span>Memuat data seluruh akun pengguna sekolah...</span>
                  </td>
                </tr>
              ) : paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    Tidak ditemukan pengguna yang cocok dengan kriteria pencarian.
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((u) => {
                  const isActive = u.is_active !== false;
                  const initials = (u.name || u.username || 'U')
                    .slice(0, 2)
                    .toUpperCase();

                  return (
                    <tr key={u.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-linear-to-br from-teal-500 to-indigo-600 text-white font-black text-[11px] flex items-center justify-center shrink-0 shadow-xs">
                            {initials}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">{u.name}</div>
                            <div className="text-[11px] text-slate-500 font-mono">@{u.username}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                          <Building2 size={13} className="text-slate-400 shrink-0" />
                          <span className="truncate max-w-[200px]">{u.school_name || '-'}</span>
                        </div>
                        {u.npsn && (
                          <div className="text-[10px] text-slate-400 font-mono ml-4">
                            NPSN: {u.npsn}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getRoleBadge(
                            u.role
                          )}`}
                        >
                          {u.role || 'USER'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="text-slate-600 flex items-center gap-1.5 font-mono text-[11px]">
                          <Mail size={12} className="text-slate-400 shrink-0" />
                          <span className="truncate max-w-[180px]">{u.email || '-'}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(u)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold cursor-pointer transition ${
                            isActive
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                              : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                          }`}
                          title="Klik untuk ubah status aktif/nonaktif"
                        >
                          {isActive ? (
                            <>
                              <UserCheck size={11} />
                              <span>Aktif</span>
                            </>
                          ) : (
                            <>
                              <UserX size={11} />
                              <span>Nonaktif</span>
                            </>
                          )}
                        </button>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setResetModalUser(u);
                              setNewPassword('');
                            }}
                            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 transition cursor-pointer"
                            title="Reset Kata Sandi"
                          >
                            <KeyRound size={13} />
                          </button>

                          <button
                            type="button"
                            onClick={() => setUserToDelete(u)}
                            className="p-1.5 rounded-lg border border-rose-200 hover:bg-rose-50 text-rose-600 transition cursor-pointer"
                            title="Hapus Akun Pengguna"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {filteredUsers.length > pageSize && (
          <div className="p-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <div>
              Menampilkan {(currentPage - 1) * pageSize + 1} -{' '}
              {Math.min(currentPage * pageSize, filteredUsers.length)} dari {filteredUsers.length} pengguna
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="px-2.5 py-1 rounded-lg border border-slate-200 disabled:opacity-40 cursor-pointer"
              >
                Sebelumnya
              </button>
              <span className="font-bold px-2">
                {currentPage} / {totalPages}
              </span>
              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="px-2.5 py-1 rounded-lg border border-slate-200 disabled:opacity-40 cursor-pointer"
              >
                Selanjutnya
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 5. MODAL TAMBAH PENGGUNA BARU */}
      {isAddUserOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-100">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
                  <Users size={16} />
                </div>
                <h3 className="text-sm font-black text-slate-900">Tambah Akun Pengguna Sekolah</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddUserOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddUser} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Sekolah / Instansi Target *</label>
                <select
                  required
                  value={addForm.school_id}
                  onChange={(e) => setAddForm({ ...addForm, school_id: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-teal-600 bg-white"
                >
                  <option value="">-- Pilih Sekolah --</option>
                  {schools.map((s) => (
                    <option key={s.id || s.school_id} value={s.id || s.school_id}>
                      {s.name} {s.npsn ? `(${s.npsn})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Peran / Hak Akses *</label>
                <select
                  value={addForm.role}
                  onChange={(e) => setAddForm({ ...addForm, role: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-teal-600 bg-white"
                >
                  <option value="ADMIN">ADMIN (Operator & Pengelola)</option>
                  <option value="KEPALA SEKOLAH">KEPALA SEKOLAH (Eksekutif & Laporan)</option>
                  <option value="WALI KELAS">WALI KELAS (Presensi & Kelas)</option>
                  <option value="GURU MAPEL">GURU MAPEL (Presensi Mapel)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nama Lengkap *</label>
                <input
                  type="text"
                  required
                  value={addForm.name}
                  onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-teal-600"
                  placeholder="Contoh: Budi Santoso, S.Pd"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Username Login *</label>
                  <input
                    type="text"
                    required
                    value={addForm.username}
                    onChange={(e) => setAddForm({ ...addForm, username: e.target.value.toLowerCase().trim() })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-mono font-medium focus:outline-teal-600"
                    placeholder="budisantoso"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email (Opsional)</label>
                  <input
                    type="email"
                    value={addForm.email}
                    onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-teal-600"
                    placeholder="budi@sekolah.sch.id"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Kata Sandi Default *</label>
                <div className="relative">
                  <input
                    type={showAddPassword ? 'text' : 'password'}
                    required
                    minLength={8}
                    value={addForm.password}
                    onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
                    className="w-full px-3.5 py-2 pr-10 rounded-xl border border-slate-200 text-xs font-medium focus:outline-teal-600"
                    placeholder="Minimal 8 karakter"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAddPassword(!showAddPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showAddPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddUserOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingAdd}
                  className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold cursor-pointer disabled:opacity-50 shadow-xs"
                >
                  {isSubmittingAdd ? 'Menyimpan...' : 'Buat Pengguna'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. MODAL RESET PASSWORD */}
      {resetModalUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4 border border-slate-100">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                  <KeyRound size={16} />
                </div>
                <h3 className="text-sm font-black text-slate-900">Reset Kata Sandi</h3>
              </div>
              <button
                type="button"
                onClick={() => setResetModalUser(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Tetapkan sandi login baru untuk pengguna <strong className="text-slate-900">{resetModalUser.name}</strong> (@{resetModalUser.username}).
            </p>

            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Kata Sandi Baru *</label>
                <div className="relative">
                  <input
                    type={showResetPassword ? 'text' : 'password'}
                    required
                    minLength={8}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3.5 py-2 pr-10 rounded-xl border border-slate-200 text-xs font-medium focus:outline-amber-600"
                    placeholder="Minimal 8 karakter"
                  />
                  <button
                    type="button"
                    onClick={() => setShowResetPassword(!showResetPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showResetPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setResetModalUser(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isResetting}
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold cursor-pointer disabled:opacity-50 shadow-xs"
                >
                  {isResetting ? 'Menyimpan...' : 'Simpan Sandi Baru'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. MODAL KONFIRMASI HAPUS PENGGUNA */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4 border border-rose-100">
            <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 size={20} />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-sm font-black text-slate-900">Hapus Akun Pengguna?</h3>
              <p className="text-xs text-slate-500">
                Apakah Anda yakin ingin menghapus akun <strong className="text-slate-900">{userToDelete.name}</strong> (@{userToDelete.username}) secara permanen?
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDeleteUser}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer disabled:opacity-50 shadow-xs"
              >
                {isDeleting ? 'Menghapus...' : 'Ya, Hapus Akun'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
