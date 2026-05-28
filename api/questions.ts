import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClerkClient } from '@clerk/backend';
import { prisma } from '../lib/prisma';

const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

async function getClerkId(req: VercelRequest): Promise<string | null> {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return null;
  try {
    const payload = await clerk.verifyToken(token);
    return payload.sub;
  } catch {
    return null;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const clerkId = await getClerkId(req);
  if (!clerkId) return res.status(401).json({ error: 'Unauthorized' });

  const { categories, difficulties, companies, limit = '15' } = req.query;

  try {
    const where: any = { isActive: true };

    if (categories) {
      const cats = String(categories).split(',').filter(Boolean);
      if (cats.length > 0) where.category = { in: cats };
    }

    if (difficulties) {
      const diffs = String(difficulties).split(',').filter(Boolean);
      if (diffs.length > 0) where.difficulty = { in: diffs };
    }

    if (companies) {
      const comps = String(companies).split(',').filter(Boolean);
      if (comps.length > 0) {
        where.companies = { hasSome: comps };
      }
    }

    // Fetch more than needed then shuffle for randomness
    const total = await prisma.question.count({ where });
    const take = Math.min(total, parseInt(String(limit)) * 3);
    const skip = total > take ? Math.floor(Math.random() * (total - take)) : 0;

    const questions = await prisma.question.findMany({
      where,
      take,
      skip,
      select: {
        id: true,
        title: true,
        description: true,
        category: true,
        difficulty: true,
        companies: true,
        explanation: true,
        solution: true,
      },
    });

    // Shuffle and limit
    const shuffled = questions.sort(() => Math.random() - 0.5).slice(0, parseInt(String(limit)));

    return res.status(200).json({ questions: shuffled });
  } catch (error: any) {
    console.error('Questions fetch error:', error);
    return res.status(500).json({ error: error.message });
  }
}
