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

import {
  ADSENSE_MCRSPV_TAG,
  ADSENSE_RSPV_TAG,
  ADSENSE_RSPV_WHITELISTED_HEIGHT,
  getMatchedContentResponsiveHeightAndUpdatePubParams,
} from '../../../ads/google/utils';
import {Services} from '../../../src/services';
import {addExperimentIdToElement} from '../../../ads/google/a4a/traffic-experiments';
import {clamp} from '../../../src/utils/math';
import {computedStyle, setStyle} from '../../../src/style';
import {dev, user} from '../../../src/log';
import {hasOwn} from '../../../src/utils/object';
import {randomlySelectUnsetExperiments} from '../../../src/experiments';
import {toWin} from '../../../src/types';

const TAG = 'amp-ad-network-adsense-impl';

/**
 * Value of &rafmt= URL parameter depending on data-auto-format.
 * @const {!Object<string, number>}
 */
const RAFMT_PARAMS = {
  [ADSENSE_RSPV_TAG]: 13,
  [ADSENSE_MCRSPV_TAG]: 15,
};

/** @const {!{branch: string, control: string, experiment: string}}
    @visibleForTesting
*/
export const MAX_HEIGHT_EXP = {
  branch: 'fix-inconsistent-responsive-height-selection',
  control: '368226520',
  experiment: '368226521',
};

/** @final */
export class ResponsiveState {
  /**
   * @param {!Element} element
   */
  constructor(element) {
    /**  @private {!Element}*/
    this.element_ = element;

    /** @private {boolean} */
    this.isAlignedToViewport_ = false;

    /** @private {!Window} */
    this.win_ = toWin(element.ownerDocument.defaultView);
  }

  /**
   * @param {!Element} element to potentially create state for.
   * @return {?ResponsiveState} reponsive state for the element, if it
   *  corresponds to a responsive ad, otherwise null.
   */
  static createIfResponsive(element) {
    const autoFormat = element.getAttribute('data-auto-format');
    if (!hasOwn(RAFMT_PARAMS, autoFormat)) {
      return null;
    }
    return new ResponsiveState(element);
  }

  /** @return {boolean} */
  isValidElement() {
    if (!this.element_.hasAttribute('data-full-width')) {
      user().warn(
        TAG,
        'Responsive AdSense ad units require the attribute ' +
          'data-full-width.'
      );
      return false;
    }

    const height = this.element_.getAttribute('height');
    const width = this.element_.getAttribute('width');
    // height is set to 0 by amp-auto-ads to avoid reflow.
    if (height != 0 && height != ADSENSE_RSPV_WHITELISTED_HEIGHT) {
      user().warn(
        TAG,
        `Specified height ${height} in <amp-ad> tag is not equal to the ` +
          `required height of ${ADSENSE_RSPV_WHITELISTED_HEIGHT} for ` +
          'responsive AdSense ad units.'
      );
      return false;
    }
    if (width != '100vw') {
      user().warn(
        TAG,
        `Invalid width ${width} for full-width responsive <amp-ad> tag. ` +
          'Width must be 100vw.'
      );
      return false;
    }
    return true;
  }

  /** Aligns the responsive element with the viewport edges.*/
  alignToViewport() {
    if (this.isAlignedToViewport_) {
      return;
    }
    this.isAlignedToViewport_ = true;
    const vsync = Services.vsyncFor(this.win_);
    const layoutBox = this.element_.getLayoutBox();
    // Nudge into the correct horizontal position by changing side margin.
    vsync.run(
      {
        measure: state => {
          // Check the parent element because amp-ad is explicitly styled to
          // have direction: ltr.
          state.direction = computedStyle(
            this.win_,
            dev().assertElement(this.element_.parentElement)
          )['direction'];
        },
        mutate: state => {
          if (state.direction == 'rtl') {
            setStyle(this.element_, 'marginRight', layoutBox.left, 'px');
          } else {
            setStyle(this.element_, 'marginLeft', -layoutBox.left, 'px');
          }
        },
      },
      {direction: ''}
    );
  }

  /**
   * @return {string}
   * @private
   */
  getAutoFormat_() {
    return this.element_.getAttribute('data-auto-format');
  }

  /**
   * @return {number}
   */
  getRafmtParam() {
    return RAFMT_PARAMS[this.getAutoFormat_()];
  }

  /**
   * Selects into the inconsistent responsive height fix experiment.
   * Note that this needs to be done before responsive sizing, so it must
   * be separate from divertExperiments below.
   * @return {boolean}
   * @private
   */
  isInResponsiveHeightFixExperimentBranch_() {
    const experimentInfoMap = /** @type {!Object<string,
        !../../../src/experiments.ExperimentInfo>} */ ({
      [[MAX_HEIGHT_EXP.branch]]: {
        isTrafficEligible: () => true,
        branches: [[MAX_HEIGHT_EXP.control], [MAX_HEIGHT_EXP.experiment]],
      },
    });
    const setExps = randomlySelectUnsetExperiments(
      this.win_,
      experimentInfoMap
    );
    Object.keys(setExps).forEach(expName =>
      addExperimentIdToElement(setExps[expName], this.element_)
    );
    return setExps[MAX_HEIGHT_EXP.branch] == MAX_HEIGHT_EXP.experiment;
  }

  /**
   * Attempts to change the size to match the desired responsive height.
   * @return {!Promise} a promise that resolves when we have attempted to change size
   * (whether successfully or not).
   */
  attemptChangeSize() {
    const viewportSize = Services.viewportForDoc(
      this.element_.getAmpDoc()
    ).getSize();
    // Attempt to resize to the correct height. The width should already be
    // 100vw, but is fixed here so that future resizes of the viewport don't
    // affect it.
    return this.element_
      .getImpl(/* waitForBuild= */ false)
      .then(impl =>
        impl
          .attemptChangeSize(
            this.getResponsiveHeight_(viewportSize),
            viewportSize.width
          )
          .catch(() => {})
      );
  }

  /**
   * Calculates the appropriate height for a full-width responsive ad of the
   * given width.
   * @param {!{width: number, height: number}} viewportSize
   * @return {number}
   * @private
   */
  getResponsiveHeight_(viewportSize) {
    switch (this.getAutoFormat_()) {
      case ADSENSE_RSPV_TAG:
        const minHeight = 100;
        const maxHeight = Math.min(
          this.isInResponsiveHeightFixExperimentBranch_() ? 500 : 300,
          viewportSize.height
        );
        // We aim for a 6:5 aspect ratio.
        const idealHeight = Math.round(viewportSize.width / 1.2);
        return clamp(idealHeight, minHeight, maxHeight);
      case ADSENSE_MCRSPV_TAG:
        return getMatchedContentResponsiveHeightAndUpdatePubParams(
          viewportSize.width,
          this.element_
        );
      default:
        return 0;
    }
  }
}
