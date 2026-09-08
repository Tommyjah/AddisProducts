import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuth = async () => {
      try {
        // Check if we have a session
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user) {
          console.log('Auth callback: session found', session.user.email);
          navigate('/');
          return;
        }

        // Try to exchange code for session (Google OAuth code flow)
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const next = urlParams.get('next') || '/';

        if (code) {
          console.log('Auth callback: exchanging code for session');
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);
          
          if (error) {
            console.error('Auth callback: exchange error', error);
            navigate('/login?error=auth_failed');
            return;
          }
          
          if (data.session) {
            console.log('Auth callback: session created', data.session.user.email);
            navigate(next);
            return;
          }
        }

        // Clear URL params
        window.history.replaceState(null, '', window.location.pathname);
        navigate('/login?error=auth_failed');
      } catch (err) {
        console.error('Auth callback error:', err);
        navigate('/login?error=auth_failed');
      }
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
