import { describe, it, expect, vi, beforeEach } from 'vitest';
import { registeredComponents, registerSlotComponent } from '@core/hive/react';

vi.mock('../src/components/pages/NotificationFeedPage', () => ({
  default: () => null,
}));
vi.mock('../src/app/providers/NotificationsFeedProvider', () => ({
  NotificationsFeedProvider: ({ children }: any) => children,
}));

describe('Регистрация компонента (§3.2)', () => {
  beforeEach(() => {
    // Очищаем мок, но НЕ сбрасываем модули — иначе импорт register-all создаст новый экземпляр
    registerSlotComponent.mockClear();
    Object.keys(registeredComponents).forEach((key) => delete registeredComponents[key]);
  });

  it('регистрирует компонент с id "notifications"', async () => {
    await import('../src/register-all');
    expect(registerSlotComponent).toHaveBeenCalledWith('notifications', expect.any(Function));
    expect(registeredComponents['notifications']).toBeDefined();
  });
});