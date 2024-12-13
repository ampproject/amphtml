import {AmpEvents_Enum} from '#core/constants/amp-events';
import {removeChildren} from '#core/dom';
import {isLayoutSizeDefined} from '#core/dom/layout';
import {dashToCamelCase} from '#core/types/string';

import {Services} from '#service';

import {createCustomEvent} from '#utils/event-helper';
import {dev, devAssert, user, userAssert} from '#utils/log';

import {getTimeZoneName} from '../format';

/** @const {string} */
const TAG = 'amp-date-display';

/** @const {string} */
const DEFAULT_LOCALE = 'en';

/** @const {number} */
const DEFAULT_OFFSET_SECONDS = 0;

/** @const {!{[key: string]: *}} */
const DEFAULT_DATETIME_OPTIONS = {
  'year': 'numeric',
  'month': 'short',
  'day': 'numeric',
  'hour': 'numeric',
  'minute': 'numeric',
};

/** @typedef {{
  year: number,
  month: number,
  monthName: string,
  monthNameShort: string,
  day: number,
  dayName: string,
  dayNameShort: string,
  hour: number,
  minute: number,
  second: number,
  iso: string,
  timeZoneName: string,
  timeZoneNameShort: string,
}} */
let VariablesDef;

/** @typedef {{
  year: number,
  month: number,
  monthName: string,
  monthNameShort: string,
  day: number,
  dayName: string,
  dayNameShort: string,
  hour: number,
  minute: number,
  second: number,
  iso: string,
  yearTwoDigit: string,
  monthTwoDigit: string,
  dayTwoDigit: string,
  hourTwoDigit: string,
  hour12: string,
  hour12TwoDigit: string,
  minuteTwoDigit: string,
  secondTwoDigit: string,
  dayPeriod: string,
  localeString: string,
 }} */
let EnhancedVariablesDef;

