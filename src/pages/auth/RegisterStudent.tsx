import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Logo } from '@/components/Logo';
import { toast } from '@/components/ui/use-toast';

const RegisterStudent: React.FC = () => {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ full_name: '', username: '', email: '', phone: '', password: '' });
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password.length < 6) return toast({ title: 'Password too short', description: 'Use at least 6 characters' });
    if (!/^[a-zA-Z0-9_]{3,}$/.test(form.username)) return toast({ title: 'Invalid username', description: 'Letters, numbers, underscores only' });
    setLoading(true);
    const res = await signUp({ ...form, role: 'student' });
    setLoading(false);
    if (res.error) return toast({ title: 'Registration failed', description: res.error });
    toast({ title: 'Welcome!', description: 'Your student account is ready.' });
    navigate('/student/dashboard');
  };

  const upd = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="px-6 py-5"><Logo /></div>
      <div className="max-w-md mx-auto p-4 pb-12">
        <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-7">
          <div className="text-xs uppercase tracking-wider text-blue-400 font-semibold mb-2">Student Registration</div>
          <h1 className="text-2xl font-bold mb-6">Create your account</h1>
          <form onSubmit={submit} className="space-y-4">
            <Field label="Full Name" value={form.full_name} onChange={(v) => upd('full_name', v)} required />
            <Field label="Username" value={form.username} onChange={(v) => upd('username', v)} required hint="Tutors use this to assign you classes" />
            <Field label="Email" type="email" value={form.email} onChange={(v) => upd('email', v)} required />
            <Field label="Phone" value={form.phone} onChange={(v) => upd('phone', v)} />
            <Field label="Password" type="password" value={form.password} onChange={(v) => upd('password', v)} required />
            <button disabled={loading} className="w-full py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 font-semibold disabled:opacity-60">
              {loading ? 'Creating account...' : 'Create Student Account'}
            </button>
          </form>
          <p className="text-center text-sm text-slate-400 mt-5">
            Already have one? <Link to="/login" className="text-orange-400">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export const Field: React.FC<{ label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean; hint?: string }> = ({ label, value, onChange, type = 'text', required, hint }) => (
  <div>
    <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1.5">{label}{required && ' *'}</label>
    <input
      type={type}
      required={required}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-orange-500"
    />
    {hint && <p className="text-[11px] text-slate-500 mt-1">{hint}</p>}
  </div>
);

export default RegisterStudent;
