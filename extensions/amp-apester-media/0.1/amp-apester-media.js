/**
 * Copyright 2016 The AMP HTML Authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { CSS } from '../../../build/amp-apester-media-0.1.css';
import { user, dev } from '../../../src/log';
import { getLengthNumeral, isLayoutSizeDefined } from '../../../src/layout';
import { removeElement } from '../../../src/dom';
import { Services } from '../../../src/services';
import { installFriendlyIframeEmbed } from '../../../src/friendly-iframe-embed';
import {
  extractTags,
  getPlatform,
  setFullscreenOn,
  setFullscreenOff,
  registerEvent
} from './utils';

/** @const */
const TAG = 'amp-apester-media';
/**
 * @type {{SET_FULL_SCREEN: string, REMOVE_FULL_SCREEN: string, RESIZE_UNIT: string}}
 */
const apesterEventNames = {
  SET_FULL_SCREEN: 'fullscreen_on',
  REMOVE_FULL_SCREEN: 'fullscreen_off',
  RESIZE_UNIT: 'apester_resize_unit',
};

/**
 * AMP Apester-media
 */
class AmpApesterMedia extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);
    /**
     * @const @private {string}
     */
    this.rendererBaseUrl_ = 'https://renderer.qmerce.local.com';
    /**
     * @const @private {string}
     */
    this.displayBaseUrl_ = 'https://display.apester.local.com';
    /**
     * @const @private {string}
     */
    this.staticContent_ = 'https://static.qmerce.com';
    /**
     * @const @private {string}
     */
    this.loaderUrl_ = 'https://images.apester.com/images%2Floader.gif';
    /** @private {boolean}  */
    this.seen_ = false;
    /** @private {?Element}  */
    this.iframe_ = null;
    /** @private {?Promise}  */
    this.iframePromise_ = null;
    /** @private {boolean}  */
    this.ready_ = false;
    /** @private {?number|undefined}  */
    this.width_ = null;
    /** @private {?number|undefined}  */
    this.height_ = null;
    /** @private {boolean}  */
    this.random_ = false;
    /**
     * @private {?string}
     */
    this.mediaAttribute_ = null;
    /**
     * @private {?string}
     */
    this.embedOptions_ = {};
    /**
     * @private {?string}
     */
    this.mediaId_ = null;
    /** @private {Array<Function>} */
    this.unlisteners_ = [];
  }
  
  /**
   * @param {boolean=} onLayout
   * @override
   */
  preconnectCallback(onLayout) {
    this.preconnect.url(this.displayBaseUrl_, onLayout);
    this.preconnect.url(this.rendererBaseUrl_, onLayout);
    this.preconnect.url(this.staticContent_, onLayout);
  }
  
  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }
  
  /** @override */
  viewportCallback(inViewport) {
    if (inViewport && !this.seen_) {
      if (this.iframe_ && this.iframe_.contentWindow) {
        dev().fine(TAG, 'media seen');
        this.seen_ = true;
        this.iframe_.contentWindow./*OK*/postMessage('interaction seen', '*');
      }
    }
    if (this.getPlaceholder() && !this.ready_) {
      this.togglePlaceholder(inViewport);
    }
  }
  
  /** @override */
  buildCallback() {
    const width = this.element.getAttribute('width');
    const height = this.element.getAttribute('height');
    this.width_ = getLengthNumeral(width);
    this.height_ = getLengthNumeral(height);
    this.random_ = false;
    this.mediaAttribute_ = user().assert(
      (this.element.getAttribute('data-apester-media-id') ||
        (this.random_ =
          this.element.getAttribute('data-apester-channel-token'))),
      'Either the data-apester-media-id or the data-apester-channel-token ' +
      'attributes must be specified for <amp-apester-media> %s',
      this.element);
    this.embedOptions_ = {
      playlist: this.random_,
      idOrToken: this.mediaAttribute_,
      inative: this.element.getAttribute('data-apester-inative') === 'true',
      fallback: this.element.getAttribute('data-apester-fallback'),
      distributionChannelId:
        this.element.getAttribute('data-apester-channel-id'),
      renderer: true,
      tags: extractTags(this.element, document),
    };
  }
  
  /** @override */
  firstLayoutCompleted() {
    this.viewportCallback(this.isInViewport());
    // Do not hide placeholder
  }
  
  /**
   * @return {string}
   **/
  buildUrl_() {
    const {
      idOrToken, playlist, inative, distributionChannelId, fallback,
      renderer, tags,
    } = this.embedOptions_;
    const encodedMediaAttribute = encodeURIComponent(
      dev().assertString(this.mediaAttribute_));
    let suffix = '';
    let queryParmas = '?';
    if (inative) {
      if (idOrToken) {
        suffix = `/inatives/${idOrToken}`;
      } else if (distributionChannelId) {
        suffix = `/channels/${distributionChannelId}/inatives`;
      }
    } else if (playlist && tags) {
      const encodedTags = tags.map(tag =>
        `tags=${encodeURIComponent(tag.trim())}`).join('&');
      suffix = `/tokens/${encodedMediaAttribute}/interactions/random`;
      queryParmas += encodedTags ? `${encodedTags}&` : '';
      queryParmas += `fallback=${!!fallback}&`;
    } else if (playlist) {
      suffix = `/tokens/${encodedMediaAttribute}/interactions/random`;
    } else {
      suffix = `/interactions/${encodedMediaAttribute}/display`;
    }
    queryParmas += `platform=${getPlatform()}`;
    queryParmas += renderer ? '&renderer=true' : '';
    return `${this.displayBaseUrl_}${suffix}${queryParmas}`;
  }
  
  /**
   * @return {!Promise<!JsonObject>}
   **/
  queryMedia_() {
    const url = this.buildUrl_();
    return Services.xhrFor(this.win).fetchJson(url, {
      requireAmpResponseSourceOrigin: false,
    }).then(res => res.json());
  }
  
  /** @param {string} id
   * @return {string}
   * */
  constructUrlFromMedia_(id) {
    const conditionalChannelId = this.embedOptions_distributionChannelId ?
      `&channelId=${this.embedOptions_distributionChannelId}` : '';
    const conditionalInteractionType =
      `&type=${encodeURIComponent(this.embedOptions_.playlist ? 'playlist' :
        'editorial')}`;
    const platform = `&platform=${getPlatform()}`;
    const cannonicalUrl = document.querySelector('link[rel=\'canonical\']')
      ? document.querySelector('link[rel=\'canonical\']').getAttribute('href')
      : document.location.href;
    return `${this.rendererBaseUrl_}/interaction/${
      encodeURIComponent(id)}?sdk=amp&canonicalUrl=${
      encodeURIComponent(cannonicalUrl)}${
      conditionalChannelId}${
      conditionalInteractionType}${
      platform}`;
  }
  
  /**
   * Constructs the media Iframe.
   * @param src
   * @param mediaId
   * @private
   */
  constructIframe_(src, media) {
    const iframe = this.element.ownerDocument.createElement('iframe');
    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('allowtransparency', 'true');
    iframe.setAttribute('scrolling', 'no');
    iframe.setAttribute('data-interaction-id', media.interactionId);
    iframe.name = /wpcomwidgets/.test(document.location.href) ?
      document.referrer : document.location.href;
    const splittedUrl = src.split('?');
    iframe.originalUrlParams = splittedUrl.length > 1 ? `?${splittedUrl[1]}`
      : '';
    iframe.extensionData = media.campaignData;
    iframe.src = 'about:blank';
    iframe.height = this.height_;
    iframe.width = this.width_;
    iframe.classList.add('amp-apester-iframe');
    this.applyFillContent(iframe);
    return iframe;
  }
  
  /**
   * @return {!Element}
   */
  constructLoaderStructure_() {
    const blobs = this.element.ownerDocument.createElement('div');
    const blobLeft = this.element.ownerDocument.createElement('div');
    const blobRight = this.element.ownerDocument.createElement('div');
    const logo = this.element.ownerDocument.createElement('div');
    blobs.classList.add('amp-apester-loader-blobs');
    blobLeft.classList.add('amp-apester-loader-blob');
    blobRight.classList.add('amp-apester-loader-blob');
    logo.classList.add('amp-apester-loader-logo');
    blobs.appendChild(blobLeft);
    blobs.appendChild(blobRight);
    blobs.appendChild(logo);
    return blobs;
  }
  
  /**
   * @return {!Element}
   */
  constructLoaderSVG_() {
    const svg = this.element.ownerDocument.createElement('svg');
    const defs = this.element.ownerDocument.createElement('defs');
    const filter = this.element.ownerDocument.createElement('filter');
    const feGaussianBlur = this.element.ownerDocument
    .createElement('feGaussianBlur');
    const feColorMatrix = this.element.ownerDocument
    .createElement('feColorMatrix');
    const feBlend = this.element.ownerDocument.createElement('feBlend');
    svg.setAttribute('version', '1.1');
    svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    filter.setAttribute('id', 'amp-apester-goo');
    feGaussianBlur.setAttribute('in', 'SourceGraphic');
    feGaussianBlur.setAttribute('results', 'blur');
    feGaussianBlur.setAttribute('stdDeviation', '10');
    feColorMatrix.setAttribute('in', 'blur');
    feColorMatrix.setAttribute('mode', 'matrix');
    feColorMatrix.setAttribute('values',
      '1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7');
    feColorMatrix.setAttribute('result', 'amp-apester-goo');
    feBlend.setAttribute('in2', 'amp-apester-goo');
    feBlend.setAttribute('in', 'SourceGraphic');
    feBlend.setAttribute('result', 'mix');
    svg.appendChild(defs);
    defs.appendChild(filter);
    filter.appendChild(feGaussianBlur);
    filter.appendChild(feColorMatrix);
    filter.appendChild(feBlend);
    return svg;
  }
  
  /**
   * @return {!Element}
   */
  constructOverflow_() {
    const overflow = this.element.ownerDocument.createElement('div');
    overflow.setAttribute('overflow', '');
    overflow.className = 'amp-apester-overflow';
    const overflowButton = this.element.ownerDocument.createElement('button');
    overflowButton.textContent = 'Full Size';
    overflow.appendChild(overflowButton);
    return overflow;
  }
  
  /** @override */
  layoutCallback() {
    this.element.classList.add('amp-apester-container');
    return this.queryMedia_()
    .then(response => {
      const payload = response.payload;
      // If it's a playlist we choose a media randomly.
      // The response will be an array.
      const media = this.embedOptions_.playlist ?
        payload[Math.floor(Math.random() * payload.length)] : payload;
      this.mediaId_ = media['interactionId'];
      const src = this.constructUrlFromMedia_(media['interactionId']);
      const iframe = this.constructIframe_(src, media);
      const overflow = this.constructOverflow_();
      const mutate = state => {
        state.element.classList.add('i-amphtml-apester-iframe-ready');
      };
      const state = {
        element: iframe, mutator: mutate,
      };
      this.iframe_ = iframe;
      this.element.appendChild(overflow);
  
      this.registerToApesterEvents_();
      
      return this.iframePromise_ =
        this.getMediaContent(media.content, src).then(content => {
          return installFriendlyIframeEmbed(this.iframe_, this.element, {
            html: content,
          }).then(() => {
            Services.vsyncFor(this.win).runPromise({mutate}, state);
            return media;
          });
        });
    }, error => {
      dev().error(TAG, 'Display', error);
      return undefined;
    })
    /** @param {!JsonObject} media */
    .then(media => {
      this.togglePlaceholder(false);
      this.ready_ = true;
      let height = 0;
      if (media && media['data'] && media['data']['size']) {
        height = media['data']['size']['height'];
      }
      if (height != this.height_) {
        this.height_ = height;
        if (this.random_) {
          this./*OK*/attemptChangeHeight(height);
        } else {
          this./*OK*/changeHeight(height);
        }
      }
    });
  }
  
  /** @override */
  createPlaceholderCallback() {
    const placeholder = this.element.ownerDocument.createElement('div');
    placeholder.setAttribute('placeholder', '');
    placeholder.setAttribute('layout', 'fill');
    placeholder.className = 'amp-apester-loader';
    placeholder.appendChild(this.constructLoaderStructure_());
    placeholder.appendChild(this.constructLoaderSVG_());
    return placeholder;
  }
  
  /** @override */
  unlayoutOnPause() {
    return true;
  }
  
  /** @override */
  unlayoutCallback() {
    if (this.iframe_) {
      this.unlisteners_.forEach(unlisten => unlisten());
      removeElement(this.iframe_);
      this.iframe_ = null;
      this.iframePromise_ = null;
    }
    return true; //Call layoutCallback again.
  }
  
  /**
   * Pour the HTML into the media Iframe,
   * If we don't have the media HTML already we fetch it.
   * @param content
   * @param src
   */
  getMediaContent(content, src) {
    /** in case we already have renderer content from display-service use it, otherwise fetch from server  */
    const getContent = () => content ? Promise.resolve(content) :
      Services.xhrFor(this.win).fetchJson(src, {
        requireAmpResponseSourceOrigin: false,
      }).then(res => res.text());
    return getContent();
  }
  
  /**
   * Registers to apester events.
   * @private
   */
  registerToApesterEvents_() {
    registerEvent(apesterEventNames.SET_FULL_SCREEN, data => {
      // User clicked full screen button.
      if (this.mediaId_ === data.id) {
        setFullscreenOn(this.element);
      }
    }, this.win, this.iframe_, this.unlisteners_);
    registerEvent(apesterEventNames.REMOVE_FULL_SCREEN, data => {
      // User clicked close full screen button.
      if (this.mediaId_ === data.id) {
        setFullscreenOff(this.element);
      }
    }, this.win, this.iframe_, this.unlisteners_);
    registerEvent(apesterEventNames.RESIZE_UNIT, data => {
      if (this.mediaId_ === data.id && data.height) {
        this.attemptChangeHeight(this.iframe_, data.height);
      }
    }, this.win, this.iframe_, this.unlisteners_);
  }
}

AMP.extension(TAG, '0.1', AMP => {
  AMP.registerElement(TAG, AmpApesterMedia, CSS);
});
