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

        // Check active sessions and sets the user
        supabase.auth.getSession().then(({ data: { session }, error }) => {
            console.log('[Auth] Retrieved session from storage:', session ? 'Session found' : 'No session');
            if (error) console.error('[Auth] Error getting session:', error);

            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);

            if (session) {
                console.log('[Auth] User logged in:', session.user.email);
                console.log('[Auth] Session expires at:', new Date(session.expires_at! * 1000));
            } else {
                console.log('[Auth] No active session found');
            }
        });

        // Listen for changes on auth state (logged in, signed out, etc.)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            console.log('[Auth] Auth state changed:', event);
            console.log('[Auth] New session:', session ? 'Active' : 'None');

            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
        });

        return () => subscription.unsubscribe();
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
