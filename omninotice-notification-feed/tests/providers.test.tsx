import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { NotificationFeedPage, NotificationsFeedProvider } from '../src/public';
import * as dataMock from '@core/data';

vi.mock('@core/data', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../src/mock/data')>();
  return {
    ...actual,
    callProvider: vi.fn(actual.callProvider),
  };
});

describe('Провайдеры данных (§3.4)', () => {
  it('вызывает notifications.doocot.list и counts при монтировании', () => {
    render(
      <NotificationsFeedProvider>
        <NotificationFeedPage />
      </NotificationsFeedProvider>
    );

    expect(dataMock.callProvider).toHaveBeenCalledWith(
      'notifications.doocot.list',
      { page: 1 },
    );
    expect(dataMock.callProvider).toHaveBeenCalledWith(
      'notifications.doocot.counts',
    );
  });
});