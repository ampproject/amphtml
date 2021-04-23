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
 * The client settings and placeholder content label should be added as
 * component attributes as seen in the following example:
 * <code>
 * <amp-byside-content
 * 	 data-webcare-id="<<<webcare_id>>>"
 * 	 data-channel="<<<channel>>>"
 * 	 data-lang="<<<lang>>>"
 *   data-label="<<<content_label>>>"
 *   title="Content title"
 *   width="640"
 *   height="480"
 *   layout="responsive">
 * </amp-byside-content>
 * </code>
 */

import {CSS} from '../../../build/amp-byside-content-0.1.css';
import {Services} from '../../../src/services';
import {addParamsToUrl, assertHttpsUrl} from '../../../src/url';
import {createElementWithAttributes, removeElement} from '../../../src/dom';
import {debounce} from '../../../src/core/types/function';
import {dict} from '../../../src/core/types/object';
import {isLayoutSizeDefined} from '../../../src/layout';
import {listenFor} from '../../../src/iframe-helper';
import {setStyles} from '../../../src/style';
import {user, userAssert} from '../../../src/log';

/** @const {string} */
const TAG_ = 'amp-byside-content';

/** @const {string} */
const BYSIDE_DOMAIN_ = 'byside.com';

/** @const {string} */
const DEFAULT_WEBCARE_ZONE_ = 'main';

/** @const {string} */
const MAIN_WEBCARE_ZONE_ = 'main';

/** @const {string} */
const MAIN_WEBCARE_ZONE_SUBDOMAIN_ = 'webcare';

/** @const {string} */
const DEFAULT_LANG_ = 'pt';

/** @type {number}  */
let iframeCount_ = 0;

