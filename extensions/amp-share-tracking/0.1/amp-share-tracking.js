/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
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

import {isExperimentOn} from '../../../src/experiments';
import {xhrFor} from '../../../src/xhr';
import {viewerFor} from '../../../src/viewer';
import {Layout} from '../../../src/layout';
import {dev, user} from '../../../src/log';

/** @private @const {string} */
const TAG = 'amp-share-tracking';


/**
 * @visibleForTesting
 */
export class AmpShareTrackingService {

  /**
   * @param {!AmpDoc} ampdoc
   */
  constructor(ampdoc) {
    /** @const {!Window} */
    this.win = ampdoc.getWin();
  }

  /**
    * @return {boolean}
    * @private
    */
  isExperimentOn_() {
    return isExperimentOn(this.win, TAG);
  }

  /** */
  start() {
    user().assert(this.isExperimentOn_(), `${TAG} experiment is disabled`);

    /** @private {!Promise<!Object>} */
    this.shareTrackingFragments_ = Promise.all([
      this.getIncomingFragment_(),
      this.getOutgoingFragment_()]).then(results => {
        dev().fine(TAG, 'incomingFragment: ', results[0]);
        dev().fine(TAG, 'outgoingFragment: ', results[1]);
        return {
          incomingFragment: results[0],
          outgoingFragment: results[1],
        };
      });
  }

  /**
   * Get the incoming share-tracking fragment from the viewer
   * @return {!Promise<string>}
   * @private
   */
  getIncomingFragment_() {
    return viewerFor(this.win).getFragment().then(fragment => {
      const match = fragment.match(/\.([^&]*)/);
      return match ? match[1] : '';
    });
  }

  /**
   * Get an outgoing share-tracking fragment
   * @return {!Promise<string>}
   * @private
   */
  getOutgoingFragment_() {
    return this.getOutgoingRandomFragment_();
  }

  /**
   * Get a random outgoing share-tracking fragment
   * @return {!Promise<string>}
   * @private
   */
  getOutgoingRandomFragment_() {
    // TODO(yuxichen): Generate random outgoing fragment
    const randomFragment = 'rAmDoM';
    return Promise.resolve(randomFragment);
  }
}

AMP.registerElement('amp-share-tracking', AMP.BaseElement);


AMP.reisterServiceForDoc('amp-share-tracking-service', undefined, ampdoc => {
  // Called when ampdoc is ready to accept services.

  const service = new AmpShareTrackingService(ampdoc);
  service.start();

  /*
  onDocumentReady(ampdoc.getRootNode(), () => {
    const existing = ampdoc.getRootNode().querySelector('amp-share-tracking');
    if (!existing) {
      service.start();
    } else {
      const href = existing.getAttribute('data-href');
      service.start(href);
    }
  });
  */

  return service;

  /* COMPLETELY WRONG RIGHT NOW
  onDocumentReady(ampdoc.getRootNode(), () => {
    const existing = ampdoc.getRootNode().querySelector('amp-share-tracking');   /// CORRECT
    if (!existing) {
      const def = ampdoc.getWin().document.createElement('amp-share-tracking');         // INCOMPLETE
      waitForBody(ampdoc.getWin().document, () => {         // INCORRECT PARTIALLY
        const parent = ampdoc.getRootNode().nodeType == /document/ 9 ?
            ampdoc.getRootNode().body :
            ampdoc.getRootNode();
        parent.insertChildBefore(def, parent.firstChildElement);
      });
    }
  });
  */
});
