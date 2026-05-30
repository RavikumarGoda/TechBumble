import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
dotenv.config();

import { aiExplanations } from './data/ai-explanations.js';

const prisma = new PrismaClient();

async function main() {
  console.log('🧠 Seeding aiExplanation column...\n');

  const questions = await prisma.question.findMany({ select: { id: true, title: true } });
  let updated = 0, skipped = 0;

  for (const q of questions) {
    const aiExp = aiExplanations[q.title];
    if (!aiExp) { skipped++; continue; }

    await prisma.question.update({
      where: { id: q.id },
      data: { aiExplanation: aiExp },
    });
    updated++;
    process.stdout.write(`\r   ✅ Updated: ${updated} | No entry: ${skipped}`);
  }

  console.log(`\n\n🎉 Done! ${updated} questions now have aiExplanation.`);
  console.log(`   ${skipped} questions have no entry in ai-explanations.ts yet.\n`);
}

main()
  .catch(err => { console.error('❌', err); process.exit(1); })
  .finally(() => prisma.$disconnect());
