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
import {
  PositionBoundFxProvider,
  ScrollToggleFxProvider,
} from './providers/fx-provider';
import {Services} from '../../../src/services';
import {devAssert, rethrowAsync, user, userAssert} from '../../../src/log';
import {iterateCursor} from '../../../src/dom';
import {listen} from '../../../src/event-helper';
import {map} from '../../../src/utils/object';

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

/**
 * Type foldings.
 * @enum {string}
 */
const FxProviderId = {
  FLOAT_IN: 'float-in',
};

/**
 * Providers that get folded by type.
 * @enum {string}
 */
const FxProviderMapping = {
  [FxType.FLOAT_IN_BOTTOM]: FxProviderId.FLOAT_IN,
  [FxType.FLOAT_IN_TOP]: FxProviderId.FLOAT_IN,
};


/** @const {!Object<!FxType, boolean>} */
const ScrollToggleFxTypes = {
  [FxProviderId.FLOAT_IN]: true,
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
 *
 *        A   B   C   D
 *    A  ///      X   X
 *    B  /// ///  X
 *    C  /// /// ///
 *    D  /// /// /// ///
 *
 * 3. Add the example restrictions (A, C) and (B, C) to this object. The
 *    mirrored restrictions (C, A) and (C, B) DO NOT need to be included.
 *
 * You can also just sort every restriction tuple you need to add alphabetically
 * and add each unique resulting tuple here.
 * ```
 * @private @const {!Object<FxType, !Array<FxType>>}
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
  const normalA = fxTypeA < fxTypeB ? fxTypeA : fxTypeB;
  const normalB = fxTypeA < fxTypeB ? fxTypeB : fxTypeA;

  const restricted = restrictedFxTypes[normalA];
  return restricted && restricted[normalA].indexOf(normalB) > -1;
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

    /** @private @const {!Document|!ShadowRoot} */
    this.root_ = ampdoc.getRootNode();

    /** @private @const {!Array<!Element>} */
    this.seen_ = [];

    /** @private @const {!../../../src/service/viewer-impl.Viewer} */
    this.viewer_ = Services.viewerForDoc(ampdoc);

    /** @private @const {!Object<!FxType, ./providers/fx-provider.FxProviderInterface>} */
    this.fxProviderInstances_ = map();

    Promise.all([
      ampdoc.whenReady(),
      this.viewer_.whenFirstVisible(),
    ]).then(() => {
      // Scan when page becomes visible.
      this.scan_();
      // Rescan as DOM changes happen.
      listen(this.root_, AmpEvents.DOM_UPDATE, this.scan_.bind(this));
    });
  }

  /**
   * Scans the root for fx-enabled elements and registers them with the
   * fx provider.
   */
  scan_() {
    const fxElements = this.root_.querySelectorAll('[amp-fx]');
    iterateCursor(fxElements, fxElement => {
      if (this.seen_.includes(fxElement)) {
        return;
      }

      // Don't break for all components if only a subset are misconfigured.
      try {
        this.register_(fxElement);
      } catch (e) {
        rethrowAsync(e);
      }
    });
  }

  /**
   * Registers an fx-enabled element with its requested fx providers.
   * @param {!Element} fxElement
   */
  register_(fxElement) {
    devAssert(fxElement.hasAttribute('amp-fx'));
    devAssert(!this.seen_.includes(fxElement));
    devAssert(this.viewer_.isVisible());

    const fxTypes = this.getFxTypes_(fxElement);

    fxTypes.forEach(fxType => {
      const fxProvider = this.getFxProvider_(fxType);
      fxProvider.installOn(fxElement);
    });

    this.seen_.push(fxElement);
  }

  /**
   * Returns the array of fx types this component has specified as a
   * space-separated list in the value of `amp-fx` attribute.
   * e.g. `amp-fx="parallax fade-in"
   *
   * @param {!Element} fxElement
   * @return {!Array<!FxType>}
   */
  getFxTypes_(fxElement) {
    devAssert(fxElement.hasAttribute('amp-fx'));
    const fxTypes = fxElement.getAttribute('amp-fx')
        .trim()
        .toLowerCase()
        .split(/\s+/);

    userAssert(fxTypes.length, 'No value provided for `amp-fx` attribute');

    // Validate that we support the requested fx types.
    fxTypes.forEach(fxType => {
      user().assertEnumValue(FxType, fxType, 'amp-fx');
    });

    this.sanitizeFxTypes_(fxTypes);

    return fxTypes;
  }

  /**
   * Returns the array of fx types this component after checking that no
   * clashing fxTypes are present on the same element.
   * e.g. `amp-fx="parallax fade-in"
   *
   * @param {!Array<!FxType>} fxTypes
   * @return {!Array<!FxType>}
   */
  sanitizeFxTypes_(fxTypes) {
    iterateCursor(fxTypes, (fxTypeA, i) => {
      iterateCursor(fxTypes, (fxTypeB, j) => {
        if (i == j) {
          return;
        }
        if (isFxTupleRestricted(fxTypeA, fxTypeB)) {
          user().warn(TAG,
              '%s preset can\'t be combined with %s preset as the ' +
              'resulting animation isn\'t valid.', fxTypeB, fxTypeA);
          fxTypes.splice(j, 1);
        }
      });
    });
    return fxTypes;
  }

  /**
   * Given an fx type, instantiates the appropriate provider if needed and
   * returns it.
   * @param {!FxType} fxType
   * @return {!./providers/fx-provider.FxProviderInterface}
   */
  getFxProvider_(fxType) {
    const mappedType = FxProviderMapping[fxType] || fxType;
    if (this.fxProviderInstances_[mappedType]) {
      return this.fxProviderInstances_[mappedType];
    }
    const ctor = this.getFxProviderCtor_(mappedType);
    const instance = new ctor(this.ampdoc_, mappedType);
    return (this.fxProviderInstances_[mappedType] = instance);
  }

  /**
   * Given an fx type, instantiates the appropriate provider if needed and
   * returns it.
   * @param {!FxType|!FxProviderId} typeOrProviderId
   * @return {function(new: ./providers/fx-provider.FxProviderInterface)}
   */
  getFxProviderCtor_(typeOrProviderId) {
    if (ScrollToggleFxTypes[typeOrProviderId]) {
      return ScrollToggleFxProvider;
    }
    return PositionBoundFxProvider; // by default
  }
}

AMP.extension(TAG, '0.1', AMP => {
  AMP.registerServiceForDoc(TAG, AmpFxCollection);
});
