import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
dotenv.config();

import { dsaEasy } from './data/dsa-easy.js';
import { dsaMedium } from './data/dsa-medium.js';
import { dsaHard } from './data/dsa-hard.js';
import { systemDesign } from './data/system-design.js';
import { hrAndCompany } from './data/hr-company.js';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 TechBumble Hardcoded Seed\n');

  const existing = await prisma.question.count();
  console.log(`📊 Current count: ${existing}\n`);

  const allQuestions = await prisma.question.findMany({ select: { title: true } });
  const existingTitles = new Set(allQuestions.map(q => q.title));

  const allData = [
    ...dsaEasy,
    ...dsaMedium,
    ...dsaHard,
    ...systemDesign,
    ...hrAndCompany,
  ];

  let inserted = 0, skipped = 0;

  for (const q of allData) {
    if (existingTitles.has(q.title)) {
      skipped++;
      continue;
    }
    try {
      await prisma.question.create({
        data: {
          title: q.title,
          description: q.description,
          explanation: q.explanation,
          solution: q.solution,
          category: q.category,
          difficulty: q.difficulty,
          companies: q.companies ?? [],
          isActive: true,
        },
      });
      inserted++;
      existingTitles.add(q.title);
      process.stdout.write(`\r   ✅ Inserted: ${inserted} | Skipped: ${skipped}`);
    } catch (e: any) {
      if (e.code !== 'P2002') console.error(`\n   ⚠️  Failed "${q.title}": ${e.message}`);
      else skipped++;
    }
  }

  const finalCount = await prisma.question.count();
  console.log(`\n\n🎉 Done! Total questions in DB: ${finalCount}`);
  console.log(`   Inserted: ${inserted} new | Skipped: ${skipped} duplicates\n`);
}

main()
  .catch(err => { console.error('❌ Seed error:', err); process.exit(1); })
  .finally(() => prisma.$disconnect());
