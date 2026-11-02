import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NotificationFeedPage, NotificationsFeedProvider } from '../src/public';
import * as dataMock from '@core/data';
import * as actionsMock from '@core/actions';

vi.mock('@core/data', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../src/mock/data')>();
  return {
    ...actual,
    callProvider: vi.fn(actual.callProvider),
  };
});

vi.mock('@core/actions', () => ({
  runAction: vi.fn().mockResolvedValue(undefined),
}));

describe('Действия (§3.6)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('вызывает runAction({ type: "mark-read", id }) после загрузки деталей непрочитанного уведомления', async () => {
    // Мокаем callProvider, чтобы гарантировать успешный ответ
    vi.mocked(dataMock.callProvider).mockImplementation(async (name: string) => {
      if (name === 'notifications.doocot.list') {
        return {
          detail: 'ok',
          data: [
            {
              status: 'active',
              created_date: '2026-01-01',
              modified_date: '2026-01-01',
              is_read: false,
              chit: {
                message_id: '3fa85f64-5717-4562-b3fc-000000000001',
                message_type: 'info',
                title: 'Тестовое уведомление',
                description: 'Описание',
                picture: null,
                action: null,
              },
            },
          ],
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
        return {
          detail: 'ok',
          data: [
            {
              status: 'active',
              created_date: '2026-01-01',
              modified_date: '2026-01-01',
              is_read: false,
              chit: {
                message_id: '3fa85f64-5717-4562-b3fc-000000000001',
                message_type: 'info',
                title: 'Тестовое уведомление',
                description: 'Описание',
                text: 'Текст деталей',
                picture: null,
                action: null,
                extra: null,
              },
            },
          ],
          info: { api_version: '1', count: 1, total: 1, page: 1, page_size: 1 },
        };
      }
      return undefined;
    });

    const user = userEvent.setup();
    render(
      <NotificationsFeedProvider>
        <NotificationFeedPage />
      </NotificationsFeedProvider>
    );

    // Ждём появления карточки по тексту
    const card = await screen.findByText('Тестовое уведомление');
    await user.click(card);

    await waitFor(() => {
      expect(actionsMock.runAction).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'mark-read',
          id: '3fa85f64-5717-4562-b3fc-000000000001',
        })
      );
    });
  });
});