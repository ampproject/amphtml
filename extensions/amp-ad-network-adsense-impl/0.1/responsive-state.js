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
import {dev, devAssert, user} from '../../../src/log';
import {getData} from '../../../src/event-helper';
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
export const AD_SIZE_OPTIMIZATION_EXP = {
  branch: 'adsense-ad-size-optimization',
  control: '368226510',
  experiment: '368226511',
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

  /**
   * Upgrades the ad unit to responsive if there is an opt-in setting in localstorage.
   * See https://github.com/ampproject/amphtml/issues/23568 for design.
   * @param {!Element} element
   * @param {string} adClientId
   * @return {!Promise<?ResponsiveState>} a promise that resolves when any upgrade is complete.
   */
  static maybeUpgradeToResponsive(element, adClientId) {
    if (!ResponsiveState.isInAdSizeOptimizationExperimentBranch_(element)) {
      return Promise.resolve(null);
    }
    // If the ad unit is already responsive we don't upgrade again.
    if (element.hasAttribute('data-auto-format')) {
      return Promise.resolve(null);
    }
    return (
      Services.storageForDoc(element)
        .then(storage =>
          storage.get(
            ResponsiveState.getAdSizeOptimizationStorageKey_(adClientId)
          )
        )
        .then(isAdSizeOptimizationEnabled => {
          if (isAdSizeOptimizationEnabled) {
            return ResponsiveState.upgradeToResponsive_(element);
          }
          return null;
        })
        // Do nothing if we fail to read localstorage.
        .catch(() => {
          dev().warn(TAG, 'Failed to look up publisher ad size settings.');
          return null;
        })
    );
  }

  /**
   * Upgrades the element to responsive.
   *
   * @param {!Element} element
   * @return {!ResponsiveState} responsive state
   * @private
   */
  static upgradeToResponsive_(element) {
    element.setAttribute('height', ADSENSE_RSPV_WHITELISTED_HEIGHT);
    element.setAttribute('width', '100vw');
    element.setAttribute('data-full-width', '');
    element.setAttribute('data-auto-format', 'rspv');

    const state = ResponsiveState.createIfResponsive(element);
    devAssert(state != null, 'Upgrade failed');
    return /** @type {!ResponsiveState} */ (state);
  }

  /**
   * Sets up a listener for a pingback of publisher settings in the ad response and
   * writing such settings to localstorage.
   *
   * Note that we can have multiple listeners on the same page, which is okay because
   * the settings for publishers should not change between different slots.
   *
   * Once the listener has received one valid setting update event, it will remove
   * itself.
   *
   * See https://github.com/ampproject/amphtml/issues/23568 for design.
   *
   * @param {!Element} element to use for fetching storage.
   * @param {!HTMLIFrameElement} iframe ad iframe.
   * @param {string} adClientId
   * @return {?Promise} a promise that resolves when ad size settings are updated, or null if no listener was attached.
   */
  static maybeAttachSettingsListener(element, iframe, adClientId) {
    if (!ResponsiveState.isInAdSizeOptimizationExperimentBranch_(element)) {
      return null;
    }
    let promiseResolver;
    const savePromise = new Promise(resolve => {
      promiseResolver = resolve;
    });
    const win = toWin(element.ownerDocument.defaultView);

    const listener = event => {
      if (event['source'] != iframe.contentWindow) {
        return;
      }
      const data = getData(event);
      // data will look like this:
      // {
      //   'googMsgType': 'adsense-settings',
      //   'adClient': 'ca-pub-123',
      //   'enableAutoAdSize': '1'
      // }
      if (!!data && data['googMsgType'] != 'adsense-settings') {
        return;
      }
      if (data['adClient'] != adClientId) {
        return;
      }

      const autoAdSizeStatus = data['enableAutoAdSize'] == '1';
      win.removeEventListener('message', listener);

      Services.storageForDoc(element)
        .then(storage =>
          storage
            .set(
              ResponsiveState.getAdSizeOptimizationStorageKey_(adClientId),
              autoAdSizeStatus
            )
            .then(() => {
              dev().info(
                TAG,
                `Saved publisher auto ad size setting: ${autoAdSizeStatus}`
              );
              promiseResolver();
            })
        )
        // Do nothing if we fail to write to localstorage.
        .catch(() => {
          dev().warn(TAG, 'Failed to persist publisher auto ad size setting.');
        });
    };
    win.addEventListener('message', listener);
    return savePromise;
  }

  /**
   * @param {string} adClientId
   * @return {string} ad size optimization storage key.
   * @private
   */
  static getAdSizeOptimizationStorageKey_(adClientId) {
    return `aas-${adClientId}`;
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
   * Selects into the ad size optimization experiment.
   * @param {!Element} element
   * @return {boolean}
   */
  static isInAdSizeOptimizationExperimentBranch_(element) {
    const experimentInfoMap = /** @type {!Object<string,
        !../../../src/experiments.ExperimentInfo>} */ ({
      [[AD_SIZE_OPTIMIZATION_EXP.branch]]: {
        isTrafficEligible: () => true,
        branches: [
          [AD_SIZE_OPTIMIZATION_EXP.control],
          [AD_SIZE_OPTIMIZATION_EXP.experiment],
        ],
      },
    });
    const win = toWin(element.ownerDocument.defaultView);
    const setExps = randomlySelectUnsetExperiments(win, experimentInfoMap);
    Object.keys(setExps).forEach(expName =>
      addExperimentIdToElement(setExps[expName], element)
    );
    return (
      setExps[AD_SIZE_OPTIMIZATION_EXP.branch] ==
      AD_SIZE_OPTIMIZATION_EXP.experiment
    );
  }

  /**
   * Selects into the inconsistent responsive height fix experiment.
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
