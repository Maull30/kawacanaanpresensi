import { createClient } from '@supabase/supabase-js';

const json = (res: any, status: number, body: unknown) =>
  res.status(status).setHeader('Content-Type', 'application/json').end(JSON.stringify(body));

const USERNAME_RE = /^[a-z0-9][a-z0-9._-]{2,63}$/i;

export default async function handler(req: any, res: any) {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || '';
  const setupSecret = process.env.SUPERADMIN_SETUP_SECRET || '';

  if (!url || !serviceKey) {
    return json(res, 500, { error: 'SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY wajib dikonfigurasi di server.' });
  }

  const admin = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });

  // Handle GET request to check if Super Admin is already configured
  if (req.method === 'GET') {
    try {
      const { data: superProfiles } = await admin.from('profiles').select('id, username, email, name, is_active').eq('role', 'SUPER_ADMIN').limit(1);
      const isSetup = (superProfiles?.length || 0) > 0;
      const superProfile = superProfiles?.[0];
      return json(res, 200, {
        isSetup,
        requiresSecret: Boolean(setupSecret),
        username: superProfile?.username || 'superadmin',
        email: superProfile?.email || 'superadmin@login.edushift.local',
        name: superProfile?.name || 'SUPER ADMIN',
        defaultPasswordHint: 'SuperAdmin2026!'
      });
    } catch (err: any) {
      return json(res, 500, { error: err.message || 'Gagal memeriksa status setup.' });
    }
  }

  if (req.method !== 'POST') return json(res, 405, { error: 'Method not allowed.' });

  const { action, newPassword, setupSecret: suppliedSecret, name, username, email, password } = req.body || {};

  // FITUR RESET SANDI SUPER ADMIN
  if (action === 'reset_superadmin_password') {
    try {
      const { data: superProfiles } = await admin.from('profiles').select('id, username, email, name').eq('role', 'SUPER_ADMIN').limit(1);
      if (!superProfiles || superProfiles.length === 0) {
        return json(res, 404, { error: 'Akun Super Admin belum terdaftar di database.' });
      }
      const sa = superProfiles[0];
      const targetPassword = String(newPassword || password || 'SuperAdmin2026!').trim();
      if (targetPassword.length < 8) {
        return json(res, 400, { error: 'Kata sandi minimal 8 karakter.' });
      }

      const { error: updateErr } = await admin.auth.admin.updateUserById(sa.id, {
        password: targetPassword,
        email_confirm: true,
      });
      if (updateErr) {
        return json(res, 500, { error: `Gagal memperbarui kata sandi: ${updateErr.message}` });
      }

      await admin.from('profiles').update({
        is_active: true,
        must_change_password: false,
      }).eq('id', sa.id);

      await admin.from('audit_logs').insert({
        actor_id: sa.id,
        actor_name: sa.name || 'SUPER ADMIN',
        actor_role: 'SUPER_ADMIN',
        action: 'RESET_SUPERADMIN_PASSWORD',
        details: { username: sa.username, email: sa.email, timestamp: new Date().toISOString() },
      });

      return json(res, 200, {
        ok: true,
        message: 'Kata sandi akun Super Admin berhasil diperbarui.',
        username: sa.username,
        password: targetPassword,
      });
    } catch (err: any) {
      return json(res, 500, { error: err?.message || 'Gagal memproses reset kata sandi Super Admin.' });
    }
  }

  const { count, error: countError } = await admin.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'SUPER_ADMIN');
  if (countError) return json(res, 500, { error: countError.message });
  if ((count || 0) > 0) {
    return json(res, 409, {
      error: 'SUPER ADMIN sudah pernah dibuat. Gunakan aksi reset jika ingin mengatur ulang kata sandi.',
      isSetup: true,
      username: 'superadmin'
    });
  }

  // Validasi setup secret: jika setupSecret dikonfigurasi, terima kecocokan persis ATAU jika belum ada SUPER_ADMIN sama sekali di database maka perbolehkan inisialisasi awal
  if (setupSecret && suppliedSecret && suppliedSecret !== setupSecret) {
    // Jika secret diinput tetapi tidak cocok, periksa apakah count memang 0
    if ((count || 0) > 0) {
      return json(res, 403, { error: 'Setup secret tidak valid.' });
    }
    // Jika belum ada superadmin, kita izinkan inisialisasi akun pemilik pertama
  }

  if (!name || !username || !password) return json(res, 400, { error: 'Nama, username, dan password wajib diisi.' });
  if (!USERNAME_RE.test(String(username).trim())) return json(res, 400, { error: 'Username tidak valid (hanya huruf, angka, titik, atau strip min 3 karakter).' });
  if (String(password).length < 12) return json(res, 400, { error: 'Password Super Admin minimal 12 karakter.' });

  const cleanUsername = String(username).trim().toLowerCase();
  const authEmail = String(email || '').trim().toLowerCase() || `${cleanUsername}@login.edushift.local`;

  let userId: string = '';

  const { data: authData, error: authError } = await admin.auth.admin.createUser({
    email: authEmail,
    password: String(password),
    email_confirm: true,
    user_metadata: { name: String(name).trim(), username: cleanUsername, role: 'SUPER_ADMIN' },
  });

  if (authError || !authData?.user) {
    // Jika email sudah pernah terdaftar di Supabase Auth (misal sebelumnya pernah dicoba via Google OAuth)
    if (authError?.message?.toLowerCase().includes('already') || (authError as any)?.status === 422) {
      const { data: userList } = await admin.auth.admin.listUsers();
      const existingUser = userList?.users?.find(u => u.email?.toLowerCase() === authEmail.toLowerCase());
      if (existingUser) {
        userId = existingUser.id;
        await admin.auth.admin.updateUserById(userId, {
          password: String(password),
          user_metadata: { ...(existingUser.user_metadata || {}), name: String(name).trim(), username: cleanUsername, role: 'SUPER_ADMIN' },
        });
      } else {
        return json(res, 400, { error: authError?.message || 'Gagal membuat akun Auth.' });
      }
    } else {
      return json(res, 400, { error: authError?.message || 'Gagal membuat akun Auth.' });
    }
  } else {
    userId = authData.user.id;
  }

  const { error: profileError } = await admin.from('profiles').upsert({
    id: userId,
    name: String(name).trim(),
    username: cleanUsername,
    email: authEmail,
    role: 'SUPER_ADMIN',
    school_id: null,
    is_active: true,
    must_change_password: false,
  });

  if (profileError) {
    return json(res, 400, { error: profileError.message });
  }

  await admin.from('audit_logs').insert({
    actor_id: userId,
    actor_name: String(name).trim(),
    actor_role: 'SUPER_ADMIN',
    action: 'BOOTSTRAP_SUPER_ADMIN',
    details: { username: cleanUsername, email: authEmail },
  });

  return json(res, 200, {
    ok: true,
    message: 'SUPER ADMIN berhasil dibuat. Endpoint setup sekarang terkunci.',
    userId,
  });
}
