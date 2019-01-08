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

import {PositionObserverFidelity}
  from '../../../src/service/position-observer/position-observer-worker';
import {RelativePositions} from '../../../src/layout-rect';
import {Services} from '../../../src/services';
import {debounce} from '../../../src/utils/rate-limit';
import {getServiceForDoc} from '../../../src/service';
import {installPositionObserverServiceForDoc}
  from '../../../src/service/position-observer/position-observer-impl';

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
    this.lastIntersectingSnippet_ = null;

    /** @private {!../../amp-access/0.1/amp-access-source.AccessSource} */
    this.accessSource_ = accessSource;

    /** @private {string} */
    this.connectHostname_ = connectHostname;

    /** @private {function(string)} */
    this.debouncedUpdateLastRead_ = debounce(
        ampdoc.win,
        this.updateLastRead.bind(this),
        1000
    );

    installPositionObserverServiceForDoc(ampdoc);
    const positionObserver = getServiceForDoc(ampdoc, 'position-observer');

    const paragraphs = ampdoc.getBody().getElementsByTagName('p');
    for (let i = 0; i < paragraphs.length; i++) {
      const p = paragraphs[i];
      positionObserver.observe(p, PositionObserverFidelity.LOW, position =>
        this.checkPosition(p, position)
      );
    }
  }

  /**
   * Checks position of a paragraph and decides whether to update server.
   * @param {Element} paragraph
   * @param {!../../../src/service/position-observer/position-observer-worker.PositionInViewportEntryDef} position PositionObserver entry
   */
  checkPosition(paragraph, position) {
    // Ignore if position does not intersect with the top of the viewport
    if (position.relativePos !== RelativePositions.TOP) {
      return;
    }

    // Update the snippet representing latest intersecting paragraph
    const prevSnippet = this.lastIntersectingSnippet_;
    this.lastIntersectingSnippet_ = paragraph./*OK*/innerText.substring(0, 50);
    if (prevSnippet && prevSnippet !== this.lastIntersectingSnippet_) {
      // Send update to server if the latest snippet has changed
      this.debouncedUpdateLastRead_(prevSnippet);
    }
  }

  /**
   * Sends latest read snippet to server.
   * @param {...*} arg
   */
  updateLastRead(...arg) {
    const snippet = arg[0];
    this.accessSource_.buildUrl((
      `${this.connectHostname_}/amp/updatedepth`
      + '?rid=READER_ID'
      + '&cid=CLIENT_ID(scroll1)'
      + '&c=CANONICAL_URL'
      + '&o=AMPDOC_URL'
      + '&rd=' + snippet
    ), false).then(url => {
      Services.xhrFor(this.ampdoc_.win)
          .fetch(url);
    });
  }
}
