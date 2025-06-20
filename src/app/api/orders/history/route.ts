import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { startOfDay, endOfDay } from 'date-fns';

export async function GET() {
  try {
    // Получаем куки асинхронно
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session');

    if (!sessionCookie) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    // Парсим данные сессии
    const sessionData = JSON.parse(sessionCookie.value);

    // Проверяем наличие необходимых данных
    if (!sessionData.userId || !sessionData.shiftId) {
      return NextResponse.json({ error: 'Некорректные данные сессии' }, { status: 401 });
    }

    // Получаем начало и конец текущего дня
    const today = new Date();
    const startOfToday = startOfDay(today);
    const endOfToday = endOfDay(today);

    // Получаем только оплаченные заказы за сегодня с минимальной информацией
    const orders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: startOfToday,
          lte: endOfToday,
        },
        status: 'PAID', // Только оплаченные заказы
      },
      select: {
        id: true,
        tableNumber: true,
        totalPrice: true,
        createdAt: true,
        paidAt: true,
        waiter: {
          select: {
            fullName: true,
          },
        },
        cashier: {
          select: {
            fullName: true,
          },
        },
        payments: {
          select: {
            paymentType: true,
          },
        },
        _count: {
          select: {
            items: true,
          },
        },
      },
      orderBy: {
        paidAt: 'desc', // Сортировка по времени оплаты
      },
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error('Error fetching order history:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 