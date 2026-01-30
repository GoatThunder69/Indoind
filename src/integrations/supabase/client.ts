import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://yablbrgvptfvybxfbsqc.supabase.co';
const supabaseAnonKey = 'sb_publishable_ao_rDM_cHQAxzpaQlFKUnQ_C-K2pKgS';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
