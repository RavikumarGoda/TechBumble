import { useState, useRef, useEffect } from 'react';
import { supabase, SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from '@/integrations/supabase/client';
import { Question } from '@/hooks/useQuestionFilters';
import { Button } from '@/components/ui/button';
import { X, Send, Bot, User, Loader2, RotateCcw, Mic } from 'lucide-react';

interface Message {
  role: 'interviewer' | 'user';
  content: string;
  streaming?: boolean;
}

interface MockInterviewModalProps {
  question: Question;
  onClose: () => void;
}

// System prompt — gives Gemini its interviewer persona
const buildSystemPrompt = (question: Question) => `
You are Alex, a strict but fair senior software engineer at a top tech company (FAANG level) conducting a real technical interview.

The candidate is being interviewed on this question:
Title: "${question.title}"
Description: "${question.description}"
Category: ${question.category}
Difficulty: ${question.difficulty}

Your behavior rules:
1. Start by greeting the candidate and reading out the question naturally.
2. Let the candidate explain their approach BEFORE giving any hints.
3. Ask probing follow-up questions: Time complexity? Space complexity? Edge cases? Can you optimize?
4. If they're stuck, give ONE small hint at a time — never the full answer.
5. If they give a wrong answer, say "Hmm, think about that again" and ask them to reconsider.
6. If they nail it, compliment them and ask a harder follow-up (scale the system, handle concurrency, etc.)
7. Keep responses SHORT (2-4 sentences max). This is a real-time conversation, not a lecture.
8. Never reveal you are an AI. Stay in character as Alex at all times.
9. End the interview after 8-10 exchanges by giving a brief, honest assessment.

Begin the interview now.
`.trim();

const MockInterviewModal = ({ question, onClose }: MockInterviewModalProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [exchangeCount, setExchangeCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Build the full conversation history for Gemini
  const conversationHistory = useRef<{ role: string; content: string }[]>([]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-start the interview on mount
  useEffect(() => {
    startInterview();
  }, []);

  const streamInterviewerResponse = async (history: { role: string; content: string }[]) => {
    setIsStreaming(true);

    // Add placeholder streaming message
    setMessages((prev) => [...prev, { role: 'interviewer', content: '', streaming: true }]);

    try {
      const { data: { session } } = await supabase.auth.getSession();

      // Build the full prompt with system context + conversation history
      const systemPrompt = buildSystemPrompt(question);
      const conversationText = history
        .map((m) => `${m.role === 'interviewer' ? 'Interviewer (Alex)' : 'Candidate'}: ${m.content}`)
        .join('\n\n');

      const fullPrompt = `${systemPrompt}\n\n--- CONVERSATION SO FAR ---\n${conversationText}\n\nInterviewer (Alex):`;

      const response = await fetch(`${SUPABASE_URL}/functions/v1/generate-ai-content`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.access_token || SUPABASE_PUBLISHABLE_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: fullPrompt, stream: true }),
      });

      if (!response.ok) throw new Error(`Edge function error: ${response.status}`);

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullText = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          fullText += chunk;

          // Update the streaming message in place
          setMessages((prev) => {
            const updated = [...prev];
            const lastIdx = updated.length - 1;
            if (updated[lastIdx]?.streaming) {
              updated[lastIdx] = { role: 'interviewer', content: fullText, streaming: true };
            }
            return updated;
          });
        }
      }

      // Finalize the message (remove streaming flag)
      setMessages((prev) => {
        const updated = [...prev];
        const lastIdx = updated.length - 1;
        if (updated[lastIdx]?.streaming) {
          updated[lastIdx] = { role: 'interviewer', content: fullText, streaming: false };
        }
        return updated;
      });

      // Store in history
      conversationHistory.current.push({ role: 'interviewer', content: fullText });
      return fullText;
    } catch (err) {
      console.error('Mock interview stream error:', err);
      setMessages((prev) => {
        const updated = [...prev];
        const lastIdx = updated.length - 1;
        if (updated[lastIdx]?.streaming) {
          updated[lastIdx] = {
            role: 'interviewer',
            content: "Sorry, I'm having a technical issue. Give me a moment... Let's continue — walk me through your approach.",
            streaming: false,
          };
        }
        return updated;
      });
    } finally {
      setIsStreaming(false);
    }
  };

  const startInterview = async () => {
    setInterviewStarted(true);
    conversationHistory.current = [];
    await streamInterviewerResponse([]);
    setExchangeCount(0);
  };

  const restartInterview = () => {
    setMessages([]);
    setInput('');
    setExchangeCount(0);
    conversationHistory.current = [];
    startInterview();
  };

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || isStreaming) return;

    setInput('');
    setExchangeCount((c) => c + 1);

    // Add user message
    const userMsg: Message = { role: 'user', content: text };
    setMessages((prev) => [...prev, userMsg]);
    conversationHistory.current.push({ role: 'user', content: text });

    // Get interviewer response using full history
    await streamInterviewerResponse([...conversationHistory.current]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const difficultyColor =
    question.difficulty === 'Easy' ? 'text-green-400' :
    question.difficulty === 'Medium' ? 'text-yellow-400' : 'text-red-400';

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-gray-950">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-900 border-b border-gray-800 shrink-0">
        <div className="flex items-center gap-3">
          {/* Interviewer avatar */}
          <div className="relative">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-900/40">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-gray-900" />
          </div>
          <div>
            <p className="text-white font-semibold text-sm leading-tight">Alex — Senior Engineer</p>
            <p className="text-gray-400 text-xs">Mock Interview • {question.category} • <span className={difficultyColor}>{question.difficulty}</span></p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={restartInterview}
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-white hover:bg-gray-800 p-2"
            title="Restart interview"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-white hover:bg-gray-800 p-2"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Question chip */}
      <div className="px-4 py-2 bg-gray-900/60 border-b border-gray-800/60 shrink-0">
        <p className="text-xs text-gray-400 truncate">
          <span className="text-gray-600 mr-1">Topic:</span>
          <span className="text-gray-300">{question.title}</span>
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            {/* Avatar */}
            <div className="shrink-0 mt-1">
              {msg.role === 'interviewer' ? (
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
              ) : (
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
              )}
            </div>

            {/* Bubble */}
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === 'interviewer'
                  ? 'bg-gray-800 text-gray-100 rounded-tl-sm'
                  : 'bg-gradient-to-br from-cyan-600 to-blue-700 text-white rounded-tr-sm'
              }`}
            >
              {msg.content}
              {msg.streaming && (
                <span className="inline-block w-1.5 h-4 bg-cyan-400 ml-1 animate-pulse rounded-sm align-middle" />
              )}
            </div>
          </div>
        ))}

        {/* Exchange counter hint */}
        {exchangeCount >= 8 && (
          <div className="text-center">
            <span className="text-xs text-gray-600 bg-gray-900 px-3 py-1 rounded-full border border-gray-800">
              Interview wrapping up...
            </span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="px-4 py-3 bg-gray-900 border-t border-gray-800 shrink-0">
        <div className="flex gap-2 items-end">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isStreaming}
            placeholder={isStreaming ? 'Alex is responding...' : 'Type your answer... (Enter to send)'}
            rows={2}
            className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 resize-none focus:outline-none focus:border-cyan-600 focus:ring-1 focus:ring-cyan-600/50 transition-colors disabled:opacity-50"
          />
          <Button
            onClick={sendMessage}
            disabled={isStreaming || !input.trim()}
            className="bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl px-4 h-[72px] shrink-0 disabled:opacity-40 transition-all"
          >
            {isStreaming ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
        <p className="text-xs text-gray-600 mt-1.5 text-center">
          Shift+Enter for new line • Enter to send
        </p>
      </div>
    </div>
  );
};

export default MockInterviewModal;
