export type DateSelector = Array<Date | string> | string;
export type DatePickerMode = 'static' | 'overlay';
export type DatePickerType = 'single' | 'range';
export type DateFieldType = 'input' | 'start-input' | 'end-input';
export type DatePickerState =
  | 'overlay-closed'
  | 'overlay-open-input'
  | 'overlay-open-picker'
  | 'static';

type TodayArgs = {
  offset: number;
};

export type Range = {
  start: Date;
  end: Date;
};

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
  maximumNights: number;
  minimumNights: number;
}

export interface SingleDatePickerProps extends CommonDatePickerProps {
  inputSelector: string;
}

export type BentoDatePickerProps = SingleDatePickerProps & DateRangePickerProps;

export interface SingleDatePickerAPI {
  clear(): void;
  today(args: TodayArgs): void;
  setDate(date: Date): void;
}

export interface DateRangePickerAPI {
  clear(): void;
  startToday(args: TodayArgs): void;
  endToday(args: TodayArgs): void;
  setDates(range: Range): void;
}
