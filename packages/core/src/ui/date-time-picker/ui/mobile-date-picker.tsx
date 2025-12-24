import { format, subDays } from 'date-fns';

import { LuCalendar } from 'react-icons/lu';

import { MobileCalendar } from './mobile-calendar.tsx';
import { getDefaultDateFormat } from '../lib/get-default-date-format.ts';
import { type MobileDatePickerProps } from '../model/picker-type.ts';
import { useBottomSheet } from '@/ui/bottom-sheet';
import { OutlinedInput } from '@/ui/input';
import { FlexColumn } from '@/ui/layout';

export function MobileDatePicker({
  mode = 'day',
  value,
  onChange,
  dateFormat,
  minDate,
  maxDate,
  InputComponent,
  containerStyle,
  inputStyle,
  endDecorator,
}: MobileDatePickerProps) {
  const applyDateFormat = getDefaultDateFormat(mode, dateFormat);
  const inputSelectedDateString = value ? format(value, applyDateFormat) : '';

  const mobileDatePickerBottomSheet = useBottomSheet();
  const openMobileDatePickerBottomSheet = () => {
    return mobileDatePickerBottomSheet.open(({ close }) => {
      return (
        <MobileCalendar
          mode={mode}
          initialValue={value}
          onChange={(date) => {
            onChange?.(date);
            close();
          }}
          minDate={mode === 'day' && minDate ? subDays(minDate, 1) : minDate}
          maxDate={maxDate}
        />
      );
    });
  };

  return (
    <FlexColumn style={containerStyle}>
      {InputComponent ? (
        InputComponent({
          dateString: inputSelectedDateString,
          openDatePicker: openMobileDatePickerBottomSheet,
        })
      ) : (
        <OutlinedInput
          style={{
            color: '#111111',
            cursor: 'pointer',
            ...inputStyle,
          }}
          value={inputSelectedDateString}
          onClick={openMobileDatePickerBottomSheet}
          readOnly
          endDecorator={!endDecorator ? <LuCalendar /> : endDecorator}
        />
      )}
    </FlexColumn>
  );
}
