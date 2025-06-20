'use client';

import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Order } from '@/types/order';

interface OrderModalProps {
  order: Order | null;
  onClose: () => void;
}

export default function OrderModal({ order, onClose }: OrderModalProps) {
  if (!order) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Заголовок */}
        <div className="bg-purple-600 px-6 py-4 text-white flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h3 className="text-xl font-semibold">Заказ #{order.id}</h3>
            <span className="bg-purple-500 px-3 py-1 rounded-full text-sm">
              Стол {order.tableNumber}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-purple-200 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-4rem)]">
          {/* Информация о заказе */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <div className="text-sm text-gray-500">Создан</div>
              <div className="font-medium">
                {format(new Date(order.createdAt), 'dd MMMM, HH:mm', { locale: ru })}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Официант</div>
              <div className="font-medium">{order.waiter.fullName}</div>
            </div>
          </div>

          {/* Список блюд */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold mb-4">Состав заказа</h4>
            <div className="space-y-3">
              {order.items.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
                >
                  <div className="flex-1">
                    <div className="font-medium">{item.menuItem.name}</div>
                    {item.menuItem.category && (
                      <div className="text-sm text-gray-500">
                        {item.menuItem.category.name}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-6">
                    <div className="text-gray-500">×{item.quantity}</div>
                    <div className="w-24 text-right font-medium">
                      {item.price.toLocaleString('ru-RU')} ₽
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Итого */}
          <div className="border-t border-gray-200 pt-4 flex justify-between items-center text-lg">
            <span className="font-medium">Итого:</span>
            <span className="font-bold text-purple-600">
              {order.totalPrice.toLocaleString('ru-RU')} ₽
            </span>
          </div>
        </div>
      </div>
    </div>
  );
} 