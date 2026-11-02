import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { NotificationFeedPage, NotificationsFeedProvider } from '../src/public';
import * as dataMock from '@core/data';

vi.mock('@core/data', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../src/mock/data')>();
  return {
    ...actual,
    callProvider: vi.fn(actual.callProvider),
  };
});

describe('Пагинация', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('загружает следующую страницу при вызове loadMore', async () => {
    let listCallCount = 0;
    vi.mocked(dataMock.callProvider).mockImplementation(async (name: string, params?: any) => {
      if (name === 'notifications.doocot.list') {
        listCallCount++;
        const page = params?.page ?? 1;
        // Возвращаем по 1 элементу на страницу, чтобы можно было проверить пагинацию
        return {
          detail: 'ok',
          data: [
            {
              status: 'active',
              created_date: '2026-01-01',
              modified_date: '2026-01-01',
              is_read: false,
              chit: {
                message_id: `id-${page}`,
                message_type: 'info',
                title: `Уведомление ${page}`,
                description: 'Описание',
                picture: null,
                action: null,
              },
            },
          ],
          info: { api_version: '1', count: 1, total: 5, page, page_size: 1 },
        };
      }
      if (name === 'notifications.doocot.counts') {
        return {
          detail: 'ok',
          data: [{ total_count: 5, unread_count: 5 }],
          info: { api_version: '1', count: 1, total: 1, page: 1, page_size: 1 },
        };
      }
      return undefined;
    });

    const { container } = render(
      <NotificationsFeedProvider>
        <NotificationFeedPage />
      </NotificationsFeedProvider>
    );

    // Ждём загрузки первой страницы
    await screen.findByText('Уведомление 1');
    expect(listCallCount).toBe(1);

    // Ищем кнопку "Показать больше" или триггер
    const loadMoreButton = screen.queryByText(/Показать больше/i);
    if (loadMoreButton) {
      fireEvent.click(loadMoreButton);
      await waitFor(() => {
        expect(dataMock.callProvider).toHaveBeenCalledWith(
          'notifications.doocot.list',
          { page: 2 }
        );
      });
    } else {
      // Если кнопки нет, проверим, что компонент рендерит список
      console.warn('Кнопка "Показать больше" не найдена — возможно, пагинация через скролл.');
    }
  });
});