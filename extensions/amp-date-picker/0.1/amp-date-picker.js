/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import '../../../third_party/react-dates/bundle';
import {ActionTrust} from '../../../src/action-trust';
import {AmpEvents} from '../../../src/amp-events';
import {CSS} from '../../../build/amp-date-picker-0.1.css';
import {DEFAULT_FORMAT, DEFAULT_LOCALE, FORMAT_STRINGS} from './constants';
import {DatesList} from './dates-list';
import {FiniteStateMachine} from '../../../src/finite-state-machine';
import {KeyCodes} from '../../../src/utils/key-codes';
import {Layout, isLayoutSizeDefined} from '../../../src/layout';
import {Services} from '../../../src/services';
import {batchFetchJsonFor} from '../../../src/batched-json';
import {createCustomEvent, listen} from '../../../src/event-helper';
import {createDateRangePicker} from './date-range-picker';
import {createDeferred} from './react-utils';
import {createSingleDatePicker} from './single-date-picker';
import {dashToCamelCase} from '../../../src/string';
import {dev, user} from '../../../src/log';
import {escapeCssSelectorIdent, isRTL, iterateCursor} from '../../../src/dom';
import {isExperimentOn} from '../../../src/experiments';
import {map} from '../../../src/utils/object';
import {requireExternal} from '../../../src/module';


/**
 * @typedef {{
 *   dates: !DatesList,
 *   template: Element
 * }}
 */
let DateTemplateMapDef;

/**
 * @typedef {{
 *   startDate: ?moment,
 *   endDate: ?moment
 * }}
 */
let DatesChangeDetailsDef;

/**
 * @typedef {{
 *   date: ?moment
 * }}
 */
let DateChangeDetailsDef;

/** @dict */
class BindDateDetails {
  /**
   * @param {string} date
   * @param {?string} id
   */
  constructor(date, id) {
    /** @const */
    this['date'] = date;

    /** @const */
    this['id'] = id;
  }
}

/** @dict */
class BindDatesDetails {
  /**
   * @param {!Array<!BindDateDetails>} dates
   */
  constructor(dates) {
    /** @const */
    this['dates'] = dates;

    /** @const */
    this['start'] = dates[0];

    /** @const */
    this['end'] = dates[dates.length - 1];
  }
}

const TAG = 'amp-date-picker';
const DATE_SEPARATOR = ' ';

const attributesToForward = [
  'max',
  'min',
  'month-format',
  'number-of-months',
];

/** @enum {string} */
const DatePickerMode = {
  STATIC: 'static',
  OVERLAY: 'overlay',
};

/** @enum {string} */
const DatePickerState = {
  OVERLAY_CLOSED: 'overlay-closed',
  OVERLAY_OPEN_INPUT: 'overlay-open-input',
  OVERLAY_OPEN_PICKER: 'overlay-open-picker',
  STATIC: 'static',
};

/** @enum {string} */
const DatePickerType = {
  SINGLE: 'single',
  RANGE: 'range',
};

/** @enum {string} */
const DateFieldType = {
  DATE: 'input',
  START_DATE: 'start-input',
  END_DATE: 'end-input',
};

const DateFieldNameByType = {
  [DateFieldType.DATE]: 'date',
  [DateFieldType.START_DATE]: 'start-date',
  [DateFieldType.END_DATE]: 'end-date',
};

/** @enum {string} */
const DatePickerEvent = {
  /**
   * Triggered when the overlay opens or when the static date picker should
   * receive focus from the attached input.
   */
  ACTIVATE: 'activate',

  /**
   * Triggered when the overlay closes or when the static date picker has
   * finished selecting.
   */
  DEACTIVATE: 'deactivate',

  /** Triggered when the user selects a date range. */
  SELECT: 'select',
};

/**
 * The size in PX of each calendar day. This value allows the date picker to
 * fit within a 320px wide viewport when fully rendered.
 */
const DEFAULT_DATE_SIZE = 39;

const DEFAULT_FIRST_DAY_OF_WEEK = 0; // Sunday

const DEFAULT_WEEK_DAY_FORMAT_CSS = 'i-amphtml-default-week-day-format';

const DEFAULT_WEEK_DAY_FORMAT = 'dd';

const INPUT_FOCUS_CSS = 'amp-date-picker-selecting';

const CALENDAR_CONTAINER_CSS = 'i-amphtml-date-picker-container';

const PRIVATE_CALENDAR_CONTAINER_CSS = 'amp-date-picker-calendar-container';

const INFO_TEMPLATE_AREA_CSS = 'i-amphtml-date-picker-info';

const FULLSCREEN_CSS = 'i-amphtml-date-picker-fullscreen';

