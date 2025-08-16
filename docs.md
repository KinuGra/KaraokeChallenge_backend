```
npm init -y
npm install express cors dotenv
npm i -D prisma nodemon
npx prisma init
npm i @prisma/client

// マイグレーション
npx prisma migrate dev --name init

// テストデータ挿入
npx prisma db seed

// Prisma Studioで中身を見る（port 5555を使用している場合）
npx prisma studio --port 5556

node server.js
```