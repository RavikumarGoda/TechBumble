
import { useState } from 'react';
import { supabase, SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from '@/integrations/supabase/client';

export const useGeminiAI = () => {
  const [loading, setLoading] = useState(false);

  const generateExplanation = async (question: string, includeCode: boolean = false, onChunk?: (text: string) => void) => {
    setLoading(true);
    try {
      const prompt = includeCode 
        ? `Explain this technical interview question in a concise, clear manner with a working solution and code. Keep it focused and to-the-point - no excessive explanations. Include: 1) Brief approach explanation, 2) Clean, well-commented code solution, 3) Time/space complexity. Question: ${question}`
        : `Explain this technical interview question concisely. Provide: 1) Clear problem understanding, 2) Step-by-step approach, 3) Key insights and hints. Keep it brief but complete. Question: ${question}`;

      if (onChunk) {
        // Use raw fetch for streaming support
        const { data: { session } } = await supabase.auth.getSession();
        
        const response = await fetch(`${SUPABASE_URL}/functions/v1/generate-ai-content`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session?.access_token || SUPABASE_PUBLISHABLE_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ prompt, type: 'explanation', stream: true })
        });

        if (!response.ok) {
          throw new Error(`Edge Function returned ${response.status}`);
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let fullText = '';

        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunkText = decoder.decode(value, { stream: true });
            fullText += chunkText;
            onChunk(fullText); // pass the accumulated text to the callback
          }
        }
        return fullText;
      } else {
        // Fallback to standard invoke if no streaming is requested
        const { data, error } = await supabase.functions.invoke('generate-ai-content', {
          body: { prompt, type: 'explanation' }
        });

        if (error) throw error;
        return data.content;
      }
    } catch (error) {
      console.error('Error generating explanation:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const generateAllQuestions = async (categories: string[], difficulties: string[], totalCount: number = 15) => {
    setLoading(true);
    try {
      const promptTemplate = `Generate exactly ${totalCount} concise interview questions distributed across these categories: [${categories.join(', ')}] and these difficulties: [${difficulties.join(', ')}].
      
      Requirements:
      - DSA: Simple data structures for Easy, Dynamic programming/graphs for Medium, Advanced algorithms for Hard.
      - System Design: Basic service design for Easy, Scalable architecture for Medium, Large-scale distributed systems for Hard.
      - HR: Basic personal for Easy, Situational for Medium, Strategic/Leadership for Hard.
      - VERY SHORT problem statement (1-2 sentences ONLY)
      - Question description should be under 100 words
      - Perfect for quick understanding and fast practice
      
      CRITICAL: Your response MUST be a raw JSON array of objects. Do NOT wrap it in markdown code blocks (\`\`\`json). Each object must have exactly four keys: "title", "description", "category", and "difficulty". 
      Example: [{"title": "Reverse a String", "description": "Write a function that reverses a string.", "category": "DSA", "difficulty": "Easy"}]`;

      const { data, error } = await supabase.functions.invoke('generate-ai-content', {
        body: { prompt: promptTemplate, type: 'question' }
      });

      if (error) throw error;
      
      let content = data.content.trim();
      
      const match = content.match(/\[\s*\{.*\}\s*\]/s);
      if (match) {
        content = match[0];
      }
      
      try {
        const parsed = JSON.parse(content);
        return Array.isArray(parsed) ? parsed : [];
      } catch (parseError) {
        console.error('Failed to parse AI response as JSON. Raw response:', data.content);
        throw new Error('Invalid AI response format');
      }
    } catch (error) {
      console.error('Error generating all questions:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    generateExplanation,
    generateAllQuestions,
    loading
  };
};
