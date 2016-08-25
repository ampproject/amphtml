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

import {addParamToUrl} from '../../../src/url';
import {fromClassForDoc} from '../../../src/service';
import {isExperimentOn} from '../../../src/experiments';
import {whenDocumentReady} from '../../../src/document-ready';
import {user} from '../../../src/log';
import {xhrFor} from '../../../src/xhr';


/** @const */
const TAG = 'amp-fresh';

/**
 * Manages registered amp-fresh components and does the xhr request
 * and update.
 */
export class AmpFreshManager {

  /**
   * @param {!./ampdoc-impl.AmpDoc} ampdoc
   */
  constructor(ampdoc) {

    /** @type {!./ampdoc-impl.AmpDoc} */
    this.ampdoc = ampdoc;

    if (!isExperimentOn(this.win, TAG)) {
      return;
    }

    /** @private @const {!Object<string, !./amp-fresh.AmpFresh>} */
    this.ampFreshInstances_ = Object.create(null);

    /** @private {?Document} */
    this.docPromise_ = null;

    this.fetchDocument_().then(doc => {
      this.update_(doc);
    });
  }

  /**
   * Registers an amp-fresh component instance to be managed by this windows
   * amp-fresh-manager instance.
   * @param {string} id
   * @param {!./amp-fresh.AmpFresh} ampFreshIntance
   */
  register(id, ampFreshInstance) {
    user().assert(!this.ampFreshInstances_[id],
        `duplicate amp-fresh id used: ${id}`);
    this.ampFreshInstances_[id] = ampFreshInstance;
  }

  /**
   * @return {!Promise<!Document>}
   */
  fetchDocument_() {
    if (this.docPromise_) {
      return this.docPromise_;
    }
    const url = addParamToUrl(this.ampdoc.win.location.href,
        'amp-fresh', '1');
    return this.docPromise_ = Promise.all([
      xhrFor(this.ampdoc.win).fetchDocument(url),
      this.ampdoc.whenReady(),
    ]).then(args => args[0])
    .catch(() => {
      this.onFetchDocumentFailure_();
    });
  }

  /**
   * @param {!Document} docFromServer
   */
  update_(docFromServer) {
    const elements = docFromServer.getElementsByTagName('amp-fresh');
    for (let i = 0; i < elements.length; i++) {
      const ampFreshFromServer = elements[i];
      const id = ampFreshFromServer.getAttribute('id');
      // the amp-fresh instance live in client DOM.
      const ampFresh = this.ampFreshInstances_[id];
      if (ampFresh) {
        ampFresh.update(ampFreshFromServer);
      }
    }
  }

  onFetchDocumentFailure_() {
    whenDocumentReady(this.win.document).then(() => {
      Object.keys(this.ampFreshInstances_).forEach(id => {
        this.ampFreshInstances_[id].show();
      });
    });
  }
}

/**
 * @param {!Node|!./service/ampdoc-impl.AmpDoc} nodeOrDoc
 */
export function getOrInsallAmpFreshManager(nodeOrDoc) {
  return /** @type {!AmpFreshManager} */ (
      fromClassForDoc(nodeOrDoc, 'ampFreshManager', AmpFreshManager));
}
