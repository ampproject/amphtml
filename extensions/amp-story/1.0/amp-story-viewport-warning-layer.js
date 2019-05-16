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

import {CSS} from '../../../build/amp-story-viewport-warning-layer-1.0.css';
import {LocalizedStringId} from '../../../src/localized-strings';
import {Services} from '../../../src/services';
import {
  StateProperty,
  UIType,
  getStoreService,
} from './amp-story-store-service';
import {createShadowRootWithStyle} from './utils';
import {htmlFor} from '../../../src/static-template';
import {isExperimentOn} from '../../../src/experiments';
import {listen} from '../../../src/event-helper';
import {throttle} from '../../../src/utils/rate-limit';

/**
 * CSS class indicating the format is landscape.
 * @const {string}
 */
const LANDSCAPE_OVERLAY_CLASS = 'i-amphtml-story-landscape';

/** @const {number} */
const RESIZE_THROTTLE_MS = 300;

/**
 * Viewport warning layer template.
 * @param {!Element} element
 * @return {!Element}
 */
const getTemplate = element => {
  return htmlFor(element)`
    <div class="
        i-amphtml-story-no-rotation-overlay i-amphtml-story-system-reset">
      <div class="i-amphtml-overlay-container">
        <div class="i-amphtml-story-overlay-icon"></div>
        <div class="i-amphtml-story-overlay-text"></div>
      </div>
    </div>
  `;
};

/**
 * Viewport warning layer UI.
 */
export class ViewportWarningLayer {
  /**
   * @param {!Window} win
   * @param {!Element} storyElement Element where to append the component
   * @param {number} desktopWidthThreshold Threshold in px.
   * @param {number} desktopHeightThreshold Threshold in px.
   */
  constructor(
    win,
    storyElement,
    desktopWidthThreshold,
    desktopHeightThreshold
  ) {
    /** @private @const {!Window} */
    this.win_ = win;

    /** @private {number} */
    this.desktopHeightThreshold_ = desktopHeightThreshold;

    /** @private {number} */
    this.desktopWidthThreshold_ = desktopWidthThreshold;

    /** @private {boolean} */
    this.isBuilt_ = false;

    // TODO: at this point the localization service is not registered yet. We
    // should refactor the way it is registered it so it works like the store
    // and analytics services.
    /** @private {?../../../src/service/localization.LocalizationService} */
    this.localizationService_ = null;

    /** @private {?Element} */
    this.overlayEl_ = null;

    /** @private @const {!../../../src/service/platform-impl.Platform} */
    this.platform_ = Services.platformFor(this.win_);

    /** @private @const {!./amp-story-store-service.AmpStoryStoreService} */
    this.storeService_ = getStoreService(this.win_);

    /** @private @const {!Element} */
    this.storyElement_ = storyElement;

    /** @private {?Function} */
    this.unlistenResizeEvents_ = null;

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

    this.overlayEl_ = this.getViewportWarningOverlayTemplate_();

    if (!this.overlayEl_) {
      return;
    }

    this.localizationService_ = Services.localizationService(this.win_);

    this.isBuilt_ = true;
    const root = this.win_.document.createElement('div');

    createShadowRootWithStyle(root, this.overlayEl_, CSS);

    // Initializes the UI state now that the component is built.
    this.onUIStateUpdate_(
      /** @type {!UIType} */
      (this.storeService_.get(StateProperty.UI_STATE))
    );

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
    this.storeService_.subscribe(
      StateProperty.UI_STATE,
      uiState => {
        this.onUIStateUpdate_(uiState);
      },
      true /** callToInitialize */
    );

    this.storeService_.subscribe(
      StateProperty.VIEWPORT_WARNING_STATE,
      viewportWarningState => {
        this.onViewportWarningStateUpdate_(viewportWarningState);
      },
      true /** callToInitialize */
    );
  }

