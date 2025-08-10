import prisma from '@/lib/prisma';
import ShopList from '../components/ShopList';

export default async function HomePage() {
  const shops = await prisma.shop.findMany({
    orderBy: {
      createdAt: 'desc',
    },
  });

  return (
    <ShopList initialShops={shops} />
  );
}
