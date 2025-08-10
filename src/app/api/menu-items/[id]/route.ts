import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import prisma from '@/lib/prisma';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const id = parseInt(params.id, 10);

  if (isNaN(id)) {
    return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { originalName, newName, price, description } = body;

    const updatedMenuItem = await prisma.menuItem.update({
      where: { id },
      data: {
        originalName,
        newName,
        price,
        description,
        updatedById: session.user.id,
      },
    });

    return NextResponse.json(updatedMenuItem);
  } catch (error) {
    console.error('Failed to update menu item:', error);
    return NextResponse.json({ error: 'Failed to update menu item' }, { status: 500 });
  }
}
