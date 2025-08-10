export const dynamic = 'force-dynamic';

import prisma from '@/lib/prisma';
import ShopList from '../components/ShopList';

export default async function HomePage() {
  const shops = await prisma.shop.findMany({
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      items: {
        select: {
          updatedById: true,
        },
      },
    },
  });

  const shopsWithContributorCount = shops.map(shop => {
    const uniqueContributors = new Set<string>();
    shop.items.forEach(item => {
      if (item.updatedById) {
        uniqueContributors.add(item.updatedById);
      }
    });
    return {
      ...shop,
      contributorCount: uniqueContributors.size,
    };
  });

  return (
    <ShopList initialShops={shopsWithContributorCount} />
  );
}