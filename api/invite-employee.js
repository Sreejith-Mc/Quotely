import { createClient } from '@supabase/supabase-js';

// Service-role client — only ever constructed inside this server-only function.
// SUPABASE_SERVICE_ROLE_KEY must be set in the Vercel dashboard, never in client code.
const admin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace('Bearer ', '');
  if (!token) {
    res.status(401).json({ error: 'Missing authorization token' });
    return;
  }

  const { data: callerData, error: callerErr } = await admin.auth.getUser(token);
  if (callerErr || !callerData?.user) {
    res.status(401).json({ error: 'Invalid session' });
    return;
  }

  const { data: callerProfile } = await admin.from('profiles').select('role').eq('id', callerData.user.id).single();
  if (callerProfile?.role !== 'admin') {
    res.status(403).json({ error: 'Admin access required' });
    return;
  }

  const { name, email, password } = req.body || {};
  if (!name || !email || !password) {
    res.status(400).json({ error: 'Name, email and password are required' });
    return;
  }

  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (createErr) {
    res.status(400).json({ error: createErr.message });
    return;
  }

  const { error: profileErr } = await admin
    .from('profiles')
    .upsert({ id: created.user.id, name, email, role: 'employee', active: true });
  if (profileErr) {
    res.status(400).json({ error: profileErr.message });
    return;
  }

  res.status(200).json({ id: created.user.id });
}
