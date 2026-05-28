import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClerkClient } from '@clerk/backend';
import { prisma } from '../../lib/prisma';

const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

async function getUserFromRequest(req: VercelRequest) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return null;
  try {
    const payload = await clerk.verifyToken(token);
    return payload.sub; // clerkId
  } catch {
    return null;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const clerkId = await getUserFromRequest(req);
  if (!clerkId) return res.status(401).json({ error: 'Unauthorized' });

  const { email, username } = req.body;

  try {
    const user = await prisma.user.upsert({
      where: { clerkId },
      update: {},
      create: { clerkId, email: email || '', username: username || null },
    });
    return res.status(200).json({ user });
  } catch (error: any) {
    console.error('Sync error:', error);
    return res.status(500).json({ error: error.message });
  }
}
