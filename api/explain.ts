import type { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyToken } from '@clerk/backend';
import { prisma } from '../lib/prisma.js';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY!;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // Auth
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (token) {
    try { await verifyToken(token, { secretKey: CLERK_SECRET_KEY }); }
    catch { return res.status(401).json({ error: 'Unauthorized' }); }
  }

  const { question, questionId } = req.body;
  if (!question && !questionId) return res.status(400).json({ error: 'question or questionId required' });

  // 1️⃣ Check DB cache first
  if (questionId) {
    const dbQ = await prisma.question.findUnique({
      where: { id: questionId },
      select: { aiExplanation: true },
    });
    if (dbQ?.aiExplanation) {
      res.setHeader('Content-Type', 'text/plain');
      return res.status(200).send(dbQ.aiExplanation);
    }
  }

  // 2️⃣ Fallback: call Gemini and stream
  if (!GEMINI_API_KEY) return res.status(500).json({ error: 'GEMINI_API_KEY not set' });

  const questionText = question || req.body.questionTitle || 'this question';
  const prompt = `Explain this technical interview question clearly for a student. 
Give:
1. A clear, simple explanation of what the problem is asking (2-3 sentences)
2. A concrete example with input and expected output
3. Key insight or hint about HOW to think about it (1-2 sentences)

DO NOT write any code or solution. Focus only on making the problem crystal clear.

Question: ${questionText}`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:streamGenerateContent?alt=sse&key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      }
    );

    if (!response.ok) {
      const err = await response.text();
      return res.status(response.status).json({ error: err });
    }

    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Cache-Control', 'no-cache');

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    if (!reader) return res.status(500).json({ error: 'No stream' });

    let fullText = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      for (const line of chunk.split('\n')) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6));
            const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) { res.write(text); fullText += text; }
          } catch {}
        }
      }
    }

    // Save to DB for next time (fire and forget)
    if (questionId && fullText) {
      prisma.question.update({ where: { id: questionId }, data: { aiExplanation: fullText } })
        .catch(() => {});
    }

    res.end();
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
