/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
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
import {useEffect, useState} from '../../../src/preact';
import {useResourcesNotify} from '../../../src/preact/utils';
import {useAmpContext} from '../../../src/preact/context';

const NAME = 'DateCountdown';

const DEFAULT_OFFSET_SECONDS = 0;
const DEFAULT_LOCALE = 'en';
const DEFAULT_WHEN_ENDED = 'stop';
const DEFAULT_BIGGEST_UNIT = 'DAYS';
const DELAY = 1000;

/** @const {number} */
const MILLISECONDS_IN_DAY = 24 * 60 * 60 * 1000;

/** @const {number} */
const MILLISECONDS_IN_HOUR = 60 * 60 * 1000;

/** @const {number} */
const MILLISECONDS_IN_MINUTE = 60 * 1000;

/** @const {number} */
const MILLISECONDS_IN_SECOND = 1000;

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

/**
 * @param {!DateCountdownPropsDef} props
 * @return {PreactDef.Renderable}
 */
export function DateCountdown({
  endDate,
  timeleftMs,
  timestampMs,
  timestampSeconds,
  offsetSeconds = DEFAULT_OFFSET_SECONDS,
  whenEnded = DEFAULT_WHEN_ENDED,
  locale = DEFAULT_LOCALE,
  biggestUnit = DEFAULT_BIGGEST_UNIT,
  render,
  children,
}) {
  useResourcesNotify();
  const {playable} = useAmpContext();
  const [epoch, setEpoch] = useState(
    getEpoch(endDate, timeleftMs, timestampMs, timestampSeconds) +
      offsetSeconds * DELAY
  );
  const [timeLeft, setTimeLeft] = useState(new Date(epoch) - new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      const newTimeLeft = new Date(epoch) - new Date();
      setTimeLeft(() => newTimeLeft);
      if (whenEnded === DEFAULT_WHEN_ENDED && newTimeLeft < 1000) {
        clearInterval(interval);
      }
    }, DELAY);
    return () => clearInterval(interval);
  }, [playable]);

  const data = Object.assign(
    getYDHMSFromMs(timeLeft, biggestUnit),
    getLocaleWord(locale)
  );
  return render(data, children);
}

/**
 * @param {string|undefined} endDate
 * @param {number|undefined} timeleftMs
 * @param {number|undefined} timestampMs
 * @param {number|undefined} timestampSeconds
 * @return {number}
 */
function getEpoch(endDate, timeleftMs, timestampMs, timestampSeconds) {
  let epoch;

  if (endDate) {
    epoch = Date.parse(endDate);
  } else if (timeleftMs) {
    epoch = Number(new Date()) + timeleftMs;
  } else if (timestampMs) {
    epoch = timestampMs;
  } else if (timestampSeconds) {
    epoch = timestampSeconds * 1000;
  }

  if (epoch === undefined) {
    throw new Error(
      `One of endDate, timeleftMs, timestampMs, timestampSeconds` +
        `is required. ${NAME}`
    );
  }
  return epoch;
}

/**
 * @param {string} locale
 * @return {!Object}
 */
function getLocaleWord(locale) {
  if (LOCALE_WORD[locale] === undefined) {
    throwWarning(
      `Invalid locale ${locale}, defaulting to ${DEFAULT_LOCALE}. ${NAME}`
    );
    locale = DEFAULT_LOCALE;
  }
  const localeWordList = LOCALE_WORD[locale];
  return {
    'years': localeWordList[0],
    'months': localeWordList[1],
    'days': localeWordList[2],
    'hours': localeWordList[3],
    'minutes': localeWordList[4],
    'seconds': localeWordList[5],
  };
}

/**
 * @param {number} ms
 * @param {string} biggestUnit
 * @return {Object}
 */
function getYDHMSFromMs(ms, biggestUnit) {
  /** @enum {number} */
  const TimeUnit = {
    DAYS: 1,
    HOURS: 2,
    MINUTES: 3,
    SECONDS: 4,
  };
  //Math.trunc is used instead of Math.floor to support negative past date
  const d =
    TimeUnit[biggestUnit] == TimeUnit.DAYS
      ? supportBackDate(Math.floor(ms / MILLISECONDS_IN_DAY))
      : 0;
  const h =
    TimeUnit[biggestUnit] == TimeUnit.HOURS
      ? supportBackDate(Math.floor(ms / MILLISECONDS_IN_HOUR))
      : TimeUnit[biggestUnit] < TimeUnit.HOURS
      ? supportBackDate(
          Math.floor((ms % MILLISECONDS_IN_DAY) / MILLISECONDS_IN_HOUR)
        )
      : 0;
  const m =
    TimeUnit[biggestUnit] == TimeUnit.MINUTES
      ? supportBackDate(Math.floor(ms / MILLISECONDS_IN_MINUTE))
      : TimeUnit[biggestUnit] < TimeUnit.MINUTES
      ? supportBackDate(
          Math.floor((ms % MILLISECONDS_IN_HOUR) / MILLISECONDS_IN_MINUTE)
        )
      : 0;
  const s =
    TimeUnit[biggestUnit] == TimeUnit.SECONDS
      ? supportBackDate(Math.floor(ms / MILLISECONDS_IN_SECOND))
      : supportBackDate(
          Math.floor((ms % MILLISECONDS_IN_MINUTE) / MILLISECONDS_IN_SECOND)
        );

  return {
    d,
    dd: padStart(d),
    h,
    hh: padStart(h),
    m,
    mm: padStart(m),
    s,
    ss: padStart(s),
  };
}

/**
 * @param {number} input
 * @return {string}
 */
function padStart(input) {
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
 */
function supportBackDate(input) {
  if (input < 0) {
    return input + 1;
  }
  return input;
}

/**
 * @param {?string} message
 */
function throwWarning(message) {
  console /*OK*/
    .warn(message);
}
