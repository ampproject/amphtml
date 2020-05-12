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

import * as Preact from '../../../src/preact.js';
import {AsyncRender} from './async-render.js';
import {DateDisplay} from './date-display.js';
import {PreactBaseElement} from '../../../src/preact/base-element.js';
import {RenderDomTree} from './render-dom-tree.js';
import {Services} from '../../../src/services.js';
import {dict} from '../../../src/utils/object.js';
import {isExperimentOn} from '../../../src/experiments.js';
import {isLayoutSizeDefined} from '../../../src/layout.js';
import {userAssert} from '../../../src/log.js';

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
      isExperimentOn(this.win, 'amp-date-display-v2'),
      'expected amp-date-display-v2 experiment to be enabled'
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
  'displayIn': {attr: 'display-in'},
  'offsetSeconds': {attr: 'offset-seconds', type: 'number'},
  'locale': {attr: 'locale'},
  'datetime': {attr: 'datetime'},
  'timestampMs': {attr: 'timestamp-ms', type: 'number'},
  'timestampSeconds': {attr: 'timestamp-seconds', type: 'number'},
};

AMP.extension(TAG, '0.2', (AMP) => {
  AMP.registerElement(TAG, AmpDateDisplay);
});
