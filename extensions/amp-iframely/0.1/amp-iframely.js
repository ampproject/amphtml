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
import {createElementWithAttributes, removeElement} from '../../../src/dom';
import {isLayoutSizeDefined} from '../../../src/layout';
import {setStyle, toggle} from '../../../src/style';
import {userAssert} from '../../../src/log';

/** @const {string} */
export const TAG = 'amp-iframely';
const DOMAIN = 'cdn.iframe.ly';

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

    this.src_ = null;

    /**
     * The main Iframely iframe element.
     * @private {?Element}
     */
    this.iframely_ = null;

    /** ID of Iframely content, if available */
    this.id = null;

    /** Domain of Iframely CDN */
    this.base = null;

    /** Alternatively, identify with Iframely CDN via `url` and `key` hash params */
    this.url = null;
    this.key = null;

    /** hardcoded allow attribute for iframe */
    this.allow_ =
      'encrypted-media *; accelerometer *; gyroscope *; picture-in-picture *; camera *; microphone *; autoplay *;';

    /** other data- options that will be passed into iFrame src*/
    this.options_ = null;
  }

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  /** @override */
  buildCallback() {
    /** Populating parameters once */
    this.id = this.element.getAttribute('data-id');
    this.url = this.element.getAttribute('data-url');
    this.key = this.element.getAttribute('data-key');
    this.options_ = this.parseOptions();
    const domain = this.element.getAttribute('data-domain') || DOMAIN;
    this.base = `https://${domain
      .replace(/^(https?:)?\/\//g, '')
      .replace(/\/.*$/i, '')}/`;
    this.parseAttributes();
  }

  /**
   * @param {boolean=} opt_onLayout
   * @override
   */
  preconnectCallback(opt_onLayout) {
    this.preconnect.url(this.base, opt_onLayout);
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
      /** using iframely placeholder image */
      let src = this.constructPlaceholderSrc();
      src += this.appendOptions();
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
    /** attach amp-iframe */
    const me = this;
    const iframely = this.element.ownerDocument.createElement('iframe');
    setStyle(iframely, 'border', '0');
    iframely.setAttribute('allow', this.allow_);
    this.src_ += this.appendOptions();
    iframely.src = this.src_;
    this.applyFillContent(iframely);
    this.element.appendChild(iframely);

    /**
     * Handling Iframely messages
     * @param {window.event.source} event - event to check iframely against
     * */
    function receiveMessage(event) {
      const iframes = me.element.getElementsByTagName('iframe');
      if (findIframeByContentWindow(iframes, event.source)) {
        me.handleEvent(me, event);
      }
    }
    window.addEventListener('message', receiveMessage, false);
    this.iframely_ = iframely;
    return this.loadPromise(iframely);
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
        me./*OK*/ changeHeight(data['height']);
      }
      if (data.method === 'setIframelyEmbedData') {
        /** apply Iframely card styles if present */
        const media = data.data.media || null;
        if (media && media.frame_style) {
          const styles = media.frame_style.split(';');
          const styleSetter = {
            'border': function(styleValue) {
              setStyle(me.element, 'border', styleValue);
            },
            'border-radius': function(styleValue) {
              setStyle(me.element, 'border-radius', styleValue);
            },
            'box-shadow': function(styleValue) {
              setStyle(me.element, 'box-shadow', styleValue);
            },
          };
          styles.forEach(function(style) {
            const styleProp = style.split(':')[0];
            const styleValue = style.split(':')[1];
            const whitelistedStyle = styleSetter[styleProp];
            if (whitelistedStyle) {
              whitelistedStyle(styleValue);
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
            me./*OK*/ changeHeight(height);
          } else {
            height = box.width / media['aspect-ratio'];
            if (Math.abs(box.height - height) > 1) {
              /** Apply new height for updated "aspect-ratio". */
              me./*OK*/ changeHeight(height);
            }
          }
        }
      }
      if (data.method === 'cancelWidget') {
        toggle(me.element, false);
      }
    }
  }

  /**
   * Constructing placeholder image SRC
   * @return {string} url of the placeholder
   * */
  constructPlaceholderSrc() {
    let src = null;
    if (this.id) {
      const id = encodeURIComponent(this.id);
      src = `${this.base}${id}/thumbnail?amp=1`;
    } else {
      const url = encodeURIComponent(this.url);
      src = `${this.base}api/thumbnail?url=${url}&key=${this.key}&amp=1`;
    }
    return src;
  }

  /**
   * Test component call for required params
   * @return {null}
   * */
  parseAttributes() {
    userAssert(
      this.element.getAttribute('data-id') ||
        this.element.getAttribute('data-url'),
      'Iframely requires either "data-id" or a pair of "data-url" and "data-key" parameters for <%s> %s',
      TAG,
      this.element
    );
    if (!this.id) {
      if (this.url) {
        userAssert(
          this.key,
          'Iframely data-key must also be set when you specify data-url parameter at <%s> %s',
          TAG,
          this.element
        );
      }
      if (this.key) {
        userAssert(
          this.url,
          'Iframely data-url must also be set when you specify data-key parameter at <%s> %s',
          TAG,
          this.element
        );
        userAssert(
          16 < this.key.length || this.key.length > 256,
          'Iframely data-key should be between 16 and 256 characters parameter at <%s> %s',
          TAG,
          this.element
        );
      }
      if (this.key || this.url) {
        userAssert(
          !this.id,
          'Iframely data-id should not be set when there is already a pair of data-url and data-key for <%s> %s',
          TAG,
          this.element
        );
      }
    }
    if ((this.id && this.url) || (this.id && this.key)) {
      userAssert(
        !this.id,
        'Only one way of setting either data-id or data-url and data-key supported for <%s> %s',
        TAG,
        this.element
      );
    }
    if (this.id) {
      this.src_ = `${this.base}${this.id}?amp=1`;
    } else {
      const url = encodeURIComponent(this.url);
      this.src_ = `${this.base}api/iframe?url=${url}&key=${this.key}&amp=1`;
    }
  }

  /**
   * Parse other data-* attributes and append them to API query url
   * @return {object} of iframely options
   * */
  parseOptions() {
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

  /**
   * Pass other options into URL query string if present
   * @return {string} string of encoded iframely options to append to query url
   * */
  appendOptions() {
    let str = '';
    if (this.options_) {
      for (const key in this.options_) {
        const value = encodeURIComponent(this.options_[key]);
        str += `&${key}=${value}`;
      }
    }
    return str;
  }

  /** @override */
  unlayoutCallback() {
    if (this.iframely_) {
      removeElement(this.iframely_);
      this.iframely_ = null;
    }
    return true; // Call layoutCallback again.
  }
}

AMP.extension(TAG, '0.1', AMP => {
  AMP.registerElement(TAG, AmpIframely);
});
