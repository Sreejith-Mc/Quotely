import { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient.js';
import { useToast } from '../../context/ToastContext.jsx';
import { initialsOf } from '../../lib/calc.js';
import AddEmployeeModal from './AddEmployeeModal.jsx';

export default function Employees() {
  const toast = useToast();
  const [employees, setEmployees] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

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
          <div style={{ minWidth: 520 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '40px 1fr 1fr 90px 100px', padding: '11px 18px', font: '600 10px Manrope', color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '1px solid var(--border)' }}>
              <div></div><div>Name</div><div>Email</div><div>Role</div><div style={{ textAlign: 'right' }}>Status</div>
            </div>
            {employees.length === 0 && <div style={{ padding: '24px 18px', color: 'var(--ink-3)', font: '500 13px Manrope' }}>No employees yet.</div>}
            {employees.map((emp) => (
              <div key={emp.id} style={{ display: 'grid', gridTemplateColumns: '40px 1fr 1fr 90px 100px', padding: '11px 18px', alignItems: 'center', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
                <span style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--green-soft)', color: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', font: '800 11px Manrope' }}>{initialsOf(emp.name)}</span>
                <div style={{ fontWeight: 600 }}>{emp.name || '—'}</div>
                <div style={{ color: 'var(--ink-2)' }}>{emp.email}</div>
                <div style={{ textTransform: 'capitalize', color: 'var(--ink-2)' }}>{emp.role}</div>
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
              </div>
            ))}
          </div>
        </div>
      </div>
      {modalOpen && <AddEmployeeModal onClose={() => setModalOpen(false)} onInvite={invite} />}
    </>
  );
}
