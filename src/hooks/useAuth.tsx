import { useState, useEffect, createContext, useContext } from 'react';
import { useUser, useAuth as useClerkAuth } from '@clerk/clerk-react';

interface AppUser {
  id: string;         // our DB id
  clerkId: string;
  email: string;
  username: string | null;
  totalQuestionsSwiped: number;
  currentStreak: number;
  longestStreak: number;
}

interface AuthContextType {
  user: AppUser | null;
  clerkUserId: string | null;
  loading: boolean;
  getToken: () => Promise<string | null>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { user: clerkUser, isLoaded } = useUser();
  const { getToken: clerkGetToken, signOut: clerkSignOut } = useClerkAuth();
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [syncing, setSyncing] = useState(false);

  const getToken = async () => {
    try {
      return await clerkGetToken();
    } catch {
      return null;
    }
  };

  // Sync Clerk user → our DB on login
  useEffect(() => {
    if (!isLoaded || !clerkUser || syncing) return;

    const syncUser = async () => {
      setSyncing(true);
      try {
        const token = await clerkGetToken();
        const res = await fetch('/api/auth/sync', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            email: clerkUser.primaryEmailAddress?.emailAddress || '',
            username: clerkUser.fullName || clerkUser.username || null,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          setAppUser(data.user);
        }

        // Also fetch full profile (includes streak etc.)
        const profileRes = await fetch('/api/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (profileRes.ok) {
          const { profile } = await profileRes.json();
          setAppUser(profile);
        }
      } catch (err) {
        console.error('User sync error:', err);
      } finally {
        setSyncing(false);
      }
    };

    syncUser();
  }, [isLoaded, clerkUser?.id]);

  const loading = !isLoaded || (!!clerkUser && !appUser && syncing);

  return (
    <AuthContext.Provider
      value={{
        user: appUser,
        clerkUserId: clerkUser?.id ?? null,
        loading,
        getToken,
        signOut: () => clerkSignOut(),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
