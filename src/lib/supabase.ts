import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://kfnbscrevyyvabcdzvas.databasepad.com';
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IjMzMGRkZjVhLTEwOWUtNGQ0MS1iNzRmLTQ2Y2UyMWRlZGMxMyJ9.eyJwcm9qZWN0SWQiOiJrZm5ic2NyZXZ5eXZhYmNkenZhcyIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzc4NTA2NjE4LCJleHAiOjIwOTM4NjY2MTgsImlzcyI6ImZhbW91cy5kYXRhYmFzZXBhZCIsImF1ZCI6ImZhbW91cy5jbGllbnRzIn0.T6AfeSY24pWLFShOp-VtV8_gtmf17GuINZ1Ze-W0nlE';

const realtimeDecoder = (rawPayload: unknown, callback: (decoded: any) => void) => {
  if (typeof rawPayload === 'string') {
    try {
      const jsonPayload = JSON.parse(rawPayload);
      if (Array.isArray(jsonPayload)) {
        const [join_ref, ref, topic, event, payload] = jsonPayload;
        return callback({ join_ref, ref, topic, event, payload });
      }
      return callback(jsonPayload);
    } catch (error) {
      console.warn('Supabase realtime decode failed:', error, rawPayload);
      return callback({});
    }
  }

  if (rawPayload instanceof ArrayBuffer || (rawPayload && (rawPayload as any).byteLength !== undefined)) {
    try {
      const decoded = new TextDecoder().decode(rawPayload as ArrayBuffer);
      const jsonPayload = JSON.parse(decoded);
      if (Array.isArray(jsonPayload)) {
        const [join_ref, ref, topic, event, payload] = jsonPayload;
        return callback({ join_ref, ref, topic, event, payload });
      }
      return callback(jsonPayload);
    } catch (error) {
      console.warn('Supabase realtime binary decode failed:', error);
      return callback({});
    }
  }

  return callback(rawPayload);
};

const supabase = createClient(supabaseUrl, supabaseKey, {
  realtime: {
    decode: realtimeDecoder,
  },
});

export { supabase };