
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Filter } from 'lucide-react';
import { FilterState } from '@/hooks/useQuestionFilters';

interface FilterPanelProps {
  filters: FilterState;
  onFilterUpdate: (type: keyof FilterState, value: string) => void;
  onClearFilters: () => void;
  onClose: () => void;
  onApplyFilters: () => void;
  activeFilterCount: number;
}

const FilterPanel = ({ 
  filters, 
  onFilterUpdate, 
  onClearFilters, 
  onClose, 
  onApplyFilters,
  activeFilterCount 
}: FilterPanelProps) => {
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

  const handleSingleSelection = (type: 'categories' | 'difficulties', value: string) => {
    onFilterUpdate(type, value);
  };

  const handleMultipleSelection = (type: 'companies', value: string) => {
    onFilterUpdate(type, value);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
      <Card className="bg-gray-800 border-gray-700 w-full max-w-xs sm:max-w-md lg:max-w-lg max-h-[85vh] sm:max-h-[80vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 sm:pb-4 p-4 sm:p-6">
          <CardTitle className="text-white flex items-center text-base sm:text-lg">
            <Filter className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            Filters
            {activeFilterCount > 0 && (
              <span className="ml-2 bg-tech-electric text-white text-xs px-2 py-1 rounded-full">
                {activeFilterCount}
              </span>
            )}
          </CardTitle>
          <Button onClick={onClose} variant="ghost" size="sm" className="text-gray-400 p-1">
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6 pt-0">
          <div>
            <h3 className="text-white font-medium mb-2 sm:mb-3 text-sm sm:text-base">Categories (Select One)</h3>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <FilterButton
                  key={category}
                  active={filters.categories.includes(category)}
                  onClick={() => handleSingleSelection('categories', category)}
                >
                  {category === 'DSA' ? (
                    <>
                      <span className="hidden lg:inline">Data Structures & Algorithms</span>
                      <span className="lg:hidden">DS&A</span>
                    </>
                  ) : (
                    category
                  )}
                </FilterButton>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-white font-medium mb-2 sm:mb-3 text-sm sm:text-base">Difficulty (Select One)</h3>
            <div className="flex flex-wrap gap-2">
              {difficulties.map((difficulty) => (
                <FilterButton
                  key={difficulty}
                  active={filters.difficulties.includes(difficulty)}
                  onClick={() => handleSingleSelection('difficulties', difficulty)}
                  variant="difficulty"
                >
                  {difficulty}
                </FilterButton>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-white font-medium mb-2 sm:mb-3 text-sm sm:text-base">Companies (Select Multiple)</h3>
            <div className="flex flex-wrap gap-2">
              {companies.map((company) => (
                <FilterButton
                  key={company}
                  active={filters.companies.includes(company)}
                  onClick={() => handleMultipleSelection('companies', company)}
                >
                  {company}
                </FilterButton>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 pt-2 sm:pt-4">
            <Button
              onClick={onClearFilters}
              variant="outline"
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-gray-300 border-gray-600 text-sm"
            >
              Clear All
            </Button>
            <Button
              onClick={onApplyFilters}
              className="flex-1 bg-tech-electric hover:bg-tech-electric/90 text-sm"
            >
              Apply Filters
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FilterPanel;
