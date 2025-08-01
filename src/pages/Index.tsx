
import { useState } from 'react';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import SwipeInterface from '@/components/SwipeInterface';
import AuthScreen from '@/components/AuthScreen';
import ProfileScreen from '@/components/ProfileScreen';

type Screen = 'swipe' | 'profile';

interface SessionState {
  questions: any[];
  currentQuestionIndex: number;
  solvedQuestionIds: Set<string>;
  currentSelections: any;
  hasActiveSession: boolean;
  userId: string; // Added missing userId property
}

const IndexContent = () => {
  const { user, loading } = useAuth();
  const [currentScreen, setCurrentScreen] = useState<Screen>('swipe');
  const [sessionState, setSessionState] = useState<SessionState | null>(null);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

  // Show profile screen only when explicitly requested
  if (currentScreen === 'profile') {
    return (
      <ProfileScreen 
        onBack={() => setCurrentScreen('swipe')} 
      />
    );
  }

  // Always start with swipe interface (home page) after login
  // This will show encouraging note for new sessions and then filters if no active session
  return (
    <SwipeInterface 
      onShowProfile={() => setCurrentScreen('profile')}
      sessionState={sessionState}
      onSessionStateChange={setSessionState}
    />
  );
};

const Index = () => {
  return (
    <AuthProvider>
      <IndexContent />
    </AuthProvider>
  );
};

export default Index;
