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
import {getServiceForDoc} from '../../../src/service';
import {installViewportServiceForDoc}
  from '../../../src/service/viewport/viewport-impl';

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

    /** @private {string?} */
    this.lastReadSnippet_ = null;

    /** @private {!../../amp-access/0.1/amp-access-source.AccessSource} */
    this.accessSource_ = accessSource;

    /** @private {string} */
    this.connectHostname_ = connectHostname;

    /** @private {function(string?)} */
    this.debouncedUpdateLastRead_ = debounce(
        ampdoc.win,
        this.updateLastRead.bind(this),
        1000
    );

    this.findTopParagraph_ = this.findTopParagraph.bind(this);

    installViewportServiceForDoc(ampdoc);
    this.viewport_ = getServiceForDoc(ampdoc, 'viewport');
    this.viewport_.onChanged(this.findTopParagraph_);

    this.paragraphs_ = ampdoc.getBody().getElementsByTagName('p');
  }

  /**
   * Reviews positions of each paragraph relative to vieport, finds top.
   */
  findTopParagraph() {
    Promise.all([].slice.call(this.paragraphs_)
        .map(p => this.viewport_.getClientRectAsync(p)))
        .then(rects => {
          for (let i = rects.length - 1; i >= 0; i--) {
            if (rects[i].bottom <= 0) {
              this.recordLatestRead(this.paragraphs_[i]);
              break;
            }
          }
        });
  }

  /**
   * Checks whether latest read paragraph has changed and updates it if so.
   * @param {Element} paragraph
   */
  recordLatestRead(paragraph) {
    const prevSnippet = this.lastReadSnippet_;
    this.lastReadSnippet_ = paragraph./*OK*/innerText.substring(0, 50);
    if (prevSnippet !== this.lastReadSnippet_) {
      this.debouncedUpdateLastRead_(this.lastReadSnippet_);
    }
  }

  /**
   * Sends latest read snippet to server.
   * @param {...*} arg
   */
  updateLastRead(...arg) {
    const snippet = arg[0].toString();
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
