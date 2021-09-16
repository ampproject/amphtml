/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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

import {AmpEvents} from '../../../src/core/constants/amp-events';
import {
  FxBindings,
  FxObservesSignal,
  FxType, // eslint-disable-line no-unused-vars
  getFxTypes,
} from './fx-type';
import {devAssert} from '../../../src/log';
import {
  installPositionBoundFx,
  installScrollToggledFx,
} from './providers/fx-provider';
import {iterateCursor} from '../../../src/dom';
import {listen} from '../../../src/event-helper';
import {tryCallback} from '../../../src/core/error';

const TAG = 'amp-fx-collection';

/**
 * Bootstraps elements that have `amp-fx=<fx1 fx2>` attribute and installs
 * the specified effects on them.
 * @visibleForTesting
 */
export class AmpFxCollection {
  /**
   * @param  {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   */
  constructor(ampdoc) {
    /** @private @const {!../../../src/service/ampdoc-impl.AmpDoc} */
    this.ampdoc_ = ampdoc;

    /** @private @const {!Array<!Element>} */
    this.seen_ = [];

    Promise.all([ampdoc.whenReady(), ampdoc.whenFirstVisible()]).then(() => {
      const root = this.ampdoc_.getRootNode();
      // Scan when page becomes visible.
      this.scan_();
      // Rescan as DOM changes happen.
      listen(root, AmpEvents.DOM_UPDATE, () => this.scan_());
    });
  }

  /**
   * Scans the root for fx-enabled elements and registers them with the
   * fx provider.
   */
  scan_() {
    const elements = this.ampdoc_.getRootNode().querySelectorAll('[amp-fx]');
    iterateCursor(elements, (element) => {
      if (this.seen_.includes(element)) {
        return;
      }

      // Don't break for all components if only a subset are misconfigured.
      tryCallback(() => this.register_(element));
    });
  }

  /**
   * Registers an fx-enabled element with its requested fx providers.
   * @param {!Element} element
   */
  register_(element) {
    devAssert(element.hasAttribute('amp-fx'));
    devAssert(!this.seen_.includes(element));
    devAssert(this.ampdoc_.isVisible());

    getFxTypes(element).forEach((type) => {
      this.install_(element, type);
    });

    this.seen_.push(element);
  }

  /**
   * @param {!Element} element
   * @param {!FxType} type
   * @private
   */
  install_(element, type) {
    const {observes} = devAssert(FxBindings[type]);
    if (observes == FxObservesSignal.SCROLL_TOGGLE) {
      installScrollToggledFx(this.ampdoc_, element, type);
      return;
    }
    installPositionBoundFx(this.ampdoc_, element, type);
  }
}

AMP.extension(TAG, '0.1', (AMP) => {
  AMP.registerServiceForDoc(TAG, AmpFxCollection);
});
