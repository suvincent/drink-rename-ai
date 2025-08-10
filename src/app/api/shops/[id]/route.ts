/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from "next-auth";
import { authOptions } from '@/lib/authOptions';

// GET handler to fetch a single shop with its items
export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const params = context.params;
    const shopId = parseInt((await params).id, 10);

    if (isNaN(shopId)) {
      return NextResponse.json({ message: 'Invalid shop ID' }, { status: 400 });
    }

    const shop = await prisma.shop.findUnique({
      where: { id: shopId },
      include: {
        items: {
          include: {
            updatedBy: true,
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });

    if (!shop) {
      return NextResponse.json({ message: 'Shop not found' }, { status: 404 });
    }

    return NextResponse.json(shop, { status: 200 });
  } catch (error: any) {
    console.error("API Error (GET shop by ID):", error);
    return NextResponse.json({ message: '伺服器發生錯誤' }, { status: 500 });
  }
}

// DELETE handler to delete a shop and its items
export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const params = context.params
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: "Unauthorized. Please log in." }, { status: 401 });
    }

    // Admin check
    const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(email => email.trim()) || [];
    if (!session.user.email || !adminEmails.includes(session.user.email)) {
      return NextResponse.json({ message: "Forbidden. You are not authorized to perform this action." }, { status: 403 });
    }

    const shopId = parseInt((await params).id, 10);

    if (isNaN(shopId)) {
      return NextResponse.json({ message: 'Invalid shop ID' }, { status: 400 });
    }

    // Delete all menu items associated with the shop first
    await prisma.menuItem.deleteMany({
      where: {
        shopId: shopId,
      },
    });

    // Then delete the shop itself
    await prisma.shop.delete({
      where: {
        id: shopId,
      },
    });

    return NextResponse.json({ message: 'Shop and its items deleted successfully' }, { status: 200 });
  } catch (error: any) {
    console.error("API Error (DELETE shop):", error);
    return NextResponse.json({ message: '伺服器發生錯誤' }, { status: 500 });
  }
}
