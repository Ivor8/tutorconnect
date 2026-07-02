import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '@/components/Logo';
import { toast } from '@/components/ui/use-toast';

export const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const subscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@')) return;
    setLoading(true);
    try {
      await fetch('https://famous.ai/api/crm/6a01db58fbf8fa1e19eb449d/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'footer-signup', tags: ['newsletter', 'tutorconnect'] }),
      });
      toast({ title: 'Subscribed!', description: 'You will hear from us soon.' });
      setEmail('');
    } catch {
      toast({ title: 'Error', description: 'Please try again.' });
    }
    setLoading(false);
  };

  return (
    <footer className="border-t border-white/10 bg-slate-950 text-slate-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14 grid grid-cols-1 md:grid-cols-4 gap-10">
        <div className="md:col-span-1">
          <Logo />
          <p className="text-sm text-slate-400 mt-4 leading-relaxed">
            Connecting learners with academic excellence.
          </p>
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
          <h4 className="text-white font-semibold mb-4">Company</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/about" className="hover:text-orange-400">About Us</Link></li>
            <li><Link to="/contact" className="hover:text-orange-400">Contact</Link></li>
            <li><a href="#" className="hover:text-orange-400">Privacy Policy</a></li>
            <li><a href="#" className="hover:text-orange-400">Terms of Service</a></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-4">Stay Updated</h4>
          <p className="text-sm text-slate-400 mb-3">Get tutoring tips and platform updates.</p>
          <form onSubmit={subscribe} className="flex gap-2">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-orange-500"
            />
            <button disabled={loading} className="bg-orange-500 hover:bg-orange-600 text-white px-4 rounded-lg text-sm font-medium disabled:opacity-60">
              {loading ? '...' : 'Join'}
            </button>
          </form>
        </div>
      </div>
      <div className="border-t border-white/5 py-6 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} TutorConnect. All rights reserved.
      </div>
    </footer>
  );
};