export class AmpDatePicker extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private @const */
    this.document_ = this.element.ownerDocument;

    /** @private @const */
    this.moment_ = requireExternal('moment');

    /** @private @const */
    this.react_ = requireExternal('react');
    if (this.react_.options) {
      this.react_.options.syncComponentUpdates = false;
    }

    /** @private @const */
    this.reactRender_ = requireExternal('react-dom').render;

    /** @private @const */
    this.ReactDatesConstants_ = requireExternal('react-dates/constants');

    /** @private {?../../../src/service/action-impl.ActionService} */
    this.action_ = null;

    /** @private @const */
    this.templates_ = Services.templatesFor(this.win);

    /** @const */
    this.onDateChange = this.onDateChange.bind(this);

    /** @const */
    this.onDatesChange = this.onDatesChange.bind(this);

    /** @const */
    this.onFocusChange = this.onFocusChange.bind(this);

    /** @const */
    this.onMount = this.onMount.bind(this);

    /** @const */
    this.renderInfo = this.renderInfo.bind(this);

    /** @const */
    this.renderDay = this.renderDay.bind(this);

    /** @private {?Promise<string>} */
    this.infoTemplatePromise_ = null;

    /** @private @const */
    this.format_ = this.element.getAttribute('format') || DEFAULT_FORMAT;

    /** @private @const */
    this.firstDayOfWeek_ =
        Number(this.element.getAttribute('first-day-of-week')) ||
        DEFAULT_FIRST_DAY_OF_WEEK;

    /** @private @const */
    this.daySize_ =
        Number(this.element.getAttribute('day-size')) || DEFAULT_DATE_SIZE;

    const blocked = this.element.getAttribute('blocked');
    /** @private @const */
    this.blocked_ = new DatesList(
        blocked ? blocked.split(DATE_SEPARATOR) : []);

    const highlighted = this.element.getAttribute('highlighted');
    /** @private @const */
    this.highlighted_ = new DatesList(
        highlighted ? highlighted.split(DATE_SEPARATOR) : []);

    /** @private @const */
    this.container_ = this.document_.createElement('div');
    this.container_.classList.add(
        CALENDAR_CONTAINER_CSS, PRIVATE_CALENDAR_CONTAINER_CSS);

    /** @private @const */
    this.type_ = this.element.getAttribute('type') || DatePickerType.SINGLE;

    /** @private @const */
    this.pickerClass_ = (this.type_ === DatePickerType.RANGE ?
      createDateRangePicker() :
      createSingleDatePicker()); // default

    /** @private @const {!DatePickerMode} */
    this.mode_ = this.element.getAttribute('mode') == DatePickerMode.OVERLAY ?
      DatePickerMode.OVERLAY :
      DatePickerMode.STATIC; // default

    /** @private @const */
    this.weekDayFormat_ = this.element.getAttribute('week-day-format') ||
        DEFAULT_WEEK_DAY_FORMAT;

    /** @private @const */
    this.allowBlockedRanges_ =
        this.element.hasAttribute('allow-blocked-ranges');

    /** @private @const */
    this.fullscreen_ = this.element.hasAttribute('fullscreen');
    if (this.fullscreen_) {
      user().assert(this.mode_ == DatePickerMode.STATIC,
          'amp-date-picker mode must be "static" to use fullscreen attribute');
    }

    /** @private @const */
    this.openAfterClear_ = this.element.hasAttribute('open-after-clear');

    /** @private @const */
    this.openAfterSelect_ = this.element.hasAttribute('open-after-select');


    /** @private @const */
    this.elementTemplates_ = this.parseElementTemplates_(
        this.element.querySelectorAll('[date-template][dates]'));

    /** @private {!Array<!DateTemplateMapDef>} */
    this.srcTemplates_ = [];

    /** @private {?Element} */
    this.srcDefaultTemplate_ = null;

    /** @private {boolean} */
    this.isRTL_ = false;

    /** @private {?function(?):?} */
    this.templateThen_ = null;

    /** @private {?Element} */
    this.startDateField_ = null;

    /** @private {?Element} */
    this.endDateField_ = null;

    /** @private {?Element} */
    this.dateField_ = null;

    /** @private */
    this.renderedTemplates_ = map();

    /** @private {?function()} */
    this.templatesReadyResolver_ = null;

    /** @private {!Promise} */
    this.templatesReadyPromise_ = new Promise(resolve => {
      this.templatesReadyResolver_ = resolve;
    });

    /** @private @const {!Array<!UnlistenDef>} */
    this.unlisteners_ = [];

    const initialState = (this.mode_ == DatePickerMode.OVERLAY ?
      DatePickerState.OVERLAY_CLOSED :
      DatePickerState.STATIC);
    /** @private @const */
    this.stateMachine_ = new FiniteStateMachine(initialState);
    this.setupStateMachine_(this.stateMachine_);

    /** @private @const */
    this.locale_ = this.element.getAttribute('locale') || DEFAULT_LOCALE;
    this.moment_.locale(this.locale_);

    /** @private @const */
    this.props_ = this.getProps_();

    /** @private {?Object} */
    this.state_ = null;
  }

  /** @override */
  isLayoutSupported(layout) {
    return this.mode_ == DatePickerMode.STATIC ?
      isLayoutSizeDefined(layout) :
      Layout.CONTAINER;
  }

  /** @override */
  layoutCallback() {
    this.setupTemplates_();
    this.setupSrcAttributes_();
    this.setupListeners_();

    if (this.element.contains(this.document_.activeElement)) {
      this.maybeTransitionWithFocusChange_(this.document_.activeElement);
    }

    // Make sure it's rendered and measured properly. Then if possible, attempt
    // to adjust expand the height to fit the element for static pickers.
    return this.render(this.state_).then(() => {
      if (this.mode_ == DatePickerMode.STATIC) {
        this.measureElement(() => {
          const scrollHeight = this.container_./*OK*/scrollHeight;
          const height = this.element./*OK*/offsetHeight;
          if (scrollHeight > height) {
            // Add 1px to allow the bottom border to show
            this./*OK*/changeHeight(scrollHeight + 1);
          }
        });
      }
    });
  }

  /** @override */
  detachedCallback() {
    this.cleanupListeners_();
    this.cleanupSrcTemplates_();
    this.clearRenderedTemplates_();
  }

  /**
   * Configure the states and transitions in the state machine.
   * @param {!FiniteStateMachine} sm
   */
  setupStateMachine_(sm) {
    const {
      OVERLAY_OPEN_INPUT,
      OVERLAY_CLOSED,
      OVERLAY_OPEN_PICKER,
      STATIC,
    } = DatePickerState;
    const noop = () => {};
    sm.addTransition(STATIC, STATIC, noop);

    sm.addTransition(OVERLAY_CLOSED, OVERLAY_OPEN_INPUT, () => {
      this.setState_({isOpen: true, isFocused: false, focused: false})
          .then(() => {
            this.triggerEvent_(DatePickerEvent.ACTIVATE);
          });
    });
    sm.addTransition(OVERLAY_CLOSED, OVERLAY_OPEN_PICKER, () => {
      this.setState_({isOpen: true, isFocused: true, focused: true});
    });
    sm.addTransition(OVERLAY_CLOSED, OVERLAY_CLOSED, noop);


    sm.addTransition(OVERLAY_OPEN_INPUT, OVERLAY_OPEN_PICKER, () => {
      this.setState_({isOpen: true, isFocused: true, focused: true});
    });
    sm.addTransition(OVERLAY_OPEN_INPUT, OVERLAY_CLOSED, () => {
      this.updateDateFieldFocus_(null);
      this.setState_({isOpen: false, isFocused: false, focused: false});
    });
    sm.addTransition(OVERLAY_OPEN_INPUT, OVERLAY_OPEN_INPUT, noop);


    sm.addTransition(OVERLAY_OPEN_PICKER, OVERLAY_OPEN_PICKER, noop);
    sm.addTransition(OVERLAY_OPEN_PICKER, OVERLAY_OPEN_INPUT, () => {
      this.setState_({isFocused: false, focused: false});
    });
    sm.addTransition(OVERLAY_OPEN_PICKER, OVERLAY_CLOSED, () => {
      this.updateDateFieldFocus_(null);
      this.setState_({isOpen: false, isFocused: false, focused: false});
    });
  }

  /**
   * Helper method for transitioning states.
   * @param {!DatePickerState} state
   */
  transitionTo_(state) {
    if (this.mode_ == DatePickerMode.STATIC) {
      return;
    }
    this.stateMachine_.setState(state);
  }

  /** @override */
  buildCallback() {
    user().assert(isExperimentOn(this.win, TAG),
        `Experiment ${TAG} is disabled.`);

    this.action_ = Services.actionServiceForDoc(this.element);

    this.isRTL_ = isRTL(this.win.document);

    if (this.type_ === DatePickerType.SINGLE) {
      this.dateField_ = this.setupDateField_(DateFieldType.DATE);
      if (this.mode_ == DatePickerMode.OVERLAY &&
          this.dateField_ === null) {
        user().error(TAG,
            'Overlay single pickers must specify "input-selector" to ' +
            'an existing input element.');
      }
    } else if (this.type_ === DatePickerType.RANGE) {
      this.startDateField_ = this.setupDateField_(DateFieldType.START_DATE);
      this.endDateField_ = this.setupDateField_(DateFieldType.END_DATE);

      if (this.mode_ == DatePickerMode.OVERLAY &&
          (!this.startDateField_ || !this.endDateField_)) {
        user().error(TAG,
            'Overlay range pickers must "start-input-selector" and ' +
            '"end-input-selector" to existing start and end input elements.');
      }
    } else {
      user().error(TAG, 'Invalid date picker type', this.type_);
    }

    this.registerAction('setDate',
        invocation => this.handleSetDate_(invocation.args['date']));
    this.registerAction('setDates',
        invocation => this.handleSetDates_(
            invocation.args['startDate'],
            invocation.args['endDate']));
    this.registerAction('clear', () => this.handleClear_());

    return this.mutateElement(() => {
      // NOTE(cvializ): There is no standard date format for just the first letter
      // of the week-day. So we hack it in with this CSS class and don't apply the
      // CSS class if there is a week-day-format specified.
      this.element.classList.toggle(
          DEFAULT_WEEK_DAY_FORMAT_CSS,
          this.weekDayFormat_ == DEFAULT_WEEK_DAY_FORMAT);
      this.element.classList.toggle(FULLSCREEN_CSS, this.fullscreen_);
      this.element.appendChild(this.container_);

      this.state_ = this.getInitialState_();
      this.render(this.state_);
      this.setupListeners_();
    });
  }

  /**
   * Set the date via AMP action
   * @param {string} date
   */
  handleSetDate_(date) {
    const momentDate = this.createMoment_(date);
    this.setState_({date: momentDate});
    this.updateDateField_(this.dateField_, momentDate);
    this.triggerEvent_(DatePickerEvent.SELECT, this.getSelectData_(momentDate));
  }

  /**
   * Forgivingly parse an input string into a moment object, preferring the
   * date picker's configured format.
   * @param {string} input The input date string to parse
   * @return {?moment}
   */
  createMoment_(input) {
    if (!input) {
      return null;
    }
    const moment = this.moment_(input, this.format_);
    return moment.isValid() ? moment : this.moment_(input);
  }

  /**
   * Set one, both, or neither date via AMP action.
   * @param {?string} startDate
   * @param {?string} endDate
   */
  handleSetDates_(startDate, endDate) {
    const state = {};
    let momentStart, momentEnd;

    if (startDate) {
      momentStart = this.createMoment_(startDate);
      state.startDate = momentStart;
      this.updateDateField_(this.startDateField_, momentStart);
    }
    if (endDate) {
      momentEnd = this.createMoment_(endDate);
      this.updateDateField_(this.endDateField_, momentEnd);
      state.endDate = momentEnd;
    }

    // TODO(cvializ): check if valid date, blocked, outside range, etc
    this.setState_(state);
    if (momentStart && momentEnd) {
      const selectData = this.getSelectData_(momentStart, momentEnd);
      this.triggerEvent_(DatePickerEvent.SELECT, selectData);
    }
  }

  /**
   * Clear the values from the input fields and
   * trigger events with the empty values.
   */
  handleClear_() {
    this.setState_({date: null, startDate: null, endDate: null});
    this.clearDateField_(this.dateField_);
    this.clearDateField_(this.startDateField_);
    this.clearDateField_(this.endDateField_);
    this.triggerEvent_(DatePickerEvent.SELECT, null);

    this.setState_({focusedInput: this.ReactDatesConstants_.START_DATE});
    this.updateDateFieldFocus_(this.startDateField_, true);

    if (this.props_.reopenPickerOnClearDate) {
      this.triggerEvent_(DatePickerEvent.ACTIVATE);
      this.transitionTo_(DatePickerState.OVERLAY_OPEN_INPUT);
    }
  }


  /**
   * Get the initial value for properties that change during the lifetime of
   * the AMP element.
   */
  getInitialState_() {
    const date = this.dateField_ && this.dateField_.value ?
      this.createMoment_(this.dateField_.value) :
      null;
    const startDate = this.startDateField_ && this.startDateField_.value ?
      this.createMoment_(this.startDateField_.value) :
      null;
    const endDate = this.endDateField_ && this.endDateField_.value ?
      this.createMoment_(this.endDateField_.value) :
      null;

    return map({
      date,
      endDate,
      focused: this.mode_ == DatePickerMode.STATIC,
      focusedInput: this.ReactDatesConstants_.START_DATE,
      isFocused: false,
      isOpen: this.mode_ == DatePickerMode.STATIC,
      startDate,
    });
  }

  /**
   * Merge the supplied state object with the existing state and re-render the
   * React tree.
   * @param {!Object} newState
   */
  setState_(newState) {
    return this.render(Object.assign(this.state_, newState));
  }

  /**
   * Get the existing input, or create a hidden input for the date field.
   * @param {!DateFieldType} type The selector for the input field
   * @return {?Element}
   */
  setupDateField_(type) {
    const fieldSelector = this.element.getAttribute(`${type}-selector`);
    const existingField = this.getAmpDoc().getRootNode().querySelector(
        fieldSelector);
    if (existingField) {
      return existingField;
    }

    const form = this.element.closest('form');
    if (this.mode_ == DatePickerMode.STATIC && form) {
      const hiddenInput = this.document_.createElement('input');
      hiddenInput.type = 'hidden';
      hiddenInput.name = this.getHiddenInputId_(form, type);
      this.element.appendChild(hiddenInput);
      return hiddenInput;
    }

    return null;
  }

  /**
   * Generate a name for a hidden input.
   * Date pickers not in a form don't need named hidden inputs.
   * @param {!Element} form
   * @param {!DateFieldType} type
   * @return {string}
   * @private
   */
  getHiddenInputId_(form, type) {
    const id = this.element.id;
    const name = DateFieldNameByType[type];
    if (!form) {
      return '';
    }

    if (!form.elements[name]) {
      return name;
    }

    const alternativeName = `${id}-${name}`;
    if (id && !form.elements[alternativeName]) {
      return alternativeName;
    }

    user().error(TAG, `Multiple date-pickers with implicit ${name} fields ` +
        'need to have IDs');
    return '';
  }

  /**
   * Add the document-level event listeners to attach behavior to any referenced
   * input fields and to enable overlay open/close.
   * @private
   */
  setupListeners_() {
    const ampdoc = this.getAmpDoc();
    const root = ampdoc.getRootNode().documentElement || ampdoc.getBody();
    // Only add for overlay since click events just handle opening and closing
    if (this.mode_ == DatePickerMode.OVERLAY) {
      this.listen_(root, 'click', this.handleClick_.bind(this));
    }
    this.listen_(root, 'input', this.handleInput_.bind(this));
    // TODO(cvializ): Add aria message to use down arrow to trigger calendar.
    this.listen_(root, 'focusin', this.handleFocus_.bind(this));
    this.listen_(root, 'keydown', this.handleKeydown_.bind(this));
  }

  /**
   * True if the input is a field of this date picker.
   * @param {?Element} field
   * @return {boolean}
   * @private
   */
  isDateField_(field) {
    return (
      field === this.dateField_ ||
      field === this.startDateField_ ||
      field === this.endDateField_
    );
  }

  /**
   * Handle clicks inside and outside of the date picker to detect when to
   * open and close the date picker.
   * @param {!Event} e
   * @private
   */
  handleClick_(e) {
    const target = dev().assertElement(e.target);
    const clickWasInDatePicker = (
      this.element.contains(target) || this.isDateField_(target)
    );

    if (!clickWasInDatePicker) {
      this.transitionTo_(DatePickerState.OVERLAY_CLOSED);
    }
  }

  /**
   * Handle focus events in the document.
   * @param {!Event} e
   * @private
   */
  handleFocus_(e) {
    this.maybeTransitionWithFocusChange_(dev().assertElement(e.target));
  }

  /**
   * Switch between selecting the start and end dates,
   * and when to open and close the date picker.
   * @param {!Element} target
   */
  maybeTransitionWithFocusChange_(target) {
    if (this.isDateField_(target)) {
      if (target == this.startDateField_) {
        this.updateDateFieldFocus_(this.startDateField_);
        this.setState_({focusedInput: this.ReactDatesConstants_.START_DATE});
      } else if (target == this.endDateField_) {
        this.updateDateFieldFocus_(this.endDateField_);
        this.setState_({focusedInput: this.ReactDatesConstants_.END_DATE});
      } else if (target == this.dateField_) {
        this.updateDateFieldFocus_(this.dateField_);
      }
      this.transitionTo_(DatePickerState.OVERLAY_OPEN_INPUT);
    } else if (this.element.contains(target)) {
      this.transitionTo_(DatePickerState.OVERLAY_OPEN_PICKER);
    } else {
      this.updateDateFieldFocus_(null);
      this.transitionTo_(DatePickerState.OVERLAY_CLOSED);
    }
  }

  /**
   * For inputs that are valid dates, update the date-picker value.
   * @param {!Event} e
   * @private
   */
  handleInput_(e) {
    const target = dev().assertElement(e.target);
    if (!this.isDateField_(target) || target.type == 'hidden') {
      return;
    }

    const property =
        (target === this.dateField_ ? 'date' :
          (target === this.startDateField_ ? 'startDate' :
            (target === this.endDateField_ ? 'endDate' : '')));
    const moment = this.createMoment_(target.value);
    const value = moment.isValid() ? moment : null;
    this.setState_({[property]: value});
  }

  /**
   * Handle changing values of the attached input fields, and the hotkey for
   * closing the date picker.
   * @param {!Event} e
   * @private
   */
  handleKeydown_(e) {
    const target = dev().assertElement(e.target);
    if (this.isDateField_(target)) {
      this.handleInputKeydown_(e);
    } else {
      return this.handleDocumentKeydown_(e);
    }
  }

  /**
   * Close the date picker overlay when the escape key is pressed.
   * @param {!Event} e
   * @private
   */
  handleDocumentKeydown_(e) {
    if (e.keyCode == KeyCodes.ESCAPE &&
        this.mode_ == DatePickerMode.OVERLAY &&
        this.element.contains(this.document_.activeElement)) {
      this.transitionTo_(DatePickerState.OVERLAY_CLOSED);
    }
    return true;
  }

  /**
   * Handle the states for keyboard input.
   * @param {!Event} e
   * @private
   */
  handleInputKeydown_(e) {
    const target = dev().assertElement(e.target);
    if (!this.isDateField_(target) || target.type == 'hidden') {
      return;
    }

    if (e.keyCode == KeyCodes.DOWN_ARROW) {
      this.updateDateFieldFocus_(target);
      this.transitionTo_(DatePickerState.OVERLAY_OPEN_PICKER);
      if (this.mode_ === DatePickerMode.STATIC) {
        this.triggerEvent_(DatePickerEvent.ACTIVATE);
        const toFocus = this.container_.querySelector('[tabindex="0"]');
        if (toFocus) {
          this.mutateElement(() => toFocus./*OK*/focus());
        }
      }
      e.preventDefault();
    } else if (e.keyCode == KeyCodes.ESCAPE) {
      this.transitionTo_(DatePickerState.OVERLAY_CLOSED);
    } else {
      this.transitionTo_(DatePickerState.OVERLAY_OPEN_INPUT);
    }
  }

  /**
   * Listens for the specified event on the element.
   * @param {!EventTarget} element
   * @param {string} eventType
   * @param {function(!Event)} listener
   * @param {Object=} opt_evtListenerOpts
   * @private
   */
  listen_(element, eventType, listener, opt_evtListenerOpts) {
    this.unlisteners_.push(
        listen(element, eventType, listener, opt_evtListenerOpts));
  }

  /**
   * Remove the listeners that the date picker has created.
   * @private
   */
  cleanupListeners_() {
    this.unlisteners_.forEach(unlisten => unlisten());
    this.unlisteners_.length = 0;
  }

  /**
   * Fetch and parse any templates specified via the `src` attribute.
   * @return {!Promise}
   * @private
   */
  setupTemplates_() {
    return this.fetchSrc_()
        .then(json => this.parseSrcTemplates_(json))
        .then(parsedTemplates => {
          if (parsedTemplates) {
            const {srcTemplates, srcDefaultTemplate} = parsedTemplates;
            this.srcTemplates_ = srcTemplates;
            this.srcDefaultTemplate_ = srcDefaultTemplate;
          }

          this.templatesReadyResolver_();
        })
        .catch(error => {
          user().error(TAG, 'Failed fetching date src data', error);
        });
  }

  /**
   * Fetch and parse any attributes specified via the `src` attribute.
   * @return {!Promise}
   * @private
   */
  setupSrcAttributes_() {
    return this.fetchSrc_().then(json => {
      if (!json) {
        return;
      }

      // We should only set the value if the field is empty or absent.
      const shouldSetDate = !this.dateField_ || !this.dateField_.value;
      const shouldSetStartDate =
          !this.startDateField_ || !this.startDateField_.value;
      const shouldSetEndDate = !this.endDateField_ || !this.endDateField_.value;

      const date = shouldSetDate ? json['date'] : null;
      const startDate = shouldSetStartDate ? json['startDate'] : null;
      const endDate = shouldSetEndDate ? json['endDate'] : null;

      if (date) {
        this.handleSetDate_(date);
      }

      if (startDate || endDate) {
        this.handleSetDates_(startDate, endDate);
      }

      this.setState_({
        date: this.createMoment_(date),
        startDate: this.createMoment_(startDate),
        endDate: this.createMoment_(endDate),
      });
    });
  }

  /**
   * Fetch the JSON from the URL specified in the src attribute.
   * @return {!Promise<!JsonObject|!Array<JsonObject>>}
   * @private
   */
  fetchSrc_() {
    return this.element.getAttribute('src') ?
      batchFetchJsonFor(this.getAmpDoc(), this.element) :
      Promise.resolve();
  }

  /**
   * Create an array of objects mapping dates to templates.
   * @param {!JsonObject|!Array<JsonObject>} srcJson
   * @return {?{srcTemplates: !Array<!DateTemplateMapDef>, srcDefaultTemplate: ?Element}}
   * @private
   */
  parseSrcTemplates_(srcJson) {
    const templates = srcJson && srcJson['templates'];
    if (!templates) {
      return null;
    }
    const ampdoc = this.getAmpDoc();
    const srcTemplates = templates
        .filter(t => t.dates)
        .map(t => ({
          dates: new DatesList(t.dates),
          template: ampdoc.getRootNode().querySelector(
              `#${escapeCssSelectorIdent(t.id)}[date-template]`),
        }));

    const srcDefaultTemplate = templates
        .filter(t => t.dates == null)
        .map(t => ampdoc.getElementById(t.id))[0];

    return {
      srcTemplates,
      srcDefaultTemplate,
    };
  }

  /**
   * Create a new map to store rendered templates and drop the old reference
   * for garbage collection.
   * @private
   */
  clearRenderedTemplates_() {
    this.renderedTemplates_ = map();
  }

  /**
   * Cleanup the resources allocated for the src templates.
   * @private
   */
  cleanupSrcTemplates_() {
    this.srcTemplates_ = [];
    this.srcDefaultTemplate_ = null;
  }

  /**
   * Iterate over template element children and map their IDs
   * to a list of dates
   * @param {!NodeList<!Element>} templates
   * @return {!Array<!DateTemplateMapDef>}
   * @private
   */
  parseElementTemplates_(templates) {
    const parsed = [];
    iterateCursor(templates,
        template => parsed.push(this.parseElementTemplate_(template)));
    return parsed;
  }

  /**
   * Parse a date picker template element.
   * @param {!Element} template
   * @return {!DateTemplateMapDef}
   * @private
   */
  parseElementTemplate_(template) {
    const dates = template.getAttribute('dates').split(DATE_SEPARATOR);
    return {
      dates: new DatesList(dates),
      template,
    };
  }

  /**
   * Get the initial values for properties whose values do not change during
   * the lifetime of the AMP element. Convert the kebab-case html attributes to
   * camelCase React props.
   * @return {!Object} Initialized props for the react component.
   * @private
   */
  getProps_() {
    const props = attributesToForward.reduce((acc, attr) => {
      const value = this.element.getAttribute(attr);
      if (value != null) {
        acc[dashToCamelCase(attr)] = value || true;
      }
      return acc;
    }, {});

    if (this.hasInfoTemplate_()) {
      props.renderCalendarInfo = this.renderInfo;
    }

    if (this.fullscreen_) {
      props.orientation = 'verticalScrollable';
      props.withFullScreenPortal = true;
    }

    props.reopenPickerOnClearDate = this.openAfterClear_;
    props.keepOpenOnDateSelect = this.openAfterSelect_;

    return props;
  }

  /**
   * Respond to user interactions that change a DateRangePicker's dates.
   * @param {!DatesChangeDetailsDef} param
   */
  onDatesChange({startDate, endDate}) {
    const isFinalSelection = (!this.props_.keepOpenOnDateSelect &&
        this.state_.focusedInput != this.ReactDatesConstants_.END_DATE);

    let containsBlocked = false;

    if (startDate && !this.allowBlockedRanges_) {
      this.iterateDateRange_(startDate, endDate, index => {
        if (this.blocked_.contains(index)) {
          containsBlocked = true;
        }
      });
    }

    if (containsBlocked) {
      return;
    }

    const selectData = this.getSelectData_(startDate, endDate);
    this.triggerEvent_(DatePickerEvent.SELECT, selectData);
    this.setState_({
      startDate,
      endDate,
      isFocused: this.mode_ == DatePickerMode.STATIC || !isFinalSelection,
    });
    this.updateDateField_(this.startDateField_, startDate);
    this.updateDateField_(this.endDateField_, endDate);

    if (isFinalSelection &&
        startDate &&
        endDate) {
      this.transitionTo_(DatePickerState.OVERLAY_CLOSED);
      this.triggerEvent_(DatePickerEvent.DEACTIVATE);
    }
  }

  /**
   * Respond to user interactions that change a SingleDatePicker's dates.
   * @param {?moment} date
   */
  onDateChange(date) {
    this.triggerEvent_(DatePickerEvent.SELECT, this.getSelectData_(date));
    this.setState_({date});
    this.updateDateField_(this.dateField_, date);

    if (!this.props_.keepOpenOnDateSelect) {
      this.transitionTo_(DatePickerState.OVERLAY_CLOSED);
    }
  }

  /**
   * Select the given input to be focused.
   * @param {?string} focusedInput The currently focused input.
   */
  onFocusChange(focusedInput) {
    const {START_DATE, END_DATE} = this.ReactDatesConstants_;
    const focusedField =
      (focusedInput === START_DATE ? this.startDateField_ :
        (focusedInput === END_DATE ? this.endDateField_ : this.dateField_));
    this.updateDateFieldFocus_(focusedField, this.state_.isOpen);

    this.setState_({
      focusedInput: !focusedInput ?
        this.ReactDatesConstants_.START_DATE :
        focusedInput,
      focused: this.mode_ == DatePickerMode.STATIC,
    });
  }

  /**
   * Apply the focus CSS class to the given field and unapply it from
   * the others.
   * @param {?Element} focusedField The field to apply focus to
   * @param {boolean=} opt_toggle
   * @private
   */
  updateDateFieldFocus_(focusedField, opt_toggle) {
    if (this.mode_ == DatePickerMode.STATIC) {
      return;
    }

    const toggle = typeof opt_toggle != 'undefined' ? opt_toggle : true;
    this.toggleDateFieldClass_(this.startDateField_, INPUT_FOCUS_CSS, false);
    this.toggleDateFieldClass_(this.endDateField_, INPUT_FOCUS_CSS, false);
    this.toggleDateFieldClass_(this.dateField_, INPUT_FOCUS_CSS, false);
    this.toggleDateFieldClass_(focusedField, INPUT_FOCUS_CSS, toggle);
  }

  /**
   * Trigger the activate AMP action. Triggered when the overlay opens or when
   * the static date picker should receive focus from the attached input.
   * @param {string} name
   * @param {?BindDatesDetails|?BindDateDetails=} opt_data
   * @private
   */
  triggerEvent_(name, opt_data = null) {
    const event = createCustomEvent(this.win, `${TAG}.${name}`, opt_data);
    this.action_.trigger(this.element, name, event, ActionTrust.HIGH);
  }

  /**
   * Create the response for the 'select' AMP event.
   * @param {?moment} dateOrStartDate
   * @param {?moment=} endDate
   * @return {?BindDatesDetails|?BindDateDetails}
   * @private
   */
  getSelectData_(dateOrStartDate, endDate = null) {
    if (this.type_ == DatePickerType.SINGLE) {
      return this.getBindDate_(dateOrStartDate);
    } else if (this.type_ == DatePickerType.RANGE) {
      return dateOrStartDate ?
        this.getBindDates_(dateOrStartDate, endDate) : null;
    } else {
      dev().error(TAG, 'Invalid date picker type');
      return null;
    }
  }

  /**
   * Toggle the provided class on the given input
   * @param {?Element} field An input field
   * @param {string} className A css classname
   * @param {boolean=} value
   * @private
   */
  toggleDateFieldClass_(field, className, value) {
    if (field) {
      this.mutateElement(() => field.classList.toggle(className, value), field);
    }
  }

  /**
   * Assign the provided date value to the given input.
   * input[type="date"] expects YYYY-MM-DD for setting its value,
   * so it is special-cased here.
   * @param {?Element} field An input field
   * @param {?moment} date A date value
   * @private
   */
  updateDateField_(field, date) {
    if (field) {
      field.value = (field.type == 'date' ?
        this.getFormattedDate_(date, DEFAULT_FORMAT, DEFAULT_LOCALE) :
        this.getFormattedDate_(date));
    }
  }

  /**
   * Clear the value from the given input field.
   * @param {?Element} field An input field
   * @private
   */
  clearDateField_(field) {
    if (field) {
      field.value = '';
    }
  }

  /**
   * Create a date object to be consumed by AMP actions and events or amp-bind.
   * @param {?moment} date
   * @return {?BindDateDetails}
   * @private
   */
  getBindDate_(date) {
    if (!date) {
      return null;
    }

    const template = this.getDayTemplate_(date);
    const details = new BindDateDetails(
        this.getFormattedDate_(date), template && template.id);
    return details;
  }

  /**
   * Create an array for date objects to be consumed by AMP actions and events
   * or amp-bind.
   * @param {!moment} startDate
   * @param {?moment} endDate
   * @return {!BindDatesDetails}
   * @private
   */
  getBindDates_(startDate, endDate) {
    const dates = [];
    this.iterateDateRange_(startDate, endDate, index => {
      dates.push(this.getBindDate_(index));
    });
    return new BindDatesDetails(dates);
  }

  /**
   * Iterate over the dates between a start and end date.
   * @param {!moment} startDate
   * @param {?moment} endDate
   * @param {function(!moment)} cb
   * @private
   */
  iterateDateRange_(startDate, endDate, cb) {
    const normalizedEndDate = endDate || startDate;
    if (!normalizedEndDate.isAfter(startDate)) {
      return;
    }

    const index = startDate.clone();
    while (!index.isAfter(normalizedEndDate)) {
      cb(index.clone());
      index.add(1, 'days');
    }
  }

  /**
   * Formats a date in the page's locale and the element's configured format.
   * @param {?moment} date
   * @param {string=} opt_format
   * @param {string=} opt_locale
   * @return {string}
   * @private
   */
  getFormattedDate_(date, opt_format, opt_locale) {
    if (!date) {
      return '';
    }
    const format = opt_format || this.format_;
    const isUnixTimestamp = format.match(/[Xx]/);
    const locale =
        isUnixTimestamp ? DEFAULT_LOCALE : (opt_locale || this.locale_);
    return date.clone().locale(locale).format(format);
  }

  /**
   * Render a day in the calendar view.
   * @param {!moment} date
   */
  renderDay(date) {
    const key = date.format(DEFAULT_FORMAT);
    const cachedDay = this.renderedTemplates_[key];
    if (cachedDay) {
      return cachedDay;
    }

    const templatePromise =
        this.templatesReadyPromise_.then(() => this.renderDayTemplate_(date));
    const rendered = this.renderPromiseIntoReact_(
        templatePromise, date.format('D'));

    this.renderedTemplates_[key] = rendered;
    return rendered;
  }

  /**
   * @param {!Array<!DateTemplateMapDef>} templates
   * @param {!moment} date
   * @return {?Element}
   * @private
   */
  getTemplate_(templates, date) {
    for (let i = 0; i < templates.length; i++) {
      if (templates[i].dates.contains(date)) {
        return templates[i].template;
      }
    }
    return null;
  }

  /**
   * Get the template tag corresponding to a given date.
   * @param {!moment} date
   * @return {?Element}
   * @private
   */
  getDayTemplate_(date) {
    return (
      this.getTemplate_(this.srcTemplates_, date) ||
      this.getTemplate_(this.elementTemplates_, date) ||
      this.srcDefaultTemplate_ ||
      this.element.querySelector('[date-template][default]')
    );
  }

  /**
   * Render the template that corresponds to the date with its data.
   * @param {!moment} date
   * @private
   */
  renderDayTemplate_(date) {
    const template = this.getDayTemplate_(date);
    const data = this.getDayTemplateData_(date);
    return this.renderTemplate_(template, data, date.format('D'));
  }

  /**
   * Render the info section of the calendar view.
   */
  renderInfo() {
    if (!this.infoTemplatePromise_) {
      this.infoTemplatePromise_ = this.renderInfoTemplate_();
    }
    return this.renderPromiseIntoReact_(this.infoTemplatePromise_);
  }

  /**
   * Returns `true` if an info template exists.
   * @return {boolean}
   * @private
   */
  hasInfoTemplate_() {
    return this.templates_.hasTemplate(this.element, '[info-template]');
  }

  /**
   * Render any template for the info section of the date picker.
   * @return {!Promise<string>}
   * @private
   */
  renderInfoTemplate_() {
    const template = this.element.querySelector('[info-template]');
    if (template) {
      return this.renderTemplateElement_(template)
          .then(element => {
            element.classList.add(INFO_TEMPLATE_AREA_CSS);
            return this.getRenderedTemplateString_(element);
          });
    } else {
      return Promise.resolve('');
    }
  }

  /**
   * Render the given template into an element with the given data.
   * @param {!Element} template
   * @param {!JsonObject=} opt_data
   * @return {!Promise<!Element>}
   * @private
   */
  renderTemplateElement_(template, opt_data = /** @type {!JsonObject} */ ({})) {
    return this.templates_.renderTemplate(template, opt_data);
  }

  /**
   * Render the given template with the given data. If the template does not
   * exist, use a fallback string.
   * The fallback string will be rendered directly into the DOM. Note that
   * it is currently just a date or an empty string, but if extended beyond
   * those cases, it should be sanitized.
   * @param {?Element} template
   * @param {!JsonObject=} opt_data
   * @param {string=} opt_fallback
   * @return {!Promise<string>}
   * @private
   */
  renderTemplate_(template, opt_data, opt_fallback = '') {
    if (template) {
      return this.renderTemplateElement_(template, opt_data)
          .then(rendered => this.getRenderedTemplateString_(rendered));
    } else {
      return Promise.resolve(opt_fallback);
    }
  }

  /**
   * Convert a rendered template element to a string
   * @param {!Element} rendered
   * @return {string}
   * @private
   */
  getRenderedTemplateString_(rendered) {
    return rendered./*OK*/outerHTML;
  }

  /**
   * Create the data needed to render a day template
   * @param {!moment} date
   * @return {!JsonObject}
   * @private
   */
  getDayTemplateData_(date) {
    const templateData = FORMAT_STRINGS.reduce((acc, key) => {
      if (key === 'X' || key === 'x') {
        const defaultLocaleDate = date.clone().locale(DEFAULT_LOCALE);
        acc[key] = defaultLocaleDate.format(key);
      } else {
        acc[key] = date.format(key);
      }
      return acc;
    }, {});
    templateData.isHighlighted = this.highlighted_.contains(date);
    templateData.isBlocked = this.blocked_.contains(date);

    return templateData;
  }

  /**
   * Render asynchronous HTML into a React component.
   * @param {!Promise<string>} promise
   * @param {string=} opt_initial
   * @return {React.Component}
   * @private
   */
  renderPromiseIntoReact_(promise, opt_initial) {
    if (!this.templateThen_) {
      this.templateThen_ = html => this.react_.createElement('div', {
        // This should be safe because this HTML is rendered through
        // amp-mustache and is sanitized.
        dangerouslySetInnerHTML: {__html: html},
      });
    }

    return this.react_.createElement(createDeferred(), {
      initial: opt_initial,
      promise,
      then: this.templateThen_,
    });
  }

  /**
   * Notify any listener (like bind) that a DOM update occurred.
   */
  onMount() {
    if (this.mode_ == DatePickerMode.OVERLAY) {
      // REVIEW: this should be ok, since opening the overlay requires a
      // user interaction, and this won't run until then
      Services.bindForDocOrNull(this.element).then(bind => {
        if (bind) {
          return bind.scanAndApply([this.element], [this.element]);
        }
      });
    } else {
      const renderedEvent = createCustomEvent(
          this.win,
          AmpEvents.DOM_UPDATE,
          /* detail */ null,
          {bubbles: true});
      this.element.dispatchEvent(renderedEvent);
    }
  }

  /**
   * Render the configured date picker component.
   * @param {?Object=} opt_additionalProps
   * @return {!Promise}
   */
  render(opt_additionalProps) {
    const props = Object.assign({}, this.props_, opt_additionalProps);
    const shouldBeOpen = props.isOpen || this.mode_ == DatePickerMode.STATIC;
    const Picker = shouldBeOpen ? this.pickerClass_ : null;

    return this.mutateElement(() => {
      if (Picker) {
        // TODO(cvializ): When rendered with React, the picker expands to fit the number of
        // weeks for that month. When rendered with Preact, the picker expands 1 behind where it
        // should for the number of weeks in the month. Fix this.
        this.reactRender_(
            this.react_.createElement(Picker, Object.assign({}, {
              date: props.date,
              startDate: props.startDate,
              endDate: props.endDate,
              isRTL: this.isRTL_,
              onDateChange: this.onDateChange,
              onDatesChange: this.onDatesChange,
              onFocusChange: this.onFocusChange,
              onMount: this.onMount,
              renderDay: this.renderDay,
              blocked: this.blocked_,
              highlighted: this.highlighted_,
              firstDayOfWeek: this.firstDayOfWeek_,
              daySize: this.daySize_,
              weekDayFormat: this.weekDayFormat_,
              isFocused: props.isFocused, // should automatically focus
              focused: props.focused,
            }, props)),
            this.container_);
      } else {
        this.reactRender_(null, this.container_);
      }
    });
  }
}

AMP.extension(TAG, '0.1', AMP => {
  AMP.registerElement(TAG, AmpDatePicker, CSS);
});
