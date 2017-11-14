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

import { AmpEvents } from '../../../src/amp-events';
import { Services } from '../../../src/services';
import { createCustomEvent } from '../../../src/event-helper';
import { isLayoutSizeDefined } from '../../../src/layout';
import { removeChildren } from '../../../src/dom';

export class ampDateDisplay extends AMP.BaseElement {
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

    /** @const {!../../../src/service/template-impl.Templates} */
    this.templates_ = Services.templatesFor(this.win);
  }

  /** @override */
  buildCallback() {
    this.datetime_ = this.element.getAttribute('datetime') || '';
    this.timestampSeconds_ = this.element.getAttribute('timestamp-seconds');
    this.timestampMiliseconds_ = this.element.getAttribute('timestamp-ms');
    this.displayIn_ = this.element.getAttribute('display-in') || '';
    this.offsetSeconds_ = this.element.getAttribute('offset-seconds') || 0;
    this.locale_ = this.element.getAttribute('locale') || 'en';

    const epoch = this.getEpoch_();
    const offset = this.offsetSeconds_ * 1000;
    const date = new Date(epoch + offset);
    const inUTC = this.displayIn_.toLowerCase() === 'utc';
    const basicData = inUTC
      ? this.getVariablesInUTC_(date, this.locale_)
      : this.getVariablesInLocal_(date, this.locale_);
    const data = this.enhanceBasicVariables_(basicData);

    this.templates_
        .findAndRenderTemplate(this.element, data)
        .then(this.boundRendered_);
  }

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  getEpoch_() {
    let epoch;

    if (this.datetime_.toLowerCase() === 'now') {
      epoch = Date.now();
    } else if (this.datetime_) {
      epoch = Date.parse(this.datetime_);
    } else if (this.timestampMiliseconds_) {
      epoch = parseInt(this.timestampMiliseconds_, 10);
    } else if (this.timestampSeconds_) {
      epoch = parseInt(this.timestampSeconds_, 10) * 1000;
    }

    if (isNaN(epoch)) {
      // throw error?
    }

    return epoch;
  }

  /**
   * @param {!Date} date
   * @private
   */
  getVariablesInLocal_(date, locale) {
    return {
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      monthName: date.toLocaleDateString(locale, {month: 'long'}),
      monthNameShort: date.toLocaleDateString(locale, {month: 'short'}),
      day: date.getDate(),
      dayName: date.toLocaleDateString(locale, {weekday: 'long'}),
      dayNameShort: date.toLocaleDateString(locale, {weekday: 'short'}),
      hour: date.getHours(),
      minute: date.getMinutes(),
      second: date.getSeconds(),
      iso: date.toISOString(),
    };
  }

  /**
   * @param {!Date} date
   * @private
   */
  getVariablesInUTC_(date, locale) {
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
    };
  }

  /**
   * @param {!Object} data
   * @private
   */
  enhanceBasicVariables_(data) {
    const hour12 = data.hour % 12 || 12;

    return Object.assign({}, data, {
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
    removeChildren(this.element);
    this.element.appendChild(element);

    const event = createCustomEvent(
        this.win,
        AmpEvents.DOM_UPDATE,
        /* detail */ null,
        {bubbles: true}
    );
    this.element.dispatchEvent(event);
  }
}

AMP.registerElement('amp-date-display', ampDateDisplay);
