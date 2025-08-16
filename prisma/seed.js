const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
    await prisma.prompt.createMany({
        data: [
            { content: "1オクターブ上で歌おう！" },
            { content: "1オクターブ下で歌おう！" },
            { content: "1曲でビブラートを20回以上出そう！" },
            { content: "1曲でこぶしを10回以上出そう！" },
            { content: "80点～83点の間を狙おう！" },
        ],
    });
}

main()
    .then(() => console.log("✅ Seed completed"))
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => await prisma.$disconnect());
