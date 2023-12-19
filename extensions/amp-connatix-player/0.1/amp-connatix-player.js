import {
  CONSENT_POLICY_STATE,
  CONSENT_STRING_TYPE,
} from '#core/constants/consent-state';
import {Deferred} from '#core/data-structures/promise';
import {getDataParamsFromAttributes, removeElement} from '#core/dom';
import {applyFillContent, isLayoutSizeDefined} from '#core/dom/layout';
import {
  observeContentSize,
  unobserveContentSize,
} from '#core/dom/layout/size-observer';
import {PauseHelper} from '#core/dom/video/pause-helper';
import {tryParseJson} from '#core/types/object/json';

import {Services} from '#service';
import {installVideoManagerForDoc} from '#service/video-manager-impl';

import {getData} from '#utils/event-helper';
import {userAssert} from '#utils/log';

import {
  getConsentMetadata,
  getConsentPolicyInfo,
  getConsentPolicySharedData,
  getConsentPolicyState,
} from '../../../src/consent';
import {redispatch} from '../../../src/iframe-video';
import {addParamsToUrl} from '../../../src/url';
import {
  VideoEvents_Enum,
  setIsMediaComponent,
} from '../../../src/video-interface';

/**
 * @param {!Array<T>} promises
 * @return {!Promise<!Array<{
 *  status: string,
 *  value: (T|undefined),
 *  reason: *,
 * }>>}
 * @template T
 */
export function allSettled(promises) {
  /**
   * @param {*} value
   * @return {{status: string, value: *}}
   */
  function onFulfilled(value) {
    return {status: 'fulfilled', value};
  }
  /**
   * @param {*} reason
   * @return {{status: string, reason: *}}
   */
  function onRejected(reason) {
    return {status: 'rejected', reason};
  }
  return Promise.all(
    promises.map((promise) => {
      return promise.then(onFulfilled, onRejected);
    })
  );
}

