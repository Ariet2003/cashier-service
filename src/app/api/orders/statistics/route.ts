import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, eachWeekOfInterval, eachMonthOfInterval, format } from 'date-fns';
import { ru } from 'date-fns/locale';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const period = searchParams.get('period') || 'day';

  let dateFrom: Date, dateTo: Date;
  const now = new Date();

  if (period === 'week') {
    dateFrom = startOfWeek(now, { weekStartsOn: 1 });
    dateTo = endOfWeek(now, { weekStartsOn: 1 });
  } else if (period === 'month') {
    dateFrom = startOfMonth(now);
    dateTo = endOfMonth(now);
  } else {
    dateFrom = startOfDay(now);
    dateTo = endOfDay(now);
  }

  // Основные метрики
  const [totalOrders, paidOrders, cancelledOrders, openOrders, totalRevenue] = await Promise.all([
    prisma.order.count({
      where: { createdAt: { gte: dateFrom, lte: dateTo } },
    }),
    prisma.order.count({
      where: { status: 'PAID', paidAt: { gte: dateFrom, lte: dateTo } },
    }),
    prisma.order.count({
      where: { status: 'CANCELLED', createdAt: { gte: dateFrom, lte: dateTo } },
    }),
    prisma.order.count({
      where: { status: 'OPEN', createdAt: { gte: dateFrom, lte: dateTo } },
    }),
    prisma.order.aggregate({
      _sum: { totalPrice: true },
      where: { status: 'PAID', paidAt: { gte: dateFrom, lte: dateTo } },
    }).then(res => res._sum.totalPrice || 0),
  ]);

  // Динамика заказов
  let chartData: { label: string, value: number }[] = [];
  if (period === 'week') {
    const days = eachDayOfInterval({ start: dateFrom, end: dateTo });
    const ordersByDay = await prisma.order.groupBy({
      by: ['createdAt'],
      where: { createdAt: { gte: dateFrom, lte: dateTo } },
      _count: { _all: true },
    });
    chartData = days.map(day => {
      const label = format(day, 'EEE', { locale: ru });
      const count = ordersByDay.filter(o => format(o.createdAt, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')).reduce((acc, o) => acc + o._count._all, 0);
      return { label, value: count };
    });
  } else if (period === 'month') {
    const weeks = eachWeekOfInterval({ start: dateFrom, end: dateTo }, { weekStartsOn: 1 });
    const ordersByWeek = await prisma.order.findMany({
      where: { createdAt: { gte: dateFrom, lte: dateTo } },
      select: { createdAt: true },
    });
    chartData = weeks.map((weekStart, idx) => {
      const weekEnd = idx < weeks.length - 1 ? weeks[idx + 1] : endOfMonth(now);
      const label = `${format(weekStart, 'd MMM', { locale: ru })}`;
      const count = ordersByWeek.filter(o => o.createdAt >= weekStart && o.createdAt < weekEnd).length;
      return { label, value: count };
    });
  } else {
    // day
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const ordersByHour = await prisma.order.groupBy({
      by: ['createdAt'],
      where: { createdAt: { gte: dateFrom, lte: dateTo } },
      _count: { _all: true },
    });
    chartData = hours.map(hour => {
      const label = `${hour}:00`;
      const count = ordersByHour.filter(o => new Date(o.createdAt).getHours() === hour).reduce((acc, o) => acc + o._count._all, 0);
      return { label, value: count };
    });
  }

  return NextResponse.json({
    totalOrders,
    paidOrders,
    cancelledOrders,
    openOrders,
    totalRevenue,
    chartData,
  });
} 