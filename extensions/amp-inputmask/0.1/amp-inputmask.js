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

import {AmpEvents} from '../../../src/amp-events';
import {TextMask} from './text-mask';
import {iterateCursor} from '../../../src/dom';
import {listen} from '../../../src/event-helper';

const SERVICE = 'inputmask';
const TAG = `amp-${SERVICE}`;

export class AmpInputmaskService {
  /**
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   */
  constructor(ampdoc) {
    this.ampdoc = ampdoc;

    /** @private {!Array<!TextMask>} */
    this.masks_ = [];

    /** @const */
    this.domUpdateUnlistener_ = listen(
      this.ampdoc.getRootNode(),
      AmpEvents.DOM_UPDATE,
      () => this.install()
    );
  }

  /**
   * Install the inputmask service and controllers.
   */
  install() {
    const maskElements = this.ampdoc.getRootNode().querySelectorAll('[mask]');
    iterateCursor(maskElements, element => {
      if (TextMask.isMasked(element)) {
        return;
      }
      const tm = new TextMask(element);
      this.masks_.push(tm);
    });
  }

  /**
   * Remove the inpumask service and controllers.
   */
  uninstall() {
    this.domUpdateUnlistener_();
    this.masks_.forEach(m => m.dispose());
    this.masks_ = [];
  }
}

AMP.extension(TAG, '0.1', function(AMP) {
  AMP.registerServiceForDoc(SERVICE, function(ampdoc) {
    return new AmpInputmaskService(ampdoc);
  });
});
