// prisma/seed.js
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// あなたの既存データ（createManyを壊さない）
const PROMPTS = [
  { content: "1オクターブ上で歌おう！" },
  { content: "1オクターブ下で歌おう！" },
  { content: "1曲でビブラートを20回以上出そう！" },
  { content: "1曲でこぶしを10回以上出そう！" },
  { content: "80点～83点の間を狙おう！" },
];

// ★ ここがポイント：使うスコアはこの4種類のみ
const SCORE_VALUES = [90, 70, 50, 10];

// 1つのお題につき、各スコアを何件ずつ入れるか（合計 = 4 × COUNT_PER_SCORE）
const COUNT_PER_SCORE = 5; // 例：各5件 → 1お題あたり20件

async function ensurePrompts() {
  // まずはあなたの createMany をそのまま実行（壊さない）
  try {
    await prisma.prompt.createMany({ data: PROMPTS });
  } catch (e) {
    // Prisma 6系だとskipDuplicatesが無いので、重複時にupsertへフォールバック
    if (e.code === "P2002") {
      console.warn("[seed] Duplicate prompts detected. Fallback to upsert.");
      for (const { content } of PROMPTS) {
        await prisma.prompt.upsert({
          where: { content },
          update: {},
          create: { content },
        });
      }
    } else {
      throw e;
    }
  }

  // ID取得
  return prisma.prompt.findMany({
    select: { id: true, content: true },
    orderBy: { id: "asc" },
  });
}

function buildScoresForPrompt(promptId) {
  const rows = [];
  for (const value of SCORE_VALUES) {
    for (let i = 0; i < COUNT_PER_SCORE; i++) {
      rows.push({ promptId, score: value });
    }
  }
  return rows;
}

async function seedScoresForPrompts(prompts) {
  // お題に紐づく既存スコアを削除してから入れ直す（毎回同じ状態を再現）
  const promptIds = prompts.map((p) => p.id);

  await prisma.score.deleteMany({
    where: { promptId: { in: promptIds } },
  });

  let total = 0;
  for (const p of prompts) {
    const data = buildScoresForPrompt(p.id);
    if (data.length > 0) {
      await prisma.score.createMany({ data });
      total += data.length;
    }
  }
  return total;
}

async function main() {
  console.log("Seeding prompts…");
  const prompts = await ensurePrompts();
  console.log(`→ ${prompts.length} prompts ready`);

  // Score テーブルが無い環境でも seed 全体が落ちないように try/catch
  try {
    console.log("Seeding scores (only 90/70/50/10)…");
    const inserted = await seedScoresForPrompts(prompts);
    console.log(`✅ Scores inserted: ${inserted} rows`);
  } catch (e) {
    console.warn(
      "[seed] Skipped score seeding (maybe Score table not found).",
      e.code || e.message
    );
  }
}

main()
  .then(() => console.log("🎉 Seed completed"))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
