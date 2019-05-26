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

import {Layout} from '../../../src/layout';
import {addParamsToUrl} from '../../../src/url';
import {dict} from '../../../src/utils/object';
import {removeElement} from '../../../src/dom';
import {isLayoutSizeDefined} from '../../../src/layout';

/** @const */
const TAG = 'amp-mplayer';

export class AmpMPlayer extends AMP.BaseElement {

  /** @implements {../../../src/video-interface.VideoInterface} */
  constructor(element) {
    super(element);

    // Declare instance variables with type annotations.
    /** @private {Element} */
    this.iframe = null;

    /** @private {?string} */
    this.player_id = null;

    /** @private {?string} */
    this.content_id = '';

    /** @private {?string} */
    this.monti_id = null;

    /** @private {?string} */
    this.scanned_element = '';

    /** @private {?string} */
    this.tags = '';

    /** @private {?string} */
    this.minimum_date_factor = '';

    /** @private {?string} */
    this.scanned_element_type = '';
  }

  /**
   * @param {boolean=} onLayout
   * @override
   */
  preconnectCallback(onLayout) {

    // Host that serves player configuration and content redirects
    this.preconnect.url("https://www.oo-syringe.com", onLayout);
  }

  /** @override */
  buildCallback() {
    // Get attributes, assertions of values, assign instance variables.
    // Build lightweight DOM and append to this.element.

    // Warn if the player does not have video interface support
    this.readyTimeout_ = /** @type {number} */ (
      Services.timerFor(window).delay(() => {
        user().warn(TAG,
          'Did not receive ready callback from player %s.' +
          ' Ensure it has the videojs-amp-support plugin.', this.player_id);
      }, 3000));
  }

  /** @override */
  isLayoutSupported(layout) {
    //Define which layouts our element support

    //Size-defined layouts: fixed, fixed height, responsive and fill
    return isLayoutSizeDefined(layout);
    //return layout == Layout.RESPONSIVE;
  }

  iframeSource() {
    this.content_id = (element.getAttribute('data-content-id') || '');
    this.scanned_element = (element.getAttribute('data-scanned-element') || '');
    this.tags = (element.getAttribute('data-tags') || '');
    this.minimum_date_factor = (element.getAttribute('data-minimum_date_factor') || '');
    this.scanned_element_type = (element.getAttribute('data-scanned_element_type') || '');

    const source = '/Users/ofirshlifer/Downloads/mplayer.html' +
      ((this.content_id !== '') ?
        '?content_id=' +
        `${encodeURIComponent(this.content_id)}` :
        ('?scanned_element=' +
          `${encodeURIComponent(this.scanned_element)}` +
          '&tags=' +
          `${encodeURIComponent(this.tags)}` +
          '&minimum_date_factor=' +
          `${encodeURIComponent(this.minimum_date_factor)}` +
          '&scanned_element_type=' +
          `${encodeURIComponent(this.scanned_element_type)}`));

    const more_query_params = dict({
      'player_id': (element.getAttribute('data-player-id') || undefined),
      'monti_id': (element.getAttribute('data-monti-id') || undefined)
    });

    return addParamsToUrl(source, more_query_params);
  }

  /** @override */
  layoutCallback() {
    // Actually load your resource or render more expensive resources.

    const iframe = createFrameFor(this, this.iframeSource());
    this.iframe = iframe;
    return this.loadPromise(iframe);
  }

  /** @override */
  unlayoutCallback() {
    if (this.iframe) {
      removeElement(this.iframe);
      this.iframe = null;
    }
    return true; // Call layoutCallback again.
  }
}

AMP.extension(TAG, '0.1', AMP => {
  AMP.registerElement(TAG, AmpMPlayer);
});
