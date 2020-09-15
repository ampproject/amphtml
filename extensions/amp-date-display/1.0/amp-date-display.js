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
import {AsyncRender} from './async-render';
import {DateDisplay} from './date-display';
import {PreactBaseElement} from '../../../src/preact/base-element';
import {RenderDomTree} from './render-dom-tree';
import {Services} from '../../../src/services';
import {dict} from '../../../src/utils/object';
import {isExperimentOn} from '../../../src/experiments';
import {isLayoutSizeDefined} from '../../../src/layout';
import {parseDate} from '../../../src/utils/date';
import {userAssert} from '../../../src/log';

/** @const {string} */
const TAG = 'amp-date-display';

class AmpDateDisplay extends PreactBaseElement {
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
      isExperimentOn(this.win, 'amp-date-display-bento'),
      'expected amp-date-display-bento experiment to be enabled'
    );
    return isLayoutSizeDefined(layout);
  }
}

/** @override */
AmpDateDisplay['Component'] = DateDisplay;

/** @override */
AmpDateDisplay['passthrough'] = true;

/** @override */
AmpDateDisplay['props'] = {
  'datetime': {
    attrs: ['datetime', 'timestamp-ms', 'timestamp-seconds', 'offset-seconds'],
    parseAttrs: parseDateAttrs,
  },
  'displayIn': {attr: 'display-in'},
  'locale': {attr: 'locale'},
};

/**
 * @param {!Element} element
 * @return {?number}
 * @visibleForTesting
 */
export function parseDateAttrs(element) {
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
  AMP.registerElement(TAG, AmpDateDisplay);
});
