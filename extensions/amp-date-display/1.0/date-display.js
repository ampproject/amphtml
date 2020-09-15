/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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

import {getDate} from '../../../src/utils/date';
import {useResourcesNotify} from '../../../src/preact/utils';

/** @const {string} */
const DEFAULT_LOCALE = 'en';

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
let VariablesV2Def;

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
let EnhancedVariablesV2Def;

/**
 * @param {!DateDisplayDef.Props} props
 * @return {PreactDef.Renderable}
 */
export function DateDisplay(props) {
  const {datetime, render, children} = props;
  const date = new Date(getDate(datetime));
  const data = /** @type {!JsonObject} */ (getDataForTemplate(date, props));
  useResourcesNotify();

  return data ? render(data, children) : null;
}

/**
 * @param {!Date} date
 * @param {!DateDisplayDef.Props} props
 * @return {?EnhancedVariablesV2Def}
 */
function getDataForTemplate(date, props) {
  const {displayIn = '', locale = DEFAULT_LOCALE} = props;

  const basicData =
    displayIn.toLowerCase() === 'utc'
      ? getVariablesInUTC(date, locale)
      : getVariablesInLocal(date, locale);

  return enhanceBasicVariables(basicData);
}

/**
 * @param {number} input
 * @return {string}
 */
function padStart(input) {
  if (input > 9) {
    return input.toString();
  }

  return '0' + input;
}

/**
 * @param {!VariablesV2Def} data
 * @return {!EnhancedVariablesV2Def}
 */
function enhanceBasicVariables(data) {
  const hour12 = data.hour % 12 || 12;

  // Override type since Object.assign is not understood
  return /** @type {!EnhancedVariablesV2Def} */ ({
    ...data,
    'yearTwoDigit': padStart(data.year % 100),
    'monthTwoDigit': padStart(data.month),
    'dayTwoDigit': padStart(data.day),
    'hourTwoDigit': padStart(data.hour),
    'hour12': hour12,
    'hour12TwoDigit': padStart(hour12),
    'minuteTwoDigit': padStart(data.minute),
    'secondTwoDigit': padStart(data.second),
    'dayPeriod': data.hour < 12 ? 'am' : 'pm',
  });
}

/**
 * @param {!Date} date
 * @param {string} locale
 * @return {!VariablesV2Def}
 */
function getVariablesInLocal(date, locale) {
  return {
    'year': date.getFullYear(),
    'month': date.getMonth() + 1,
    'monthName': date.toLocaleDateString(locale, {month: 'long'}),
    'monthNameShort': date.toLocaleDateString(locale, {
      month: 'short',
    }),
    'day': date.getDate(),
    'dayName': date.toLocaleDateString(locale, {weekday: 'long'}),
    'dayNameShort': date.toLocaleDateString(locale, {
      weekday: 'short',
    }),
    'hour': date.getHours(),
    'minute': date.getMinutes(),
    'second': date.getSeconds(),
    'iso': date.toISOString(),
  };
}

/**
 * @param {!Date} date
 * @param {string} locale
 * @return {!VariablesV2Def}
 */
function getVariablesInUTC(date, locale) {
  return {
    'year': date.getUTCFullYear(),
    'month': date.getUTCMonth() + 1,
    'monthName': date.toLocaleDateString(locale, {
      month: 'long',
      timeZone: 'UTC',
    }),
    'monthNameShort': date.toLocaleDateString(locale, {
      month: 'short',
      timeZone: 'UTC',
    }),
    'day': date.getUTCDate(),
    'dayName': date.toLocaleDateString(locale, {
      weekday: 'long',
      timeZone: 'UTC',
    }),
    'dayNameShort': date.toLocaleDateString(locale, {
      weekday: 'short',
      timeZone: 'UTC',
    }),
    'hour': date.getUTCHours(),
    'minute': date.getUTCMinutes(),
    'second': date.getUTCSeconds(),
    'iso': date.toISOString(),
  };
}
