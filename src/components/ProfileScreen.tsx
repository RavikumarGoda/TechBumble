
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Target, Brain, Code, Loader2, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useGeminiAI } from '@/hooks/useGeminiAI';
import About from '@/components/About';

interface SavedQuestion {
  id: string;
  question_title: string;
  question_description: string;
  category: string;
  difficulty: string;
  companies: string[];
  saved_at: string;
}

interface ProfileScreenProps {
  onBack: () => void;
}

const ProfileScreen = ({ onBack }: ProfileScreenProps) => {
  const { user, signOut } = useAuth();
  const { generateExplanation } = useGeminiAI();
  const [savedQuestions, setSavedQuestions] = useState<SavedQuestion[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showAbout, setShowAbout] = useState(false);
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);
  const [explanations, setExplanations] = useState<{[key: string]: string}>({});
  const [loadingExplanations, setLoadingExplanations] = useState<{[key: string]: boolean}>({});
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchProfileData();
      fetchSavedQuestions();
    }
  }, [user]);

  // Refresh profile data every few seconds to keep total swiped count updated
  useEffect(() => {
    const interval = setInterval(() => {
      if (user) {
        fetchProfileData();
      }
    }, 3000); // Refresh every 3 seconds

    return () => clearInterval(interval);
  }, [user]);

  const fetchProfileData = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      setProfile(data);
    } catch (error: any) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchSavedQuestions = async () => {
    try {
      const { data, error } = await supabase
        .from('saved_questions')
        .select('*')
        .eq('user_id', user?.id)
        .order('saved_at', { ascending: false });
      
      if (error) throw error;
      setSavedQuestions(data || []);
    } catch (error: any) {
      console.error('Error fetching saved questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({ title: "Signed out successfully!" });
    } catch (error: any) {
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const removeSavedQuestion = async (questionId: string) => {
    try {
      const { error } = await supabase
        .from('saved_questions')
        .delete()
        .eq('id', questionId);
      
      if (error) throw error;
      
      setSavedQuestions(prev => prev.filter(q => q.id !== questionId));
      toast({ title: "Question removed from saved list" });
    } catch (error: any) {
      toast({
        title: "Error removing question",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleExplainQuestion = async (question: SavedQuestion, includeCode: boolean = false) => {
    const key = `${question.id}-${includeCode ? 'code' : 'explain'}`;
    
    if (explanations[key]) {
      // Toggle if already loaded
      setExpandedQuestion(expandedQuestion === key ? null : key);
      return;
    }
    
    setLoadingExplanations(prev => ({ ...prev, [key]: true }));
    setExpandedQuestion(key);
    
    try {
      const fullQuestion = `${question.question_title}: ${question.question_description}`;
      const aiExplanation = await generateExplanation(fullQuestion, includeCode);
      setExplanations(prev => ({ ...prev, [key]: aiExplanation }));
    } catch (error) {
      setExplanations(prev => ({ 
        ...prev, 
        [key]: 'Sorry, I could not generate an explanation right now. Please try again later.' 
      }));
      toast({
        title: "Error generating explanation",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoadingExplanations(prev => ({ ...prev, [key]: false }));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black px-3 sm:px-4 py-4 sm:py-6">
      <div className="max-w-4xl mx-auto">
        {/* Header - Fully responsive */}
        <div className="flex flex-col space-y-3 mb-4 sm:mb-6">
          {/* Back button on its own row */}
          <div className="flex justify-start">
            <Button
              onClick={onBack}
              variant="ghost"
              className="text-white hover:bg-gray-800 text-sm sm:text-base px-3 py-2"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              Back
            </Button>
          </div>
          
          {/* About and Sign Out buttons - responsive flex */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:justify-end">
            <Button
              onClick={() => setShowAbout(true)}
              variant="outline"
              className="bg-tech-electric hover:bg-tech-electric/90 text-black border-tech-electric font-medium text-sm sm:text-base w-full sm:w-auto px-4 py-2"
            >
              <Info className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
              About
            </Button>
            <Button
              onClick={handleSignOut}
              variant="outline"
              className="bg-red-600 hover:bg-red-700 text-white border-red-600 text-sm sm:text-base w-full sm:w-auto px-4 py-2"
            >
              Sign Out
            </Button>
          </div>
        </div>

        {/* Title section - responsive */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2">Profile</h1>
          <p className="text-gray-400 text-sm sm:text-base px-4">Welcome back, {profile?.username || user?.email}</p>
        </div>

        {/* Stats card - responsive */}
        <div className="grid grid-cols-1 gap-4 sm:gap-6 mb-6 sm:mb-8 max-w-sm sm:max-w-md mx-auto">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader className="pb-2 sm:pb-3 px-4 sm:px-6">
              <CardTitle className="text-white flex items-center justify-center text-base sm:text-lg">
                <Target className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-tech-electric" />
                Total Questions Swiped
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center pt-0 px-4 sm:px-6">
              <div className="text-3xl sm:text-4xl font-bold text-tech-electric">
                {profile?.total_questions_swiped || 0}
              </div>
              <p className="text-gray-400 text-xs sm:text-sm">questions</p>
            </CardContent>
          </Card>
        </div>

        {/* Saved questions card - fully responsive */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-white text-base sm:text-lg">Saved Questions ({savedQuestions.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            {savedQuestions.length === 0 ? (
              <p className="text-gray-400 text-center py-6 sm:py-8 text-sm sm:text-base px-4">No saved questions yet. Start swiping to save your favorites!</p>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {savedQuestions.map((question) => (
                  <div key={question.id} className="bg-gray-700/50 p-3 sm:p-4 rounded-lg">
                    <div className="flex flex-col space-y-2 sm:space-y-0 sm:flex-row sm:justify-between sm:items-start mb-2">
                      <h3 className="text-white font-semibold text-sm sm:text-base leading-tight break-words pr-0 sm:pr-4">{question.question_title}</h3>
                      <Button
                        onClick={() => removeSavedQuestion(question.id)}
                        variant="ghost"
                        size="sm"
                        className="text-red-400 hover:text-red-300 text-xs sm:text-sm self-start sm:self-auto shrink-0 w-fit"
                      >
                        Remove
                      </Button>
                    </div>
                    {question.question_description && (
                      <p className="text-gray-300 text-xs sm:text-sm mb-3 leading-relaxed break-words">{question.question_description}</p>
                    )}
                    
                    {/* Tags - responsive flex wrap */}
                    <div className="flex flex-wrap gap-1 sm:gap-2 mb-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        question.difficulty === 'Easy' ? 'bg-green-600' :
                        question.difficulty === 'Medium' ? 'bg-yellow-600' : 'bg-red-600'
                      } text-white`}>
                        {question.difficulty}
                      </span>
                      <span className="px-2 py-1 rounded-full text-xs bg-tech-electric text-white">
                        {question.category}
                      </span>
                      {question.companies.map((company) => (
                        <span key={company} className="px-2 py-1 rounded-full text-xs bg-gray-600 text-white">
                          {company}
                        </span>
                      ))}
                    </div>
                    
                    {/* Action buttons - responsive stack */}
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button
                        onClick={() => handleExplainQuestion(question, false)}
                        className="bg-purple-600 hover:bg-purple-700 text-white text-xs px-3 py-2 flex-1"
                        size="sm"
                      >
                        <Brain className="w-3 h-3 mr-1" />
                        Explain
                      </Button>
                      <Button
                        onClick={() => handleExplainQuestion(question, true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-2 flex-1"
                        size="sm"
                      >
                        <Code className="w-3 h-3 mr-1" />
                        Code
                      </Button>
                    </div>

                    {/* Show explanation - responsive */}
                    {expandedQuestion && (expandedQuestion.startsWith(question.id)) && (
                      <div className="mt-3 sm:mt-4 bg-gray-900/50 p-3 rounded-lg">
                        {loadingExplanations[expandedQuestion] ? (
                          <div className="flex items-center justify-center py-4">
                            <Loader2 className="w-4 h-4 animate-spin text-tech-electric mr-2" />
                            <span className="text-gray-300 text-sm">Generating explanation...</span>
                          </div>
                        ) : (
                          <div className="text-gray-300 whitespace-pre-wrap text-xs sm:text-sm leading-relaxed break-words overflow-x-auto">
                            {explanations[expandedQuestion]}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {showAbout && <About onClose={() => setShowAbout(false)} />}
    </div>
  );
};

export default ProfileScreen;
