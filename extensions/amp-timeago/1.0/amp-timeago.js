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

import {PreactBaseElement} from '../../../src/preact/base-element';
import {Timeago} from './timeago';
import {isExperimentOn} from '../../../src/experiments';
import {parseDate} from '../../../src/utils/date';
import {userAssert} from '../../../src/log';

/** @const {string} */
const TAG = 'amp-timeago';

class AmpTimeago extends PreactBaseElement {
  /** @override */
  isLayoutSupported(layout) {
    userAssert(
      isExperimentOn(this.win, 'amp-timeago-bento'),
      'expected amp-timeago-bento experiment to be enabled'
    );
    return super.isLayoutSupported(layout);
  }

  /** @override */
  updatePropsForRendering(props) {
    props['placeholder'] = props['children'];
  }
}

/** @override */
AmpTimeago['Component'] = Timeago;

/** @override */
AmpTimeago['passthroughNonEmpty'] = true;

/** @override */
AmpTimeago['layoutSizeDefined'] = true;

/** @override */
AmpTimeago['props'] = {
  'datetime': {
    attrs: ['datetime', 'timestamp-ms', 'timestamp-seconds', 'offset-seconds'],
    parseAttrs: parseDateAttrs,
  },
  'cutoff': {attr: 'cutoff', type: 'number'},
  'locale': {attr: 'locale'},
};

/**
 * @param {!Element} element
 * @return {?number}
 * @visibleForTesting
 */
export function parseDateAttrs(element) {
  // TODO(#29246): Is this a coincidence that timeago would have the same format
  // as date-display? E.g. the format for date-countdown is somewhat different.
  const epoch = userAssert(
    parseEpoch(element),
    'One of datetime, timestamp-ms, or timestamp-seconds is required'
  );

  const offsetSeconds =
    (Number(element.getAttribute('offset-seconds')) || 0) * 1000;
  return epoch + offsetSeconds;
}

/**
 * @param {!Element} element
 * @return {?number}
 */
function parseEpoch(element) {
  const datetime = element.getAttribute('datetime');
  if (datetime) {
    return userAssert(parseDate(datetime), 'Invalid date: %s', datetime);
  }
  const timestampMs = element.getAttribute('timestamp-ms');
  if (timestampMs) {
    return Number(timestampMs);
  }
  const timestampSeconds = element.getAttribute('timestamp-seconds');
  if (timestampSeconds) {
    return Number(timestampSeconds) * 1000;
  }
  return null;
}

AMP.extension(TAG, '1.0', (AMP) => {
  AMP.registerElement(TAG, AmpTimeago);
});
