import { createClient } from '@supabase/supabase-js';

const json = (res: any, status: number, body: unknown) =>
  res.status(status).setHeader('Content-Type', 'application/json').end(JSON.stringify(body));

/**
 * Normalisasi paket sistem (Canonical):
 * - Paket baru hanya: 'guru_gratis' | 'guru_pro' | 'sekolah_pro'
 * - Legacy compatibility (baca):
 *     free / mulai -> guru_gratis
 *     teacher / guru -> guru_pro
 *     school / sekolah -> sekolah_pro
 */
export function normalizePlan(rawPlan?: string | null): 'guru_gratis' | 'guru_pro' | 'sekolah_pro' {
  const p = String(rawPlan || '').toLowerCase().trim();
  if (p === 'sekolah_pro' || p === 'school' || p === 'sekolah' || p === 'sekolah_uji_coba' || p === 'pro' || p === 'enterprise') {
    return 'sekolah_pro';
  }
  if (p === 'guru_pro' || p === 'teacher' || p === 'guru' || p === 'guru_uji_coba') {
    return 'guru_pro';
  }
  return 'guru_gratis';
}

const generateSchoolInviteCode = (): string => {
  const chars = '0123456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

const getPlanLimits = (plan: string, role?: string) => {
  const norm = normalizePlan(plan);
  if (norm === 'sekolah_pro') {
    // Ruang Kerja Sekolah: Total 12 kelas tersedia (Kelas 1–6 paralel A/B), maks 50 siswa/kelas (600 siswa)
    return { max_teachers: 50, max_students: 600, max_classes: 12, days: 30, defaultClasses: 12, name: 'Paket Sekolah Pro' };
  }
  const isSubjectTeacher = (role || '').toUpperCase().trim() === 'GURU MAPEL';
  if (norm === 'guru_pro') {
    if (isSubjectTeacher) {
      // Ruang Kerja Individu - Peran Guru Mapel: Maksimal 6 kelas, maks 50 siswa per kelas
      return { max_teachers: 1, max_students: 300, max_classes: 6, days: 30, defaultClasses: 1, name: 'Paket Guru Pro (Mapel)' };
    }
    // Ruang Kerja Individu - Peran Wali Kelas / Standar: 1 kelas binaan, maks 50 siswa
    return { max_teachers: 1, max_students: 50, max_classes: 1, days: 30, defaultClasses: 1, name: 'Paket Guru Pro' };
  }
  // guru_gratis: Aktif tanpa batas waktu kedaluwarsa (days: null), tanpa sistem trial lama
  return { max_teachers: 1, max_students: 32, max_classes: 1, days: null, defaultClasses: 1, name: 'Paket Guru Gratis' };
};

const generateInitialClasses = (schoolId: string, count: number) => {
  const classesList: { school_id: string; name: string; grade: number }[] = [];
  if (count <= 1) {
    classesList.push({ school_id: schoolId, name: 'Kelas 1A', grade: 1 });
  } else if (count <= 6) {
    for (let g = 1; g <= 6; g++) {
      classesList.push({ school_id: schoolId, name: `Kelas ${g}A`, grade: g });
    }
  } else {
    // Ruang Kerja Sekolah: Struktur 12 Kelas Standar: Kelas 1–6 Paralel A/B (1A s.d. 6B)
    for (let g = 1; g <= 6; g++) {
      classesList.push({ school_id: schoolId, name: `Kelas ${g}A`, grade: g });
      classesList.push({ school_id: schoolId, name: `Kelas ${g}B`, grade: g });
    }
  }
  return classesList;
};

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return json(res, 405, { error: 'Method not allowed. Gunakan metode POST.' });
  }

  const body = req.body || {};
  const npsn = String(body.npsn || '').replace(/\D/g, '').trim();
  const schoolName = String(body.schoolName || body.namaSekolah || '').trim();
  // Semua paket baru hanya: guru_gratis, guru_pro, sekolah_pro (dengan pemetaan legacy baca)
  const plan = normalizePlan(body.plan);
  const adminName = String(body.adminName || body.fullName || body.contactName || 'Administrator Sekolah').trim();
  const adminPhone = String(body.adminPhone || body.contactPhone || '').trim();
  const adminEmail = String(body.adminEmail || body.email || '').trim().toLowerCase();
  const adminPassword = String(body.adminPassword || body.password || '');
  const jenjang = String(body.jenjang || 'SD').toUpperCase();
  const statusSekolah = body.status === 'Swasta' ? 'Swasta' : 'Negeri';

  // Alamat detail
  const alamatDetail = {
    full: body.alamat || '',
    jalan: body.jalan || '',
    desaKelurahan: body.desaKelurahan || '',
    kecamatan: body.kecamatan || '',
    kabupatenKota: body.kabupatenKota || '',
    provinsi: body.provinsi || '',
    kodePos: body.kodePos || '',
    teleponFax: body.teleponFax || adminPhone || '',
    email: adminEmail || '',
    website: body.website || '',
    jenjang,
  };

  const rawCustomCode = body.schoolCode || body.inviteCode || body.code
    ? String(body.schoolCode || body.inviteCode || body.code).trim().toUpperCase().replace(/^SCH-?/i, '').replace(/[^A-Z0-9]/g, '')
    : '';
  const schoolCode = rawCustomCode || generateSchoolInviteCode();

  // Acuan identitas menggunakan Kode Undangan Sekolah (School Invitation Code)
  let effectiveNpsn = npsn;
  if (!effectiveNpsn || effectiveNpsn.length < 8) {
    // Generate 8 digit identifier jika NPSN tidak diisi
    effectiveNpsn = `${Math.floor(10000000 + Math.random() * 90000000)}`;
  }

  if (!schoolName) {
    return json(res, 400, { error: 'Nama satuan pendidikan wajib diisi.' });
  }

  if (!adminPassword || adminPassword.length < 6) {
    return json(res, 400, { error: 'Kata sandi minimal 6 karakter demi keamanan akun Anda.' });
  }

  // Pola username otomatis berbasis Kode Sekolah atau input pengguna
  const customUsername = String(body.username || '').trim().toLowerCase().replace(/[^a-z0-9_.-]/g, '');
  const adminUsername = customUsername || `admin.${schoolCode.toLowerCase()}`;
  const authEmail = adminEmail || `${adminUsername}@login.kawacanaan.local`;

  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || '';

  // Mode Fallback jika Supabase belum dikonfigurasi (untuk preview / offline mode)
  if (!url || !serviceKey) {
    return json(res, 200, {
      ok: true,
      demoMode: true,
      message: `Pendaftaran satuan pendidikan ${schoolName} berhasil disimulasikan!`,
      school: {
        id: `mock-${schoolCode}`,
        name: schoolName,
        npsn: effectiveNpsn,
        code: schoolCode,
        schoolCode,
        plan,
        status: 'active',
      },
      admin: {
        username: adminUsername,
        name: adminName,
        email: authEmail,
        role: 'ADMIN',
      },
      classesCreated: getPlanLimits(plan).defaultClasses,
    });
  }

  const admin = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const getAcademicYear = async (schoolId: string) => { const { data } = await admin.from('school_profile').select('tahun_pelajaran').eq('school_id',schoolId).maybeSingle(); return String(data?.tahun_pelajaran || '2026/2027').trim() || '2026/2027'; };

  try {
    // 1. Cek apakah Kode Sekolah sudah terdaftar di sistem
    const { data: existingSchool } = await admin
      .from('schools')
      .select('id, name, npsn, code, plan, status, workspace_type, subscription_expires_at')
      .or(`code.eq.${schoolCode},npsn.eq.${effectiveNpsn}`)
      .maybeSingle();

    if (existingSchool) {
      // Periksa masa aktif lisensi sekolah yang sudah terdaftar (downgrade aman & idempotent jika kedaluwarsa)
      if (existingSchool.subscription_expires_at && new Date(existingSchool.subscription_expires_at) <= new Date()) {
        const normCurrent = normalizePlan(existingSchool.plan);
        if (normCurrent !== 'guru_gratis' || existingSchool.plan !== 'guru_gratis') {
          await admin.from('schools').update({ plan: 'guru_gratis' }).eq('id', existingSchool.id);
          existingSchool.plan = 'guru_gratis';
        }
      }

      const existingPlanNorm = normalizePlan(existingSchool.plan);

      // Deteksi khusus Paket Guru Gratis: 1 guru dari 1 sekolah saja
      if (plan === 'guru_gratis' && existingPlanNorm === 'guru_gratis') {
        return json(res, 409, {
          error: `Pendaftaran Ditolak: Sekolah dengan Kode/NPSN (${existingSchool.name}) sudah terdaftar dalam sistem. Paket Guru Gratis dibatasi khusus untuk 1 ruang kerja per sekolah. Silakan pilih Paket Guru Pro atau Paket Sekolah Pro untuk mendaftar.`,
        });
      }

      // Deteksi Paket Sekolah Pro: Hanya 1 institusi per kode
      if (plan === 'sekolah_pro' && existingPlanNorm === 'sekolah_pro') {
        return json(res, 409, {
          error: `Satuan pendidikan (${existingSchool.name}) sudah terdaftar dengan Paket Sekolah Pro. Silakan masuk menggunakan kredensial Administrator sekolah (${adminUsername}) atau gunakan Kode Undangan Sekolah untuk bergabung.`,
        });
      }
    }

    // Penentuan Username & Peran untuk Guru vs Admin
    const isTeacherPlan = plan === 'guru_pro' || plan === 'guru_gratis';
    const teacherType = body.teacherType === 'GURU_MAPEL' ? 'GURU_MAPEL' : 'WALI_KELAS';
    const teacherGrade = Number(body.teacherGrade || 1);
    const teacherSubject = String(body.teacherSubject || 'Tematik / Guru Kelas').trim();
    const teacherNip = String(body.teacherNip || '').trim();

    let effectiveUsername = adminUsername;
    if (isTeacherPlan) {
      const classSuffix = teacherType === 'WALI_KELAS' ? `k${teacherGrade}` : 'mapel';
      effectiveUsername = customUsername || `guru.${schoolCode.toLowerCase()}`;
      if (existingSchool) {
        effectiveUsername = `${effectiveUsername}.${classSuffix}`;
      }
    }

    // 2. Cek apakah username sudah terpakai
    const { data: existingUser } = await admin
      .from('profiles')
      .select('id, username')
      .eq('username', effectiveUsername)
      .maybeSingle();

    if (existingUser) {
      if (plan === 'guru_gratis') {
        return json(res, 409, {
          error: `Pengguna untuk akun (${effectiveUsername}) sudah terdaftar. Silakan gunakan username lain atau login dengan akun Anda.`,
        });
      } else {
        effectiveUsername = `${effectiveUsername}.${Math.floor(1000 + Math.random() * 9000)}`;
      }
    }

    // 3. Verifikasi Keaslian Hak Akses Super Admin
    const requestedSuperadmin = Boolean(body.isSuperadmin || body.mode === 'superadmin');
    let isCallerSuperadmin = false;
    const authHeader = req.headers.authorization || '';
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();

    if (token) {
      try {
        const { data: callerUser } = await admin.auth.getUser(token);
        if (callerUser?.user) {
          const { data: callerProfile } = await admin
            .from('profiles')
            .select('role')
            .eq('id', callerUser.user.id)
            .maybeSingle();
          if (callerProfile?.role === 'SUPER_ADMIN') {
            isCallerSuperadmin = true;
          }
        }
      } catch (_) {}
    }

    if (requestedSuperadmin && !isCallerSuperadmin) {
      return json(res, 403, {
        error: 'Akses ditolak: Pendaftaran mode Super Admin memerlukan otorisasi SUPER_ADMIN yang sah.',
      });
    }

    // 4. Hitung Masa Aktif & Limit Paket
    const planLimits = getPlanLimits(plan, teacherType);
    const startDate = new Date();
    let expiryDateStr: string | null = null;
    let initialStatus: 'active' | 'pending_payment' = 'active';

    if (isCallerSuperadmin) {
      // Super Admin berhak menentukan status, masa aktif, dan kuota khusus secara manual
      if (plan === 'guru_gratis') {
        expiryDateStr = null;
      } else if (body.subscription_expires_at !== undefined) {
        expiryDateStr = body.subscription_expires_at ? String(body.subscription_expires_at).trim() : null;
      } else if (planLimits.days && planLimits.days > 0) {
        const expiryDate = new Date();
        expiryDate.setDate(startDate.getDate() + planLimits.days);
        expiryDateStr = expiryDate.toISOString().slice(0, 10);
      }
      initialStatus = 'active';
    } else {
      // Pendaftaran Publik mandiri:
      if (plan === 'guru_gratis') {
        initialStatus = 'active';
        expiryDateStr = null;
      } else {
        // Paket berbayar (sekolah_pro atau guru_pro) yang belum dibayar:
        // Status awal WAJIB 'pending_payment' dengan subscription_expires_at = null!
        // Akun dan sekolah baru akan diaktifkan secara otomatis setelah pembayaran Midtrans berstatus SETTLED.
        initialStatus = 'pending_payment';
        expiryDateStr = null;
      }
    }

    // 5. Buat Tenant Sekolah / Guru (Sekolah formal = Ruang Kerja Sekolah, Guru Mandiri = Ruang Kerja Individu)
    const workspaceType = body.workspace_type || (body.workspace_service === 'teacher_independent' ? 'personal' : (isTeacherPlan ? 'personal' : 'school'));
    const maxTeachers = isCallerSuperadmin ? (body.max_teachers !== undefined ? Number(body.max_teachers) : 999999) : planLimits.max_teachers;
    const maxStudents = isCallerSuperadmin ? (body.max_students !== undefined ? Number(body.max_students) : 999999) : planLimits.max_students;
    const maxClasses = isCallerSuperadmin ? (body.max_classes !== undefined ? Number(body.max_classes) : 999999) : planLimits.max_classes;

    const { data: school, error: schoolErr } = await admin
      .from('schools')
      .insert({
        name: isTeacherPlan ? `${schoolName} (Guru Mandiri)` : schoolName,
        npsn: effectiveNpsn,
        code: schoolCode,
        plan,
        workspace_type: workspaceType,
        status: initialStatus,
        subscription_started_at: startDate.toISOString().slice(0, 10),
        subscription_expires_at: expiryDateStr,
        max_teachers: maxTeachers,
        max_students: maxStudents,
        max_classes: maxClasses,
      })
      .select()
      .single();

    if (schoolErr || !school) {
      return json(res, 400, { error: schoolErr?.message || 'Gagal mendaftarkan data sekolah/guru.' });
    }

    // Simpan catatan internal Super Admin jika ada
    const adminNotes = body.notes !== undefined ? (body.notes ? String(body.notes).trim() : null) : null;
    if (adminNotes) {
      try {
        const { data: psData } = await admin.from('platform_settings').select('integrations').eq('id', 1).maybeSingle();
        const integrations = psData?.integrations || {};
        const schoolNotes = { ...(integrations.school_notes || {}) };
        schoolNotes[school.id] = adminNotes;
        await admin.from('platform_settings').upsert({
          id: 1,
          integrations: { ...integrations, school_notes: schoolNotes },
        });
      } catch (_) {}
    }

    // 5. Buat School Profile dengan alamat terstruktur
    const currentYear = new Date().getFullYear();
    const tahunPelajaran = `${currentYear}/${currentYear + 1}`;
    const alamatJsonString = `__EXTJSON__:${JSON.stringify(alamatDetail)}`;

    await admin.from('school_profile').insert({
      school_id: school.id,
      nama_sekolah: schoolName,
      npsn,
      jenjang,
      alamat: alamatJsonString,
      tahun_pelajaran: tahunPelajaran,
      semester: '1',
      nama_kepala_sekolah: isTeacherPlan ? '-' : adminName,
      nama_wali_kelas: isTeacherPlan ? adminName : '-',
      kelas: isTeacherPlan ? `Kelas ${teacherGrade}` : '-',
    });

    // 6. Buat System Config Default
    await admin.from('system_config').insert({
      school_id: school.id,
      app_title: `Sistem Presensi ${schoolName}`,
      app_subtitle: isTeacherPlan ? 'Platform Presensi Guru Mandiri' : 'Platform Presensi & Rekapitulasi Digital SD',
      active_study_days: [1, 2, 3, 4, 5],
      student_self_attendance_enabled: plan === 'sekolah_pro',
      check_in_start_time: '06:00',
      check_in_deadline_time: '07:00',
      check_out_start_time: '12:30',
      auto_mark_late: true,
    });

    // 7. Inisialisasi Otomatis Rombel Kelas Sesuai Paket
    let initialClasses: { school_id: string; name: string; grade: number }[] = [];
    if (isTeacherPlan) {
      initialClasses = [{ school_id: school.id, name: `Kelas ${teacherGrade}`, grade: teacherGrade }];
    } else {
      initialClasses = generateInitialClasses(school.id, planLimits.defaultClasses);
    }

    const { data: createdClassRows, error: classInsertError } = await admin.from('classes').insert(initialClasses).select();
    if (classInsertError) throw classInsertError;

    // 8. Inisialisasi Mata Pelajaran Dasar SD
    const defaultSubjects = [
      { school_id: school.id, name: 'Tematik / Guru Kelas (Wali Kelas)', code: 'TMK', is_specialized: false },
      { school_id: school.id, name: 'Pendidikan Jasmani, Olahraga & Kesehatan (PJOK)', code: 'PJOK', is_specialized: true },
      { school_id: school.id, name: 'Pendidikan Agama & Budi Pekerti (PABP)', code: 'PABP', is_specialized: true },
      { school_id: school.id, name: 'Bahasa Daerah / Muatan Lokal (MULOK)', code: 'MULOK', is_specialized: true },
    ];
    const { error: defaultSubjectError } = await admin.from('subjects').insert(defaultSubjects);
    if (defaultSubjectError && defaultSubjectError.code !== '23505') throw defaultSubjectError;

    // 9. Buat Akun Auth Supabase untuk Pengguna (Guru / Admin)
    const userAuthEmail = adminEmail || `${effectiveUsername}@login.edushift.local`;
    const userRole = plan === 'sekolah_pro' ? 'ADMIN' : (teacherType === 'GURU_MAPEL' ? 'GURU MAPEL' : 'WALI KELAS');

    const { data: authData, error: authErr } = await admin.auth.admin.createUser({
      email: userAuthEmail,
      password: adminPassword,
      email_confirm: true,
      user_metadata: {
        name: adminName,
        username: effectiveUsername,
        role: userRole,
        school_id: school.id,
        phone: adminPhone,
      },
    });

    if (authErr || !authData.user) {
      // Rollback sekolah jika gagal buat user
      await admin.from('schools').delete().eq('id', school.id);
      return json(res, 400, { error: authErr?.message || 'Gagal membuat akun autentikasi pengguna.' });
    }

    // 10. Buat Profil Pengguna
    const { error: profileErr } = await admin.from('profiles').insert({
      id: authData.user.id,
      school_id: school.id,
      name: adminName,
      username: effectiveUsername,
      email: userAuthEmail,
      role: userRole,
      is_active: true,
      must_change_password: false,
    });

    if (profileErr) {
      await admin.auth.admin.deleteUser(authData.user.id);
      await admin.from('schools').delete().eq('id', school.id);
      return json(res, 400, { error: profileErr.message || 'Gagal menyimpan profil pengguna.' });
    }

    // 10b. Hubungkan Guru ke Guru Table & Class Assignment
    if (isTeacherPlan) {
      try {
        const { data: teacherRow, error: teacherError } = await admin.from('teachers').insert({
          school_id: school.id,
          nama: adminName,
          nip: (teacherNip || '').trim() || null,
          jenis_kelamin: 'L',
          tugas_utama: teacherType === 'GURU_MAPEL' ? 'Guru Mapel' : 'Wali Kelas',
        }).select('id').single();
        if (teacherError || !teacherRow) throw teacherError || new Error('Gagal membuat data guru.');
        await admin.from('profiles').update({ teacher_id: teacherRow.id }).eq('id', authData.user.id);

        if (teacherType === 'GURU_MAPEL' && teacherSubject) {
          const { data: subjectRow } = await admin.from('subjects')
            .select('id')
            .eq('school_id', school.id)
            .or(`code.ilike.${String(teacherSubject).trim().toUpperCase()},name.ilike.${String(teacherSubject).trim()}`)
            .limit(1)
            .maybeSingle();
          let subjectId = subjectRow?.id || null;
          if (!subjectId) {
            const { data: createdSubject } = await admin.from('subjects').insert({
              school_id: school.id,
              name: String(teacherSubject).trim(),
              code: String(teacherSubject).trim().slice(0, 4).toUpperCase(),
              is_specialized: true,
            }).select('id').single();
            subjectId = createdSubject?.id || null;
          }
          if (subjectId) {
            const year = await getAcademicYear(school.id);
            const { error: assignErr } = await admin.rpc('replace_subject_assignment',{p_school_id:school.id,p_subject_id:subjectId,p_teacher_id:teacherRow.id,p_class_ids:[],p_academic_year:year,p_actor_user_id:authData.user.id});
            if (assignErr) throw assignErr;
          }
        }

        if (createdClassRows.length > 0) {
          const primaryClass = createdClassRows[0];
          if (teacherType === 'WALI_KELAS') {
            const year = await getAcademicYear(school.id);
            const { error: waliErr } = await admin.rpc('assign_homeroom_teacher',{p_school_id:school.id,p_teacher_id:teacherRow.id,p_class_id:primaryClass.id,p_academic_year:year,p_actor_user_id:authData.user.id});
            if (waliErr) throw waliErr;
          } else if (teacherType === 'GURU_MAPEL' && teacherSubject) {
            const { data: subjectRow, error: subjectLookupErr } = await admin.from('subjects').select('id').eq('school_id', school.id).ilike('name', String(teacherSubject).trim()).maybeSingle();
            if (subjectLookupErr) throw subjectLookupErr;
            if (subjectRow) {
              const year = await getAcademicYear(school.id);
              const { error: assignErr } = await admin.rpc('replace_subject_assignment',{p_school_id:school.id,p_subject_id:subjectRow.id,p_teacher_id:teacherRow.id,p_class_ids:[primaryClass.id],p_academic_year:year,p_actor_user_id:authData.user.id});
              if (assignErr) throw assignErr;
            }
          }
        }
      } catch (linkErr: any) {
        console.error('Penghubungan data guru dan rombel gagal:', linkErr);
        throw linkErr;
      }
    }

    // 11. Audit Log Pendaftaran
    try {
      await admin.from('audit_logs').insert({
        actor_id: authData.user.id,
        actor_name: adminName,
        actor_role: userRole,
        action: 'PUBLIC_REGISTER_SCHOOL',
        school_id: school.id,
        details: {
          npsn,
          schoolName,
          plan,
          adminUsername: effectiveUsername,
          role: userRole,
          classesCreated: initialClasses.length,
        },
      });
    } catch (_) {}

    return json(res, 200, {
      ok: true,
      message: `Pendaftaran berhasil! Akun ${effectiveUsername} (${userRole}) telah aktif.`,
      school: {
        id: school.id,
        name: schoolName,
        npsn: effectiveNpsn,
        code: schoolCode,
        schoolCode,
        plan,
        status: school.status || initialStatus,
        subscription_expires_at: expiryDateStr,
      },
      admin: {
        id: authData.user.id,
        username: effectiveUsername,
        name: adminName,
        email: userAuthEmail,
        role: userRole,
      },
      classesCreated: initialClasses.length,
    });
  } catch (error: any) {
    console.error('Error saat pendaftaran sekolah:', error);
    return json(res, 500, { error: error.message || 'Terjadi kesalahan sistem saat memproses pendaftaran.' });
  }
}

