import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Logo } from '@/components/Logo';
import { toast } from '@/components/ui/use-toast';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';

const Login: React.FC = () => {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await signIn(email, password);
    setLoading(false);
    if (res.error) {
      toast({ title: 'Login failed', description: res.error });
      return;
    }
    if (res.profile) {
      const dest = res.profile.role === 'tutor' ? '/tutor/dashboard' : res.profile.role === 'admin' ? '/admin/dashboard' : '/student/dashboard';
      toast({ title: 'Welcome back!', description: `Logged in as ${res.profile.full_name}` });
      navigate(dest);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      <div className="px-6 py-5"><Logo /></div>
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-8 backdrop-blur-xl">
            <h1 className="text-2xl font-bold mb-2">Welcome back</h1>
            <p className="text-slate-400 text-sm mb-6">Sign in to continue learning with TutorConnect</p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1.5">Email</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-orange-500"
                    placeholder="you@yourdomain.com"
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs uppercase tracking-wider text-slate-400">Password</label>
                  <Link to="/forgot-password" className="text-xs text-orange-400 hover:text-orange-300">Forgot?</Link>
                </div>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type={show ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-orange-500"
                    placeholder="••••••••"
                  />
                  <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                    {show ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <button disabled={loading} className="w-full py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-orange-500 font-semibold hover:opacity-90 disabled:opacity-60">
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
            <div className="mt-6 text-center text-sm text-slate-400">
              No account?{' '}
              <Link to="/register" className="text-orange-400 hover:text-orange-300 font-medium">Create one</Link>
            </div>
          </div>
          <p className="text-center text-xs text-slate-500 mt-4">
            <Link to="/" className="hover:text-slate-300">← Back to home</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
