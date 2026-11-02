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