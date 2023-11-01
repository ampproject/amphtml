import {enUS} from 'date-fns/locale';

import {DateFieldType} from './types';

export const DEFAULT_INPUT_SELECTOR = '#date';
export const DEFAULT_START_INPUT_SELECTOR = '#startdate';
export const DEFAULT_END_INPUT_SELECTOR = '#enddate';
export const FORM_INPUT_SELECTOR = 'form';
export const DEFAULT_LOCALE = enUS;

// Default formatters
// Documentation: https://date-fns.org/v2.28.0/docs/format
export const ISO_8601 = 'yyyy-MM-dd';
export const DEFAULT_MONTH_FORMAT = 'MMMM yyyy';
export const DEFAULT_WEEK_DAY_FORMAT = 'EEEEE';

// TODO: Check on this tag name
export const TAG = 'BentoDatePicker';
export const DEFAULT_ON_ERROR = (message: string) => {
  throw new Error(message);
};

const DateFieldNameByType = new Map<DateFieldType, string>([
  ['input', 'date'],
  ['start-input', 'start-date'],
  ['end-input', 'end-date'],
]);
export {DateFieldNameByType};

export const noop = () => {};
