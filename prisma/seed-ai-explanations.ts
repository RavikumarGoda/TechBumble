import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
dotenv.config();

import { aiExplanations } from './data/ai-explanations.js';
import { aiExplanations2 } from './data/ai-exp-batch1.js';
import { aiExpBatch2 } from './data/ai-exp-batch2.js';
import { aiExpBatch3 } from './data/ai-exp-batch3.js';
import { aiExpBatch4 } from './data/ai-exp-batch4.js';

const ALL_EXPLANATIONS: Record<string, string> = {
  ...aiExplanations,
  ...aiExplanations2,
  ...aiExpBatch2,
  ...aiExpBatch3,
  ...aiExpBatch4,
};

const prisma = new PrismaClient();

async function main() {
  console.log('🧠 Seeding aiExplanation column...\n');

  const questions = await prisma.question.findMany({ select: { id: true, title: true } });
  let updated = 0, skipped = 0;

  for (const q of questions) {
    const aiExp = ALL_EXPLANATIONS[q.title];
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
