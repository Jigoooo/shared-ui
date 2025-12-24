import type { Placement, Strategy } from '@floating-ui/react';
import type { CSSProperties, HTMLProps, ReactNode } from 'react';

export type TimePart = 'hours' | 'minutes' | 'seconds';

export type DatePickerMode = 'year' | 'month' | 'day';

type BaseDatePickerProps = {
  mode?: DatePickerMode;
  value?: Date;
  onChange?: (value: Date) => void;
  dateFormat?: string;
  minDate?: Date;
  maxDate?: Date;
  InputComponent?: ({
    dateString,
    openDatePicker,
  }: {
    dateString: string;
    openDatePicker: () => void;
  }) => ReactNode;
  inputStyle?: CSSProperties;
  endDecorator?: ReactNode;
};

export type DatePickerProps = BaseDatePickerProps & {
  strategy?: Strategy;
  placement?: Placement;
  isInputMode?: boolean;
  onOpen?: (isShowDatePicker: boolean) => void;
  containerStyle?: CSSProperties;
};

export type MobileDatePickerProps = BaseDatePickerProps & {
  containerStyle?: CSSProperties;
};

type BasePickerProps = {
  mode: DatePickerMode;
  minDate?: Date;
  maxDate?: Date;
};

export type PickerProps = BasePickerProps & {
  setFloating: (node: HTMLElement | null) => void;
  floatingStyles: CSSProperties;
  getFloatingProps: (userProps?: HTMLProps<HTMLElement>) => Record<string, unknown>;
  handleDateClick: (date: Date) => void;
  selectedDate: Date | null;
  currentDate: Date;
};

export type MobilePickerProps = BasePickerProps & {
  onChange?: (value: Date) => void;
  initialValue?: Date | null;
};

export type CalendarProps = Omit<
  PickerProps,
  'setFloating' | 'floatingStyles' | 'getFloatingProps' | 'handleDateClick'
> & {
  setDisplayMode: (mode: DatePickerMode) => void;
  handleNavigationDateChange?: (date: Date) => void;
  handleSelection: (date: Date) => void;
};
