import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/Layout/DashboardLayout';
import { supabase } from '@/lib/supabase';
import { Users, GraduationCap, Calendar, Wallet, TrendingUp } from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState({ students: 0, tutors: 0, sessions: 0, revenue: 0, paidSessions: 0 });
  const [recentPayments, setRecentPayments] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const [s, t, sess, paid, pays] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'student'),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'tutor'),
        supabase.from('tutoring_sessions').select('*', { count: 'exact', head: true }),
        supabase.from('tutoring_sessions').select('*', { count: 'exact', head: true }).eq('payment_status', 'paid'),
        supabase.from('payments').select('amount, method, created_at, student:profiles!payments_student_id_fkey(full_name), tutor:profiles!payments_tutor_id_fkey(full_name)').order('created_at', { ascending: false }).limit(10),
      ]);
      const rev = (pays.data || []).reduce((sum, p: any) => sum + (p.amount || 0), 0);
      setStats({
        students: s.count || 0,
        tutors: t.count || 0,
        sessions: sess.count || 0,
        paidSessions: paid.count || 0,
        revenue: rev,
      });
      setRecentPayments(pays.data || []);
    })();
  }, []);

  return (
    <DashboardLayout title="Admin Dashboard">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Stat icon={<Users />} label="Students" value={stats.students} color="from-blue-600 to-cyan-500" />
        <Stat icon={<GraduationCap />} label="Tutors" value={stats.tutors} color="from-orange-500 to-red-500" />
        <Stat icon={<Calendar />} label="Sessions" value={stats.sessions} color="from-purple-500 to-pink-500" />
        <Stat icon={<Wallet />} label="Revenue" value={`${stats.revenue.toLocaleString()} XAF`} color="from-green-500 to-emerald-500" small />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white/[0.04] border border-white/10 rounded-2xl p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Payments</h2>
          {recentPayments.length === 0 ? (
            <p className="text-slate-400 text-sm">No payments yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-slate-400 border-b border-white/10">
                  <th className="py-2">Student</th>
                  <th>Tutor</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {recentPayments.map((p, i) => (
                  <tr key={i} className="border-b border-white/5">
                    <td className="py-3">{p.student?.full_name}</td>
                    <td>{p.tutor?.full_name}</td>
                    <td className="font-medium">{p.amount?.toLocaleString()} XAF</td>
                    <td><span className={`text-[10px] uppercase px-2 py-0.5 rounded ${p.method === 'mtn' ? 'bg-yellow-500/20 text-yellow-300' : 'bg-orange-500/20 text-orange-300'}`}>{p.method}</span></td>
                    <td className="text-xs text-slate-400">{new Date(p.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-6">
          <h2 className="text-lg font-semibold mb-4">Platform Health</h2>
          <div className="space-y-4">
            <Metric label="Paid Sessions" value={stats.paidSessions} total={stats.sessions} />
            <Metric label="Active Tutors" value={stats.tutors} total={stats.tutors + 5} />
            <Metric label="Active Students" value={stats.students} total={stats.students + 10} />
          </div>
          <div className="mt-6 p-4 rounded-xl bg-gradient-to-br from-blue-600/15 to-orange-500/15 border border-white/10">
            <div className="text-xs text-slate-400 uppercase tracking-wider">Average Session Price</div>
            <div className="text-2xl font-bold mt-1">{stats.paidSessions > 0 ? Math.round(stats.revenue / stats.paidSessions).toLocaleString() : 0} XAF</div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

const Stat: React.FC<any> = ({ icon, label, value, color, small }) => (
  <div className="p-5 rounded-2xl bg-white/[0.04] border border-white/10">
    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center text-white mb-3`}>{icon}</div>
    <div className={`${small ? 'text-lg' : 'text-2xl'} font-bold`}>{value}</div>
    <div className="text-xs text-slate-400 uppercase tracking-wider">{label}</div>
  </div>
);

const Metric: React.FC<{ label: string; value: number; total: number }> = ({ label, value, total }) => {
  const pct = total ? Math.min(100, (value / total) * 100) : 0;
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-slate-400">{label}</span>
        <span className="font-medium">{value} / {total}</span>
      </div>
      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-blue-500 to-orange-500" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
};

export default AdminDashboard;
