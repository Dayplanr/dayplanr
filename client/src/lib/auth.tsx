import React, { createContext, useContext, useEffect, useState } from 'react';
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

    useEffect(() => {
        console.log('[Auth] Initializing auth provider...');

        let mounted = true;

        // Check active sessions and sets the user
        const initializeAuth = async () => {
            try {
                // Check if we have an item in localStorage directly for debugging/safety on mobile
                const localSession = typeof window !== 'undefined' ? window.localStorage.getItem('supabase.auth.token') : null;
                console.log('[Auth] localStorage check:', localSession ? 'Key found' : 'No key');

                const { data: { session }, error } = await supabase.auth.getSession();

                if (error) {
                    console.error('[Auth] Error getting session:', error);
                    if (mounted) setLoading(false);
                    return;
                }

                if (mounted) {
                    if (session) {
                        console.log('[Auth] Initial session found for:', session.user.email);
                        setSession(session);
                        setUser(session.user);
                    } else {
                        console.log('[Auth] No initial session found');
                    }

                    // On mobile, sometimes the session is loaded asynchronously after a tiny delay
                    // even if getSession() returns null initially.
                    setTimeout(() => {
                        if (mounted) setLoading(false);
                    }, 100);
                }
            } catch (err) {
                console.error('[Auth] Initial check failed:', err);
                if (mounted) setLoading(false);
            }
        };

        initializeAuth();

        // Listen for changes on auth state (logged in, signed out, etc.)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            console.log('[Auth] Auth state changed:', event, session ? 'Session active' : 'No session');

            if (mounted) {
                setSession(session);
                setUser(session?.user ?? null);
                setLoading(false);
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
