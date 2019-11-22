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
import {PreactBaseElement} from '../../../src/preact-base-element';
import {Services} from '../../../src/services';
import {createCustomEvent} from '../../../src/event-helper';
import {dev, userAssert} from '../../../src/log';
import {getRootNode, removeChildren} from '../../../src/dom';
import {isLayoutSizeDefined} from '../../../src/layout';
import {requireExternal} from '../../../src/module';

/** @const {string} */
const TAG = 'amp-date-display';

/** @const {string} */
const DEFAULT_LOCALE = 'en';

/** @const {number} */
const DEFAULT_OFFSET_SECONDS = 0;

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
 }} */
let EnhancedVariablesDef;

const preact = requireExternal('preact');

/**
 * @param {!JsonObject} props
 * @return {*} TODO
 */
function AmpDateDisplayComponent(props) {
  const ref = preact.useRef();
  const slot = preact.cloneElement(props['children'], {ref});
  const data = /** @type {!JsonObject} */ (getDataForTemplate(props));
  const {templates} = props.services;

  preact.useEffect(() => {
    const {host} = getRootNode(ref.current);
    templates.findAndRenderTemplate(host, data).then(rendered => {
      const win = host.defaultView;
      removeChildren(dev().assertElement(host));
      const container = document.createElement('div');
      container.appendChild(rendered);
      host.appendChild(container);

      const event = createCustomEvent(
        win,
        AmpEvents.DOM_UPDATE,
        /* detail */ null,
        {bubbles: true}
      );
      host.dispatchEvent(event);
    });
  }, []);
  return preact.createElement('div', null, slot);
}

const AmpDateDisplay = PreactBaseElement(AmpDateDisplayComponent, {
  passthrough: true,

  services: {
    'templates': {type: 'window', fn: Services.templatesFor},
  },

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  },
});

/**
 * @param {!JsonObject} props
 * @return {!EnhancedVariablesDef}
 */
function getDataForTemplate(props) {
  const {
    'displayIn': displayIn = '',
    'locale': locale = DEFAULT_LOCALE,
  } = props;
  const offsetSeconds =
    Number(props['offsetSeconds']) || DEFAULT_OFFSET_SECONDS;

  const epoch = getEpoch(props);
  const offset = offsetSeconds * 1000;
  const date = new Date(epoch + offset);

  const basicData =
    displayIn.toLowerCase() === 'utc'
      ? getVariablesInUTC(date, locale)
      : getVariablesInLocal(date, locale);

  return enhanceBasicVariables(basicData);
}

/**
 * @param {!JsonObject} props
 * @return {number|undefined}
 * @private
 */
function getEpoch(props) {
  const datetime = props['datetime'] || '';
  const timestampMiliseconds = Number(props['timestampMiliseconds']);
  const timestampSeconds = Number(props['timestampSeconds']);

  let epoch;
  if (datetime.toLowerCase() === 'now') {
    epoch = Date.now();
  } else if (datetime) {
    epoch = Date.parse(datetime);
    userAssert(!isNaN(epoch), 'Invalid date: %s', datetime);
  } else if (timestampMiliseconds) {
    epoch = timestampMiliseconds;
  } else if (timestampSeconds) {
    epoch = timestampSeconds * 1000;
  }

  userAssert(
    epoch !== undefined,
    'One of datetime, timestamp-ms, or timestamp-seconds is required'
  );

  return epoch;
}

/**
 * @param {number} input
 * @return {string}
 * @private
 */
function padStart(input) {
  if (input > 9) {
    return input.toString();
  }

  return '0' + input;
}

/**
 * @param {!VariablesDef} data
 * @return {!EnhancedVariablesDef}
 * @private
 */
function enhanceBasicVariables(data) {
  const hour12 = data.hour % 12 || 12;

  // Override type since Object.assign is not understood
  return /** @type {!EnhancedVariablesDef} */ (Object.assign({}, data, {
    yearTwoDigit: padStart(data.year % 100),
    monthTwoDigit: padStart(data.month),
    dayTwoDigit: padStart(data.day),
    hourTwoDigit: padStart(data.hour),
    hour12,
    hour12TwoDigit: padStart(hour12),
    minuteTwoDigit: padStart(data.minute),
    secondTwoDigit: padStart(data.second),
    dayPeriod: data.hour < 12 ? 'am' : 'pm',
  }));
}

/**
 * @param {!Date} date
 * @param {string} locale
 * @return {!VariablesDef}
 * @private
 */
function getVariablesInLocal(date, locale) {
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
  };
}

/**
 * @param {!Date} date
 * @param {string} locale
 * @return {!VariablesDef}
 * @private
 */
function getVariablesInUTC(date, locale) {
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

AMP.extension(TAG, '0.2', AMP => {
  AMP.registerElement(TAG, AmpDateDisplay);
});
