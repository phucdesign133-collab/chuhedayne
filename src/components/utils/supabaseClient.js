import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://hujhathvybwaemxlbhod.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1amhhdGh2eWJ3YWVteGxiaG9kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU3NTI1ODYsImV4cCI6MjEwMTMyODU4Nn0.roLidGczzhyb5RrMVzvxXtp25gKFcle14RUZH2J0jg8';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);