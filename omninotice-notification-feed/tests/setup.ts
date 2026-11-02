import '@testing-library/jest-dom/vitest';
import { cleanup, configure } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// Увеличиваем таймаут ожидания для асинхронных тестов
configure({ asyncUtilTimeout: 5000 });

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  if (typeof window !== 'undefined') {
    (window as any).failNext = false;
  }
});