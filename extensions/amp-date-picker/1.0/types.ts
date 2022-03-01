import {Locale} from 'date-fns';

import {ComponentChildren} from '#preact/types';

export type DateSelector = Array<Date | string>;
export type DatePickerMode = 'static' | 'overlay';
export type DatePickerType = 'single' | 'range';
export type DateFieldType = 'input' | 'start-input' | 'end-input';
export type DatePickerState =
  | 'overlay-closed'
  | 'overlay-open-input'
  | 'overlay-open-picker'
  | 'static';

export type Range = {
  start: Date;
  end: Date;
};

interface CommonDatePickerProps {
  blocked?: DateSelector;
  format?: string;
  highlighted?: DateSelector;
  id?: string;
  initialVisibleMonth?: Date;
  locale?: Locale;
  max?: Date;
  min?: Date;
  mode?: DatePickerMode;
  monthFormat?: string;
  numberOfMonths?: number;
  onError?: (message: string) => void;
  openAfterClear?: boolean;
  openAfterSelect?: boolean;
  weekDayFormat?: string;
  children?: ComponentChildren;
  today?: Date;
  type: DatePickerType;
}

export interface DateRangePickerProps extends CommonDatePickerProps {
  allowBlockedEndDate?: boolean;
  allowBlockedRanges?: boolean;
  endInputSelector?: string;
  startInputSelector?: string;
  maximumNights?: number;
  minimumNights?: number;
}

export interface SingleDatePickerProps extends CommonDatePickerProps {
  inputSelector?: string;
}

export type BentoDatePickerProps = SingleDatePickerProps & DateRangePickerProps;

export interface SingleDatePickerAPI {
  clear(): void;
  today(offset?: number): void;
  setDate(date: Date): void;
}

export interface DateRangePickerAPI {
  clear(): void;
  startToday(offset?: number): void;
  endToday(offset?: number): void;
  setDates(startDate: Date, endDate: Date): void;
}

export type BentodatePickerAPI = DateRangePickerAPI & SingleDatePickerAPI;
