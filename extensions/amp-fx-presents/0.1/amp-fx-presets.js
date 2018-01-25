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

import {AmpEvents} from '../../../src/amp-events';
import {listen} from '../../../src/event-helper';
import {iterateCursor} from '../../../src/dom';
import {dev, user} from '../../../src/log';
import {map} from '../../../src/utils/object';
import {Services} from '../../../src/services';
import {ParallaxProvider} from './providers/parallax';

const TAG = 'amp-fx-presets';

/**
 * @enum {string}
 */
const FxType = {
  PARALLAX: 'parallax',
};

/**
 * Map of Fx Type to Fx Provider class.
 * @type {Object<FxType, FxProviderInterface>}
 */
const fxProviders = map();
fxProviders[FxType.PARALLAX] = ParallaxProvider;

/**
 * Bootstraps elements that have `amp-fx=<fx1 fx2>` attribute and installs
 * the specified effects on them.
 */
class AmpFxPresets {

  /**
   * @param  {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   */
  constructor(ampdoc) {

    /** @private @const {!../../../src/service/ampdoc-impl.AmpDoc} */
    this.ampdoc_ = ampdoc;

    /** @private @const {!Document|!ShadowRoot} */
    this.root_ = ampdoc.getRootNode();

    /** @private @const {!Array<!Element>} */
    this.seen_ = [];

    Services.viewerForDoc(ampdoc).whenFirstVisible().then(() => {
      this.scan_();
      listen(this.root_, AmpEvents.DOM_UPDATE, this.scan_.bind(this));
    });
  }

  /**
   * Scans the root for fx-enabled elements and registers them with them with
   * the fx provider.
   */
  scan_() {
    const fxElements = this.root_.querySelectorAll(['amp-fx']);
    iterateCursor(fxElements, fxElement => {
      if (this.seen_.includes(fxElement)) {
        return;
      }

      this.register_(fxElement);
    });
  }

  /**
   * @param {!Element} fxElement
   */
  register_(fxElement) {
    dev().assert(fxElement.hasAttribute('amp-fx'));
    dev().assert(!this.seen_.includes(fxElement));

    /** @type {!Array<!FxType>} */
    const fxTypes = this.getFxTypes_(fxElement);
    fxTypes.forEach(fxType => {
      const fxProvider = this.getFxProvider_(fxType);
      fxProvider.installOn(fxElement);
    });
  }

  /**
   * Returns the array of fx types this component has specified as a
   * space-separated list in the value of `amp-fx` attribute.
   * e.g. `amp-fx="parallax fade-in"
   *
   * @param {!Element} fxElement
   * @returns {!Array<!FxType>}
   */
  getFxTypes_(fxElement) {

    const fxTypes = fxElement.getAttribute('fx-type')
        .trim()
        .toLowerCase()
        .split(/\s+/);

    user().assert(fxTypes.length, 'No value provided for `amp-fx` attribute');

    fxTypes.forEach(fxType => {
      user().assertEnumValue(FxType, fxType, 'amp-fx');
    });

    return fxTypes;
  }

  /**
   *
   * @param {*} fxType
   */
  getFxProvider_(fxType) {
    if (!this.fxProviderInstances_[fxType]) {
      this.fxProviderInstances_[fxType] = new fxProviders[fxType](this.ampdoc);
    }

    return this.fxProviderInstances_[fxType];
  }
}

/**
 * @interface
 */
export class FxProviderInterface {

  /**
   * @param  {!../../../src/service/ampdoc-impl.AmpDoc} unusedAmpDoc
   */
  constructor(unusedAmpDoc) {}

  /**
   *
   * @param {!Element} unusedElement
   */
  installOn(unusedElement) {}
};

AMP.extension(TAG, '0.1', AMP => {
  AMP.registerServiceForDoc(TAG, AmpFxPresets);
});