  /**
   * Reacts to the viewport warning state update, only on mobile.
   * @param {boolean} viewportWarningState
   * @private
   */
  onViewportWarningStateUpdate_(viewportWarningState) {
    const isMobile =
      this.storeService_.get(StateProperty.UI_STATE) === UIType.MOBILE;

    // Adds the landscape class if we are mobile landscape.
    const shouldShowLandscapeOverlay = isMobile && viewportWarningState;

    // Don't build the layer until we need to display it.
    if (!shouldShowLandscapeOverlay && !this.isBuilt()) {
      return;
    }

    this.build();

    // Listen to resize events to update the UI message.
    if (viewportWarningState) {
      const resizeThrottle = throttle(
        this.win_,
        () => this.onResize_(),
        RESIZE_THROTTLE_MS
      );
      this.unlistenResizeEvents_ = listen(this.win_, 'resize', resizeThrottle);
    } else if (this.unlistenResizeEvents_) {
      this.unlistenResizeEvents_();
      this.unlistenResizeEvents_ = null;
    }

    this.updateTextContent_();

    this.vsync_.mutate(() => {
      this.overlayEl_.classList.toggle(
        LANDSCAPE_OVERLAY_CLASS,
        shouldShowLandscapeOverlay
      );
    });
  }

  /**
   * Reacts to UI state updates.
   * @param {!UIType} uiState
   * @private
   */
  onUIStateUpdate_(uiState) {
    if (!this.isBuilt()) {
      return;
    }

    this.vsync_.mutate(() => {
      uiState === UIType.DESKTOP_PANELS
        ? this.overlayEl_.setAttribute('desktop', '')
        : this.overlayEl_.removeAttribute('desktop');
    });
  }

  /**
   * @private
   */
  onResize_() {
    this.updateTextContent_();
  }

  /**
   * Returns the overlay corresponding to the device currently used.
   * @return {?Element} template
   * @private
   */
  getViewportWarningOverlayTemplate_() {
    const template = getTemplate(this.storyElement_);
    const iconEl = template.querySelector('.i-amphtml-story-overlay-icon');

    if (this.platform_.isIos() || this.platform_.isAndroid()) {
      iconEl.classList.add('i-amphtml-rotate-icon');
      return template;
    }

    if (!isExperimentOn(this.win_, 'disable-amp-story-desktop')) {
      iconEl.classList.add('i-amphtml-desktop-size-icon');
      return template;
    }

    return null;
  }

  /**
   * Updates the UI message displayed to the user.
   * @private
   */
  updateTextContent_() {
    const textEl = this.overlayEl_.querySelector(
      '.i-amphtml-story-overlay-text'
    );
    let textContent;

    this.vsync_.run({
      measure: () => {
        textContent = this.getTextContent_();
      },
      mutate: () => {
        if (!textContent) {
          return;
        }

        textEl.textContent = textContent;
      },
    });
  }

  /**
   * Gets the localized message to display, depending on the viewport size. Has
   * to run during a measure phase.
   * @return {?string}
   * @private
   */
  getTextContent_() {
    if (this.platform_.isIos() || this.platform_.isAndroid()) {
      return this.localizationService_.getLocalizedString(
        LocalizedStringId.AMP_STORY_WARNING_LANDSCAPE_ORIENTATION_TEXT
      );
    }

    const viewportHeight = this.win_./*OK*/ innerHeight;
    const viewportWidth = this.win_./*OK*/ innerWidth;

    if (
      viewportHeight < this.desktopHeightThreshold_ &&
      viewportWidth < this.desktopWidthThreshold_
    ) {
      return this.localizationService_.getLocalizedString(
        LocalizedStringId.AMP_STORY_WARNING_DESKTOP_SIZE_TEXT
      );
    }

    if (viewportWidth < this.desktopWidthThreshold_) {
      return this.localizationService_.getLocalizedString(
        LocalizedStringId.AMP_STORY_WARNING_DESKTOP_WIDTH_SIZE_TEXT
      );
    }

    if (viewportHeight < this.desktopHeightThreshold_) {
      return this.localizationService_.getLocalizedString(
        LocalizedStringId.AMP_STORY_WARNING_DESKTOP_HEIGHT_SIZE_TEXT
      );
    }

    return null;
  }
}
