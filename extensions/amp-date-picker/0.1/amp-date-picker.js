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

import {ActionTrust} from '../../../src/action-trust';
import {AmpEvents} from '../../../src/amp-events';
import {CSS} from '../../../build/amp-date-picker-0.1.css';
import {DEFAULT_LOCALE, DEFAULT_FORMAT, FORMAT_STRINGS} from './constants';
import {DatesList} from './dates-list';
import {Layout} from '../../../src/layout';
import {Services} from '../../../src/services';
import {childElementByAttr, isRTL, removeElement} from '../../../src/dom';
import {createCustomEvent} from '../../../src/event-helper';
import {createDateRangePicker} from './date-range-picker';
import {createDeferred} from './react-utils';
import {createSingleDatePicker} from './single-date-picker';
import {fetchBatchedJsonFor} from '../../../src/batched-json';
import {dashToCamelCase} from '../../../src/string';
import {isExperimentOn} from '../../../src/experiments';
import {map} from '../../../src/utils/object';
import {requireExternal} from '../../../src/module';
import {sanitizeFormattingHtml} from '../../../src/sanitizer';
import {toArray} from '../../../src/types';
import {user} from '../../../src/log';
import '../../../third_party/react-dates/bundle';


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

/**
 * @typedef {{
 *   date: string,
 *   id: ?string
 * }}
 */
let BindDatesDef;

const TAG = 'amp-date-picker';
const DATE_SEPARATOR = ' ';

const attributesToForward = [
  'anchor-direction',
  'auto-focus',
  'disabled',
  'enable-outside-days',
  'horizontal-margin',
  'initial-date',
  'initial-end-date',
  'initial-start-date',
  'initial-visible-month',
  'keep-open-on-date-select',
  'max',
  'min',
  'minimum-nights',
  'month-format',
  'number-of-months',
  'orientation',
  'reopen-picker-on-clear-date',
  'required',
  'screen-reader-input-message',
  'show-clear-date',
  'show-clear-dates',
  'show-default-input-icon',
  'with-full-screen-portal',
  'with-portal',
  'day-size',
  'week-day-format',
];

const DEFAULT_DATE_SIZE = 45; // px

const DEFAULT_FIRST_DAY_OF_WEEK = 0; // Sunday

