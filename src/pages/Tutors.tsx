import React, { useEffect, useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { PublicNav } from '@/components/Layout/PublicNav';
import { Footer } from '@/components/Layout/Footer';
import { supabase } from '@/lib/supabase';
import { Search, Star, Filter, MapPin } from 'lucide-react';

const SUBJECTS = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science', 'English', 'French', 'Economics', 'Accounting', 'Law', 'Engineering', 'Medicine'];

const Tutors: React.FC = () => {
  const [params, setParams] = useSearchParams();
  const [tutors, setTutors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [subject, setSubject] = useState(params.get('subject') || '');
  const [minRating, setMinRating] = useState(0);
  const [maxPrice, setMaxPrice] = useState(50000);
  const [sort, setSort] = useState('rating');

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('profiles').select('*').eq('role', 'tutor');
      setTutors(data || []);
      setLoading(false);
    })();
  }, []);

  const filtered = useMemo(() => {
    let arr = tutors;
    if (query) {
      const q = query.toLowerCase();
      arr = arr.filter(t => t.full_name?.toLowerCase().includes(q) || t.username?.toLowerCase().includes(q) || (t.subjects || []).some((s: string) => s.toLowerCase().includes(q)));
    }
    if (subject) arr = arr.filter(t => (t.subjects || []).includes(subject));
    if (minRating > 0) arr = arr.filter(t => (t.rating || 0) >= minRating);
    arr = arr.filter(t => (t.hourly_rate || 0) <= maxPrice);
    if (sort === 'rating') arr = [...arr].sort((a, b) => (b.rating || 0) - (a.rating || 0));
    if (sort === 'price_low') arr = [...arr].sort((a, b) => (a.hourly_rate || 0) - (b.hourly_rate || 0));
    if (sort === 'price_high') arr = [...arr].sort((a, b) => (b.hourly_rate || 0) - (a.hourly_rate || 0));
    return arr;
  }, [tutors, query, subject, minRating, maxPrice, sort]);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <PublicNav />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">Find Your Tutor</h1>
          <p className="text-slate-400">Browse verified tutors at the University of Bamenda</p>
        </div>

        <div className="grid lg:grid-cols-[260px_1fr] gap-6">
          {/* Sidebar */}
          <aside className="space-y-5 bg-white/[0.03] border border-white/10 rounded-2xl p-5 h-fit lg:sticky lg:top-20">
            <div>
              <label className="text-xs uppercase tracking-wider text-slate-400 font-medium flex items-center gap-1 mb-2"><Filter size={12} /> Subject</label>
              <select value={subject} onChange={(e) => { setSubject(e.target.value); setParams(e.target.value ? { subject: e.target.value } : {}); }} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500">
                <option value="">All Subjects</option>
                {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider text-slate-400 font-medium mb-2 block">Min Rating: {minRating}+</label>
              <input type="range" min={0} max={5} step={0.5} value={minRating} onChange={(e) => setMinRating(Number(e.target.value))} className="w-full accent-orange-500" />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider text-slate-400 font-medium mb-2 block">Max Price: {maxPrice.toLocaleString()} XAF</label>
              <input type="range" min={1000} max={50000} step={500} value={maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value))} className="w-full accent-orange-500" />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider text-slate-400 font-medium mb-2 block">Sort By</label>
              <select value={sort} onChange={(e) => setSort(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500">
                <option value="rating">Highest Rated</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
              </select>
            </div>
            <button onClick={() => { setQuery(''); setSubject(''); setMinRating(0); setMaxPrice(50000); setParams({}); }} className="w-full py-2 text-sm rounded-lg border border-white/10 hover:bg-white/5">Clear filters</button>
          </aside>

          {/* Results */}
          <div>
            <div className="relative mb-5">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name, subject, or username..."
                className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-orange-500"
              />
            </div>

            {loading ? (
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-64 rounded-2xl bg-white/5 border border-white/10 animate-pulse" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16 rounded-2xl border border-dashed border-white/10">
                <p className="text-slate-400">No tutors match your filters.</p>
              </div>
            ) : (
              <>
                <div className="text-sm text-slate-400 mb-4">{filtered.length} tutor{filtered.length !== 1 ? 's' : ''} found</div>
                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {filtered.map(t => <TutorCard key={t.id} t={t} />)}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export const TutorCard: React.FC<{ t: any }> = ({ t }) => (
  <Link to={`/tutors/${t.id}`} className="block group">
    <div className="h-full rounded-2xl bg-white/[0.04] border border-white/10 p-5 hover:border-orange-500/40 hover:-translate-y-1 transition-all">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-600 to-orange-500 flex items-center justify-center text-white font-bold text-lg overflow-hidden flex-shrink-0">
          {t.avatar_url ? <img src={t.avatar_url} className="w-full h-full object-cover" /> : t.full_name?.[0]?.toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold group-hover:text-orange-400 transition-colors truncate">{t.full_name}</div>
          <div className="text-xs text-slate-400 truncate">@{t.username}</div>
          <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5"><MapPin size={11} /> UBa</div>
        </div>
      </div>
      <p className="text-sm text-slate-400 line-clamp-2 mb-3 min-h-[40px]">{t.bio || 'Experienced tutor at UBa ready to help you excel.'}</p>
      <div className="flex flex-wrap gap-1 mb-4">
        {(t.subjects || []).slice(0, 3).map((s: string) => (
          <span key={s} className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-300 border border-blue-500/20">{s}</span>
        ))}
        {(t.subjects || []).length > 3 && <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-slate-400">+{t.subjects.length - 3}</span>}
      </div>
      <div className="flex items-center justify-between border-t border-white/5 pt-3">
        <div className="flex items-center gap-1 text-sm">
          <Star size={14} className="fill-orange-400 text-orange-400" />
          <span className="font-medium">{Number(t.rating || 0).toFixed(1)}</span>
          <span className="text-xs text-slate-500">({t.sessions_completed || 0})</span>
        </div>
        <div className="text-sm font-semibold text-orange-400">{(t.hourly_rate || 0).toLocaleString()} XAF<span className="text-xs text-slate-500">/hr</span></div>
      </div>
    </div>
  </Link>
);

export default Tutors;
