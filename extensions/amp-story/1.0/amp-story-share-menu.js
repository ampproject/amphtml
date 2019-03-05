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

import {
  Action,
  StateProperty,
  UIType,
  getStoreService,
} from './amp-story-store-service';
import {CSS} from '../../../build/amp-story-share-menu-1.0.css';
import {Services} from '../../../src/services';
import {ShareWidget} from './amp-story-share';
import {closest} from '../../../src/dom';
import {createShadowRootWithStyle} from './utils';
import {dev} from '../../../src/log';
import {getAmpdoc} from '../../../src/service';
import {htmlFor} from '../../../src/static-template';
import {toggle} from '../../../src/style';


/** @const {string} Class to toggle the share menu. */
export const VISIBLE_CLASS = 'i-amphtml-story-share-menu-visible';

/**
 * Quick share template, used as a fallback if native sharing is not supported.
 * @param {!Element} element
 * @return {!Element}
 */
const getTemplate = element => {
  return htmlFor(element)`
    <div class="i-amphtml-story-share-menu i-amphtml-story-system-reset">
      <div class="i-amphtml-story-share-menu-container">
        <span class="i-amphtml-story-share-menu-close-button" role="button">
          &times;
        </span>
      </div>
    </div>`;
};

/**
 * System amp-social-share button template.
 * @param {!Element} element
 * @return {!Element}
 */
const getAmpSocialSystemShareTemplate = element => {
  return htmlFor(element)`<amp-social-share type="system"></amp-social-share>`;
};

/**
 * Share menu UI.
 */
export class ShareMenu {
  /**
   * @param {!Window} win
   * @param {!Element} storyEl Element where to append the component
   */
  constructor(win, storyEl) {
    /** @private @const {!Window} */
    this.win_ = win;

    /** @private {?Element} */
    this.element_ = null;

    /** @private {?Element} */
    this.innerContainerEl_ = null;

    /** @private {boolean} */
    this.isBuilt_ = false;

    /** @private {boolean} */
    this.isSystemShareSupported_ = false;

    /** @private @const {!ShareWidget} */
    this.shareWidget_ = ShareWidget.create(this.win_, storyEl);

    /** @private @const {!./amp-story-store-service.AmpStoryStoreService} */
    this.storeService_ = getStoreService(this.win_);

    /** @private @const {!Element} */
    this.parentEl_ = storyEl;

    /** @const @private {!../../../src/service/vsync-impl.Vsync} */
    this.vsync_ = Services.vsyncFor(this.win_);
  }

  /**
   * Builds and appends the component in the story. Could build either the
   * amp-social-share button to display the native system sharing, or a fallback
   * UI.
   */
  build() {
    if (this.isBuilt()) {
      return;
    }

    this.isBuilt_ = true;

    this.isSystemShareSupported_ =
        this.shareWidget_.isSystemShareSupported(getAmpdoc(this.parentEl_));

    this.isSystemShareSupported_ ?
      this.buildForSystemSharing_() :
      this.buildForFallbackSharing_();
  }

  /**
   * Whether the element has been built.
   * @return {boolean}
   */
  isBuilt() {
    return this.isBuilt_;
  }

  /**
   * Builds a hidden amp-social-share button that triggers the native system
   * sharing UI.
   * @private
   */
  buildForSystemSharing_() {
    this.shareWidget_.loadRequiredExtensions(getAmpdoc(this.parentEl_));
    this.element_ = getAmpSocialSystemShareTemplate(this.parentEl_);

    this.initializeListeners_();

    this.vsync_.mutate(() => {
      toggle(dev().assertElement(this.element_), false);
      this.parentEl_.appendChild(this.element_);
    });
  }

  /**
   * Builds and appends the fallback UI.
   * @private
   */
  buildForFallbackSharing_() {
    const root = this.win_.document.createElement('div');

    this.element_ = getTemplate(this.parentEl_);
    createShadowRootWithStyle(root, this.element_, CSS);

    this.initializeListeners_();

    this.vsync_.run({
      measure: () => {
        this.innerContainerEl_ =
            this.element_
                ./*OK*/querySelector('.i-amphtml-story-share-menu-container');
      },
      mutate: () => {
        this.parentEl_.appendChild(root);
        // Preloads and renders the share widget content.
        const shareWidget = this.shareWidget_.build(getAmpdoc(this.parentEl_));
        this.innerContainerEl_.appendChild(shareWidget);
      },
    });
  }

  /**
   * @private
   */
  initializeListeners_() {
    this.storeService_.subscribe(StateProperty.UI_STATE, uiState => {
      this.onUIStateUpdate_(uiState);
    }, true /** callToInitialize */);

    this.storeService_.subscribe(StateProperty.SHARE_MENU_STATE, isOpen => {
      this.onShareMenuStateUpdate_(isOpen);
    });

    // Don't listen to click events if the system share is supported, since the
    // native layer handles all the UI interactions.
    if (!this.isSystemShareSupported_) {
      this.element_.addEventListener(
          'click', event => this.onShareMenuClick_(event));
    }
  }

  /**
   * Reacts to menu state updates and decides whether to show either the native
   * system sharing, or the fallback UI.
   * @param {boolean} isOpen
   * @private
   */
  onShareMenuStateUpdate_(isOpen) {
    if (this.isSystemShareSupported_ && isOpen) {
      // Dispatches a click event on the amp-social-share button to trigger the
      // native system sharing UI. This has to be done upon user interaction.
      this.element_.dispatchEvent(new Event('click'));

      // There is no way to know when the user dismisses the native system share
      // menu, so we pretend it is closed on the story end, and let the native
      // end handle the UI interactions.
      this.close_();
    }

    if (!this.isSystemShareSupported_) {
      this.vsync_.mutate(() => {
        this.element_.classList.toggle(VISIBLE_CLASS, isOpen);
      });
    }
  }

  /**
   * Handles click events and maybe closes the menu for the fallback UI.
   * @param  {!Event} event
   */
  onShareMenuClick_(event) {
    const el = dev().assertElement(event.target);

    if (el.classList.contains('i-amphtml-story-share-menu-close-button')) {
      return this.close_();
    }

    // Closes the menu if click happened outside of the menu main container.
    if (!closest(el, el => el === this.innerContainerEl_, this.element_)) {
      this.close_();
    }
  }

  /**
   * Reacts to UI state updates and triggers the right UI.
   * @param {!UIType} uiState
   * @private
   */
  onUIStateUpdate_(uiState) {
    this.vsync_.mutate(() => {
      uiState !== UIType.MOBILE ?
        this.element_.setAttribute('desktop', '') :
        this.element_.removeAttribute('desktop');
    });
  }

  /**
   * Closes the share menu.
   * @private
   */
  close_() {
    this.storeService_.dispatch(Action.TOGGLE_SHARE_MENU, false);
  }
}