class AmpDatePicker extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private @const */
    this.ampdoc_ = Services.ampdoc(this.element);

    /** @private @const */
    this.win_ = this.ampdoc_.win;

    /** @private @const */
    this.moment_ = requireExternal('moment');

    /** @private @const */
    this.react_ = requireExternal('react');

    /** @private @const */
    this.reactRender_ = requireExternal('react-dom').render;

    /** @private @const */
    this.ReactDates_ = requireExternal('react-dates');

    /** @private @const */
    this.action_ = Services.actionServiceForDoc(element);

    /** @private @const */
    this.templates_ = Services.templatesFor(this.win_);

    /** @const */
    this.onDateChange = this.onDateChange.bind(this);

    /** @const */
    this.onDatesChange = this.onDatesChange.bind(this);

    /** @const */
    this.renderDay = this.renderDay.bind(this);

    /** @private @const */
    this.renderedDays_ = map();

    /** @const */
    this.renderInfo = this.renderInfo.bind(this);

    /** @private {?Promise<string>} */
    this.infoTemplatePromise_ = null;

    /** @private @const */
    this.format_ = this.element.getAttribute('format') || DEFAULT_FORMAT;

    /** @private @const */
    this.firstDayOfWeek_ = this.element.getAttribute('first-day-of-week') ||
        DEFAULT_FIRST_DAY_OF_WEEK;

    this.daySize_ = this.element.getAttribute('day-size') || DEFAULT_DATE_SIZE;

    const blocked = this.element.getAttribute('blocked');
    /** @private @const */
    this.blocked_ = new DatesList(
        blocked ? blocked.split(DATE_SEPARATOR) : []);

    const highlighted = this.element.getAttribute('highlighted');
    /** @private @const */
    this.highlighted_ = new DatesList(
        highlighted ? highlighted.split(DATE_SEPARATOR) : []);

    /** @private @const */
    this.container_ = this.element.ownerDocument.createElement('div');

    const type = this.element.getAttribute('type') || 'single';
    /** @private @const */
    this.picker_ = (type === 'range' ?
      createDateRangePicker() :
      createSingleDatePicker());

    /** @private @const */
    this.props_ = this.getProps_();

    /** @private @const */
    this.elementTemplates_ = this.parseElementTemplates_();

    /** @private {!Array<!DateTemplateMapDef>} */
    this.srcTemplates_ = [];

    /** @private {?Element} */
    this.srcDefaultTemplate_ = null;

    /** @private @const */
    this.isRTL_ = isRTL(/** @type {!Document} */ (this.ampdoc_.getRootNode()));

    /** @private {?function(?):?} */
    this.templateThen_ = null;

    /** @private @const */
    this.registerAction_ = this.registerAction.bind(this);

    const locale = this.element.getAttribute('locale') || DEFAULT_LOCALE;
    this.moment_.locale(locale);
  }

  /** @override */
  isLayoutSupported(layout) {
    return layout == Layout.CONTAINER;
  }

  /** @override */
  buildCallback() {
    user().assert(isExperimentOn(this.win, TAG),
        `Experiment ${TAG} is disabled.`);

    this.element.appendChild(this.container_);
    this.render();
    this.element.setAttribute('i-amphtml-date-picker-attached', '');
  }

  /** @override */
  layoutCallback() {
    return this.parseSrcTemplates_(this.fetchSrcTemplates_());
  }

  /**
   * Fetch the JSON from the URL specified in the src attribute.
   * @return {?Promise<!JsonObject|!Array<JsonObject>>}
   */
  fetchSrcTemplates_() {
    if (this.element.getAttribute('src')) {
      return fetchBatchedJsonFor(this.ampdoc_, this.element);
    } else {
      return null;
    }
  }

  /**
   * Create an array of objects mapping dates to templates.
   * @param {?Promise<!JsonObject|!Array<JsonObject>>} srcTemplatePromise
   * @return {!Promise<undefined>}
   */
  parseSrcTemplates_(srcTemplatePromise) {
    if (!srcTemplatePromise) {
      return Promise.resolve();
    }

    return srcTemplatePromise.then(srcJson => {
      const templates = srcJson && srcJson['templates'];
      if (!templates) {
        return;
      }

      const srcTemplates = templates
          .filter(t => t.dates)
          .map(t => ({
            dates: new DatesList(t.dates),
            template: this.ampdoc_.getRootNode().querySelector(
                `#${t.id}[date-template]`),
          }));
      this.srcTemplates_ = srcTemplates;

      const defaultTemplate = templates
          .filter(t => t.dates == null)
          .map(t => this.ampdoc_.getElementById(t.id))[0];
      this.srcDefaultTemplate_ = defaultTemplate;
    }).catch(error => {
      // TODO(cvializ): better message?
      user().error(TAG, 'Failed fetching Date Picker data', error);
    });
  }

  /**
   * Iterate over template element children and map their IDs
   * to a list of dates
   * @return {!Array<!DateTemplateMapDef>}
   */
  parseElementTemplates_() {
    const templates = toArray(
        this.element.querySelectorAll('[date-template][dates]'));

    return templates.map(template => {
      const dates = template.getAttribute('dates').split(DATE_SEPARATOR);
      return {
        dates: new DatesList(dates),
        template,
      };
    });
  }

  /**
   * Convert the kebab-case html attributes to camelCase React props,
   * and consume the placeholder input elements.
   * @return {!Object} Initialized props for the react component.
   */
  getProps_() {
    const props = attributesToForward.reduce((acc, attr) => {
      const value = this.element.getAttribute(attr);
      if (value != null) {
        acc[dashToCamelCase(attr)] = value || true;
      }
      return acc;
    }, {});

    const startPlaceholder = childElementByAttr(
        this.element, 'amp-date-placeholder-start');
    if (startPlaceholder) {
      props.startDateId = startPlaceholder.id;
      props.startDatePlaceholderText = startPlaceholder.placeholder;
      const value = this.moment_(startPlaceholder.value);
      if (value.isValid()) {
        props.initialStartDate = value;
      }
      removeElement(startPlaceholder);
    }
    const endPlaceholder = childElementByAttr(
        this.element, 'amp-date-placeholder-end');
    if (endPlaceholder) {
      props.endDateId = endPlaceholder.id;
      props.endDatePlaceholderText = endPlaceholder.placeholder;
      const value = this.moment_(endPlaceholder.value);
      if (value.isValid()) {
        props.initialEndDate = value;
      }
      removeElement(endPlaceholder);
    }
    const datePlaceholder = childElementByAttr(
        this.element, 'amp-date-placeholder');
    if (datePlaceholder) {
      props.id = datePlaceholder.id;
      props.placeholder = datePlaceholder.placeholder;
      const value = this.moment_(datePlaceholder.value);
      if (value.isValid()) {
        props.initialDate = value;
      }
      removeElement(datePlaceholder);
    }

    return props;
  }

  /**
   * Respond to user interactions that change a DateRangePicker's dates.
   * @param {!DatesChangeDetailsDef} details
   */
  onDatesChange(details) {
    const name = 'select';
    const {startDate, endDate} = details;
    const dates = startDate ? this.getBindDates_(startDate, endDate) : [];
    const event = createCustomEvent(this.win_, `${TAG}.${name}`, {
      dates,
      start: dates[0],
      end: dates[dates.length - 1],
    });
    this.action_.trigger(this.element, name, event, ActionTrust.HIGH);
  }

  /**
   * Respond to user interactions that change a SingleDatePicker's dates.
   * @param {!DateChangeDetailsDef} details
   */
  onDateChange(details) {
    const name = 'select';
    const {date} = details;
    const event = createCustomEvent(
        this.win_, `${TAG}.${name}`, this.getBindDate_(date));
    this.action_.trigger(this.element, name, event, ActionTrust.HIGH);
  }

  /**
   * Create a date object to be consumed by AMP actions and events or amp-bind.
   * @param {?moment} date
   * @return {?BindDatesDef}
   */
  getBindDate_(date) {
    if (!date) {
      return null;
    }

    const template = this.getDayTemplate_(date);
    return {
      date: this.getFormattedDate_(date),
      id: template && template.id,
    };
  }

  /**
   * Create an array for date objects to be consumed by AMP actions and events
   * or amp-bind.
   * @param {!moment} startDate
   * @param {?moment} endDate
   * @return {!Array<!BindDatesDef>}
   */
  getBindDates_(startDate, endDate) {
    const dates = [];
    const normalizedEndDate = endDate || startDate;
    if (!normalizedEndDate.isAfter(startDate)) {
      return dates;
    }

    const index = startDate.clone();
    while (!index.isAfter(normalizedEndDate)) {
      dates.push(this.getBindDate_(index));
      index.add(1, 'days');
    }

    return dates;
  }

  /**
   * Formats a date in the page's locale and the element's configured format.
   * @param {?moment} date
   * @return {string}
   */
  getFormattedDate_(date) {
    const isUnixTimestamp = this.format_.match(/[Xx]/);
    return date && (isUnixTimestamp ?
      date.clone().locale(DEFAULT_LOCALE) : date).format(this.format_);
  }

  /**
   * Render a day in the calendar view.
   * @param {!moment} day
   */
  renderDay(day) {
    const key = day.format(DEFAULT_FORMAT);
    const mapDay = this.renderedDays_[key];
    if (mapDay) {
      return mapDay;
    }

    const dayTemplateData = this.getDayTemplateData_(day);
    const templatePromise = this.renderDayTemplate_(day, dayTemplateData);
    this.renderedDays_[key] = this.renderPromiseIntoReact_(templatePromise);
    return this.renderedDays_[key];
  }

  /**
   * Returns `true` if a day template exists.
   * @return {boolean}
   */
  hasDayTemplate_() {
    return this.templates_.hasTemplate(this.element, '[date-template]');
  }

  /**
   * @param {!Array<!DateTemplateMapDef>} templates
   * @param {!moment} date
   * @return {?Element}
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
   * @param {!moment} day
   * @param {!JsonObject} data
   */
  renderDayTemplate_(day, data) {
    const template = this.getDayTemplate_(day);
    return this.renderTemplate_(template, data, day.format('D'));
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
   */
  hasInfoTemplate_() {
    return this.templates_.hasTemplate(this.element, '[info-template]');
  }

  /** @return {!Promise<string>} */
  renderInfoTemplate_() {
    const template = this.element.querySelector('[info-template]');
    return this.renderTemplate_(template);
  }

  /**
   * Render the given template with the given data. If the template does not
   * exist, use a fallback string.
   * The fallback string will be rendered directly into the DOM so it must
   * not contain unsanitized user-supplied values.
   * @param {?Element} template
   * @param {!JsonObject=} opt_data
   * @param {string=} opt_fallback
   * @return {!Promise<string>}
   */
  renderTemplate_(template, opt_data, opt_fallback = '') {
    if (template) {
      const data = opt_data || /** @type {!JsonObject} */ ({});
      return this.templates_.renderTemplate(template, data)
          .then(rendered => {
            const renderedEvent = createCustomEvent(
                this.win_,
                AmpEvents.DOM_UPDATE,
                /* detail */ null,
                {bubbles: true});
            this.container_.dispatchEvent(renderedEvent);
            return rendered./*REVIEW*/outerHTML;
          });
    } else {
      return Promise.resolve(sanitizeFormattingHtml(opt_fallback));
    }
  }

  /**
   * Create the data needed to render a day template
   * @param {!moment} date
   * @return {!JsonObject}
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
   * @param {!Promise<string>} templatePromise
   * @return {React.Component}
   */
  renderPromiseIntoReact_(templatePromise) {
    if (!this.templateThen_) {
      this.templateThen_ = html => this.react_.createElement('div', {
        // This should be safe because this HTML is rendered through
        // amp-mustache and is sanitized.
        dangerouslySetInnerHTML: {__html: html},
      });
    }

    return this.react_.createElement(createDeferred(), {
      promise: templatePromise,
      then: this.templateThen_,
    });
  }

  /**
   * Render the configured date picker component.
   * @param {!Object=} opt_additionalProps
   */
  render(opt_additionalProps) {
    const Picker = this.picker_;
    const props = Object.assign({}, this.props_, opt_additionalProps);

    if (this.hasDayTemplate_()) {
      props.renderDay = this.renderDay;
    }
    if (this.hasInfoTemplate_()) {
      props.renderCalendarInfo = this.renderInfo;
    }

    this.reactRender_(
        this.react_.createElement(Picker, Object.assign({}, props, {
          isRTL: this.isRTL_,
          registerAction: this.registerAction_,
          onDateChange: this.onDateChange,
          onDatesChange: this.onDatesChange,
          blocked: this.blocked_,
          highlighted: this.highlighted_,
          firstDayOfWeek: this.firstDayOfWeek_,
          daySize: this.daySize_,
        })),
        this.container_);
  }
}

AMP.extension(TAG, '0.1', AMP => {
  AMP.registerElement(TAG, AmpDatePicker, CSS);
});
