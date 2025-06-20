'use client';

import { useState } from 'react';
import type { ReactNode } from 'react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Order } from '@/types/order';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

interface OrderModalProps {
  order: Order | null;
  onClose: () => void;
}

type PaymentType = 'CASH' | 'CARD' | 'QR' | 'OTHER';

const PAYMENT_TYPES: { type: PaymentType; label: string; icon: ReactNode }[] = [
  {
    type: 'CASH',
    label: 'Наличные',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
  {
    type: 'CARD',
    label: 'Банковская карта',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    ),
  },
  {
    type: 'QR',
    label: 'QR-код',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
      </svg>
    ),
  },
  {
    type: 'OTHER',
    label: 'Другое',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
      </svg>
    ),
  },
];

export default function OrderModal({ order, onClose }: OrderModalProps) {
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [selectedPaymentType, setSelectedPaymentType] = useState<PaymentType | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  if (!order) return null;

  const handleClose = () => {
    onClose();
  
    // Перезагружаем страницу через 3 секунды (3000 мс)
    setTimeout(() => {
      window.location.reload();
    }, 3000);
  };

  const handlePaymentSelect = (paymentType: PaymentType) => {
    setSelectedPaymentType(paymentType);
    setIsPaymentModalOpen(false);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmPayment = async () => {
    if (!selectedPaymentType) return;

    setIsProcessing(true);
    setError(null);

    try {
      const response = await fetch(`/api/orders/${order.id}/pay`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentType: selectedPaymentType,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Ошибка при оплате заказа');
      }

      // Показываем уведомление об успехе
      toast.success('Заказ успешно оплачен');
      
      // Закрываем модальные окна и перезагружаем страницу
      setIsConfirmModalOpen(false);
      handleClose();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Произошла ошибка при оплате';
      setError(errorMessage);
      // Показываем уведомление об ошибке
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50">
      {/* Затемненный и размытый фон */}
      <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm" onClick={handleClose} />
      
      {/* Модальное окно */}
      <div className="relative min-h-screen sm:flex sm:items-center sm:p-0">
        <div className="relative w-full sm:max-w-2xl sm:mx-auto">
          <div className="relative bg-white sm:rounded-2xl shadow-2xl overflow-hidden transform transition-all">
            {/* Заголовок */}
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
                    <div className="text-white text-lg font-semibold">#{order.id}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="bg-white/10 px-3 py-1 rounded-full">
                    <div className="text-white/70 text-sm">Стол</div>
                    <div className="text-white font-medium text-center">{order.tableNumber}</div>
                  </div>
                  <button
                    onClick={handleClose}
                    className="rounded-full p-2 hover:bg-white/10 transition-colors"
                  >
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <div className="px-6 py-4">
              {/* Информация о заказе */}
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Создан</div>
                      <div className="font-medium text-gray-900">
                        {new Date(order.createdAt).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC', })}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Официант</div>
                      <div className="font-medium text-gray-900">{order.waiter.fullName}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Список блюд */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold mb-3 text-gray-900">Состав заказа</h4>
                <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-purple-200 scrollbar-track-gray-50 hover:scrollbar-thumb-purple-300">
                  {order.items.map((item, index) => (
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

              {/* Итого и кнопка закрытия */}
              <div className="space-y-4">
                <div className="bg-purple-50 rounded-xl p-4 flex justify-between items-center">
                  <span className="text-lg font-medium text-purple-900">Итого:</span>
                  <span className="text-xl font-bold text-purple-700">
                    {order.totalPrice.toLocaleString('ru-RU')} сом
                  </span>
                </div>
                
                <button
                  onClick={() => setIsPaymentModalOpen(true)}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-4 rounded-xl transition-colors flex items-center justify-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <span>Закрыть заказ</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Модальное окно выбора типа оплаты */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-60">
          <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm" onClick={() => setIsPaymentModalOpen(false)} />
          
          <div className="relative min-h-screen sm:flex sm:items-center sm:p-0">
            <div className="relative w-full max-w-lg mx-auto p-4">
              <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-semibold text-gray-900">Выберите способ оплаты</h3>
                    <button
                      onClick={() => setIsPaymentModalOpen(false)}
                      className="text-gray-400 hover:text-gray-500 transition-colors"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    {PAYMENT_TYPES.map(({ type, label, icon }) => (
                      <button
                        key={type}
                        onClick={() => handlePaymentSelect(type)}
                        className="flex flex-col items-center justify-center p-4 bg-gray-50 hover:bg-purple-50 rounded-xl transition-colors border-2 border-transparent hover:border-purple-200 group"
                      >
                        <div className="w-12 h-12 mb-3 flex items-center justify-center text-gray-500 group-hover:text-purple-600">
                          {icon}
                        </div>
                        <span className="text-sm font-medium text-gray-900">{label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно подтверждения */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 z-70">
          <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm" onClick={() => !isProcessing && setIsConfirmModalOpen(false)} />
          
          <div className="relative min-h-screen sm:flex sm:items-center sm:p-0">
            <div className="relative w-full max-w-lg mx-auto p-4">
              <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-semibold text-gray-900">Подтверждение оплаты</h3>
                    {!isProcessing && (
                      <button
                        onClick={() => setIsConfirmModalOpen(false)}
                        className="text-gray-400 hover:text-gray-500 transition-colors"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>

                  <div className="space-y-6">
                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm text-gray-500">Номер заказа</div>
                          <div className="font-medium text-gray-900">#{order.id}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Стол</div>
                          <div className="font-medium text-gray-900">{order.tableNumber}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Способ оплаты</div>
                          <div className="font-medium text-gray-900">
                            {PAYMENT_TYPES.find(p => p.type === selectedPaymentType)?.label}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Сумма</div>
                          <div className="font-medium text-gray-900">
                            {order.totalPrice.toLocaleString('ru-RU')} сом
                          </div>
                        </div>
                      </div>
                    </div>

                    {error && (
                      <div className="bg-red-50 text-red-700 p-4 rounded-xl">
                        {error}
                      </div>
                    )}

                    <div className="flex space-x-4">
                      <button
                        onClick={() => !isProcessing && setIsConfirmModalOpen(false)}
                        disabled={isProcessing}
                        className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 rounded-xl transition-colors"
                      >
                        Отмена
                      </button>
                      <button
                        onClick={handleConfirmPayment}
                        disabled={isProcessing}
                        className="flex-1 px-4 py-3 text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50 rounded-xl transition-colors flex items-center justify-center"
                      >
                        {isProcessing ? (
                          <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          'Подтвердить'
                        )}
                      </button>
                    </div>
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