export class AmpConnatixPlayer extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {string} */
    this.playerId_ = '';

    /** @private {string} */
    this.mediaId_ = '';

    /** @private {string} */
    this.iframeDomain_ = null;

    /** @private {?HTMLIFrameElement} */
    this.iframe_ = null;

    /** @private {?Promise} */
    this.playerReadyPromise_ = null;

    /** @private {?Function} */
    this.playerReadyResolver_ = null;

    this.onResized_ = this.onResized_.bind(this);

    /** @private @const */
    this.pauseHelper_ = new PauseHelper(this.element);

    /** @private {boolean} */
    this.isFullscreen_ = false;
  }

  /**
   * Sends a post message to the iframe where the connatix player
   * is embedded. Used for giving external commands to the player
   * (play/pause etc)
   * @private
   * @param {string} command
   * @param {Object=} opt_args
   */
  sendCommand_(command, opt_args) {
    if (!this.playerReadyPromise_) {
      return;
    }

    this.playerReadyPromise_.then((iframe) => {
      if (!iframe) {
        return;
      }

      if (iframe.contentWindow) {
        iframe.contentWindow./*OK*/ postMessage(
          JSON.stringify({
            'event': 'command',
            'func': command,
            'args': opt_args || '',
          }),
          this.iframeDomain_
        );
      }
    });
  }

  /**
   * Binds to player events from iframe. In this case
   * it is used for binding to the close event which
   * triggers when a user clicks on the close button
   * on the player
   * @private
   */
  bindToPlayerCommands_() {
    this.win.addEventListener('message', (e) => {
      if (!this.iframe_ || e.source !== this.iframe_.contentWindow) {
        // Ignore messages from other iframes.
        return;
      }
      const dataString = getData(e);
      const dataJSON = tryParseJson(dataString);

      if (!dataJSON || dataJSON['event'] !== 'command') {
        return;
      }

      switch (dataJSON['func']) {
        // Player wants to close because the user interacted on its close button
        case 'cnxClose': {
          this.destroyPlayerFrame_();
          this.attemptCollapse();
          break;
        }
        // Player rendered
        case 'cnxPlayerRendered': {
          this.playerReadyResolver_(this.iframe_);
          break;
        }
        case 'cnxContentPlaying': {
          this.pauseHelper_.updatePlaying(true);
          break;
        }
        case 'cnxContentPaused': {
          this.pauseHelper_.updatePlaying(false);
          break;
        }
        case 'cnxFullscreenChanged': {
          this.isFullscreen_ = !this.isFullscreen_;
          break;
        }
      }

      redispatch(this.element, dataJSON['func'].toString(), {
        'cnxContentPlaying': VideoEvents_Enum.PLAYING,
        'cnxContentPaused': VideoEvents_Enum.PAUSE,
      });
    });
  }

  /**
   * Binds to amp-consent
   * @private
   */
  bindToAmpConsent_() {
    const consentPolicyId = super.getConsentPolicy() || 'default';
    const consentPolicyStatePromise = getConsentPolicyState(
      this.element,
      consentPolicyId
    );
    const consentPolicyInfoPromise = getConsentPolicyInfo(
      this.element,
      consentPolicyId
    );
    const consentPolicySharedDataPromise = getConsentPolicySharedData(
      this.element,
      consentPolicyId
    );
    const consentMetadataPromise = getConsentMetadata(
      this.element,
      consentPolicyId
    );

    allSettled([
      consentPolicyStatePromise,
      consentPolicyInfoPromise,
      consentPolicySharedDataPromise,
      consentMetadataPromise,
    ]).then((values) => {
      if (values && values.length === 4) {
        const consentPolicyState = values[0];
        const consentPolicyInfo = values[1];
        const consentPolicySharedData = values[2];
        const consentMetadata = values[3];
        const ampConsentInfo = {
          'consentPolicyStateEnum': CONSENT_POLICY_STATE,
          'consentStringTypeEnum': CONSENT_STRING_TYPE,
          'consentPolicyState': {
            'error': consentPolicyState.reason,
            'value': consentPolicyState.value,
          },
          'rawConsentString': {
            'error': consentPolicyInfo.reason,
            'value': consentPolicyInfo.value,
          },
          'consentSharedData': {
            'error': consentPolicySharedData.reason,
            'value': consentPolicySharedData.value,
          },
          'consentMetadata': {
            'error': consentMetadata.reason,
            'value': consentMetadata.value,
          },
        };
        this.sendCommand_('ampConsentInfo', ampConsentInfo);
      }
    });
  }

  /**
   * Removes the player iframe
   * @private
   */
  destroyPlayerFrame_() {
    if (this.iframe_) {
      removeElement(this.iframe_);
      this.iframe_ = null;
    }
  }

  /** @override */
  buildCallback() {
    const {element} = this;

    installVideoManagerForDoc(element);

    setIsMediaComponent(element);

    // Player id is mandatory
    this.playerId_ = userAssert(
      element.getAttribute('data-player-id'),
      'The data-player-id attribute is required for <amp-connatix-player> %s',
      element
    );

    // Media id is optional
    this.mediaId_ = element.getAttribute('data-media-id') || '';
    const elementsPlayer =
      element.getAttribute('data-elements-player') || false;
    if (elementsPlayer) {
      this.iframeDomain_ = 'https://cdm.elements.video';
    } else {
      this.iframeDomain_ = 'https://amp.cntxcdm.com';
    }
    // will be used by sendCommand in order to send only after the player is rendered
    const deferred = new Deferred();
    this.playerReadyPromise_ = deferred.promise;
    this.playerReadyResolver_ = deferred.resolve;
  }

  /**
   * @param {boolean=} onLayout
   * @override
   */
  preconnectCallback(onLayout) {
    // Serves the player assets
    Services.preconnectFor(this.win).url(
      this.getAmpDoc(),
      this.iframeDomain_,
      onLayout
    );
  }

  /** @override */
  layoutCallback() {
    const {element} = this;
    // Url Params for iframe source
    const urlParams = {
      'playerId': this.playerId_ || undefined,
      'mediaId': this.mediaId_ || undefined,
      'url': Services.documentInfoForDoc(element).sourceUrl,
      ...getDataParamsFromAttributes(element),
    };
    const iframeUrl = this.iframeDomain_ + '/amp-embed/index.html';
    const src = addParamsToUrl(iframeUrl, urlParams);

    const iframe = element.ownerDocument.createElement('iframe');
    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('allowfullscreen', 'true');
    iframe.src = src;

    // applyFillContent so that frame covers the entire component.
    applyFillContent(iframe, /* replacedContent */ true);

    // append child iframe for element
    element.appendChild(iframe);
    this.iframe_ = /** @type {HTMLIFrameElement} */ (iframe);

    Services.videoManagerForDoc(element).register(this);

    // bind to player events (playerRendered after we can send commands to player and other)
    this.bindToPlayerCommands_();
    // bind to amp consent and send consent info to the iframe content and propagate to player
    this.bindToAmpConsent_();

    observeContentSize(this.element, this.onResized_);
    this.pauseHelper_.updatePlaying(true);

    return this.loadPromise(iframe).then(() => this.playerReadyPromise_);
  }

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  /**
   * @param {!../layout-rect.LayoutSizeDef} size
   * @private
   */
  onResized_({height, width}) {
    if (!this.iframe_) {
      return;
    }
    this.sendCommand_('ampResize', {'width': width, 'height': height});
  }

  /** @override */
  pauseCallback() {
    if (!this.iframe_) {
      return;
    }
    this.sendCommand_('ampPause');
    // The player doesn't appear to respect "ampPause" message.
    this.iframe_.src = this.iframe_.src;
  }

  /** @override */
  unlayoutCallback() {
    this.destroyPlayerFrame_();

    const deferred = new Deferred();
    this.playerReadyPromise_ = deferred.promise;
    this.playerReadyResolver_ = deferred.resolve;

    unobserveContentSize(this.element, this.onResized_);
    this.pauseHelper_.updatePlaying(false);

    return true;
  }

  // VideoInterface Implementation. See ../src/video-interface.VideoInterface

  /** @override */
  supportsPlatform() {
    return true;
  }

  /** @override */
  isInteractive() {
    return true;
  }

  /** @override */
  play(unusedIsAutoplay) {
    this.sendCommand_('play');
  }

  /** @override */
  pause() {
    this.sendCommand_('pause');
  }

  /** @override */
  mute() {
    this.sendCommand_('mute');
  }

  /** @override */
  unmute() {
    this.sendCommand_('unmute');
  }

  /** @override */
  showControls() {
    // Not supported.
  }

  /** @override */
  hideControls() {
    // Not supported.
  }

  /** @override */
  fullscreenEnter() {
    if (!this.iframe_) {
      return;
    }

    this.sendCommand_('enterFullscreen');
  }

  /** @override */
  fullscreenExit() {
    if (!this.iframe_) {
      return;
    }

    this.sendCommand_('exitFullscreen');
  }

  /** @override */
  isFullscreen() {
    if (!this.iframe_) {
      return false;
    }
    return this.isFullscreen_;
  }

  /** @override */
  getMetadata() {
    // Not implemented
  }

  /** @override */
  preimplementsMediaSessionAPI() {
    return true;
  }

  /** @override */
  preimplementsAutoFullscreen() {
    return false;
  }

  /** @override */
  getCurrentTime() {
    // Not implemented
    return NaN;
  }

  /** @override */
  getDuration() {
    // Not implemented
    return NaN;
  }

  /** @override */
  getPlayedRanges() {
    // Not supported.
    return [];
  }

  /** @override */
  seekTo(unusedTimeSeconds) {
    this.user().error('TAG', '`seekTo` not supported.');
  }
}

AMP.extension('amp-connatix-player', '0.1', (AMP) => {
  AMP.registerElement('amp-connatix-player', AmpConnatixPlayer);
});
