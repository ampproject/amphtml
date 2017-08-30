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
import {createDeferred} from './react-utils';
import {Services} from '../../../src/services';
import {createSingleDatePicker} from './single-date-picker';
import {createDateRangePicker} from './date-range-picker';
import {createCustomEvent} from '../../../src/event-helper';
import {installStylesForDoc} from '../../../src/style-installer';
import {fetchBatchedJsonFor} from '../../../src/batched-json';
import {
  childElementByAttr,
  iterateCursor,
  scopedQuerySelector,
  scopedQuerySelectorAll,
} from '../../../src/dom';
import {toArray} from '../../../src/types';
import {dashToCamelCase} from '../../../src/string';
import {DatesList} from './dates-list';
import {map} from '../../../src/utils/object';
import {user} from '../../../src/log';

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
 *   id: string
 * }}
 */
let BindDatesDef;

const TAG = 'amp-date-picker';
const SERVICE_TAG = 'amp-date-picker-service';
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

class DatePicker {
  /** @param {!AmpElement} element */
  constructor(element) {
    this.element = element;

    /** @private @const */
    this.ampdoc_ = Services.ampdoc(this.element);

    /** @private @const */
    this.win_ = this.ampdoc_.win;

    /** @private @const */
    this.moment_ = this.win_.moment;

    /** @private @const */
    this.react_ = this.win_.React;

    /** @private @const */
    this.reactRender_ = this.win_.ReactRender;

    /** @private @const */
    this.ReactDates_ = this.win_.ReactDates;

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

    /** @private @const */
    this.format_ = this.element.getAttribute('format') || DEFAULT_FORMAT;

    /** @private @const */
    this.firstDayOfWeek_ = this.element.getAttribute('first-day-of-week') || 0;

    const blocked = this.element.getAttribute('blocked');
    /** @private @const */
    this.blocked_ = new DatesList(
        this.ReactDates_,
        this.moment_,
        blocked ? blocked.split(DATE_SEPARATOR) : []);

    const highlighted = this.element.getAttribute('highlighted');
    /** @private @const */
    this.highlighted_ = new DatesList(
        this.ReactDates_,
        this.moment_,
        highlighted ? highlighted.split(DATE_SEPARATOR) : []);

    /** @private @const */
    this.container_ = this.element.ownerDocument.createElement('div');

    const type = this.element.tagName;
    /** @private @const */
    this.picker_ = (type === 'AMP-DATE-RANGE' ? createDateRangePicker :
        createSingleDatePicker)(
        this.win_.React, this.win_.PropTypes, this.win_.ReactDates,
        this.win_.ReactDatesConstants, this.win_.moment);

    /** @private @const */
    this.props_ = this.getProps_();

    /** @private @const */
    this.elementTemplates_ = this.parseElementTemplates_();

    /** @private @const */
    this.srcTemplates_ = [];

    /** @private @const */
    this.srcDefaultTemplate_ = null;

    /** @private @const */
    this.isRTL_ = this.element.ownerDocument.dir === 'rtl';

    /** @private @const */
    this.srcTemplatePromise_ = this.fetchSrcTemplates_();
    this.parseSrcTemplates_();

    /** @private @const */
    this.installActionHandler_ = handler => {
      this.action_.installActionHandler(
          this.element, handler, ActionTrust.MEDIUM);
    };

    const locale = this.element.getAttribute('locale') || DEFAULT_LOCALE;
    this.moment_.locale(locale);

    this.element.appendChild(this.container_);
    this.render();
    this.element.setAttribute('i-amphtml-date-picker-attached', '');
  }

