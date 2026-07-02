import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export type UserRole = 'student' | 'tutor' | 'admin';

export interface Profile {
  id: string;
  username: string;
  full_name: string;
  email: string;
  role: UserRole;
  avatar_url?: string;
  bio?: string;
  phone?: string;
  subjects?: string[];
  qualifications?: string;
  experience_years?: number;
  hourly_rate?: number;
  languages_spoken?: string[];
  rating?: number;
  sessions_completed?: number;
}

interface AuthContextValue {
  user: any | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ profile?: Profile; error?: string }>;
  signUp: (data: SignUpData) => Promise<{ profile?: Profile; error?: string }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

interface SignUpData {
  email: string;
  password: string;
  username: string;
  full_name: string;
  role: UserRole;
  phone?: string;
  subjects?: string[];
  qualifications?: string;
  experience_years?: number;
  hourly_rate?: number;
  bio?: string;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = async (userId: string) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
    if (data) setProfile(data as Profile);
    return data as Profile | null;
  };

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session?.user) {
        setUser(data.session.user);
        await loadProfile(data.session.user.id);
      }
      setLoading(false);
    };
    init();
    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setUser(session.user);
        await loadProfile(session.user.id);
      } else {
        setUser(null);
        setProfile(null);
      }
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    if (data.user) {
      const p = await loadProfile(data.user.id);
      setUser(data.user);
      return { profile: p || undefined };
    }
    return { error: 'Login failed' };
  };

  const signUp = async (d: SignUpData) => {
    // Check username uniqueness
    const { data: existing } = await supabase.from('profiles').select('id').eq('username', d.username).maybeSingle();
    if (existing) return { error: 'Username already taken' };

    const { data, error } = await supabase.auth.signUp({ email: d.email, password: d.password });
    if (error) return { error: error.message };
    if (!data.user) return { error: 'Signup failed' };

    const profileData: any = {
      id: data.user.id,
      username: d.username,
      full_name: d.full_name,
      email: d.email,
      role: d.role,
      phone: d.phone,
      bio: d.bio,
    };
    if (d.role === 'tutor') {
      profileData.subjects = d.subjects || [];
      profileData.qualifications = d.qualifications;
      profileData.experience_years = d.experience_years || 0;
      profileData.hourly_rate = d.hourly_rate || 0;
      profileData.rating = 0;
      profileData.sessions_completed = 0;
    }

    const { error: pErr } = await supabase.from('profiles').insert(profileData);
    if (pErr) return { error: pErr.message };
    setUser(data.user);
    setProfile(profileData);
    return { profile: profileData };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  const refreshProfile = async () => {
    if (user) await loadProfile(user.id);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, signUp, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
