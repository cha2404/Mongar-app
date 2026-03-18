import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://klhxridgxdddprahqdep.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_GNZTmage0g05Dpu-UInb5Q_32-uTzYV';

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});
