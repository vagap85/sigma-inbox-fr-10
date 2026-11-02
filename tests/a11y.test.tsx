import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NotificationFeedPage, NotificationsFeedProvider } from '../src/public';

describe('Доступность (А.3)', () => {
  it('содержит заголовок страницы', () => {
    render(
      <NotificationsFeedProvider>
        <NotificationFeedPage />
      </NotificationsFeedProvider>
    );
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  });

  it('вкладки имеют корректные aria-атрибуты', () => {
    render(
      <NotificationsFeedProvider>
        <NotificationFeedPage />
      </NotificationsFeedProvider>
    );
    const tabs = screen.getAllByRole('button');
    const tab = tabs.find((t) => t.getAttribute('aria-pressed') !== null);
    expect(tab).toBeDefined();
    expect(tab).toHaveAttribute('aria-pressed');
  });
});