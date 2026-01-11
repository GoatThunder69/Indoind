import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qmjvqojwbopnpsbggqen.supabase.co';
const supabaseAnonKey = 'sb_publishable_qUuvfe5roPF3igwQk4gLFg_PtsW-6Yv';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
