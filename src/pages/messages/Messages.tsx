import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { DashboardLayout } from '@/components/Layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Send, MessageCircle, Search } from 'lucide-react';

const Messages: React.FC = () => {
  const { profile } = useAuth();
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [activeConv, setActiveConv] = useState<any>(null);
  const [text, setText] = useState('');
  const [search, setSearch] = useState('');

  const basePath = profile?.role === 'tutor' ? '/tutor/messages' : '/student/messages';

  useEffect(() => {
    if (!profile) return;
    const load = async () => {
      const { data } = await supabase
        .from('conversations')
        .select('*')
        .or(`participant_a.eq.${profile.id},participant_b.eq.${profile.id}`)
        .order('last_message_at', { ascending: false });

      const conversations = data || [];
      const profileIds = Array.from(
        new Set(
          conversations.flatMap((c: any) => [c.participant_a, c.participant_b]).filter(Boolean)
        )
      );

      let profiles: any[] = [];
      if (profileIds.length > 0) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('id, full_name, username, avatar_url, role')
          .in('id', profileIds);
        profiles = profileData || [];
      }

      setConversations(
        conversations.map((conversation: any) => ({
          ...conversation,
          p_a: profiles.find((p: any) => p.id === conversation.participant_a),
          p_b: profiles.find((p: any) => p.id === conversation.participant_b),
        }))
      );
    };
    load();
    const ch = supabase.channel('conv-list')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'conversations' }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [profile]);

  useEffect(() => {
    if (!conversationId || !profile) {
      setActiveConv(null); setMessages([]); return;
    }
    const conv = conversations.find(c => c.id === conversationId);
    if (conv) setActiveConv(conv);

    const loadMsgs = async () => {
      const { data } = await supabase.from('messages').select('*').eq('conversation_id', conversationId).order('created_at', { ascending: true });
      setMessages(data || []);
      // Mark as read
      await supabase.from('messages').update({ is_read: true }).eq('conversation_id', conversationId).eq('receiver_id', profile.id).eq('is_read', false);
    };
    loadMsgs();

    const ch = supabase.channel(`conv-${conversationId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${conversationId}` }, (payload) => {
        setMessages(prev => [...prev, payload.new]);
        if ((payload.new as any).receiver_id === profile.id) {
          supabase.from('messages').update({ is_read: true }).eq('id', (payload.new as any).id);
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [conversationId, conversations, profile]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !activeConv || !profile) return;
    const other = activeConv.p_a.id === profile.id ? activeConv.p_b : activeConv.p_a;
    const content = text.trim();
    setText('');
    await supabase.from('messages').insert({
      conversation_id: activeConv.id,
      sender_id: profile.id,
      receiver_id: other.id,
      content,
    });
    await supabase.from('conversations').update({ last_message: content, last_message_at: new Date().toISOString() }).eq('id', activeConv.id);
    await supabase.from('notifications').insert({
      user_id: other.id,
      type: 'message',
      title: `New message from ${profile.full_name}`,
      body: content.slice(0, 80),
      link: `/${other.role}/messages/${activeConv.id}`,
    });
  };

  const getOther = (c: any) => c.p_a.id === profile?.id ? c.p_b : c.p_a;
  const filtered = conversations.filter(c => {
    const o = getOther(c);
    return o.full_name?.toLowerCase().includes(search.toLowerCase()) || o.username?.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <DashboardLayout title="Messages">
      <div className="grid lg:grid-cols-[320px_1fr] gap-4 h-[calc(100vh-220px)] min-h-[500px]">
        <div className={`bg-white/[0.03] border border-white/10 rounded-2xl flex flex-col ${activeConv ? 'hidden lg:flex' : ''}`}>
          <div className="p-3 border-b border-white/10">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search..." className="w-full pl-9 pr-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-orange-500" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="p-6 text-center text-sm text-slate-400">No conversations yet.</div>
            ) : filtered.map(c => {
              const o = getOther(c);
              const active = c.id === conversationId;
              return (
                <Link key={c.id} to={`${basePath}/${c.id}`} className={`block p-3 border-b border-white/5 hover:bg-white/5 ${active ? 'bg-white/[0.07]' : ''}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-orange-500 flex items-center justify-center text-sm font-bold flex-shrink-0">
                      {o.full_name?.[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{o.full_name}</div>
                      <div className="text-xs text-slate-400 truncate">{c.last_message || 'No messages yet'}</div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        <div className={`bg-white/[0.03] border border-white/10 rounded-2xl flex flex-col ${!activeConv ? 'hidden lg:flex' : ''}`}>
          {activeConv ? (
            <>
              <div className="p-3 border-b border-white/10 flex items-center gap-3">
                <button onClick={() => navigate(basePath)} className="lg:hidden text-slate-400">←</button>
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-orange-500 flex items-center justify-center text-sm font-bold">
                  {getOther(activeConv).full_name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <div className="text-sm font-medium">{getOther(activeConv).full_name}</div>
                  <div className="text-xs text-slate-400">@{getOther(activeConv).username}</div>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {messages.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-sm text-slate-400">Start the conversation</div>
                ) : messages.map(m => {
                  const mine = m.sender_id === profile?.id;
                  return (
                    <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm ${mine ? 'bg-gradient-to-r from-blue-600 to-orange-500 text-white rounded-br-sm' : 'bg-white/10 rounded-bl-sm'}`}>
                        {m.content}
                        <div className={`text-[10px] mt-1 ${mine ? 'text-white/70' : 'text-slate-400'}`}>
                          {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <form onSubmit={send} className="p-3 border-t border-white/10 flex gap-2">
                <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Type a message..." className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-sm focus:outline-none focus:border-orange-500" />
                <button type="submit" disabled={!text.trim()} className="px-4 py-2 rounded-full bg-gradient-to-r from-blue-600 to-orange-500 disabled:opacity-50 inline-flex items-center gap-1 text-sm font-medium">
                  <Send size={14} />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
              <MessageCircle size={42} className="mb-3 text-slate-600" />
              <p>Select a conversation to start chatting</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Messages;
