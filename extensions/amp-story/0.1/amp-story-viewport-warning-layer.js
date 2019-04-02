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

import {CSS} from '../../../build/amp-story-viewport-warning-layer-0.1.css';
import {LocalizedStringId} from '../../../src/localized-strings';
import {Services} from '../../../src/services';
import {StateProperty} from './amp-story-store-service';
import {createShadowRootWithStyle} from './utils';
import {dict} from './../../../src/utils/object';
import {renderAsElement} from './simple-template';


/**
 * CSS class indicating the format is landscape.
 * @const {string}
 */
const LANDSCAPE_OVERLAY_CLASS = 'i-amphtml-story-landscape';


/**
 * Full viewport layer advising the user to rotate his device. Mobile only.
 * @private @const {!./simple-template.ElementDef}
 */
const LANDSCAPE_ORIENTATION_WARNING_TEMPLATE = {
  tag: 'div',
  attrs: dict({
    'class': 'i-amphtml-story-no-rotation-overlay ' +
        'i-amphtml-story-system-reset'}),
  children: [
    {
      tag: 'div',
      attrs: dict({'class': 'i-amphtml-overlay-container'}),
      children: [
        {
          tag: 'div',
          attrs: dict({'class': 'i-amphtml-rotate-icon'}),
        },
        {
          tag: 'div',
          attrs: dict({'class': 'i-amphtml-story-overlay-text'}),
          localizedStringId:
              LocalizedStringId.AMP_STORY_WARNING_LANDSCAPE_ORIENTATION_TEXT,
        },
      ],
    },
  ],
};


/**
 * Full viewport layer advising the user to expand his window. Only displayed
 * for small desktop viewports.
 * @private @const {!./simple-template.ElementDef}
 */
const DESKTOP_SIZE_WARNING_TEMPLATE = {
  tag: 'div',
  attrs: dict({
    'class': 'i-amphtml-story-no-rotation-overlay ' +
        'i-amphtml-story-system-reset'}),
  children: [
    {
      tag: 'div',
      attrs: dict({'class': 'i-amphtml-overlay-container'}),
      children: [
        {
          tag: 'div',
          attrs: dict({'class': 'i-amphtml-desktop-size-icon'}),
        },
        {
          tag: 'div',
          attrs: dict({'class': 'i-amphtml-story-overlay-text'}),
          localizedStringId:
              LocalizedStringId.AMP_STORY_WARNING_DESKTOP_SIZE_TEXT,
        },
      ],
    },
  ],
};



/**
 * Viewport warning layer UI.
 */
export class ViewportWarningLayer {
  /**
   * @param {!Window} win
   * @param {!Element} storyElement Element where to append the component
   */
  constructor(win, storyElement) {
    /** @private @const {!Window} */
    this.win_ = win;

    /** @private {boolean} */
    this.isBuilt_ = false;

    /** @private {?Element} */
    this.overlayEl_ = null;

    /** @private @const {!../../../src/service/platform-impl.Platform} */
    this.platform_ = Services.platformFor(this.win_);

    /** @private @const {!./amp-story-store-service.AmpStoryStoreService} */
    this.storeService_ = Services.storyStoreServiceV01(this.win_);

    /** @private @const {!Element} */
    this.storyElement_ = storyElement;

    /** @const @private {!../../../src/service/vsync-impl.Vsync} */
    this.vsync_ = Services.vsyncFor(this.win_);

    this.initializeListeners_();
  }

  /**
   * Builds and appends the component in the story.
   */
  build() {
    if (this.isBuilt()) {
      return;
    }

    this.isBuilt_ = true;

    const root = this.win_.document.createElement('div');
    this.overlayEl_ =
        renderAsElement(
            this.win_.document, this.getViewportWarningOverlayTemplate_());

    createShadowRootWithStyle(root, this.overlayEl_, CSS);

    // Initializes the desktop state now that the component is built.
    this.onDesktopStateUpdate_(
        !!this.storeService_.get(StateProperty.DESKTOP_STATE));

    this.vsync_.mutate(() => {
      this.storyElement_.insertBefore(root, this.storyElement_.firstChild);
    });
  }

  /**
   * Whether the element has been built.
   * @return {boolean}
   */
  isBuilt() {
    return this.isBuilt_;
  }

  /**
   * @private
   */
  initializeListeners_() {
    this.storeService_.subscribe(StateProperty.DESKTOP_STATE, isDesktop => {
      this.onDesktopStateUpdate_(isDesktop);
    }, true /** callToInitialize */);

    this.storeService_.subscribe(StateProperty.LANDSCAPE_STATE, isLandscape => {
      this.onLandscapeStateUpdate_(isLandscape);
    }, true /** callToInitialize */);
  }

  /**
   * Reacts to the landscape state update, only on mobile.
   * @param  {boolean} isLandscape
   * @private
   */
  onLandscapeStateUpdate_(isLandscape) {
    const isDesktop = this.storeService_.get(StateProperty.DESKTOP_STATE);

    // Adds the landscape class if we are mobile landscape.
    const shouldShowLandscapeOverlay = !isDesktop && isLandscape;

    // Don't build the layer until we need to display it.
    if (!shouldShowLandscapeOverlay && !this.isBuilt()) {
      return;
    }

    this.build();

    this.vsync_.mutate(() => {
      this.overlayEl_
          .classList.toggle(LANDSCAPE_OVERLAY_CLASS, !isDesktop && isLandscape);
    });
  }

  /**
   * Reacts to desktop state updates.
   * @param {boolean} isDesktop
   * @private
   */
  onDesktopStateUpdate_(isDesktop) {
    if (!this.isBuilt()) {
      return;
    }

    this.vsync_.mutate(() => {
      isDesktop ?
        this.overlayEl_.setAttribute('desktop', '') :
        this.overlayEl_.removeAttribute('desktop');
    });
  }

  /**
   * Returns the overlay corresponding to the device currently used.
   * @return {!./simple-template.ElementDef} template
   * @private
   */
  getViewportWarningOverlayTemplate_() {
    return (this.platform_.isIos() || this.platform_.isAndroid()) ?
      LANDSCAPE_ORIENTATION_WARNING_TEMPLATE :
      DESKTOP_SIZE_WARNING_TEMPLATE;
  }
}
