/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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

import {ActionTrust} from '../../../src/action-constants';
import {Services} from '../../../src/services';
import {isLayoutSizeDefined} from '../../../src/layout';
import {removeChildren} from '../../../src/dom';
import {user, userAssert} from '../../../src/log';

/** @const {string} */
const TAG = 'amp-date-countdown';

/** @const {string} */
const DEFAULT_LOCALE = 'en';

/** @const {string} */
const DEFAULT_WHEN_ENDED = 'stop';

/** @const {string} */
const DEFAULT_BIGGEST_UNIT = 'DAYS';

/** @const {number} */
const DEFAULT_OFFSET_SECONDS = 0;

/** @const {number} */
const MILLISECONDS_IN_DAY = 24 * 60 * 60 * 1000;

/** @const {number} */
const MILLISECONDS_IN_HOUR = 60 * 60 * 1000;

/** @const {number} */
const MILLISECONDS_IN_MINUTE = 60 * 1000;

/** @const {number} */
const MILLISECONDS_IN_SECOND = 1000;


/** @const {Object} */
//https://ctrlq.org/code/19899-google-translate-languages refer to google code
const LOCALE_WORD = {
  'de': ['Jahren', 'Monaten', 'Tagen', 'Stunden', 'Minuten', 'Sekunden'],
  'en': ['Years', 'Months', 'Days', 'Hours', 'Minutes', 'Seconds'],
  'es': ['años', 'meses', 'días', 'horas', 'minutos', 'segundos'],
  'fr': ['ans', 'mois', 'jours', 'heures', 'minutes', 'secondes'],
  'id': ['tahun', 'bulan', 'hari', 'jam', 'menit', 'detik'],
  'it': ['anni', 'mesi', 'giorni', 'ore', 'minuti', 'secondi'],
  'ja': ['年', 'ヶ月', '日', '時間', '分', '秒'],
  'ko': ['년', '달', '일', '시간', '분', '초'],
  'nl': ['jaar', 'maanden', 'dagen', 'uur', 'minuten', 'seconden'],
  'pt': ['anos', 'meses', 'dias', 'horas', 'minutos', 'segundos'],
  'ru': ['год', 'месяц', 'день', 'час', 'минута', 'секунда'],
  'th': ['ปี', 'เดือน', 'วัน', 'ชั่วโมง', 'นาที', 'วินาที'],
  'tr': ['yıl', 'ay', 'gün', 'saat', 'dakika', 'saniye'],
  'vi': ['năm', 'tháng', 'ngày', 'giờ', 'phút', 'giây'],
  'zh-cn': ['年', '月', '天', '小时', '分钟', '秒'],
  'zh-tw': ['年', '月', '天', '小時', '分鐘', '秒'],
};

export class AmpDateCountdown extends AMP.BaseElement {

  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @const {!../../../src/service/template-impl.Templates} */
    this.templates_ = Services.templatesFor(this.win);

    /** @const {function(!Element)} */
    this.boundRendered_ = this.rendered_.bind(this);

    /** @private {string} */
    this.endDate_ = '';

    /** @private {number} */
    this.timeleftMs_ = 0;

    /** @private {number} */
    this.timestampMs_ = 0;

    /** @private {number} */
    this.timestampSeconds_ = 0;

    /** @private {number} */
    this.offsetSeconds_ = 0;

    /** @private {string} */
    this.locale_ = '';

    /** @private {string} */
    this.whenEnded_ = '';

    /** @private {string} */
    this.biggestUnit_ = '';

    /** @private {!Object|null} */
    this.localeWordList_ = null;

