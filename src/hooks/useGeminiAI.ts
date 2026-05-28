import { useState } from 'react';
import { useAuth } from './useAuth';

export const useGeminiAI = () => {
  const [loading, setLoading] = useState(false);
  const { getToken } = useAuth();

  /** Stream an AI explanation for a question */
  const generateExplanation = async (
    question: string,
    includeCode: boolean = false,
    onChunk?: (text: string) => void
  ): Promise<string> => {
    setLoading(true);
    try {
      const token = await getToken();
      const response = await fetch('/api/explain', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ question, includeCode }),
      });

      if (!response.ok) throw new Error(`Explain API error: ${response.status}`);

      if (onChunk) {
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let fullText = '';
        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            fullText += decoder.decode(value, { stream: true });
            onChunk(fullText);
          }
        }
        return fullText;
      } else {
        return await response.text();
      }
    } catch (error) {
      console.error('generateExplanation error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { generateExplanation, loading };
};
