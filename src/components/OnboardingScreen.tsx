
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import TypingAnimation from './TypingAnimation';
import { Heart, Code, Briefcase, Zap } from 'lucide-react';

interface OnboardingScreenProps {
  onComplete: () => void;
}

const OnboardingScreen = ({ onComplete }: OnboardingScreenProps) => {
  const [showLogin, setShowLogin] = useState(false);

  const phrases = [
    "Swipe smart.",
    "Hustle harder.", 
    "Land offers."
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-20 h-20 bg-tech-electric/10 rounded-full animate-float" />
        <div className="absolute top-40 right-20 w-16 h-16 bg-tech-neon/10 rounded-full animate-float" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-32 left-20 w-24 h-24 bg-tech-purple/10 rounded-full animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-20 right-10 w-12 h-12 bg-tech-electric/10 rounded-full animate-float" style={{ animationDelay: '0.5s' }} />
      </div>

      <div className="text-center z-10 px-6 max-w-md w-full">
        {/* Logo and branding */}
        <div className="mb-8 animate-fade-in">
          <div className="relative mb-6">
            <Heart className="w-16 h-16 mx-auto text-tech-neon animate-glow" fill="currentColor" />
            <Code className="w-8 h-8 absolute -top-2 -right-2 text-tech-electric" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-tech-gradient bg-clip-text text-transparent mb-2">
            TechBumble
          </h1>
          <p className="text-lg text-muted-foreground">
            Daily Swipe-Style Interview Prep
          </p>
        </div>

        {/* Typing animation taglines */}
        <div className="mb-12 animate-fade-in" style={{ animationDelay: '0.5s' }}>
          <div className="h-16 flex items-center justify-center">
            <TypingAnimation 
              phrases={phrases}
              className="text-2xl md:text-3xl font-semibold text-white"
            />
          </div>
        </div>

        {/* Features preview */}
        {!showLogin && (
          <div className="mb-8 animate-fade-in" style={{ animationDelay: '1s' }}>
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="tech-card p-4 text-center hover:scale-105 transition-transform">
                <Code className="w-8 h-8 mx-auto mb-2 text-tech-electric" />
                <p className="text-xs font-medium">DSA Questions</p>
              </div>
              <div className="tech-card p-4 text-center hover:scale-105 transition-transform">
                <Briefcase className="w-8 h-8 mx-auto mb-2 text-tech-purple" />
                <p className="text-xs font-medium">System Design</p>
              </div>
              <div className="tech-card p-4 text-center hover:scale-105 transition-transform">
                <Zap className="w-8 h-8 mx-auto mb-2 text-tech-neon" />
                <p className="text-xs font-medium">HR Questions</p>
              </div>
            </div>
          </div>
        )}

        {/* Login form */}
        {showLogin ? (
          <div className="space-y-4 animate-fade-in">
            <input
              type="email"
              placeholder="Email"
              className="w-full px-4 py-3 bg-card border border-tech-electric/30 rounded-xl text-white placeholder:text-muted-foreground focus:border-tech-electric focus:outline-none transition-colors"
            />
            <input
              type="password"
              placeholder="Password"
              className="w-full px-4 py-3 bg-card border border-tech-electric/30 rounded-xl text-white placeholder:text-muted-foreground focus:border-tech-electric focus:outline-none transition-colors"
            />
            <Button 
              onClick={onComplete}
              className="w-full py-3 bg-tech-gradient hover:opacity-90 text-white font-semibold rounded-xl transition-all hover:scale-105 tech-glow"
            >
              Start Swiping
            </Button>
            <Button 
              variant="ghost"
              onClick={() => setShowLogin(false)}
              className="w-full text-tech-electric hover:text-tech-purple"
            >
              Back
            </Button>
          </div>
        ) : (
          <div className="space-y-4 animate-fade-in" style={{ animationDelay: '1.5s' }}>
            <Button 
              onClick={() => setShowLogin(true)}
              className="w-full py-3 bg-tech-gradient hover:opacity-90 text-white font-semibold rounded-xl transition-all hover:scale-105 tech-glow"
            >
              Get Started
            </Button>
            <Button 
              variant="ghost"
              onClick={onComplete}
              className="w-full text-tech-electric hover:text-tech-purple"
            >
              Continue as Guest
            </Button>
          </div>
        )}

        {/* Social proof */}
        <p className="text-xs text-muted-foreground mt-6 animate-fade-in" style={{ animationDelay: '2s' }}>
          Join thousands of developers landing their dream jobs
        </p>
      </div>
    </div>
  );
};

export default OnboardingScreen;