    /** @private {?number} */
    this.countDownTimer_ = null;
  }

  /** @override */
  buildCallback() {

    // Store this in buildCallback() because `this.element` sometimes
    // is missing attributes in the constructor.

    // Note: One of end-date, timeleft-ms, timestamp-ms,
    // timestamp-seconds is required.
    /** @private {string} */
    this.endDate_ = this.element.getAttribute('end-date');

    /** @private {number} */
    this.timeleftMs_
       = Number(this.element.getAttribute('timeleft-ms'));

    /** @private {number} */
    this.timestampMs_ = Number(this.element.getAttribute('timestamp-ms'));

    /** @private {number} */
    this.timestampSeconds_
       = Number(this.element.getAttribute('timestamp-seconds'));

    /** @private {number} */
    this.offsetSeconds_
       = Number(this.element.getAttribute('offset-seconds'))
       || DEFAULT_OFFSET_SECONDS;

    /** @private {string} */
    this.locale_
       = (this.element.getAttribute('locale')
       || DEFAULT_LOCALE).toLowerCase();

    /** @private {string} */
    this.whenEnded_
       = (this.element.getAttribute('when-ended')
       || DEFAULT_WHEN_ENDED).toLowerCase();

    /** @private {string} */
    this.biggestUnit_
       = (this.element.getAttribute('biggest-unit')
       || DEFAULT_BIGGEST_UNIT).toUpperCase();

    /** @private {!Object|null} */
    this.localeWordList_ = this.getLocaleWord_(this.locale_);

    Services.viewerForDoc(this.getAmpDoc()).whenFirstVisible().then(() => {
      const EPOCH = this.getEpoch_() + (this.offsetSeconds_ * 1000);
      this.tickCountDown_(new Date(EPOCH) - new Date());
    });
  }
  /** @override */
  renderOutsideViewport() {
    return true;
  }

  /** @override */
  layoutCallback() {
    const DELAY = 1000;
    const EPOCH = this.getEpoch_() + (this.offsetSeconds_ * DELAY);
    let differentBetween = new Date(EPOCH) - new Date() - DELAY; //substract delay (1000ms) here because of buildCallback show the initial time
    this.countDownTimer_ = this.win.setInterval(() => {
      this.tickCountDown_(differentBetween);
      differentBetween -= DELAY;
    }, DELAY);
    return Promise.resolve();
  }

  /** @override */
  unlayoutCallback() {
    this.win.clearInterval(this.countDownTimer_);
    return true;
  }

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  /**
   * @param {number} differentBetween
   * @private
   */
  tickCountDown_(differentBetween) {
    const items = /** @type {!JsonObject} */ ({});
    const DIFF = this.getYDHMSFromMs_(differentBetween) || {};
    if (this.whenEnded_ === 'stop' && differentBetween < 1000) {
      Services.actionServiceForDoc(this.element)
          .trigger(this.element, 'timeout', null, ActionTrust.LOW);
      this.win.clearInterval(this.countDownTimer_);
    }
    items['data'] = Object.assign(DIFF, this.localeWordList_);
    this.templates_
        .findAndRenderTemplate(this.element, items['data'])
        .then(this.boundRendered_);
  }

  /**
   * @return {number|undefined}
   * @private
   */
  getEpoch_() {
    let epoch;

    if (this.endDate_) {
      epoch = Date.parse(this.endDate_);
    } else if (this.timeleftMs_) {
      epoch = Number(new Date()) + this.timeleftMs_;
    } else if (this.timestampMs_) {
      epoch = this.timestampMs_;
    } else if (this.timestampSeconds_) {
      epoch = this.timestampSeconds_ * 1000;
    }

    userAssert(!isNaN(epoch),
        'One of end-date, timeleft-ms, timestamp-ms, timestamp-seconds ' +
        'is required');
    return epoch;
  }

  /**
   * @param {string} locale
   * @return {!Object}
   * @private
   */
  getLocaleWord_(locale) {
    if (LOCALE_WORD[locale]) {
      const localeWordList = LOCALE_WORD[locale];
      return {
        'years': localeWordList[0],
        'months': localeWordList[1],
        'days': localeWordList[2],
        'hours': localeWordList[3],
        'minutes': localeWordList[4],
        'seconds': localeWordList[5],
      };
    } else {
      user().error(TAG, 'Invalid locale %s, return empty locale word', locale);
      return {};
    }
  }

  /**
   * @param {number} ms
   * @return {Object}
   * @private
   */
  getYDHMSFromMs_(ms) {

    /** @enum {number} */
    const TimeUnit = {
      DAYS: 1,
      HOURS: 2,
      MINUTES: 3,
      SECONDS: 4,
    };
    //Math.trunc is used instead of Math.floor to support negative past date
    const d = TimeUnit[this.biggestUnit_] == TimeUnit.DAYS
      ? this.supportBackDate_(Math.floor((ms) / MILLISECONDS_IN_DAY))
      : 0;
    const h = TimeUnit[this.biggestUnit_] == TimeUnit.HOURS
      ? this.supportBackDate_(Math.floor((ms) / MILLISECONDS_IN_HOUR))
      : TimeUnit[this.biggestUnit_] < TimeUnit.HOURS
        ? this.supportBackDate_(
            Math.floor((ms % MILLISECONDS_IN_DAY) / MILLISECONDS_IN_HOUR))
        : 0;
    const m = TimeUnit[this.biggestUnit_] == TimeUnit.MINUTES
      ? this.supportBackDate_(Math.floor((ms) / MILLISECONDS_IN_MINUTE))
      : TimeUnit[this.biggestUnit_] < TimeUnit.MINUTES
        ? this.supportBackDate_(
            Math.floor((ms % MILLISECONDS_IN_HOUR) / MILLISECONDS_IN_MINUTE))
        : 0;
    const s = TimeUnit[this.biggestUnit_] == TimeUnit.SECONDS
      ? this.supportBackDate_(Math.floor((ms) / MILLISECONDS_IN_SECOND))
      : this.supportBackDate_(
          Math.floor((ms % MILLISECONDS_IN_MINUTE) / MILLISECONDS_IN_SECOND));

    return {
      d,
      dd: this.padStart_(d),
      h,
      hh: this.padStart_(h),
      m,
      mm: this.padStart_(m),
      s,
      ss: this.padStart_(s),
    };
  }

  /**
   * @param {number} input
   * @return {string}
   * @private
   */
  padStart_(input) {
    if (input < -9 || input > 9) {
      return String(input);
    } else if (input >= -9 && input < 0) {
      return '-0' + Math.abs(input);
    }

    return '0' + input;
  }

  /**
   * @param {number} input
   * @return {number}
   * @private
   */
  supportBackDate_(input) {
    if (input < 0) {
      return input + 1;
    }

    return input;
  }

  /**
   * @param {!Element} element
   * @private
   */
  rendered_(element) {
    return this.mutateElement(() => {
      // TODO(UI): The rendered content should be added to a container child
      // to avoid removal/re-addition of the <template> child. See amp-list.
      const template = this.templates_.findTemplate(this.element);
      const isChildTemplate = this.element.contains(template);
      removeChildren(this.element);
      // Re-add template if it was a child element (vs. referenced by ID).
      if (isChildTemplate) {
        this.element.appendChild(template);
      }
      this.element.appendChild(element);
    });
  }
}

AMP.extension(TAG, '0.1', AMP => {
  AMP.registerElement(TAG, AmpDateCountdown);
});
