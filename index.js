require('dotenv').config()
const express = require('express')
const cors = require('cors')
const { PrismaClient } = require('@prisma/client')

const app = express()
const prisma = new PrismaClient()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

// ヘルスチェック
app.get('/ping', (req, res) => {
  res.json({ message: 'pong' })
})

// ランダムなお題を返す
app.get('/prompts/random', async (req, res) => {
  try {
    const rows = await prisma.$queryRawUnsafe(
      'SELECT id, content FROM Prompt ORDER BY RANDOM() LIMIT 1'
    )
    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: 'No prompts yet' })
    }
    res.json(rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Internal Server Error' })
  }
})

// 全件取得
app.get('/prompts', async (req, res) => {
  const list = await prisma.prompt.findMany({
    orderBy: { id: 'asc' },
    select: { id: true, content: true }
  })
  res.json(list)
})

// 追加API
app.post('/prompts', async (req, res) => {
  const { content } = req.body
  if (!content) return res.status(400).json({ error: 'content required' })

  try {
    const created = await prisma.prompt.create({
      data: { content },
      select: { id: true, content: true }
    })
    res.status(201).json(created)
  } catch (e) {
    res.status(400).json({ error: 'failed to create prompt' })
  }
})

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running at http://localhost:${PORT}`)
})
