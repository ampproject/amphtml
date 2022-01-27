import {escapeCssSelectorIdent} from '#core/dom/css-selectors';
import {
  Layout_Enum,
  applyFillContent,
  isLayoutSizeFixed,
} from '#core/dom/layout';
import {propagateAttributes} from '#core/dom/propagate-attributes';
import {realChildNodes} from '#core/dom/query';
import {setStyle} from '#core/dom/style';
import {tryPlay} from '#core/dom/video';

import {triggerAnalyticsEvent} from '#utils/analytics';
import {listen} from '#utils/event-helper';
import {dev} from '#utils/log';

import {
  EMPTY_METADATA,
  parseFavicon,
  parseOgImage,
  parseSchemaImage,
  setMediaSession,
  validateMediaMetadata,
} from '../../../src/mediasession-helper';
import {getMode} from '../../../src/mode';
import {assertHttpsUrl} from '../../../src/url';
import {setIsMediaComponent} from '../../../src/video-interface';

const TAG = 'amp-audio';

/**
 * Visible for testing only.
 */
export class AmpAudio extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {?Element} */
    this.audio_ = null;

    /** @private {!../../../src/mediasession-helper.MetadataDef} */
    this.metadata_ = EMPTY_METADATA;

    /** @public {boolean} */
    this.isPlaying = false;
  }

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeFixed(layout);
  }

  /** @override */
  buildCallback() {
    // If layout="nodisplay" force autoplay to off
    const layout = this.getLayout();
    this.buildAudioElement();
    if (layout === Layout_Enum.NODISPLAY) {
      this.element.removeAttribute('autoplay');
    }

    setIsMediaComponent(this.element);

    this.registerAction('play', this.play_.bind(this));
    this.registerAction('pause', this.pause_.bind(this));

    this.setUpCaptions_();
  }

  /** @override */
  mutatedAttributesCallback(mutations) {
    if (!this.audio_) {
      return;
    }

    const src = mutations['src'];
    const controlsList = mutations['controlsList'];
    const loop = mutations['loop'];

    if (src !== undefined || controlsList !== undefined || loop !== undefined) {
      if (src !== undefined) {
        assertHttpsUrl(src, this.element);
      }
      propagateAttributes(
        ['src', 'loop', 'controlsList'],
        this.element,
        this.audio_
      );
    }

    const artist = mutations['artist'];
    const title = mutations['title'];
    const album = mutations['album'];
    const artwork = mutations['artwork'];

    if (
      artist !== undefined ||
      title !== undefined ||
      album !== undefined ||
      artwork !== undefined
    ) {
      this.updateMetadata_();
    }
  }

  /**
   * Builds the internal <audio> element.
   */
  buildAudioElement() {
    const audio = this.element.ownerDocument.createElement('audio');
    if (!audio.play) {
      this.toggleFallback(true);
      return;
    }

    const src = this.getElementAttribute_('src');
    if (src) {
      assertHttpsUrl(src, this.element);
    }
    propagateAttributes(
      [
        'src',
        'preload',
        'autoplay',
        'muted',
        'loop',
        'aria-label',
        'aria-describedby',
        'aria-labelledby',
        'controlsList',
      ],
      this.element,
      audio
    );

    const layout = this.getLayout();
    if (layout !== Layout_Enum.NODISPLAY) {
      // Force controls otherwise there is no player UI.
      audio.controls = true;

      // TODO(https://go.amp.dev/issue/36303): We explicitly set width 100% to workaround
      // an issue where `<audio>` does not fill the parent container on iOS
      // (https://go.amp.dev/issue/36292).
      // This is required since global styles for `.i-amphtml-fill-content` set width to 0 in
      // order to address a separate bug. Re-assess whether that workaround is needed, and
      // remove this style if so.
      setStyle(audio, 'width', '100%');

      applyFillContent(audio);
    }

    realChildNodes(this.element).forEach((child) => {
      if (child.getAttribute && child.getAttribute('src')) {
        assertHttpsUrl(child.getAttribute('src'), dev().assertElement(child));
      }
      audio.appendChild(child);
    });
    this.element.appendChild(audio);
    this.audio_ = audio;

    listen(this.audio_, 'playing', () => this.audioPlaying_());

    listen(this.audio_, 'play', () => {
      this.setUpCaptions_();
      return triggerAnalyticsEvent(this.element, 'audio-play');
    });
    listen(this.audio_, 'pause', () =>
      triggerAnalyticsEvent(this.element, 'audio-pause')
    );
  }

  /** @override */
  layoutCallback() {
    const layout = this.getLayout();
    if (layout !== Layout_Enum.NODISPLAY) {
      this.buildAudioElement();
    }
    this.updateMetadata_();

    // Resolve layoutCallback right away if the audio won't preload.
    if (this.element.getAttribute('preload') === 'none') {
      return this.audio_;
    }

    return this.loadPromise(this.audio_);
  }

  /** @private */
  updateMetadata_() {
    // Gather metadata
    const {document} = this.getAmpDoc().win;
    const artist = this.getElementAttribute_('artist') || '';
    const title =
      this.getElementAttribute_('title') ||
      this.getElementAttribute_('aria-label') ||
      document.title ||
      '';
    const album = this.getElementAttribute_('album') || '';
    const artwork =
      this.getElementAttribute_('artwork') ||
      parseSchemaImage(document) ||
      parseOgImage(document) ||
      parseFavicon(document) ||
      '';
    this.metadata_ = {
      title,
      artist,
      album,
      artwork: [{src: artwork}],
    };
  }

  /** @override */
  renderOutsideViewport() {
    return true;
  }

  /**
   * Returns the value of the attribute specified
   * @param {string} attr
   * @return {string}
   */
  getElementAttribute_(attr) {
    return this.element.getAttribute(attr);
  }

  /**
   * Resets the component if the underlying <audio> was changed.
   * This should only be used in cases when a higher-level component manages
   * this element's DOM.
   */
  resetOnDomChange() {
    this.setUpCaptions_();
  }

  /**
   * Connects to amp-story-captions component.
   * @private
   */
  setUpCaptions_() {
    const captionsId = this.element.getAttribute('captions-id');
    if (!captionsId) {
      return;
    }
    const captionsElement = this.win.document.querySelector(
      `amp-story-captions#${escapeCssSelectorIdent(captionsId)}`
    );
    if (!captionsElement) {
      return;
    }
    captionsElement.getImpl().then((impl) => {
      if (impl.setMediaElement) {
        impl.setMediaElement(this.audio_);
      }
    });
  }

  /** @override */
  pauseCallback() {
    if (this.audio_) {
      this.audio_.pause();
      this.setPlayingStateForTesting_(false);
    }
  }

  /**
   * Checks if the function is allowed to be called
   * @return {boolean}
   */
  isInvocationValid_() {
    // Don't execute actions if too early, or if the audio element was removed.
    return !!this.audio_;
  }

  /**
   * Pause action for <amp-audio>.
   */
  pause_() {
    if (!this.isInvocationValid_()) {
      return;
    }
    this.audio_.pause();
    this.setPlayingStateForTesting_(false);
  }

  /**
   * Play action for <amp-audio>.
   */
  play_() {
    if (!this.isInvocationValid_()) {
      return;
    }
    tryPlay(this.audio_);
    this.setPlayingStateForTesting_(true);
  }

  /**
   * Sets whether the audio is playing or not.
   * @param {boolean} isPlaying
   * @private
   */
  setPlayingStateForTesting_(isPlaying) {
    if (getMode().test) {
      this.isPlaying = isPlaying;
    }
  }

  /** @private */
  audioPlaying_() {
    const playHandler = () => {
      tryPlay(this.audio_);
      this.setPlayingStateForTesting_(true);
    };
    const pauseHandler = () => {
      this.audio_.pause();
      this.setPlayingStateForTesting_(false);
    };

    // Update the media session
    validateMediaMetadata(this.element, this.metadata_);
    setMediaSession(this.win, this.metadata_, playHandler, pauseHandler);
  }
}

AMP.extension(TAG, '0.1', (AMP) => {
  AMP.registerElement(TAG, AmpAudio);
});
