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
import {dev, devAssert} from '../../../src/log';
import {getMinOpacity} from './opacity';
import {VisibilityManager} from './visibility-manager';
import {dict} from '../../../src/utils/object';

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

    /** @private {number} */
    this.intersectionRaio_ = 0;

    /** @private {?../../../src/layout-rect.LayoutRectDef} */
    this.intersectionRect_ = null;

    /** @private {boolean} */
    this.disposed_ = false;

    // Initate the listener
    this.unsubscribe(this.observe());
  }

  /** @override */
  dispose() {
    super.dispose();
    this.disposed_ = true;
  }

  /** @override */
  getStartTime() {
    return dev().assertNumber(this.viewer_.getFirstVisibleTime());
  }

  /** @override */
  isBackgrounded() {
    return this.viewer_.isVisible();
  }

  /** @override */
  isBackgroundedAtStart() {
    return this.viewer_.isVisible();
  }

  /** @override */
  getRootMinOpacity() {
    // Copied from visibilityManagerForDoc, doesn't work for inabox
    const root = this.ampdoc.getRootNode();
    const rootElement = dev().assertElement(
        root.documentElement || root.body || root);
    return getMinOpacity(rootElement);
  }

  /**
   * @override
   */
  getRootLayoutBox() {
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
    this.setRootVisibility(visibilityData.visibleRatio);
    this.intersectionRaio_ = visibilityData.visibleRatio;
    this.intersectionRect_ = visibilityData.visibleRect
  }

  /**
   * @override
   */
  observe() {
    this.visibilityInterface_.onVisibilityChange(
        this.onVisibilityChangeHandler_.bind(this));
    // TODO: remove event listener
    return () => {};
  }

  /**
   * @override
   * @return {number}
   */
  getElementVisibility() {
    return this.intersectionRaio_;
  }

  /**
   * @override
   * @return {?JsonObject}
   */
  getElementIntersectionRect() {
    dev().error('getElementIntersectionRect should not be called in ' +
        'VisibilityManager for mApp')
    return dict({});
  }
}
