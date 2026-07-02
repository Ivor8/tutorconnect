import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Logo } from '@/components/Logo';
import { VerifyEmailBanner } from '@/pages/auth/ForgotPassword';
import { LayoutDashboard, MessageCircle, Calendar, User, Settings, LogOut, Heart, Wallet, Star, Bell, BookOpen, Users, Plus, GraduationCap, Menu, X, ShieldCheck, FileText } from 'lucide-react';

type Role = 'student' | 'tutor' | 'admin';

const NAV: Record<Role, { to: string; label: string; icon: any }[]> = {
  student: [
    { to: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/student/classes', label: 'My Classes', icon: Calendar },
    { to: '/student/messages', label: 'Messages', icon: MessageCircle },
    { to: '/student/favourites', label: 'Favourites', icon: Heart },
    { to: '/student/payments', label: 'Payments', icon: Wallet },
    { to: '/student/reviews', label: 'Reviews', icon: Star },
    { to: '/student/notifications', label: 'Notifications', icon: Bell },
    { to: '/student/profile', label: 'Profile', icon: User },
    { to: '/student/settings', label: 'Settings', icon: Settings },
  ],
  tutor: [
    { to: '/tutor/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/tutor/classes', label: 'My Classes', icon: Calendar },
    { to: '/tutor/classes/create', label: 'Create Class', icon: Plus },
    { to: '/tutor/students', label: 'Students', icon: Users },
    { to: '/tutor/messages', label: 'Messages', icon: MessageCircle },
    { to: '/tutor/availability', label: 'Availability', icon: BookOpen },
    { to: '/tutor/earnings', label: 'Earnings', icon: Wallet },
    { to: '/tutor/reviews', label: 'Reviews', icon: Star },
    { to: '/tutor/notifications', label: 'Notifications', icon: Bell },
    { to: '/tutor/profile', label: 'Profile', icon: User },
    { to: '/tutor/settings', label: 'Settings', icon: Settings },
  ],
  admin: [
    { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/users', label: 'Users', icon: Users },
    { to: '/admin/tutors', label: 'Tutors', icon: GraduationCap },
    { to: '/admin/classes', label: 'Classes', icon: Calendar },
    { to: '/admin/payments', label: 'Payments', icon: Wallet },
    { to: '/admin/reports', label: 'Reports', icon: FileText },
    { to: '/admin/settings', label: 'Settings', icon: Settings },
  ],
};

export const DashboardLayout: React.FC<{ children: React.ReactNode; title?: string }> = ({ children, title }) => {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  if (!profile) return null;
  const items = NAV[profile.role];

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const roleColor = profile.role === 'tutor' ? 'from-orange-500 to-red-500' : profile.role === 'admin' ? 'from-purple-600 to-pink-600' : 'from-blue-600 to-cyan-500';
  const roleBadge = profile.role === 'tutor' ? <GraduationCap size={12} /> : profile.role === 'admin' ? <ShieldCheck size={12} /> : <BookOpen size={12} />;

  return (
    <div className="min-h-screen bg-slate-950 text-white flex">
      <aside className={`${open ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:sticky top-0 left-0 z-40 h-screen w-64 bg-slate-900/95 backdrop-blur-xl border-r border-white/10 transition-transform flex flex-col`}>
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <Logo size="sm" />
          <button className="lg:hidden text-slate-400" onClick={() => setOpen(false)}><X size={20} /></button>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {items.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${isActive ? 'bg-gradient-to-r ' + roleColor + ' text-white font-medium shadow-lg' : 'text-slate-300 hover:bg-white/5 hover:text-white'}`
              }
            >
              <item.icon size={17} />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-white/10">
          <div className="flex items-center gap-3 p-2 rounded-lg bg-white/5 mb-2">
            <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${roleColor} flex items-center justify-center text-white font-bold text-sm`}>
              {profile.full_name?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{profile.full_name}</div>
              <div className="text-[10px] text-slate-400 flex items-center gap-1 uppercase">
                {roleBadge} {profile.role}
              </div>
            </div>
          </div>
          <button onClick={handleSignOut} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-red-400 hover:bg-white/5 transition-colors">
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="lg:hidden sticky top-0 z-30 bg-slate-950/80 backdrop-blur-xl border-b border-white/10 px-4 h-14 flex items-center justify-between">
          <button onClick={() => setOpen(true)} className="text-slate-300"><Menu size={22} /></button>
          <Logo size="sm" withText={false} />
          <Link to={`/${profile.role}/notifications`} className="text-slate-300"><Bell size={20} /></Link>
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <VerifyEmailBanner />
          {title && <h1 className="text-2xl sm:text-3xl font-bold mb-6">{title}</h1>}
          {children}
        </main>
      </div>

      {open && <div onClick={() => setOpen(false)} className="lg:hidden fixed inset-0 bg-black/60 z-30" />}
    </div>
  );
};
