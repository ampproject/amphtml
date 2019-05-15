/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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
import {VariableSource} from '../../../src/service/variable-source';

export class AmpScriptVariableSource extends VariableSource {
  /**
   * @param  {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   * @param {!Array<string>} whitelist
   */
  constructor(ampdoc, whitelist) {
    super(ampdoc);

    /** @const @private {!Array<string>} */
    this.whitelist_ = whitelist;

    // Use parent URL replacements service for fallback.
    const headNode = ampdoc.getHeadNode();
    const urlReplacements = Services.urlReplacementsForDoc(headNode);

    /** @private {VariableSource} */
    this.defaultVariableSource_ = urlReplacements.getVariableSource();
  }

  /** @override */
  initialize() {
    // Support only whitelisted subset of URL variables.
    // TODO(choumx): DRY by moving to an inherited VariableSource function.
    for (let v = 0; v < this.whitelist_.length; v++) {
      const varName = this.whitelist_[v];
      const resolvers = this.defaultVariableSource_.get(varName);
      this.set(varName, resolvers.sync).setAsync(varName, resolvers.async);
    }
  }
}
