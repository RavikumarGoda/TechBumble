
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface TutorialOverlayProps {
  onComplete: () => void;
}

const TutorialOverlay = ({ onComplete }: TutorialOverlayProps) => {
  const [currentStep, setCurrentStep] = useState(0);

  const tutorialSteps = [
    {
      title: "Welcome to TechBumble!",
      content: "Swipe through interview questions and master your prep!",
      gesture: "👋"
    },
    {
      title: "Swipe Right ➡️",
      content: "Mark questions as solved when you've completed them",
      gesture: "➡️"
    },
    {
      title: "Swipe Left ⬅️", 
      content: "Skip questions you're not interested in right now",
      gesture: "⬅️"
    },
    {
      title: "Swipe Up ⬆️",
      content: "Save interesting questions to your favorites for later review",
      gesture: "⬆️"
    },
    {
      title: "AI Explanations",
      content: "Tap 'Explain This' or 'Show Code' buttons for AI-powered help",
      gesture: "🧠"
    }
  ];

  const nextStep = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const skip = () => {
    onComplete();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="bg-gray-800 border-gray-700 w-full max-w-md">
        <CardContent className="p-6 text-center">
          <div className="text-6xl mb-4">{tutorialSteps[currentStep].gesture}</div>
          <h2 className="text-xl font-bold text-white mb-3">
            {tutorialSteps[currentStep].title}
          </h2>
          <p className="text-gray-300 mb-6">
            {tutorialSteps[currentStep].content}
          </p>
          
          <div className="flex items-center justify-center mb-4">
            {tutorialSteps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full mx-1 ${
                  index === currentStep ? 'bg-tech-electric' : 'bg-gray-600'
                }`}
              />
            ))}
          </div>

          <div className="flex justify-between items-center">
            <Button
              variant="ghost"
              onClick={prevStep}
              disabled={currentStep === 0}
              className="text-gray-400"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back
            </Button>

            <Button
              variant="ghost"
              onClick={skip}
              className="text-gray-500"
            >
              Skip
            </Button>

            <Button
              onClick={nextStep}
              className="bg-tech-electric hover:bg-tech-electric/90"
            >
              {currentStep === tutorialSteps.length - 1 ? 'Start Swiping!' : 'Next'}
              {currentStep !== tutorialSteps.length - 1 && <ChevronRight className="w-4 h-4 ml-1" />}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TutorialOverlay;
