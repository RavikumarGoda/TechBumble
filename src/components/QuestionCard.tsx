
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brain, Code, HelpCircle, Loader2 } from 'lucide-react';
import { Question } from '@/hooks/useQuestionFilters';
import { useTouchSwipe } from '@/hooks/useTouchSwipe';

interface QuestionCardProps {
  question: Question | null | undefined;
  onSwipe: (direction: 'left' | 'right' | 'up') => void;
  onExplainThis: (includeCode?: boolean) => void;
  explanation: string;
  showExplanation: boolean;
  onCloseExplanation: () => void;
  loadingExplanation: boolean;
}

const QuestionCard = ({ 
  question, 
  onSwipe, 
  onExplainThis,
  explanation,
  showExplanation,
  onCloseExplanation,
  loadingExplanation
}: QuestionCardProps) => {
  const [showHint, setShowHint] = useState(false);

  // Return null if question is undefined or null
  if (!question) {
    return null;
  }

  const { isDragging, dragOffset, handleTouchStart, handleTouchMove, handleTouchEnd } = useTouchSwipe({
    onSwipeLeft: () => onSwipe('left'),
    onSwipeRight: () => onSwipe('right'),
    onSwipeUp: () => onSwipe('up')
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-600';
      case 'Medium': return 'bg-yellow-600';
      case 'Hard': return 'bg-red-600';
      default: return 'bg-gray-600';
    }
  };

  const rotation = isDragging ? dragOffset.x * 0.05 : 0;
  const opacity = isDragging ? Math.max(0.7, 1 - Math.abs(dragOffset.x) * 0.001) : 1;
  const scale = isDragging ? Math.max(0.95, 1 - Math.abs(dragOffset.y) * 0.001) : 1;

  const getSwipeIndicator = () => {
    if (!isDragging) return null;
    
    if (dragOffset.y < -50) {
      return (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-pink-500 text-white px-4 py-2 rounded-full font-bold z-10">
          SAVE ❤️
        </div>
      );
    }
    
    if (dragOffset.x > 50) {
      return (
        <div className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-green-500 text-white px-4 py-2 rounded-full font-bold z-10">
          SOLVED ✅
        </div>
      );
    }
    
    if (dragOffset.x < -50) {
      return (
        <div className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-gray-500 text-white px-4 py-2 rounded-full font-bold z-10">
          SKIP ⏭️
        </div>
      );
    }
    
    return null;
  };

  return (
    <>
      <div className="relative w-full max-w-xs sm:max-w-sm mx-auto">
        <Card 
          className="bg-gray-800/90 backdrop-blur-sm border-gray-700 cursor-grab active:cursor-grabbing transition-all duration-200 relative overflow-hidden"
          style={{
            transform: `translateX(${dragOffset.x}px) translateY(${dragOffset.y}px) rotate(${rotation}deg) scale(${scale})`,
            opacity: opacity,
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleTouchStart}
          onMouseMove={handleTouchMove}
          onMouseUp={handleTouchEnd}
          onMouseLeave={handleTouchEnd}
        >
          {getSwipeIndicator()}
          
          <CardContent className="p-3 sm:p-6">
            <div className="mb-4">
              <div className="flex justify-between items-start mb-2 flex-wrap gap-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${getDifficultyColor(question.difficulty || 'Easy')}`}>
                  {question.difficulty || 'Easy'}
                </span>
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-tech-electric text-white break-words">
                  {question.category === 'DSA' ? (
                    <span className="hidden sm:inline">Data Structures & Algorithms</span>
                  ) : (
                    question.category
                  )}
                  <span className="sm:hidden">
                    {question.category === 'DSA' ? 'DSA' : question.category}
                  </span>
                </span>
              </div>
              
              <h2 className="text-base sm:text-xl font-bold text-white mb-3 break-words">{question.title || 'Untitled Question'}</h2>
              <p className="text-gray-300 text-xs sm:text-sm leading-relaxed mb-4 break-words">{question.description || 'No description available'}</p>
              
              <div className="flex flex-wrap gap-1 mb-4">
                {(question.companies || []).slice(0, 4).map((company) => (
                  <span key={company} className="px-2 py-1 rounded-full text-xs bg-gray-700 text-gray-300">
                    {company}
                  </span>
                ))}
                {(question.companies || []).length > 4 && (
                  <span className="px-2 py-1 rounded-full text-xs bg-gray-700 text-gray-300">
                    +{(question.companies || []).length - 4}
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={() => onExplainThis(false)}
                  className="bg-purple-600 hover:bg-purple-700 text-white text-xs sm:text-sm px-2 sm:px-4"
                  size="sm"
                >
                  <Brain className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Explain This</span>
                  <span className="sm:hidden">Explain</span>
                </Button>
                <Button
                  onClick={() => onExplainThis(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm px-2 sm:px-4"
                  size="sm"
                >
                  <Code className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Show Code</span>
                  <span className="sm:hidden">Code</span>
                </Button>
              </div>

              {!showHint && (
                <Button
                  onClick={() => setShowHint(true)}
                  variant="outline"
                  className="w-full bg-gray-700/50 hover:bg-gray-600/50 border-gray-600 text-gray-300 text-xs sm:text-sm"
                  size="sm"
                >
                  <span className="hidden sm:inline">Need help? Tap for swipe hints</span>
                  <span className="sm:hidden">Swipe hints</span>
                </Button>
              )}

              {showHint && (
                <div className="bg-gray-700/30 p-2 sm:p-3 rounded-lg text-xs text-gray-300 space-y-1">
                  <div className="flex items-center">
                    <span className="mr-2">⬅️</span>
                    <span className="text-xs">Swipe left to skip</span>
                  </div>
                  <div className="flex items-center">
                    <span className="mr-2">➡️</span>
                    <span className="text-xs">Swipe right when solved</span>
                  </div>
                  <div className="flex items-center">
                    <span className="mr-2">⬆️</span>
                    <span className="text-xs">Swipe up to save</span>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Explanation Modal */}
      {showExplanation && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
          <Card className="bg-gray-800 border-gray-700 w-full max-w-xs sm:max-w-2xl max-h-[85vh] sm:max-h-[80vh] overflow-y-auto">
            <CardContent className="p-3 sm:p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-white text-sm sm:text-lg font-semibold flex items-center">
                  <HelpCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-tech-electric" />
                  AI Explanation
                </h3>
                <Button onClick={onCloseExplanation} variant="ghost" size="sm" className="text-gray-400">
                  ✕
                </Button>
              </div>
              
              <div className="bg-gray-700/50 p-3 sm:p-4 rounded-lg mb-4">
                <h4 className="text-white font-medium mb-2 text-sm sm:text-base">{question.title || 'Untitled Question'}</h4>
                <p className="text-gray-300 text-xs sm:text-sm">{question.description || 'No description available'}</p>
              </div>

              <div className="bg-gray-900/50 p-3 sm:p-4 rounded-lg">
                {loadingExplanation ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin text-tech-electric mr-2" />
                    <span className="text-gray-300 text-sm">Generating explanation...</span>
                  </div>
                ) : (
                  <div className="text-gray-300 whitespace-pre-wrap text-xs sm:text-sm leading-relaxed">
                    {explanation}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
};

export default QuestionCard;
