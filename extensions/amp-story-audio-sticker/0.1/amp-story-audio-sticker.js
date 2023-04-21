import * as Preact from '#core/dom/jsx';
import {Layout_Enum} from '#core/dom/layout';
import {
  closestAncestorElementBySelector,
  scopedQuerySelector,
} from '#core/dom/query';

import {Services} from '#service';

import {CSS} from '../../../build/amp-story-audio-sticker-0.1.css';
import {
  Action,
  StateProperty,
} from '../../amp-story/1.0/amp-story-store-service';

const TAG = 'amp-story-audio-sticker';

/**
 * The gstatic URL prefix of the sticker assets.
 * @const {string}
 */
const ASSET_URL_PREFIX = 'https://www.gstatic.com/amphtml/stamp/audio-sticker/';

/** Fallback default sticker. It would be used if both of below happen:
 * 1) no default sticker is specified
 * 2) the custom sticker data is not provided completely.
 * @const {string}
 */
const FALLBACK_DEFAULT_STICKER = 'cat-sticker';

/** @const {!Object}
 * List of default stickers.
 */
const DEFAULT_STICKERS = {
  'audio-cloud': {
    width: '360',
    height: '233',
    pretapUrl: ASSET_URL_PREFIX + 'audio-cloud-pretap.png',
    posttapUrl: ASSET_URL_PREFIX + 'audio-cloud-posttap.png',
  },
  'cat-sticker': {
    width: '282',
    height: '226',
    pretapUrl: ASSET_URL_PREFIX + 'cat-sticker-pretap.png',
    posttapUrl: ASSET_URL_PREFIX + 'cat-sticker-posttap.gif',
  },
  'loud-speaker': {
    width: '380',
    height: '380',
    pretapUrl: ASSET_URL_PREFIX + 'loud-speaker-pretap.png',
    posttapUrl: ASSET_URL_PREFIX + 'loud-speaker-posttap.png',
  },
  'tape-player': {
    width: '260',
    height: '220',
    pretapUrl: ASSET_URL_PREFIX + 'tape-player-pretap.png',
    posttapUrl: ASSET_URL_PREFIX + 'tape-player-posttap.gif',
  },
};

/**
 * The number of milliseconds to wait before hiding the sticker after the story is unmuted.
 * @const {number}
 */
export const HIDE_STICKER_DELAY_DURATION = 4000;

export class AmpStoryAudioSticker extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {?../../../extensions/amp-story/1.0/amp-story-store-service.AmpStoryStoreService} */
    this.storeService_ = null;

    /** @private {boolean} whether to use default sticker. True if any default sticker is specified or there's no custom sticker provided */
    this.useDefaultSticker_ =
      this.element.hasAttribute('sticker') ||
      !this.element.querySelector('amp-story-audio-sticker-pretap') ||
      !this.element.querySelector('amp-story-audio-sticker-posttap');

    /** @private {?string} the default sticker that is used */
    this.sticker_ = null;

    /** @private {?string} the page id of the page where the sticker is on */
    this.pageId_ = null;

    /** @private {?number} the timeout to hide the sticker after delay */
    this.hideStickerTimeout_ = null;
  }

  /** @override */
  buildCallback() {
    this.maybeInitializeDefaultSticker_();

    // Build sticker component structure.
    this.element.parentNode.appendChild(
      <div class="i-amphtml-amp-story-audio-sticker-component">
        <div class="i-amphtml-amp-story-audio-sticker-tap-hint">
          <span>tap to unmute</span>
        </div>
        <div
          class={
            'i-amphtml-amp-story-audio-sticker-container' +
            (this.element.getAttribute('size') === 'small'
              ? ' small'
              : ' large')
          }
        >
          {this.element}
        </div>
      </div>
    );

    const pageEl = closestAncestorElementBySelector(
      this.element,
      'amp-story-page'
    );
    this.pageId_ = pageEl.getAttribute('id');

    Services.storyStoreServiceForOrNull(this.win).then((storeService) => {
      this.storeService_ = storeService;
      this.storeService_.subscribe(StateProperty.MUTED_STATE, (muted) => {
        this.onMutedStateChange_(muted);
      });
      this.initializeListeners_();
    });
  }

  /** @private */
  maybeInitializeDefaultSticker_() {
    if (!this.useDefaultSticker_) {
      return;
    }
    this.sticker_ =
      this.element.getAttribute('sticker') || FALLBACK_DEFAULT_STICKER;

    // Remove all existing child elements and add only pretap and posttap elements.
    this.element.replaceChildren();
    this.element.appendChild(
      <amp-story-audio-sticker-pretap>
        <amp-img
          width={DEFAULT_STICKERS[this.sticker_].width}
          height={DEFAULT_STICKERS[this.sticker_].height}
          layout="responsive"
        ></amp-img>
      </amp-story-audio-sticker-pretap>
    );
    this.element.appendChild(
      <amp-story-audio-sticker-posttap>
        <amp-img
          width={DEFAULT_STICKERS[this.sticker_].width}
          height={DEFAULT_STICKERS[this.sticker_].height}
          layout="responsive"
        ></amp-img>
      </amp-story-audio-sticker-posttap>
    );
  }

  /**
   * Hide the sticker after the story gets unmuted:
   * 1) if the sticker is on the active page, hide it after showing posttap sticker for 4 seconds.
   * 2) if the sticker is not on the active page, hide it immediately since it is in the background.
   * @param {boolean} muted
   * @private
   */
  onMutedStateChange_(muted) {
    if (!muted) {
      if (
        this.pageId_ === this.storeService_.get(StateProperty.CURRENT_PAGE_ID)
      ) {
        this.hideStickerTimeout_ = setTimeout(
          () => this.toggleStickerState_('hide', true),
          HIDE_STICKER_DELAY_DURATION
        );
      } else {
        this.toggleStickerState_('hide', true);
      }
    } else {
      this.toggleStickerState_('hide', false);
      this.hideStickerTimeout_ && clearTimeout(this.hideStickerTimeout_);
      this.hideStickerTimeout_ = null;
    }
  }

  /**
   * Toggle sticker states.
   * @param {string} stateName
   * @param {boolean} force
   * @private
   */
  toggleStickerState_(stateName, force) {
    this.mutateElement(() => this.element.classList.toggle(stateName, force));
  }

  /** @private */
  initializeListeners_() {
    this.element.addEventListener(
      'click',
      () => this.storeService_.dispatch(Action.TOGGLE_MUTED, false),
      true
    );
    // TODO: add listeners for click animations.
  }

  /** @override */
  layoutCallback() {
    if (this.useDefaultSticker_) {
      const pretapImage = scopedQuerySelector(
        this.element,
        'amp-story-audio-sticker-pretap amp-img'
      );
      pretapImage.setAttribute(
        'src',
        DEFAULT_STICKERS[this.sticker_].pretapUrl
      );
      const posttapImage = scopedQuerySelector(
        this.element,
        'amp-story-audio-sticker-posttap amp-img'
      );
      posttapImage.setAttribute(
        'src',
        DEFAULT_STICKERS[this.sticker_].posttapUrl
      );
    }
  }

  /** @override */
  isLayoutSupported(layout) {
    return layout == Layout_Enum.CONTAINER;
  }
}

AMP.extension(TAG, '0.1', (AMP) => {
  AMP.registerElement(TAG, AmpStoryAudioSticker, CSS);
});
