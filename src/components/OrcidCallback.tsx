import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react';

/**
 * Landing page for the ORCID OAuth redirect.
 * ORCID sends the user back to /orcid-callback with the access token in the
 * URL hash fragment (#access_token=...&orcid=...&state=...).
 * We parse it, fetch the public profile, persist the session, then navigate home.
 */
export function OrcidCallback() {
  const navigate = useNavigate();
  const handleCallback = useAuthStore((s) => s.handleCallback);
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    let mounted = true;

    handleCallback().then((ok) => {
      if (!mounted) return;
      if (ok) {
        setStatus('success');
        // Brief success flash before redirecting
        setTimeout(() => navigate('/'), 1200);
      } else {
        setStatus('error');
        setErrorMsg(useAuthStore.getState().error ?? 'Login failed.');
      }
    });

    return () => { mounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl px-10 py-12 flex flex-col items-center gap-4 max-w-sm w-full border border-slate-200">
        {/* ORCID logo */}
        <div className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-2xl"
          style={{ backgroundColor: '#A6CE39' }}>
          ID
        </div>

        {status === 'loading' && (
          <>
            <Loader2 className="h-8 w-8 animate-spin text-[#A6CE39]" />
            <p className="text-slate-700 font-medium">Signing you in with ORCID…</p>
            <p className="text-xs text-slate-500 text-center">Fetching your public profile, please wait.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle className="h-8 w-8 text-[#A6CE39]" />
            <p className="text-slate-700 font-medium">Signed in successfully!</p>
            <p className="text-xs text-slate-500">Redirecting you back…</p>
          </>
        )}

        {status === 'error' && (
          <>
            <AlertCircle className="h-8 w-8 text-red-500" />
            <p className="text-slate-700 font-medium">Login failed</p>
            <p className="text-xs text-red-600 text-center">{errorMsg}</p>
            <button
              onClick={() => navigate('/')}
              className="mt-2 text-sm text-blue-600 hover:underline"
            >
              Return to home page
            </button>
          </>
        )}
      </div>
    </div>
  );
}
