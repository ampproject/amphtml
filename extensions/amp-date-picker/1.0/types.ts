import {DatePickerMode} from './constants';

export type PickerType = 'single' | 'range';
export type Mode = 'static' | 'overlay';
export type DateSelector = Array<Date | string> | string;

interface CommonDatePickerProps {
  blocked?: DateSelector;
  format: string;
  highlighted: DateSelector;
  id?: string;
  initialVisibleMonth?: Date;
  locale: string;
  max?: Date;
  min: Date;
  mode: DatePickerMode;
  monthFormat: string;
  onError: (message: string) => void;
  openAfterSelect: boolean;
  weekDayFormat: string;
  children?: Element;
  type: PickerType;
}

interface DateRangePickerProps extends CommonDatePickerProps {
  allowBlockedEndDate: boolean;
  allowBlockedRanges: boolean;
  endInputSelector: string;
  startInputSelector: string;
  maximumNights?: number;
  minimumNights?: number;
}

interface SingleDatePickerProps extends CommonDatePickerProps {
  inputSelector: string;
}

export type BentoDatePickerProps = SingleDatePickerProps & DateRangePickerProps;
