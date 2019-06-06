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

import {Services} from '../../../src/services';
import {debounce} from '../../../src/utils/rate-limit';

export class ReadDepthTracker {
  /**
   * Sets up tracking of paragraphs in document.
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   * @param {!../../amp-access/0.1/amp-access-source.AccessSource} accessSource
   * @param {string} connectHostname
   */
  constructor(ampdoc, accessSource, connectHostname) {
    /** @private {!../../../src/service/ampdoc-impl.AmpDoc} */
    this.ampdoc_ = ampdoc;

    /** @private {number?} */
    this.lastReadIndex_ = null;

    /** @private {!../../amp-access/0.1/amp-access-source.AccessSource} */
    this.accessSource_ = accessSource;

    /** @private {string} */
    this.connectHostname_ = connectHostname;

    /** @private {function()} */
    const debouncedFindTopParagraph_ = debounce(
        ampdoc.win,
        this.findTopParagraph_.bind(this),
        1000
    );

    this.viewport_ = Services.viewportForDoc(ampdoc);

    this.paragraphs_ = [];

    ampdoc.whenReady().then(() => {
      this.viewport_.onChanged(debouncedFindTopParagraph_);
      this.paragraphs_ = ampdoc.getBody().getElementsByTagName('p');
    });
  }

  /**
   * Reviews positions of each paragraph relative to vieport, finds top.
   * @private
   */
  findTopParagraph_() {
    return Promise.all([].slice.call(this.paragraphs_)
        .map(p => this.viewport_.getClientRectAsync(p)))
        .then(rects => {
          let lastIdxAboveViewport = null;
          let lastPosition = null;
          for (let i = rects.length - 1; i >= 0; i--) {
            const bottomPosition = rects[i].bottom;
            if (bottomPosition <= 0 &&
              (lastPosition === null || lastPosition < bottomPosition)
            ) {
              lastIdxAboveViewport = i;
              lastPosition = bottomPosition;
            }
          }
          if (lastIdxAboveViewport !== null) {
            this.recordLatestRead_(lastIdxAboveViewport);
          }
        });
  }

  /**
   * If the latest read paragraph has changed, record it and update server.
   * @param {number} paragraphIdx
   * @private
   */
  recordLatestRead_(paragraphIdx) {
    if (this.lastReadIndex_ !== paragraphIdx) {
      this.lastReadIndex_ = paragraphIdx;
      this.updateLastRead_(
          this.paragraphs_[paragraphIdx]./*OK*/innerText.substring(0, 50)
      );
    }
  }

  /**
   * Sends latest read snippet to server.
   * @param {string} snippet
   * @private
   */
  updateLastRead_(snippet) {
    this.accessSource_.buildUrl((
      `${this.connectHostname_}/amp/updatedepth`
      + '?rid=READER_ID'
      + '&cid=CLIENT_ID(scroll1)'
      + '&c=CANONICAL_URL'
      + '&o=AMPDOC_URL'
      + '&rd=' + encodeURIComponent(snippet)
    ), false).then(url => {
      Services.xhrFor(this.ampdoc_.win)
          .fetch(url);
    });
  }
}
