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
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   */
  constructor(ampdoc) {

    /** @const @type {!../../../src/service/ampdoc-impl.AmpDoc} */
    this.ampdoc = ampdoc;

    if (!isExperimentOn(this.ampdoc.win, TAG)) {
      return;
    }

    /** @private @const {!Object<string, !./amp-fresh.AmpFresh>} */
    this.ampFreshInstances_ = Object.create(null);

    /**
     * Used only for testing.
     * @private @const {!Promise}
     */
    this.docPromise_ = this.fetchDocument_().then(doc => {
      this.update_(doc);
    }).catch(() => {
      this.onFetchDocumentFailure_();
    });
  }

  /**
   * Registers an amp-fresh component instance to be managed by this windows
   * amp-fresh-manager instance.
   * @param {string} id
   * @param {!./amp-fresh.AmpFresh} ampFreshInstance
   */
  register(id, ampFreshInstance) {
    user().assert(!this.ampFreshInstances_[id],
        `duplicate amp-fresh id used: ${id}`);
    this.ampFreshInstances_[id] = ampFreshInstance;
  }

  /**
   * @return {!Promise<!Document>}
   * @private
   */
  fetchDocument_() {
    // NOTE(erwinm): confirm that we actually need a unique timestamp or if we
    // can just do `amp-fresh=1`
    const url = addParamToUrl(this.ampdoc.win.location.href,
        'amp-fresh', String(Date.now()));
    return Promise.all([
      xhrFor(this.ampdoc.win).fetchDocument(url),
      this.ampdoc.whenReady(),
    ]).then(args => args[0]);
  }

  /**
   * @param {!Document} docFromServer
   * @private
   */
  update_(docFromServer) {
    Object.keys(this.ampFreshInstances_).forEach(id => {
      const counterpart = docFromServer.getElementById(id);
      if (counterpart) {
        const ampFresh = this.ampFreshInstances_[id];
        ampFresh.update(user().assertElement(counterpart));
      }
    });
  }

  /**
   * Make sure to mark all amp-fresh instances to visible
   * even on failures.
   * @private
   */
  onFetchDocumentFailure_() {
    user().error('AMP-FRESH', 'Failed fetching fresh document through ' +
        'amp-fresh');
    return this.ampdoc.whenReady().then(() => {
      Object.keys(this.ampFreshInstances_).forEach(id => {
        this.ampFreshInstances_[id].setFreshReady();
      });
    });
  }
}

/**
 * @param {!Node|!../../../src/service/ampdoc-impl.AmpDoc} nodeOrDoc
 */
export function getOrInsallAmpFreshManager(nodeOrDoc) {
  return /** @type {!AmpFreshManager} */ (
      fromClassForDoc(nodeOrDoc, 'ampFreshManager', AmpFreshManager));
}
