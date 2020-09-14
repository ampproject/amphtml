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

import * as Preact from '../../../src/preact';
import {Wrapper} from '../../../src/preact/component';
import {timeago} from '../../../third_party/timeagojs/timeago';
import {useEffect, useRef, useState} from '../../../src/preact';
import {useResourcesNotify} from '../../../src/preact/utils';

/** @const {string} */
const DEFAULT_LOCALE = 'en';

/** @const {!Object<string, *>} */
const DEFAULT_DATETIME_OPTIONS = {
  'year': 'numeric',
  'month': 'short',
  'day': 'numeric',
  'hour': 'numeric',
  'minute': 'numeric',
};

/** @const {!Object<string, *>} */
const DEFAULT_TIME_OPTIONS = {'hour': 'numeric', 'minute': 'numeric'};

/**
 * @param {!TimeagoProps} props
 * @return {PreactDef.Renderable}
 */
export function Timeago({
  datetime,
  locale = DEFAULT_LOCALE,
  cutoff,
  placeholder,
  ...rest
}) {
  const [timestamp, setTimestamp] = useState(placeholder || '');
  const ref = useRef(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) {
      return undefined;
    }
    const observer = new IntersectionObserver((entries) => {
      const last = entries[entries.length - 1];
      if (last.isIntersecting) {
        setTimestamp(
          getFuzzyTimestampValue(datetime, locale, cutoff, placeholder)
        );
      }
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [datetime, locale, cutoff, placeholder]);

  useResourcesNotify();

  return (
    <Wrapper {...rest} as="time" ref={ref} datetime={datetime}>
      {timestamp}
    </Wrapper>
  );
}

/**
 * @param {string} datetime
 * @param {string} locale
 * @param {number|undefined} cutoff
 * @param {string|!PreactDef.VNode|null|undefined} placeholder
 * @return {string|!PreactDef.VNode}
 */
function getFuzzyTimestampValue(datetime, locale, cutoff, placeholder) {
  if (!cutoff) {
    return timeago(datetime, locale);
  }
  const elDate = new Date(datetime);
  const secondsAgo = Math.floor((Date.now() - elDate.getTime()) / 1000);

  if (secondsAgo > cutoff) {
    return placeholder ? placeholder : getDefaultPlaceholder(elDate, locale);
  }
  return timeago(datetime, locale);
}

/**
 * @param {Date} date
 * @param {string} locale
 * @return {string}
 */
function getDefaultPlaceholder(date, locale) {
  if (date.toLocaleDateString() == new Date().toLocaleDateString()) {
    // Same date: time is enough.
    return date.toLocaleTimeString(locale, DEFAULT_TIME_OPTIONS);
  }
  return date.toLocaleString(locale, DEFAULT_DATETIME_OPTIONS);
}
