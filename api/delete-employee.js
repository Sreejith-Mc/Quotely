import { createClient } from '@supabase/supabase-js';

// Service-role client — only ever constructed inside this server-only function.
const admin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const token = (req.headers.authorization || '').replace('Bearer ', '');
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

  const { id } = req.body || {};
  if (!id) {
    res.status(400).json({ error: 'Employee id is required' });
    return;
  }
  if (id === callerData.user.id) {
    res.status(400).json({ error: 'You cannot remove your own account' });
    return;
  }

  // Deletes the auth user; the profiles row cascades, quotations/audit links null out.
  const { error: delErr } = await admin.auth.admin.deleteUser(id);
  if (delErr) {
    res.status(400).json({ error: delErr.message });
    return;
  }

  res.status(200).json({ ok: true });
}
