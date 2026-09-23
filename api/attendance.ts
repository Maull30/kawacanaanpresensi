import { createClient } from '@supabase/supabase-js';

const json = (res: any, status: number, body: unknown) =>
  res.status(status).setHeader('Content-Type', 'application/json').end(JSON.stringify(body));

const ALLOWED_ROLES = ['ADMIN', 'KEPALA SEKOLAH', 'WALI KELAS', 'GURU MAPEL', 'SUPER_ADMIN'];

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return json(res, 405, { error: 'Metode permintaan tidak diizinkan. Gunakan POST.' });

  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || '';
  if (!url || !serviceKey) {
    return json(res, 500, { error: 'Konfigurasi server SUPABASE_URL atau SUPABASE_SERVICE_ROLE_KEY belum terpasang di Vercel/lingkungan.' });
  }

  const token = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '').trim();
  if (!token) return json(res, 401, { error: 'Sesi login tidak ditemukan.' });

  const admin = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: authData, error: authError } = await admin.auth.getUser(token);
  if (authError || !authData.user) return json(res, 401, { error: 'Sesi login tidak valid atau telah kedaluwarsa.' });

  const userId = authData.user.id;
  const { data: profile, error: profileErr } = await admin
    .from('profiles')
    .select('id, role, school_id, teacher_id')
    .eq('id', userId)
    .maybeSingle();

  if (profileErr || !profile) {
    return json(res, 403, { error: 'Profil pengguna tidak ditemukan.' });
  }

  const body = req.body || {};
  const action = body.action || 'save_daily';
  const targetSchoolId = body.schoolId || profile.school_id;
  const userRole = String(profile.role || '').toUpperCase().trim();

  // Verifikasi otorisasi sekolah secara ketat
  let isAuthorizedForSchool = userRole === 'SUPER_ADMIN';

  if (!isAuthorizedForSchool && targetSchoolId) {
    try {
      const { data: targetSchool } = await admin
        .from('schools')
        .select('id, owner_id, workspace_type, is_personal')
        .eq('id', targetSchoolId)
        .maybeSingle();

      if (targetSchool) {
        const isPersonalWorkspace =
          targetSchool.workspace_type === 'personal' ||
          targetSchool.workspace_type === 'individu' ||
          targetSchool.is_personal === true;

        if (isPersonalWorkspace) {
          // RUANG KERJA INDIVIDU: HANYA pemilik sah (owner_id === userId) yang boleh mengakses & mencatat absensi
          if (targetSchool.owner_id === userId) {
            isAuthorizedForSchool = true;
          }
        } else {
          // RUANG KERJA SEKOLAH / INSTANSI:
          // Boleh diakses jika:
          // 1. Pemilik sekolah (owner_id === userId)
          // 2. Atau pengguna aktif terdaftar di sekolah ini (profile.school_id === targetSchoolId)
          // 3. Atau guru yang terdaftar resmi di tabel teachers untuk sekolah ini
          if (targetSchool.owner_id === userId) {
            isAuthorizedForSchool = true;
          } else if (profile.school_id === targetSchoolId) {
            isAuthorizedForSchool = true;
          } else if (profile.teacher_id) {
            const { data: teacherRow } = await admin
              .from('teachers')
              .select('id')
              .eq('school_id', targetSchoolId)
              .eq('id', profile.teacher_id)
              .maybeSingle();
            if (teacherRow) {
              isAuthorizedForSchool = true;
            }
          }
        }

        // Sinkronkan school_id pada profil HANYA jika terverifikasi sah
        if (isAuthorizedForSchool && profile.school_id !== targetSchoolId) {
          await admin.from('profiles').update({ school_id: targetSchoolId }).eq('id', userId);
        }
      }
    } catch (authCheckErr: any) {
      console.warn('[attendance API] auth check warning:', authCheckErr?.message);
    }
  }

  if (!isAuthorizedForSchool) {
    return json(res, 403, { error: 'Akses ke data sekolah tidak diizinkan.' });
  }

  try {
    if (action === 'save_daily') {
      if (!ALLOWED_ROLES.includes(userRole)) {
        return json(res, 403, { error: 'Role pengguna Anda tidak memiliki hak akses mencatat absensi.' });
      }

      const { date, type, subjectId, classId, targetStudentIds, payload } = body;
      if (!date) return json(res, 400, { error: 'Tanggal absensi wajib disertakan.' });

      // 1. Bersihkan record absensi lama untuk siswa target atau kelas target pada tanggal & moda tersebut
      // Jika targetStudentIds diberikan, bersihkan siswa-siswa tersebut.
      // Jika targetStudentIds kosong tapi classId ada, bersihkan seluruh kelas pada tanggal tersebut.
      let del = admin
        .from('attendance_records')
        .delete()
        .eq('date', date)
        .eq('type', type || 'DAILY');

      if (targetSchoolId) {
        del = del.eq('school_id', targetSchoolId);
      }
      if (type === 'SUBJECT' && subjectId) {
        del = del.eq('subject_id', subjectId);
      }

      if (Array.isArray(targetStudentIds) && targetStudentIds.length > 0) {
        del = del.in('student_id', targetStudentIds);
      } else if (classId) {
        del = del.eq('class_id', classId);
      }

      const { error: delError } = await del;
      if (delError) {
        return json(res, 500, { error: `Gagal membersihkan data lama: ${delError.message}` });
      }

      // 2. Simpan record absensi baru (hanya yang memiliki status presensi valid)
      if (Array.isArray(payload) && payload.length > 0) {
        const validPayload = payload.filter(
          (r: any) => Boolean(r && r.status && r.status !== '-' && (r.student_id || r.studentId))
        );

        const normalizedPayload = validPayload.map((r: any) => ({
          school_id: targetSchoolId || r.school_id || profile.school_id,
          date: r.date || date,
          student_id: r.student_id || r.studentId,
          class_id: r.class_id || r.classId || classId || null,
          type: r.type || type || 'DAILY',
          subject_id: r.subject_id || r.subjectId || (type === 'SUBJECT' ? subjectId : null),
          teacher_id: r.teacher_id || r.teacherId || profile.teacher_id || null,
          status: r.status,
          check_in_time: r.check_in_time || r.checkInTime || null,
          check_out_time: r.check_out_time || r.checkOutTime || null,
          notes: r.notes || null,
          updated_by: userId,
        }));

        if (normalizedPayload.length > 0) {
          // Coba upsert terlebih dahulu jika tabel memiliki unique constraint
          let saveSuccess = false;
          let lastInsertError: any = null;

          try {
            const { data: upserted, error: upsertErr } = await admin
              .from('attendance_records')
              .upsert(normalizedPayload, {
                onConflict: 'school_id,student_id,date,type,subject_id',
                ignoreDuplicates: false,
              })
              .select('id');

            if (!upsertErr) {
              saveSuccess = true;
              return json(res, 200, { ok: true, count: upserted?.length || normalizedPayload.length });
            } else {
              lastInsertError = upsertErr;
            }
          } catch (e: any) {
            lastInsertError = e;
          }

          // Jika upsert gagal (misal belum ada constraint unik di DB lama), lakukan insert langsung
          if (!saveSuccess) {
            const { data: inserted, error: insertError } = await admin
              .from('attendance_records')
              .insert(normalizedPayload)
              .select('id');

            if (insertError) {
              return json(res, 500, {
                error: `Gagal menyimpan data absensi: ${insertError.message || lastInsertError?.message}`,
              });
            }

            return json(res, 200, { ok: true, count: inserted?.length || normalizedPayload.length });
          }
        }
      }

      return json(res, 200, { ok: true, count: 0, message: 'Data absensi berhasil direset.' });
    }

    if (action === 'submit_student') {
      const { payload, existingId } = body;
      if (!payload) return json(res, 400, { error: 'Payload absensi wajib disertakan.' });

      const normalizedPayload = {
        ...payload,
        school_id: targetSchoolId || payload.school_id || profile.school_id,
        updated_by: userId,
      };

      if (existingId) {
        const { data, error } = await admin
          .from('attendance_records')
          .update(normalizedPayload)
          .eq('id', existingId)
          .select()
          .single();
        if (error) return json(res, 500, { error: error.message });
        return json(res, 200, { ok: true, record: data });
      } else {
        const { data, error } = await admin
          .from('attendance_records')
          .insert(normalizedPayload)
          .select()
          .single();
        if (error) return json(res, 500, { error: error.message });
        return json(res, 200, { ok: true, record: data });
      }
    }

    return json(res, 400, { error: 'Aksi tidak dikenali.' });
  } catch (err: any) {
    return json(res, 500, { error: err?.message || 'Terjadi kesalahan pada server saat memproses absensi.' });
  }
}
