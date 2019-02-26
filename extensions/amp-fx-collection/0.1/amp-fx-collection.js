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
import {Services} from '../../../src/services';
import {devAssert, rethrowAsync, user, userAssert} from '../../../src/log';
import {
  installPositionBoundFx,
  installScrollToggledFx,
} from './providers/fx-provider';
import {iterateCursor} from '../../../src/dom';
import {listen} from '../../../src/event-helper';

const TAG = 'amp-fx-collection';

/**
 * Enum for list of supported visual effects.
 * Make sure to also define each respective binding set below (FxBindings).
 * @enum {string}
 */
const FxType = {
  // Keep alphabetically sorted.
  // Or don't. I'm just a sign, not a cop.
  FADE_IN: 'fade-in',
  FADE_IN_SCROLL: 'fade-in-scroll',
  FLOAT_IN_BOTTOM: 'float-in-bottom',
  FLOAT_IN_TOP: 'float-in-top',
  FLY_IN_BOTTOM: 'fly-in-bottom',
  FLY_IN_LEFT: 'fly-in-left',
  FLY_IN_RIGHT: 'fly-in-right',
  FLY_IN_TOP: 'fly-in-top',
  PARALLAX: 'parallax',
};

/**
 * FX observes:
 *  - POSITION: a PositionObserver
 *  - SCROLL_TOGGLE: a toggling mechanism on scroll similar to browser UI
 *
 * Different observation mechanisms have different implementations and internal
 * APIs. See AmpFxCollection.install_().
 * @enum {number}
 */
const FxObservesSignal = {
  POSITION: 0,
  SCROLL_TOGGLE: 1,
};

/**
 * Defines the aspects an FX is bound to.
 *  - `observes` either POSITION or SCROLL_TOGGLE.
 *  - `translates` the ax(i|e)s this FX translates elements on. Optional.
 *  - `opacity` whether this FX changes opacity. Optional.
 *
 * Two FX are compatible and therefore combinable IFF:
 *  1. both observe the same signal
 *  2. neither translates along the same axis
 *  3. only one or none of them changes opacity
 * @typedef {{
 *  observes: !FxObservesSignal,
 *  opacity: (boolean|undefined)
 *  translates: ({
 *    x: (boolean|undefined),
 *    y: (boolean|undefined),
 *  }|undefined),
 * }}
 */
let FxBindingDef;

/**
 * Include respective `FxType`s here.
 * @private @const {!Object<!FxType, !FxBindingDef>}
 */
const FxBindings = {
  [FxType.FADE_IN]: {
    observes: FxObservesSignal.POSITION,
    opacity: true,
  },
  [FxType.FADE_IN_SCROLL]: {
    observes: FxObservesSignal.POSITION,
    opacity: true,
  },
  [FxType.FLOAT_IN_BOTTOM]: {
    observes: FxObservesSignal.SCROLL_TOGGLE,
    translates: {y: true},
  },
  [FxType.FLOAT_IN_TOP]: {
    observes: FxObservesSignal.SCROLL_TOGGLE,
    translates: {y: true},
  },
  [FxType.FLY_IN_BOTTOM]: {
    observes: FxObservesSignal.POSITION,
    translates: {y: true},
  },
  [FxType.FLY_IN_LEFT]: {
    observes: FxObservesSignal.POSITION,
    translates: {x: true},
  },
  [FxType.FLY_IN_RIGHT]: {
    observes: FxObservesSignal.POSITION,
    translates: {x: true},
  },
  [FxType.FLY_IN_TOP]: {
    observes: FxObservesSignal.POSITION,
    translates: {y: true},
  },
  [FxType.PARALLAX]: {
    observes: FxObservesSignal.POSITION,
    translates: {y: true},
  },
};

/**
 * @param {FxType} fxTypeA
 * @param {FxType} fxTypeB
 * @return {boolean}
 * @private
 */
export function isCombinationValid(fxTypeA, fxTypeB) {
  if (fxTypeA == fxTypeB) {
    return false;
  }

  const {
    observes: observesA,
    translates: translatesA,
    opacity: opacityA,
  } = FxBindings[fxTypeA];

  const {
    observes: observesB,
    translates: translatesB,
    opacity: opacityB,
  } = FxBindings[fxTypeB];

  // If they observe different signals, they're restricted.
  if (observesA !== observesB) {
    return false;
  }

  // If they both change opacity, they're restricted.
  if (opacityA && opacityB) {
    return false;
  }

  // If they translate along the same axis, they're restricted.
  if (translatesA && translatesB) {
    if (translatesA.x && translatesB.x) {
      return false;
    }
    if (translatesA.y && translatesB.y) {
      return false;
    }
  }

  return true;
}

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

    /** @private @const {!../../../src/service/viewer-impl.Viewer} */
    this.viewer_ = Services.viewerForDoc(ampdoc);

    Promise.all([
      ampdoc.whenReady(),
      this.viewer_.whenFirstVisible(),
    ]).then(() => {
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
    iterateCursor(elements, element => {
      if (this.seen_.includes(element)) {
        return;
      }

      // Don't break for all components if only a subset are misconfigured.
      try {
        this.register_(element);
      } catch (e) {
        rethrowAsync(e);
      }
    });
  }

  /**
   * Registers an fx-enabled element with its requested fx providers.
   * @param {!Element} element
   */
  register_(element) {
    devAssert(element.hasAttribute('amp-fx'));
    devAssert(!this.seen_.includes(element));
    devAssert(this.viewer_.isVisible());

    getFxTypes(element).forEach(type => {
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


/**
 * Returns the array of fx types this component has specified as a
 * space-separated list in the value of `amp-fx` attribute.
 * e.g. `amp-fx="parallax fade-in"
 *
 * @param {!Element} element
 * @return {!Array<!FxType>}
 */
export function getFxTypes(element) {
  devAssert(element.hasAttribute('amp-fx'));
  const fxTypes = element.getAttribute('amp-fx')
      .trim()
      .toLowerCase()
      .split(/\s+/);

  userAssert(fxTypes.length, 'No value provided for `amp-fx` attribute');

  // Validate that we support the requested fx types.
  fxTypes.forEach(fxType => {
    user().assertEnumValue(FxType, fxType, 'amp-fx');
  });

  return sanitizeFxTypes(fxTypes);
}


/**
 * Removes the conflicting types from an array of fx types.
 * Kept by order.
 *
 * e.g. `['parallax', 'fly-in-left'] -> ['parallax']`
 *
 * This will modify the array in place.
 *
 * @param {!Array<!FxType>} types
 * @return {!Array<!FxType>}
 */
function sanitizeFxTypes(types) {
  for (let i = 0; i < types.length; i++) {
    const fxTypeA = types[i];
    for (let j = i + 1; j < types.length; j++) {
      const fxTypeB = types[j];
      if (!isCombinationValid(fxTypeA, fxTypeB)) {
        user().warn(TAG,
            '%s preset can\'t be combined with %s preset as the resulting ' +
            'animation isn\'t valid.', fxTypeA, fxTypeB);
        types.splice(j, 1);
      }
    }
  }
  return types;
}

AMP.extension(TAG, '0.1', AMP => {
  AMP.registerServiceForDoc(TAG, AmpFxCollection);
});
