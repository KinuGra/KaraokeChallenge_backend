require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { PrismaClient } = require("@prisma/client");

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// ヘルスチェック
app.get("/ping", (req, res) => {
    res.json({ message: "pong" });
});

// ランダムなお題を返す
app.get("/prompts/random", async (req, res) => {
    try {
        const rows = await prisma.$queryRawUnsafe(
            "SELECT id, content FROM Prompt ORDER BY RANDOM() LIMIT 1",
        );
        if (!rows || rows.length === 0) {
            return res.status(404).json({ error: "No prompts yet" });
        }
        res.json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// 全件取得
app.get("/prompts", async (req, res) => {
    const list = await prisma.prompt.findMany({
        orderBy: { id: "asc" },
        select: { id: true, content: true },
    });
    res.json(list);
});

// 追加API
app.post("/prompts", async (req, res) => {
    const { content } = req.body;
    if (!content) return res.status(400).json({ error: "content required" });

    try {
        const created = await prisma.prompt.create({
            data: { content },
            select: { id: true, content: true },
        });
        res.status(201).json(created);
    } catch (e) {
        res.status(400).json({ error: "failed to create prompt" });
    }
});

// POST /scores
// body: { promptId: number, score: number }
app.post("/scores", async (req, res) => {
    try {
        const { promptId, score } = req.body ?? {};

        // 入力検証
        if (!Number.isInteger(promptId)) {
            return res.status(400).json({ error: "promptId must be integer" });
        }
        if (!Number.isInteger(score) || score < 0 || score > 100) {
            return res
                .status(400)
                .json({ error: "score must be integer in [0,100]" });
        }

        // お題の存在確認（任意だがUX向上のため推奨）
        const prompt = await prisma.prompt.findUnique({
            where: { id: promptId },
            select: { id: true },
        });
        if (!prompt) {
            return res.status(404).json({ error: "Prompt not found" });
        }

        // 保存
        await prisma.score.create({
            data: { promptId, score },
        });

        // 統計（平均・件数・最小/最大）を再計算
        const stats = await prisma.score.aggregate({
            where: { promptId },
            _avg: { score: true },
            _min: { score: true },
            _max: { score: true },
            _count: { _all: true }, // Prisma 6系でも安定
        });

        const avg = stats._avg.score ?? 0;
        const count = stats._count._all;

        return res.json({
            ok: true,
            promptId,
            yourScore: score,
            stats: {
                count,
                avg: Number(avg.toFixed(1)), // 小数1桁に整形（必要に応じて変更）
                min: stats._min.score,
                max: stats._max.score,
            },
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

app.listen(PORT, "0.0.0.0", () => {
    console.log(`✅ Server running at http://localhost:${PORT}`);
});
