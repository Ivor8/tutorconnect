import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Logo } from '@/components/Logo';
import { toast } from '@/components/ui/use-toast';
import { Mail, Lock, ArrowLeft, CheckCircle2, Eye, EyeOff, KeyRound } from 'lucide-react';

export const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@')) return toast({ title: 'Invalid email' });
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) return toast({ title: 'Failed', description: error.message });
    setSent(true);
    toast({ title: 'Email sent', description: 'Check your inbox for the reset link.' });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      <div className="px-6 py-5"><Logo /></div>
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-8">
            <Link to="/login" className="text-sm text-slate-400 hover:text-white inline-flex items-center gap-1 mb-5"><ArrowLeft size={14} /> Back to login</Link>

            {sent ? (
              <div className="text-center py-4">
                <CheckCircle2 className="w-14 h-14 mx-auto text-green-400 mb-4" />
                <h2 className="text-xl font-bold mb-2">Check your email</h2>
                <p className="text-sm text-slate-400 mb-6">
                  We sent a password reset link to <span className="text-white font-medium">{email}</span>. Click the link to set a new password.
                </p>
                <button onClick={() => { setSent(false); setEmail(''); }} className="text-sm text-orange-400 hover:text-orange-300">Send another link</button>
              </div>
            ) : (
              <>
                <div className="w-12 h-12 rounded-xl bg-orange-500/15 text-orange-400 flex items-center justify-center mb-4">
                  <KeyRound size={22} />
                </div>
                <h1 className="text-2xl font-bold mb-2">Forgot password?</h1>
                <p className="text-slate-400 text-sm mb-6">Enter your email and we'll send you a reset link.</p>
                <form onSubmit={submit} className="space-y-4">
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
                        placeholder="you@uba.cm"
                      />
                    </div>
                  </div>
                  <button disabled={loading} className="w-full py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-orange-500 font-semibold disabled:opacity-60">
                    {loading ? 'Sending...' : 'Send Reset Link'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Supabase auto-handles the recovery token in URL hash via onAuthStateChange
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') setReady(true);
    });
    // Also check if already in recovery session
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) return toast({ title: 'Password too short', description: 'Use at least 6 characters.' });
    if (password !== confirm) return toast({ title: 'Passwords do not match' });
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) return toast({ title: 'Failed', description: error.message });
    toast({ title: 'Password updated', description: 'You can now log in with your new password.' });
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      <div className="px-6 py-5"><Logo /></div>
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-8">
            <div className="w-12 h-12 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center mb-4">
              <Lock size={22} />
            </div>
            <h1 className="text-2xl font-bold mb-2">Set a new password</h1>
            <p className="text-slate-400 text-sm mb-6">Choose a strong password you haven't used before.</p>

            {!ready && (
              <div className="mb-4 p-3 rounded-lg bg-orange-500/10 border border-orange-500/30 text-orange-200 text-xs">
                Waiting for reset session… If you didn't arrive here from an email link, please request a new one.
              </div>
            )}

            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1.5">New Password</label>
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
              <div>
                <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1.5">Confirm Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type={show ? 'text' : 'password'}
                    required
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-orange-500"
                    placeholder="••••••••"
                  />
                </div>
              </div>
              <button disabled={loading} className="w-full py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-orange-500 font-semibold disabled:opacity-60">
                {loading ? 'Updating...' : 'Update Password'}
              </button>
            </form>
            <div className="mt-6 text-center text-sm text-slate-400">
              <Link to="/login" className="text-orange-400 hover:text-orange-300">← Back to login</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Email verification banner shown inside dashboards for unverified users
export const VerifyEmailBanner: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [resending, setResending] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  const resend = async () => {
    if (!user?.email) return;
    setResending(true);
    const { error } = await supabase.auth.resend({ type: 'signup', email: user.email });
    setResending(false);
    if (error) return toast({ title: 'Failed to resend', description: error.message });
    toast({ title: 'Verification email sent', description: `Check ${user.email}` });
  };

  if (!user || user.email_confirmed_at || user.confirmed_at || dismissed) return null;

  return (
    <div className="mb-5 rounded-xl bg-gradient-to-r from-orange-500/15 to-red-500/15 border border-orange-500/30 p-4 flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-lg bg-orange-500/20 text-orange-300 flex items-center justify-center flex-shrink-0">
          <Mail size={16} />
        </div>
        <div>
          <p className="text-sm font-medium text-white">Please verify your email address</p>
          <p className="text-xs text-slate-300 mt-0.5">
            We sent a verification link to <span className="font-medium text-orange-300">{user.email}</span>. Verify to unlock payments and class creation.
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={resend} disabled={resending} className="px-3 py-1.5 text-xs rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-medium disabled:opacity-50">
          {resending ? 'Sending...' : 'Resend email'}
        </button>
        <button onClick={() => setDismissed(true)} className="px-3 py-1.5 text-xs rounded-lg border border-white/10 text-slate-300 hover:bg-white/5">
          Dismiss
        </button>
      </div>
    </div>
  );
};

export default ForgotPassword;
