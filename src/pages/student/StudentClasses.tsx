import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { DashboardLayout } from '@/components/Layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { PaymentModal } from '@/components/PaymentModal';
import { Calendar, Clock, Video, Lock, CheckCircle2, ExternalLink, BookOpen, User } from 'lucide-react';

const StudentClasses: React.FC = () => {
  const { profile } = useAuth();
  const { classId } = useParams();
  const navigate = useNavigate();
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [payFor, setPayFor] = useState<any>(null);

  const load = async () => {
    if (!profile) return;
    const { data } = await supabase
      .from('tutoring_sessions')
      .select('*')
      .eq('student_id', profile.id)
      .order('session_date', { ascending: true });

    const sessions = data || [];
    const tutorIds = Array.from(new Set(sessions.map((s: any) => s.tutor_id).filter(Boolean)));
    let tutors: any[] = [];
    if (tutorIds.length > 0) {
      const { data: tutorData } = await supabase
        .from('profiles')
        .select('id, full_name, username, avatar_url')
        .in('id', tutorIds);
      tutors = tutorData || [];
    }

    setClasses(sessions.map((session: any) => ({
      ...session,
      tutor: tutors.find((t: any) => t.id === session.tutor_id) || null,
    })));
    setLoading(false);
  };

  useEffect(() => {
    load();
    if (!profile) return;
    const ch = supabase.channel('student-cls')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tutoring_sessions', filter: `student_id=eq.${profile.id}` }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [profile]);

  const focused = classId ? classes.find(c => c.id === classId) : null;

  return (
    <DashboardLayout title="My Classes">
      {loading ? (
        <div className="text-slate-400">Loading...</div>
      ) : focused ? (
        <ClassDetail c={focused} onBack={() => navigate('/student/classes')} onPay={() => setPayFor(focused)} />
      ) : classes.length === 0 ? (
        <div className="text-center py-20 bg-white/[0.03] border border-dashed border-white/10 rounded-2xl">
          <BookOpen className="mx-auto text-slate-600 mb-3" size={42} />
          <p className="text-slate-300 mb-1">No classes yet</p>
          <p className="text-sm text-slate-500">Tutors will create classes for you here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {classes.map(c => (
            <ClassCard key={c.id} c={c} onClick={() => navigate(`/student/classes/${c.id}`)} onPay={() => setPayFor(c)} />
          ))}
        </div>
      )}

      {payFor && profile && (
        <PaymentModal
          session={payFor}
          studentId={profile.id}
          onClose={() => setPayFor(null)}
          onSuccess={load}
        />
      )}
    </DashboardLayout>
  );
};

const ClassCard: React.FC<{ c: any; onClick: () => void; onPay: () => void }> = ({ c, onClick, onPay }) => (
  <div className="p-5 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-white/20 transition-colors">
    <div className="flex flex-col sm:flex-row justify-between gap-4">
      <div onClick={onClick} className="flex-1 cursor-pointer">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300">{c.subject}</span>
          <span className={`text-[10px] uppercase font-semibold px-2 py-0.5 rounded ${c.payment_status === 'paid' ? 'bg-green-500/20 text-green-300' : 'bg-orange-500/20 text-orange-300'}`}>
            {c.payment_status}
          </span>
          {c.session_status === 'cancelled' && <span className="text-[10px] uppercase px-2 py-0.5 rounded bg-red-500/20 text-red-300">cancelled</span>}
        </div>
        <h3 className="font-semibold">{c.title}</h3>
        <p className="text-sm text-slate-400 line-clamp-1 mt-0.5">{c.description}</p>
        <div className="flex flex-wrap gap-4 mt-3 text-xs text-slate-400">
          <span className="inline-flex items-center gap-1"><User size={12} />{c.tutor?.full_name}</span>
          <span className="inline-flex items-center gap-1"><Calendar size={12} />{c.session_date}</span>
          <span className="inline-flex items-center gap-1"><Clock size={12} />{c.session_time?.slice(0, 5)} · {c.duration_minutes}min</span>
        </div>
      </div>
      <div className="flex items-end sm:items-center gap-3">
        <div className="text-right">
          <div className="text-lg font-bold">{c.price?.toLocaleString()} <span className="text-xs text-slate-400">XAF</span></div>
        </div>
        {c.payment_status === 'paid' ? (
          <a href={c.meet_link} target="_blank" rel="noopener noreferrer" className="px-4 py-2 rounded-lg bg-green-500/20 border border-green-500/40 text-green-300 text-sm font-medium inline-flex items-center gap-2 hover:bg-green-500/30">
            <Video size={14} /> Join Class
          </a>
        ) : (
          <button onClick={onPay} className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-orange-500 text-white text-sm font-semibold">Pay Now</button>
        )}
      </div>
    </div>
  </div>
);

const ClassDetail: React.FC<{ c: any; onBack: () => void; onPay: () => void }> = ({ c, onBack, onPay }) => (
  <div>
    <button onClick={onBack} className="text-sm text-slate-400 hover:text-white mb-4">← All classes</button>
    <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-6 lg:p-8">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs uppercase font-semibold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300">{c.subject}</span>
        <span className={`text-xs uppercase font-semibold px-2 py-0.5 rounded ${c.payment_status === 'paid' ? 'bg-green-500/20 text-green-300' : 'bg-orange-500/20 text-orange-300'}`}>{c.payment_status}</span>
      </div>
      <h2 className="text-2xl font-bold mb-2">{c.title}</h2>
      <p className="text-slate-300 mb-6">{c.description || 'No description provided.'}</p>
      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        <Info label="Tutor" value={c.tutor?.full_name} />
        <Info label="Subject" value={c.subject} />
        <Info label="Date" value={c.session_date} />
        <Info label="Time" value={`${c.session_time?.slice(0, 5)} · ${c.duration_minutes} min`} />
        <Info label="Price" value={`${c.price?.toLocaleString()} XAF`} />
        <Info label="Status" value={c.session_status} />
      </div>

      {c.payment_status === 'paid' ? (
        <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-5">
          <div className="flex items-center gap-2 text-green-300 mb-2">
            <CheckCircle2 size={18} />
            <span className="font-semibold">Payment confirmed — class unlocked</span>
          </div>
          <a href={c.meet_link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-green-500 text-slate-900 font-semibold hover:bg-green-400">
            <Video size={16} /> Join Google Meet
            <ExternalLink size={14} />
          </a>
        </div>
      ) : (
        <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-5">
          <div className="flex items-center gap-2 text-orange-300 mb-2">
            <Lock size={18} />
            <span className="font-semibold">Pay to unlock the Google Meet link</span>
          </div>
          <p className="text-sm text-slate-300 mb-4">Once payment is confirmed, the join button will appear and you can attend the session.</p>
          <button onClick={onPay} className="px-5 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-orange-500 text-white font-semibold">
            Pay {c.price?.toLocaleString()} XAF
          </button>
        </div>
      )}
    </div>
  </div>
);

const Info: React.FC<{ label: string; value: any }> = ({ label, value }) => (
  <div className="bg-white/[0.03] rounded-lg p-3">
    <div className="text-[10px] uppercase tracking-wider text-slate-400">{label}</div>
    <div className="text-sm font-medium mt-1">{value}</div>
  </div>
);

export default StudentClasses;
