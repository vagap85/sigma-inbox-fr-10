import { vi } from 'vitest';
import type { ComponentType } from 'react';
import type { SlotComponentProps } from './core-hive';

export const registeredComponents: Record<string, ComponentType<SlotComponentProps>> = {};

export const registerSlotComponent = vi.fn((id: string, component: ComponentType<SlotComponentProps>) => {
  registeredComponents[id] = component;
});