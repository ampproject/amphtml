import * as Preact from '#core/dom/jsx';
import {Layout_Enum} from '#core/dom/layout';
import {scopedQuerySelector} from '#core/dom/query';

import {Services} from '#service';

import {CSS} from '../../../build/amp-story-audio-sticker-0.1.css';
import {
  Action,
  StateProperty,
} from '../../amp-story/1.0/amp-story-store-service';

const TAG = 'amp-story-audio-sticker';

/**
 * Sticker pretap tag
 * @const {string}
 */
const STICKER_PRETAP_TAG = 'amp-story-audio-sticker-pretap';
/**
 * Sticker posttap tag
 * @const {string}
 */
const STICKER_POSTTAP_TAG = 'amp-story-audio-sticker-posttap';

/**
 * The gstatic URL prefix of the sticker assets.
 * @const {string}
 */
const ASSET_URL_PREFIX = 'https://www.gstatic.com/amphtml/stamp/audio-sticker/';

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
  'headphone-cat': {
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

/** Fallback default sticker. It would be used if both of below happen:
 * 1) no default sticker is specified
 * 2) the custom sticker data is not provided completely.
 * @const {string}
 */
const FALLBACK_DEFAULT_STICKER = 'headphone-cat';

export class AmpStoryAudioSticker extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {?../../../extensions/amp-story/1.0/amp-story-store-service.AmpStoryStoreService} */
    this.storeService_ = null;

    /** @private {?HTMLElement} */
    this.systemLayerEl_ = null;
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
            (this.element.getAttribute('size') === 'large'
              ? ' large'
              : ' small')
          }
        >
          {this.element}
        </div>
      </div>
    );
  }

  /** @override */
  layoutCallback() {
    return Services.storyStoreServiceForOrNull(this.win).then(
      (storeService) => {
        this.storeService_ = storeService;
        this.element.addEventListener('click', this.onClick_.bind(this), true);
        this.storeService_.subscribe(
          StateProperty.MUTED_STATE,
          this.onMutedStateChange_.bind(this)
        );
      }
    );
  }

  /**
   * When the sticker is clicked, toggle muted state and highlight
   * the mute control on system layer.
   * @private
   */
  onClick_() {
    this.storeService_.dispatch(Action.TOGGLE_MUTED, false);
    this.getSystemLayerEl_().classList.add(
      'i-amphtml-story-highlight-mute-audio-control'
    );
  }

  /**
   * Disable highlight once the story gets muted again.
   * @private
   * @param {boolean} isMuted
   */
  onMutedStateChange_(isMuted) {
    if (isMuted) {
      this.getSystemLayerEl_().classList.remove(
        'i-amphtml-story-highlight-mute-audio-control'
      );
    }
  }

  /**
   * Get the system layer element.
   * @private
   * @return {HTMLElement}
   */
  getSystemLayerEl_() {
    return (
      this.systemLayerEl_ ??
      (this.systemLayerEl_ = this.element
        .closest('amp-story')
        .querySelector('.i-amphtml-system-layer-host'))
    );
  }

  /** @private */
  maybeInitializeDefaultSticker_() {
    const defaultSticker = this.getDefaultSticker_();
    if (!defaultSticker) {
      return;
    }

    // Remove all existing child elements and add only pretap and posttap elements.
    this.element.replaceChildren();
    this.element.appendChild(
      <amp-story-audio-sticker-pretap>
        <amp-img
          width={DEFAULT_STICKERS[defaultSticker].width}
          height={DEFAULT_STICKERS[defaultSticker].height}
          src={DEFAULT_STICKERS[defaultSticker].pretapUrl}
          layout="responsive"
        ></amp-img>
      </amp-story-audio-sticker-pretap>
    );
    this.element.appendChild(
      <amp-story-audio-sticker-posttap>
        <amp-img
          width={DEFAULT_STICKERS[defaultSticker].width}
          height={DEFAULT_STICKERS[defaultSticker].height}
          src={DEFAULT_STICKERS[defaultSticker].posttapUrl}
          layout="responsive"
        ></amp-img>
      </amp-story-audio-sticker-posttap>
    );
  }

  /**
   * Return the specified default sticker or null if there's custom sticker provided.
   * Return fallback sticker is both default and custom sticker config are not specified at all.
   * @private
   * @return {string}
   */
  getDefaultSticker_() {
    if (
      scopedQuerySelector(this.element, STICKER_PRETAP_TAG) &&
      scopedQuerySelector(this.element, STICKER_POSTTAP_TAG)
    ) {
      return null;
    }

    const stickerAttr = this.element.getAttribute('sticker');
    return DEFAULT_STICKERS[stickerAttr]
      ? stickerAttr
      : FALLBACK_DEFAULT_STICKER;
  }

  /** @override */
  isLayoutSupported(layout) {
    return layout == Layout_Enum.CONTAINER;
  }
}

AMP.extension(TAG, '0.1', (AMP) => {
  AMP.registerElement(TAG, AmpStoryAudioSticker, CSS);
});
