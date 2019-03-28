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
import {CSS} from '../../../build/amp-apester-media-0.1.css';
import {CustomEventReporterBuilder} from '../../../src/extension-analytics';
import {
  IntersectionObserverApi,
} from '../../../src/intersection-observer-polyfill';
import {Services} from '../../../src/services';
import {addParamsToUrl} from '../../../src/url';
import {dev, userAssert} from '../../../src/log';
import {dict} from '../../../src/utils/object';
import {
  extractTags,
  generatePixelURL,
  getPlatform,
  registerEvent,
  setFullscreenOff,
  setFullscreenOn,
} from './utils';
import {getLengthNumeral, isLayoutSizeDefined} from '../../../src/layout';
import {removeElement} from '../../../src/dom';
import {setStyles} from '../../../src/style';

/** @const */
const TAG = 'amp-apester-media';
/**
 * @enum {string}
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
    this.rendererBaseUrl_ = 'https://renderer.apester.com';
    /**
     * @const @private {string}
     */
    this.displayBaseUrl_ = 'https://display.apester.com';
    /**
     * @const @private {string}
     */
    this.staticContent_ = 'https://static.qmerce.com';
    /**
     * @const @private {string}
     */
    this.loaderUrl_ = 'https://static.apester.com/js/assets/loader.gif';
    /** @private {boolean}  */
    this.seen_ = false;
    /** @private {?Element}  */
    this.iframe_ = null;
    /** @private {?Element}  */
    this.placeholder_ = null;
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
     * @private {!Object}
     */
    this.embedOptions_ = {};
    /**
     * @private {?string}
     */
    this.mediaId_ = null;
    /** @private {Array<Function>} */
    this.unlisteners_ = [];
    /** @private {?IntersectionObserverApi} */
    this.intersectionObserverApi_ = null;
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
    if (this.intersectionObserverApi_) {
      this.intersectionObserverApi_.onViewportCallback(inViewport);
    }
    if (inViewport && !this.seen_) {
      if (this.iframe_ && this.iframe_.contentWindow) {
        dev().fine(TAG, 'media seen');
        this.seen_ = true;
        this.iframe_.contentWindow./*OK*/ postMessage('interaction seen', '*');
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
    this.mediaAttribute_ = /** @type {string} */ (userAssert(
        this.element.getAttribute('data-apester-media-id') ||
        (this.random_ = this.element.hasAttribute(
            'data-apester-channel-token'
        )),
        'Either the data-apester-media-id or the data-apester-channel-token ' +
        'attributes must be specified for <amp-apester-media> %s',
        this.element
    ));
    this.embedOptions_ = {
      playlist: this.random_,
      idOrToken: this.mediaAttribute_,
      inative: this.element.getAttribute('data-apester-inative') === 'true',
      fallback: this.element.getAttribute('data-apester-fallback'),
      distributionChannelId: this.element.getAttribute(
          'data-apester-channel-id'
      ),
      renderer: true,
      tags: extractTags(this.getAmpDoc().getRootNode(), this.element),
    };
  }

  /** @override */
  firstLayoutCompleted() {
    this.viewportCallback(this.isInViewport());
    // Do not hide placeholder
  }

  /**
   * @override
   */
  onLayoutMeasure() {
    if (this.intersectionObserverApi_) {
      this.intersectionObserverApi_.fire();
    }
  }

  /**
   * @return {string}
   **/
  buildUrl_() {
    const {
      idOrToken,
      playlist,
      inative,
      distributionChannelId,
      fallback,
      tags,
    } = this.embedOptions_;
    const encodedMediaAttribute = encodeURIComponent(
        dev().assertString(this.mediaAttribute_)
    );
    let suffix = '';
    const queryParams = dict();
    queryParams['renderer'] = false;
    queryParams['platform'] = getPlatform();
    if (inative) {
      if (idOrToken) {
        suffix = `/inatives/${idOrToken}`;
      } else if (distributionChannelId) {
        suffix = `/channels/${distributionChannelId}/inatives`;
      }
    } else if (playlist && tags) {
      suffix = `/tokens/${encodedMediaAttribute}/interactions/random`;
      queryParams['tags'] = tags;
      queryParams['fallback'] = !!fallback;
    } else if (playlist) {
      suffix = `/tokens/${encodedMediaAttribute}/interactions/random`;
    } else {
      suffix = `/interactions/${encodedMediaAttribute}/display`;
    }
    return addParamsToUrl(`${this.displayBaseUrl_}${suffix}`, queryParams);
  }

  /**
   * @return {!Promise<!JsonObject>}
   **/
  queryMedia_() {
    const url = this.buildUrl_();
    return Services.xhrFor(this.win)
        .fetchJson(url, {
          requireAmpResponseSourceOrigin: false,
        })
        .then(res => {
          if (res.status === 200) {
            return res.json();
          }
          return res;
        });
  }

  /** @param {string} id
   *  @param {boolean} usePlayer
   *  @return {string}
   * */
  constructUrlFromMedia_(id, usePlayer) {
    const queryParams = dict();
    queryParams['channelId'] = this.embedOptions_.distributionChannelId;
    queryParams['type'] = this.embedOptions_.playlist
      ? 'playlist'
      : 'editorial';
    queryParams['platform'] = getPlatform();
    queryParams['cannonicalUrl'] = Services.documentInfoForDoc(
        this.element
    ).canonicalUrl;
    queryParams['sdk'] = 'amp';

    return addParamsToUrl(
        `${this.rendererBaseUrl_}/${usePlayer ? 'v2' : 'interaction'}/`
         + `${encodeURIComponent(id)}`,
        queryParams
    );
  }

  /** @param {string} src
   * @return {!Element}
   */
  constructIframe_(src) {
    const iframe = this.element.ownerDocument.createElement('iframe');
    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('allowtransparency', 'true');
    iframe.setAttribute('scrolling', 'no');
    iframe.src = src;
    iframe.name = this.win.location.href;
    iframe.height = this.height_;
    iframe.width = this.width_;
    iframe.classList.add('amp-apester-iframe');
    this.applyFillContent(iframe);
    return iframe;
  }

  /**
   * @return {!Element}
   */
  constructLoaderImg_() {
    const img = this.element.ownerDocument.createElement('amp-img');
    img.setAttribute('src', this.loaderUrl_);
    img.setAttribute('layout', 'fixed');
    img.setAttribute('width', '100');
    img.setAttribute('height', '100');
    return img;
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

  /**
   * @param {JsonObject} publisher
   */
  report3rdPartyPixel_(publisher) {
    if (publisher && publisher['trackingPixel']) {
      const affiliateId = publisher['trackingPixel']['affiliateId'];
      const publisherId = publisher['publisherId'];
      if (affiliateId) {
        const eventName = 'interactionLoaded';
        const builder = new CustomEventReporterBuilder(this.element);
        builder.track(eventName, generatePixelURL(publisherId, affiliateId));
        const reporter = builder.build();
        reporter.trigger(eventName);
      }
    }
  }

  /** @override */
  layoutCallback() {
    this.element.classList.add('amp-apester-container');
    const vsync = Services.vsyncFor(this.win);
    return this.queryMedia_().then(
        response => {
          if (!response || response['status'] === 204) {
            dev().error(TAG, 'Display', 'No Content for provided tag');
            return this.unlayoutCallback();
          }
          const payload = response['payload'];
          // If it's a playlist we choose a media randomly.
          // The response will be an array.
          const media = /** @type {JsonObject} */ (this.embedOptions_.playlist
            ? payload[Math.floor(Math.random() * payload.length)]
            : payload);

          const interactionId = media['interactionId'];
          const usePlayer = media['usePlayer'];

          const src = this.constructUrlFromMedia_(interactionId, usePlayer);
          const iframe = this.constructIframe_(src);
          this.intersectionObserverApi_ = new IntersectionObserverApi(
              this,
              iframe
          );

          this.mediaId_ = interactionId;
          this.iframe_ = iframe;
          this.registerToApesterEvents_();

          return vsync
              .mutatePromise(() => {
                const overflow = this.constructOverflow_();
                this.element.appendChild(overflow);
                this.element.appendChild(iframe);
              })
              .then(() => {
                return this.loadPromise(iframe).then(() => {
                  return vsync.mutatePromise(() => {
                    if (this.iframe_) {
                      this.iframe_.classList
                          .add('i-amphtml-apester-iframe-ready');
                      if (media['campaignData']) {
                        this.iframe_.contentWindow./*OK*/ postMessage(
                            /** @type {JsonObject} */ ({
                              type: 'campaigns',
                              data: media['campaignData'],
                            }),
                            '*'
                        );
                      }
                    }
                    this.togglePlaceholder(false);
                    this.report3rdPartyPixel_(media['publisher']);
                    this.ready_ = true;
                    let height = 0;
                    if (media && media['data'] && media['data']['size']) {
                      height = media['data']['size']['height'];
                    }
                    if (height != this.height_) {
                      this.height_ = height;
                      if (this.random_) {
                        this./*OK*/ attemptChangeHeight(height);
                      } else {
                        this./*OK*/ changeHeight(height);
                      }
                    }
                  });
                });
              })
              .catch(error => {
                dev().error(TAG, 'Display', error);
                return undefined;
              });
        },
        error => {
          dev().error(TAG, 'Display', error);
          return undefined;
        }
    );
  }

  /** @override */
  createPlaceholderCallback() {
    const placeholder = this.element.ownerDocument.createElement('div');
    const image = this.constructLoaderImg_();
    if (this.element.hasAttribute('aria-label')) {
      placeholder.setAttribute(
          'aria-label',
          'Loading - ' + this.element.getAttribute('aria-label')
      );
    } else {
      placeholder.setAttribute('aria-label', 'Loading Apester Media');
    }
    placeholder.setAttribute('placeholder', '');
    placeholder.className = 'amp-apester-loader';
    setStyles(image, {
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
    });
    placeholder.appendChild(image);
    this.placeholder_ = placeholder;
    return placeholder;
  }

  /** @override */
  unlayoutOnPause() {
    return true;
  }

  /** @override */
  unlayoutCallback() {
    if (this.iframe_) {
      this.intersectionObserverApi_.destroy();
      this.intersectionObserverApi_ = null;
      this.unlisteners_.forEach(unlisten => unlisten());
      removeElement(this.iframe_);
      this.iframe_ = null;
    }
    if (this.placeholder_) {
      removeElement(this.placeholder_);
      this.placeholder_ = null;
    }
    return false;
  }

  /**
   * Registers to apester events.
   * @private
   */
  registerToApesterEvents_() {
    registerEvent(
        apesterEventNames.SET_FULL_SCREEN,
        data => {
        // User clicked full screen button.
          if (this.mediaId_ === data.id) {
            setFullscreenOn(this.element);
          }
        },
        this.win,
        /** @type {!Element}*/ (this.iframe_),
        /** @type {!Array} */ (this.unlisteners_)
    );
    registerEvent(
        apesterEventNames.REMOVE_FULL_SCREEN,
        data => {
        // User clicked close full screen button.
          if (this.mediaId_ === data.id) {
            setFullscreenOff(this.element);
          }
        },
        this.win,
        /** @type {!Element}*/ (this.iframe_),
        /** @type {!Array} */ (this.unlisteners_)
    );
    registerEvent(
        apesterEventNames.RESIZE_UNIT,
        data => {
          if (this.mediaId_ === data.id && data.height) {
            this.attemptChangeHeight(data.height);
          }
        },
        this.win,
        /** @type {!Element}*/ (this.iframe_),
        /** @type {!Array} */ (this.unlisteners_)
    );
  }
}

AMP.extension(TAG, '0.1', AMP => {
  AMP.registerElement(TAG, AmpApesterMedia, CSS);
});
