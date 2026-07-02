import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PublicNav } from '@/components/Layout/PublicNav';
import { Footer } from '@/components/Layout/Footer';
import { supabase } from '@/lib/supabase';
import { Search, MessageCircle, Calendar, CreditCard, Star, GraduationCap, BookOpen, Users, Clock, ShieldCheck, ChevronRight, Sparkles } from 'lucide-react';

const SUBJECTS = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science', 'English', 'French', 'Economics', 'Accounting', 'Law', 'Engineering', 'Medicine'];

const Landing: React.FC = () => {
  const [tutors, setTutors] = useState<any[]>([]);
  const [stats, setStats] = useState({ tutors: 0, students: 0, sessions: 0 });

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from('profiles').select('*').eq('role', 'tutor').limit(6);
      setTutors(data || []);
      const [{ count: tCount }, { count: sCount }, { count: sessCount }] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'tutor'),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'student'),
        supabase.from('tutoring_sessions').select('*', { count: 'exact', head: true }),
      ]);
      setStats({ tutors: tCount || 0, students: sCount || 0, sessions: sessCount || 0 });
    };
    load();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <PublicNav />

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute -top-40 -left-32 w-[600px] h-[600px] rounded-full bg-blue-600/20 blur-3xl" />
          <div className="absolute top-20 -right-32 w-[500px] h-[500px] rounded-full bg-orange-500/20 blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-16 pb-24 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-orange-500/30 bg-orange-500/10 text-orange-300 text-xs font-medium mb-6">
              <Sparkles size={14} />
              TutorConnect · Tutoring platform for everyone
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight tracking-tight">
              Connect with <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-orange-400 bg-clip-text text-transparent">Expert Tutors</span> Instantly
            </h1>
            <p className="text-lg text-slate-300 mt-6 leading-relaxed max-w-xl">
              TutorConnect is a tutoring marketplace for everyone — discover qualified tutors, book real-time sessions, and learn through online or in-person sessions.
            </p>
            <div className="flex flex-wrap gap-3 mt-8">
              <Link to="/tutors" className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold hover:shadow-lg hover:shadow-blue-600/40 transition-all inline-flex items-center gap-2">
                <Search size={18} /> Find a Tutor
              </Link>
              <Link to="/register/tutor" className="px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold hover:shadow-lg hover:shadow-orange-500/40 transition-all inline-flex items-center gap-2">
                <GraduationCap size={18} /> Become a Tutor
              </Link>
            </div>
            <div className="flex gap-8 mt-12">
              <Stat label="Tutors" value={stats.tutors || '50+'} />
              <Stat label="Students" value={stats.students || '500+'} />
              <Stat label="Sessions" value={stats.sessions || '1000+'} />
            </div>
          </div>
          <div className="relative">
            <div className="relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl shadow-blue-900/40">
              <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=900&q=80" alt="Students learning" className="w-full h-[480px] object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 grid grid-cols-2 gap-3">
                <FloatCard icon={<MessageCircle size={18} />} title="Real-time Chat" desc="Talk to tutors instantly" />
                <FloatCard icon={<ShieldCheck size={18} />} title="Secure Payments" desc="MTN & Orange Money" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SUBJECTS */}
      <section className="border-y border-white/5 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex flex-wrap gap-2 justify-center">
            {SUBJECTS.map(s => (
              <Link key={s} to={`/tutors?subject=${encodeURIComponent(s)}`} className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-slate-300 hover:bg-orange-500/20 hover:border-orange-500/40 hover:text-orange-300 transition-colors">
                {s}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">How It Works</h2>
          <p className="text-slate-400 max-w-2xl mx-auto">Four simple steps from finding a tutor to attending your first session</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: <Search size={22} />, t: 'Discover', d: 'Browse verified tutors by subject, price, and rating.' },
            { icon: <MessageCircle size={22} />, t: 'Connect', d: 'Chat in real-time with your chosen tutor.' },
            { icon: <CreditCard size={22} />, t: 'Pay Securely', d: 'Pay via MTN MoMo or Orange Money.' },
            { icon: <Calendar size={22} />, t: 'Learn', d: 'Join your session through Google Meet.' },
          ].map((step, i) => (
            <div key={i} className="relative p-6 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-orange-500/40 hover:bg-white/[0.05] transition-all">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-orange-500 flex items-center justify-center text-white mb-4">{step.icon}</div>
              <div className="text-xs text-orange-400 font-medium mb-1">STEP {i + 1}</div>
              <h3 className="text-lg font-semibold mb-2">{step.t}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{step.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURED TUTORS */}
      <section className="bg-white/[0.02] border-y border-white/5 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-2">Featured Tutors</h2>
              <p className="text-slate-400">Top-rated tutors ready to help you succeed</p>
            </div>
            <Link to="/tutors" className="hidden sm:inline-flex items-center gap-1 text-orange-400 hover:text-orange-300 text-sm font-medium">
              View all <ChevronRight size={16} />
            </Link>
          </div>
          {tutors.length === 0 ? (
            <div className="text-center py-16 rounded-2xl border border-dashed border-white/10">
              <BookOpen className="mx-auto text-slate-600 mb-4" size={42} />
              <p className="text-slate-400 mb-2">No tutors registered yet.</p>
              <Link to="/register/tutor" className="text-orange-400 hover:text-orange-300 font-medium text-sm">Be the first tutor</Link>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {tutors.map(t => <TutorCardMini key={t.id} t={t} />)}
            </div>
          )}
        </div>
      </section>

      {/* WHY US */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="order-2 lg:order-1">
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">Built for learners, by learners</h2>
            <div className="space-y-5">
              {[
                { icon: <Users size={20} />, t: 'Verified Tutors', d: 'Every tutor is vetted and approved by our admin team.' },
                { icon: <Clock size={20} />, t: 'Flexible Scheduling', d: 'Book sessions that fit your academic timetable.' },
                { icon: <ShieldCheck size={20} />, t: 'Payment Protection', d: 'Your money is held until the class is unlocked.' },
                { icon: <Star size={20} />, t: 'Transparent Reviews', d: 'Real student reviews help you pick the right tutor.' },
              ].map((f, i) => (
                <div key={i} className="flex gap-4">
                  <div className="flex-shrink-0 w-11 h-11 rounded-lg bg-orange-500/15 text-orange-400 flex items-center justify-center">{f.icon}</div>
                  <div>
                    <h4 className="font-semibold mb-1">{f.t}</h4>
                    <p className="text-slate-400 text-sm">{f.d}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="order-1 lg:order-2">
            <img src="https://images.unsplash.com/photo-1543269865-cbf427effbad?w=900&q=80" alt="Students" className="rounded-2xl shadow-2xl border border-white/10" />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-20">
        <div className="rounded-3xl p-10 sm:p-14 bg-gradient-to-r from-blue-700 via-blue-600 to-orange-500 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.15),transparent)]" />
          <div className="relative">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Ready to excel academically?</h2>
            <p className="text-white/90 mb-8 max-w-xl mx-auto">Join TutorConnect's tutoring community today.</p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link to="/register/student" className="px-6 py-3 rounded-xl bg-white text-blue-700 font-semibold hover:bg-slate-100">I'm a Student</Link>
              <Link to="/register/tutor" className="px-6 py-3 rounded-xl bg-slate-950 text-white font-semibold hover:bg-slate-900">I'm a Tutor</Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

const Stat: React.FC<{ label: string; value: any }> = ({ label, value }) => (
  <div>
    <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-400 to-orange-400 bg-clip-text text-transparent">{value}</div>
    <div className="text-xs text-slate-400 uppercase tracking-wider">{label}</div>
  </div>
);

const FloatCard: React.FC<{ icon: React.ReactNode; title: string; desc: string }> = ({ icon, title, desc }) => (
  <div className="bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-xl p-3">
    <div className="flex items-center gap-2 text-orange-400 mb-1">{icon}<span className="text-xs font-semibold uppercase">{title}</span></div>
    <div className="text-xs text-slate-300">{desc}</div>
  </div>
);

const TutorCardMini: React.FC<{ t: any }> = ({ t }) => (
  <Link to={`/tutors/${t.id}`} className="block group">
    <div className="rounded-2xl bg-white/[0.04] border border-white/10 p-5 hover:border-orange-500/40 hover:-translate-y-1 transition-all">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-orange-500 flex items-center justify-center text-white font-bold">
          {t.avatar_url ? <img src={t.avatar_url} className="w-full h-full rounded-full object-cover" /> : t.full_name?.[0]}
        </div>
        <div>
          <div className="font-semibold group-hover:text-orange-400 transition-colors">{t.full_name}</div>
          <div className="text-xs text-slate-400">@{t.username}</div>
        </div>
      </div>
      <p className="text-sm text-slate-400 line-clamp-2 mb-4">{t.bio || 'Experienced tutor ready to help you excel.'}</p>
      <div className="flex flex-wrap gap-1 mb-4">
        {(t.subjects || []).slice(0, 3).map((s: string) => (
          <span key={s} className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-300 border border-blue-500/20">{s}</span>
        ))}
      </div>
      <div className="flex items-center justify-between border-t border-white/5 pt-3">
        <div className="flex items-center gap-1 text-sm">
          <Star size={14} className="fill-orange-400 text-orange-400" />
          <span>{Number(t.rating || 0).toFixed(1)}</span>
        </div>
        <div className="text-sm font-semibold text-orange-400">{t.hourly_rate || 0} XAF/hr</div>
      </div>
    </div>
  </Link>
);

export default Landing;
