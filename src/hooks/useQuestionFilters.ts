
import { useState, useMemo } from 'react';

export interface Question {
  id: string;
  title: string;
  description: string;
  category: 'DSA' | 'System Design' | 'HR';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  companies: string[];
}

export interface FilterState {
  categories: string[];
  difficulties: string[];
  companies: string[];
}

export const useQuestionFilters = (questions: Question[]) => {
  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    difficulties: [],
    companies: []
  });

  const filteredQuestions = useMemo(() => {
    return questions.filter(question => {
      const categoryMatch = filters.categories.length === 0 || filters.categories.includes(question.category);
      const difficultyMatch = filters.difficulties.length === 0 || filters.difficulties.includes(question.difficulty);
      const companyMatch = filters.companies.length === 0 || 
        filters.companies.some(company => question.companies.includes(company));

      return categoryMatch && difficultyMatch && companyMatch;
    });
  }, [questions, filters]);

  const updateFilter = (type: keyof FilterState, value: string) => {
    setFilters(prev => {
      if (type === 'categories' || type === 'difficulties') {
        // Single selection for categories and difficulties
        return {
          ...prev,
          [type]: prev[type].includes(value) ? [] : [value]
        };
      } else {
        // Multiple selection for companies
        return {
          ...prev,
          [type]: prev[type].includes(value)
            ? prev[type].filter(item => item !== value)
            : [...prev[type], value]
        };
      }
    });
  };

  const clearFilters = () => {
    setFilters({
      categories: [],
      difficulties: [],
      companies: []
    });
  };

  const activeFilterCount = filters.categories.length + filters.difficulties.length + filters.companies.length;

  return {
    filters,
    filteredQuestions,
    updateFilter,
    clearFilters,
    activeFilterCount
  };
};
