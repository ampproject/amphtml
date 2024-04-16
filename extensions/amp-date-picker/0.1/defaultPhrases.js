const calendarLabel = 'Calendar';
const jumpToPrevMonth = 'Move backward to switch to the previous month.';
const jumpToNextMonth = 'Move forward to switch to the next month.';
const keyboardShortcuts = 'Keyboard Shortcuts';
const showKeyboardShortcutsPanel = 'Open the keyboard shortcuts panel.';
const hideKeyboardShortcutsPanel = 'Close the shortcuts panel.';
const openThisPanel = 'Open this panel.';
const enterKey = 'Enter key';
const leftArrowRightArrow = 'Right and left arrow keys';
const upArrowDownArrow = 'up and down arrow keys';
const pageUpPageDown = 'page up and page down keys';
const homeEnd = 'Home and end keys';
const escape = 'Escape key';
const questionMark = 'Question mark';
const selectFocusedDate = 'Select the date in focus.';
const moveFocusByOneDay =
  'Move backward (left) and forward (right) by one day.';
const moveFocusByOneWeek = 'Move backward (up) and forward (down) by one week.';
const moveFocusByOneMonth = 'Switch months.';
const moveFocustoStartAndEndOfWeek = 'Go to the first or last day of a week.';
const returnFocusToInput = 'Return to the date input field.';

/**
 * @param {!JsonObject} obj
 * @return {string}
 */
const chooseAvailableStartDate = (obj) => {
  return `Choose ${obj['date']} as the first date.`;
};

/**
 * @param {!JsonObject} obj
 * @return {string}
 */
const chooseAvailableEndDate = (obj) => {
  return `Choose ${obj['date']} as the last date.`;
};

/**
 * @param {!JsonObject} obj
 * @return {string}
 */
const chooseAvailableDate = (obj) => {
  return obj['date'];
};

/**
 * @param {!JsonObject} obj
 * @return {string}
 */
const dateIsUnavailable = (obj) => {
  return `Not available. ${obj['date']}`;
};

/**
 * @type {!JsonObject}
 */
export const DayPickerPhrases = {
  'calendarLabel': calendarLabel,
  'jumpToPrevMonth': jumpToPrevMonth,
  'jumpToNextMonth': jumpToNextMonth,
  'keyboardShortcuts': keyboardShortcuts,
  'showKeyboardShortcutsPanel': showKeyboardShortcutsPanel,
  'hideKeyboardShortcutsPanel': hideKeyboardShortcutsPanel,
  'openThisPanel': openThisPanel,
  'enterKey': enterKey,
  'leftArrowRightArrow': leftArrowRightArrow,
  'upArrowDownArrow': upArrowDownArrow,
  'pageUpPageDown': pageUpPageDown,
  'homeEnd': homeEnd,
  'escape': escape,
  'questionMark': questionMark,
  'selectFocusedDate': selectFocusedDate,
  'moveFocusByOneDay': moveFocusByOneDay,
  'moveFocusByOneWeek': moveFocusByOneWeek,
  'moveFocusByOneMonth': moveFocusByOneMonth,
  'moveFocustoStartAndEndOfWeek': moveFocustoStartAndEndOfWeek,
  'returnFocusToInput': returnFocusToInput,
  'chooseAvailableStartDate': chooseAvailableStartDate,
  'chooseAvailableEndDate': chooseAvailableEndDate,
  'chooseAvailableDate': chooseAvailableDate,
  'dateIsUnavailable': dateIsUnavailable,
};
