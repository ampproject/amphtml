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
import {user} from '../../../src/log';

/** @const {string} */
const TAG = 'amp-date-countdown';

export class AmpDateCountdown extends AMP.BaseElement {

  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @const {!function(!Element)} */
    this.boundRendered_ = this.rendered_.bind(this);

    /** @private {string} */
    this.datetime_ = '';

    /** @private {number} */
    this.timestampMs_ = 0;

    /** @private {number} */
    this.timestampSeconds_ = 0;

    /** @private {number} */
    this.offsetSeconds_ = 0;

    /** @private {string} */
    this.biggestUnit_ = '';

    /** @const {!../../../src/service/template-impl.Templates} */
    this.templates_ = Services.templatesFor(this.win);
  }

  /** @override */
  buildCallback() {
    const self = this;
    //Note: One of datetime, timestamp-ms, timestamp-seconds is required.
    this.datetime_ = this.element.getAttribute('datetime');
    this.timestampMs_ = Number(this.element.getAttribute('timestamp-ms'));
    this.timestampSeconds_ = Number(this.element.getAttribute('timestamp-seconds'));
    this.offsetSeconds_ = Number(this.element.getAttribute('offset-seconds'));

    const locale = this.element.getAttribute('locale') || 'en';
    const whenEnded = this.element.getAttribute('when-ended') || 'stop';
    this.biggestUnit_ = (this.element.getAttribute('biggest-unit')) || 'day';

    let epoch = this.getEpoch_(); //1519776000000
    if (this.offsetSeconds_) {
      epoch += this.offsetSeconds_;
    }
    let differentBetween = new Date(epoch) - new Date();
    let data;
    const localeWordList = this.getLocaleWord_(locale);
    const delay = 1000;

    let countDownTicker = setInterval(function() {
      //console.log('differentBetween', differentBetween);
      data = self.getYDHMSFromMs_(differentBetween);
      if (whenEnded === 'stop' && differentBetween < 1000) {
        clearInterval(countDownTicker);
      }
      differentBetween -= delay;
      self.renderItems_(Object.assign(data, localeWordList));
    }, delay);

  }

  /** @override */
  isLayoutSupported(layout) {
    return layout == Layout.RESPONSIVE;
  }

  /**
   * @param {!Object} items
   * @return {!Promise}
   * @private
   */
  renderItems_(items) {
    return this.templates_.findAndRenderTemplate(this.element, items)
        .then(this.boundRendered_);
  }

  /**
   * @return {!number}
   * @private
   */
  getEpoch_() {
    let epoch;

    if (this.datetime_) {
      epoch = Date.parse(this.datetime_);
    } else if (this.timestampMs_) {
      epoch = this.timestampMs_;
    } else if (this.timestampSeconds_) {
      epoch = this.timestampSeconds_ * 1000;
    }

    if (isNaN(epoch)) {
      user().error(TAG, `One of datetime, timestamp-ms, timestamp-seconds is required`);
    }

    console.log('epoch', epoch);
    return epoch;
  }

  /**
   * @param {!string} locale
   * @return {!object}
   * @private
   */
  getLocaleWord_(locale) {
    //https://ctrlq.org/code/19899-google-translate-languages refer to google code
    const localeWord = {
      'zh-CN': '年|月|天|小时|分钟|秒',
      'zh-TW': '年|月|天|小時|分鐘|秒',
      'de': 'Jahren|Monaten|Tagen|Stunden|Minuten|Sekunden',
      'en': 'Years|Months|Days|Hours|Minutes|Seconds',
      'es': 'años|meses|días|horas|minutos|segundos',
      'fr': 'ans|mois|jours|heures|minutes|secondes',
      'id': 'tahun|bulan|hari|jam|menit|detik',
      'it': 'anni|mesi|giorni|ore|minuti|secondi',
      'ja': '年|ヶ月|日|時間|分|秒',
      'ko': '년|달|일|시간|분|초',
      'nl': 'jaar|maanden|dagen|uur|minuten|seconden',
      'pt': 'anos|meses|dias|horas|minutos|segundos',
      'ru': 'год|месяц|день|час|минута|секунда',
      'th': 'ปี|เดือน|วัน|ชั่วโมง|นาที|วินาที',
      'tr': 'yıl|ay|gün|saat|dakika|saniye',
      'vi': 'năm|tháng|ngày|giờ|phút|giây'
    };
    let result = {};
    if (localeWord[locale]) {
      const localeWordList = (localeWord[locale]).split('|');
      result = {
        'yearWord': localeWordList[0],
        'monthWord': localeWordList[1],
        'dayWord': localeWordList[2],
        'hourWord': localeWordList[3],
        'minuteWord': localeWordList[4],
        'secondWord': localeWordList[5],
      };
    } else {
      user().error(TAG, `Invalid locale '${locale}', return empty locale word`);
    }
    return result;
  }

  /**
   * @param {!number} ms
   * @return {!object}
   * @private
   */
  getYDHMSFromMs_(ms) {

    const priorityList = {
      day: 1,
      hour: 2,
      minute: 3,
      second: 4
    };


    const days = priorityList[this.biggestUnit_] == 1 ? (Math.trunc((ms) / (24 * 60 * 60 * 1000))) : 0;
    const daysms = ms % (24 * 60 * 60 * 1000);
    const hours = priorityList[this.biggestUnit_] == 2
      ? (Math.trunc((ms) / (60 * 60 * 1000)))
      : priorityList[this.biggestUnit_] < 2
        ? (Math.trunc((daysms) / (60 * 60 * 1000)))
        : 0;
    const hoursms = ms % (60 * 60 * 1000);
    const minutes = priorityList[this.biggestUnit_] == 3
      ? (Math.trunc((ms) / (60 * 1000)))
      : priorityList[this.biggestUnit_] < 3
        ? (Math.trunc((hoursms) / (60 * 1000)))
        : 0;
    const minutesms = ms % (60 * 1000);
    const seconds = priorityList[this.biggestUnit_] == 4 ? (Math.trunc((ms) / (1000))) : (Math.trunc((minutesms) / (1000)));

    return {
      days,
      daysTwoDigits: this.padStart_(days),
      hours,
      hoursTwoDigits: this.padStart_(hours),
      minutes,
      minutesTwoDigits: this.padStart_(minutes),
      seconds,
      secondsTwoDigits: this.padStart_(seconds),
    };
  }

  /**
   * @param {!number} input
   * @return {!string}
   * @private
   */
  padStart_(input) {
    if (input > 9 || input < 0) {
      return input.toString();
    }

    return '0' + input;
  }

    /**
   * @param {!Element} element
   * @private
   */
  rendered_(element) {
    const template = this.element.firstElementChild;
    removeChildren(this.element);
    this.element.appendChild(template);
    this.element.appendChild(element);

    const event = createCustomEvent(this.win,
        AmpEvents.DOM_UPDATE, /* detail */ null, {bubbles: true});
    this.element.dispatchEvent(event);
  }
}

AMP.extension(TAG, '0.1', AMP => {
  AMP.registerElement(TAG, AmpDateCountdown);
});
