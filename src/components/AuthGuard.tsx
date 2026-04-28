import { useEffect, useState } from 'react';
import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
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

export default function AuthGuard({ children }: Props) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  if (loading) {
    return <div className="p-8 text-slate-600">Loading…</div>;
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow p-8 max-w-sm w-full text-center">
          <h1 className="text-2xl font-semibold mb-2">Photo Journal</h1>
          <p className="text-slate-500 mb-6">Sign in to view your trips.</p>
          <button
            onClick={() => {
              const { auth } = getFirebase();
              signInWithPopup(auth, new GoogleAuthProvider()).catch((e) =>
                setError(e.message),
              );
            }}
            className="w-full bg-slate-900 text-white rounded-lg py-2 font-medium hover:bg-slate-700"
          >
            Sign in with Google
          </button>
          {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
        </div>
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
