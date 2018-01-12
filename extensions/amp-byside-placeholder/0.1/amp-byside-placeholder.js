/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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

/**
 * @fileoverview Displays BySide placeholder content.
 * The client settings and placeholder label should be added as component
 * attributes as seen in the following example:
 * <code>
 * <amp-byside-placeholder
 * 	 data-webcare-id="<<<webcare_id>>>"
 * 	 data-channel="<<<channel>>>"
 * 	 data-lang="<<<lang>>>"
 *   data-label="<<<placeholder_label>>>"
 *   alt="Content title"
 *   width="320"
 *   height="392"
 *   layout="fixed">
 * </amp-instagram>
 * </code>
 */

import {isLayoutSizeDefined} from '../../../src/layout';
import {user} from '../../../src/log';
import {setStyles} from '../../../src/style';
import {removeElement} from '../../../src/dom';
import {Services} from '../../../src/services';
import {addParamsToUrl} from '../../../src/url';
import {listenFor} from '../../../src/iframe-helper';
import {dict} from '../../../src/utils/object';

/** @const {string} */
const TAG_ = 'amp-byside-placeholder';

/** @const {string} */
const DEFAULT_AGENT_DOMAIN_ = 'webcare';

/** @const {string} */
const DEFAULT_LANG_ = 'pt';

/** @const {string} */
const DEFAULT_IFRAME_WIDTH_ = '400';

/** @const {string} */
const DEFAULT_IFRAME_HEIGHT_ = '400';

/** @type {number}  */
let iframeCount_ = 0;

export class AmpBysidePlaceholder extends AMP.BaseElement {

  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {?string} */
    this.iframeSrc_ = null;

    /** @private {?Element} */
    this.iframe_ = null;

    /** @private {?Promise} */
    this.iframePromise_ = null;

    /** @private {string}  */
    this.agentDomain_ = 'webcare';

    /** @private {boolean} */
    this.isResizable_ = false;

    /** @private {string}  */
    this.webcareId_ = '';

    /** @private {string}  */
    this.channel_ = '';

    /** @private {string}  */
    this.lang_ = '';

    /** @private {string}  */
    this.fid_ = '';

    /** @private {string}  */
    this.label_ = '';

    /** @private {string}  */
    this.origin_ = '';

