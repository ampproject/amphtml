/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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
import {addParamToUrl, addParamsToUrl} from '../../../src/url';
import {createElementWithAttributes, removeElement} from '../../../src/dom';
import {getStyle, setStyle} from '../../../src/style';
import {isLayoutSizeDefined} from '../../../src/layout';
import {userAssert} from '../../../src/log';

/** @const {string} */
export const TAG = 'amp-iframely';

/**
 * Finds an iFrame that sent a message by its contentWindow.
 * @param {array} iframes - narrowed set of iFrames to search in
 * @param {document.window} contentWindow - source of a received message
 * @return {iframe} the matched iFrame
 * */
function findIframeByContentWindow(iframes, contentWindow) {
  let selectedIframe = false;
  for (let i = 0; i < iframes.length && !selectedIframe; i++) {
    const iframe = iframes[i];
    if (iframe.contentWindow === contentWindow) {
      selectedIframe = iframe;
    }
  }
  return selectedIframe;
}

/**
 * Implementation of the amp-iframely component.
 *
 * See {@link ../amp-iframely.md} for the spec.
 */
export class AmpIframely extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /**
     * Address of Iframely media (3rd party rich media or a summary card for the URL).
     * @private {string}
     */
    this.src_ = null;

    /**
     * The main iFrame element that loads Iframely media.
     * @private {?Element}
     */
    this.iframe_ = null;

    /**
     * ID of Iframely content, if available
     * @private {?string}
     */
    this.widgetId_ = null;

    /**
     * Domain of Iframely CDN
     * @private {?string}
     */
    this.base_ = null;

    /**
     * Alternatively, identify with Iframely CDN via `url` and `key` hash params
     * @private {?string}
     */
    this.url_ = null;
    /** @private {?string} */
    this.key_ = null;

    /**
     * other data- options that will be passed into iFrame src
     * @private {?Object}
     * */
    this.options_ = null;
  }

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  /** @override */
  buildCallback() {
    /** Populating parameters once */
    this.widgetId_ = this.element.getAttribute('data-id');
    this.url_ = this.element.getAttribute('data-url');
    this.key_ = this.element.getAttribute('data-key');
    this.options_ = this.parseOptions_();
    let domain = 'cdn.iframe.ly';
    const requestedDomain = this.element.getAttribute('data-domain');
    if (requestedDomain && this.isValidDomain_(requestedDomain)) {
      domain = requestedDomain;
    }
    this.base_ = `https://${domain}/`;
    this.parseAttributes_();
    setStyle(this.element, 'box-sizing', 'border-box');
  }

  /**
   * @param {boolean=} opt_onLayout
   * @override
   */
  preconnectCallback(opt_onLayout) {
    if (this.preconnect && this.preconnect.url_) {
      this.preconnect.url(this.base_, opt_onLayout);
    }
  }

  /** @override */
  createPlaceholderCallback() {
    /**
     * Building placeholder for responsive layout without resizing
     * or when requested via `data-img` attribute
     */
    const layout = this.getLayout();
    const resizable = this.element.getAttribute('resizable') !== null;
    const isImg = this.element.getAttribute('data-img') !== null;

    if (isImg || (layout === 'responsive' && !resizable)) {
      /** using Iframely placeholder image */
      let src = this.constructPlaceholderSrc_();
      src = addParamsToUrl(src, this.options_);
      return createElementWithAttributes(
        this.element.ownerDocument,
        'amp-img',
        {
          'src': src,
          'layout': 'fill',
          'placeholder': '',
        }
      );
    } else {
      return null;
    }
  }

  /** @override */
  layoutCallback() {
    /** attach iFrame */
    const me = this;
    this.iframe_ = this.element.ownerDocument.createElement('iframe');
    setStyle(this.iframe_, 'border', '0');
    this.iframe_.setAttribute(
      'allow',
      'encrypted-media *; accelerometer *; gyroscope *; picture-in-picture *; camera *; microphone *;'
    );
    this.iframe_.setAttribute(
      'sandbox',
      'allow-scripts allow-same-origin allow-popups allow-forms allow-presentation'
    );
    this.src_ = addParamsToUrl(this.src_, this.options_);
    this.iframe_.src = this.src_;
    this.applyFillContent(this.iframe_);
    this.element.appendChild(this.iframe_);

    /**
     * Handling Iframely messages
     * @param {window.event.source} event - event to check
     * */
    function receiveMessage(event) {
      const iframes = me.element.getElementsByTagName('iframe');
      if (findIframeByContentWindow(iframes, event.source)) {
        me.handleEvent(me, event);
      }
    }
    window.addEventListener('message', receiveMessage, false);
    return this.loadPromise(this.iframe_);
  }

  /**
   * Handles Iframely events: widget sizing, cancel, decorate cards
   * @param {AmpIframely} me - instance of an active component
   * @param {window.event} event - Iframely message with a method to apply
   * */
  handleEvent(me, event) {
    let data = null;
    try {
      data = JSON.parse(event.data);
    } catch (e) {
      // Do nothing - likely not Iframely message if JSON errs
    }
    if (data) {
      if (data.method === 'resize') {
        /** Set the size of the card according to the message from Iframely */
        const height = this.addBorderHeight_(me, data['height']);
        me.attemptChangeHeight(height).catch(() => {});
      }
      if (data.method === 'setIframelyEmbedData') {
        /** apply Iframely card styles if present */
        const media = data['data']['media'] || null;
        if (media && media['frame_style']) {
          const styles = media['frame_style'].split(';');
          styles.forEach(function(style) {
            const props = style.split(':');
            if (props.length === 2) {
              const styleName = props[0].trim(),
                styleValue = props[1].trim();
              switch (styleName) {
                case 'border':
                  /** Because of the border-box sizing, changing border width doesn't change the size of the box. */
                  setStyle(me.element, 'border', styleValue);
                  /** Because Iframely sends border message before even building card's content, no change of iFrame's height is necessary here. */
                  break;
                case 'border-radius':
                  setStyle(me.element, 'border-radius', styleValue);
                  break;
                case 'box-shadow':
                  setStyle(me.element, 'box-shadow', styleValue);
                  break;
              }
            }
          });
        }
        if (media && media['aspect-ratio']) {
          let height;
          const box = me.element.getLayoutBox();
          if (media['padding-bottom']) {
            /** Apply height for media with updated "aspect-ratio" and "padding-bottom". */
            height =
              box.width / media['aspect-ratio'] + media['padding-bottom'];
            height = this.addBorderHeight_(me, height);
            me.attemptChangeHeight(height).catch(() => {});
          } else {
            height = box.width / media['aspect-ratio'];
            if (Math.abs(box.height - height) > 1) {
              /** Apply new height for updated "aspect-ratio". */
              height = this.addBorderHeight_(me, height);
              me.attemptChangeHeight(height).catch(() => {});
            }
          }
        }
      }
      if (data.method === 'cancelWidget') {
        me.attemptCollapse().catch(() => {
          if (me.iframe_) {
            removeElement(me.iframe_);
          }
        });
      }
    }
  }

  /**
   * Constructing placeholder image SRC
   * @return {string} url of the placeholder
   * @private
   * */
  constructPlaceholderSrc_() {
    let src = null;
    if (this.widgetId_) {
      const url = this.base_ + this.widgetId_ + '/thumbnail';
      src = addParamToUrl(url, 'amp', '1');
    } else {
      src = addParamsToUrl(this.base_ + 'api/thumbnail', {
        'url': this.url_,
        'key': this.key_,
        'amp': '1',
      });
    }
    return src;
  }

  /**
   * Test component call for required params
   * @return {null}
   * @private
   * */
  parseAttributes_() {
    userAssert(
      this.element.getAttribute('data-id') ||
      this.element.getAttribute('data-url'),
      'Iframely requires either "data-id" or a pair of "data-url" and "data-key" parameters for <%s> %s',
      TAG,
      this.element
    );
    if (!this.widgetId_) {
      if (this.url_) {
        userAssert(
          this.key_,
          'Iframely data-key must also be set when you specify data-url parameter at <%s> %s',
          TAG,
          this.element
        );
      }
      if (this.key_) {
        userAssert(
          this.url_,
          'Iframely data-url must also be set when you specify data-key parameter at <%s> %s',
          TAG,
          this.element
        );
        userAssert(
          16 < this.key_.length || this.key_.length > 256,
          'Iframely data-key should be between 16 and 256 characters parameter at <%s> %s',
          TAG,
          this.element
        );
      }
      if (this.key_ || this.url_) {
        userAssert(
          !this.widgetId_,
          'Iframely data-id should not be set when there is already a pair of data-url and data-key for <%s> %s',
          TAG,
          this.element
        );
      }
    }
    if ((this.widgetId_ && this.url_) || (this.widgetId_ && this.key_)) {
      userAssert(
        !this.widgetId_,
        'Only one way of setting either data-id or data-url and data-key supported for <%s> %s',
        TAG,
        this.element
      );
    }
    if (this.widgetId_) {
      this.src_ = addParamToUrl(this.base_ + this.widgetId_, 'amp', '1');
    } else {
      this.src_ = addParamsToUrl(this.base_ + 'api/iframe', {
        'url': this.url_,
        'key': this.key_,
        'amp': '1',
      });
    }
  }

  /**
   * Parse other data-* attributes and append them to API query url
   * @return {object} of Iframely options
   * @private
   * */
  parseOptions_() {
    const options = {};
    const exclude = [
      'data-id',
      'data-domain',
      'data-key',
      'data-url',
      'data-img',
    ];
    let data = this.element
      .getAttributeNames()
      .filter(name => name.startsWith('data-'));
    data = data.filter(name => !exclude.includes(name));
    data.forEach(
      item =>
        (options[item.split('data-').pop()] = this.element.getAttribute(item))
    );
    return options;
  }

  /** @override */
  unlayoutCallback() {
    if (this.iframe_) {
      removeElement(this.iframe_);
      this.iframe_ = null;
    }
    return true; // Request layoutCallback again.
  }

  /**
   * Validates that requested domain is a valid Iframely domain
   * @param {string} domainName - of domain to check against a whitelist
   * @return {boolean} if domain is valid
   * @private
   * */
  isValidDomain_(domainName) {
    const whitelistedDomains = [
      /^(?:[^\.\/]+\.)?iframe\.ly$/i,
      /^if\-cdn\.com$/i,
      /^iframely\.net$/i,
      /^oembed\.vice\.com$/i,
      /^iframe\.nbcnews\.com$/i,
    ];
    for (const i in whitelistedDomains) {
      if (whitelistedDomains[i].test(domainName)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Adds border height, if any, to a given internal iFrame height value.
   * @param {AmpIframely} me - component instance in the current state
   * @param {string} currentHeight - required internal height value
   * @return {number} height value
   * @private
   * */
  addBorderHeight_(me, currentHeight) {
    const borderValue = getStyle(me.element, 'border');
    if (borderValue) {
      let borderWidth = borderValue.match(/(\d+)px/) || 0;
      if (borderWidth) {
        borderWidth = parseInt(borderWidth[1], 10);
        borderWidth = borderWidth * 2;
      }
      return currentHeight + borderWidth;
    } else {
      return currentHeight;
    }
  }
}

AMP.extension(TAG, '0.1', AMP => {
  AMP.registerElement(TAG, AmpIframely);
});
