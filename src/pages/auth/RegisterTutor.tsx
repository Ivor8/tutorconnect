import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Logo } from '@/components/Logo';
import { toast } from '@/components/ui/use-toast';
import { Field } from './RegisterStudent';

const SUBJECTS = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science', 'English', 'French', 'Economics', 'Accounting', 'Law', 'Engineering', 'Medicine'];

const RegisterTutor: React.FC = () => {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ full_name: '', username: '', email: '', phone: '', password: '', bio: '', qualifications: '', experience_years: 0, hourly_rate: 5000 });
  const [subjects, setSubjects] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const toggleSubj = (s: string) => setSubjects(arr => arr.includes(s) ? arr.filter(x => x !== s) : [...arr, s]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password.length < 6) return toast({ title: 'Password too short' });
    if (!/^[a-zA-Z0-9_]{3,}$/.test(form.username)) return toast({ title: 'Invalid username' });
    if (subjects.length === 0) return toast({ title: 'Select at least one subject' });
    setLoading(true);
    const res = await signUp({ ...form, role: 'tutor', subjects });
    setLoading(false);
    if (res.error) return toast({ title: 'Failed', description: res.error });
    toast({ title: 'Welcome tutor!', description: 'Your tutor account is ready.' });
    navigate('/tutor/dashboard');
  };

  const upd = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="px-6 py-5"><Logo /></div>
      <div className="max-w-2xl mx-auto p-4 pb-12">
        <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-7">
          <div className="text-xs uppercase tracking-wider text-orange-400 font-semibold mb-2">Tutor Registration</div>
          <h1 className="text-2xl font-bold mb-6">Set up your tutor profile</h1>
          <form onSubmit={submit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Full Name" value={form.full_name} onChange={v => upd('full_name', v)} required />
              <Field label="Username" value={form.username} onChange={v => upd('username', v)} required />
              <Field label="Email" type="email" value={form.email} onChange={v => upd('email', v)} required />
              <Field label="Phone" value={form.phone} onChange={v => upd('phone', v)} />
              <Field label="Password" type="password" value={form.password} onChange={v => upd('password', v)} required />
              <Field label="Hourly Rate (XAF)" type="number" value={String(form.hourly_rate)} onChange={v => upd('hourly_rate', Number(v))} />
              <Field label="Years of Experience" type="number" value={String(form.experience_years)} onChange={v => upd('experience_years', Number(v))} />
              <Field label="Qualifications" value={form.qualifications} onChange={v => upd('qualifications', v)} hint="e.g. BSc Mathematics, B.Ed, M.Sc" />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1.5">Short Bio</label>
              <textarea
                value={form.bio}
                onChange={(e) => upd('bio', e.target.value)}
                rows={3}
                className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-orange-500"
                placeholder="Tell students about yourself..."
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-slate-400 mb-2">Subjects You Teach *</label>
              <div className="flex flex-wrap gap-2">
                {SUBJECTS.map(s => (
                  <button key={s} type="button" onClick={() => toggleSubj(s)} className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${subjects.includes(s) ? 'bg-orange-500/20 border-orange-500/50 text-orange-300' : 'bg-white/5 border-white/10 text-slate-300 hover:border-white/30'}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <button disabled={loading} className="w-full py-2.5 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 font-semibold disabled:opacity-60">
              {loading ? 'Creating account...' : 'Create Tutor Account'}
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

export default RegisterTutor;
