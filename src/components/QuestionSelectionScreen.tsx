import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Play } from 'lucide-react';

interface FilterSelections {
  categories: string[];
  difficulties: string[];
  companies: string[];
}

interface QuestionSelectionScreenProps {
  onGenerateQuestions: (selections: FilterSelections) => void;
  isGenerating: boolean;
}

const QuestionSelectionScreen = ({ onGenerateQuestions, isGenerating }: QuestionSelectionScreenProps) => {
  const [selections, setSelections] = useState<FilterSelections>({
    categories: [],
    difficulties: [],
    companies: []
  });

  const categories = ['DSA', 'System Design', 'HR'];
  const difficulties = ['Easy', 'Medium', 'Hard'];
  const companies = ['Google', 'Amazon', 'Meta', 'Microsoft', 'Apple', 'Netflix'];

  const FilterButton = ({ 
    active, 
    onClick, 
    children, 
    variant = 'default' 
  }: { 
    active: boolean; 
    onClick: () => void; 
    children: React.ReactNode;
    variant?: 'default' | 'difficulty';
  }) => (
    <Button
      onClick={onClick}
      variant={active ? "default" : "outline"}
      size="sm"
      className={`text-xs sm:text-sm ${
        active 
          ? variant === 'difficulty' 
            ? 'bg-yellow-600 hover:bg-yellow-700' 
            : 'bg-tech-electric hover:bg-tech-electric/90'
          : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
      } border-gray-600`}
    >
      {children}
    </Button>
  );

  const updateSelection = (type: keyof FilterSelections, value: string) => {
    setSelections(prev => ({
      ...prev,
      [type]: prev[type].includes(value)
        ? prev[type].filter(item => item !== value)
        : [...prev[type], value]
    }));
  };

  const handleGenerate = () => {
    onGenerateQuestions(selections);
  };

  const canGenerate = selections.categories.length > 0 && 
                      selections.difficulties.length > 0 && 
                      selections.companies.length > 0;

  // Show loading overlay when generating
  if (isGenerating) {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
      <Card className="bg-gray-800 border-gray-700 w-full max-w-xs sm:max-w-md lg:max-w-lg max-h-[90vh] overflow-y-auto">
        <CardHeader className="text-center p-4 sm:p-6">
          <CardTitle className="text-white text-lg sm:text-xl md:text-2xl">
            Select Your Questions
          </CardTitle>
          <p className="text-gray-400 text-xs sm:text-sm md:text-base">
            Choose categories, difficulties, and companies to generate personalized questions
          </p>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
          <div>
            <h3 className="text-white font-medium mb-2 sm:mb-3 text-sm sm:text-base">Categories</h3>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <FilterButton
                  key={category}
                  active={selections.categories.includes(category)}
                  onClick={() => updateSelection('categories', category)}
                >
                  {category === 'DSA' ? (
                    <>
                      <span className="hidden sm:inline">Data Structures & Algorithms</span>
                      <span className="sm:hidden">DSA</span>
                    </>
                  ) : (
                    category
                  )}
                </FilterButton>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-white font-medium mb-2 sm:mb-3 text-sm sm:text-base">Difficulty</h3>
            <div className="flex flex-wrap gap-2">
              {difficulties.map((difficulty) => (
                <FilterButton
                  key={difficulty}
                  active={selections.difficulties.includes(difficulty)}
                  onClick={() => updateSelection('difficulties', difficulty)}
                  variant="difficulty"
                >
                  {difficulty}
                </FilterButton>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-white font-medium mb-2 sm:mb-3 text-sm sm:text-base">Companies</h3>
            <div className="flex flex-wrap gap-2">
              {companies.map((company) => (
                <FilterButton
                  key={company}
                  active={selections.companies.includes(company)}
                  onClick={() => updateSelection('companies', company)}
                >
                  {company}
                </FilterButton>
              ))}
            </div>
          </div>

          <Button
            onClick={handleGenerate}
            disabled={!canGenerate}
            className="w-full bg-tech-electric hover:bg-tech-electric/90 disabled:opacity-50 text-sm sm:text-base"
            size="lg"
          >
            <Play className="w-4 h-4 mr-2" />
            Generate Questions
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuestionSelectionScreen;
