declare module "@core/hive" {
  export interface SlotComponentProps {
    slot: string;
    slotState: {
      visible?: boolean;
      collapsed?: boolean;
      size?: string | number;
    };
    settings?: Record<string, unknown>;
    variant?: string;
  }
}

declare module "@core/hive/react" {
  import type { ComponentType } from "react";
  import type { SlotComponentProps } from "@core/hive";

  export function registerSlotComponent(
    id: string,
    component: ComponentType<SlotComponentProps>,
  ): void;
}

declare module "@core/data" {
  export function callProvider<TResult>(
    name: string,
    params?: unknown,
    context?: unknown,
    ttl?: number,
  ): Promise<TResult>;
}

declare module "@core/actions" {
  export function runAction(action: Record<string, unknown>): Promise<unknown>;
}
