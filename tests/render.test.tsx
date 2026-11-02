import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { NotificationFeedPage, NotificationsFeedProvider } from '../src/public';

// Мокаем данные, чтобы управлять состояниями
vi.mock('@core/data', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../src/mock/data')>();
  return {
    ...actual,
    callProvider: vi.fn(actual.callProvider),
  };
});

describe('Рендер состояний (А.5)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (window as any).failNext = false;
  });

  it('показывает состояние загрузки при монтировании', () => {
    const { container } = render(
      <NotificationsFeedProvider>
        <NotificationFeedPage />
      </NotificationsFeedProvider>
    );
    // Спиннер в коде — div с классом _spinner_*
    // TODO (a11y): добавить role="status" или aria-live="polite" в компонент спиннера
    expect(container.querySelector('[class*="spinner"]')).toBeInTheDocument();
  });

  it('показывает состояние ошибки при неудачном запросе', async () => {
    (window as any).failNext = true;
    render(
      <NotificationsFeedProvider>
        <NotificationFeedPage />
      </NotificationsFeedProvider>
    );
    await waitFor(() => {
      expect(screen.getByText(/Не удалось загрузить уведомления/i)).toBeInTheDocument();
    });
  });

  it('показывает пустое состояние, если данных нет', async () => {
    const { callProvider } = await import('@core/data');
    vi.mocked(callProvider).mockImplementation(async (name: string) => {
      if (name === 'notifications.doocot.list') {
        return {
          detail: 'ok',
          data: [],
          info: { api_version: '1', count: 0, total: 0, page: 1, page_size: 10 },
        };
      }
      if (name === 'notifications.doocot.counts') {
        return {
          detail: 'ok',
          data: [{ total_count: 0, unread_count: 0 }],
          info: { api_version: '1', count: 1, total: 1, page: 1, page_size: 1 },
        };
      }
      return undefined;
    });

    render(
      <NotificationsFeedProvider>
        <NotificationFeedPage />
      </NotificationsFeedProvider>
    );
    await waitFor(() => {
      expect(screen.getByText(/Пока нет уведомлений/i)).toBeInTheDocument();
    });
  });
});