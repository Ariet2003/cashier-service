import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // Получаем куки асинхронно
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session');

    if (!sessionCookie) {
      return NextResponse.json({ isAuthenticated: false }, { status: 401 });
    }

    // Парсим данные сессии
    const sessionData = JSON.parse(sessionCookie.value);

    // Проверяем наличие необходимых данных
    if (!sessionData.userId || !sessionData.shiftId) {
      return NextResponse.json({ isAuthenticated: false }, { status: 401 });
    }

    // Проверяем существование пользователя и его активность
    const user = await prisma.user.findFirst({
      where: {
        id: sessionData.userId,
        isActive: true,
        role: 'CASHIER',
      },
    });

    if (!user) {
      return NextResponse.json({ isAuthenticated: false }, { status: 401 });
    }

    // Проверяем активность смены
    const shift = await prisma.shift.findFirst({
      where: {
        id: sessionData.shiftId,
        isActive: true,
      },
    });

    if (!shift) {
      return NextResponse.json({ isAuthenticated: false }, { status: 401 });
    }

    // Проверяем назначение на смену
    const shiftStaff = await prisma.shiftStaff.findFirst({
      where: {
        userId: sessionData.userId,
        shiftId: sessionData.shiftId,
      },
    });

    if (!shiftStaff) {
      return NextResponse.json({ isAuthenticated: false }, { status: 401 });
    }

    // Если все проверки пройдены, возвращаем успешный ответ
    return NextResponse.json({
      isAuthenticated: true,
      user: {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        role: user.role,
      },
      shift: {
        id: shift.id,
        startedAt: shift.startedAt,
      },
    });

  } catch (error) {
    console.error('Ошибка проверки сессии:', error);
    return NextResponse.json({ isAuthenticated: false }, { status: 401 });
  }
} 