import {Deferred} from '#core/data-structures/promise';
import {Services} from '#service';
import { VideoEvents_Enum } from '../../../src/video-interface';
import {
  addUnsafeAllowAutoplay,
  createFrameFor,
  isJsonOrObj,
  objOrParseJson,
  redispatch,
} from '../../../src/iframe-video';
import {userAssert} from '#utils/log';
import {disableScrollingOnIframe} from '../../../src/iframe-helper';
import {
  dispatchCustomEvent
} from '#core/dom';
import {getData, listen} from '#utils/event-helper';
import {installVideoManagerForDoc} from '../../../src/service/video-manager-impl';
import {isLayoutSizeDefined} from '#core/dom/layout';
import {once} from '#core/types/function';


const TAG = 'amp-slikeplayer';

/**
 * @implements {../../../src/video-interface.VideoInterface}
 */

 /**
 @enum {string}
 * @private
 */

 const SlEvent = {
  'ready': VideoEvents_Enum.LOAD,
  'play': VideoEvents_Enum.PLAYING,
  'pause': VideoEvents_Enum.PAUSE,
  'complete': VideoEvents_Enum.ENDED,
  'visible': VideoEvents_Enum.VISIBILITY,
  'adStart': VideoEvents_Enum.AD_START,
  'adEnd': VideoEvents_Enum.AD_END
};

export class AmpSlikeplayer extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {

    super(element);
 
     /** @private {string} */
     this.apikey_ = '';
 
     /** @private {string} */
     this.videoid_ = '';

     /** @private {?HTMLIFrameElement} */
     this.iframe_ = null;

     /** @private {?Promise} */
    this.playerReadyPromise_ = null;

    /** @private {?function(Element)} */
    this.playerReadyResolver_ = null;

    /** @private {function(Object)} */
    this.onReadyOnce_ = once((detail) => this.onReady_(detail));

     /** @private {string} */
     this.config_ = null;
 
     /** @private {string} */
     this.poster_ = '';
 
     /** @private {string} */
     this.splayer_ = '';
 
     /** @private {string} */
     this.baseUrl_ = 'https://tvid.in/sdk/amp/ampembed.html';
 
     /** @private {number} */
     this.duration_ = 1;

     /** @private {number} */
     this.currentTime_ = 0;
 
     /** @private {Array<(Array<number>|null)>} */
     this.playedRanges_ = [];

 
     /**@private {string}*/
     this.autoplay_ = 'true';

