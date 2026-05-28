/**
 * Seed script — generates questions via Gemini once and stores in Neon.
 * Run: npx ts-node --esm prisma/seed.ts
 * OR:  node --loader ts-node/esm prisma/seed.ts
 */

import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const COMPANIES = ['Google', 'Amazon', 'Meta', 'Microsoft', 'Apple', 'Netflix'];

interface RawQuestion {
  title: string;
  description: string;
  explanation: string;
  solution: string;
  companies: string[];
}

async function callGemini(prompt: string): Promise<string> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
    }
  );
  if (!res.ok) throw new Error(`Gemini error: ${res.status} ${await res.text()}`);
  const data = await res.json();
  return data.candidates[0].content.parts[0].text;
}

async function generateBatch(
  category: string,
  difficulty: string,
  count: number
): Promise<RawQuestion[]> {
  const companiesStr = COMPANIES.join(', ');

  const prompt = `Generate exactly ${count} technical interview questions for the following:
Category: ${category}
Difficulty: ${difficulty}
Companies that ask these: picked from [${companiesStr}]

Requirements:
- Each question must have a unique, realistic title
- Description: 2-3 sentence problem statement
- Explanation: Detailed step-by-step approach (4-6 sentences), mention time and space complexity
- Solution: Complete working C++ code with comments (even for System Design and HR, write pseudo-code in C++ style comments)
- For DSA: actual compilable C++ code
- For System Design: C++ struct/class outline showing the architecture
- For HR: C++ comment-style structured answer template
- companies: array of 2-4 companies from [${companiesStr}] that commonly ask this

CRITICAL: Respond with ONLY a raw JSON array. No markdown, no code blocks, no explanation.
Format:
[
  {
    "title": "...",
    "description": "...",
    "explanation": "...",
    "solution": "...",
    "companies": ["Google", "Amazon"]
  }
]`;

  const raw = await callGemini(prompt);

  // Strip markdown fences if present
  const clean = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  const match = clean.match(/\[[\s\S]*\]/);
  if (!match) throw new Error(`No JSON array found. Got: ${raw.slice(0, 200)}`);

  const parsed = JSON.parse(match[0]);
  return Array.isArray(parsed) ? parsed : [];
}

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  console.log('🌱 Starting TechBumble question seed...\n');

  // Check existing count
  const existing = await prisma.question.count();
  if (existing >= 90) {
    console.log(`✅ ${existing} questions already seeded. Nothing to do.`);
    return;
  }
  console.log(`Found ${existing} questions, seeding missing batches...\n`);

  const batches: Array<{ category: string; difficulty: string; count: number }> = [
    // Only re-run the 3 failed batches
    { category: 'DSA', difficulty: 'Hard',           count: 12 },
    { category: 'System Design', difficulty: 'Easy',  count: 8  },
    { category: 'System Design', difficulty: 'Medium',count: 10 },
  ];

  let totalInserted = 0;

  for (const batch of batches) {
    const { category, difficulty, count } = batch;
    console.log(`⏳ Generating ${count} ${category} / ${difficulty} questions...`);

    try {
      const questions = await generateBatch(category, difficulty, count);

      for (const q of questions) {
        if (!q.title || !q.description || !q.explanation || !q.solution) continue;

        await prisma.question.create({
          data: {
            title: q.title.trim(),
            description: q.description.trim(),
            category,
            difficulty,
            companies: Array.isArray(q.companies) ? q.companies : [],
            explanation: q.explanation.trim(),
            solution: q.solution.trim(),
            isActive: true,
          },
        });
        totalInserted++;
      }

      console.log(`   ✅ Inserted ${questions.length} questions (total: ${totalInserted})`);

      // Wait 8s between batches to reduce 503 risk
      await sleep(8000);
    } catch (err: any) {
      console.error(`   ❌ Failed batch ${category}/${difficulty}:`, err.message);
      await sleep(5000); // wait longer on error
    }
  }

  console.log(`\n🎉 Seed complete! ${totalInserted} questions inserted into Neon.`);
  console.log('   Open DBeaver to browse your questions table.');
}

main()
  .catch((e) => {
    console.error('Fatal seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
