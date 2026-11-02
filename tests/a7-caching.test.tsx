import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { NotificationFeedPage, NotificationsFeedProvider } from '../src/public';
import * as dataMock from '@core/data';

vi.mock('@core/data', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../src/mock/data')>();
  return {
    ...actual,
    callProvider: vi.fn(actual.callProvider),
  };
});

describe('Кэширование / TTL (A.7)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('не передаёт TTL в callProvider для counts (замечание A.7)', async () => {
    render(
      <NotificationsFeedProvider>
        <NotificationFeedPage />
      </NotificationsFeedProvider>
    );

    await waitFor(() => {
      const countsCalls = vi.mocked(dataMock.callProvider).mock.calls.filter(
        (call) => call[0] === 'notifications.doocot.counts'
      );
      expect(countsCalls.length).toBeGreaterThan(0);

      // callProvider(name, params, context, ttl) — ttl на позиции 3
      const [, , , ttl] = countsCalls[0];
      // Фиксируем замечание: TTL не передаётся.
      // Если добавите кэширование — замените на expect(ttl).toBeGreaterThan(0)
      expect(ttl).toBeUndefined();
    });
  });

  it('не передаёт TTL в callProvider для list (замечание A.7)', async () => {
    render(
      <NotificationsFeedProvider>
        <NotificationFeedPage />
      </NotificationsFeedProvider>
    );

    await waitFor(() => {
      const listCalls = vi.mocked(dataMock.callProvider).mock.calls.filter(
        (call) => call[0] === 'notifications.doocot.list'
      );
      expect(listCalls.length).toBeGreaterThan(0);

      const [, , , ttl] = listCalls[0];
      // Фиксируем замечание: TTL не передаётся
      expect(ttl).toBeUndefined();
    });
  });
});