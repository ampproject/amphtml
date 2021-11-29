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

const TAG = 'amp-story-share';

export class AmpStoryShare {
  /**
   * @param {!Element} storyEl
   * @param {!Window} win
   */
  constructor(storyEl, win) {
    /**  @private {!Window} */
    this.win_ = win;

    /** @private {!AmpStoryShareMenu} */
    this.shareMenu_ = null;

    /** @private @const {!./amp-story-store-service.AmpStoryStoreService} */
    this.storeService_ = getStoreService(win);

    /** @private {!./story-analytics.StoryAnalyticsService} */
    this.analyticsService_ = getAnalyticsService(win, storyEl);

    /** @private @const {!Element} */
    this.parentEl_ = storyEl;

    this.initializeListeners_();
  }

  // /**
  //  * Creates a share menu
  //  * @private
  //  */
  // buildShareMenu_() {
  //   const menuItem = this.parentEl_.ownerDocument.createElement(
  //     'amp-story-share-menu'
  //   );
  //   this.parentEl_.appendChild(menuItem);
  //   whenUpgradedToCustomElement(menuItem)
  //     .then(() => menuItem.getImpl())
  //     .then((impl) => (this.shareMenu_ = impl));
  //   this.onUIStateUpdate_(this.storeService_.get(StateProperty.UI_STATE));
  // }

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
   * @param  {!../../../src/service/ampdoc-impl.AmpDoc}  ampdoc
   * @return {boolean} Whether the browser supports native system sharing.
   */
  isSystemShareSupported(ampdoc) {
    const viewer = Services.viewerForDoc(ampdoc);

    const platform = Services.platformFor(this.win);

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
    if (systemShareSupported && isOpen) {
      // Dispatches a click event on the amp-social-share button to trigger the
      // native system sharing UI. This has to be done upon user interaction.
      this.handleSystemShare_();

      // There is no way to know when the user dismisses the native system share
      // menu, so we pretend it is closed on the story end, and let the native
      // end handle the UI interactions.
      this.close_();
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
    const {navigator, title} = this.win_;
    const {canonicalUrl} = Services.getAmpdoc(this.parentEl_);
    devAssert(navigator.share);

    const shareData = {
      url: canonicalUrl,
      text: title,
    };

    navigator.share(shareData).catch((e) => {
      user().warn(TAG, e.message, shareData);
    });
  }
}
