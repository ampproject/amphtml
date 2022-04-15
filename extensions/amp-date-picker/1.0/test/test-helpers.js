import {format} from 'date-fns';

import {ISO_8601} from '../constants';

// Example: Wednesday, December 1, 2021
export const DATE_FORMAT = 'cccc, LLLL d, yyyy';

export function getDateButton(
  wrapper,
  date,
  getAriaLabel = (date) => format(date, DATE_FORMAT)
) {
  const label = getAriaLabel(date);
  return wrapper.find(`button[aria-label="${label}"]`);
}

export function isSelectedDate(wrapper, date) {
  return wrapper.exists(`[data-date="${format(date, ISO_8601)}"]`);
}

export function isSelectedStartDate(wrapper, date) {
  return wrapper.exists(`[data-startdate="${format(date, ISO_8601)}"]`);
}

export function isSelectedEndDate(wrapper, date) {
  return wrapper.exists(`[data-enddate="${format(date, ISO_8601)}"]`);
}

export function selectDate(wrapper, date, formatDate) {
  const button = getDateButton(wrapper, date, formatDate);

  button.simulate('click');

  wrapper.update();
}

export function getSelectedDate(wrapper) {
  return wrapper.find('[aria-label="Calendar"]').prop('data-date');
}

export function isCalendarVisible(wrapper) {
  return !wrapper.find('[aria-label="Calendar"]').prop('hidden');
}
