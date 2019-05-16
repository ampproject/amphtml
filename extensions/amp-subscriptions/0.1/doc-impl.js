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

import {Doc} from '../../../third_party/subscriptions-project/config';
import {dev} from '../../../src/log';

/**
 * Adopts config document to ampdoc.
 * @implements {Doc}
 */
export class DocImpl {
  /**
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   */
  constructor(ampdoc) {
    /** @private @const {!../../../src/service/ampdoc-impl.AmpDoc} */
    this.ampdoc_ = ampdoc;
  }

  /** @override */
  getWin() {
    return this.ampdoc_.win;
  }

  /** @override */
  getRootNode() {
    return this.ampdoc_.getRootNode();
  }

  /** @override */
  getRootElement() {
    const root = this.ampdoc_.getRootNode();
    return dev().assertElement(root.documentElement || root.body || root);
  }

  /** @override */
  getHead() {
    return dev().assertElement(this.ampdoc_.getHeadNode());
  }

  /** @override */
  getBody() {
    return this.ampdoc_.isBodyAvailable() ? this.ampdoc_.getBody() : null;
  }

  /** @override */
  isReady() {
    return this.ampdoc_.isReady();
  }

  /** @override */
  whenReady() {
    return this.ampdoc_.whenReady();
  }
}

/** @package Visible for testing only. */
export function getDocClassForTesting() {
  return Doc;
}