  /**
   * Create an array of objects mapping dates to templates.
   * @return {!Promise<!DateTemplateMapDef>}
   */
  parseSrcTemplates_() {
    return this.srcTemplatePromise_.then(srcJson => {
      if (!srcJson) {
        return;
      }
      const templates = srcJson.templates;
      const srcTemplates = templates
          .filter(t => t.dates)
          .map(t => ({
            dates: new DatesList(this.ReactDates_, this.moment_, t.dates),
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
      user().error('Failed fetching Date Picker data', error);
    });
  }

  /**
   * Fetch the JSON from the URL specified in the src attribute.
   * @return {Promise<!JsonObject|!Array<JsonObject>|undefined>}
   */
  fetchSrcTemplates_() {
    if (this.element.getAttribute('src')) {
      return fetchBatchedJsonFor(this.ampdoc_, this.element);
    } else {
      return Promise.resolve();
    }
  }

  /**
   * Iterate over template element children and map their IDs
   * to a list of dates
   * @return {!Array<!DateTemplateMapDef>}
   */
  parseElementTemplates_() {
    const templates = toArray(scopedQuerySelectorAll(
        this.element, '[date-template][dates]'));

    return templates.map(template => {
      const dates = template.getAttribute('dates').split(DATE_SEPARATOR);
      return {
        dates: new DatesList(this.ReactDates_, this.moment_, dates),
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
      startPlaceholder.remove();
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
      endPlaceholder.remove();
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
      datePlaceholder.remove();
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
    const dates = this.getBindDates_(startDate, endDate);
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
   * @param {!moment} endDate
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
      scopedQuerySelector(this.element, '[date-template][default]')
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
    this.scanForBindings_([this.container_]);
    return this.renderPromiseIntoReact_(this.infoTemplatePromise_);
  }

  /**
   * Returns `true` if an info template exists.
   * @return {boolean}
   */
  hasInfoTemplate_() {
    return this.templates_.hasTemplate(this.element, '[info-template]');
  }

  /** @return {!Promise} */
  renderInfoTemplate_() {
    const template = scopedQuerySelector(this.element, '[info-template]');
    return this.renderTemplate_(template);
  }

  /**
   * @param {!Array<!Element>} elements
   * @return {!Promise<!Array<!Element>>}
   * @private
   */
  scanForBindings_(elements) {
    const forwardElements = () => elements;
    return Services.bindForDocOrNull(this.element).then(bind => {
      if (bind) {
        return bind.rescanAndEvaluate(elements);
      }
    // Forward elements to chained promise on success or failure.
    }).then(forwardElements, forwardElements);
  }

  /**
   * Render the given template with the given data. If the template does not
   * exist, use a fallback string.
   * The fallback string will be rendered directly into the DOM so it must
   * not contain unsanitized user-supplied values.
   * @param {!Element} template
   * @param {!JsonObject} data
   * @param {string} fallback
   */
  renderTemplate_(template, data, fallback) {
    if (template) {
      return this.templates_.renderTemplate(template, data)
          .then(rendered => {
            rendered.setAttribute('i-amphtml-rendered', '');
            const renderedEvent = createCustomEvent(
                this.win_,
                AmpEvents.DOM_UPDATE,
                /* detail */ null,
                {bubbles: true});

            template.dispatchEvent(renderedEvent);
            return rendered.outerHTML;
          });
    } else {
      return Promise.resolve(fallback);
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

    return this.react_.createElement(createDeferred(this.react_), {
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
          installActionHandler: this.installActionHandler_,
          onDateChange: this.onDateChange,
          onDatesChange: this.onDatesChange,
          blocked: this.blocked_,
          highlighted: this.highlighted_,
          firstDayOfWeek: this.firstDayOfWeek_,
        })),
        this.container_);
  }
}


/**
 * Bootstraps the date picker elements
 */
export class AmpDatePickerService {
  /**
   * @param  {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   */
  constructor(ampdoc) {
    /** @const @private {!Promise} */
    this.whenInitialized_ = this.installStyles_(ampdoc)
        .then(() => this.installHandlers_(ampdoc));
  }

  /**
   * Returns a promise that resolves when all form implementations (if any)
   * have been upgraded.
   * @return {!Promise}
   */
  whenInitialized() {
    return this.whenInitialized_;
  }

  /**
   * Install the date picker CSS
   * @param  {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   * @return {!Promise}
   * @private
   */
  installStyles_(ampdoc) {
    return new Promise(resolve => {
      installStylesForDoc(ampdoc, CSS, resolve, false, TAG);
    });
  }

  /**
   * Install the event handlers
   * @param  {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   * @return {!Promise}
   * @private
   */
  installHandlers_(ampdoc) {
    return ampdoc.whenReady().then(() => {
      const doc = ampdoc.getRootNode();
      this.installDatePickers_(doc);
      this.installGlobalEventListener_(doc);
    });
  }

  /**
   * Construct a Date Picker class for every date picker element.
   * @param {!Document} doc
   */
  installDatePickers_(doc) {
    const pickers = this.getPickers_(doc);
    if (!pickers.length) {
      return;
    }

    iterateCursor(pickers, picker => {
      if (!picker.hasAttribute('i-amphtml-date-picker-attached')) {
        new DatePicker(picker);
      }
    });
  }

  /**
   * Listen for DOM updated messages sent to the document.
   * @param {!Document|!ShadowRoot} doc
   * @private
   */
  installGlobalEventListener_(doc) {
    doc.addEventListener(AmpEvents.DOM_UPDATE, () => {
      this.installDatePickers_(doc);
    });
  }

  /**
   * Retrieve date picker elements from the DOM
   * @param {!Document} doc
   * @return {!IArrayLike<!Element>}
   */
  getPickers_(doc) {
    return doc.querySelectorAll('amp-date,amp-date-range');
  }
}

AMP.extension(SERVICE_TAG, '0.1', AMP => {
  AMP.registerServiceForDoc(SERVICE_TAG, AmpDatePickerService);
});
