プロジェクトをcloneせずに0から環境構築する場合はdocs.mdを参照

```
git clone ...
npm i
.envを作成
npx prisma migrate dev --name init（最初の1回だけでよい）
npx prisma db seed（最初の1回だけでよい）

// Prisma Studioで中身を見る（port 5555を使用している場合）
npx prisma studio --port 5556

npm run dev
```

.env
```
DATABASE_URL="file:./dev.db"
PORT=3000
```