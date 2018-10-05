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

/*
 gulp lint --files extensions/amp-geolocation/0.1/amp-geolocation.js
 gulp check-types --files extensions/amp-geolocation/0.1/amp-geolocation.js
 gulp presubmit --files extensions/amp-geolocation/0.1/amp-geolocation.js
 */

import {Deferred} from '../../../src/utils/promise';
import {waitForBodyPromise} from '../../../src/dom';

/** @const */
const TAG = 'amp-geolocation';
const STATE_ID = 'ampGeolocation';
const SERVICE_TAG = 'geolocation';

export let GeolocationDef;
export class AmpGeolocation extends AMP.BaseElement {

  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {string} */
    this.latitude_ = '0';
    /** @private {string} */
    this.longitude_ = '0';

  }

  /**
  * @param {Object} currentPosition
  * @private
  */
  getCurrentPosition_(currentPosition) {
    this.latitude_ = currentPosition.coords.latitude;
    this.longitude_ = currentPosition.coords.longitude;

    const geo = this.addToBody_();

    geolocationDeferred.resolve(geo);

  }

  /** @override */
  buildCallback() {
    window.navigator.geolocation.getCurrentPosition(
        this.getCurrentPosition_.bind(this)
    );
  }

  /**
   * @private
   */
  addToBody_() {
    const doc = this.win.document;
    /** @type {Object} */
    const states = {};
    const self = this;

    return waitForBodyPromise(doc).then(() => {

      // Let the runtime know we're mutating the doc.body
      self.mutateElement(() => {
        const geolocationState = doc.getElementById(STATE_ID);
        if (geolocationState) {
          geolocationState.parentNode.removeChild(geolocationState);
        }
        states.latitude = this.latitude_;
        states.longitude = this.longitude_;
        const state = doc.createElement('amp-state');
        const confScript = doc.createElement('script');
        confScript.setAttribute('type', 'application/json');
        confScript.textContent =
            JSON.stringify(/** @type {!JsonObject} */(states)) ;
        state.appendChild(confScript);
        state.id = STATE_ID;
        doc.body.appendChild(state);
      }, doc.body);

      return {
        latitude: self.latitude_,
        longitude: self.longitude_,
      };

    });
  }

}

/**
 * Create the service promise at load time to prevent race between extensions
 */

/** singleton */
let geolocationDeferred = null;
AMP.extension(TAG, '0.1', AMP => {
  geolocationDeferred = new Deferred();
  AMP.registerElement(TAG, AmpGeolocation);
  AMP.registerServiceForDoc(SERVICE_TAG, () => geolocationDeferred.promise);
});
