import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const { login, password } = await request.json();

    // 1. Проверяем существование активного кассира
    const user = await prisma.user.findFirst({
      where: {
        username: login,
        isActive: true,
        role: 'CASHIER',
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Пользователь не найден или не является активным кассиром' },
        { status: 401 }
      );
    }

    // Проверяем пароль
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Неверный пароль' },
        { status: 401 }
      );
    }

    // 2. Проверяем наличие активной смены
    const activeShift = await prisma.shift.findFirst({
      where: {
        isActive: true,
      },
    });

    if (!activeShift) {
      return NextResponse.json(
        { error: 'Нет активной смены' },
        { status: 403 }
      );
    }

    // 3. Проверяем, что кассир назначен на активную смену
    const shiftStaff = await prisma.shiftStaff.findFirst({
      where: {
        userId: user.id,
        shiftId: activeShift.id,
      },
    });

    if (!shiftStaff) {
      return NextResponse.json(
        { error: 'Вы не назначены на текущую смену' },
        { status: 403 }
      );
    }

    // Создаем объект с данными сессии
    const sessionData = {
      userId: user.id,
      username: user.username,
      fullName: user.fullName,
      role: user.role,
      shiftId: activeShift.id,
    };

    // Создаем ответ
    const response = NextResponse.json({
      user: {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        role: user.role,
      },
      shift: {
        id: activeShift.id,
        startedAt: activeShift.startedAt,
      },
    });

    // Устанавливаем куки в ответ
    await Promise.resolve(response.cookies.set('session', JSON.stringify(sessionData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60, // 24 часов
      path: '/',
    }));

    return response;

  } catch (error) {
    console.error('Ошибка авторизации:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
} 