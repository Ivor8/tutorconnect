import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { DashboardLayout } from '@/components/Layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Plus, Calendar, Clock, Edit, X, User, Video } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

const TutorClasses: React.FC = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const { classId } = useParams();
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!profile) return;
    const { data } = await supabase
      .from('tutoring_sessions')
      .select('*')
      .eq('tutor_id', profile.id)
      .order('session_date', { ascending: false });

    if (!data) {
      setClasses([]);
      setLoading(false);
      return;
    }

    const studentIds = Array.from(new Set(data.map((item) => item.student_id).filter(Boolean)));
    let studentMap: Record<string, any> = {};
    if (studentIds.length > 0) {
      const { data: students } = await supabase
        .from('profiles')
        .select('id, full_name, username, avatar_url')
        .in('id', studentIds);
      studentMap = (students || []).reduce((acc: Record<string, any>, student: any) => {
        acc[student.id] = student;
        return acc;
      }, {} as Record<string, any>);
    }

    setClasses((data || []).map((item) => ({
      ...item,
      student: studentMap[item.student_id] || null,
    })));
    setLoading(false);
  };

  useEffect(() => {
    load();
    if (!profile) return;
    const ch = supabase.channel('tutor-classes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tutoring_sessions', filter: `tutor_id=eq.${profile.id}` }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [profile]);

  const cancelClass = async (id: string) => {
    if (!confirm('Cancel this class?')) return;
    await supabase.from('tutoring_sessions').update({ session_status: 'cancelled' }).eq('id', id);
    toast({ title: 'Class cancelled' });
    load();
  };

  const focused = classId ? classes.find(c => c.id === classId) : null;

  return (
    <DashboardLayout title="My Classes">
      <div className="flex justify-end mb-5">
        <Link to="/tutor/classes/create" className="px-4 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 font-semibold text-sm inline-flex items-center gap-2">
          <Plus size={16} /> New Class
        </Link>
      </div>
      {loading ? (
        <div className="text-slate-400">Loading...</div>
      ) : focused ? (
        <FocusedClass c={focused} onBack={() => navigate('/tutor/classes')} onCancel={() => cancelClass(focused.id)} />
      ) : classes.length === 0 ? (
        <div className="text-center py-20 bg-white/[0.03] border border-dashed border-white/10 rounded-2xl">
          <Calendar className="mx-auto text-slate-600 mb-3" size={42} />
          <p className="text-slate-300 mb-3">No classes yet</p>
          <Link to="/tutor/classes/create" className="text-orange-400 hover:text-orange-300 text-sm font-medium">Create your first class →</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {classes.map(c => (
            <div key={c.id} className="p-5 rounded-2xl bg-white/[0.04] border border-white/10">
              <div className="flex flex-wrap justify-between gap-4">
                <div onClick={() => navigate(`/tutor/classes/${c.id}`)} className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] uppercase px-2 py-0.5 rounded bg-blue-500/20 text-blue-300">{c.subject}</span>
                    <span className={`text-[10px] uppercase px-2 py-0.5 rounded ${c.payment_status === 'paid' ? 'bg-green-500/20 text-green-300' : 'bg-orange-500/20 text-orange-300'}`}>{c.payment_status}</span>
                    {c.session_status === 'cancelled' && <span className="text-[10px] uppercase px-2 py-0.5 rounded bg-red-500/20 text-red-300">cancelled</span>}
                  </div>
                  <h3 className="font-semibold">{c.title}</h3>
                  <div className="flex flex-wrap gap-4 mt-2 text-xs text-slate-400">
                    <span className="inline-flex items-center gap-1"><User size={12} />{c.student?.full_name} (@{c.student?.username})</span>
                    <span className="inline-flex items-center gap-1"><Calendar size={12} />{c.session_date}</span>
                    <span className="inline-flex items-center gap-1"><Clock size={12} />{c.session_time?.slice(0, 5)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Link to={`/tutor/classes/edit/${c.id}`} className="p-2 rounded-lg border border-white/10 hover:bg-white/5"><Edit size={14} /></Link>
                  {c.session_status !== 'cancelled' && (
                    <button onClick={() => cancelClass(c.id)} className="p-2 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10"><X size={14} /></button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

const FocusedClass: React.FC<{ c: any; onBack: () => void; onCancel: () => void }> = ({ c, onBack, onCancel }) => (
  <div>
    <button onClick={onBack} className="text-sm text-slate-400 hover:text-white mb-4">← All classes</button>
    <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-6 lg:p-8">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs uppercase px-2 py-0.5 rounded bg-blue-500/20 text-blue-300">{c.subject}</span>
        <span className={`text-xs uppercase px-2 py-0.5 rounded ${c.payment_status === 'paid' ? 'bg-green-500/20 text-green-300' : 'bg-orange-500/20 text-orange-300'}`}>{c.payment_status}</span>
      </div>
      <h2 className="text-2xl font-bold mb-2">{c.title}</h2>
      <p className="text-slate-300 mb-6">{c.description || 'No description.'}</p>
      <div className="grid sm:grid-cols-2 gap-3 mb-6">
        <Info l="Student" v={`${c.student?.full_name} (@${c.student?.username})`} />
        <Info l="Date & Time" v={`${c.session_date} · ${c.session_time?.slice(0, 5)}`} />
        <Info l="Duration" v={`${c.duration_minutes} min`} />
        <Info l="Price" v={`${c.price?.toLocaleString()} XAF`} />
      </div>
      <div className="bg-white/[0.03] rounded-lg p-3 mb-6">
        <div className="text-[10px] uppercase tracking-wider text-slate-400 mb-1">Google Meet Link</div>
        <a href={c.meet_link} target="_blank" rel="noopener noreferrer" className="text-sm text-orange-400 hover:underline break-all inline-flex items-center gap-1">
          <Video size={14} /> {c.meet_link}
        </a>
      </div>
      <div className="flex gap-2">
        <Link to={`/tutor/classes/edit/${c.id}`} className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm inline-flex items-center gap-2"><Edit size={14} /> Edit</Link>
        {c.session_status !== 'cancelled' && (
          <button onClick={onCancel} className="px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-sm inline-flex items-center gap-2"><X size={14} /> Cancel</button>
        )}
      </div>
    </div>
  </div>
);

const Info: React.FC<{ l: string; v: string }> = ({ l, v }) => (
  <div className="bg-white/[0.03] rounded-lg p-3">
    <div className="text-[10px] uppercase tracking-wider text-slate-400">{l}</div>
    <div className="text-sm font-medium mt-1">{v}</div>
  </div>
);

export default TutorClasses;
