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
import {Wrapper, useRenderer} from '../../../src/preact/component';
import {getLocaleStrings} from './messages';
import {useAmpContext} from '../../../src/preact/context';
import {useEffect, useMemo, useRef, useState} from '../../../src/preact';
import {useResourcesNotify} from '../../../src/preact/utils';

const NAME = 'DateCountdown';

// Constants
/** @const {number} */
const MILLISECONDS_IN_DAY = 24 * 60 * 60 * 1000;

/** @const {number} */
const MILLISECONDS_IN_HOUR = 60 * 60 * 1000;

/** @const {number} */
const MILLISECONDS_IN_MINUTE = 60 * 1000;

/** @const {number} */
const MILLISECONDS_IN_SECOND = 1000;

/** @const {number} */
const DELAY = 1000;

/** @const {Object<string, number>} */
const TimeUnit = {
  DAYS: 1,
  HOURS: 2,
  MINUTES: 3,
  SECONDS: 4,
};

// Default prop values
const DEFAULT_OFFSET_SECONDS = 0;
const DEFAULT_LOCALE = 'en';
const DEFAULT_WHEN_ENDED = 'stop';
const DEFAULT_BIGGEST_UNIT = 'DAYS';

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
  ...rest
}) {
  useResourcesNotify();
  const {playable} = useAmpContext();

  // One time calculation of our final countdown target in epoch format
  const epoch = useMemo(
    () =>
      getEpoch(endDate, timeleftMs, timestampMs, timestampSeconds) +
      offsetSeconds * MILLISECONDS_IN_SECOND,
    [endDate, timeleftMs, timestampMs, timestampSeconds, offsetSeconds]
  );

  // How much time is left in our countdown
  const setTimeleft = useState(epoch - Date.now())[1];

  // One time calculation of time labels in specified locale
  const localeStrings = useMemo(() => getLocaleWord(locale), [locale]);

  // Reference to DOM element to get access to correct window
  const rootRef = useRef(null);

  // A reference to our 'data', 'data' is used to populate the template
  // A reference is used so we can use the same object instance between
  // successive re-renders
  const dataRef = useRef(
    getYDHMSFromMs(epoch - Date.now() + DELAY, biggestUnit)
  );

  // Put localeStrings into the data object
  Object.assign(dataRef.current, localeStrings);

  useEffect(() => {
    if (!playable || !rootRef.current) {
      return;
    }
    const win = rootRef.current.ownerDocument.defaultView;
    const interval = win.setInterval(() => {
      const newTimeleft = epoch - Date.now() + DELAY;

      // Trigger a re-render
      setTimeleft(newTimeleft);

      // Update dataRef to a new object to trigger re-calculation of 'rendered'
      // (in the useRenderer function)
      const data = getYDHMSFromMs(newTimeleft, biggestUnit);
      dataRef.current = data;

      if (whenEnded === DEFAULT_WHEN_ENDED && newTimeleft < 1000) {
        win.clearInterval(interval);
      }
    }, DELAY);
    return () => win.clearInterval(interval);
  }, [playable, epoch, whenEnded, biggestUnit]);

  const rendered = useRenderer(render, dataRef.current);
  const isHtml =
    rendered && typeof rendered == 'object' && '__html' in rendered;

  return (
    <Wrapper
      {...rest}
      ref={rootRef}
      dangerouslySetInnerHTML={isHtml ? rendered : null}
    >
      {isHtml ? null : rendered}
    </Wrapper>
  );
}

/**
 * Calculate the epoch time that this component should countdown to from
 * one of multiple input options.
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
    epoch = Date.now() + timeleftMs;
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
 * Return an object with a label for 'years', 'months', etc. based on the
 * user provided locale string.
 * @param {string} locale
 * @return {!JsonObject}
 */
function getLocaleWord(locale) {
  if (getLocaleStrings(locale) === undefined) {
    displayWarning(
      `Invalid locale ${locale}, defaulting to ${DEFAULT_LOCALE}. ${NAME}`
    );
    locale = DEFAULT_LOCALE;
  }
  const localeWordList = getLocaleStrings(locale);
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
 * Converts a time represented in milliseconds (ms) into a representation with
 * days, hours, minutes, etc. and returns formatted strings in an object.
 * @param {number} ms
 * @param {string} biggestUnit
 * @return {JsonObject}
 */
function getYDHMSFromMs(ms, biggestUnit) {
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
    'd': d,
    'dd': padStart(d),
    'h': h,
    'hh': padStart(h),
    'm': m,
    'mm': padStart(m),
    's': s,
    'ss': padStart(s),
  };
}

/**
 * Format a number for output to the template.  Adds a leading zero if the
 * input is only one digit and a negative sign for inputs less than 0.
 * @param {number} input
 * @return {string}
 */
function padStart(input) {
  if (input < -9 || input > 9) {
    return String(input);
  } else if (input >= -9 && input < 0) {
    return '-0' + -input;
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
function displayWarning(message) {
  console /*OK*/
    .warn(message);
}
