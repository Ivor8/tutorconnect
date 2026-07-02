import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { PublicNav } from '@/components/Layout/PublicNav';
import { Footer } from '@/components/Layout/Footer';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Star, MessageCircle, Heart, GraduationCap, Globe, Award, Clock } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

const TutorDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [tutor, setTutor] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [isFav, setIsFav] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      if (!id) return;
      const { data } = await supabase.from('profiles').select('*').eq('id', id).maybeSingle();
      setTutor(data);
      const { data: revs } = await supabase.from('reviews').select('*, student:profiles!reviews_student_id_fkey(full_name, username, avatar_url)').eq('tutor_id', id).order('created_at', { ascending: false });
      setReviews(revs || []);
      if (profile?.role === 'student') {
        const { data: f } = await supabase.from('favourites').select('id').eq('student_id', profile.id).eq('tutor_id', id).maybeSingle();
        setIsFav(!!f);
      }
      setLoading(false);
    })();
  }, [id, profile]);

  const toggleFav = async () => {
    if (!profile) return navigate('/login');
    if (profile.role !== 'student') return;
    if (isFav) {
      await supabase.from('favourites').delete().eq('student_id', profile.id).eq('tutor_id', id!);
      setIsFav(false);
    } else {
      await supabase.from('favourites').insert({ student_id: profile.id, tutor_id: id! });
      setIsFav(true);
      toast({ title: 'Added to favourites' });
    }
  };

  const startChat = async () => {
    if (!profile) return navigate('/login');
    if (profile.role !== 'student' || !id) return;
    const [a, b] = [profile.id, id].sort();
    let { data: conv } = await supabase.from('conversations').select('id').eq('participant_a', a).eq('participant_b', b).maybeSingle();
    if (!conv) {
      const { data: c } = await supabase.from('conversations').insert({ participant_a: a, participant_b: b }).select().single();
      conv = c;
    }
    navigate(`/student/messages/${conv!.id}`);
  };

  if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center"><div className="w-10 h-10 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" /></div>;
  if (!tutor) return <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">Tutor not found</div>;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <PublicNav />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <Link to="/tutors" className="text-sm text-slate-400 hover:text-white mb-6 inline-block">← All tutors</Link>
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-6">
              <div className="flex flex-col sm:flex-row gap-5">
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-600 to-orange-500 flex items-center justify-center text-white font-bold text-3xl overflow-hidden flex-shrink-0">
                  {tutor.avatar_url ? <img src={tutor.avatar_url} className="w-full h-full object-cover" /> : tutor.full_name?.[0]?.toUpperCase()}
                </div>
                <div className="flex-1">
                  <h1 className="text-2xl font-bold">{tutor.full_name}</h1>
                  <div className="text-sm text-slate-400">@{tutor.username}</div>
                  <div className="flex items-center gap-1 mt-2 text-sm">
                    <Star size={15} className="fill-orange-400 text-orange-400" />
                    <span className="font-medium">{Number(tutor.rating || 0).toFixed(1)}</span>
                    <span className="text-slate-500">· {tutor.sessions_completed || 0} sessions</span>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button onClick={startChat} className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-orange-500 text-sm font-semibold inline-flex items-center gap-2 hover:opacity-90">
                      <MessageCircle size={15} /> Message
                    </button>
                    <button onClick={toggleFav} className={`px-3 py-2 rounded-lg border text-sm inline-flex items-center gap-2 ${isFav ? 'bg-pink-500/15 border-pink-500/40 text-pink-300' : 'border-white/10 hover:bg-white/5'}`}>
                      <Heart size={15} className={isFav ? 'fill-pink-400' : ''} /> {isFav ? 'Saved' : 'Save'}
                    </button>
                  </div>
                </div>
              </div>
              {tutor.bio && <p className="text-slate-300 mt-5 leading-relaxed">{tutor.bio}</p>}
            </div>

            <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-6">
              <h2 className="text-lg font-semibold mb-4">Reviews</h2>
              {reviews.length === 0 ? (
                <p className="text-slate-400 text-sm">No reviews yet.</p>
              ) : (
                <div className="space-y-4">
                  {reviews.map(r => (
                    <div key={r.id} className="border-b border-white/5 pb-4 last:border-0">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-8 h-8 rounded-full bg-blue-500/30 flex items-center justify-center text-sm font-medium">{r.student?.full_name?.[0]}</div>
                        <div>
                          <div className="text-sm font-medium">{r.student?.full_name}</div>
                          <div className="flex items-center gap-0.5">{Array.from({ length: 5 }).map((_, i) => <Star key={i} size={11} className={i < r.rating ? 'fill-orange-400 text-orange-400' : 'text-slate-700'} />)}</div>
                        </div>
                      </div>
                      <p className="text-sm text-slate-300 mt-2">{r.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <aside className="space-y-4">
            <div className="bg-gradient-to-br from-orange-500/15 to-blue-600/15 border border-orange-500/30 rounded-2xl p-6 text-center">
              <div className="text-xs uppercase tracking-wider text-orange-300">Hourly Rate</div>
              <div className="text-3xl font-bold mt-1">{(tutor.hourly_rate || 0).toLocaleString()} <span className="text-base text-slate-300">XAF</span></div>
            </div>
            <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-5 space-y-3 text-sm">
              <Detail icon={<Award size={15} />} label="Qualifications" value={tutor.qualifications || '—'} />
              <Detail icon={<Clock size={15} />} label="Experience" value={`${tutor.experience_years || 0} years`} />
              <Detail icon={<Globe size={15} />} label="Languages" value={(tutor.languages_spoken || ['English', 'French']).join(', ')} />
              <Detail icon={<GraduationCap size={15} />} label="Subjects" value={(tutor.subjects || []).join(', ') || '—'} />
            </div>
          </aside>
        </div>
      </div>
      <Footer />
    </div>
  );
};

const Detail: React.FC<{ icon: React.ReactNode; label: string; value: string }> = ({ icon, label, value }) => (
  <div>
    <div className="flex items-center gap-2 text-slate-400 mb-1 text-xs uppercase tracking-wider">{icon}{label}</div>
    <div className="text-sm text-white">{value}</div>
  </div>
);

export default TutorDetail;
