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

import {AmpEvents} from '../../../src/amp-events';
import {Layout} from '../../../src/layout';
import {removeChildren} from '../../../src/dom';
import {Services} from '../../../src/services';
import {createCustomEvent} from '../../../src/event-helper';


export class AmpDateCountdown extends AMP.BaseElement {

  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @const {!function(!Element)} */
    this.boundRendered_ = this.rendered_.bind(this);

    /** @private {string} */
    this.datetime_ = '';

    /** @private {number} */
    this.timestampSeconds_ = 0;
    
    /** @private {number} */
    this.timestampMiliseconds_ = 0;

    /** @private {number} */
    this.offsetSeconds_ = 0;

     /** @private {string} */
     this.locale_ = '';
     

    /** @private {!Element} */
    // this.container_ = this.win.document.createElement('div');

    /** @const {!../../../src/service/template-impl.Templates} */
    this.templates_ = Services.templatesFor(this.win);

  }

  /** @override */
  buildCallback() {
    const self = this;
    // this.container_.textContent = this.myText_;
    // this.element.appendChild(this.container_);
    // this.applyFillContent(this.container_, /* replacedContent */ true);

    this.datetime_ = this.element.getAttribute('datetime');
    // this.timestampSeconds_ = this.element.getAttribute('timestamp-seconds');
    // this.timestampMiliseconds_ = this.element.getAttribute('timestamp-ms');
    this.offsetSeconds_ = this.element.getAttribute('offset-seconds') || 0;
    this.locale_ = this.element.getAttribute('locale') ||
      this.win.document.documentElement.lang;

    console.log(this.locale_);

    const epoch = this.getEpoch_();
    const offset = this.offsetSeconds_ * 1000;
    let totalTimestampMiliSeconds_ = epoch + offset;
    let data;
    let delay = 1000;

    setInterval(function () {

      let date = new Date(totalTimestampMiliSeconds_);
      console.log(date);
      const inUTC = true;
      let basicData = inUTC
      ? self.getVariablesInUTC_(date, self.locale_)
      : self.getVariablesInLocal_(date, self.locale_);
  
      data = self.enhanceBasicVariables_(basicData); // for now
      
      self.templates_.findAndRenderTemplate(self.element, data)
      .then(self.boundRendered_);

      totalTimestampMiliSeconds_ -= delay;
    }, delay);


    
  }

  /** @override */
  isLayoutSupported(layout) {
    return layout == Layout.RESPONSIVE;
  }

  getEpoch_() {
    let epoch;

    if (this.datetime_) {
      epoch = Date.parse(this.datetime_);
    } else if (this.timestampMiliseconds_) {
      epoch = this.timestampMiliseconds_;
    } else if (this.timestampSeconds_) {
      epoch = this.timestampSeconds_ * 1000;
    }

    if (isNaN(epoch)) {
      // throw error?
    }

    console.log(epoch);
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
      monthWord: date.toLocaleDateString(locale, { month: 'long' }),
      monthWordShort: date.toLocaleDateString(locale, { month: 'short' }),
      day: date.getDate(),
      dayWord: date.toLocaleDateString(locale, { weekday: 'long' }),
      dayWordShort: date.toLocaleDateString(locale, { weekday: 'short' }),
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
      monthWord: date.toLocaleDateString(locale, {
        month: 'long',
        timeZone: 'UTC'
      }),
      monthWordShort: date.toLocaleDateString(locale, {
        month: 'short',
        timeZone: 'UTC'
      }),
      day: date.getUTCDate(),
      dayWord: date.toLocaleDateString(locale, {
        weekday: 'long',
        timeZone: 'UTC'
      }),
      dayWordShort: date.toLocaleDateString(locale, {
        weekday: 'short',
        timeZone: 'UTC'
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
      dayPeriod: (data.hour < 12) ? 'am' : 'pm',
    });
  }


  /**
   * @param {!number} input
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

    const event = createCustomEvent(this.win,
        AmpEvents.DOM_UPDATE, /* detail */ null, {bubbles: true});
    this.element.dispatchEvent(event);
  }
}


AMP.registerElement('amp-date-countdown', AmpDateCountdown);