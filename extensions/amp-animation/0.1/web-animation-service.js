/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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
import {Builder} from './web-animations';
import {Services} from '../../../src/services';
import {WebAnimationBuilderOptionsDef} from './web-animation-types';
import {installWebAnimationsIfNecessary} from './install-polyfill';

export class WebAnimationService {
  /**
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   */
  constructor(ampdoc) {
    /** @private @const */
    this.ampdoc_ = ampdoc;

    /** @private @const */
    this.vsync_ = Services.vsyncFor(ampdoc.win);

    /** @private @const */
    this.owners_ = Services.ownersForDoc(ampdoc);
  }

  /**
   * @param {!WebAnimationBuilderOptionsDef} options
   * @return {!Promise<Builder>}
   */
  createBuilder(options) {
    return installWebAnimationsIfNecessary(this.ampdoc_).then(
      () =>
        new Builder(
          this.ampdoc_.win,
          this.ampdoc_.getRootNode(),
          this.ampdoc_.getUrl(),
          this.vsync_,
          this.owners_,
          options
        )
    );
  }
}
