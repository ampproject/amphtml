/**
 * Copyright 2021 The AMP HTML Authors. All Rights Reserved.
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
import {addParamsToUrl} from '../../../src/url';
import {createElementWithAttributes, removeElement} from '../../../src/dom';
import {getData, listen} from '../../../src/event-helper';
import {getStyle, setStyle} from '../../../src/style';
import {isLayoutSizeDefined} from '../../../src/layout';
import {omit} from '../../../src/utils/object';
import {tryParseJson} from '../../../src/json';
import {userAssert} from '../../../src/log';

/** @const {string} */
export const TAG = 'amp-iframely';

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
    this.border_ = this.element.getAttribute('data-border');
    let domain = 'cdn.iframe.ly';
    const requestedDomain = this.element.getAttribute('data-domain');
    if (requestedDomain && this.isValidDomain_(requestedDomain)) {
      domain = requestedDomain;
    }
    this.base_ = `https://${domain}/`;
    this.parseAttributes_();
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
    if (
      this.element.hasAttribute('data-img') ||
      (layout === 'responsive' && !this.element.hasAttribute('resizable'))
    ) {
      /** using Iframely placeholder image */
      const src = addParamsToUrl(
        this.constructSrc_('/thumbnail'),
        this.options_
      );
      return createElementWithAttributes(this.element.ownerDocument, 'img', {
        'src': src,
        'placeholder': '',
      });
    }
    return null;
  }

  /** @override */
  layoutCallback() {
    /** attach iFrame */
    this.iframe_ = this.element.ownerDocument.createElement('iframe');
    if (this.border_) {
      setStyle(this.iframe_, 'box-sizing', 'border-box');
      setStyle(this.iframe_, 'border', this.border_ + 'px');
    } else {
      setStyle(this.iframe_, 'border', '0px');
    }
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

    this.unlistener_ = listen(this.win, 'message', event => {
      if (event.source === this.iframe_.contentWindow) {
        this.handleEvent_(this, event, this.iframe_);
      }
    });
    return this.loadPromise(this.iframe_);
  }

  /**
   * Handles Iframely events: widget sizing, cancel, decorate cards
   * @param {AmpIframely} me - instance of an active component
   * @param {window.event} event - Iframely message with a method to apply
   * @param {iframe} iframe - instance of an active iframe
   * */
  handleEvent_(me, event, iframe) {
    const data = tryParseJson(getData(event));
    if (!data) {
      return;
    }
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
                setStyle(
                  iframe,
                  'border',
                  /** But change color only, do not let to override the border width */
                  styleValue.replace(/\d+px\s/, `${me.border_}px `)
                );
                break;
              case 'border-radius':
                setStyle(iframe, 'border-radius', styleValue);
                break;
              case 'box-shadow':
                setStyle(iframe, 'box-shadow', styleValue);
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
          height = box.width / media['aspect-ratio'] + media['padding-bottom'];
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
      me.attemptCollapse().catch(() => {});
    }
  }

  /**
   * Constructing url SRC for api calls
   * @param {boolean} slug src or iframe src in case false
   * @return {string} url of the placeholder
   * @private
   * */
  constructSrc_(slug) {
    if (this.widgetId_) {
      return `${this.base_}${this.widgetId_}${
        slug !== '/iframe' ? slug : ''
      }?amp=1`;
    } else {
      return addParamsToUrl(`${this.base_}api${slug}`, {
        'url': this.url_,
        'key': this.key_,
        'amp': '1',
      });
    }
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
      '<%s> requires either "data-id" or a pair of "data-url" and "data-key" attributes for %s',
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
    this.src_ = this.constructSrc_('/iframe');
  }

  /**
   * Parse other data-* attributes and append them to API query url
   * @return {object} of Iframely options
   * @private
   * */
  parseOptions_() {
    return omit(this.element.dataset, [
      'id',
      'domain',
      'key',
      'url',
      'img',
      'border',
    ]);
  }

  /** @override */
  unlayoutCallback() {
    if (this.iframe_) {
      removeElement(this.iframe_);
      this.iframe_ = null;
    }
    if (this.unlisten_) {
      this.unlisten_();
      this.unlisten_ = null;
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
    const allowedDomains = [
      /^(?:[^\.\/]+\.)?iframe\.ly$/i,
      /^if\-cdn\.com$/i,
      /^iframely\.net$/i,
      /^oembed\.vice\.com$/i,
      /^iframe\.nbcnews\.com$/i,
    ];
    return allowedDomains.reduce(
      (allowed, re) => allowed || re.test(domainName),
      false
    );
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
