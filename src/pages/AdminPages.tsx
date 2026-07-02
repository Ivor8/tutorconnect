import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/Layout/DashboardLayout';
import { supabase } from '@/lib/supabase';
import { Calendar, FileText } from 'lucide-react';

export const AdminClasses: React.FC = () => {
  const [classes, setClasses] = useState<any[]>([]);
  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('tutoring_sessions').select('*, tutor:profiles!tutoring_sessions_tutor_id_fkey(full_name), student:profiles!tutoring_sessions_student_id_fkey(full_name)').order('created_at', { ascending: false });
      setClasses(data || []);
    })();
  }, []);
  return (
    <DashboardLayout title="All Classes">
      <div className="bg-white/[0.04] border border-white/10 rounded-2xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wider text-slate-400 border-b border-white/10">
              <th className="p-3">Title</th>
              <th>Subject</th>
              <th>Tutor</th>
              <th>Student</th>
              <th>Date</th>
              <th>Price</th>
              <th>Payment</th>
            </tr>
          </thead>
          <tbody>
            {classes.map(c => (
              <tr key={c.id} className="border-b border-white/5">
                <td className="p-3">{c.title}</td>
                <td>{c.subject}</td>
                <td>{c.tutor?.full_name}</td>
                <td>{c.student?.full_name}</td>
                <td className="text-xs">{c.session_date}</td>
                <td>{c.price?.toLocaleString()} XAF</td>
                <td><span className={`text-[10px] uppercase px-2 py-0.5 rounded ${c.payment_status === 'paid' ? 'bg-green-500/20 text-green-300' : 'bg-orange-500/20 text-orange-300'}`}>{c.payment_status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
        {classes.length === 0 && <p className="p-6 text-center text-slate-400">No classes yet.</p>}
      </div>
    </DashboardLayout>
  );
};

export const AdminPayments: React.FC = () => {
  const [pays, setPays] = useState<any[]>([]);
  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('payments').select('*, student:profiles!payments_student_id_fkey(full_name), tutor:profiles!payments_tutor_id_fkey(full_name)').order('created_at', { ascending: false });
      setPays(data || []);
    })();
  }, []);
  const total = pays.reduce((s, p) => s + (p.amount || 0), 0);
  return (
    <DashboardLayout title="Payments">
      <div className="mb-5 grid grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl bg-white/[0.04] border border-white/10">
          <div className="text-xs text-slate-400 uppercase">Total Volume</div>
          <div className="text-2xl font-bold mt-1">{total.toLocaleString()} XAF</div>
        </div>
        <div className="p-5 rounded-2xl bg-white/[0.04] border border-white/10">
          <div className="text-xs text-slate-400 uppercase">Transactions</div>
          <div className="text-2xl font-bold mt-1">{pays.length}</div>
        </div>
      </div>
      <div className="bg-white/[0.04] border border-white/10 rounded-2xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wider text-slate-400 border-b border-white/10">
              <th className="p-3">Ref</th>
              <th>Student</th>
              <th>Tutor</th>
              <th>Amount</th>
              <th>Method</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {pays.map(p => (
              <tr key={p.id} className="border-b border-white/5">
                <td className="p-3 text-xs font-mono">{p.transaction_ref}</td>
                <td>{p.student?.full_name}</td>
                <td>{p.tutor?.full_name}</td>
                <td className="font-medium">{p.amount?.toLocaleString()} XAF</td>
                <td><span className={`text-[10px] uppercase px-2 py-0.5 rounded ${p.method === 'mtn' ? 'bg-yellow-500/20 text-yellow-300' : 'bg-orange-500/20 text-orange-300'}`}>{p.method}</span></td>
                <td><span className="text-[10px] uppercase px-2 py-0.5 rounded bg-green-500/20 text-green-300">{p.status}</span></td>
                <td className="text-xs text-slate-400">{new Date(p.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {pays.length === 0 && <p className="p-6 text-center text-slate-400">No payments yet.</p>}
      </div>
    </DashboardLayout>
  );
};

export const AdminReports: React.FC = () => (
  <DashboardLayout title="Reports">
    <div className="text-center py-20 bg-white/[0.03] border border-dashed border-white/10 rounded-2xl">
      <FileText className="mx-auto text-slate-600 mb-3" size={42} />
      <p className="text-slate-300">Detailed reports coming soon</p>
      <p className="text-sm text-slate-500 mt-1">Export users, sessions, and payments in CSV format.</p>
    </div>
  </DashboardLayout>
);

export const AdminSettings: React.FC = () => (
  <DashboardLayout title="Platform Settings">
    <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-6 max-w-2xl space-y-4">
      <Setting label="Platform Name" value="TutorConnect UBa" />
      <Setting label="Default Currency" value="XAF (Central African Franc)" />
      <Setting label="Payment Methods" value="MTN MoMo, Orange Money" />
      <Setting label="University" value="University of Bamenda" />
    </div>
  </DashboardLayout>
);

const Setting: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex justify-between py-2 border-b border-white/5 last:border-0">
    <span className="text-slate-400 text-sm">{label}</span>
    <span className="font-medium text-sm">{value}</span>
  </div>
);