export class AmpDateDisplay extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @const {function(!Element)} */
    this.boundRendered_ = this.rendered_.bind(this);

    /** @private {string} */
    this.datetime_ = '';

    /** @private {number} */
    this.timestampSeconds_ = 0;

    /** @private {number} */
    this.timestampMiliseconds_ = 0;

    /** @private {string} */
    this.displayIn_ = '';

    /** @private {number} */
    this.offsetSeconds_ = 0;

    /** @private {string} */
    this.locale_ = '';

    /** @private {{[key: string]: *}} */
    this.localeOptions_ = null;

    /** @private {?../../../src/service/template-impl.Templates} */
    this.templates_ = null;

    /** @private {?Element} */
    this.container_ = null;
  }

  /** @override */
  buildCallback() {
    this.templates_ = Services.templatesForDoc(this.element);

    this.container_ = this.element.ownerDocument.createElement('div');
    this.element.appendChild(devAssert(this.container_));

    // Note: One of datetime, timestamp-ms, timestamp-seconds is required.

    this.datetime_ = this.element.getAttribute('datetime') || '';

    this.timestampSeconds_ = Number(
      this.element.getAttribute('timestamp-seconds')
    );

    this.timestampMiliseconds_ = Number(
      this.element.getAttribute('timestamp-ms')
    );

    this.displayIn_ = this.element.getAttribute('display-in') || '';

    this.offsetSeconds_ =
      Number(this.element.getAttribute('offset-seconds')) ||
      DEFAULT_OFFSET_SECONDS;

    this.locale_ = this.element.getAttribute('locale') || DEFAULT_LOCALE;

    this.localeOptions_ = this.parseLocaleOptionsAttrs_(
      this.element,
      'data-options-'
    );

    const data = /** @type {!JsonObject} */ (this.getDataForTemplate_());
    this.templates_
      .findAndRenderTemplate(this.element, data)
      .then(this.boundRendered_);
  }

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  /**
   * @return {!EnhancedVariablesDef}
   * @private
   */
  getDataForTemplate_() {
    const {Date} = this.win;

    const epoch = this.getEpoch_();
    const offset = this.offsetSeconds_ * 1000;
    const date = new Date(epoch + offset);
    const inUTC = this.displayIn_.toLowerCase() === 'utc';
    const basicData = inUTC
      ? this.getVariablesInUTC_(date, this.locale_, this.localeOptions_)
      : this.getVariablesInLocal_(date, this.locale_, this.localeOptions_);

    return this.enhanceBasicVariables_(basicData);
  }

  /**
   * @return {number|undefined}
   * @private
   */
  getEpoch_() {
    const {Date} = this.win;
    let epoch;

    if (this.datetime_.toLowerCase() === 'now') {
      epoch = Date.now();
    } else if (this.datetime_) {
      epoch = Date.parse(this.datetime_);
      userAssert(!isNaN(epoch), 'Invalid date: %s', this.datetime_);
    } else if (this.timestampMiliseconds_) {
      epoch = this.timestampMiliseconds_;
    } else if (this.timestampSeconds_) {
      epoch = this.timestampSeconds_ * 1000;
    }

    userAssert(
      epoch !== undefined,
      'One of datetime, timestamp-ms, or timestamp-seconds is required'
    );

    return epoch;
  }

  /**
   * @param {null|string} attributeName
   * @param {string|undefined} attributePrefix
   * @return {boolean}
   * @private
   */
  matchesAttrPrefix_(attributeName, attributePrefix) {
    return (
      attributeName !== null &&
      attributePrefix !== undefined &&
      attributeName.startsWith(attributePrefix) &&
      attributeName !== attributePrefix
    );
  }

  /**
   * @param {!Element} element
   * @param {string} attrPrefix
   * @return {{[key: string]: *}|undefined}
   * @private
   */
  parseLocaleOptionsAttrs_(element, attrPrefix) {
    const currObj = {};
    let objContains = false;
    const attrs = element.attributes;
    for (let i = 0; i < attrs.length; i++) {
      const attrib = attrs[i];
      if (this.matchesAttrPrefix_(attrib.name, attrPrefix)) {
        currObj[dashToCamelCase(attrib.name.slice(attrPrefix.length))] =
          attrib.value;
        objContains = true;
      }
    }
    if (objContains) {
      return currObj;
    }
  }

  /**
   * @param {!Date} date
   * @param {string} locale
   * @param {?{[key: string]: *}} localeOptions
   * @return {string}
   * @private
   */
  getLocaleString_(date, locale, localeOptions) {
    try {
      return date.toLocaleString(locale, localeOptions);
    } catch (e) {
      user().error(TAG, 'localeOptions', e);
    }
  }

  /**
   * @param {!Date} date
   * @param {string} locale
   * @param {?{[key: string]: *}} localeOptions
   * @return {!VariablesDef}
   * @private
   */
  getVariablesInLocal_(date, locale, localeOptions = DEFAULT_DATETIME_OPTIONS) {
    return {
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      monthName: date.toLocaleDateString(locale, {month: 'long'}),
      monthNameShort: date.toLocaleDateString(locale, {
        month: 'short',
      }),
      day: date.getDate(),
      dayName: date.toLocaleDateString(locale, {weekday: 'long'}),
      dayNameShort: date.toLocaleDateString(locale, {
        weekday: 'short',
      }),
      hour: date.getHours(),
      minute: date.getMinutes(),
      second: date.getSeconds(),
      iso: date.toISOString(),
      localeString: this.getLocaleString_(date, locale, localeOptions),
      timeZoneName: getTimeZoneName(date, locale, localeOptions),
      timeZoneNameShort: getTimeZoneName(date, locale, localeOptions, 'short'),
    };
  }

  /**
   * @param {!Date} date
   * @param {string} locale
   * @param {?{[key: string]: *}} localeOptions
   * @return {!VariablesDef}
   * @private
   */
  getVariablesInUTC_(date, locale, localeOptions = DEFAULT_DATETIME_OPTIONS) {
    const localeOptionsInUTC = {
      ...localeOptions,
      timeZone: 'UTC',
    };
    return {
      year: date.getUTCFullYear(),
      month: date.getUTCMonth() + 1,
      monthName: date.toLocaleDateString(locale, {
        month: 'long',
        timeZone: 'UTC',
      }),
      monthNameShort: date.toLocaleDateString(locale, {
        month: 'short',
        timeZone: 'UTC',
      }),
      day: date.getUTCDate(),
      dayName: date.toLocaleDateString(locale, {
        weekday: 'long',
        timeZone: 'UTC',
      }),
      dayNameShort: date.toLocaleDateString(locale, {
        weekday: 'short',
        timeZone: 'UTC',
      }),
      hour: date.getUTCHours(),
      minute: date.getUTCMinutes(),
      second: date.getUTCSeconds(),
      iso: date.toISOString(),
      localeString: this.getLocaleString_(date, locale, localeOptionsInUTC),
      timeZoneName: getTimeZoneName(date, locale, localeOptionsInUTC),
      timeZoneNameShort: getTimeZoneName(
        date,
        locale,
        localeOptionsInUTC,
        'short'
      ),
    };
  }

  /**
   * @param {!VariablesDef} data
   * @return {!EnhancedVariablesDef}
   * @private
   */
  enhanceBasicVariables_(data) {
    const hour12 = data.hour % 12 || 12;

    // Override type since Object.assign is not understood
    return /** @type {!EnhancedVariablesDef} */ ({
      ...data,
      yearTwoDigit: this.padStart_(data.year % 100),
      monthTwoDigit: this.padStart_(data.month),
      dayTwoDigit: this.padStart_(data.day),
      hourTwoDigit: this.padStart_(data.hour),
      hour12,
      hour12TwoDigit: this.padStart_(hour12),
      minuteTwoDigit: this.padStart_(data.minute),
      secondTwoDigit: this.padStart_(data.second),
      dayPeriod: data.hour < 12 ? 'am' : 'pm',
    });
  }

  /**
   * @param {number} input
   * @return {string}
   * @private
   */
  padStart_(input) {
    if (input > 9) {
      return input.toString();
    }

    return '0' + input;
  }

  /**
   * @param {!Element} element
   * @private
   */
  rendered_(element) {
    this.mutateElement(() => {
      removeChildren(dev().assertElement(this.container_));
      this.container_.appendChild(element);

      const event = createCustomEvent(
        this.win,
        AmpEvents_Enum.DOM_UPDATE,
        /* detail */ null,
        {bubbles: true}
      );
      this.element.dispatchEvent(event);
    });
  }
}

AMP.extension(TAG, '0.1', (AMP) => {
  AMP.registerElement(TAG, AmpDateDisplay);
});