export class AmpBysideContent extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {Array<Function>} */
    this.unlisteners_ = [];

    /** @private {?string} */
    this.iframeSrc_ = null;

    /** @private {?HTMLIFrameElement} */
    this.iframe_ = null;

    /**
     * @private {?Promise}
     * @visibleForTesting
     */
    this.iframePromise_ = null;

    /** @private {string}  */
    this.webcareZone_ = MAIN_WEBCARE_ZONE_;

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

    /** @const {function()} */
    this.boundUpdateSize_ = debounce(
      this.win,
      (data) => {
        this.updateSize_(/** @type {Object} */ (data));
      },
      100
    );
  }

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  /**
   * @param {boolean=} onLayout
   * @override
   */
  preconnectCallback(onLayout) {
    if (this.origin_) {
      Services.preconnectFor(this.win).url(
        this.getAmpDoc(),
        this.origin_,
        onLayout
      );
    }
  }

  /** @override */
  buildCallback() {
    this.webcareId_ = userAssert(
      this.element.getAttribute('data-webcare-id'),
      'The data-webcare-id attribute is required for <%s> %s',
      TAG_,
      this.element
    );

    this.label_ = userAssert(
      this.element.getAttribute('data-label'),
      'The data-label attribute is required for <%s> %s',
      TAG_,
      this.element
    );

    this.webcareZone_ =
      this.element.getAttribute('data-webcare-zone') || DEFAULT_WEBCARE_ZONE_;
    this.channel_ = this.element.getAttribute('data-channel') || '';
    this.lang_ = this.element.getAttribute('data-lang') || DEFAULT_LANG_;
    this.fid_ = this.element.getAttribute('data-fid') || '';

    this.origin_ = this.composeOrigin_();
    this.baseUrl_ =
      this.origin_ + '/BWA' + encodeURIComponent(this.webcareId_) + '/amp/';
  }

  /** @override */
  createPlaceholderCallback() {
    const placeholder = this.win.document.createElement('div');
    placeholder.setAttribute('placeholder', '');
    placeholder.appendChild(this.createBySideLoader_());

    this.applyFillContent(placeholder);

    return placeholder;
  }

  /** @override */
  layoutCallback() {
    const iframe = this.element.ownerDocument.createElement('iframe');
    this.iframe_ = /** @type {HTMLIFrameElement} */ (iframe);

    iframe.name = 'amp_byside_content_iframe' + iframeCount_++;

    iframe.setAttribute('title', this.element.getAttribute('title') || '');
    iframe.setAttribute('scrolling', 'no');
    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('allowtransparency', 'true');
    iframe.setAttribute('allowfullscreen', 'true');
    iframe.setAttribute(
      'sandbox',
      'allow-scripts allow-same-origin allow-popups'
    );

    setStyles(iframe, {
      'opacity': 0,
    });

    this.element.appendChild(this.getOverflowElement_());
    this.applyFillContent(iframe);

    return this.composeSrcUrl_()
      .then((src) => {
        this.iframeSrc_ = assertHttpsUrl(src, this.element, this.getName_());
        iframe.src = this.iframeSrc_;

        const unlisten = listenFor(iframe, 'embed-size', this.boundUpdateSize_);
        this.unlisteners_.push(unlisten);

        this.element.appendChild(iframe);

        return (this.iframePromise_ = this.loadPromise(iframe));
      })
      .then(() => {
        this.getVsync().mutate(() => {
          setStyles(iframe, {
            'opacity': 1,
          });
        });
      });
  }

  /**
   * @private
   * @return {string}
   */
  composeOrigin_() {
    const subDomain =
      this.webcareZone_ === MAIN_WEBCARE_ZONE_
        ? MAIN_WEBCARE_ZONE_SUBDOMAIN_
        : this.webcareZone_;

    return 'https://' + encodeURIComponent(subDomain) + '.' + BYSIDE_DOMAIN_;
  }

  /**
   * @private
   * @return {*} TODO(#23582): Specify return type
   */
  composeSrcUrl_() {
    const src = this.baseUrl_ + 'placeholder.php';
    const params = dict({
      'label': this.label_,
      'webcare_id': this.webcareId_,
      'bwch': this.channel_ || '',
      'lang': this.lang_ || '',
      'fid': this.fid_ || '',
      'bwit': this.fid_ ? 'I' : 'A',
      'tuid': 'CLIENT_ID(byside_webcare_tuid)',
      'suid': '',
      'puid': 'PAGE_VIEW_IDpTIMESTAMP',
      'referrer': 'DOCUMENT_REFERRER',
      'page': 'SOURCE_URL',
      'amppage': 'AMPDOC_URL',
      'bwpt': 'TITLE',
      'bres': 'VIEWPORT_WIDTHxVIEWPORT_HEIGHT',
      'res': 'SCREEN_WIDTHxSCREEN_HEIGHT',
      'v': 'v20171116a',
      'ampv': 'AMP_VERSION',
      'viewer': 'VIEWER',
      'ua': 'USER_AGENT',
      'r': 'RANDOM',
      '_resize': '1',
    });
    const url = addParamsToUrl(src, params);

    return Services.urlReplacementsForDoc(this.element).expandUrlAsync(url);
  }

  /**
   * @return {string} Returns a string to identify this tag. May not be unique
   * if the element label is not unique.
   * @private
   */
  getName_() {
    let suffix = this.webcareId_ || '';
    suffix += suffix && this.label_ ? ': ' : '';
    suffix += this.label_ || '';

    return 'amp-byside-content: ' + (suffix || '<unknown tag>');
  }

  /**
   * @return {!Element} Returns the overflow element
   * @private
   */
  getOverflowElement_() {
    const doc = /** @type {!Document} */ (this.element.ownerDocument);
    const overflow = createElementWithAttributes(
      doc,
      'div',
      dict({
        'class': 'i-amphtml-byside-content-overflow',
        'overflow': '',
      })
    );
    const overflowContent = createElementWithAttributes(
      doc,
      'div',
      dict({
        'class': 'i-amphtml-byside-content-overflow-content',
      })
    );
    const arrow = createElementWithAttributes(
      doc,
      'div',
      dict({
        'class': 'i-amphtml-byside-content-arrow-down',
      })
    );
    overflowContent.appendChild(arrow);
    overflow.appendChild(overflowContent);

    return overflow;
  }

  /** @return {!Element} @private */
  createBySideLoader_() {
    const doc = /** @type {!Document} */ (this.element.ownerDocument);
    const loadingContainer = createElementWithAttributes(
      doc,
      'div',
      dict({
        'class': 'i-amphtml-byside-content-loading-container',
      })
    );
    const loadingAnimation = createElementWithAttributes(
      doc,
      'div',
      dict({
        'class': 'i-amphtml-byside-content-loading-animation',
      })
    );
    loadingContainer.appendChild(loadingAnimation);

    return loadingContainer;
  }

  /**
   * Updates the element's dimensions to accommodate the iframe's
   *    requested dimensions.
   * @param {Object} data
   * @private
   */
  updateSize_(data) {
    this.getVsync().measure(() => {
      // Calculate new height of the container to include the padding.
      // If padding is negative, just use the requested height directly.
      let newHeight, newWidth;
      const height = parseInt(data['height'], 10);
      if (!isNaN(height)) {
        newHeight = Math.max(
          height +
            (this.element./*OK*/ offsetHeight -
              this.iframe_./*OK*/ offsetHeight),
          height
        );
      }

      const width = parseInt(data['width'], 10);
      if (!isNaN(width)) {
        newWidth = Math.max(
          width +
            (this.element./*OK*/ offsetWidth - this.iframe_./*OK*/ offsetWidth),
          width
        );
      }

      if (newHeight !== undefined || newWidth !== undefined) {
        this.attemptChangeSize(newHeight, newWidth).then(
          () => {
            if (newHeight !== undefined) {
              this.element.setAttribute('height', newHeight);
            }
            if (newWidth !== undefined) {
              this.element.setAttribute('width', newWidth);
            }
          },
          () => {}
        );
      } else {
        user().warn(
          TAG_,
          'Ignoring embed-size request because ' +
            'no width or height value is provided',
          this.element
        );
      }
    });
  }

  /** @override */
  unlayoutCallback() {
    this.unlisteners_.forEach((unlisten) => unlisten());
    this.unlisteners_.length = 0;

    if (this.iframe_) {
      removeElement(this.iframe_);
      this.iframe_ = null;
      this.iframePromise_ = null;
    }
    return true; // Call layoutCallback again.
  }
}

AMP.extension('amp-byside-content', '0.1', (AMP) => {
  AMP.registerElement('amp-byside-content', AmpBysideContent, CSS);
});
