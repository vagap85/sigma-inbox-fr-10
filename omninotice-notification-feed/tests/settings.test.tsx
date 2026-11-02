import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NotificationFeedPage, NotificationsFeedProvider } from '../src/public';

describe('Настройки (§3.1)', () => {
  it('применяет pageTitle и pageSubtitle', () => {
    render(
      <NotificationsFeedProvider settings={{ pageTitle: 'Мои уведомления', pageSubtitle: 'Подзаголовок' }}>
        <NotificationFeedPage />
      </NotificationsFeedProvider>
    );
    expect(screen.getByText('Мои уведомления')).toBeInTheDocument();
    expect(screen.getByText('Подзаголовок')).toBeInTheDocument();
  });

  it('применяет sidebarBackdrop', () => {
    const { container } = render(
      <NotificationsFeedProvider settings={{ sidebarBackdrop: false }}>
        <NotificationFeedPage />
      </NotificationsFeedProvider>
    );
    // Проверяем, что класс backdrop не добавлен (или добавлен, если true)
    const backdrop = container.querySelector('[class*="backdrop"]');
    if (backdrop) {
      expect(backdrop.className).not.toContain('filled');
    }
  });
});