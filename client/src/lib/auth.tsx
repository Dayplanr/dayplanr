import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { supabase } from './supabase';
import { User, Session, SignInWithPasswordCredentials, SignUpWithPasswordCredentials, AuthResponse } from '@supabase/supabase-js';

interface AuthContextType {
    user: User | null;
    session: Session | null;
    loading: boolean;
    signIn: (credentials: SignInWithPasswordCredentials) => Promise<AuthResponse>;
    signUp: (credentials: SignUpWithPasswordCredentials) => Promise<AuthResponse>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);
    const isInitialized = useRef(false);

    useEffect(() => {
        console.log('[Auth] Initializing auth provider...');

        let mounted = true;

        // Check active sessions and sets the user
        const initializeAuth = async () => {
            try {
                // Check if we have any supabase auth token in localStorage (common keys)
                const storageKeys = [
                    'sb-vrtlltthcfiagmcwjrhq-auth-token', // default for this project
                    'supabase.auth.token' // older default
                ];
                const hasKey = storageKeys.some(key => typeof window !== 'undefined' && window.localStorage.getItem(key));
                console.log('[Auth] localStorage session hint:', hasKey ? 'Found' : 'Not found');

                // Try to get session immediately
                let { data: { session }, error } = await supabase.auth.getSession();

                if (error) {
                    console.error('[Auth] Error getting session:', error);
                }

                // If no session found yet, but we saw a hint in localStorage, 
                // wait a bit longer for Supabase to "warm up" (common on mobile)
                if (!session && hasKey && mounted) {
                    console.log('[Auth] Session hint found but no session yet, waiting 500ms...');
                    await new Promise(resolve => setTimeout(resolve, 500));
                    if (!mounted) return;

                    const retryResult = await supabase.auth.getSession();
                    session = retryResult.data.session;
                    console.log('[Auth] Retry result:', session ? 'Session recovered' : 'Still no session');
                }

                if (mounted) {
                    console.log('[Auth] Initialization final state:', session ? 'Authenticated' : 'Unauthenticated');
                    setSession(session);
                    setUser(session?.user ?? null);
                    isInitialized.current = true;
                    setLoading(false);
                }
            } catch (err) {
                console.error('[Auth] Initial check failed:', err);
                if (mounted) {
                    isInitialized.current = true;
                    setLoading(false);
                }
            }
        };

        initializeAuth();

        // Listen for changes on auth state (logged in, signed out, etc.)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            console.log('[Auth] Auth state changed:', event, session ? 'Session active' : 'No session');

            if (mounted) {
                setSession(session);
                setUser(session?.user ?? null);
                // Only update loading if we've already done our initial check
                if (isInitialized.current) {
                    setLoading(false);
                }
            }
        });

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, []);

    const signIn = async (credentials: SignInWithPasswordCredentials) => {
        const response = await supabase.auth.signInWithPassword(credentials);
        if (response.data.session) {
            setSession(response.data.session);
            setUser(response.data.session.user);
        }
        return response;
    };

    const signUp = async (credentials: SignUpWithPasswordCredentials) => {
        const response = await supabase.auth.signUp(credentials);
        if (response.data.session) {
            setSession(response.data.session);
            setUser(response.data.session.user);
        }
        return response;
    };

    const signOut = async () => {
        await supabase.auth.signOut();
        setSession(null);
        setUser(null);
    };

    const value = {
        user,
        session,
        loading,
        signIn,
        signUp,
        signOut,
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
