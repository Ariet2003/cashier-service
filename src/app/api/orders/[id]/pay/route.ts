import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  context: { params: { id: string } }
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

    // Получаем и проверяем параметры
    const { paymentType } = await request.json();
    const params = await context.params;
    const orderId = parseInt(params.id);

    if (isNaN(orderId)) {
      return NextResponse.json({ error: 'Неверный ID заказа' }, { status: 400 });
    }

    // Проверяем существование заказа
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return NextResponse.json({ error: 'Заказ не найден' }, { status: 404 });
    }

    if (order.status !== 'OPEN') {
      return NextResponse.json({ error: 'Заказ уже оплачен или отменен' }, { status: 400 });
    }

    // Обновляем заказ и создаем запись об оплате в транзакции
    const updatedOrder = await prisma.$transaction(async (tx) => {
      // Обновляем статус заказа
      const updated = await tx.order.update({
        where: { id: orderId },
        data: {
          status: 'PAID',
          paidAt: new Date(),
          cashierId: sessionData.userId,
        },
      });

      // Создаем запись об оплате
      await tx.payment.create({
        data: {
          order: { connect: { id: orderId } },
          amount: order.totalPrice,
          paymentType: paymentType,
          paidBy: { connect: { id: sessionData.userId } },
        },
      });

      return updated;
    });

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error('Ошибка при оплате заказа:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
} 