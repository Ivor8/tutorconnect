import { createClient } from '@supabase/supabase-js';
const supabaseUrl = 'https://kfnbscrevyyvabcdzvas.databasepad.com';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IjMzMGRkZjVhLTEwOWUtNGQ0MS1iNzRmLTQ2Y2UyMWRlZGMxMyJ9.eyJwcm9qZWN0SWQiOiJrZm5ic2NyZXZ5eXZhYmNkenZhcyIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzc4NTA2NjE4LCJleHAiOjIwOTM4NjY2MTgsImlzcyI6ImZhbW91cy5kYXRhYmFzZXBhZCIsImF1ZCI6ImZhbW91cy5jbGllbnRzIn0.T6AfeSY24pWLFShOp-VtV8_gtmf17GuINZ1Ze-W0nlE';
const supabase = createClient(supabaseUrl, supabaseKey);
(async () => {
  try {
    const res = await supabase.auth.signUp({ email: 'test-user@example.com', password: 'test1234' });
    console.log(JSON.stringify(res, null, 2));
  } catch (err) {
    console.error(err);
  }
})();
