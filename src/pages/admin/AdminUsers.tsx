import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/Layout/DashboardLayout';
import { supabase } from '@/lib/supabase';
import { Search } from 'lucide-react';

const AdminUsers: React.FC<{ filter?: 'all' | 'student' | 'tutor' }> = ({ filter = 'all' }) => {
  const [users, setUsers] = useState<any[]>([]);
  const [q, setQ] = useState('');

  useEffect(() => {
    (async () => {
      let query = supabase.from('profiles').select('*').order('created_at', { ascending: false });
      if (filter !== 'all') query = query.eq('role', filter);
      const { data } = await query;
      setUsers(data || []);
    })();
  }, [filter]);

  const filtered = users.filter(u => u.full_name?.toLowerCase().includes(q.toLowerCase()) || u.username?.toLowerCase().includes(q.toLowerCase()) || u.email?.toLowerCase().includes(q.toLowerCase()));

  return (
    <DashboardLayout title={filter === 'tutor' ? 'Tutors' : filter === 'student' ? 'Students' : 'All Users'}>
      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search users..." className="w-full pl-10 pr-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-orange-500" />
      </div>
      <div className="bg-white/[0.04] border border-white/10 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wider text-slate-400 border-b border-white/10">
              <th className="p-3">Name</th>
              <th>Username</th>
              <th>Role</th>
              <th>Email</th>
              <th>Joined</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(u => (
              <tr key={u.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                <td className="p-3 flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-600 to-orange-500 flex items-center justify-center text-xs font-bold">{u.full_name?.[0]}</div>
                  {u.full_name}
                </td>
                <td>@{u.username}</td>
                <td><span className={`text-[10px] uppercase px-2 py-0.5 rounded ${u.role === 'tutor' ? 'bg-orange-500/20 text-orange-300' : u.role === 'admin' ? 'bg-purple-500/20 text-purple-300' : 'bg-blue-500/20 text-blue-300'}`}>{u.role}</span></td>
                <td className="text-slate-300">{u.email}</td>
                <td className="text-xs text-slate-400">{new Date(u.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <p className="p-6 text-center text-slate-400 text-sm">No users found.</p>}
      </div>
    </DashboardLayout>
  );
};

export default AdminUsers;
