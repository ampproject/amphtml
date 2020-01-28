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

import {createElement} from '../../../src/preact';
import {timeago} from '../../../third_party/timeagojs/timeago';
import {useResourcesNotify} from '../../../src/preact/utils';

/**
 * @param {!JsonObject} props
 * @return {Preact.Renderable}
 */
export function Timeago(props) {
  const timestamp = getFuzzyTimestampValue(
    props['datetime'],
    props['locale'],
    props['init'],
    props['cutoff']
  );
  useResourcesNotify();
  return createElement('time', {datetime: props['datetime']}, timestamp);
}

/**
 * @param {string} datetime
 * @param {string} locale
 * @param {string} init
 * @param {number=} opt_cutoff
 * @return {string}
 */
function getFuzzyTimestampValue(datetime, locale, init, opt_cutoff) {
  if (!opt_cutoff) {
    return timeago(datetime, locale);
  }
  const elDate = new Date(datetime);
  const secondsAgo = Math.floor((Date.now() - elDate.getTime()) / 1000);

  if (secondsAgo > opt_cutoff) {
    return init;
  }
  return timeago(datetime, locale);
}
