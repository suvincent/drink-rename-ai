import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log(`Start seeding ...`);

  // Create a sample shop and its menu items
  const shop = await prisma.shop.upsert({
    where: { name: '可不可熟成紅茶' },
    update: {},
    create: {
      name: '可不可熟成紅茶',
      items: {
        create: [
          { originalName: '熟成紅茶', newName: '熟成紅茶', price: 35.0, description: '經典紅茶，茶味濃郁' },
          { originalName: '麗春紅茶', newName: '麗春紅茶', price: 40.0, description: '清香紅茶，帶有花果香' },
          { originalName: '太妃紅茶', newName: '太妃紅茶', price: 50.0, description: '獨特太妃糖風味紅茶' },
          { originalName: '熟成歐蕾', newName: '熟成歐蕾', price: 55.0, description: '熟成紅茶與鮮奶的完美結合' },
          { originalName: '白玉歐蕾', newName: '白玉歐蕾', price: 60.0, description: '熟成歐蕾加上Q彈白玉珍珠' },
          { originalName: '冷露歐蕾', newName: '冷露歐蕾', price: 65.0, description: '冬瓜茶與鮮奶的清爽組合' },
        ],
      },
    },
    include: {
        items: true,
    }
  });

  console.log(`Seeding finished for shop: ${shop.name}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });