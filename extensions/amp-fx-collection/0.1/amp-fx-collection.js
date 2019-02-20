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
 * @enum {string}
 */
const FxType = {
  // Keep alphabetically sorted.
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

/** @const {!Object<!FxType, boolean>} */
const scrollToggledFxTypes = {
  [FxType.FLOAT_IN_BOTTOM]: true,
  [FxType.FLOAT_IN_TOP]: true,
};

/**
 * Symmetric matrix normalized alphabetically, don't repeat mirror side.
 * Keep symmetric properties!
 *
 * For comparison, a full table would look like this: https://git.io/fhFvT
 *
 * If you need to update this table this may help you: https://git.io/fhdh3
 * Copy that table into a spreadsheet and add a column and row for the new
 * type in the alphabetical position. Gray out invalid/repeated cells like in
 * the example above. Add the restricted cells, and then include them here.
 *
 * e.g.
 * ```
 *  1. Initial matrix
 *
 *        A   B   D
 *    A  ///      X
 *    B  /// ///
 *    D  /// /// ///
 *
 *  2. Add "C" in its alphabetical position and its restrictions.
 *               👇
 *        A   B   C   D
 *    A  ///      X   X
 *    B  /// ///  X
 * 👉 C  /// /// ///
 *    D  /// /// /// ///
 *
 * 3. Add the example restrictions (A, C) and (B, C) to this object. The
 *    mirrored restrictions (C, A) and (C, B) DO NOT need to be included.
 *
 * You can also just sort every restriction tuple you need to add alphabetically
 * and add each unique resulting tuple here.
 * ```
 * @private @const {!Object<!FxType, !Array<!FxType>>}
 */
const restrictedFxTypes = {
  [FxType.FADE_IN]: [
    FxType.FADE_IN_SCROLL,
    // scroll-toggled is not compatible with position-bound fx
    FxType.FLOAT_IN_BOTTOM,
    FxType.FLOAT_IN_TOP,
  ],
  [FxType.FADE_IN_SCROLL]: [
    FxType.FLOAT_IN_BOTTOM,
    FxType.FLOAT_IN_TOP,
  ],
  [FxType.FLOAT_IN_BOTTOM]: [
    FxType.FLOAT_IN_TOP,
    // scroll-toggled is not compatible with position-bound fx
    FxType.FLY_IN_BOTTOM,
    FxType.FLY_IN_LEFT,
    FxType.FLY_IN_RIGHT,
    FxType.FLY_IN_TOP,
    FxType.PARALLAX,
  ],
  [FxType.FLOAT_IN_TOP]: [
    // scroll-toggled is not compatible with position-bound fx
    FxType.FLY_IN_BOTTOM,
    FxType.FLY_IN_LEFT,
    FxType.FLY_IN_RIGHT,
    FxType.FLY_IN_TOP,
    FxType.PARALLAX,
  ],
  [FxType.FLY_IN_BOTTOM]: [FxType.FLY_IN_TOP, FxType.PARALLAX],
  [FxType.FLY_IN_LEFT]: [FxType.FLY_IN_RIGHT],
  [FxType.FLY_IN_TOP]: [FxType.PARALLAX],
};

/**
 * @param {FxType} fxTypeA
 * @param {FxType} fxTypeB
 * @return {boolean}
 * @private
 */
function isFxTupleRestricted(fxTypeA, fxTypeB) {
  // Normalize alphabetically to check symmetric matrix.
  const aLowerThanB = fxTypeA < fxTypeB;

  const normalA = aLowerThanB ? fxTypeA : fxTypeB;
  const normalB = aLowerThanB ? fxTypeB : fxTypeA;

  const restricted = restrictedFxTypes[normalA];
  return restricted && restricted.indexOf(normalB) > -1;
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
    if (scrollToggledFxTypes[type]) {
      return installScrollToggledFx(this.ampdoc_, element, type);
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
 * Returns the array of fx types this component after checking that no clashing
 * fx types are present on the same element.
 *
 * e.g.`amp-fx="parallax fade-in"
 *
 * This will modify the array in place.
 *
 * @param {!Array<!FxType>} types
 * @return {!Array<!FxType>}
 */
function sanitizeFxTypes(types) {
  for (let i = 0; i < types.length; i++) {
    const fxTypeA = types[i];
    if (fxTypeA in restrictedFxTypes) {
      for (let j = i + 1; j < types.length; j++) {
        const fxTypeB = types[j];
        if (isFxTupleRestricted(fxTypeA, fxTypeB)) {
          user().warn(TAG,
              '%s preset can\'t be combined with %s preset as the ' +
              'resulting animation isn\'t valid.', fxTypeA, fxTypeB);
          types.splice(j, 1);
        }
      }
    }
  }
  return types;
}

AMP.extension(TAG, '0.1', AMP => {
  AMP.registerServiceForDoc(TAG, AmpFxCollection);
});
