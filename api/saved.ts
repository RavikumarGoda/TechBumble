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
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const clerkId = await getClerkId(req);
  if (!clerkId) return res.status(401).json({ error: 'Unauthorized' });

  const user = await prisma.user.findUnique({ where: { clerkId } });
  if (!user) return res.status(404).json({ error: 'User not found' });

  // GET — fetch all saved questions
  if (req.method === 'GET') {
    const saved = await prisma.savedQuestion.findMany({
      where: { userId: user.id },
      include: { question: true },
      orderBy: { savedAt: 'desc' },
    });
    return res.status(200).json({ saved });
  }

  // POST — save a question
  if (req.method === 'POST') {
    const { questionId } = req.body;
    if (!questionId) return res.status(400).json({ error: 'questionId required' });

    try {
      const saved = await prisma.savedQuestion.create({
        data: { userId: user.id, questionId },
        include: { question: true },
      });
      return res.status(201).json({ saved });
    } catch (e: any) {
      if (e.code === 'P2002') return res.status(200).json({ ok: true, alreadySaved: true });
      throw e;
    }
  }

  // DELETE — remove a saved question
  if (req.method === 'DELETE') {
    const { id } = req.query;
    if (!id) return res.status(400).json({ error: 'id required' });

    await prisma.savedQuestion.deleteMany({
      where: { id: String(id), userId: user.id },
    });
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
