import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/Layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Calendar, Users, Wallet, Star, Plus, ArrowRight, Video, Clock } from 'lucide-react';

const TutorDashboard: React.FC = () => {
  const { profile } = useAuth();
  const [classes, setClasses] = useState<any[]>([]);
  const [stats, setStats] = useState({ classes: 0, students: 0, earnings: 0, rating: 0 });

  useEffect(() => {
    if (!profile) return;
    const load = async () => {
      const { data: sess } = await supabase
        .from('tutoring_sessions')
        .select('*')
        .eq('tutor_id', profile.id)
        .order('session_date', { ascending: true })
        .limit(5);

      const sessions = sess || [];
      const studentIds = Array.from(new Set(sessions.map((s: any) => s.student_id).filter(Boolean)));
      let students: any[] = [];
      if (studentIds.length > 0) {
        const { data: studentData } = await supabase
          .from('profiles')
          .select('id, full_name, username')
          .in('id', studentIds);
        students = studentData || [];
      }

      setClasses(sessions.map((session: any) => ({
        ...session,
        student: students.find((s: any) => s.id === session.student_id) || null,
      })));
      const [{ count: cls }, { data: pays }] = await Promise.all([
        supabase.from('tutoring_sessions').select('*', { count: 'exact', head: true }).eq('tutor_id', profile.id),
        supabase.from('payments').select('amount').eq('tutor_id', profile.id),
      ]);
      const { data: studs } = await supabase.from('tutoring_sessions').select('student_id').eq('tutor_id', profile.id);
      const uniqStud = new Set((studs || []).map(s => s.student_id)).size;
      const earn = (pays || []).reduce((s, p) => s + (p.amount || 0), 0);
      setStats({ classes: cls || 0, students: uniqStud, earnings: earn, rating: profile.rating || 0 });
    };
    load();
    const ch = supabase.channel('tutor-dash')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tutoring_sessions', filter: `tutor_id=eq.${profile.id}` }, () => load())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'payments', filter: `tutor_id=eq.${profile.id}` }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [profile]);

  return (
    <DashboardLayout title={`Welcome, ${profile?.full_name?.split(' ')[0]}`}>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <p className="text-slate-400 text-sm">Manage your tutoring sessions and students</p>
        <Link to="/tutor/classes/create" className="px-4 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 font-semibold text-sm inline-flex items-center gap-2 hover:opacity-90">
          <Plus size={16} /> Create Class
        </Link>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Stat icon={<Calendar />} label="Total Classes" value={stats.classes} color="from-blue-600 to-cyan-500" />
        <Stat icon={<Users />} label="Students" value={stats.students} color="from-purple-600 to-pink-500" />
        <Stat icon={<Wallet />} label="Earnings" value={`${stats.earnings.toLocaleString()} XAF`} color="from-orange-500 to-red-500" small />
        <Stat icon={<Star />} label="Rating" value={Number(stats.rating).toFixed(1)} color="from-yellow-500 to-orange-500" />
      </div>

      <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold">Upcoming Sessions</h2>
          <Link to="/tutor/classes" className="text-sm text-orange-400 hover:text-orange-300 inline-flex items-center gap-1">View all <ArrowRight size={14} /></Link>
        </div>
        {classes.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="mx-auto text-slate-600 mb-3" size={36} />
            <p className="text-slate-400 mb-3">No sessions yet — create your first class.</p>
            <Link to="/tutor/classes/create" className="text-orange-400 hover:text-orange-300 text-sm font-medium">Create class →</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {classes.map(c => (
              <Link key={c.id} to={`/tutor/classes/${c.id}`} className="block p-4 rounded-xl bg-white/[0.03] border border-white/5 hover:border-orange-500/40 transition-colors">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <div className="font-medium">{c.title}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{c.subject} · with {c.student?.full_name}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-slate-300 flex items-center gap-1 justify-end"><Clock size={12} />{c.session_date} · {c.session_time?.slice(0, 5)}</div>
                    <span className={`inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full ${c.payment_status === 'paid' ? 'bg-green-500/20 text-green-300' : 'bg-orange-500/20 text-orange-300'}`}>{c.payment_status}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

const Stat: React.FC<{ icon: React.ReactNode; label: string; value: any; color: string; small?: boolean }> = ({ icon, label, value, color, small }) => (
  <div className="p-5 rounded-2xl bg-white/[0.04] border border-white/10">
    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center text-white mb-3`}>{icon}</div>
    <div className={`${small ? 'text-lg' : 'text-2xl'} font-bold`}>{value}</div>
    <div className="text-xs text-slate-400 uppercase tracking-wider">{label}</div>
  </div>
);

export default TutorDashboard;
