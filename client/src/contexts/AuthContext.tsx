import { createContext, useContext, useEffect, useState } from 'react';
import { supabase, AuthUser } from '@/lib/supabase';
import type { User } from '@shared/schema';

type AuthContextType = {
  user: AuthUser | null;
  appUser: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [appUser, setAppUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser((session?.user as AuthUser) ?? null);
      if (session?.user?.email) {
        fetchAppUser(session.user.email);
      }
      setLoading(false);
    }).catch((error) => {
      console.error('Auth error:', error);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser((session?.user as AuthUser) ?? null);
      if (session?.user?.email) {
        await fetchAppUser(session.user.email);
      } else {
        setAppUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchAppUser = async (email: string) => {
    try {
      const response = await fetch(`/api/users/email/${email}`);
      if (response.ok) {
        const data = await response.json();
        setAppUser(data);
      } else {
        const supaUser = await supabase.auth.getUser();
        const newUser = await fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            name: supaUser.data.user?.user_metadata?.name || email.split('@')[0],
            avatarUrl: supaUser.data.user?.user_metadata?.avatar_url,
            credits: 3,
            premium: false,
          }),
        });
        const data = await newUser.json();
        setAppUser(data);
      }
    } catch (error) {
      console.error('Error fetching app user:', error);
    }
  };

  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });
  };

  const signInWithEmail = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signUpWithEmail = async (email: string, password: string, name: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
      },
    });
    if (error) throw error;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        appUser,
        loading,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
