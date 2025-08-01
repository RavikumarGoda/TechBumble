import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Question } from '@/hooks/useQuestionFilters';
import { useGeminiAI } from '@/hooks/useGeminiAI';
import QuestionCard from './QuestionCard';
import QuestionSelectionScreen from './QuestionSelectionScreen';
import TutorialOverlay from './TutorialOverlay';
import FilterPanel from './FilterPanel';
import { Button } from '@/components/ui/button';
import { User, Filter, X, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useQuestionFilters } from '@/hooks/useQuestionFilters';

interface SwipeInterfaceProps {
  onShowProfile: () => void;
  sessionState?: SessionState | null;
  onSessionStateChange?: (state: SessionState | null) => void;
}

interface SessionState {
  questions: Question[];
  currentQuestionIndex: number;
  solvedQuestionIds: Set<string>;
  currentSelections: FilterSelections | null;
  hasActiveSession: boolean;
  userId: string;
}

interface FilterSelections {
  categories: string[];
  difficulties: string[];
  companies: string[];
}

const SwipeInterface = ({ onShowProfile, sessionState, onSessionStateChange }: SwipeInterfaceProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { generateExplanation, generateQuestion } = useGeminiAI();
  
  // Clear session data if different user logs in
  const isSessionFromCurrentUser = sessionState?.userId === user?.id;
  const validSessionState = isSessionFromCurrentUser ? sessionState : null;
  
  // Initialize state from validSessionState or defaults
  const [questions, setQuestions] = useState<Question[]>(validSessionState?.questions || []);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(validSessionState?.currentQuestionIndex || 0);
  const [showQuestionSelection, setShowQuestionSelection] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [solvedQuestionIds, setSolvedQuestionIds] = useState<Set<string>>(validSessionState?.solvedQuestionIds || new Set());
  const [profile, setProfile] = useState<any>(null);
  const [explanation, setExplanation] = useState<string>('');
  const [showExplanation, setShowExplanation] = useState(false);
  const [loadingExplanation, setLoadingExplanation] = useState(false);
  const [generatingQuestions, setGeneratingQuestions] = useState(false);
  const [currentSelections, setCurrentSelections] = useState<FilterSelections | null>(validSessionState?.currentSelections || null);
  const [showEncouragingNote, setShowEncouragingNote] = useState(false);
  const [showCompletionScreen, setShowCompletionScreen] = useState(false);
  const [allTimeUsedQuestionTitles, setAllTimeUsedQuestionTitles] = useState<Set<string>>(new Set());
  const [sessionSwipeCount, setSessionSwipeCount] = useState(0);
  const [totalLifetimeSwipes, setTotalLifetimeSwipes] = useState(0);
  const [sessionInitialized, setSessionInitialized] = useState(false);
  const [filterGeneratingQuestions, setFilterGeneratingQuestions] = useState(false);
  const [hasActiveSession, setHasActiveSession] = useState(validSessionState?.hasActiveSession || false);

  // Update session state whenever key state changes
  useEffect(() => {
    if (onSessionStateChange && user?.id) {
      onSessionStateChange({
        questions,
        currentQuestionIndex,
        solvedQuestionIds,
        currentSelections,
        hasActiveSession,
        userId: user.id
      });
    }
  }, [questions, currentQuestionIndex, solvedQuestionIds, currentSelections, hasActiveSession, user?.id, onSessionStateChange]);

  // Filter out solved questions and apply filters
  const availableQuestions = questions.filter(q => !solvedQuestionIds.has(q.id));
  const { filters, filteredQuestions, updateFilter, clearFilters, activeFilterCount } = useQuestionFilters(availableQuestions);
  const displayQuestions = filteredQuestions.length > 0 ? filteredQuestions : availableQuestions;

  useEffect(() => {
    if (user && !sessionInitialized) {
      initializeSession();
      setSessionInitialized(true);
    }
  }, [user, sessionInitialized]);

  useEffect(() => {
    // Check if all questions are completed and auto-regenerate
    if (questions.length > 0 && currentQuestionIndex >= displayQuestions.length && displayQuestions.length > 0 && currentSelections) {
      handleAutoRegeneration();
    }
  }, [currentQuestionIndex, displayQuestions.length, questions.length, currentSelections]);

  const getUserKey = (key: string) => {
    return `techbumble_${user?.id}_${key}`;
  };

  const initializeSession = async () => {
    if (!user?.id) return;
    
    // Clear any previous session data from different users
    clearPreviousUserData();
    
    // Always show encouraging note for fresh login sessions
    const currentTime = Date.now().toString();
    const lastSessionTime = sessionStorage.getItem(getUserKey('session_time'));
    
    // Show encouraging note if it's a new login session or no previous session
    if (!lastSessionTime || !hasActiveSession) {
      setShowEncouragingNote(true);
      sessionStorage.setItem(getUserKey('session_time'), currentTime);
    }
    
    // Load user-specific data
    loadUserSpecificData();
    
    // Fetch profile and check if first time user
    await fetchProfile();
    
    // Always check for first time to show tutorial
    checkIfFirstTime();
  };

  const clearPreviousUserData = () => {
    // Clear localStorage data that might belong to previous users
    const keys = Object.keys(localStorage);
    const otherUserKeys = keys.filter(key => 
      key.startsWith('techbumble_') && !key.includes(user?.id || '')
    );
    otherUserKeys.forEach(key => localStorage.removeItem(key));
    
    // Clear sessionStorage data that might belong to previous users
    const sessionKeys = Object.keys(sessionStorage);
    const otherSessionKeys = sessionKeys.filter(key => 
      key.startsWith('techbumble_') && !key.includes(user?.id || '')
    );
    otherSessionKeys.forEach(key => sessionStorage.removeItem(key));
  };

  const loadUserSpecificData = () => {
    // Load user-specific used question titles
    const savedUsedTitles = localStorage.getItem(getUserKey('all_time_used_titles'));
    if (savedUsedTitles) {
      setAllTimeUsedQuestionTitles(new Set(JSON.parse(savedUsedTitles)));
    } else {
      setAllTimeUsedQuestionTitles(new Set());
    }
  };

  const saveAllTimeUsedTitles = () => {
    if (!user?.id) return;
    localStorage.setItem(getUserKey('all_time_used_titles'), JSON.stringify([...allTimeUsedQuestionTitles]));
  };

  useEffect(() => {
    if (user?.id && allTimeUsedQuestionTitles.size > 0) {
      saveAllTimeUsedTitles();
    }
  }, [allTimeUsedQuestionTitles, user?.id]);

  const checkIfFirstTime = () => {
    if (!user?.id) return;
    
    const hasSeenTutorial = localStorage.getItem(getUserKey('tutorial_seen'));
    if (!hasSeenTutorial) {
      // Show tutorial after encouraging note is dismissed
      setTimeout(() => {
        if (!showEncouragingNote) {
          setShowTutorial(true);
        }
      }, 1000);
    }
  };

  const handleTutorialComplete = () => {
    setShowTutorial(false);
    if (user?.id) {
      localStorage.setItem(getUserKey('tutorial_seen'), 'true');
    }
  };

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      setProfile(data);
      if (data) {
        setTotalLifetimeSwipes(data.total_questions_swiped || 0);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const generateAIQuestions = async (selections: FilterSelections, isRegeneration: boolean = false) => {
    setGeneratingQuestions(true);
    setCurrentSelections(selections);
    
    try {
      const generatedQuestions: Question[] = [];
      const maxAttempts = 50;
      let totalAttempts = 0;
      
      // Generate 10-15 questions based on selections
      while (generatedQuestions.length < 15 && totalAttempts < maxAttempts) {
        for (const category of selections.categories) {
          for (const difficulty of selections.difficulties) {
            if (generatedQuestions.length >= 15 || totalAttempts >= maxAttempts) break;
            
            try {
              const questionData = await generateQuestion(category, difficulty);
              const lines = questionData.split('\n').filter(line => line.trim());
              
              if (lines.length >= 2) {
                const title = lines[0].replace(/^\d+\.\s*/, '').trim();
                const description = lines.slice(1).join(' ').trim();
                
                // For regeneration, allow repeats. For new sessions, check uniqueness
                if (title && (isRegeneration || !allTimeUsedQuestionTitles.has(title))) {
                  generatedQuestions.push({
                    id: `ai-${Date.now()}-${generatedQuestions.length}-${Math.random()}`,
                    title: title,
                    description: description || 'Practice question generated by AI',
                    category: category as 'DSA' | 'System Design' | 'HR',
                    difficulty: difficulty as 'Easy' | 'Medium' | 'Hard',
                    companies: selections.companies
                  });
                  
                  // Add to all-time used titles only if not regenerating
                  if (!isRegeneration) {
                    setAllTimeUsedQuestionTitles(prev => new Set([...prev, title]));
                  }
                }
              }
              totalAttempts++;
            } catch (error) {
              console.error('Error generating individual question:', error);
              totalAttempts++;
            }
          }
        }
      }
      
      setQuestions(generatedQuestions);
      setCurrentQuestionIndex(0);
      setSolvedQuestionIds(new Set());
      setShowQuestionSelection(false);
      setShowCompletionScreen(false);
      setHasActiveSession(true);
      
      if (isRegeneration) {
        toast({
          title: "🔄 You've seen all unique questions for this filter.",
          description: "Practicing them again will help reinforce your prep!"
        });
      } else {
        toast({
          title: "Questions Generated!",
          description: `Generated ${generatedQuestions.length} fresh questions for you.`
        });
      }
    } catch (error) {
      toast({
        title: "Error generating questions",
        description: "Please try again later.",
        variant: "destructive",
      });
      console.error('Error in generateAIQuestions:', error);
    } finally {
      setGeneratingQuestions(false);
    }
  };

  const handleAutoRegeneration = async () => {
    if (currentSelections) {
      setShowCompletionScreen(false);
      await generateAIQuestions(currentSelections, true);
    }
  };

  const handleApplyFilters = async () => {
    if (filters.categories.length > 0 && filters.difficulties.length > 0 && filters.companies.length > 0) {
      const filterSelections: FilterSelections = {
        categories: filters.categories,
        difficulties: filters.difficulties,
        companies: filters.companies
      };
      
      setShowFilterPanel(false);
      setFilterGeneratingQuestions(true);
      await generateAIQuestions(filterSelections);
      setFilterGeneratingQuestions(false);
    } else {
      setShowFilterPanel(false);
    }
  };

  const updateUserActivity = async (questionsSwiped: number = 0) => {
    try {
      const { error } = await supabase.rpc('update_user_activity', {
        p_user_id: user?.id,
        p_questions_swiped: questionsSwiped,
        p_questions_solved: 0
      });
      
      if (error) throw error;
      
      const newTotalLifetimeSwipes = totalLifetimeSwipes + questionsSwiped;
      setTotalLifetimeSwipes(newTotalLifetimeSwipes);
      
      setTimeout(() => {
        fetchProfile();
      }, 100);
    } catch (error) {
      console.error('Error updating activity:', error);
    }
  };

  const handleSwipe = (direction: 'left' | 'right' | 'up') => {
    const newSessionSwipeCount = sessionSwipeCount + 1;
    setSessionSwipeCount(newSessionSwipeCount);
    
    if (direction === 'up') {
      handleSaveQuestion();
      toast({ title: "Question saved to favorites!" });
    } else if (direction === 'right') {
      handleSolved();
      return;
    } else if (direction === 'left') {
      toast({ title: "Question skipped" });
    }
    
    updateUserActivity(1);
    moveToNextQuestion();
  };

  const moveToNextQuestion = () => {
    const newIndex = currentQuestionIndex + 1;
    setCurrentQuestionIndex(newIndex);
    
    if (newIndex >= displayQuestions.length) {
      setShowCompletionScreen(true);
    }
  };

  const handleSolved = () => {
    const currentQuestion = displayQuestions[currentQuestionIndex];
    if (!currentQuestion) return;
    
    const newSolvedIds = new Set([...solvedQuestionIds, currentQuestion.id]);
    setSolvedQuestionIds(newSolvedIds);
    toast({ title: "Great job! Question marked as solved!" });
    
    const newSessionSwipeCount = sessionSwipeCount + 1;
    setSessionSwipeCount(newSessionSwipeCount);
    
    updateUserActivity(1);
    moveToNextQuestion();
  };

  const handleSaveQuestion = async () => {
    const question = displayQuestions[currentQuestionIndex];
    if (!question) return;
    
    try {
      const { error } = await supabase
        .from('saved_questions')
        .insert({
          user_id: user?.id,
          question_id: question.id,
          question_title: question.title,
          question_description: question.description,
          category: question.category,
          difficulty: question.difficulty,
          companies: question.companies
        });
      
      if (error && error.code !== '23505') throw error;
    } catch (error) {
      console.error('Error saving question:', error);
    }
  };

  const handleExplainThis = async (includeCode: boolean = false) => {
    const question = displayQuestions[currentQuestionIndex];
    if (!question) return;
    
    setLoadingExplanation(true);
    setShowExplanation(true);
    
    try {
      const fullQuestion = `${question.title}: ${question.description}`;
      const aiExplanation = await generateExplanation(fullQuestion, includeCode);
      setExplanation(aiExplanation);
    } catch (error) {
      setExplanation('Sorry, I could not generate an explanation right now. Please try again later.');
      toast({
        title: "Error generating explanation",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoadingExplanation(false);
    }
  };

  const handleNewFilters = () => {
    setShowQuestionSelection(true);
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setSolvedQuestionIds(new Set());
    setCurrentSelections(null);
    setShowCompletionScreen(false);
    setHasActiveSession(false);
    clearFilters();
  };

  const handleEncouragingNoteClose = () => {
    setShowEncouragingNote(false);
    // After closing encouraging note, show tutorial if first time, otherwise show question selection
    const hasSeenTutorial = localStorage.getItem(getUserKey('tutorial_seen'));
    if (!hasSeenTutorial) {
      setShowTutorial(true);
    } else {
      setShowQuestionSelection(true);
    }
  };

  if (filterGeneratingQuestions) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
        <div className="text-center space-y-4 sm:space-y-6 max-w-xs sm:max-w-md w-full">
          <Loader2 className="w-12 h-12 sm:w-16 sm:h-16 animate-spin text-tech-electric mx-auto" />
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">
            Your new questions are being generated
          </h2>
          <p className="text-gray-300 text-sm sm:text-base md:text-lg">
            Please wait a few seconds while we create fresh, relevant questions for you...
          </p>
        </div>
      </div>
    );
  }

  if (showEncouragingNote) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
        <div className="bg-gray-800/90 backdrop-blur-sm border border-gray-700 rounded-2xl p-4 sm:p-6 md:p-8 max-w-xs sm:max-w-md w-full mx-4 relative">
          <Button
            onClick={handleEncouragingNoteClose}
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 sm:top-4 sm:right-4 text-gray-400 hover:text-white hover:bg-gray-700 rounded-full w-8 h-8 sm:w-10 sm:h-10"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </Button>
          
          <div className="text-center space-y-3 sm:space-y-4">
            <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">💡</div>
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white">Welcome to TechBumble!</h2>
            <p className="text-gray-300 leading-relaxed text-sm sm:text-base">
              "Mastering DSA is done by practicing, not memorizing — keep solving, keep growing!"
            </p>
            <Button
              onClick={handleEncouragingNoteClose}
              className="bg-tech-electric hover:bg-tech-electric/90 text-black font-semibold px-4 sm:px-6 py-2 mt-3 sm:mt-4 text-sm sm:text-base"
            >
              Let's Start!
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (showQuestionSelection && !hasActiveSession) {
    return (
      <QuestionSelectionScreen 
        onGenerateQuestions={generateAIQuestions}
        isGenerating={generatingQuestions}
      />
    );
  }

  if (showCompletionScreen) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
        <div className="text-center space-y-4 sm:space-y-6 max-w-xs sm:max-w-md lg:max-w-lg w-full">
          <div className="text-4xl sm:text-6xl md:text-8xl">🎉</div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">
            Great Progress!
          </h2>
          <p className="text-gray-300 text-sm sm:text-base md:text-lg mb-4">
            Loading more questions from the same filter to keep you practicing...
          </p>
          <Loader2 className="w-8 h-8 animate-spin text-tech-electric mx-auto" />
        </div>
      </div>
    );
  }

  if (displayQuestions.length === 0 && hasActiveSession) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <p className="text-white text-lg sm:text-xl md:text-2xl mb-4">
            🎉 Congratulations! You've completed all questions!
          </p>
          <Button 
            onClick={handleNewFilters} 
            className="bg-tech-electric hover:bg-tech-electric/90 px-4 sm:px-6 py-2 text-sm sm:text-base"
          >
            Choose New Filters
          </Button>
        </div>
      </div>
    );
  }

  if (hasActiveSession && displayQuestions.length > 0 && currentQuestionIndex < displayQuestions.length) {
    const currentQuestion = displayQuestions[currentQuestionIndex];

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        {/* Header */}
        <div className="flex justify-between items-center p-3 sm:p-4 bg-gray-800/30 backdrop-blur-sm">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="flex items-center text-tech-electric">
              <span className="font-bold text-xs sm:text-sm">
                Swiped: {sessionSwipeCount}
              </span>
            </div>
          </div>
          
          <h1 className="text-base sm:text-lg md:text-2xl font-bold text-white text-center">
            Tech<span className="text-tech-electric">Bumble</span>
          </h1>
          
          <div className="flex items-center space-x-1 sm:space-x-2">
            <Button
              onClick={() => setShowFilterPanel(true)}
              variant="outline"
              size="sm"
              className="bg-gray-700 hover:bg-gray-600 text-white border-gray-600 p-2 relative"
            >
              <Filter className="w-3 h-3 sm:w-4 sm:h-4" />
              {activeFilterCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-tech-electric text-black text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                  {activeFilterCount}
                </span>
              )}
            </Button>
            <Button
              onClick={onShowProfile}
              variant="outline"
              size="sm"
              className="bg-gray-700 hover:bg-gray-600 text-white border-gray-600 p-2"
            >
              <User className="w-3 h-3 sm:w-4 sm:h-4" />
            </Button>
          </div>
        </div>

        {/* Question Counter */}
        <div className="text-center py-2 sm:py-4">
          <span className="text-gray-400 text-xs sm:text-sm">
            {currentQuestionIndex + 1} of {displayQuestions.length}
          </span>
        </div>

        {/* Question Card */}
        <div className="flex justify-center px-3 sm:px-4 pb-6 sm:pb-8">
          <QuestionCard
            question={currentQuestion}
            onSwipe={handleSwipe}
            onExplainThis={handleExplainThis}
            explanation={explanation}
            showExplanation={showExplanation}
            onCloseExplanation={() => setShowExplanation(false)}
            loadingExplanation={loadingExplanation}
          />
        </div>

        {/* Filter Panel */}
        {showFilterPanel && (
          <FilterPanel
            filters={filters}
            onFilterUpdate={updateFilter}
            onClearFilters={clearFilters}
            onClose={() => setShowFilterPanel(false)}
            onApplyFilters={handleApplyFilters}
            activeFilterCount={activeFilterCount}
          />
        )}

        {/* Tutorial Overlay */}
        {showTutorial && (
          <TutorialOverlay onComplete={handleTutorialComplete} />
        )}
      </div>
    );
  }

  return (
    <QuestionSelectionScreen 
      onGenerateQuestions={generateAIQuestions}
      isGenerating={generatingQuestions}
    />
  );
};

export default SwipeInterface;
