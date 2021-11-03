import * as Preact from '#core/dom/jsx';
import {Action_Enum, getStoreService} from './amp-story-store-service';
import {CSS} from '../../../build/amp-story-unsupported-browser-layer-1.0.css';
import {LocalizedStringId_Enum} from '#service/localization/strings';
import {createShadowRootWithStyle} from './utils';
import {removeElement} from '#core/dom';
import {localize} from './amp-story-localization-service';

/** @const {string} Class for the continue anyway button */
const CONTINUE_ANYWAY_BUTTON_CLASS = 'i-amphtml-continue-button';

/**
 * Full viewport black layer indicating browser is not supported.
 * @param {!Element} element
 * @return {!Element}
 */
const renderUnsuportedBrowserLayerElement = (element) => (
  <div class="i-amphtml-story-unsupported-browser-overlay">
    <div class="i-amphtml-overlay-container">
      <div class="i-amphtml-gear-icon" />
      <div class="i-amphtml-story-overlay-text">
        {localize(
          element,
          LocalizedStringId_Enum.AMP_STORY_WARNING_UNSUPPORTED_BROWSER_TEXT
        )}
      </div>
      <button
        // The continue button functionality will only be present in the default
        // layer. Publisher provided fallbacks will not provide users with the
        // ability to continue with an unsupported browser
        class="i-amphtml-continue-button"
      >
        {localize(
          element,
          LocalizedStringId_Enum.AMP_STORY_CONTINUE_ANYWAY_BUTTON_LABEL
        )}
      </button>
    </div>
  </div>
);

/**
 * Unsupported browser layer UI.
 */
export class UnsupportedBrowserLayer {
  /**
   * @param {!Window} win
   */
  constructor(win) {
    /** @private @const {!Window} */
    this.win_ = win;

    /** @private {?Element} */
    this.root_ = null;

    /** @private {?Element} */
    this.element_ = null;

    /** @private {?Element} */
    this.continueButton_ = null;

    /** @private @const {!./amp-story-store-service.AmpStoryStoreService} */
    this.storeService_ = getStoreService(this.win_);
  }

  /**
   * Builds and appends the component in the story.
   * @return {*} TODO(#23582): Specify return type
   */
  build() {
    if (this.root_) {
      return this.root_;
    }
    this.root_ = this.win_.document.createElement('div');
    this.element_ = renderUnsuportedBrowserLayerElement(this.win_.document);
    createShadowRootWithStyle(this.root_, this.element_, CSS);
    this.continueButton_ = this.element_./*OK*/ querySelector(
      `.${CONTINUE_ANYWAY_BUTTON_CLASS}`
    );
    this.continueButton_.addEventListener('click', () => {
      this.storeService_.dispatch(Action_Enum.TOGGLE_SUPPORTED_BROWSER, true);
    });
    return this.root_;
  }

  /**
   * Returns the unsupported browser componenet
   * @return {?Element} The root element of the componenet
   */
  get() {
    if (!this.root_) {
      this.build();
    }
    return this.root_;
  }

  /**
   * Removes the entire layer
   */
  removeLayer() {
    if (this.root_) {
      removeElement(this.root_);
    }
  }
}
