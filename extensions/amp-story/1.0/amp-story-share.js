import * as Preact from '#core/dom/jsx';

import {Services} from '#service';

import {user} from '#utils/log';

import {getAmpdoc} from 'src/service-helpers';

import {
  Action,
  StateProperty,
  getStoreService,
} from './amp-story-store-service';
import {StoryAnalyticsEvent, getAnalyticsService} from './story-analytics';

const TAG = 'amp-story-share';

/**
 * Support for amp-story to launch native sharing menu or fallback sharing icons.
 */
export class AmpStoryShare {
  /**
   * @param {!Window} win
   * @param {!Element} storyEl
   */
  constructor(win, storyEl) {
    /** @private @const {!Window} */
    this.win_ = win;

    /** @private @const {!Element} */
    this.storyEl_ = storyEl;

    /** @private {!./story-analytics.StoryAnalyticsService} */
    this.analyticsService_ = getAnalyticsService(win, storyEl);

    /** @private @const {!./amp-story-store-service.AmpStoryStoreService} */
    this.storeService_ = getStoreService(win);

    /** @private {!Element} used to host the fallback menu or for analytics. */
    this.shareMenuEl_ = <amp-story-share-menu></amp-story-share-menu>;
    storyEl.appendChild(this.shareMenuEl_);

    /** @private {boolean} */
    this.initializedFallback_ = false;

    this.initializeListeners_();
  }

  /**
   * @private
   */
  initializeListeners_() {
    this.storeService_.subscribe(StateProperty.SHARE_MENU_STATE, (isOpen) => {
      if (isOpen) {
        if (this.isSystemShareSupported_()) {
          this.openSystemShare_();
          this.close_();
        } else {
          this.buildFallbackMenu_();
        }
      }

      this.analyticsService_.triggerEvent(
        isOpen ? StoryAnalyticsEvent.OPEN : StoryAnalyticsEvent.CLOSE,
        this.shareMenuEl_
      );
    });
  }

  /**
   * NOTE(alanorozco): This is a duplicate of the logic in the
   * `amp-social-share` component.
   * @return {boolean} Whether the browser supports native system sharing.
   */
  isSystemShareSupported_() {
    const viewer = Services.viewerForDoc(this.storyEl_);
    const platform = Services.platformFor(this.win_);

    // Chrome exports navigator.share in WebView but does not implement it.
    // See https://bugs.chromium.org/p/chromium/issues/detail?id=765923
    const isChromeWebview = viewer.isWebviewEmbedded() && platform.isChrome();

    return 'share' in navigator && !isChromeWebview;
  }

  /**
   * Opens the sharing dialog of native browsers.
   * @private
   */
  openSystemShare_() {
    const {navigator} = this.win_;
    const shareData = {
      url: Services.documentInfoForDoc(getAmpdoc(this.storyEl_)).canonicalUrl,
      text: this.win_.document.title,
    };
    navigator.share(shareData).catch((e) => {
      user().warn(TAG, e.message, shareData);
    });
  }

  /** @private */
  buildFallbackMenu_() {
    if (this.initializedFallback_) {
      return;
    }
    this.initializedFallback_ = true;
    Services.extensionsFor(this.win_).installExtensionForDoc(
      getAmpdoc(this.storyEl_),
      'amp-story-share-menu',
      '0.1'
    );
  }

  /**
   * Closes the share menu.
   * @private
   */
  close_() {
    this.storeService_.dispatch(Action.TOGGLE_SHARE_MENU, false);
  }
}
