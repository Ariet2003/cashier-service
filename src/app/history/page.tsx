'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import React from 'react';

interface MenuItem {
  name: string;
  category: {
    name: string;
  } | null;
}

interface OrderItem {
  quantity: number;
  price: number;
  menuItem: MenuItem;
}

interface Payment {
  amount: number;
  paymentType: 'CASH' | 'CARD' | 'QR' | 'OTHER';
  paidAt: string;
}

interface Order {
  id: number;
  tableNumber: string;
  totalPrice: number;
  createdAt: string;
  paidAt: string;
  waiter: {
    fullName: string;
  };
  cashier: {
    fullName: string;
  };
  payments: {
    paymentType: string;
  }[];
  _count: {
    items: number;
  };
}

interface OrderDetails extends Omit<Order, 'payments' | '_count'> {
  items: OrderItem[];
  payments: Payment[];
}

export default function History() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sort, setSort] = useState<'date_desc' | 'date_asc' | 'sum_desc' | 'sum_asc'>('date_desc');
  const router = useRouter();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch('/api/orders/history');
        if (!response.ok) {
          throw new Error('Ошибка получения истории заказов');
        }
        const data = await response.json();
        setOrders(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Произошла ошибка');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const fetchOrderDetails = async (orderId: number) => {
    try {
      const response = await fetch(`/api/orders/history/${orderId}`);
      if (!response.ok) {
        throw new Error('Ошибка получения деталей заказа');
      }
      const data = await response.json();
      setSelectedOrder(data);
    } catch (err) {
      console.error('Ошибка:', err);
    }
  };

  const getPaymentTypeLabel = (type: string) => {
    const types = {
      CASH: 'Наличные',
      CARD: 'Карта',
      QR: 'QR-код',
      OTHER: 'Другое'
    };
    return types[type as keyof typeof types] || type;
  };

  // Сортировка заказов
  const sortedOrders = React.useMemo(() => {
    const arr = [...orders];
    switch (sort) {
      case 'date_asc':
        return arr.sort((a, b) => new Date(a.paidAt).getTime() - new Date(b.paidAt).getTime());
      case 'sum_desc':
        return arr.sort((a, b) => b.totalPrice - a.totalPrice);
      case 'sum_asc':
        return arr.sort((a, b) => a.totalPrice - b.totalPrice);
      default:
        // date_desc
        return arr.sort((a, b) => new Date(b.paidAt).getTime() - new Date(a.paidAt).getTime());
    }
  }, [orders, sort]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8 pb-24">
      <div className="max-w-7xl mx-auto">
        {/* Заголовок */}
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
            <h1 className="text-2xl font-bold text-gray-900">История</h1>
          </div>
          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 w-full md:w-auto">
            <select
              value={sort}
              onChange={e => setSort(e.target.value as any)}
              className="text-sm rounded-lg border border-gray-200 px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-200 w-full md:w-auto mb-2 md:mb-0"
            >
              <option value="date_desc">Сначала новые</option>
              <option value="date_asc">Сначала старые</option>
              <option value="sum_desc">Сумма ↓</option>
              <option value="sum_asc">Сумма ↑</option>
            </select>
            <div className="text-sm text-gray-500 md:ml-2">
              {format(new Date(), 'd MMMM yyyy', { locale: ru })}
            </div>
          </div>
        </div>

        {/* Список заказов */}
        <div className="grid gap-2 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {sortedOrders.length === 0 ? (
            <div className="col-span-full bg-white rounded-xl shadow-sm p-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-gray-500 text-lg">Нет оплаченных заказов за сегодня</p>
            </div>
          ) : (
            sortedOrders.map((order) => (
              <div
                key={order.id}
                onClick={() => fetchOrderDetails(order.id)}
                className="group bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-150 cursor-pointer border border-gray-100 p-2 flex flex-col gap-1 min-h-0"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-base font-semibold text-gray-900">#{order.id}</span>
                  <span className="text-xs text-gray-400">{format(new Date(order.paidAt), 'HH:mm', { locale: ru })}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Стол {order.tableNumber}</span>
                  <span className="text-base font-bold text-purple-600">{order.totalPrice.toLocaleString('ru-RU')} сом</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Модальное окно с деталями заказа */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50">
          {/* Затемнённый фон */}
          <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm" onClick={() => setSelectedOrder(null)} />
          {/* Модальное окно */}
          <div className="relative min-h-screen flex items-center justify-center p-2">
            <div className="relative w-full max-w-2xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden animate-fade-in">
              {/* Градиентная шапка */}
              <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="bg-white/20 rounded-lg p-2">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-white/70 text-sm font-medium">Заказ</div>
                      <div className="text-white text-lg font-semibold">#{selectedOrder.id}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="bg-white/10 px-3 py-1 rounded-full">
                      <div className="text-white/70 text-sm">Стол</div>
                      <div className="text-white font-medium text-center">{selectedOrder.tableNumber}</div>
                    </div>
                    <button
                      onClick={() => setSelectedOrder(null)}
                      className="rounded-full p-2 hover:bg-white/10 transition-colors"
                    >
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
              {/* Контент */}
              <div className="px-6 py-6 max-h-[calc(90vh-7rem)] overflow-y-auto">
                {/* Информация о заказе */}
                <div className="grid grid-cols-2 gap-6 mb-8">
                  <div className="bg-gray-50 rounded-xl p-4 flex items-center space-x-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Официант</div>
                      <div className="font-medium text-gray-900">{selectedOrder.waiter.fullName}</div>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 flex items-center space-x-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Время оплаты</div>
                      <div className="font-medium text-gray-900">
                        {format(new Date(selectedOrder.paidAt), 'dd.MM.yyyy HH:mm', { locale: ru })}
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 flex items-center space-x-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Кассир</div>
                      <div className="font-medium text-gray-900">{selectedOrder.cashier.fullName}</div>
                    </div>
                  </div>
                </div>
                {/* Состав заказа */}
                <div className="mb-8">
                  <h4 className="text-lg font-semibold mb-3 text-gray-900">Состав заказа</h4>
                  <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-purple-200 scrollbar-track-gray-50 hover:scrollbar-thumb-purple-300">
                    {selectedOrder.items.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
                      >
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{item.menuItem.name}</div>
                          {item.menuItem.category && (
                            <div className="text-sm text-gray-500">
                              {item.menuItem.category.name}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center space-x-6">
                          <div className="px-2.5 py-1 bg-purple-100 text-purple-700 rounded-lg font-medium">
                            ×{item.quantity}
                          </div>
                          <div className="w-24 text-right font-medium text-gray-900">
                            {item.price.toLocaleString('ru-RU')} сом
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Оплата и итог */}
                <div className="bg-purple-50 rounded-xl p-4 flex flex-col gap-2 mb-6">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-medium text-purple-900">Итого:</span>
                    <span className="text-xl font-bold text-purple-700">{selectedOrder.totalPrice.toLocaleString('ru-RU')} сом</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedOrder.payments.map((payment, idx) => (
                      <span key={idx} className="inline-flex items-center px-3 py-1 bg-white text-purple-700 rounded-lg text-sm font-medium border border-purple-100">
                        {getPaymentTypeLabel(payment.paymentType)}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 