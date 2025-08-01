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

export const useQuestionFilters = (
  questions: Question[],
  solvedIds: string[] = []
) => {
  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    difficulties: [],
    companies: []
  });

  const filteredQuestions = useMemo(() => {
    const matchesFilter = (q: Question) => {
      const categoryMatch = filters.categories.length === 0 || filters.categories.includes(q.category);
      const difficultyMatch = filters.difficulties.length === 0 || filters.difficulties.includes(q.difficulty);
      const companyMatch = filters.companies.length === 0 ||
        filters.companies.some(company => q.companies.includes(company));
      return categoryMatch && difficultyMatch && companyMatch;
    };

    const filtered = questions.filter(matchesFilter);
    const unsolvedFiltered = filtered.filter(q => !solvedIds.includes(q.id));

    if (unsolvedFiltered.length === 0 && filtered.length > 0) {
      return filtered; // allow repeats
    }

    if (unsolvedFiltered.length === 0 && filtered.length === 0) {
      return questions.length > 0 ? questions : [];
    }

    return unsolvedFiltered;
  }, [questions, filters, solvedIds]);

  const updateFilter = (type: keyof FilterState, value: string) => {
    setFilters(prev => {
      if (type === 'categories' || type === 'difficulties') {
        return {
          ...prev,
          [type]: prev[type].includes(value) ? [] : [value]
        };
      } else {
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

  const activeFilterCount =
    filters.categories.length + filters.difficulties.length + filters.companies.length;

  return {
    filters,
    filteredQuestions,
    updateFilter,
    clearFilters,
    activeFilterCount
  };
};
