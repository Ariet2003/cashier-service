'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LoginForm from '@/components/LoginForm';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Проверяем наличие куки session
    const checkSession = async () => {
      try {
        const response = await fetch('/api/auth/check', {
          method: 'GET',
          credentials: 'include', // Важно для отправки куки
        });

        if (response.ok) {
          // Если сессия валидна, перенаправляем на дашборд
          router.replace('/dashboard');
        }
      } catch (error) {
        console.error('Ошибка проверки сессии:', error);
      }
    };

    checkSession();
  }, [router]);

  return <LoginForm />;
}
