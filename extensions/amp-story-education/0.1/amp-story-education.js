/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
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
} from '../../amp-story/1.0/amp-story-store-service';
import {CSS} from '../../../build/amp-story-education-0.1.css';
import {Layout} from '../../../src/layout';
import {LocalizedStringId} from '../../../src/localized-strings';
import {Services} from '../../../src/services';
import {createShadowRootWithStyle} from '../../amp-story/1.0/utils';
import {dev} from '../../../src/log';
import {htmlFor} from '../../../src/static-template';
import {removeChildren} from '../../../src/dom';
import {toggle} from '../../../src/style';

/** @type {string} */
const TAG = 'amp-story-education';

/**
 * Generates the navigation education template.
 * @param {!Element} element
 * @return {!Element}
 */
const buildNavigationEl = element => {
  const html = htmlFor(element);
  return html`
    <div class="i-amphtml-story-education-navigation">
      <div class="i-amphtml-story-education-navigation-gesture">
        <div class="i-amphtml-story-education-navigation-gesture-outer"></div>
        <div class="i-amphtml-story-education-navigation-gesture-inner"></div>
      </div>
      <div class="i-amphtml-story-education-navigation-progress"></div>
      <div class="i-amphtml-story-education-navigation-instructions"></div>
      <button class="i-amphtml-story-education-navigation-button"></button>
    </div>
  `;
};

/** @enum */
export const State = {
  HIDDEN: 0,
  NAVIGATION_TAP: 1,
  NAVIGATION_SWIPE: 2,
};

export class AmpStoryEducation extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {!Element} */
    this.containerEl_ = this.win.document.createElement('div');

    /** @private @const {!../../../src/service/localization.LocalizationService} */
    this.localizationService_ = Services.localizationService(this.win);

    /** @private {?boolean} */
    this.storyPausedStateToRestore_ = null;

    /** @private {!State} */
    this.state_ = State.HIDDEN;

    /** @private @const {!../../amp-story/1.0/amp-story-store-service.AmpStoryStoreService} */
    this.storeService_ = /** @type {!../../amp-story/1.0/amp-story-store-service.AmpStoryStoreService} */ (Services.storyStoreService(
      this.win
    ));
  }

  /** @override */
  buildCallback() {
    this.containerEl_.classList.add('i-amphtml-story-education');
    toggle(this.containerEl_, false);
    this.startListening_();
    createShadowRootWithStyle(this.element, this.containerEl_, CSS);
  }

  /** @override */
  isLayoutSupported(layout) {
    return layout === Layout.CONTAINER;
  }

  /**
   * @private
   */
  startListening_() {
    this.containerEl_.addEventListener(
      'click',
      () => this.onClick_(),
      true /** useCapture */
    );

    this.storeService_.subscribe(
      StateProperty.RTL_STATE,
      rtlState => this.onRtlStateUpdate_(rtlState),
      true /** callToInitialize */
    );
  }

  /**
   * Handles click events.
   * @private
   */
  onClick_() {
    if (this.state_ === State.NAVIGATION_TAP) {
      this.setState_(State.NAVIGATION_SWIPE);
      return;
    }

    this.setState_(State.HIDDEN);
  }

  /**
   * @param {boolean} rtlState
   * @private
   */
  onRtlStateUpdate_(rtlState) {
    this.mutateElement(() => {
      rtlState
        ? this.containerEl_.setAttribute('dir', 'rtl')
        : this.containerEl_.removeAttribute('dir');
    });
  }

  /**
   * @param {!State} state
   * @private
   */
  setState_(state) {
    if (this.state_ === state) {
      return;
    }

    this.state_ = state;
    let el;

    switch (state) {
      case State.HIDDEN:
        this.mutateElement(() => {
          removeChildren(this.containerEl_);
          toggle(this.containerEl_, false);
          this.storeService_.dispatch(
            Action.TOGGLE_PAUSED,
            this.storyPausedStateToRestore_
          );
        });
        break;
      case State.NAVIGATION_TAP:
        el = buildNavigationEl(this.element);
        el.setAttribute('step', 'tap');
        el.querySelector(
          '.i-amphtml-story-education-navigation-progress'
        ).textContent = this.localizationService_.getLocalizedString(
          LocalizedStringId.AMP_STORY_EDUCATION_NAVIGATION_TAP_PROGRESS
        );
        el.querySelector(
          '.i-amphtml-story-education-navigation-instructions'
        ).textContent = this.localizationService_.getLocalizedString(
          LocalizedStringId.AMP_STORY_EDUCATION_NAVIGATION_TAP_INSTRUCTIONS
        );
        el.querySelector(
          '.i-amphtml-story-education-navigation-button'
        ).textContent = this.localizationService_.getLocalizedString(
          LocalizedStringId.AMP_STORY_EDUCATION_NAVIGATION_TAP_DISMISS
        );
        this.showTemplate_(el);
        break;
      case State.NAVIGATION_SWIPE:
        el = buildNavigationEl(this.element);
        el.setAttribute('step', 'swipe');
        el.querySelector(
          '.i-amphtml-story-education-navigation-progress'
        ).textContent = this.localizationService_.getLocalizedString(
          LocalizedStringId.AMP_STORY_EDUCATION_NAVIGATION_SWIPE_PROGRESS
        );
        el.querySelector(
          '.i-amphtml-story-education-navigation-instructions'
        ).textContent = this.localizationService_.getLocalizedString(
          LocalizedStringId.AMP_STORY_EDUCATION_NAVIGATION_SWIPE_INSTRUCTIONS
        );
        el.querySelector(
          '.i-amphtml-story-education-navigation-button'
        ).textContent = this.localizationService_.getLocalizedString(
          LocalizedStringId.AMP_STORY_EDUCATION_NAVIGATION_SWIPE_DISMISS
        );
        this.showTemplate_(el);
        break;
      default:
        dev().error(TAG, 'Unknown state %s.', state);
        break;
    }
  }

  /**
   * @param {!Element} template
   * @private
   */
  showTemplate_(template) {
    if (this.storyPausedStateToRestore_ === null) {
      this.storyPausedStateToRestore_ = !!this.storeService_.get(
        StateProperty.PAUSED_STATE
      );
    }

    this.storeService_.dispatch(Action.TOGGLE_PAUSED, true);

    this.mutateElement(() => {
      removeChildren(this.containerEl_);
      toggle(this.containerEl_, true);
      this.containerEl_.appendChild(template);
    });
  }
}

AMP.extension('amp-story-education', '0.1', AMP => {
  AMP.registerElement('amp-story-education', AmpStoryEducation, CSS);
});