      /** @private {function()} */
    this.onMessage_ = this.onMessage_.bind(this);
  }

  /** @override */
  buildCallback() {
    const { element } = this;
    const deferred = new Deferred();

    this.playerReadyPromise_ = deferred.promise;
    this.playerReadyResolver_ = deferred.resolve;

    this.apikey_ = userAssert(
      element.getAttribute('data-apikey'),
      'The data-apikey attribute is required for <amp-slikeplayer> %s',
      element
    );
    
    this.videoid_ = userAssert(
      element.getAttribute('data-videoid'),
      'The data-videoid attribute is required for <amp-slikeplayer> %s',
      element
    );
    
    this.baseUrl_ = element.getAttribute('data-iframe-src') || this.baseUrl_; 
    this.config_ = element.getAttribute('data-config') || '';
    installVideoManagerForDoc(this.element);
    Services.videoManagerForDoc(this.element).register(this);
  }

  /** @override */
  createPlaceholderCallback() {
    if (!this.poster_) {
      return;
    }
    const placeholder = this.win.document.createElement('amp-img');
    this.propagateAttributes(['aria-label'], placeholder);
    const src = this.poster_;
    placeholder.setAttribute('src', src);
    placeholder.setAttribute('layout', 'fill');
    placeholder.setAttribute('placeholder', '');
    placeholder.setAttribute('referrerpolicy', 'origin');
    if (placeholder.hasAttribute('aria-label')) {
      placeholder.setAttribute(
        'alt',
        'Loading video - ' + placeholder.getAttribute('aria-label')
      );
    } else {
      placeholder.setAttribute('alt', 'Loading video');
    }
    return placeholder;
  }

  /** @override */
  layoutCallback() {
    const src = `${this.baseUrl_}#apikey=${this.apikey_}&videoid=${this.videoid_}&${this.config_}&baseurl=${window.location.origin}`;

    const frame = disableScrollingOnIframe(
      createFrameFor(this, src, this.element.id)
    );

    addUnsafeAllowAutoplay(frame);
    disableScrollingOnIframe(frame);
    this.unlistenFrame_ = listen(this.win, 'message', this.onMessage_);
    this.iframe_ = /** @type {HTMLIFrameElement} */ (frame);
    return this.loadPromise(this.iframe_);
  }
  
  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

   /** @override */
   supportsPlatform() {
    return true;
  }

  /** @override */
  preimplementsAutoFullscreen() {
    return false;
  }

  /**
   * @param {!Event} event
   * @private
   */

   onReady_(detail) {
     const { element } = this;
     this.playerReadyResolver_(this.iframe_);
     dispatchCustomEvent(element, VideoEvents_Enum.LOAD);
   }
   onMessage_(messageEvent) {
    if (
      !this.iframe_ ||
      !messageEvent ||
      messageEvent.source != this.iframe_.contentWindow
    ) {
      return;
    }
    

    const messageData = getData(messageEvent);
    if (!isJsonOrObj(messageData)) {
      return;
    }

    const data = objOrParseJson(messageData);
    const event = data['event'];
    const detail = data['detail'];
    if (event === 'ready') {
      detail && this.onReadyOnce_(detail);
      return;
    }
    const {element} = this;
    if (redispatch(element, event, SlEvent)) {
      return;
    }
    if (detail && event) {
      switch (event) {
        case 'fullscreen':
          break;
        case 'meta':
          break;
        case 'mute':
          break;
        case 'playedRanges':
          break;
        case 'time':
          const { currentTime } = detail;
          this.currentTime_ = currentTime;
          break;
        case 'adTime':
          const { position } = detail;
          this.currentTime_ = position;
        default:
          break;
      }
    }
  }
 /**
  * @override
  */
 postMessage_(message) {
   if (this.iframe_ && this.iframe_.contentWindow) {
     this.iframe_.contentWindow./*OK*/ postMessage(message);
   }
 }

 sendCommand_(method, optParams) {
}

 /**
  * @override
  */
 play() {
   this.postMessage_('play' , "");
 }

 /**
  * @override
  */
 pause() {
   this.postMessage_('pause', "");
 }

 /**
  * @override
  */
 mute() {
   this.postMessage_('mute', "");
 }

 /**
  * @override
  */
 unmute() {
   this.postMessage_('unmute', "");
 }

   /** @override */
preimplementsAutoFullscreen() {
  return false;
}


   /** @override */
preimplementsMediaSessionAPI() {
  return false;
}

  /** @override */
  getMetadata() {
    //Not Implemented
  }

 /** @override */
 getCurrentTime() {
   // Not supported.
    return this.currentTime_ || 0
 }

 /** @override */
 getDuration() {
   return this.duration_ || 1;
 }

 /** @override */
 getPlayedRanges() {
   return [];
 }

 /** @override */
 seekTo(unusedTimeSeconds) {
   //to be implemented
 }

 postMessage_(method, optParams) {
  this.playerReadyPromise_.then(() => {
    if (!this.iframe_ || !this.iframe_.contentWindow) {
      return;
    }
    this.iframe_.contentWindow./*OK*/ postMessage(
    JSON.stringify(
      {
        'method': method,
        'optParams': optParams,
      }
    ),
    '*'
  );
  });
}

}

AMP.extension(TAG, '0.1', (AMP) => {
  AMP.registerElement(TAG, AmpSlikeplayer);
});
