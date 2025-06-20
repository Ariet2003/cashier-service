import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const openOrders = await prisma.order.findMany({
      where: {
        status: 'OPEN',
      },
      include: {
        waiter: {
          select: {
            fullName: true,
          },
        },
        items: {
          include: {
            menuItem: {
              select: {
                name: true,
                category: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(openOrders);
  } catch (error) {
    console.error('Ошибка получения заказов:', error);
    return NextResponse.json(
      { error: 'Ошибка получения списка заказов' },
      { status: 500 }
    );
  }
} 