import { createClient } from '@supabase/supabase-js';
const json=(res:any,status:number,body:unknown)=>res.status(status).setHeader('Content-Type','application/json').end(JSON.stringify(body));
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return json(res, 405, { error: 'Method not allowed' });
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || '';
  if (!url || !key) return json(res, 500, { error: 'Server configuration missing' });
  const identifier = String(req.body?.username || '').trim().toLowerCase();
  if (!identifier) return json(res, 400, { error: 'Identifier wajib diisi' });

  const db = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });

  // 1. Khusus superadmin alias
  if (identifier === 'superadmin' || identifier === 'd4rkbarbarian@gmail.com' || identifier === 'd4rkbarbarian') {
    const { data: superAdmin } = await db.from('profiles').select('email').eq('role', 'SUPER_ADMIN').eq('is_active', true).maybeSingle();
    if (superAdmin?.email) {
      return json(res, 200, { ok: true, email: superAdmin.email });
    }
  }

  // 2. Cari di profiles berdasarkan username ATAU email
  let foundEmail = '';
  const { data: userByUsername } = await db.from('profiles')
    .select('email, username')
    .eq('username', identifier)
    .eq('is_active', true)
    .maybeSingle();

  if (userByUsername?.email) {
    foundEmail = userByUsername.email;
  } else {
    const { data: userByEmail } = await db.from('profiles')
      .select('email, username')
      .eq('email', identifier)
      .eq('is_active', true)
      .maybeSingle();
    if (userByEmail?.email) {
      foundEmail = userByEmail.email;
    }
  }

  return json(res, 200, { ok: true, email: foundEmail || (identifier.includes('@') ? identifier : `${identifier}@login.edushift.local`) });
}
