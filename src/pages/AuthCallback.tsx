import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuth = async () => {
      // First try getSession (handles refresh token flow)
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        navigate('/');
        return;
      }

      // If no session, try to parse tokens from URL hash
      // This happens when OAuth returns with tokens in the hash
      const hash = window.location.hash;
      if (hash && hash.includes('access_token')) {
        const params = new URLSearchParams(
          hash.substring(1).split('&').map(p => {
            const [k, ...v] = p.split('=');
            return [k, v.join('=')];
          })
        );

        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');

        if (accessToken) {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || undefined,
          });

          if (!error) {
            navigate('/');
            return;
          }
        }
      }

      // If all else fails, try signInWithIdToken (Google) or just navigate
      // Clear the hash to avoid showing tokens
      window.history.replaceState(null, '', window.location.pathname);
      navigate('/login?error=auth_failed');
    };

    handleAuth();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4" />
        <p className="text-slate-600">Signing you in...</p>
      </div>
    </div>
  );
}
