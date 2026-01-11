import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables:', {
        url: !!supabaseUrl,
        key: !!supabaseAnonKey
    });
    // Don't throw in production, create a dummy client instead
    if (import.meta.env.PROD) {
        console.warn('Creating dummy Supabase client for production without env vars');
    } else {
        throw new Error('Missing Supabase environment variables');
    }
}

export const supabase = createClient(
    supabaseUrl || 'https://placeholder.supabase.co', 
    supabaseAnonKey || 'placeholder-key', 
    {
        auth: {
            persistSession: true,
            storageKey: 'dayplanr-auth',
            storage: typeof window !== 'undefined' ? window.localStorage : undefined,
            autoRefreshToken: true,
            detectSessionInUrl: true,
        }
    }
);
