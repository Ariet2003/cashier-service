"use client";
import { useEffect, useState } from "react";
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";
import { ru } from "date-fns/locale";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar
} from "recharts";
import { useRouter } from "next/navigation";

const PERIODS = [
  { value: "day", label: "День" },
  { value: "week", label: "Неделя" },
  { value: "month", label: "Месяц" },
];

function getPeriodRange(period: string) {
  const now = new Date();
  if (period === "week") {
    return {
      from: startOfWeek(now, { weekStartsOn: 1 }),
      to: endOfWeek(now, { weekStartsOn: 1 })
    };
  }
  if (period === "month") {
    return {
      from: startOfMonth(now),
      to: endOfMonth(now)
    };
  }
  // day
  return {
    from: startOfDay(now),
    to: endOfDay(now)
  };
}

export default function StatisticsPage() {
  const [period, setPeriod] = useState("day");
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const { from, to } = getPeriodRange(period);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/orders/statistics?period=${period}`)
      .then((res) => res.json())
      .then((data) => setStats(data))
      .finally(() => setLoading(false));
  }, [period]);

  return (
    <div className="bg-gray-50 min-h-screen w-full">
      <div className="max-w-5xl mx-auto p-8 pb-24">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4 md:gap-0">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Статистика</h1>
          </div>
          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 w-full md:w-auto">
            <select
              value={period}
              onChange={e => setPeriod(e.target.value)}
              className="text-sm rounded-lg border border-gray-200 px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-200 w-full md:w-auto mb-0"
            >
              {PERIODS.map(p => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="mb-6">
          <div className="text-sm text-gray-500">
            {period === 'day' ? (
              format(from, 'd MMMM yyyy', { locale: ru })
            ) : (
              <>
                {format(from, 'd MMMM yyyy', { locale: ru })} — {format(to, 'd MMMM yyyy', { locale: ru })}
              </>
            )}
          </div>
        </div>
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600"></div>
          </div>
        ) : stats ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              <div className="bg-white rounded-xl shadow-sm p-4 flex flex-col items-center">
                <div className="text-xs text-gray-500 mb-1">Всего заказов</div>
                <div className="text-2xl font-bold text-gray-900">{stats.totalOrders}</div>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-4 flex flex-col items-center">
                <div className="text-xs text-gray-500 mb-1">Выручка</div>
                <div className="text-2xl font-bold text-green-600">{stats.totalRevenue?.toLocaleString('ru-RU')} сом</div>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-4 flex flex-col items-center">
                <div className="text-xs text-gray-500 mb-1">Оплачено</div>
                <div className="text-2xl font-bold text-purple-600">{stats.paidOrders}</div>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-4 flex flex-col items-center">
                <div className="text-xs text-gray-500 mb-1">Отменено</div>
                <div className="text-2xl font-bold text-red-500">{stats.cancelledOrders}</div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
              <div className="text-sm font-medium mb-2">Динамика заказов</div>
              <div className="h-64">
                {stats.chartData && stats.chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    {period === 'day' ? (
                      <LineChart data={stats.chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="label" fontSize={12} tick={{ fill: '#888' }} />
                        <YAxis allowDecimals={false} fontSize={12} tick={{ fill: '#888' }} />
                        <Tooltip formatter={(v) => `${v} заказов`} />
                        <Line type="monotone" dataKey="value" stroke="#a78bfa" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                      </LineChart>
                    ) : (
                      <BarChart data={stats.chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="label" fontSize={12} tick={{ fill: '#888' }} />
                        <YAxis allowDecimals={false} fontSize={12} tick={{ fill: '#888' }} />
                        <Tooltip formatter={(v) => `${v} заказов`} />
                        <Bar dataKey="value" fill="#a78bfa" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    )}
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">Нет данных для отображения</div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="text-center text-gray-500">Нет данных</div>
        )}
      </div>
    </div>
  );
} 