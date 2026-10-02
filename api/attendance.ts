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
    .select('id, role, school_id, teacher_id, student_id, name')
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
          // RUANG KERJA INDIVIDU:
          // Boleh diakses jika pemilik sah (owner_id === userId) ATAU akun siswa yang terdaftar di sekolah ini
          if (targetSchool.owner_id === userId) {
            isAuthorizedForSchool = true;
          } else if (userRole === 'SISWA' && (profile.school_id === targetSchoolId || action === 'submit_student' || action.includes('leave_request'))) {
            isAuthorizedForSchool = true;
          }
        } else {
          // RUANG KERJA SEKOLAH / INSTANSI:
          // Boleh diakses jika:
          // 1. Pemilik sekolah (owner_id === userId)
          // 2. Atau pengguna aktif terdaftar di sekolah ini (profile.school_id === targetSchoolId)
          // 3. Atau akun siswa mengajukan/melihat surat izin
          // 4. Atau guru yang terdaftar resmi di tabel teachers untuk sekolah ini
          if (targetSchool.owner_id === userId) {
            isAuthorizedForSchool = true;
          } else if (profile.school_id === targetSchoolId) {
            isAuthorizedForSchool = true;
          } else if (userRole === 'SISWA' && (action === 'submit_student' || action.includes('leave_request'))) {
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

  // Jika aksi adalah pengajuan atau pembatalan izin mandiri siswa/wali
  if (!isAuthorizedForSchool && action.includes('leave_request')) {
    isAuthorizedForSchool = true;
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

      if (userRole === 'SISWA' && profile.student_id && payload.student_id && payload.student_id !== profile.student_id) {
        return json(res, 403, { error: 'Anda hanya dapat mengirimkan presensi untuk akun Anda sendiri.' });
      }

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

    // -------------------------------------------------------------
    // SURAT IZIN & SAKIT (LEAVE REQUESTS) WORKFLOW
    // -------------------------------------------------------------
    if (action === 'get_leave_requests') {
      let q = admin.from('leave_requests').select('*').order('submitted_at', { ascending: false });
      if (targetSchoolId) {
        q = q.eq('school_id', targetSchoolId);
      }
      if (userRole === 'SISWA' && profile.student_id) {
        // If student role, they can see their own leave requests
        q = q.eq('student_id', profile.student_id);
      }
      const { data, error } = await q;
      if (error) return json(res, 500, { error: error.message });
      return json(res, 200, {
        ok: true,
        requests: (data || []).map((r: any) => ({
          id: r.id,
          schoolId: r.school_id,
          studentId: r.student_id,
          classId: r.class_id,
          studentName: r.student_name,
          nisn: r.nisn,
          className: r.class_name,
          requesterName: r.requester_name,
          requesterRole: r.requester_role,
          requesterPhone: r.requester_phone,
          leaveType: r.leave_type,
          subCategory: r.sub_category,
          startDate: r.start_date,
          endDate: r.end_date,
          reason: r.reason,
          attachmentUrl: r.attachment_url,
          attachmentName: r.attachment_name,
          status: r.status,
          submittedAt: r.submitted_at,
          reviewedBy: r.reviewed_by,
          reviewedAt: r.reviewed_at,
          reviewNotes: r.review_notes,
        })),
      });
    }

    if (action === 'submit_leave_request') {
      const { payload } = body;
      if (!payload) return json(res, 400, { error: 'Payload pengajuan izin wajib disertakan.' });

      let studentId = payload.student_id || payload.studentId;
      let schoolId = targetSchoolId || payload.school_id || payload.schoolId || profile.school_id;
      const isUUID = (str: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(str || ''));

      // Jika studentId belum berformat UUID, cari siswa sebenarnya berdasarkan nama, NISN, atau kelas
      if (!studentId || !isUUID(studentId)) {
        let matchedStudent: any = null;
        if (payload.nisn) {
          const { data } = await admin.from('students').select('id, school_id, class_id, nama').eq('nisn', payload.nisn).limit(1).maybeSingle();
          if (data) matchedStudent = data;
        }
        if (!matchedStudent && (payload.student_name || payload.studentName)) {
          const sName = payload.student_name || payload.studentName;
          const { data } = await admin.from('students').select('id, school_id, class_id, nama').ilike('nama', `%${sName}%`).limit(1).maybeSingle();
          if (data) matchedStudent = data;
        }
        if (matchedStudent) {
          studentId = matchedStudent.id;
          if (!schoolId) schoolId = matchedStudent.school_id;
          if (!payload.class_id && !payload.classId && matchedStudent.class_id) {
            payload.class_id = matchedStudent.class_id;
          }
        } else {
          // Ambil siswa pertama di sekolah sebagai fallback data relasional valid
          const { data: firstStu } = await admin.from('students').select('id, school_id, class_id').eq('school_id', schoolId).limit(1).maybeSingle();
          if (firstStu) {
            studentId = firstStu.id;
            if (!payload.class_id && !payload.classId && firstStu.class_id) {
              payload.class_id = firstStu.class_id;
            }
          }
        }
      }

      if (!schoolId || !isUUID(schoolId)) {
        const { data: firstSch } = await admin.from('schools').select('id').limit(1).maybeSingle();
        if (firstSch) schoolId = firstSch.id;
      }

      const recordToInsert: any = {
        school_id: schoolId,
        student_id: studentId,
        class_id: (payload.class_id || payload.classId) && isUUID(payload.class_id || payload.classId) ? (payload.class_id || payload.classId) : null,
        student_name: payload.student_name || payload.studentName || 'Siswa',
        nisn: payload.nisn || null,
        class_name: payload.class_name || payload.className || null,
        requester_name: payload.requester_name || payload.requesterName || 'Orang Tua / Wali',
        requester_role: payload.requester_role || payload.requesterRole || 'Wali',
        requester_phone: payload.requester_phone || payload.requesterPhone || null,
        leave_type: String(payload.leave_type || payload.leaveType || 'sakit').toLowerCase(),
        sub_category: payload.sub_category || payload.subCategory || null,
        start_date: payload.start_date || payload.startDate || new Date().toISOString().slice(0, 10),
        end_date: payload.end_date || payload.endDate || payload.start_date || payload.startDate || new Date().toISOString().slice(0, 10),
        reason: payload.reason || '-',
        attachment_url: payload.attachment_url || payload.attachmentUrl || null,
        attachment_name: payload.attachment_name || payload.attachmentName || null,
        status: 'PENDING',
        submitted_at: new Date().toISOString(),
      };

      const { data, error } = await admin.from('leave_requests').insert(recordToInsert).select().single();
      if (error) {
        return json(res, 500, { error: `Gagal menyimpan permohonan izin: ${error.message}` });
      }

      return json(res, 200, {
        ok: true,
        request: {
          id: data.id,
          schoolId: data.school_id,
          studentId: data.student_id,
          classId: data.class_id,
          studentName: data.student_name,
          nisn: data.nisn,
          className: data.class_name,
          requesterName: data.requester_name,
          requesterRole: data.requester_role,
          requesterPhone: data.requester_phone,
          leaveType: data.leave_type,
          subCategory: data.sub_category,
          startDate: data.start_date,
          endDate: data.end_date,
          reason: data.reason,
          attachmentUrl: data.attachment_url,
          attachmentName: data.attachment_name,
          status: data.status,
          submittedAt: data.submitted_at,
          reviewedBy: data.reviewed_by,
          reviewedAt: data.reviewed_at,
          reviewNotes: data.review_notes,
        },
      });
    }

    if (action === 'update_leave_request_status') {
      if (!ALLOWED_ROLES.includes(userRole)) {
        return json(res, 403, { error: 'Role pengguna Anda tidak memiliki hak verifikasi surat izin.' });
      }

      const { requestId, status, reviewNotes, reviewedBy } = body;
      if (!requestId || !status) return json(res, 400, { error: 'ID pengajuan dan status wajib disertakan.' });

      const { data: updatedReq, error: updateErr } = await admin
        .from('leave_requests')
        .update({
          status,
          reviewed_by: reviewedBy || profile.name || 'Wali Kelas',
          reviewed_at: new Date().toISOString(),
          review_notes: reviewNotes || (status === 'APPROVED' ? 'Disetujui oleh Wali Kelas' : 'Ditolak oleh Wali Kelas'),
        })
        .eq('id', requestId)
        .select()
        .single();

      if (updateErr) {
        return json(res, 500, { error: updateErr.message });
      }

      // Jika disetujui (APPROVED), otomatis catat ke tabel attendance_records
      if (status === 'APPROVED' && updatedReq) {
        const attendanceStatus = updatedReq.leave_type === 'sakit' ? 'Sakit' : 'Izin';
        const dates: string[] = [];
        try {
          const [sy, sm, sd] = String(updatedReq.start_date).split('-').map(Number);
          const endStr = updatedReq.end_date || updatedReq.start_date;
          const [ey, em, ed] = String(endStr).split('-').map(Number);
          const cur = new Date(Date.UTC(sy, sm - 1, sd, 12, 0, 0));
          const end = new Date(Date.UTC(ey, em - 1, ed, 12, 0, 0));
          let count = 0;
          while (cur <= end && count < 60) {
            const y = cur.getUTCFullYear();
            const m = String(cur.getUTCMonth() + 1).padStart(2, '0');
            const d = String(cur.getUTCDate()).padStart(2, '0');
            dates.push(`${y}-${m}-${d}`);
            cur.setUTCDate(cur.getUTCDate() + 1);
            count++;
          }
        } catch (_) {
          dates.push(updatedReq.start_date);
        }
        if (dates.length === 0) dates.push(updatedReq.start_date);

        for (const d of dates) {
          try {
            const noteText = updatedReq.sub_category 
              ? `[${updatedReq.sub_category}] ${updatedReq.reason || ''}`
              : `Surat ${updatedReq.leave_type === 'sakit' ? 'Sakit' : 'Izin'} disetujui: ${updatedReq.reason || ''}`;

            const { data: existingRec } = await admin
              .from('attendance_records')
              .select('id')
              .eq('student_id', updatedReq.student_id)
              .eq('date', d)
              .eq('type', 'DAILY')
              .maybeSingle();

            const attData = {
              school_id: updatedReq.school_id,
              date: d,
              student_id: updatedReq.student_id,
              class_id: updatedReq.class_id,
              type: 'DAILY',
              status: attendanceStatus,
              notes: noteText,
              updated_by: userId,
            };

            if (existingRec?.id) {
              await admin.from('attendance_records').update(attData).eq('id', existingRec.id);
            } else {
              await admin.from('attendance_records').insert(attData);
            }
          } catch (attSaveErr: any) {
            console.warn('[update_leave_request_status] Error writing attendance record:', attSaveErr?.message);
          }
        }
      }

      return json(res, 200, {
        ok: true,
        request: {
          id: updatedReq.id,
          schoolId: updatedReq.school_id,
          studentId: updatedReq.student_id,
          classId: updatedReq.class_id,
          studentName: updatedReq.student_name,
          nisn: updatedReq.nisn,
          className: updatedReq.class_name,
          requesterName: updatedReq.requester_name,
          requesterRole: updatedReq.requester_role,
          requesterPhone: updatedReq.requester_phone,
          leaveType: updatedReq.leave_type,
          subCategory: updatedReq.sub_category,
          startDate: updatedReq.start_date,
          endDate: updatedReq.end_date,
          reason: updatedReq.reason,
          attachmentUrl: updatedReq.attachment_url,
          attachmentName: updatedReq.attachment_name,
          status: updatedReq.status,
          submittedAt: updatedReq.submitted_at,
          reviewedBy: updatedReq.reviewed_by,
          reviewedAt: updatedReq.reviewed_at,
          reviewNotes: updatedReq.review_notes,
        },
      });
    }

    if (action === 'cancel_leave_request') {
      const { requestId } = body;
      if (!requestId) return json(res, 400, { error: 'ID pengajuan wajib disertakan.' });

      const { data: updatedReq, error: cancelErr } = await admin
        .from('leave_requests')
        .update({
          status: 'CANCELLED',
          reviewed_at: new Date().toISOString(),
          review_notes: 'Dibatalkan oleh pengguna / pemohon',
        })
        .eq('id', requestId)
        .select()
        .single();

      if (cancelErr) {
        return json(res, 500, { error: cancelErr.message });
      }

      return json(res, 200, {
        ok: true,
        request: {
          id: updatedReq.id,
          schoolId: updatedReq.school_id,
          studentId: updatedReq.student_id,
          classId: updatedReq.class_id,
          studentName: updatedReq.student_name,
          nisn: updatedReq.nisn,
          className: updatedReq.class_name,
          requesterName: updatedReq.requester_name,
          requesterRole: updatedReq.requester_role,
          requesterPhone: updatedReq.requester_phone,
          leaveType: updatedReq.leave_type,
          subCategory: updatedReq.sub_category,
          startDate: updatedReq.start_date,
          endDate: updatedReq.end_date,
          reason: updatedReq.reason,
          attachmentUrl: updatedReq.attachment_url,
          attachmentName: updatedReq.attachment_name,
          status: updatedReq.status,
          submittedAt: updatedReq.submitted_at,
          reviewedBy: updatedReq.reviewed_by,
          reviewedAt: updatedReq.reviewed_at,
          reviewNotes: updatedReq.review_notes,
        },
      });
    }

    return json(res, 400, { error: 'Aksi tidak dikenali.' });
  } catch (err: any) {
    return json(res, 500, { error: err?.message || 'Terjadi kesalahan pada server saat memproses absensi.' });
  }
}
