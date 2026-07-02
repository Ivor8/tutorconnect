import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/Layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/use-toast';
import { Bell, Heart, Star, Wallet, Calendar, User, Settings as SettingsIcon } from 'lucide-react';
import { TutorCard } from './Tutors';

export const Notifications: React.FC = () => {
  const { profile } = useAuth();
  const [notifs, setNotifs] = useState<any[]>([]);
  useEffect(() => {
    if (!profile) return;
    const load = async () => {
      const { data } = await supabase.from('notifications').select('*').eq('user_id', profile.id).order('created_at', { ascending: false });
      setNotifs(data || []);
      await supabase.from('notifications').update({ is_read: true }).eq('user_id', profile.id).eq('is_read', false);
    };
    load();
    const ch = supabase.channel(`notifs-${profile.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${profile.id}` }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [profile]);

  return (
    <DashboardLayout title="Notifications">
      {notifs.length === 0 ? (
        <div className="text-center py-20 bg-white/[0.03] border border-dashed border-white/10 rounded-2xl">
          <Bell className="mx-auto text-slate-600 mb-3" size={42} />
          <p className="text-slate-400">No notifications yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifs.map(n => (
            <Link key={n.id} to={n.link || '#'} className="block p-4 rounded-xl bg-white/[0.04] border border-white/10 hover:border-orange-500/40">
              <div className="flex justify-between gap-3">
                <div>
                  <div className="font-medium text-sm">{n.title}</div>
                  <p className="text-sm text-slate-400 mt-0.5">{n.body}</p>
                </div>
                <span className="text-[10px] text-slate-500 whitespace-nowrap">{new Date(n.created_at).toLocaleString()}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export const Favourites: React.FC = () => {
  const { profile } = useAuth();
  const [tutors, setTutors] = useState<any[]>([]);
  useEffect(() => {
    if (!profile) return;
    (async () => {
      const { data } = await supabase.from('favourites').select('tutor:profiles!favourites_tutor_id_fkey(*)').eq('student_id', profile.id);
      setTutors((data || []).map((f: any) => f.tutor).filter(Boolean));
    })();
  }, [profile]);
  return (
    <DashboardLayout title="Favourite Tutors">
      {tutors.length === 0 ? (
        <div className="text-center py-20 bg-white/[0.03] border border-dashed border-white/10 rounded-2xl">
          <Heart className="mx-auto text-slate-600 mb-3" size={42} />
          <p className="text-slate-400 mb-3">No favourites yet.</p>
          <Link to="/tutors" className="text-orange-400 hover:text-orange-300 text-sm font-medium">Browse tutors →</Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {tutors.map(t => <TutorCard key={t.id} t={t} />)}
        </div>
      )}
    </DashboardLayout>
  );
};

export const Payments: React.FC = () => {
  const { profile } = useAuth();
  const [pays, setPays] = useState<any[]>([]);
  useEffect(() => {
    if (!profile) return;
    (async () => {
      const col = profile.role === 'tutor' ? 'tutor_id' : 'student_id';
      const { data } = await supabase.from('payments').select('*, session:tutoring_sessions(title, subject), student:profiles!payments_student_id_fkey(full_name), tutor:profiles!payments_tutor_id_fkey(full_name)').eq(col, profile.id).order('created_at', { ascending: false });
      setPays(data || []);
    })();
  }, [profile]);

  const total = pays.reduce((s, p) => s + (p.amount || 0), 0);

  return (
    <DashboardLayout title={profile?.role === 'tutor' ? 'Earnings' : 'Payment History'}>
      <div className="mb-5 p-5 rounded-2xl bg-gradient-to-r from-blue-600/15 to-orange-500/15 border border-white/10">
        <div className="text-xs uppercase tracking-wider text-slate-400">{profile?.role === 'tutor' ? 'Total Earnings' : 'Total Spent'}</div>
        <div className="text-3xl font-bold mt-1">{total.toLocaleString()} XAF</div>
      </div>
      {pays.length === 0 ? (
        <div className="text-center py-16 rounded-2xl border border-dashed border-white/10">
          <Wallet className="mx-auto text-slate-600 mb-3" size={36} />
          <p className="text-slate-400">No payments yet.</p>
        </div>
      ) : (
        <div className="bg-white/[0.04] border border-white/10 rounded-2xl overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-slate-400 border-b border-white/10">
                <th className="p-3">Session</th>
                <th>{profile?.role === 'tutor' ? 'Student' : 'Tutor'}</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {pays.map(p => (
                <tr key={p.id} className="border-b border-white/5">
                  <td className="p-3">{p.session?.title}</td>
                  <td>{profile?.role === 'tutor' ? p.student?.full_name : p.tutor?.full_name}</td>
                  <td className="font-medium">{p.amount?.toLocaleString()} XAF</td>
                  <td><span className="text-[10px] uppercase px-2 py-0.5 rounded bg-white/10">{p.method}</span></td>
                  <td className="text-xs text-slate-400">{new Date(p.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardLayout>
  );
};

export const Reviews: React.FC = () => {
  const { profile } = useAuth();
  const [reviews, setReviews] = useState<any[]>([]);
  useEffect(() => {
    if (!profile) return;
    (async () => {
      const col = profile.role === 'tutor' ? 'tutor_id' : 'student_id';
      const { data } = await supabase.from('reviews').select('*, tutor:profiles!reviews_tutor_id_fkey(full_name), student:profiles!reviews_student_id_fkey(full_name)').eq(col, profile.id).order('created_at', { ascending: false });
      setReviews(data || []);
    })();
  }, [profile]);
  return (
    <DashboardLayout title="Reviews">
      {reviews.length === 0 ? (
        <div className="text-center py-20 bg-white/[0.03] border border-dashed border-white/10 rounded-2xl">
          <Star className="mx-auto text-slate-600 mb-3" size={42} />
          <p className="text-slate-400">No reviews yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map(r => (
            <div key={r.id} className="p-5 rounded-2xl bg-white/[0.04] border border-white/10">
              <div className="flex items-center gap-2 mb-2">
                {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={14} className={i < r.rating ? 'fill-orange-400 text-orange-400' : 'text-slate-700'} />)}
                <span className="text-xs text-slate-400 ml-2">{profile?.role === 'tutor' ? `from ${r.student?.full_name}` : `for ${r.tutor?.full_name}`}</span>
              </div>
              <p className="text-sm text-slate-300">{r.comment}</p>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export const Students: React.FC = () => {
  const { profile } = useAuth();
  const [students, setStudents] = useState<any[]>([]);
  useEffect(() => {
    if (!profile) return;
    (async () => {
      const { data: sessions } = await supabase
        .from('tutoring_sessions')
        .select('student_id')
        .eq('tutor_id', profile.id);

      const studentIds = Array.from(
        new Set((sessions || []).map((s: any) => s.student_id).filter(Boolean))
      );

      if (studentIds.length === 0) {
        setStudents([]);
        return;
      }

      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, username, email, avatar_url')
        .in('id', studentIds);

      setStudents(profiles || []);
    })();
  }, [profile]);
  return (
    <DashboardLayout title="My Students">
      {students.length === 0 ? (
        <div className="text-center py-20 bg-white/[0.03] border border-dashed border-white/10 rounded-2xl">
          <User className="mx-auto text-slate-600 mb-3" size={42} />
          <p className="text-slate-400">No students yet.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {students.map((s: any) => (
            <div key={s.id} className="p-5 rounded-2xl bg-white/[0.04] border border-white/10">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-orange-500 flex items-center justify-center font-bold">{s.full_name?.[0]}</div>
                <div>
                  <div className="font-semibold">{s.full_name}</div>
                  <div className="text-xs text-slate-400">@{s.username}</div>
                </div>
              </div>
              <div className="text-xs text-slate-400">{s.email}</div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export const Profile: React.FC = () => {
  const { profile, refreshProfile } = useAuth();
  const [form, setForm] = useState({ full_name: '', bio: '', phone: '', hourly_rate: 0, qualifications: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (profile) setForm({
      full_name: profile.full_name || '',
      bio: profile.bio || '',
      phone: profile.phone || '',
      hourly_rate: profile.hourly_rate || 0,
      qualifications: profile.qualifications || '',
    });
  }, [profile]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setLoading(true);
    const { error } = await supabase.from('profiles').update(form).eq('id', profile.id);
    setLoading(false);
    if (error) return toast({ title: 'Failed', description: error.message });
    toast({ title: 'Profile updated' });
    refreshProfile();
  };

  if (!profile) return null;

  return (
    <DashboardLayout title="My Profile">
      <form onSubmit={save} className="bg-white/[0.04] border border-white/10 rounded-2xl p-6 max-w-2xl space-y-4">
        <div className="flex items-center gap-4 mb-2">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-600 to-orange-500 flex items-center justify-center text-2xl font-bold">{profile.full_name?.[0]}</div>
          <div>
            <div className="font-semibold text-lg">@{profile.username}</div>
            <div className="text-xs text-slate-400 uppercase tracking-wider">{profile.role}</div>
          </div>
        </div>
        <FormField label="Full Name" value={form.full_name} onChange={(v) => setForm({ ...form, full_name: v })} />
        <FormField label="Phone" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
        <div>
          <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1.5">Bio</label>
          <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows={4} className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-orange-500" />
        </div>
        {profile.role === 'tutor' && (
          <>
            <FormField label="Hourly Rate (XAF)" type="number" value={String(form.hourly_rate)} onChange={(v) => setForm({ ...form, hourly_rate: Number(v) })} />
            <FormField label="Qualifications" value={form.qualifications} onChange={(v) => setForm({ ...form, qualifications: v })} />
          </>
        )}
        <button disabled={loading} className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-orange-500 font-semibold disabled:opacity-50">
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </DashboardLayout>
  );
};

export const Settings: React.FC = () => {
  const { profile } = useAuth();
  return (
    <DashboardLayout title="Settings">
      <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-6 max-w-2xl">
        <h3 className="font-semibold mb-4">Account</h3>
        <div className="space-y-3 text-sm">
          <Row label="Email" value={profile?.email || ''} />
          <Row label="Username" value={`@${profile?.username}`} />
          <Row label="Role" value={profile?.role || ''} />
        </div>
        <div className="mt-6 pt-6 border-t border-white/10">
          <h3 className="font-semibold mb-3">Theme</h3>
          <p className="text-sm text-slate-400">Dark mode is enabled by default. Light mode toggle coming soon.</p>
        </div>
        <div className="mt-6 pt-6 border-t border-white/10">
          <h3 className="font-semibold mb-3">Language</h3>
          <select className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm">
            <option>English</option>
            <option>Français</option>
          </select>
        </div>
      </div>
    </DashboardLayout>
  );
};

const Row: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex justify-between py-2 border-b border-white/5">
    <span className="text-slate-400">{label}</span>
    <span className="font-medium">{value}</span>
  </div>
);

const FormField: React.FC<{ label: string; value: string; onChange: (v: string) => void; type?: string }> = ({ label, value, onChange, type = 'text' }) => (
  <div>
    <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1.5">{label}</label>
    <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-orange-500" />
  </div>
);

export const Availability: React.FC = () => (
  <DashboardLayout title="Availability">
    <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-6">
      <p className="text-slate-400 text-sm">Set your weekly availability so students know when you're available.</p>
      <div className="grid sm:grid-cols-2 gap-3 mt-5">
        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(d => (
          <div key={d} className="flex items-center justify-between p-3 rounded-lg bg-white/[0.03] border border-white/5">
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" defaultChecked className="accent-orange-500" /> {d}</label>
            <div className="flex gap-2 text-xs">
              <input type="time" defaultValue="09:00" className="bg-white/5 border border-white/10 rounded px-2 py-1" />
              <input type="time" defaultValue="17:00" className="bg-white/5 border border-white/10 rounded px-2 py-1" />
            </div>
          </div>
        ))}
      </div>
      <button onClick={() => toast({ title: 'Availability saved' })} className="mt-5 px-5 py-2.5 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 font-semibold text-sm">Save</button>
    </div>
  </DashboardLayout>
);
