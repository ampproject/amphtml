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

import {AmpAdNetworkBase} from './amp-ad-network-base';

/**
 * @abstract
 */
export class AmpAdCrossDomainBase extends AmpAdNetworkBase {

  constructor(element) {
    super(element);

    this.uiHandler = null;

    this.lifecycleReporter_ = this.initLifecycleReporter_();
  }

  /** @override */
  buildCallback() {
    this.uiHandler = new AMP.AmpAdUIHandler(this);
  }

  /**
   * Returns a lifecycle reporting object. The default method returns a stub
   * object that noops.
   * @return {!Object}
   */
  initLifecycleReporter_() {
    // Stub object. This method should be overriden by subclasses to return an
    // actual lifecycleReporter, if lifecycle reporting is desired.
    return {
      addPingsForVisibility: unusedElement => {},
    };
  }
}
