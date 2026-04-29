import { useEffect, useState } from 'react';
import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import {
  getAuth,
  onAuthStateChanged,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  type Auth,
} from 'firebase/auth';
import { getMe, setIdToken } from '../api';
import type { User } from '../types';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
};

function getFirebase(): { app: FirebaseApp; auth: Auth } {
  const app = getApps()[0] ?? initializeApp(firebaseConfig);
  const auth = getAuth(app);
  // Identity Platform multi-tenancy: scope auth to a specific tenant.
  auth.tenantId = import.meta.env.VITE_FIREBASE_TENANT_ID ?? null;
  return { app, auth };
}

interface Props {
  children: React.ReactNode;
}

type Mode = 'sign-in' | 'sign-up';

export default function AuthGuard({ children }: Props) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>('sign-up');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const { auth } = getFirebase();
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      try {
        if (!fbUser) {
          setIdToken(null);
          setUser(null);
          setLoading(false);
          return;
        }
        const token = await fbUser.getIdToken();
        setIdToken(token);
        const me = await getMe();
        setUser(me);
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      } finally {
        setLoading(false);
      }
    });
    return () => unsub();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const { auth } = getFirebase();
      if (mode === 'sign-up') {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <div className="p-8 text-slate-600">Loading…</div>;
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow p-8 max-w-sm w-full"
        >
          <h1 className="text-2xl font-semibold mb-2 text-center">Photo Journal</h1>
          <p className="text-slate-500 mb-6 text-center">
            {mode === 'sign-up' ? 'Create an account to start a trip.' : 'Sign in to view your trips.'}
          </p>
          <input
            type="email"
            required
            placeholder="email@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-slate-400"
            autoComplete="email"
          />
          <input
            type="password"
            required
            minLength={6}
            placeholder="password (≥ 6 chars)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-slate-400"
            autoComplete={mode === 'sign-up' ? 'new-password' : 'current-password'}
          />
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-slate-900 text-white rounded-lg py-2 font-medium hover:bg-slate-700 disabled:opacity-60"
          >
            {submitting ? 'Working…' : mode === 'sign-up' ? 'Sign up' : 'Sign in'}
          </button>
          <button
            type="button"
            onClick={() => setMode(mode === 'sign-up' ? 'sign-in' : 'sign-up')}
            className="w-full text-slate-500 hover:text-slate-900 text-sm mt-3"
          >
            {mode === 'sign-up' ? 'Already have an account? Sign in.' : 'Need an account? Sign up.'}
          </button>
          {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
        </form>
      </div>
    );
  }

  return (
    <div>
      <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between">
        <div className="font-semibold">Photo Journal</div>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-slate-600">{user.email}</span>
          <button
            onClick={() => signOut(getFirebase().auth)}
            className="text-slate-500 hover:text-slate-900"
          >
            Sign out
          </button>
        </div>
      </header>
      {children}
    </div>
  );
}
