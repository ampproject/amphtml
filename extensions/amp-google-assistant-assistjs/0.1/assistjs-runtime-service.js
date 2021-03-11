/**
 * Copyright 2021 The AMP HTML Authors. All Rights Reserved.
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

/**
 * @fileoverview The shared service used by all custom elements to execute runtime tasks like
 * adding ports to the PortNetwork.
 */

import * as closure from '../../../third_party/closure-responding-channel/closure-bundle';

export class AssistjsRuntimeService {
  /** */
  constructor() {
    /** @private */
    this.portOperator_ = closure.createPortOperator();
  }

  /**
   * @param {string} portName
   * @param {closure.MessageChannel} portChannel
   */
  addPort(portName, portChannel) {
    this.portOperator_.addPort(portName, portChannel);
  }
}
