import React, { useState } from 'react';
import { PublicNav } from '@/components/Layout/PublicNav';
import { Footer } from '@/components/Layout/Footer';
import { toast } from '@/components/ui/use-toast';
import { Mail, Phone, MapPin, ChevronDown, BookOpen, Users, Target, Award } from 'lucide-react';

export const About: React.FC = () => (
  <div className="min-h-screen bg-slate-950 text-white">
    <PublicNav />
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-14">
      <h1 className="text-4xl sm:text-5xl font-bold mb-4">About TutorConnect UBa</h1>
      <p className="text-slate-300 text-lg leading-relaxed max-w-3xl">
        TutorConnect UBa is the official tutoring marketplace built exclusively for students at the University of Bamenda. We connect students with qualified tutors from across the university, enabling seamless real-time communication, scheduling, and online learning.
      </p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 my-12">
        {[
          { i: BookOpen, t: 'Quality Education', d: 'Verified tutors from UBa across all disciplines.' },
          { i: Users, t: 'Real Community', d: 'Connect with real UBa students and tutors.' },
          { i: Target, t: 'Goal Focused', d: 'Achieve academic excellence with tailored sessions.' },
          { i: Award, t: 'Trusted Platform', d: 'Built for and by the University of Bamenda.' },
        ].map((v, i) => (
          <div key={i} className="p-5 rounded-2xl bg-white/[0.04] border border-white/10">
            <v.i size={24} className="text-orange-400 mb-3" />
            <h3 className="font-semibold mb-1">{v.t}</h3>
            <p className="text-sm text-slate-400">{v.d}</p>
          </div>
        ))}
      </div>
      <div className="rounded-2xl overflow-hidden border border-white/10">
        <img src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1400&q=80" alt="UBa students" className="w-full h-72 object-cover" />
      </div>
      <div className="prose prose-invert max-w-none mt-10">
        <h2 className="text-2xl font-bold mb-3">Our Mission</h2>
        <p className="text-slate-300 leading-relaxed">
          To empower every student at the University of Bamenda with access to high-quality, affordable, and flexible tutoring — bridging the gap between knowledge and academic success through technology.
        </p>
      </div>
    </div>
    <Footer />
  </div>
);

export const Contact: React.FC = () => {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [loading, setLoading] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch('https://famous.ai/api/crm/6a01db58fbf8fa1e19eb449d/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, name: form.name, source: 'contact-form', tags: ['contact', form.message ? 'inquiry' : 'general'] }),
      });
      toast({ title: 'Message sent!', description: 'We will get back to you soon.' });
      setForm({ name: '', email: '', message: '' });
    } catch {
      toast({ title: 'Error', description: 'Try again later.' });
    }
    setLoading(false);
  };
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <PublicNav />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-14">
        <h1 className="text-4xl sm:text-5xl font-bold mb-4">Get in Touch</h1>
        <p className="text-slate-400 mb-10">Questions, feedback, or partnership ideas? Reach out.</p>
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-5">
            <Contact_Item icon={<Mail />} label="Email" value="hello@tutorconnect-uba.cm" />
            <Contact_Item icon={<Phone />} label="Phone" value="+237 6XX XXX XXX" />
            <Contact_Item icon={<MapPin />} label="Address" value="University of Bamenda, North West Region, Cameroon" />
          </div>
          <form onSubmit={submit} className="bg-white/[0.04] border border-white/10 rounded-2xl p-6 space-y-4">
            <input required placeholder="Your name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-orange-500" />
            <input required type="email" placeholder="Your email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-orange-500" />
            <textarea required rows={4} placeholder="Your message" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-orange-500" />
            <button disabled={loading} className="w-full py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-orange-500 font-semibold disabled:opacity-50">{loading ? 'Sending...' : 'Send Message'}</button>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
};

const Contact_Item: React.FC<{ icon: React.ReactNode; label: string; value: string }> = ({ icon, label, value }) => (
  <div className="flex items-start gap-4 p-5 rounded-2xl bg-white/[0.04] border border-white/10">
    <div className="w-10 h-10 rounded-lg bg-orange-500/15 text-orange-400 flex items-center justify-center">{icon}</div>
    <div>
      <div className="text-xs text-slate-400 uppercase tracking-wider">{label}</div>
      <div className="font-medium mt-0.5">{value}</div>
    </div>
  </div>
);

const FAQS = [
  { q: 'How do I find a tutor?', a: 'Browse tutors at /tutors. Use filters to find tutors by subject, price, and rating.' },
  { q: 'How does payment work?', a: 'Tutors create sessions and assign them to you. You pay via MTN MoMo or Orange Money (simulated for demo) to unlock the Google Meet link.' },
  { q: 'Are tutors verified?', a: 'Yes — all tutors are verified by our admin team before they appear publicly.' },
  { q: 'Can I message a tutor before booking?', a: 'Absolutely. Click "Message" on any tutor profile to start a real-time chat.' },
  { q: 'What if I cancel a session?', a: 'Tutors can cancel sessions and you will be notified. Contact support for refund queries.' },
  { q: 'Is the platform free to join?', a: 'Yes, registering as a student or tutor is completely free. You only pay per session.' },
];

export const FAQ: React.FC = () => {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <PublicNav />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-14">
        <h1 className="text-4xl sm:text-5xl font-bold mb-4">Frequently Asked Questions</h1>
        <p className="text-slate-400 mb-10">Everything you need to know about TutorConnect UBa.</p>
        <div className="space-y-3">
          {FAQS.map((f, i) => (
            <div key={i} className="bg-white/[0.04] border border-white/10 rounded-2xl overflow-hidden">
              <button onClick={() => setOpen(open === i ? null : i)} className="w-full p-5 flex justify-between items-center text-left">
                <span className="font-medium">{f.q}</span>
                <ChevronDown size={18} className={`transition-transform ${open === i ? 'rotate-180' : ''}`} />
              </button>
              {open === i && <div className="px-5 pb-5 text-sm text-slate-300 leading-relaxed">{f.a}</div>}
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
};