    /** @private {string}  */
    this.baseUrl_ = '';
  }

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  /** @override */
  renderOutsideViewport() {
    return false;
  }

  /**
   * @param {boolean=} onLayout
   * @override
   */
  preconnectCallback(onLayout) {
    if (this.iframeSrc_) {
      this.preconnect.url(this.iframeSrc_, onLayout);
    }
  }

  /** @override */
  buildCallback() {
    // Get attributes, assertions of values, assign instance variables.
    // Build lightweight DOM and append to this.element.

    this.agentDomain_ = (this.element.getAttribute('data-agentDomain') ||
            this.element.getAttribute('agentDomain') ||
            DEFAULT_AGENT_DOMAIN_);
    this.isResizable_ = this.element.hasAttribute('resizable');

    this.webcareId_ = user().assert(
        (this.element.getAttribute('data-webcare-id') ||
        this.element.getAttribute('webcare-id')),
        'The data-webcare-id attribute is required for <' + TAG_ + '> %s',
        this.element);

    this.label_ = user().assert(
        (this.element.getAttribute('data-label') ||
        this.element.getAttribute('label')),
        'The data-label attribute is required for <' + TAG_ + '> %s',
        this.element);

    this.channel_ = (this.element.getAttribute('data-channel') ||
        this.element.getAttribute('channel') || '');
    this.lang_ = (this.element.getAttribute('data-lang') ||
            this.element.getAttribute('lang') || DEFAULT_LANG_);
    this.fid_ = (this.element.getAttribute('data-fid') ||
            this.element.getAttribute('fid') || '');

    this.origin_ = this.generateOrigin_();
    this.baseUrl_ = this.origin_ + '/BWA' + this.webcareId_ + '/amp/';

    if (this.isResizable_) {
      this.element.setAttribute('scrolling', 'no');
    }

    if (!this.element.hasAttribute('frameborder')) {
      this.element.setAttribute('frameborder', '0');
    }
  }

  /** @override */
  createPlaceholderCallback() {
    const placeholder = this.win.document.createElement('div');
    placeholder.setAttribute('placeholder', '');
    const image = this.win.document.createElement('amp-img');
    image.setAttribute('noprerender', '');
    image.setAttribute('layout', 'fill');
    image.setAttribute('referrerpolicy', 'origin');

    this.propagateAttributes(['alt'], image);

    // Use custom placeholder or use default transparent placeholder image
    const placeholderImg = this.element.getAttribute('placeholder') ||
      this.baseUrl_ + 'images/placeholder.png';
    image.setAttribute('src', placeholderImg);

    placeholder.appendChild(image);
    return placeholder;
  }

  /** @override */
  layoutCallback() {
    const iframe = this.element.ownerDocument.createElement('iframe');
    this.iframe_ = iframe;

    const width = this.element.getAttribute('width') || DEFAULT_IFRAME_WIDTH_;
    const height = this.element.getAttribute('height') ||
        DEFAULT_IFRAME_HEIGHT_;

    iframe.name = 'amp_byside_placeholder_iframe' + iframeCount_++;
    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('allowtransparency', 'true');
    iframe.setAttribute('title', this.element.getAttribute('alt') || '');

    if (this.element.hasAttribute('width')) {
      iframe.setAttribute('width', width);
    }
    if (this.element.hasAttribute('height')) {
      iframe.setAttribute('height', height);
    }

    setStyles(iframe, {
      'opacity': 0,
    });

    const self = this;

    return this.generateSrcUrl_().then(src => {
      this.iframeSrc_ = src;
      iframe.src = this.iframeSrc_;

      listenFor(iframe, 'embed-size', data => {
        this.updateSize_(data['height'], data['width']);
      });

      this.applyFillContent(iframe);
      this.element.appendChild(iframe);
    }).then(() => {
      this.iframePromise_ = this.loadPromise(iframe).then(() => {
        this.getVsync().mutate(() => {
          setStyles(iframe, {
            'opacity': 1,
            'width': width + 'px',
            'height': height + 'px',
          });
        });
      });
    }).then(() => self);
  }

  /** @private */
  generateOrigin_() {
    const domain = this.agentDomain_ === 'main' ? 'webcare' : this.agentDomain_;
    return 'https://' + domain + '.byside.com';
  }

  /** @private */
  generateSrcUrl_() {
    const src = this.baseUrl_ + 'placeholder.php';
    const params = dict();

    params['label'] = this.label_;
    params['webcare_id'] = this.webcareId_;
    params['bwch'] = this.channel_ || '';
    params['lang'] = this.lang_ || '';
    params['fid'] = this.fid_ || '';
    params['bwit'] = (this.fid_ ? 'I' : 'A');
    params['tuid'] = 'CLIENT_ID(byside_webcare_tuid)';
    params['suid'] = '';
    params['puid'] = 'PAGE_VIEW_IDpTIMESTAMP';
    params['referrer'] = 'DOCUMENT_REFERRER';
    params['page'] = 'SOURCE_URL';
    params['amppage'] = 'AMPDOC_URL';
    params['bwpt'] = 'TITLE';
    params['bres'] = 'VIEWPORT_WIDTHxVIEWPORT_HEIGHT';
    params['res'] = 'SCREEN_WIDTHxSCREEN_HEIGHT';
    params['v'] = 'v20171116a';
    params['ampv'] = 'AMP_VERSION';
    params['viewer'] = 'VIEWER';
    params['ua'] = 'USER_AGENT';
    params['r'] = 'RANDOM';

    if (this.isResizable_) {
      params['_resize'] = 1;
    }

    return Services.urlReplacementsForDoc(this.element)
        .expandAsync(addParamsToUrl(src, params));
  }

  /**
   * Updates the element's dimensions to accommodate the iframe's
   *    requested dimensions.
   * @param {number|undefined} height
   * @param {number|undefined} width
   * @private
   */
  updateSize_(height, width) {
    if (!this.isResizable_) {
      this.user().error(TAG_,
          'Ignoring embed-size request because this iframe is not resizable',
          this.element);
      return;
    }

    // Calculate new width and height of the container to include the padding.
    // If padding is negative, just use the requested width and height directly.
    let newHeight, newWidth;
    height = parseInt(height, 10);
    if (!isNaN(height)) {
      newHeight = Math.max(
          height + (this.element./*OK*/offsetHeight
              - this.iframe_./*OK*/offsetHeight),
          height);
    }
    width = parseInt(width, 10);
    if (!isNaN(width)) {
      newWidth = Math.max(
          width + (this.element./*OK*/offsetWidth
              - this.iframe_./*OK*/offsetWidth),
          width);
    }

    if (newHeight !== undefined || newWidth !== undefined) {
      // Force change size as requested
      this.element.getResources()./*OK*/changeSize(
		  this.element, newHeight, newWidth, () => {
            if (newHeight !== undefined) {
              this.element.setAttribute('height', newHeight);
            }
            if (newWidth !== undefined) {
              this.element.setAttribute('width', newWidth);
            }
          }
      );
    } else {
      this.user().error(TAG_,
          'Ignoring embed-size request because '
          + 'no width or height value is provided',
          this.element);
    }
  }

  /** @override */
  unlayoutCallback() {
    if (this.iframe_) {
      removeElement(this.iframe_);
      this.iframe_ = null;
      this.iframePromise_ = null;
    }
    return true; // Call layoutCallback again.
  }
}

AMP.extension('amp-byside-placeholder', '0.1', AMP => {
  AMP.registerElement('amp-byside-placeholder', AmpBysidePlaceholder);
});
