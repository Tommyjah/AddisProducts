import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User } from '../types';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  profile: any | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
  updateProfile: (data: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (data.session?.user) {
          const userId = data.session.user.id;
          const email = data.session.user.email;

          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .maybeSingle();

          if (profileData) {
            setProfile(profileData);
            setUser({
              id: userId,
              name: profileData.full_name || 'User',
              email: email || '',
              avatar: profileData.avatar_url || '',
              role: profileData.role || 'regular',
              bio: profileData.bio,
              github: profileData.github_username,
              twitter: profileData.twitter_username,
              website: profileData.website_url,
              joinedAt: new Date(profileData.created_at),
            });
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      (async () => {
        if (session?.user) {
          const userId = session.user.id;
          const email = session.user.email;

          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .maybeSingle();

          if (profileData) {
            setProfile(profileData);
            setUser({
              id: userId,
              name: profileData.full_name || 'User',
              email: email || '',
              avatar: profileData.avatar_url || '',
              role: profileData.role || 'regular',
              bio: profileData.bio,
              github: profileData.github_username,
              twitter: profileData.twitter_username,
              website: profileData.website_url,
              joinedAt: new Date(profileData.created_at),
            });
          }
        } else {
          setUser(null);
          setProfile(null);
        }
      })();
    });

    return () => {
      if (authListener?.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        const userId = data.user.id;
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle();

        if (profileData) {
          setProfile(profileData);
          setUser({
            id: userId,
            name: profileData.full_name || 'User',
            email: profileData.email || email,
            avatar: profileData.avatar_url || '',
            role: profileData.role || 'regular',
            bio: profileData.bio,
            github: profileData.github_username,
            twitter: profileData.twitter_username,
            website: profileData.website_url,
            joinedAt: new Date(profileData.created_at),
          });
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (data: any) => {
    try {
      if (!user) throw new Error('No user logged in');

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: data.full_name,
          avatar_url: data.avatar_url,
          bio: data.bio,
          github_username: data.github_username,
          twitter_username: data.twitter_username,
          website_url: data.website_url,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;

      setProfile({ ...profile, ...data });
      setUser({
        ...user,
        name: data.full_name,
        avatar: data.avatar_url,
        bio: data.bio,
        github: data.github_username,
        twitter: data.twitter_username,
        website: data.website_url,
      });
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      login,
      logout,
      isLoading,
      updateProfile,
    }}>
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