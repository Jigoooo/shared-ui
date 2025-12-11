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
   * Whether to use browser history for back button support.
   * Set to false for nested bottom sheets to avoid history conflicts.
   * @default true
   */
  useHistory?: boolean;
  /**
   * Custom history back handler. When provided, this will be called instead of window.history.back().
   * Useful for integrating with React Router or other routing libraries.
   * @example
   * // With React Router
   * onHistoryBack: () => navigate(-1)
   */
  onHistoryBack?: () => void;
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
