import {DatePickerMode, DatePickerType} from './constants';

export type DateSelector = Array<Date | string> | string;

interface CommonDatePickerProps {
  blocked?: DateSelector;
  format: string;
  highlighted: DateSelector;
  id?: string;
  initialVisibleMonth: Date;
  locale: string;
  max?: Date;
  min: Date;
  mode: DatePickerMode;
  monthFormat: string;
  onError: (message: string) => void;
  openAfterSelect: boolean;
  weekDayFormat: string;
  children?: Element;
  type: DatePickerType;
}

export interface DateRangePickerProps extends CommonDatePickerProps {
  allowBlockedEndDate: boolean;
  allowBlockedRanges: boolean;
  endInputSelector: string;
  startInputSelector: string;
  maximumNights?: number;
  minimumNights?: number;
}

export interface SingleDatePickerProps extends CommonDatePickerProps {
  inputSelector: string;
}

export type BentoDatePickerProps = SingleDatePickerProps & DateRangePickerProps;

export interface SingleDatePickerAPI {
  clear(): void;
  today(args: {offset: number}): void;
  setDate(date: Date): void;
}
