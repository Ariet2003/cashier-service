import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    // Получаем и проверяем id заказа
    const { id } = await Promise.resolve(params);
    const orderId = parseInt(id);

    if (isNaN(orderId)) {
      return NextResponse.json({ error: 'Неверный ID заказа' }, { status: 400 });
    }

    // Получаем детальную информацию о заказе
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        status: 'PAID',
      },
      include: {
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
        payments: {
          select: {
            amount: true,
            paymentType: true,
            paidAt: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Заказ не найден' }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error('Error fetching order details:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 