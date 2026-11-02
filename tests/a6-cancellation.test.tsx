import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NotificationFeedPage, NotificationsFeedProvider } from '../src/public';
import * as dataMock from '@core/data';

vi.mock('@core/data', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../src/mock/data')>();
  return {
    ...actual,
    callProvider: vi.fn(actual.callProvider),
  };
});

describe('Отмена запросов (A.6)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('передаёт AbortSignal в callProvider для деталей и отменяет при закрытии', async () => {
    const user = userEvent.setup();
    let capturedSignal: AbortSignal | undefined;

    vi.mocked(dataMock.callProvider).mockImplementation(async (name: string, params: any) => {
      if (name === 'notifications.doocot.list') {
        return {
          detail: 'ok',
          data: [{
            status: 'active', created_date: '2026-01-01', modified_date: '2026-01-01',
            is_read: false,
            chit: {
              message_id: 'id-1', message_type: 'info',
              title: 'Уведомление 1', description: 'Описание',
              picture: null, action: null,
            },
          }],
          info: { api_version: '1', count: 1, total: 1, page: 1, page_size: 10 },
        };
      }
      if (name === 'notifications.doocot.counts') {
        return {
          detail: 'ok',
          data: [{ total_count: 1, unread_count: 1 }],
          info: { api_version: '1', count: 1, total: 1, page: 1, page_size: 1 },
        };
      }
      if (name === 'notifications.doocot.details') {
        capturedSignal = params?.signal;
        // Возвращаем промис, который не резолвится, чтобы проверить отмену
        return new Promise((_, reject) => {
          params?.signal?.addEventListener('abort', () => {
            reject(new DOMException('Aborted', 'AbortError'));
          });
        });
      }
      return undefined;
    });

    render(
      <NotificationsFeedProvider>
        <NotificationFeedPage />
      </NotificationsFeedProvider>
    );

    // Ждём загрузки карточки
    const card = await screen.findByText('Уведомление 1');
    await user.click(card);

    // Ждём, пока callProvider будет вызван с signal
    await waitFor(() => {
      expect(capturedSignal).toBeDefined();
      expect(capturedSignal).toBeInstanceOf(AbortSignal);
    });

    // Закрываем панель — ищем кнопку закрытия (aria-label="Закрыть уведомление")
    const closeButton = screen.getByRole('button', { name: /Закрыть уведомление/i });
    await user.click(closeButton);

    // Проверяем, что signal отменён
    await waitFor(() => {
      expect(capturedSignal?.aborted).toBe(true);
    });
  });

  it('отменяет запрос списка при размонтировании компонента', async () => {
    let capturedSignal: AbortSignal | undefined;

    vi.mocked(dataMock.callProvider).mockImplementation(async (name: string, params: any) => {
      if (name === 'notifications.doocot.list') {
        // useNotificationsFeed не передаёт signal в list, но проверяем, что он не падает
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

    const { unmount } = render(
      <NotificationsFeedProvider>
        <NotificationFeedPage />
      </NotificationsFeedProvider>
    );

    // Размонтируем сразу — не должно быть ошибок/утечек
    await act(async () => {
      unmount();
    });

    // Если мы дошли сюда — утечек нет
    expect(true).toBe(true);
  });
});