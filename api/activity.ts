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
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const clerkId = await getClerkId(req);
  if (!clerkId) return res.status(401).json({ error: 'Unauthorized' });

  const user = await prisma.user.findUnique({ where: { clerkId } });
  if (!user) return res.status(404).json({ error: 'User not found' });

  if (req.method === 'GET') {
    // Return last 365 days of activity for the heatmap
    const since = new Date();
    since.setFullYear(since.getFullYear() - 1);
    const logs = await prisma.userActivity.findMany({
      where: { userId: user.id, activityDate: { gte: since } },
      orderBy: { activityDate: 'asc' },
    });
    return res.status(200).json({ activity: logs });
  }

  if (req.method === 'POST') {
    const { questionsSwiped = 0, questionsSolved = 0 } = req.body;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Upsert today's activity
    await prisma.userActivity.upsert({
      where: { userId_activityDate: { userId: user.id, activityDate: today } },
      update: {
        questionsSwiped: { increment: questionsSwiped },
        questionsSolved: { increment: questionsSolved },
      },
      create: {
        userId: user.id,
        activityDate: today,
        questionsSwiped,
        questionsSolved,
      },
    });

    // Update profile totals + streak
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const lastDate = user.lastActivityDate;
    const isConsecutive = lastDate
      ? new Date(lastDate).toDateString() === yesterday.toDateString()
      : false;
    const isAlreadyToday = lastDate
      ? new Date(lastDate).toDateString() === today.toDateString()
      : false;

    let newStreak = user.currentStreak;
    if (!isAlreadyToday) {
      newStreak = isConsecutive ? user.currentStreak + 1 : 1;
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        totalQuestionsSwiped: { increment: questionsSwiped },
        currentStreak: newStreak,
        longestStreak: Math.max(user.longestStreak, newStreak),
        lastActivityDate: isAlreadyToday ? undefined : today,
      },
    });

    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
