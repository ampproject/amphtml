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
import {timeago} from '../../../third_party/timeagojs/timeago';
import {useEffect, useRef, useState} from '../../../src/preact';
import {useResourcesNotify} from '../../../src/preact/utils';

/** @const {string} */
const DEFAULT_LOCALE = 'en';

/**
 * @param {!TimeagoProps} props
 * @return {PreactDef.Renderable}
 */
export function Timeago({
  datetime,
  locale = DEFAULT_LOCALE,
  cutoff,
  cutoffText,
  ...rest
}) {
  const [timestamp, setTimestamp] = useState('');
  const ref = useRef(null);

  useEffect(() => {
    const node = ref.current;
    const observer = new IntersectionObserver((entries) => {
      const last = entries[entries.length - 1];
      if (last.isIntersecting) {
        setTimestamp(
          getFuzzyTimestampValue(datetime, locale, cutoff, cutoffText)
        );
      }
    });
    if (node) {
      observer.observe(node);
    }
    return () => observer.disconnect();
  }, [datetime, locale, cutoff, cutoffText]);

  useResourcesNotify();
  return (
    <time datetime={datetime} ref={ref} {...rest}>
      {timestamp}
    </time>
  );
}

/**
 * @param {string} datetime
 * @param {string} locale
 * @param {number|undefined} cutoff
 * @param {string|undefined} cutoffText
 * @return {string}
 */
function getFuzzyTimestampValue(datetime, locale, cutoff, cutoffText) {
  if (!cutoff) {
    return timeago(datetime, locale);
  }
  const elDate = new Date(datetime);
  const secondsAgo = Math.floor((Date.now() - elDate.getTime()) / 1000);

  if (secondsAgo > cutoff) {
    return cutoffText || '';
  }
  return timeago(datetime, locale);
}
