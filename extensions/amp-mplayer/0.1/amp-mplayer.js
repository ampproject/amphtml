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

//import {Layout} from '../../../src/layout';
import {Services} from '../../../src/services';
import {addParamsToUrl} from '../../../src/url';
import {createFrameFor} from '../../../src/iframe-video';
import {dict} from '../../../src/utils/object';
import {isLayoutSizeDefined} from '../../../src/layout';
import {removeElement} from '../../../src/dom';
import {user} from '../../../src/log';

/** @const */
const TAG = 'amp-mplayer';

/** @implements {../../../src/video-interface.VideoInterface} */
export class AmpMPlayer extends AMP.BaseElement {

  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    // Declare instance variables with type annotations.
    /** @private {Element} */
    this.iframe_ = null;

    /** @private {?string} */
    this.playerId_ = null;

    /** @private {?string} */
    this.contentId_ = '';

    /** @private {?string} */
    this.montiId_ = null;

    /** @private {?string} */
    this.scannedElement_ = '';

    /** @private {?string} */
    this.tags_ = '';

    /** @private {?string} */
    this.minimumDateFactor_ = '';

    /** @private {?string} */
    this.scannedElementType_ = '';
  }

  /**
   * @param {boolean=} onLayout
   * @override
   */
  preconnectCallback(onLayout) {

    // Host that serves player configuration and content redirects
    this.preconnect.url('https://www.oo-syringe.com', onLayout);
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
          ' Ensure it has the videojs-amp-support plugin.', this.playerId_);
      }, 3000));
  }

  /** @override */
  isLayoutSupported(layout) {
    //Define which layouts our element support

    //Size-defined layouts: fixed, fixed height, responsive and fill
    return isLayoutSizeDefined(layout);
    //return layout == Layout.RESPONSIVE;
  }

  /**
   * Build Iframe source
   * @return {string}
   * @private
   */
  iframeSource_() {
    const element = this;
    this.contentId_ = (element.getAttribute('data-content-id') || '');
    this.scannedElement_ = (element.getAttribute('data-scanned-element') || '');
    this.tags_ = (element.getAttribute('data-tags') || '');
    this.minimumDateFactor_ =
      (element.getAttribute('data-minimum-date-factor') || '');
    this.scannedElementType_ =
      (element.getAttribute('data-scanned-element-type') || '');

    const source = '/Users/ofirshlifer/Downloads/mplayer.html' +
      ((this.contentId_ !== '') ?
        '?content_id=' +
        `${encodeURIComponent(this.contentId_)}` :
        ('?scanned_element=' +
          `${encodeURIComponent(this.scannedElement_)}` +
          '&tags=' +
          `${encodeURIComponent(this.tags_)}` +
          '&minimum_date_factor=' +
          `${encodeURIComponent(this.minimumDateFactor_)}` +
          '&scanned_element_type=' +
          `${encodeURIComponent(this.scannedElementType_)}`));

    const moreQueryParams = dict({
      'player_id': (element.getAttribute('data-player-id') || undefined),
      'monti_id': (element.getAttribute('data-monti-id') || undefined),
    });

    return addParamsToUrl(source, moreQueryParams);
  }

  /** @override */
  layoutCallback() {
    // Actually load your resource or render more expensive resources.

    const iframe = createFrameFor(this, this.iframeSource_());
    this.iframe = iframe;
    return this.loadPromise(iframe);
  }

  /** @override */
  unlayoutCallback() {
    if (this.iframe_) {
      removeElement(this.iframe_);
      this.iframe_ = null;
    }
    return true; // Call layoutCallback again.
  }
}

AMP.extension(TAG, '0.1', AMP => {
  AMP.registerElement(TAG, AmpMPlayer);
});
