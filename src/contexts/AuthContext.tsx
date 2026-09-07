import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react'
import { User } from '../types'
import { supabase } from '../lib/supabase'

interface AuthContextType {
  user: User | null
  profile: any | null
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  loginWithGoogle: () => Promise<void>
  loginWithGitHub: () => Promise<void>
  isLoading: boolean
  updateProfile: (data: any) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Helper: fetch or create user profile in public.users
async function upsertUser(userId: string, email: string) {
  const tables = ['users', 'profiles']
  
  for (const table of tables) {
    try {
      const { data: existing } = await supabase
        .from(table)
        .select('*')
        .eq('id', userId)
        .maybeSingle()

      if (existing) return existing

      const { error } = await supabase
        .from(table)
        .insert({
          id: userId,
          full_name: 'User',
          email: email,
          role: 'regular',
          bio: '',
          avatar_url: '',
          github_username: '',
          twitter_username: '',
          website_url: '',
        })

      if (error) {
        console.error(`Error creating user record in ${table}:`, error)
        continue
      }

      const { data: created } = await supabase
        .from(table)
        .select('*')
        .eq('id', userId)
        .maybeSingle()

      if (created) return created
    } catch (err) {
      console.error(`Error upserting user in ${table}:`, err)
    }
  }
  
  return null
}

function buildUser(record: any, email: string): User {
  return {
    id: record.id,
    name: record.full_name || 'User',
    email: email || '',
    avatar: record.avatar_url || '',
    role: record.role || 'regular',
    bio: record.bio,
    github: record.github_username,
    twitter: record.twitter_username,
    website: record.website_url,
    joinedAt: new Date(record.created_at),
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<any | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data } = await supabase.auth.getSession()
        if (data.session?.user) {
          const userId = data.session.user.id
          const email = data.session.user.email

          const record = await upsertUser(userId, email)
          if (record) {
            setProfile(record)
            setUser(buildUser(record, email))
          } else {
            console.warn('Could not load or create user profile, using auth data only')
            setUser({
              id: userId,
              name: data.session.user.user_metadata?.full_name || data.session.user.user_metadata?.name || 'User',
              email: email || '',
              avatar: data.session.user.user_metadata?.avatar_url || data.session.user.user_metadata?.picture || '',
              role: 'regular',
              bio: '',
              github: '',
              twitter: '',
              website: '',
              joinedAt: new Date(data.session.user.created_at),
            })
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error)
      } finally {
        setIsLoading(false)
      }
    }

    initAuth()

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      (async () => {
        if (session?.user) {
          const userId = session.user.id
          const email = session.user.email

          const record = await upsertUser(userId, email)
          if (record) {
            setProfile(record)
            setUser(buildUser(record, email))
          } else {
            console.warn('Could not load or create user profile, using auth data only')
            setUser({
              id: userId,
              name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || 'User',
              email: email || '',
              avatar: session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture || '',
              role: 'regular',
              bio: '',
              github: '',
              twitter: '',
              website: '',
              joinedAt: new Date(session.user.created_at),
            })
          }
        } else {
          setUser(null)
          setProfile(null)
        }
      })()
    })

    return () => {
      if (authListener?.subscription) {
        authListener.subscription.unsubscribe()
      }
    }
  }, [])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      if (data.user) {
        const userId = data.user.id
        const email = data.user.email

        const record = await upsertUser(userId, email)
        if (record) {
          setProfile(record)
          setUser(buildUser(record, email))
        } else {
          console.warn('Could not load or create user profile, using auth data only')
          setUser({
            id: userId,
            name: data.user.user_metadata?.full_name || data.user.user_metadata?.name || 'User',
            email: email || '',
            avatar: data.user.user_metadata?.avatar_url || data.user.user_metadata?.picture || '',
            role: 'regular',
            bio: '',
            github: '',
            twitter: '',
            website: '',
            joinedAt: new Date(data.user.created_at),
          })
        }
      }
    } catch (error) {
      console.error('Login error:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const loginWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (error) {
        console.error('Google login error:', error)
        alert(`Google login error: ${error.message}`)
        throw error
      }
    } catch (error: any) {
      console.error('Google login error:', error)
      alert(`Google login error: ${error.message || 'Unknown error'}`)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const loginWithGitHub = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (error) {
        console.error('GitHub login error:', error)
        alert(`GitHub login error: ${error.message}`)
        throw error
      }
    } catch (error: any) {
      console.error('GitHub login error:', error)
      alert(`GitHub login error: ${error.message || 'Unknown error'}`)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    setIsLoading(true)
    try {
      await supabase.auth.signOut()
      setUser(null)
      setProfile(null)
    } catch (error) {
      console.error('Logout error:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const updateProfile = async (data: any) => {
    try {
      if (!user) throw new Error('No user logged in')

      const tables = ['users', 'profiles']
      let lastError: any = null

      for (const table of tables) {
        const { error } = await supabase
          .from(table)
          .update({
            full_name: data.full_name,
            avatar_url: data.avatar_url,
            bio: data.bio,
            github_username: data.github_username,
            twitter_username: data.twitter_username,
            website_url: data.website_url,
            updated_at: new Date().toISOString(),
          })
          .eq('id', user.id)

        if (!error) {
          const updated = { ...profile, ...data }
          setProfile(updated)
          setUser({
            ...user,
            name: data.full_name,
            avatar: data.avatar_url,
            bio: data.bio,
            github: data.github_username,
            twitter: data.twitter_username,
            website: data.website_url,
          })
          return
        }
        
        lastError = error
      }

      throw lastError || new Error('Failed to update profile')
    } catch (error) {
      console.error('Update profile error:', error)
      throw error
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        login,
        logout,
        loginWithGoogle,
        loginWithGitHub,
        isLoading,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
