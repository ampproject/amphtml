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

import {DateDisplay} from './date-display';
import {PreactBaseElement} from '../../../src/preact/base-element';
import {Services} from '../../../src/services';
import {dev, userAssert} from '../../../src/log';
import {dict} from '../../../src/utils/object';
import {isExperimentOn} from '../../../src/experiments';
import {parseDate} from '../../../src/utils/date';

/** @const {string} */
const TAG = 'amp-date-display';

class AmpDateDisplay extends PreactBaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {?../../../src/service/template-impl.Templates} */
    this.templates_ = null;

    /** @private {?Element} */
    this.template_ = null;
  }

  /** @override */
  isLayoutSupported(layout) {
    userAssert(
      isExperimentOn(this.win, 'bento') ||
        isExperimentOn(this.win, 'bento-date-display'),
      'expected global "bento" or specific "bento-date-display" experiment to be enabled'
    );
    return super.isLayoutSupported(layout);
  }

  /** @override */
  checkPropsPostMutations() {
    const templates =
      this.templates_ || (this.templates_ = Services.templatesFor(this.win));
    const template = templates.maybeFindTemplate(this.element);
    if (template != this.template_) {
      this.template_ = template;
      if (template) {
        // Only overwrite `render` when template is ready to minimize FOUC.
        templates.whenReady(template).then(() => {
          if (template != this.template_) {
            // A new template has been set while the old one was initializing.
            return;
          }
          this.mutateProps(
            dict({
              'render': (data) => {
                return templates
                  .renderTemplateAsString(dev().assertElement(template), data)
                  .then((html) => dict({'__html': html}));
              },
            })
          );
        });
      } else {
        this.mutateProps(dict({'render': null}));
      }
    }
  }

  /** @override */
  isReady(props) {
    if (this.template_ && !('render' in props)) {
      // The template is specified, but not available yet.
      return false;
    }
    return true;
  }
}

/** @override */
AmpDateDisplay['Component'] = DateDisplay;

/** @override */
AmpDateDisplay['props'] = {
  'datetime': {
    attrs: ['datetime', 'timestamp-ms', 'timestamp-seconds', 'offset-seconds'],
    parseAttrs: parseDateAttrs,
  },
  'displayIn': {attr: 'display-in'},
  'locale': {attr: 'locale'},
};

/** @override */
AmpDateDisplay['layoutSizeDefined'] = true;

/** @override */
AmpDateDisplay['lightDomTag'] = 'div';

/** @override */
AmpDateDisplay['usesTemplate'] = true;

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
