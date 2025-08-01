
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useGeminiAI = () => {
  const [loading, setLoading] = useState(false);

  const generateExplanation = async (question: string, includeCode: boolean = false) => {
    setLoading(true);
    try {
      const prompt = includeCode 
        ? `Explain this technical interview question in a concise, clear manner with a working solution and code. Keep it focused and to-the-point - no excessive explanations. Include: 1) Brief approach explanation, 2) Clean, well-commented code solution, 3) Time/space complexity. Question: ${question}`
        : `Explain this technical interview question concisely. Provide: 1) Clear problem understanding, 2) Step-by-step approach, 3) Key insights and hints. Keep it brief but complete. Question: ${question}`;

      const { data, error } = await supabase.functions.invoke('generate-ai-content', {
        body: { prompt, type: 'explanation' }
      });

      if (error) throw error;
      return data.content;
    } catch (error) {
      console.error('Error generating explanation:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const generateQuestion = async (category: string, difficulty: string) => {
    setLoading(true);
    try {
      let promptTemplate = '';
      
      if (category === 'DSA') {
        promptTemplate = `Generate a concise ${difficulty} level Data Structures and Algorithms interview question for FAST interview preparation. 
        Requirements:
        - ${difficulty === 'Easy' ? 'Simple array/string manipulation or basic recursion' : 
            difficulty === 'Medium' ? 'Dynamic programming, trees, graphs, or complex data structures' : 
            'Advanced algorithms, complex system optimization, or hard graph problems'}
        - VERY SHORT problem statement (1-2 sentences ONLY)
        - Question description should be under 100 words
        - Perfect for quick understanding and fast practice
        - No examples or lengthy explanations in the description
        
        Format: Question title on first line, then BRIEF description (under 100 words).`;
      } else if (category === 'System Design') {
        promptTemplate = `Generate a concise ${difficulty} level System Design interview question for FAST interview preparation.
        Requirements:
        - ${difficulty === 'Easy' ? 'Basic web application or simple service design' : 
            difficulty === 'Medium' ? 'Scalable web services, caching, load balancing' : 
            'Large-scale distributed systems, microservices architecture'}
        - VERY SHORT problem statement (1-2 sentences ONLY)
        - Question description should be under 100 words
        - Key requirements only, no excessive details
        - Perfect for quick review and fast practice
        
        Format: Question title on first line, then BRIEF description (under 100 words).`;
      } else {
        promptTemplate = `Generate a concise ${difficulty} level HR/Behavioral interview question for FAST interview preparation.
        Requirements:
        - ${difficulty === 'Easy' ? 'Basic personal or career-related question' : 
            difficulty === 'Medium' ? 'Situational or experience-based question' : 
            'Complex leadership, conflict resolution, or strategic thinking question'}
        - VERY SHORT and direct question (1-2 sentences ONLY)
        - Question description should be under 50 words if context is needed
        - Perfect for quick practice and preparation
        
        Format: Direct question on first line, then minimal context if needed (under 50 words).`;
      }

      const { data, error } = await supabase.functions.invoke('generate-ai-content', {
        body: { prompt: promptTemplate, type: 'question' }
      });

      if (error) throw error;
      return data.content;
    } catch (error) {
      console.error('Error generating question:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    generateExplanation,
    generateQuestion,
    loading
  };
};
