
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

  const generateQuestionsBatch = async (category: string, difficulty: string, count: number = 3) => {
    setLoading(true);
    try {
      let promptTemplate = '';
      
      if (category === 'DSA') {
        promptTemplate = `Generate exactly ${count} concise ${difficulty} level Data Structures and Algorithms interview questions for FAST interview preparation. 
        Requirements:
        - ${difficulty === 'Easy' ? 'Simple array/string manipulation or basic recursion' : 
            difficulty === 'Medium' ? 'Dynamic programming, trees, graphs, or complex data structures' : 
            'Advanced algorithms, complex system optimization, or hard graph problems'}
        - VERY SHORT problem statement (1-2 sentences ONLY)
        - Question description should be under 100 words
        - Perfect for quick understanding and fast practice
        - No examples or lengthy explanations in the description
        
        CRITICAL: Your response MUST be a raw JSON array of objects. Do NOT wrap it in markdown code blocks (\`\`\`json). Each object must have exactly two keys: "title" and "description". Example: [{"title": "Reverse a String", "description": "Write a function that reverses a string. The input string is given as an array of characters."}]`;
      } else if (category === 'System Design') {
        promptTemplate = `Generate exactly ${count} concise ${difficulty} level System Design interview questions for FAST interview preparation.
        Requirements:
        - ${difficulty === 'Easy' ? 'Basic web application or simple service design' : 
            difficulty === 'Medium' ? 'Scalable web services, caching, load balancing' : 
            'Large-scale distributed systems, microservices architecture'}
        - VERY SHORT problem statement (1-2 sentences ONLY)
        - Question description should be under 100 words
        - Key requirements only, no excessive details
        - Perfect for quick review and fast practice
        
        CRITICAL: Your response MUST be a raw JSON array of objects. Do NOT wrap it in markdown code blocks (\`\`\`json). Each object must have exactly two keys: "title" and "description". Example: [{"title": "Design a URL Shortener", "description": "Design a service like TinyURL that takes a long URL and returns a short URL."}]`;
      } else {
        promptTemplate = `Generate exactly ${count} concise ${difficulty} level HR/Behavioral interview questions for FAST interview preparation.
        Requirements:
        - ${difficulty === 'Easy' ? 'Basic personal or career-related question' : 
            difficulty === 'Medium' ? 'Situational or experience-based question' : 
            'Complex leadership, conflict resolution, or strategic thinking question'}
        - VERY SHORT and direct question (1-2 sentences ONLY)
        - Question description should be under 50 words if context is needed
        - Perfect for quick practice and preparation
        
        CRITICAL: Your response MUST be a raw JSON array of objects. Do NOT wrap it in markdown code blocks (\`\`\`json). Each object must have exactly two keys: "title" and "description". Example: [{"title": "Tell me about yourself", "description": "Please provide a brief overview of your background, experience, and what brings you to this interview."}]`;
      }

      const { data, error } = await supabase.functions.invoke('generate-ai-content', {
        body: { prompt: promptTemplate, type: 'question' }
      });

      if (error) throw error;
      
      let content = data.content.trim();
      if (content.startsWith('```json')) content = content.substring(7);
      if (content.startsWith('```')) content = content.substring(3);
      if (content.endsWith('```')) content = content.substring(0, content.length - 3);
      
      const parsed = JSON.parse(content.trim());
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.error('Error generating questions batch:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    generateExplanation,
    generateQuestionsBatch,
    loading
  };
};
