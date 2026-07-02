import { createClient } from '@supabase/supabase-js';
const supabaseUrl = 'https://kfnbscrevyyvabcdzvas.databasepad.com';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwcm9qZWN0SWQiOiJrZm5ic2NyZXZ5eXZhYmNkenZhcyIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzc4NTA2NjE4LCJleHAiOjIwOTM4NjY2MTgsImlzcyI6ImZhbW91cy5kYXRhYmFzZXBhZCIsImF1ZCI6ImZhbW91cy5jbGllbnRzIn0.T6AfeSY24pWLFShOp-VtV8_gtmf17GuINZ1Ze-W0nlE';
const supabase = createClient(supabaseUrl, supabaseKey);
const tutorId = '41e8c650-038b-493f-92c7-2fc6eb7ea963';
(async () => {
  console.log('testing raw select');
  let r = await supabase.from('tutoring_sessions').select('id,tutor_id,student_id,session_date,payment_status').eq('tutor_id', tutorId).limit(5);
  console.log(JSON.stringify(r, null, 2));
  const qry = '*, student:profiles!tutoring_sessions_student_id_fkey(id, full_name, username, avatar_url)';
  console.log('testing join select');
  r = await supabase.from('tutoring_sessions').select(qry).eq('tutor_id', tutorId).order('session_date', { ascending: false }).limit(5);
  console.log(JSON.stringify(r, null, 2));
})();