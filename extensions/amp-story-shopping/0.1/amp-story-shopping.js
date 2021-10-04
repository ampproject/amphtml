import {Layout} from '#core/dom/layout';
import {htmlFor} from '#core/dom/static-template';
import {
  Action,
  StateProperty,
} from '../../amp-story/1.0/amp-story-store-service';

import {Services} from '#service';
import {LocalizedStringId} from '#service/localization/strings';

import {CSS} from '../../../build/amp-story-shopping-0.1.css';
import {Action} from '../../amp-story/1.0/amp-story-store-service';

const TAG = 'amp-story-shopping';

export class AmpStoryShopping extends AMP.BaseElement {
  /** @override */
  constructor() {
    /** @private {boolean} */
    this.isPaused_ = false;

    /** @private @const {!../../../src/service/viewer-interface.ViewerInterface} */
    this.viewer_ = Services.viewerForDoc(this.element);

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
    this.buttonEl_ = this.element.querySelector('button');

    this.element.appendChild(this.container_);


    this.storeService_.subscribe(
      StateProperty.PAUSED_STATE,
      (pausedState) => {
        this.onPausedStateUpdate_(pausedState);
      }
    );
  

    return Services.storyStoreServiceForOrNull(this.win).then(
      (storeService) => {
        this.storeService_ = storeService;
      }
    );
  }

  /** @override */
  isLayoutSupported(layout) {
    return layout === Layout.CONTAINER;
  }

  /** @override */
  buildCallback() {
    this.buttonEl_.addEventListener(
      'click',
      () => this.onButtonClick_(),
      true /** useCapture */
    );
  }

  /** @private */
  onButtonClick_() {
    this.storeService_.dispatch(Action.TOGGLE_PAUSED, !this.isPaused_);
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
}

AMP.extension(TAG, '0.1', (AMP) => {
  AMP.registerElement(TAG, AmpStoryShopping, CSS);
});
