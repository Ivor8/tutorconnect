import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Search, MessageCircle, Calendar, CreditCard, Star, GraduationCap, BookOpen, Users, Clock, ShieldCheck, ChevronRight, Sparkles, Mail, Phone, MapPin } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

const SUBJECTS = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science', 'English', 'French', 'Economics', 'Accounting', 'Law', 'Engineering', 'Medicine'];

const AppLayout: React.FC = () => {
  const [tutors, setTutors] = useState<any[]>([]);
  const [stats, setStats] = useState({ tutors: 0, students: 0, sessions: 0 });
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false); 

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from('profiles').select('*').eq('role', 'tutor').limit(6);
      setTutors(data || [ ]);
      const [{ count: tc }, { count: sc }, { count: ssc }] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'tutor'),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'student'),
        supabase.from('tutoring_sessions').select('*', { count: 'exact', head: true }),
      ]);
      setStats({ tutors: tc || 0, students: sc || 0, sessions: ssc || 0 });
    };
    load();
  }, []);

  const subscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@')) return;
    setLoading(true);
    try {
      await fetch('https://famous.ai/api/crm/6a01db58fbf8fa1e19eb449d/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'footer-signup', tags: ['newsletter', 'tutorconnect-uba'] }),
      });
      toast({ title: 'Subscribed!', description: 'You will hear from us soon.' });
      setEmail('');
    } catch { toast({ title: 'Error', description: 'Try again.' }); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Nav */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-slate-950/70 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-700 to-orange-500 flex items-center justify-center text-white font-bold shadow-lg">UBa</div>
            <div className="leading-tight">
              <div className="font-bold bg-gradient-to-r from-blue-400 to-orange-400 bg-clip-text text-transparent">TutorConnect <span className="text-white">UBa</span></div>
              <div className="text-[10px] text-slate-400 hidden sm:block">University of Bamenda</div>
            </div>
          </Link>
          <nav className="hidden md:flex items-center gap-7">
            <Link to="/" className="text-sm font-medium text-orange-400">Home</Link>
            <Link to="/tutors" className="text-sm text-slate-300 hover:text-white">Find Tutors</Link>
            <Link to="/about" className="text-sm text-slate-300 hover:text-white">About</Link>
            <Link to="/faq" className="text-sm text-slate-300 hover:text-white">FAQ</Link>
            <Link to="/contact" className="text-sm text-slate-300 hover:text-white">Contact</Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm text-slate-300 hover:text-white hidden sm:inline">Login</Link>
            <Link to="/register" className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-orange-500 text-white text-sm font-medium hover:opacity-90">Get Started</Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute -top-40 -left-32 w-[600px] h-[600px] rounded-full bg-blue-600/20 blur-3xl" />
          <div className="absolute top-20 -right-32 w-[500px] h-[500px] rounded-full bg-orange-500/20 blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-16 pb-24 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-orange-500/30 bg-orange-500/10 text-orange-300 text-xs font-medium mb-6">
              <Sparkles size={14} /> University of Bamenda · Official Tutoring Platform
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight tracking-tight">
              Connect with <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-orange-400 bg-clip-text text-transparent">Expert Tutors</span> Instantly
            </h1>
            <p className="text-lg text-slate-300 mt-6 leading-relaxed max-w-xl">
              The official tutoring marketplace for the University of Bamenda — discover qualified tutors, book real-time sessions, and learn through Google Meet.
            </p>
            <div className="flex flex-wrap gap-3 mt-8">
              <Link to="/tutors" className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold inline-flex items-center gap-2"><Search size={18} /> Find a Tutor</Link>
              <Link to="/register/tutor" className="px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold inline-flex items-center gap-2"><GraduationCap size={18} /> Become a Tutor</Link>
            </div>
            <div className="flex gap-8 mt-12">
              {[['Tutors', stats.tutors || '50+'], ['Students', stats.students || '500+'], ['Sessions', stats.sessions || '1000+']].map(([l, v]) => (
                <div key={l}><div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-400 to-orange-400 bg-clip-text text-transparent">{v}</div><div className="text-xs text-slate-400 uppercase tracking-wider">{l}</div></div>
              ))}
            </div>
          </div>
          <div className="relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
            <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=900&q=80" alt="Students" className="w-full h-[480px] object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
          </div>
        </div>
      </section>

      {/* Subjects */}
      <section className="border-y border-white/5 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex flex-wrap gap-2 justify-center">
          {SUBJECTS.map(s => (
            <Link key={s} to={`/tutors?subject=${encodeURIComponent(s)}`} className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-slate-300 hover:bg-orange-500/20 hover:text-orange-300">{s}</Link>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">How It Works</h2>
          <p className="text-slate-400">Four simple steps from finding a tutor to attending your first session</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: <Search size={22} />, t: 'Discover', d: 'Browse verified tutors by subject, price, and rating.' },
            { icon: <MessageCircle size={22} />, t: 'Connect', d: 'Chat in real-time with your chosen tutor.' },
            { icon: <CreditCard size={22} />, t: 'Pay Securely', d: 'Pay via MTN MoMo or Orange Money.' },
            { icon: <Calendar size={22} />, t: 'Learn', d: 'Join your session through Google Meet.' },
          ].map((s, i) => (
            <div key={i} className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-orange-500/40">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-orange-500 flex items-center justify-center mb-4">{s.icon}</div>
              <div className="text-xs text-orange-400 font-medium mb-1">STEP {i + 1}</div>
              <h3 className="text-lg font-semibold mb-2">{s.t}</h3>
              <p className="text-sm text-slate-400">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Tutors */}
      <section className="bg-white/[0.02] border-y border-white/5 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-2">Featured Tutors</h2>
              <p className="text-slate-400">Top-rated tutors ready to help you succeed</p>
            </div>
            <Link to="/tutors" className="hidden sm:inline-flex items-center gap-1 text-orange-400 text-sm">View all <ChevronRight size={16} /></Link>
          </div>
          {tutors.length === 0 ? (
            <div className="text-center py-16 rounded-2xl border border-dashed border-white/10">
              <BookOpen className="mx-auto text-slate-600 mb-4" size={42} />
              <p className="text-slate-400 mb-2">No tutors registered yet.</p>
              <Link to="/register/tutor" className="text-orange-400 font-medium text-sm">Be the first tutor →</Link>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {tutors.map(t => (
                <Link key={t.id} to={`/tutors/${t.id}`} className="block">
                  <div className="rounded-2xl bg-white/[0.04] border border-white/10 p-5 hover:border-orange-500/40 hover:-translate-y-1 transition-all">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-orange-500 flex items-center justify-center text-white font-bold">{t.full_name?.[0]}</div>
                      <div>
                        <div className="font-semibold">{t.full_name}</div>
                        <div className="text-xs text-slate-400">@{t.username}</div>
                      </div>
                    </div>
                    <p className="text-sm text-slate-400 line-clamp-2 mb-4">{t.bio || 'Experienced tutor at UBa.'}</p>
                    <div className="flex items-center justify-between border-t border-white/5 pt-3">
                      <div className="flex items-center gap-1 text-sm"><Star size={14} className="fill-orange-400 text-orange-400" /><span>{Number(t.rating || 0).toFixed(1)}</span></div>
                      <div className="text-sm font-semibold text-orange-400">{t.hourly_rate || 0} XAF/hr</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Why us */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20 grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">Built for UBa Students, by UBa</h2>
          <div className="space-y-5">
            {[
              { icon: <Users size={20} />, t: 'Verified UBa Tutors', d: 'Every tutor is vetted by our admin team.' },
              { icon: <Clock size={20} />, t: 'Flexible Scheduling', d: 'Book sessions that fit your timetable.' },
              { icon: <ShieldCheck size={20} />, t: 'Payment Protection', d: 'Pay only after class is created for you.' },
              { icon: <Star size={20} />, t: 'Transparent Reviews', d: 'Real student reviews help you pick.' },
            ].map((f, i) => (
              <div key={i} className="flex gap-4">
                <div className="w-11 h-11 rounded-lg bg-orange-500/15 text-orange-400 flex items-center justify-center">{f.icon}</div>
                <div><h4 className="font-semibold mb-1">{f.t}</h4><p className="text-slate-400 text-sm">{f.d}</p></div>
              </div>
            ))}
          </div>
        </div>
        <img src="https://images.unsplash.com/photo-1543269865-cbf427effbad?w=900&q=80" alt="Students" className="rounded-2xl border border-white/10" />
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-20">
        <div className="rounded-3xl p-10 sm:p-14 bg-gradient-to-r from-blue-700 via-blue-600 to-orange-500 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Ready to excel academically?</h2>
          <p className="text-white/90 mb-8">Join the University of Bamenda's official tutoring community today.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/register/student" className="px-6 py-3 rounded-xl bg-white text-blue-700 font-semibold">I'm a Student</Link>
            <Link to="/register/tutor" className="px-6 py-3 rounded-xl bg-slate-950 text-white font-semibold">I'm a Tutor</Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-slate-950 text-slate-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14 grid md:grid-cols-4 gap-10">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-700 to-orange-500 flex items-center justify-center text-white font-bold">UBa</div>
              <div className="font-bold bg-gradient-to-r from-blue-400 to-orange-400 bg-clip-text text-transparent">TutorConnect UBa</div>
            </div>
            <p className="text-sm text-slate-400">Connecting Students with Academic Excellence.</p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Platform</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/tutors" className="hover:text-orange-400">Find Tutors</Link></li>
              <li><Link to="/register/tutor" className="hover:text-orange-400">Become a Tutor</Link></li>
              <li><Link to="/register/student" className="hover:text-orange-400">Become a Student</Link></li>
              <li><Link to="/faq" className="hover:text-orange-400">FAQ</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-sm">
              <li className="inline-flex items-center gap-2"><Mail size={14} /> hello@tutorconnect-uba.cm</li>
              <li className="flex items-center gap-2"><Phone size={14} /> +237 6XX XXX XXX</li>
              <li className="flex items-center gap-2"><MapPin size={14} /> UBa, Cameroon</li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Stay Updated</h4>
            <form onSubmit={subscribe} className="flex gap-2">
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm" />
              <button disabled={loading} className="bg-orange-500 px-4 rounded-lg text-sm font-medium">{loading ? '...' : 'Join'}</button>
            </form>
          </div>
        </div>
        <div className="border-t border-white/5 py-6 text-center text-xs text-slate-500">© {new Date().getFullYear()} TutorConnect UBa · University of Bamenda.</div>
      </footer>
    </div>
  );
};

export default AppLayout;
