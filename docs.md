```
npm init -y
npm install express cors dotenv
npm i -D prisma nodemon
npx prisma init
npm i @prisma/client

// prettier
npm i -D prettier
npx prettier --write .

// マイグレーション
npx prisma migrate dev --name init
npx prisma migrate dev --name add_score // model Scoreを追加後

// テストデータ挿入
npx prisma db seed

// Prisma Studioで中身を見る（port 5555を使用している場合）
npx prisma studio --port 5556

// 起動
node server.js
npm run dev
```
