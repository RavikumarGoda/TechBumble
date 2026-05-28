import type { VercelRequest, VercelResponse } from '@vercel/node';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { question, includeCode } = req.body;
  if (!question) return res.status(400).json({ error: 'question required' });

  const prompt = includeCode
    ? `Explain this technical interview question with a working C++ solution. Include: 1) Brief approach, 2) Clean C++ code with comments, 3) Time/Space complexity. Question: ${question}`
    : `Explain this technical interview question concisely. Provide: 1) Clear problem understanding, 2) Step-by-step approach, 3) Key insights. Question: ${question}`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:streamGenerateContent?alt=sse&key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
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

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      // Parse SSE data lines
      const lines = chunk.split('\n');
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6));
            const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) res.write(text);
          } catch {}
        }
      }
    }

    res.end();
  } catch (error: any) {
    console.error('Explain error:', error);
    return res.status(500).json({ error: error.message });
  }
}
