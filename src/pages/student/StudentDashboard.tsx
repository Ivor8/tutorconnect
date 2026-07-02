import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/Layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Calendar, MessageCircle, Heart, Wallet, BookOpen, ArrowRight, Star, Clock } from 'lucide-react';

const StudentDashboard: React.FC = () => {
  const { profile } = useAuth();
  const [classes, setClasses] = useState<any[]>([]);
  const [stats, setStats] = useState({ upcoming: 0, paid: 0, favs: 0, msgs: 0 });

  useEffect(() => {
    if (!profile) return;
    const load = async () => {
      const { data: sess } = await supabase
        .from('tutoring_sessions')
        .select('*')
        .eq('student_id', profile.id)
        .order('session_date', { ascending: true })
        .limit(5);

      const sessions = sess || [];
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
      const today = new Date().toISOString().split('T')[0];
      const [{ count: up }, { count: pd }, { count: fv }] = await Promise.all([
        supabase.from('tutoring_sessions').select('*', { count: 'exact', head: true }).eq('student_id', profile.id).gte('session_date', today).eq('session_status', 'scheduled'),
        supabase.from('payments').select('*', { count: 'exact', head: true }).eq('student_id', profile.id),
        supabase.from('favourites').select('*', { count: 'exact', head: true }).eq('student_id', profile.id),
      ]);
      setStats({ upcoming: up || 0, paid: pd || 0, favs: fv || 0, msgs: 0 });
    };
    load();

    // Realtime listener for new sessions
    const ch = supabase.channel('student-sessions')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tutoring_sessions', filter: `student_id=eq.${profile.id}` }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [profile]);

  return (
    <DashboardLayout title={`Welcome back, ${profile?.full_name?.split(' ')[0]}`}>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={<Calendar />} label="Upcoming Classes" value={stats.upcoming} color="from-blue-600 to-cyan-500" />
        <StatCard icon={<Wallet />} label="Paid Sessions" value={stats.paid} color="from-orange-500 to-red-500" />
        <StatCard icon={<Heart />} label="Favourite Tutors" value={stats.favs} color="from-pink-500 to-rose-500" />
        <StatCard icon={<MessageCircle />} label="Conversations" value={stats.msgs} color="from-purple-500 to-indigo-500" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white/[0.04] border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold">Your Classes</h2>
            <Link to="/student/classes" className="text-sm text-orange-400 hover:text-orange-300 inline-flex items-center gap-1">View all <ArrowRight size={14} /></Link>
          </div>
          {classes.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="mx-auto text-slate-600 mb-3" size={36} />
              <p className="text-slate-400 mb-3">No classes scheduled yet.</p>
              <Link to="/tutors" className="text-orange-400 hover:text-orange-300 text-sm font-medium">Find a tutor →</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {classes.map(c => (
                <Link key={c.id} to={`/student/classes/${c.id}`} className="block p-4 rounded-xl bg-white/[0.03] border border-white/5 hover:border-orange-500/40 transition-colors">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <div className="font-medium">{c.title}</div>
                      <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                        <span>{c.subject}</span>·<span>with {c.tutor?.full_name}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-slate-300 flex items-center gap-1"><Clock size={12} /> {c.session_date} · {c.session_time?.slice(0, 5)}</div>
                      <span className={`inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full ${c.payment_status === 'paid' ? 'bg-green-500/20 text-green-300' : 'bg-orange-500/20 text-orange-300'}`}>
                        {c.payment_status === 'paid' ? 'Paid · Ready' : 'Pay to unlock'}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-6">
          <h2 className="text-lg font-semibold mb-5">Quick Actions</h2>
          <div className="space-y-3">
            <QuickAction to="/tutors" icon={<BookOpen size={16} />} label="Find a tutor" />
            <QuickAction to="/student/messages" icon={<MessageCircle size={16} />} label="View messages" />
            <QuickAction to="/student/favourites" icon={<Heart size={16} />} label="Saved tutors" />
            <QuickAction to="/student/payments" icon={<Wallet size={16} />} label="Payment history" />
            <QuickAction to="/student/reviews" icon={<Star size={16} />} label="My reviews" />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: number; color: string }> = ({ icon, label, value, color }) => (
  <div className="p-5 rounded-2xl bg-white/[0.04] border border-white/10">
    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center text-white mb-3`}>{icon}</div>
    <div className="text-2xl font-bold">{value}</div>
    <div className="text-xs text-slate-400 uppercase tracking-wider">{label}</div>
  </div>
);

const QuickAction: React.FC<{ to: string; icon: React.ReactNode; label: string }> = ({ to, icon, label }) => (
  <Link to={to} className="flex items-center justify-between p-3 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] transition-colors group">
    <span className="flex items-center gap-3 text-sm"><span className="text-orange-400">{icon}</span>{label}</span>
    <ArrowRight size={14} className="text-slate-500 group-hover:text-orange-400 transition-colors" />
  </Link>
);

export default StudentDashboard;
