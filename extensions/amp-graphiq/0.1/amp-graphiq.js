/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
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
 * @fileoverview Embeds a Graphiq embed.
 * URL.
 * Example:
 * <code>
 * <amp-graphiq
 *   data-widget-id="ekkg7oSEwYZ"
 *   width="320"
 *   height="392"
 *   data-href="https://www.graphiq.com/vlp/ekkg7oSEwYZ">
 * </amp-graphiq>
 * </code>
 */

import {isLayoutSizeDefined} from '../../../src/layout';
import {setStyles} from '../../../src/style';
import {removeElement} from '../../../src/dom';
import {user} from '../../../src/log';
import {tryParseJson} from '../../../src/json';
import {isObject} from '../../../src/types';
import {listen} from '../../../src/event-helper';

class AmpGraphiq extends AMP.BaseElement {

  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {?Element} */
    this.iframe_ = null;

    /** @private {?Promise} */
    this.iframePromise_ = null;

    /** @private {!string} */
    this.widgetId_ = '';

    /** @private {!string} */
    this.href_ = '';

    /** @private {!string} */
    this.initialHeight_ = '';

    /** @private {!string} */
    this.initialWidth_ = '';

    /** @private {?Function} */
    this.unlistenMessage_ = null;
  }
 /**
  * @param {boolean=} opt_onLayout
  * @override
  */
  preconnectCallback(opt_onLayout) {
    this.preconnect.url('https://w.graphiq.com', opt_onLayout);
  }

  /** @override */
  renderOutsideViewport() {
    return false;
  }

  /** @override */
  buildCallback() {
    this.widgetId_ = user().assert(
        this.element.getAttribute('data-widget-id'),
        'The data-widget-id attribute is required for <amp-graphiq> %s',
        this.element);
    this.href_ = this.element.getAttribute('data-href') ||
        'https://www.graphiq.com/vlp/' + this.widgetId_;
    this.initialHeight_ = this.element.getAttribute('height');
    this.initialWidth_ = this.element.getAttribute('width');
  }

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  /** @override */
  layoutCallback() {
    const iframe = this.element.ownerDocument.createElement('iframe');
    this.iframe_ = iframe;

    this.unlistenMessage_ = listen(
      this.win,
      'message',
      this.handleGraphiqMessages_.bind(this)
    );

    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('allowtransparency', 'true');
    //Add title to the iframe for better accessibility.
    iframe.setAttribute('title', 'Graphiq: ' +
        this.element.getAttribute('alt') || '');
    if (this.initialHeight_) {
      iframe.setAttribute('height', this.initialHeight_);
    }
    if (this.initialWidth_) {
      iframe.setAttribute('width', this.initialWidth_);
    }
    iframe.src = 'https://w.graphiq.com/w/' + this.widgetId_ +
        '?data-width=' + encodeURIComponent(this.initialWidth_) +
        '&data-height=' + encodeURIComponent(this.initialHeight_) +
        '&data-href=' + encodeURIComponent(this.href_);

    this.applyFillContent(iframe);
    this.element.appendChild(iframe);
    setStyles(iframe, {
      'opacity': 0,
    });
    return this.iframePromise_ = this.loadPromise(iframe).then(() => {
      this.getVsync().mutate(() => {
        setStyles(iframe, {
          'opacity': 1,
        });
      });
    });
  }

  /** @private */
  handleGraphiqMessages_(event) {
    if (event.origin != 'https://w.graphiq.com' ||
        event.source != this.iframe_.contentWindow) {
      return;
    }
    if (!event.data ||
        !(isObject(event.data) || event.data.indexOf('{') == 0)) {
      return;  // Doesn't look like JSON.
    }
    const data = isObject(event.data) ? event.data : tryParseJson(event.data);
    if (data === undefined) {
      return; // We only process valid JSON.
    }
    if (data.method == 'resize') {
      const height = data.height;
      this.getVsync().measure(() => {
        if (this.iframe_./*OK*/offsetHeight !== height) {
          this.attemptChangeHeight(height).catch(() => {});
        }
      });
    }
  }

  /** @override */
  unlayoutOnPause() {
    return true;
  }

  /** @override */
  unlayoutCallback() {
    if (this.iframe_) {
      removeElement(this.iframe_);
      this.iframe_ = null;
      this.iframePromise_ = null;
    }
    if (this.unlistenMessage_) {
      this.unlistenMessage_();
    }
    return true;  // Call layoutCallback again.
  }
};

AMP.registerElement('amp-graphiq', AmpGraphiq);
