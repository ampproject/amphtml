export const DEFAULT_INPUT_SELECTOR = '#date';
export const DEFAULT_START_INPUT_SELECTOR = '#startdate';
export const DEFAULT_END_INPUT_SELECTOR = '#enddate';
export const ISO_8601 = 'yyyy-MM-dd';
export const FORM_INPUT_SELECTOR = 'form';
export const DEFAULT_MONTH_FORMAT = 'MMMM yyyy';
// TODO: Check on this tag name
export const TAG = 'BentoDatePicker';
export const DEFAULT_ON_ERROR = (message) => {
  throw new Error(message);
};

/** @enum {string} */
export const DatePickerMode = {
  STATIC: 'static',
  OVERLAY: 'overlay',
};

/** @enum {string} */
export const DatePickerType = {
  SINGLE: 'single',
  RANGE: 'range',
};

/** @enum {string} */
export const DateFieldType = {
  DATE: 'input',
  START_DATE: 'start-input',
  END_DATE: 'end-input',
};

export const DateFieldNameByType = {
  [DateFieldType.DATE]: 'date',
  [DateFieldType.START_DATE]: 'start-date',
  [DateFieldType.END_DATE]: 'end-date',
};
