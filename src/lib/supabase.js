import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://oirtcplqedetfhzrdgas.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9pcnRjcGxxZWRldGZoenJkZ2FzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU2MDYwNjEsImV4cCI6MjA2MTE4MjA2MX0.zvuim443d1ubytoelwunJQI3JhsIq6Fq58GkQDPPOsQ';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});