import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { DashboardLayout } from '@/components/Layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/use-toast';
import { Check, X, Search, Info } from 'lucide-react';

const SUBJECTS = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science', 'English', 'French', 'Economics', 'Accounting', 'Law', 'Engineering', 'Medicine'];

const CreateClass: React.FC<{ editMode?: boolean }> = ({ editMode }) => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const { classId } = useParams();

  const [form, setForm] = useState({
    title: '',
    description: '',
    subject: 'Mathematics',
    session_date: '',
    session_time: '',
    duration_minutes: 60,
    price: 5000,
    meet_link: '',
  });

  const [username, setUsername] = useState('');
  const [studentCheck, setStudentCheck] = useState<{ status: 'idle' | 'checking' | 'ok' | 'fail'; student?: any }>({ status: 'idle' });
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (editMode && classId) {
      (async () => {
        const { data } = await supabase
          .from('tutoring_sessions')
          .select('*')
          .eq('id', classId)
          .maybeSingle();
        if (data) {
          setForm({
            title: data.title,
            description: data.description || '',
            subject: data.subject,
            session_date: data.session_date,
            session_time: data.session_time?.slice(0, 5),
            duration_minutes: data.duration_minutes,
            price: data.price,
            meet_link: data.meet_link,
          });
          if (data.student_id) {
            const { data: student } = await supabase
              .from('profiles')
              .select('id, username, full_name, avatar_url')
              .eq('id', data.student_id)
              .maybeSingle();
            if (student) {
              setUsername(student.username);
              setStudentCheck({ status: 'ok', student });
            }
          }
        }
      })();
    }
  }, [classId, editMode]);

  const verifyUsername = async () => {
    if (!username.trim()) return;
    setStudentCheck({ status: 'checking' });
    try {
      const { data, error } = await supabase.from('profiles').select('id, username, full_name, avatar_url').eq('username', username.trim()).eq('role', 'student').maybeSingle();
      if (error) {
        console.error('Username verification error:', error);
        setStudentCheck({ status: 'fail' });
        toast({ title: 'Verification error', description: error.message });
        return;
      }
      if (data) {
        setStudentCheck({ status: 'ok', student: data });
      } else {
        setStudentCheck({ status: 'fail' });
      }
    } catch (err) {
      console.error('Username verification failed:', err);
      setStudentCheck({ status: 'fail' });
      toast({ title: 'Verification failed', description: 'Unable to check username. Please try again.' });
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    if (studentCheck.status !== 'ok' || !studentCheck.student) {
      return toast({ title: 'Verify student username first', description: 'Click "Verify" next to the username field.' });
    }
    if (!form.meet_link.startsWith('http')) return toast({ title: 'Invalid Google Meet link' });
    setLoading(true);

    if (editMode && classId) {
      const { error } = await supabase.from('tutoring_sessions').update({
        ...form,
        student_id: studentCheck.student.id,
        updated_at: new Date().toISOString(),
      }).eq('id', classId);
      setLoading(false);
      if (error) return toast({ title: 'Failed', description: error.message });
      toast({ title: 'Class updated' });
      navigate('/tutor/classes');
    } else {
      const { data, error } = await supabase.from('tutoring_sessions').insert({
        ...form,
        tutor_id: profile.id,
        student_id: studentCheck.student.id,
      }).select().single();
      if (!error && data) {
        await supabase.from('notifications').insert({
          user_id: studentCheck.student.id,
          type: 'new_class',
          title: 'New class scheduled',
          body: `${profile.full_name} created "${form.title}" for you`,
          link: `/student/classes/${data.id}`,
        });
      }
      setLoading(false);
      if (error) return toast({ title: 'Failed', description: error.message });
      toast({ title: 'Class created!', description: `Sent to @${studentCheck.student.username}` });
      navigate('/tutor/classes');
    }
  };

  const upd = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  return (
    <DashboardLayout title={editMode ? 'Edit Class' : 'Create a New Class'}>
      <div className="max-w-3xl">
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-6 flex gap-3 text-sm">
          <Info size={18} className="text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-slate-300">
            <p className="font-medium text-blue-300 mb-1">Before you start</p>
            <p>1. Create a Google Meet event externally and copy the link.<br/>
              2. Enter the exact <strong>username</strong> of the student you want to teach.<br/>
              3. The student will see this class instantly and pay to unlock the Meet link.</p>
          </div>
        </div>

        <form onSubmit={submit} className="bg-white/[0.04] border border-white/10 rounded-2xl p-6 space-y-5">
          <FormRow label="Session Title" required>
            <input required value={form.title} onChange={(e) => upd('title', e.target.value)} className="form-input" placeholder="e.g. Calculus Revision Session" />
          </FormRow>

          <FormRow label="Description">
            <textarea value={form.description} onChange={(e) => upd('description', e.target.value)} rows={3} className="form-input" placeholder="What will you cover?" />
          </FormRow>

          <div className="grid sm:grid-cols-2 gap-4">
            <FormRow label="Subject" required>
              <select value={form.subject} onChange={(e) => upd('subject', e.target.value)} className="form-input">
                {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </FormRow>
            <FormRow label="Price (XAF)" required>
              <input type="number" required min={100} value={form.price} onChange={(e) => upd('price', Number(e.target.value))} className="form-input" />
            </FormRow>
            <FormRow label="Date" required>
              <input type="date" required value={form.session_date} onChange={(e) => upd('session_date', e.target.value)} className="form-input" />
            </FormRow>
            <FormRow label="Time" required>
              <input type="time" required value={form.session_time} onChange={(e) => upd('session_time', e.target.value)} className="form-input" />
            </FormRow>
            <FormRow label="Duration (minutes)" required>
              <select value={form.duration_minutes} onChange={(e) => upd('duration_minutes', Number(e.target.value))} className="form-input">
                <option value={30}>30 minutes</option>
                <option value={60}>1 hour</option>
                <option value={90}>1.5 hours</option>
                <option value={120}>2 hours</option>
              </select>
            </FormRow>
            <FormRow label="Google Meet Link" required>
              <input required value={form.meet_link} onChange={(e) => upd('meet_link', e.target.value)} className="form-input" placeholder="https://meet.google.com/..." />
            </FormRow>
          </div>

          <FormRow label="Student Username" required hint="The exact username of your student">
            <div className="flex gap-2">
              <input
                required
                value={username}
                onChange={(e) => { setUsername(e.target.value); setStudentCheck({ status: 'idle' }); }}
                className="form-input flex-1"
                placeholder="e.g. john_doe"
              />
              <button type="button" onClick={verifyUsername} disabled={!username || studentCheck.status === 'checking'} className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15 border border-white/10 text-sm inline-flex items-center gap-1 disabled:opacity-50">
                <Search size={14} /> Verify
              </button>
            </div>
            {studentCheck.status === 'checking' && <p className="text-xs text-slate-400 mt-2">Checking...</p>}
            {studentCheck.status === 'ok' && studentCheck.student && (
              <div className="mt-2 p-3 rounded-lg bg-green-500/10 border border-green-500/30 flex items-center gap-2 text-sm">
                <Check size={16} className="text-green-400" />
                <span>Found: <strong>{studentCheck.student.full_name}</strong> (@{studentCheck.student.username})</span>
              </div>
            )}
            {studentCheck.status === 'fail' && (
              <div className="mt-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center gap-2 text-sm text-red-300">
                <X size={16} /> Student not found. Please check the username.
              </div>
            )}
          </FormRow>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => navigate(-1)} className="px-5 py-2.5 rounded-lg border border-white/10 hover:bg-white/5 text-sm">Cancel</button>
            <button type="submit" disabled={loading || studentCheck.status !== 'ok'} className="flex-1 sm:flex-none px-6 py-2.5 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 font-semibold disabled:opacity-50">
              {loading ? 'Saving...' : editMode ? 'Update Class' : 'Create Class'}
            </button>
          </div>
        </form>
      </div>
      <style>{`.form-input { width: 100%; padding: 0.625rem 0.75rem; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 0.5rem; font-size: 0.875rem; color: white; outline: none; }
      .form-input:focus { border-color: rgb(249,115,22); }`}</style>
    </DashboardLayout>
  );
};

const FormRow: React.FC<{ label: string; required?: boolean; hint?: string; children: React.ReactNode }> = ({ label, required, hint, children }) => (
  <div>
    <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1.5">{label}{required && ' *'}</label>
    {children}
    {hint && <p className="text-[11px] text-slate-500 mt-1">{hint}</p>}
  </div>
);

export default CreateClass;
