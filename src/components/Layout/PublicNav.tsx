import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Logo } from '@/components/Logo';
import { useAuth } from '@/contexts/AuthContext';
import { Menu, X } from 'lucide-react';

export const PublicNav: React.FC = () => {
  const { profile } = useAuth();
  const [open, setOpen] = useState(false);
  const loc = useLocation();
  const links = [
    { to: '/', label: 'Home' },
    { to: '/tutors', label: 'Find Tutors' },
    { to: '/about', label: 'About' },
    { to: '/faq', label: 'FAQ' },
    { to: '/contact', label: 'Contact' },
  ];
  const dashHref = profile?.role === 'tutor' ? '/tutor/dashboard' : profile?.role === 'admin' ? '/admin/dashboard' : '/student/dashboard';

  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-slate-950/70 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Logo />
        <nav className="hidden md:flex items-center gap-7">
          {links.map(l => (
            <Link key={l.to} to={l.to} className={`text-sm font-medium transition-colors ${loc.pathname === l.to ? 'text-orange-400' : 'text-slate-300 hover:text-white'}`}>
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="hidden md:flex items-center gap-3">
          {profile ? (
            <Link to={dashHref} className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-orange-500 text-white text-sm font-medium hover:opacity-90">
              Dashboard
            </Link>
          ) : (
            <>
              <Link to="/login" className="text-sm font-medium text-slate-300 hover:text-white">Login</Link>
              <Link to="/register" className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-orange-500 text-white text-sm font-medium hover:opacity-90">
                Get Started
              </Link>
            </>
          )}
        </div>
        <button className="md:hidden text-white" onClick={() => setOpen(!open)}>
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>
      {open && (
        <div className="md:hidden border-t border-white/10 bg-slate-950">
          <div className="px-4 py-4 space-y-3">
            {links.map(l => (
              <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className="block text-slate-200 py-1">{l.label}</Link>
            ))}
            {profile ? (
              <Link to={dashHref} onClick={() => setOpen(false)} className="block py-2 text-orange-400 font-medium">Dashboard</Link>
            ) : (
              <>
                <Link to="/login" onClick={() => setOpen(false)} className="block py-1 text-slate-200">Login</Link>
                <Link to="/register" onClick={() => setOpen(false)} className="block py-2 text-orange-400 font-medium">Get Started</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
