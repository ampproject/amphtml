/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
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

import {installServiceInEmbedScope, registerServiceBuilder} from '../service';

/**
 * Purifier is an ampdoc-scoped service providing HTML Sanitization functions.
 * @implements {../../../src/service.EmbeddableService}
 */
class Purifier {
  constructor() {
    /** @type Object */
    this.domPurify = null;
  }

  /**
   * @param {!Window} embedWin
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   * @nocollapse
   */
  static installInEmbedWindow(embedWin, ampdoc) {
    installServiceInEmbedScope(
      embedWin,
      'bind',
      new Purifier(ampdoc, embedWin)
    );
  }
}
