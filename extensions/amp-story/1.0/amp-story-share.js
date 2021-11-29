import {
  ANALYTICS_TAG_NAME,
  StoryAnalyticsEvent,
  getAnalyticsService,
} from './story-analytics';
import {
  Action,
  StateProperty,
  getStoreService,
} from './amp-story-store-service';
import {Services} from '#service';
import {devAssert, user} from '#utils/log';
import {whenUpgradedToCustomElement} from '#core/dom/amp-element-helpers';
import {getAmpdoc} from '../../../src/service-helpers';
import {toggle} from 'cli-spinners';

const TAG = 'amp-story-share';

export class AmpStoryShare {
  /**
   * @param {!Window} win
   * @param {!Element} storyEl
   */
  constructor(win, storyEl) {
    /**  @private {!Window} */
    this.win_ = win;

    /** @private {?Element} */
    this.shareMenu_ = null;

    /** @private @const {!./amp-story-store-service.AmpStoryStoreService} */
    this.storeService_ = getStoreService(win);

    /** @private {!./story-analytics.StoryAnalyticsService} */
    this.analyticsService_ = getAnalyticsService(win, storyEl);

    /** @private @const {!Element} */
    this.parentEl_ = storyEl;

    this.ampDoc_ = getAmpdoc(storyEl);

    this.initializeListeners_();
  }

  /**
   * Creates a share menu
   * @private
   */
  buildShareMenu_() {
    Services.extensionsFor(this.win_).installExtensionForDoc(
      this.ampDoc_,
      'amp-story-share-menu'
    );
    this.shareMenu_ = this.parentEl_.ownerDocument.createElement(
      'amp-story-share-menu'
    );
    this.parentEl_.appendChild(this.shareMenu_);
    this.onUIStateUpdate_(this.storeService_.get(StateProperty.UI_STATE));
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
   * @return {boolean} Whether the browser supports native system sharing.
   */
  isSystemShareSupported() {
    const viewer = Services.viewerForDoc(this.ampDoc_);

    const platform = Services.platformFor(this.win_);

    // Chrome exports navigator.share in WebView but does not implement it.
    // See https://bugs.chromium.org/p/chromium/issues/detail?id=765923
    const isChromeWebview = viewer.isWebviewEmbedded() && platform.isChrome();

    return 'share' in navigator && !isChromeWebview;
  }

  /**
   * Reacts to UI state updates and triggers the right UI.
   * @param {!UIType} uiState
   * @private
   */
  onUIStateUpdate_(uiState) {
    if (!this.shareMenu_) {
      return;
    }
    whenUpgradedToCustomElement(this.shareMenu_)
      .then(() => this.shareMenu_.getImpl())
      .then((impl) => impl.setUIType(uiState));
  }

  /**
   * Reacts to menu state updates and decides whether to show either the native
   * system sharing, or the fallback UI.
   * @param {boolean} isOpen
   * @private
   */
  onShareMenuStateUpdate_(isOpen) {
    const systemShareSupported = this.isSystemShareSupported();
    if (systemShareSupported) {
      if (isOpen) {
        // Opens the system share dialog.
        this.handleSystemShare_();

        // There is no way to know when the user dismisses the native system share
        // menu, so we immediately set the state to closed.
        this.close_();
      }
    } else {
      if (isOpen && !this.shareMenu_) {
        this.buildShareMenu_();
      } else {
        toggle(this.shareMenu_, isOpen);
      }
    }

    this.element_[ANALYTICS_TAG_NAME] = 'amp-story-share-menu';
    this.analyticsService_.triggerEvent(
      isOpen ? StoryAnalyticsEvent.OPEN : StoryAnalyticsEvent.CLOSE,
      this.element_
    );
  }

  /**
   * Closes the share menu.
   * @private
   */
  close_() {
    this.storeService_.dispatch(Action.TOGGLE_SHARE_MENU, false);
  }

  /**
   * @private
   */
  handleSystemShare_() {
    const {navigator} = this.win_;
    devAssert(navigator.share);

    const shareData = {
      url: Services.documentInfoForDoc(this.parentEl_).canonicalUrl,
      text: this.win_.document.title,
    };

    navigator.share(shareData).catch((e) => {
      user().warn(TAG, e.message, shareData);
    });
  }
}
