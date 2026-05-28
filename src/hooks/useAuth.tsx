import { useState, useEffect, createContext, useContext } from 'react';
import { useUser, useAuth as useClerkAuth } from '@clerk/clerk-react';

interface AppUser {
  id: string;
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
  isSignedIn: boolean;
  loading: boolean;
  getToken: () => Promise<string | null>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { user: clerkUser, isLoaded, isSignedIn: clerkSignedIn } = useUser();
  const { getToken: clerkGetToken, signOut: clerkSignOut } = useClerkAuth();
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  // Start syncing=true whenever Clerk thinks user is signed in
  const [syncing, setSyncing] = useState(false);
  const [syncDone, setSyncDone] = useState(false);

  const getToken = async () => {
    try { return await clerkGetToken(); }
    catch { return null; }
  };

  useEffect(() => {
    // Reset on sign-out
    if (isLoaded && !clerkUser) {
      setAppUser(null);
      setSyncDone(false);
      return;
    }

    if (!isLoaded || !clerkUser || syncing || syncDone) return;

    const syncUser = async () => {
      setSyncing(true);
      try {
        const token = await clerkGetToken();
        const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

        // Sync user to DB (creates if new)
        await fetch('/api/auth/sync', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            email: clerkUser.primaryEmailAddress?.emailAddress || '',
            username: clerkUser.fullName || clerkUser.username || null,
          }),
        });

        // Fetch full profile with stats
        const profileRes = await fetch('/api/profile', { headers: { Authorization: `Bearer ${token}` } });
        if (profileRes.ok) {
          const { profile } = await profileRes.json();
          setAppUser(profile);
        } else {
          // Fallback — use Clerk data so UI doesn't get stuck
          setAppUser({
            id: clerkUser.id,
            clerkId: clerkUser.id,
            email: clerkUser.primaryEmailAddress?.emailAddress || '',
            username: clerkUser.fullName || clerkUser.username || null,
            totalQuestionsSwiped: 0,
            currentStreak: 0,
            longestStreak: 0,
          });
        }
      } catch (err) {
        console.error('User sync error:', err);
        // Fallback so the user isn't stuck on loading screen
        setAppUser({
          id: clerkUser.id,
          clerkId: clerkUser.id,
          email: clerkUser.primaryEmailAddress?.emailAddress || '',
          username: clerkUser.fullName || null,
          totalQuestionsSwiped: 0,
          currentStreak: 0,
          longestStreak: 0,
        });
      } finally {
        setSyncing(false);
        setSyncDone(true);
      }
    };

    syncUser();
  }, [isLoaded, clerkUser?.id]);

  // Loading = Clerk hasn't initialised yet, OR Clerk says signed in but we haven't synced yet
  const loading = !isLoaded || (!!clerkSignedIn && !syncDone);

  return (
    <AuthContext.Provider
      value={{
        user: appUser,
        clerkUserId: clerkUser?.id ?? null,
        isSignedIn: !!clerkSignedIn,
        loading,
        getToken,
        signOut: async () => {
          setAppUser(null);
          setSyncDone(false);
          await clerkSignOut();
        },
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
