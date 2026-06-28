import { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient.js';
import { useToast } from '../../context/ToastContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { initialsOf } from '../../lib/calc.js';
import AddEmployeeModal from './AddEmployeeModal.jsx';
import ConfirmModal from '../../components/ConfirmModal.jsx';

export default function Employees() {
  const toast = useToast();
  const { session } = useAuth();
  const myId = session?.user?.id;
  const [employees, setEmployees] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [pendingRemove, setPendingRemove] = useState(null);

  async function load() {
    const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    setEmployees(data || []);
  }

  useEffect(() => {
    load();
  }, []);

  async function toggleActive(emp) {
    const { error } = await supabase.from('profiles').update({ active: !emp.active }).eq('id', emp.id);
    if (error) {
      toast('Could not update employee');
      return;
    }
    load();
  }

  async function setRole(emp, role) {
    if (role === emp.role) return;
    const { error } = await supabase.from('profiles').update({ role }).eq('id', emp.id);
    if (error) {
      toast('Could not update role');
      return;
    }
    toast(`${emp.name || emp.email} is now ${role === 'admin' ? 'an Admin' : 'an Employee'}`);
    load();
  }

  async function confirmRemove() {
    const emp = pendingRemove;
    setPendingRemove(null);
    if (!emp) return;
    const { data: { session: s } } = await supabase.auth.getSession();
    const res = await fetch('/api/delete-employee', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${s?.access_token}` },
      body: JSON.stringify({ id: emp.id }),
    });
    const json = await res.json();
    if (!res.ok) {
      toast(json.error || 'Could not remove employee');
      return;
    }
    toast(`${emp.name || emp.email} removed`);
    load();
  }

  async function invite({ name, email, password }) {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const res = await fetch('/api/invite-employee', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token}` },
      body: JSON.stringify({ name, email, password }),
    });
    const json = await res.json();
    if (!res.ok) return json.error || 'Could not send invite';
    setModalOpen(false);
    toast(`Invite sent to ${email}`);
    load();
    return null;
  }

  if (!employees) return null;

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 14 }}>
        <button onClick={() => setModalOpen(true)} style={{ border: 'none', background: 'var(--green)', color: '#fff', cursor: 'pointer', font: '700 13px Manrope', padding: '10px 18px', borderRadius: 11 }}>
          + Add Employee
        </button>
      </div>
      <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 16, boxShadow: 'var(--shadow)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <div style={{ minWidth: 560 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '40px 1fr 1fr 120px 90px 48px', gap: 12, padding: '11px 18px', font: '600 10px Manrope', color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '1px solid var(--border)' }}>
              <div></div><div>Name</div><div>Email</div><div>Role</div><div style={{ textAlign: 'right' }}>Status</div><div></div>
            </div>
            {employees.length === 0 && <div style={{ padding: '24px 18px', color: 'var(--ink-3)', font: '500 13px Manrope' }}>No employees yet.</div>}
            {employees.map((emp) => (
              <div key={emp.id} style={{ display: 'grid', gridTemplateColumns: '40px 1fr 1fr 120px 90px 48px', gap: 12, padding: '11px 18px', alignItems: 'center', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
                <span style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--green-soft)', color: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', font: '800 11px Manrope' }}>{initialsOf(emp.name)}</span>
                <div style={{ fontWeight: 600, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{emp.name || '—'}</div>
                <div style={{ color: 'var(--ink-2)', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{emp.email}</div>
                <div>
                  <select value={emp.role === 'admin' ? 'admin' : 'employee'} onChange={(e) => setRole(emp, e.target.value)} style={{ width: '100%', boxSizing: 'border-box', padding: '6px 8px', border: '1px solid var(--border)', background: 'var(--field)', color: 'var(--ink)', borderRadius: 8, font: '600 12px Manrope', cursor: 'pointer', outline: 'none' }}>
                    <option value="employee">Employee</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <button
                    onClick={() => toggleActive(emp)}
                    style={{
                      border: 'none', cursor: 'pointer', font: '600 11px Manrope', padding: '4px 11px', borderRadius: 20,
                      background: emp.active ? 'var(--green-soft)' : 'var(--panel-2)', color: emp.active ? 'var(--green)' : 'var(--ink-3)',
                    }}
                  >
                    {emp.active ? 'Active' : 'Disabled'}
                  </button>
                </div>
                <div style={{ textAlign: 'center' }}>
                  {emp.id === myId ? (
                    <span style={{ color: 'var(--ink-3)', fontSize: 12 }} title="You can't remove your own account">—</span>
                  ) : (
                    <button onClick={() => setPendingRemove(emp)} title="Remove employee" style={{ border: '1px solid var(--border)', background: 'var(--panel)', color: 'var(--maroon)', cursor: 'pointer', borderRadius: 8, padding: '5px 9px', font: '600 12px Manrope' }}>🗑</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {modalOpen && <AddEmployeeModal onClose={() => setModalOpen(false)} onInvite={invite} />}
      <ConfirmModal
        open={!!pendingRemove}
        title="Remove employee?"
        message={`This permanently deletes ${pendingRemove?.name || pendingRemove?.email}'s account and login access. Their past quotations are kept (still shown under their name).`}
        confirmLabel="Remove"
        danger
        onConfirm={confirmRemove}
        onCancel={() => setPendingRemove(null)}
      />
    </>
  );
}
