import {Keys_Enum} from '#core/constants/key-codes';
import * as Preact from '#core/dom/jsx';

import {Services} from '#service';
import {LocalizedStringId_Enum} from '#service/localization/strings';

import {user} from '#utils/log';

import {CSS} from '../../../build/amp-story-share-menu-0.1.css';
import {getAmpdoc} from '../../../src/service-helpers';
import {localize} from '../../amp-story/1.0/amp-story-localization-service';
import {ShareWidget} from '../../amp-story/1.0/amp-story-share';
import {
  Action,
  StateProperty,
  UIType,
  getStoreService,
} from '../../amp-story/1.0/amp-story-store-service';
import {
  ANALYTICS_TAG_NAME,
  StoryAnalyticsEvent,
  getAnalyticsService,
} from '../../amp-story/1.0/story-analytics';
import {createShadowRootWithStyle} from '../../amp-story/1.0/utils';

/** @const {string} Class to toggle the share menu. */
export const VISIBLE_CLASS = 'i-amphtml-story-share-menu-visible';

const TAG = 'amp-story-share-menu';

/**
 * Quick share template, used as a fallback if native sharing is not supported.
 * @param {!Element} element
 * @param {function(Event)} close
 * @param {?Array<?Element|?string>|?Element|?string|undefined} children
 * @return {!Element}
 */
const renderForFallbackSharing = (element, close, children) => {
  return (
    <div
      class="i-amphtml-story-share-menu i-amphtml-story-system-reset"
      aria-hidden="true"
      role="alert"
      onClick={(event) => {
        // Close if click occurred directly on this element.
        if (event.target === event.currentTarget) {
          close(event);
        }
      }}
    >
      <div class="i-amphtml-story-share-menu-container">
        <button
          class="i-amphtml-story-share-menu-close-button"
          aria-label={localize(
            element,
            LocalizedStringId_Enum.AMP_STORY_CLOSE_BUTTON_LABEL
          )}
          role="button"
          onClick={close}
        >
          &times;
        </button>
        {children}
      </div>
    </div>
  );
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

    /** @private {boolean} */
    this.isSystemShareSupported_ = false;

    /** @private @const {!ShareWidget} */
    this.shareWidget_ = ShareWidget.create(this.win_, storyEl);

    /** @private @const {!./amp-story-store-service.AmpStoryStoreService} */
    this.storeService_ = getStoreService(this.win_);

    /** @private {!./story-analytics.StoryAnalyticsService} */
    this.analyticsService_ = getAnalyticsService(this.win_, storyEl);

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
    if (this.element_) {
      return;
    }

    this.isSystemShareSupported_ = this.shareWidget_.isSystemShareSupported();

    const child = this.isSystemShareSupported_
      ? this.buildForSystemSharing_()
      : this.buildForFallbackSharing_();

    this.initializeListeners_();

    this.vsync_.mutate(() => {
      this.parentEl_.appendChild(child);
    });
  }

  /**
   * Builds a element used for analytics, since the sharing menu is not rendered.
   * @private
   * @return {!Element}
   */
  buildForSystemSharing_() {
    return (this.element_ = <div></div>);
  }

  /**
   * Builds and appends the fallback UI.
   * @private
   * @return {!Element}
   */
  buildForFallbackSharing_() {
    const shareWidgetElement = this.shareWidget_.build(
      getAmpdoc(this.parentEl_)
    );
    this.element_ = renderForFallbackSharing(
      this.parentEl_,
      () => this.close_(),
      shareWidgetElement
    );
    // TODO(mszylkowski): import '../../amp-social-share/0.1/amp-social-share' when this file is lazy loaded.
    Services.extensionsFor(this.win_).installExtensionForDoc(
      getAmpdoc(this.parentEl_),
      'amp-social-share'
    );

    // Only listen for closing when system share is unsupported, since the
    // native layer would handle all the UI interactions.
    this.win_.addEventListener('keyup', (event) => {
      if (event.key == Keys_Enum.ESCAPE) {
        event.preventDefault();
        this.close_();
      }
    });

    return createShadowRootWithStyle(
      <div class="i-amphtml-story-share-menu-host"></div>,
      this.element_,
      CSS
    );
  }

  /**
   * @private
   */
  initializeListeners_() {
    this.storeService_.subscribe(
      StateProperty.UI_STATE,
      (uiState) => {
        this.onUIStateUpdate_(uiState);
      },
      true /** callToInitialize */
    );

    this.storeService_.subscribe(StateProperty.SHARE_MENU_STATE, (isOpen) => {
      this.onShareMenuStateUpdate_(isOpen);
    });
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
      this.openSystemShare_();

      // There is no way to know when the user dismisses the native system share
      // menu, so we pretend it is closed on the story end, and let the native
      // end handle the UI interactions.
      this.close_();
    }

    if (!this.isSystemShareSupported_) {
      this.vsync_.mutate(() => {
        this.element_.classList.toggle(VISIBLE_CLASS, isOpen);
        this.element_.setAttribute('aria-hidden', !isOpen);
      });
    }

    this.element_[ANALYTICS_TAG_NAME] = TAG;
    this.analyticsService_.triggerEvent(
      isOpen ? StoryAnalyticsEvent.OPEN : StoryAnalyticsEvent.CLOSE,
      this.element_
    );
  }

  /**
   * Reacts to UI state updates and triggers the right UI.
   * @param {!UIType} uiState
   * @private
   */
  onUIStateUpdate_(uiState) {
    this.vsync_.mutate(() => {
      uiState !== UIType.MOBILE
        ? this.element_.setAttribute('desktop', '')
        : this.element_.removeAttribute('desktop');
    });
  }

  /**
   * Closes the share menu.
   * @private
   */
  close_() {
    this.storeService_.dispatch(Action.TOGGLE_SHARE_MENU, false);
  }

  /**
   * Opens the sharing dialog of native browsers.
   * @private
   */
  openSystemShare_() {
    const {navigator} = this.win_;
    const shareData = {
      url: Services.documentInfoForDoc(this.parentEl_).canonicalUrl,
      text: this.win_.document.title,
    };
    navigator.share(shareData).catch((e) => {
      user().warn(TAG, e.message, shareData);
    });
  }
}
