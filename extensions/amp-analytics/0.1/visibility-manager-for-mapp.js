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

import {Services} from '../../../src/services';
import {VisibilityManager} from './visibility-manager';
import {dev, devAssert} from '../../../src/log';
import {dict} from '../../../src/utils/object';
import {getMinOpacity} from './opacity';

const TAG = 'amp-analytics/visibility-manager';

export class VisibilityManagerForMApp extends VisibilityManager {
  /**
   *
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   * @param {!../../../src/inabox/host-services.VisibilityInterface} visibilityInterface
   */
  constructor(ampdoc, visibilityInterface) {
    super(/* parent */ null, ampdoc);

    /**
     * In VisibilityManagerForMApp case,
     */

    /** @const @private */
    this.viewer_ = Services.viewerForDoc(ampdoc);

    /** @const @private {!../../../src/inabox/host-services.VisibilityInterface} */
    this.visibilityInterface_ = visibilityInterface;

    /** @const @private {boolean} */
    this.backgroundedAtStart_ = !this.viewer_.isVisible();

    /** @private {?../../../src/layout-rect.LayoutRectDef} */
    this.intersectionRect_ = null;

    /** @private {boolean} */
    this.disposed_ = false;

    // Initate the listener
    this.visibilityInterface_.onVisibilityChange(
        this.onVisibilityChangeHandler_.bind(this));
  }

  /** @override */
  dispose() {
    super.dispose();
    this.disposed_ = true;
  }

  /** @override */
  getStartTime() {
    // viewer.getFirstVisibleTime depend on the visibilitychange API and
    // document['hidden']
    // Expect the viewer is always visible in webview
    return dev().assertNumber(this.viewer_.getFirstVisibleTime());
  }

  /** @override */
  isBackgrounded() {
    // Listens to visibilitychange event, in theory this never fires
    return !this.viewer_.isVisible();
  }

  /** @override */
  isBackgroundedAtStart() {
    // Return the first visible state. In theory this is always true in mApp
    return this.backgroundedAtStart_;
  }


  /** @override */
  getRootMinOpacity() {
    // Copied the implementation from VisibilityManagerForDoc,
    // doesn't count iframe opacity
    const root = this.ampdoc.getRootNode();
    const rootElement = dev().assertElement(
        root.documentElement || root.body || root);
    return getMinOpacity(rootElement);
  }

  /** @override */
  listenElement() {
    // #listenElement not supported in mApp
    devAssert(false, '%s: element level visibility not supported, ' +
        'getElementIntersectionRect should not be called in ' +
        'VisibilityManager for mApp', TAG);
    return () => {};
  }

  /**
   * @override
   */
  getRootLayoutBox() {
    // By the time `#getRootLayoutBox` is called, it is guaranteed that
    // onVisibilityChangeHandler has been called at least once
    return devAssert(this.intersectionRect_);
  }

  /**
   * @param {!../../../src/inabox/host-services.VisibilityDataDef} visibilityData
   * @private
   */
  onVisibilityChangeHandler_(visibilityData) {
    if (this.disposed_) {
      return;
    }
    //TODO: Need discussion
    // rootVisibility is set by hostAPI, instead of Viewer.isVisible
    let ratio = visibilityData.visibleRatio;
    // Convert to valid ratio range in [0, 1]
    ratio = Math.min(Math.max(0, ratio), 1);
    this.setRootVisibility(ratio);
    this.intersectionRect_ = visibilityData.visibleRect;
  }

  /**
   * @override
   */
  observe() {
    devAssert(false, '%s: element level visibility not supported, ' +
        'getElementIntersectionRect should not be called in ' +
        'VisibilityManager for mApp', TAG);
    return () => {};
  }

  /**
   * @override
   */
  getElementVisibility() {
    devAssert(false, '%s: element level visibility not supported, ' +
        'getElementIntersectionRect should not be called in ' +
        'VisibilityManager for mApp', TAG);
    return 0;
  }

  /**
   * @override
   * @return {?JsonObject}
   */
  getElementIntersectionRect() {
    dev().error(TAG, 'element level visibility not supported, ' +
        'getElementIntersectionRect should not be called in ' +
        'VisibilityManager for mApp');
    return dict({});
  }
}
