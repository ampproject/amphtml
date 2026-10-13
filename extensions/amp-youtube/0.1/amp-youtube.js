import {userAssert} from '../../../src/core/assert';
import {removeElement} from '#core/dom';
import {isLayoutSizeDefined} from '#core/dom/layout';
import {parseUrlDeprecated} from '../../../src/url';
import {createFrameFor} from '../../../src/iframe-video';
import {addParamsToUrl} from '../../../src/url';
import {setStyle} from '#core/dom/style';
import {Services} from '#service';
import {VideoEvents} from '../../../src/video-interface';
import {listen, listenOnce} from '#event-helper';
import {getDataParamsFromAttributes} from '../../../src/core/dom';

/**
 * @implements {../../../src/video-interface.VideoInterface}
 */
class AmpYoutube extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {?Element} */
    this.iframe_ = null;

    /** @private {boolean} */
    this.muted_ = false;

    /** @private {?string} */
    this.videoid_ = null;

    /** @private {?string} */
    this.searchTerm_ = null;

    /** @private {?string} */
    this.channelid_ = null;



    /** @private {?string} */
    this.liveChannelid_ = null;

    /** @private {?string} */
    this.playlistid_ = null;

    /** @private {?string} */
    this.pauseHelper_ = null;

    /** @private {boolean} */
    this.isReady_ = false;

    /** @private {!Array} */
    this.pendingMessages_ = [];

    /** @private {?string} */
    this.videoTitle_ = null;

    /** @private {string} */
    this.id_ = `amp-yt-${Math.floor(Math.random() * 1000000)}`;
  }

  /** @override */
  preconnectCallback(onLayout) {
    if (onLayout) {
      this.preconnect.preload('https://www.youtube.com/iframe_api', 'script');
      this.preconnect.url('https://www.youtube.com', true);
      this.preconnect.url('https://s.ytimg.com', true);
    }
  }

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  /** @override */
  buildCallback() {
    this.videoid_ = this.getVideoId_();
    this.liveChannelid_ = this.getLiveChannelId_();
    this.playlistid_ = this.element.getAttribute('data-playlistid');
    this.searchTerm_ = this.element.getAttribute('data-search');
    this.channelid_ = this.element.getAttribute('data-channelid');



    this.assertDatasourceExists_();

    // Assign the generated ID to the element for referencing
    this.element.id = this.id_;
  }

  /** @override */
  layoutCallback() {
    const iframe = createFrameFor(this, this.getVideoIframeSrc_());
    iframe.allowFullscreen = true;
    iframe.setAttribute('allow', 'autoplay');
    iframe.setAttribute('id', `${this.id_}-iframe`);
    this.applyFillContent(iframe);
    this.element.appendChild(iframe);
    this.iframe_ = iframe;

    // Listen for messages from YouTube.
    const unlistenMessage = listen(
      this.win,
      'message',
      this.handleYoutubeMessage_.bind(this)
    );

    // Cleanup when unloaded.
    listenOnce(this.element, 'unload', () => {
      unlistenMessage();
      if (this.iframe_) {
        removeElement(this.iframe_);
      }
    });

    return this.loadPromise(this.iframe_).then(() => {
      this.sendCommand_('listening');
    });
  }

  /** @private */
  getVideoIframeSrc_() {
    const src = this.getEmbedUrl_();
    const params = getDataParamsFromAttributes(this.element);
    params['enablejsapi'] = '1';
    params['amp'] = '1';
    if (this.muted_) {
      params['mute'] = '1';
    }
    return addParamsToUrl(src, params);
  }

/** @private */
getEmbedUrl_() {
  let descriptor;
  if (this.videoid_) {
    descriptor = `${encodeURIComponent(this.videoid_)}?`;
  } else if (this.liveChannelid_) {
    descriptor = `live_stream?channel=${encodeURIComponent(this.liveChannelid_)}&`;
  } else if (this.playlistid_) {
    descriptor = `videoseries?list=${encodeURIComponent(this.playlistid_)}&`;
  } else if (this.channelid_) {
    // Convert the channel ID (UC...) to the uploads playlist ID (UU...)
    const uploadsPlaylistId = this.channelid_.replace(/^UC/, 'UU');
    descriptor = `videoseries?list=${encodeURIComponent(uploadsPlaylistId)}&`;
  } else if (this.element.getAttribute('data-user')) {
    const username = this.element.getAttribute('data-user');
    descriptor = `?listType=user_uploads&list=${encodeURIComponent(username)}&`;
  } else if (this.searchTerm_) {
    descriptor = `results?search_query=${encodeURIComponent(this.searchTerm_)}&`;
  } else {
    userAssert(
      false,
      'Must specify one of data-videoid, data-live-channelid, data-playlistid, data-user, data-search, or data-channelid'
    );
  }
  return `https://www.youtube.com/embed/${descriptor}`;
}



  /** @private */
  getVideoId_() {
    return this.element.getAttribute('data-videoid');
  }

  /** @private */
  getLiveChannelId_() {
    return this.element.getAttribute('data-live-channelid');
  }

  /** @private */
  assertDatasourceExists_() {
    const datasourceExists =
    [this.videoid_, this.liveChannelid_, this.playlistid_, this.element.getAttribute('data-user'),this.searchTerm_,this.channelid_]
    .filter(Boolean).length === 1;
    userAssert(
      datasourceExists,
      'Exactly one of data-videoid, data-live-channelid, data-playlistid, data-user, data-search, or data-channelid should be present.'

    );
  }

  /** @private */
  sendCommand_(command, arg = undefined) {
    if (!this.iframe_ || !this.isReady_) {
      this.pendingMessages_.push({command, arg});
      return;
    }
    this.iframe_.contentWindow./*OK*/ postMessage(
      JSON.stringify({event: 'command', func: command, args: arg ? [arg] : []}),
      '*'
    );
  }

  // Other video interface methods like play, pause, mute etc. would go here.
}

AMP.extension('amp-youtube', '0.1', AMP => {
  AMP.registerElement('amp-youtube', AmpYoutube);
});
