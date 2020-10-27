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
import {Layout} from '../../../src/layout';
import {LocalizedStringId} from '../../../src/localized-strings';
import {Services} from '../../../src/services';
import {getLocalizationService} from '../../amp-story/1.0//amp-story-localization-service';
import {htmlFor} from '../../../src/static-template';

export class AmpStoryPause extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {string} */
    this.myText_ = 'hello world';

    /** @private {?Element} */
    this.container_ = null;

    /** @private {?Element} */
    this.buttonEl_ = null;

    /** @private {boolean} */
    this.isPaused_ = false;

    /** @private @const {?../../../src/service/localization.LocalizationService} */
    this.localizationService_ = null;

    /** @private @const {?../../amp-story/1.0/amp-story-store-service.AmpStoryStoreService} */
    this.storeService_ = null;
  }

  /** @override */
  buildCallback() {
    this.container_ = htmlFor(this.element)`
      <div>
        <button type="button" role="button" style="background: #fff;">
          Pause
        </button>
      </div>
    `;
    this.element.appendChild(this.container_);
    this.buttonEl_ = this.element.querySelector('button');

    this.buttonEl_.addEventListener(
      'click',
      () => this.onButtonClick_(),
      true /** useCapture */
    );

    this.storeService_ = services[1];
    this.storeService_.subscribe(StateProperty.PAUSED_STATE, (pausedState) => {
      this.onPausedStateUpdate_(pausedState);
    });

    this.localizationService_ = getLocalizationService(this.element);
    this.updateButtonLabel_();

    return Services.storyStoreServiceForOrNull(this.win).then(
      (storeService) => {
        this.storeService_ = storeService;
      }
    );
  }

  /** @private */
  onButtonClick_() {
    this.storeService_.dispatch(Action.TOGGLE_PAUSED, !this.isPaused_);
  }

  /** @private */
  updateButtonLabel_() {
    const stringId = this.isPaused_
      ? LocalizedStringId.AMP_STORY_PAUSE_LABEL_PAUSE
      : LocalizedStringId.AMP_STORY_PAUSE_LABEL_PLAY;
    const label = this.localizationService_.getLocalizedString(stringId);
    this.mutateElement(() => {
      this.buttonEl_.textContent = label;
    });
  }

  /** @override */
  isLayoutSupported(layout) {
    return layout === Layout.CONTAINER;
  }

  /**
   * Reacts to paused state updates.
   * @param {boolean} pausedState
   * @private
   */
  onPausedStateUpdate_(pausedState) {
    this.isPaused_ = pausedState;
    this.updateButtonLabel_();
  }
}

AMP.extension('amp-story-pause', '0.1', (AMP) => {
  AMP.registerElement('amp-story-pause', AmpStoryPause);
});
