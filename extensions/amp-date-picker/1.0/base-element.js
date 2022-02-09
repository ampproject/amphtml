import {parseBooleanAttribute} from '#core/dom';

import {PreactBaseElement} from '#preact/base-element';

import {BentoDatePicker} from './component';
import {CSS as COMPONENT_CSS} from './component.jss';
import {parseDate, parseDateList, parseLocale} from './parsers';

export class BaseElement extends PreactBaseElement {}

/** @override */
BaseElement['Component'] = BentoDatePicker;

/** @override */
BaseElement['props'] = {
  'children': {passthrough: true},
  'mode': {attr: 'mode'},
  'type': {attr: 'type'},
  'inputSelector': {attr: 'input-selector'},
  'startInputSelector': {attr: 'start-input-selector'},
  'end-input-selector': {attr: 'end-input-selector'},
  'min': {attr: 'min', parseAttr: parseDate},
  'max': {attr: 'max', parseAttr: parseDate},
  'monthFormat': {attr: 'month-format'},
  'format': {attr: 'format'},
  'weekDayFormat': {attr: 'week-day-format'},
  'locale': {attr: 'locale', parseAttr: parseLocale},
  'maximumNights': {attr: 'maximum-nights', parseAttr: parseInt},
  'minimumNights': {attr: 'minimum-nights', parseAttr: parseInt},
  'numberOfMonths': {attr: 'number-of-months', parseAttr: parseInt},
  // Not implemented
  'firstDayOfWeek': {attr: 'first-day-of-week', parseAttr: parseInt},
  'blocked': {attr: 'blocked', parseAttr: parseDateList},
  'highlighted': {attr: 'highlighted', parseAttr: parseDateList},
  // Not implemented
  'daySize': {attr: 'day-size', parseAttr: parseInt},
  'allowBlockedEndDate': {
    attr: 'allow-blocked-end-date',
    parseAttr: parseBooleanAttribute,
  },
  'allowBlockedRanges': {
    attr: 'allow-blocked-ranges',
    parseAttr: parseBooleanAttribute,
  },
  // Not implemented
  'fullscreen': {attr: 'fullscreen', parseAttr: parseBooleanAttribute},
  'openAfterSelect': {
    attr: 'open-after-select',
    parseAttr: parseBooleanAttribute,
  },
  // Not implemented
  'openAfterClear': {
    attr: 'open-after-clear',
    parseAttr: parseBooleanAttribute,
  },
  // Not implemented
  'hideKeyboardShortcutsPanel': {
    attr: 'hide-keyboard-shortcuts-panel',
    parseAttr: parseBooleanAttribute,
  },
};

/** @override */
BaseElement['layoutSizeDefined'] = true;

/** @override */
BaseElement['usesShadowDom'] = true;

// DO NOT SUBMIT: If BaseElement['shadowCss']  is set to `null`, remove the
// following declaration.
// Otherwise, keep it when defined to an actual value like `COMPONENT_CSS`.
// Once addressed, remove this set of comments.
/** @override */
BaseElement['shadowCss'] = COMPONENT_CSS;
