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

import * as Preact from '../../../src/preact';
import {ActionTrust} from '../../../src/action-constants';
import {DateCountdown} from './date-countdown';
import {PreactBaseElement} from '../../../src/preact/base-element';
import {Services} from '../../../src/services';
import {dict} from '../../../src/utils/object';
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

class AmpDateCountdown extends PreactBaseElement {
  /** @override */
  init() {
    const templates = Services.templatesFor(this.win);
    let rendered = false;

    return dict({
      /**
       * @param {!JsonObject} data
       * @param {*} children
       * @return {*}
       */
      'render': (data, children) => {
        // We only render once in AMP mode, but React mode may rerender
        // serveral times.
        if (rendered) {
          return children;
        }
        rendered = true;

        const host = this.element;
        const domPromise = templates
          .findAndRenderTemplate(host, data)
          .then((rendered) => {
            const container = document.createElement('div');
            container.appendChild(rendered);

            return <RenderDomTree dom={container} host={host} />;
          });

        return (
          <>
            {children}
            <AsyncRender>{domPromise}</AsyncRender>
          </>
        );
      },
    });
  }

  /** @override */
  isLayoutSupported(layout) {
    userAssert(
      isExperimentOn(this.win, 'amp-date-countdown-bento'),
      'expected amp-date-countdown-bento experiment to be enabled'
    );
    return isLayoutSizeDefined(layout);
  }
}

/** @override */
AmpDateCountdown['Component'] = DateCountdown;

/** @override */
AmpDateCountdown['passthrough'] = true;

/** @override */
AmpDateCountdown['props'] = {
  'displayIn': {attr: 'display-in'},
  'offsetSeconds': {attr: 'offset-seconds', type: 'number'},
  'locale': {attr: 'locale'},
  'datetime': {attr: 'datetime'},
  'timestampMs': {attr: 'timestamp-ms', type: 'number'},
  'timestampSeconds': {attr: 'timestamp-seconds', type: 'number'},
};

AMP.extension(TAG, '1.0', (AMP) => {
  AMP.registerElement(TAG, AmpDateCountdown);
});
