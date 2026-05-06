import type { CSSProperties, ReactNode } from 'react';

import type { ButtonProps } from '@/ui/button';
import { type InputProps } from '@/ui/input';
import type { SelectOption } from '@/ui/select';

export interface BottomSheetRenderProps {
  isOpen: boolean;
  close: () => void;
  closeAsync: () => Promise<void>;
}

export type BottomSheetConfig = {
  maxHeight?: string | number;
  dragThreshold?: string | number;
  bottomInset?: string | number;
  showGrab?: boolean;
  grabContainerStyle?: CSSProperties;
  grabStyle?: CSSProperties;
  closeAsyncTimeout?: number;
  /**
   * Sheet open/close animation duration in seconds.
   * Set close to 0 for near-instant transitions (e.g. tests).
   * @default 0.54
   */
  animationDuration?: number;
  /**
   * Overlay fade animation duration in seconds.
   * Recommended to keep ≤ animationDuration to avoid visual lag.
   * @default 0.1
   */
  overlayDuration?: number;
};

export interface BottomSheetItem {
  id: string;
  render: (props: BottomSheetRenderProps) => ReactNode;
}

export interface BottomSheetContextType {
  open: (
    id: string,
    render: (props: BottomSheetRenderProps) => ReactNode,
    config?: BottomSheetConfig,
  ) => void;
  close: () => void;
  isOpen: boolean;
  activeSheetId: string | null;
}

export type BottomSheetProps = BottomSheetConfig & {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
};

export type BottomSheetDefaultOptionProps<TValue extends string | number> = Omit<
  ButtonProps,
  'children'
> & {
  option: SelectOption<TValue>;
  isSelected: boolean;
};

export type BottomSheetWithInputProps = InputProps & {
  bottomSheetContent: ReactNode | ((props: { close: () => void }) => ReactNode);
  bottomSheetMaxHeight?: string | number;
  bottomSheetDragThreshold?: string | number;
};
