import React from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '@/components/Logo';
import { GraduationCap, BookOpen, ChevronRight } from 'lucide-react';

const Register: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="px-6 py-5">
        <Logo />
      </div>
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">Join TutorConnect UBa</h1>
          <p className="text-slate-400">Choose how you want to use the platform</p>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <Link to="/register/student" className="group p-8 rounded-2xl border border-white/10 bg-gradient-to-br from-blue-600/10 to-transparent hover:border-blue-500/50 hover:from-blue-600/20 transition-all">
            <div className="w-14 h-14 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center mb-5">
              <BookOpen size={28} />
            </div>
            <h2 className="text-xl font-bold mb-2">I'm a Student</h2>
            <p className="text-sm text-slate-400 mb-6">Find expert tutors, book sessions, and excel in your studies.</p>
            <div className="inline-flex items-center gap-1 text-blue-400 group-hover:text-blue-300 text-sm font-medium">
              Register as student <ChevronRight size={16} />
            </div>
          </Link>
          <Link to="/register/tutor" className="group p-8 rounded-2xl border border-white/10 bg-gradient-to-br from-orange-500/10 to-transparent hover:border-orange-500/50 hover:from-orange-500/20 transition-all">
            <div className="w-14 h-14 rounded-2xl bg-orange-500/20 text-orange-400 flex items-center justify-center mb-5">
              <GraduationCap size={28} />
            </div>
            <h2 className="text-xl font-bold mb-2">I'm a Tutor</h2>
            <p className="text-sm text-slate-400 mb-6">Share your knowledge, manage sessions, and earn from teaching.</p>
            <div className="inline-flex items-center gap-1 text-orange-400 group-hover:text-orange-300 text-sm font-medium">
              Register as tutor <ChevronRight size={16} />
            </div>
          </Link>
        </div>
        <p className="text-center text-sm text-slate-400 mt-10">
          Already registered?{' '}
          <Link to="/login" className="text-orange-400 hover:text-orange-300 font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
