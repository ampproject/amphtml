import * as Preact from '#core/dom/jsx';
import {LocalizedStringId_Enum} from '#service/localization/strings';
import {Services} from '#service';
import {Toast} from './toast';
import {
  copyTextToClipboard,
  isCopyingToClipboardSupported,
} from '#core/window/clipboard';
import {devAssert, user} from '#utils/log';
import {map} from '#core/types/object';
import {localize} from './amp-story-localization-service';
import {getElementConfig} from './request-utils';
import {isObject} from '#core/types';

/**
 * Social share widget for the system button.
 */
export class ShareWidget {
  /**
   * @param {!Window} win
   * @param {!Element} storyEl
   */
  constructor(win, storyEl) {
    /** @protected @const {!Window} */
    this.win = win;

    /** @protected @const {!Element} */
    this.storyEl_ = storyEl;

    /** @protected {?Element} */
    this.root = null;
  }

  /**
   * @param {!Window} win
   * @param {!Element} storyEl
   * @return {!ShareWidget}
   */
  static create(win, storyEl) {
    return new ShareWidget(win, storyEl);
  }

  /**
   * NOTE(alanorozco): This is a duplicate of the logic in the
   * `amp-social-share` component.
   * @return {boolean} Whether the browser supports native system sharing.
   */
  isSystemShareSupported() {
    const viewer = Services.viewerForDoc(this.storyEl_);
    const platform = Services.platformFor(this.win);

    // Chrome exports navigator.share in WebView but does not implement it.
    // See https://bugs.chromium.org/p/chromium/issues/detail?id=765923
    const isChromeWebview = viewer.isWebviewEmbedded() && platform.isChrome();

    return 'share' in navigator && !isChromeWebview;
  }
}
