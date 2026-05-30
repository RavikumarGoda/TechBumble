import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

async function main() {
  const missing = await prisma.question.findMany({
    where: { aiExplanation: null },
    select: { title: true, category: true, difficulty: true },
    orderBy: [{ category: 'asc' }, { difficulty: 'asc' }],
  });
  console.log(`Missing aiExplanation: ${missing.length} questions\n`);
  missing.forEach(q => console.log(`[${q.category}][${q.difficulty}] ${q.title}`));
}

main().finally(() => prisma.$disconnect());
