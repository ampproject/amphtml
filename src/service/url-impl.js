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

import {LruCache} from '../utils/lru-cache';
import {
  installServiceInEmbedScope,
  registerServiceBuilderForDoc,
} from '../service';
import {parseUrlWithA} from '../url';

const SERVICE = 'url';

/**
 * @implements {../service.EmbeddableService}
 */
export class Url {
  /**
   * @param {!./ampdoc-impl.AmpDoc} ampdoc
   * @param {(!Document|!ShadowRoot)=} opt_rootNode
   */
  constructor(ampdoc, opt_rootNode) {
    /** @private @const {!./ampdoc-impl.AmpDoc} */
    this.ampdoc_ = ampdoc;

    const root = opt_rootNode || ampdoc.getRootNode();
    const doc = root.ownerDocument || root;

    /** @private @const {!HTMLAnchorElement} */
    this.anchor_ = /** @type {!HTMLAnchorElement} */(doc.createElement('a'));

    /** @private @const {!LruCache} */
    this.cache_ = new LruCache(100);
  }

  /** @override */
  adoptEmbedWindow(embedWin) {
    installServiceInEmbedScope(embedWin, SERVICE,
        new Url(this.ampdoc_, embedWin.document));
  }

  /**
   * Parses the URL in the context of the current document.
   *
   * @param {string} url
   * @param {boolean=} opt_nocache
   * @return {!Location}
   */
  parse(url, opt_nocache) {
    return parseUrlWithA(this.anchor_, url, opt_nocache ? null : this.cache_);
  }
}


/**
 * @param {!./ampdoc-impl.AmpDoc} ampdoc
 */
export function installUrlForDoc(ampdoc) {
  registerServiceBuilderForDoc(ampdoc, SERVICE, Url,
      /* opt_instantiate */ true);
}
