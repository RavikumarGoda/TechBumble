import { SignIn, SignUp } from '@clerk/clerk-react';
import { useState } from 'react';
import TypingAnimation from './TypingAnimation';

const AuthScreen = () => {
  const [mode, setMode] = useState<'sign-in' | 'sign-up'>('sign-in');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex flex-col items-center justify-center px-4 py-8">
      {/* Logo */}
      <div className="text-center mb-8">
        <div className="text-5xl text-tech-electric mb-3">&lt;/&gt;</div>
        <h1 className="text-4xl sm:text-5xl font-bold text-white">
          Tech<span className="text-tech-electric">Bumble</span>
        </h1>
        <div className="text-lg text-gray-300 mt-3">
          <TypingAnimation
            phrases={['Swipe smart.', 'Hustle harder.', 'Land offers.']}
            className="text-tech-electric font-semibold"
          />
        </div>
      </div>

      {/* Clerk Auth Component */}
      <div className="w-full max-w-md">
        {mode === 'sign-in' ? (
          <SignIn
            appearance={{
              elements: {
                rootBox: 'w-full',
                card: 'bg-gray-800/80 border border-gray-700 shadow-2xl rounded-2xl',
                headerTitle: 'text-white',
                headerSubtitle: 'text-gray-400',
                socialButtonsBlockButton: 'bg-white hover:bg-gray-100 text-gray-900 border-0 font-medium',
                dividerLine: 'bg-gray-600',
                dividerText: 'text-gray-400',
                formFieldLabel: 'text-gray-300',
                formFieldInput: 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-tech-electric',
                formButtonPrimary: 'bg-tech-electric hover:bg-tech-electric/90 text-white',
                footerActionLink: 'text-tech-electric hover:text-tech-electric/80',
                identityPreviewText: 'text-gray-300',
                identityPreviewEditButton: 'text-tech-electric',
              },
            }}
          />
        ) : (
          <SignUp
            appearance={{
              elements: {
                rootBox: 'w-full',
                card: 'bg-gray-800/80 border border-gray-700 shadow-2xl rounded-2xl',
                headerTitle: 'text-white',
                headerSubtitle: 'text-gray-400',
                socialButtonsBlockButton: 'bg-white hover:bg-gray-100 text-gray-900 border-0 font-medium',
                dividerLine: 'bg-gray-600',
                dividerText: 'text-gray-400',
                formFieldLabel: 'text-gray-300',
                formFieldInput: 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-tech-electric',
                formButtonPrimary: 'bg-tech-electric hover:bg-tech-electric/90 text-white',
                footerActionLink: 'text-tech-electric hover:text-tech-electric/80',
              },
            }}
          />
        )}
      </div>

      {/* Toggle between sign-in / sign-up */}
      <div className="mt-4 text-center">
        {mode === 'sign-in' ? (
          <button
            onClick={() => setMode('sign-up')}
            className="text-tech-electric hover:text-tech-electric/80 text-sm"
          >
            Don't have an account? Sign up
          </button>
        ) : (
          <button
            onClick={() => setMode('sign-in')}
            className="text-tech-electric hover:text-tech-electric/80 text-sm"
          >
            Already have an account? Sign in
          </button>
        )}
      </div>
    </div>
  );
};

export default AuthScreen;
